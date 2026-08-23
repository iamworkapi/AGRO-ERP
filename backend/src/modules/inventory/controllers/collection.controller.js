import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { sendSuccess } from "../../common/utils/ApiResponse.js";
import * as collectionService from "../services/collection.service.js";

export const list = asyncHandler(async (req, res) => {
  const { list, meta } = await collectionService.listCollections(req.user, req.query);
  sendSuccess(res, list, 200, meta);
});

export const create = asyncHandler(async (req, res) => {
  sendSuccess(res, await collectionService.createCollection(req.user, req.body), 201);
});

export const summary = asyncHandler(async (req, res) => {
  sendSuccess(res, await collectionService.getCollectionSummary(req.user, req.query.warehouseId));
});
