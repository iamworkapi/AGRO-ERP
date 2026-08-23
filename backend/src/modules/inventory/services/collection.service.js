import { Collection } from "../models/Collection.js";
import { ApiError } from "../../common/utils/ApiError.js";
import { ROLES } from "../../common/constants/roles.js";
import { recordAudit } from "../../audit/services/audit.service.js";
import { assertCanAccessWarehouse, getOwnWarehouseId } from "../../warehouses/services/warehouseScope.service.js";
import { parsePagination, paginationMeta } from "../../common/utils/pagination.js";

function computeCollectionCalculations(input) {
  const gross = input.grossWeightMt || 0;
  const tare = input.tareWeightMt || 0;
  const net = Math.max(0, gross - tare);
  const moisture = input.actualMoisturePct || 0;
  const ash = input.actualAshPct || 0;
  const agreedMoisture = input.agreedMoisturePct || 20;
  const agreedAsh = input.agreedAshPct || 20;

  // Hard rejection criteria matching frontend
  if (moisture > 28) {
    return { net, isRejected: true, rejectionReason: `Moisture content (${moisture}%) exceeds maximum allowable limit of 28%.`, invoiceWeightMt: 0, totalDeductionPct: 100 };
  }
  if (ash > 35) {
    return { net, isRejected: true, rejectionReason: `Ash content (${ash}%) exceeds maximum allowable limit of 35%.`, invoiceWeightMt: 0, totalDeductionPct: 100 };
  }

  const numerator = 100 - moisture - ash;
  const denominator = 100 - agreedMoisture - agreedAsh;
  if (denominator <= 0 || numerator <= 0) {
    return { net, isRejected: true, rejectionReason: "Invalid quality parameters.", invoiceWeightMt: 0, totalDeductionPct: 100 };
  }

  const invoiceWeightMt = Math.round(net * (numerator / denominator) * 1000) / 1000;
  const totalDeductionPct = Math.round((1 - invoiceWeightMt / net) * 10000) / 100;
  const isRejected = false;
  const rejectionReason = "";

  return { net, moistureDeductionPct: totalDeductionPct, ashDeductionPct: 0, totalDeductionPct, invoiceWeightMt, isRejected, rejectionReason };
}

export async function listCollections(actor, { warehouseId, cropId, vendorId, isRejected, page, limit }) {
  let effectiveWarehouseId = warehouseId;
  if (actor.profile.role !== ROLES.SUPER_ADMIN) {
    effectiveWarehouseId = await getOwnWarehouseId(actor.profile);
  }
  if (!effectiveWarehouseId) {
    return { list: [], meta: paginationMeta({ page: 1, limit: 1, total: 0 }) };
  }
  if (warehouseId && warehouseId !== effectiveWarehouseId) {
    await assertCanAccessWarehouse(actor, effectiveWarehouseId);
  }
  await assertCanAccessWarehouse(actor, effectiveWarehouseId);

  const filter = { warehouse: effectiveWarehouseId };
  if (cropId) filter.cropId = cropId;
  if (vendorId) filter.vendorId = vendorId;
  if (isRejected !== undefined) filter.isRejected = isRejected;

  const { page: pageNum, limit: pageSize, skip } = parsePagination({ page, limit });
  const [list, total] = await Promise.all([
    Collection.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize).populate("warehouse", "name code").populate("recordedBy", "name email"),
    Collection.countDocuments(filter),
  ]);

  return { list, meta: paginationMeta({ page: pageNum, limit: pageSize, total }) };
}

export async function createCollection(actor, payload) {
  await assertCanAccessWarehouse(actor, payload.warehouseId);

  const calc = computeCollectionCalculations(payload);

  const slip = await Collection.create({
    warehouse: payload.warehouseId,
    vendorId: payload.vendorId || "",
    vendorName: payload.vendorName || "",
    cropId: payload.cropId,
    cropName: payload.cropName,
    villageName: payload.villageName,
    farmerName: payload.farmerName,
    farmerMobile: payload.farmerMobile || "",
    vehicleNo: payload.vehicleNo.toUpperCase(),
    vehicleType: payload.vehicleType || "Tractor Trolley",
    grossWeightMt: payload.grossWeightMt,
    tareWeightMt: payload.tareWeightMt,
    actualNetWeightMt: calc.net,
    actualMoisturePct: payload.actualMoisturePct,
    actualAshPct: payload.actualAshPct,
    agreedMoisturePct: payload.agreedMoisturePct || 20,
    agreedAshPct: payload.agreedAshPct || 20,
    moistureDeductionPct: calc.moistureDeductionPct,
    ashDeductionPct: calc.ashDeductionPct,
    totalDeductionPct: calc.totalDeductionPct,
    invoiceWeightMt: calc.invoiceWeightMt,
    isRejected: calc.isRejected,
    rejectionReason: calc.rejectionReason,
    baleCountProduced: payload.baleCountProduced || 0,
    balerMachine: payload.balerMachine || "",
    totalAmountRs: calc.isRejected ? 0 : Math.round(calc.invoiceWeightMt * (payload.ratePerMt || 1400) * 100) / 100,
    recordedBy: actor.profile._id,
  });

  await slip.populate("warehouse", "name code");
  await recordAudit({ actor, action: "collection.create", entityType: "collection", entityId: slip._id, warehouseId: payload.warehouseId, metadata: { slipNo: slip.slipNo, invoiceWeightMt: calc.invoiceWeightMt, isRejected: calc.isRejected } });
  return slip;
}

export async function getCollectionSummary(actor, warehouseId) {
  let effectiveWarehouseId = warehouseId;
  if (actor.profile.role !== ROLES.SUPER_ADMIN) {
    effectiveWarehouseId = await getOwnWarehouseId(actor.profile);
  }
  if (!effectiveWarehouseId) {
    return { totalSlips: 0, totalRawNetMt: 0, totalInvoiceMt: 0, totalRejected: 0, totalBales: 0, totalAmountRs: 0, avgMoisture: 0, avgAsh: 0 };
  }
  await assertCanAccessWarehouse(actor, effectiveWarehouseId);

  const docs = await Collection.find({ warehouse: effectiveWarehouseId });
  const totalSlips = docs.length;
  const totalRawNetMt = docs.reduce((s, d) => s + d.actualNetWeightMt, 0);
  const totalInvoiceMt = docs.reduce((s, d) => s + d.invoiceWeightMt, 0);
  const totalRejected = docs.filter((d) => d.isRejected).length;
  const totalBales = docs.reduce((s, d) => s + (d.baleCountProduced || 0), 0);
  const totalAmountRs = docs.reduce((s, d) => s + d.totalAmountRs, 0);
  const avgMoisture = totalSlips ? docs.reduce((s, d) => s + d.actualMoisturePct, 0) / totalSlips : 0;
  const avgAsh = totalSlips ? docs.reduce((s, d) => s + d.actualAshPct, 0) / totalSlips : 0;

  return { totalSlips, totalRawNetMt, totalInvoiceMt, totalRejected, totalBales, totalAmountRs, avgMoisture: Math.round(avgMoisture * 10) / 10, avgAsh: Math.round(avgAsh * 10) / 10 };
}
