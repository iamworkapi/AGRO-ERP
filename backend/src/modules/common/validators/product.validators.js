import { z } from "zod";

export const objectId = (label = "id") => z.string().regex(/^[0-9a-fA-F]{24}$/, `Invalid ${label}.`);

export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  hsnCode: z.string().optional(),
  category: z.string().optional(),
  unit: z.string().optional(),
  defaultRate: z.coerce.number().min(0).optional(),
  image: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  hsnCode: z.string().optional(),
  category: z.string().optional(),
  unit: z.string().optional(),
  defaultRate: z.coerce.number().min(0).optional(),
  image: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});
