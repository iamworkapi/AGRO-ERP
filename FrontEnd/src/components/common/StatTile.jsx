export default function StatTile({ icon, label, value }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
      <div
        style={{
          width: 36, height: 36, borderRadius: 9, flexShrink: 0,
          background: "var(--primary-tint)", color: "var(--primary-deep)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</p>
        <div style={{ marginTop: 3, fontSize: 15.5, fontWeight: 700, color: "var(--ink)" }}>{value}</div>
      </div>
    </div>
  );
}
