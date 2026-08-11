import { StockEntry } from "../models/StockEntry.js";
import { WeightMachine } from "../models/WeightMachine.js";
import { ApiError } from "../utils/ApiError.js";
import { ROLES } from "../constants/roles.js";
import { recordAudit } from "./audit.service.js";
import { assertCanAccessWarehouse, getOwnWarehouseId } from "./warehouseScope.service.js";
import { parsePagination, paginationMeta } from "../utils/pagination.js";

export async function listStockEntries(actor, { warehouseId, page, limit }) {
  // Super Admin with no warehouseId gets the org-wide ledger, matching the
  // pattern used by listEmployees/listWarehouses - everyone else is always
  // scoped to their own warehouse.
  let filter = {};
  if (actor.profile.role === ROLES.SUPER_ADMIN && !warehouseId) {
    filter = {};
  } else {
    let effectiveWarehouseId = warehouseId;
    if (actor.profile.role !== ROLES.SUPER_ADMIN) {
      effectiveWarehouseId = await getOwnWarehouseId(actor.profile);
    }
    if (!effectiveWarehouseId) return { list: [], meta: paginationMeta({ page: 1, limit: 1, total: 0 }) };
    await assertCanAccessWarehouse(actor, effectiveWarehouseId);
    filter = { warehouse: effectiveWarehouseId };
  }

  const { page: pageNum, limit: pageSize, skip } = parsePagination({ page, limit });
  const [list, total] = await Promise.all([
    StockEntry.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize).populate("warehouse", "name code"),
    StockEntry.countDocuments(filter),
  ]);

  return { list, meta: paginationMeta({ page: pageNum, limit: pageSize, total }) };
}

// This is the core of "supervisor maintains weight-machine stock": every
// inward/outward movement recorded against a machine in the supervisor's
// own warehouse, starting life as 'pending' for the admin to review.
export async function createStockEntry(actor, payload) {
  await assertCanAccessWarehouse(actor, payload.warehouseId);

  const machine = await WeightMachine.findById(payload.weightMachineId).select("warehouse status");
  if (!machine) throw ApiError.notFound("Weight machine not found.");
  if (machine.warehouse.toString() !== payload.warehouseId) {
    throw ApiError.badRequest("That weight machine does not belong to this warehouse.");
  }
  if (machine.status !== "active") {
    throw ApiError.badRequest(`Weight machine is currently ${machine.status} and cannot log new entries.`);
  }

  try {
    const entry = await StockEntry.create({
      warehouse: payload.warehouseId,
      weightMachine: payload.weightMachineId,
      slipNo: payload.slipNo,
      entryType: payload.entryType,
      commodity: payload.commodity,
      partyName: payload.partyName,
      vehicleNo: payload.vehicleNo,
      grossWeightKg: payload.grossWeightKg,
      tareWeightKg: payload.tareWeightKg,
      moisturePct: payload.moisturePct,
      allowedMoisturePct: payload.allowedMoisturePct,
      deductionPct: payload.deductionPct,
      ratePerMt: payload.ratePerMt,
      recordedBy: actor.profile._id,
    });
    await entry.populate("warehouse", "name code");

    await recordAudit({ actor, action: "stock_entry.create", entityType: "stock_entry", entityId: entry._id, warehouseId: entry.warehouse, metadata: { slipNo: entry.slipNo, netWeightKg: entry.netWeightKg } });
    return entry;
  } catch (error) {
    if (error.code === 11000) throw ApiError.conflict("A stock entry with this slip number already exists for this warehouse.");
    if (error.name === "ValidationError") throw ApiError.badRequest(error.message);
    throw error;
  }
}

// Reviewing (approve/reject) is deliberately kept separate from the
// supervisor's create - it's how the admin oversight loop closes.
export async function reviewStockEntry(actor, id, status) {
  const existing = await StockEntry.findById(id);
  if (!existing) throw ApiError.notFound("Stock entry not found.");

  if (actor.profile.role !== ROLES.SUPER_ADMIN) {
    const ownWarehouseId = await getOwnWarehouseId(actor.profile);
    if (ownWarehouseId !== existing.warehouse.toString()) {
      throw ApiError.forbidden("You can only review stock entries in your own warehouse.");
    }
  }

  existing.status = status;
  existing.reviewedBy = actor.profile._id;
  existing.reviewedAt = new Date();
  await existing.save();

  await recordAudit({ actor, action: `stock_entry.${status}`, entityType: "stock_entry", entityId: id, warehouseId: existing.warehouse });
  return existing;
}
