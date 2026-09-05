import { ApiError } from "../../common/utils/ApiError.js";
import { Product } from "../models/Product.js";
import { recordAudit } from "../../audit/services/audit.service.js";

export async function listProducts() {
  return Product.find().sort({ createdAt: -1 });
}

export async function getProduct(id) {
  if (!id || !String(id).match(/^[0-9a-fA-F]{24}$/)) {
    throw ApiError.badRequest("Invalid product ID");
  }
  const product = await Product.findById(id);
  if (!product) throw ApiError.notFound("Product not found");
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

export async function updateProduct(actor, id, payload) {
  if (!id || !String(id).match(/^[0-9a-fA-F]{24}$/)) {
    throw ApiError.badRequest("Invalid product ID");
  }
  const product = await Product.findByIdAndUpdate(id, payload, { new: true });
  if (!product) throw ApiError.notFound("Product not found");
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
    throw ApiError.badRequest("Invalid product ID");
  }
  const product = await Product.findByIdAndDelete(id);
  if (!product) throw ApiError.notFound("Product not found");
  await recordAudit({
    actor,
    action: "product_deleted",
    entityType: "Product",
    entityId: id,
    metadata: { productCode: product.productCode, name: product.name },
  });
  return id;
}
