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
  const warehouseId = String(w?.id || w?._id || "");
  return {
    id: warehouseId,
    _id: warehouseId,
    code: w.code,
    name: w.name,
    companyName: w.companyName || "Kusumganga Agro Solutions Pvt. Ltd.",
    commodity: w.commodity,
    address: w.address || "24-A, Sai Complex Betiyahata, Gorakhpur Uttar Pradesh, 273001",
    gstin: w.gstin || "09AALCK4355J1Z2",
    pan: w.pan || "AALCK4355J",
    contactPerson: w.contactPerson || "Mr. Jagdeep Singh",
    contactPhone: w.contactPhone || "7055000315",
    email: w.email || "kusumganga5@gmail.com",
    helpDeskPhone: w.helpDeskPhone || "7905525983",
    gpsLat: w.gpsLat ?? null,
    gpsLng: w.gpsLng ?? null,
    adminId: w.admin?.id || w.admin?._id || "",
    admin: w.admin?.fullName || "",
    adminPhone: w.admin?.phone || "",
    adminEmail: w.admin?.email || "",
    adminAvatarUrl: w.admin?.avatarUrl || "",
    adminAddress: w.admin?.address || "",
    supervisorId: w.supervisor?.id || w.supervisor?._id || "",
    supervisor: w.supervisor?.fullName || "",
    supervisorPhone: w.supervisor?.phone || "",
    supervisorEmail: w.supervisor?.email || "",
    supervisorAvatarUrl: w.supervisor?.avatarUrl || "",
    supervisorAddress: w.supervisor?.address || "",
    staff: String(w.staffCount ?? 0),
    stock: `${Number(w.stockKg ?? 0).toLocaleString()} kg`,
    status: titleCaseStatus(w.status),
    createdAt: formatDate(w.createdAt),
  };
}

function unwrapList(data) {
  return Array.isArray(data?.data) ? data.data : [];
}

export async function fetchWarehouses() {
  const { data } = await apiClient.get("/warehouses");
  return unwrapList(data).map(adaptWarehouse);
}

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
    companyName: payload.companyName,
    commodity: payload.commodity,
    address: payload.address,
    gstin: payload.gstin,
    pan: payload.pan,
    contactPerson: payload.contactPerson,
    contactPhone: payload.contactPhone,
    email: payload.email,
    helpDeskPhone: payload.helpDeskPhone,
    adminId: payload.adminId,
    supervisorId: payload.supervisorId,
  });
  return adaptWarehouse(data.data);
}

export async function updateWarehouse(id, payload) {
  const cleanPayload = {};
  const allowedFields = ["name", "companyName", "commodity", "address", "gstin", "pan", "contactPerson", "contactPhone", "email", "helpDeskPhone", "status"];
  allowedFields.forEach((f) => {
    if (payload[f] !== undefined && payload[f] !== null) {
      cleanPayload[f] = payload[f];
    }
  });

  if (payload.adminId && /^[0-9a-fA-F]{24}$/.test(String(payload.adminId))) {
    cleanPayload.adminId = payload.adminId;
  }
  if (payload.supervisorId && /^[0-9a-fA-F]{24}$/.test(String(payload.supervisorId))) {
    cleanPayload.supervisorId = payload.supervisorId;
  }

  const { data } = await apiClient.patch(`/warehouses/${id}`, cleanPayload);
  return adaptWarehouse(data.data);
}

export async function deleteWarehouse(id) {
  await apiClient.delete(`/warehouses/${id}`);
  return id;
}
