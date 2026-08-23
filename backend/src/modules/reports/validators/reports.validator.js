import { z } from "zod";
import { objectId } from "../../common/validators/common.js";

export const reportsQuerySchema = z.object({
  warehouseId: objectId("warehouseId").optional(),
  from: z.string().date().optional(),
  to: z.string().date().optional(),
  groupBy: z.enum(["day", "month"]).optional(),
  month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(500).optional(),
});
