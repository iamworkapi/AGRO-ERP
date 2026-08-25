const sparklines = {
  success: [20, 30, 25, 45, 35, 55, 50, 65, 60, 75],
  info: [40, 35, 50, 30, 55, 45, 60, 40, 65, 55],
  error: [30, 45, 40, 55, 50, 35, 60, 55, 70, 80],
  warning: [25, 20, 35, 30, 40, 35, 50, 45, 40, 55],
};

function Sparkline({ type = "success", color }) {
  const points = sparklines[type] || sparklines.success;
  const width = 120;
  const height = 40;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;

  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - ((p - min) / range) * (height - 4);
    return `${x},${y}`;
  });

  const pathD = coords.map((c, i) => (i === 0 ? `M${c}` : `L${c}`)).join(" ");
  // Area fill path
  const areaD = `${pathD} L${width},${height} L0,${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
      <defs>
        <linearGradient id={`grad-${type}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#grad-${type})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* End dot */}
      <circle cx={width} cy={height - ((points[points.length - 1] - min) / range) * (height - 4)} r="3" fill={color} />
    </svg>
  );
}

export default function LineStatCard({ label, value, trend, iconColor, iconBg, type = "success" }) {
  return (
    <div
      className="hover-lift"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: "var(--radius)",
        padding: "20px 24px",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        boxShadow: "var(--shadow-sm)",
        gap: 16,
        minHeight: 130,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: iconColor,
              fontSize: 16,
            }}
          >
            ●
          </div>
          <span style={{ fontSize: 14, color: "var(--ink-secondary)", fontWeight: 600 }}>{label}</span>
        </div>
        <p style={{ margin: 0, fontSize: 32, fontWeight: 700, color: "var(--ink)", letterSpacing: "-1px" }}>{value}</p>
        {trend && (
          <p style={{ margin: 0, fontSize: 12, fontWeight: 500, color: iconColor }}>{trend}</p>
        )}
      </div>
      <div style={{ flexShrink: 0, paddingTop: 24 }}>
        <Sparkline type={type} color={iconColor} />
      </div>
    </div>
  );
}
