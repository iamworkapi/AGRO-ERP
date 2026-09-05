import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import DataTable from "../components/common/DataTable";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import { useProducts } from "../features/products/useProducts";
import { useStockEntries } from "../features/stockEntries/useStockEntries";
import { toast } from "../utils/toast";
import { formatRate } from "../utils/formatters";

export default function Products() {
  const navigate = useNavigate();
  const { items, status, error, remove, load } = useProducts();
  const { entries: stockEntries } = useStockEntries();
  const [activeTab, setActiveTab] = useState("catalog"); // "catalog" | "barter_log"

  useEffect(() => {
    load();
  }, [load]);

  function handleDelete(id) {
    if (!window.confirm("Delete this product?")) return;
    remove(id).then(() => toast.success("Product deleted."));
  }

  function openEdit(product) {
    const pid = product.id || product._id;
    if (pid) navigate(`/products/${pid}`);
  }

  // Extract all product barter transactions issued against weighment slips
  const barterTransactions = useMemo(() => {
    const list = [];
    (stockEntries || []).forEach((entry) => {
      if (entry.purchasedProducts && entry.purchasedProducts.length > 0) {
        entry.purchasedProducts.forEach((p, idx) => {
          list.push({
            id: `${entry.id || entry._id}-${idx}`,
            date: entry.createdAt,
            slipNo: entry.slipNo || "—",
            partyName: entry.partyName || "Farmer / Vendor",
            vehicleNo: entry.vehicleNo || "—",
            warehouseName: entry.warehouse?.name || "Assigned Warehouse",
            productName: p.productName || "Product",
            quantity: p.quantity,
            unit: p.unit || "PCS",
            rate: p.rate,
            amount: p.amount,
          });
        });
      }
    });
    return list;
  }, [stockEntries]);

  const columns = [
    {
      header: "Code",
      body: (row) => (
        <span style={{ fontWeight: 700, fontSize: 12.5, color: "var(--primary-deep)" }}>
          {row.productCode || "—"}
        </span>
      ),
    },
    {
      header: "Product",
      body: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {row.image ? (
            <img
              src={row.image}
              alt={row.name}
              style={{
                width: 38,
                height: 38,
                borderRadius: 8,
                objectFit: "cover",
                border: "1px solid var(--line)",
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 8,
                background: "var(--primary-tint)",
                color: "var(--primary-deep)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                flexShrink: 0,
                border: "1px solid rgba(93, 214, 44, 0.15)",
              }}
            >
              <i className="ri-box-3-line" />
            </div>
          )}
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: "var(--ink)" }}>{row.name}</div>
            {row.category && (
              <div style={{ fontSize: 11, color: "var(--muted)" }}>{row.category}</div>
            )}
          </div>
        </div>
      ),
      sortable: true,
    },
    { header: "HSN/SAC", body: (row) => row.hsnCode || "—" },
    { header: "Category", body: (row) => row.category || "—" },
    { header: "Unit", body: (row) => row.unit },
    { header: "Rate", body: (row) => `₹${formatRate(row.defaultRate)}` },
    {
      header: "Available Stock",
      body: (row) => {
        const stock = row.stockQty != null ? row.stockQty : 50;
        return (
          <Badge
            label={`${stock} ${row.unit}`}
            variant={stock > 10 ? "success" : stock > 0 ? "warning" : "danger"}
          />
        );
      },
    },
    {
      header: "Status",
      body: (row) => (
        <Badge label={row.status} variant={row.status === "ACTIVE" ? "success" : "secondary"} />
      ),
    },
    {
      header: "Actions",
      body: (row) => {
        const pid = row.id || row._id;
        return (
          <div style={{ display: "flex", gap: 6 }}>
            <Button variant="ghost" size="sm" onClick={() => openEdit(row)}>
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(pid)}
              style={{ color: "#EF4444" }}
            >
              Delete
            </Button>
          </div>
        );
      },
    },
  ];

  const barterColumns = [
    {
      header: "Date & Time",
      body: (r) => (
        <span style={{ fontSize: 12, color: "var(--ink)" }}>
          {new Date(r.date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      header: "Weighment Slip #",
      body: (r) => (
        <span style={{ fontWeight: 800, color: "var(--primary-deep)" }}>{r.slipNo}</span>
      ),
    },
    {
      header: "Product Issued",
      body: (r) => (
        <div>
          <strong style={{ color: "var(--ink)", display: "block" }}>{r.productName}</strong>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>
            {r.quantity} {r.unit} @ ₹{Number(r.rate).toLocaleString("en-IN")}
          </span>
        </div>
      ),
    },
    {
      header: "Taken By (Farmer / Vendor)",
      body: (r) => (
        <div>
          <strong style={{ color: "var(--ink)" }}>{r.partyName}</strong>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>Vehicle: {r.vehicleNo}</div>
        </div>
      ),
    },
    {
      header: "Total Value Deducted",
      body: (r) => (
        <strong style={{ color: "#d97706", fontSize: 13 }}>
          ₹{Number(r.amount).toLocaleString("en-IN")}
        </strong>
      ),
    },
    {
      header: "Warehouse Hub",
      body: (r) => <span style={{ fontSize: 11.5 }}>{r.warehouseName}</span>,
    },
    {
      header: "Adjustment Status",
      body: () => (
        <Badge label="Deducted in Slip" variant="success" />
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <PageHeader
        title="Products & Stock Management"
        subtitle="Manage product catalog, available stock, and track items issued against vendor weighment bills"
      />

      {/* Navigation Sub-Tabs */}
      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid var(--line)", paddingBottom: 8 }}>
        <button
          type="button"
          onClick={() => setActiveTab("catalog")}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: activeTab === "catalog" ? "1.5px solid var(--primary)" : "1px solid var(--line)",
            background: activeTab === "catalog" ? "var(--primary-tint)" : "var(--surface)",
            color: activeTab === "catalog" ? "var(--primary-deep)" : "var(--ink-secondary)",
            fontWeight: 700,
            fontSize: 12.5,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            transition: "all 150ms ease",
          }}
        >
          <i className="ri-box-3-line" /> Product Catalog ({items.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("barter_log")}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: activeTab === "barter_log" ? "1.5px solid var(--primary)" : "1px solid var(--line)",
            background: activeTab === "barter_log" ? "var(--primary-tint)" : "var(--surface)",
            color: activeTab === "barter_log" ? "var(--primary-deep)" : "var(--ink-secondary)",
            fontWeight: 700,
            fontSize: 12.5,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            transition: "all 150ms ease",
          }}
        >
          <i className="ri-history-line" /> Stock Barter / Issue Log ({barterTransactions.length})
        </button>
      </div>

      {status === "failed" && <p style={{ color: "var(--danger)" }}>{error}</p>}

      {activeTab === "catalog" ? (
        <DataTable
          title="Product Catalog & In-Stock Levels"
          columns={columns}
          rows={items}
          loading={status === "loading"}
          searchable
          searchPlaceholder="Search products, HSN, category..."
          emptyMessage="No products yet. Click 'Add Product' to create one."
          right={
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Button
                variant="secondary"
                size="sm"
                icon="ri-refresh-line"
                loading={status === "loading"}
                onClick={() => {
                  load();
                  toast.success("Products refreshed.");
                }}
                title="Refresh Products"
              >
                Refresh
              </Button>
              <Button
                size="sm"
                icon="ri-add-line"
                onClick={() => navigate("/products/create")}
              >
                Add Product
              </Button>
            </div>
          }
        />
      ) : (
        <DataTable
          title="Product Stock Issue & Weighment Barter Log"
          columns={barterColumns}
          rows={barterTransactions}
          searchable
          searchPlaceholder="Search slip, vendor, product, vehicle..."
          emptyMessage="No products have been issued against weighment slips yet."
        />
      )}
    </div>
  );
}
