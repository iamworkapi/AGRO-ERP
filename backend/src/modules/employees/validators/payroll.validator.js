import { z } from "zod";
import { objectId } from "../../common/validators/common.js";

export const payrollSlipQuerySchema = z.object({
  employeeId: objectId("employeeId"),
  year: z.coerce.number().int().min(1).optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
});

export const listPayrollQuerySchema = z.object({
  warehouseId: objectId("warehouseId").optional(),
  year: z.coerce.number().int().min(1).optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(500).optional(),
});
