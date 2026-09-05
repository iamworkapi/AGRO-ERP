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
        compact={true}
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
            width: "140px",
            render: (r) => (
              <span
                style={{
                  fontWeight: 800,
                  color: "var(--primary-deep)",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
                title="Click to view tax invoice"
              >
                <i className="ri-file-text-line" style={{ fontSize: 13, color: "var(--primary)" }} />
                {r.invoiceNo || r.supplierInvoiceNo || "—"}
              </span>
            ),
          },
          {
            key: "supplier",
            label: "Supplier",
            render: (r) => (
              <div>
                <div style={{ fontWeight: 700, color: "var(--ink)", fontSize: 12 }}>{r.supplier}</div>
                {r.supplierGstin && (
                  <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 1 }}>
                    GSTIN: {r.supplierGstin}
                  </div>
                )}
              </div>
            ),
          },
          {
            key: "consignee",
            label: "Consignee",
            render: (r) => (
              <div style={{ fontSize: 12, color: "var(--ink)" }}>
                {r.consignee || "—"}
              </div>
            ),
          },
          {
            key: "warehouse",
            label: "Warehouse",
            width: "130px",
            render: (r) => (
              <span style={{ fontSize: 11.5, color: "var(--ink-secondary)", fontWeight: 600 }}>
                {r.warehouse || "—"}
              </span>
            ),
          },
          {
            key: "grandTotal",
            label: "Grand Total (₹)",
            emphasize: true,
            width: "135px",
            align: "right",
            render: (r) => (
              <span style={{ fontWeight: 800, fontSize: 12.5, color: "var(--ink)" }}>
                ₹{Number(r.grandTotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            ),
          },
          {
            key: "status",
            label: "Status",
            width: "105px",
            align: "center",
            render: (r) => (
              <Badge tone={STATUS_TONE[r.status] || "info"}>
                {r.status}
              </Badge>
            ),
          },
          {
            key: "items",
            label: "Items",
            width: "85px",
            align: "center",
            render: (r) => (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  background: "var(--surface-hover)",
                  padding: "2px 7px",
                  borderRadius: 6,
                  border: "1px solid var(--line)",
                }}
              >
                {r.items?.length || 0} item{r.items?.length === 1 ? "" : "s"}
              </span>
            ),
          },
          {
            key: "invoiceDate",
            label: "Date",
            width: "95px",
            render: (r) =>
              r.invoiceDate || r.supplierInvoiceDate
                ? new Date(r.invoiceDate || r.supplierInvoiceDate).toLocaleDateString("en-IN")
                : "—",
          },
          {
            key: "actions",
            label: "Actions",
            width: "120px",
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
                  padding: "4px 10px",
                  fontSize: 11.5,
                  fontWeight: 700,
                  borderRadius: 6,
                  border: "1px solid var(--primary)",
                  background: "var(--primary-tint)",
                  color: "var(--primary-deep)",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  transition: "all 120ms ease",
                  whiteSpace: "nowrap",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "var(--primary)";
                  e.currentTarget.style.color = "#ffffff";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "var(--primary-tint)";
                  e.currentTarget.style.color = "var(--primary-deep)";
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
