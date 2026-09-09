import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { sendSuccess } from "../../common/utils/ApiResponse.js";
import { authorize } from "../../common/middleware/authorize.js";
import { validate } from "../../common/middleware/validate.js";
import * as weightMachineService from "../services/weightMachine.service.js";
import { createWeightMachineSchema, updateWeightMachineSchema, updateCalibrationSchema, listWeightMachinesQuerySchema } from "../validators/weightMachine.validator.js";
import { ROLES } from "../../common/constants/roles.js";

export const list = asyncHandler(async (req, res) => {
  sendSuccess(res, await weightMachineService.listWeightMachines(req.user, req.query));
});

export const create = asyncHandler(async (req, res) => {
  sendSuccess(res, await weightMachineService.createWeightMachine(req.user, req.body), 201);
});

export const update = asyncHandler(async (req, res) => {
  sendSuccess(res, await weightMachineService.updateWeightMachine(req.user, req.params.id, req.body));
});

export const updateCalibration = asyncHandler(async (req, res) => {
  sendSuccess(res, await weightMachineService.updateCalibration(req.user, req.params.id, req.body));
});

export const remove = asyncHandler(async (req, res) => {
  sendSuccess(res, await weightMachineService.deleteWeightMachine(req.user, req.params.id));
});
