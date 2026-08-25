import { z } from "zod";

// Client-side mirror of backend/src/validators/item.validator.js.
export const createItemSchema = z.object({
  warehouseId: z.string().min(1, "Select a warehouse."),
  name: z.string().trim().min(2, "Item name is required."),
  category: z.string().trim().min(2, "Category is required."),
  unit: z.string().trim().min(1, "Unit of measure is required."),
  stock: z.coerce.number().min(0).optional(),
  reorder: z.coerce.number().min(0, "Reorder level is required."),
});
