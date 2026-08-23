import { Router } from "express";
import * as ctrl from "../controllers/customer.controller.js";
import { authenticate } from "../../common/middleware/authenticate.js";
import { authorize } from "../../common/middleware/authorize.js";
import { ROLES } from "../../common/constants/roles.js";

const router = Router();

router.use(authenticate);
router.use(authorize(ROLES.SUPER_ADMIN, ROLES.WAREHOUSE_ADMIN, ROLES.SUPERVISOR));

router.get("/", ctrl.listCustomers);
router.get("/:id", ctrl.getCustomer);
router.post("/", ctrl.createCustomer);
router.put("/:id", ctrl.updateCustomer);
router.delete("/:id", ctrl.deleteCustomer);
export default router;