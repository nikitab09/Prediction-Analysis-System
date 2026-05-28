'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";

const compressorData = [
  { id: "CMP-001", rpm: 2950, power: 15.4, torque: 48.2, pressure: 7.5, airflow: 320, noise: 72, temp: 85, risk: 88, status: "FAULT" },
  { id: "CMP-002", rpm: 2800, power: 14.2, torque: 44.1, pressure: 6.8, airflow: 310, noise: 69, temp: 82, risk: 62, status: "DEGRADED" },
  { id: "CMP-003", rpm: 3000, power: 16.1, torque: 50.3, pressure: 7.9, airflow: 330, noise: 75, temp: 88, risk: 71, status: "FAULT" },
  { id: "CMP-004", rpm: 2750, power: 13.9, torque: 40.0, pressure: 6.5, airflow: 300, noise: 66, temp: 78, risk: 14, status: "NORMAL" },
  { id: "CMP-005", rpm: 3100, power: 17.0, torque: 52.1, pressure: 8.1, airflow: 340, noise: 78, temp: 90, risk: 8, status: "NORMAL" },
  { id: "CMP-006", rpm: 2890, power: 15.0, torque: 47.0, pressure: 7.2, airflow: 315, noise: 71, temp: 84, risk: 55, status: "DEGRADED" },
  { id: "CMP-007", rpm: 2700, power: 13.5, torque: 39.2, pressure: 6.3, airflow: 295, noise: 65, temp: 77, risk: 11, status: "NORMAL" },
  { id: "CMP-008", rpm: 3050, power: 16.5, torque: 51.0, pressure: 8.0, airflow: 335, noise: 76, temp: 89, risk: 6, status: "NORMAL" },
];

type Status = "NORMAL" | "DEGRADED" | "FAULT";

const statusConfig: Record<Status, { color: string; bg: string; border: string; label: string }> = {
  NORMAL: {
    color: "#10b981",
    bg: "rgba(16,185,129,0.12)",
    border: "rgba(16,185,129,0.3)",
    label: "NORMAL"
  },
  DEGRADED: {
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.3)",
    label: "DEGRADED"
  },
  FAULT: {
    color: "#ef4444",
    bg: "rgba(239,68,68,0.12)",
    border: "rgba(239,68,68,0.3)",
    label: "FAULT"
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
          overflow: "hidden"
        }}
      >
        <div
          style={{
            width: `${value}%`,
            height: "100%",
            background: color,
            borderRadius: 3,
            transition: "width 0.6s ease"
          }}
        />
      </div>

      <span
        style={{
          fontSize: 12,
          fontFamily: "'Rajdhani', sans-serif",
          fontWeight: 700,
          color,
          minWidth: 34
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
        fontSize: 11,
        fontFamily: "'Rajdhani', sans-serif",
        fontWeight: 700,
        letterSpacing: "0.08em",
        border: `1px solid ${cfg.border}`
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: cfg.color,
          display: "inline-block"
        }}
      />

      {cfg.label}
    </span>
  );
}

