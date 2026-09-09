import { z } from "zod";
import { objectId, avatarUrl, phoneField, panField, ifscField } from "../../common/validators/common.js";

const email = z.string().email("Enter a valid email address.").optional().or(z.literal(""));
const dateOfJoining = z.string().date().optional().or(z.literal(""));
const positiveNumber = z.coerce.number().min(0, "Must be zero or positive.");

const payrollFields = z.object({
  salaryType: z.enum(["monthly", "daily", "piece_rate"]).optional(),
  basicSalary: positiveNumber.optional(),
  allowances: positiveNumber.optional(),
  deductions: positiveNumber.optional(),
  bankName: z.string().optional(),
  accountNo: z.string().optional(),
  ifscCode: ifscField,
  panNo: panField,
  pfAccountNo: z.string().optional(),
  esiNo: z.string().optional(),
  uan: z.string().optional(),
});

export const createEmployeeSchema = z.object({
  warehouseId: objectId("warehouseId"),
  fullName: z.string().min(2, "Employee name is required."),
  designation: z.string().min(2, "Designation is required."),
  phone: phoneField,
  email,
  avatarUrl,
  dateOfJoining,
  address: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: phoneField,
  ...payrollFields.shape,
});

export const updateEmployeeSchema = z.object({
  fullName: z.string().min(2).optional(),
  designation: z.string().min(2).optional(),
  phone: phoneField,
  email,
  avatarUrl,
  dateOfJoining,
  address: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: phoneField,
  employmentStatus: z.enum(["active", "on_leave", "inactive"]).optional(),
  ...payrollFields.shape,
});

export const listEmployeesQuerySchema = z.object({
  warehouseId: objectId("warehouseId").optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(500).optional(),
});
