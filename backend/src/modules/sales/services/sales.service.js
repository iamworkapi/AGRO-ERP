import { ApiError } from "../../common/utils/ApiError.js";
import SalesInvoice from "../models/SalesInvoice.js";
import { recordAudit } from "../../audit/services/audit.service.js";
import { parsePagination, paginationMeta } from "../../common/utils/pagination.js";

function assertCanAccessWarehouse(actor, warehouseId) {
  if (actor.roleKey === "super_admin") return;
  if (actor.warehouseId && String(actor.warehouseId) === String(warehouseId)) return;
  throw new ApiError.forbidden("Not authorized for this warehouse");
}

const ALLOWED_UPDATE_FIELDS = [
  "customer", "customerId", "item", "itemId", "quantity",
  "unitPrice", "totalAmount", "status", "notes",
];

export async function listSalesInvoices(actor, { status, buyerId, page, limit }) {
  const filter = {};
  if (actor.roleKey !== "super_admin") filter.warehouseId = actor.warehouseId;
  if (status && status !== "ALL") filter.status = status;
  if (buyerId) filter.customerId = buyerId;

  const { page: pageNum, limit: pageSize, skip } = parsePagination({ page, limit });
  const [list, total] = await Promise.all([
    SalesInvoice.find(filter)
      .populate("customerId", "name")
      .populate("itemId", "name itemCode")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize),
    SalesInvoice.countDocuments(filter),
  ]);
  return { list, meta: paginationMeta({ page: pageNum, limit: pageSize, total }) };
}

export async function getSalesInvoice(actor, id) {
  const inv = await SalesInvoice.findById(id)
    .populate("customerId", "name")
    .populate("itemId", "name itemCode unit")
    .populate("createdBy", "name");
  if (!inv) throw ApiError.notFound("Sales invoice not found");
  assertCanAccessWarehouse(actor, inv.warehouseId);
  return inv;
}

export async function createSalesInvoice(actor, payload) {
  assertCanAccessWarehouse(actor, payload.warehouseId);
  const y = new Date().getFullYear();
  const r = Math.floor(1000 + Math.random() * 9000);
  const invoiceNo = `INV-${y}-${r}`;
  const invoice = await SalesInvoice.create({ ...payload, invoiceNo, createdBy: actor.id });
  await recordAudit({ actorId: actor.id, action: "sales_invoice_created", entity: "SalesInvoice", entityId: invoice._id, metadata: { invoiceNo } });
  return getSalesInvoice(actor, invoice._id);
}

export async function updateSalesInvoiceStatus(actor, id, status) {
  const invoice = await SalesInvoice.findById(id);
  if (!invoice) throw ApiError.notFound("Sales invoice not found");
  assertCanAccessWarehouse(actor, invoice.warehouseId);
  const allowed = ["Pending", "Dispatched", "Delivered", "Cancelled"];
  if (!allowed.includes(status)) throw ApiError.badRequest("Invalid status");
  invoice.status = status;
  if (status === "Delivered") invoice.deliveredAt = new Date();
  await invoice.save();
  await recordAudit({ actorId: actor.id, action: "sales_invoice_status_updated", entity: "SalesInvoice", entityId: invoice._id, metadata: { invoiceNo: invoice.invoiceNo, newStatus: status } });
  return getSalesInvoice(actor, invoice._id);
}

export async function deleteSalesInvoice(actor, id) {
  const invoice = await SalesInvoice.findById(id);
  if (!invoice) throw ApiError.notFound("Sales invoice not found");
  assertCanAccessWarehouse(actor, invoice.warehouseId);
  if (invoice.status !== "Pending") throw ApiError.badRequest("Can only delete pending invoices");
  await invoice.deleteOne();
  await recordAudit({ actorId: actor.id, action: "sales_invoice_deleted", entity: "SalesInvoice", entityId: id, metadata: { invoiceNo: invoice.invoiceNo } });
  return { success: true };
}
