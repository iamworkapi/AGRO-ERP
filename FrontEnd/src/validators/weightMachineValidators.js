import { z } from "zod";

// An empty number input arrives here as "" (not undefined) - z.coerce.number()
// would turn that into 0, which then fails .positive(). Treat "" as "not
// provided" before coercion so leaving the field blank passes validation.
const optionalPositiveNumber = z.preprocess(
  (val) => (val === "" || val === null || val === undefined ? undefined : val),
  z.coerce.number().positive().optional()
);

// Client-side mirror of backend/src/validators/weightMachine.validator.js.
export const createWeightMachineSchema = z.object({
  warehouseId: z.string().optional(),
  machineCode: z.string().trim().min(2, "Machine code is required."),
  make: z.string().optional(),
  model: z.string().optional(),
  capacityKg: optionalPositiveNumber,
  installedOn: z.string().optional(),
});
