import { ApiError } from "../../common/utils/ApiError.js";
import SalesInvoice from "../models/SalesInvoice.js";
import { Warehouse } from "../../warehouses/models/Warehouse.js";
import { recordAudit } from "../../audit/services/audit.service.js";
import { parsePagination, paginationMeta } from "../../common/utils/pagination.js";
import { ROLES } from "../../common/constants/roles.js";
import { getOwnWarehouseId } from "../../warehouses/services/warehouseScope.service.js";

async function getScopedWarehouseId(actor) {
  if (actor.profile?.role === ROLES.SUPER_ADMIN) return null;
  return await getOwnWarehouseId(actor.profile);
}

export async function listSalesInvoices(actor, { status, buyerId, page, limit }) {
  const myWhId = await getScopedWarehouseId(actor);
  const filter = {};
  if (myWhId) filter.warehouseId = myWhId;
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
  const myWhId = await getScopedWarehouseId(actor);
  const inv = await SalesInvoice.findById(id)
    .populate("customerId", "name")
    .populate("itemId", "name itemCode unit")
    .populate("createdBy", "name");
  if (!inv) throw ApiError.notFound("Sales invoice not found");
  if (myWhId && String(inv.warehouseId) !== String(myWhId)) {
    throw ApiError.forbidden("You can only view invoices within your own warehouse.");
  }
  return inv;
}

export async function createSalesInvoice(actor, payload) {
  const myWhId = await getScopedWarehouseId(actor);
  if (myWhId && String(payload.warehouseId) !== String(myWhId)) {
    throw ApiError.forbidden("You can only create invoices for your own warehouse.");
  }
  let whPrefix = "WH";
  try {
    const wh = await Warehouse.findById(payload.warehouseId).select("code name");
    if (wh?.code) {
      whPrefix = wh.code;
    } else if (wh?.name) {
      whPrefix = wh.name.replace(/[^A-Za-z0-9]/g, "").slice(0, 5).toUpperCase();
    }
  } catch {}
  const y = new Date().getFullYear();
  const r = Math.floor(1000 + Math.random() * 9000);
  const invoiceNo = `${whPrefix}-INV-${y}-${r}`;
  const invoice = await SalesInvoice.create({ ...payload, invoiceNo, createdBy: actor.profile._id });
  await recordAudit({ actorId: actor.profile._id, action: "sales_invoice_created", entity: "SalesInvoice", entityId: invoice._id, metadata: { invoiceNo } });
  return getSalesInvoice(actor, invoice._id);
}

export async function directSaleToVendor(actor, payload) {
  const { vendorId, warehouseId, customer, lineItems, notes } = payload;
  await getScopedWarehouseId(actor); // just validates access

  const lineItemsWithSubtotal = lineItems.map((li) => ({
    productId: String(li.productId || ""),
    productName: String(li.productName || ""),
    quantity: parseFloat(li.quantity) || 0,
    unitPrice: parseFloat(li.unitPrice) || 0,
    subtotal: (parseFloat(li.quantity) || 0) * (parseFloat(li.unitPrice) || 0),
  }));

  const totalQty = lineItemsWithSubtotal.reduce((s, li) => s + li.quantity, 0);
  const totalAmount = lineItemsWithSubtotal.reduce((s, li) => s + li.subtotal, 0);
  const y = new Date().getFullYear();
  const r = Math.floor(1000 + Math.random() * 9000);

  // Look up warehouse name and unique code
  const whDoc = await Warehouse.findById(warehouseId).select("name code");
  const warehouseName = whDoc?.name || customer;
  const whPrefix = whDoc?.code || (whDoc?.name ? whDoc.name.replace(/[^A-Za-z0-9]/g, "").slice(0, 5).toUpperCase() : "WH");
  const invoiceNo = `${whPrefix}-DIR-${y}-${r}`;

  const invoice = await SalesInvoice.create({
    invoiceNo,
    customer,
    customerId: vendorId,
    vendorId,
    warehouse: warehouseName,
    warehouseId,
    lineItems: lineItemsWithSubtotal,
    quantity: totalQty,
    unitPrice: totalQty > 0 ? totalAmount / totalQty : 0,
    totalAmount,
    status: "Pending",
    notes: notes || "",
    createdBy: actor.profile._id,
  });

  await recordAudit({
    actorId: actor.profile._id,
    action: "direct_sale_to_vendor_created",
    entity: "SalesInvoice",
    entityId: invoice._id,
    metadata: { invoiceNo, vendorId, totalAmount, lineItemsCount: lineItems.length },
  });

  return getSalesInvoice(actor, invoice._id);
}

export async function updateSalesInvoiceStatus(actor, id, status) {
  const myWhId = await getScopedWarehouseId(actor);
  const invoice = await SalesInvoice.findById(id);
  if (!invoice) throw ApiError.notFound("Sales invoice not found");
  if (myWhId && String(invoice.warehouseId) !== String(myWhId)) {
    throw ApiError.forbidden("You can only update invoices within your own warehouse.");
  }
  const allowed = ["Pending", "Dispatched", "Delivered", "Cancelled"];
  if (!allowed.includes(status)) throw ApiError.badRequest("Invalid status");
  invoice.status = status;
  if (status === "Delivered") invoice.deliveredAt = new Date();
  await invoice.save();
  await recordAudit({ actorId: actor.profile._id, action: "sales_invoice_status_updated", entity: "SalesInvoice", entityId: invoice._id, metadata: { invoiceNo: invoice.invoiceNo, newStatus: status } });
  return getSalesInvoice(actor, invoice._id);
}

export async function deleteSalesInvoice(actor, id) {
  const myWhId = await getScopedWarehouseId(actor);
  const invoice = await SalesInvoice.findById(id);
  if (!invoice) throw ApiError.notFound("Sales invoice not found");
  if (myWhId && String(invoice.warehouseId) !== String(myWhId)) {
    throw ApiError.forbidden("You can only delete invoices within your own warehouse.");
  }
  if (invoice.status !== "Pending") throw ApiError.badRequest("Can only delete pending invoices");
  await invoice.deleteOne();
  await recordAudit({ actorId: actor.profile._id, action: "sales_invoice_deleted", entity: "SalesInvoice", entityId: id, metadata: { invoiceNo: invoice.invoiceNo } });
  return { success: true };
}
