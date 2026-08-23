import { Router } from "express";
import * as reportsController from "../controllers/reports.controller.js";
import * as exportController from "../controllers/export.controller.js";
import { authenticate } from "../../common/middleware/authenticate.js";
import { authorize } from "../../common/middleware/authorize.js";
import { validate } from "../../common/middleware/validate.js";
import { reportsQuerySchema } from "../validators/reports.validator.js";
import { ROLES } from "../../common/constants/roles.js";

const router = Router();

router.use(authenticate);

router.get("/dashboard", reportsController.dashboard);

router.get("/stock-valuation", authorize(ROLES.SUPER_ADMIN, ROLES.WAREHOUSE_ADMIN, ROLES.SUPERVISOR), validate(reportsQuerySchema, "query"), reportsController.stockValuation);

router.get("/attendance-summary", authorize(ROLES.SUPER_ADMIN, ROLES.WAREHOUSE_ADMIN, ROLES.SUPERVISOR), validate(reportsQuerySchema, "query"), reportsController.attendanceSummary);

router.get("/moisture-trend", authorize(ROLES.SUPER_ADMIN, ROLES.WAREHOUSE_ADMIN, ROLES.SUPERVISOR), validate(reportsQuerySchema, "query"), reportsController.moistureTrend);

router.get("/purchase-vs-sales", authorize(ROLES.SUPER_ADMIN, ROLES.WAREHOUSE_ADMIN, ROLES.SUPERVISOR), validate(reportsQuerySchema, "query"), reportsController.purchaseVsSales);

router.get("/outstanding", authorize(ROLES.SUPER_ADMIN, ROLES.WAREHOUSE_ADMIN, ROLES.SUPERVISOR), validate(reportsQuerySchema, "query"), reportsController.outstandingReport);

router.get("/export", authorize(ROLES.SUPER_ADMIN, ROLES.WAREHOUSE_ADMIN, ROLES.SUPERVISOR), exportController.exportReport);

export default router;
