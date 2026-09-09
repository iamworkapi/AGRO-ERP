import { Router } from "express";
import {
  list,
  getById,
  create,
  update,
  remove,
} from "../controllers/biomassBuyer.controller.js";
import { authenticate } from "../../common/middleware/authenticate.js";
import { authorize } from "../../common/middleware/authorize.js";
import { ROLES } from "../../common/constants/roles.js";
import { validate } from "../../common/middleware/validate.js";
import {
  listBiomassBuyersQuerySchema,
  createBiomassBuyerSchema,
  updateBiomassBuyerSchema,
} from "../validators/biomassBuyer.validator.js";

const router = Router();
router.use(authenticate);
router.use(authorize(ROLES.SUPER_ADMIN, ROLES.WAREHOUSE_ADMIN, ROLES.SUPERVISOR));

router.get("/", validate(listBiomassBuyersQuerySchema, "query"), list);
router.get("/:id", getById);
router.post("/", validate(createBiomassBuyerSchema), create);
router.put("/:id", validate(updateBiomassBuyerSchema), update);
router.delete("/:id", remove);

export default router;
