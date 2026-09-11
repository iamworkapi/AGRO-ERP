import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import DataTable from "../components/common/DataTable";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import { useGoods } from "../features/goods/useGoods";
import PrintableInvoiceModal from "../components/goods/PrintableInvoiceModal";

const STATUS_TONE = {
  Purchased: "info",
  "In Stock": "success",
  Dispatched: "warning",
  Sold: "success",
  Cancelled: "danger",
};

export default function Goods() {
  const navigate = useNavigate();
  const { items, status, error } = useGoods();
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const statusCounts = useMemo(() => {
    const counts = {};
    items.forEach((g) => {
      counts[g.status] = (counts[g.status] || 0) + 1;
    });
    return counts;
  }, [items]);

  const totalValue = useMemo(() => {
    return items.reduce((sum, g) => sum + (Number(g.grandTotal) || 0), 0);
  }, [items]);

  const filteredItems = useMemo(() => {
    if (statusFilter === "ALL") return items;
    return items.filter((g) => g.status === statusFilter);
  }, [items, statusFilter]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <PageHeader
        title="Goods & Invoices"
        subtitle="Track purchased goods, GST tax invoices, and warehouse stock records"
      />

      {/* Compact Quick KPI & Filter Ribbon */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10,
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: 12,
          padding: "10px 14px",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        {/* Left: Summary Metrics */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600 }}>Total Invoices:</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)" }}>{items.length}</span>
          </div>

          <div style={{ width: 1, height: 16, background: "var(--line)" }} />

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600 }}>Total Registered Value:</span>
            <span style={{ fontSize: 14, fontWeight: 900, color: "var(--primary-deep)" }}>
              ₹{totalValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Right: Quick Filter Pills */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            style={{
              padding: "4px 10px",
              borderRadius: 16,
              fontSize: 11.5,
              fontWeight: 700,
              border: statusFilter === "ALL" ? "1.5px solid var(--primary)" : "1px solid var(--line-strong)",
              background: statusFilter === "ALL" ? "var(--primary-tint)" : "var(--surface)",
              color: statusFilter === "ALL" ? "var(--primary-deep)" : "var(--ink)",
              cursor: "pointer",
              transition: "all 120ms ease",
            }}
          >
            All ({items.length})
          </button>

          {Object.entries(STATUS_TONE).map(([s, tone]) => {
            const count = statusCounts[s] || 0;
            if (count === 0 && statusFilter !== s) return null;
            const isSelected = statusFilter === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(isSelected ? "ALL" : s)}
                style={{
                  padding: "4px 10px",
                  borderRadius: 16,
                  fontSize: 11.5,
                  fontWeight: 700,
                  border: isSelected ? `1.5px solid var(--status-${tone === "info" ? "info" : tone === "warning" ? "warning" : tone === "success" ? "success" : "error"})` : "1px solid var(--line)",
                  background: isSelected ? `var(--status-${tone === "info" ? "info" : tone === "warning" ? "warning" : tone === "success" ? "success" : "error"}-tint)` : "var(--surface)",
                  color: `var(--status-${tone === "info" ? "info" : tone === "warning" ? "warning" : tone === "success" ? "success" : "error"})`,
                  cursor: "pointer",
                  transition: "all 120ms ease",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <span>{s}</span>
                <span
                  style={{
                    background: isSelected ? `var(--status-${tone === "info" ? "info" : tone === "warning" ? "warning" : tone === "success" ? "success" : "error"})` : "var(--line)",
                    color: isSelected ? "#ffffff" : "var(--ink-secondary)",
                    fontSize: 10,
                    fontWeight: 800,
                    borderRadius: 10,
                    padding: "1px 6px",
                    lineHeight: "14px",
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Register Table (Compact, clean single card) */}
      <DataTable
        title="Goods Register"
        subtitle="Click any row or click 'View / PDF' to inspect and print tax invoice"
        icon="ri-file-list-3-line"
        keyField="_id"
        rows={filteredItems}
        onRowClick={(e) => setSelectedInvoice(e.data)}
        exportable
        exportFilename="goods_register"
        right={
          <Button
            onClick={() => navigate("/goods/create")}
            style={{
              height: 34,
              padding: "0 14px",
              fontSize: 12,
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              whiteSpace: "nowrap",
            }}
          >
            <i className="ri-add-line" style={{ fontSize: 14 }} /> Add Goods / Invoice
          </Button>
        }
        columns={[
          {
            key: "invoiceNo",
            label: "Invoice No.",
            emphasize: true,
            width: "155px",
            render: (r) => (
              <div
                className="invoice-code-badge"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 9px",
                  borderRadius: 6,
                  background: "var(--primary-tint)",
                  color: "var(--primary-deep)",
                  fontSize: 11.5,
                  fontWeight: 800,
                  fontFamily: "var(--font-mono, monospace)",
                  border: "1px solid rgba(51, 116, 24, 0.18)",
                  cursor: "pointer",
                }}
                title="Click to view tax invoice"
              >
                <i className="ri-file-text-line" style={{ fontSize: 13, color: "var(--primary)" }} />
                <span>{r.invoiceNo || r.supplierInvoiceNo || "—"}</span>
              </div>
            ),
          },
          {
            key: "supplier",
            label: "Supplier",
            render: (r) => (
              <div style={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: 260 }}>
                <span style={{ fontWeight: 700, color: "var(--ink)", fontSize: 12.5, lineHeight: 1.35 }}>
                  {r.supplier || "—"}
                </span>
                {r.supplierGstin && (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 800,
                        letterSpacing: "0.3px",
                        padding: "1px 4px",
                        borderRadius: 3,
                        background: "var(--canvas)",
                        color: "var(--muted)",
                        border: "1px solid var(--line)",
                      }}
                    >
                      GSTIN
                    </span>
                    <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono, monospace)" }}>
                      {r.supplierGstin}
                    </span>
                  </div>
                )}
              </div>
            ),
          },
          {
            key: "consignee",
            label: "Consignee",
            render: (r) => (
              <div style={{ fontSize: 12, color: "var(--ink-secondary)", fontWeight: 500, lineHeight: 1.35, maxWidth: 220 }}>
                {r.consignee || "—"}
              </div>
            ),
          },
          {
            key: "warehouse",
            label: "Warehouse",
            width: "135px",
            render: (r) => (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: "var(--ink-secondary)",
                  background: "var(--canvas)",
                  padding: "3px 8px",
                  borderRadius: 6,
                  border: "1px solid var(--line)",
                  whiteSpace: "nowrap",
                }}
              >
                <i className="ri-store-2-line" style={{ color: "var(--primary)", fontSize: 12 }} />
                {r.warehouse || "—"}
              </span>
            ),
          },
          {
            key: "grandTotal",
            label: "Grand Total (₹)",
            emphasize: true,
            width: "145px",
            align: "right",
            render: (r) => (
              <div style={{ textAlign: "right" }}>
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: 13,
                    color: "var(--ink)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  ₹{Number(r.grandTotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            ),
          },
          {
            key: "status",
            label: "Status",
            width: "115px",
            align: "center",
            render: (r) => {
              const tone = STATUS_TONE[r.status] || "info";
              return (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "3px 9px",
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    background: `var(--status-${tone === "info" ? "info" : tone === "warning" ? "warning" : tone === "success" ? "success" : "error"}-tint)`,
                    color: `var(--status-${tone === "info" ? "info" : tone === "warning" ? "warning" : tone === "success" ? "success" : "error"})`,
                    border: `1px solid var(--status-${tone === "info" ? "info" : tone === "warning" ? "warning" : tone === "success" ? "success" : "error"}-tint)`,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: `var(--status-${tone === "info" ? "info" : tone === "warning" ? "warning" : tone === "success" ? "success" : "error"})`,
                    }}
                  />
                  {r.status || "Purchased"}
                </span>
              );
            },
          },
          {
            key: "items",
            label: "Items",
            width: "95px",
            align: "center",
            render: (r) => (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--ink-secondary)",
                  background: "var(--canvas)",
                  padding: "3px 8px",
                  borderRadius: 6,
                  border: "1px solid var(--line)",
                  whiteSpace: "nowrap",
                }}
              >
                <i className="ri-box-3-line" style={{ color: "var(--muted)", fontSize: 12 }} />
                {r.items?.length || 0} {r.items?.length === 1 ? "item" : "items"}
              </span>
            ),
          },
          {
            key: "invoiceDate",
            label: "Date",
            width: "115px",
            align: "center",
            render: (r) => {
              const raw = r.invoiceDate || r.supplierInvoiceDate;
              if (!raw) return "—";
              const dateObj = new Date(raw);
              const formatted = isNaN(dateObj.getTime())
                ? String(raw)
                : dateObj.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
              return (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: "var(--ink-secondary)",
                    whiteSpace: "nowrap",
                  }}
                >
                  <i className="ri-calendar-line" style={{ color: "var(--muted)", fontSize: 12 }} />
                  {formatted}
                </span>
              );
            },
          },
          {
            key: "actions",
            label: "Actions",
            width: "125px",
            align: "center",
            render: (r) => (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedInvoice(r);
                }}
                title="View & Print Tax Invoice PDF"
                style={{
                  padding: "5px 12px",
                  fontSize: 11.5,
                  fontWeight: 700,
                  borderRadius: 7,
                  border: "1px solid var(--line-strong)",
                  background: "var(--surface)",
                  color: "var(--primary-deep)",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  transition: "all 140ms ease",
                  whiteSpace: "nowrap",
                  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "var(--primary)";
                  e.currentTarget.style.color = "#ffffff";
                  e.currentTarget.style.borderColor = "var(--primary)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "var(--surface)";
                  e.currentTarget.style.color = "var(--primary-deep)";
                  e.currentTarget.style.borderColor = "var(--line-strong)";
                }}
              >
                <i className="ri-printer-line" style={{ fontSize: 13 }} />
                <span>View / PDF</span>
              </button>
            ),
          },
        ]}
      />

      {/* Printable GST Tax Invoice Modal */}
      <PrintableInvoiceModal
        isOpen={Boolean(selectedInvoice)}
        onClose={() => setSelectedInvoice(null)}
        invoice={selectedInvoice}
      />
    </div>
  );
}
