import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { sendSuccess } from "../../common/utils/ApiResponse.js";
import * as dispatchService from "../services/dispatch.service.js";

export const list = asyncHandler(async (req, res) => {
  const { list, meta } = await dispatchService.listDispatches(req.user, req.query);
  sendSuccess(res, list, 200, meta);
});

export const create = asyncHandler(async (req, res) => {
  sendSuccess(res, await dispatchService.createDispatch(req.user, req.body), 201);
});

export const summary = asyncHandler(async (req, res) => {
  sendSuccess(res, await dispatchService.getDispatchSummary(req.user, req.query.warehouseId));
});

export const updateStatus = asyncHandler(async (req, res) => {
  sendSuccess(res, await dispatchService.updateDispatchStatus(req.user, req.params.id, req.body.status));
});
