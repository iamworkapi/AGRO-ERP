import { useLocation } from "react-router-dom";
import Breadcrumb from "./Breadcrumb";
import { resolveBreadcrumb } from "../../utils/breadcrumb";

const SPARKLE_ICONS = {
  weighment: "ri-scales-3-line",
  warehouse: "ri-building-line",
  inventory: "ri-stack-line",
  storage: "ri-stack-line",
  dispatch: "ri-truck-fast-line",
  truck: "ri-truck-fast-line",
  collection: "ri-truck-line",
  procurement: "ri-truck-line",
  buyer: "ri-user-star-line",
  customer: "ri-user-star-line",
  vendor: "ri-store-2-line",
  employee: "ri-team-line",
  attendance: "ri-team-line",
  setting: "ri-settings-4-line",
  profile: "ri-user-settings-line",
  report: "ri-file-chart-line",
  mis: "ri-file-chart-line",
  alert: "ri-notification-3-line",
  product: "ri-capsule-line",
  goods: "ri-file-list-3-line",
};

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
  const path = routerLocation.pathname.toLowerCase();

  const resolvedIcon =
    icon ||
    Object.entries(SPARKLE_ICONS).find(([key]) => path.includes(key))?.[1] ||
    "ri-command-line";

  const trail = breadcrumb || (title ? resolveBreadcrumb(routerLocation.pathname, title) : null);
  const actionContent = actions || action || children;

  return (
    <div
      className={`app-page-header ${className}`}
      style={{
        background: "linear-gradient(160deg, var(--surface) 0%, var(--canvas) 100%)",
        border: "1px solid var(--line)",
        borderRadius: 20,
        padding: 0,
        boxShadow: "var(--shadow-md)",
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      {/* Top accent bar */}
      <div
        style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 3,
          background: "linear-gradient(90deg, var(--primary) 0%, var(--primary-light) 60%, transparent 100%)",
        }}
      />

      {/* Animated dot grid */}
      <div
        style={{
          position: "absolute", inset: 0,
          backgroundImage: `radial-gradient(var(--primary) 1px, transparent 1px)`,
          backgroundSize: "18px 18px",
          opacity: 0.06,
          pointerEvents: "none",
          animation: "drift 60s linear infinite",
        }}
      />

      {/* Ambient glow blob */}
      <div
        style={{
          position: "absolute", right: -20, top: -20,
          width: 160, height: 160, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(93, 214, 44, 0.14) 0%, transparent 70%)",
          filter: "blur(20px)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 2, padding: "18px 22px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>

        {/* Left: Icon + Text */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0, flex: 1 }}>
          {/* Animated icon tile */}
          <div
            style={{
              width: 48, height: 48, borderRadius: 14, flexShrink: 0,
              background: "linear-gradient(135deg, rgba(93, 214, 44, 0.2) 0%, rgba(51, 116, 24, 0.12) 100%)",
              color: "var(--primary)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22,
              border: "1px solid rgba(93, 214, 44, 0.35)",
              boxShadow: "0 0 20px rgba(93, 214, 44, 0.15), 0 0 0 6px rgba(93, 214, 44, 0.04)",
              position: "relative",
              animation: "iconPulse 3s ease-in-out infinite",
            }}
          >
            <i className={resolvedIcon} style={{ position: "relative", zIndex: 1 }} />
            <span
              style={{
                position: "absolute", bottom: -2, right: -2,
                width: 10, height: 10, borderRadius: "50%",
                background: "#5DD62C", border: "2px solid var(--surface)",
                boxShadow: "0 0 8px #5DD62C",
              }}
            />
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h1
                style={{
                  margin: 0, fontSize: 19, fontWeight: 900,
                  background: "linear-gradient(135deg, var(--ink) 0%, var(--ink-secondary) 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                  letterSpacing: "-0.02em", lineHeight: 1.2,
                }}
              >
                {title}
              </h1>

              {badge && (
                <span
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "3px 10px", borderRadius: 20,
                    fontSize: 9.5, fontWeight: 800,
                    background: "var(--primary-tint)",
                    color: "var(--primary-deep)",
                    border: "1px solid rgba(93, 214, 44, 0.25)",
                    letterSpacing: "0.04em", textTransform: "uppercase",
                    boxShadow: "0 0 8px rgba(93, 214, 44, 0.1)",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--primary)", boxShadow: "0 0 5px var(--primary)" }} />
                  {badge}
                </span>
              )}
            </div>

            {subtitle && (
              <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--muted)", display: "flex", alignItems: "center", gap: 5, lineHeight: 1.3 }}>
                <i className="ri-information-line" style={{ fontSize: 12, opacity: 0.7 }} />
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: Breadcrumb + Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, flexWrap: "wrap" }}>
          {trail && <Breadcrumb items={trail} />}
          {actionContent && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {actionContent}
            </div>
          )}
        </div>
      </div>

      {/* Inline styles for animations */}
      <style>{`
        @keyframes drift {
          0% { transform: translate(0, 0); }
          50% { transform: translate(-10px, -8px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes iconPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(93,214,44,0.15), 0 0 0 6px rgba(93,214,44,0.04); }
          50% { box-shadow: 0 0 28px rgba(93,214,44,0.25), 0 0 0 8px rgba(93,214,44,0.06); }
        }
      `}</style>
    </div>
  );
}
