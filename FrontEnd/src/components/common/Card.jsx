export default function Card({
  title,
  subtitle,
  icon,
  right,
  footer,
  accent, // Optional top border accent color e.g. "#F2C900", "#5DD62C"
  variant = "default", // "default" | "yellow"
  hover = false,
  children,
  style = {},
  className = "",
  bodyStyle = {},
  headerStyle = {},
}) {
  const hasHeader = Boolean(title || subtitle || right || icon);
  const isYellow = variant === "yellow";

  return (
    <div
      className={`app-card ${hover ? "hover-card" : ""} ${isYellow ? "section-bg-yellow" : ""} ${className}`}
      style={{
        background: isYellow ? "rgba(242, 201, 0, 0.5)" : "var(--surface)",
        border: isYellow ? "1px solid rgba(242, 201, 0, 0.6)" : "1px solid var(--line)",
        borderRadius: 18,
        boxShadow: isYellow ? "0 4px 14px rgba(242, 201, 0, 0.15)" : "var(--shadow-sm)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        boxSizing: "border-box",
        ...(accent ? { borderTop: `3px solid ${accent}` } : {}),
        ...style,
      }}
    >
      {hasHeader && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px 14px",
            borderBottom: isYellow ? "1px dashed rgba(0, 0, 0, 0.15)" : "1px solid var(--line)",
            gap: 12,
            flexWrap: "wrap",
            ...headerStyle,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {icon && (
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: isYellow ? "#FFFFFF" : "var(--primary-tint)",
                  color: isYellow ? "#0F0F0F" : "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  flexShrink: 0,
                  boxShadow: isYellow ? "0 2px 6px rgba(0, 0, 0, 0.08)" : "none",
                }}
              >
                {typeof icon === "string" ? <i className={icon} /> : icon}
              </div>
            )}
            <div>
              {title && (
                <h3
                  style={{
                    margin: 0,
                    fontSize: 14.5,
                    fontWeight: 800,
                    color: isYellow ? "#0F0F0F" : "var(--ink)",
                    letterSpacing: 0.1,
                  }}
                >
                  {title}
                </h3>
              )}
              {subtitle && (
                <p style={{ margin: "2px 0 0", fontSize: 12, color: isYellow ? "rgba(15, 15, 15, 0.75)" : "var(--muted)", lineHeight: 1.3 }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {right && <div style={{ display: "flex", alignItems: "center", gap: 8 }}>{right}</div>}
        </div>
      )}

      {/* Card Body */}
      <div style={{ padding: "18px 20px", flex: 1, ...bodyStyle }}>
        {children}
      </div>

      {/* Card Footer */}
      {footer && (
        <div
          style={{
            padding: "12px 20px",
            borderTop: "1px solid var(--line)",
            background: "var(--canvas)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}
