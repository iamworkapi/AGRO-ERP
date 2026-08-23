import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { sendSuccess } from "../../common/utils/ApiResponse.js";
import * as attendanceService from "../services/attendance.service.js";

export const list = asyncHandler(async (req, res) => {
  const { list, meta } = await attendanceService.listAttendance(req.user, req.query);
  sendSuccess(res, list, 200, meta);
});

export const create = asyncHandler(async (req, res) => {
  sendSuccess(res, await attendanceService.createAttendanceRecord(req.user, req.body), 201);
});

export const markPresent = asyncHandler(async (req, res) => {
  sendSuccess(res, await attendanceService.markPresent(req.user, req.params.id));
});

export const summary = asyncHandler(async (req, res) => {
  sendSuccess(res, await attendanceService.getAttendanceSummary(req.user, req.query.warehouseId, req.query.month));
});
