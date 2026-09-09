import { z } from "zod";

// Client-side mirror of backend/src/modules/inventory/validators/item.validator.js.
export const createItemSchema = z.object({
  warehouseId: z.string().min(1, "Select a warehouse."),
  name: z.string().trim().min(2, "Item name is required."),
  category: z.string().trim().min(2, "Category is required."),
  unit: z.string().trim().min(1, "Unit of measure is required."),
  stock: z.coerce.number().min(0).optional(),
  reorder: z.coerce.number().min(0, "Reorder level is required."),
});

export const updateItemSchema = z.object({
  name: z.string().trim().min(2).optional(),
  category: z.string().trim().min(2).optional(),
  unit: z.string().trim().min(1).optional(),
  stock: z.coerce.number().min(0).optional(),
  reorder: z.coerce.number().min(0).optional(),
});
