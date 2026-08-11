export default function Card({ title, subtitle, icon, right, children, style, className = "" }) {
  const titleNode =
    title || right || subtitle ? (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {icon && (
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--primary-tint)", color: "var(--primary-deep)", display: "flex", alignItems: "center", justify: "center", fontSize: 13, flexShrink: 0 }}>
              <i className={icon} style={{ display: "inline-flex", alignItems: "center", justify: "center", width: 14, height: 14 }} />
            </div>
          )}
          <div>
            {title && <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", letterSpacing: 0.1, display: "block" }}>{title}</span>}
            {subtitle && <span style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 400 }}>{subtitle}</span>}
          </div>
        </div>
        {right}
      </div>
    ) : null;

  return (
    <div className={`app-card ${className}`} style={style}>
      {titleNode && (
        <div style={{ padding: "14px 18px 12px", borderBottom: "1px solid var(--line)" }}>
          {titleNode}
        </div>
      )}
      <div style={{ padding: "16px 18px" }}>
        {children}
      </div>
    </div>
  );
}
