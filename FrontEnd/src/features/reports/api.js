// Mock-backed for now - resolves from mockData.js with a fake delay instead
// of calling apiClient. Swapping in the real backend later means restoring
// the apiClient.get calls here only.
import { reportStats, availableReports } from "./mockData";

const resolveAfter = (value, ms = 300) => new Promise((resolve) => setTimeout(() => resolve(value), ms));

export function fetchReportStats() {
  return resolveAfter([...reportStats]);
}

export function fetchAvailableReports() {
  return resolveAfter([...availableReports]);
}
