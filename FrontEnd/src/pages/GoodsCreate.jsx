import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import FormField from "../components/common/FormField";
import Button from "../components/common/Button";
import { useGoods } from "../features/goods/useGoods";
import { useWarehouses } from "../features/warehouses/useWarehouses";
import { useProducts } from "../features/products/useProducts";
import { fetchNextSupplierInvoiceNo } from "../features/goods/api";
import { toast } from "../utils/toast";
import { parseRateValue, numberToWordsINR } from "../utils/formatters";

function emptyLineItem() {
  return { productId: "", description: "", hsnCode: "", quantity: "", unit: "PCS", rate: "", discountPct: "0" };
}

const FROZEN_DESTINATION = {
  company: "KUSUM GANGA AGROSOLUTIONS PVT LTD",
  address: "24 A SAI KRIPA COMPLEX, PREMCHAND PARK, GORAKHPUR",
  gstin: "09AALCK4355J1Z2",
  stateName: "Uttar Pradesh",
  stateCode: "09",
  contact: "6393294600",
  email: "KUSUMGANGA5@GMAIL.COM",
};

function emptyForm() {
  const year = new Date().getFullYear();
  const defaultSupplier = localStorage.getItem("default_supplier_name") || "";
  const defaultSupplierGstin = localStorage.getItem("default_supplier_gstin") || "";

  return {
    supplierInvoiceNo: `GINV-${year}-0001`,
    supplierInvoiceDate: new Date().toISOString().slice(0, 10),
    ewayBillNo: "",
    supplier: defaultSupplier,
    supplierGstin: defaultSupplierGstin,
    consignee: "",
    consigneeGstin: "",
    consigneeAddress: "",
    warehouse: "6a73021e0658dc94fc89bdc8",
    totalItemAmount: "",
    cgstPct: "0",
    sgstPct: "0",
    igstPct: "0",
    grandTotal: "",
    amountInWords: "",
    notes: "",
    items: [emptyLineItem()],
  };
}

