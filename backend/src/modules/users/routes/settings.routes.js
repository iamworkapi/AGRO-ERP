import { Router } from "express";
import * as ctrl from "../controllers/settings.controller.js";
import { authenticate } from "../../common/middleware/authenticate.js";
import { authorize } from "../../common/middleware/authorize.js";
import { ROLES } from "../../common/constants/roles.js";

const router = Router();

router.use(authenticate);

router.get("/org-profile", ctrl.getOrgProfile);
router.get("/roles", ctrl.getRoles);
router.put("/org-profile", authorize(ROLES.WAREHOUSE_ADMIN, ROLES.SUPER_ADMIN), ctrl.updateOrgProfile);
router.post("/roles", authorize(ROLES.SUPER_ADMIN, ROLES.WAREHOUSE_ADMIN), ctrl.createRole);
router.get("/audit-log", authorize(ROLES.WAREHOUSE_ADMIN, ROLES.SUPER_ADMIN), ctrl.listAuditLogsCtrl);

export default router;