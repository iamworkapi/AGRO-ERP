import { apiClient } from "../../services/apiClient";

function unwrapList(data) {
  return Array.isArray(data?.data) ? data.data : [];
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function adaptEmployee(e) {
  return {
    id: e._id || e.id,
    employeeCode: e.employeeCode,
    name: e.fullName,
    designation: e.designation,
    role: e.designation,
    phone: e.phone || "",
    email: e.email || "",
    avatarUrl: e.avatarUrl || "",
    dateOfJoining: formatDate(e.dateOfJoining),
    dateOfJoiningRaw: e.dateOfJoining ? e.dateOfJoining.slice(0, 10) : "",
    address: e.address || "",
    emergencyContactName: e.emergencyContactName || "",
    emergencyContactPhone: e.emergencyContactPhone || "",
    warehouseId: typeof e.warehouseId === "string" ? e.warehouseId : e.warehouseId?._id || "",
    warehouse: typeof e.warehouseId === "string" ? e.warehouseId : e.warehouseId?.name || "",
    employmentStatus: e.employmentStatus || "active",
    status: e.employmentStatus === "active" ? "Active" : e.employmentStatus === "on_leave" ? "On Leave" : "Inactive",
  };
}

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

// --- Task helpers (no backend endpoint yet; local mock) ---
let _tasks = [
  { id: "t1", task: "Moisture check — Lot 12", assignedTo: "Sunita Devi", warehouse: "Manimau Centre", category: "Weighment", priority: "High", due: "Today", description: "Verify moisture before accepting lot.", status: "In Progress" },
  { id: "t2", task: "Restock North Bay shelf", assignedTo: "Manoj Kumar", warehouse: "Gorakhpur North", category: "Inventory", priority: "Normal", due: "Tomorrow", description: "Move 50 bags from bulk to shelf.", status: "Not Started" },
  { id: "t3", task: "Field inspection — Plot 7", assignedTo: "Rajesh Yadav", warehouse: "Manimau Centre", category: "Field", priority: "Medium", due: "Today", description: "Check crop health and pest markers.", status: "In Progress" },
  { id: "t4", task: "Dispatch verification", assignedTo: "Karan Singh", warehouse: "Betiya Hata Store", category: "General", priority: "Normal", due: "Today", description: "", status: "Completed" },
];

export async function fetchTasks() {
  await new Promise((r) => setTimeout(r, 150));
  return _tasks.slice();
}

export async function createTask(payload) {
  await new Promise((r) => setTimeout(r, 120));
  const record = { id: `t${Date.now()}`, status: "In Progress", ...payload };
  _tasks.unshift(record);
  return record;
}

export async function completeTask(idOrTitle) {
  await new Promise((r) => setTimeout(r, 100));
  const idx = _tasks.findIndex(
    (t) => (t.id && t.id === idOrTitle) || (t.task && t.task === idOrTitle)
  );
  if (idx !== -1) {
    _tasks[idx] = { ..._tasks[idx], status: "Completed" };
    return _tasks[idx];
  }
  return null;
}
