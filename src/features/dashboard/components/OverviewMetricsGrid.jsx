export default function OverviewMetricsGrid({ kpiCards = [] }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 14,
      }}
      className="responsive-grid-2"
    >
      {kpiCards.map((cfg, idx) => (
        <div
          key={cfg.label || idx}
          style={{
            background: "var(--surface)",
            border: `1px solid ${cfg.color}25`,
            borderRadius: 16,
            padding: "16px 18px",
            boxShadow: "0 4px 18px -2px rgba(0, 0, 0, 0.04)",
            position: "relative",
            overflow: "hidden",
            transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.boxShadow = `0 12px 28px -4px ${cfg.color}25`;
            e.currentTarget.style.borderColor = `${cfg.color}60`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 18px -2px rgba(0, 0, 0, 0.04)";
            e.currentTarget.style.borderColor = `${cfg.color}25`;
          }}
        >
          {/* Top glowing bar */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: cfg.accentGradient || cfg.color,
              boxShadow: `0 2px 10px ${cfg.color}50`,
            }}
          />

          {/* Header row: Label & Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: "var(--muted)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {cfg.label}
            </span>
            {cfg.badge && (
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 800,
                  padding: "2px 8px",
                  borderRadius: 12,
                  background: `${cfg.color}15`,
                  color: cfg.color,
                  border: `1px solid ${cfg.color}35`,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {cfg.badge}
              </span>
            )}
          </div>

          {/* Value and Icon */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: "var(--ink)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.15,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {cfg.value}
              </div>
              <div
                style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: "var(--muted)",
                  marginTop: 4,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {cfg.trend}
              </div>
            </div>

            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: `${cfg.color}15`,
                color: cfg.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                border: `1px solid ${cfg.color}30`,
                boxShadow: `0 0 16px ${cfg.color}25`,
                flexShrink: 0,
              }}
            >
              <i className={cfg.icon} />
            </div>
          </div>

          {/* Optional progress indicator */}
          {typeof cfg.progressPct === "number" && (
            <div
              style={{
                width: "100%",
                height: 5,
                background: "var(--line)",
                borderRadius: 3,
                marginTop: 14,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${Math.min(100, Math.max(0, cfg.progressPct))}%`,
                  height: "100%",
                  background: cfg.accentGradient || cfg.color,
                  borderRadius: 3,
                  boxShadow: `0 0 8px ${cfg.color}80`,
                  transition: "width 0.5s ease",
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
