import { z } from "zod";

// Client-side mirror of backend/src/validators/stockEntry.validator.js.
export const createStockEntrySchema = z
  .object({
    warehouseId: z.string().min(1, "Select a warehouse."),
    weightMachineId: z.string().min(1, "Select a weight machine."),
    slipNo: z.string().trim().min(1, "Slip number is required."),
    entryType: z.enum(["inward", "outward"]),
    commodity: z.string().trim().min(1, "Commodity is required."),
    partyName: z.string().optional(),
    vehicleNo: z.string().optional(),
    grossWeightKg: z.coerce.number().min(0, "Gross weight is required."),
    tareWeightKg: z.coerce.number().min(0, "Tare weight is required."),
    moisturePct: z.coerce.number().min(0).max(100).optional(),
    allowedMoisturePct: z.coerce.number().min(0).max(100).optional(),
    deductionPct: z.coerce.number().min(0).max(100).optional(),
    ratePerMt: z.coerce.number().min(0).optional(),
  })
  .refine((data) => data.grossWeightKg >= data.tareWeightKg, {
    message: "Gross weight must be greater than or equal to tare weight.",
    path: ["grossWeightKg"],
  });
