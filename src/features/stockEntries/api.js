import { apiClient } from "../../services/apiClient";

function unwrapList(data) {
  return Array.isArray(data?.data) ? data.data : [];
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function adaptStockEntry(e) {
  return {
    id: e.id,
    slipNo: e.slipNo,
    entryType: e.entryType, // "inward" | "outward"
    commodity: e.commodity,
    partyName: e.partyName || "",
    vehicleNo: e.vehicleNo || "",
    grossWeightKg: e.grossWeightKg,
    tareWeightKg: e.tareWeightKg,
    netWeightKg: e.netWeightKg,
    moisturePct: e.moisturePct,
    status: e.status, // "pending" | "approved" | "rejected"
    weightMachineId: e.weightMachine?.id || e.weightMachine || "",
    warehouseId: e.warehouse?.id || e.warehouse || "",
    warehouse: e.warehouse?.name || "",
    createdAt: formatDate(e.createdAt),
  };
}

// A Supervisor/Warehouse Admin is always scoped server-side to their own
// warehouse regardless of warehouseId (see backend stockEntry.service.js
// listStockEntries); Super Admin gets the org-wide ledger when omitted.
export async function fetchStockEntries(warehouseId) {
  const { data } = await apiClient.get("/stock-entries", { params: warehouseId ? { warehouseId } : undefined });
  return unwrapList(data).map(adaptStockEntry);
}

export async function createStockEntry(payload) {
  const { data } = await apiClient.post("/stock-entries", {
    warehouseId: payload.warehouseId,
    weightMachineId: payload.weightMachineId,
    slipNo: payload.slipNo,
    entryType: payload.entryType,
    commodity: payload.commodity,
    partyName: payload.partyName || undefined,
    vehicleNo: payload.vehicleNo || undefined,
    grossWeightKg: payload.grossWeightKg,
    tareWeightKg: payload.tareWeightKg,
    moisturePct: payload.moisturePct || undefined,
  });
  return adaptStockEntry(data.data);
}
