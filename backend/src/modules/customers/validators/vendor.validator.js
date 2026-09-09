import { z } from "zod";
import { objectId, phoneField, gstinField } from "../../common/validators/common.js";

export const createVendorSchema = z.object({
  name: z.string().min(1, "Vendor name is required."),
  vendorCode: z.string().optional(),
  vendorId: objectId("vendorId").optional(),
  contactPerson: z.string().optional(),
  phone: phoneField,
  email: z.string().email("Invalid email.").optional().or(z.literal("")),
  address: z.string().optional(),
  gstin: gstinField,
  category: z.string().optional(),
  creditLimit: z.coerce.number().min(0).optional(),
  warehouseId: objectId("warehouseId"),
});

export const updateVendorSchema = z.object({
  name: z.string().min(1).optional(),
  vendorCode: z.string().optional(),
  vendorId: objectId("vendorId").optional().or(z.literal("").transform(() => undefined)),
  contactPerson: z.string().optional(),
  phone: phoneField,
  email: z.string().email("Invalid email.").optional().or(z.literal("")),
  address: z.string().optional(),
  gstin: gstinField,
  category: z.string().optional(),
  creditLimit: z.coerce.number().min(0).optional(),
  status: z.enum(["Active", "Inactive"]).optional(),
});

export const listVendorsQuerySchema = z.object({
  warehouseId: objectId("warehouseId").optional(),
  search: z.string().optional(),
  status: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});
