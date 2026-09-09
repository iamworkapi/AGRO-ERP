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

function adaptEmployee(e) {
  if (!e) return null;
  const wh = e.warehouse && typeof e.warehouse === "object" ? e.warehouse : {};
  const statusMap = {
    active: "Active",
    on_leave: "On Leave",
    inactive: "Inactive",
  };
  return {
    id: e.id || e._id,
    _id: e._id || e.id,
    name: e.fullName || e.name || "",
    fullName: e.fullName || e.name || "",
    employeeCode: e.employeeCode || "",
    designation: e.designation || "",
    role: e.designation || "",
    phone: e.phone || "",
    email: e.email || "",
    avatarUrl: e.avatarUrl || "",
    dateOfJoining: formatDate(e.dateOfJoining),
    dateOfJoiningRaw: e.dateOfJoining ? String(e.dateOfJoining).slice(0, 10) : "",
    address: e.address || "",
    emergencyContactName: e.emergencyContactName || "",
    emergencyContactPhone: e.emergencyContactPhone || "",
    status: statusMap[e.employmentStatus] || e.status || "Active",
    employmentStatus: e.employmentStatus || "active",
    warehouse: wh.name || "",
    warehouseId: wh.id || wh._id || e.warehouse || "",
    salaryType: e.salaryType || "monthly",
    basicSalary: e.basicSalary ?? 0,
    allowances: e.allowances ?? 0,
    deductions: e.deductions ?? 0,
    bankName: e.bankName || "",
    accountNo: e.accountNo || "",
    ifscCode: e.ifscCode || "",
    panNo: e.panNo || "",
    pfAccountNo: e.pfAccountNo || "",
    esiNo: e.esiNo || "",
    uan: e.uan || "",
  };
}

export async function fetchEmployees(warehouseId) {
  const { data } = await apiClient.get("/employees", {
    params: warehouseId ? { warehouseId } : undefined,
  });
  return unwrapList(data).map(adaptEmployee);
}

export async function createEmployee(payload) {
  const { data } = await apiClient.post("/employees", payload);
  return adaptEmployee(data.data);
}

export async function updateEmployee(payload) {
  const id = payload.id || payload._id;
  const { data } = await apiClient.patch(`/employees/${id}`, payload);
  return adaptEmployee(data.data);
}

export async function deactivateEmployee(id) {
  const { data } = await apiClient.delete(`/employees/${id}`);
  return adaptEmployee(data.data);
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
