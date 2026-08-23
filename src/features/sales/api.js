import { apiClient } from "../../services/apiClient";

function unwrapList(data) {
  return Array.isArray(data?.data) ? data.data : [];
}

function adaptInvoice(inv) {
  if (!inv) return inv;
  return {
    ...inv,
    customer: inv.customer || inv.customerId?.name || "",
    warehouse: inv.warehouse || inv.warehouseId?.name || "",
    amount: typeof inv.totalAmount === "number"
      ? `₹${inv.totalAmount.toLocaleString("en-IN")}`
      : inv.amount || "₹0",
  };
}

export async function fetchInvoices() {
  const { data } = await apiClient.get("/sales-invoices");
  return unwrapList(data).map(adaptInvoice);
}

export async function createInvoice(payload) {
  const qty = Number(payload.quantity) || 0;
  const rate = Number(payload.rate) || 0;
  const { data } = await apiClient.post("/sales-invoices", {
    customer: payload.customer || "",
    warehouse: payload.warehouse || "",
    item: payload.item || "",
    itemId: "",
    quantity: qty,
    unitPrice: rate,
    totalAmount: qty * rate,
  });
  return adaptInvoice(data.data);
}
