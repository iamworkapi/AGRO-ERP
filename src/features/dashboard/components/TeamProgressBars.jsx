import { useState } from "react";

export default function TeamProgressBars() {
  const [period, setPeriod] = useState("This Week");

  const teams = [
    {
      name: "Unnao Central Hub",
      lead: "Ramswaroop Yadav",
      metric: "450 MT",
      pct: 90,
      color: "#6366F1",
      avatarBg: "#EEF2FF",
      avatarColor: "#6366F1",
      icon: "fa-solid fa-warehouse",
    },
    {
      name: "Sahjanwa Transit Yard",
      lead: "Vikas Singh",
      metric: "380 MT",
      pct: 76,
      color: "#38BDF8",
      avatarBg: "#F0F9FF",
      avatarColor: "#0284C7",
      icon: "fa-solid fa-boxes-stacked",
    },
    {
      name: "Bansgaon Stacking Unit",
      lead: "Mukesh Maurya",
      metric: "250 MT",
      pct: 52,
      color: "#F59E0B",
      avatarBg: "#FFFBEB",
      avatarColor: "#D97706",
      icon: "fa-solid fa-scale-balanced",
    },
    {
      name: "Bighapur Sourcing Desk",
      lead: "Anil Kumar",
      metric: "165 MT",
      pct: 35,
      color: "#10B981",
      avatarBg: "#ECFDF5",
      avatarColor: "#059669",
      icon: "fa-solid fa-tractor",
    },
  ];

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: 16,
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        boxShadow: "0 4px 16px -2px rgba(5, 31, 32, 0.04)",
        height: "100%",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 800, color: "var(--ink)" }}>
            Procurement by Hub Team
          </h3>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>Processed volume against weekly targets</span>
        </div>

        <div
          style={{
            background: "var(--canvas)",
            border: "1px solid var(--line)",
            borderRadius: 8,
            padding: "4px 10px",
            fontSize: 11,
            fontWeight: 700,
            color: "var(--ink)",
            display: "flex",
            alignItems: "center",
            gap: 6,
            cursor: "pointer",
          }}
        >
          <span>{period}</span>
          <i className="fa-solid fa-chevron-down" style={{ fontSize: 9, color: "var(--muted)" }} />
        </div>
      </div>

      {/* Progress Bars List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {teams.map((t, idx) => (
          <div key={idx} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {/* Top row: Avatar + Name + Metric */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: t.avatarBg,
                    color: t.avatarColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 800,
                    border: `1px solid ${t.color}30`,
                  }}
                >
                  <i className={t.icon} style={{ fontSize: 10 }} />
                </div>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)" }}>
                    {t.name}
                  </span>
                </div>
              </div>

              <span style={{ fontSize: 12, fontWeight: 800, color: "var(--ink)" }}>
                {t.metric}
              </span>
            </div>

            {/* Linear Progress Bar */}
            <div
              style={{
                width: "100%",
                height: 6,
                background: "var(--line)",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${t.pct}%`,
                  height: "100%",
                  background: t.color,
                  borderRadius: 4,
                  transition: "width 0.6s ease",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
