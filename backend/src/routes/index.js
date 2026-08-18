import { Router } from "express";
import authRoutes from "./auth.routes.js";
import profileRoutes from "./profile.routes.js";
import warehouseRoutes from "./warehouse.routes.js";
import employeeRoutes from "./employee.routes.js";
import weightMachineRoutes from "./weightMachine.routes.js";
import stockEntryRoutes from "./stockEntry.routes.js";
import auditRoutes from "./audit.routes.js";
import itemRoutes from "./item.routes.js";
import attendanceRoutes from "./attendance.routes.js";
import biomassVendorRoutes from "./biomassVendor.routes.js";
import biomassBuyerRoutes from "./biomassBuyer.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/profiles", profileRoutes);
router.use("/warehouses", warehouseRoutes);
router.use("/employees", employeeRoutes);
router.use("/weight-machines", weightMachineRoutes);
router.use("/stock-entries", stockEntryRoutes);
router.use("/audit-logs", auditRoutes);
router.use("/items", itemRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/biomass-vendors", biomassVendorRoutes);
router.use("/biomass-buyers", biomassBuyerRoutes);

export default router;
