import { ApiError } from "../../common/utils/ApiError.js";
import Alert from "../models/Alert.js";
import { recordAudit } from "../../audit/services/audit.service.js";

function assertCanAccessWarehouse(actor, warehouseId) {
  if (actor.roleKey === "super_admin") return;
  if (actor.warehouseId && String(actor.warehouseId) === String(warehouseId)) return;
  throw new ApiError.forbidden("Not authorized for this warehouse");
}

export async function listAlerts(actor, filters = {}) {
  const filter = {};
  if (actor.roleKey !== "super_admin") filter.warehouseId = actor.warehouseId;
  if (filters.status) filter.status = filters.status;
  if (filters.type) filter.type = filters.type;
  if (filters.severity) filter.severity = filters.severity;
  return Alert.find(filter).sort({ createdAt: -1 });
}

export async function getAlert(actor, id) {
  const a = await Alert.findById(id);
  if (!a) throw new ApiError.notFound("Alert not found");
  assertCanAccessWarehouse(actor, a.warehouseId);
  return a;
}

export async function createAlert(actor, payload) {
  assertCanAccessWarehouse(actor, payload.warehouseId);
  return Alert.create({ ...payload, createdBy: actor.id });
}

export async function acknowledgeAlert(actor, id) {
  const a = await Alert.findById(id);
  if (!a) throw new ApiError.notFound("Alert not found");
  assertCanAccessWarehouse(actor, a.warehouseId);
  a.status = "Acknowledged";
  a.acknowledgedBy = actor.id;
  a.acknowledgedAt = new Date();
  await a.save();
  await recordAudit({ actorId: actor.id, action: "alert_acknowledged", entity: "Alert", entityId: a._id });
  return a;
}

export async function resolveAlert(actor, id) {
  const a = await Alert.findById(id);
  if (!a) throw new ApiError.notFound("Alert not found");
  assertCanAccessWarehouse(actor, a.warehouseId);
  a.status = "Resolved";
  a.resolvedBy = actor.id;
  a.resolvedAt = new Date();
  await a.save();
  await recordAudit({ actorId: actor.id, action: "alert_resolved", entity: "Alert", entityId: a._id });
  return a;
}

export async function deleteAlert(actor, id) {
  const a = await Alert.findById(id);
  if (!a) throw new ApiError.notFound("Alert not found");
  assertCanAccessWarehouse(actor, a.warehouseId);
  await a.deleteOne();
  await recordAudit({ actorId: actor.id, action: "alert_deleted", entity: "Alert", entityId: id });
  return { success: true };
}