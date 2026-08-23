import { apiClient } from "../../services/apiClient";

function unwrapList(data) {
  return Array.isArray(data?.data) ? data.data : [];
}

// Backend Alert shape → what Alerts page expects (description as key, status for badge)
function adaptAlert(a) {
  if (!a) return a;
  return {
    type: a.type || "",
    severity: a.severity || "Medium",
    description: a.title || "",
    status: a.status || "Open",
    warehouse: typeof a.warehouseId === "string" ? a.warehouseId : a.warehouseId?.name || "",
  };
}

export async function fetchExceptions() {
  const { data } = await apiClient.get("/alerts");
  return unwrapList(data).map(adaptAlert);
}

export async function resolveException(id) {
  const { data } = await apiClient.post(`/alerts/${id}/resolve`);
  const resolved = data.data || data;
  return adaptAlert(resolved);
}
