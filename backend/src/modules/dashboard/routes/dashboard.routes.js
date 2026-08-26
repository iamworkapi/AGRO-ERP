import { Router } from "express";
import { authenticate } from "../../common/middleware/authenticate.js";
import { getOverview } from "../controllers/dashboard.controller.js";

const router = Router();

router.use(authenticate);

router.get("/overview", getOverview);

export default router;
