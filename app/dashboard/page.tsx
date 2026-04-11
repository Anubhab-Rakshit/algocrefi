"use client";
import { useState } from "react";
import { ToastProvider } from "@/components/dashboard/toastContext";
import ToastContainer from "@/components/dashboard/ToastContainer";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import StatCards from "@/components/dashboard/StatCards";
import PoolChart from "@/components/dashboard/PoolChart";
import PoolOperations from "@/components/dashboard/PoolOperations";
import CreditStatus from "@/components/dashboard/CreditStatus";
import { MOCK_POOL, MOCK_USER, MOCK_LOAN } from "@/lib/mockData";

function DashboardInner() {
  const [activeNav, setActiveNav] = useState("dashboard");

  return (
    <div style={{ minHeight: "100vh", background: "#05050A", position: "relative" }}>
      {/* Noise texture overlay */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          opacity: 0.025,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />

      {/* Ambient blobs */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          width: 600,
          height: 600,
          top: -200,
          left: -200,
          borderRadius: "50%",
          background: "rgba(0,255,209,0.04)",
          filter: "blur(120px)",
          zIndex: 0,
          pointerEvents: "none",
          animation: "blob-drift-a 15s ease-in-out infinite alternate",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "fixed",
          width: 500,
          height: 500,
          bottom: -150,
          right: -150,
          borderRadius: "50%",
          background: "rgba(123,47,255,0.05)",
          filter: "blur(120px)",
          zIndex: 0,
          pointerEvents: "none",
          animation: "blob-drift-b 15s ease-in-out infinite alternate",
        }}
      />

      <Sidebar active={activeNav} onNav={setActiveNav} />
      <ToastContainer />

      {/* Main content */}
      <main
        style={{
          marginLeft: 220,
          minHeight: "100vh",
          padding: "32px 36px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <TopBar title="Dashboard" />
        <StatCards pool={MOCK_POOL} user={MOCK_USER} loan={MOCK_LOAN} />
        <PoolChart />

        {/* Row 3 */}
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 14, marginTop: 14 }}>
          <PoolOperations pool={MOCK_POOL} />
          <CreditStatus user={MOCK_USER} loan={MOCK_LOAN} />
        </div>

        {/* Footer annotation */}
        <div
          style={{
            marginTop: 40,
            paddingTop: 20,
            borderTop: "1px solid rgba(255,255,255,0.04)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(255,255,255,0.15)", letterSpacing: "0.1em" }}>
            ALGOCREFI · TESTNET · AUTH_BYPASS_MODE
          </span>
          <span style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(255,255,255,0.15)", letterSpacing: "0.1em" }}>
            v0.1.0-beta
          </span>
        </div>
      </main>

      <style>{`
        @keyframes blob-drift-a {
          from { transform: translate(0, 0); }
          to   { transform: translate(20px, 20px); }
        }
        @keyframes blob-drift-b {
          from { transform: translate(0, 0); }
          to   { transform: translate(-20px, -20px); }
        }
      `}</style>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ToastProvider>
      <DashboardInner />
    </ToastProvider>
  );
}
