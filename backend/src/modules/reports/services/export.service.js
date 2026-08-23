import ExcelJS from "exceljs";
import { StockEntry } from "../../stock/models/StockEntry.js";
import { AttendanceRecord } from "../../attendance/models/AttendanceRecord.js";
import { Collection } from "../../inventory/models/Collection.js";
import { Dispatch } from "../../inventory/models/Dispatch.js";
import { Warehouse } from "../../warehouses/models/Warehouse.js";

const { getOwnWarehouseId } = await import("../../warehouses/services/warehouseScope.service.js");

async function resolveWarehouseId(actor, warehouseId) {
  if (actor.profile.role === "super_admin" && warehouseId) return warehouseId;
  const ownId = await getOwnWarehouseId(actor.profile);
  if (!ownId) throw new Error("No warehouse assigned.");
  return ownId;
}

function dateFilter(from, to) {
  const f = {};
  if (from) { f.$gte = new Date(from); f.$gte.setHours(0, 0, 0, 0); }
  if (to) { f.$lte = new Date(to); f.$lte.setHours(23, 59, 59, 999); }
  return f;
}

async function whNameMap(ids) {
  if (!ids.length) return new Map();
  const docs = await Warehouse.find({ _id: { $in: ids } }).select("name");
  return new Map(docs.map((w) => [w._id.toString(), w.name]));
}

// ─── Report Builders ───────────────────────────────────────────────────────

async function buildStockRows(warehouseId, from, to) {
  const match = { warehouse: warehouseId, status: "approved" };
  const df = dateFilter(from, to);
  if (df.$gte || df.$lte) match.createdAt = df;

  const results = await StockEntry.aggregate([
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
  ]);

  const map = await whNameMap(results.map((r) => r._id.warehouse).filter(Boolean));
  return results.map((r) => ({
    warehouse: map.get(r._id.warehouse.toString()) || "Unknown",
    commodity: r._id.commodity,
    entryType: r._id.entryType,
    totalKg: Math.round(r.totalKg),
    totalValue: Math.round(r.totalValue),
    slipCount: r.slipCount,
  }));
}

async function buildAttendanceRows(warehouseId, from, to) {
  const match = { warehouse: warehouseId };
  if (from || to) {
    const d = {};
    if (from) { const s = new Date(from); d.$gte = new Date(s.getFullYear(), s.getMonth(), s.getDate()); }
    if (to) { const e = new Date(to); d.$lte = new Date(e.getFullYear(), e.getMonth(), e.getDate()); }
    match.date = d;
  }

  const rows = await AttendanceRecord.aggregate([
    { $match: match },
    {
      $group: {
        _id: { employee: "$employee", status: "$status" },
        count: { $sum: 1 },
      },
    },
    {
      $lookup: { from: "employees", localField: "_id.employee", foreignField: "_id", as: "emp" },
    },
    { $unwind: "$emp" },
    {
      $project: {
        _id: 0,
        code: "$emp.employeeCode",
        name: "$emp.fullName",
        status: "$_id.status",
        count: 1,
      },
    },
    { $sort: { name: 1 } },
  ]);
  return rows;
}

async function buildMoistureRows(warehouseId, from, to) {
  const match = { warehouse: warehouseId };
  const df = dateFilter(from, to);
  if (df.$gte || df.$lte) match.createdAt = df;

  const results = await StockEntry.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          commodity: "$commodity",
        },
        moisture: { $avg: "$moisturePct" },
        allowed: { $avg: "$allowedMoisturePct" },
        deduction: { $avg: "$deductionPct" },
        slips: { $sum: 1 },
      },
    },
    { $sort: { "_id.date": 1, "_id.commodity": 1 } },
  ]);

  return results.map((r) => ({
    date: r._id.date,
    commodity: r._id.commodity,
    moisture: Math.round((r.moisture || 0) * 10) / 10,
    allowed: Math.round((r.allowed || 0) * 10) / 10,
    deduction: Math.round((r.deduction || 0) * 10) / 10,
    slips: r.slips,
  }));
}

async function buildFinancialRows(warehouseId, from, to) {
  const match = { warehouse: warehouseId };
  const df = dateFilter(from, to);
  if (df.$gte || df.$lte) match.createdAt = df;

  const [collections, dispatches] = await Promise.all([
    Collection.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          purchaseMt: { $sum: "$actualNetWeightMt" },
          purchaseValue: { $sum: "$totalAmountRs" },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Dispatch.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          salesMt: { $sum: "$dispatchedTonnageMt" },
          salesValue: { $sum: "$totalInvoiceAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const map = new Map();
  for (const c of collections) {
    map.set(c._id, { period: c._id, purchaseMt: Math.round(c.purchaseMt * 100) / 100, purchaseValue: Math.round(c.purchaseValue * 100) / 100, salesMt: 0, salesValue: 0 });
  }
  for (const d of dispatches) {
    if (map.has(d._id)) {
      const e = map.get(d._id);
      e.salesMt = Math.round(d.salesMt * 100) / 100;
      e.salesValue = Math.round(d.salesValue * 100) / 100;
    } else {
      map.set(d._id, { period: d._id, purchaseMt: 0, purchaseValue: 0, salesMt: Math.round(d.salesMt * 100) / 100, salesValue: Math.round(d.salesValue * 100) / 100 });
    }
  }

  return Array.from(map.values()).sort((a, b) => (a.period > b.period ? 1 : -1));
}

async function buildOutstandingRows(warehouseId) {
  const match = { warehouse: warehouseId };

  const [vendorAgg, buyerAgg] = await Promise.all([
    Collection.aggregate([
      { $match: { ...match, isRejected: { $ne: true } } },
      {
        $group: {
          _id: "$vendorId",
          vendorName: { $first: "$vendorName" },
          weight: { $sum: "$actualNetWeightMt" },
          amount: { $sum: "$totalAmountRs" },
          slips: { $sum: 1 },
        },
      },
      { $sort: { amount: -1 } },
    ]),
    Dispatch.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$buyerId",
          buyerName: { $first: "$buyerName" },
          mt: { $sum: "$dispatchedTonnageMt" },
          amount: { $sum: "$totalInvoiceAmount" },
          delivered: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
        },
      },
      { $sort: { amount: -1 } },
    ]),
  ]);

  return {
    vendors: vendorAgg.map((v) => ({ vendorId: v._id, vendorName: v.vendorName || "Unknown", weight: Math.round(v.weight * 100) / 100, amount: Math.round(v.amount * 100) / 100, slips: v.slips })),
    customers: buyerAgg.map((b) => ({ buyerId: b._id, buyerName: b.buyerName || "Unknown", mt: Math.round(b.mt * 100) / 100, amount: Math.round(b.amount * 100) / 100, delivered: b.delivered, pending: b.pending })),
  };
}

