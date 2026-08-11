import { apiClient } from "../../services/apiClient";
// Tasks / leave requests have no backend yet (see root README's "what's
// real vs mock" section) - only the employee roster itself is wired here.
import { tasks, leaveRequests } from "./mockData";

const resolveAfter = (value, ms = 300) => new Promise((resolve) => setTimeout(() => resolve(value), ms));

function unwrapList(data) {
  return Array.isArray(data?.data) ? data.data : [];
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function adaptEmployee(e) {
  return {
    id: e.id,
    employeeCode: e.employeeCode,
    name: e.fullName,
    designation: e.designation,
    role: e.designation, // legacy column name some table configs still use
    phone: e.phone || "",
    email: e.email || "",
    avatarUrl: e.avatarUrl || "",
    dateOfJoining: formatDate(e.dateOfJoining),
    // Raw ISO value (yyyy-mm-dd) for pre-filling an <input type="date"> when
    // editing - the display field above is human-formatted and unusable there.
    dateOfJoiningRaw: e.dateOfJoining ? e.dateOfJoining.slice(0, 10) : "",
    address: e.address || "",
    emergencyContactName: e.emergencyContactName || "",
    emergencyContactPhone: e.emergencyContactPhone || "",
    warehouseId: e.warehouse?.id || e.warehouse || "",
    warehouse: e.warehouse?.name || "",
    employmentStatus: e.employmentStatus || "active",
    status: e.employmentStatus === "active" ? "Active" : e.employmentStatus === "on_leave" ? "On Leave" : "Inactive",
  };
}

// Super Admin gets the org-wide roster (no warehouseId); a Supervisor/Admin
// is always scoped server-side to their own warehouse regardless of what's
// passed here.
export async function fetchEmployees(warehouseId) {
  const { data } = await apiClient.get("/employees", { params: warehouseId ? { warehouseId } : undefined });
  return unwrapList(data).map(adaptEmployee);
}

export async function createEmployee(payload) {
  const { data } = await apiClient.post("/employees", {
    warehouseId: payload.warehouseId,
    fullName: payload.fullName,
    designation: payload.designation,
    phone: payload.phone || undefined,
    email: payload.email || undefined,
    avatarUrl: payload.avatarUrl || undefined,
    dateOfJoining: payload.dateOfJoining || undefined,
    address: payload.address || undefined,
    emergencyContactName: payload.emergencyContactName || undefined,
    emergencyContactPhone: payload.emergencyContactPhone || undefined,
  });
  return adaptEmployee(data.data);
}

export async function deactivateEmployee(id) {
  const { data } = await apiClient.delete(`/employees/${id}`);
  return adaptEmployee(data.data);
}

export async function updateEmployee({ id, ...payload }) {
  const { data } = await apiClient.patch(`/employees/${id}`, {
    fullName: payload.fullName,
    designation: payload.designation,
    phone: payload.phone || undefined,
    email: payload.email || undefined,
    avatarUrl: payload.avatarUrl || undefined,
    dateOfJoining: payload.dateOfJoining || undefined,
    address: payload.address || undefined,
    emergencyContactName: payload.emergencyContactName || undefined,
    emergencyContactPhone: payload.emergencyContactPhone || undefined,
    employmentStatus: payload.employmentStatus || undefined,
  });
  return adaptEmployee(data.data);
}

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

export function fetchLeaveRequests() {
  return resolveAfter([...leaveRequests]);
}

export function createLeaveRequest(payload) {
  const newReq = {
    id: `lr-${Date.now()}`,
    employee: payload.employee,
    warehouse: payload.warehouse || "Manimau Centre",
    type: payload.type || "Casual Leave",
    dates: payload.dates || "Upcoming",
    days: payload.days || 1,
    reason: payload.reason || "Personal reason",
    status: "Pending",
    appliedOn: "Today",
  };
  leaveRequests.unshift(newReq);
  return resolveAfter(newReq);
}

export function approveLeave(employeeOrId) {
  const idx = leaveRequests.findIndex((r) => r.id === employeeOrId || r.employee === employeeOrId);
  if (idx === -1) return resolveAfter(null);
  const updated = { ...leaveRequests[idx], status: "Approved" };
  leaveRequests[idx] = updated;
  return resolveAfter(updated);
}

export function rejectLeave(employeeOrId) {
  const idx = leaveRequests.findIndex((r) => r.id === employeeOrId || r.employee === employeeOrId);
  if (idx === -1) return resolveAfter(null);
  const updated = { ...leaveRequests[idx], status: "Rejected" };
  leaveRequests[idx] = updated;
  return resolveAfter(updated);
}
