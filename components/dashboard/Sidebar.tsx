"use client";
import { useState } from "react";

const NAV = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
        <rect x="11" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
        <rect x="1" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
        <rect x="11" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    ),
  },
  {
    id: "pool",
    label: "Pool",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 3C9 3 3 7 3 11a6 6 0 0012 0C15 7 9 3 9 3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M9 11a2 2 0 100 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "lending",
    label: "Lending",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="1" y="8" width="16" height="9" rx="2" stroke="currentColor" strokeWidth="1.4" />
        <path d="M4 8V6a5 5 0 0110 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="9" cy="12.5" r="1.5" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    id: "aura",
    label: "Aura",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <polygon points="9,1 11.5,6.5 17,7.3 13,11.2 14.1,16.5 9,13.7 3.9,16.5 5,11.2 1,7.3 6.5,6.5" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="none" />
      </svg>
    ),
  },
  {
    id: "settings",
    label: "Settings",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M9 1v2M9 15v2M1 9h2M15 9h2M3.05 3.05l1.41 1.41M13.54 13.54l1.41 1.41M3.05 14.95l1.41-1.41M13.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
];

interface SidebarProps {
  active: string;
  onNav: (id: string) => void;
}

export default function Sidebar({ active, onNav }: SidebarProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <aside
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: 220,
        height: "100vh",
        background: "rgba(8,8,18,0.85)",
        backdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(255,255,255,0.05)",
        display: "flex",
        flexDirection: "column",
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="font-display" style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em" }}>
          <span style={{ color: "#F0F0F0" }}>Algo</span>
          <span style={{ color: "#00FFD1" }}>Crefi</span>
        </div>
        <div style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em", marginTop: 4 }}>
          TESTNET · APP_758675636
        </div>
      </div>

      {/* Wallet chip */}
      <div style={{ padding: "16px 16px 0" }}>
        <div
          style={{
            background: "rgba(0,255,209,0.05)",
            border: "1px solid rgba(0,255,209,0.1)",
            borderRadius: 10,
            padding: "10px 12px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#00FFD1",
              boxShadow: "0 0 8px #00FFD1",
              flexShrink: 0,
              animation: "dot-pulse 2s ease infinite",
            }}
          />
          <span style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,0.55)", letterSpacing: "0.03em" }}>
            ALGO3X...F9KT
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ marginTop: 24, padding: "0 10px", flex: 1 }}>
        <div style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "0.12em", padding: "0 8px 10px" }}>
          NAVIGATION
        </div>
        {NAV.map((item) => {
          const isActive = active === item.id;
          const isHov = hovered === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              onMouseEnter={() => setHovered(item.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 10,
                marginBottom: 2,
                background: isActive
                  ? "rgba(0,255,209,0.07)"
                  : isHov
                  ? "rgba(255,255,255,0.04)"
                  : "transparent",
                border: "none",
                borderLeft: isActive ? "2px solid #00FFD1" : "2px solid transparent",
                color: isActive ? "#00FFD1" : isHov ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.35)",
                cursor: "pointer",
                transition: "all 0.15s ease",
                fontFamily: "Inter, sans-serif",
                fontSize: 13,
                fontWeight: isActive ? 500 : 400,
                textAlign: "left",
              }}
            >
              {item.icon}
              {item.label}
              {isActive && (
                <span style={{ marginLeft: "auto", width: 4, height: 4, borderRadius: "50%", background: "#00FFD1" }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom: network status + disconnect */}
      <div style={{ padding: "12px 16px 20px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, padding: "0 4px" }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#00FFD1" }} />
          <span style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em" }}>
            ALGORAND TESTNET
          </span>
        </div>
        <button
          style={{
            width: "100%",
            background: "rgba(255,68,68,0.05)",
            border: "1px solid rgba(255,68,68,0.12)",
            borderRadius: 10,
            padding: "10px 14px",
            color: "rgba(255,68,68,0.6)",
            fontFamily: "Inter, sans-serif",
            fontSize: 13,
            cursor: "pointer",
            transition: "all 0.2s ease",
            textAlign: "left",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,68,68,0.1)";
            e.currentTarget.style.color = "#FF4444";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,68,68,0.05)";
            e.currentTarget.style.color = "rgba(255,68,68,0.6)";
          }}
        >
          Disconnect
        </button>
      </div>

      <style>{`
        @keyframes dot-pulse {
          0%,100% { transform:scale(1); opacity:1; }
          50%     { transform:scale(1.8); opacity:0.4; }
        }
      `}</style>
    </aside>
  );
}
