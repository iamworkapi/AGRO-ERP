import { Link } from "react-router-dom";

export default function SidebarLink({ to, label, active }) {
  return (
    <Link
      to={to}
      title={label}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "4px 8px",
        margin: "1px 6px 1px 0",
        borderRadius: 6,
        textDecoration: "none",
        fontSize: 12,
        fontWeight: active ? 700 : 500,
        color: active ? "#FFFFFF" : "rgba(248, 248, 248, 0.7)",
        background: active ? "rgba(93, 214, 44, 0.18)" : "transparent",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        transition: "all var(--transition-fast)",
        position: "relative",
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
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: active ? "#5DD62C" : "rgba(248, 248, 248, 0.2)",
          flexShrink: 0,
          boxShadow: active ? "0 0 6px #5DD62C" : "none",
          transition: "all var(--transition-fast)",
        }}
      />
      <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
      {active && (
        <span
          style={{
            marginLeft: "auto",
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: "#5DD62C",
            boxShadow: "0 0 5px #5DD62C",
            flexShrink: 0,
          }}
        />
      )}
    </Link>
  );
}
