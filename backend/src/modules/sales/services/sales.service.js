import { ApiError } from "../../common/utils/ApiError.js";
import SalesInvoice from "../models/SalesInvoice.js";
import { recordAudit } from "../../audit/services/audit.service.js";

function assertCanAccessWarehouse(actor, warehouseId) {
  if (actor.roleKey === "super_admin") return;
  if (actor.warehouseId && String(actor.warehouseId) === String(warehouseId)) return;
  throw new ApiError.forbidden("Not authorized for this warehouse");
}

function buildInvoiceNumber() {
  const y = new Date().getFullYear();
  const r = Math.floor(1000 + Math.random() * 9000);
  return `INV-${y}-${r}`;
}

export async function listSalesInvoices(actor) {
  const filter = {};
  if (actor.roleKey !== "super_admin") filter.warehouseId = actor.warehouseId;
  return SalesInvoice.find(filter)
    .populate("customerId", "name")
    .populate("itemId", "name itemCode")
    .populate("createdBy", "name")
    .sort({ createdAt: -1 });
}

export async function getSalesInvoice(actor, id) {
  const inv = await SalesInvoice.findById(id)
    .populate("customerId", "name")
    .populate("itemId", "name itemCode unit")
    .populate("createdBy", "name");
  if (!inv) throw new ApiError.notFound("Sales invoice not found");
  assertCanAccessWarehouse(actor, inv.warehouseId);
  return inv;
}

export async function createSalesInvoice(actor, payload) {
  assertCanAccessWarehouse(actor, payload.warehouseId);
  const invoice = await SalesInvoice.create({ ...payload, invoiceNo: buildInvoiceNumber(), createdBy: actor.id });
  await recordAudit({ actorId: actor.id, action: "sales_invoice_created", entity: "SalesInvoice", entityId: invoice._id, metadata: { invoiceNo: invoice.invoiceNo } });
  return getSalesInvoice(actor, invoice._id);
}

export async function updateSalesInvoiceStatus(actor, id, status) {
  const invoice = await SalesInvoice.findById(id);
  if (!invoice) throw new ApiError.notFound("Sales invoice not found");
  assertCanAccessWarehouse(actor, invoice.warehouseId);
  const allowed = ["Pending", "Dispatched", "Delivered", "Cancelled"];
  if (!allowed.includes(status)) throw new ApiError.badRequest("Invalid status");
  invoice.status = status;
  if (status === "Delivered") invoice.deliveredAt = new Date();
  await invoice.save();
  await recordAudit({ actorId: actor.id, action: "sales_invoice_status_updated", entity: "SalesInvoice", entityId: invoice._id, metadata: { invoiceNo: invoice.invoiceNo, newStatus: status } });
  return getSalesInvoice(actor, invoice._id);
}

export async function deleteSalesInvoice(actor, id) {
  const invoice = await SalesInvoice.findById(id);
  if (!invoice) throw new ApiError.notFound("Sales invoice not found");
  assertCanAccessWarehouse(actor, invoice.warehouseId);
  if (invoice.status !== "Pending") throw new ApiError.badRequest("Can only delete pending invoices");
  await invoice.deleteOne();
  await recordAudit({ actorId: actor.id, action: "sales_invoice_deleted", entity: "SalesInvoice", entityId: id, metadata: { invoiceNo: invoice.invoiceNo } });
  return { success: true };
}
