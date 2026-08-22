import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { sendSuccess } from "../../common/utils/ApiResponse.js";
import * as employeeService from "../services/employee.service.js";

export const list = asyncHandler(async (req, res) => {
  const { list, meta } = await employeeService.listEmployees(req.user, req.query);
  sendSuccess(res, list, 200, meta);
});

export const create = asyncHandler(async (req, res) => {
  sendSuccess(res, await employeeService.createEmployee(req.user, req.body), 201);
});

export const update = asyncHandler(async (req, res) => {
  sendSuccess(res, await employeeService.updateEmployee(req.user, req.params.id, req.body));
});

export const deactivate = asyncHandler(async (req, res) => {
  sendSuccess(res, await employeeService.deactivateEmployee(req.user, req.params.id));
});
