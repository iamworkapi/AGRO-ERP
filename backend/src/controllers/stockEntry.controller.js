import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import * as stockEntryService from "../services/stockEntry.service.js";

export const list = asyncHandler(async (req, res) => {
  const { list, meta } = await stockEntryService.listStockEntries(req.user, req.query);
  sendSuccess(res, list, 200, meta);
});

export const create = asyncHandler(async (req, res) => {
  sendSuccess(res, await stockEntryService.createStockEntry(req.user, req.body), 201);
});

export const review = asyncHandler(async (req, res) => {
  sendSuccess(res, await stockEntryService.reviewStockEntry(req.user, req.params.id, req.body.status));
});
