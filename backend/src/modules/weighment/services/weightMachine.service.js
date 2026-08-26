import { WeightMachine } from "../models/WeightMachine.js";
import { Warehouse } from "../../warehouses/models/Warehouse.js";
import { ApiError } from "../../common/utils/ApiError.js";
import { ROLES } from "../../common/constants/roles.js";
import { recordAudit } from "../../audit/services/audit.service.js";
import { assertCanAccessWarehouse, getOwnWarehouseId } from "../../warehouses/services/warehouseScope.service.js";

export async function listWeightMachines(actor, { warehouseId }) {
  // Super Admin with no warehouseId gets the org-wide list, matching the
  // pattern used by listEmployees/listItems/listStockEntries; everyone else
  // is always scoped to their own warehouse.
  if (actor.profile?.role === ROLES.SUPER_ADMIN && !warehouseId) {
    return WeightMachine.find({}).sort({ createdAt: -1 }).populate("warehouse", "name code");
  }

  let effectiveWarehouseId = warehouseId;
  if (actor.profile?.role !== ROLES.SUPER_ADMIN) {
    effectiveWarehouseId = await getOwnWarehouseId(actor.profile);
  }
  if (!effectiveWarehouseId) {
    // If supervisor has no explicit warehouse in profile, fallback to first active warehouse or all
    const firstWh = await Warehouse.findOne({ status: "active" }).select("_id");
    effectiveWarehouseId = firstWh ? firstWh._id.toString() : null;
  }
  if (!effectiveWarehouseId) {
    return WeightMachine.find({}).sort({ createdAt: -1 }).populate("warehouse", "name code");
  }

  return WeightMachine.find({ warehouse: effectiveWarehouseId }).sort({ createdAt: -1 }).populate("warehouse", "name code");
}

// Provisioning and managing physical weighbridge machines is accessible to
// Super Admins, Warehouse Admins, and Floor Supervisors for their hub.
export async function createWeightMachine(actor, payload) {
  let targetWarehouseId = payload.warehouseId;
  if (!targetWarehouseId && actor.profile?.warehouse) {
    targetWarehouseId = actor.profile.warehouse.toString();
  }
  if (!targetWarehouseId && actor.profile?.role !== ROLES.SUPER_ADMIN) {
    targetWarehouseId = await getOwnWarehouseId(actor.profile);
  }
  if (!targetWarehouseId) {
    const firstWh = await Warehouse.findOne({ status: "active" }).select("_id");
    if (firstWh) targetWarehouseId = firstWh._id.toString();
  }
  if (!targetWarehouseId) {
    throw ApiError.badRequest("Warehouse is required to register a weight machine. Please create a warehouse hub first.");
  }
  if (actor.profile?.role !== ROLES.SUPER_ADMIN && actor.profile?.warehouse) {
    await assertCanAccessWarehouse(actor, targetWarehouseId);
  }

  try {
    const machine = await WeightMachine.create({
      warehouse: targetWarehouseId,
      machineCode: payload.machineCode,
      make: payload.make,
      model: payload.model,
      capacityKg: payload.capacityKg,
      installedOn: payload.installedOn,
    });
    await machine.populate("warehouse", "name code");

    await recordAudit({ actor, action: "weight_machine.create", entityType: "weight_machine", entityId: machine._id, warehouseId: machine.warehouse });
    return machine;
  } catch (error) {
    if (error.code === 11000) throw ApiError.conflict("A weight machine with this code already exists.");
    throw error;
  }
}

export async function updateWeightMachine(actor, id, payload) {
  const existing = await WeightMachine.findById(id);
  if (!existing) throw ApiError.notFound("Weight machine not found.");
  await assertCanAccessWarehouse(actor, existing.warehouse.toString());

  const patch = {};
  if (payload.make !== undefined) patch.make = payload.make;
  if (payload.model !== undefined) patch.model = payload.model;
  if (payload.capacityKg !== undefined) patch.capacityKg = payload.capacityKg;
  if (payload.lastCalibratedOn !== undefined) patch.lastCalibratedOn = payload.lastCalibratedOn;
  if (payload.nextCalibrationDue !== undefined) patch.nextCalibrationDue = payload.nextCalibrationDue;
  if (payload.status !== undefined) patch.status = payload.status;

  const machine = await WeightMachine.findByIdAndUpdate(id, patch, { new: true, runValidators: true });

  await recordAudit({ actor, action: "weight_machine.update", entityType: "weight_machine", entityId: id, warehouseId: existing.warehouse, metadata: patch });
  return machine;
}

export async function deleteWeightMachine(actor, id) {
  const existing = await WeightMachine.findById(id);
  if (!existing) throw ApiError.notFound("Weight machine not found.");
  await assertCanAccessWarehouse(actor, existing.warehouse.toString());

  await WeightMachine.findByIdAndDelete(id);
  await recordAudit({ actor, action: "weight_machine.delete", entityType: "weight_machine", entityId: id, warehouseId: existing.warehouse });
  return { id };
}
