import { apiClient } from "../../services/apiClient";

function unwrapList(data) {
  return Array.isArray(data?.data) ? data.data : [];
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function adaptStockEntry(e) {
  const gross = e.grossWeightKg || 0;
  const tare = e.tareWeightKg || 0;
  const net = e.netWeightKg !== undefined ? e.netWeightKg : Math.max(0, gross - tare);
  const moisture = e.moisturePct !== undefined ? e.moisturePct : 20;
  const allowed = e.allowedMoisturePct !== undefined ? e.allowedMoisturePct : 20;
  const diffPct = Math.max(0, moisture - allowed);
  const dedPct = e.deductionPct !== undefined ? e.deductionPct : diffPct;
  const dedKg = (net * dedPct) / 100;
  const actualKg = e.actualWeightKg !== undefined ? e.actualWeightKg : Math.max(0, net - dedKg);
  const rate = e.ratePerMt || 1900;
  const totalAmt = e.totalAmountRs !== undefined ? e.totalAmountRs : Math.round((actualKg / 1000) * rate * 100) / 100;

  return {
    id: e.id || e._id,
    slipNo: e.slipNo,
    entryType: e.entryType, // "inward" | "outward"
    commodity: e.commodity,
    partyName: e.partyName || "",
    vehicleNo: e.vehicleNo || "",
    grossWeightKg: gross,
    tareWeightKg: tare,
    netWeightKg: net,
    moisturePct: moisture,
    allowedMoisturePct: allowed,
    deductionPct: dedPct,
    totalDeductionMt: Math.round((dedKg / 1000) * 1000) / 1000,
    actualWeightKg: actualKg,
    actualWeightMt: Math.round((actualKg / 1000) * 1000) / 1000,
    ratePerMt: rate,
    totalAmountRs: totalAmt,
    status: e.status || "pending", // "pending" | "approved" | "rejected"
    weightMachineId: e.weightMachine?.id || e.weightMachine || "",
    warehouseId: e.warehouse?.id || e.warehouse || "",
    warehouse: e.warehouse?.name || "",
    createdAt: formatDate(e.createdAt),
    createdAtRaw: e.createdAt,
  };
}

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
    allowedMoisturePct: payload.allowedMoisturePct || undefined,
    deductionPct: payload.deductionPct || undefined,
    ratePerMt: payload.ratePerMt || undefined,
  });
  return adaptStockEntry(data.data);
}
