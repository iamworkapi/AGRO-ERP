import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { sendSuccess } from "../../common/utils/ApiResponse.js";
import * as weightMachineService from "../services/weightMachine.service.js";

export const list = asyncHandler(async (req, res) => {
  sendSuccess(res, await weightMachineService.listWeightMachines(req.user, req.query));
});

export const create = asyncHandler(async (req, res) => {
  sendSuccess(res, await weightMachineService.createWeightMachine(req.user, req.body), 201);
});

export const update = asyncHandler(async (req, res) => {
  sendSuccess(res, await weightMachineService.updateWeightMachine(req.user, req.params.id, req.body));
});
