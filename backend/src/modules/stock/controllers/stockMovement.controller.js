import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { sendSuccess } from "../../common/utils/ApiResponse.js";
import * as stockMovementService from "../services/stockMovement.service.js";

export const list = asyncHandler(async (req, res) => {
  const { list, meta } = await stockMovementService.listStockMovements(req.user, req.query);
  sendSuccess(res, list, 200, meta);
});

export const create = asyncHandler(async (req, res) => {
  sendSuccess(res, await stockMovementService.createStockMovement(req.user, req.body), 201);
});

export const summary = asyncHandler(async (req, res) => {
  sendSuccess(res, await stockMovementService.getMovementSummary(req.user, req.query.warehouseId));
});
