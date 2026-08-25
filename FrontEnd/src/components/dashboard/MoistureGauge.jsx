export default function MoistureGauge({ average, threshold, unit }) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(average / 40, 1);
  const offset = circumference * (1 - pct);
  const overThreshold = average > threshold;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <svg width="108" height="108" viewBox="0 0 108 108">
        <circle cx="54" cy="54" r={radius} fill="none" stroke="var(--line)" strokeWidth="8" />
        <circle
          cx="54" cy="54" r={radius} fill="none"
          stroke="var(--ink)"
          strokeOpacity={overThreshold ? 1 : 0.45}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 54 54)"
        />
        <text x="54" y="51" textAnchor="middle" fontSize="19" fontWeight="600" fill="var(--ink)">
          {average}{unit}
        </text>
        <text x="54" y="67" textAnchor="middle" fontSize="9" fill="var(--muted)" letterSpacing="0.3">
          AVG MOISTURE
        </text>
      </svg>
      <div>
        <p style={{ margin: 0, fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.4 }}>Standard threshold</p>
        <p style={{ margin: "4px 0 10px", fontSize: 19, fontWeight: 600, color: "var(--ink)" }}>{threshold}{unit}</p>
        <span style={{
          background: overThreshold ? "var(--status-solid-bg)" : "var(--status-outline-bg)",
          color: overThreshold ? "var(--status-solid-fg)" : "var(--status-outline-fg)",
          border: overThreshold ? "1px solid var(--status-solid-bg)" : "1px solid var(--status-outline-border)",
          fontSize: 10.5, fontWeight: 600, padding: "3px 9px", borderRadius: 3,
        }}>
          {overThreshold ? "DEDUCTION ACTIVE" : "WITHIN LIMIT"}
        </span>
      </div>
    </div>
  );
}
