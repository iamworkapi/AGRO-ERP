// Mock-backed for now - resolves from mockData.js with a fake delay instead
// of calling apiClient. Swapping in the real backend later means restoring
// the apiClient.get calls here only.
import { summaryStats, warehouses, recentActivity, moistureSnapshot } from "./mockData";

const resolveAfter = (value, ms = 300) => new Promise((resolve) => setTimeout(() => resolve(value), ms));

export function fetchSummaryStats() {
  return resolveAfter([...summaryStats]);
}

export function fetchWarehouseOverview() {
  return resolveAfter([...warehouses]);
}

export function fetchRecentActivity() {
  return resolveAfter([...recentActivity]);
}

export function fetchMoistureSnapshot() {
  return resolveAfter({ ...moistureSnapshot });
}
