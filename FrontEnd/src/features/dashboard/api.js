import { apiClient } from "../../services/apiClient";

export async function fetchOverview(warehouseId) {
  const { data } = await apiClient.get("/dashboard/overview", {
    params: warehouseId && warehouseId !== "all" ? { warehouseId } : undefined,
  });
  return data.data;
}