// ─── Main Export Entry Point ──────────────────────────────────────────────

export async function generateExcel(reportType, actor, warehouseId, from, to) {
  const whId = await resolveWarehouseId(actor, warehouseId);
  const wb = new ExcelJS.Workbook();
  wb.creator = "AGRO ERP";

  let rows;
  if (reportType === "stock-valuation") {
    const ws = wb.addWorksheet("Stock Valuation");
    ws.columns = [
      { header: "Warehouse", key: "warehouse", width: 22 },
      { header: "Commodity", key: "commodity", width: 18 },
      { header: "Type", key: "entryType", width: 12 },
      { header: "Net Weight (kg)", key: "totalKg", width: 16 },
      { header: "Value (INR)", key: "totalValue", width: 16 },
      { header: "Slips", key: "slipCount", width: 10 },
    ];
    rows = await buildStockRows(whId, from, to);
    ws.addRows(rows);
    styleHeader(ws, "FF10B981");
  } else if (reportType === "attendance-summary") {
    const ws = wb.addWorksheet("Attendance Summary");
    ws.columns = [
      { header: "Emp Code", key: "code", width: 12 },
      { header: "Employee Name", key: "name", width: 24 },
      { header: "Status", key: "status", width: 12 },
    ];
    rows = await buildAttendanceRows(whId, from, to);
    ws.addRows(rows);
    styleHeader(ws, "FF3B82F6");
  } else if (reportType === "moisture-trend") {
    const ws = wb.addWorksheet("Moisture Trend");
    ws.columns = [
      { header: "Date", key: "date", width: 14 },
      { header: "Commodity", key: "commodity", width: 18 },
      { header: "Moisture %", key: "moisture", width: 14 },
      { header: "Allowed %", key: "allowed", width: 14 },
      { header: "Deduction %", key: "deduction", width: 14 },
      { header: "Slips", key: "slips", width: 10 },
    ];
    rows = await buildMoistureRows(whId, from, to);
    ws.addRows(rows);
    styleHeader(ws, "FFEF4444");
  } else if (reportType === "purchase-vs-sales") {
    const ws = wb.addWorksheet("Purchase vs Sales");
    ws.columns = [
      { header: "Period", key: "period", width: 14 },
      { header: "Purchase (MT)", key: "purchaseMt", width: 16 },
      { header: "Purchase Value", key: "purchaseValue", width: 18 },
      { header: "Sales (MT)", key: "salesMt", width: 14 },
      { header: "Sales Value", key: "salesValue", width: 18 },
    ];
    rows = await buildFinancialRows(whId, from, to);
    ws.addRows(rows);
    styleHeader(ws, "FF10B981");
  } else if (reportType === "outstanding") {
    const ws1 = wb.addWorksheet("Vendors");
    ws1.columns = [
      { header: "Vendor ID", key: "vendorId", width: 14 },
      { header: "Name", key: "vendorName", width: 24 },
      { header: "Weight (MT)", key: "weight", width: 14 },
      { header: "Amount (INR)", key: "amount", width: 16 },
      { header: "Slips", key: "slips", width: 10 },
    ];
    styleHeader(ws1, "FF8B5CF6");

    const ws2 = wb.addWorksheet("Buyers");
    ws2.columns = [
      { header: "Buyer ID", key: "buyerId", width: 14 },
      { header: "Name", key: "buyerName", width: 24 },
      { header: "Dispatched (MT)", key: "mt", width: 16 },
      { header: "Value (INR)", key: "amount", width: 16 },
      { header: "Delivered", key: "delivered", width: 12 },
      { header: "Pending", key: "pending", width: 12 },
    ];
    styleHeader(ws2, "FFF59E0B");

    const outstanding = await buildOutstandingRows(whId);
    ws1.addRows(outstanding.vendors);
    ws2.addRows(outstanding.customers);
  } else {
    throw new Error(`Unsupported report type: ${reportType}`);
  }

  return wb.xlsx.writeBuffer();
}


function styleHeader(ws, color) {
  const headerRow = ws.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: color } };
}
