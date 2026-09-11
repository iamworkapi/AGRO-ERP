import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import FormField from "../components/common/FormField";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import AsyncState from "../components/common/AsyncState";
import { toast } from "../utils/toast";
import { useAuth } from "../hooks/useAuth";
import { useWarehouses } from "../features/warehouses/useWarehouses";
import { useProducts } from "../features/products/useProducts";
import { fetchVendors } from "../features/biomass/api";
import { directSaleToVendor } from "../features/sales/api";
import { getWarehouseCodePrefix } from "../features/biomass/biomassService";
import { numberToWordsINR } from "../utils/formatters";

export default function DirectSaleToVendor() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { warehouses } = useWarehouses();
  const { items: products, status: productsStatus, load: loadProducts } = useProducts();

  const [vendors, setVendors] = useState([]);
  const [vendorsLoading, setVendorsLoading] = useState(true);
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
  const [saleDate, setSaleDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [paymentStatus, setPaymentStatus] = useState("Paid");
  const [paymentMode, setPaymentMode] = useState("Bank Transfer / NEFT");
  const [vehicleNo, setVehicleNo] = useState("");
  const [notes, setNotes] = useState("");
  const [copiedInvoice, setCopiedInvoice] = useState(false);
  const [copiedGstin, setCopiedGstin] = useState(false);

  // Line items: [{ productId, productName, quantity, unitPrice }]
  const [lineItems, setLineItems] = useState([
    { productId: "", productName: "", quantity: "1", unitPrice: "" },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load vendors on mount
  useEffect(() => {
    let cancelled = false;
    setVendorsLoading(true);
    fetchVendors({ limit: 500 })
      .then((res) => {
        if (!cancelled) {
          const list = res.vendors || [];
          setVendors(list);
          if (list.length > 0 && !selectedVendorId) {
            setSelectedVendorId(list[0]._id || list[0].id);
          }
          setVendorsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setVendorsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Load products on mount
  useEffect(() => {
    if (productsStatus === "idle") loadProducts();
  }, [productsStatus, loadProducts]);

  // Pre-fill warehouse for scoped roles or default
  useEffect(() => {
    if (warehouses.length > 0 && !selectedWarehouseId) {
      const match =
        warehouses.find(
          (w) =>
            w.code?.includes("BTT") ||
            w.name?.toLowerCase().includes("bettiah") ||
            w.name?.toLowerCase().includes("gorakhpur")
        ) || warehouses[0];
      setSelectedWarehouseId(match._id || match.id || "");
    }
  }, [warehouses, selectedWarehouseId]);

  // Selected warehouse object & prefix
  const selectedWarehouse = useMemo(() => {
    return warehouses.find(
      (w) => (w._id || w.id) === selectedWarehouseId || w.code === selectedWarehouseId
    );
  }, [warehouses, selectedWarehouseId]);

  const whPrefix = useMemo(() => {
    return getWarehouseCodePrefix(
      selectedWarehouse?.code || selectedWarehouse?._id || selectedWarehouse?.id,
      selectedWarehouse?.name
    );
  }, [selectedWarehouse]);

  // Direct Sale Reference No. (bound to warehouse code)
  const [invoiceSeqNum, setInvoiceSeqNum] = useState(() => Math.floor(1000 + Math.random() * 9000));
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const invoiceRefNo = useMemo(() => {
    return `${whPrefix}-DIR-${currentYear}-${invoiceSeqNum}`;
  }, [whPrefix, currentYear, invoiceSeqNum]);

  function handleAutoGenerateInvoice() {
    setInvoiceSeqNum(Math.floor(1000 + Math.random() * 9000));
    toast.success("New Direct Sale Invoice reference generated!");
  }

  // Selected Vendor lookup
  const selectedVendor = useMemo(() => {
    return vendors.find((v) => (v._id || v.id) === selectedVendorId);
  }, [vendors, selectedVendorId]);

  const selectedVendorName = selectedVendor?.companyName || selectedVendor?.name || "";

  // Line item modifiers
  function updateLineItem(index, key, value) {
    setLineItems((items) =>
      items.map((li, i) => {
        if (i !== index) return li;
        const updated = { ...li, [key]: value };
        if (key === "productId") {
          const prod = products.find((p) => (p._id || p.id) === value);
          if (prod) {
            updated.productName = prod.name;
            if (!updated.unitPrice || updated.unitPrice === "0") {
              updated.unitPrice = String(prod.defaultRate || prod.rate || 0);
            }
          }
        }
        return updated;
      })
    );
  }

  function addLineItem() {
    setLineItems((items) => [
      ...items,
      { productId: "", productName: "", quantity: "1", unitPrice: "" },
    ]);
  }

  function removeLineItem(index) {
    if (lineItems.length <= 1) return;
    setLineItems((items) => items.filter((_, i) => i !== index));
  }

  // Live Calculations
  const totalAmount = useMemo(
    () =>
      lineItems.reduce(
        (sum, li) =>
          sum + (parseFloat(li.quantity) || 0) * (parseFloat(li.unitPrice) || 0),
        0
      ),
    [lineItems]
  );

  const totalQty = useMemo(
    () => lineItems.reduce((sum, li) => sum + (parseFloat(li.quantity) || 0), 0),
    [lineItems]
  );

  const validItemsCount = useMemo(
    () =>
      lineItems.filter(
        (li) => li.productId && parseFloat(li.quantity) > 0 && parseFloat(li.unitPrice) >= 0
      ).length,
    [lineItems]
  );

  const amountInWords = useMemo(() => {
    return totalAmount > 0 ? numberToWordsINR(totalAmount) : "Zero Rupees";
  }, [totalAmount]);

  function handleCopyInvoice() {
    navigator.clipboard.writeText(invoiceRefNo);
    setCopiedInvoice(true);
    setTimeout(() => setCopiedInvoice(false), 1800);
    toast.success("Invoice number copied to clipboard!");
  }

  function handleCopyGstin() {
    if (selectedVendor?.gstin) {
      navigator.clipboard.writeText(selectedVendor.gstin);
      setCopiedGstin(true);
      setTimeout(() => setCopiedGstin(false), 1800);
      toast.success("Vendor GSTIN copied!");
    }
  }

  async function handleSubmit(e) {
    if (e) e.preventDefault();

    if (!selectedVendorId) {
      toast.error("Please select a registered vendor.");
      return;
    }
    if (!selectedWarehouseId) {
      toast.error("Please select a dispatching warehouse.");
      return;
    }

    const validItems = lineItems.filter(
      (li) => li.productId && parseFloat(li.quantity) > 0 && parseFloat(li.unitPrice) >= 0
    );
    if (validItems.length === 0) {
      toast.error("Please add at least one product with valid quantity and rate.");
      return;
    }

    const finalItems = validItems.map((li) => {
      const prod = products.find((p) => (p._id || p.id) === li.productId);
      return {
        productId: li.productId,
        productName: prod?.name || li.productName || "Product",
        quantity: parseFloat(li.quantity),
        unitPrice: parseFloat(li.unitPrice),
      };
    });

    setIsSubmitting(true);
    try {
      await directSaleToVendor({
        vendorId: selectedVendorId,
        warehouseId: selectedWarehouseId,
        customer: selectedVendorName || "Direct Vendor Sale",
        lineItems: finalItems,
        notes: [
          notes ? `Notes: ${notes}` : "",
          paymentStatus ? `Status: ${paymentStatus}` : "",
          paymentMode ? `Payment: ${paymentMode}` : "",
          vehicleNo ? `Vehicle: ${vehicleNo}` : "",
          `Ref: ${invoiceRefNo}`,
        ]
          .filter(Boolean)
          .join(" | "),
      });
      toast.success(`Direct sale invoice ${invoiceRefNo} created successfully!`);
      navigate("/sales");
    } catch (err) {
      toast.error(err?.message || "Failed to create direct sale invoice.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* PAGE HEADER */}
      <PageHeader
        title="Direct Sale to Vendor"
        subtitle="Sell goods & farm supplies directly to registered vendors — with live stock validation and instant billing"
        badge="DIRECT SALE INVOICE"
        icon="ri-shopping-cart-2-line"
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate("/sales")}
            style={{ fontSize: 12, height: 32 }}
          >
            <i className="ri-arrow-left-line" style={{ marginRight: 4 }} /> Back to Sales Register
          </Button>
        }
      />

      <AsyncState
        status={vendorsLoading ? "loading" : "succeeded"}
        error={null}
        loadingLabel="Loading registered vendors…"
      />

      {/* TWO-COLUMN ADVANCE LAYOUT */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 350px",
          gap: 16,
          alignItems: "start",
        }}
        className="direct-sale-responsive-grid"
      >
        {/* LEFT COLUMN: MODULAR BILLING CARDS */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* CARD 1: VENDOR & DISPATCH WAREHOUSE */}
          <Card
            title="1. Vendor &amp; Dispatch Warehouse"
            subtitle="Customer identification, issuing warehouse hub, and auto-generated invoice code"
            icon="ri-user-shared-line"
            accent="var(--primary)"
            headerStyle={{ padding: "10px 16px" }}
            bodyStyle={{ padding: "14px 16px" }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1.2fr 1.1fr", gap: "10px 14px" }}>
              {/* Registered Vendor */}
              <div>
                <FormField
                  label="Registered Vendor"
                  required
                  compact
                  layout="vertical"
                  type="select"
                  value={selectedVendorId}
                  onChange={setSelectedVendorId}
                  placeholder="Select vendor..."
                  filter
                  options={
                    vendors.length > 0
                      ? vendors.map((v) => ({
                          value: v._id || v.id,
                          label: `${v.companyName || v.name} ${v.contactNo ? `(${v.contactNo})` : ""}`,
                        }))
                      : [{ value: "", label: "No vendors available" }]
                  }
                />
              </div>

              {/* Supplying Warehouse Hub (Frozen / Locked) */}
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <label
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    Dispatch Warehouse
                  </label>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: "var(--primary-deep)",
                      background: "var(--primary-tint)",
                      padding: "1px 6px",
                      borderRadius: 4,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 3,
                    }}
                  >
                    <i className="ri-lock-fill" style={{ fontSize: 10 }} />
                    Frozen
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    height: 34,
                    padding: "0 10px",
                    borderRadius: 7,
                    border: "1px solid var(--line-strong)",
                    background: "var(--canvas)",
                    color: "var(--ink)",
                    cursor: "not-allowed",
                  }}
                  title="Dispatch warehouse is frozen & locked to your assigned facility"
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                    <i className="ri-store-2-line" style={{ color: "var(--primary)", fontSize: 14 }} />
                    <span
                      style={{
                        fontSize: 12.5,
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {selectedWarehouse?.name
                        ? `${selectedWarehouse.name} (${selectedWarehouse.code || whPrefix})`
                        : "Bettiah Hub (WH-BTT-01)"}
                    </span>
                  </div>
                  <i className="ri-lock-line" style={{ color: "var(--muted)", fontSize: 13 }} />
                </div>
                <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 3 }}>
                  Facility Prefix: <strong style={{ color: "var(--primary)" }}>{whPrefix}</strong> (Locked)
                </div>
              </div>

              {/* Direct Sale Ref / Invoice No */}
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <label
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Invoice Number <span style={{ color: "var(--status-error)" }}>*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoGenerateInvoice}
                    style={{
                      border: "none",
                      background: "var(--primary-tint)",
                      color: "var(--primary-deep)",
                      fontSize: 10,
                      fontWeight: 800,
                      padding: "1px 6px",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                    title="Generate new invoice number"
                  >
                    Auto
                  </button>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    borderRadius: 7,
                    border: "1px solid var(--line-strong)",
                    background: "var(--canvas)",
                    overflow: "hidden",
                    height: 34,
                  }}
                >
                  <input
                    type="text"
                    value={invoiceRefNo}
                    readOnly
                    style={{
                      width: "100%",
                      height: "100%",
                      fontSize: 12,
                      fontWeight: 800,
                      color: "var(--primary-deep)",
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      padding: "0 10px",
                      fontFamily: "monospace",
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleCopyInvoice}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: copiedInvoice ? "var(--primary)" : "var(--muted)",
                      padding: "0 8px",
                      cursor: "pointer",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                    }}
                    title="Copy invoice number"
                  >
                    <i className={copiedInvoice ? "ri-check-line" : "ri-file-copy-line"} style={{ fontSize: 13 }} />
                  </button>
                </div>
              </div>
            </div>

            {/* Selected Vendor Profile Ribbon */}
            {selectedVendor && (
              <div
                style={{
                  marginTop: 12,
                  padding: "10px 14px",
                  background: "var(--canvas)",
                  border: "1px solid var(--line)",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      background: "rgba(27, 94, 58, 0.12)",
                      color: "var(--primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                      flexShrink: 0,
                    }}
                  >
                    <i className="ri-store-2-line" />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: "var(--ink)" }}>
                        {selectedVendor.companyName || selectedVendor.name}
                      </span>
                      {selectedVendor.vendorCode && (
                        <span
                          style={{
                            fontSize: 10,
                            fontFamily: "monospace",
                            fontWeight: 700,
                            background: "rgba(0,0,0,0.05)",
                            padding: "1px 5px",
                            borderRadius: 4,
                          }}
                        >
                          {selectedVendor.vendorCode}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--muted)", display: "flex", gap: 12, marginTop: 2, flexWrap: "wrap" }}>
                      {selectedVendor.representative && (
                        <span>
                          <i className="ri-user-line" style={{ marginRight: 3 }} />
                          {selectedVendor.representative}
                        </span>
                      )}
                      {selectedVendor.contactNo && (
                        <a
                          href={`tel:${selectedVendor.contactNo}`}
                          style={{ color: "var(--primary-deep)", fontWeight: 700, textDecoration: "none" }}
                        >
                          <i className="ri-phone-line" style={{ marginRight: 3 }} />
                          {selectedVendor.contactNo}
                        </a>
                      )}
                      {selectedVendor.address && (
                        <span>
                          <i className="ri-map-pin-line" style={{ marginRight: 3 }} />
                          {selectedVendor.address}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {selectedVendor.gstin && (
                    <div
                      style={{
                        fontSize: 11,
                        background: "rgba(2, 132, 199, 0.08)",
                        color: "#0284C7",
                        padding: "3px 8px",
                        borderRadius: 6,
                        fontFamily: "monospace",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <span>GSTIN: {selectedVendor.gstin}</span>
                      <button
                        type="button"
                        onClick={handleCopyGstin}
                        style={{ border: "none", background: "transparent", cursor: "pointer", color: "#0284C7", padding: 0 }}
                        title="Copy GSTIN"
                      >
                        <i className={copiedGstin ? "ri-check-line" : "ri-file-copy-line"} style={{ fontSize: 12 }} />
                      </button>
                    </div>
                  )}
                  <Badge tone="success">Active Vendor</Badge>
                </div>
              </div>
            )}
          </Card>

          {/* CARD 2: PRODUCTS TO SELL (LINE ITEMS CART) */}
          <Card
            title="2. Products to Sell"
            subtitle="Add product line items with live stock balance, pricing and subtotal computation"
            icon="ri-box-3-line"
            accent="#0284C7"
            headerStyle={{ padding: "10px 16px" }}
            bodyStyle={{ padding: "12px 16px" }}
            right={
              <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--muted)" }}>
                {validItemsCount} of {lineItems.length} items configured
              </span>
            }
          >
            {/* Table Header Bar */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "36px minmax(200px, 2.2fr) 110px 110px 110px 110px 38px",
                gap: "0 10px",
                padding: "8px 10px",
                background: "var(--canvas)",
                borderRadius: "8px 8px 0 0",
                borderBottom: "1px solid var(--line-strong)",
                fontSize: 11,
                fontWeight: 800,
                color: "var(--muted)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                alignItems: "center",
              }}
            >
              <div style={{ textAlign: "center" }}>#</div>
              <div>Product Item</div>
              <div style={{ textAlign: "center" }}>Available Stock</div>
              <div>Quantity</div>
              <div>Rate (₹)</div>
              <div style={{ textAlign: "right", paddingRight: 4 }}>Subtotal</div>
              <div style={{ textAlign: "center" }}>Del</div>
            </div>

            {/* Line Item Rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
              {lineItems.map((li, index) => {
                const currentProduct = products.find((p) => (p._id || p.id) === li.productId);
                const stock = currentProduct?.stockQty ?? 0;
                const unit = currentProduct?.unit || "PCS";
                const qtyNum = parseFloat(li.quantity) || 0;
                const rateNum = parseFloat(li.unitPrice) || 0;
                const subtotal = Math.round(qtyNum * rateNum * 100) / 100;
                const isOverStock = currentProduct && qtyNum > stock;

                return (
                  <div
                    key={index}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "36px minmax(200px, 2.2fr) 110px 110px 110px 110px 38px",
                      gap: "0 10px",
                      alignItems: "center",
                      padding: "8px 10px",
                      borderRadius: 8,
                      background: index % 2 === 0 ? "var(--surface)" : "rgba(0,0,0,0.015)",
                      border: "1px solid var(--line)",
                      transition: "all 150ms ease",
                    }}
                  >
                    {/* Index Pill */}
                    <div style={{ textAlign: "center" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 22,
                          height: 22,
                          borderRadius: 6,
                          background: "var(--canvas)",
                          fontSize: 10.5,
                          fontWeight: 800,
                          color: "var(--muted)",
                          border: "1px solid var(--line)",
                        }}
                      >
                        {index + 1}
                      </span>
                    </div>

                    {/* Product Selection */}
                    <div>
                      <select
                        value={li.productId}
                        onChange={(e) => updateLineItem(index, "productId", e.target.value)}
                        style={{
                          width: "100%",
                          height: 34,
                          padding: "0 8px",
                          fontSize: 12.5,
                          fontWeight: 600,
                          borderRadius: 7,
                          border: "1px solid var(--line-strong)",
                          background: "var(--surface)",
                          color: "var(--ink)",
                          outline: "none",
                          cursor: "pointer",
                        }}
                      >
                        <option value="">Select product to sell...</option>
                        {products.map((p) => (
                          <option key={p._id || p.id} value={p._id || p.id}>
                            {p.name} {p.category ? `[${p.category}]` : ""} — (Stock: {p.stockQty || 0} {p.unit || "PCS"})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Available Stock Tag */}
                    <div style={{ textAlign: "center" }}>
                      {currentProduct ? (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "3px 8px",
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 800,
                            background: stock > 0 ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                            color: stock > 0 ? "#059669" : "#DC2626",
                            border: `1px solid ${stock > 0 ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
                          }}
                        >
                          <i className={stock > 0 ? "ri-checkbox-circle-fill" : "ri-alert-fill"} style={{ fontSize: 11 }} />
                          {stock} {unit}
                        </span>
                      ) : (
                        <span style={{ fontSize: 11, color: "var(--muted)" }}>—</span>
                      )}
                    </div>

                    {/* Quantity Input */}
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          height: 34,
                          borderRadius: 7,
                          border: `1px solid ${isOverStock ? "var(--status-error)" : "var(--line-strong)"}`,
                          background: "var(--surface)",
                          overflow: "hidden",
                        }}
                      >
                        <input
                          type="number"
                          min="0.01"
                          step="any"
                          value={li.quantity}
                          onChange={(e) => updateLineItem(index, "quantity", e.target.value)}
                          placeholder="0"
                          style={{
                            width: "100%",
                            height: "100%",
                            fontSize: 12.5,
                            fontWeight: 700,
                            color: isOverStock ? "var(--status-error)" : "var(--ink)",
                            background: "transparent",
                            border: "none",
                            outline: "none",
                            padding: "0 6px 0 8px",
                          }}
                        />
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: "var(--muted)",
                            paddingRight: 6,
                            textTransform: "uppercase",
                          }}
                        >
                          {unit}
                        </span>
                      </div>
                    </div>

                    {/* Rate Input */}
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          height: 34,
                          borderRadius: 7,
                          border: "1px solid var(--line-strong)",
                          background: "var(--surface)",
                          overflow: "hidden",
                        }}
                      >
                        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", paddingLeft: 8 }}>
                          ₹
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={li.unitPrice}
                          onChange={(e) => updateLineItem(index, "unitPrice", e.target.value)}
                          placeholder="0"
                          style={{
                            width: "100%",
                            height: "100%",
                            fontSize: 12.5,
                            fontWeight: 700,
                            color: "var(--ink)",
                            background: "transparent",
                            border: "none",
                            outline: "none",
                            padding: "0 8px 0 4px",
                          }}
                        />
                      </div>
                    </div>

                    {/* Subtotal Display */}
                    <div style={{ textAlign: "right", paddingRight: 4 }}>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 800,
                          color: subtotal > 0 ? "var(--primary-deep)" : "var(--muted)",
                        }}
                      >
                        ₹{subtotal.toLocaleString("en-IN")}
                      </span>
                    </div>

                    {/* Delete Action */}
                    <div style={{ textAlign: "center" }}>
                      <button
                        type="button"
                        onClick={() => removeLineItem(index)}
                        disabled={lineItems.length <= 1}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 6,
                          border: "1px solid rgba(239, 68, 68, 0.2)",
                          background: lineItems.length <= 1 ? "transparent" : "rgba(239, 68, 68, 0.08)",
                          color: lineItems.length <= 1 ? "var(--faint)" : "var(--status-error)",
                          cursor: lineItems.length <= 1 ? "not-allowed" : "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 150ms ease",
                        }}
                        title="Remove product item"
                      >
                        <i className="ri-delete-bin-line" style={{ fontSize: 13 }} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Row: Add Item Button & Counter */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 12,
                paddingTop: 8,
                borderTop: "1px dashed var(--line)",
              }}
            >
              <button
                type="button"
                onClick={addLineItem}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--primary-deep)",
                  background: "var(--primary-tint)",
                  border: "1px dashed rgba(27, 94, 58, 0.35)",
                  cursor: "pointer",
                  transition: "all 150ms ease",
                }}
              >
                <i className="ri-add-line" style={{ fontSize: 14 }} />
                Add Another Product Item
              </button>

              <div style={{ fontSize: 11.5, color: "var(--muted)", display: "flex", gap: 14 }}>
                <span>
                  Total Units: <strong style={{ color: "var(--ink)" }}>{totalQty.toLocaleString()}</strong>
                </span>
                <span>
                  Items Total: <strong style={{ color: "var(--primary-deep)" }}>₹{totalAmount.toLocaleString("en-IN")}</strong>
                </span>
              </div>
            </div>
          </Card>

          {/* CARD 3: PAYMENT, LOGISTICS & NOTES */}
          <Card
            title="3. Payment Settlement &amp; Delivery Logistics"
            subtitle="Payment terms, transport details, and billing remarks"
            icon="ri-file-list-3-line"
            accent="#8B5CF6"
            headerStyle={{ padding: "10px 16px" }}
            bodyStyle={{ padding: "14px 16px" }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr", gap: "10px 14px" }}>
              <FormField
                label="Payment Settlement Status"
                type="select"
                compact
                layout="vertical"
                value={paymentStatus}
                onChange={setPaymentStatus}
                options={[
                  { value: "Paid", label: "Paid (Payment Received in Full)" },
                  { value: "Pending", label: "Pending (Credit Ledger Invoice)" },
                  { value: "Partially Paid", label: "Partially Paid (Advance Deducted)" },
                ]}
              />

              <FormField
                label="Payment Channel / Mode"
                type="select"
                compact
                layout="vertical"
                value={paymentMode}
                onChange={setPaymentMode}
                options={[
                  { value: "Bank Transfer / NEFT", label: "Bank Transfer / NEFT / RTGS" },
                  { value: "Cash", label: "Cash Settlement (Cash Register)" },
                  { value: "UPI Payment", label: "UPI / QR Instant Transfer" },
                  { value: "Cheque", label: "Cheque Deposit" },
                  { value: "Vendor Account Ledger", label: "Offset Against Parali Weighment Bill" },
                ]}
              />

              <FormField
                label="Transport / Vehicle / E-Way No."
                compact
                layout="vertical"
                value={vehicleNo}
                onChange={setVehicleNo}
                placeholder="e.g. UP 53 DT 3311 / EWB-12948"
              />
            </div>

            <div style={{ marginTop: 10 }}>
              <FormField
                label="Sale Notes &amp; Dispatch Remarks"
                compact
                layout="vertical"
                value={notes}
                onChange={setNotes}
                placeholder="Any special remarks, delivery acknowledgement or barter details..."
              />
            </div>
          </Card>

          {/* BOTTOM ACTION BAR */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 12,
              padding: "12px 16px",
              background: "var(--surface)",
              borderRadius: 12,
              border: "1px solid var(--line)",
            }}
          >
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => navigate("/sales")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={isSubmitting}
              icon="ri-check-line"
              style={{ fontWeight: 800, padding: "0 24px" }}
            >
              Confirm Direct Sale
            </Button>
          </div>
        </form>

        {/* RIGHT COLUMN: STICKY INVOICE SETTLEMENT & SUMMARY CARD */}
        <div style={{ position: "sticky", top: 16, display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              background: "var(--surface)",
              borderRadius: 16,
              border: "1px solid var(--line)",
              padding: "18px 16px",
              boxShadow: "var(--shadow-sm)",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {/* Header: Direct Sale Invoice Ribbon */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "linear-gradient(135deg, rgba(27, 94, 58, 0.15) 0%, rgba(16, 185, 129, 0.2) 100%)",
                  border: "1px solid rgba(27, 94, 58, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--primary)",
                  fontSize: 22,
                  flexShrink: 0,
                }}
              >
                <i className="ri-receipt-line" />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: "#047857",
                      background: "rgba(16, 185, 129, 0.12)",
                      padding: "2px 7px",
                      borderRadius: 999,
                      letterSpacing: "0.4px",
                    }}
                  >
                    DIRECT SALE
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: "#0284C7",
                      background: "rgba(2, 132, 199, 0.1)",
                      padding: "2px 7px",
                      borderRadius: 999,
                    }}
                  >
                    {whPrefix}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: 13,
                    fontWeight: 800,
                    color: "var(--ink)",
                    marginTop: 4,
                  }}
                >
                  {invoiceRefNo}
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>
                  Date: {saleDate}
                </div>
              </div>
            </div>

            {/* Live Financial KPI Box */}
            <div
              style={{
                background: "var(--canvas)",
                padding: "14px 12px",
                borderRadius: 12,
                border: "1px solid var(--line)",
                textAlign: "center",
              }}
            >
              <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Total Sale Payable
              </span>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 900,
                  color: "#10B981",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                  marginTop: 2,
                }}
              >
                ₹{totalAmount.toLocaleString("en-IN")}
              </div>
              <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 4, fontStyle: "italic", lineHeight: 1.35 }}>
                {amountInWords}
              </div>
            </div>

            {/* Summary Breakdown List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 11.5 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--muted)", fontWeight: 600 }}>Recipient Vendor</span>
                <strong style={{ color: "var(--ink)", maxWidth: 170, textAlign: "right", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={selectedVendorName}>
                  {selectedVendorName || "—"}
                </strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--muted)", fontWeight: 600 }}>Dispatching Hub</span>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontWeight: 700,
                    color: "var(--ink)",
                    background: "rgba(0,0,0,0.04)",
                    padding: "2px 6px",
                    borderRadius: 4,
                  }}
                >
                  {selectedWarehouse?.name ? `${selectedWarehouse.name} (${whPrefix})` : whPrefix}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--muted)", fontWeight: 600 }}>Configured Items</span>
                <strong style={{ color: "var(--ink)" }}>{validItemsCount} item(s)</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--muted)", fontWeight: 600 }}>Total Quantity</span>
                <strong style={{ color: "var(--ink)" }}>{totalQty.toLocaleString()} units</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--muted)", fontWeight: 600 }}>Payment Terms</span>
                <Badge tone={paymentStatus === "Paid" ? "success" : "warning"}>
                  {paymentStatus} ({paymentMode})
                </Badge>
              </div>

              {/* GST / Tax row */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: 8,
                  borderTop: "1px dashed var(--line)",
                }}
              >
                <span style={{ color: "var(--muted)", fontWeight: 600 }}>GST / Tax Surcharge</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#059669" }}>
                  ₹0.00 (Exempt / Direct)
                </span>
              </div>
            </div>

            {/* Quick Submit CTA from Sidebar */}
            <Button
              type="button"
              variant="primary"
              size="md"
              loading={isSubmitting}
              onClick={handleSubmit}
              icon="ri-check-line"
              style={{ width: "100%", marginTop: 4, fontWeight: 800 }}
            >
              Confirm Direct Sale
            </Button>

            <div style={{ fontSize: 10.5, color: "var(--muted)", textAlign: "center", lineHeight: 1.4 }}>
              <i className="ri-shield-check-line" style={{ color: "#10B981", marginRight: 4 }} />
              Invoice is posted to sales ledger and items are instantly reserved from warehouse inventory.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
