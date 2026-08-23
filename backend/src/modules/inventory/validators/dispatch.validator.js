import { z } from "zod";
import { objectId } from "../../common/validators/common.js";

export const createDispatchSchema = z.object({
  warehouseId: objectId("warehouseId"),
  buyerId: z.string().optional(),
  buyerName: z.string().min(1, "Buyer name is required."),
  vehicleNo: z.string().min(1, "Vehicle number is required."),
  driverName: z.string().optional(),
  driverMobile: z.string().optional(),
  dispatchedTonnageMt: z.coerce.number().min(0.01, "Tonnage is required."),
  baleCount: z.coerce.number().min(0).optional(),
  ratePerMt: z.coerce.number().min(0, "Rate per MT is required."),
  poNo: z.string().optional(),
  poDate: z.string().optional(),
  ewayBillNo: z.string().optional(),
  lrNo: z.string().optional(),
  status: z.enum(["pending", "in_transit", "delivered", "cancelled"]).optional(),
  remarks: z.string().optional(),
});

export const listDispatchesQuerySchema = z.object({
  warehouseId: objectId("warehouseId").optional(),
  buyerId: z.string().optional(),
  status: z.enum(["pending", "in_transit", "delivered", "cancelled"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(500).optional(),
});
