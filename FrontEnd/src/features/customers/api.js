// Mock-backed for now - resolves from mockData.js with a fake delay instead
// of calling a real backend. Swapping in the real backend later means adding
// apiClient.get/post calls here only.
import { customerStats, customers } from "./mockData";

const resolveAfter = (value, ms = 300) => new Promise((resolve) => setTimeout(() => resolve(value), ms));

export function fetchCustomerStats() {
  return resolveAfter([...customerStats]);
}

export function fetchCustomers() {
  return resolveAfter([...customers]);
}

export function createCustomer(payload) {
  customers.unshift(payload); // mock "write" - becomes a real POST later
  return resolveAfter(payload);
}
