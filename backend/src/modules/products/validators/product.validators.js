import { z } from "zod";
import { objectId, hsnField } from "../../common/validators/common.js";

export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required."),
  description: z.string().optional(),
  hsnCode: hsnField,
  category: z.string().optional(),
  unit: z.string().default("PCS"),
  defaultRate: z.coerce.number().min(0, "Rate cannot be negative."),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  image: z.string().optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  hsnCode: hsnField,
  category: z.string().optional(),
  unit: z.string().optional(),
  defaultRate: z.coerce.number().min(0).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  image: z.string().optional(),
});

export const listProductsQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});
