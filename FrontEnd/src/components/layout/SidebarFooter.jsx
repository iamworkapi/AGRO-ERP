import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { MoreIcon } from "./icons";

export default function SidebarFooter({ collapsed }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const name = user?.name || user?.fullName || "Super Admin";
  const role = user?.role || "Super Admin";
  const avatarUrl = user?.avatarUrl;

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      title={collapsed ? `${name} (${role})` : undefined}
      onClick={() => navigate("/settings/super-admin")}
      style={{
        padding: collapsed ? "10px 10px" : "10px 12px",
        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        display: "flex",
        alignItems: "center",
        gap: 10,
        justifyContent: collapsed ? "center" : "flex-start",
        cursor: "pointer",
        transition: "all var(--transition-fast)",
        background: "rgba(0, 0, 0, 0.12)",
      }}
      onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)")}
      onMouseOut={(e) => (e.currentTarget.style.background = "rgba(0, 0, 0, 0.12)")}
    >
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: avatarUrl ? `url(${avatarUrl}) center/cover no-repeat` : "var(--gradient-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: 800,
            fontSize: 11,
            boxShadow: "0 2px 8px rgba(0, 184, 107, 0.3)",
            overflow: "hidden",
          }}
        >
          {!avatarUrl && initials}
        </div>
        <span
          style={{
            position: "absolute",
            bottom: -1,
            right: -1,
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#10B981",
            border: "2px solid #07281D",
            boxShadow: "0 0 6px #10B981",
          }}
        />
      </div>

      {!collapsed && (
        <>
          <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "white",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {name}
              </span>
            </div>
            <span
              style={{
                fontSize: 10,
                color: "rgba(255, 255, 255, 0.5)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {role}
            </span>
          </div>
          <MoreIcon size={16} style={{ color: "rgba(255, 255, 255, 0.5)", flexShrink: 0 }} />
        </>
      )}
    </div>
  );
}
