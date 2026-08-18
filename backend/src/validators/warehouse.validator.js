import { z } from "zod";
import { objectId } from "./common.js";

const profileId = objectId("profile id");

export const createWarehouseSchema = z.object({
  name: z.string().min(2, "Warehouse name is required."),
  companyName: z.string().optional(),
  commodity: z.string().min(2, "Commodity is required."),
  address: z.string().optional(),
  gstin: z.string().optional(),
  pan: z.string().optional(),
  contactPerson: z.string().optional(),
  contactPhone: z.string().optional(),
  email: z.string().optional(),
  helpDeskPhone: z.string().optional(),
  gpsLat: z.coerce.number().min(-90).max(90).optional(),
  gpsLng: z.coerce.number().min(-180).max(180).optional(),
  adminId: profileId.optional().or(z.literal("")),
  supervisorId: profileId.optional().or(z.literal("")),
  newAdmin: z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().optional(),
    password: z.string().min(6).optional(),
  }).optional(),
  newSupervisor: z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().optional(),
    password: z.string().min(6).optional(),
  }).optional(),
});

export const updateWarehouseSchema = z.object({
  name: z.string().min(2).optional(),
  companyName: z.string().optional(),
  commodity: z.string().min(2).optional(),
  address: z.string().optional(),
  gstin: z.string().optional(),
  pan: z.string().optional(),
  contactPerson: z.string().optional(),
  contactPhone: z.string().optional(),
  email: z.string().optional(),
  helpDeskPhone: z.string().optional(),
  gpsLat: z.coerce.number().min(-90).max(90).optional(),
  gpsLng: z.coerce.number().min(-180).max(180).optional(),
  adminId: profileId.optional().or(z.literal("")).or(z.null()),
  supervisorId: profileId.optional().or(z.literal("")).or(z.null()),
  status: z.enum(["active", "inactive", "attention"]).optional(),
});
