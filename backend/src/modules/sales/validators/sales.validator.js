import { z } from "zod";
import { objectId } from "../../common/validators/common.js";

export const createSalesInvoiceSchema = z.object({
  warehouseId: objectId("warehouseId"),
  customer: z.string().min(1, "Customer name is required."),
  customerId: objectId("customerId").optional(),
  item: z.string().min(1, "Item name is required."),
  itemId: objectId("itemId").optional(),
  quantity: z.coerce.number().positive("Quantity must be positive."),
  unitPrice: z.coerce.number().min(0, "Unit price cannot be negative."),
  notes: z.string().optional(),
});

export const updateSalesInvoiceStatusSchema = z.object({
  status: z.enum(["Pending", "Dispatched", "Delivered", "Cancelled"]),
});

export const listSalesInvoicesQuerySchema = z.object({
  warehouseId: objectId("warehouseId").optional(),
  status: z.string().optional(),
  buyerId: objectId("buyerId").optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});
