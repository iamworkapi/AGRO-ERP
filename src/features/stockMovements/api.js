import { apiClient } from "../../services/apiClient";

function unwrapList(data) {
  return Array.isArray(data?.data) ? data.data : [];
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function adaptStockMovement(m) {
  return {
    id: m.id || m._id,
    referenceNo: m.referenceNo,
    movementType: m.movementType, // "inward" | "outward" | "transfer" | "adjustment"
    itemId: m.item?.id || m.item || "",
    itemName: m.item?.name || "",
    itemCode: m.item?.itemCode || "",
    godownId: m.godown?.id || m.godown || "",
    godownName: m.godown?.name || "",
    fromGodownId: m.fromGodown?.id || m.fromGodown || "",
    fromGodownName: m.fromGodown?.name || "",
    toGodownId: m.toGodown?.id || m.toGodown || "",
    toGodownName: m.toGodown?.name || "",
    quantity: m.quantity || 0,
    unit: m.unit || "",
    reason: m.reason || "",
    performedBy: m.performedBy?.name || "",
    warehouseId: m.warehouse?.id || m.warehouse || "",
    warehouse: m.warehouse?.name || "",
    createdAt: formatDate(m.createdAt),
    createdAtRaw: m.createdAt,
  };
}

export async function fetchStockMovements(warehouseId, params = {}) {
  const query = { warehouseId, ...params };
  const { data } = await apiClient.get("/stock-movements", { params: query });
  return unwrapList(data).map(adaptStockMovement);
}

export async function createStockMovement(payload) {
  const { data } = await apiClient.post("/stock-movements", {
    warehouseId: payload.warehouseId,
    godownId: payload.godownId,
    itemId: payload.itemId,
    movementType: payload.movementType,
    quantity: payload.quantity,
    unit: payload.unit,
    toGodownId: payload.toGodownId,
    reason: payload.reason || undefined,
    referenceNo: payload.referenceNo || undefined,
    adjustToQty: payload.adjustToQty,
  });
  return adaptStockMovement(data.data);
}

export async function fetchMovementSummary(warehouseId) {
  const { data } = await apiClient.get("/stock-movements/summary", { params: { warehouseId } });
  return data.data;
}
