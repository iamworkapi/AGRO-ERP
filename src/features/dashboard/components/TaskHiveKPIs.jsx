import { Tractor, ClipboardCheck, IndianRupee, Boxes } from "lucide-react";
function LucideIconWrapper({ children, size }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: size, height: size, flexShrink: 0 }}>
      {children}
    </span>
  );
}



export default function TaskHiveKPIs({
  totalInflowMt = 420.5,
  completedInflowMt = 280.0,
  inTransitMt = 140.5,
  totalSlips = 352,
  completedSlips = 298,
  pendingSlips = 54,
  totalRevenue = 94250,
  lastWeekRevenue = 81850,
  totalStockMt = 4820,
  lastWeekStockMt = 4110,
}) {
  const cards = [
    {
      id: "inflow",
      title: "Total Sourcing Inflow",
      value: `${totalInflowMt.toFixed(1)} MT`,
      trend: "↑ 20%",
      trendColor: "#059669",
      Icon: Tractor,
      iconBg: "linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)",
      iconShadow: "rgba(124, 58, 237, 0.3)",
      footers: [
        { label: `${completedInflowMt.toFixed(0)} MT Processed`, dotColor: "#10B981" },
        { label: `${inTransitMt.toFixed(1)} MT In Progress`, dotColor: "#3B82F6" },
      ],
    },
    {
      id: "slips",
      title: "Weighbridge Slips",
      value: totalSlips.toString(),
      trend: "↑ 18.4%",
      trendColor: "#059669",
      Icon: ClipboardCheck,
      iconBg: "linear-gradient(135deg, #2563EB 0%, #38BDF8 100%)",
      iconShadow: "rgba(37, 99, 235, 0.3)",
      footers: [
        { label: `${completedSlips} Completed`, dotColor: "#10B981" },
        { label: `${pendingSlips} Pending`, dotColor: "#F59E0B" },
      ],
    },
    {
      id: "revenue",
      title: "Procurement Payout",
      value: `₹${totalRevenue.toLocaleString("en-IN")}`,
      trend: "↑ 15.2%",
      trendColor: "#059669",
      Icon: IndianRupee,
      iconBg: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
      iconShadow: "rgba(5, 150, 105, 0.3)",
      comparison: `vs last week ₹${lastWeekRevenue.toLocaleString("en-IN")}`,
    },
    {
      id: "storage",
      title: "Yard Stored Stock",
      value: `${totalStockMt.toLocaleString("en-IN")} MT`,
      trend: "↑ 12.6%",
      trendColor: "#059669",
      Icon: Boxes,
      iconBg: "linear-gradient(135deg, #D97706 0%, #F59E0B 100%)",
      iconShadow: "rgba(217, 119, 6, 0.3)",
      comparison: `vs last week ${lastWeekStockMt.toLocaleString("en-IN")} MT`,
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 14,
      }}
      className="responsive-grid-2"
    >
      {cards.map((c) => (
        <div
          key={c.id}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 16,
            padding: "16px 18px",
            boxShadow: "0 4px 16px -2px rgba(5, 31, 32, 0.04)",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 10px 24px -4px rgba(5, 31, 32, 0.08)";
            e.currentTarget.style.borderColor = "var(--line-strong)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 16px -2px rgba(5, 31, 32, 0.04)";
            e.currentTarget.style.borderColor = "var(--line)";
          }}
        >
          {/* Top Row: Icon Box on Left, Value & Trend on Right */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            {/* Square Icon Box */}
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 12,
                background: c.iconBg,
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                boxShadow: `0 6px 16px ${c.iconShadow}`,
                flexShrink: 0,
              }}
            >
              <LucideIconWrapper size={14}>
                <c.Icon size={14} />
              </LucideIconWrapper>
            </div>

            {/* Title, Value and Trend Badge */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: "var(--muted)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {c.title}
              </div>

              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 3 }}>
                <span
                  style={{
                    fontSize: 22,
                    fontWeight: 900,
                    color: "var(--ink)",
                    letterSpacing: "-0.03em",
                    lineHeight: 1.1,
                  }}
                >
                  {c.value}
                </span>

                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: c.trendColor,
                    background: "rgba(16, 185, 129, 0.12)",
                    padding: "1.5px 6px",
                    borderRadius: 6,
                    border: "1px solid rgba(16, 185, 129, 0.25)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {c.trend}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Row: Breakdown Dots or Comparison Text */}
          <div
            style={{
              paddingTop: 10,
              borderTop: "1px solid var(--line)",
              fontSize: 11,
              color: "var(--muted)",
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            {c.footers ? (
              c.footers.map((f, i) => (
                <div key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: f.dotColor,
                    }}
                  />
                  <span>{f.label}</span>
                </div>
              ))
            ) : (
              <span style={{ color: "var(--muted)" }}>{c.comparison}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
