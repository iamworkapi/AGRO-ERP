import { Dispatch } from "../models/Dispatch.js";
import { ApiError } from "../../common/utils/ApiError.js";
import { ROLES } from "../../common/constants/roles.js";
import { recordAudit } from "../../audit/services/audit.service.js";
import { assertCanAccessWarehouse, getOwnWarehouseId } from "../../warehouses/services/warehouseScope.service.js";
import { parsePagination, paginationMeta } from "../../common/utils/pagination.js";

export async function listDispatches(actor, { warehouseId, buyerId, status, page, limit }) {
  let effectiveWarehouseId = warehouseId;
  if (actor.profile.role !== ROLES.SUPER_ADMIN) {
    effectiveWarehouseId = await getOwnWarehouseId(actor.profile);
  }
  if (!effectiveWarehouseId) {
    return { list: [], meta: paginationMeta({ page: 1, limit: 1, total: 0 }) };
  }
  if (warehouseId && warehouseId !== effectiveWarehouseId) {
    await assertCanAccessWarehouse(actor, effectiveWarehouseId);
  }
  await assertCanAccessWarehouse(actor, effectiveWarehouseId);

  const filter = { warehouse: effectiveWarehouseId };
  if (buyerId) filter.buyerId = buyerId;
  if (status) filter.status = status;

  const { page: pageNum, limit: pageSize, skip } = parsePagination({ page, limit });
  const [list, total] = await Promise.all([
    Dispatch.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize).populate("warehouse", "name code").populate("dispatchedBy", "name email"),
    Dispatch.countDocuments(filter),
  ]);

  return { list, meta: paginationMeta({ page: pageNum, limit: pageSize, total }) };
}

export async function createDispatch(actor, payload) {
  await assertCanAccessWarehouse(actor, payload.warehouseId);

  const tonnage = payload.dispatchedTonnageMt || 0;
  const rate = payload.ratePerMt || 0;
  const totalAmount = Math.round(tonnage * rate * 100) / 100;

  const dispatch = await Dispatch.create({
    warehouse: payload.warehouseId,
    buyerId: payload.buyerId || "",
    buyerName: payload.buyerName,
    vehicleNo: payload.vehicleNo.toUpperCase(),
    driverName: payload.driverName || "",
    driverMobile: payload.driverMobile || "",
    dispatchedTonnageMt: tonnage,
    baleCount: payload.baleCount || 0,
    ratePerMt: rate,
    totalInvoiceAmount: totalAmount,
    poNo: payload.poNo || "",
    poDate: payload.poDate || "",
    ewayBillNo: payload.ewayBillNo || "",
    lrNo: payload.lrNo || "",
    remarks: payload.remarks || "",
    dispatchedBy: actor.profile._id,
  });

  await dispatch.populate("warehouse", "name code");
  await recordAudit({ actor, action: "dispatch.create", entityType: "dispatch", entityId: dispatch._id, warehouseId: payload.warehouseId, metadata: { gatePassNo: dispatch.gatePassNo, tonnage, totalAmount } });
  return dispatch;
}

export async function getDispatchSummary(actor, warehouseId) {
  let effectiveWarehouseId = warehouseId;
  if (actor.profile.role !== ROLES.SUPER_ADMIN) {
    effectiveWarehouseId = await getOwnWarehouseId(actor.profile);
  }
  if (!effectiveWarehouseId) {
    return { totalDispatches: 0, totalTonnageMt: 0, totalRevenue: 0, totalBales: 0 };
  }
  await assertCanAccessWarehouse(actor, effectiveWarehouseId);

  const docs = await Dispatch.find({ warehouse: effectiveWarehouseId });
  const totalTonnageMt = docs.reduce((s, d) => s + d.dispatchedTonnageMt, 0);
  const totalRevenue = docs.reduce((s, d) => s + d.totalInvoiceAmount, 0);
  const totalBales = docs.reduce((s, d) => s + (d.baleCount || 0), 0);

  return { totalDispatches: docs.length, totalTonnageMt, totalRevenue, totalBales };
}

export async function updateDispatchStatus(actor, id, status) {
  const dispatch = await Dispatch.findById(id);
  if (!dispatch) throw ApiError.notFound("Dispatch not found.");
  await assertCanAccessWarehouse(actor, dispatch.warehouse.toString());

  dispatch.status = status;
  await dispatch.save();

  await recordAudit({ actor, action: `dispatch.${status}`, entityType: "dispatch", entityId: id, warehouseId: dispatch.warehouse });
  return dispatch;
}
