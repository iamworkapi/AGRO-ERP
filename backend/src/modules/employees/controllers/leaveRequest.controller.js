import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { sendSuccess } from "../../common/utils/ApiResponse.js";
import * as leaveRequestService from "../services/leaveRequest.service.js";

export const list = asyncHandler(async (req, res) => {
  const { list, meta } = await leaveRequestService.listLeaveRequests(req.user, req.query);
  sendSuccess(res, list, 200, meta);
});

export const create = asyncHandler(async (req, res) => {
  sendSuccess(res, await leaveRequestService.createLeaveRequest(req.user, req.body), 201);
});

export const review = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { decision } = req.body;
  if (!["approved", "rejected"].includes(decision)) {
    return res.status(400).json({ success: false, message: "Decision must be 'approved' or 'rejected'." });
  }
  sendSuccess(res, await leaveRequestService.reviewLeaveRequest(req.user, id, decision));
});

export const summary = asyncHandler(async (req, res) => {
  sendSuccess(res, await leaveRequestService.getLeaveSummary(req.user, req.query.warehouseId));
});
