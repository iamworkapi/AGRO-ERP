import { z } from "zod";

// Client-side mirror of backend/src/validators/attendance.validator.js.
export const createAttendanceSchema = z.object({
  warehouseId: z.string().min(1, "Select a warehouse."),
  employeeId: z.string().min(1, "Select an employee."),
  date: z.string().min(1, "Select a date."),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
  reason: z.string().optional(),
});
