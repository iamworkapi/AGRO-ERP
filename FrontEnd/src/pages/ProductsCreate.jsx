import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import FormField from "../components/common/FormField";
import Button from "../components/common/Button";
import { useProducts } from "../features/products/useProducts";
import { getProduct } from "../features/products/api";
import { toast } from "../utils/toast";
import { parseRateValue, formatRate } from "../utils/formatters";

const CATEGORY_OPTIONS = [
  { label: "Equipment & Tools", value: "Equipment & Tools" },
  { label: "Machine", value: "Machine" },
  { label: "Fertilizers", value: "Fertilizers" },
  { label: "Agro Chemicals", value: "Agro Chemicals" },
  { label: "Seeds", value: "Seeds" },
  { label: "Raw Materials", value: "Raw Materials" },
  { label: "Packaging Materials", value: "Packaging Materials" },
  { label: "Other", value: "Other" },
];

const EMPTY_FORM = {
  name: "",
  description: "",
  hsnCode: "",
  category: "Equipment & Tools",
  unit: "PCS",
  defaultRate: "",
  stockQty: "50",
  image: "",
  status: "ACTIVE",
};

export default function ProductsCreate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id && id !== "create" && id !== "undefined");
  const { add, update, load } = useProducts();
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(isEdit);
  const [imagePreview, setImagePreview] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  useEffect(() => {
    if (!isEdit) return;
    setLoadingProduct(true);
    getProduct(id)
      .then((product) => {
        if (product) {
          setForm({
            name: product.name || "",
            description: product.description || "",
            hsnCode: product.hsnCode || "",
            category: product.category || "Equipment & Tools",
            unit: product.unit || "BAGS",
            defaultRate: product.defaultRate != null && product.defaultRate !== "" ? formatRate(product.defaultRate) : "",
            stockQty: product.stockQty != null ? String(product.stockQty) : "0",
            image: product.image || "",
            status: product.status || "ACTIVE",
          });
          setImagePreview(product.image || "");
        }
      })
      .catch(() => toast.error("Could not load product."))
      .finally(() => setLoadingProduct(false));
  }, [id, isEdit]);

  function processFile(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose a valid image file (JPG, PNG, WEBP).");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      set("image")(reader.result);
      setImagePreview(reader.result);
      toast.success("Image uploaded.");
    };
    reader.readAsDataURL(file);
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    processFile(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleRemoveImage() {
    set("image")("");
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleDefaultRateChange(val) {
    const raw = String(val ?? "").replace(/,/g, ".");
    if (raw === "" || /^[0-9]*\.?[0-9]*$/.test(raw)) {
      set("defaultRate")(raw);
    }
  }

  function handleDefaultRateBlur() {
    if (!form.defaultRate) return;
    set("defaultRate")(formatRate(form.defaultRate));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Product name is required.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        hsnCode: form.hsnCode.trim(),
        category: form.category.trim(),
        unit: form.unit,
        defaultRate: parseRateValue(form.defaultRate),
        stockQty: form.stockQty !== "" ? Number(form.stockQty) : 0,
        image: form.image,
        status: form.status,
      };
      if (isEdit) {
        await update({ id, payload });
        toast.success("Product updated successfully.");
      } else {
        await add(payload);
        toast.success("Product created successfully.");
      }
      load();
      navigate("/products");
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || err.message || "Could not save product.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingProduct) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 60, gap: 10 }}>
        <div style={{ width: 24, height: 24, border: "2.5px solid var(--line-strong)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <p style={{ color: "var(--muted)", margin: 0, fontWeight: 600 }}>Loading product details...</p>
      </div>
    );
  }

  const categoryOptions = CATEGORY_OPTIONS.some((o) => o.value === form.category)
    ? CATEGORY_OPTIONS
    : form.category
    ? [{ label: form.category, value: form.category }, ...CATEGORY_OPTIONS]
    : CATEGORY_OPTIONS;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <button
        type="button"
        onClick={() => navigate("/products")}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          border: "none",
          background: "transparent",
          padding: 0,
          fontSize: 12.5,
          fontWeight: 600,
          color: "var(--ink-secondary)",
          cursor: "pointer",
          width: "fit-content",
        }}
        onMouseOver={(e) => (e.currentTarget.style.color = "var(--primary-deep)")}
        onMouseOut={(e) => (e.currentTarget.style.color = "var(--ink-secondary)")}
      >
        <i className="ri-arrow-left-line-long" /> Back to Products Catalog
      </button>

      <PageHeader
        title={isEdit ? "Edit Product" : "Add Product"}
        subtitle={isEdit ? "Update product specifications, rate, and media" : "Create a new product in your agricultural catalog"}
      />

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <Card
          title="Product Information"
          subtitle="Core identification, taxonomy, and pricing"
          icon="ri-box-3-line"
        >
          <div className="responsive-grid-2" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "14px 18px" }}>
            <FormField
              label="Product Name"
              required
              layout="vertical"
              value={form.name}
              onChange={set("name")}
              placeholder="e.g. Premium Organic Manure"
            />
            <FormField
              label="HSN/SAC Code"
              layout="vertical"
              value={form.hsnCode}
              onChange={set("hsnCode")}
              placeholder="e.g. 3105"
            />
          </div>

          <div className="responsive-grid-2" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "14px 18px", marginTop: 14 }}>
            <FormField
              label="Category"
              type="select"
              layout="vertical"
              value={form.category}
              onChange={set("category")}
              options={categoryOptions}
            />
            <FormField
              label="Status"
              type="select"
              layout="vertical"
              value={form.status}
              onChange={set("status")}
              options={[
                { label: "Active", value: "ACTIVE" },
                { label: "Inactive", value: "INACTIVE" },
              ]}
            />
          </div>

          <div className="responsive-grid-2" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: "14px 18px", marginTop: 14 }}>
            <FormField
              label="Unit of Measure"
              type="select"
              layout="vertical"
              value={form.unit}
              onChange={set("unit")}
              options={[
                { label: "Pcs (Standard)", value: "PCS" },
                { label: "Bags", value: "BAGS" },
                { label: "Kg", value: "KG" },
                { label: "Quintal", value: "QUINTAL" },
                { label: "Box", value: "BOX" },
                { label: "Litres", value: "LITRES" },
              ]}
            />
            <FormField
              label="Default Rate"
              type="text"
              inputMode="decimal"
              layout="vertical"
              value={form.defaultRate}
              onChange={handleDefaultRateChange}
              onBlur={handleDefaultRateBlur}
              placeholder="0.00"
              suffix="₹"
            />
            <FormField
              label="Available Stock Quantity"
              type="number"
              min="0"
              layout="vertical"
              value={form.stockQty}
              onChange={set("stockQty")}
              placeholder="0"
              help="Items available in warehouse for issuance/barter"
            />
          </div>

          <div style={{ marginTop: 14 }}>
            <FormField
              label="Description & Specifications"
              type="textarea"
              layout="vertical"
              rows={3}
              value={form.description}
              onChange={set("description")}
              placeholder="Provide a detailed product description, composition, or storage instructions..."
            />
          </div>
        </Card>

        {/* Product Media Card */}
        <Card
          title="Product Image"
          subtitle="Upload high quality product packaging or item photography"
          icon="ri-image-line"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
          />

          {imagePreview ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                padding: 16,
                borderRadius: 14,
                border: "1px dashed var(--line-strong)",
                background: "var(--canvas)",
              }}
            >
              <div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 12,
                  overflow: "hidden",
                  border: "1px solid var(--line)",
                  background: "#fff",
                  boxShadow: "var(--shadow-sm)",
                  flexShrink: 0,
                  position: "relative",
                }}
              >
                <img
                  src={imagePreview}
                  alt="Product Preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                <div>
                  <h4 style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)", margin: 0 }}>
                    Product Media Ready
                  </h4>
                  <p style={{ fontSize: 11.5, color: "var(--muted)", margin: "2px 0 0" }}>
                    Image successfully loaded and attached to catalog entry.
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: "1px dashed var(--line-strong)",
                      background: "var(--surface)",
                      color: "var(--ink)",
                      padding: "5px 12px",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      transition: "all 150ms ease",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = "var(--primary)";
                      e.currentTarget.style.color = "var(--primary-deep)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = "var(--line-strong)";
                      e.currentTarget.style.color = "var(--ink)";
                    }}
                  >
                    <i className="ri-exchange-line" /> Change Image
                  </button>

                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    style={{
                      border: "none",
                      background: "rgba(239, 68, 68, 0.08)",
                      color: "var(--status-error)",
                      padding: "5px 12px",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      transition: "all 150ms ease",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = "var(--status-error)";
                      e.currentTarget.style.color = "#FFFFFF";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)";
                      e.currentTarget.style.color = "var(--status-error)";
                    }}
                  >
                    <i className="ri-delete-bin-line" /> Remove
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              style={{
                border: isDragging ? "1.5px dashed var(--primary)" : "1px dashed var(--line-strong)",
                borderRadius: 14,
                background: isDragging ? "var(--primary-tint)" : "var(--canvas)",
                padding: "28px 20px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 180ms ease",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
              onMouseOver={(e) => {
                if (!isDragging) {
                  e.currentTarget.style.borderColor = "var(--primary)";
                  e.currentTarget.style.background = "rgba(93, 214, 44, 0.02)";
                }
              }}
              onMouseOut={(e) => {
                if (!isDragging) {
                  e.currentTarget.style.borderColor = "var(--line-strong)";
                  e.currentTarget.style.background = "var(--canvas)";
                }
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: "var(--primary-tint)",
                  color: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  boxShadow: "0 2px 8px rgba(51, 116, 24, 0.08)",
                }}
              >
                <i className="ri-upload-cloud-2-line" />
              </div>

              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>
                  Click to browse or drag and drop product image
                </div>
                <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>
                  PNG, JPG, WEBP formats up to 2 MB
                </div>
              </div>
            </div>
          )}
        </Card>

        <div className="action-section-yellow" style={{ marginTop: 8 }}>
          <Button
            variant="secondary"
            type="button"
            onClick={() => navigate("/products")}
            style={{ background: "#FFFFFF", color: "#0F0F0F", border: "1px solid rgba(0,0,0,0.15)", fontWeight: 700 }}
          >
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {isEdit ? "Update" : "Create"} Product
          </Button>
        </div>
      </form>
    </div>
  );
}
