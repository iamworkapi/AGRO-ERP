import { z } from "zod";
import { objectId, avatarUrl } from "../../common/validators/common.js";

const email = z.string().email("Enter a valid email address.").optional().or(z.literal(""));
const dateOfJoining = z.string().date().optional().or(z.literal(""));

export const createEmployeeSchema = z.object({
  warehouseId: objectId("warehouseId"),
  fullName: z.string().min(2, "Employee name is required."),
  designation: z.string().min(2, "Designation is required."),
  phone: z.string().optional(),
  email,
  avatarUrl,
  dateOfJoining,
  address: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
});

export const updateEmployeeSchema = z.object({
  fullName: z.string().min(2).optional(),
  designation: z.string().min(2).optional(),
  phone: z.string().optional(),
  email,
  avatarUrl,
  dateOfJoining,
  address: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  employmentStatus: z.enum(["active", "on_leave", "inactive"]).optional(),
});

export const listEmployeesQuerySchema = z.object({
  warehouseId: objectId("warehouseId").optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(500).optional(),
});
