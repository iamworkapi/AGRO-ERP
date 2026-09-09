import { z } from "zod";
import { objectId, hsnField } from "../../common/validators/common.js";

export const createGoodsSchema = z.object({
  warehouseId: objectId("warehouseId"),
  supplier: z.string().min(1, "Supplier name is required."),
  supplierInvoiceNo: z.string().optional(),
  supplierInvoiceDate: z.string().optional(),
  ewayBillNo: z.string().optional(),
  supplierGstin: z.string().optional(),
  consignee: z.string().optional(),
  consigneeGstin: z.string().optional(),
  consigneeAddress: z.string().optional(),
  items: z.array(
    z.object({
      description: z.string().min(1, "Item description is required."),
      hsnCode: hsnField,
      quantity: z.coerce.number().positive("Quantity must be positive."),
      unit: z.string().default("PCS"),
      rate: z.coerce.number().min(0, "Rate cannot be negative."),
      discountPct: z.coerce.number().min(0).max(100).optional(),
    })
  ).min(1, "At least one item is required."),
  cgstPct: z.coerce.number().min(0).max(100).optional(),
  sgstPct: z.coerce.number().min(0).max(100).optional(),
  igstPct: z.coerce.number().min(0).max(100).optional(),
  amountInWords: z.string().optional(),
  notes: z.string().optional(),
});

export const updateGoodsStatusSchema = z.object({
  status: z.enum(["Purchased", "In Stock", "Dispatched", "Sold", "Cancelled"]),
});

export const listGoodsQuerySchema = z.object({
  warehouseId: objectId("warehouseId").optional(),
  status: z.string().optional(),
  supplierInvoiceNo: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});
