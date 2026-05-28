'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";

const turbineData = [
  { id: "TRB-001", rpm: 3000, temperature: 850, pressure: 12.4, vibration: 2.1, power: 45, risk: 92, status: "FAULT" },
  { id: "TRB-002", rpm: 2890, temperature: 810, pressure: 11.2, vibration: 1.7, power: 42, risk: 61, status: "DEGRADED" },
  { id: "TRB-003", rpm: 3100, temperature: 870, pressure: 12.9, vibration: 2.4, power: 48, risk: 88, status: "FAULT" },
  { id: "TRB-004", rpm: 2800, temperature: 780, pressure: 10.8, vibration: 1.1, power: 39, risk: 12, status: "NORMAL" },
  { id: "TRB-005", rpm: 2950, temperature: 820, pressure: 11.7, vibration: 1.5, power: 44, risk: 18, status: "NORMAL" },
  { id: "TRB-006", rpm: 3050, temperature: 860, pressure: 12.6, vibration: 2.2, power: 47, risk: 74, status: "DEGRADED" },
  { id: "TRB-007", rpm: 2760, temperature: 770, pressure: 10.5, vibration: 1.0, power: 37, risk: 9, status: "NORMAL" },
  { id: "TRB-008", rpm: 3120, temperature: 880, pressure: 13.1, vibration: 2.6, power: 49, risk: 95, status: "FAULT" },
];

type Status = "NORMAL" | "DEGRADED" | "FAULT";

const statusConfig: Record<
  Status,
  { color: string; bg: string; border: string }
> = {
  NORMAL: {
    color: "#10b981",
    bg: "rgba(16,185,129,0.12)",
    border: "rgba(16,185,129,0.3)",
  },
  DEGRADED: {
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.3)",
  },
  FAULT: {
    color: "#ef4444",
    bg: "rgba(239,68,68,0.12)",
    border: "rgba(239,68,68,0.3)",
  },
};

