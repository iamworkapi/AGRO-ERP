import { Router } from "express";
import * as warehouseController from "../controllers/warehouse.controller.js";
import godownRoutes from "./godown.routes.js";
import { authenticate } from "../../common/middleware/authenticate.js";
import { authorize } from "../../common/middleware/authorize.js";
import { validate } from "../../common/middleware/validate.js";
import { createWarehouseSchema, updateWarehouseSchema } from "../validators/warehouse.validator.js";
import { ROLES } from "../../common/constants/roles.js";

const router = Router();

router.use(authenticate);

// Static sub-paths must be registered before the /:id param route below.
router.get("/available-admins", authorize(ROLES.SUPER_ADMIN), warehouseController.availableAdmins);
router.get("/available-supervisors", authorize(ROLES.SUPER_ADMIN), warehouseController.availableSupervisors);

// Godown CRUD — mounted before /:id so Express doesn't eat /godowns as a warehouse id.
router.use("/godowns", godownRoutes);

router.get("/", warehouseController.list);
router.get("/:id", warehouseController.getById);

router.post("/", authorize(ROLES.SUPER_ADMIN, ROLES.WAREHOUSE_ADMIN), validate(createWarehouseSchema), warehouseController.create);
router.patch("/:id", authorize(ROLES.SUPER_ADMIN, ROLES.WAREHOUSE_ADMIN, ROLES.SUPERVISOR), validate(updateWarehouseSchema), warehouseController.update);
router.delete("/:id", authorize(ROLES.SUPER_ADMIN, ROLES.WAREHOUSE_ADMIN), warehouseController.deactivate);

export default router;
