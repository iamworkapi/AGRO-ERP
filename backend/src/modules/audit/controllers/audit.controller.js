import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { sendSuccess } from "../../common/utils/ApiResponse.js";
import { listAuditLogs } from "../services/audit.service.js";

export const list = asyncHandler(async (req, res) => {
  const { warehouseId, actorId, limit } = req.query;
  sendSuccess(res, await listAuditLogs({ actor: req.user, warehouseId, actorId, limit }));
});
