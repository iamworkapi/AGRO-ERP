import { z } from "zod";
import { phoneField, panField, gstinField } from "./formatValidators";

// Client-side mirror of backend/src/validators/warehouse.validator.js
export const createWarehouseSchema = z.object({
  name: z.string().trim().min(2, "Warehouse name is required."),
  commodity: z.string().min(1, "Select a commodity."),
  adminId: z.string().min(1, "Select a Warehouse Admin."),
  supervisorId: z.string().min(1, "Select a Warehouse Supervisor."),
  address: z.string().optional(),
  contactPhone: phoneField,
  helpDeskPhone: phoneField,
  gstin: gstinField,
  pan: panField,
});

export const editWarehouseSchema = z.object({
  name: z.string().trim().min(2, "Warehouse name is required."),
  companyName: z.string().optional(),
  commodity: z.string().optional(),
  address: z.string().optional(),
  gstin: gstinField,
  pan: panField,
  contactPerson: z.string().optional(),
  contactPhone: phoneField,
  email: z.union([z.string().trim().email("Enter a valid email address."), z.literal("")]).optional(),
  helpDeskPhone: phoneField,
  status: z.string().optional(),
});

