import { Router } from "express";
import { validate } from "../../common/middleware/validate.js";
import { authenticate } from "../../common/middleware/authenticate.js";
import { authorize } from "../../common/middleware/authorize.js";
import { ROLES } from "../../common/constants/roles.js";
import {
  payrollSlipQuerySchema,
  listPayrollQuerySchema,
} from "../validators/payroll.validator.js";
import { slip, listSlips } from "../controllers/payroll.controller.js";

const router = Router();

router.use(authenticate);
router.use(authorize(ROLES.WAREHOUSE_ADMIN, ROLES.SUPER_ADMIN, ROLES.SUPERVISOR));

router.get("/slip/:employeeId", validate(payrollSlipQuerySchema, "query"), slip);
router.get("/slips", validate(listPayrollQuerySchema, "query"), listSlips);

export default router;
