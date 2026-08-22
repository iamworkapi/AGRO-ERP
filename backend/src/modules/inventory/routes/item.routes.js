import { Router } from "express";
import * as itemController from "../controllers/item.controller.js";
import { authenticate } from "../../common/middleware/authenticate.js";
import { authorize } from "../../common/middleware/authorize.js";
import { validate } from "../../common/middleware/validate.js";
import { createItemSchema, updateItemSchema, listItemsQuerySchema } from "../validators/item.validator.js";
import { ROLES } from "../../common/constants/roles.js";

const router = Router();

router.use(authenticate);

// Super Admin can read (monitor) everywhere; a Warehouse Admin or
// Supervisor manages the item master for their own warehouse (scoped in
// item.service.js's assertCanAccessWarehouse, not just here).
router.get("/", validate(listItemsQuerySchema, "query"), itemController.list);
router.post("/", authorize(ROLES.WAREHOUSE_ADMIN, ROLES.SUPERVISOR, ROLES.SUPER_ADMIN), validate(createItemSchema), itemController.create);
router.patch("/:id", authorize(ROLES.WAREHOUSE_ADMIN, ROLES.SUPERVISOR, ROLES.SUPER_ADMIN), validate(updateItemSchema), itemController.update);
router.delete("/:id", authorize(ROLES.WAREHOUSE_ADMIN, ROLES.SUPERVISOR, ROLES.SUPER_ADMIN), itemController.remove);

export default router;
