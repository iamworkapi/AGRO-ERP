import mongoose from "mongoose";
import { StockEntry } from "../../stock/models/StockEntry.js";
import { StockMovement } from "../../stock/models/StockMovement.js";
import { AttendanceRecord } from "../../attendance/models/AttendanceRecord.js";
import { Collection } from "../../inventory/models/Collection.js";
import { Dispatch } from "../../inventory/models/Dispatch.js";
import { Warehouse } from "../../warehouses/models/Warehouse.js";
import { Employee } from "../../employees/models/Employee.js";
import { Item } from "../../inventory/models/Item.js";
import { ApiError } from "../../common/utils/ApiError.js";
import { ROLES } from "../../common/constants/roles.js";
import { assertCanAccessWarehouse, getOwnWarehouseId } from "../../warehouses/services/warehouseScope.service.js";
import { parsePagination, paginationMeta } from "../../common/utils/pagination.js";
import { recordAudit } from "../../audit/services/audit.service.js";

// Resolve warehouse scope — super_admin with no warehouseId sees org-wide,
// everyone else is scoped to their own warehouse.
function resolveWarehouseScope(actor, warehouseId) {
  if (actor.profile.role === ROLES.SUPER_ADMIN && !warehouseId) {
    return { filter: {}, canAccess: () => {} };
  }
  const effectiveId = actor.profile.role === ROLES.SUPER_ADMIN
    ? warehouseId
    : getOwnWarehouseId(actor.profile);

  if (!effectiveId) {
    throw ApiError.forbidden("You are not currently assigned to a warehouse.");
  }
  return { filter: { warehouse: effectiveId }, effectiveId };
}

// Build a $match stage for date-range filtering on createdAt.
function dateMatch(from, to) {
  const match = {};
  if (from) {
    const start = new Date(from);
    start.setHours(0, 0, 0, 0);
    match.$gte = start;
  }
  if (to) {
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);
    match.$lte = end;
  }
  return match;
}

// ─── Dashboard KPIs ───────────────────────────────────────────────────────

