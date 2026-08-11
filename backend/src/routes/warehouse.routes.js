import { Router } from "express";
import * as warehouseController from "../controllers/warehouse.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { createWarehouseSchema, updateWarehouseSchema } from "../validators/warehouse.validator.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

router.use(authenticate);

// Static sub-paths must be registered before the /:id param route below.
router.get("/available-admins", authorize(ROLES.SUPER_ADMIN), warehouseController.availableAdmins);
router.get("/available-supervisors", authorize(ROLES.SUPER_ADMIN), warehouseController.availableSupervisors);

router.get("/", warehouseController.list);
router.get("/:id", warehouseController.getById);

router.post("/", authorize(ROLES.SUPER_ADMIN), validate(createWarehouseSchema), warehouseController.create);
router.patch("/:id", authorize(ROLES.SUPER_ADMIN), validate(updateWarehouseSchema), warehouseController.update);
router.delete("/:id", authorize(ROLES.SUPER_ADMIN), warehouseController.deactivate);

export default router;
