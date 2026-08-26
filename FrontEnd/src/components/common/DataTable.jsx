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
  leftHeader,
  right,
  searchable = true,
  searchPlaceholder = "Search records...",
  paginator = false,
  rowsPerPage = 10,
  exportable = false,
  exportFilename = "agro_export",
  compact = false,
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

  function handleExportCSV() {
    if (!rows || rows.length === 0) return;
    const headerRow = columns.map((c) => `"${c.label || c.key}"`).join(",");
    const bodyRows = rows.map((r) =>
      columns
        .map((c) => {
          const val = r[c.key];
          return `"${String(val !== undefined && val !== null ? val : "").replace(/"/g, '""')}"`;
        })
        .join(",")
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headerRow, ...bodyRows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${exportFilename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const hasHeader = Boolean(title || subtitle || leftHeader || right || searchable || exportable);

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: 16,
        boxShadow: "var(--shadow-sm)",
        overflow: "hidden",
        ...style,
      }}
      className={`app-datatable ${className}`}
    >
      {/* Unified Single-Row Compact Header */}
      {hasHeader && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: compact ? "8px 14px" : "10px 16px",
            borderBottom: "1px solid var(--line)",
            gap: 12,
            flexWrap: "wrap",
            background: "var(--surface)",
          }}
        >
          {/* Left Side: Title or Custom Left Header (like Tab Ribbon) */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
            {leftHeader}
            {title && !leftHeader && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)", margin: 0, letterSpacing: 0.1 }}>
                    {title}
                  </h3>
                  {rows.length > 0 && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "var(--primary)",
                        background: "var(--primary-tint)",
                        padding: "1px 7px",
                        borderRadius: 10,
                      }}
                    >
                      {rows.length}
                    </span>
                  )}
                </div>
                {subtitle && (
                  <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "var(--muted)" }}>{subtitle}</p>
                )}
              </div>
            )}
          </div>

          {/* Right Side: Search + CSV Export + Custom Action Slot */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginLeft: "auto" }}>
            {searchable && (
              <div style={{ position: "relative", minWidth: 170 }}>
                <i
                  className="ri-search-line"
                  style={{
                    position: "absolute",
                    left: 9,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 13,
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
                    height: 32,
                    padding: "0 8px 0 28px",
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
                {globalFilter && (
                  <button
                    type="button"
                    onClick={() => setGlobalFilter("")}
                    style={{
                      position: "absolute",
                      right: 6,
                      top: "50%",
                      transform: "translateY(-50%)",
                      border: "none",
                      background: "transparent",
                      color: "var(--muted)",
                      cursor: "pointer",
                      padding: 0,
                      fontSize: 13,
                    }}
                  >
                    <i className="ri-close-line" />
                  </button>
                )}
              </div>
            )}

            {exportable && (
              <button
                type="button"
                onClick={handleExportCSV}
                title="Export records to CSV"
                style={{
                  height: 32,
                  padding: "0 10px",
                  borderRadius: 8,
                  border: "1px solid var(--line-strong)",
                  background: "var(--canvas)",
                  color: "var(--ink)",
                  fontSize: 11.5,
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                }}
                onMouseOver={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                onMouseOut={(e) => (e.currentTarget.style.borderColor = "var(--line-strong)")}
              >
                <i className="ri-download-2-line" /> CSV
              </button>
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
            <div style={{ padding: "28px 16px", textAlign: "center", color: "var(--muted)" }}>
              <i className="ri-inbox-line" style={{ fontSize: 28, marginBottom: 6, display: "block", color: "var(--muted)", opacity: 0.5 }} />
              <span style={{ fontSize: 12.5, fontWeight: 600 }}>{emptyMessage}</span>
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
                ...(col.emphasize ? { color: "var(--ink)", fontWeight: 700 } : {}),
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
