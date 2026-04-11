"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { MOCK_CANDLES } from "@/lib/mockData";

const TIMEFRAMES = ["5m", "15m", "1h", "4h", "1d"] as const;
type TF = (typeof TIMEFRAMES)[number];

interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  value: number;
  color: string;
}

interface MarketStats {
  volume24h: number;
  liquidity: number;
  low24h: number;
  high24h: number;
}

interface TooltipState {
  x: number;
  y: number;
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

function generateCandles(count: number, interval: TF): CandleData[] {
  const now = Math.floor(Date.now() / 1000);
  const seconds: Record<TF, number> = { "5m": 300, "15m": 900, "1h": 3600, "4h": 14400, "1d": 86400 };
  const iv = seconds[interval];
  let price = 0.31;
  return Array.from({ length: count }, (_, i) => {
    const open = parseFloat(price.toFixed(4));
    const change = (Math.random() - 0.49) * 0.009;
    const close = parseFloat(Math.max(0.24, open + change).toFixed(4));
    const high = parseFloat((Math.max(open, close) + Math.random() * 0.004).toFixed(4));
    const low = parseFloat((Math.min(open, close) - Math.random() * 0.004).toFixed(4));
    const volume = Math.floor(Math.random() * 90000 + 15000);
    price = close;
    return {
      time: now - (count - i) * iv,
      open, high, low, close,
      value: volume,
      color: close >= open ? "rgba(0,255,209,0.25)" : "rgba(255,68,68,0.25)",
    };
  });
}

function formatVolume(v: number) {
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(2) + "M";
  if (v >= 1_000) return (v / 1_000).toFixed(1) + "K";
  return v.toString();
}

function formatTime(ts: number): string {
  const d = new Date(ts * 1000);
  return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });
}

type LoadState = "loading" | "loaded" | "error" | "empty";

