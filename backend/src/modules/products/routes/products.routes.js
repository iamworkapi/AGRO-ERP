import { Router } from "express";
import * as ctrl from "../controllers/product.controller.js";
import { authenticate } from "../../common/middleware/authenticate.js";
import { authorize } from "../../common/middleware/authorize.js";
import { validate } from "../../common/middleware/validate.js";
import { listProductsQuerySchema, createProductSchema, updateProductSchema } from "../validators/product.validators.js";
import { ROLES } from "../../common/constants/roles.js";

const router = Router();
router.use(authenticate);
router.use(authorize(ROLES.SUPER_ADMIN, ROLES.WAREHOUSE_ADMIN, ROLES.SUPERVISOR));

router.get("/", validate(listProductsQuerySchema, "query"), ctrl.listProducts);
router.get("/:id", ctrl.getProduct);
router.post("/", validate(createProductSchema), ctrl.createProduct);
router.patch("/:id", validate(updateProductSchema), ctrl.updateProduct);
router.delete("/:id", ctrl.deleteProduct);

export default router;
