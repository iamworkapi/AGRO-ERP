import { Router } from "express";
import {
  list,
  getById,
  create,
  update,
  remove,
} from "../controllers/biomassVendor.controller.js";
import { authenticate } from "../../common/middleware/authenticate.js";
import { authorize } from "../../common/middleware/authorize.js";
import { validate } from "../../common/middleware/validate.js";
import {
  createBiomassVendorSchema,
  updateBiomassVendorSchema,
  listBiomassVendorsQuerySchema,
} from "../validators/biomassVendor.validator.js";
import { ROLES } from "../../common/constants/roles.js";

const router = Router();
router.use(authenticate);
router.use(authorize(ROLES.SUPER_ADMIN, ROLES.WAREHOUSE_ADMIN, ROLES.SUPERVISOR));

router.get("/", validate(listBiomassVendorsQuerySchema, "query"), list);
router.get("/:id", getById);
router.post("/", validate(createBiomassVendorSchema), create);
router.put("/:id", validate(updateBiomassVendorSchema), update);
router.delete("/:id", remove);

export default router;
