// Mock-backed for now - resolves from mockData.js with a fake delay instead
// of calling apiClient. Swapping in the real backend later means restoring
// the apiClient.get/post calls here only.
import { invoices } from "./mockData";

const resolveAfter = (value, ms = 300) => new Promise((resolve) => setTimeout(() => resolve(value), ms));

export function fetchInvoices() {
  return resolveAfter([...invoices]);
}

export function createInvoice(payload) {
  const record = {
    invoiceNo: `INV-${3304 + invoices.length}`,
    status: "Pending",
    ...payload,
  };
  invoices.unshift(record); // mock "write" - becomes a real POST later
  return resolveAfter(record);
}
