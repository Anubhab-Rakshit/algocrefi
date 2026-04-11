"use client";
import { useEffect, useState } from "react";
import type { UserInfo, LoanStatus } from "@/lib/mockData";
import { useToast } from "./toastContext";

interface Props { user: UserInfo; loan: LoanStatus; }

export default function CreditStatus({ user, loan }: Props) {
  const [arcOffset, setArcOffset] = useState<number>(0);
  const [showTooltip, setShowTooltip] = useState(false);
  const { addToast } = useToast();

  const r = 54, cx = 65, cy = 65;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(user.auraPoints / 30, 1);
  const targetOffset = circ * (1 - pct);
  const unsecuredEligible = user.auraPoints >= 30;

  useEffect(() => {
    const t = setTimeout(() => setArcOffset(targetOffset), 300);
    return () => clearTimeout(t);
  }, [targetOffset]);

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16,
        padding: "24px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h2 className="font-display" style={{ fontSize: 17, fontWeight: 700, color: "#F0F0F0", letterSpacing: "-0.02em", marginBottom: 20 }}>
        Credit Status
      </h2>

      {/* AURA arc ring */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20 }}>
        <div style={{ position: "relative", width: 130, height: 130 }}>
          <svg width="130" height="130" viewBox="0 0 130 130" style={{ transform: "rotate(-90deg)" }}>
            {/* Track */}
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,183,71,0.08)" strokeWidth="8" />
            {/* Progress */}
            <circle
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke="#FFB347"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={arcOffset}
              style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
            />
          </svg>
          {/* Center text */}
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em" }}>AURA</span>
            <span className="font-display" style={{ fontSize: 28, fontWeight: 700, color: "#FFB347", lineHeight: 1, letterSpacing: "-0.03em" }}>
              {user.auraPoints}
            </span>
            <span style={{ fontFamily: "Inter,sans-serif", fontSize: 10, color: "rgba(255,255,255,0.25)" }}>/ 30 min</span>
          </div>
        </div>

        {/* Eligibility chip */}
        <div
          style={{
            marginTop: 12,
            background: unsecuredEligible ? "rgba(0,255,209,0.07)" : "rgba(255,183,71,0.07)",
            border: `1px solid ${unsecuredEligible ? "rgba(0,255,209,0.2)" : "rgba(255,183,71,0.2)"}`,
            borderRadius: 9999,
            padding: "5px 14px",
            fontFamily: "Inter,sans-serif",
            fontSize: 12,
            color: unsecuredEligible ? "#00FFD1" : "#FFB347",
          }}
        >
          {unsecuredEligible ? "✓ Eligible for unsecured loans" : `Earn ${30 - user.auraPoints} more pts`}
        </div>

        {/* Score breakdown */}
        <div style={{ width: "100%", marginTop: 16, display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            { label: "EARNED", val: `${user.auraPoints} pts`, color: "#FFB347" },
            { label: "PENALTY", val: `${user.auraPenalty} pts`, color: user.auraPenalty > 0 ? "#FF4444" : "rgba(255,255,255,0.3)" },
          ].map((row) => (
            <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 10px", background: "rgba(255,255,255,0.02)", borderRadius: 8 }}>
              <span style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em" }}>{row.label}</span>
              <span style={{ fontFamily: "monospace", fontSize: 12, color: row.color, fontWeight: 600 }}>{row.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Loan buttons or active loan panel */}
      {loan.activeLoan > 0 ? (
        <div
          style={{
            background: "rgba(255,68,68,0.04)",
            border: `1px solid ${loan.isOverdue ? "rgba(255,68,68,0.4)" : "rgba(255,68,68,0.15)"}`,
            borderRadius: 12,
            padding: 16,
          }}
        >
          <div style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(255,68,68,0.5)", letterSpacing: "0.12em", marginBottom: 8 }}>
            ACTIVE_LOAN
          </div>
          <div className="font-display" style={{ fontSize: 22, fontWeight: 700, color: "#F0F0F0" }}>
            {loan.activeLoan} ALGO
          </div>
          <div style={{ fontFamily: "Inter,sans-serif", fontSize: 12, color: loan.isOverdue ? "#FF4444" : "#FFB347", marginTop: 4 }}>
            {loan.isOverdue ? "OVERDUE · " : "Due "}{loan.dueDate}
          </div>
          <button
            style={{
              marginTop: 12, width: "100%",
              background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.3)",
              borderRadius: 10, padding: "10px", color: "#FF4444",
              fontFamily: "Inter,sans-serif", fontSize: 14, fontWeight: 500, cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,68,68,0.18)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,68,68,0.1)"; }}
            onClick={() => addToast({ type: "info", title: "Repay flow", message: "Connect wallet to repay your loan." })}
          >
            Repay Now
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: "auto" }}>
          {/* Collateral loan */}
          <button
            style={{
              background: "rgba(123,47,255,0.06)", border: "1px solid rgba(123,47,255,0.28)",
              borderRadius: 10, padding: "12px 16px", color: "#7B2FFF",
              fontFamily: "Inter,sans-serif", fontSize: 14, fontWeight: 500, cursor: "pointer",
              transition: "all 0.2s ease", textAlign: "left",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(123,47,255,0.12)"; e.currentTarget.style.borderColor = "rgba(123,47,255,0.5)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(123,47,255,0.06)"; e.currentTarget.style.borderColor = "rgba(123,47,255,0.28)"; }}
            onClick={() => addToast({ type: "info", title: "Collateral loan", message: "Connect wallet to initiate a collateral-backed loan." })}
          >
            Collateral Loan →
            <span style={{ display: "block", fontSize: 11, color: "rgba(123,47,255,0.6)", marginTop: 2 }}>USDC · 150% LTV</span>
          </button>

          {/* Unsecured loan */}
          <div style={{ position: "relative" }}>
            <button
              disabled={!unsecuredEligible}
              style={{
                width: "100%",
                background: "rgba(255,183,71,0.06)", border: "1px solid rgba(255,183,71,0.25)",
                borderRadius: 10, padding: "12px 16px", color: "#FFB347",
                fontFamily: "Inter,sans-serif", fontSize: 14, fontWeight: 500,
                cursor: unsecuredEligible ? "pointer" : "not-allowed",
                opacity: unsecuredEligible ? 1 : 0.35,
                transition: "all 0.2s ease", textAlign: "left",
              }}
              onMouseEnter={() => { if (!unsecuredEligible) setShowTooltip(true); }}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={() => {
                if (unsecuredEligible) addToast({ type: "info", title: "Unsecured loan", message: "Connect wallet to initiate an unsecured loan." });
              }}
            >
              Unsecured Loan →
              <span style={{ display: "block", fontSize: 11, color: "rgba(255,183,71,0.5)", marginTop: 2 }}>No collateral required</span>
            </button>
            {showTooltip && !unsecuredEligible && (
              <div
                style={{
                  position: "absolute",
                  bottom: "calc(100% + 8px)",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "rgba(8,8,18,0.95)",
                  border: "1px solid rgba(255,183,71,0.2)",
                  borderRadius: 8,
                  padding: "7px 12px",
                  fontFamily: "Inter,sans-serif",
                  fontSize: 12,
                  color: "#FFB347",
                  whiteSpace: "nowrap",
                  pointerEvents: "none",
                  zIndex: 10,
                }}
              >
                Need 30 AURA pts (have {user.auraPoints})
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
