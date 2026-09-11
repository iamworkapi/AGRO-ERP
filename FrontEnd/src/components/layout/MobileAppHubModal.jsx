import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { useAlerts } from "../../features/alerts/useAlerts";
import { useWarehouses } from "../../features/warehouses/useWarehouses";

export default function MobileAppHubModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { exceptions = [] } = useAlerts() || {};
  const { warehouses = [] } = useWarehouses() || {};
  const [search, setSearch] = useState("");

  const roleStr = (user?.role || "").toLowerCase();
  const isSuperAdmin = roleStr === "super_admin" || roleStr === "super admin";
  const isSupervisor =
    user?.roleKey?.toLowerCase()?.includes("supervisor") || roleStr.includes("supervisor");
  const isAdmin = !isSupervisor && !isSuperAdmin;

  const userName = user?.name || "Warehouse Admin";
  const userRole = user?.role || (isAdmin ? "Warehouse Admin" : "Supervisor");
  const openAlertsCount = exceptions.filter((e) => e.status === "Open").length;

  const activeWarehouseLabel = warehouses[0]?.name || "Central Procurement Hub";

  // Prevent background scrolling when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setSearch("");
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const allSections = useMemo(
    () => [
      ...(isAdmin || isSupervisor
        ? [
            {
              category: "Biomass Operations",
              items: [
                {
                  label: "Biomass Vendors",
                  desc: "Farmer & vendor directory",
                  path: "/biomass/vendors",
                  icon: "ri-store-2-line",
                  color: "#337418",
                  bg: "rgba(51, 116, 24, 0.12)",
                },
                {
                  label: "Storage Rooms",
                  desc: "Custom rooms, godowns & silos",
                  path: "/warehouses/rooms",
                  icon: "ri-archive-stack-line",
                  color: "#00B894",
                  bg: "rgba(0, 184, 148, 0.12)",
                },
                {
                  label: "Factory Dispatch",
                  desc: "Gate pass & factory delivery",
                  path: "/biomass/dispatch",
                  icon: "ri-truck-line",
                  color: "#FF7A00",
                  bg: "rgba(255, 122, 0, 0.12)",
                },
                {
                  label: "Industrial Buyers",
                  desc: "Thermal & boiler power plants",
                  path: "/biomass/buyers",
                  icon: "ri-building-2-line",
                  color: "#2E5BFF",
                  bg: "rgba(46, 91, 255, 0.12)",
                },
              ],
            },
          ]
        : []),
      ...(isAdmin || isSupervisor
        ? [
            {
              category: "Weighbridge & Quality Control",
              items: [
                {
                  label: "Weighment Slips",
                  desc: "Inbound & outbound slips",
                  path: "/weighment",
                  icon: "ri-scales-3-line",
                  color: "#00D2FF",
                  bg: "rgba(0, 210, 255, 0.12)",
                },
                {
                  label: "Create New Slip",
                  desc: "Instant weighbridge entry",
                  path: "/weighment/new",
                  icon: "ri-file-add-line",
                  color: "#5DD62C",
                  bg: "rgba(93, 214, 44, 0.14)",
                },
                {
                  label: "Weight Machines",
                  desc: "Sensors & calibration status",
                  path: "/weighment/machines",
                  icon: "ri-dashboard-2-line",
                  color: "#A855F7",
                  bg: "rgba(168, 85, 247, 0.12)",
                },
                ...(isAdmin
                  ? [
                      {
                        label: "Deduction Slabs",
                        desc: "Moisture & dust deduction tiers",
                        path: "/weighment/deduction-slabs",
                        icon: "ri-percent-line",
                        color: "#EC4899",
                        bg: "rgba(236, 72, 153, 0.12)",
                      },
                    ]
                  : []),
              ],
            },
          ]
        : []),
      {
        category: "Warehouses & Inventory",
        items: [
          ...(isAdmin || isSuperAdmin
            ? [
                {
                  label: "All Warehouses",
                  desc: "12 Hubs & network nodes",
                  path: "/warehouses",
                  icon: "ri-building-line",
                  color: "#3B82F6",
                  bg: "rgba(59, 130, 246, 0.12)",
                },
              ]
            : []),
          ...(isAdmin || isSupervisor
            ? [
                {
                  label: "Storage Rooms",
                  desc: "Chamber & shed allocations",
                  path: "/warehouses/rooms",
                  icon: "ri-layout-grid-line",
                  color: "#10B981",
                  bg: "rgba(16, 185, 129, 0.12)",
                },
              ]
            : []),
          ...(isAdmin
            ? [
                {
                  label: "Inventory Stock",
                  desc: "Machinery parts & consumable stock",
                  path: "/inventory",
                  icon: "ri-archive-line",
                  color: "#F59E0B",
                  bg: "rgba(245, 158, 11, 0.12)",
                },
                {
                  label: "Parts Master",
                  desc: "Catalogue & spare parts",
                  path: "/inventory/items",
                  icon: "ri-tools-line",
                  color: "#6366F1",
                  bg: "rgba(99, 102, 241, 0.12)",
                },
                {
                  label: "Low Stock Alerts",
                  desc: "Critical re-order items",
                  path: "/inventory/low-stock-alerts",
                  icon: "ri-alarm-warning-line",
                  color: "#EF4444",
                  bg: "rgba(239, 68, 68, 0.12)",
                },
              ]
            : []),
        ],
      },
      ...(isAdmin || isSupervisor
        ? [
            {
              category: "Commercial, Sales & Goods",
              items: [
                ...(isAdmin
                  ? [
                      {
                        label: "Sales & Invoicing",
                        desc: "Buyer GST invoices & ledgers",
                        path: "/sales",
                        icon: "ri-file-list-3-line",
                        color: "#06B6D4",
                        bg: "rgba(6, 182, 212, 0.12)",
                      },
                      {
                        label: "Purchase Orders",
                        desc: "Vendor contracts & procurement",
                        path: "/purchase",
                        icon: "ri-shopping-cart-line",
                        color: "#F97316",
                        bg: "rgba(249, 115, 22, 0.12)",
                      },
                    ]
                  : []),
                {
                  label: "Goods Register",
                  desc: "Inward & outward goods registry",
                  path: "/goods",
                  icon: "ri-survey-line",
                  color: "#8B5CF6",
                  bg: "rgba(139, 92, 246, 0.12)",
                },
                {
                  label: "Products Master",
                  desc: "Agro commodity product list",
                  path: "/products",
                  icon: "ri-shopping-bag-2-line",
                  color: "#14B8A6",
                  bg: "rgba(20, 184, 166, 0.12)",
                },
                ...(isAdmin
                  ? [
                      {
                        label: "Customer Master",
                        desc: "Buyer ledger & balances",
                        path: "/sales/customer-master-ledger",
                        icon: "ri-user-star-line",
                        color: "#E11D48",
                        bg: "rgba(225, 29, 72, 0.12)",
                      },
                    ]
                  : []),
              ],
            },
          ]
        : []),
      ...(isAdmin || isSupervisor
        ? [
            {
              category: "Workforce & Field Operations",
              items: [
                {
                  label: "Employees",
                  desc: "Staff roster & directory",
                  path: "/employees",
                  icon: "ri-team-line",
                  color: "#3B82F6",
                  bg: "rgba(59, 130, 246, 0.12)",
                },
                {
                  label: "Attendance Register",
                  desc: "Daily clock-in & biometric geo-logs",
                  path: "/attendance",
                  icon: "ri-calendar-check-line",
                  color: "#10B981",
                  bg: "rgba(16, 185, 129, 0.12)",
                },
                {
                  label: "Task Assignments",
                  desc: "Field duties & supervisor tasks",
                  path: "/employees/tasks",
                  icon: "ri-task-line",
                  color: "#8B5CF6",
                  bg: "rgba(139, 92, 246, 0.12)",
                },
                {
                  label: "Leave Requests",
                  desc: "Staff leave management",
                  path: "/employees/leave-requests",
                  icon: "ri-calendar-event-line",
                  color: "#F59E0B",
                  bg: "rgba(245, 158, 11, 0.12)",
                },
              ],
            },
          ]
        : []),
      {
        category: "Analytics & Settings",
        items: [
          ...(isAdmin || isSuperAdmin
            ? [
                {
                  label: "Analytics & Reports",
                  desc: "KPIs, procurement & MIS trends",
                  path: "/reports",
                  icon: "ri-bar-chart-box-line",
                  color: "#337418",
                  bg: "rgba(51, 116, 24, 0.12)",
                },
                {
                  label: "Export MIS Reports",
                  desc: "Excel & CSV data dump",
                  path: "/reports/export",
                  icon: "ri-file-excel-2-line",
                  color: "#059669",
                  bg: "rgba(5, 150, 105, 0.12)",
                },
              ]
            : []),
          {
            label: "Telemetry Alerts",
            desc: "Exceptions, temperature & QC alerts",
            path: "/alerts",
            icon: "ri-alarm-warning-line",
            color: "#EF4444",
            bg: "rgba(239, 68, 68, 0.12)",
            badge: openAlertsCount,
          },
          {
            label: "My Profile & Settings",
            desc: "Personal preferences & password",
            path: "/settings/my-profile",
            icon: "ri-user-3-line",
            color: "#64748B",
            bg: "rgba(100, 116, 139, 0.12)",
          },
        ],
      },
    ],
    [isAdmin, openAlertsCount]
  );

  const query = search.trim().toLowerCase();

  const filteredSections = useMemo(() => {
    if (!query) return allSections;
    return allSections
      .map((sec) => ({
        ...sec,
        items: sec.items.filter(
          (item) =>
            item.label.toLowerCase().includes(query) ||
            item.desc.toLowerCase().includes(query) ||
            sec.category.toLowerCase().includes(query)
        ),
      }))
      .filter((sec) => sec.items.length > 0);
  }, [allSections, query]);

  if (!isOpen) return null;

  const handleNavigate = (path) => {
    onClose();
    navigate(path);
  };

  const handleLogout = () => {
    onClose();
    logout();
    navigate("/login");
  };

  return (
    <div className="mobile-sheet-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="mobile-sheet-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* iOS Drag Handle */}
        <div className="mobile-sheet-handle-wrap" onClick={onClose}>
          <span className="mobile-sheet-handle" />
        </div>

        {/* Top Header */}
        <div className="mobile-sheet-header">
          <div className="mobile-sheet-header-title">
            <h3>App Hub &amp; Services</h3>
            <span className="mobile-sheet-header-sub">Kusumganga ERP</span>
          </div>
          <button
            type="button"
            className="mobile-sheet-close-btn"
            onClick={onClose}
            aria-label="Close sheet"
          >
            <i className="ri-close-line" />
          </button>
        </div>

        {/* Profile Card */}
        <div className="mobile-sheet-profile-card">
          <div className="mobile-sheet-avatar">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={userName} />
            ) : (
              <span>{userName.split(" ").map((n) => n[0]).join("").slice(0, 2)}</span>
            )}
            <span className="mobile-sheet-online-dot" />
          </div>

          <div className="mobile-sheet-user-meta">
            <div className="mobile-sheet-user-name">{userName}</div>
            <div className="mobile-sheet-user-chips">
              <span className="mobile-sheet-role-chip">{userRole}</span>
              <span className="mobile-sheet-warehouse-chip">
                <i className="ri-building-line" />
                {activeWarehouseLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mobile-sheet-search-wrap">
          <i className="ri-search-line" />
          <input
            type="text"
            placeholder="Search any module or tool..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mobile-sheet-search-input"
            autoFocus={false}
          />
          {search && (
            <button
              type="button"
              className="mobile-sheet-search-clear"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <i className="ri-close-circle-fill" />
            </button>
          )}
        </div>

        {/* Modules List & Grid */}
        <div className="mobile-sheet-scroll-body">
          {filteredSections.length === 0 ? (
            <div className="mobile-sheet-empty">
              <i className="ri-search-eye-line" />
              <p>No modules found matching &ldquo;{search}&rdquo;</p>
            </div>
          ) : (
            filteredSections.map((sec) => (
              <div key={sec.category} className="mobile-sheet-section">
                <div className="mobile-sheet-sec-title">{sec.category}</div>
                <div className="mobile-sheet-grid">
                  {sec.items.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <button
                        key={item.path}
                        type="button"
                        className={`app-module-tile ${isActive ? "active" : ""}`}
                        onClick={() => handleNavigate(item.path)}
                      >
                        <div
                          className="app-module-icon-squircle"
                          style={{ background: item.bg, color: item.color }}
                        >
                          <i className={item.icon} />
                          {item.badge > 0 && (
                            <span className="app-module-badge">{item.badge}</span>
                          )}
                        </div>
                        <div className="app-module-info">
                          <span className="app-module-name">{item.label}</span>
                          <span className="app-module-desc">{item.desc}</span>
                        </div>
                        <i className="ri-arrow-right-s-line app-module-arrow" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom Utility Bar */}
        <div className="mobile-sheet-footer">
          <button
            type="button"
            className="mobile-sheet-footer-btn"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
          >
            <i className={isDark ? "ri-sun-fill" : "ri-moon-fill"} />
            <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
          </button>

          <button
            type="button"
            className="mobile-sheet-footer-btn danger"
            onClick={handleLogout}
            aria-label="Log Out"
          >
            <i className="ri-logout-box-r-line" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
