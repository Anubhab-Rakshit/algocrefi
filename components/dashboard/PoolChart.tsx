"use client";
import { useEffect, useRef, useState } from "react";
import { MOCK_CANDLES } from "@/lib/mockData";

const TIMEFRAMES = ["5m", "15m", "1h", "4h", "1d"];

export default function PoolChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<unknown>(null);
  const candleSeriesRef = useRef<unknown>(null);
  const [tf, setTf] = useState("1h");
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: (typeof MOCK_CANDLES)[0] } | null>(null);

  // Latest candle for price display
  const latest = MOCK_CANDLES[MOCK_CANDLES.length - 1];
  const prev = MOCK_CANDLES[MOCK_CANDLES.length - 2];
  const change = ((latest.close - prev.close) / prev.close) * 100;
  const isUp = change >= 0;

  useEffect(() => {
    let chart: unknown;
    let resizeObs: ResizeObserver;

    async function init() {
      const { createChart, CrosshairMode } = await import("lightweight-charts");
      const el = containerRef.current;
      if (!el) return;

      chart = createChart(el, {
        width: el.clientWidth,
        height: 340,
        layout: {
          background: { color: "transparent" },
          textColor: "rgba(255,255,255,0.3)",
          fontSize: 11,
          fontFamily: "monospace",
        },
        grid: {
          vertLines: { color: "rgba(255,255,255,0.03)" },
          horzLines: { color: "rgba(255,255,255,0.03)" },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
          vertLine: { color: "rgba(0,255,209,0.4)", width: 1, style: 3, labelBackgroundColor: "#00FFD1" },
          horzLine: { color: "rgba(0,255,209,0.4)", width: 1, style: 3, labelBackgroundColor: "#00FFD1" },
        },
        rightPriceScale: { borderColor: "rgba(255,255,255,0.05)" },
        timeScale: { borderColor: "rgba(255,255,255,0.05)", timeVisible: true, secondsVisible: false },
      });

      chartRef.current = chart;

      const candleSeries = (chart as { addCandlestickSeries: (opts: unknown) => unknown }).addCandlestickSeries({
        upColor: "#00FFD1",
        downColor: "#FF4444",
        borderUpColor: "#00FFD1",
        borderDownColor: "#FF4444",
        wickUpColor: "rgba(0,255,209,0.5)",
        wickDownColor: "rgba(255,68,68,0.5)",
      });
      candleSeriesRef.current = candleSeries;

      const volSeries = (chart as { addHistogramSeries: (opts: unknown) => unknown }).addHistogramSeries({
        priceScaleId: "vol",
        scaleMargins: { top: 0.82, bottom: 0 },
      });

      const candles = MOCK_CANDLES.map(({ time, open, high, low, close }) => ({ time, open, high, low, close }));
      const volumes = MOCK_CANDLES.map(({ time, value, color }) => ({ time, value, color }));

      (candleSeries as { setData: (d: unknown) => void }).setData(candles);
      (volSeries as { setData: (d: unknown) => void }).setData(volumes);
      (chart as { timeScale: () => { fitContent: () => void } }).timeScale().fitContent();

      // Crosshair tooltip
      (chart as { subscribeCrosshairMove: (fn: (param: unknown) => void) => void }).subscribeCrosshairMove((param: unknown) => {
        const p = param as { point?: { x: number; y: number }; seriesData?: Map<unknown, { open: number; high: number; low: number; close: number }> };
        if (!p.point || !p.seriesData) { setTooltip(null); return; }
        const d = p.seriesData.get(candleSeries) as (typeof MOCK_CANDLES)[0] | undefined;
        if (!d) { setTooltip(null); return; }
        setTooltip({ x: p.point.x, y: p.point.y, data: d });
      });

      resizeObs = new ResizeObserver(() => {
        if (el) (chart as { applyOptions: (opts: unknown) => void }).applyOptions({ width: el.clientWidth });
      });
      resizeObs.observe(el);
    }

    init();

    return () => {
      resizeObs?.disconnect();
      if (chartRef.current) (chartRef.current as { remove: () => void }).remove();
    };
  }, []);

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16,
        overflow: "hidden",
        marginTop: 14,
      }}
    >
      {/* Top bar */}
      <div style={{ padding: "20px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span className="font-display" style={{ fontSize: 15, fontWeight: 600, color: "#F0F0F0" }}>
            ALGO / USDC
          </span>
          <span style={{ width: 1, height: 16, background: "rgba(255,255,255,0.1)" }} />
          <span className="font-display" style={{ fontSize: 22, fontWeight: 700, color: "#F0F0F0", letterSpacing: "-0.02em" }}>
            {latest.close.toFixed(4)}
          </span>
          <span
            style={{
              background: isUp ? "rgba(0,255,209,0.08)" : "rgba(255,68,68,0.08)",
              color: isUp ? "#00FFD1" : "#FF4444",
              border: `1px solid ${isUp ? "rgba(0,255,209,0.2)" : "rgba(255,68,68,0.2)"}`,
              borderRadius: 6,
              padding: "3px 10px",
              fontFamily: "Inter,sans-serif",
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            {isUp ? "▲" : "▼"} {Math.abs(change).toFixed(2)}%
          </span>
        </div>

        {/* Timeframe pills */}
        <div
          style={{
            display: "flex",
            background: "rgba(255,255,255,0.04)",
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
                background: tf === t ? "rgba(0,255,209,0.1)" : "transparent",
                color: tf === t ? "#00FFD1" : "rgba(255,255,255,0.3)",
                border: tf === t ? "1px solid rgba(0,255,209,0.2)" : "1px solid transparent",
                borderRadius: 6,
                padding: "4px 12px",
                fontFamily: "Inter,sans-serif",
                fontSize: 12,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "16px 0 0" }} />

      {/* Chart */}
      <div style={{ position: "relative" }}>
        <div ref={containerRef} style={{ width: "100%", height: 340 }} />

        {/* Custom tooltip */}
        {tooltip && (
          <div
            style={{
              position: "absolute",
              top: Math.min(tooltip.y + 10, 260),
              left: Math.min(tooltip.x + 16, (containerRef.current?.clientWidth ?? 400) - 180),
              background: "rgba(8,8,18,0.95)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10,
              padding: "10px 14px",
              pointerEvents: "none",
              zIndex: 10,
            }}
          >
            {[
              ["O", tooltip.data.open?.toFixed(4), tooltip.data.close >= tooltip.data.open ? "#00FFD1" : "#FF4444"],
              ["H", tooltip.data.high?.toFixed(4), "#F0F0F0"],
              ["L", tooltip.data.low?.toFixed(4), "#F0F0F0"],
              ["C", tooltip.data.close?.toFixed(4), tooltip.data.close >= tooltip.data.open ? "#00FFD1" : "#FF4444"],
            ].map(([label, val, color]) => (
              <div key={label} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 2 }}>
                <span style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(255,255,255,0.3)", width: 10 }}>{label}</span>
                <span style={{ fontFamily: "monospace", fontSize: 12, color: color as string }}>{val}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
