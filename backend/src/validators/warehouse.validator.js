import { z } from "zod";
import { objectId } from "./common.js";

const profileId = objectId("profile id");

export const createWarehouseSchema = z.object({
  name: z.string().min(2, "Warehouse name is required."),
  commodity: z.string().min(2, "Commodity is required."),
  address: z.string().optional(),
  gpsLat: z.coerce.number().min(-90).max(90).optional(),
  gpsLng: z.coerce.number().min(-180).max(180).optional(),
  adminId: profileId,
  supervisorId: profileId,
});

export const updateWarehouseSchema = z.object({
  name: z.string().min(2).optional(),
  commodity: z.string().min(2).optional(),
  address: z.string().optional(),
  gpsLat: z.coerce.number().min(-90).max(90).optional(),
  gpsLng: z.coerce.number().min(-180).max(180).optional(),
  adminId: profileId.optional(),
  supervisorId: profileId.optional(),
  status: z.enum(["active", "inactive", "attention"]).optional(),
});
