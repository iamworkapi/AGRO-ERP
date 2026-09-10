import { memo } from "react";

function StatCard({
  variant = "elevated", // "elevated" | "accent" | "solid" | "compact"
  label,
  value,
  sub,
  trend,
  trendDirection, // "up" | "down" | "neutral"
  icon,
  iconColor,
  color = "#337418",
  bg,
  viewAllLink,
  linkText = "View All",
  onClick,
  style = {},
  className = "",
}) {
  const activeColor = iconColor || color;
  const isDown =
    trendDirection === "down" ||
    (trend && (trend.includes("-") || trend.toLowerCase().includes("down") || trend.toLowerCase().includes("loss")));
  const isUp =
    trendDirection === "up" ||
    (trend && (trend.includes("+") || trend.toLowerCase().includes("up") || trend.toLowerCase().includes("profit")));

  const trendBg = isDown
    ? "rgba(220, 38, 38, 0.1)"
    : isUp
    ? "rgba(16, 185, 129, 0.12)"
    : "var(--canvas)";
  const trendTextColor = isDown
    ? "#DC2626"
    : isUp
    ? "#059669"
    : "var(--muted)";

  return (
    <div
      onClick={onClick}
      className={`stat-card-root ${onClick ? "stat-card-clickable" : ""} ${className}`}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: 14,
        padding: "16px 18px",
        boxShadow: "var(--shadow-sm)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 12,
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        position: "relative",
        overflow: "hidden",
        minHeight: 110,
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "var(--shadow-md)";
        e.currentTarget.style.borderColor = "var(--line-strong)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "var(--shadow-sm)";
        e.currentTarget.style.borderColor = "var(--line)";
      }}
    >
      {/* Top Subtle Color Accent Bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: activeColor,
          opacity: 0.85,
        }}
      />

      {/* Main Header: Label & Icon */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span
            style={{
              fontSize: 11.5,
              fontWeight: 700,
              color: "var(--muted)",
              letterSpacing: "0.2px",
              textTransform: "uppercase",
              display: "block",
              lineHeight: 1.35,
            }}
          >
            {label}
          </span>
          <div
            style={{
              fontSize: "clamp(1.2rem, 1.4vw, 1.45rem)",
              fontWeight: 800,
              color: "var(--ink)",
              letterSpacing: "-0.02em",
              marginTop: 6,
              lineHeight: 1.15,
              wordBreak: "break-word",
            }}
          >
            {value}
          </div>
          {sub && (
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2, fontWeight: 500 }}>
              {sub}
            </div>
          )}
        </div>

        {/* Sober Pastel Icon Pill */}
        {icon && (
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: bg || `${activeColor}15`,
              color: activeColor,
              border: `1px solid ${activeColor}2A`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            {typeof icon === "string" ? <i className={icon} /> : icon}
          </div>
        )}
      </div>

      {/* Bottom Footer: Trend Pill & Optional Action Link */}
      {(trend || viewAllLink || onClick) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            paddingTop: 8,
            borderTop: "1px solid var(--line)",
            fontSize: 11,
            marginTop: "auto",
          }}
        >
          {trend ? (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "2px 7px",
                borderRadius: 6,
                background: trendBg,
                color: trendTextColor,
                fontWeight: 700,
                fontSize: 10.5,
              }}
            >
              {isUp && <i className="ri-arrow-up-line" style={{ fontSize: 10 }} />}
              {isDown && <i className="ri-arrow-down-line" style={{ fontSize: 10 }} />}
              {!isUp && !isDown && <i className="ri-information-line" style={{ fontSize: 10 }} />}
              <span>{trend}</span>
            </span>
          ) : (
            <span />
          )}

          {(viewAllLink || onClick) && (
            <span
              style={{
                fontWeight: 700,
                color: "var(--primary)",
                display: "inline-flex",
                alignItems: "center",
                gap: 2,
                fontSize: 11,
              }}
            >
              {linkText}
              <i className="ri-arrow-right-s-line" style={{ fontSize: 12 }} />
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(StatCard);
