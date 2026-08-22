import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { sendSuccess } from "../../common/utils/ApiResponse.js";
import * as warehouseService from "../services/warehouse.service.js";

export const list = asyncHandler(async (req, res) => {
  sendSuccess(res, await warehouseService.listWarehouses(req.user));
});

export const availableAdmins = asyncHandler(async (_req, res) => {
  sendSuccess(res, await warehouseService.listAvailableAdmins());
});

export const availableSupervisors = asyncHandler(async (_req, res) => {
  sendSuccess(res, await warehouseService.listAvailableSupervisors());
});

export const getById = asyncHandler(async (req, res) => {
  sendSuccess(res, await warehouseService.getWarehouseById(req.user, req.params.id));
});

export const create = asyncHandler(async (req, res) => {
  sendSuccess(res, await warehouseService.createWarehouse(req.user, req.body), 201);
});

export const update = asyncHandler(async (req, res) => {
  sendSuccess(res, await warehouseService.updateWarehouse(req.user, req.params.id, req.body));
});

export const deactivate = asyncHandler(async (req, res) => {
  sendSuccess(res, await warehouseService.deactivateWarehouse(req.user, req.params.id));
});
