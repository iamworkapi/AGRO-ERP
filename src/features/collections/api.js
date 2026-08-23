import { apiClient } from "../../services/apiClient";

function unwrapList(data) {
  return Array.isArray(data?.data) ? data.data : [];
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function adaptCollection(c) {
  return {
    id: c.id || c._id,
    slipNo: c.slipNo,
    vendorId: c.vendorId || "",
    vendorName: c.vendorName || "",
    cropId: c.cropId,
    cropName: c.cropName,
    villageName: c.villageName,
    farmerName: c.farmerName,
    farmerMobile: c.farmerMobile || "",
    vehicleNo: c.vehicleNo,
    vehicleType: c.vehicleType || "Tractor Trolley",
    grossWeightMt: c.grossWeightMt || 0,
    tareWeightMt: c.tareWeightMt || 0,
    actualNetWeightMt: c.actualNetWeightMt || 0,
    actualMoisturePct: c.actualMoisturePct || 0,
    actualAshPct: c.actualAshPct || 0,
    agreedMoisturePct: c.agreedMoisturePct || 20,
    agreedAshPct: c.agreedAshPct || 20,
    moistureDeductionPct: c.moistureDeductionPct || 0,
    ashDeductionPct: c.ashDeductionPct || 0,
    totalDeductionPct: c.totalDeductionPct || 0,
    invoiceWeightMt: c.invoiceWeightMt || 0,
    isRejected: c.isRejected || false,
    rejectionReason: c.rejectionReason || "",
    baleCountProduced: c.baleCountProduced || 0,
    balerMachine: c.balerMachine || "",
    totalAmountRs: c.totalAmountRs || 0,
    warehouseId: c.warehouse?.id || c.warehouse || "",
    warehouse: c.warehouse?.name || "",
    recordedBy: c.recordedBy?.name || "",
    createdAt: formatDate(c.createdAt),
    createdAtRaw: c.createdAt,
  };
}

export async function fetchCollections(warehouseId, params = {}) {
  const query = { warehouseId, ...params };
  const { data } = await apiClient.get("/collections", { params: query });
  return unwrapList(data).map(adaptCollection);
}

export async function createCollection(payload) {
  const { data } = await apiClient.post("/collections", {
    warehouseId: payload.warehouseId,
    cropId: payload.cropId,
    cropName: payload.cropName,
    vendorId: payload.vendorId || undefined,
    vendorName: payload.vendorName || undefined,
    villageName: payload.villageName,
    farmerName: payload.farmerName,
    farmerMobile: payload.farmerMobile || undefined,
    vehicleNo: payload.vehicleNo,
    vehicleType: payload.vehicleType || "Tractor Trolley",
    grossWeightMt: payload.grossWeightMt,
    tareWeightMt: payload.tareWeightMt,
    actualMoisturePct: payload.actualMoisturePct,
    actualAshPct: payload.actualAshPct,
    agreedMoisturePct: payload.agreedMoisturePct || 20,
    agreedAshPct: payload.agreedAshPct || 20,
    baleCountProduced: payload.baleCountProduced || 0,
    balerMachine: payload.balerMachine || undefined,
    ratePerMt: payload.ratePerMt,
  });
  return adaptCollection(data.data);
}

export async function fetchCollectionSummary(warehouseId) {
  const { data } = await apiClient.get("/collections/summary", { params: { warehouseId } });
  return data.data;
}