function StatCard({
  label,
  value,
  sub,
  color
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
        position: "relative",
        overflow: "hidden"
      }}
    >
      {color && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg, ${color}, ${color}33)`,
            borderRadius: "16px 16px 0 0"
          }}
        />
      )}

      <div
        style={{
          fontSize: 11,
          fontFamily: "'Rajdhani', sans-serif",
          fontWeight: 600,
          color: "#5a6a88",
          marginBottom: 8,
          letterSpacing: "0.08em"
        }}
      >
        {label.toUpperCase()}
      </div>

      <div
        style={{
          fontSize: 30,
          fontFamily: "'Rajdhani', sans-serif",
          fontWeight: 700,
          color: color || "#eef2ff",
          lineHeight: 1
        }}
      >
        {value}
      </div>

      <div
        style={{
          fontSize: 12,
          fontFamily: "'DM Sans', sans-serif",
          color: "#3a4a60",
          marginTop: 6
        }}
      >
        {sub}
      </div>
    </div>
  );
}

type ActionCardProps = {
  icon: React.ReactNode;
  title: string;
  desc: string;
  cta: string;
  streak: string;
  accentColor: string;
  accentBg: string;
  tags: string[];
  onClick: () => void;
};

function ActionCard({
  icon,
  title,
  desc,
  cta,
  streak,
  accentColor,
  accentBg,
  tags,
  onClick
}: ActionCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1,
        background: hovered
          ? `rgba(${accentBg}, 0.05)`
          : "rgba(255,255,255,0.025)",
        borderRadius: 20,
        padding: 0,
        border: `1px solid ${
          hovered
            ? `rgba(${accentBg}, 0.35)`
            : "rgba(255,255,255,0.07)"
        }`,
        cursor: "pointer",
        textAlign: "left",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s ease",
        overflow: "hidden",
        boxShadow: hovered
          ? `0 20px 60px rgba(${accentBg}, 0.1)`
          : "none",
        transform: hovered
          ? "translateY(-4px)"
          : "translateY(0)"
      }}
    >
      <div
        style={{
          height: 3,
          background: `linear-gradient(90deg, ${streak}, ${streak}33)`,
          borderRadius: "20px 20px 0 0"
        }}
      />

      <div
        style={{
          padding: "24px 28px 0",
          display: "flex",
          alignItems: "center",
          gap: 14
        }}
      >
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: 14,
            background: `rgba(${accentBg}, 0.12)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: accentColor,
            border: `1px solid rgba(${accentBg}, 0.2)`
          }}
        >
          {icon}
        </div>

        <span
          style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: "0.65rem",
            fontWeight: 700,
            letterSpacing: "3px",
            padding: "4px 10px",
            borderRadius: 6,
            background: `rgba(${accentBg}, 0.12)`,
            color: accentColor,
            border: `1px solid rgba(${accentBg}, 0.2)`
          }}
        >
          ANALYSIS
        </span>
      </div>

      <div style={{ flex: 1, padding: "18px 28px" }}>
        <div
          style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: "1.45rem",
            fontWeight: 700,
            color: "#e8eeff",
            marginBottom: 10
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.875rem",
            color: "#5a6a88",
            lineHeight: 1.65,
            marginBottom: 18
          }}
        >
          {desc}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: "0.7rem",
                fontWeight: 600,
                letterSpacing: "0.8px",
                padding: "4px 10px",
                borderRadius: 6,
                background: `rgba(${accentBg}, 0.08)`,
                border: `1px solid rgba(${accentBg}, 0.18)`,
                color: accentColor
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 28px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: "0.85rem",
          fontWeight: 600,
          color: hovered ? accentColor : "#5a6a88"
        }}
      >
        <span>{cta}</span>
        <span
          style={{
            transform: hovered
              ? "translateX(5px)"
              : "translateX(0)",
            transition: "0.3s"
          }}
        >
          →
        </span>
      </div>
    </button>
  );
}

