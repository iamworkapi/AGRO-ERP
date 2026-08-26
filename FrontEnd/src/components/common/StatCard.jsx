import { memo } from "react";

function StatCard({
  variant = "elevated", // "solid" | "elevated" | "accent"
  label,
  value,
  trend,
  trendDirection = "up", // "up" | "down"
  icon,
  color = "#5DD62C",
  bg,
  viewAllLink,
  onClick,
  style = {},
  className = "",
}) {
  const isDown = trendDirection === "down" || trend?.includes("-") || trend?.toLowerCase().includes("down");
  const isUp = trendDirection === "up" || trend?.includes("+") || trend?.toLowerCase().includes("up");

  // =========================================================================
  // 1. SOLID CARD VARIANT (Top row of reference design)
  // =========================================================================
  if (variant === "solid") {
    return (
      <div
        onClick={onClick}
        className={`stat-card-solid ${className}`}
        style={{
          background: bg || color,
          borderRadius: 16,
          padding: "16px 20px",
          color: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          gap: 16,
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 6px 16px rgba(0, 0, 0, 0.08)",
          cursor: onClick ? "pointer" : "default",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          ...style,
        }}
        onMouseOver={(e) => {
          if (onClick) e.currentTarget.style.transform = "translateY(-3px)";
        }}
        onMouseOut={(e) => {
          if (onClick) e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        {/* Left White Rounded Icon Box */}
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 12,
            background: "#FFFFFF",
            color: color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            flexShrink: 0,
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.06)",
          }}
        >
          {typeof icon === "string" ? <i className={icon} /> : icon}
        </div>

        {/* Center/Right Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              color: "rgba(255, 255, 255, 0.88)",
              marginBottom: 4,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {label}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <span
              style={{
                fontSize: 20,
                fontWeight: 900,
                color: "#FFFFFF",
                letterSpacing: "-0.02em",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {value}
            </span>

            {trend && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                  fontSize: 10.5,
                  fontWeight: 800,
                  padding: "2px 7px",
                  borderRadius: 12,
                  background: isDown ? "rgba(255, 59, 86, 0.25)" : "rgba(255, 255, 255, 0.22)",
                  color: "#FFFFFF",
                  whiteSpace: "nowrap",
                }}
              >
                <i className={isDown ? "ri-arrow-down-line" : "ri-arrow-up-line"} style={{ fontSize: 10 }} />
                {trend}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. ELEVATED WHITE CARD VARIANT (Bottom row of reference design)
  // =========================================================================
  return (
    <div
      onClick={onClick}
      className={`stat-card-elevated ${className}`}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: 16,
        padding: "18px 20px",
        boxShadow: "var(--shadow-sm)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.borderColor = color;
        e.currentTarget.style.boxShadow = "var(--shadow-md)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "var(--line)";
        e.currentTarget.style.boxShadow = "var(--shadow-sm)";
      }}
    >
      {/* Top Row: Value & Label on Left, Pastel Icon Box on Right */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
        <div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: "var(--ink)",
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
            }}
          >
            {value}
          </div>
          <div
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              color: "var(--muted)",
              marginTop: 4,
            }}
          >
            {label}
          </div>
        </div>

        {/* Pastel Icon Box on Right */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: bg || `${color}18`,
            color: color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          {typeof icon === "string" ? <i className={icon} /> : icon}
        </div>
      </div>

      {/* Bottom Footer Row: Trend & View All link */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 10,
          borderTop: "1px solid var(--line)",
          fontSize: 11.5,
        }}
      >
        <div
          style={{
            fontWeight: 800,
            color: isDown ? "#DC2626" : "var(--primary)",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <i className={isDown ? "ri-arrow-down-line" : "ri-arrow-up-line"} style={{ fontSize: 11 }} />
          <span>{trend || "+12% vs Last Month"}</span>
        </div>

        {viewAllLink && (
          <span
            style={{
              fontWeight: 700,
              color: "var(--ink)",
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            View All
          </span>
        )}
      </div>
    </div>
  );
}

export default memo(StatCard);
