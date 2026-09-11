import Goods from "../models/Goods.js";
import { Warehouse } from "../../warehouses/models/Warehouse.js";
import { ApiError } from "../../common/utils/ApiError.js";
import { recordAudit } from "../../audit/services/audit.service.js";
import { assertCanAccessWarehouse, getOwnWarehouseId } from "../../warehouses/services/warehouseScope.service.js";
import { parsePagination, paginationMeta } from "../../common/utils/pagination.js";

export async function getNextSupplierInvoiceNo(warehouseId) {
  let whPrefix = "WH";
  if (warehouseId) {
    try {
      const wh = await Warehouse.findOne({
        $or: [{ _id: warehouseId }, { code: warehouseId }],
      }).select("code name");
      if (wh?.code) {
        whPrefix = wh.code;
      } else if (wh?.name) {
        whPrefix = wh.name.replace(/[^A-Za-z0-9]/g, "").slice(0, 5).toUpperCase();
      }
    } catch {}
  }
  const y = new Date().getFullYear();
  const last = await Goods.findOne({
    $or: [
      { supplierInvoiceNo: new RegExp(`GINV-${y}-`) },
      { invoiceNo: new RegExp(`GINV-${y}-`) },
    ],
  })
    .sort({ createdAt: -1 })
    .select("supplierInvoiceNo invoiceNo");

  let nextSeq = 1;
  const targetNo = last?.supplierInvoiceNo || last?.invoiceNo;
  if (targetNo) {
    const match = targetNo.match(/GINV-\d{4}-(\d+)/);
    if (match) {
      nextSeq = parseInt(match[1], 10) + 1;
    }
  } else {
    const count = await Goods.countDocuments();
    nextSeq = count + 1;
  }
  return `${whPrefix}-GINV-${y}-${String(nextSeq).padStart(4, "0")}`;
}

export async function listGoods(actor, { status, supplierInvoiceNo, page, limit }) {
  const filter = {};
  const role = actor?.profile?.role || actor?.role;
  if (role !== "SUPER_ADMIN" && role !== "super_admin") {
    const ownWarehouse = await getOwnWarehouseId(actor.profile);
    if (ownWarehouse) filter.warehouseId = ownWarehouse;
  }
  if (status && status !== "ALL") filter.status = status;
  if (supplierInvoiceNo) filter.supplierInvoiceNo = new RegExp(supplierInvoiceNo, "i");

  const { page: pageNum, limit: pageSize, skip } = parsePagination({ page, limit });
  const [list, total] = await Promise.all([
    Goods.find(filter)
      .populate("createdBy", "fullName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize),
    Goods.countDocuments(filter),
  ]);
  return { list, meta: paginationMeta({ page: pageNum, limit: pageSize, total }) };
}

export async function getGoods(actor, id) {
  const g = await Goods.findById(id).populate("createdBy", "fullName");
  if (!g) throw ApiError.notFound("Goods record not found");
  await assertCanAccessWarehouse(actor, g.warehouseId);
  return g;
}

export async function createGoods(actor, payload) {
  await assertCanAccessWarehouse(actor, payload.warehouseId);
  const userId = actor?.profile?._id || actor?.id || actor?._id;
  const nextSeq = await getNextSupplierInvoiceNo(payload.warehouseId);
  const supplierInvoiceNo = payload.supplierInvoiceNo || nextSeq;
  const invoiceNo = payload.invoiceNo || supplierInvoiceNo;
  const goods = await Goods.create({ ...payload, supplierInvoiceNo, invoiceNo, createdBy: userId });
  await recordAudit({
    actor,
    action: "goods_created",
    entityType: "Goods",
    entityId: goods._id,
    metadata: { invoiceNo: supplierInvoiceNo, supplier: goods.supplier },
  });
  return getGoods(actor, goods._id);
}

export async function updateGoodsStatus(actor, id, status) {
  const goods = await Goods.findById(id);
  if (!goods) throw ApiError.notFound("Goods record not found");
  await assertCanAccessWarehouse(actor, goods.warehouseId);
  const allowed = ["Purchased", "In Stock", "Dispatched", "Sold", "Cancelled"];
  if (!allowed.includes(status)) throw ApiError.badRequest("Invalid status");
  goods.status = status;
  await goods.save();
  await recordAudit({
    actorId: actor?.profile?._id || actor?.id,
    action: "goods_status_updated",
    entity: "Goods",
    entityId: goods._id,
    metadata: { invoiceNo: goods.invoiceNo, newStatus: status },
  });
  return getGoods(actor, goods._id);
}

export async function deleteGoods(actor, id) {
  const goods = await Goods.findById(id);
  if (!goods) throw ApiError.notFound("Goods record not found");
  await assertCanAccessWarehouse(actor, goods.warehouseId);
  if (!["Purchased", "In Stock"].includes(goods.status)) {
    throw ApiError.badRequest("Can only delete goods in Purchased or In Stock status");
  }
  await goods.deleteOne();
  await recordAudit({
    actorId: actor?.profile?._id || actor?.id,
    action: "goods_deleted",
    entity: "Goods",
    entityId: id,
    metadata: { invoiceNo: goods.invoiceNo },
  });
  return { success: true };
}
