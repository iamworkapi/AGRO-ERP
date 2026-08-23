import { z } from "zod";
import { objectId } from "../../common/validators/common.js";

export const createStockMovementSchema = z.object({
  warehouseId: objectId("warehouseId"),
  godownId: objectId("godownId"),
  itemId: objectId("itemId"),
  movementType: z.enum(["inward", "outward", "transfer", "adjustment"]),
  quantity: z.coerce.number().positive("Quantity must be greater than zero."),
  unit: z.string().min(1).optional(),
  toGodownId: objectId("toGodownId").optional(),
  reason: z.string().optional(),
  referenceNo: z.string().optional(),
  adjustToQty: z.coerce.number().min(0).optional(),
}).refine((data) => {
  if (data.movementType === "transfer" && !data.toGodownId) return false;
  return true;
}, { message: "toGodownId is required for transfers.", path: ["toGodownId"] });

export const listStockMovementsQuerySchema = z.object({
  warehouseId: objectId("warehouseId").optional(),
  godownId: objectId("godownId").optional(),
  itemId: objectId("itemId").optional(),
  movementType: z.enum(["inward", "outward", "transfer", "adjustment"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(500).optional(),
});
