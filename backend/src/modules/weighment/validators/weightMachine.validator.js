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
  lastCalibratedOn: z.string().date().optional(),
  nextCalibrationDue: z.string().date().optional(),
  status: z.enum(["active", "maintenance", "inactive"]).optional(),
});

export const listWeightMachinesQuerySchema = z.object({
  warehouseId: objectId("warehouseId").optional(),
});
