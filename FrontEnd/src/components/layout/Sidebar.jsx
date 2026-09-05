import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { NAV_GROUPS } from "../../config/navigation";
import SidebarHeader from "./SidebarHeader";
import SidebarGroup, { isGroupActive } from "./SidebarGroup";
import SidebarFooter from "./SidebarFooter";
import { useAuth } from "../../hooks/useAuth";

const COLLAPSE_KEY = "sidebar:collapsed";

function getStoredCollapsed() {
  try {
    return localStorage.getItem(COLLAPSE_KEY) === "1";
  } catch {
    return false;
  }
}

function filterGroupsByRole(groups, userRole) {
  return groups
    .filter((g) => {
      if (g.roles && !g.roles.includes(userRole)) return false;
      return true;
    })
    .map((g) => {
      if (!g.sections) return g;
      const validSections = g.sections.filter((s) => {
        if (typeof s === "object" && s.roles && !s.roles.includes(userRole)) return false;
        return true;
      });
      return { ...g, sections: validSections };
    });
}

function findActiveAccordionGroup(pathname, groups) {
  return groups.find((g) => (g.sections?.length ?? 0) > 1 && isGroupActive(pathname, g.path));
}

export default function Sidebar({ mobileOpen = false, onCloseMobile }) {
  const { user } = useAuth();
  const userRole =
    user?.roleKey?.toLowerCase()?.includes("supervisor") ||
    user?.role?.toLowerCase()?.includes("supervisor")
      ? "supervisor"
      : "admin";

  // NAV_GROUPS is a static import - only recompute the filtered tree when
  // the role actually changes, not on every keystroke/route change re-render.
  const allowedNavGroups = useMemo(() => filterGroupsByRole(NAV_GROUPS, userRole), [userRole]);

  const location = useLocation();
  const [collapsed, setCollapsed] = useState(getStoredCollapsed);
  const [query, setQuery] = useState("");
  const [openGroupPath, setOpenGroupPath] = useState(() => findActiveAccordionGroup(location.pathname, allowedNavGroups)?.path ?? null);

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0");
    } catch {
      /* localStorage unavailable (private mode etc.) - ignore */
    }
  }, [collapsed]);

  useEffect(() => {
    if (collapsed) setQuery("");
  }, [collapsed]);

  useEffect(() => {
    const match = findActiveAccordionGroup(location.pathname, allowedNavGroups);
    if (match) setOpenGroupPath(match.path);
    if (onCloseMobile) onCloseMobile();
  }, [location.pathname]);

  const term = query.trim().toLowerCase();
  const visibleGroups = term
    ? allowedNavGroups.filter((group) => {
        const sectionLabels = (group.sections ?? []).map((s) => (typeof s === "string" ? s : s.label));
        return (
          group.label.toLowerCase().includes(term) ||
          sectionLabels.some((label) => label.toLowerCase().includes(term))
        );
      })
    : allowedNavGroups;

  return (
    <aside
      className={`app-sidebar ${mobileOpen ? "mobile-open" : ""}`}
      style={{
        width: collapsed ? 76 : 264,
        height: "100vh",
        background: "var(--sidebar-bg)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        zIndex: 10,
        color: "var(--sidebar-ink)",
        transition: "width var(--transition-smooth)",
      }}
    >
      <SidebarHeader
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        query={query}
        onQueryChange={setQuery}
      />

      <nav
        className="sidebar-scroll"
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          padding: collapsed ? "8px 8px" : "8px 10px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        {visibleGroups.map((group) => (
          <SidebarGroup
            key={group.path}
            group={group}
            collapsed={collapsed}
            searchTerm={term}
            isOpen={openGroupPath === group.path}
            onToggleOpen={() => setOpenGroupPath((cur) => (cur === group.path ? null : group.path))}
          />
        ))}

        {term && visibleGroups.length === 0 && (
          <p style={{ padding: "16px 12px", fontSize: 12.5, color: "var(--sidebar-muted)", textAlign: "center", margin: 0 }}>
            No matches for &ldquo;{query}&rdquo;
          </p>
        )}
      </nav>

      <SidebarFooter collapsed={collapsed} />
    </aside>
  );
}
