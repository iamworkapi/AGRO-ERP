import { z } from "zod";
import { requiredGstinField, phoneField } from "../../common/validators/common.js";

export const createBiomassBuyerSchema = z.object({
  name: z.string().min(1, "Buyer name is required."),
  division: z.string().optional(),
  address: z.string().min(1, "Address is required."),
  gstin: requiredGstinField,
  plantType: z.string().optional(),
  agreedRatePerMt: z.coerce.number().min(0).optional(),
  targetQtyMt: z.coerce.number().positive().optional(),
  contactPerson: z.string().optional(),
  contactMobile: phoneField,
  email: z.string().email("Invalid email.").optional().or(z.literal("")),
  poNo: z.string().optional(),
  paymentTerms: z.string().optional(),
});

export const updateBiomassBuyerSchema = createBiomassBuyerSchema.partial();

export const listBiomassBuyersQuerySchema = z.object({
  search: z.string().optional(),
  plantType: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});
