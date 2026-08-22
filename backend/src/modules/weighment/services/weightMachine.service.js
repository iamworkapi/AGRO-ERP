import { WeightMachine } from "../models/WeightMachine.js";
import { ApiError } from "../../common/utils/ApiError.js";
import { ROLES } from "../../common/constants/roles.js";
import { recordAudit } from "./audit.service.js";
import { assertCanAccessWarehouse, getOwnWarehouseId } from "./warehouseScope.service.js";

export async function listWeightMachines(actor, { warehouseId }) {
  // Super Admin with no warehouseId gets the org-wide list, matching the
  // pattern used by listEmployees/listItems/listStockEntries; everyone else
  // is always scoped to their own warehouse.
  if (actor.profile.role === ROLES.SUPER_ADMIN && !warehouseId) {
    return WeightMachine.find({}).sort({ createdAt: -1 }).populate("warehouse", "name code");
  }

  let effectiveWarehouseId = warehouseId;
  if (actor.profile.role !== ROLES.SUPER_ADMIN) {
    effectiveWarehouseId = await getOwnWarehouseId(actor.profile);
  }
  if (!effectiveWarehouseId) return [];
  await assertCanAccessWarehouse(actor, effectiveWarehouseId);

  return WeightMachine.find({ warehouse: effectiveWarehouseId }).sort({ createdAt: -1 }).populate("warehouse", "name code");
}

// Provisioning a new physical machine is an admin-level action; day-to-day
// maintenance (calibration, status) is the supervisor's job - see
// weightMachine.routes.js for the role split.
export async function createWeightMachine(actor, payload) {
  await assertCanAccessWarehouse(actor, payload.warehouseId);

  try {
    const machine = await WeightMachine.create({
      warehouse: payload.warehouseId,
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
