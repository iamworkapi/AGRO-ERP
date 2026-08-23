import { useNavigate } from "react-router-dom";
import { Tractor, Scale, Warehouse, Truck, Workflow, ArrowRight, ExternalLink } from "lucide-react";
function LucideIconWrapper({ children, size }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: size, height: size, flexShrink: 0 }}>
      {children}
    </span>
  );
}



export default function BiomassPipelineTracker({
  totalCollectedMt = 420.5,
  totalProcessedMt = 12.6,
  totalStoredMt = 4820.5,
  totalDispatchedMt = 43.5,
  activeStacksCount = 14,
  assignedHub = "Unnao Central Hub",
}) {
  const navigate = useNavigate();

  const stages = [
    {
      id: "stage1",
      number: "01",
      title: "Stage 1: Collection",
      label: "Village Sourcing Inflow",
      metric: `${totalCollectedMt.toFixed(1)} MT`,
      subtext: "Direct Farm-gate Harvest",
      Icon: Tractor,
      color: "#D97706",
      tint: "#FEF3C7",
      border: "#FDE68A",
      path: "/biomass/collection",
    },
    {
      id: "stage2",
      number: "02",
      title: "Stage 2: Processing",
      label: "Weighbridge GRN & Baling",
      metric: `${totalProcessedMt.toFixed(1)} MT`,
      subtext: "Moisture Tested & Baled",
      Icon: Scale,
      color: "#2563EB",
      tint: "#EFF6FF",
      border: "#BFDBFE",
      path: "/biomass/processing",
    },
    {
      id: "stage3",
      number: "03",
      title: "Stage 3: Storage",
      label: "Yard Stacking & Probes",
      metric: `${totalStoredMt.toLocaleString("en-IN")} MT`,
      subtext: `${activeStacksCount} Active Yard Stacks`,
      Icon: Warehouse,
      color: "#059669",
      tint: "#ECFDF5",
      border: "#A7F3D0",
      path: "/biomass/storage",
    },
    {
      id: "stage4",
      number: "04",
      title: "Stage 4: Dispatch",
      label: "Factory Deliveries & Off-take",
      metric: `${totalDispatchedMt.toFixed(1)} MT`,
      subtext: "Reliance / Power Units",
      Icon: Truck,
      color: "#7E22CE",
      tint: "#FAF5FF",
      border: "#E9D5FF",
      path: "/biomass/dispatch",
    },
  ];

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: 18,
        padding: "20px 22px",
        boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.04)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
              }}
            >
              <LucideIconWrapper size={13}>
                <Workflow size={13} />
              </LucideIconWrapper>
            </span>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 900, color: "var(--ink)" }}>
              Biomass Supply Chain 4-Stage Operational Pipeline
            </h3>
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                background: "#D1FAE5",
                color: "#047857",
                padding: "2px 8px",
                borderRadius: 10,
                border: "1px solid #A7F3D0",
              }}
            >
              Live Feed
            </span>
          </div>
          <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--muted)" }}>
            End-to-end harvest monitoring across Unnao & surrounding collection clusters for {assignedHub}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/biomass")}
          style={{
            padding: "6px 14px",
            fontSize: 11.5,
            fontWeight: 800,
            borderRadius: 8,
            border: "1px solid #10B981",
            background: "#ECFDF5",
            color: "#047857",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#10B981";
            e.currentTarget.style.color = "#FFFFFF";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#ECFDF5";
            e.currentTarget.style.color = "#047857";
          }}
        >
          <span>Open Full 4-Stage Tracker</span>
          <LucideIconWrapper size={11}>
            <ArrowRight size={11} />
          </LucideIconWrapper>
        </button>
      </div>

      {/* 4-Stage Connected Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
          position: "relative",
        }}
        className="responsive-grid-2"
      >
        {stages.map((stg, idx) => (
          <div
            key={stg.id}
            onClick={() => navigate(stg.path)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && navigate(stg.path)}
            style={{
              background: "var(--canvas)",
              border: `1.5px solid ${stg.border}`,
              borderRadius: 14,
              padding: "14px 16px",
              cursor: "pointer",
              transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.borderColor = stg.color;
              e.currentTarget.style.boxShadow = `0 8px 24px -4px ${stg.color}30`;
              e.currentTarget.style.background = "var(--surface)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = stg.border;
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.background = "var(--canvas)";
            }}
          >
            {/* Top row: Stage Tag & Icon */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 900,
                  textTransform: "uppercase",
                  color: stg.color,
                  letterSpacing: "0.4px",
                }}
              >
                {stg.title}
              </span>

              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: stg.tint,
                  color: stg.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  border: `1px solid ${stg.border}`,
                }}
              >
                <LucideIconWrapper size={14}>
                  <stg.Icon size={14} />
                </LucideIconWrapper>
              </div>
            </div>

            {/* Label and Metric */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)" }}>
                {stg.label}
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, color: stg.color, marginTop: 4 }}>
                {stg.metric}
              </div>
            </div>

            {/* Bottom Subtext */}
            <div
              style={{
                fontSize: 10.5,
                fontWeight: 600,
                color: "var(--muted)",
                borderTop: "1px dashed var(--line)",
                paddingTop: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>{stg.subtext}</span>
              <LucideIconWrapper size={9}>
                <ExternalLink size={9} />
              </LucideIconWrapper>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
