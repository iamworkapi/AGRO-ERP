import { z } from "zod";
import { objectId } from "./common.js";

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
}).refine((data) => data.grossWeightKg >= data.tareWeightKg, {
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
