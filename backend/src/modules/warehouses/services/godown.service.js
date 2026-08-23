import { Godown } from "../models/Godown.js";
import { ApiError } from "../../common/utils/ApiError.js";
import { ROLES } from "../../common/constants/roles.js";
import { recordAudit } from "../../audit/services/audit.service.js";
import { assertCanAccessWarehouse, getOwnWarehouseId } from "./warehouseScope.service.js";

export async function listGodowns(actor, { warehouseId }) {
  if (actor.profile.role === ROLES.SUPER_ADMIN && !warehouseId) {
    return Godown.find({}).sort({ createdAt: -1 }).populate("warehouse", "name code");
  }

  let effectiveWarehouseId = warehouseId;
  if (actor.profile.role !== ROLES.SUPER_ADMIN) {
    effectiveWarehouseId = await getOwnWarehouseId(actor.profile);
  }
  if (!effectiveWarehouseId) return [];
  await assertCanAccessWarehouse(actor, effectiveWarehouseId);

  return Godown.find({ warehouse: effectiveWarehouseId }).sort({ name: 1 }).populate("warehouse", "name code");
}

export async function createGodown(actor, payload) {
  await assertCanAccessWarehouse(actor, payload.warehouseId);

  try {
    const godown = await Godown.create({
      warehouse: payload.warehouseId,
      name: payload.name,
      capacityMt: payload.capacityMt,
      areaSqFt: payload.areaSqFt,
      godownType: payload.godownType || "covered",
      notes: payload.notes,
      addedBy: actor.profile._id,
    });
    await godown.populate("warehouse", "name code");

    await recordAudit({ actor, action: "godown.create", entityType: "godown", entityId: godown._id, warehouseId: godown.warehouse, metadata: { name: godown.name, capacityMt: godown.capacityMt } });
    return godown;
  } catch (error) {
    if (error.code === 11000) throw ApiError.conflict("A godown with this name already exists in this warehouse.");
    throw error;
  }
}

export async function updateGodown(actor, id, payload) {
  const existing = await Godown.findById(id);
  if (!existing) throw ApiError.notFound("Godown not found.");
  await assertCanAccessWarehouse(actor, existing.warehouse.toString());

  const patch = {};
  if (payload.name !== undefined) patch.name = payload.name;
  if (payload.capacityMt !== undefined) patch.capacityMt = payload.capacityMt;
  if (payload.currentStockMt !== undefined) patch.currentStockMt = payload.currentStockMt;
  if (payload.areaSqFt !== undefined) patch.areaSqFt = payload.areaSqFt;
  if (payload.godownType !== undefined) patch.godownType = payload.godownType;
  if (payload.status !== undefined) patch.status = payload.status;
  if (payload.notes !== undefined) patch.notes = payload.notes;

  const godown = await Godown.findByIdAndUpdate(id, patch, { new: true, runValidators: true }).populate("warehouse", "name code");

  await recordAudit({ actor, action: "godown.update", entityType: "godown", entityId: id, warehouseId: existing.warehouse, metadata: { fields: Object.keys(patch) } });
  return godown;
}

export async function deleteGodown(actor, id) {
  const existing = await Godown.findById(id);
  if (!existing) throw ApiError.notFound("Godown not found.");
  await assertCanAccessWarehouse(actor, existing.warehouse.toString());

  if ((existing.currentStockMt || 0) > 0) {
    throw ApiError.badRequest("Cannot delete a godown that still has stock. Transfer or clear stock first.");
  }

  await Godown.findByIdAndDelete(id);
  await recordAudit({ actor, action: "godown.delete", entityType: "godown", entityId: id, warehouseId: existing.warehouse, metadata: { name: existing.name } });
  return { id };
}

export async function updateGodownStock(warehouseId, godownId, deltaMt) {
  // Adjusts currentStockMt by deltaMt (positive for stock-in, negative for stock-out).
  // Used by stock movement operations.
  const godown = await Godown.findOne({ _id: godownId, warehouse: warehouseId });
  if (!godown) throw ApiError.notFound("Godown not found.");

  const newStock = (godown.currentStockMt || 0) + deltaMt;
  if (newStock < 0) throw ApiError.badRequest("Insufficient stock in this godown.");

  const capacity = godown.capacityMt || Infinity;
  if (newStock > capacity) throw ApiError.badRequest(`Stock would exceed godown capacity (${capacity} MT).`);

  godown.currentStockMt = newStock;
  if (newStock >= capacity) {
    godown.status = "full";
  } else if (godown.status === "full") {
    godown.status = "active";
  }
  await godown.save();
  return godown;
}
