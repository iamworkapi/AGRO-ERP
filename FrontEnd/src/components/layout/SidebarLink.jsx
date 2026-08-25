import { Link } from "react-router-dom";

// Most sub-items describe what lives inside a module's single-page view
// (no distinct route per section), so `active` is only meaningful for
// groups whose sections resolve to genuinely different paths - see
// SidebarGroup's hasDistinctPaths check.
export default function SidebarLink({ to, label, active }) {
  return (
    <Link
      to={to}
      title={label}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        margin: "1px 8px 1px 0",
        borderRadius: 6,
        textDecoration: "none",
        fontSize: 12.5,
        fontWeight: active ? 600 : 400,
        color: active ? "white" : "rgba(255, 255, 255, 0.65)",
        background: active ? "rgba(0, 184, 107, 0.12)" : "transparent",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        transition: "all var(--transition-fast)",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.color = "white";
        if (!active) e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.color = active ? "white" : "rgba(255, 255, 255, 0.65)";
        e.currentTarget.style.background = active ? "rgba(0, 184, 107, 0.12)" : "transparent";
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: active ? "#33C689" : "rgba(255, 255, 255, 0.25)",
          flexShrink: 0,
          boxShadow: active ? "0 0 6px #33C689" : "none",
          transition: "all var(--transition-fast)",
        }}
      />
      <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
    </Link>
  );
}
