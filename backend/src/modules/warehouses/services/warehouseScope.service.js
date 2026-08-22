import { Warehouse } from "../models/Warehouse.js";
import { ApiError } from "../../common/utils/ApiError.js";
import { ROLES } from "../../common/constants/roles.js";

// Every warehouse-scoped resource (employees, weight machines, stock
// entries, audit logs) needs the same answer to "which warehouse(s) can this
// user touch": super_admin -> all, warehouse_admin/supervisor -> exactly the
// one warehouse they're assigned to. Centralising it here means that answer
// can't accidentally diverge between modules.
export async function getOwnWarehouseId(profile) {
  if (profile.role === ROLES.SUPER_ADMIN) return null;

  const field = profile.role === ROLES.WAREHOUSE_ADMIN ? "admin" : "supervisor";
  const warehouse = await Warehouse.findOne({ [field]: profile._id }).select("_id");
  return warehouse?.id ?? null;
}

// Throws unless `actor` is allowed to act on `warehouseId`. Returns nothing
// on success so callers just `await` it before proceeding.
export async function assertCanAccessWarehouse(actor, warehouseId) {
  if (!warehouseId) throw ApiError.badRequest("warehouseId is required.");
  if (actor.profile.role === ROLES.SUPER_ADMIN) return;

  const ownWarehouseId = await getOwnWarehouseId(actor.profile);
  if (!ownWarehouseId) {
    throw ApiError.forbidden("You are not currently assigned to a warehouse.");
  }
  if (ownWarehouseId !== String(warehouseId)) {
    throw ApiError.forbidden("You can only manage resources within your own warehouse.");
  }
}
