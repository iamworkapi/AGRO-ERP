import Customer from "../models/Customer.js";
import { ApiError } from "../../common/utils/ApiError.js";
import { recordAudit } from "../../audit/services/audit.service.js";
import { parsePagination, paginationMeta } from "../../common/utils/pagination.js";

function assertCanAccessWarehouse(actor, warehouseId) {
  if (actor.roleKey === "super_admin") return;
  if (actor.warehouseId && String(actor.warehouseId) === String(warehouseId)) return;
  throw new ApiError.forbidden("Not authorized for this warehouse");
}

const ALLOWED_UPDATE_FIELDS = [
  "name", "buyerId", "contactPerson", "phone", "email", "address",
  "gstin", "creditLimit", "status",
];

export async function listCustomers(actor, { search, status, page, limit }) {
  const filter = {};
  if (actor.roleKey !== "super_admin") filter.warehouseId = actor.warehouseId;
  else if (actor.warehouseId) filter.warehouseId = actor.warehouseId;

  if (status && status !== "ALL") filter.status = status;
  if (search) {
    const reg = new RegExp(search, "i");
    filter.$or = [{ name: reg }, { contactPerson: reg }, { gstin: reg }, { phone: reg }];
  }

  const { page: pageNum, limit: pageSize, skip } = parsePagination({ page, limit });
  const [list, total] = await Promise.all([
    Customer.find(filter).sort({ name: 1 }).skip(skip).limit(pageSize),
    Customer.countDocuments(filter),
  ]);
  return { list, meta: paginationMeta({ page: pageNum, limit: pageSize, total }) };
}

export async function getCustomer(actor, id) {
  const c = await Customer.findById(id);
  if (!c) throw ApiError.notFound("Customer not found");
  assertCanAccessWarehouse(actor, c.warehouseId);
  return c;
}

export async function createCustomer(actor, payload) {
  assertCanAccessWarehouse(actor, payload.warehouseId);
  const c = await Customer.create({ ...payload, createdBy: actor.id });
  await recordAudit({ actorId: actor.id, action: "customer_created", entity: "Customer", entityId: c._id });
  return c;
}

export async function updateCustomer(actor, id, payload) {
  const c = await Customer.findById(id);
  if (!c) throw ApiError.notFound("Customer not found");
  assertCanAccessWarehouse(actor, c.warehouseId);
  const patch = {};
  for (const field of ALLOWED_UPDATE_FIELDS) {
    if (payload[field] !== undefined) patch[field] = payload[field];
  }
  Object.assign(c, patch);
  await c.save();
  await recordAudit({ actorId: actor.id, action: "customer_updated", entity: "Customer", entityId: c._id });
  return c;
}

export async function deleteCustomer(actor, id) {
  const c = await Customer.findById(id);
  if (!c) throw ApiError.notFound("Customer not found");
  assertCanAccessWarehouse(actor, c.warehouseId);
  await c.deleteOne();
  await recordAudit({ actorId: actor.id, action: "customer_deleted", entity: "Customer", entityId: id });
  return { success: true };
}
