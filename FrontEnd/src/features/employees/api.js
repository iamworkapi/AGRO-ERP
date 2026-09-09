import { apiClient } from "../../services/apiClient";

function unwrapList(data) {
  return Array.isArray(data?.data) ? data.data : [];
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const LEAVE_TYPE_LABEL = {
  casual: "Casual Leave",
  sick: "Sick Leave",
  earned: "Earned Leave",
  maternity: "Maternity Leave",
  paternity: "Paternity Leave",
  unpaid: "Unpaid Leave",
  other: "Emergency Leave",
};

const LEAVE_TYPE_VALUE = {
  "Casual Leave": "casual",
  "Sick Leave": "sick",
  "Earned Leave": "earned",
  "Emergency Leave": "other",
  "Maternity Leave": "maternity",
  "Paternity Leave": "paternity",
  "Unpaid Leave": "unpaid",
};

function adaptLeaveRequest(lr) {
  const emp = lr.employee || {};
  const wh = lr.warehouse || {};
  return {
    id: lr.id,
    employee: emp.fullName || "",
    employeeCode: emp.employeeCode || "",
    employeeId: emp.id || "",
    warehouse: wh.name || "",
    warehouseId: wh.id || wh._id || "",
    type: LEAVE_TYPE_LABEL[lr.leaveType] || lr.leaveType || "Casual Leave",
    leaveType: lr.leaveType || "casual",
    fromDate: formatDate(lr.fromDate),
    toDate: formatDate(lr.toDate),
    dates:
      lr.fromDate && lr.toDate
        ? `${formatDate(lr.fromDate)} – ${formatDate(lr.toDate)}`
        : formatDate(lr.fromDate) || formatDate(lr.toDate) || "",
    days: lr.totalDays || 0,
    reason: lr.reason || "",
    status: lr.status ? lr.status.charAt(0).toUpperCase() + lr.status.slice(1) : "Pending",
    appliedOn: formatDate(lr.createdAt),
    reviewedBy: lr.reviewedBy?.name || "",
    reviewedAt: formatDate(lr.reviewedAt),
    reviewedRemark: lr.reviewedRemark || "",
  };
}

// Supervisor/Warehouse Admin is scoped server-side; Super Admin gets
// org-wide leave register when warehouseId is omitted.
export async function fetchLeaveRequests(warehouseId) {
  const { data } = await apiClient.get("/leave-requests", { params: warehouseId ? { warehouseId } : undefined });
  return unwrapList(data).map(adaptLeaveRequest);
}

export async function createLeaveRequest(payload) {
  const { data } = await apiClient.post("/leave-requests", {
    warehouseId: payload.warehouseId,
    employeeId: payload.employeeId,
    leaveType: LEAVE_TYPE_VALUE[payload.type] || payload.leaveType || "casual",
    fromDate: payload.fromDate,
    toDate: payload.toDate,
    reason: payload.reason || "",
  });
  return adaptLeaveRequest(data.data);
}

export async function approveLeave(id) {
  const { data } = await apiClient.post(`/leave-requests/${id}/review`, { decision: "approved" });
  return adaptLeaveRequest(data.data);
}

export async function rejectLeave(id) {
  const { data } = await apiClient.post(`/leave-requests/${id}/review`, { decision: "rejected" });
  return adaptLeaveRequest(data.data);
}

// Tasks remain mocked until a backend task module is built.
const resolveAfter = (value, ms = 300) => new Promise((resolve) => setTimeout(() => resolve(value), ms));

import { tasks } from "./mockData";

export function fetchTasks() {
  return resolveAfter([...tasks]);
}

export function createTask(payload) {
  const newTask = {
    id: `tsk-${Date.now()}`,
    task: payload.task,
    assignedTo: payload.assignedTo,
    warehouse: payload.warehouse || "Manimau Centre",
    priority: payload.priority || "Normal",
    due: payload.due || "Today",
    status: "In Progress",
    category: payload.category || "General",
    description: payload.description || "",
  };
  tasks.unshift(newTask);
  return resolveAfter(newTask);
}

export function completeTask(idOrTitle) {
  const idx = tasks.findIndex((t) => t.id === idOrTitle || t.task === idOrTitle);
  if (idx === -1) return resolveAfter(null);
  const updated = { ...tasks[idx], status: "Completed" };
  tasks[idx] = updated;
  return resolveAfter(updated);
}
