import { apiClient } from "../../services/apiClient";

function unwrapList(data) {
  return Array.isArray(data?.data) ? data.data : [];
}

// Backend returns: { key, label, permissions[] } for roles
// Frontend expects: { role, permissions, users }
function adaptRole(r) {
  if (!r) return r;
  return {
    role: r.label || r.role,
    permissions: Array.isArray(r.permissions) ? r.permissions.join(", ") : r.permissions || "",
    users: 0,
  };
}

// Backend returns: { action, actor: { profile: { fullName } }, createdAt }
// Frontend expects: { action, user, time }
function adaptLogEntry(entry) {
  if (!entry) return entry;
  const userName = entry.actor?.profile?.fullName || entry.actorName || "Unknown";
  const time = entry.createdAt ? new Date(entry.createdAt).toLocaleString("en-IN") : "";
  return {
    action: entry.action || entry.description || "",
    user: userName,
    time,
  };
}

function adaptOrgProfile(p) {
  if (!p) return p;
  return {
    name: p.orgName || p.name || "",
    address: p.address || "",
    centres: 0,
    commodity: "",
    plan: "",
  };
}

export async function fetchRoles() {
  const { data } = await apiClient.get("/settings/roles");
  return unwrapList(data).map(adaptRole);
}

export async function fetchAuditLog() {
  const { data } = await apiClient.get("/settings/audit-log");
  const logs = unwrapList(data);
  return logs.map(adaptLogEntry);
}

export async function fetchOrgProfile() {
  const { data } = await apiClient.get("/settings/org-profile");
  return adaptOrgProfile(data.data || data);
}

export async function createRole(payload) {
  const { data } = await apiClient.post("/settings/roles", {
    role: payload.role,
    permissions: typeof payload.permissions === "string" ? payload.permissions.split(",").map((s) => s.trim()) : payload.permissions || [],
  });
  return adaptRole(data.data || data);
}

export async function updateOrgProfile(payload) {
  const { data } = await apiClient.put("/settings/org-profile", payload);
  return adaptOrgProfile(data.data || data);
}
