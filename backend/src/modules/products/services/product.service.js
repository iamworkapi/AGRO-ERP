import { Product } from "../models/Product.js";
import { recordAudit } from "../../audit/services/audit.service.js";
import { parsePagination, paginationMeta } from "../../common/utils/pagination.js";

export async function listProducts({ search, category, status, page, limit }) {
  const filter = {};
  if (status && status !== "ALL") filter.status = status;
  if (category) filter.category = new RegExp(category, "i");
  if (search) {
    const reg = new RegExp(search, "i");
    filter.$or = [{ name: reg }, { productCode: reg }, { category: reg }, { hsnCode: reg }];
  }

  const { page: pageNum, limit: pageSize, skip } = parsePagination({ page, limit });
  const [list, total] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize),
    Product.countDocuments(filter),
  ]);
  return { list, meta: paginationMeta({ page: pageNum, limit: pageSize, total }) };
}

export async function getProduct(id) {
  if (!id || !String(id).match(/^[0-9a-fA-F]{24}$/)) {
    throw new Error("Invalid product ID");
  }
  const product = await Product.findById(id);
  if (!product) throw new Error("Product not found");
  return product;
}

export async function createProduct(actor, payload) {
  const userId = actor?.profile?._id || actor?.id || actor?._id;
  const product = await Product.create({ ...payload, addedBy: userId });
  await recordAudit({
    actor,
    action: "product_created",
    entityType: "Product",
    entityId: product._id,
    metadata: { productCode: product.productCode, name: product.name },
  });
  return product;
}

const ALLOWED_UPDATE_FIELDS = [
  "name", "description", "hsnCode", "category", "unit", "defaultRate", "status", "image",
];

export async function updateProduct(actor, id, payload) {
  if (!id || !String(id).match(/^[0-9a-fA-F]{24}$/)) {
    throw new Error("Invalid product ID");
  }
  const patch = {};
  for (const field of ALLOWED_UPDATE_FIELDS) {
    if (payload[field] !== undefined) patch[field] = payload[field];
  }

  const product = await Product.findByIdAndUpdate(id, patch, { new: true, runValidators: true });
  if (!product) throw new Error("Product not found");
  await recordAudit({
    actor,
    action: "product_updated",
    entityType: "Product",
    entityId: id,
    metadata: { name: product.name },
  });
  return product;
}

export async function deleteProduct(actor, id) {
  if (!id || !String(id).match(/^[0-9a-fA-F]{24}$/)) {
    throw new Error("Invalid product ID");
  }
  const product = await Product.findById(id);
  if (!product) throw new Error("Product not found");
  await Product.findByIdAndDelete(id);
  await recordAudit({
    actor,
    action: "product_deleted",
    entityType: "Product",
    entityId: id,
    metadata: { productCode: product.productCode, name: product.name },
  });
  return id;
}
