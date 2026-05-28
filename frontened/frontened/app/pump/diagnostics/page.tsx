'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Activity } from "lucide-react";

const pumpData = [
  { id: "PMP-001", sensor00: 2.45, sensor02: 47.3, sensor03: 0.82, sensor04: 1.15, risk: 91, status: "BROKEN" },
  { id: "PMP-002", sensor00: 2.10, sensor02: 42.8, sensor03: 0.76, sensor04: 1.01, risk: 66, status: "RECOVERING" },
  { id: "PMP-003", sensor00: 1.95, sensor02: 39.2, sensor03: 0.61, sensor04: 0.88, risk: 18, status: "NORMAL" },
  { id: "PMP-004", sensor00: 2.30, sensor02: 45.6, sensor03: 0.80, sensor04: 1.08, risk: 72, status: "RECOVERING" },
  { id: "PMP-005", sensor00: 1.82, sensor02: 36.5, sensor03: 0.54, sensor04: 0.79, risk: 11, status: "NORMAL" },
  { id: "PMP-006", sensor00: 2.60, sensor02: 49.8, sensor03: 0.91, sensor04: 1.21, risk: 96, status: "BROKEN" },
  { id: "PMP-007", sensor00: 1.88, sensor02: 37.4, sensor03: 0.58, sensor04: 0.82, risk: 14, status: "NORMAL" },
  { id: "PMP-008", sensor00: 2.15, sensor02: 43.7, sensor03: 0.74, sensor04: 0.99, risk: 58, status: "RECOVERING" },
];

type Status = "NORMAL" | "RECOVERING" | "BROKEN";

const statusConfig: Record<Status, { color: string; bg: string; border: string }> = {
  NORMAL: {
    color: "#10b981",
    bg: "rgba(16,185,129,0.12)",
    border: "rgba(16,185,129,0.3)"
  },
  RECOVERING: {
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.3)"
  },
  BROKEN: {
    color: "#ef4444",
    bg: "rgba(239,68,68,0.12)",
    border: "rgba(239,68,68,0.3)"
  },
};

function RiskBar({ value, status }: { value: number; status: Status }) {
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
            borderRadius: 3,
          }}
        />
      </div>

      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          color,
          minWidth: 34,
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

export default function PumpDiagnostics() {
  const [view, setView] = useState<"dashboard" | "fleet">("dashboard");
  const [filter, setFilter] = useState("All");

  const router = useRouter();

  const healthy = pumpData.filter(p => p.status === "NORMAL").length;
  const recovering = pumpData.filter(p => p.status === "RECOVERING").length;
  const broken = pumpData.filter(p => p.status === "BROKEN").length;

  const filtered = pumpData.filter(p =>
    filter === "All"
      ? true
      : filter === "Critical"
      ? p.status === "BROKEN"
      : filter === "At risk"
      ? p.status === "RECOVERING"
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
              <Activity size={28} color="#10b981" />
              Pump Diagnostics
            </h1>

            <p style={{ color: "#5a6a88" }}>
              Fleet overview & predictive maintenance analysis
            </p>
          </div>

          <button
            onClick={() => router.push("/pump")}
            style={{
              padding: "10px 18px",
              borderRadius: 10,
              border: "none",
              background: "#10b981",
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
            label="Total Pumps"
            value={pumpData.length}
            sub="Across all units"
          />

          <StatCard
            label="Healthy"
            value={healthy}
            sub="Operating normally"
            color="#10b981"
          />

          <StatCard
            label="Recovering"
            value={recovering}
            sub="Needs monitoring"
            color="#f59e0b"
          />

          <StatCard
            label="Broken"
            value={broken}
            sub="Immediate maintenance"
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
                color: "#10b981",
                letterSpacing: "2px",
                marginBottom: 18,
                fontWeight: 700,
              }}
            >
              PUMP ANALYSIS
            </div>

            <p
              style={{
                color: "#94a3b8",
                lineHeight: 1.7,
                marginBottom: 24,
              }}
            >
              Monitor industrial pump systems using real-time sensor
              diagnostics, anomaly detection, and predictive maintenance
              forecasting.
            </p>

            <button
              onClick={() => setView("fleet")}
              style={{
                padding: "12px 20px",
                borderRadius: 10,
                border: "none",
                background: "#10b981",
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
                          ? "1px solid rgba(16,185,129,0.3)"
                          : "1px solid rgba(255,255,255,0.08)",
                      background:
                        filter === t
                          ? "rgba(16,185,129,0.1)"
                          : "transparent",
                      color:
                        filter === t ? "#10b981" : "#94a3b8",
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
                      "Pump ID",
                      "Sensor 00",
                      "Sensor 02",
                      "Sensor 03",
                      "Sensor 04",
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
                  {filtered.map(p => (
                    <tr
                      key={p.id}
                      style={{
                        borderBottom:
                          "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      <td style={{ padding: "16px 18px", color: "#10b981", fontWeight: 700 }}>
                        {p.id}
                      </td>

                      <td style={{ padding: "16px 18px" }}>{p.sensor00}</td>
                      <td style={{ padding: "16px 18px" }}>{p.sensor02}</td>
                      <td style={{ padding: "16px 18px" }}>{p.sensor03}</td>
                      <td style={{ padding: "16px 18px" }}>{p.sensor04}</td>

                      <td style={{ padding: "16px 18px" }}>
                        <RiskBar value={p.risk} status={p.status as Status} />
                      </td>

                      <td style={{ padding: "16px 18px" }}>
                        <StatusBadge status={p.status as Status} />
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