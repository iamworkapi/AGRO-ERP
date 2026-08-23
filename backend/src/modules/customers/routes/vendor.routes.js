import { Router } from "express";
import * as ctrl from "../controllers/vendor.controller.js";
import { authenticate } from "../../common/middleware/authenticate.js";
import { authorize } from "../../common/middleware/authorize.js";
import { ROLES } from "../../common/constants/roles.js";

const router = Router();

router.use(authenticate);
router.use(authorize(ROLES.SUPER_ADMIN, ROLES.WAREHOUSE_ADMIN, ROLES.SUPERVISOR));

router.get("/", ctrl.listVendors);
router.get("/:id", ctrl.getVendor);
router.post("/", ctrl.createVendor);
router.put("/:id", ctrl.updateVendor);
router.delete("/:id", ctrl.deleteVendor);
export default router;
