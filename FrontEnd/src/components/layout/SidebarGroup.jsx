import { useLocation, useNavigate } from "react-router-dom";
import SidebarLink from "./SidebarLink";
import { Chevron, NAV_ICONS } from "./icons";

export function isGroupActive(pathname, groupPath) {
  if (groupPath === "/") return pathname === "/";
  return pathname === groupPath || pathname.startsWith(`${groupPath}/`);
}

// Sections are plain strings (no distinct route - link to the group's page)
// or { label, path } objects for groups with real per-section routes.
function sectionMeta(section, groupPath) {
  return typeof section === "string" ? { label: section, path: groupPath } : section;
}

export default function SidebarGroup({ group, collapsed, searchTerm, isOpen, onToggleOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const active = isGroupActive(location.pathname, group.path);
  const Icon = NAV_ICONS[group.path];

  const allSections = (group.sections ?? []).map((s) => sectionMeta(s, group.path));
  // A single-section group has nothing to disclose - the row itself IS the link.
  const isAccordionGroup = allSections.length > 1;
  const hasDistinctPaths = new Set(allSections.map((s) => s.path)).size > 1;

  const visibleSections = isAccordionGroup
    ? allSections.filter(({ label }) =>
        searchTerm
          ? label.toLowerCase().includes(searchTerm) || group.label.toLowerCase().includes(searchTerm)
          : true
      )
    : [];

  // While searching, show every matching group's sections regardless of the
  // single-open accordion state; otherwise only the explicitly opened group.
  const expanded = isAccordionGroup && (searchTerm ? visibleSections.length > 0 : isOpen);
  const highlighted = active || expanded;

  if (collapsed) {
    return (
      <button
        onClick={() => navigate(group.path)}
        title={group.label}
        style={{
          width: "100%",
          height: 42,
          marginBottom: 2,
          borderRadius: "var(--radius-sm)",
          border: "none",
          background: active ? "var(--sidebar-active)" : "transparent",
          color: active ? "white" : "var(--sidebar-muted)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          transition: "background var(--transition-fast), color var(--transition-fast)",
        }}
        onMouseOver={(e) => {
          if (!active) e.currentTarget.style.background = "var(--sidebar-hover)";
        }}
        onMouseOut={(e) => {
          if (!active) e.currentTarget.style.background = "transparent";
        }}
      >
        {Icon && <Icon size={18} />}
        {group.badge && (
          <span
            style={{
              position: "absolute",
              top: 8,
              right: 16,
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--primary)",
              boxShadow: "0 0 6px var(--primary-light)",
            }}
          />
        )}
      </button>
    );
  }

  return (
    <div style={{ marginBottom: 3, position: "relative" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          borderRadius: 8,
          position: "relative",
          background: active 
            ? "linear-gradient(90deg, rgba(0, 184, 107, 0.18) 0%, rgba(0, 184, 107, 0.05) 100%)" 
            : expanded ? "rgba(255, 255, 255, 0.04)" : "transparent",
          border: active ? "1px solid rgba(0, 184, 107, 0.25)" : "1px solid transparent",
          transition: "all var(--transition-fast)",
          overflow: "hidden",
        }}
        onMouseOver={(e) => {
          if (!active) e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = active 
            ? "linear-gradient(90deg, rgba(0, 184, 107, 0.18) 0%, rgba(0, 184, 107, 0.05) 100%)" 
            : expanded ? "rgba(255, 255, 255, 0.04)" : "transparent";
        }}
      >
        {/* Glowing Active Left Pillar Accent */}
        {active && (
          <span
            style={{
              position: "absolute",
              left: 0,
              top: "15%",
              bottom: "15%",
              width: 3.5,
              background: "var(--primary-light)",
              borderRadius: "0 4px 4px 0",
              boxShadow: "0 0 10px var(--primary)",
            }}
          />
        )}

        <button
          onClick={() => {
            navigate(group.path);
            if (isAccordionGroup) onToggleOpen();
          }}
          title={group.label}
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: active ? "9px 6px 9px 14px" : "9px 6px 9px 12px",
            background: "transparent",
            border: "none",
            color: active ? "white" : "var(--sidebar-ink)",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          {Icon && (
            <Icon size={17} style={{ flexShrink: 0, color: active ? "#33C689" : "var(--sidebar-muted)" }} />
          )}
          <span
            style={{
              fontSize: 13,
              fontWeight: active ? 700 : 500,
              letterSpacing: 0.1,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {group.label}
          </span>
          {group.badge && (
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--primary)",
                boxShadow: "0 0 6px var(--primary-light)",
                flexShrink: 0,
                marginLeft: "auto",
              }}
            />
          )}
        </button>

        {isAccordionGroup && (
          <button
            onClick={onToggleOpen}
            aria-label={expanded ? `Collapse ${group.label}` : `Expand ${group.label}`}
            style={{
              width: 30,
              height: 30,
              marginRight: 4,
              border: "none",
              background: "transparent",
              color: "var(--sidebar-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <Chevron
              size={13}
              style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform var(--transition-fast)" }}
            />
          </button>
        )}
      </div>

      {expanded && visibleSections.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 2,
            marginLeft: 24,
            paddingLeft: 12,
            borderLeft: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {visibleSections.map(({ label, path }) => (
            <SidebarLink
              key={label}
              to={path}
              label={label}
              active={hasDistinctPaths && location.pathname === path}
            />
          ))}
        </div>
      )}
    </div>
  );
}
