import { memo } from "react";
import { AlertTriangle, TrendingUp } from "lucide-react";

function LucideIconWrapper({ Icon, size = 16 }) {
  return <Icon size={size} strokeWidth={2} />;
}

const iconMap = {
  "fa-triangle-exclamation": AlertTriangle,
  "fa-arrow-trend-up": TrendingUp,
};

// Rendered 4-up on nearly every dashboard/overview page - memoized so
// unrelated parent state (e.g. a filter tab) doesn't re-render every card.
function StatCard({
  label,
  value,
  trend,
  icon,
  iconColor = "#00B86B",
  iconBg = "var(--primary-tint)",
  accentGradient = "linear-gradient(90deg, #059669 0%, #10B981 100%)",
  progressPct = 85,
  onClick,
}) {
  const isWarning = trend?.toLowerCase().includes("flagged") || trend?.toLowerCase().includes("attention") || trend?.toLowerCase().includes("down");

  return (
    <div
      onClick={onClick}
      style={{
        background: "var(--surface)",
        border: `1px solid ${iconColor}25`,
        borderRadius: 16,
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: `0 6px 20px -2px rgba(0, 0, 0, 0.04), 0 2px 10px ${iconColor}15`,
        position: "relative",
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.borderColor = iconColor;
        e.currentTarget.style.boxShadow = `0 14px 35px -4px ${iconColor}35, 0 6px 18px ${iconColor}20`;
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = `${iconColor}25`;
        e.currentTarget.style.boxShadow = `0 6px 20px -2px rgba(0, 0, 0, 0.04), 0 2px 10px ${iconColor}15`;
      }}
    >
      {/* High Glow Top Accent Color Bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: accentGradient || iconColor,
          boxShadow: `0 2px 10px ${iconColor}60`,
        }}
      />

      <div>
        {/* Header Row: Label, Icon, and Mini Sparkline Bar Chart */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: iconBg,
                color: iconColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {typeof icon === "string" && icon.startsWith("fa-") ? (
                <i className={icon} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 16, height: 16 }} />
              ) : icon ? (
                <LucideIconWrapper Icon={icon} size={18} />
              ) : (
                "🏢"
              )}
            </div>
            <p style={{ margin: 0, fontSize: 11.5, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4 }}>
              {label}
            </p>
          </div>

          {/* Mini 7-Bar Sparkline Histogram */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 24, opacity: 0.85 }}>
            {[35, 60, 45, 80, 55, 95, 75].map((h, i) => (
              <div
                key={i}
                style={{
                  width: 3.5,
                  height: `${h}%`,
                  background: iconColor,
                  borderRadius: 2,
                  boxShadow: i === 5 ? `0 0 6px ${iconColor}` : "none",
                  opacity: i === 5 ? 1 : 0.4,
                }}
              />
            ))}
          </div>
        </div>

        {/* Main Metric Value with Subtle Glow */}
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 4 }}>
          <span
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: "var(--ink)",
              letterSpacing: "-0.03em",
              textShadow: `0 2px 10px ${iconColor}20`,
            }}
          >
            {value}
          </span>
          {trend && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: isWarning ? "#D97706" : "var(--primary-deep)",
                background: isWarning ? "#FEF3C7" : "var(--primary-tint)",
                border: `1px solid ${isWarning ? "#F59E0B40" : "rgba(0,184,107,0.25)"}`,
                padding: "3px 8px",
                borderRadius: 12,
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                boxShadow: `0 2px 6px ${isWarning ? "rgba(245,158,11,0.15)" : "rgba(0,184,107,0.15)"}`,
              }}
            >
              {isWarning ? <LucideIconWrapper Icon={iconMap["fa-triangle-exclamation"]} size={9.5} /> : <LucideIconWrapper Icon={iconMap["fa-arrow-trend-up"]} size={9.5} />}
              {trend}
            </span>
          )}
        </div>
      </div>

      {/* High Glow Micro Capacity / Performance Progress Bar */}
      <div style={{ width: "100%", height: 4, background: "var(--line)", borderRadius: 2, marginTop: 14, overflow: "hidden" }}>
        <div
          style={{
            width: `${progressPct}%`,
            height: "100%",
            background: accentGradient || iconColor,
            borderRadius: 2,
            boxShadow: `0 0 8px ${iconColor}80`,
            transition: "width 0.4s ease",
          }}
        />
      </div>
    </div>
  );
}

export default memo(StatCard);
