import { z } from "zod";
import { objectId } from "../../common/validators/common.js";

export const createAttendanceSchema = z.object({
  warehouseId: objectId("warehouseId"),
  employeeId: objectId("employeeId"),
  date: z.string().date(),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
  reason: z.string().optional(),
});

export const listAttendanceQuerySchema = z.object({
  warehouseId: objectId("warehouseId").optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(500).optional(),
});

export const attendanceSummaryQuerySchema = z.object({
  warehouseId: objectId("warehouseId").optional(),
  month: z.string().regex(/^\d{4}-\d{2}$/, "Month must be in YYYY-MM format.").optional(),
});
