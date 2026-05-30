"use client";

import { useEffect, useState } from "react";
import { Activity, AlertTriangle, CheckCircle } from "lucide-react";

export default function MotorHistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(
          "http://localhost:5050/motor-history"
        );

        const data = await res.json();
        setHistory(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const getStatusColor = (prediction: string) => {
    if (prediction === "NORMAL") return "#10b981";
    if (prediction === "DEGRADED") return "#f59e0b";
    return "#ef4444";
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg,#0f172a,#111827,#1e293b)",
        padding: "30px",
        color: "white",
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: "30px",
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "bold",
            marginBottom: "10px",
          }}
        >
          Motor Prediction History
        </h1>

        <p
          style={{
            color: "#94a3b8",
          }}
        >
          View all previous motor health predictions.
        </p>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : history.length === 0 ? (
        <div
          style={{
            padding: "30px",
            background: "#1e293b",
            borderRadius: "16px",
          }}
        >
          No prediction history found.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "20px",
          }}
        >
          {history.map((item) => {
            const color = getStatusColor(item.prediction);

            return (
              <div
                key={item.id}
                style={{
                  background: "#111827",
                  borderRadius: "18px",
                  padding: "20px",
                  border: `1px solid ${color}50`,
                  boxShadow:
                    "0 10px 30px rgba(0,0,0,0.25)",
                }}
              >
                {/* Top Row */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "15px",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    {item.prediction === "NORMAL" ? (
                      <CheckCircle size={22} color={color} />
                    ) : (
                      <AlertTriangle size={22} color={color} />
                    )}

                    <span
                      style={{
                        background: `${color}20`,
                        color,
                        padding: "6px 14px",
                        borderRadius: "999px",
                        fontWeight: 600,
                      }}
                    >
                      {item.prediction}
                    </span>
                  </div>

                  <span
                    style={{
                      color: "#94a3b8",
                      fontSize: "14px",
                    }}
                  >
                    {item.created_at}
                  </span>
                </div>

                {/* Confidence */}
                <div
                  style={{
                    marginBottom: "15px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "6px",
                    }}
                  >
                    <span>Confidence</span>
                    <span>{item.confidence}%</span>
                  </div>

                  <div
                    style={{
                      width: "100%",
                      height: "10px",
                      background: "#374151",
                      borderRadius: "999px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${item.confidence}%`,
                        height: "100%",
                        background: color,
                      }}
                    />
                  </div>
                </div>

                {/* Risk */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <Activity size={18} color={color} />

                  <span>
                    Risk Level:
                    <strong
                      style={{
                        color,
                        marginLeft: "6px",
                      }}
                    >
                      {item.risk_level}
                    </strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}