import { z } from "zod";
import { objectId } from "../../common/validators/common.js";

export const createPurchaseOrderSchema = z.object({
  warehouseId: objectId("warehouseId"),
  vendor: z.string().min(1, "Vendor name is required."),
  vendorId: objectId("vendorId").optional(),
  item: z.string().min(1, "Item name is required."),
  itemId: objectId("itemId").optional(),
  quantity: z.coerce.number().positive("Quantity must be positive."),
  unitPrice: z.coerce.number().min(0, "Unit price cannot be negative."),
  expectedDelivery: z.string().optional(),
  notes: z.string().optional(),
});

export const updatePurchaseOrderStatusSchema = z.object({
  status: z.enum(["Pending", "Approved", "Received", "Cancelled"]),
});

export const listPurchaseOrdersQuerySchema = z.object({
  warehouseId: objectId("warehouseId").optional(),
  status: z.string().optional(),
  vendorId: objectId("vendorId").optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});
