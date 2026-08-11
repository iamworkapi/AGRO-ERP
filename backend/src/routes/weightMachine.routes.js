import { Router } from "express";
import * as weightMachineController from "../controllers/weightMachine.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { createWeightMachineSchema, updateWeightMachineSchema, listWeightMachinesQuerySchema } from "../validators/weightMachine.validator.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

router.use(authenticate);

router.get("/", validate(listWeightMachinesQuerySchema, "query"), weightMachineController.list);
// Provisioning a machine is an admin/super-admin decision (capital asset);
// supervisors maintain it day-to-day via PATCH (calibration, status).
router.post("/", authorize(ROLES.WAREHOUSE_ADMIN, ROLES.SUPER_ADMIN), validate(createWeightMachineSchema), weightMachineController.create);
router.patch("/:id", authorize(ROLES.SUPERVISOR, ROLES.WAREHOUSE_ADMIN, ROLES.SUPER_ADMIN), validate(updateWeightMachineSchema), weightMachineController.update);

export default router;
