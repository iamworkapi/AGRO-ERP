import { apiClient } from "../../services/apiClient";

const ROLE_LABELS = {
  super_admin: "Super Admin",
  warehouse_admin: "Warehouse Admin",
  supervisor: "Supervisor",
};

function unwrapList(data) {
  return Array.isArray(data?.data) ? data.data : [];
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function adaptProfile(p) {
  return {
    id: p.id,
    name: p.fullName,
    role: ROLE_LABELS[p.role] || p.role,
    roleKey: p.role,
    email: p.email || "",
    phone: p.phone || "",
    avatarUrl: p.avatarUrl || "",
    address: p.address || "",
    status: p.status,
    warehouse: p.warehouse?.name || "",
    warehouseId: p.warehouse?.id || "",
    createdAt: formatDate(p.createdAt),
  };
}

// People directory - the "Users" page's data source. Super Admin gets the
// org-wide list; a Warehouse Admin gets themselves + their own warehouse's
// Supervisor (scoped server-side, see backend/src/services/profile.service.js).
export async function fetchProfiles() {
  const { data } = await apiClient.get("/profiles");
  return unwrapList(data).map(adaptProfile);
}

const ROLE_KEYS = {
  "Warehouse Admin": "warehouse_admin",
  Supervisor: "supervisor",
  warehouse_admin: "warehouse_admin",
  supervisor: "supervisor",
};

// Super Admin can create either role, unassigned or directly assigned to a warehouse.
export async function createProfile(payload) {
  const { data } = await apiClient.post("/profiles", {
    fullName: payload.fullName,
    email: payload.email || undefined,
    phone: payload.phone || undefined,
    password: payload.password,
    role: ROLE_KEYS[payload.role] || payload.role,
    avatarUrl: payload.avatarUrl || undefined,
    address: payload.address || undefined,
    warehouseId: payload.warehouseId || undefined,
  });
  return adaptProfile(data.data);
}

export async function approveProfile(id) {
  const { data } = await apiClient.patch(`/profiles/${id}/approve`);
  return adaptProfile(data.data);
}

export async function updateProfileStatus(id, status) {
  const { data } = await apiClient.patch(`/profiles/${id}/status`, { status });
  return adaptProfile(data.data);
}

export async function updateProfile(id, payload) {
  const { data } = await apiClient.patch(`/profiles/${id}`, payload);
  return adaptProfile(data.data);
}

export async function updateOwnProfile(payload) {
  const { data } = await apiClient.patch("/profiles/me", payload);
  return adaptProfile(data.data);
}
