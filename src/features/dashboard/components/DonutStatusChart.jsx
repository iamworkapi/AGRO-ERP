export default function DonutStatusChart({
  totalStockMt = 4820,
}) {
  const segments = [
    { label: "Paddy Straw", value: 1850, pct: 38.4, color: "#6366F1" }, // Indigo / Blue
    { label: "Maize Stalk", value: 1420, pct: 29.5, color: "#38BDF8" }, // Sky Blue
    { label: "Wheat Straw", value: 1150, pct: 23.8, color: "#F59E0B" }, // Amber Orange
    { label: "Mustard Husk", value: 400, pct: 8.3, color: "#10B981" }, // Emerald Green
  ];

  const size = 130;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: 16,
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        boxShadow: "0 4px 16px -2px rgba(5, 31, 32, 0.04)",
        height: "100%",
      }}
    >
      {/* Title Header */}
      <div>
        <h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 800, color: "var(--ink)" }}>
          Stock by Commodity
        </h3>
        <span style={{ fontSize: 11, color: "var(--muted)" }}>Yard volume breakdown across crop types</span>
      </div>

      {/* Donut Chart and Legend Side-by-Side */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        {/* SVG Donut */}
        <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Background Circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="var(--line)"
              strokeWidth={strokeWidth}
            />

            {/* Segment Arcs */}
            {segments.map((seg, idx) => {
              const dashArray = `${(seg.pct / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -currentOffset;
              currentOffset += (seg.pct / 100) * circumference;

              return (
                <circle
                  key={idx}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={dashArray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="butt"
                  transform={`rotate(-90 ${size / 2} ${size / 2})`}
                  style={{ transition: "stroke-dasharray 0.5s ease" }}
                />
              );
            })}
          </svg>

          {/* Center Text */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 900,
                color: "var(--ink)",
                lineHeight: 1,
                letterSpacing: "-0.02em",
              }}
            >
              {totalStockMt.toLocaleString("en-IN")}
            </div>
            <div
              style={{
                fontSize: 9,
                fontWeight: 800,
                color: "var(--muted)",
                textTransform: "uppercase",
                marginTop: 2,
              }}
            >
              Total MT
            </div>
          </div>
        </div>

        {/* Legend Breakdown */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, minWidth: 0 }}>
          {segments.map((seg, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: 11.5,
                color: "var(--ink)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: seg.color,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    color: "var(--ink)",
                    fontWeight: 600,
                  }}
                >
                  {seg.label}
                </span>
              </div>

              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", flexShrink: 0 }}>
                {seg.value.toLocaleString("en-IN")} MT ({seg.pct}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
