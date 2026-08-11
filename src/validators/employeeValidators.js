import { z } from "zod";

// Client-side mirror of backend/src/validators/employee.validator.js.
export const createEmployeeSchema = z.object({
  warehouseId: z.string().min(1, "Select a warehouse."),
  fullName: z.string().trim().min(2, "Employee name is required."),
  designation: z.string().trim().min(2, "Designation is required."),
  phone: z.string().optional(),
  email: z.union([z.string().trim().email("Enter a valid email address."), z.literal("")]).optional(),
  avatarUrl: z.string().optional(),
  dateOfJoining: z.string().optional(),
  address: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
});

// Warehouse can't be changed via update - the backend only accepts these
// fields (see backend/src/validators/employee.validator.js updateEmployeeSchema).
export const updateEmployeeSchema = z.object({
  fullName: z.string().trim().min(2, "Employee name is required."),
  designation: z.string().trim().min(2, "Designation is required."),
  phone: z.string().optional(),
  email: z.union([z.string().trim().email("Enter a valid email address."), z.literal("")]).optional(),
  avatarUrl: z.string().optional(),
  dateOfJoining: z.string().optional(),
  address: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  employmentStatus: z.enum(["active", "on_leave", "inactive"]).optional(),
});
