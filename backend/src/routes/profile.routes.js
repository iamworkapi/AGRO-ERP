import { Router } from "express";
import * as profileController from "../controllers/profile.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { listProfilesQuerySchema, updateProfileStatusSchema, createProfileSchema } from "../validators/profile.validator.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

router.use(authenticate);

// List/create are shared: Super Admin gets the org-wide directory and can
// create either role; a Warehouse Admin gets a view scoped to themselves +
// their own warehouse's Supervisor, and can only create that Supervisor
// (both enforced in profile.service.js, not just here - this is the coarse
// gate, not the fine-grained one).
router.get("/", authorize(ROLES.SUPER_ADMIN, ROLES.WAREHOUSE_ADMIN), validate(listProfilesQuerySchema, "query"), profileController.list);
router.post("/", authorize(ROLES.SUPER_ADMIN, ROLES.WAREHOUSE_ADMIN), validate(createProfileSchema), profileController.create);

// Approving pending signups and toggling status remain Super Admin-only -
// broader account-lifecycle control than "staff my own warehouse".
router.patch("/:id/approve", authorize(ROLES.SUPER_ADMIN), profileController.approve);
router.patch("/:id/status", authorize(ROLES.SUPER_ADMIN), validate(updateProfileStatusSchema), profileController.updateStatus);

export default router;
