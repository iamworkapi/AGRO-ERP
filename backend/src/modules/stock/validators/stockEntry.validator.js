import { z } from "zod";
import { objectId } from "../../common/validators/common.js";

export const createStockEntrySchema = z.object({
  warehouseId: objectId("warehouseId"),
  weightMachineId: objectId("weightMachineId"),
  slipNo: z.string().min(1, "Slip number is required."),
  entryType: z.enum(["inward", "outward"]),
  commodity: z.string().min(1, "Commodity is required."),
  partyName: z.string().optional(),
  vehicleNo: z.string().optional(),
  grossWeightKg: z.coerce.number().min(0),
  tareWeightKg: z.coerce.number().min(0),
  moisturePct: z.coerce.number().min(0).max(100).optional(),
  allowedMoisturePct: z.coerce.number().min(0).max(100).optional(),
  deductionPct: z.coerce.number().min(0).max(100).optional(),
  ratePerMt: z.coerce.number().min(0).optional(),
  purchasedProducts: z
    .array(
      z.object({
        productId: z.string().optional(),
        productName: z.string().min(1, "Product name is required"),
        unit: z.string().optional(),
        quantity: z.coerce.number().min(0),
        rate: z.coerce.number().min(0),
        amount: z.coerce.number().min(0),
      })
    )
    .optional(),
}).refine((data) => data.grossWeightKg >= data.tareWeightKg, {
  message: "Gross weight must be greater than or equal to tare weight.",
  path: ["grossWeightKg"],
});

export const updateStockEntrySchema = z.object({
  slipNo: z.string().min(1, "Slip number is required.").optional(),
  entryType: z.enum(["inward", "outward"]).optional(),
  commodity: z.string().min(1, "Commodity is required.").optional(),
  partyName: z.string().optional(),
  vehicleNo: z.string().optional(),
  grossWeightKg: z.coerce.number().min(0).optional(),
  tareWeightKg: z.coerce.number().min(0).optional(),
  moisturePct: z.coerce.number().min(0).max(100).optional(),
  allowedMoisturePct: z.coerce.number().min(0).max(100).optional(),
  deductionPct: z.coerce.number().min(0).max(100).optional(),
  ratePerMt: z.coerce.number().min(0).optional(),
  purchasedProducts: z
    .array(
      z.object({
        productId: z.string().optional(),
        productName: z.string().min(1, "Product name is required"),
        unit: z.string().optional(),
        quantity: z.coerce.number().min(0),
        rate: z.coerce.number().min(0),
        amount: z.coerce.number().min(0),
      })
    )
    .optional(),
}).refine((data) => {
  if (data.grossWeightKg != null && data.tareWeightKg != null) {
    return data.grossWeightKg >= data.tareWeightKg;
  }
  return true;
}, {
  message: "Gross weight must be greater than or equal to tare weight.",
  path: ["grossWeightKg"],
});

export const reviewStockEntrySchema = z.object({
  status: z.enum(["approved", "rejected"]),
});

export const listStockEntriesQuerySchema = z.object({
  warehouseId: objectId("warehouseId").optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(500).optional(),
});
