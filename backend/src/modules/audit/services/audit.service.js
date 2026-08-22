import { AuditLog } from "../models/AuditLog.js";
import { Warehouse } from "../../warehouses/models/Warehouse.js";
import { ROLES } from "../../common/constants/roles.js";

// Every mutation in the app (warehouse created, stock entry logged, employee
// added, etc.) calls this so warehouse_admins can monitor their supervisor's
// activity and the super_admin can monitor everyone, everywhere - one
// collection, one shape, no per-module logging conventions to keep in sync.
export async function recordAudit({ actor, action, entityType, entityId, warehouseId, metadata = {} }) {
  try {
    await AuditLog.create({
      actor: actor.profile._id,
      actorRole: actor.profile.role,
      action,
      entityType,
      entityId: entityId ?? undefined,
      warehouse: warehouseId ?? undefined,
      metadata,
    });
  } catch (error) {
    // Auditing must never break the primary action it's describing - log
    // and move on rather than throwing.
    console.error("[audit] failed to record audit log", { action, entityType, entityId, error });
  }
}

export async function listAuditLogs({ actor, warehouseId, actorId, limit = 100 }) {
  const filter = {};

  if (actor.profile.role === ROLES.WAREHOUSE_ADMIN) {
    // Admins only monitor their own warehouse's audit trail.
    const warehouse = await Warehouse.findOne({ admin: actor.profile._id }).select("_id");
    filter.warehouse = warehouse?._id ?? null; // null -> query matches nothing, which is correct if unassigned
  } else if (warehouseId) {
    filter.warehouse = warehouseId;
  }

  if (actorId) filter.actor = actorId;

  return AuditLog.find(filter).sort({ createdAt: -1 }).limit(limit);
}
