import { Router } from "express";
import { validate } from "../../common/middleware/validate.js";
import { authenticate } from "../../common/middleware/authenticate.js";
import { authorize } from "../../common/middleware/authorize.js";
import { ROLES } from "../../common/constants/roles.js";
import {
  listLeaveRequestsQuerySchema,
  createLeaveRequestSchema,
  reviewLeaveRequestSchema,
} from "../validators/leaveRequest.validator.js";
import {
  list,
  create,
  review,
  summary,
} from "../controllers/leaveRequest.controller.js";

const router = Router();

router.use(authenticate);
router.use(authorize(ROLES.SUPER_ADMIN, ROLES.WAREHOUSE_ADMIN, ROLES.SUPERVISOR));

router.get("/", validate(listLeaveRequestsQuerySchema, "query"), list);
router.post("/", validate(createLeaveRequestSchema), create);
router.post("/:id/review", validate(reviewLeaveRequestSchema), review);
router.get("/summary", summary);

export default router;
