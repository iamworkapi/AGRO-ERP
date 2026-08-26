import { z } from "zod";
import { ROLES } from "../../common/constants/roles.js";
import { strongPassword } from "../../auth/validators/auth.validator.js";
import { avatarUrl } from "../../common/validators/common.js";

export const listProfilesQuerySchema = z.object({
  role: z.enum([ROLES.SUPER_ADMIN, ROLES.WAREHOUSE_ADMIN, ROLES.SUPERVISOR]).optional(),
  status: z.enum(["pending", "active", "inactive"]).optional(),
});

export const updateProfileStatusSchema = z.object({
  status: z.enum(["active", "inactive"]),
});

export const updateOwnProfileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters.").optional(),
  email: z.string().email("Enter a valid email address.").optional().or(z.literal("")),
  phone: z.string().min(6, "Enter a valid phone number.").optional().or(z.literal("")),
  avatarUrl,
  address: z.string().optional().or(z.literal("")),
});

export const updateProfileByIdSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters.").optional(),
  email: z.string().email("Enter a valid email address.").optional().or(z.literal("")).or(z.null()),
  phone: z.string().min(6, "Enter a valid phone number.").optional().or(z.literal("")).or(z.null()),
  password: z.string().min(6, "Password must be at least 6 characters.").optional().or(z.literal("")).or(z.null()),
  avatarUrl,
  address: z.string().optional().or(z.literal("")).or(z.null()),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: strongPassword,
});

// Super Admin creating a Warehouse Admin/Supervisor directly (as opposed to
// self-registration) - same role restriction as registerSchema (Super Admin
// itself is never grantable through an API call), but the account starts
// active immediately since the Super Admin creating it *is* the approval.
export const createProfileSchema = z
  .object({
    fullName: z.string().min(2, "Full name is required."),
    email: z.string().email("Enter a valid email address.").optional().or(z.literal("")).or(z.null()),
    phone: z.string().min(6, "Enter a valid phone number.").optional().or(z.literal("")).or(z.null()),
    password: z.string().min(6, "Password must be at least 6 characters."),
    role: z.enum([ROLES.WAREHOUSE_ADMIN, ROLES.SUPERVISOR]),
    avatarUrl,
    address: z.string().optional().or(z.literal("")).or(z.null()),
    warehouseId: z.string().optional().or(z.literal("")).or(z.null()),
  })
  .refine((data) => (data.email && data.email.trim()) || (data.phone && data.phone.trim()), {
    message: "Either email or phone is required.",
    path: ["email"],
  });

