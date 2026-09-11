import { memo } from "react";

function StatCard({
  variant = "elevated",
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
  linkText = "View",
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
    ? "rgba(220, 38, 38, 0.08)"
    : isUp
    ? "rgba(16, 185, 129, 0.1)"
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
        borderRadius: 12,
        padding: "12px 14px 10px",
        boxShadow: "var(--shadow-sm)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 8,
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
        position: "relative",
        overflow: "hidden",
        minHeight: 88,
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
      {/* Top Subtle Color Accent Glow */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2.5,
          background: activeColor,
          opacity: 0.9,
        }}
      />

      {/* Main Header: Label, Icon & Value */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: activeColor,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                color: "var(--muted)",
                letterSpacing: "0.3px",
                textTransform: "uppercase",
                display: "block",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                lineHeight: 1.2,
              }}
            >
              {label}
            </span>
          </div>

          <div
            style={{
              fontSize: "clamp(1.15rem, 1.3vw, 1.35rem)",
              fontWeight: 800,
              color: "var(--ink)",
              letterSpacing: "-0.025em",
              marginTop: 4,
              lineHeight: 1.15,
              wordBreak: "break-word",
            }}
          >
            {value}
          </div>
          {sub && (
            <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 1, fontWeight: 500 }}>
              {sub}
            </div>
          )}
        </div>

        {/* Compact Icon Pill */}
        {icon && (
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: bg || `${activeColor}12`,
              color: activeColor,
              border: `1px solid ${activeColor}24`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 15,
              flexShrink: 0,
            }}
          >
            {typeof icon === "string" ? <i className={icon} /> : icon}
          </div>
        )}
      </div>

      {/* Bottom Footer: Compact Trend Pill & Optional Action Link */}
      {(trend || viewAllLink || onClick) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 6,
            paddingTop: 6,
            borderTop: "1px solid var(--line)",
            fontSize: 10.5,
            marginTop: "auto",
          }}
        >
          {trend ? (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
                padding: "1px 6px",
                borderRadius: 4,
                background: trendBg,
                color: trendTextColor,
                fontWeight: 700,
                fontSize: 10,
              }}
            >
              {isUp && <i className="ri-arrow-up-line" style={{ fontSize: 9 }} />}
              {isDown && <i className="ri-arrow-down-line" style={{ fontSize: 9 }} />}
              {!isUp && !isDown && <i className="ri-information-line" style={{ fontSize: 9 }} />}
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
                fontSize: 10.5,
              }}
            >
              {linkText}
              <i className="ri-arrow-right-s-line" style={{ fontSize: 11 }} />
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(StatCard);
