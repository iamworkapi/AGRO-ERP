import { Router } from "express";
import {
  getBiomassVendors,
  getBiomassVendorById,
  createBiomassVendor,
  updateBiomassVendor,
  deleteBiomassVendor,
} from "../controllers/biomassVendor.controller.js";
import { authenticate } from "../../common/middleware/authenticate.js";

const router = Router();

router.use(authenticate);

router.get("/", getBiomassVendors);
router.get("/:id", getBiomassVendorById);
router.post("/", createBiomassVendor);
router.put("/:id", updateBiomassVendor);
router.delete("/:id", deleteBiomassVendor);

export default router;
