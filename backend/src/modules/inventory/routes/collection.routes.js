import { Router } from "express";
import * as collectionController from "../controllers/collection.controller.js";
import { authenticate } from "../../common/middleware/authenticate.js";
import { authorize } from "../../common/middleware/authorize.js";
import { validate } from "../../common/middleware/validate.js";
import { createCollectionSchema, listCollectionsQuerySchema } from "../validators/collection.validator.js";
import { ROLES } from "../../common/constants/roles.js";

const router = Router();

router.use(authenticate);

router.get("/", validate(listCollectionsQuerySchema, "query"), collectionController.list);
router.get("/summary", collectionController.summary);
router.post("/", authorize(ROLES.SUPERVISOR, ROLES.WAREHOUSE_ADMIN, ROLES.SUPER_ADMIN), validate(createCollectionSchema), collectionController.create);

export default router;
