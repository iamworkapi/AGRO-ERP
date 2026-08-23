import { ApiError } from "../../common/utils/ApiError.js";
import PurchaseOrder from "../models/PurchaseOrder.js";
import { recordAudit } from "../../audit/services/audit.service.js";

function assertCanAccessWarehouse(actor, warehouseId) {
  if (actor.roleKey === "super_admin") return;
  if (actor.warehouseId && String(actor.warehouseId) === String(warehouseId)) return;
  throw new ApiError.forbidden("Not authorized for this warehouse");
}

function buildPoNumber() {
  const y = new Date().getFullYear();
  const r = Math.floor(1000 + Math.random() * 9000);
  return `PO-${y}-${r}`;
}

export async function listPurchaseOrders(actor) {
  const filter = {};
  if (actor.roleKey !== "super_admin") filter.warehouseId = actor.warehouseId;
  return PurchaseOrder.find(filter)
    .populate("vendorId", "name vendorCode")
    .populate("itemId", "name itemCode")
    .populate("createdBy", "name")
    .populate("receivedBy", "name")
    .sort({ createdAt: -1 });
}

export async function getPurchaseOrder(actor, id) {
  const po = await PurchaseOrder.findById(id)
    .populate("vendorId", "name vendorCode")
    .populate("itemId", "name itemCode unit")
    .populate("createdBy", "name")
    .populate("receivedBy", "name");
  if (!po) throw new ApiError.notFound("Purchase order not found");
  assertCanAccessWarehouse(actor, po.warehouseId);
  return po;
}

export async function createPurchaseOrder(actor, payload) {
  assertCanAccessWarehouse(actor, payload.warehouseId);
  const po = await PurchaseOrder.create({ ...payload, poNumber: buildPoNumber(), createdBy: actor.id });
  await recordAudit({ actorId: actor.id, action: "purchase_order_created", entity: "PurchaseOrder", entityId: po._id, metadata: { poNumber: po.poNumber } });
  return getPurchaseOrder(actor, po._id);
}

export async function updatePurchaseOrderStatus(actor, id, status) {
  const po = await PurchaseOrder.findById(id);
  if (!po) throw new ApiError.notFound("Purchase order not found");
  assertCanAccessWarehouse(actor, po.warehouseId);
  const allowed = ["Pending", "Approved", "Received", "Cancelled"];
  if (!allowed.includes(status)) throw new ApiError.badRequest("Invalid status");
  po.status = status;
  if (status === "Received") { po.receivedAt = new Date(); po.receivedBy = actor.id; }
  await po.save();
  await recordAudit({ actorId: actor.id, action: "purchase_order_status_updated", entity: "PurchaseOrder", entityId: po._id, metadata: { poNumber: po.poNumber, newStatus: status } });
  return getPurchaseOrder(actor, po._id);
}

export async function deletePurchaseOrder(actor, id) {
  const po = await PurchaseOrder.findById(id);
  if (!po) throw new ApiError.notFound("Purchase order not found");
  assertCanAccessWarehouse(actor, po.warehouseId);
  if (po.status !== "Pending") throw new ApiError.badRequest("Can only delete pending POs");
  await po.deleteOne();
  await recordAudit({ actorId: actor.id, action: "purchase_order_deleted", entity: "PurchaseOrder", entityId: id, metadata: { poNumber: po.poNumber } });
  return { success: true };
}
