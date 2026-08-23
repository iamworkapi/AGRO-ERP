import { apiClient } from "../../services/apiClient";

function unwrapList(data) {
  return Array.isArray(data?.data) ? data.data : [];
}

function adaptItem(it) {
  if (!it) return it;
  return {
    code: it.itemCode || it.code,
    name: it.name,
    category: it.category,
    unit: it.unit,
    warehouse: it.warehouse?.name || it.warehouse || "",
    stock: Number(it.stockQty ?? it.stock ?? 0).toLocaleString(),
    stockQty: Number(it.stockQty ?? it.stock ?? 0),
    reorder: Number(it.reorderLevel ?? it.reorder ?? 0).toLocaleString(),
    reorderLevel: Number(it.reorderLevel ?? it.reorder ?? 0),
  };
}

let cachedItems = null;

async function getAllItems() {
  if (cachedItems) return cachedItems;
  const { data } = await apiClient.get("/items");
  cachedItems = unwrapList(data).map(adaptItem);
  return cachedItems;
}

export async function fetchInventoryStats() {
  const items = await getAllItems();
  const lowStock = items.filter((i) => i.stockQty <= i.reorderLevel).length;
  return [
    { label: "Total SKUs", value: String(items.length), trend: "in inventory master" },
    { label: "Total Stock Value", value: "—", trend: "check stock valuation report" },
    { label: "Low Stock Items", value: String(lowStock), trend: "below reorder level" },
    { label: "Batches Ageing > 60 Days", value: "0", trend: "flagged for review" },
  ];
}

export async function fetchItems() {
  return getAllItems();
}

export async function fetchLowStockAlerts() {
  const items = await getAllItems();
  return items
    .filter((i) => i.stockQty <= i.reorderLevel)
    .map((i) => ({ item: i.name, warehouse: i.warehouse, stock: `${i.stock} ${i.unit}`, reorder: `${i.reorder} ${i.unit}` }));
}

export async function createItem(payload) {
  cachedItems = null;
  const { data } = await apiClient.post("/items", {
    warehouseId: payload.warehouseId || "",
    name: payload.name,
    category: payload.category,
    unit: payload.unit,
    stockQty: Number(payload.stock || 0),
    reorderLevel: Number(payload.reorder || 0),
  });
  return adaptItem(data.data);
}
