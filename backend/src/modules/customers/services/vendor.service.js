import Vendor from "../models/Vendor.js";
import { ApiError } from "../../common/utils/ApiError.js";
import { recordAudit } from "../../audit/services/audit.service.js";
import { parsePagination, paginationMeta } from "../../common/utils/pagination.js";

function assertCanAccessWarehouse(actor, warehouseId) {
  if (actor.roleKey === "super_admin") return;
  if (actor.warehouseId && String(actor.warehouseId) === String(warehouseId)) return;
  throw new ApiError.forbidden("Not authorized for this warehouse");
}

const ALLOWED_UPDATE_FIELDS = [
  "name", "vendorCode", "vendorId", "contactPerson", "phone", "email",
  "address", "gstin", "category", "creditLimit", "status",
];

export async function listVendors(actor, { search, status, page, limit }) {
  const filter = {};
  if (actor.roleKey !== "super_admin") filter.warehouseId = actor.warehouseId;
  else if (actor.warehouseId) filter.warehouseId = actor.warehouseId;

  if (status && status !== "ALL") filter.status = status;
  if (search) {
    const reg = new RegExp(search, "i");
    filter.$or = [{ name: reg }, { vendorCode: reg }, { contactPerson: reg }, { gstin: reg }, { phone: reg }];
  }

  const { page: pageNum, limit: pageSize, skip } = parsePagination({ page, limit });
  const [list, total] = await Promise.all([
    Vendor.find(filter).sort({ name: 1 }).skip(skip).limit(pageSize),
    Vendor.countDocuments(filter),
  ]);
  return { list, meta: paginationMeta({ page: pageNum, limit: pageSize, total }) };
}

export async function getVendor(actor, id) {
  const v = await Vendor.findById(id);
  if (!v) throw ApiError.notFound("Vendor not found");
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
  if (!v) throw ApiError.notFound("Vendor not found");
  assertCanAccessWarehouse(actor, v.warehouseId);
  const patch = {};
  for (const field of ALLOWED_UPDATE_FIELDS) {
    if (payload[field] !== undefined) patch[field] = payload[field];
  }
  Object.assign(v, patch);
  await v.save();
  await recordAudit({ actorId: actor.id, action: "vendor_updated", entity: "Vendor", entityId: v._id });
  return v;
}

export async function deleteVendor(actor, id) {
  const v = await Vendor.findById(id);
  if (!v) throw ApiError.notFound("Vendor not found");
  assertCanAccessWarehouse(actor, v.warehouseId);
  await v.deleteOne();
  await recordAudit({ actorId: actor.id, action: "vendor_deleted", entity: "Vendor", entityId: id });
  return { success: true };
}
