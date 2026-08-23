import { apiClient } from "../../services/apiClient";

function unwrapList(data) {
  return Array.isArray(data?.data) ? data.data : [];
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function adaptDispatch(d) {
  return {
    id: d.id || d._id,
    gatePassNo: d.gatePassNo,
    buyerId: d.buyerId || "",
    buyerName: d.buyerName,
    vehicleNo: d.vehicleNo,
    driverName: d.driverName || "",
    driverMobile: d.driverMobile || "",
    dispatchedTonnageMt: d.dispatchedTonnageMt || 0,
    baleCount: d.baleCount || 0,
    ratePerMt: d.ratePerMt || 0,
    totalInvoiceAmount: d.totalInvoiceAmount || 0,
    poNo: d.poNo || "",
    poDate: d.poDate || "",
    ewayBillNo: d.ewayBillNo || "",
    lrNo: d.lrNo || "",
    status: d.status || "pending",
    remarks: d.remarks || "",
    warehouseId: d.warehouse?.id || d.warehouse || "",
    warehouse: d.warehouse?.name || "",
    dispatchedBy: d.dispatchedBy?.name || "",
    createdAt: formatDate(d.createdAt),
    createdAtRaw: d.createdAt,
  };
}

export async function fetchDispatches(warehouseId, params = {}) {
  const query = { warehouseId, ...params };
  const { data } = await apiClient.get("/dispatches", { params: query });
  return unwrapList(data).map(adaptDispatch);
}

export async function createDispatch(payload) {
  const { data } = await apiClient.post("/dispatches", {
    warehouseId: payload.warehouseId,
    buyerId: payload.buyerId || undefined,
    buyerName: payload.buyerName,
    vehicleNo: payload.vehicleNo,
    driverName: payload.driverName || undefined,
    driverMobile: payload.driverMobile || undefined,
    dispatchedTonnageMt: payload.dispatchedTonnageMt,
    baleCount: payload.baleCount || 0,
    ratePerMt: payload.ratePerMt,
    poNo: payload.poNo || undefined,
    poDate: payload.poDate || undefined,
    ewayBillNo: payload.ewayBillNo || undefined,
    lrNo: payload.lrNo || undefined,
    remarks: payload.remarks || undefined,
  });
  return adaptDispatch(data.data);
}

export async function fetchDispatchSummary(warehouseId) {
  const { data } = await apiClient.get("/dispatches/summary", { params: { warehouseId } });
  return data.data;
}

export async function updateDispatchStatusApi(id, status) {
  const { data } = await apiClient.patch(`/dispatches/${id}/status`, { status });
  return adaptDispatch(data.data);
}
