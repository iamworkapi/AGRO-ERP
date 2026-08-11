// Mock-backed for now - resolves from mockData.js with a fake delay instead
// of calling apiClient. Swapping in the real backend later means restoring
// the apiClient.get/post calls here only.
import { roles, auditLog, orgProfile } from "./mockData";

const resolveAfter = (value, ms = 300) => new Promise((resolve) => setTimeout(() => resolve(value), ms));

export function fetchRoles() {
  return resolveAfter([...roles]);
}

export function fetchAuditLog() {
  return resolveAfter([...auditLog]);
}

export function fetchOrgProfile() {
  return resolveAfter({ ...orgProfile });
}

export function createRole(payload) {
  const record = { users: 0, ...payload };
  roles.push(record); // mock "write" - becomes a real POST later
  return resolveAfter(record);
}

export function updateOrgProfile(payload) {
  Object.assign(orgProfile, payload); // mock "write" - becomes a real PUT later
  return resolveAfter({ ...orgProfile });
}
