import { z } from "zod";
import { objectId } from "../../common/validators/common.js";

export const createLeaveRequestSchema = z.object({
  warehouseId: objectId("warehouseId"),
  employeeId: objectId("employeeId"),
  leaveType: z.enum(["casual", "sick", "earned", "maternity", "paternity", "unpaid", "other"]).optional(),
  fromDate: z.string().date("Enter a valid from date."),
  toDate: z.string().date("Enter a valid to date."),
  reason: z.string().trim().optional().or(z.literal("")),
});

export const listLeaveRequestsQuerySchema = z.object({
  warehouseId: objectId("warehouseId").optional(),
  employeeId: objectId("employeeId").optional(),
  status: z.enum(["pending", "approved", "rejected", "cancelled"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(500).optional(),
});

export const reviewLeaveRequestSchema = z.object({
  decision: z.enum(["approved", "rejected"]),
});
