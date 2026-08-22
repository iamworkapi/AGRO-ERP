import { z } from "zod";
import { objectId } from "../../common/validators/common.js";

export const listAuditLogsQuerySchema = z.object({
  warehouseId: objectId("warehouseId").optional(),
  actorId: objectId("actorId").optional(),
  limit: z.coerce.number().int().min(1).max(500).optional(),
});
