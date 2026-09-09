import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { sendSuccess } from "../../common/utils/ApiResponse.js";
import { validate } from "../../common/middleware/validate.js";
import * as service from "../services/product.service.js";
import {
  listProductsQuerySchema,
  createProductSchema,
  updateProductSchema,
} from "../validators/product.validators.js";

export const listProducts = asyncHandler(async (req, res) => {
  const { list, meta } = await service.listProducts(req.query);
  sendSuccess(res, list, 200, meta);
});

export const getProduct = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.getProduct(req.params.id) });
});

export const createProduct = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await service.createProduct(req.user, req.body) });
});

export const updateProduct = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.updateProduct(req.user, req.params.id, req.body) });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  await service.deleteProduct(req.user, req.params.id);
  sendSuccess(res, { deleted: true }, 200);
});