export default function GoodsCreate() {
  const navigate = useNavigate();
  const { add } = useGoods();
  const { warehouses } = useWarehouses();
  const { items: products, load: loadProducts } = useProducts();
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [manualAmountInWords, setManualAmountInWords] = useState(false);

  useEffect(() => {
    loadProducts();
    fetchNextSupplierInvoiceNo()
      .then((seqNo) => {
        if (seqNo) setForm((f) => ({ ...f, supplierInvoiceNo: seqNo }));
      })
      .catch((err) => {
        console.warn("Could not fetch next supplier invoice number:", err);
      });
  }, [loadProducts]);

  useEffect(() => {
    if (warehouses && warehouses.length > 0) {
      const match =
        warehouses.find(
          (w) =>
            w.name?.toLowerCase().includes("gorakhpur") ||
            w.name?.toLowerCase().includes("kusum") ||
            w.name?.toLowerCase().includes("betia")
        ) || warehouses[0];
      if (match) {
        setForm((f) => ({
          ...f,
          warehouse: match._id || match.id || f.warehouse,
        }));
      }
    }
  }, [warehouses]);

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  function handleSupplierChange(val) {
    setForm((f) => ({ ...f, supplier: val, consignee: val }));
    if (val && val.trim()) {
      localStorage.setItem("default_supplier_name", val.trim());
    }
  }

  function handleSupplierGstinChange(val) {
    const sanitized = (val || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 15);
    setForm((f) => ({ ...f, supplierGstin: sanitized, consigneeGstin: sanitized }));
    if (sanitized.trim()) {
      localStorage.setItem("default_supplier_gstin", sanitized.trim());
    }
  }

  function clearConsignee() {
    setForm((f) => ({ ...f, consignee: "" }));
  }

  function clearConsigneeGstin() {
    setForm((f) => ({ ...f, consigneeGstin: "" }));
  }

  const lineItems = form.items || [emptyLineItem()];

  function updateLineItem(idx, key, val) {
    setForm((f) => ({
      ...f,
      items: f.items.map((it, i) => (i === idx ? { ...it, [key]: val } : it)),
    }));
  }

  function addLineItem() {
    setForm((f) => ({ ...f, items: [...f.items, emptyLineItem()] }));
  }

  function removeLineItem(idx) {
    setForm((f) => {
      const remaining = f.items.filter((_, i) => i !== idx);
      return {
        ...f,
        items: remaining.length > 0 ? remaining : [emptyLineItem()],
      };
    });
  }

  const itemTotals = useMemo(() => {
    return lineItems.reduce((sum, it) => {
      const qty = parseFloat(String(it.quantity).replace(/,/g, ".")) || 0;
      const rate = parseRateValue(it.rate);
      const disc = parseFloat(String(it.discountPct).replace(/,/g, ".")) || 0;
      const lineAmt = disc > 0 ? qty * rate * (1 - disc / 100) : qty * rate;
      return sum + lineAmt;
    }, 0);
  }, [lineItems]);

  const cgst = itemTotals * (parseFloat(form.cgstPct) || 0) / 100;
  const sgst = itemTotals * (parseFloat(form.sgstPct) || 0) / 100;
  const igst = itemTotals * (parseFloat(form.igstPct) || 0) / 100;
  const grandTotal = itemTotals + cgst + sgst + igst;

  useEffect(() => {
    if (!manualAmountInWords) {
      if (grandTotal > 0) {
        setForm((f) => ({ ...f, amountInWords: numberToWordsINR(grandTotal) }));
      } else {
        setForm((f) => ({ ...f, amountInWords: "" }));
      }
    }
  }, [grandTotal, manualAmountInWords]);

  const warehouseOptions = useMemo(
    () => warehouses.map((w) => ({ label: w.name, value: w._id })),
    [warehouses]
  );

  const productOptions = useMemo(() => {
    return (products || []).map((p) => ({
      label: p.name,
      value: p.id || p._id,
    }));
  }, [products]);

  function handleProductSelect(idx, productId) {
    if (!productId) {
      setForm((f) => ({
        ...f,
        items: f.items.map((it, i) =>
          i === idx
            ? {
                ...it,
                productId: "",
                description: "",
                hsnCode: "",
                rate: "",
              }
            : it
        ),
      }));
      return;
    }
    const product = products.find((p) => (p.id || p._id) === productId || p.name === productId);
    if (!product) return;
    const pid = product.id || product._id;
    const defaultRate =
      product.defaultRate != null && !isNaN(Number(product.defaultRate))
        ? Number(product.defaultRate).toFixed(2)
        : "";
    setForm((f) => ({
      ...f,
      items: f.items.map((it, i) =>
        i === idx
          ? {
              ...it,
              productId: pid,
              description: product.name,
              hsnCode: product.hsnCode || it.hsnCode || "",
              unit: product.unit || it.unit || "PCS",
              rate: defaultRate || it.rate,
            }
          : it
      ),
    }));
  }

  function handleQuantityChange(idx, val) {
    const raw = String(val ?? "").trim();
    if (raw === "") {
      updateLineItem(idx, "quantity", "");
      return;
    }
    if (raw.includes("-")) return;
    const num = parseFloat(raw);
    if (!isNaN(num) && num >= 0) {
      updateLineItem(idx, "quantity", raw);
    }
  }

  function handleQuantityBlur(idx) {
    setForm((f) => ({
      ...f,
      items: f.items.map((it, i) => {
        if (i !== idx) return it;
        if (it.quantity === "" || it.quantity == null) return it;
        const num = Math.max(0, parseFloat(it.quantity) || 0);
        return { ...it, quantity: String(num) };
      }),
    }));
  }

  function handleDiscountChange(idx, val) {
    const raw = String(val ?? "").trim();
    if (raw === "") {
      updateLineItem(idx, "discountPct", "");
      return;
    }
    if (raw.includes("-")) return;
    const num = parseFloat(raw);
    if (!isNaN(num) && num >= 0 && num <= 100) {
      updateLineItem(idx, "discountPct", raw);
    }
  }

  function handleRateChange(idx, val) {
    const raw = String(val ?? "").replace(/,/g, ".");
    if (raw === "" || /^[0-9]*\.?[0-9]*$/.test(raw)) {
      updateLineItem(idx, "rate", raw);
    }
  }

  function handleRateBlur(idx) {
    setForm((f) => ({
      ...f,
      items: f.items.map((it, i) => {
        if (i !== idx) return it;
        if (it.rate === "" || it.rate == null) return it;
        const val = parseRateValue(it.rate);
        return { ...it, rate: val.toFixed(2) };
      }),
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.invoiceNo?.trim()) {
      toast.error("Invoice number is required.");
      return;
    }
    if (form.supplierGstin?.trim() && form.supplierGstin.trim().length !== 15) {
      toast.error("Supplier GSTIN must be exactly 15 alphanumeric characters (e.g. 27AAHCM1258Q1ZW).");
      return;
    }
    if (form.consigneeGstin?.trim() && form.consigneeGstin.trim().length !== 15) {
      toast.error("Consignee GSTIN must be exactly 15 alphanumeric characters (e.g. 27AAHCM1258Q1ZW).");
      return;
    }
    const activeWarehouse =
      warehouses.find((w) => String(w._id || w.id) === String(form.warehouse)) ||
      warehouses.find(
        (w) =>
          w.name?.toLowerCase().includes("gorakhpur") ||
          w.name?.toLowerCase().includes("kusum") ||
          w.name?.toLowerCase().includes("betia")
      ) ||
      warehouses[0];
    const activeWarehouseId = form.warehouse || activeWarehouse?._id || activeWarehouse?.id || "6a73021e0658dc94fc89bdc8";
    const activeWarehouseName = activeWarehouse?.name || "Betia Hata Gorakhpur";

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        warehouse: activeWarehouseName,
        warehouseId: activeWarehouseId,
        consignee: form.consignee || form.supplier || FROZEN_DESTINATION.company,
        consigneeGstin: form.consigneeGstin || form.supplierGstin || "",
        consigneeAddress: form.consigneeAddress || "",
        items: lineItems.map((it) => {
          const qty = Math.max(0, parseFloat(String(it.quantity).replace(/,/g, ".")) || 0);
          const rate = parseRateValue(it.rate);
          const disc = Math.min(100, Math.max(0, parseFloat(String(it.discountPct).replace(/,/g, ".")) || 0));
          return {
            description: it.description,
            hsnCode: it.hsnCode,
            quantity: qty,
            unit: it.unit || "PCS",
            rate: rate,
            amount: qty * rate,
            discountPct: disc,
          };
        }),
        totalItemAmount: Math.round(itemTotals * 100) / 100,
        taxAmount: Math.round((cgst + sgst + igst) * 100) / 100,
        grandTotal: Math.round(grandTotal * 100) / 100,
        amountInWords: form.amountInWords || numberToWordsINR(grandTotal),
        status: "Purchased",
      };
      if (form.supplier?.trim()) localStorage.setItem("default_supplier_name", form.supplier.trim());
      if (form.supplierGstin?.trim()) localStorage.setItem("default_supplier_gstin", form.supplierGstin.trim());
      await add(payload);
      toast.success("Invoice saved successfully.");
      navigate("/goods");
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || err.message || "Could not save invoice.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Back link */}
      <button
        type="button"
        onClick={() => navigate("/goods")}
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
        }}
        onMouseOver={(e) => (e.currentTarget.style.color = "var(--primary-deep)")}
        onMouseOut={(e) => (e.currentTarget.style.color = "var(--ink-secondary)")}
      >
        <i className="ri-arrow-left-line-long" /> Back to Goods Register
      </button>

      <PageHeader title="Add Invoice" subtitle="Record a new purchase invoice — goods will be tracked through the multi-customer sales pipeline" />

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {/* Invoice Header */}
        <Card
          title="Invoice Details"
          subtitle="Essential invoice identification and supplier information"
          icon="ri-file-text-line"
        >
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: "14px 18px" }}>
            <FormField
              label="Supplier Invoice No."
              required
              layout="vertical"
              value={form.supplierInvoiceNo}
              onChange={set("supplierInvoiceNo")}
              placeholder="GINV-2026-0001"
            />
            <FormField
              label="Supplier Invoice Date"
              type="date"
              required
              layout="vertical"
              value={form.supplierInvoiceDate}
              onChange={set("supplierInvoiceDate")}
            />
            <FormField
              label="E-Way Bill No."
              layout="vertical"
              value={form.ewayBillNo}
              onChange={set("ewayBillNo")}
              placeholder="e.g. 35222217356994"
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "14px 18px", marginTop: 14 }}>
            <FormField
              label="Supplier Name"
              required
              layout="vertical"
              value={form.supplier}
              onChange={handleSupplierChange}
              placeholder="e.g. KUSUM GANGA AGROSOLUTIONS"
            />

            <FormField
              label="Supplier GSTIN (15-digit)"
              layout="vertical"
              maxLength={15}
              value={form.supplierGstin}
              onChange={handleSupplierGstinChange}
              placeholder="e.g. 27AAHCM1258Q1ZW"
            />
          </div>
        </Card>

        {/* Consignee */}
        <Card
          title="Consignee (Ship to)"
          subtitle="Recipient delivery address and shipping details"
          icon="ri-truck-line"
        >
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "14px 18px" }}>
            <div style={{ position: "relative" }}>
              <FormField
                label="Consignee Name"
                layout="vertical"
                value={form.consignee}
                onChange={set("consignee")}
                placeholder="Same as Supplier Name"
              />
              {Boolean(form.consignee) && (
                <button
                  type="button"
                  onClick={clearConsignee}
                  title="Clear consignee name"
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 0,
                    border: "none",
                    background: "rgba(239, 68, 68, 0.08)",
                    color: "var(--status-error)",
                    width: 22,
                    height: 22,
                    borderRadius: 5,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
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
                  <i className="ri-delete-bin-line" style={{ fontSize: 13 }} />
                </button>
              )}
            </div>

            <div style={{ position: "relative" }}>
              <FormField
                label="Consignee GSTIN (15-digit)"
                layout="vertical"
                maxLength={15}
                value={form.consigneeGstin}
                onChange={(val) => setForm((f) => ({ ...f, consigneeGstin: (val || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 15) }))}
                placeholder="Same as Supplier GSTIN"
              />
              {Boolean(form.consigneeGstin) && (
                <button
                  type="button"
                  onClick={clearConsigneeGstin}
                  title="Clear consignee GSTIN"
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 0,
                    border: "none",
                    background: "rgba(239, 68, 68, 0.08)",
                    color: "var(--status-error)",
                    width: 22,
                    height: 22,
                    borderRadius: 5,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
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
                  <i className="ri-delete-bin-line" style={{ fontSize: 13 }} />
                </button>
              )}
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <FormField
              label="Consignee Address"
              layout="vertical"
              value={form.consigneeAddress}
              onChange={set("consigneeAddress")}
              placeholder="Full physical delivery address with city and pincode..."
            />
          </div>
        </Card>

        {/* Warehouse & Destination (Frozen / Non-editable) */}
        <Card
          title={
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", flexWrap: "wrap", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <i className="ri-building-2-line" style={{ color: "var(--primary)", fontSize: 17 }} />
                <span style={{ fontWeight: 700 }}>Warehouse &amp; Destination</span>
              </div>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 11,
                  fontWeight: 800,
                  color: "var(--primary-deep)",
                  background: "var(--primary-tint)",
                  padding: "3px 10px",
                  borderRadius: 12,
                  letterSpacing: "0.4px",
                  textTransform: "uppercase",
                  border: "1px solid rgba(27, 94, 58, 0.2)",
                }}
              >
                <i className="ri-lock-fill" style={{ fontSize: 12 }} />
                Frozen &amp; Default Selected
              </span>
            </div>
          }
          subtitle="Fixed receiving hub & company destination (locked for consistency)"
          icon="ri-store-2-line"
        >
          <div
            style={{
              background: "var(--surface)",
              border: "1px dashed var(--line-strong)",
              borderRadius: 12,
              padding: "16px 18px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {/* Header: Company Name and Verified badge */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                paddingBottom: 12,
                borderBottom: "1px dashed var(--line)",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 800,
                    color: "var(--muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    display: "block",
                    marginBottom: 3,
                  }}
                >
                  Receiving Entity / Destination
                </span>
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: "var(--ink)",
                    letterSpacing: "0.01em",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <i className="ri-building-4-line" style={{ color: "var(--primary)" }} />
                  {FROZEN_DESTINATION.company}
                </span>
              </div>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  background: "rgba(16, 185, 129, 0.08)",
                  color: "#059669",
                  padding: "4px 10px",
                  borderRadius: 6,
                  fontSize: 11.5,
                  fontWeight: 700,
                }}
              >
                <i className="ri-checkbox-circle-fill" /> Active Destination
              </div>
            </div>

            {/* Structured Details Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "14px 20px",
              }}
            >
              <div>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.4px", display: "block" }}>
                  Address
                </span>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)", marginTop: 2, display: "block", lineHeight: 1.45 }}>
                  24 A SAI KRIPA COMPLEX<br />
                  PREMCHAND PARK<br />
                  GORAKHPUR
                </span>
              </div>

              <div>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.4px", display: "block" }}>
                  GSTIN
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--primary-deep)", marginTop: 2, display: "block", fontFamily: "monospace", letterSpacing: "0.5px" }}>
                  {FROZEN_DESTINATION.gstin}
                </span>
              </div>

              <div>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.4px", display: "block" }}>
                  State Name &amp; Code
                </span>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)", marginTop: 2, display: "block" }}>
                  {FROZEN_DESTINATION.stateName}, Code : {FROZEN_DESTINATION.stateCode}
                </span>
              </div>

              <div>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.4px", display: "block" }}>
                  Contact
                </span>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)", marginTop: 2, display: "flex", alignItems: "center", gap: 5 }}>
                  <i className="ri-phone-line" style={{ color: "var(--muted)" }} />
                  {FROZEN_DESTINATION.contact}
                </span>
              </div>

              <div>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.4px", display: "block" }}>
                  E-Mail
                </span>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)", marginTop: 2, display: "flex", alignItems: "center", gap: 5 }}>
                  <i className="ri-mail-line" style={{ color: "var(--muted)" }} />
                  {FROZEN_DESTINATION.email}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Products */}
        <Card
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <i className="ri-box-3-line" style={{ color: "var(--primary)", fontSize: 16 }} />
              <span>Products</span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "var(--primary-deep)",
                  background: "var(--primary-tint)",
                  padding: "2px 8px",
                  borderRadius: 12,
                }}
              >
                {lineItems.length} {lineItems.length === 1 ? "item" : "items"}
              </span>
            </div>
          }
          right={
            <button
              type="button"
              onClick={addLineItem}
              style={{
                background: "var(--primary-tint)",
                border: "1px dashed var(--primary)",
                borderRadius: 9,
                padding: "6px 14px",
                color: "var(--primary-deep)",
                fontWeight: 700,
                fontSize: 12,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                transition: "all 150ms ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "var(--primary)";
                e.currentTarget.style.color = "#FFFFFF";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "var(--primary-tint)";
                e.currentTarget.style.color = "var(--primary-deep)";
              }}
            >
              <i className="ri-add-line" style={{ fontSize: 14 }} />
              <span>Add Product</span>
            </button>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {lineItems.map((it, idx) => {
              const qty = parseFloat(String(it.quantity).replace(/,/g, ".")) || 0;
              const rate = parseRateValue(it.rate);
              const disc = parseFloat(String(it.discountPct).replace(/,/g, ".")) || 0;
              const lineAmount = qty * rate;
              const rowTotal = lineAmount * (1 - disc / 100);

              return (
                <div
                  key={idx}
                  style={{
                    background: "var(--canvas)",
                    border: "1px dashed var(--line-strong)",
                    borderRadius: 12,
                    padding: "12px 14px",
                    position: "relative",
                    transition: "border-color 150ms ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 8,
                      borderBottom: "1px dashed var(--line)",
                      paddingBottom: 6,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: "var(--muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <span
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 6,
                          background: "var(--primary-tint)",
                          color: "var(--primary-deep)",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 10,
                          fontWeight: 900,
                        }}
                      >
                        {idx + 1}
                      </span>
                      Product Entry
                    </span>

                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600 }}>
                        Amount:{" "}
                        <strong style={{ color: "var(--ink)", fontWeight: 800 }}>
                          ₹{(lineAmount || 0).toFixed(2)}
                        </strong>
                      </span>

                      <button
                        type="button"
                        onClick={() => removeLineItem(idx)}
                        style={{
                          background: "rgba(239, 68, 68, 0.08)",
                          border: "none",
                          borderRadius: 6,
                          color: "var(--status-error)",
                          cursor: "pointer",
                          fontSize: 11.5,
                          fontWeight: 700,
                          padding: "3px 8px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 3,
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
                        title="Delete product entry"
                      >
                        <i className="ri-delete-bin-line" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "2fr 0.9fr 0.9fr 0.9fr 0.8fr 1.1fr",
                      gap: 12,
                      alignItems: "start",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: 11,
                          fontWeight: 700,
                          color: "var(--muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.4px",
                          marginBottom: 4,
                        }}
                      >
                        Product <span style={{ color: "var(--status-error)" }}>*</span>
                      </label>
                      <FormField
                        type="select"
                        value={it.productId || ""}
                        onChange={(v) => handleProductSelect(idx, v)}
                        options={productOptions}
                        placeholder="Product Name"
                        filter
                        showClear
                        compact
                        marginBottom={0}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: 11,
                          fontWeight: 700,
                          color: "var(--muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.4px",
                          marginBottom: 4,
                        }}
                      >
                        HSN / SAC
                      </label>
                      <FormField
                        value={it.hsnCode}
                        onChange={(v) => updateLineItem(idx, "hsnCode", v)}
                        placeholder="HSN Code"
                        compact
                        marginBottom={0}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: 11,
                          fontWeight: 700,
                          color: "var(--muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.4px",
                          marginBottom: 4,
                        }}
                      >
                        Quantity <span style={{ color: "var(--status-error)" }}>*</span>
                      </label>
                      <FormField
                        type="number"
                        min="0"
                        required
                        value={it.quantity}
                        onChange={(v) => handleQuantityChange(idx, v)}
                        onBlur={() => handleQuantityBlur(idx)}
                        suffix={it.unit || "PCS"}
                        placeholder="0"
                        compact
                        marginBottom={0}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: 11,
                          fontWeight: 700,
                          color: "var(--muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.4px",
                          marginBottom: 4,
                        }}
                      >
                        Rate (₹) <span style={{ color: "var(--status-error)" }}>*</span>
                      </label>
                      <FormField
                        type="text"
                        inputMode="decimal"
                        required
                        value={it.rate}
                        onChange={(v) => handleRateChange(idx, v)}
                        onBlur={() => handleRateBlur(idx)}
                        suffix="₹"
                        placeholder="0.00"
                        compact
                        marginBottom={0}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: 11,
                          fontWeight: 700,
                          color: "var(--muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.4px",
                          marginBottom: 4,
                        }}
                      >
                        Discount %
                      </label>
                      <FormField
                        type="number"
                        min="0"
                        max="100"
                        value={it.discountPct}
                        onChange={(v) => handleDiscountChange(idx, v)}
                        suffix="%"
                        placeholder="0"
                        compact
                        marginBottom={0}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: 11,
                          fontWeight: 700,
                          color: "var(--muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.4px",
                          marginBottom: 4,
                        }}
                      >
                        Amount
                      </label>
                      <FormField
                        value={(lineAmount || 0).toFixed(2)}
                        readOnly
                        suffix="₹"
                        compact
                        marginBottom={0}
                        inputStyle={{
                          fontWeight: 700,
                          color: "var(--ink)",
                          cursor: "default",
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Tax & Totals */}
        <Card
          title="Tax & Totals"
          subtitle="Tax breakdown and final payable amount"
          icon="ri-calculator-line"
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px 18px" }}>
            <FormField
              label="CGST %"
              type="number"
              layout="vertical"
              value={form.cgstPct}
              onChange={set("cgstPct")}
              placeholder="0"
              suffix="%"
            />
            <FormField
              label="SGST %"
              type="number"
              layout="vertical"
              value={form.sgstPct}
              onChange={set("sgstPct")}
              placeholder="0"
              suffix="%"
            />
            <FormField
              label="IGST %"
              type="number"
              layout="vertical"
              value={form.igstPct}
              onChange={set("igstPct")}
              placeholder="0"
              suffix="%"
            />
          </div>

          <div
            style={{
              background: "var(--canvas)",
              border: "1px dashed var(--line-strong)",
              borderRadius: 12,
              padding: "14px 18px",
              marginTop: 16,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600 }}>Products Subtotal</span>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)" }}>₹{(itemTotals || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600 }}>Total Tax (CGST + SGST + IGST)</span>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)" }}>₹{((cgst + sgst + igst) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div
              style={{
                borderTop: "1px dashed var(--line-strong)",
                paddingTop: 10,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <span style={{ fontSize: 13.5, fontWeight: 800, color: "var(--ink)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Grand Total
                </span>
                <span style={{ fontSize: 11, color: "var(--muted)", display: "block" }}>Inclusive of all taxes</span>
              </div>
              <span style={{ fontSize: 18, fontWeight: 900, color: "var(--primary-deep)" }}>
                ₹{(grandTotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "14px 18px", marginTop: 16 }}>
            <FormField
              label="Amount in Words"
              layout="vertical"
              value={form.amountInWords}
              onChange={(v) => {
                setManualAmountInWords(true);
                setForm((f) => ({ ...f, amountInWords: v }));
              }}
              placeholder="e.g. INR One Lakh One Thousand..."
            />
            <FormField
              label="Notes & Remarks"
              layout="vertical"
              value={form.notes}
              onChange={set("notes")}
              placeholder="Any additional instructions or notes..."
            />
          </div>
        </Card>

        {/* Actions */}
        <div className="action-section-yellow" style={{ marginTop: 8 }}>
          <Button
            variant="secondary"
            type="button"
            onClick={() => navigate("/goods")}
            style={{ background: "#FFFFFF", color: "#0F0F0F", border: "1px solid rgba(0,0,0,0.15)", fontWeight: 700 }}
          >
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            Save Invoice
          </Button>
        </div>
      </form>
    </div>
  );
}
