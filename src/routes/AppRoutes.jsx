import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Loader from "../components/common/Loader";

// Route-level code splitting: each page ships as its own chunk instead of
// one ~1.1MB bundle loaded up front (Dashboard, Purchase, Settings, etc. all
// bundled together regardless of which page the user actually opens).
const Dashboard = lazy(() => import("../pages/Dashboard"));
const WarehousesAll = lazy(() => import("../pages/WarehousesAll"));
const CreateWarehouse = lazy(() => import("../pages/CreateWarehouse"));
const WarehouseDetail = lazy(() => import("../pages/WarehouseDetail"));
const WarehouseAdminManagement = lazy(() => import("../pages/WarehouseAdminManagement"));
const Users = lazy(() => import("../pages/Users"));
const Attendance = lazy(() => import("../pages/Attendance"));
const ExceptionApprovals = lazy(() => import("../pages/ExceptionApprovals"));
const EmployeeLocationMap = lazy(() => import("../pages/EmployeeLocationMap"));
const Weighment = lazy(() => import("../pages/Weighment"));
const CreateWeighmentSlip = lazy(() => import("../pages/CreateWeighmentSlip"));
const BiomassSupplyChain = lazy(() => import("../pages/BiomassSupplyChain"));
const BiomassCollection = lazy(() => import("../pages/BiomassCollection"));
const BiomassVendors = lazy(() => import("../pages/BiomassVendors"));
const CreateBiomassVendor = lazy(() => import("../pages/CreateBiomassVendor"));
const BiomassProcessing = lazy(() => import("../pages/BiomassProcessing"));
const BiomassStorage = lazy(() => import("../pages/BiomassStorage"));
const BiomassDispatch = lazy(() => import("../pages/BiomassDispatch"));
const BiomassBuyers = lazy(() => import("../pages/BiomassBuyers"));
const CreateBiomassBuyer = lazy(() => import("../pages/CreateBiomassBuyer"));
const DeductionSlabConfig = lazy(() => import("../pages/DeductionSlabConfig"));
const WeightMachines = lazy(() => import("../pages/WeightMachines"));
const Inventory = lazy(() => import("../pages/Inventory"));
const ItemPartsMaster = lazy(() => import("../pages/ItemPartsMaster"));
const LowStockAlerts = lazy(() => import("../pages/LowStockAlerts"));
const Purchase = lazy(() => import("../pages/Purchase"));
const VendorMasterLedger = lazy(() => import("../pages/VendorMasterLedger"));
const Sales = lazy(() => import("../pages/Sales"));
const Employees = lazy(() => import("../pages/Employees"));
const AddEmployee = lazy(() => import("../pages/AddEmployee"));
const TaskAssignment = lazy(() => import("../pages/TaskAssignment"));
const LeaveRequests = lazy(() => import("../pages/LeaveRequests"));
const Reports = lazy(() => import("../pages/Reports"));
const ExportMISReports = lazy(() => import("../pages/ExportMISReports"));
const Alerts = lazy(() => import("../pages/Alerts"));
const Settings = lazy(() => import("../pages/Settings"));
const AuditLog = lazy(() => import("../pages/AuditLog"));
const OrganisationProfile = lazy(() => import("../pages/OrganisationProfile"));
const Customers = lazy(() => import("../pages/Customers"));

function RouteFallback() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "50vh" }}>
      <Loader size={56} label="Loading…" />
    </div>
  );
}

