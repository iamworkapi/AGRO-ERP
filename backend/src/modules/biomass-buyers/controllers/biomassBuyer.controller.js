import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { sendSuccess } from "../../common/utils/ApiResponse.js";
import { authorize } from "../../common/middleware/authorize.js";
import { validate } from "../../common/middleware/validate.js";
import * as service from "../services/biomassBuyer.service.js";
import {
  createBiomassBuyerSchema,
  updateBiomassBuyerSchema,
  listBiomassBuyersQuerySchema,
} from "../validators/biomassBuyer.validator.js";
import { ROLES } from "../../common/constants/roles.js";

export const list = asyncHandler(async (req, res) => {
  const q = req.validatedQuery || listBiomassBuyersQuerySchema.parse(req.query);
  const { list, meta } = await service.listBiomassBuyers(req.user, q);
  sendSuccess(res, list, 200, meta);
});

export const getById = asyncHandler(async (req, res) => {
  sendSuccess(res, await service.getBiomassBuyer(req.user, req.params.id));
});

export const create = asyncHandler(async (req, res) => {
  const payload = req.validatedBody || createBiomassBuyerSchema.parse(req.body);
  sendSuccess(res, await service.createBiomassBuyer(req.user, payload), 201);
});

export const update = asyncHandler(async (req, res) => {
  const payload = req.validatedBody || updateBiomassBuyerSchema.parse(req.body);
  sendSuccess(res, await service.updateBiomassBuyer(req.user, req.params.id, payload));
});

export const remove = asyncHandler(async (req, res) => {
  await service.deleteBiomassBuyer(req.user, req.params.id);
  sendSuccess(res, { deleted: true }, 200);
});
