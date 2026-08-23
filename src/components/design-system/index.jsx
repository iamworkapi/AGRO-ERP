import React from "react";
import { motion } from "framer-motion";

/* ============================================================
   DS-ICONS — Lucide icon wrapper with consistent sizing
   ============================================================ */

function DsIcon({ children, size = 18, className = "" }) {
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        flexShrink: 0,
      }}
    >
      {React.cloneElement(children, { size })}
    </span>
  );
}

export { DsIcon };

/* ============================================================
   ANIMATION PRESETS — reusable motion variants
   ============================================================ */

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i = 0) => ({
    opacity: 1,
    transition: { delay: i * 0.06, duration: 0.35, ease: "easeOut" },
  }),
};

export const slideUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  }),
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: (i = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.06, duration: 0.3, ease: "easeOut" },
  }),
};

export function AnimatePresenceWrapper({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.3, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

/* ============================================================
   COMPACT CARD — unified card primitive
   ============================================================ */

export function Card({
  title,
  subtitle,
  icon,
  right,
  children,
  className = "",
  style = {},
  hover = false,
}) {
  return (
    <motion.div
      variants={fadeIn}
      className={`ds-card ${className}`}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
        transition: hover
          ? "transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s ease, border-color 0.25s ease"
          : "none",
        ...style,
      }}
      whileHover={hover ? { y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.06)" } : undefined}
    >
      {(title || right || subtitle) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 16px",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {icon && (
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 7,
                  background: "var(--primary-tint)",
                  color: "var(--primary-deep)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {icon}
              </span>
            )}
            <div>
              {title && (
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--ink)",
                    letterSpacing: "0.01em",
                    lineHeight: 1.2,
                    display: "block",
                  }}
                >
                  {title}
                </span>
              )}
              {subtitle && (
                <span style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.3 }}>
                  {subtitle}
                </span>
              )}
            </div>
          </div>
          {right}
        </div>
      )}
      <div style={{ padding: "14px 16px" }}>{children}</div>
    </motion.div>
  );
}

/* ============================================================
   STAT CARD — KPI stat display
   ============================================================ */

export function StatCard({ label, value, trend, icon, color = "var(--primary)", progressPct }) {
  return (
    <motion.div variants={slideUp} className="ds-card" style={{ padding: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>
          {label}
        </span>
        <span
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: `${color}18`,
            color,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
        {value}
      </div>
      {trend && (
        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>{trend}</div>
      )}
      {typeof progressPct === "number" && (
        <div
          style={{
            width: "100%",
            height: 4,
            background: "var(--line)",
            borderRadius: 2,
            marginTop: 10,
            overflow: "hidden",
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, progressPct)}%` }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            style={{
              height: "100%",
              background: color,
              borderRadius: 2,
              boxShadow: `0 0 8px ${color}50`,
            }}
          />
        </div>
      )}
    </motion.div>
  );
}

/* ============================================================
   QUICK ACTION BUTTON — compact pill button
   ============================================================ */

export function QuickAction({ icon, label, onClick, color = "var(--primary)", variant = "solid" }) {
  const isSolid = variant === "solid";
  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -1 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "7px 12px",
        fontSize: 12,
        fontWeight: 600,
        borderRadius: 8,
        border: isSolid ? "none" : `1px solid ${color}40`,
        background: isSolid ? color : `${color}12`,
        color: isSolid ? "#fff" : color,
        cursor: "pointer",
        whiteSpace: "nowrap",
        boxShadow: isSolid ? `0 2px 8px ${color}30` : "none",
        transition: "all 0.2s ease",
      }}
    >
      <span style={{ display: "inline-flex" }}>{icon}</span>
      {label}
    </motion.button>
  );
}

/* ============================================================
   EMPTY STATE — unified empty data placeholder
   ============================================================ */

export function EmptyState({ icon, title, description, action }) {
  return (
    <motion.div
      variants={fadeIn}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
        textAlign: "center",
      }}
    >
      <span style={{ fontSize: 32, marginBottom: 10, opacity: 0.35 }}>{icon}</span>
      <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", margin: "0 0 4px" }}>{title}</p>
      {description && (
        <p style={{ fontSize: 12, color: "var(--muted)", maxWidth: 280, margin: "0 0 14px" }}>{description}</p>
      )}
      {action}
    </motion.div>
  );
}

/* ============================================================
   SECTION HEADER — consistent page section titles
   ============================================================ */

export function SectionHeader({ title, subtitle, action, badge }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 14,
        gap: 12,
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.01em" }}>
            {title}
          </h2>
          {badge && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 10,
                background: "var(--primary-tint)",
                color: "var(--primary-deep)",
                border: "1px solid var(--primary-light)30",
              }}
            >
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--muted)" }}>{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

/* ============================================================
   BADGE — status/type chip
   ============================================================ */

export function Badge({ children, color = "var(--primary)", bg = "var(--primary-tint)", size = "sm" }) {
  const isSm = size === "sm";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: isSm ? "2px 7px" : "3px 10px",
        borderRadius: 6,
        fontSize: isSm ? 10.5 : 11.5,
        fontWeight: 600,
        background: bg,
        color,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

/* ============================================================
   TABLE WRAPPER — compact data table with hover
   ============================================================ */

export function DataTable({ columns, rows, rowKey = "id", onRowClick, emptyTitle, emptyDesc }) {
  if (!rows?.length) {
    return (
      <div style={{ textAlign: "center", padding: "24px 16px", color: "var(--muted)" }}>
        <p style={{ fontSize: 13, fontWeight: 600, margin: "0 0 4px", color: "var(--ink-secondary)" }}>{emptyTitle || "No records found"}</p>
        {emptyDesc && <p style={{ fontSize: 12, margin: 0 }}>{emptyDesc}</p>}
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table
        className="data-table"
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 12.5,
        }}
      >
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  textAlign: col.align || "left",
                  fontWeight: 600,
                  color: "var(--muted)",
                  fontSize: 10.5,
                  textTransform: "uppercase",
                  letterSpacing: "0.4px",
                  padding: "8px 8px",
                  borderBottom: "1px solid var(--line)",
                  width: col.width,
                  minWidth: col.minWidth,
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <motion.tr
              key={row[rowKey] || idx}
              variants={fadeIn}
              custom={idx}
              initial="hidden"
              animate="visible"
              onClick={() => onRowClick?.(row)}
              style={{
                cursor: onRowClick ? "pointer" : "default",
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  style={{
                    textAlign: col.align || "left",
                    padding: "8px 8px",
                    color: col.color || "var(--ink)",
                    borderTop: "1px solid var(--line)",
                    fontWeight: col.bold ? 700 : 400,
                  }}
                >
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ============================================================
   STAGGER CONTAINER — wraps children with staggered entrance
   ============================================================ */

export function StaggerContainer({ children, className = "" }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className={className}
      style={{ display: "contents" }}
    >
      {React.Children.map(children, (child, i) =>
        React.cloneElement(child, { variants: slideUp, custom: i })
      )}
    </motion.div>
  );
}
