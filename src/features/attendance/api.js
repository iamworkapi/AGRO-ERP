import { apiClient } from "../../services/apiClient";

function unwrapList(data) {
  return Array.isArray(data?.data) ? data.data : [];
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const STATUS_LABEL = { present: "Present", late: "Late", absent: "Absent", pending: "Pending" };

function adaptRecord(r) {
  return {
    id: r.id,
    employeeId: r.employee?.id || r.employee || "",
    employee: r.employee?.fullName || "",
    employeeCode: r.employee?.employeeCode || "",
    warehouseId: r.warehouse?.id || r.warehouse || "",
    warehouse: r.warehouse?.name || "",
    date: formatDate(r.date),
    checkIn: r.checkInTime || "—",
    checkOut: r.checkOutTime || "—",
    status: STATUS_LABEL[r.status] || "Pending",
    reason: r.reason || "",
  };
}

// A Supervisor/Warehouse Admin is always scoped server-side to their own
// warehouse regardless of warehouseId (see backend attendance.service.js
// listAttendance); Super Admin gets the org-wide log when omitted.
export async function fetchAttendanceRecords(warehouseId) {
  const { data } = await apiClient.get("/attendance", { params: warehouseId ? { warehouseId } : undefined });
  return unwrapList(data).map(adaptRecord);
}

export async function createAttendanceRecord(payload) {
  const { data } = await apiClient.post("/attendance", {
    warehouseId: payload.warehouseId,
    employeeId: payload.employeeId,
    date: payload.date,
    checkInTime: payload.checkInTime || undefined,
    checkOutTime: payload.checkOutTime || undefined,
    reason: payload.reason || undefined,
  });
  return adaptRecord(data.data);
}

export async function markAttendancePresent(id) {
  const { data } = await apiClient.patch(`/attendance/${id}/mark-present`);
  return adaptRecord(data.data);
}