export async function getDashboardStats(actor, warehouseId) {
  const { filter, effectiveId } = resolveWarehouseScope(actor, warehouseId);

  if (Object.keys(filter).length === 0 && actor.profile.role === ROLES.SUPER_ADMIN && !warehouseId) {
    // Org-wide: get all warehouse IDs
    const warehouses = await Warehouse.find({}).select("_id");
    const warehouseIds = warehouses.map((w) => w._id);

    const [
      stockAgg,
      weighmentAgg,
      attendanceAgg,
      collectionAgg,
      dispatchAgg,
      employeeCount,
      warehouseCount,
    ] = await Promise.all([
      StockEntry.aggregate([
        { $match: { warehouse: { $in: warehouseIds }, status: "approved" } },
        { $group: { _id: null, totalKg: { $sum: "$netWeightKg" }, totalValue: { $sum: "$totalAmountRs" } } },
      ]),
      StockEntry.aggregate([
        { $match: { warehouse: { $in: warehouseIds } } },
        { $group: { _id: null, count: { $sum: 1 }, approved: { $sum: { $cond: ["$approved", 1, 0] } } } },
      ]),
      AttendanceRecord.aggregate([
        { $match: { warehouse: { $in: warehouseIds } } },
        { $group: { _id: null, total: { $sum: 1 }, present: { $sum: { $cond: [{ $in: ["$status", ["present", "late"]] }, 1, 0] } } } },
      ]),
      Collection.aggregate([
        { $match: { warehouse: { $in: warehouseIds } } },
        { $group: { _id: null, totalMt: { $sum: "$actualNetWeightMt" }, count: { $sum: 1 } } },
      ]),
      Dispatch.aggregate([
        { $match: { warehouse: { $in: warehouseIds } } },
        { $group: { _id: null, totalMt: { $sum: "$dispatchedTonnageMt" }, totalValue: { $sum: "$totalInvoiceAmount" }, count: { $sum: 1 } } },
      ]),
      Employee.countDocuments({ employmentStatus: "active" }),
      Warehouse.countDocuments({ status: "active" }),
    ]);

    return {
      totalStockKg: stockAgg[0]?.totalKg || 0,
      totalStockValue: stockAgg[0]?.totalValue || 0,
      totalWeighments: weighmentAgg[0]?.count || 0,
      pendingWeighments: (weighmentAgg[0]?.count || 0) - (weighmentAgg[0]?.approved || 0),
      attendanceRate: attendanceAgg[0]?.total
        ? Math.round((attendanceAgg[0].present / attendanceAgg[0].total) * 1000) / 10
        : 0,
      totalCollectionsMt: collectionAgg[0]?.totalMt || 0,
      totalCollections: collectionAgg[0]?.count || 0,
      totalDispatchesMt: dispatchAgg[0]?.totalMt || 0,
      totalDispatchesValue: dispatchAgg[0]?.totalValue || 0,
      totalDispatches: dispatchAgg[0]?.count || 0,
      totalEmployees: employeeCount,
      activeWarehouses: warehouseCount,
    };
  }

  // Scoped to single warehouse
  await assertCanAccessWarehouse(actor, effectiveId);

  const [
    stockAgg,
    weighmentAgg,
    attendanceAgg,
    collectionAgg,
    dispatchAgg,
    employeeCount,
  ] = await Promise.all([
    StockEntry.aggregate([
      { $match: { ...filter, status: "approved" } },
      { $group: { _id: null, totalKg: { $sum: "$netWeightKg" }, totalValue: { $sum: "$totalAmountRs" } } },
    ]),
    StockEntry.aggregate([
      { $match: filter },
      { $group: { _id: null, count: { $sum: 1 }, approved: { $sum: { $cond: ["$status", 1, 0] } } } },
    ]),
    AttendanceRecord.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: 1 }, present: { $sum: { $cond: [{ $in: ["$status", ["present", "late"]] }, 1, 0] } } } },
    ]),
    Collection.aggregate([
      { $match: filter },
      { $group: { _id: null, totalMt: { $sum: "$actualNetWeightMt" }, count: { $sum: 1 } } },
    ]),
    Dispatch.aggregate([
      { $match: filter },
      { $group: { _id: null, totalMt: { $sum: "$dispatchedTonnageMt" }, totalValue: { $sum: "$totalInvoiceAmount" }, count: { $sum: 1 } } },
    ]),
    Employee.countDocuments({ warehouse: effectiveId, employmentStatus: "active" }),
  ]);

  return {
    totalStockKg: stockAgg[0]?.totalKg || 0,
    totalStockValue: stockAgg[0]?.totalValue || 0,
    totalWeighments: weighmentAgg[0]?.count || 0,
    pendingWeighments: (weighmentAgg[0]?.count || 0) - (weighmentAgg[0]?.approved || 0),
    attendanceRate: attendanceAgg[0]?.total
      ? Math.round((attendanceAgg[0].present / attendanceAgg[0].total) * 1000) / 10
      : 0,
    totalCollectionsMt: collectionAgg[0]?.totalMt || 0,
    totalCollections: collectionAgg[0]?.count || 0,
    totalDispatchesMt: dispatchAgg[0]?.totalMt || 0,
    totalDispatchesValue: dispatchAgg[0]?.totalValue || 0,
    totalDispatches: dispatchAgg[0]?.count || 0,
    totalEmployees: employeeCount,
    activeWarehouses: 1,
  };
}

// ─── Stock Valuation ──────────────────────────────────────────────────────

export async function getStockValuation(actor, warehouseId, { from, to, page, limit }) {
  const { filter, effectiveId } = resolveWarehouseScope(actor, warehouseId);
  if (effectiveId) await assertCanAccessWarehouse(actor, effectiveId);

  const match = { ...filter, status: "approved" };
  const dateFilter = dateMatch(from, to);
  if (Object.keys(dateFilter).length > 0) match.createdAt = dateFilter;

  const { page: pageNum, limit: pageSize, skip } = parsePagination({ page, limit });

  const [entries, total] = await Promise.all([
    StockEntry.aggregate([
      { $match: match },
      {
        $group: {
          _id: { warehouse: "$warehouse", commodity: "$commodity", entryType: "$entryType" },
          totalKg: { $sum: "$netWeightKg" },
          totalValue: { $sum: "$totalAmountRs" },
          slipCount: { $sum: 1 },
        },
      },
      { $sort: { totalValue: -1 } },
      { $skip: skip },
      { $limit: pageSize },
    ]),
    StockEntry.aggregate([
      { $match: match },
      {
        $group: {
          _id: { warehouse: "$warehouse", commodity: "$commodity", entryType: "$entryType" },
        },
      },
      { $count: "total" },
    ]),
  ]);

  // Resolve warehouse names
  const warehouseIds = [...new Set(entries.map((e) => e._id.warehouse).filter(Boolean))];
  const warehouses = await Warehouse.find({ _id: { $in: warehouseIds } }).select("name");
  const warehouseNameMap = new Map(warehouses.map((w) => [w._id.toString(), w.name]));

  const list = entries.map((e) => ({
    warehouseId: e._id.warehouse,
    warehouseName: warehouseNameMap.get(e._id.warehouse) || "Unknown",
    commodity: e._id.commodity,
    entryType: e._id.entryType,
    totalKg: e.totalKg,
    totalValue: e.totalValue,
    slipCount: e.slipCount,
  }));

  return { list, meta: paginationMeta({ page: pageNum, limit: pageSize, total: total[0]?.total || 0 }) };
}

