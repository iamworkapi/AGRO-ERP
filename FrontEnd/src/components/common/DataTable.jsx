import { useState } from "react";
import { DataTable as PrimeDataTable } from "primereact/datatable";
import { Column } from "primereact/column";

export default function DataTable({
  columns,
  rows = [],
  keyField = "id",
  rowStyle,
  emptyMessage = "No records found.",
  title,
  subtitle,
  right,
  searchable = true,
  searchPlaceholder = "Search records...",
  paginator = false,
  rowsPerPage = 10,
  className = "",
  style = {},
}) {
  const [globalFilter, setGlobalFilter] = useState("");

  const filteredRows = globalFilter
    ? rows.filter((row) =>
        Object.values(row).some((val) =>
          String(val || "").toLowerCase().includes(globalFilter.toLowerCase())
        )
      )
    : rows;

  const showPaginator = paginator || rows.length > rowsPerPage;

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: 14,
        boxShadow: "var(--shadow-sm)",
        overflow: "hidden",
        ...style,
      }}
      className={className}
    >
      {/* Compact Section Header */}
      {(title || right || searchable) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 18px",
            borderBottom: "1px solid var(--line)",
            gap: 12,
            flexWrap: "wrap",
            background: "var(--surface)",
          }}
        >
          {title && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", margin: 0, letterSpacing: 0.1 }}>
                {title}
              </h3>
              {rows.length > 0 && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--primary-deep)",
                    background: "var(--primary-tint)",
                    padding: "2px 8px",
                    borderRadius: 10,
                  }}
                >
                  {rows.length} {rows.length === 1 ? "record" : "records"}
                </span>
              )}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginLeft: "auto" }}>
            {searchable && (
              <div style={{ position: "relative", minWidth: 180 }}>
                <i
                  className="fa-solid fa-magnifying-glass"
                  style={{
                    position: "absolute",
                    left: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 12,
                    color: "var(--muted)",
                  }}
                />
                <input
                  type="text"
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  placeholder={searchPlaceholder}
                  style={{
                    width: "100%",
                    padding: "6px 10px 6px 30px",
                    fontSize: 12,
                    borderRadius: 8,
                    border: "1px solid var(--line-strong)",
                    background: "var(--canvas)",
                    color: "var(--ink)",
                    outline: "none",
                    transition: "all var(--transition-fast)",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--primary)";
                    e.target.style.background = "var(--surface)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "var(--line-strong)";
                    e.target.style.background = "var(--canvas)";
                  }}
                />
              </div>
            )}

            {right}
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="table-responsive">
        <PrimeDataTable
          value={filteredRows}
          dataKey={keyField}
          rowClassName={(row) => (rowStyle?.(row) ? "pr-row-highlight" : undefined)}
          emptyMessage={
            <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--muted)" }}>
              <i className="fa-solid fa-folder-open" style={{ fontSize: 24, marginBottom: 6, display: "block", color: "var(--faint)" }} />
              <span style={{ fontSize: 12.5 }}>{emptyMessage}</span>
            </div>
          }
          size="small"
          showGridlines
          stripedRows
          paginator={showPaginator}
          rows={rowsPerPage}
          className="pr-datatable-compact"
        >
          {columns.map((col) => (
            <Column
              key={col.key}
              field={col.key}
              header={col.label}
              sortable={false}
              body={col.render ? (row, options) => col.render(row, options) : undefined}
              bodyStyle={{
                ...(col.emphasize ? { color: "var(--ink)", fontWeight: 600 } : {}),
                ...(col.style || {}),
              }}
              headerStyle={{ whiteSpace: "nowrap", wordBreak: "keep-all", ...(col.headerStyle || {}) }}
            />
          ))}
        </PrimeDataTable>
      </div>
    </div>
  );
}
