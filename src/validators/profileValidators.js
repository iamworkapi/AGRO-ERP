import { z } from "zod";
import { strongPassword } from "./authValidators";

// Client-side mirror of backend/src/validators/profile.validator.js's
// createProfileSchema.
export const createUserSchema = z
  .object({
    role: z.enum(["Warehouse Admin", "Supervisor"], {
      errorMap: () => ({ message: "Select a role for this user." }),
    }),
    fullName: z.string().trim().min(2, "Full name is required."),
    phone: z.string().trim().optional(),
    email: z.union([z.string().trim().email("Enter a valid email address."), z.literal("")]).optional(),
    password: strongPassword,
    avatarUrl: z.string().optional(),
  })
  .refine((data) => data.email || data.phone, {
    message: "Either email or phone is required.",
    path: ["email"],
  });
