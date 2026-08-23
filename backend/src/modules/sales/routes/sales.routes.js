import { Router } from "express";
import * as ctrl from "../controllers/sales.controller.js";
import { authenticate } from "../../common/middleware/authenticate.js";
import { authorize } from "../../common/middleware/authorize.js";
import { ROLES } from "../../common/constants/roles.js";

const router = Router();

router.use(authenticate);
router.use(authorize(ROLES.SUPER_ADMIN, ROLES.WAREHOUSE_ADMIN, ROLES.SUPERVISOR));

router.get("/", ctrl.listSalesInvoices);
router.get("/:id", ctrl.getSalesInvoice);
router.post("/", ctrl.createSalesInvoice);
router.patch("/:id/status", ctrl.updateSalesInvoiceStatus);
router.delete("/:id", ctrl.deleteSalesInvoice);
export default router;
