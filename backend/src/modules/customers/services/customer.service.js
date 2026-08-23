import { ApiError } from "../../common/utils/ApiError.js";
import Customer from "../models/Customer.js";
import { recordAudit } from "../../audit/services/audit.service.js";

function assertCanAccessWarehouse(actor, warehouseId) {
  if (actor.roleKey === "super_admin") return;
  if (actor.warehouseId && String(actor.warehouseId) === String(warehouseId)) return;
  throw new ApiError.forbidden("Not authorized for this warehouse");
}

export async function listCustomers(actor) {
  const filter = {};
  if (actor.roleKey !== "super_admin") filter.warehouseId = actor.warehouseId;
  return Customer.find(filter).sort({ name: 1 });
}

export async function getCustomer(actor, id) {
  const c = await Customer.findById(id);
  if (!c) throw new ApiError.notFound("Customer not found");
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
  if (!c) throw new ApiError.notFound("Customer not found");
  assertCanAccessWarehouse(actor, c.warehouseId);
  Object.assign(c, payload);
  await c.save();
  await recordAudit({ actorId: actor.id, action: "customer_updated", entity: "Customer", entityId: c._id });
  return c;
}

export async function deleteCustomer(actor, id) {
  const c = await Customer.findById(id);
  if (!c) throw new ApiError.notFound("Customer not found");
  assertCanAccessWarehouse(actor, c.warehouseId);
  await c.deleteOne();
  await recordAudit({ actorId: actor.id, action: "customer_deleted", entity: "Customer", entityId: id });
  return { success: true };
}