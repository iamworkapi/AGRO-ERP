import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import DataTable from "../components/common/DataTable";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import { useProducts } from "../features/products/useProducts";
import { toast } from "../utils/toast";
import { formatRate } from "../utils/formatters";

export default function Products() {
  const navigate = useNavigate();
  const { items, status, error, remove, load } = useProducts();

  useEffect(() => { load(); }, [load]);

  function handleDelete(id) {
    if (!window.confirm("Delete this product?")) return;
    remove(id).then(() => toast.success("Product deleted."));
  }

  function openEdit(product) {
    const pid = product.id || product._id;
    if (pid) navigate(`/products/${pid}`);
  }

  const columns = [
    { header: "Code", body: (row) => <span style={{ fontWeight: 700, fontSize: 12.5, color: "var(--primary-deep)" }}>{row.productCode || "—"}</span> },
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
    { header: "Status", body: (row) => <Badge label={row.status} variant={row.status === "ACTIVE" ? "success" : "secondary"} /> },
    {
      header: "Actions",
      body: (row) => {
        const pid = row.id || row._id;
        return (
          <div style={{ display: "flex", gap: 6 }}>
            <Button variant="ghost" size="sm" onClick={() => openEdit(row)}>Edit</Button>
            <Button variant="ghost" size="sm" onClick={() => handleDelete(pid)} style={{ color: "#EF4444" }}>Delete</Button>
          </div>
        );
      },
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <PageHeader
        title="Products"
        subtitle="Manage your product catalog — description, HSN/SAC, rates, and images"
      />

      {status === "failed" && (
        <p style={{ color: "var(--danger)" }}>{error}</p>
      )}

      <DataTable
        title="Product Catalog"
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
    </div>
  );
}
