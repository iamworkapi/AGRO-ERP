import { apiClient } from "../../services/apiClient";

function unwrapList(data) {
  return Array.isArray(data?.data) ? data.data : [];
}

// ─── Dashboard KPIs (only recentActivity and moistureSnapshot used) ───

export async function fetchSummaryStats() {
  const { data } = await apiClient.get("/reports/dashboard");
  return data.data?.summaryStats || [];
}

export async function fetchWarehouseOverview() {
  const { data } = await apiClient.get("/reports/dashboard");
  return data.data?.warehouses || [];
}

export async function fetchRecentActivity() {
  const { data } = await apiClient.get("/reports/dashboard");
  const logs = data.data?.recentActivity || [];
  return logs.map((l) => ({ text: l.action || l.text, time: l.time }));
}

export async function fetchMoistureSnapshot() {
  const { data } = await apiClient.get("/reports/dashboard");
  return data.data?.moistureSnapshot || { average: 30, threshold: 14, unit: "%" };
}
