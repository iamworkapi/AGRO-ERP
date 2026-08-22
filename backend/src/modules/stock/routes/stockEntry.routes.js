import { Router } from "express";
import * as stockEntryController from "../controllers/stockEntry.controller.js";
import { authenticate } from "../../common/middleware/authenticate.js";
import { authorize } from "../../common/middleware/authorize.js";
import { validate } from "../../common/middleware/validate.js";
import { createStockEntrySchema, reviewStockEntrySchema, listStockEntriesQuerySchema } from "../validators/stockEntry.validator.js";
import { ROLES } from "../../common/constants/roles.js";

const router = Router();

router.use(authenticate);

router.get("/", validate(listStockEntriesQuerySchema, "query"), stockEntryController.list);
router.post("/", authorize(ROLES.SUPERVISOR, ROLES.SUPER_ADMIN), validate(createStockEntrySchema), stockEntryController.create);
// Approve/reject is the admin-oversight step, so the Supervisor who logged
// the entry is deliberately excluded from reviewing their own work.
router.patch("/:id/review", authorize(ROLES.WAREHOUSE_ADMIN, ROLES.SUPER_ADMIN), validate(reviewStockEntrySchema), stockEntryController.review);

export default router;
