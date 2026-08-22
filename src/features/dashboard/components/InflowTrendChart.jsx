import { useState } from "react";

export default function InflowTrendChart() {
  const [activePoint, setActivePoint] = useState(4); // Friday default
  const [timePeriod, setTimePeriod] = useState("This Week");

  const data = [
    { day: "Mon", value: 32, label: "May 12", metric: "32 MT Harvest Inflow" },
    { day: "Tue", value: 58, label: "May 13", metric: "58 MT Harvest Inflow" },
    { day: "Wed", value: 45, label: "May 14", metric: "45 MT Harvest Inflow" },
    { day: "Thu", value: 72, label: "May 15", metric: "72 MT Harvest Inflow" },
    { day: "Fri", value: 98, label: "May 16", metric: "98 MT Harvest Inflow" },
    { day: "Sat", value: 65, label: "May 17", metric: "65 MT Harvest Inflow" },
    { day: "Sun", value: 80, label: "May 18", metric: "80 MT Harvest Inflow" },
  ];

  // SVG dimensions
  const width = 460;
  const height = 180;
  const paddingX = 35;
  const paddingY = 25;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const maxValue = 120;

  // Calculate coordinates for points
  const points = data.map((d, index) => {
    const x = paddingX + (index / (data.length - 1)) * chartWidth;
    const y = height - paddingY - (d.value / maxValue) * chartHeight;
    return { x, y, ...d };
  });

  // Generate smooth cubic bezier SVG path
  const generatePath = () => {
    if (points.length === 0) return "";
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  const linePath = generatePath();
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  const currentActive = points[activePoint] || points[4];

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
        position: "relative",
      }}
    >
      {/* Header with Title and Week Dropdown */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 800, color: "var(--ink)" }}>
            Inflow & Weighment Overview
          </h3>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>Daily village farm-gate harvest tonnage</span>
        </div>

        <div
          style={{
            background: "var(--canvas)",
            border: "1px solid var(--line)",
            borderRadius: 8,
            padding: "4px 10px",
            fontSize: 11,
            fontWeight: 700,
            color: "var(--ink)",
            display: "flex",
            alignItems: "center",
            gap: 6,
            cursor: "pointer",
          }}
        >
          <span>{timePeriod}</span>
          <i className="fa-solid fa-chevron-down" style={{ fontSize: 9, color: "var(--muted)" }} />
        </div>
      </div>

      {/* SVG Chart Container */}
      <div style={{ position: "relative", width: "100%", height: 180 }}>
        {/* Active Point Floating Tooltip */}
        {currentActive && (
          <div
            style={{
              position: "absolute",
              left: `calc(${(currentActive.x / width) * 100}% - 55px)`,
              top: `${(currentActive.y / height) * 100 - 32}%`,
              background: "var(--palette-c1)",
              color: "#FFFFFF",
              padding: "4px 10px",
              borderRadius: 8,
              fontSize: 10.5,
              fontWeight: 700,
              boxShadow: "0 6px 16px rgba(5, 31, 32, 0.3)",
              pointerEvents: "none",
              zIndex: 10,
              whiteSpace: "nowrap",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 9.5, opacity: 0.8 }}>{currentActive.label}</div>
            <div style={{ fontWeight: 800, color: "var(--palette-c5)" }}>{currentActive.metric}</div>
          </div>
        )}

        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "100%", overflow: "visible" }}>
          <defs>
            <linearGradient id="inflowGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#235347" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#8EB69B" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid Lines */}
          {[0, 40, 80, 120].map((val) => {
            const y = height - paddingY - (val / maxValue) * chartHeight;
            return (
              <g key={val}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="var(--line)"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 10}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9.5"
                  fill="var(--muted)"
                  fontWeight="600"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={areaPath} fill="url(#inflowGradient)" />

          {/* Smooth Line */}
          <path
            d={linePath}
            fill="none"
            stroke="var(--palette-c4)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Data Points */}
          {points.map((p, idx) => {
            const isActive = activePoint === idx;
            return (
              <g key={idx} style={{ cursor: "pointer" }} onClick={() => setActivePoint(idx)}>
                {isActive && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="8"
                    fill="rgba(35, 83, 71, 0.25)"
                  />
                )}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isActive ? "5" : "3.5"}
                  fill="#FFFFFF"
                  stroke="var(--palette-c4)"
                  strokeWidth="2.5"
                />
                {/* X Axis Day Labels */}
                <text
                  x={p.x}
                  y={height - 6}
                  textAnchor="middle"
                  fontSize="10"
                  fill={isActive ? "var(--palette-c4)" : "var(--muted)"}
                  fontWeight={isActive ? "800" : "600"}
                >
                  {p.day}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
