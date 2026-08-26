import { Router } from "express";
import * as profileController from "../controllers/profile.controller.js";
import { authenticate } from "../../common/middleware/authenticate.js";
import { authorize } from "../../common/middleware/authorize.js";
import { validate } from "../../common/middleware/validate.js";
import { listProfilesQuerySchema, updateProfileStatusSchema, updateOwnProfileSchema, updateProfileByIdSchema, createProfileSchema } from "../validators/profile.validator.js";
import { ROLES } from "../../common/constants/roles.js";

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

// Any logged-in user can update their own profile — name, contact, photo.
router.patch("/me", validate(updateOwnProfileSchema), profileController.updateOwnProfile);

// Super Admin or Warehouse Admin updating staff profile directly (including password, phone, email, avatar, address)
router.patch("/:id", authorize(ROLES.SUPER_ADMIN, ROLES.WAREHOUSE_ADMIN), validate(updateProfileByIdSchema), profileController.update);


export default router;