/*
  Rendered inside <Route path="/*"> in App.jsx, so paths here are
  relative (no leading "/") with an index route for the dashboard.
*/
export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route index element={<Dashboard />} />

        <Route path="warehouses" element={<WarehousesAll />} />
        <Route
          path="warehouses/create"
          element={
            <ProtectedRoute roles={["super_admin", "warehouse_admin"]}>
              <CreateWarehouse />
            </ProtectedRoute>
          }
        />
        <Route
          path="warehouses/detail"
          element={
            <ProtectedRoute roles={["super_admin", "warehouse_admin", "supervisor"]}>
              <WarehouseDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="warehouses/admin-management"
          element={
            <ProtectedRoute roles={["super_admin", "warehouse_admin"]}>
              <WarehouseAdminManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="users"
          element={
            <ProtectedRoute roles={["super_admin", "warehouse_admin"]}>
              <Users />
            </ProtectedRoute>
          }
        />

        <Route
          path="attendance"
          element={
            <ProtectedRoute roles={["super_admin", "warehouse_admin", "supervisor"]}>
              <Attendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="attendance/exceptions"
          element={
            <ProtectedRoute roles={["super_admin", "warehouse_admin"]}>
              <ExceptionApprovals />
            </ProtectedRoute>
          }
        />
        <Route
          path="attendance/location-map"
          element={
            <ProtectedRoute roles={["super_admin", "warehouse_admin", "supervisor"]}>
              <EmployeeLocationMap />
            </ProtectedRoute>
          }
        />

        <Route
          path="weighment"
          element={
            <ProtectedRoute roles={["super_admin", "warehouse_admin", "supervisor"]}>
              <Weighment />
            </ProtectedRoute>
          }
        />
        <Route
          path="weighment/new"
          element={
            <ProtectedRoute roles={["super_admin", "warehouse_admin"]}>
              <CreateWeighmentSlip />
            </ProtectedRoute>
          }
        />
        <Route
          path="weighment/machines"
          element={
            <ProtectedRoute roles={["super_admin", "warehouse_admin"]}>
              <WeightMachines />
            </ProtectedRoute>
          }
        />
        <Route
          path="weighment/deduction-slabs"
          element={
            <ProtectedRoute roles={["super_admin", "warehouse_admin"]}>
              <DeductionSlabConfig />
            </ProtectedRoute>
          }
        />

        <Route
          path="biomass"
          element={
            <ProtectedRoute roles={["super_admin", "warehouse_admin", "supervisor"]}>
              <BiomassSupplyChain />
            </ProtectedRoute>
          }
        />
        <Route
          path="biomass/collection"
          element={
            <ProtectedRoute roles={["super_admin", "warehouse_admin", "supervisor"]}>
              <BiomassCollection />
            </ProtectedRoute>
          }
        />
        <Route
          path="biomass/vendors"
          element={
            <ProtectedRoute roles={["super_admin", "warehouse_admin", "supervisor"]}>
              <BiomassVendors />
            </ProtectedRoute>
          }
        />
        <Route
          path="biomass/vendors/create"
          element={
            <ProtectedRoute roles={["super_admin", "warehouse_admin"]}>
              <CreateBiomassVendor />
            </ProtectedRoute>
          }
        />
        <Route
          path="biomass/processing"
          element={
            <ProtectedRoute roles={["super_admin", "warehouse_admin", "supervisor"]}>
              <BiomassProcessing />
            </ProtectedRoute>
          }
        />
        <Route
          path="biomass/storage"
          element={
            <ProtectedRoute roles={["super_admin", "warehouse_admin", "supervisor"]}>
              <BiomassStorage />
            </ProtectedRoute>
          }
        />
        <Route
          path="biomass/dispatch"
          element={
            <ProtectedRoute roles={["super_admin", "warehouse_admin", "supervisor"]}>
              <BiomassDispatch />
            </ProtectedRoute>
          }
        />
        <Route
          path="biomass/buyers"
          element={
            <ProtectedRoute roles={["super_admin", "warehouse_admin", "supervisor"]}>
              <BiomassBuyers />
            </ProtectedRoute>
          }
        />
        <Route
          path="biomass/buyers/create"
          element={
            <ProtectedRoute roles={["super_admin", "warehouse_admin"]}>
              <CreateBiomassBuyer />
            </ProtectedRoute>
          }
        />

        <Route
          path="inventory"
          element={
            <ProtectedRoute roles={["super_admin", "warehouse_admin", "supervisor"]}>
              <Inventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="inventory/items"
          element={
            <ProtectedRoute roles={["super_admin", "warehouse_admin"]}>
              <ItemPartsMaster />
            </ProtectedRoute>
          }
        />
        <Route
          path="inventory/low-stock-alerts"
          element={
            <ProtectedRoute roles={["super_admin", "warehouse_admin", "supervisor"]}>
              <LowStockAlerts />
            </ProtectedRoute>
          }
        />

        <Route
          path="purchase"
          element={
            <ProtectedRoute roles={["super_admin", "warehouse_admin", "supervisor"]}>
              <Purchase />
            </ProtectedRoute>
          }
        />
        <Route
          path="purchase/vendors"
          element={
            <ProtectedRoute roles={["super_admin", "warehouse_admin", "supervisor"]}>
              <VendorMasterLedger />
            </ProtectedRoute>
          }
        />

        <Route
          path="sales"
          element={
            <ProtectedRoute roles={["super_admin", "warehouse_admin", "supervisor"]}>
              <Sales />
            </ProtectedRoute>
          }
        />
        <Route
          path="sales/customer-master-ledger"
          element={
            <ProtectedRoute roles={["super_admin", "warehouse_admin", "supervisor"]}>
              <Customers />
            </ProtectedRoute>
          }
        />

        <Route
          path="employees"
          element={
            <ProtectedRoute roles={["super_admin", "warehouse_admin", "supervisor"]}>
              <Employees />
            </ProtectedRoute>
          }
        />
        <Route
          path="employees/new"
          element={
            <ProtectedRoute roles={["super_admin", "warehouse_admin"]}>
              <AddEmployee />
            </ProtectedRoute>
          }
        />
        <Route
          path="employees/:id/edit"
          element={
            <ProtectedRoute roles={["super_admin", "warehouse_admin"]}>
              <AddEmployee />
            </ProtectedRoute>
          }
        />
        <Route
          path="employees/tasks"
          element={
            <ProtectedRoute roles={["super_admin", "warehouse_admin"]}>
              <TaskAssignment />
            </ProtectedRoute>
          }
        />
        <Route
          path="employees/leave-requests"
          element={
            <ProtectedRoute roles={["super_admin", "warehouse_admin", "supervisor"]}>
              <LeaveRequests />
            </ProtectedRoute>
          }
        />

        <Route
          path="reports"
          element={
            <ProtectedRoute roles={["super_admin", "warehouse_admin", "supervisor"]}>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="reports/export"
          element={
            <ProtectedRoute roles={["super_admin", "warehouse_admin", "supervisor"]}>
              <ExportMISReports />
            </ProtectedRoute>
          }
        />

        <Route
          path="alerts"
          element={
            <ProtectedRoute roles={["super_admin", "warehouse_admin", "supervisor"]}>
              <Alerts />
            </ProtectedRoute>
          }
        />

        <Route
          path="settings"
          element={
            <ProtectedRoute roles={["super_admin", "warehouse_admin", "supervisor"]}>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="settings/audit-log"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <AuditLog />
            </ProtectedRoute>
          }
        />
        <Route
          path="settings/organisation-profile"
          element={
            <ProtectedRoute roles={["super_admin", "warehouse_admin"]}>
              <OrganisationProfile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Suspense>
  );
}
