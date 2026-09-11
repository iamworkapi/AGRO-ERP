import { useLocation, useNavigate } from "react-router-dom";
import { useAlerts } from "../../features/alerts/useAlerts";

export default function BottomNavigation({ onOpenAppHub, isAppHubOpen = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { exceptions = [] } = useAlerts() || {};
  const openAlertsCount = exceptions.filter((e) => e.status === "Open").length;

  const currentPath = location.pathname;

  const isTabActive = (item) => {
    if (item.action === "menu") return isAppHubOpen;
    if (isAppHubOpen) return false;
    if (item.path === "/") return currentPath === "/";
    return currentPath.startsWith(item.path);
  };

  const navTabs = [
    {
      id: "home",
      label: "Home",
      path: "/",
      icon: "ri-home-5-line",
      activeIcon: "ri-home-5-fill",
    },
    {
      id: "weighment",
      label: "Weighment",
      path: "/weighment",
      icon: "ri-scales-3-line",
      activeIcon: "ri-scales-3-fill",
    },
    {
      id: "storage",
      label: "Storage",
      path: "/warehouses/rooms",
      icon: "ri-archive-stack-line",
      activeIcon: "ri-archive-stack-fill",
    },
    {
      id: "dispatch",
      label: "Dispatch",
      path: "/biomass/dispatch",
      icon: "ri-truck-line",
      activeIcon: "ri-truck-fill",
    },
    {
      id: "menu",
      label: "Menu",
      action: "menu",
      icon: "ri-apps-2-line",
      activeIcon: "ri-apps-2-fill",
      badgeCount: openAlertsCount,
    },
  ];

  const handleTabClick = (item) => {
    if (item.action === "menu") {
      onOpenAppHub();
    } else {
      if (isAppHubOpen) onOpenAppHub(false);
      navigate(item.path);
    }
  };

  return (
    <nav
      className="app-bottom-nav"
      role="navigation"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="bottom-nav-inner">
        {navTabs.map((tab) => {
          const active = isTabActive(tab);
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab)}
              className={`bottom-nav-item ${active ? "active" : ""}`}
              aria-label={tab.label}
              aria-current={active ? "page" : undefined}
            >
              <div className="bottom-nav-icon-wrap">
                <i className={active ? tab.activeIcon : tab.icon} />
                {tab.badgeCount > 0 && (
                  <span className="bottom-nav-badge">
                    {tab.badgeCount > 9 ? "9+" : tab.badgeCount}
                  </span>
                )}
                {active && <span className="bottom-nav-indicator-dot" />}
              </div>
              <span className="bottom-nav-label">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
