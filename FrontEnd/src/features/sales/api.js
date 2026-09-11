import { apiClient } from "../../services/apiClient";

export async function fetchInvoices() {
  const { data } = await apiClient.get("/sales-invoices");
  return data.data;
}

export async function createInvoice(payload) {
  const { data } = await apiClient.post("/sales-invoices", payload);
  return data.data;
}

export async function directSaleToVendor(payload) {
  const { data } = await apiClient.post("/sales-invoices/direct-sale", payload);
  return data.data;
}
