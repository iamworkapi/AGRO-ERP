import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { sendSuccess } from "../../common/utils/ApiResponse.js";
import * as service from "../services/biomassVendor.service.js";
import {
  createBiomassVendorSchema,
  updateBiomassVendorSchema,
  listBiomassVendorsQuerySchema,
} from "../validators/biomassVendor.validator.js";

export const list = asyncHandler(async (req, res) => {
  const q = req.validatedQuery || listBiomassVendorsQuerySchema.parse(req.query);
  const { list, meta } = await service.listBiomassVendors(req.user, q);
  sendSuccess(res, list, 200, meta);
});

export const getById = asyncHandler(async (req, res) => {
  sendSuccess(res, await service.getBiomassVendor(req.user, req.params.id));
});

export const create = asyncHandler(async (req, res) => {
  const payload = req.validatedBody || createBiomassVendorSchema.parse(req.body);
  sendSuccess(res, await service.createBiomassVendor(req.user, payload), 201);
});

export const update = asyncHandler(async (req, res) => {
  const payload = req.validatedBody || updateBiomassVendorSchema.parse(req.body);
  sendSuccess(res, await service.updateBiomassVendor(req.user, req.params.id, payload));
});

export const remove = asyncHandler(async (req, res) => {
  await service.deleteBiomassVendor(req.user, req.params.id);
  sendSuccess(res, { deleted: true }, 200);
});
