import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useAlerts } from "../../features/alerts/useAlerts";
import { useWarehouses } from "../../features/warehouses/useWarehouses";
import { Bell, ChevronDown, Menu, Warehouse as WarehouseIcon, Calendar, Building2, Sliders, LogOut } from "lucide-react";

function LucideIconWrapper({ children, size = 16 }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: size, height: size, flexShrink: 0 }}>
      {children}
    </span>
  );
}

function BellIcon() {
  return <LucideIconWrapper size={16}><Bell size={16} /></LucideIconWrapper>;
}

function ChevronDownIcon({ style, size }) {
  const s = size || 11;
  return <LucideIconWrapper size={s}><ChevronDown size={s} style={style} /></LucideIconWrapper>;
}

const toneByType = {
  "Stock Variance": "warning",
  Attendance: "warning",
  Weighment: "info",
  Login: "error",
};

export default function Topbar({ onToggleMobileSidebar }) {
  const { user, logout } = useAuth();
  const { exceptions } = useAlerts();
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(null); // "bell" | "account" | null

  const userName = user?.name || "Warehouse Admin";
  const userRole = user?.role || "Warehouse Admin";
  const openExceptions = exceptions.filter((e) => e.status === "Open");

  // GET /warehouses is already scoped server-side to the caller's own
  // warehouse for anyone below Super Admin (see warehouse.service.js
  // listWarehouses) - real org/warehouse identity instead of a hardcoded
  // "Manimau Centre Hub" / "12 Procurement Hubs" placeholder.
  const isScopedRole = user?.roleKey === "supervisor" || user?.roleKey === "warehouse_admin";
  const { warehouses } = useWarehouses();
  const hubStatusLabel = isScopedRole
    ? warehouses[0]?.name || "No warehouse assigned"
    : `${warehouses.length} Procurement ${warehouses.length === 1 ? "Hub" : "Hubs"}`;

  const todayStr = new Date().toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  function toggle(menu) {
    setOpenMenu((cur) => (cur === menu ? null : menu));
  }

  return (
    <header
      className="topbar-header"
      style={{
        height: 64,
        background: "var(--surface)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        zIndex: 99,
        borderBottom: "1px solid var(--line)",
      }}
    >
      {/* Left: Mobile Hamburger & Greeting */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={onToggleMobileSidebar}
          aria-label="Toggle Navigation Menu"
          className="app-topbar-hamburger"
          style={{
            display: "none",
            width: 36,
            height: 36,
            borderRadius: 8,
            border: "1px solid var(--line)",
            background: "var(--canvas)",
            color: "var(--ink)",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          <LucideIconWrapper size={16}><Menu size={16} /></LucideIconWrapper>
        </button>
        <h2 className="topbar-greeting" style={{ fontSize: 17, fontWeight: 700, color: "var(--ink)", margin: 0, letterSpacing: "-0.01em" }}>
          Hello, {userName}
        </h2>
      </div>

      {/* Right: Live Status Pill, Notifications & Account Menu */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: "var(--ink-secondary)",
            background: "var(--canvas)",
            border: "1px solid var(--line)",
            borderRadius: 20,
            padding: "5px 14px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--primary)" }} />
          <span>
            <LucideIconWrapper size={11}><WarehouseIcon size={11} /></LucideIconWrapper> {hubStatusLabel}
          </span>
          <span style={{ color: "var(--faint)" }}>|</span>
          <span style={{ color: "var(--muted)", display: "inline-flex", alignItems: "center", gap: 4 }}>
            <LucideIconWrapper size={11}><Calendar size={11} /></LucideIconWrapper>{todayStr}
          </span>
        </div>

        {/* Notifications */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => toggle("bell")}
            aria-label="Notifications"
            style={{
              position: "relative",
              width: 36, height: 36, borderRadius: "50%",
              border: "1px solid var(--line)", background: openMenu === "bell" ? "var(--canvas)" : "var(--surface)",
              color: "var(--ink-secondary)", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "background var(--transition-fast)",
            }}
          >
            <BellIcon />
            {openExceptions.length > 0 && (
              <span
                style={{
                  position: "absolute", top: 5, right: 6, width: 8, height: 8, borderRadius: "50%",
                  background: "var(--status-error)", border: "2px solid var(--surface)",
                }}
              />
            )}
          </button>

          {openMenu === "bell" && (
            <>
              <div onClick={() => setOpenMenu(null)} style={{ position: "fixed", inset: 0, zIndex: 100 }} />
              <div
                style={{
                  position: "absolute", top: "calc(100% + 10px)", right: 0, width: 320, zIndex: 101,
                  background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12,
                  boxShadow: "var(--shadow-lg)", overflow: "hidden",
                }}
              >
                <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <LucideIconWrapper size={14}><Bell size={14} /></LucideIconWrapper>Notifications
                  </span>
                  <span style={{ fontSize: 11.5, color: "var(--muted)" }}>{openExceptions.length} open</span>
                </div>
                <div style={{ maxHeight: 280, overflowY: "auto" }}>
                  {openExceptions.length === 0 ? (
                    <p style={{ margin: 0, padding: "20px 16px", fontSize: 12.5, color: "var(--muted)", textAlign: "center" }}>
                      No open exceptions right now.
                    </p>
                  ) : (
                    openExceptions.map((e, i) => (
                      <div key={i} style={{ padding: "12px 16px", borderBottom: i < openExceptions.length - 1 ? "1px solid var(--line)" : "none" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span
                            style={{
                              width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                              background: toneByType[e.type] === "error" ? "var(--status-error)" : toneByType[e.type] === "info" ? "var(--status-info)" : "var(--status-warning)",
                            }}
                          />
                          <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink)" }}>{e.type}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: 12, color: "var(--ink-secondary)" }}>{e.description}</p>
                        <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--muted)" }}>{e.warehouse}</p>
                      </div>
                    ))
                  )}
                </div>
                <Link
                  to="/alerts"
                  onClick={() => setOpenMenu(null)}
                  style={{ display: "block", padding: "11px 16px", fontSize: 12.5, fontWeight: 600, color: "var(--primary-deep)", textDecoration: "none", borderTop: "1px solid var(--line)", textAlign: "center" }}
                >
                  View all exceptions &rarr;
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Account menu */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => toggle("account")}
            style={{
              display: "flex", alignItems: "center", gap: 8, border: "1px solid transparent",
              background: openMenu === "account" ? "var(--canvas)" : "transparent",
              borderRadius: 20, padding: "4px 8px 4px 4px", cursor: "pointer", transition: "background var(--transition-fast)",
            }}
          >
            <div
              title={`${userName} (${userRole})`}
              style={{
                width: 32, height: 32, borderRadius: "50%", background: "var(--gradient-primary)",
                color: "white", display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: 12,
              }}
            >
              {userName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <ChevronDownIcon style={{ color: "var(--muted)" }} />
          </button>

          {openMenu === "account" && (
            <>
              <div onClick={() => setOpenMenu(null)} style={{ position: "fixed", inset: 0, zIndex: 100 }} />
              <div
                style={{
                  position: "absolute", top: "calc(100% + 10px)", right: 0, width: 220, zIndex: 101,
                  background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12,
                  boxShadow: "var(--shadow-lg)", overflow: "hidden",
                }}
              >
                <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)" }}>
                  <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: "var(--ink)" }}>{userName}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--muted)" }}>{userRole}</p>
                </div>
                <MenuLink to="/settings/organisation-profile" onClick={() => setOpenMenu(null)}>
                  <LucideIconWrapper size={14} style={{ marginRight: 8, color: "var(--muted)" }}><Building2 size={14} /></LucideIconWrapper> Organisation Profile
                </MenuLink>
                <MenuLink to="/settings" onClick={() => setOpenMenu(null)}>
                  <LucideIconWrapper size={14} style={{ marginRight: 8, color: "var(--muted)" }}><Sliders size={14} /></LucideIconWrapper> Settings
                </MenuLink>
                <button
                  onClick={() => { setOpenMenu(null); logout(); navigate("/login"); }}
                  style={{
                    display: "flex", alignItems: "center", width: "100%", textAlign: "left", padding: "10px 16px",
                    fontSize: 12.5, fontWeight: 600, color: "var(--status-error)",
                    background: "transparent", border: "none", borderTop: "1px solid var(--line)", cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--status-error-bg)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <LucideIconWrapper size={14} style={{ marginRight: 8 }}><LogOut size={14} /></LucideIconWrapper> Log out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function MenuLink({ to, children, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      style={{ display: "block", padding: "10px 16px", fontSize: 12.5, fontWeight: 600, color: "var(--ink-secondary)", textDecoration: "none" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-hover)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {children}
    </Link>
  );
}
