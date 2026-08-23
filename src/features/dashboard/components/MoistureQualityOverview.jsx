import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
function LucideIconWrapper({ children, size }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: size, height: size, flexShrink: 0 }}>
      {children}
    </span>
  );
}



export default function MoistureQualityOverview({
  average = 18.2,
  threshold = 20,
  unit = "%",
  rejectionLimit = 28,
  ashAverage = 18.5,
  ashThreshold = 20,
  balingYieldPct = 92,
}) {
  const navigate = useNavigate();

  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  // Maximum scale is 35% for visualization
  const maxScale = 35;
  const pct = Math.min(average / maxScale, 1);
  const offset = circumference * (1 - pct);

  const isOverThreshold = average > threshold;
  const isCritical = average >= rejectionLimit;

  // Arc color logic
  let gaugeColor = "#10B981"; // Normal safe
  let statusText = "OPTIMAL QUALITY (WITHIN LIMIT)";
  let statusBg = "#ECFDF5";
  let statusBorder = "#A7F3D0";
  let statusColor = "#047857";

  if (isCritical) {
    gaugeColor = "#EF4444";
    statusText = "CRITICAL / REJECTION RISK";
    statusBg = "#FEE2E2";
    statusBorder = "#FCA5A5";
    statusColor = "#991B1B";
  } else if (isOverThreshold) {
    gaugeColor = "#F59E0B";
    statusText = "DEDUCTION SLAB ACTIVE";
    statusBg = "#FFFBEB";
    statusBorder = "#FDE68A";
    statusColor = "#B45309";
  }

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: 18,
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        height: "100%",
        boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.04)",
      }}
    >
      {/* Title */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 900, color: "var(--ink)", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#2563EB" }}>💧</span> Moisture & Quality Telemetry
          </h3>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>Direct Inflow GRN Quality Testing</span>
        </div>
        <button
          type="button"
          onClick={() => navigate("/biomass/processing")}
          style={{
            border: "none",
            background: "transparent",
            fontSize: 11,
            fontWeight: 800,
            color: "#2563EB",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          Calculator →
        </button>
      </div>

      {/* Main Gauge & Threshold Summary */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        {/* Radial SVG Ring */}
        <div style={{ position: "relative", width: 116, height: 116, flexShrink: 0 }}>
          <svg width="116" height="116" viewBox="0 0 116 116">
            {/* Background Track */}
            <circle
              cx="58"
              cy="58"
              r={radius}
              fill="none"
              stroke="var(--line)"
              strokeWidth="10"
            />
            {/* Progress Arc */}
            <circle
              cx="58"
              cy="58"
              r={radius}
              fill="none"
              stroke={gaugeColor}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform="rotate(-90 58 58)"
              style={{ transition: "stroke-dashoffset 0.8s ease" }}
            />
            {/* Inner text */}
            <text
              x="58"
              y="54"
              textAnchor="middle"
              fontSize="20"
              fontWeight="900"
              fill="var(--ink)"
              letterSpacing="-0.03em"
            >
              {average}{unit}
            </text>
            <text
              x="58"
              y="70"
              textAnchor="middle"
              fontSize="9"
              fontWeight="800"
              fill="var(--muted)"
              letterSpacing="0.4"
            >
              AVG MOISTURE
            </text>
          </svg>
        </div>

        {/* Quality Status Description */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Standard Target:</span>
            <strong style={{ fontSize: 13, color: "var(--ink)" }}>{threshold}{unit} max</strong>
          </div>

          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Rejection Threshold:</span>
            <strong style={{ fontSize: 13, color: "#EF4444" }}>&gt; {rejectionLimit}{unit}</strong>
          </div>

          <div style={{ marginTop: 10 }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                background: statusBg,
                color: statusColor,
                border: `1px solid ${statusBorder}`,
                padding: "4px 10px",
                borderRadius: 20,
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <LucideIconWrapper size={9}>
                <ShieldCheck size={9} />
              </LucideIconWrapper>
              {statusText}
            </span>
          </div>
        </div>
      </div>

      {/* Quality Specs Mini Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 8,
          background: "var(--canvas)",
          padding: 10,
          borderRadius: 12,
          border: "1px solid var(--line)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Avg Ash %</div>
          <div style={{ fontSize: 13, fontWeight: 900, color: "var(--ink)", marginTop: 2 }}>{ashAverage}%</div>
          <div style={{ fontSize: 9.5, color: "#059669", fontWeight: 700 }}>Norm: {ashThreshold}%</div>
        </div>

        <div style={{ textAlign: "center", borderLeft: "1px solid var(--line)", borderRight: "1px solid var(--line)" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Baling Yield</div>
          <div style={{ fontSize: 13, fontWeight: 900, color: "var(--ink)", marginTop: 2 }}>{balingYieldPct}%</div>
          <div style={{ fontSize: 9.5, color: "#2563EB", fontWeight: 700 }}>High Density</div>
        </div>

        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Formula</div>
          <div style={{ fontSize: 13, fontWeight: 900, color: "var(--ink)", marginTop: 2 }}>GRN Wt</div>
          <div style={{ fontSize: 9.5, color: "#7E22CE", fontWeight: 700 }}>Standardized</div>
        </div>
      </div>
    </div>
  );
}
