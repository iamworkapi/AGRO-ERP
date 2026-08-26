import { Router } from "express";
import * as weightMachineController from "../controllers/weightMachine.controller.js";
import { authenticate } from "../../common/middleware/authenticate.js";
import { authorize } from "../../common/middleware/authorize.js";
import { validate } from "../../common/middleware/validate.js";
import { createWeightMachineSchema, updateWeightMachineSchema, listWeightMachinesQuerySchema } from "../validators/weightMachine.validator.js";
import { ROLES } from "../../common/constants/roles.js";

const router = Router();

router.use(authenticate);

router.get("/", validate(listWeightMachinesQuerySchema, "query"), weightMachineController.list);
router.post("/", authorize(ROLES.SUPERVISOR, ROLES.WAREHOUSE_ADMIN, ROLES.SUPER_ADMIN), validate(createWeightMachineSchema), weightMachineController.create);
router.patch("/:id", authorize(ROLES.SUPERVISOR, ROLES.WAREHOUSE_ADMIN, ROLES.SUPER_ADMIN), validate(updateWeightMachineSchema), weightMachineController.update);
router.delete("/:id", authorize(ROLES.SUPERVISOR, ROLES.WAREHOUSE_ADMIN, ROLES.SUPER_ADMIN), weightMachineController.remove);

export default router;
