"use client";
import { useRef, useState } from "react";
import type { PoolInfo } from "@/lib/mockData";
import { useToast } from "./toastContext";

interface Props { pool: PoolInfo; }

function RippleButton({
  children,
  onClick,
  loading,
  style,
}: {
  children: React.ReactNode;
  onClick: () => void;
  loading?: boolean;
  style?: React.CSSProperties;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const id = Date.now();
    setRipples((p) => [...p, { x: e.clientX - rect.left, y: e.clientY - rect.top, id }]);
    setTimeout(() => setRipples((p) => p.filter((r) => r.id !== id)), 600);
    onClick();
  };

  return (
    <button
      ref={btnRef}
      onClick={handleClick}
      disabled={loading}
      style={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        background: "#00FFD1",
        color: "#05050A",
        border: "none",
        borderRadius: 12,
        padding: "14px",
        fontFamily: "Inter,sans-serif",
        fontSize: 15,
        fontWeight: 700,
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.7 : 1,
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
        marginTop: 16,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!loading) {
          e.currentTarget.style.boxShadow = "0 0 0 6px rgba(0,255,209,0.1),0 0 32px rgba(0,255,209,0.25)";
          e.currentTarget.style.transform = "translateY(-1px)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "none";
      }}
    >
      {ripples.map((r) => (
        <span
          key={r.id}
          style={{
            position: "absolute",
            left: r.x,
            top: r.y,
            width: 8,
            height: 8,
            marginLeft: -4,
            marginTop: -4,
            borderRadius: "50%",
            background: "rgba(0,0,0,0.2)",
            transform: "scale(0)",
            animation: "ripple-expand 0.6s ease forwards",
            pointerEvents: "none",
          }}
        />
      ))}
      {loading ? (
        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <span style={{ width: 14, height: 14, border: "2px solid rgba(5,5,10,0.3)", borderTopColor: "#05050A", borderRadius: "50%", display: "inline-block", animation: "spin-cw 0.7s linear infinite" }} />
          Signing...
        </span>
      ) : children}
    </button>
  );
}

export default function PoolOperations({ pool }: Props) {
  const [tab, setTab] = useState<"deposit" | "withdraw">("deposit");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const { addToast } = useToast();

  const shareEstimate = amount ? (parseFloat(amount) / pool.sharePrice).toFixed(4) : null;
  const algoEstimate = amount ? (parseFloat(amount) * pool.sharePrice).toFixed(4) : null;

  const handleSubmit = () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      addToast({ type: "error", title: "Invalid amount", message: "Enter a valid ALGO amount." });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setAmount("");
      addToast({
        type: "success",
        title: tab === "deposit" ? "Deposit submitted" : "Withdrawal submitted",
        message: `Tx: 0x${Math.random().toString(16).slice(2, 14).toUpperCase()}...`,
      });
      setTimeout(() => setSuccess(false), 6000);
    }, 2200);
  };

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16,
        padding: "24px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 className="font-display" style={{ fontSize: 17, fontWeight: 700, color: "#F0F0F0", letterSpacing: "-0.02em" }}>
          Pool Operations
        </h2>
        <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 3 }}>
          {(["deposit", "withdraw"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setAmount(""); setSuccess(false); }}
              style={{
                background: tab === t ? "rgba(0,255,209,0.1)" : "transparent",
                color: tab === t ? "#00FFD1" : "rgba(255,255,255,0.35)",
                border: "none",
                borderRadius: 8,
                padding: "6px 16px",
                fontFamily: "Inter,sans-serif",
                fontSize: 13,
                fontWeight: tab === t ? 500 : 400,
                cursor: "pointer",
                transition: "all 0.2s ease",
                textTransform: "capitalize",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div>
        <label style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em", display: "block", marginBottom: 8 }}>
          {tab === "deposit" ? "AMOUNT (ALGO)" : "SHARES TO WITHDRAW"}
        </label>
        <div style={{ position: "relative" }}>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 12,
              padding: "14px 52px 14px 16px",
              color: "#F0F0F0",
              fontFamily: "Inter,sans-serif",
              fontSize: 16,
              fontWeight: 500,
              outline: "none",
              transition: "border-color 0.2s ease, box-shadow 0.2s ease",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#00FFD1";
              e.target.style.boxShadow = "0 0 0 3px rgba(0,255,209,0.07)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(255,255,255,0.09)";
              e.target.style.boxShadow = "none";
            }}
          />
          <button
            onClick={() => setAmount(tab === "deposit" ? "54030" : "1200")}
            style={{
              position: "absolute",
              right: 14,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              color: "#00FFD1",
              fontFamily: "Inter,sans-serif",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              padding: 0,
            }}
          >
            MAX
          </button>
        </div>

        {/* Live estimate */}
        {amount && (
          <div style={{ padding: "10px 0", fontFamily: "Inter,sans-serif", fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
            {tab === "deposit"
              ? `You'll receive ≈ ${shareEstimate} shares`
              : `You'll receive ≈ ${algoEstimate} ALGO`}
          </div>
        )}
      </div>

      {/* Opt-in info */}
      <div
        style={{
          background: "rgba(0,255,209,0.03)",
          border: "1px solid rgba(0,255,209,0.09)",
          borderRadius: 10,
          padding: "10px 12px",
          marginTop: 12,
          cursor: "pointer",
        }}
        onClick={() => setInfoOpen(!infoOpen)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ color: "#00FFD1", fontSize: 13 }}>ⓘ</span>
          <span style={{ fontFamily: "Inter,sans-serif", fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
            First deposit requires opt-in transaction.
          </span>
          <span style={{ marginLeft: "auto", color: "rgba(0,255,209,0.4)", fontSize: 11 }}>{infoOpen ? "▲" : "▼"}</span>
        </div>
        {infoOpen && (
          <div style={{ marginTop: 8, fontFamily: "Inter,sans-serif", fontSize: 12, color: "rgba(255,255,255,0.25)", lineHeight: 1.6 }}>
            Two wallet signatures required: (1) opt-in to pool asset, (2) grouped deposit transaction. This is a one-time step per wallet.
          </div>
        )}
      </div>

      <RippleButton onClick={handleSubmit} loading={loading}>
        {tab === "deposit" ? "Deposit ALGO" : "Withdraw Shares"}
      </RippleButton>

      {/* Success */}
      {success && (
        <div
          style={{
            marginTop: 14,
            background: "rgba(0,255,209,0.04)",
            border: "1px solid rgba(0,255,209,0.15)",
            borderRadius: 10,
            padding: "14px 16px",
            animation: "slide-up-fade 0.4s ease forwards",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ color: "#00FFD1", fontSize: 14 }}>✓</span>
            <span style={{ fontFamily: "Inter,sans-serif", fontSize: 13, color: "#00FFD1", fontWeight: 500 }}>
              Transaction submitted
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
              Tx: 0xA4F2...8C3E
            </span>
            <a
              href="#"
              style={{ fontFamily: "Inter,sans-serif", fontSize: 11, color: "#00FFD1", textDecoration: "none" }}
            >
              View on Explorer ↗
            </a>
          </div>
        </div>
      )}

      <style>{`
        @keyframes ripple-expand {
          to { transform:scale(40); opacity:0; }
        }
      `}</style>
    </div>
  );
}
