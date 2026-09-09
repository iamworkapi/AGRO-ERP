import { z } from "zod";
import { phoneField, panField, ifscField, gstinField } from "./formatValidators";

// Client-side mirror of backend/src/validators/employee.validator.js.
export const createEmployeeSchema = z.object({
  warehouseId: z.string().min(1, "Select a warehouse."),
  fullName: z.string().trim().min(2, "Employee name is required."),
  designation: z.string().trim().min(2, "Designation is required."),
  phone: phoneField,
  email: z.union([z.string().trim().email("Enter a valid email address."), z.literal("")]).optional(),
  avatarUrl: z.string().optional(),
  dateOfJoining: z.string().optional(),
  address: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: phoneField,
  salaryType: z.enum(["monthly", "daily", "piece_rate"]).optional(),
  basicSalary: z.coerce.number().min(0).optional(),
  allowances: z.coerce.number().min(0).optional(),
  deductions: z.coerce.number().min(0).optional(),
  bankName: z.string().optional(),
  accountNo: z.string().optional(),
  ifscCode: ifscField,
  panNo: panField,
  pfAccountNo: z.string().optional(),
  esiNo: z.string().optional(),
  uan: z.string().optional(),
});

// Warehouse can't be changed via update - the backend only accepts these
// fields (see backend/src/validators/employee.validator.js updateEmployeeSchema).
export const updateEmployeeSchema = z.object({
  fullName: z.string().trim().min(2, "Employee name is required."),
  designation: z.string().trim().min(2, "Designation is required."),
  phone: phoneField,
  email: z.union([z.string().trim().email("Enter a valid email address."), z.literal("")]).optional(),
  avatarUrl: z.string().optional(),
  dateOfJoining: z.string().optional(),
  address: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: phoneField,
  employmentStatus: z.enum(["active", "on_leave", "inactive"]).optional(),
  salaryType: z.enum(["monthly", "daily", "piece_rate"]).optional(),
  basicSalary: z.coerce.number().min(0).optional(),
  allowances: z.coerce.number().min(0).optional(),
  deductions: z.coerce.number().min(0).optional(),
  bankName: z.string().optional(),
  accountNo: z.string().optional(),
  ifscCode: ifscField,
  panNo: panField,
  pfAccountNo: z.string().optional(),
  esiNo: z.string().optional(),
  uan: z.string().optional(),
});
