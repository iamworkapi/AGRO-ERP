import { Router } from "express";
import * as auditController from "../controllers/audit.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { listAuditLogsQuerySchema } from "../validators/audit.validator.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

// Monitoring-only surface: warehouse_admin sees their own warehouse's trail
// (scoped in audit.service.js), super_admin sees everything.
router.use(authenticate, authorize(ROLES.WAREHOUSE_ADMIN, ROLES.SUPER_ADMIN));

router.get("/", validate(listAuditLogsQuerySchema, "query"), auditController.list);

export default router;
