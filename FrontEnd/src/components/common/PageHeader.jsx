import { useLocation } from "react-router-dom";
import Breadcrumb from "./Breadcrumb";
import { resolveBreadcrumb } from "../../utils/breadcrumb";

export default function PageHeader({
  title,
  subtitle,
  icon,
  badge,
  badgeTone = "success",
  location: locationText,
  breadcrumb,
  action,
  actions,
  children,
  stats = [],
  style = {},
  className = "",
}) {
  const routerLocation = useLocation();
  const trail = breadcrumb || (title ? resolveBreadcrumb(routerLocation.pathname, title) : null);
  const actionContent = actions || action || children;

  // Auto-detect a suitable icon if none passed based on pathname or title
  const resolvedIcon =
    icon ||
    (() => {
      const path = routerLocation.pathname.toLowerCase();
      if (path.includes("weighment")) return "ri-scales-3-line";
      if (path.includes("warehouse")) return "ri-building-line";
      if (path.includes("inventory") || path.includes("storage")) return "ri-stack-line";
      if (path.includes("dispatch") || path.includes("truck")) return "ri-truck-fast-line";
      if (path.includes("collection") || path.includes("procurement")) return "ri-truck-line";
      if (path.includes("buyer") || path.includes("customer")) return "ri-user-star-line";
      if (path.includes("vendor")) return "ri-store-2-line";
      if (path.includes("employee") || path.includes("attendance")) return "ri-team-line";
      if (path.includes("setting") || path.includes("profile")) return "ri-settings-4-line";
      if (path.includes("report") || path.includes("mis")) return "ri-file-chart-line";
      if (path.includes("alert")) return "ri-notification-3-line";
      return "ri-command-line";
    })();

  const toneConfig = {
    success: {
      bg: "rgba(93, 214, 44, 0.12)",
      text: "var(--primary)",
      border: "rgba(93, 214, 44, 0.3)",
      dot: "#5DD62C",
    },
    warning: {
      bg: "rgba(255, 184, 0, 0.12)",
      text: "#D97706",
      border: "rgba(255, 184, 0, 0.3)",
      dot: "#FFB800",
    },
    info: {
      bg: "rgba(0, 210, 255, 0.12)",
      text: "#00D2FF",
      border: "rgba(0, 210, 255, 0.3)",
      dot: "#00D2FF",
    },
    purple: {
      bg: "rgba(168, 85, 247, 0.12)",
      text: "#A855F7",
      border: "rgba(168, 85, 247, 0.3)",
      dot: "#A855F7",
    },
  }[badgeTone] || {
    bg: "rgba(93, 214, 44, 0.12)",
    text: "var(--primary)",
    border: "rgba(93, 214, 44, 0.3)",
    dot: "#5DD62C",
  };

  return (
    <div
      className={`app-page-header app-card ${className}`}
      style={{
        background: "linear-gradient(135deg, var(--surface) 0%, var(--canvas) 100%)",
        border: "1px solid var(--line)",
        borderRadius: 16,
        padding: "12px 18px",
        boxShadow: "var(--shadow-sm)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      {/* Background Geometric Dot Matrix */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(var(--primary) 1.2px, transparent 1.2px)`,
          backgroundSize: "20px 20px",
          opacity: 0.08,
          pointerEvents: "none",
        }}
      />

      {/* Subtle Ambient Corner Light */}
      <div
        style={{
          position: "absolute",
          right: -30,
          top: -30,
          width: 140,
          height: 140,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(93, 214, 44, 0.16) 0%, transparent 70%)",
          filter: "blur(18px)",
          pointerEvents: "none",
        }}
      />

      {/* Left: Icon Tile + Title & Metadata */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative", zIndex: 1, minWidth: 0, flex: 1 }}>
        {/* Glow Icon Tile */}
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 11,
            background: "linear-gradient(135deg, rgba(93, 214, 44, 0.18) 0%, rgba(51, 116, 24, 0.1) 100%)",
            color: "var(--primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 19,
            flexShrink: 0,
            border: "1px solid rgba(93, 214, 44, 0.35)",
            boxShadow: "0 0 14px rgba(93, 214, 44, 0.15)",
            position: "relative",
          }}
        >
          <i className={resolvedIcon} />
          <span
            style={{
              position: "absolute",
              bottom: -1,
              right: -1,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#5DD62C",
              border: "1.5px solid var(--surface)",
              boxShadow: "0 0 6px #5DD62C",
            }}
          />
        </div>

        {/* Text Details */}
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <h1
              style={{
                margin: 0,
                fontSize: 16.5,
                fontWeight: 800,
                color: "var(--ink)",
                letterSpacing: "-0.015em",
                lineHeight: 1.2,
              }}
            >
              {title}
            </h1>

            {badge && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "2px 8px",
                  borderRadius: 12,
                  fontSize: 10,
                  fontWeight: 800,
                  background: toneConfig.bg,
                  color: toneConfig.text,
                  border: `1px solid ${toneConfig.border}`,
                  letterSpacing: "0.02em",
                }}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: toneConfig.dot,
                    boxShadow: `0 0 6px ${toneConfig.dot}`,
                  }}
                />
                {badge}
              </span>
            )}
          </div>

          {(subtitle || locationText) && (
            <p
              style={{
                margin: "3px 0 0",
                fontSize: 11.5,
                color: "var(--muted)",
                lineHeight: 1.3,
                display: "flex",
                alignItems: "center",
                gap: 6,
                flexWrap: "wrap",
              }}
            >
              {locationText && (
                <>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontWeight: 600, color: "var(--ink-secondary)" }}>
                    <i className="ri-map-pin-2-line" style={{ color: "var(--primary)", fontSize: 12 }} />
                    {locationText}
                  </span>
                  {subtitle && <span style={{ opacity: 0.35 }}>•</span>}
                </>
              )}
              {subtitle && <span>{subtitle}</span>}
            </p>
          )}
        </div>
      </div>

      {/* Right: Breadcrumb / Location Trail */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, flexWrap: "wrap", position: "relative", zIndex: 1, marginLeft: "auto" }}>
        {trail && <Breadcrumb items={trail} />}
      </div>

      {/* Optional Secondary Row: Mini Stats */}
      {stats.length > 0 && (
        <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", paddingTop: 4, position: "relative", zIndex: 1 }}>
          {stats.map((s, idx) => (
            <div
              key={idx}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "var(--canvas)",
                border: "1px solid var(--line)",
                borderRadius: 8,
                padding: "3px 9px",
                fontSize: 11,
              }}
            >
              {s.icon && <i className={s.icon} style={{ color: s.color || "var(--primary)", fontSize: 12 }} />}
              <span style={{ color: "var(--muted)", fontWeight: 600 }}>{s.label}:</span>
              <strong style={{ color: s.color || "var(--ink)", fontWeight: 800 }}>{s.value}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
