"use client";
import { useEffect, useRef, useState } from "react";
import type { PoolInfo, UserInfo, LoanStatus } from "@/lib/mockData";

function easeOut(t: number) { return 1 - Math.pow(1 - t, 3); }

function useCounter(target: number, duration = 1500) {
  const [val, setVal] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      setVal(Math.floor(easeOut(p) * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return val;
}

interface Props {
  pool: PoolInfo;
  user: UserInfo;
  loan: LoanStatus;
}

function Card({
  children,
  overdue,
  delay,
}: {
  children: React.ReactNode;
  overdue?: boolean;
  delay: number;
}) {
  const [mounted, setMounted] = useState(false);
  const [hov, setHov] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), delay); return () => clearTimeout(t); }, [delay]);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "rgba(255,255,255,0.025)",
        border: `1px solid ${overdue ? "rgba(255,68,68,0.35)" : hov ? "rgba(0,255,209,0.2)" : "rgba(255,255,255,0.07)"}`,
        borderRadius: 16,
        padding: "20px 22px",
        position: "relative",
        overflow: "hidden",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(14px)",
        transition: `opacity 0.5s ease, transform 0.5s ease, border-color 0.25s ease, box-shadow 0.25s ease${overdue ? ", border-color 2s ease infinite alternate" : ""}`,
        boxShadow: hov ? "0 8px 30px rgba(0,0,0,0.3)" : "none",
        cursor: "default",
      }}
    >
      {/* Shimmer sweep on hover */}
      {hov && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(105deg,transparent 40%,rgba(0,255,209,0.04) 50%,transparent 60%)",
            backgroundSize: "200% 100%",
            animation: "card-shimmer 0.7s ease forwards",
            pointerEvents: "none",
            borderRadius: 16,
          }}
        />
      )}
      {children}
    </div>
  );
}

function MiniSparkline({ color = "#00FFD1" }: { color?: string }) {
  const pts = [0, 15, 8, 22, 18, 30, 25, 35].map((y, i) => `${i * 11},${35 - y}`).join(" ");
  return (
    <svg width="80" height="36" viewBox="0 0 80 36" style={{ marginTop: 8 }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" opacity="0.7" />
    </svg>
  );
}

function AuraArc({ pts, max = 100 }: { pts: number; max?: number }) {
  const r = 18, cx = 22, cy = 22;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(pts, max) / max);
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" style={{ transform: "rotate(-90deg)" }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,183,71,0.1)" strokeWidth="4" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#FFB347" strokeWidth="4"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
    </svg>
  );
}

