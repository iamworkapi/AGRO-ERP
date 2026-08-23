import { Router } from "express";
import * as godownController from "../controllers/godown.controller.js";
import { authenticate } from "../../common/middleware/authenticate.js";
import { authorize } from "../../common/middleware/authorize.js";
import { validate } from "../../common/middleware/validate.js";
import { createGodownSchema, updateGodownSchema, listGodownsQuerySchema } from "../validators/godown.validator.js";
import { ROLES } from "../../common/constants/roles.js";

const router = Router();

router.use(authenticate);

router.get("/", validate(listGodownsQuerySchema, "query"), godownController.list);
router.post("/", authorize(ROLES.WAREHOUSE_ADMIN, ROLES.SUPER_ADMIN), validate(createGodownSchema), godownController.create);
router.patch("/:id", authorize(ROLES.WAREHOUSE_ADMIN, ROLES.SUPER_ADMIN, ROLES.SUPERVISOR), validate(updateGodownSchema), godownController.update);
router.delete("/:id", authorize(ROLES.WAREHOUSE_ADMIN, ROLES.SUPER_ADMIN), godownController.remove);

export default router;
