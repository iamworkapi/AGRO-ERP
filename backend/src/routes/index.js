import { Router } from "express";
import { authRoutes } from "../modules/auth/index.js";
import { profileRoutes } from "../modules/users/index.js";
import { warehouseRoutes } from "../modules/warehouses/index.js";
import { employeeRoutes } from "../modules/employees/index.js";
import { weightMachineRoutes } from "../modules/weighment/index.js";
import { stockEntryRoutes } from "../modules/stock/index.js";
import { auditRoutes } from "../modules/audit/index.js";
import { itemRoutes } from "../modules/inventory/index.js";
import { attendanceRoutes } from "../modules/attendance/index.js";
import { biomassVendorRoutes } from "../modules/biomass-vendors/index.js";
import { biomassBuyerRoutes } from "../modules/biomass-buyers/index.js";

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
