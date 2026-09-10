import { apiClient } from "../../services/apiClient";

// Real backend-backed analytics
export async function fetchReportStats(warehouseId) {
  const { data } = await apiClient.get("/reports/dashboard", { params: warehouseId ? { warehouseId } : {} });
  const stats = data.data?.summaryStats || {};
  const warehouses = data.data?.warehouses || [];

  // Transform backend stats into the format the UI expects
  const result = [
    {
      label: "Total Stock (Kg)",
      value: `${Number(stats.totalStockKg || 0).toLocaleString("en-IN")} kg`,
      sub: `₹${Number(stats.totalStockValue || 0).toLocaleString("en-IN")} value`,
      trend: `${stats.activeWarehouses || 0} active warehouses`,
      trendUp: true,
    },
    {
      label: "Weighments",
      value: `${stats.totalWeighments || 0} slips`,
      sub: `${stats.pendingWeighments || 0} pending approval`,
      trend: "Total weighbridge entries",
    },
    {
      label: "Collections (Inbound)",
      value: `${Number(stats.totalCollectionsMt || 0).toFixed(2)} MT`,
      sub: `${stats.totalCollections || 0} collection slips`,
      trend: "Biomass received from vendors",
      trendUp: true,
    },
    {
      label: "Dispatches (Outbound)",
      value: `${Number(stats.totalDispatchesMt || 0).toFixed(2)} MT`,
      sub: `₹${Number(stats.totalDispatchesValue || 0).toLocaleString("en-IN")} revenue`,
      trend: `${stats.totalDispatches || 0} dispatches to buyers`,
      trendUp: true,
    },
    {
      label: "Employees",
      value: `${stats.totalEmployees || 0}`,
      sub: "Active staff across all warehouses",
      trend: "Active workforce",
    },
    {
      label: "Attendance Rate",
      value: `${stats.attendanceRate || 0}%`,
      sub: "Average across all centres",
      trend: stats.attendanceRate >= 80 ? "Healthy" : "Below target",
      trendUp: stats.attendanceRate >= 80,
    },
  ];

  return { stats: result, warehouses };
}

export async function fetchAvailableReports() {
  const { data } = await apiClient.get("/reports/available");
  return data.data || [];
}

export async function fetchPurchaseVsSales(warehouseId, { from, to, groupBy = "month" }) {
  const { data } = await apiClient.get("/reports/purchase-vs-sales", {
    params: { warehouseId, from, to, groupBy },
  });
  return data.data || [];
}

export async function fetchStockValuation(warehouseId, { from, to, page = 1, limit = 50 }) {
  const { data } = await apiClient.get("/reports/stock-valuation", {
    params: { warehouseId, from, to, page, limit },
  });
  return data.data || [];
}

export async function fetchAttendanceSummary(warehouseId, month) {
  const { data } = await apiClient.get("/reports/attendance-summary", {
    params: { warehouseId, month },
  });
  return data.data || [];
}

export async function fetchMoistureTrend(warehouseId, { from, to, groupBy = "day" }) {
  const { data } = await apiClient.get("/reports/moisture-trend", {
    params: { warehouseId, from, to, groupBy },
  });
  return data.data || [];
}

export async function fetchOutstandingReport(warehouseId) {
  const { data } = await apiClient.get("/reports/outstanding", {
    params: { warehouseId },
  });
  return data.data || {};
}
