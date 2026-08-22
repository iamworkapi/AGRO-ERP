import { z } from "zod";
import { ROLES } from "../../common/constants/roles.js";

export const loginSchema = z.object({
  identifier: z.string().min(3, "Email or phone is required."),
  password: z.string().min(1, "Password is required."),
});

// Applies only at registration - login just checks the password on file
// matches, complexity is enforced once, at the point a password is chosen.
// Exported for reuse anywhere else a new password gets set (reset-password,
// Super Admin creating a profile directly).
export const strongPassword = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .regex(/[A-Za-z]/, "Password must include at least one letter.")
  .regex(/[0-9]/, "Password must include at least one number.");

// Self-registration is only for Warehouse Admins and Supervisors - the
// Super Admin is provisioned separately (see scripts/createSuperAdmin.js) so
// that role can never be granted through a public-facing form.
export const registerSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  email: z.string().email().optional(),
  phone: z.string().min(8).optional(),
  password: strongPassword,
  role: z.enum([ROLES.WAREHOUSE_ADMIN, ROLES.SUPERVISOR]),
}).refine((data) => data.email || data.phone, {
  message: "Either email or phone is required.",
  path: ["email"],
});

export const forgotPasswordSchema = z.object({
  identifier: z.string().min(3, "Enter your phone or email address."),
});

export const resetPasswordSchema = z.object({
  identifier: z.string().min(3, "Enter your phone or email address."),
  otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code."),
  newPassword: strongPassword,
});
