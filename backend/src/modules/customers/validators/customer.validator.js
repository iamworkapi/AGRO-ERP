import { z } from "zod";
import { objectId, phoneField, gstinField } from "../../common/validators/common.js";

export const createCustomerSchema = z.object({
  name: z.string().min(1, "Customer name is required."),
  buyerId: objectId("buyerId").optional(),
  contactPerson: z.string().optional(),
  phone: phoneField,
  email: z.string().email("Invalid email.").optional().or(z.literal("")),
  address: z.string().optional(),
  gstin: gstinField,
  creditLimit: z.coerce.number().min(0).optional(),
  warehouseId: objectId("warehouseId"),
});

export const updateCustomerSchema = z.object({
  name: z.string().min(1).optional(),
  buyerId: objectId("buyerId").optional().or(z.literal("").transform(() => undefined)),
  contactPerson: z.string().optional(),
  phone: phoneField,
  email: z.string().email("Invalid email.").optional().or(z.literal("")),
  address: z.string().optional(),
  gstin: gstinField,
  creditLimit: z.coerce.number().min(0).optional(),
  status: z.enum(["Active", "Inactive"]).optional(),
});

export const listCustomersQuerySchema = z.object({
  warehouseId: objectId("warehouseId").optional(),
  search: z.string().optional(),
  status: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});