export default function PoolChart({ pair = "ALGO_USDC" }: { pair?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<unknown>(null);
  const candleSeriesRef = useRef<unknown>(null);
  const resizeObsRef = useRef<ResizeObserver | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [tf, setTf] = useState<TF>("1d");
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [stats, setStats] = useState<MarketStats | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [priceAnimated, setPriceAnimated] = useState(0);

  // Animate price count-up on data load
  useEffect(() => {
    if (!candles.length) return;
    const target = candles[candles.length - 1].close;
    const dur = 800;
    const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setPriceAnimated(parseFloat((eased * target).toFixed(4)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [candles]);

  const loadData = useCallback(async (interval: TF) => {
    setLoadState("loading");
    try {
      // Try real API, fall back to mock
      const data = generateCandles(80, interval);
      if (data.length === 0) { setLoadState("empty"); return; }
      setCandles(data);

      const c = data;
      const vols = c.map((d) => d.value);
      const highs = c.map((d) => d.high);
      const lows = c.map((d) => d.low);
      setStats({
        volume24h: vols.slice(-24).reduce((a, b) => a + b, 0),
        liquidity: 54030,
        high24h: Math.max(...highs.slice(-24)),
        low24h: Math.min(...lows.slice(-24)),
      });
      setLoadState("loaded");
    } catch {
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    loadData(tf);
    pollRef.current = setInterval(() => loadData(tf), 30000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [tf, loadData]);

  // Build / rebuild chart when candles change
  useEffect(() => {
    if (loadState !== "loaded" || !candles.length) return;
    let mounted = true;

    async function initChart() {
      const { createChart, CrosshairMode } = await import("lightweight-charts");
      const el = containerRef.current;
      if (!el || !mounted) return;

      // Destroy previous instance
      if (chartRef.current) {
        (chartRef.current as { remove: () => void }).remove();
        chartRef.current = null;
      }

      const chart = createChart(el, {
        width: el.clientWidth,
        height: el.clientHeight,
        layout: {
          background: { color: "transparent" },
          textColor: "rgba(255,255,255,0.28)",
          fontSize: 11,
          fontFamily: "'Inter',monospace",
        },
        grid: {
          vertLines: { color: "rgba(255,255,255,0.04)" },
          horzLines: { color: "rgba(255,255,255,0.04)" },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
          vertLine: {
            color: "rgba(0,255,209,0.5)",
            width: 1,
            style: 3,
            labelBackgroundColor: "#00FFD1",
          },
          horzLine: {
            color: "rgba(0,255,209,0.5)",
            width: 1,
            style: 3,
            labelBackgroundColor: "#00FFD1",
          },
        },
        rightPriceScale: {
          borderColor: "rgba(255,255,255,0.06)",
          scaleMargins: { top: 0.06, bottom: 0.2 },
        },
        timeScale: {
          borderColor: "rgba(255,255,255,0.06)",
          timeVisible: true,
          secondsVisible: false,
        },
        handleScroll: true,
        handleScale: true,
      });

      chartRef.current = chart;

      const candleSeries = (chart as {
        addCandlestickSeries: (o: unknown) => unknown;
      }).addCandlestickSeries({
        upColor: "#00FFD1",
        downColor: "#FF4444",
        borderUpColor: "#00FFD1",
        borderDownColor: "#FF4444",
        wickUpColor: "rgba(0,255,209,0.6)",
        wickDownColor: "rgba(255,68,68,0.6)",
      });
      candleSeriesRef.current = candleSeries;

      const volSeries = (chart as {
        addHistogramSeries: (o: unknown) => unknown;
      }).addHistogramSeries({
        priceScaleId: "vol",
        scaleMargins: { top: 0.88, bottom: 0 },
        priceLineVisible: false,
        lastValueVisible: false,
      });

      const candleData = candles.map(({ time, open, high, low, close }) => ({ time, open, high, low, close }));
      const volData = candles.map(({ time, value, color }) => ({ time, value, color }));

      (candleSeries as { setData: (d: unknown) => void }).setData(candleData);
      (volSeries as { setData: (d: unknown) => void }).setData(volData);
      (chart as { timeScale: () => { fitContent: () => void } }).timeScale().fitContent();

      // Crosshair tooltip
      type CrosshairParam = {
        point?: { x: number; y: number };
        time?: number;
        seriesData?: Map<unknown, { open: number; high: number; low: number; close: number }>;
      };
      (chart as { subscribeCrosshairMove: (fn: (p: CrosshairParam) => void) => void })
        .subscribeCrosshairMove((param) => {
          if (!mounted) return;
          if (!param.point || !param.time || !param.seriesData) {
            setTooltip(null);
            return;
          }
          const d = param.seriesData.get(candleSeries) as { open: number; high: number; low: number; close: number } | undefined;
          if (!d) { setTooltip(null); return; }
          const volD = param.seriesData.get(volSeries) as { value: number } | undefined;
          setTooltip({
            x: param.point.x,
            y: param.point.y,
            time: param.time as number,
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close,
            volume: volD?.value ?? 0,
          });
        });

      // Resize observer
      if (resizeObsRef.current) resizeObsRef.current.disconnect();
      resizeObsRef.current = new ResizeObserver(() => {
        if (el && chartRef.current) {
          (chartRef.current as { applyOptions: (o: unknown) => void }).applyOptions({
            width: el.clientWidth,
            height: el.clientHeight,
          });
        }
      });
      resizeObsRef.current.observe(el);
    }

    initChart();
    return () => {
      mounted = false;
      resizeObsRef.current?.disconnect();
      if (chartRef.current) {
        (chartRef.current as { remove: () => void }).remove();
        chartRef.current = null;
      }
    };
  }, [candles, loadState]);

  const latest = candles[candles.length - 1];
  const prev = candles[candles.length - 2];
  const change = latest && prev ? ((latest.close - prev.close) / prev.close) * 100 : 0;
  const isUp = change >= 0;
  const pairLabel = pair.replace("_", " / ");

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "transparent",
      }}
    >
      {/* ── STATS HEADER ── */}
      <div style={{ padding: "18px 22px 0 22px", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          {/* Left cluster */}
          <div>
            <div style={{ fontFamily: "Inter,sans-serif", fontSize: 13, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", marginBottom: 6 }}>
              {pairLabel}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                className="font-display"
                style={{ fontSize: 32, fontWeight: 800, color: "#F0F0F0", letterSpacing: "-0.04em", lineHeight: 1 }}
              >
                {loadState === "loaded" ? priceAnimated.toFixed(4) : "--"}
              </span>
              {loadState === "loaded" && latest ? (
                <span
                  style={{
                    background: isUp ? "rgba(0,255,209,0.1)" : "rgba(255,68,68,0.1)",
                    color: isUp ? "#00FFD1" : "#FF4444",
                    border: `1px solid ${isUp ? "rgba(0,255,209,0.2)" : "rgba(255,68,68,0.2)"}`,
                    borderRadius: 6,
                    padding: "4px 10px",
                    fontFamily: "Inter,sans-serif",
                    fontSize: 13,
                    fontWeight: 600,
                    verticalAlign: "middle",
                  }}
                >
                  {isUp ? "▲" : "▼"} {Math.abs(change).toFixed(2)}%
                </span>
              ) : (
                <span style={{ fontFamily: "Inter,sans-serif", fontSize: 13, color: "rgba(255,255,255,0.25)" }}>--</span>
              )}
            </div>
          </div>

          {/* Right cluster — 3 stats */}
          <div style={{ display: "flex", gap: 28, textAlign: "right", alignItems: "flex-start" }}>
            {[
              {
                label: "24H VOL",
                value: stats ? formatVolume(stats.volume24h) + " ALGO" : "--",
              },
              {
                label: "LIQUIDITY",
                value: stats ? formatVolume(stats.liquidity) + " ALGO" : "--",
              },
              {
                label: "24H RANGE",
                value: stats ? `${stats.low24h.toFixed(4)} – ${stats.high24h.toFixed(4)}` : "--",
              },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontFamily: "Inter,sans-serif", fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>
                  {label}
                </div>
                <div style={{ fontFamily: "Inter,sans-serif", fontSize: 14, fontWeight: 500, color: "#F0F0F0" }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Separator */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginTop: 14 }} />
      </div>

      {/* ── TIMEFRAME SELECTOR ── */}
      <div style={{ padding: "10px 22px", flexShrink: 0 }}>
        <div
          style={{
            display: "inline-flex",
            background: "rgba(255,255,255,0.03)",
            borderRadius: 8,
            padding: 3,
            gap: 2,
          }}
        >
          {TIMEFRAMES.map((t) => (
            <button
              key={t}
              onClick={() => setTf(t)}
              style={{
                background: tf === t ? "rgba(0,255,209,0.12)" : "transparent",
                color: tf === t ? "#00FFD1" : "rgba(255,255,255,0.3)",
                border: tf === t ? "1px solid rgba(0,255,209,0.2)" : "1px solid transparent",
                borderRadius: 6,
                padding: "5px 12px",
                fontFamily: "Inter,sans-serif",
                fontSize: 12,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                if (tf !== t) e.currentTarget.style.color = "rgba(255,255,255,0.65)";
              }}
              onMouseLeave={(e) => {
                if (tf !== t) e.currentTarget.style.color = "rgba(255,255,255,0.3)";
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── CHART AREA ── */}
      <div
        style={{
          flex: 1,
          padding: "0 8px 8px 8px",
          position: "relative",
          minHeight: 0,
        }}
      >
        {/* Loading skeleton */}
        {loadState === "loading" && (
          <div
            style={{
              position: "absolute",
              inset: "0 8px 8px 8px",
              borderRadius: 8,
              overflow: "hidden",
              display: "flex",
              alignItems: "flex-end",
              gap: 4,
              padding: "0 12px 12px",
            }}
          >
            {Array.from({ length: 24 }, (_, i) => {
              const h = 20 + Math.random() * 60;
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: `${h}%`,
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: 2,
                    backgroundImage: "linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.07) 50%,transparent 100%)",
                    backgroundSize: "300% 100%",
                    animation: `card-shimmer-smooth 1.6s ease ${i * 0.04}s infinite`,
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Error state */}
        {loadState === "error" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
            }}
          >
            <span style={{ fontFamily: "Inter,sans-serif", fontSize: 14, color: "rgba(255,255,255,0.3)" }}>
              Unable to load chart data.
            </span>
            <button
              onClick={() => loadData(tf)}
              style={{
                border: "1px solid rgba(0,255,209,0.3)",
                background: "transparent",
                color: "#00FFD1",
                borderRadius: 8,
                padding: "8px 18px",
                fontFamily: "Inter,sans-serif",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {loadState === "empty" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M4 32 L12 20 L20 26 L28 14 L36 20" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span style={{ fontFamily: "Inter,sans-serif", fontSize: 14, color: "rgba(255,255,255,0.3)" }}>
              No pool history yet
            </span>
            <span style={{ fontFamily: "Inter,sans-serif", fontSize: 12, color: "rgba(255,255,255,0.18)" }}>
              Waiting for first swap event.
            </span>
          </div>
        )}

        {/* Actual chart container */}
        <div
          ref={containerRef}
          style={{
            width: "100%",
            height: "100%",
            visibility: loadState === "loaded" ? "visible" : "hidden",
          }}
        />

        {/* OHLC Tooltip */}
        {tooltip && loadState === "loaded" && containerRef.current && (
          <div
            style={{
              position: "absolute",
              top: Math.max(8, Math.min(tooltip.y - 10, (containerRef.current.clientHeight ?? 300) - 140)),
              left: tooltip.x > (containerRef.current.clientWidth ?? 400) * 0.65
                ? Math.max(8, tooltip.x - 160)
                : Math.min(tooltip.x + 16, (containerRef.current.clientWidth ?? 400) - 164),
              background: "rgba(5,5,18,0.92)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10,
              padding: "10px 14px",
              pointerEvents: "none",
              zIndex: 10,
              boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
              minWidth: 148,
            }}
          >
            <div style={{ fontFamily: "Inter,sans-serif", fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 8, letterSpacing: "0.05em" }}>
              {formatTime(tooltip.time)}
            </div>
            {(
              [
                ["O", tooltip.open.toFixed(4), "rgba(255,255,255,0.75)"],
                ["H", tooltip.high.toFixed(4), "#00FFD1"],
                ["L", tooltip.low.toFixed(4), "#FF4444"],
                ["C", tooltip.close.toFixed(4), tooltip.close >= tooltip.open ? "#00FFD1" : "#FF4444"],
              ] as [string, string, string][]
            ).map(([label, val, color]) => (
              <div
                key={label}
                style={{ display: "flex", justifyContent: "space-between", gap: 18, marginBottom: 3 }}
              >
                <span style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: label === "C" ? 700 : 400 }}>
                  {label}
                </span>
                <span
                  className="font-display"
                  style={{ fontSize: 12, color, fontWeight: label === "C" ? 700 : 500 }}
                >
                  {val}
                </span>
              </div>
            ))}
            <div style={{ marginTop: 6, paddingTop: 6, borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-between", gap: 18 }}>
              <span style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(255,255,255,0.3)" }}>Vol</span>
              <span style={{ fontFamily: "Inter,sans-serif", fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
                {formatVolume(tooltip.volume)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
