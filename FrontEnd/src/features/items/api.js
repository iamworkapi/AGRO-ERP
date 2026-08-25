import { apiClient } from "../../services/apiClient";

function unwrapList(data) {
  return Array.isArray(data?.data) ? data.data : [];
}

function adaptItem(it) {
  return {
    id: it.id,
    code: it.itemCode,
    name: it.name,
    category: it.category,
    unit: it.unit,
    stock: Number(it.stockQty ?? 0).toLocaleString(),
    stockQty: Number(it.stockQty ?? 0),
    reorder: Number(it.reorderLevel ?? 0).toLocaleString(),
    reorderLevel: Number(it.reorderLevel ?? 0),
    warehouseId: it.warehouse?.id || it.warehouse || "",
    warehouse: it.warehouse?.name || "",
  };
}

// A Supervisor/Warehouse Admin is always scoped server-side to their own
// warehouse regardless of warehouseId (see backend item.service.js
// listItems); Super Admin gets the org-wide item master when omitted.
export async function fetchItems(warehouseId) {
  const { data } = await apiClient.get("/items", { params: warehouseId ? { warehouseId } : undefined });
  return unwrapList(data).map(adaptItem);
}

export async function createItem(payload) {
  const { data } = await apiClient.post("/items", {
    warehouseId: payload.warehouseId,
    name: payload.name,
    category: payload.category,
    unit: payload.unit,
    stockQty: payload.stock || 0,
    reorderLevel: payload.reorder,
  });
  return adaptItem(data.data);
}

export async function deleteItem(id) {
  await apiClient.delete(`/items/${id}`);
  return { id };
}
