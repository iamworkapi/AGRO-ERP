import { apiClient } from "../../services/apiClient";

function unwrapList(data) {
  return Array.isArray(data?.data) ? data.data : [];
}

// ─── Dashboard KPIs ───────────────────────────────────────────────────────

export async function fetchDashboardStats(warehouseId) {
  const params = warehouseId ? { warehouseId } : {};
  const { data } = await apiClient.get("/reports/dashboard", { params });
  return data.data;
}

// ─── Stock Valuation ──────────────────────────────────────────────────────

export async function fetchStockValuation(warehouseId, { from, to, page = 1, limit = 200 } = {}) {
  const params = { page, limit };
  if (warehouseId) params.warehouseId = warehouseId;
  if (from) params.from = from;
  if (to) params.to = to;
  const { data } = await apiClient.get("/reports/stock-valuation", { params });
  return { list: unwrapList(data), meta: data.meta };
}

// ─── Attendance Summary ───────────────────────────────────────────────────

export async function fetchAttendanceSummaryReport(warehouseId, month) {
  const params = {};
  if (warehouseId) params.warehouseId = warehouseId;
  if (month) params.month = month;
  const { data } = await apiClient.get("/reports/attendance-summary", { params });
  return data.data;
}

// ─── Moisture Trend ───────────────────────────────────────────────────────

export async function fetchMoistureTrend(warehouseId, { from, to, groupBy = "day" } = {}) {
  const params = { groupBy };
  if (warehouseId) params.warehouseId = warehouseId;
  if (from) params.from = from;
  if (to) params.to = to;
  const { data } = await apiClient.get("/reports/moisture-trend", { params });
  return data.data;
}

// ─── Purchase vs Sales ────────────────────────────────────────────────────

export async function fetchPurchaseVsSales(warehouseId, { from, to, groupBy = "month" } = {}) {
  const params = { groupBy };
  if (warehouseId) params.warehouseId = warehouseId;
  if (from) params.from = from;
  if (to) params.to = to;
  const { data } = await apiClient.get("/reports/purchase-vs-sales", { params });
  return data.data;
}

// ─── Outstanding Report ───────────────────────────────────────────────────

export async function fetchOutstanding(warehouseId) {
  const params = {};
  if (warehouseId) params.warehouseId = warehouseId;
  const { data } = await apiClient.get("/reports/outstanding", { params });
  return data.data;
}

// ─── Excel Export ─────────────────────────────────────────────────────────

export function getExportUrl({ reportType, format = "excel", from, to, warehouseId }) {
  const url = new URL("/reports/export", window.location.origin);
  url.searchParams.set("reportType", reportType);
  url.searchParams.set("format", format);
  if (from) url.searchParams.set("from", from);
  if (to) url.searchParams.set("to", to);
  if (warehouseId) url.searchParams.set("warehouseId", warehouseId);
  return url.toString();
}

export async function downloadExport({ reportType, format = "excel", from, to, warehouseId }) {
  const url = getExportUrl({ reportType, format, from, to, warehouseId });
  const token = apiClient.defaults.headers.common.Authorization;
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  document.body.appendChild(link);
  try {
    const res = await fetch(url, { headers: { Authorization: token } });
    if (!res.ok) {
      const { data } = await res.json().catch(() => ({ data: { message: res.statusText } }));
      throw new Error(data?.message || `Export failed (${res.status})`);
    }
    const blob = await res.blob();
    const ext = format === "excel" ? "xlsx" : format;
    link.download = `${reportType.replace(/-/g, "_")}-${from || "all"}-${to || "all"}.${ext}`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  } finally {
    document.body.removeChild(link);
  }
}
