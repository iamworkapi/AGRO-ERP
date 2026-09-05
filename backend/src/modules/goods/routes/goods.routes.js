import { Router } from "express";
import * as ctrl from "../controllers/goods.controller.js";
import { authenticate } from "../../common/middleware/authenticate.js";
import { authorize } from "../../common/middleware/authorize.js";
import { ROLES } from "../../common/constants/roles.js";

const router = Router();
router.use(authenticate);
router.use(authorize(ROLES.SUPER_ADMIN, ROLES.WAREHOUSE_ADMIN, ROLES.SUPERVISOR));

router.get("/", ctrl.listGoods);
router.get("/next-invoice-no", ctrl.getNextSupplierInvoiceNo);
router.get("/:id", ctrl.getGoods);
router.post("/", ctrl.createGoods);
router.patch("/:id/status", ctrl.updateGoodsStatus);
router.delete("/:id", ctrl.deleteGoods);

export default router;
