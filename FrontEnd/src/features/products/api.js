import { apiClient } from "../../services/apiClient";

export async function fetchProducts() {
  const { data } = await apiClient.get("/products");
  return data.data;
}

export async function createProduct(payload) {
  const { data } = await apiClient.post("/products", payload);
  return data.data;
}

export async function updateProduct(id, payload) {
  const { data } = await apiClient.patch(`/products/${id}`, payload);
  return data.data;
}

export async function deleteProduct(id) {
  const { data } = await apiClient.delete(`/products/${id}`);
  return data;
}

export async function getProduct(id) {
  const { data } = await apiClient.get(`/products/${id}`);
  return data.data;
}
