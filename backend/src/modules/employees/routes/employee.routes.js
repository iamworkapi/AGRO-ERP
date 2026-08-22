import { Router } from "express";
import * as employeeController from "../controllers/employee.controller.js";
import { authenticate } from "../../common/middleware/authenticate.js";
import { authorize } from "../../common/middleware/authorize.js";
import { validate } from "../../common/middleware/validate.js";
import { createEmployeeSchema, updateEmployeeSchema, listEmployeesQuerySchema } from "../validators/employee.validator.js";
import { ROLES } from "../../common/constants/roles.js";

const router = Router();

router.use(authenticate);

// Super Admin can read (monitor) everywhere; a Warehouse Admin or
// Supervisor manages the roster for their own warehouse (scoped in
// employee.service.js's assertCanAccessWarehouse, not just here).
router.get("/", validate(listEmployeesQuerySchema, "query"), employeeController.list);
router.post("/", authorize(ROLES.WAREHOUSE_ADMIN, ROLES.SUPERVISOR, ROLES.SUPER_ADMIN), validate(createEmployeeSchema), employeeController.create);
router.patch("/:id", authorize(ROLES.WAREHOUSE_ADMIN, ROLES.SUPERVISOR, ROLES.SUPER_ADMIN), validate(updateEmployeeSchema), employeeController.update);
router.delete("/:id", authorize(ROLES.WAREHOUSE_ADMIN, ROLES.SUPERVISOR, ROLES.SUPER_ADMIN), employeeController.deactivate);

export default router;
