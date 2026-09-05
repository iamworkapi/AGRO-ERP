import { Router } from "express";
import * as ctrl from "../controllers/product.controller.js";
import { authenticate } from "../../common/middleware/authenticate.js";
import { authorize } from "../../common/middleware/authorize.js";
import { ROLES } from "../../common/constants/roles.js";

const router = Router();
router.use(authenticate);
router.use(authorize(ROLES.SUPER_ADMIN, ROLES.WAREHOUSE_ADMIN, ROLES.SUPERVISOR));

router.get("/", ctrl.listProducts);
router.get("/:id", ctrl.getProduct);
router.post("/", ctrl.createProduct);
router.patch("/:id", ctrl.updateProduct);
router.delete("/:id", ctrl.deleteProduct);

export default router;
