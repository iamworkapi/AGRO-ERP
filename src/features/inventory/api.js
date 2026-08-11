// Mock-backed for now - resolves from mockData.js with a fake delay instead
// of calling apiClient. Swapping in the real backend later means restoring
// the apiClient.get/post calls here only.
import { inventoryStats, items, lowStockAlerts } from "./mockData";

const resolveAfter = (value, ms = 300) => new Promise((resolve) => setTimeout(() => resolve(value), ms));

export function fetchInventoryStats() {
  return resolveAfter([...inventoryStats]);
}

export function fetchItems() {
  return resolveAfter([...items]);
}

export function fetchLowStockAlerts() {
  return resolveAfter([...lowStockAlerts]);
}

export function createItem(payload) {
  items.unshift(payload); // mock "write" - becomes a real POST later
  return resolveAfter(payload);
}
