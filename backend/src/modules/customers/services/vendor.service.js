import { ApiError } from "../../common/utils/ApiError.js";
import Vendor from "../models/Vendor.js";
import { recordAudit } from "../../audit/services/audit.service.js";

function assertCanAccessWarehouse(actor, warehouseId) {
  if (actor.roleKey === "super_admin") return;
  if (actor.warehouseId && String(actor.warehouseId) === String(warehouseId)) return;
  throw new ApiError.forbidden("Not authorized for this warehouse");
}

export async function listVendors(actor) {
  const filter = {};
  if (actor.roleKey !== "super_admin") filter.warehouseId = actor.warehouseId;
  return Vendor.find(filter).sort({ name: 1 });
}

export async function getVendor(actor, id) {
  const v = await Vendor.findById(id);
  if (!v) throw new ApiError.notFound("Vendor not found");
  assertCanAccessWarehouse(actor, v.warehouseId);
  return v;
}

export async function createVendor(actor, payload) {
  assertCanAccessWarehouse(actor, payload.warehouseId);
  const v = await Vendor.create({ ...payload, createdBy: actor.id });
  await recordAudit({ actorId: actor.id, action: "vendor_created", entity: "Vendor", entityId: v._id });
  return v;
}

export async function updateVendor(actor, id, payload) {
  const v = await Vendor.findById(id);
  if (!v) throw new ApiError.notFound("Vendor not found");
  assertCanAccessWarehouse(actor, v.warehouseId);
  Object.assign(v, payload);
  await v.save();
  await recordAudit({ actorId: actor.id, action: "vendor_updated", entity: "Vendor", entityId: v._id });
  return v;
}

export async function deleteVendor(actor, id) {
  const v = await Vendor.findById(id);
  if (!v) throw new ApiError.notFound("Vendor not found");
  assertCanAccessWarehouse(actor, v.warehouseId);
  await v.deleteOne();
  await recordAudit({ actorId: actor.id, action: "vendor_deleted", entity: "Vendor", entityId: id });
  return { success: true };
}
