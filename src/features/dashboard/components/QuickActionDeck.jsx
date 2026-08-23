import { useNavigate } from "react-router-dom";
import { Scale, Tractor, Calculator, Boxes, Warehouse, Building2, Download, ChevronRight } from "lucide-react";
function LucideIconWrapper({ children, size }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: size, height: size, flexShrink: 0 }}>
      {children}
    </span>
  );
}



export default function QuickActionDeck({ isSupervisor, onOpenNewSlipModal }) {
  const navigate = useNavigate();

  const actions = isSupervisor
    ? [
        {
          label: "New Weighbridge Slip",
          subtitle: "Log Gross & Tare Weight",
          Icon: Scale,
          gradient: "linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)",
          bgTint: "#EFF6FF",
          border: "#BFDBFE",
          textColor: "#1D4ED8",
          onClick: () => navigate("/weighment/new"),
        },
        {
          label: "Sourcing Collection Entry",
          subtitle: "Farm-gate Inflow Record",
          Icon: Tractor,
          gradient: "linear-gradient(135deg, #065F46 0%, #10B981 100%)",
          bgTint: "#ECFDF5",
          border: "#A7F3D0",
          textColor: "#047857",
          onClick: () => navigate("/biomass/collection"),
        },
        {
          label: "Moisture & GRN Calculator",
          subtitle: "Lorry Deduction Testing",
          Icon: Calculator,
          gradient: "linear-gradient(135deg, #92400E 0%, #F59E0B 100%)",
          bgTint: "#FFFBEB",
          border: "#FDE68A",
          textColor: "#B45309",
          onClick: () => navigate("/biomass/processing"),
        },
        {
          label: "Yard Stacking & Probes",
          subtitle: "Bale Storage & Temp",
          Icon: Boxes,
          gradient: "linear-gradient(135deg, #6B21A8 0%, #A855F7 100%)",
          bgTint: "#FAF5FF",
          border: "#E9D5FF",
          textColor: "#7E22CE",
          onClick: () => navigate("/biomass/storage"),
        },
      ]
    : [
        {
          label: "Create Warehouse",
          subtitle: "New TCC / Storage Hub",
          Icon: Warehouse,
          gradient: "linear-gradient(135deg, #065F46 0%, #10B981 100%)",
          bgTint: "#ECFDF5",
          border: "#A7F3D0",
          textColor: "#047857",
          onClick: () => navigate("/warehouses/create"),
        },
        {
          label: "New Weighbridge Slip",
          subtitle: "Inbound / Outbound Slip",
          Icon: Scale,
          gradient: "linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)",
          bgTint: "#EFF6FF",
          border: "#BFDBFE",
          textColor: "#1D4ED8",
          onClick: () => navigate("/weighment/new"),
        },
        {
          label: "Register New Buyer",
          subtitle: "Industrial Off-Taker",
          Icon: Building2,
          gradient: "linear-gradient(135deg, #7E22CE 0%, #C084FC 100%)",
          bgTint: "#FAF5FF",
          border: "#E9D5FF",
          textColor: "#7E22CE",
          onClick: () => navigate("/biomass/buyers/create"),
        },
        {
          label: "Export MIS Reports",
          subtitle: "PDF / Excel Audit Sheets",
          Icon: Download,
          gradient: "linear-gradient(135deg, #9A3412 0%, #EA580C 100%)",
          bgTint: "#FFF7ED",
          border: "#FFEDD5",
          textColor: "#C2410C",
          onClick: () => navigate("/reports/export"),
        },
      ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 12,
      }}
      className="responsive-grid-2"
    >
      {actions.map((act, idx) => (
        <div
          key={idx}
          onClick={act.onClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && act.onClick()}
          style={{
            background: "var(--surface)",
            border: `1.5px solid ${act.border}`,
            borderRadius: 14,
            padding: "12px 14px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            cursor: "pointer",
            transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.08)";
            e.currentTarget.style.borderColor = act.textColor;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.03)";
            e.currentTarget.style.borderColor = act.border;
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: act.gradient,
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              boxShadow: `0 4px 12px ${act.textColor}35`,
              flexShrink: 0,
            }}
          >
            <LucideIconWrapper size={16}>
              <act.Icon size={16} />
            </LucideIconWrapper>
          </div>

          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: 12.5,
                fontWeight: 800,
                color: "var(--ink)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>{act.label}</span>
              <LucideIconWrapper size={10}>
                <ChevronRight size={10} />
              </LucideIconWrapper>
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--muted)",
                marginTop: 2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {act.subtitle}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
