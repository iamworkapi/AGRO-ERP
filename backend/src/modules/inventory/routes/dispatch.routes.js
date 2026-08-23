import { Router } from "express";
import * as dispatchController from "../controllers/dispatch.controller.js";
import { authenticate } from "../../common/middleware/authenticate.js";
import { authorize } from "../../common/middleware/authorize.js";
import { validate } from "../../common/middleware/validate.js";
import { createDispatchSchema, listDispatchesQuerySchema } from "../validators/dispatch.validator.js";
import { ROLES } from "../../common/constants/roles.js";

const router = Router();

router.use(authenticate);

router.get("/", validate(listDispatchesQuerySchema, "query"), dispatchController.list);
router.get("/summary", dispatchController.summary);
router.post("/", authorize(ROLES.SUPERVISOR, ROLES.WAREHOUSE_ADMIN, ROLES.SUPER_ADMIN), validate(createDispatchSchema), dispatchController.create);
router.patch("/:id/status", authorize(ROLES.WAREHOUSE_ADMIN, ROLES.SUPER_ADMIN), dispatchController.updateStatus);

export default router;
