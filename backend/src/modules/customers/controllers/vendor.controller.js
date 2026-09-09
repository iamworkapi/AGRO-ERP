import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { sendSuccess } from "../../common/utils/ApiResponse.js";
import { validate } from "../../common/middleware/validate.js";
import * as vendorService from "../services/vendor.service.js";
import {
  createVendorSchema,
  updateVendorSchema,
  listVendorsQuerySchema,
} from "../validators/vendor.validator.js";

export const listVendors = asyncHandler(async (req, res) => {
  const q = listVendorsQuerySchema.parse(req.query);
  const { list, meta } = await vendorService.listVendors(req.user, q);
  sendSuccess(res, list, 200, meta);
});

export const getVendor = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await vendorService.getVendor(req.user, req.params.id) });
});

export const createVendor = asyncHandler(async (req, res) => {
  const payload = createVendorSchema.parse(req.body);
  res.status(201).json({ success: true, data: await vendorService.createVendor(req.user, payload) });
});

export const updateVendor = asyncHandler(async (req, res) => {
  const payload = updateVendorSchema.parse(req.body);
  res.json({ success: true, data: await vendorService.updateVendor(req.user, req.params.id, payload) });
});

export const deleteVendor = asyncHandler(async (req, res) => {
  await vendorService.deleteVendor(req.user, req.params.id);
  sendSuccess(res, { deleted: true }, 200);
});
