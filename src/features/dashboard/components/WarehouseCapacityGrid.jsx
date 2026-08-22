import { useNavigate } from "react-router-dom";

export default function WarehouseCapacityGrid({
  currentStockMt = 4820.5,
  capacityMt = 15000,
  totalBales = 16068,
  assignedHub = "Unnao Central Hub",
  fireSafetyScore = "98.5% (Safe)",
}) {
  const navigate = useNavigate();

  const utilPct = Math.min(100, Math.round((currentStockMt / capacityMt) * 100));
  const remainingMt = Math.max(0, capacityMt - currentStockMt);

  const zones = [
    { name: "Zone A", crop: "Paddy Straw", stockMt: "1,450 MT", bales: "4,830 Bales", temp: "28°C", status: "Normal", color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
    { name: "Zone B", crop: "Maize Stalk", stockMt: "2,120 MT", bales: "7,060 Bales", temp: "31°C", status: "Monitored", color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
    { name: "Zone C", crop: "Wheat Straw", stockMt: "1,250 MT", bales: "4,178 Bales", temp: "26°C", status: "Normal", color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
  ];

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: 18,
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        height: "100%",
        boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.04)",
      }}
    >
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 900, color: "var(--ink)", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#059669" }}>🏢</span> Yard Capacity & Thermal Telemetry
          </h3>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>{assignedHub} • 15,000 MT Transit Yard</span>
        </div>
        <button
          type="button"
          onClick={() => navigate("/biomass/storage")}
          style={{
            border: "none",
            background: "transparent",
            fontSize: 11,
            fontWeight: 800,
            color: "#059669",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          Yard View →
        </button>
      </div>

      {/* Storage Utilization Bar */}
      <div
        style={{
          background: "var(--canvas)",
          border: "1px solid var(--line)",
          borderRadius: 12,
          padding: "12px 14px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Current Yard Occupancy</span>
            <div style={{ fontSize: 16, fontWeight: 900, color: "#059669", marginTop: 2 }}>
              {currentStockMt.toLocaleString("en-IN")} MT <span style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>({totalBales.toLocaleString("en-IN")} Bales)</span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Available Headroom</span>
            <div style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)", marginTop: 2 }}>
              {remainingMt.toLocaleString("en-IN")} MT Free
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ width: "100%", height: 8, background: "var(--line)", borderRadius: 4, marginTop: 8, overflow: "hidden" }}>
          <div
            style={{
              width: `${utilPct}%`,
              height: "100%",
              background: "linear-gradient(90deg, #059669 0%, #10B981 100%)",
              borderRadius: 4,
              boxShadow: "0 0 8px rgba(16, 185, 129, 0.5)",
            }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 10.5, fontWeight: 700, color: "var(--muted)" }}>
          <span>0 MT</span>
          <span style={{ color: "#059669" }}>{utilPct}% Utilized</span>
          <span>{capacityMt.toLocaleString("en-IN")} MT Max</span>
        </div>
      </div>

      {/* Yard Zone Stack Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        {zones.map((z) => (
          <div
            key={z.name}
            style={{
              background: z.bg,
              border: `1px solid ${z.border}`,
              borderRadius: 10,
              padding: "8px 10px",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong style={{ fontSize: 11.5, color: "var(--ink)" }}>{z.name}</strong>
              <span style={{ fontSize: 9.5, fontWeight: 800, color: z.color }}>{z.temp}</span>
            </div>
            <div style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 600 }}>{z.crop}</div>
            <div style={{ fontSize: 12, fontWeight: 900, color: z.color, marginTop: 2 }}>{z.stockMt}</div>
          </div>
        ))}
      </div>

      {/* Fire Safety Banner */}
      <div
        style={{
          background: "#ECFDF5",
          border: "1px solid #A7F3D0",
          borderRadius: 10,
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <i className="fa-solid fa-shield-halved" style={{ color: "#059669", fontSize: 14 }} />
          <span style={{ fontSize: 11.5, fontWeight: 800, color: "#065F46" }}>
            Thermal Probe Safety Score: {fireSafetyScore}
          </span>
        </div>
        <span style={{ fontSize: 10, fontWeight: 800, background: "#059669", color: "#FFFFFF", padding: "2px 7px", borderRadius: 10 }}>
          ACTIVE
        </span>
      </div>
    </div>
  );
}
