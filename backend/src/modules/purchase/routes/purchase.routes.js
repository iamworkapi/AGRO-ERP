import { Router } from "express";
import * as ctrl from "../controllers/purchase.controller.js";
import { authenticate } from "../../common/middleware/authenticate.js";
import { authorize } from "../../common/middleware/authorize.js";
import { ROLES } from "../../common/constants/roles.js";

const router = Router();

router.use(authenticate);
router.use(authorize(ROLES.SUPER_ADMIN, ROLES.WAREHOUSE_ADMIN, ROLES.SUPERVISOR));

router.get("/", ctrl.listPurchaseOrders);
router.get("/:id", ctrl.getPurchaseOrder);
router.post("/", ctrl.createPurchaseOrder);
router.patch("/:id/status", ctrl.updatePurchaseOrderStatus);
router.delete("/:id", ctrl.deletePurchaseOrder);
export default router;
