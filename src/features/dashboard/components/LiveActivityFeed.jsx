import React from "react";
import { useState } from "react";
import { Scale, Truck, Shield, ClipboardList, Zap } from "lucide-react";
function LucideIconWrapper({ children, size }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: size, height: size, flexShrink: 0 }}>
      {children}
    </span>
  );
}


export default function LiveActivityFeed({ items = [], isSupervisor }) {
  const [filterType, setFilterType] = useState("all");

  const getIcon = (rawText, type) => {
    const text = String(rawText || "").toLowerCase();
    const t = String(type || "").toLowerCase();

    if (t === "weighment" || text.includes("weighment") || text.includes("slip") || text.includes("grn")) {
      return { Icon: Scale, bg: "#EFF6FF", color: "#2563EB", tag: "Weighbridge" };
    }
    if (t === "dispatch" || text.includes("dispatched") || text.includes("truck") || text.includes("trailer") || text.includes("gate pass")) {
      return { Icon: Truck, bg: "#FAF5FF", color: "#7E22CE", tag: "Dispatch" };
    }
    if (t === "inspection" || t === "safety" || text.includes("moisture") || text.includes("probe") || text.includes("temp")) {
      return { Icon: Shield, bg: "#ECFDF5", color: "#059669", tag: "Safety Check" };
    }
    if (t === "attendance" || text.includes("shift") || text.includes("attendance") || text.includes("staff")) {
      return { Icon: ClipboardList, bg: "#FFFBEB", color: "#D97706", tag: "Shift Attendance" };
    }
    return { Icon: Zap, bg: "#F1F5F9", color: "#475569", tag: "Event" };
  };

  const safeItems = Array.isArray(items) ? items : [];

  const filteredItems = safeItems.filter((item) => {
    if (filterType === "all") return true;
    const text = String(item.text || item.title || "").toLowerCase();
    const t = String(item.type || "").toLowerCase();
    if (filterType === "weighment") return t === "weighment" || text.includes("weighment") || text.includes("slip") || text.includes("grn");
    if (filterType === "dispatch") return t === "dispatch" || text.includes("dispatch") || text.includes("truck");
    if (filterType === "safety") return t === "inspection" || t === "safety" || text.includes("probe") || text.includes("temp") || text.includes("moisture");
    if (filterType === "attendance") return t === "attendance" || text.includes("shift") || text.includes("attendance");
    return true;
  });

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: 18,
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.04)",
      }}
    >
      {/* Header & Category Filters */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 900, color: "var(--ink)", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#D97706" }}>⚡</span> Live Operational Activity Feed
          </h3>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>
            {isSupervisor ? "Real-time field ground operations & slip logging" : "Consolidated enterprise audit & movement stream"}
          </span>
        </div>

        {/* Filter Pills */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[
            { key: "all", label: "All Events" },
            { key: "weighment", label: "Weighbridge" },
            { key: "dispatch", label: "Dispatches" },
            { key: "safety", label: "Probes" },
            { key: "attendance", label: "Staff Shift" },
          ].map((f) => {
            const active = filterType === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilterType(f.key)}
                style={{
                  border: active ? "1px solid var(--primary)" : "1px solid var(--line)",
                  padding: "4px 10px",
                  fontSize: 10.5,
                  fontWeight: active ? 800 : 600,
                  borderRadius: 20,
                  background: active ? "var(--primary-tint)" : "var(--canvas)",
                  color: active ? "var(--primary-deep)" : "var(--muted)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Activity List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filteredItems.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px 0", color: "var(--muted)", fontSize: 12 }}>
            No recent events match the selected filter.
          </div>
        ) : (
          filteredItems.map((item, i) => {
            const displayText = item.text || item.title || "Operational event recorded";
            const meta = getIcon(displayText, item.type);

            return (
              <div
                key={item.id || i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: "var(--canvas)",
                  border: "1px solid var(--line)",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--surface)";
                  e.currentTarget.style.borderColor = meta.color;
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--canvas)";
                  e.currentTarget.style.borderColor = "var(--line)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: meta.bg,
                      color: meta.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      flexShrink: 0,
                    }}
                  >
                    <LucideIconWrapper size={14}>{React.createElement(meta.Icon, { size: 14 })}</LucideIconWrapper>
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 12.5,
                          fontWeight: 700,
                          color: "var(--ink)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {displayText}
                      </p>
                      <span
                        style={{
                          fontSize: 9.5,
                          fontWeight: 800,
                          color: meta.color,
                          background: meta.bg,
                          padding: "1px 6px",
                          borderRadius: 6,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.tag || meta.tag}
                      </span>
                    </div>

                    {item.details && (
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--muted)",
                          marginTop: 2,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.details}
                      </div>
                    )}
                  </div>
                </div>

                <span
                  style={{
                    fontSize: 11,
                    color: "var(--muted)",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {item.time || "Recent"}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
