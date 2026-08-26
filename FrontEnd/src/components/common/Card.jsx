export default function Card({
  title,
  subtitle,
  icon,
  right,
  footer,
  accent, // Optional top border accent color e.g. "#5DD62C", "#FFB800", "#00D2FF"
  hover = false,
  children,
  style = {},
  className = "",
  bodyStyle = {},
  headerStyle = {},
}) {
  const hasHeader = Boolean(title || subtitle || right || icon);

  return (
    <div
      className={`app-card ${hover ? "hover-card" : ""} ${className}`}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: 18,
        boxShadow: "var(--shadow-sm)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
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
            borderBottom: "1px solid var(--line)",
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
                  background: "var(--primary-tint)",
                  color: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  flexShrink: 0,
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
                    color: "var(--ink)",
                    letterSpacing: 0.1,
                  }}
                >
                  {title}
                </h3>
              )}
              {subtitle && (
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--muted)", lineHeight: 1.3 }}>
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
