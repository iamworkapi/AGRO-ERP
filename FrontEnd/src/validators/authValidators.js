import { z } from "zod";
import { phoneField } from "./formatValidators";

// Client-side mirror of backend/src/validators/auth.validator.js - catches
// obviously-invalid submissions before spending a round trip on them, but
// the backend remains the source of truth (it re-validates everything).
export const loginSchema = z.object({
  identifier: z.string().trim().min(3, "Enter your phone or email address."),
  password: z.string().min(1, "Password is required."),
});

export const strongPassword = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .regex(/[A-Za-z]/, "Password must include at least one letter.")
  .regex(/[0-9]/, "Password must include at least one number.");

export const registerSchema = z.object({
  role: z.enum(["Warehouse Admin", "Supervisor"], {
    errorMap: () => ({ message: "Select whether you're registering as a Warehouse Admin or Supervisor." }),
  }),
  fullName: z.string().trim().min(2, "Full name is required."),
  phone: phoneField,
  email: z.union([z.string().trim().email("Enter a valid email address."), z.literal("")]).optional(),
  password: strongPassword,
});

export const forgotPasswordSchema = z.object({
  identifier: z.string().trim().min(3, "Enter your phone or email address."),
});

export const resetPasswordSchema = z.object({
  identifier: z.string().trim().min(3, "Enter your phone or email address."),
  otp: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code."),
  newPassword: strongPassword,
});

