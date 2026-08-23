import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, ChevronDown, Download, Plus } from "lucide-react";
function LucideIconWrapper({ children, size }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: size, height: size, flexShrink: 0 }}>
      {children}
    </span>
  );
}



export default function TaskHiveHero({
  user,
  timeRange,
  onTimeRangeChange,
  onExportReport,
  onNewEntry,
}) {
  const navigate = useNavigate();

  const userName = user?.fullName || user?.name || "Admin";
  const userRole = user?.role || "System Administrator";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 16,
        paddingBottom: 4,
      }}
    >
      {/* Left: Greeting & Subtitle */}
      <div>
        <h1
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 800,
            color: "var(--ink)",
            letterSpacing: "-0.02em",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>{getGreeting()}, {userName}!</span>
          <span style={{ fontSize: 20 }}>👋</span>
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "var(--muted)" }}>
          Let&apos;s monitor today&apos;s crop procurement, weighment telemetry, and factory off-take.
        </p>
      </div>

      {/* Right: Date Range Selector & Action Buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        {/* Date Range Selector */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line-strong)",
            borderRadius: 10,
            padding: "6px 12px",
            fontSize: 12,
            fontWeight: 600,
            color: "var(--ink)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <LucideIconWrapper size={13}>
            <CalendarDays size={13} />
          </LucideIconWrapper>
          <span>May 16 – May 22, 2026</span>
          <LucideIconWrapper size={10}>
            <ChevronDown size={10} />
          </LucideIconWrapper>
        </div>

        {/* Export Report Button */}
        <button
          type="button"
          onClick={onExportReport || (() => navigate("/reports/export"))}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line-strong)",
            borderRadius: 10,
            padding: "8px 14px",
            fontSize: 12,
            fontWeight: 700,
            color: "var(--ink)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            boxShadow: "var(--shadow-sm)",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--surface-hover)";
            e.currentTarget.style.borderColor = "var(--primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--surface)";
            e.currentTarget.style.borderColor = "var(--line-strong)";
          }}
        >
          <LucideIconWrapper size={12}>
            <Download size={12} />
          </LucideIconWrapper>
          <span>Export Report</span>
        </button>

        {/* New Procurement Entry Button */}
        <button
          type="button"
          onClick={onNewEntry || (() => navigate("/biomass/collection"))}
          style={{
            background: "linear-gradient(135deg, var(--palette-c1) 0%, var(--palette-c3) 50%, var(--palette-c4) 100%)",
            border: "none",
            borderRadius: 10,
            padding: "8px 16px",
            fontSize: 12.5,
            fontWeight: 700,
            color: "#FFFFFF",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            boxShadow: "0 4px 14px rgba(5, 31, 32, 0.25)",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 6px 18px rgba(5, 31, 32, 0.35)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 14px rgba(5, 31, 32, 0.25)";
          }}
        >
          <LucideIconWrapper size={11}>
            <Plus size={11} />
          </LucideIconWrapper>
          <span>New Procurement</span>
        </button>
      </div>
    </div>
  );
}
