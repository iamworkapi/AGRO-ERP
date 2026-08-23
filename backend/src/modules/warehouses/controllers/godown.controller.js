import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { sendSuccess } from "../../common/utils/ApiResponse.js";
import * as godownService from "../services/godown.service.js";

export const list = asyncHandler(async (req, res) => {
  sendSuccess(res, await godownService.listGodowns(req.user, req.query));
});

export const create = asyncHandler(async (req, res) => {
  sendSuccess(res, await godownService.createGodown(req.user, req.body), 201);
});

export const update = asyncHandler(async (req, res) => {
  sendSuccess(res, await godownService.updateGodown(req.user, req.params.id, req.body));
});

export const remove = asyncHandler(async (req, res) => {
  sendSuccess(res, await godownService.deleteGodown(req.user, req.params.id));
});