// ─── Attendance Summary ───────────────────────────────────────────────────

export async function getAttendanceSummaryReport(actor, warehouseId, month) {
  const { filter, effectiveId } = resolveWarehouseScope(actor, warehouseId);
  if (effectiveId) await assertCanAccessWarehouse(actor, effectiveId);

  const match = { ...filter };
  if (month) {
    const [year, m] = month.split("-").map(Number);
    const start = new Date(year, m - 1, 1);
    const end = new Date(year, m, 0, 23, 59, 59);
    match.date = { $gte: start, $lte: end };
  }

  const [
    records,
    employeeList,
    totalEmployees,
  ] = await Promise.all([
    AttendanceRecord.aggregate([
      { $match: match },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Employee.find({ warehouse: effectiveId || warehouseId, employmentStatus: "active" }).select("fullName employeeCode"),
    Employee.countDocuments({ warehouse: effectiveId || warehouseId, employmentStatus: "active" }),
  ]);

  const summary = { totalEmployees, present: 0, absent: 0, late: 0, pending: 0, attendanceRate: 0 };
  for (const r of records) {
    summary[r._id] = r.count;
  }
  const finalized = summary.present + summary.late + summary.absent;
  summary.attendanceRate = finalized > 0 ? Math.round((summary.present / finalized) * 1000) / 10 : 0;
  summary.employees = employeeList.map((e) => ({ id: e._id, name: e.fullName, code: e.employeeCode }));

  return summary;
}

// ─── Moisture Trend ───────────────────────────────────────────────────────

export async function getMoistureTrend(actor, warehouseId, { from, to, groupBy = "day" }) {
  const { filter, effectiveId } = resolveWarehouseScope(actor, warehouseId);
  if (effectiveId) await assertCanAccessWarehouse(actor, effectiveId);

  const match = { ...filter };
  const dateFilter = dateMatch(from, to);
  if (Object.keys(dateFilter).length > 0) match.createdAt = dateFilter;

  // Format date based on groupBy
  let dateFormat;
  if (groupBy === "month") {
    dateFormat = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
  } else {
    dateFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
  }

  const results = await StockEntry.aggregate([
    { $match: match },
    {
      $group: {
        _id: { ...dateFormat, warehouse: "$warehouse" },
        avgMoisture: { $avg: "$moisturePct" },
        avgAllowed: { $avg: "$allowedMoisturePct" },
        avgDeduction: { $avg: "$deductionPct" },
        totalSlips: { $sum: 1 },
        totalNetKg: { $sum: "$netWeightKg" },
      },
    },
    { $sort: { "_id.warehouse": 1, "_id": 1 } },
  ]);

  // Resolve warehouse names
  const warehouseIds = [...new Set(results.map((r) => r._id.warehouse).filter(Boolean))];
  const warehouses = await Warehouse.find({ _id: { $in: warehouseIds } }).select("name");
  const whNameMap = new Map(warehouses.map((w) => [w._id.toString(), w.name]));

  return results.map((r) => ({
    period: r._id[groupBy === "month" ? "$dateToString" : "$dateToString"] || r._id,
    warehouseId: r._id.warehouse,
    warehouseName: whNameMap.get(r._id.warehouse) || "Unknown",
    avgMoisture: Math.round((r.avgMoisture || 0) * 10) / 10,
    avgAllowedMoisture: Math.round((r.avgAllowed || 0) * 10) / 10,
    avgDeduction: Math.round((r.avgDeduction || 0) * 10) / 10,
    totalSlips: r.totalSlips,
    totalNetKg: r.totalNetKg,
  }));
}

// ─── Purchase vs Sales Trend ──────────────────────────────────────────────

export async function getPurchaseVsSales(actor, warehouseId, { from, to, groupBy = "month" }) {
  const { filter, effectiveId } = resolveWarehouseScope(actor, warehouseId);
  if (effectiveId) await assertCanAccessWarehouse(actor, effectiveId);

  const dateFilter = dateMatch(from, to);

  // Collections = "purchase" (inbound biomass)
  const collectionsMatch = { ...filter };
  if (Object.keys(dateFilter).length > 0) collectionsMatch.createdAt = dateFilter;

  // Dispatches = "sales" (outbound to buyers)
  const dispatchesMatch = { ...filter };
  if (Object.keys(dateFilter).length > 0) dispatchesMatch.createdAt = dateFilter;

  let collectionFormat, dispatchFormat;
  if (groupBy === "month") {
    collectionFormat = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
    dispatchFormat = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
  } else {
    collectionFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
    dispatchFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
  }

  const [collectionResults, dispatchResults] = await Promise.all([
    Collection.aggregate([
      { $match: collectionsMatch },
      {
        $group: {
          _id: collectionFormat,
          purchaseMt: { $sum: "$actualNetWeightMt" },
          purchaseValue: { $sum: "$totalAmountRs" },
          purchaseCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Dispatch.aggregate([
      { $match: dispatchesMatch },
      {
        $group: {
          _id: dispatchFormat,
          salesMt: { $sum: "$dispatchedTonnageMt" },
          salesValue: { $sum: "$totalInvoiceAmount" },
          salesCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  // Merge by period
  const map = new Map();
  for (const r of collectionResults) {
    map.set(r._id, { period: r._id, purchaseMt: r.purchaseMt, purchaseValue: r.purchaseValue, purchaseCount: r.purchaseCount, salesMt: 0, salesValue: 0, salesCount: 0 });
  }
  for (const r of dispatchResults) {
    if (map.has(r._id)) {
      const existing = map.get(r._id);
      existing.salesMt = r.salesMt;
      existing.salesValue = r.salesValue;
      existing.salesCount = r.salesCount;
    } else {
      map.set(r._id, { period: r._id, purchaseMt: 0, purchaseValue: 0, purchaseCount: 0, salesMt: r.salesMt, salesValue: r.salesValue, salesCount: r.salesCount });
    }
  }

  return Array.from(map.values()).sort((a, b) => (a.period > b.period ? 1 : -1));
}

// ─── Vendor/Customer Outstanding ──────────────────────────────────────────

export async function getOutstandingReport(actor, warehouseId) {
  const { filter, effectiveId } = resolveWarehouseScope(actor, warehouseId);
  if (effectiveId) await assertCanAccessWarehouse(actor, effectiveId);

  const [vendorOutstanding, customerOutstanding] = await Promise.all([
    // Vendors with total collection value and payment status (totalAmountRs represents what's owed)
    Collection.aggregate([
      { $match: { ...filter, isRejected: { $ne: true } } },
      {
        $group: {
          _id: "$vendorId",
          vendorName: { $first: "$vendorName" },
          totalWeightMt: { $sum: "$actualNetWeightMt" },
          totalAmount: { $sum: "$totalAmountRs" },
          slipCount: { $sum: 1 },
          lastSlip: { $max: "$createdAt" },
        },
      },
      { $sort: { totalAmount: -1 } },
      { $limit: 50 },
    ]),
    // Buyers with total dispatch value
    Dispatch.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$buyerId",
          buyerName: { $first: "$buyerName" },
          totalMt: { $sum: "$dispatchedTonnageMt" },
          totalAmount: { $sum: "$totalInvoiceAmount" },
          dispatchCount: { $sum: 1 },
          lastDispatch: { $max: "$createdAt" },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          delivered: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] } },
        },
      },
      { $sort: { totalAmount: -1 } },
      { $limit: 50 },
    ]),
  ]);

  return {
    vendors: vendorOutstanding.map((v) => ({
      id: v._id,
      name: v.vendorName || "Unknown Vendor",
      totalWeightMt: Math.round(v.totalWeightMt * 100) / 100,
      totalAmount: Math.round(v.totalAmount * 100) / 100,
      slipCount: v.slipCount,
      lastTransaction: v.lastSlip,
    })),
    customers: customerOutstanding.map((c) => ({
      id: c._id,
      name: c.buyerName || "Unknown Buyer",
      totalMt: Math.round(c.totalMt * 100) / 100,
      totalAmount: Math.round(c.totalAmount * 100) / 100,
      dispatchCount: c.dispatchCount,
      pending: c.pending,
      delivered: c.delivered,
      lastTransaction: c.lastDispatch,
    })),
  };
}
