import { Link } from "react-router-dom";

export default function SidebarLink({ to, label, active }) {
  return (
    <Link
      to={to}
      title={label}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "7px 10px",
        margin: "1px 8px 1px 0",
        borderRadius: 8,
        textDecoration: "none",
        fontSize: 12.5,
        fontWeight: active ? 700 : 500,
        color: active ? "#FFFFFF" : "rgba(248, 248, 248, 0.7)",
        background: active ? "rgba(93, 214, 44, 0.18)" : "transparent",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        transition: "all var(--transition-fast)",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.color = "#FFFFFF";
        if (!active) e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.color = active ? "#FFFFFF" : "rgba(248, 248, 248, 0.7)";
        e.currentTarget.style.background = active ? "rgba(93, 214, 44, 0.18)" : "transparent";
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: active ? "#5DD62C" : "rgba(248, 248, 248, 0.3)",
          flexShrink: 0,
          boxShadow: active ? "0 0 8px #5DD62C" : "none",
          transition: "all var(--transition-fast)",
        }}
      />
      <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
    </Link>
  );
}
