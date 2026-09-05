import { useState, useMemo } from "react";
import { DataTable as PrimeDataTable } from "primereact/datatable";
import { Column } from "primereact/column";

export default function DataTable({
  columns = [],
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
  rowsPerPageOptions = [10, 20, 50],
  exportable = false,
  exportFilename = "agro_export",
  compact = false,
  loading = false,
  className = "",
  style = {},
  onRowClick,
}) {
  const [globalFilter, setGlobalFilter] = useState("");

  const filteredRows = useMemo(() => {
    if (!globalFilter.trim()) return rows;
    const query = globalFilter.toLowerCase().trim();
    return rows.filter((row) =>
      Object.values(row).some((val) =>
        String(val || "").toLowerCase().includes(query)
      )
    );
  }, [rows, globalFilter]);

  const showPaginator = paginator || rows.length > rowsPerPage;

  function resolveCol(key, fallback) {
    return key != null ? key : fallback;
  }

  function handleExportCSV() {
    if (!rows || rows.length === 0) return;
    const headerRow = columns.map((c) => `"${resolveCol(c.label, c.header, c.key)}"`).join(",");
    const bodyRows = rows.map((r) =>
      columns
        .map((c) => {
          let val;
          if (c.body && typeof c.body === "function") {
            val = c.body(r);
          } else {
            val = r[c.key];
          }
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
        borderRadius: 18,
        boxShadow: "var(--shadow-sm)",
        overflow: "hidden",
        position: "relative",
        ...style,
      }}
      className={`app-datatable ${className}`}
    >
      {/* Header Bar */}
      {hasHeader && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: compact ? "10px 14px" : "12px 18px",
            borderBottom: "1px solid var(--line)",
            gap: 12,
            flexWrap: "wrap",
            background: "linear-gradient(180deg, var(--surface-hover) 0%, var(--surface) 100%)",
          }}
        >
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
                        fontSize: 10.5,
                        fontWeight: 800,
                        color: "var(--primary)",
                        background: "var(--primary-tint)",
                        padding: "2px 8px",
                        borderRadius: 10,
                        lineHeight: "16px",
                      }}
                    >
                      {globalFilter ? `${filteredRows.length} / ${rows.length}` : rows.length}
                    </span>
                  )}
                </div>
                {subtitle && (
                  <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "var(--muted)" }}>{subtitle}</p>
                )}
              </div>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
            {searchable && (
              <div style={{ position: "relative" }}>
                <i
                  className="ri-search-line"
                  style={{
                    position: "absolute",
                    left: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 13,
                    color: globalFilter ? "var(--primary)" : "var(--muted)",
                    pointerEvents: "none",
                    transition: "color 150ms ease",
                  }}
                />
                <input
                  type="text"
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  placeholder={searchPlaceholder}
                  style={{
                    width: "clamp(220px, 24vw, 320px)",
                    minWidth: 220,
                    height: 32,
                    padding: "0 28px 0 30px",
                    fontSize: 12,
                    borderRadius: 8,
                    border: globalFilter ? "1.5px solid var(--primary)" : "1px solid var(--line-strong)",
                    background: "var(--surface)",
                    color: "var(--ink)",
                    outline: "none",
                    transition: "all 150ms ease",
                    fontFamily: "inherit",
                    boxShadow: globalFilter ? "0 0 0 2px var(--primary-tint)" : "none",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--primary)";
                    e.target.style.boxShadow = "0 0 0 3px var(--primary-tint)";
                  }}
                  onBlur={(e) => {
                    if (!globalFilter) {
                      e.target.style.borderColor = "var(--line-strong)";
                      e.target.style.boxShadow = "none";
                    }
                  }}
                />
                {globalFilter && (
                  <button
                    type="button"
                    onClick={() => setGlobalFilter("")}
                    title="Clear filter"
                    style={{
                      position: "absolute",
                      right: 6,
                      top: "50%",
                      transform: "translateY(-50%)",
                      border: "none",
                      background: "transparent",
                      color: "var(--muted)",
                      cursor: "pointer",
                      padding: "2px 4px",
                      fontSize: 13,
                      lineHeight: 1,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <i className="ri-close-circle-fill" style={{ color: "var(--muted)" }} />
                  </button>
                )}
              </div>
            )}

            {exportable && (
              <button
                type="button"
                onClick={handleExportCSV}
                title="Export to CSV"
                style={{
                  height: 34,
                  padding: "0 12px",
                  borderRadius: 10,
                  border: "1px solid var(--line-strong)",
                  background: "var(--surface)",
                  color: "var(--ink)",
                  fontSize: 12,
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  cursor: "pointer",
                  transition: "all 150ms ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = "var(--primary)";
                  e.currentTarget.style.background = "var(--primary-tint)";
                  e.currentTarget.style.color = "var(--primary-deep)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = "var(--line-strong)";
                  e.currentTarget.style.background = "var(--surface)";
                  e.currentTarget.style.color = "var(--ink)";
                }}
              >
                <i className="ri-download-2-line" style={{ fontSize: 13 }} />
                <span>CSV</span>
              </button>
            )}

            {right}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="table-responsive" style={{ position: "relative" }}>
        {loading && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(255, 255, 255, 0.7)",
              backdropFilter: "blur(2px)",
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                border: "3px solid var(--primary-tint)",
                borderTopColor: "var(--primary)",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)" }}>Loading data...</span>
          </div>
        )}

        <PrimeDataTable
          value={filteredRows}
          dataKey={keyField}
          rowClassName={(row) => `pr-datatable-row ${rowStyle?.(row) ? "pr-row-highlight" : ""} ${onRowClick ? "pr-row-clickable" : ""}`}
          emptyMessage={
            <div style={{ padding: "44px 16px", textAlign: "center", color: "var(--muted)" }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: "var(--primary-tint)",
                  color: "var(--primary)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                  marginBottom: 12,
                  boxShadow: "0 4px 12px rgba(51, 116, 24, 0.08)",
                }}
              >
                <i className={globalFilter ? "ri-search-eye-line" : "ri-inbox-2-line"} />
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink-secondary)", marginBottom: 4 }}>
                {globalFilter ? "No matching records found" : emptyMessage}
              </div>
              {globalFilter && (
                <div style={{ marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => setGlobalFilter("")}
                    style={{
                      border: "none",
                      background: "var(--primary-tint)",
                      color: "var(--primary-deep)",
                      fontWeight: 700,
                      fontSize: 12,
                      padding: "5px 14px",
                      borderRadius: 8,
                      cursor: "pointer",
                    }}
                  >
                    Clear Search Query
                  </button>
                </div>
              )}
            </div>
          }
          size="small"
          showGridlines={false}
          stripedRows
          paginator={showPaginator}
          rows={rowsPerPage}
          rowsPerPageOptions={rowsPerPageOptions}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="{first}-{last} of {totalRecords}"
          className={`pr-datatable-organic ${compact ? "pr-datatable-compact" : ""}`}
          onRowClick={onRowClick}
          rowHover
        >
          {columns.map((col, idx) => {
            const headerText = resolveCol(col.label, col.header, col.key);
            const hasBodyRenderer = typeof col.body === "function";
            const hasRender = typeof col.render === "function";
            const align = col.align || (col.numeric ? "right" : "left");

            return (
              <Column
                key={col.key || headerText || idx}
                field={col.key}
                header={headerText}
                sortable={col.sortable ?? false}
                body={
                  hasBodyRenderer
                    ? (row) => col.body(row)
                    : hasRender
                    ? (row) => col.render(row)
                    : undefined
                }
                bodyStyle={{
                  textAlign: align,
                  ...(col.emphasize ? { color: "var(--ink)", fontWeight: 700 } : {}),
                  ...(col.width ? { width: col.width } : {}),
                  ...(col.style || {}),
                }}
                headerStyle={{
                  textAlign: align,
                  justifyContent: align === "right" ? "flex-end" : align === "center" ? "center" : "flex-start",
                  whiteSpace: "nowrap",
                  wordBreak: "keep-all",
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  color: "var(--muted)",
                  background: "var(--surface-hover)",
                  padding: compact ? "8px 12px" : "11px 14px",
                  borderBottom: "2px solid var(--line)",
                  ...(col.width ? { width: col.width } : {}),
                  ...(col.headerStyle || {}),
                }}
                style={{
                  padding: compact ? "8px 12px" : "11px 14px",
                }}
              />
            );
          })}
        </PrimeDataTable>
      </div>
    </div>
  );
}
