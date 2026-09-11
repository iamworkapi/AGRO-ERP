import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import FormField from "../components/common/FormField";
import Button from "../components/common/Button";
import AsyncState from "../components/common/AsyncState";
import { toast } from "../utils/toast";
import { useAuth } from "../hooks/useAuth";
import { useWarehouses } from "../features/warehouses/useWarehouses";
import { useProducts } from "../features/products/useProducts";
import { fetchVendors } from "../features/biomass/api";
import { directSaleToVendor } from "../features/sales/api";
import { directSaleThunk } from "../features/sales/salesSlice";

const TONE = { success: "success", warning: "warning", error: "error" };

export default function DirectSaleToVendor() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { warehouses } = useWarehouses();
  const { items: products, status: productsStatus, load: loadProducts } = useProducts();

  const [vendors, setVendors] = useState([]);
  const [vendorsLoading, setVendorsLoading] = useState(true);
  const [vendorSearch, setVendorSearch] = useState("");
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
  const [notes, setNotes] = useState("");

  // Line items: [{ productId, productName, quantity, unitPrice }]
  const [lineItems, setLineItems] = useState([
    { productId: "", productName: "", quantity: "", unitPrice: "" },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load vendors on mount
  useEffect(() => {
    let cancelled = false;
    setVendorsLoading(true);
    fetchVendors({ limit: 500 })
      .then((res) => {
        if (!cancelled) { setVendors(res.vendors || []); setVendorsLoading(false); }
      })
      .catch(() => { if (!cancelled) setVendorsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Load products on mount
  useEffect(() => {
    if (productsStatus === "idle") loadProducts();
  }, [productsStatus, loadProducts]);

  // Pre-fill warehouse for scoped roles
  useEffect(() => {
    const isScoped = user?.roleKey === "supervisor" || user?.roleKey === "warehouse_admin";
    if (isScoped && warehouses.length > 0 && !selectedWarehouseId) {
      setSelectedWarehouseId(warehouses[0]?.id || "");
    }
  }, [user, warehouses, selectedWarehouseId]);

  const filteredVendors = useMemo(() => {
    if (!vendorSearch.trim()) return vendors;
    const q = vendorSearch.toLowerCase();
    return vendors.filter((v) =>
      v.companyName?.toLowerCase().includes(q) ||
      v.contactNo?.toLowerCase().includes(q) ||
      v.gstin?.toLowerCase().includes(q)
    );
  }, [vendors, vendorSearch]);

  const selectedVendor = vendors.find((v) => v.id === selectedWarehouseId || v._id === selectedWarehouseId) ||
                          vendors.find((v) => v.id === selectedVendorId || v._id === selectedVendorId);

  const totalAmount = useMemo(
    () => lineItems.reduce((sum, li) => sum + ((parseFloat(li.quantity) || 0) * (parseFloat(li.unitPrice) || 0)), 0),
    [lineItems]
  );

  const totalQty = useMemo(
    () => lineItems.reduce((sum, li) => sum + (parseFloat(li.quantity) || 0), 0),
    [lineItems]
  );

  function updateLineItem(index, key, value) {
    setLineItems((items) =>
      items.map((li, i) => (i === index ? { ...li, [key]: value } : li))
    );
  }

  function addLineItem() {
    setLineItems((items) => [...items, { productId: "", productName: "", quantity: "", unitPrice: "" }]);
  }

  function removeLineItem(index) {
    if (lineItems.length <= 1) return;
    setLineItems((items) => items.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Validation
    if (!selectedVendorId) { toast.error("Please select a vendor."); return; }
    if (!selectedWarehouseId) { toast.error("Please select a warehouse."); return; }

    const validItems = lineItems.filter((li) => li.productId && parseFloat(li.quantity) > 0 && parseFloat(li.unitPrice) >= 0);
    if (validItems.length === 0) { toast.error("Add at least one product with quantity > 0."); return; }

    // Auto-fill product names
    const finalItems = validItems.map((li) => {
      const product = products.find((p) => (p._id || p.id) === li.productId);
      return {
        productId: li.productId,
        productName: product?.name || li.productName || "Unknown",
        quantity: parseFloat(li.quantity),
        unitPrice: parseFloat(li.unitPrice),
      };
    });

    setIsSubmitting(true);
    try {
      await directSaleToVendor({
        vendorId: selectedVendorId,
        warehouseId: selectedWarehouseId,
        customer: selectedVendor?.companyName || selectedVendor?.name || "Direct Vendor Sale",
        lineItems: finalItems,
        notes,
      });
      toast.success("Direct sale invoice created successfully!");
      navigate("/sales");
    } catch (err) {
      toast.error(err?.message || "Failed to create sale. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const selectedVendorName = selectedVendor?.companyName || selectedVendor?.name || "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <PageHeader
        title="Direct Sale to Vendor"
        subtitle="Sell products directly to your registered vendor — no purchase order needed"
        badge="DIRECT SALE"
        icon="ri-money-dollar-circle-line"
      />

      <AsyncState status={vendorsLoading ? "loading" : "succeeded"} error={null} loadingLabel="Loading vendors…" />

      <form onSubmit={handleSubmit}>
        {/* STEP 1 — SELECT VENDOR & WAREHOUSE */}
        <Card title="1. Select Vendor & Warehouse" style={{ marginBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
            <FormField
              label="Vendor"
              required
              type="select"
              value={selectedVendorId}
              onChange={setSelectedVendorId}
              placeholder="Search & select a vendor..."
              filter
              showClear
              options={
                filteredVendors.length > 0
                  ? filteredVendors.map((v) => ({
                      value: v._id || v.id,
                      label: `${v.companyName || v.name} ${v.contactNo ? `(${v.contactNo})` : ""}`,
                    }))
                  : [{ value: "", label: "No vendors found" }]
              }
            />
            <FormField
              label="Warehouse"
              required
              type="select"
              value={selectedWarehouseId}
              onChange={setSelectedWarehouseId}
              options={warehouses.map((w) => ({ value: w._id || w.id, label: `${w.name} (${w.code || ""})` }))}
            />
          </div>
          {selectedVendorName && (
            <div style={{ marginTop: 8, fontSize: 11.5, color: "var(--muted)", fontWeight: 600, background: "var(--canvas)", padding: "6px 12px", borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 6 }}>
              <i className="ri-store-2-line" style={{ fontSize: 12, color: "var(--primary)" }} />
              Selected: <strong style={{ color: "var(--ink)" }}>{selectedVendorName}</strong>
            </div>
          )}
        </Card>

        {/* STEP 2 — SELECT PRODUCTS */}
        <Card title="2. Products to Sell" style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {lineItems.map((li, index) => (
              <div
                key={index}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 100px 100px 36px",
                  gap: "0 10px",
                  alignItems: "end",
                  padding: "10px 12px",
                  background: index === 0 ? "var(--canvas)" : "transparent",
                  borderRadius: 8,
                  border: index === 0 ? "1px solid var(--line)" : "none",
                }}
              >
                <FormField
                  label={index === 0 ? "Product" : ""}
                  required
                  type="select"
                  value={li.productId}
                  onChange={(val) => {
                    updateLineItem(index, "productId", val);
                    const prod = products.find((p) => (p._id || p.id) === val);
                    if (prod) updateLineItem(index, "productName", prod.name);
                  }}
                  filter
                  showClear
                  placeholder="Select product..."
                  options={products.map((p) => ({ value: p._id || p.id, label: `${p.name} (Stock: ${p.stockQty || 0} ${p.unit || "PCS"})` }))}
                />
                <FormField
                  label={index === 0 ? "Quantity" : ""}
                  required
                  type="number"
                  value={li.quantity}
                  onChange={(val) => updateLineItem(index, "quantity", val)}
                  suffix={(() => { const prod = products.find((p) => (p._id || p.id) === li.productId); return prod?.unit || "PCS"; })()}
                  placeholder="0"
                  min={0}
                />
                <FormField
                  label={index === 0 ? "Rate" : ""}
                  required
                  type="number"
                  value={li.unitPrice}
                  onChange={(val) => updateLineItem(index, "unitPrice", val)}
                  suffix="₹"
                  placeholder="0"
                  min={0}
                />
                <div>
                  {index === 0 && <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", marginBottom: 4, display: "block" }}>Subtotal</label>}
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--primary-deep)", padding: "8px 0" }}>
                    ₹{((parseFloat(li.quantity) || 0) * (parseFloat(li.unitPrice) || 0)).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "end", paddingBottom: 2 }}>
                  <button
                    type="button"
                    onClick={() => removeLineItem(index)}
                    disabled={lineItems.length <= 1}
                    style={{
                      width: 36, height: 36, borderRadius: 8, border: "1px solid var(--line)",
                      background: "transparent", color: lineItems.length <= 1 ? "var(--faint)" : "var(--status-error)",
                      cursor: lineItems.length <= 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <i className="ri-delete-bin-line" style={{ fontSize: 16 }} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={addLineItem}
            style={{ marginTop: 12, padding: "7px 16px", fontSize: 12, borderRadius: 20 }}
          >
            <i className="ri-add-line" style={{ marginRight: 6 }} />
            Add Another Product
          </Button>

          {/* Summary */}
          <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
            <div style={{ background: "var(--primary-tint)", border: "1px solid var(--line)", borderRadius: 10, padding: "12px 20px", minWidth: 220 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>
                <span>Total Items</span><span style={{ fontWeight: 700, color: "var(--ink)" }}>{lineItems.length}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>
                <span>Total Quantity</span><span style={{ fontWeight: 700, color: "var(--ink)" }}>{totalQty.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, color: "var(--primary-deep)", borderTop: "1px solid var(--line)", paddingTop: 8, marginTop: 4 }}>
                <span>Total Amount</span><span>₹{totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* STEP 3 — NOTES */}
        <Card title="3. Notes (Optional)" style={{ marginBottom: 16 }}>
          <FormField
            label="Additional Notes"
            type="textarea"
            value={notes}
            onChange={setNotes}
            placeholder="Any special instructions, delivery terms, or references..."
            rows={2}
          />
        </Card>

        {/* SUBMIT */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 4 }}>
          <Button variant="secondary" type="button" onClick={() => navigate("/sales")} style={{ padding: "10px 22px", fontSize: 13, borderRadius: 24 }}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="btn-glow" style={{ padding: "10px 28px", fontSize: 13, fontWeight: 800, borderRadius: 24 }}>
            {isSubmitting ? (
              <><i className="ri-loader-4-line spin" style={{ marginRight: 8 }} /> Creating Invoice...</>
            ) : (
              <><i className="ri-check-line" style={{ marginRight: 8 }} /> Confirm Direct Sale</>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
