import { apiClient } from "../../services/apiClient";

function unwrapList(data) {
  return Array.isArray(data?.data) ? data.data : [];
}

// Map backend PO shape → what Purchase.jsx DataTable expects
function adaptPo(po) {
  if (!po) return po;
  return {
    ...po,
    vendor: po.vendor || po.vendorId?.name || "",
    warehouse: po.warehouse || po.warehouseId?.name || "",
    amount: typeof po.totalAmount === "number"
      ? `₹${po.totalAmount.toLocaleString("en-IN")}`
      : po.amount || "₹0",
  };
}

export async function fetchPurchaseOrders() {
  const { data } = await apiClient.get("/purchase-orders");
  return unwrapList(data).map(adaptPo);
}

export async function fetchVendorLedger() {
  // Derived from purchase orders grouped by vendor
  const { data } = await apiClient.get("/purchase-orders");
  const orders = unwrapList(data).map(adaptPo);
  const map = new Map();
  for (const o of orders) {
    const key = o.vendor || "Unknown";
    if (!map.has(key)) {
      map.set(key, { vendor: key, totalPurchases: "₹0", outstanding: "₹0", status: "Pending" });
    }
    const entry = map.get(key);
    entry.totalPurchases = o.amount || entry.totalPurchases;
    if (o.status !== "Pending") entry.status = "Partially Paid";
  }
  return Array.from(map.values());
}

// Frontend form sends: { vendor, warehouse, item, quantity, rate }
// Backend needs: { vendor, warehouse, itemId, quantity, unitPrice, totalAmount, ... }
export async function createPurchaseOrder(payload) {
  const qty = Number(payload.quantity) || 0;
  const rate = Number(payload.rate) || 0;
  const { data } = await apiClient.post("/purchase-orders", {
    vendor: payload.vendor || "",
    warehouse: payload.warehouse || "",
    item: payload.item || "",
    itemId: "",
    quantity: qty,
    unitPrice: rate,
    totalAmount: qty * rate,
  });
  return adaptPo(data.data);
}

export async function updatePurchaseOrderStatus(id, status) {
  const { data } = await apiClient.patch(`/purchase-orders/${id}/status`, { status });
  return adaptPo(data.data);
}

export async function deletePurchaseOrder(id) {
  await apiClient.delete(`/purchase-orders/${id}`);
  return { id };
}
