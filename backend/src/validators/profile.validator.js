import { z } from "zod";
import { ROLES } from "../constants/roles.js";
import { strongPassword } from "./auth.validator.js";
import { avatarUrl } from "./common.js";

export const listProfilesQuerySchema = z.object({
  role: z.enum([ROLES.SUPER_ADMIN, ROLES.WAREHOUSE_ADMIN, ROLES.SUPERVISOR]).optional(),
  status: z.enum(["pending", "active", "inactive"]).optional(),
});

export const updateProfileStatusSchema = z.object({
  status: z.enum(["active", "inactive"]),
});

// Super Admin creating a Warehouse Admin/Supervisor directly (as opposed to
// self-registration) - same role restriction as registerSchema (Super Admin
// itself is never grantable through an API call), but the account starts
// active immediately since the Super Admin creating it *is* the approval.
export const createProfileSchema = z
  .object({
    fullName: z.string().min(2, "Full name is required."),
    email: z.string().email("Enter a valid email address.").optional(),
    phone: z.string().min(8, "Enter a valid phone number.").optional(),
    password: strongPassword,
    role: z.enum([ROLES.WAREHOUSE_ADMIN, ROLES.SUPERVISOR]),
    avatarUrl,
  })
  .refine((data) => data.email || data.phone, {
    message: "Either email or phone is required.",
    path: ["email"],
  });
