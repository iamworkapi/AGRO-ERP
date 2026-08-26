import { apiClient } from "../../services/apiClient";

function unwrapList(data) {
  return Array.isArray(data?.data) ? data.data : [];
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function adaptMachine(m) {
  return {
    id: m.id,
    machineCode: m.machineCode,
    make: m.make || "",
    model: m.model || "",
    capacityKg: m.capacityKg ?? null,
    installedOn: formatDate(m.installedOn),
    lastCalibratedOn: formatDate(m.lastCalibratedOn),
    nextCalibrationDue: formatDate(m.nextCalibrationDue),
    status: m.status,
    warehouseId: m.warehouse?.id || m.warehouse || "",
    warehouse: m.warehouse?.name || "",
  };
}

// A Supervisor/Warehouse Admin is always scoped server-side to their own
// warehouse regardless of warehouseId (see backend weightMachine.service.js
// listWeightMachines); Super Admin gets the org-wide list when omitted.
export async function fetchWeightMachines(warehouseId) {
  const { data } = await apiClient.get("/weight-machines", { params: warehouseId ? { warehouseId } : undefined });
  return unwrapList(data).map(adaptMachine);
}

export async function createWeightMachine(payload) {
  const { data } = await apiClient.post("/weight-machines", {
    warehouseId: payload.warehouseId,
    machineCode: payload.machineCode,
    make: payload.make || undefined,
    model: payload.model || undefined,
    capacityKg: payload.capacityKg || undefined,
    installedOn: payload.installedOn || undefined,
  });
  return adaptMachine(data.data);
}

export async function updateWeightMachine(id, payload) {
  const { data } = await apiClient.patch(`/weight-machines/${id}`, payload);
  return adaptMachine(data.data);
}

export async function deleteWeightMachine(id) {
  const { data } = await apiClient.delete(`/weight-machines/${id}`);
  return data.data;
}
