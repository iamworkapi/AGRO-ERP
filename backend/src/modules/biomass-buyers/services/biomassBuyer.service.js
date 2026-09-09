import { BiomassBuyer } from "../models/BiomassBuyer.js";
import { ApiError } from "../../common/utils/ApiError.js";
import { recordAudit } from "../../audit/services/audit.service.js";
import { parsePagination, paginationMeta } from "../../common/utils/pagination.js";

const ALLOWED_UPDATE_FIELDS = [
  "name", "division", "address", "gstin", "plantType", "agreedRatePerMt",
  "targetQtyMt", "contactPerson", "contactMobile", "email", "poNo", "paymentTerms",
];

export async function listBiomassBuyers(actor, { search, plantType, page, limit }) {
  const filter = {};
  if (plantType && plantType !== "ALL") filter.plantType = new RegExp(plantType, "i");
  if (search) {
    const reg = new RegExp(search, "i");
    filter.$or = [
      { name: reg }, { buyerCode: reg }, { division: reg },
      { contactPerson: reg }, { gstin: reg },
    ];
  }

  const { page: pageNum, limit: pageSize, skip } = parsePagination({ page, limit });
  const [list, total] = await Promise.all([
    BiomassBuyer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize),
    BiomassBuyer.countDocuments(filter),
  ]);
  return { list, meta: paginationMeta({ page: pageNum, limit: pageSize, total }) };
}

export async function getBiomassBuyer(actor, id) {
  const buyer = await BiomassBuyer.findById(id);
  if (!buyer) throw ApiError.notFound("Buyer not found");
  return buyer;
}

export async function createBiomassBuyer(actor, payload) {
  const userId = actor.profile?._id || actor.id || actor._id;
  const buyer = await BiomassBuyer.create({ ...payload, addedBy: userId });
  await recordAudit({
    actor, action: "biomass_buyer_created", entityType: "BiomassBuyer",
    entityId: buyer._id, metadata: { name: buyer.name },
  });
  return buyer;
}

export async function updateBiomassBuyer(actor, id, payload) {
  const buyer = await BiomassBuyer.findById(id);
  if (!buyer) throw ApiError.notFound("Buyer not found");
  const patch = {};
  for (const field of ALLOWED_UPDATE_FIELDS) {
    if (payload[field] !== undefined) patch[field] = payload[field];
  }
  Object.assign(buyer, patch);
  await buyer.save();
  await recordAudit({
    actor, action: "biomass_buyer_updated", entityType: "BiomassBuyer",
    entityId: id, metadata: { name: buyer.name },
  });
  return buyer;
}

export async function deleteBiomassBuyer(actor, id) {
  const buyer = await BiomassBuyer.findById(id);
  if (!buyer) throw ApiError.notFound("Buyer not found");
  await BiomassBuyer.findByIdAndDelete(id);
  await recordAudit({
    actor, action: "biomass_buyer_deleted", entityType: "BiomassBuyer",
    entityId: id, metadata: { name: buyer.name },
  });
  return { id };
}
