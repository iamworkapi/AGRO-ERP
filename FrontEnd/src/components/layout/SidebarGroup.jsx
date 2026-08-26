import { useLocation, useNavigate } from "react-router-dom";
import SidebarLink from "./SidebarLink";
import { Chevron, NAV_ICONS, DashboardIcon } from "./icons";

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
  const Icon = NAV_ICONS[group.path] || DashboardIcon;

  const allSections = (group.sections ?? []).map((s) => sectionMeta(s, group.path));
  const isAccordionGroup = allSections.length > 1;
  const hasDistinctPaths = new Set(allSections.map((s) => s.path)).size > 1;

  const visibleSections = isAccordionGroup
    ? allSections.filter(({ label }) =>
        searchTerm
          ? label.toLowerCase().includes(searchTerm) || group.label.toLowerCase().includes(searchTerm)
          : true
      )
    : [];

  const expanded = isAccordionGroup && (searchTerm ? visibleSections.length > 0 : isOpen);

  if (collapsed) {
    return (
      <button
        onClick={() => navigate(group.path)}
        title={group.label}
        style={{
          width: "100%",
          height: 46,
          marginBottom: 4,
          borderRadius: 10,
          border: "none",
          background: active ? "rgba(93, 214, 44, 0.18)" : "transparent",
          color: active ? "#5DD62C" : "var(--sidebar-muted)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          cursor: "pointer",
          transition: "all var(--transition-fast)",
        }}
        onMouseOver={(e) => {
          if (!active) e.currentTarget.style.background = "var(--sidebar-hover)";
        }}
        onMouseOut={(e) => {
          if (!active) e.currentTarget.style.background = "transparent";
        }}
      >
        {Icon && <Icon size={21} />}
        {group.badge && (
          <span
            style={{
              position: "absolute",
              top: 8,
              right: 12,
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#5DD62C",
              boxShadow: "0 0 8px #5DD62C",
            }}
          />
        )}
      </button>
    );
  }

  return (
    <div style={{ marginBottom: 4, position: "relative" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          borderRadius: 10,
          position: "relative",
          background: active 
            ? "linear-gradient(90deg, rgba(93, 214, 44, 0.18) 0%, rgba(93, 214, 44, 0.04) 100%)" 
            : expanded ? "rgba(255, 255, 255, 0.04)" : "transparent",
          border: active ? "1px solid rgba(93, 214, 44, 0.35)" : "1px solid transparent",
          transition: "all var(--transition-fast)",
          overflow: "hidden",
        }}
        onMouseOver={(e) => {
          if (!active) e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = active 
            ? "linear-gradient(90deg, rgba(93, 214, 44, 0.18) 0%, rgba(93, 214, 44, 0.04) 100%)" 
            : expanded ? "rgba(255, 255, 255, 0.04)" : "transparent";
        }}
      >
        {/* Glowing Active Left Pillar Accent */}
        {active && (
          <span
            style={{
              position: "absolute",
              left: 0,
              top: "12%",
              bottom: "12%",
              width: 3.5,
              background: "#5DD62C",
              borderRadius: "0 4px 4px 0",
              boxShadow: "0 0 10px #5DD62C",
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
            gap: 12,
            padding: active ? "9px 6px 9px 14px" : "9px 6px 9px 12px",
            background: "transparent",
            border: "none",
            color: active ? "#FFFFFF" : "var(--sidebar-ink)",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          {Icon && (
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: active ? "rgba(93, 214, 44, 0.22)" : "rgba(255, 255, 255, 0.08)",
                border: active ? "1px solid rgba(93, 214, 44, 0.4)" : "1px solid rgba(255, 255, 255, 0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                color: active ? "#5DD62C" : "#D4D4D4",
                transition: "all var(--transition-fast)",
              }}
            >
              <Icon size={20} />
            </div>
          )}
          <span
            style={{
              fontSize: 13.5,
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
                background: "#5DD62C",
                boxShadow: "0 0 6px #5DD62C",
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
              width: 32,
              height: 32,
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
              size={15}
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
            marginTop: 3,
            marginLeft: 26,
            paddingLeft: 12,
            borderLeft: "1.5px solid rgba(255,255,255,0.1)",
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
