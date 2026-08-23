import { z } from "zod";
import { objectId } from "../../common/validators/common.js";

export const createGodownSchema = z.object({
  warehouseId: objectId("warehouseId"),
  name: z.string().min(2, "Godown name is required."),
  capacityMt: z.coerce.number().min(0.1, "Capacity must be at least 0.1 MT."),
  areaSqFt: z.coerce.number().min(0).optional(),
  godownType: z.enum(["covered", "open", "shed"]).optional(),
  notes: z.string().optional(),
});

export const updateGodownSchema = z.object({
  name: z.string().min(2).optional(),
  capacityMt: z.coerce.number().min(0.1).optional(),
  currentStockMt: z.coerce.number().min(0).optional(),
  areaSqFt: z.coerce.number().min(0).optional(),
  godownType: z.enum(["covered", "open", "shed"]).optional(),
  status: z.enum(["active", "full", "maintenance"]).optional(),
  notes: z.string().optional(),
});

export const listGodownsQuerySchema = z.object({
  warehouseId: objectId("warehouseId").optional(),
});
