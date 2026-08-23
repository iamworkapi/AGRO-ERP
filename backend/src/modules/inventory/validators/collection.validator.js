import { z } from "zod";
import { objectId } from "../../common/validators/common.js";

export const createCollectionSchema = z.object({
  warehouseId: objectId("warehouseId"),
  vendorId: z.string().optional(),
  vendorName: z.string().optional(),
  cropId: z.string().min(1, "Crop is required."),
  cropName: z.string().min(1, "Crop name is required."),
  villageName: z.string().min(1, "Village name is required."),
  farmerName: z.string().min(1, "Farmer/aggregator name is required."),
  farmerMobile: z.string().optional(),
  vehicleNo: z.string().min(1, "Vehicle number is required."),
  vehicleType: z.string().optional(),
  grossWeightMt: z.coerce.number().min(0.01, "Gross weight is required."),
  tareWeightMt: z.coerce.number().min(0),
  actualMoisturePct: z.coerce.number().min(0).max(100),
  actualAshPct: z.coerce.number().min(0).max(100),
  agreedMoisturePct: z.coerce.number().min(0).max(100).optional(),
  agreedAshPct: z.coerce.number().min(0).max(100).optional(),
  baleCountProduced: z.coerce.number().min(0).optional(),
  balerMachine: z.string().optional(),
  ratePerMt: z.coerce.number().min(0).optional(),
});

export const listCollectionsQuerySchema = z.object({
  warehouseId: objectId("warehouseId").optional(),
  cropId: z.string().optional(),
  vendorId: z.string().optional(),
  isRejected: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(500).optional(),
});