export default function CompressorDiagnostics() {
  const [view, setView] = useState<"dashboard" | "fleet">("dashboard");
  const [filter, setFilter] = useState("All");

  const router = useRouter();

  const normal = compressorData.filter(c => c.status === "NORMAL").length;
  const degraded = compressorData.filter(c => c.status === "DEGRADED").length;
  const fault = compressorData.filter(c => c.status === "FAULT").length;

  const filtered = compressorData.filter(c =>
    filter === "All"
      ? true
      : filter === "Critical"
      ? c.status === "FAULT"
      : filter === "At risk"
      ? c.status === "DEGRADED"
      : true
  );

  const tabs = ["All", "Critical", "At risk"];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#04091a",
        fontFamily: "'DM Sans', sans-serif",
        color: "#e2e8f0",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=DM+Sans:wght@400;500&display=swap');

        *, *::before, *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        table {
          border-collapse: collapse;
          width: 100%;
        }

        tr:hover td {
          background: rgba(59,130,246,0.03) !important;
        }

        .diag-back-btn {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: #5a6a88;
          border-radius: 8px;
          padding: 6px 14px;
          cursor: pointer;
          font-size: 12px;
          font-family: 'Rajdhani', sans-serif;
          font-weight: 600;
          letter-spacing: 0.05em;
        }

        .diag-back-btn:hover {
          color: #3b82f6;
          border-color: rgba(59,130,246,0.3);
          background: rgba(59,130,246,0.05);
        }

        .filter-tab {
          padding: 6px 18px;
          border-radius: 8px;
          font-size: 12px;
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700;
          letter-spacing: 0.08em;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.1);
          background: transparent;
          color: #5a6a88;
        }

        .filter-tab.active {
          background: rgba(59,130,246,0.12);
          color: #3b82f6;
          border-color: rgba(59,130,246,0.35);
        }
      `}</style>

      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `
            radial-gradient(ellipse 70% 55% at 15% 25%, rgba(59,130,246,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 85% 75%, rgba(16,185,129,0.06) 0%, transparent 60%)
          `
        }}
      />

      <div
        style={{
          position: "relative",
          maxWidth: 900,
          margin: "0 auto",
          padding: "48px 24px"
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 36
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              className="diag-back-btn"
              onClick={() => router.push("/")}
            >
              ← Back
            </button>

            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 3
                }}
              >
                <span
                  style={{
                    fontFamily: "'Rajdhani', sans-serif",
                    fontSize: "1.4rem",
                    fontWeight: 700,
                    color: "#f0f4ff"
                  }}
                >
                  Compressor Diagnostics
                </span>

                <span
                  style={{
                    fontFamily: "'Rajdhani', sans-serif",
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    letterSpacing: "3px",
                    padding: "3px 8px",
                    borderRadius: 5,
                    background: "rgba(59,130,246,0.12)",
                    color: "#3b82f6",
                    border: "1px solid rgba(59,130,246,0.25)"
                  }}
                >
                  COMPRESSOR
                </span>
              </div>

              <div
                style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  color: "#2a3450",
                  letterSpacing: "2px"
                }}
              >
                INDUSTRIAL AIRFLOW & PRESSURE MONITORING SYSTEM
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 14,
            marginBottom: 40
          }}
        >
          <StatCard
            label="Total Compressors"
            value={compressorData.length}
            sub="Across 2 facilities"
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
            sub="Monitoring required"
            color="#f59e0b"
          />

          <StatCard
            label="Fault"
            value={fault}
            sub="Immediate maintenance"
            color="#ef4444"
          />
        </div>

        {view === "dashboard" && (
          <>
            <div
              style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#3b82f6",
                letterSpacing: "3px",
                marginBottom: 20
              }}
            >
              COMPRESSOR ANALYSIS
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 20
              }}
            >
              <ActionCard
                icon={
                  <svg
                    viewBox="0 0 64 64"
                    width={28}
                    height={28}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <circle cx="32" cy="32" r="18" />
                    <path d="M20 32 L32 20 L44 32" />
                    <path d="M20 32 L32 44 L44 32" />
                  </svg>
                }
                title="New Prediction"
                desc="Analyze compressor RPM, airflow, pressure and temperature to detect degraded or fault conditions instantly."
                cta="Run compressor prediction"
                streak="#3b82f6"
                accentColor="#3b82f6"
                accentBg="59,130,246"
                tags={["Pressure", "Airflow", "Temperature"]}
                onClick={() => router.push("/compressor")}
              />

              <ActionCard
                icon={
                  <svg
                    viewBox="0 0 64 64"
                    width={28}
                    height={28}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <polyline points="8,48 22,30 32,38 44,20 56,10" />
                    <line x1="8" y1="56" x2="56" y2="56" />
                  </svg>
                }
                title="Fleet Risk Forecast"
                desc="Monitor compressor fleet health, compare risk levels and identify pressure instability or airflow failures."
                cta="View compressor fleet"
                streak="#10b981"
                accentColor="#10b981"
                accentBg="16,185,129"
                tags={["8 Compressors", "Risk Ranking", "Fault Detection"]}
                onClick={() => setView("fleet")}
              />
            </div>
          </>
        )}

        {view === "fleet" && (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 22
              }}
            >
              <button
                className="diag-back-btn"
                onClick={() => setView("dashboard")}
              >
                ← Back
              </button>

              <span
                style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "#3b82f6",
                  letterSpacing: "3px"
                }}
              >
                COMPRESSOR FLEET STATUS
              </span>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {tabs.map((t) => (
                <button
                  key={t}
                  className={`filter-tab${filter === t ? " active" : ""}`}
                  onClick={() => setFilter(t)}
                >
                  {t}
                </button>
              ))}
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.02)",
                borderRadius: 16,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.07)"
              }}
            >
              <table>
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.07)"
                    }}
                  >
                    {[
                      "ID",
                      "RPM",
                      "Power",
                      "Pressure",
                      "Airflow",
                      "Temperature",
                      "Risk",
                      "Status"
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "12px 18px",
                          textAlign: "left",
                          fontFamily: "'Rajdhani', sans-serif",
                          fontSize: 11,
                          color: "#2a3450",
                          fontWeight: 700,
                          letterSpacing: "0.08em"
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((c) => (
                    <tr
                      key={c.id}
                      style={{
                        borderBottom:
                          "1px solid rgba(255,255,255,0.04)"
                      }}
                    >
                      <td
                        style={{
                          padding: "14px 18px",
                          color: "#3b82f6",
                          fontWeight: 700
                        }}
                      >
                        {c.id}
                      </td>

                      <td style={{ padding: "14px 18px" }}>{c.rpm}</td>

                      <td style={{ padding: "14px 18px" }}>
                        {c.power} kW
                      </td>

                      <td style={{ padding: "14px 18px" }}>
                        {c.pressure} bar
                      </td>

                      <td style={{ padding: "14px 18px" }}>
                        {c.airflow} CFM
                      </td>

                      <td style={{ padding: "14px 18px" }}>
                        {c.temp}°C
                      </td>

                      <td style={{ padding: "14px 18px" }}>
                        <RiskBar
                          value={c.risk}
                          status={c.status as Status}
                        />
                      </td>

                      <td style={{ padding: "14px 18px" }}>
                        <StatusBadge
                          status={c.status as Status}
                        />
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