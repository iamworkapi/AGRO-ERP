import { BiomassVendor } from "../models/BiomassVendor.js";
import { ApiError } from "../../common/utils/ApiError.js";
import { recordAudit } from "../../audit/services/audit.service.js";
import { parsePagination, paginationMeta } from "../../common/utils/pagination.js";
import { ROLES } from "../../common/constants/roles.js";

const ALLOWED_UPDATE_FIELDS = [
  "companyName", "gstin", "panNo", "representative", "contactNo", "email",
  "address", "sourcingArea", "poNo", "poDate", "tenure", "contractedQtyMt",
  "agreedPricePerMt", "bankName", "accountNo", "ifscCode",
];

export async function listBiomassVendors(actor, { search, status, page, limit }) {
  const filter = {};
  if (status && status !== "ALL") filter.status = status;
  if (search) {
    const reg = new RegExp(search, "i");
    filter.$or = [
      { companyName: reg }, { vendorCode: reg }, { representative: reg },
      { gstin: reg }, { sourcingArea: reg },
    ];
  }

  const { page: pageNum, limit: pageSize, skip } = parsePagination({ page, limit });
  const [list, total] = await Promise.all([
    BiomassVendor.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize),
    BiomassVendor.countDocuments(filter),
  ]);
  return { list, meta: paginationMeta({ page: pageNum, limit: pageSize, total }) };
}

export async function getBiomassVendor(actor, id) {
  const vendor = await BiomassVendor.findById(id);
  if (!vendor) throw ApiError.notFound("Vendor not found");
  return vendor;
}

export async function createBiomassVendor(actor, payload) {
  const userId = actor.profile?._id || actor.id || actor._id;
  const vendor = await BiomassVendor.create({ ...payload, addedBy: userId });
  await recordAudit({
    actor, action: "biomass_vendor_created", entityType: "BiomassVendor",
    entityId: vendor._id, metadata: { companyName: vendor.companyName },
  });
  return vendor;
}

export async function updateBiomassVendor(actor, id, payload) {
  const vendor = await BiomassVendor.findById(id);
  if (!vendor) throw ApiError.notFound("Vendor not found");
  const patch = {};
  for (const field of ALLOWED_UPDATE_FIELDS) {
    if (payload[field] !== undefined) patch[field] = payload[field];
  }
  Object.assign(vendor, patch);
  await vendor.save();
  await recordAudit({
    actor, action: "biomass_vendor_updated", entityType: "BiomassVendor",
    entityId: id, metadata: { companyName: vendor.companyName },
  });
  return vendor;
}

export async function deleteBiomassVendor(actor, id) {
  const vendor = await BiomassVendor.findById(id);
  if (!vendor) throw ApiError.notFound("Vendor not found");
  await BiomassVendor.findByIdAndDelete(id);
  await recordAudit({
    actor, action: "biomass_vendor_deleted", entityType: "BiomassVendor",
    entityId: id, metadata: { companyName: vendor.companyName },
  });
  return { id };
}
