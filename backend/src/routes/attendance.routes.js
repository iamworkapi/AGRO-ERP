import { Router } from "express";
import * as attendanceController from "../controllers/attendance.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { createAttendanceSchema, listAttendanceQuerySchema } from "../validators/attendance.validator.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

router.use(authenticate);

router.get("/", validate(listAttendanceQuerySchema, "query"), attendanceController.list);
router.post("/", authorize(ROLES.SUPERVISOR, ROLES.WAREHOUSE_ADMIN, ROLES.SUPER_ADMIN), validate(createAttendanceSchema), attendanceController.create);
// Approve/reject is the admin-oversight step, so the Supervisor who logged
// the correction is deliberately excluded from reviewing their own work.
router.patch("/:id/mark-present", authorize(ROLES.WAREHOUSE_ADMIN, ROLES.SUPER_ADMIN), attendanceController.markPresent);

export default router;
