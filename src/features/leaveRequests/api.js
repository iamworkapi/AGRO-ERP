import { apiClient } from "../../services/apiClient";

function unwrapList(data) {
  return Array.isArray(data?.data) ? data.data : [];
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function adaptLeaveRequest(lr) {
  return {
    id: lr.id || lr._id,
    leaveType: lr.leaveType,
    fromDate: formatDate(lr.fromDate),
    fromDateRaw: lr.fromDate,
    toDate: formatDate(lr.toDate),
    toDateRaw: lr.toDate,
    totalDays: lr.totalDays,
    reason: lr.reason || "",
    status: lr.status,
    reviewedBy: lr.reviewedBy?.name || lr.reviewedBy?.email || "",
    reviewedAt: formatDate(lr.reviewedAt),
    reviewedRemark: lr.reviewedRemark || "",
    employeeId: lr.employee?.id || lr.employee || "",
    employeeName: lr.employee?.fullName || lr.employeeName || "",
    employeeCode: lr.employee?.employeeCode || "",
    appliedByName: lr.appliedBy?.name || lr.appliedBy?.email || "",
    warehouseId: lr.warehouse?.id || lr.warehouse || "",
    warehouse: lr.warehouse?.name || "",
    createdAt: formatDate(lr.createdAt),
  };
}

export async function fetchLeaveRequests(warehouseId, params = {}) {
  const query = { warehouseId, ...params };
  const { data } = await apiClient.get("/leave-requests", { params: query });
  return unwrapList(data).map(adaptLeaveRequest);
}

export async function createLeaveRequest(payload) {
  const { data } = await apiClient.post("/leave-requests", {
    warehouseId: payload.warehouseId,
    employeeId: payload.employeeId,
    leaveType: payload.leaveType || "casual",
    fromDate: payload.fromDate,
    toDate: payload.toDate,
    reason: payload.reason || "",
  });
  return adaptLeaveRequest(data.data);
}

export async function reviewLeaveRequest(id, decision) {
  const { data } = await apiClient.post(`/leave-requests/${id}/review`, { decision });
  return adaptLeaveRequest(data.data);
}

export async function fetchLeaveSummary(warehouseId) {
  const { data } = await apiClient.get("/leave-requests/summary", { params: { warehouseId } });
  return data.data;
}
