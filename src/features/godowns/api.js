import { apiClient } from "../../services/apiClient";

function unwrapList(data) {
  return Array.isArray(data?.data) ? data.data : [];
}

function adaptGodown(g) {
  return {
    id: g.id,
    code: g.code,
    name: g.name,
    warehouseId: g.warehouse?.id || g.warehouse || "",
    warehouse: g.warehouse?.name || "",
    capacityMt: g.capacityMt || 0,
    currentStockMt: g.currentStockMt || 0,
    areaSqFt: g.areaSqFt || 0,
    godownType: g.godownType || "covered",
    status: g.status || "active",
    notes: g.notes || "",
    createdAt: g.createdAt,
  };
}

export async function fetchGodowns(warehouseId) {
  const { data } = await apiClient.get("/warehouses/godowns", { params: warehouseId ? { warehouseId } : undefined });
  return unwrapList(data).map(adaptGodown);
}

export async function createGodown(payload) {
  const { data } = await apiClient.post("/warehouses/godowns", payload);
  return adaptGodown(data.data);
}

export async function updateGodown(id, payload) {
  const { data } = await apiClient.patch(`/warehouses/godowns/${id}`, payload);
  return adaptGodown(data.data);
}

export async function deleteGodown(id) {
  const { data } = await apiClient.delete(`/warehouses/godowns/${id}`);
  return data.data;
}
