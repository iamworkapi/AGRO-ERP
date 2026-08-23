import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { sendSuccess } from "../../common/utils/ApiResponse.js";
import * as payrollService from "../services/payroll.service.js";

export const slip = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;
  const { year, month } = req.query;
  sendSuccess(res, await payrollService.getPayrollSlip(req.user, { employeeId, year, month }));
});

export const listSlips = asyncHandler(async (req, res) => {
  const { year, month, page, limit } = req.query;
  const { list, meta } = await payrollService.listPayrollSlips(req.user, { year, month, page, limit });
  sendSuccess(res, list, 200, meta);
});
