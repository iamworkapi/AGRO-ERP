import { useLocation, useNavigate } from "react-router-dom";
import SidebarLink from "./SidebarLink";

function sectionMeta(section, groupPath) {
  return typeof section === "string" ? { label: section, path: groupPath } : section;
}

export function isGroupActive(pathname, groupPath) {
  if (groupPath === "/") return pathname === "/";
  return pathname === groupPath || pathname.startsWith(`${groupPath}/`);
}

export default function SidebarGroup({ group, collapsed, searchTerm, isOpen, onToggleOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const active = isGroupActive(location.pathname, group.path);

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
  const sectionCount = allSections.length;

  if (collapsed) {
    return (
      <button
        onClick={() => navigate(group.path)}
        title={`${group.label}${sectionCount > 1 ? ` (${sectionCount})` : ""}`}
        style={{
          width: "100%",
          height: 38,
          marginBottom: 2,
          borderRadius: 8,
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
        <i className={group.icon || "ri-checkbox-blank-circle-line"} style={{ fontSize: 18 }} />
        {group.badge && (
          <span
            style={{
              position: "absolute",
              top: 6,
              right: 10,
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#5DD62C",
              boxShadow: "0 0 6px #5DD62C",
            }}
          />
        )}
      </button>
    );
  }

  return (
    <div style={{ marginBottom: 2, position: "relative" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          borderRadius: 8,
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
        {active && (
          <span
            style={{
              position: "absolute",
              left: 0,
              top: "12%",
              bottom: "12%",
              width: 3,
              background: "#5DD62C",
              borderRadius: "0 3px 3px 0",
              boxShadow: "0 0 8px #5DD62C",
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
            padding: active ? "7px 6px 7px 12px" : "7px 6px 7px 10px",
            background: "transparent",
            border: "none",
            color: active ? "#FFFFFF" : "var(--sidebar-ink)",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
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
            <i className={group.icon || "ri-checkbox-blank-circle-line"} style={{ fontSize: 15 }} />
          </div>

          <span
            style={{
              fontSize: 12.5,
              fontWeight: active ? 700 : 500,
              letterSpacing: "0.02em",
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
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "#5DD62C",
                boxShadow: "0 0 5px #5DD62C",
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
              width: 28,
              height: 28,
              marginRight: 3,
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
            <i
              className="ri-arrow-down-s-line"
              style={{
                fontSize: 13,
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform var(--transition-fast)",
              }}
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
            marginLeft: 20,
            paddingLeft: 10,
            borderLeft: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {visibleSections.map(({ label, path }) => (
            <SidebarLink
              key={path}
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
