import { z } from "zod";
import { objectId } from "../../common/validators/common.js";

const optionalPositiveNumber = z.preprocess(
  (val) => (val === "" || val === null || val === undefined ? undefined : val),
  z.coerce.number().positive().optional()
);

export const createWeightMachineSchema = z.object({
  warehouseId: objectId("warehouseId").optional(),
  machineCode: z.string().min(2, "Machine code is required."),
  make: z.string().optional(),
  model: z.string().optional(),
  capacityKg: optionalPositiveNumber,
  installedOn: z.string().date().optional(),
});

export const updateWeightMachineSchema = z.object({
  make: z.string().optional(),
  model: z.string().optional(),
  capacityKg: optionalPositiveNumber,
  status: z.enum(["active", "maintenance", "inactive"]).optional(),
});

// Calibration fields: separate schema, restricted to SUPER_ADMIN only
export const updateCalibrationSchema = z.object({
  lastCalibratedOn: z.string().date().optional(),
  nextCalibrationDue: z.string().date().optional(),
}).refine(
  (data) => data.lastCalibratedOn || data.nextCalibrationDue,
  { message: "At least one calibration field is required." }
);

export const listWeightMachinesQuerySchema = z.object({
  warehouseId: objectId("warehouseId").optional(),
});
