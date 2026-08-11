export default function RecentActivity({ items }) {
  const getIcon = (text) => {
    if (text.includes("approved") || text.includes("Weighment")) return { icon: "📝", bg: "#E5F8F0", color: "#00B86B" };
    if (text.includes("dispatched") || text.includes("Stock")) return { icon: "🚚", bg: "#EFF6FF", color: "#3B82F6" };
    if (text.includes("Moisture") || text.includes("deduction")) return { icon: "💧", bg: "#FEF3C7", color: "#D97706" };
    return { icon: "👤", bg: "#F3E8FF", color: "#8B5CF6" };
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((item, i) => {
        const style = getIcon(item.text);
        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              padding: "10px 12px",
              borderRadius: 10,
              background: "var(--canvas)",
              border: "1px solid var(--line)",
              transition: "all var(--transition-fast)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "white";
              e.currentTarget.style.boxShadow = "var(--shadow-sm)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--canvas)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: style.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 15,
                  flexShrink: 0,
                }}
              >
                {style.icon}
              </div>
              <p style={{ margin: 0, fontSize: 12.5, fontWeight: 600, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis" }}>
                {item.text}
              </p>
            </div>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500, whiteSpace: "nowrap", flexShrink: 0 }}>
              {item.time}
            </span>
          </div>
        );
      })}
    </div>
  );
}
