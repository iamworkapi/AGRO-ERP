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
        padding: "6px 10px 6px 8px",
        margin: "1px 0",
        borderRadius: 7,
        textDecoration: "none",
        fontSize: 12,
        fontWeight: active ? 700 : 500,
        color: active ? "#FFFFFF" : "rgba(255, 255, 255, 0.68)",
        background: active ? "rgba(93, 214, 44, 0.14)" : "transparent",
        border: active ? "1px solid rgba(93, 214, 44, 0.28)" : "1px solid transparent",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        transition: "all var(--transition-fast)",
        position: "relative",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.color = "#FFFFFF";
        if (!active) {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
        }
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.color = active ? "#FFFFFF" : "rgba(255, 255, 255, 0.68)";
        e.currentTarget.style.background = active ? "rgba(93, 214, 44, 0.14)" : "transparent";
      }}
    >
      {/* Horizontal branch line connecting vertical tree rail directly to the circle */}
      <span
        style={{
          position: "absolute",
          left: -12,
          top: "50%",
          width: 12,
          height: 1.5,
          background: active ? "#5DD62C" : "rgba(255, 255, 255, 0.14)",
          transform: "translateY(-50%)",
          transition: "background var(--transition-fast)",
          pointerEvents: "none",
        }}
      />

      {/* Connected Circle / Dot */}
      <span
        style={{
          width: active ? 7 : 5,
          height: active ? 7 : 5,
          borderRadius: "50%",
          background: active ? "#5DD62C" : "rgba(255, 255, 255, 0.35)",
          flexShrink: 0,
          boxShadow: active ? "0 0 8px rgba(93, 214, 44, 0.9)" : "none",
          transition: "all var(--transition-fast)",
          zIndex: 1,
        }}
      />
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", letterSpacing: "0.01em" }}>{label}</span>
    </Link>
  );
}
