import { Router } from "express";
import * as stockMovementController from "../controllers/stockMovement.controller.js";
import { authenticate } from "../../common/middleware/authenticate.js";
import { authorize } from "../../common/middleware/authorize.js";
import { validate } from "../../common/middleware/validate.js";
import { createStockMovementSchema, listStockMovementsQuerySchema } from "../validators/stockMovement.validator.js";
import { ROLES } from "../../common/constants/roles.js";

const router = Router();

router.use(authenticate);

router.get("/", validate(listStockMovementsQuerySchema, "query"), stockMovementController.list);
router.get("/summary", stockMovementController.summary);
router.post("/", authorize(ROLES.SUPERVISOR, ROLES.WAREHOUSE_ADMIN, ROLES.SUPER_ADMIN), validate(createStockMovementSchema), stockMovementController.create);

export default router;
