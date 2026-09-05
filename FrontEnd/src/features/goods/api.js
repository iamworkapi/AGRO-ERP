import { apiClient } from "../../services/apiClient";

export async function fetchGoods() {
  const { data } = await apiClient.get("/goods");
  return data.data;
}

export async function fetchNextSupplierInvoiceNo() {
  const { data } = await apiClient.get("/goods/next-invoice-no");
  return data.data;
}

export async function createGoods(payload) {
  const { data } = await apiClient.post("/goods", payload);
  return data.data;
}

export async function updateGoodsStatus(id, status) {
  const { data } = await apiClient.patch(`/goods/${id}/status`, { status });
  return data.data;
}

export async function deleteGoods(id) {
  const { data } = await apiClient.delete(`/goods/${id}`);
  return data;
}
