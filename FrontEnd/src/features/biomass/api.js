import { apiClient } from "../../services/apiClient";

function unwrapList(data) {
  return Array.isArray(data?.data) ? data.data : [];
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function adaptBuyer(b) {
  return {
    id: b._id || b.id,
    name: b.name || "",
    buyerCode: b.buyerCode || "",
    division: b.division || "",
    address: b.address || "",
    gstin: b.gstin || "",
    plantType: b.plantType || "",
    agreedRatePerMt: b.agreedRatePerMt ?? 0,
    targetQtyMt: b.targetQtyMt ?? 0,
    fulfilledQtyMt: b.fulfilledQtyMt ?? 0,
    contactPerson: b.contactPerson || "",
    contactMobile: b.contactMobile || "",
    email: b.email || "",
    poNo: b.poNo || "",
    paymentTerms: b.paymentTerms || "",
    createdAt: formatDate(b.createdAt),
    addedBy: b.addedBy || "",
  };
}

function adaptVendor(v) {
  const wh = v.warehouse && typeof v.warehouse === "object" ? v.warehouse : null;
  return {
    id: v._id || v.id,
    vendorCode: v.vendorCode || "",
    companyName: v.companyName || "",
    gstin: v.gstin || "",
    panNo: v.panNo || "",
    representative: v.representative || "",
    contactNo: v.contactNo || "",
    email: v.email || "",
    address: v.address || "",
    sourcingArea: v.sourcingArea || "",
    poNo: v.poNo || "",
    poDate: formatDate(v.poDate),
    tenure: v.tenure || "",
    contractedQtyMt: v.contractedQtyMt ?? 0,
    agreedPricePerMt: v.agreedPricePerMt ?? 0,
    bankName: v.bankName || "",
    accountNo: v.accountNo || "",
    ifscCode: v.ifscCode || "",
    status: v.status || "ACTIVE",
    warehouse: wh,
    warehouseId: wh?._id || (typeof v.warehouse === "string" ? v.warehouse : "") || "",
    warehouseName: wh?.name || "All Warehouses",
    warehouseCode: wh?.code || "",
    createdAt: formatDate(v.createdAt),
    addedBy: v.addedBy || "",
  };
}

// ── Buyers ────────────────────────────────────────────────────

export async function fetchBuyers({ search, plantType, page = 1, limit = 100 } = {}) {
  const params = {};
  if (search) params.search = search;
  if (plantType && plantType !== "ALL") params.plantType = plantType;
  if (page) params.page = page;
  if (limit) params.limit = limit;
  const { data } = await apiClient.get("/biomass-buyers", { params });
  return { buyers: unwrapList(data).map(adaptBuyer), meta: data.meta };
}

export async function fetchBuyer(id) {
  const { data } = await apiClient.get(`/biomass-buyers/${id}`);
  return adaptBuyer(data.data);
}

export async function createBuyer(payload) {
  const { data } = await apiClient.post("/biomass-buyers", {
    name: payload.name,
    division: payload.division || "",
    address: payload.address,
    gstin: payload.gstin,
    plantType: payload.plantType || "Bio-Ethanol Plant",
    agreedRatePerMt: payload.agreedRatePerMt || 0,
    targetQtyMt: payload.targetQtyMt || 0,
    contactPerson: payload.contactPerson || "",
    contactMobile: payload.contactMobile || "",
    email: payload.email || "",
    poNo: payload.poNo || "",
    paymentTerms: payload.paymentTerms || "",
  });
  return adaptBuyer(data.data);
}

export async function updateBuyer(id, payload) {
  const { data } = await apiClient.put(`/biomass-buyers/${id}`, payload);
  return adaptBuyer(data.data);
}

export async function deleteBuyer(id) {
  const { data } = await apiClient.delete(`/biomass-buyers/${id}`);
  return data.data;
}

// ── Vendors ──────────────────────────────────────────────────

export async function fetchVendors({ warehouseId, search, status, page = 1, limit = 100 } = {}) {
  const params = {};
  if (warehouseId && warehouseId !== "ALL") params.warehouseId = warehouseId;
  if (search) params.search = search;
  if (status && status !== "ALL") params.status = status;
  if (page) params.page = page;
  if (limit) params.limit = limit;
  const { data } = await apiClient.get("/biomass-vendors", { params });
  return { vendors: unwrapList(data).map(adaptVendor), meta: data.meta };
}

export async function fetchVendor(id) {
  const { data } = await apiClient.get(`/biomass-vendors/${id}`);
  return adaptVendor(data.data);
}

export async function createVendor(payload) {
  const { data } = await apiClient.post("/biomass-vendors", {
    companyName: payload.companyName,
    gstin: payload.gstin || "",
    panNo: payload.panNo || "",
    representative: payload.representative || "",
    contactNo: payload.contactNo,
    email: payload.email || "",
    address: payload.address || "",
    sourcingArea: payload.sourcingArea || "",
    poNo: payload.poNo || "",
    poDate: payload.poDate || "",
    tenure: payload.tenure || "",
    contractedQtyMt: payload.contractedQtyMt || 0,
    agreedPricePerMt: payload.agreedPricePerMt || 0,
    bankName: payload.bankName || "",
    accountNo: payload.accountNo || "",
    ifscCode: payload.ifscCode || "",
    warehouseId: payload.warehouseId || payload.warehouse,
  });
  return adaptVendor(data.data);
}

export async function updateVendor(id, payload) {
  const { data } = await apiClient.put(`/biomass-vendors/${id}`, payload);
  return adaptVendor(data.data);
}

export async function deleteVendor(id) {
  const { data } = await apiClient.delete(`/biomass-vendors/${id}`);
  return data.data;
}
