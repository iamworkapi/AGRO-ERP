import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { sendSuccess } from "../../common/utils/ApiResponse.js";
import * as reportsService from "../services/reports.service.js";

export const dashboard = asyncHandler(async (req, res) => {
  sendSuccess(res, await reportsService.getDashboardStats(req.user, req.query.warehouseId), 200);
});

export const stockValuation = asyncHandler(async (req, res) => {
  const result = await reportsService.getStockValuation(req.user, req.query.warehouseId, {
    from: req.query.from,
    to: req.query.to,
    page: req.query.page,
    limit: req.query.limit,
  });
  sendSuccess(res, result.list, 200, result.meta);
});

export const attendanceSummary = asyncHandler(async (req, res) => {
  sendSuccess(res, await reportsService.getAttendanceSummaryReport(req.user, req.query.warehouseId, req.query.month), 200);
});

export const moistureTrend = asyncHandler(async (req, res) => {
  sendSuccess(res, await reportsService.getMoistureTrend(req.user, req.query.warehouseId, {
    from: req.query.from,
    to: req.query.to,
    groupBy: req.query.groupBy || "day",
  }), 200);
});

export const purchaseVsSales = asyncHandler(async (req, res) => {
  sendSuccess(res, await reportsService.getPurchaseVsSales(req.user, req.query.warehouseId, {
    from: req.query.from,
    to: req.query.to,
    groupBy: req.query.groupBy || "month",
  }), 200);
});

export const outstandingReport = asyncHandler(async (req, res) => {
  sendSuccess(res, await reportsService.getOutstandingReport(req.user, req.query.warehouseId), 200);
});
