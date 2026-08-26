import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { sendSuccess } from "../../common/utils/ApiResponse.js";
import { Warehouse } from "../../warehouses/models/Warehouse.js";
import { Godown } from "../../warehouses/models/Godown.js";
import { Collection } from "../../inventory/models/Collection.js";
import { Dispatch } from "../../inventory/models/Dispatch.js";
import { StockEntry } from "../../stock/models/StockEntry.js";
import { BiomassVendor } from "../../biomass-vendors/models/BiomassVendor.js";
import { BiomassBuyer } from "../../biomass-buyers/models/BiomassBuyer.js";
import PurchaseOrder from "../../purchase/models/PurchaseOrder.js";
import SalesInvoice from "../../sales/models/SalesInvoice.js";
import { Employee } from "../../employees/models/Employee.js";
import Alert from "../../alerts/models/Alert.js";
import { AttendanceRecord } from "../../attendance/models/AttendanceRecord.js";
import { User } from "../../users/models/User.js";
import { ROLES } from "../../common/constants/roles.js";
import { getOwnWarehouseId } from "../../warehouses/services/warehouseScope.service.js";

export const getOverview = asyncHandler(async (req, res) => {
  const actor = req.user;
  let effectiveWarehouseId = null;

  if (actor.profile.role !== ROLES.SUPER_ADMIN) {
    effectiveWarehouseId = await getOwnWarehouseId(actor.profile);
  } else if (req.query.warehouseId && req.query.warehouseId !== "all" && /^[0-9a-fA-F]{24}$/.test(String(req.query.warehouseId))) {
    effectiveWarehouseId = req.query.warehouseId;
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // All warehouses list for switcher
  const allWarehouses = await Warehouse.find({})
    .select("name code commodity status address admin supervisor capacity")
    .populate("admin", "fullName phone email avatarUrl")
    .populate("supervisor", "fullName phone email avatarUrl")
    .lean();

  // If scoped to a particular warehouse
  if (effectiveWarehouseId) {
    const warehouseDoc = await Warehouse.findById(effectiveWarehouseId)
      .populate("admin", "fullName phone email avatarUrl address")
      .populate("supervisor", "fullName phone email avatarUrl address")
      .lean();

    const [
      collections,
      dispatches,
      stockEntries,
      employees,
      alerts,
      attendanceToday,
      godowns,
    ] = await Promise.all([
      Collection.find({ warehouse: effectiveWarehouseId }).sort({ createdAt: -1 }).lean(),
      Dispatch.find({ warehouse: effectiveWarehouseId }).sort({ createdAt: -1 }).lean(),
      StockEntry.find({ warehouse: effectiveWarehouseId }).sort({ createdAt: -1 }).lean(),
      Employee.find({ warehouse: effectiveWarehouseId }).lean(),
      Alert.find({ warehouseId: effectiveWarehouseId }).sort({ createdAt: -1 }).lean(),
      AttendanceRecord.find({ warehouse: effectiveWarehouseId, date: { $gte: todayStart } }).lean(),
      Godown.find({ warehouse: effectiveWarehouseId }).sort({ name: 1 }).lean(),
    ]);

    // Inflow metrics
    const totalInflowMt = collections.reduce((s, c) => s + (c.actualNetWeightMt || 0), 0);
    const totalInflowBales = collections.reduce((s, c) => s + (c.baleCountProduced || 0), 0);
    const collectionsToday = collections.filter((c) => new Date(c.createdAt) >= todayStart);
    const totalInflowTodayMt = collectionsToday.reduce((s, c) => s + (c.actualNetWeightMt || 0), 0);
    const totalInflowTodayBales = collectionsToday.reduce((s, c) => s + (c.baleCountProduced || 0), 0);
    const avgMoisture =
      collections.length > 0
        ? Math.round((collections.reduce((s, c) => s + (c.actualMoisturePct || 0), 0) / collections.length) * 10) / 10
        : 0;
    const rejectedCount = collections.filter((c) => c.isRejected).length;

    // Outflow / Dispatch metrics
    const totalDispatchedMt = dispatches.reduce((s, d) => s + (d.dispatchedTonnageMt || 0), 0);
    const totalDispatchBales = dispatches.reduce((s, d) => s + (d.baleCount || 0), 0);
    const totalDispatchValue = dispatches.reduce((s, d) => s + (d.totalInvoiceAmount || 0), 0);
    const dispatchesToday = dispatches.filter((d) => new Date(d.createdAt) >= todayStart);
    const totalOutflowTodayMt = dispatchesToday.reduce((s, d) => s + (d.dispatchedTonnageMt || 0), 0);
    const totalOutflowTodayBales = dispatchesToday.reduce((s, d) => s + (d.baleCount || 0), 0);
    const deliveredCount = dispatches.filter((d) => d.status === "delivered").length;
    const inTransitCount = dispatches.filter((d) => d.status === "in_transit").length;
    const pendingDispatches = dispatches.filter((d) => d.status === "pending").length;

    // Stock & Weighment Entries
    const approvedEntries = stockEntries.filter((s) => s.status === "approved");
    const stockInKg = approvedEntries
      .filter((s) => s.entryType === "inward")
      .reduce((sum, s) => sum + (s.netWeightKg || s.actualWeightKg || 0), 0);
    const stockOutKg = approvedEntries
      .filter((s) => s.entryType === "outward")
      .reduce((sum, s) => sum + (s.netWeightKg || s.actualWeightKg || 0), 0);
    const currentYardStockKg = Math.max(0, stockInKg - stockOutKg);
    const currentYardStockMt = Math.round((currentYardStockKg / 1000) * 100) / 100;
    const pendingWeighments = stockEntries.filter((s) => s.status === "pending").length;
    const approvedWeighments = stockEntries.filter((s) => s.status === "approved").length;

    // Capacity
    const warehouseCapacityMt = warehouseDoc?.capacity || godowns.reduce((s, g) => s + (g.capacityMt || 0), 0) || 5000;
    const yardUtilizationPct = warehouseCapacityMt > 0 ? Math.min(100, Math.round((currentYardStockMt / warehouseCapacityMt) * 100)) : 0;

    // Employee & Attendance
    const activeEmployees = employees.filter((e) => e.employmentStatus === "active");
    const presentToday = attendanceToday.filter((a) => a.status === "present").length;
    const lateToday = attendanceToday.filter((a) => a.status === "late").length;
    const absentToday = attendanceToday.filter((a) => a.status === "absent").length;
    const attendanceRate = activeEmployees.length > 0
      ? Math.round(((presentToday + lateToday) / activeEmployees.length) * 100)
      : 0;

    // Map staff on duty
    const attendanceMap = new Map();
    attendanceToday.forEach((a) => {
      if (a.employee) attendanceMap.set(a.employee.toString(), a);
    });

    const staffOnDuty = employees.map((emp) => {
      const att = attendanceMap.get(emp._id.toString());
      return {
        id: emp._id,
        name: emp.fullName,
        code: emp.employeeCode || "—",
        designation: emp.designation || "Operator",
        department: emp.department || "Operations",
        phone: emp.phone || "—",
        avatarUrl: emp.avatarUrl || "",
        status: att ? att.status : "unmarked",
        checkInTime: att?.checkInTime || "—",
        checkOutTime: att?.checkOutTime || "—",
      };
    });

    // Recent activities (stock entries / slips)
    const recentActivity = stockEntries.slice(0, 15).map((s) => ({
      id: s._id,
      slipNo: s.slipNo,
      entryType: s.entryType,
      commodity: s.commodity,
      partyName: s.partyName || "—",
      vehicleNo: s.vehicleNo || "—",
      grossWeightKg: s.grossWeightKg || 0,
      tareWeightKg: s.tareWeightKg || 0,
      netWeightKg: s.netWeightKg || (s.grossWeightKg - s.tareWeightKg) || 0,
      netWeightMt: Math.round(((s.netWeightKg || 0) / 1000) * 100) / 100,
      moisturePct: s.moisturePct || 0,
      deductionPct: s.deductionPct || 0,
      ratePerMt: s.ratePerMt || 0,
      totalAmountRs: s.totalAmountRs || 0,
      status: s.status,
      createdAt: s.createdAt,
    }));

    // Recent dispatches
    const recentDispatches = dispatches.slice(0, 10).map((d) => ({
      id: d._id,
      dispatchNo: d.dispatchNo || d.ewayBillNo || `DSP-${String(d._id).slice(-4).toUpperCase()}`,
      buyerName: d.buyerName || "—",
      vehicleNo: d.vehicleNo || "—",
      dispatchedTonnageMt: d.dispatchedTonnageMt || 0,
      baleCount: d.baleCount || 0,
      totalInvoiceAmount: d.totalInvoiceAmount || 0,
      status: d.status,
      createdAt: d.createdAt,
    }));

    // Recent collections
    const recentCollections = collections.slice(0, 10).map((c) => ({
      id: c._id,
      slipNo: c.slipNo,
      farmerName: c.farmerName || c.vendorName || "—",
      cropName: c.cropName || "Biomass",
      villageName: c.villageName || "—",
      vehicleNo: c.vehicleNo || "—",
      actualNetWeightMt: c.actualNetWeightMt || 0,
      actualMoisturePct: c.actualMoisturePct || 0,
      baleCountProduced: c.baleCountProduced || 0,
      isRejected: c.isRejected,
      createdAt: c.createdAt,
    }));

    // 7-day inflow vs outflow trend
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toLocaleDateString("en-IN", { weekday: "short" });
      const dateStart = new Date(d.setHours(0, 0, 0, 0));
      const dateEnd = new Date(d.setHours(23, 59, 59, 999));

      const dayInflow = collections
        .filter((c) => new Date(c.createdAt) >= dateStart && new Date(c.createdAt) <= dateEnd)
        .reduce((sum, c) => sum + (c.actualNetWeightMt || 0), 0);

      const dayOutflow = dispatches
        .filter((disp) => new Date(disp.createdAt) >= dateStart && new Date(disp.createdAt) <= dateEnd)
        .reduce((sum, disp) => sum + (disp.dispatchedTonnageMt || 0), 0);

      last7Days.push({
        day: dayStr,
        inflowMt: Math.round(dayInflow * 10) / 10,
        outflowMt: Math.round(dayOutflow * 10) / 10,
      });
    }

    // Commodity breakdown
    const commodityMap = new Map();
    collections.forEach((c) => {
      const name = c.cropName || warehouseDoc?.commodity || "Paddy Straw (Parali)";
      commodityMap.set(name, (commodityMap.get(name) || 0) + (c.actualNetWeightMt || 0));
    });
    const commodityBreakdown = Array.from(commodityMap.entries()).map(([name, weightMt]) => ({
      name,
      weightMt: Math.round(weightMt * 10) / 10,
    }));

    const openAlerts = alerts.filter((a) => a.status === "Open");

    return sendSuccess(res, {
      isWarehouseScoped: true,
      currentWarehouse: warehouseDoc ? {
        id: warehouseDoc._id,
        _id: warehouseDoc._id,
        name: warehouseDoc.name,
        code: warehouseDoc.code,
        commodity: warehouseDoc.commodity,
        address: warehouseDoc.address || "—",
        gstin: warehouseDoc.gstin || "—",
        pan: warehouseDoc.pan || "—",
        contactPerson: warehouseDoc.contactPerson || "—",
        contactPhone: warehouseDoc.contactPhone || "—",
        email: warehouseDoc.email || "—",
        helpDeskPhone: warehouseDoc.helpDeskPhone || "—",
        capacity: warehouseCapacityMt,
        status: warehouseDoc.status || "active",
        admin: warehouseDoc.admin || null,
        supervisor: warehouseDoc.supervisor || null,
      } : null,
      allWarehouses,
      kpis: {
        totalYardStockMt: currentYardStockMt,
        totalYardStockKg: currentYardStockKg,
        totalInflowMt: Math.round(totalInflowMt * 100) / 100,
        totalInflowBales,
        totalInflowTodayMt: Math.round(totalInflowTodayMt * 100) / 100,
        totalInflowTodayBales,
        totalDispatchedMt: Math.round(totalDispatchedMt * 100) / 100,
        totalDispatchBales,
        remainingBales: Math.max(0, totalInflowBales - totalDispatchBales),
        totalOutflowTodayMt: Math.round(totalOutflowTodayMt * 100) / 100,
        totalOutflowTodayBales,
        totalDispatchValue: Math.round(totalDispatchValue * 100) / 100,
        avgMoisture,
        rejectedCount,
        collectionsToday: collectionsToday.length,
        deliveredCount,
        inTransitCount,
        pendingDispatches,
        totalEmployees: employees.length,
        activeEmployees: activeEmployees.length,
        presentToday,
        lateToday,
        absentToday,
        attendanceRate,
        totalWeighments: stockEntries.length,
        pendingWeighments,
        approvedWeighments,
        totalGodowns: godowns.length,
        storageCapacityMt: warehouseCapacityMt,
        yardUtilizationPct,
        openAlerts: openAlerts.length,
        criticalAlerts: openAlerts.filter((a) => a.severity === "Critical").length,
        highAlerts: openAlerts.filter((a) => a.severity === "High").length,
      },
      recentActivity,
      recentDispatches,
      recentCollections,
      staffOnDuty,
      godownsList: godowns.map((g) => ({
        id: g._id,
        name: g.name,
        capacityMt: g.capacityMt || 0,
        currentStockMt: g.currentStockMt || 0,
        godownType: g.godownType || "covered",
        status: g.status || "active",
        utilizationPct: g.capacityMt > 0 ? Math.round(((g.currentStockMt || 0) / g.capacityMt) * 100) : 0,
      })),
      inflowTrend: last7Days,
      commodityBreakdown,
      alertSummary: openAlerts.slice(0, 10).map((a) => ({
        id: a._id,
        type: a.type,
        severity: a.severity,
        title: a.title,
        description: a.description,
        warehouseId: a.warehouseId?.toString(),
        status: a.status,
        createdAt: a.createdAt,
      })),
    });
  }

  // ==========================================
  // Global Org-Wide Overview for Super Admin
  // ==========================================
  const [
    warehouses,
    collections,
    dispatches,
    stockEntries,
    vendors,
    buyers,
    purchaseOrders,
    salesInvoices,
    employees,
    alerts,
    attendanceToday,
    users,
  ] = await Promise.all([
    Warehouse.find({}).lean(),
    Collection.find({}).lean(),
    Dispatch.find({}).lean(),
    StockEntry.find({}).lean(),
    BiomassVendor.find({}).lean(),
    BiomassBuyer.find({}).lean(),
    PurchaseOrder.find({}).lean(),
    SalesInvoice.find({}).lean(),
    Employee.find({}).lean(),
    Alert.find({}).lean(),
    AttendanceRecord.find({ date: { $gte: todayStart } }).lean(),
    User.find({ role: { $ne: "super_admin" } }).lean(),
  ]);

  const totalWarehouses = warehouses.length;
  const activeWarehouses = warehouses.filter((w) => w.status === "active").length;
  const totalCapacity = warehouses.reduce((s, w) => s + (w.capacity || 0), 0);

  const totalInflowMt = collections.reduce((s, c) => s + (c.actualNetWeightMt || 0), 0);
  const totalInflowBales = collections.reduce((s, c) => s + (c.baleCountProduced || 0), 0);
  const totalInvoiceWeight = collections.reduce((s, c) => s + (c.invoiceWeightMt || 0), 0);
  const avgMoisture =
    collections.length > 0
      ? Math.round((collections.reduce((s, c) => s + (c.actualMoisturePct || 0), 0) / collections.length) * 10) / 10
      : 0;
  const rejectedCount = collections.filter((c) => c.isRejected).length;
  const collectionsToday = collections.filter((c) => new Date(c.createdAt) >= todayStart).length;

  const totalDispatchedMt = dispatches.reduce((s, d) => s + (d.dispatchedTonnageMt || 0), 0);
  const totalDispatchBales = dispatches.reduce((s, d) => s + (d.baleCount || 0), 0);
  const totalDispatchValue = dispatches.reduce((s, d) => s + (d.totalInvoiceAmount || 0), 0);
  const deliveredCount = dispatches.filter((d) => d.status === "delivered").length;
  const inTransitCount = dispatches.filter((d) => d.status === "in_transit").length;
  const pendingDispatches = dispatches.filter((d) => d.status === "pending").length;

  const totalPOValue = purchaseOrders.reduce((s, po) => s + (po.totalAmount || 0), 0);
  const pendingPOs = purchaseOrders.filter((po) => po.status === "Pending").length;
  const approvedPOs = purchaseOrders.filter((po) => po.status === "Approved").length;
  const totalInvoiceValue = salesInvoices.reduce((s, si) => s + (si.totalAmount || 0), 0);
  const pendingInvoices = salesInvoices.filter((si) => si.status === "Pending").length;
  const deliveredInvoices = salesInvoices.filter((si) => si.status === "Delivered").length;

  const buyerStockMap = new Map();
  for (const d of dispatches) {
    const name = d.buyerName || "Unknown";
    if (!buyerStockMap.has(name)) {
      buyerStockMap.set(name, {
        buyerName: name,
        buyerId: d.buyerId,
        totalDispatchedMt: 0,
        totalBales: 0,
        totalValue: 0,
        lastDispatch: null,
        deliveries: 0,
        inTransit: 0,
        pending: 0,
        cancelled: 0,
      });
    }
    const entry = buyerStockMap.get(name);
    entry.totalDispatchedMt += d.dispatchedTonnageMt || 0;
    entry.totalBales += d.baleCount || 0;
    entry.totalValue += d.totalInvoiceAmount || 0;
    if (!entry.lastDispatch || new Date(d.dispatchDate) > new Date(entry.lastDispatch)) {
      entry.lastDispatch = d.dispatchDate;
    }
    if (d.status === "delivered") entry.deliveries++;
    else if (d.status === "in_transit") entry.inTransit++;
    else if (d.status === "pending") entry.pending++;
    else if (d.status === "cancelled") entry.cancelled++;
  }
  const buyerStockTable = Array.from(buyerStockMap.values()).sort((a, b) => b.totalValue - a.totalValue);

  const buyerFulfillment = buyers.map((b) => ({
    buyerCode: b.buyerCode,
    name: b.name,
    plantType: b.plantType,
    targetQtyMt: b.targetQtyMt || 0,
    fulfilledQtyMt: b.fulfilledQtyMt || 0,
    agreedRatePerMt: b.agreedRatePerMt || 0,
    fulfillmentPct: b.targetQtyMt > 0 ? Math.round((b.fulfilledQtyMt / b.targetQtyMt) * 100) : 0,
    status: b.status,
  }));

  const vendorSummary = vendors.map((v) => ({
    vendorCode: v.vendorCode,
    companyName: v.companyName,
    status: v.status,
    contractedQtyMt: v.contractedQtyMt || 0,
    fulfilledQtyMt: v.fulfilledQtyMt || 0,
    agreedPricePerMt: v.agreedPricePerMt || 0,
    fulfillmentPct: v.contractedQtyMt > 0 ? Math.round((v.fulfilledQtyMt / v.contractedQtyMt) * 100) : 0,
  }));

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.employmentStatus === "active").length;
  const onLeaveEmployees = employees.filter((e) => e.employmentStatus === "on_leave").length;
  const presentToday = attendanceToday.filter((a) => a.status === "present").length;
  const lateToday = attendanceToday.filter((a) => a.status === "late").length;
  const absentToday = attendanceToday.filter((a) => a.status === "absent").length;
  const attendanceRate = attendanceToday.length > 0
    ? Math.round(((presentToday + lateToday) / attendanceToday.length) * 1000) / 10
    : 0;

  const openAlerts = alerts.filter((a) => a.status === "Open");
  const criticalAlerts = openAlerts.filter((a) => a.severity === "Critical");
  const highAlerts = openAlerts.filter((a) => a.severity === "High");

  const totalStockIn = stockEntries
    .filter((s) => s.entryType === "inward")
    .reduce((sum, s) => sum + (s.actualWeightKg || s.netWeightKg || 0), 0);
  const totalStockOut = stockEntries
    .filter((s) => s.entryType === "outward")
    .reduce((sum, s) => sum + (s.actualWeightKg || s.netWeightKg || 0), 0);

  const warehouseDetails = warehouses.map((w) => {
    const whColls = collections.filter((c) => c.warehouse?.toString() === w._id.toString());
    const whDisps = dispatches.filter((d) => d.warehouse?.toString() === w._id.toString());
    const whEmps = employees.filter((e) => e.warehouse?.toString() === w._id.toString());
    const whAlerts = alerts.filter(
      (a) => a.warehouseId?.toString() === w._id.toString() && a.status === "Open"
    );
    return {
      id: w._id,
      name: w.name,
      code: w.code,
      status: w.status,
      capacity: w.capacity || 0,
      commodity: w.commodity,
      inflowMt: Math.round(whColls.reduce((s, c) => s + (c.actualNetWeightMt || 0), 0) * 100) / 100,
      outflowMt: Math.round(whDisps.reduce((s, d) => s + (d.dispatchedTonnageMt || 0), 0) * 100) / 100,
      activeEmployees: whEmps.filter((e) => e.employmentStatus === "active").length,
      openAlerts: whAlerts.length,
    };
  });

  const recentActivity = stockEntries
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10)
    .map((s) => ({
      id: s._id,
      slipNo: s.slipNo,
      entryType: s.entryType,
      commodity: s.commodity,
      netWeight: s.netWeightKg ? Math.round(s.netWeightKg / 1000 * 100) / 100 : 0,
      status: s.status,
      createdAt: s.createdAt,
    }));

  sendSuccess(res, {
    isWarehouseScoped: false,
    currentWarehouse: null,
    allWarehouses,
    kpis: {
      totalWarehouses,
      activeWarehouses,
      totalCapacity,
      totalInflowMt: Math.round(totalInflowMt * 100) / 100,
      totalInflowBales,
      totalInvoiceWeight: Math.round(totalInvoiceWeight * 100) / 100,
      avgMoisture,
      rejectedCount,
      collectionsToday,
      totalDispatchedMt: Math.round(totalDispatchedMt * 100) / 100,
      totalDispatchBales,
      totalDispatchValue: Math.round(totalDispatchValue * 100) / 100,
      deliveredCount,
      inTransitCount,
      pendingDispatches,
      totalPOValue: Math.round(totalPOValue * 100) / 100,
      pendingPOs,
      approvedPOs,
      totalInvoiceValue: Math.round(totalInvoiceValue * 100) / 100,
      pendingInvoices,
      deliveredInvoices,
      totalEmployees,
      activeEmployees,
      onLeaveEmployees,
      presentToday,
      lateToday,
      absentToday,
      attendanceRate,
      openAlerts: openAlerts.length,
      criticalAlerts: criticalAlerts.length,
      highAlerts: highAlerts.length,
      totalStockIn: Math.round(totalStockIn / 1000 * 100) / 100,
      totalStockOut: Math.round(totalStockOut / 1000 * 100) / 100,
      totalVendors: vendors.filter((v) => v.status === "ACTIVE").length,
      totalBuyers: buyers.filter((b) => b.status === "ACTIVE").length,
      totalStaff: users.length,
    },
    buyerStockTable,
    buyerFulfillment,
    vendorSummary,
    warehouseDetails,
    recentActivity,
    alertSummary: openAlerts.slice(0, 10).map((a) => ({
      id: a._id,
      type: a.type,
      severity: a.severity,
      title: a.title,
      description: a.description,
      warehouseId: a.warehouseId?.toString(),
      status: a.status,
    })),
  });
});

