import { z } from "zod";
import { objectId } from "./common.js";

export const createItemSchema = z.object({
  warehouseId: objectId("warehouseId"),
  name: z.string().min(2, "Item name is required."),
  category: z.string().min(2, "Category is required."),
  unit: z.string().min(1, "Unit of measure is required."),
  stockQty: z.coerce.number().min(0).optional(),
  reorderLevel: z.coerce.number().min(0),
});

export const updateItemSchema = z.object({
  name: z.string().min(2).optional(),
  category: z.string().min(2).optional(),
  unit: z.string().min(1).optional(),
  stockQty: z.coerce.number().min(0).optional(),
  reorderLevel: z.coerce.number().min(0).optional(),
});

export const listItemsQuerySchema = z.object({
  warehouseId: objectId("warehouseId").optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(500).optional(),
});
