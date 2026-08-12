import { ChevronsLeft, ChevronsRight } from "./icons";

export default function SidebarHeader({ collapsed, onToggleCollapse }) {
  return (
    <div
      style={{
        padding: collapsed ? "20px 14px 18px" : "20px 18px 18px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "space-between",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
        <div
          style={{
            width: 34,
            height: 34,
            flexShrink: 0,
            background: "var(--gradient-primary)",
            borderRadius: 9,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: 800,
            fontSize: 17,
            boxShadow: "0 3px 12px rgba(0, 184, 107, 0.4)",
          }}
        >
          <i className="fa-solid fa-wheat-awn" style={{ fontSize: 17 }} />
        </div>
        {!collapsed && (
          <div>
            <p
              style={{
                margin: 0,
                fontWeight: 800,
                fontSize: 17.5,
                color: "white",
                whiteSpace: "nowrap",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              PRALLI ERP
            </p>
            <span style={{ fontSize: 10, color: "rgba(255, 255, 255, 0.55)", fontWeight: 600, letterSpacing: "0.02em" }}>
              Kusumganga Agro Solutions
            </span>
          </div>
        )}
      </div>

      {!collapsed && (
        <button
          onClick={onToggleCollapse}
          title="Collapse sidebar"
          style={{
            width: 28,
            height: 28,
            borderRadius: 7,
            border: "1px solid rgba(255, 255, 255, 0.12)",
            background: "rgba(255, 255, 255, 0.05)",
            color: "var(--sidebar-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
            transition: "all var(--transition-fast)",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.14)";
            e.currentTarget.style.color = "white";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
            e.currentTarget.style.color = "var(--sidebar-muted)";
          }}
        >
          <ChevronsLeft size={15} />
        </button>
      )}

      {collapsed && (
        <button
          onClick={onToggleCollapse}
          title="Expand sidebar"
          style={{
            position: "absolute",
            right: -12,
            top: 24,
            width: 24,
            height: 24,
            borderRadius: "50%",
            border: "1px solid rgba(255, 255, 255, 0.18)",
            background: "#07281D",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 20,
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.35)",
            transition: "all var(--transition-fast)",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "var(--primary-deep)";
            e.currentTarget.style.transform = "scale(1.1)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "#07281D";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <ChevronsRight size={13} />
        </button>
      )}
    </div>
  );
}

