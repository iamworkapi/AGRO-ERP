import { z } from "zod";
import { requiredPhoneField, gstinField, panField, ifscField } from "../../common/validators/common.js";

export const createBiomassVendorSchema = z.object({
  companyName: z.string().min(1, "Company name is required."),
  gstin: gstinField,
  panNo: panField,
  representative: z.string().optional(),
  contactNo: requiredPhoneField,
  email: z.string().email("Invalid email.").optional().or(z.literal("")),
  address: z.string().optional(),
  sourcingArea: z.string().optional(),
  poNo: z.string().optional(),
  poDate: z.string().optional(),
  tenure: z.string().optional(),
  contractedQtyMt: z.coerce.number().positive().optional(),
  agreedPricePerMt: z.coerce.number().min(0).optional(),
  bankName: z.string().optional(),
  accountNo: z.string().optional(),
  ifscCode: ifscField,
  warehouse: z.string().optional(),
  warehouseId: z.string().optional(),
});

export const updateBiomassVendorSchema = createBiomassVendorSchema.partial();

export const listBiomassVendorsQuerySchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  warehouseId: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});