function RiskBar({
  value,
  status,
}: {
  value: number;
  status: Status;
}) {
  const color = statusConfig[status].color;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div
        style={{
          width: 90,
          height: 5,
          background: "rgba(255,255,255,0.08)",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${value}%`,
            height: "100%",
            background: color,
          }}
        />
      </div>

      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          color,
        }}
      >
        {value}%
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const cfg = statusConfig[status];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: 6,
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.08em",
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: cfg.color,
          display: "inline-block",
        }}
      />
      {status}
    </span>
  );
}

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: number;
  sub: string;
  color?: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        background: "rgba(255,255,255,0.025)",
        borderRadius: 16,
        padding: "20px 22px",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "#5a6a88",
          marginBottom: 8,
          letterSpacing: "0.08em",
        }}
      >
        {label.toUpperCase()}
      </div>

      <div
        style={{
          fontSize: 30,
          fontWeight: 700,
          color: color || "#eef2ff",
        }}
      >
        {value}
      </div>

      <div
        style={{
          fontSize: 12,
          color: "#3a4a60",
          marginTop: 6,
        }}
      >
        {sub}
      </div>
    </div>
  );
}

export default function TurbineDiagnostics() {
  const [view, setView] = useState<"dashboard" | "fleet">("dashboard");
  const [filter, setFilter] = useState("All");

  const router = useRouter();

  const normal = turbineData.filter(t => t.status === "NORMAL").length;
  const degraded = turbineData.filter(t => t.status === "DEGRADED").length;
  const fault = turbineData.filter(t => t.status === "FAULT").length;

  const filtered = turbineData.filter(t =>
    filter === "All"
      ? true
      : filter === "Critical"
      ? t.status === "FAULT"
      : filter === "At risk"
      ? t.status === "DEGRADED"
      : true
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#04091a",
        color: "#e2e8f0",
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <div>
            <h1
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: "2rem",
                marginBottom: 6,
              }}
            >
              <Zap size={28} color="#60a5fa" />
              Turbine Diagnostics
            </h1>

            <p style={{ color: "#5a6a88" }}>
              Turbine fleet monitoring & predictive maintenance system
            </p>
          </div>

          <button
            onClick={() => router.push("/turbine")}
            style={{
              padding: "10px 18px",
              borderRadius: 10,
              border: "none",
              background: "#3b82f6",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Run Prediction
          </button>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 14,
            marginBottom: 36,
          }}
        >
          <StatCard
            label="Total Turbines"
            value={turbineData.length}
            sub="Across all facilities"
          />

          <StatCard
            label="Normal"
            value={normal}
            sub="Operating normally"
            color="#10b981"
          />

          <StatCard
            label="Degraded"
            value={degraded}
            sub="Performance reduced"
            color="#f59e0b"
          />

          <StatCard
            label="Fault"
            value={fault}
            sub="Immediate inspection"
            color="#ef4444"
          />
        </div>

        {/* Dashboard */}
        {view === "dashboard" && (
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 18,
              padding: 28,
            }}
          >
            <div
              style={{
                fontSize: "0.8rem",
                color: "#60a5fa",
                letterSpacing: "2px",
                marginBottom: 18,
                fontWeight: 700,
              }}
            >
              TURBINE ANALYSIS
            </div>

            <p
              style={{
                color: "#94a3b8",
                lineHeight: 1.7,
                marginBottom: 24,
              }}
            >
              Analyze turbine RPM, vibration, temperature, and pressure
              conditions to identify degradation trends and critical faults
              before operational failure.
            </p>

            <button
              onClick={() => setView("fleet")}
              style={{
                padding: "12px 20px",
                borderRadius: 10,
                border: "none",
                background: "#3b82f6",
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              View Fleet Overview
            </button>
          </div>
        )}

        {/* Fleet */}
        {view === "fleet" && (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 20,
                alignItems: "center",
              }}
            >
              <button
                onClick={() => setView("dashboard")}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "transparent",
                  color: "#94a3b8",
                  cursor: "pointer",
                }}
              >
                ← Back
              </button>

              <div style={{ display: "flex", gap: 8 }}>
                {["All", "Critical", "At risk"].map(t => (
                  <button
                    key={t}
                    onClick={() => setFilter(t)}
                    style={{
                      padding: "7px 16px",
                      borderRadius: 8,
                      border:
                        filter === t
                          ? "1px solid rgba(59,130,246,0.3)"
                          : "1px solid rgba(255,255,255,0.08)",
                      background:
                        filter === t
                          ? "rgba(59,130,246,0.1)"
                          : "transparent",
                      color:
                        filter === t ? "#60a5fa" : "#94a3b8",
                      cursor: "pointer",
                      fontWeight: 700,
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div
              style={{
                background: "rgba(255,255,255,0.025)",
                borderRadius: 18,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    {[
                      "Turbine ID",
                      "RPM",
                      "Temperature",
                      "Pressure",
                      "Vibration",
                      "Power",
                      "Risk",
                      "Status",
                    ].map(h => (
                      <th
                        key={h}
                        style={{
                          padding: "14px 18px",
                          textAlign: "left",
                          fontSize: 11,
                          color: "#5a6a88",
                          letterSpacing: "0.08em",
                        }}
                      >
                        {h.toUpperCase()}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filtered.map(t => (
                    <tr
                      key={t.id}
                      style={{
                        borderBottom:
                          "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      <td style={{ padding: "16px 18px", color: "#60a5fa", fontWeight: 700 }}>
                        {t.id}
                      </td>

                      <td style={{ padding: "16px 18px" }}>{t.rpm}</td>
                      <td style={{ padding: "16px 18px" }}>{t.temperature} K</td>
                      <td style={{ padding: "16px 18px" }}>{t.pressure} bar</td>
                      <td style={{ padding: "16px 18px" }}>{t.vibration} mm/s</td>
                      <td style={{ padding: "16px 18px" }}>{t.power} MW</td>

                      <td style={{ padding: "16px 18px" }}>
                        <RiskBar value={t.risk} status={t.status as Status} />
                      </td>

                      <td style={{ padding: "16px 18px" }}>
                        <StatusBadge status={t.status as Status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </main>
  );
}