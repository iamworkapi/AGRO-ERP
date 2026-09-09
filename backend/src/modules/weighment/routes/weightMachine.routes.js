import { Router } from "express";
import * as ctrl from "../controllers/weightMachine.controller.js";
import { authenticate } from "../../common/middleware/authenticate.js";
import { authorize } from "../../common/middleware/authorize.js";
import { validate } from "../../common/middleware/validate.js";
import { createWeightMachineSchema, updateWeightMachineSchema, updateCalibrationSchema, listWeightMachinesQuerySchema } from "../validators/weightMachine.validator.js";
import { ROLES } from "../../common/constants/roles.js";

const router = Router();

router.use(authenticate);

router.get("/", validate(listWeightMachinesQuerySchema, "query"), ctrl.list);
router.post("/", authorize(ROLES.SUPERVISOR, ROLES.WAREHOUSE_ADMIN, ROLES.SUPER_ADMIN), validate(createWeightMachineSchema), ctrl.create);
router.patch("/:id", authorize(ROLES.SUPERVISOR, ROLES.WAREHOUSE_ADMIN, ROLES.SUPER_ADMIN), validate(updateWeightMachineSchema), ctrl.update);
router.patch("/:id/calibration", authorize(ROLES.SUPER_ADMIN), validate(updateCalibrationSchema), ctrl.updateCalibration);
router.delete("/:id", authorize(ROLES.SUPERVISOR, ROLES.WAREHOUSE_ADMIN, ROLES.SUPER_ADMIN), ctrl.remove);

export default router;
