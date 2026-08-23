import { Router } from "express";
import * as ctrl from "../controllers/alert.controller.js";
import { authenticate } from "../../common/middleware/authenticate.js";
import { authorize } from "../../common/middleware/authorize.js";
import { ROLES } from "../../common/constants/roles.js";

const router = Router();

router.use(authenticate);
router.use(authorize(ROLES.SUPER_ADMIN, ROLES.WAREHOUSE_ADMIN, ROLES.SUPERVISOR));

router.get("/", ctrl.listAlerts);
router.get("/:id", ctrl.getAlert);
router.post("/", authorize(ROLES.SUPER_ADMIN, ROLES.WAREHOUSE_ADMIN, ROLES.SUPERVISOR), ctrl.createAlert);
router.post("/:id/acknowledge", ctrl.acknowledgeAlert);
router.post("/:id/resolve", ctrl.resolveAlert);
router.delete("/:id", ctrl.deleteAlert);
export default router;