"use client";
import { useEffect, useState } from "react";

export default function TopBar({ title }: { title: string }) {
  const [time, setTime] = useState("");
  const [block, setBlock] = useState(12847392);

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("en-US", { hour12: false }));
    tick();
    const t = setInterval(tick, 1000);
    // Simulate block increments
    const b = setInterval(() => setBlock((p) => p + 1), 3800);
    return () => { clearInterval(t); clearInterval(b); };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 28,
        paddingBottom: 20,
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Left */}
      <div>
        <h1
          className="font-display"
          style={{ fontSize: 26, fontWeight: 800, color: "#F0F0F0", letterSpacing: "-0.03em", lineHeight: 1 }}
        >
          {title}
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 5 }}>
          <span style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em" }}>
            LAST_SYNC · {time}
          </span>
          <span style={{ width: 1, height: 10, background: "rgba(255,255,255,0.1)" }} />
          <span style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(255,255,255,0.2)", letterSpacing: "0.08em" }}>
            BLOCK #{block.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Right — live indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        {/* Gas-like mini stats */}
        <div style={{ display: "flex", gap: 20 }}>
          {[
            { label: "POOL_UTIL", val: "67%", color: "#00FFD1" },
            { label: "APR", val: "0.31%", color: "rgba(255,255,255,0.6)" },
            { label: "TVL", val: "54K", color: "rgba(255,255,255,0.6)" },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em" }}>
                {s.label}
              </div>
              <div style={{ fontFamily: "monospace", fontSize: 13, color: s.color, fontWeight: 600 }}>
                {s.val}
              </div>
            </div>
          ))}
        </div>

        {/* Live ripple */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ position: "relative", width: 10, height: 10 }}>
            <span
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background: "#00FFD1",
                animation: "live-ripple 1.5s ease infinite",
              }}
            />
            <span
              style={{
                position: "absolute",
                inset: 2,
                borderRadius: "50%",
                background: "#00FFD1",
              }}
            />
          </div>
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#00FFD1", fontWeight: 500 }}>
            LIVE
          </span>
        </div>
      </div>

      <style>{`
        @keyframes live-ripple {
          0%   { transform:scale(1); opacity:0.5; }
          70%  { transform:scale(2.2); opacity:0; }
          100% { transform:scale(1); opacity:0; }
        }
      `}</style>
    </div>
  );
}
