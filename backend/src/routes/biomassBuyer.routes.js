import { Router } from "express";
import {
  getBiomassBuyers,
  getBiomassBuyerById,
  createBiomassBuyer,
  updateBiomassBuyer,
  deleteBiomassBuyer,
} from "../controllers/biomassBuyer.controller.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();

router.use(authenticate);

router.get("/", getBiomassBuyers);
router.get("/:id", getBiomassBuyerById);
router.post("/", createBiomassBuyer);
router.put("/:id", updateBiomassBuyer);
router.delete("/:id", deleteBiomassBuyer);

export default router;