export default function StatCards({ pool, user, loan }: Props) {
  const poolAlgo = pool.balance / 1_000_000;
  const poolCount = useCounter(Math.floor(poolAlgo), 1500);
  const sharesCount = useCounter(user.shares, 1500);
  const auraCount = useCounter(user.auraPoints, 1200);
  const unsecuredEligible = user.auraPoints >= 30;

  const [barW, setBarW] = useState(0);
  const [auraBarW, setAuraBarW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      setBarW(pool.utilizationPct);
      setAuraBarW(Math.min((user.auraPoints / 30) * 100, 100));
    }, 600);
    return () => clearTimeout(t);
  }, [pool.utilizationPct, user.auraPoints]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>

      {/* Card 1 — Pool Balance */}
      <Card delay={0}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <span style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em" }}>
            POOL_BALANCE
          </span>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ opacity: 0.2 }}>
            <polygon points="9,1 16,5 16,13 9,17 2,13 2,5" stroke="#00FFD1" strokeWidth="1.3" />
          </svg>
        </div>
        <div className="font-display" style={{ fontSize: 28, fontWeight: 700, color: "#F0F0F0", marginTop: 10, letterSpacing: "-0.03em", lineHeight: 1 }}>
          {poolCount.toLocaleString()}
          <span style={{ fontSize: 13, fontWeight: 400, color: "rgba(255,255,255,0.4)", marginLeft: 4 }}>ALGO</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}>
          <span style={{ color: "#00FFD1", fontSize: 11 }}>↑</span>
          <span style={{ fontFamily: "Inter,sans-serif", fontSize: 12, color: "#00FFD1" }}>+12.3 ALGO today</span>
        </div>
        {/* Utilization bar */}
        <div style={{ marginTop: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em" }}>UTILIZATION</span>
            <span style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(0,255,209,0.6)" }}>{pool.utilizationPct}%</span>
          </div>
          <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 9999, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${barW}%`, background: "linear-gradient(90deg,#00FFD1,#7B2FFF)", borderRadius: 9999, transition: "width 1.2s ease" }} />
          </div>
        </div>
      </Card>

      {/* Card 2 — Your Shares */}
      <Card delay={80}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <span style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em" }}>
            YOUR_SHARES
          </span>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ opacity: 0.2 }}>
            <rect x="2" y="11" width="3" height="6" rx="1" stroke="#7B2FFF" strokeWidth="1.3" />
            <rect x="7" y="7" width="3" height="10" rx="1" stroke="#7B2FFF" strokeWidth="1.3" />
            <rect x="12" y="3" width="3" height="14" rx="1" stroke="#7B2FFF" strokeWidth="1.3" />
          </svg>
        </div>
        <div className="font-display" style={{ fontSize: 28, fontWeight: 700, color: "#F0F0F0", marginTop: 10, letterSpacing: "-0.03em", lineHeight: 1 }}>
          {sharesCount.toLocaleString()}
          <span style={{ fontSize: 13, fontWeight: 400, color: "rgba(255,255,255,0.4)", marginLeft: 4 }}>shares</span>
        </div>
        <div style={{ fontFamily: "Inter,sans-serif", fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 6 }}>
          ≈ {(user.shares * pool.sharePrice).toFixed(2)} ALGO value
        </div>
        <MiniSparkline color="#7B2FFF" />
      </Card>

      {/* Card 3 — AURA Score */}
      <Card delay={160}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <span style={{ fontFamily: "monospace", fontSize: 9, color: "#FFB347", letterSpacing: "0.12em", opacity: 0.7 }}>
            AURA_SCORE
          </span>
          <AuraArc pts={user.auraPoints} />
        </div>
        <div className="font-display" style={{ fontSize: 28, fontWeight: 700, color: "#FFB347", marginTop: 6, letterSpacing: "-0.03em", lineHeight: 1 }}>
          {auraCount}
          <span style={{ fontSize: 13, fontWeight: 400, color: "rgba(255,183,71,0.5)", marginLeft: 4 }}>pts</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}>
          {unsecuredEligible ? (
            <>
              <span style={{ color: "#00FFD1" }}>✓</span>
              <span style={{ fontFamily: "Inter,sans-serif", fontSize: 12, color: "#00FFD1" }}>Unsecured eligible</span>
            </>
          ) : (
            <span style={{ fontFamily: "Inter,sans-serif", fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
              Need {30 - user.auraPoints} more pts
            </span>
          )}
        </div>
        <div style={{ marginTop: 12, height: 3, background: "rgba(255,183,71,0.1)", borderRadius: 9999, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${auraBarW}%`, background: "#FFB347", borderRadius: 9999, transition: "width 1.2s ease" }} />
        </div>
      </Card>

      {/* Card 4 — Active Loan */}
      <Card delay={240} overdue={loan.isOverdue}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <span style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em" }}>
            ACTIVE_LOAN
          </span>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"
            style={{ opacity: 0.25 }}>
            <circle cx="9" cy="9" r="7" stroke={loan.isOverdue ? "#FF4444" : loan.activeLoan > 0 ? "#FFB347" : "rgba(255,255,255,0.4)"} strokeWidth="1.3" />
            <path d="M9 5v4.5l2.5 2.5" stroke={loan.isOverdue ? "#FF4444" : loan.activeLoan > 0 ? "#FFB347" : "rgba(255,255,255,0.4)"} strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </div>
        {loan.activeLoan > 0 ? (
          <>
            <div className="font-display" style={{ fontSize: 28, fontWeight: 700, color: "#F0F0F0", marginTop: 10, letterSpacing: "-0.03em", lineHeight: 1 }}>
              {loan.activeLoan}
              <span style={{ fontSize: 13, fontWeight: 400, color: "rgba(255,255,255,0.4)", marginLeft: 4 }}>ALGO</span>
            </div>
            <div style={{ fontFamily: "Inter,sans-serif", fontSize: 12, color: loan.isOverdue ? "#FF4444" : "#FFB347", marginTop: 6 }}>
              {loan.isOverdue ? "OVERDUE · " : "Due "}{loan.dueDate}
            </div>
          </>
        ) : (
          <>
            <div className="font-display" style={{ fontSize: 24, fontWeight: 700, color: "rgba(255,255,255,0.2)", marginTop: 10, letterSpacing: "-0.03em" }}>
              None
            </div>
            <div style={{ fontFamily: "Inter,sans-serif", fontSize: 12, color: "rgba(255,255,255,0.2)", marginTop: 6 }}>
              No active loans
            </div>
            <div style={{ marginTop: 14, padding: "8px 10px", background: "rgba(0,255,209,0.03)", border: "1px solid rgba(0,255,209,0.08)", borderRadius: 8 }}>
              <span style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(0,255,209,0.35)", letterSpacing: "0.08em" }}>
                COLLATERAL OR AURA REQUIRED
              </span>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
