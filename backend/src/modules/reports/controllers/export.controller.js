import { ApiError } from "../../common/utils/ApiError.js";
import { generateExcel } from "../services/export.service.js";

// Streams an Excel workbook back to the client for the given report type.
export async function exportReport(req, res, next) {
  try {
    const { reportType, format, from, to, warehouseId } = req.query;
    if (!reportType) throw ApiError.badRequest("reportType is required.");
    if (!format) throw ApiError.badRequest("format is required.");

    const supportedTypes = [
      "stock-valuation", "attendance-summary", "moisture-trend",
      "purchase-vs-sales", "outstanding",
    ];
    if (!supportedTypes.includes(reportType)) {
      throw ApiError.badRequest(`Unsupported report type: ${reportType}`);
    }

    if (format !== "excel") {
      throw ApiError.badRequest("Only Excel export is supported at this time.");
    }

    const buffer = await generateExcel(reportType, req.user, warehouseId, from, to);

    const filename = `${reportType.replace(/-/g, "_")}-${from || "all"}-${to || "all"}.xlsx`;
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(Buffer.from(buffer));
  } catch (err) {
    if (err instanceof ApiError) return next(err);
    next(err);
  }
}
