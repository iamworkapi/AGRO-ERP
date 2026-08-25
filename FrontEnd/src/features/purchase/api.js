// Mock-backed for now - resolves from mockData.js with a fake delay instead
// of calling apiClient. Swapping in the real backend later means restoring
// the apiClient.get/post calls here only.
import { purchaseOrders, vendorLedger } from "./mockData";

const resolveAfter = (value, ms = 300) => new Promise((resolve) => setTimeout(() => resolve(value), ms));

export function fetchPurchaseOrders() {
  return resolveAfter([...purchaseOrders]);
}

export function fetchVendorLedger() {
  return resolveAfter([...vendorLedger]);
}

export function createPurchaseOrder(payload) {
  const record = {
    poNumber: `PO-${1045 + purchaseOrders.length}`,
    status: "Pending",
    ...payload,
  };
  purchaseOrders.unshift(record); // mock "write" - becomes a real POST later
  return resolveAfter(record);
}
