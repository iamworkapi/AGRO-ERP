import { apiClient } from "../../services/apiClient";

function titleCaseStatus(status) {
  if (!status) return "Active";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function adaptWarehouse(w) {
  return {
    id: w.id,
    code: w.code,
    name: w.name,
    commodity: w.commodity,
    address: w.address || "",
    gpsLat: w.gpsLat ?? null,
    gpsLng: w.gpsLng ?? null,
    admin: w.admin?.fullName || "",
    adminPhone: w.admin?.phone || "",
    adminEmail: w.admin?.email || "",
    supervisor: w.supervisor?.fullName || "",
    supervisorPhone: w.supervisor?.phone || "",
    supervisorEmail: w.supervisor?.email || "",
    // Backend computes these via aggregation (active employees / approved
    // stock-entry net weight) - see warehouse.service.js withStaffAndStockTotals.
    staff: String(w.staffCount ?? 0),
    stock: `${Number(w.stockKg ?? 0).toLocaleString()} kg`,
    status: titleCaseStatus(w.status),
    createdAt: formatDate(w.createdAt),
  };
}

// A misconfigured VITE_API_BASE_URL (or a backend that's simply down) can
// mean the request "succeeds" against something that isn't this API at all
// (e.g. the Vite dev server itself answering with its SPA shell) - guard at
// this boundary so a malformed response degrades to an empty list instead
// of crashing every consumer that expects an array.
function unwrapList(data) {
  return Array.isArray(data?.data) ? data.data : [];
}

export async function fetchWarehouses() {
  const { data } = await apiClient.get("/warehouses");
  return unwrapList(data).map(adaptWarehouse);
}

// Candidates for the Create Warehouse form: active profiles with the right
// role that aren't already running another warehouse.
export async function fetchAvailableWarehouseAdmins() {
  const { data } = await apiClient.get("/warehouses/available-admins");
  return unwrapList(data);
}

export async function fetchAvailableWarehouseSupervisors() {
  const { data } = await apiClient.get("/warehouses/available-supervisors");
  return unwrapList(data);
}

export async function createWarehouse(payload) {
  const { data } = await apiClient.post("/warehouses", {
    name: payload.name,
    commodity: payload.commodity,
    address: payload.address || undefined,
    adminId: payload.adminId,
    supervisorId: payload.supervisorId,
  });
  return adaptWarehouse(data.data);
}
