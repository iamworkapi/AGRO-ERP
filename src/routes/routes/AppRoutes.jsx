import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Loader from "../../components/common/Loader";

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
        <Route path="warehouses/detail" element={<WarehouseDetail />} />
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

        <Route path="attendance" element={<Attendance />} />
        <Route path="attendance/exceptions" element={<ExceptionApprovals />} />
        <Route path="attendance/location-map" element={<EmployeeLocationMap />} />

        <Route path="weighment" element={<Weighment />} />
        <Route path="weighment/new" element={<CreateWeighmentSlip />} />
        <Route path="weighment/machines" element={<WeightMachines />} />
        <Route path="weighment/deduction-slabs" element={<DeductionSlabConfig />} />

        <Route path="biomass" element={<BiomassSupplyChain />} />
        <Route path="biomass/collection" element={<BiomassCollection />} />
        <Route path="biomass/vendors" element={<Navigate to="/biomass/collection" replace />} />
        <Route path="biomass/vendors/create" element={<CreateBiomassVendor />} />
        <Route path="biomass/processing" element={<BiomassProcessing />} />
        <Route path="biomass/storage" element={<BiomassStorage />} />
        <Route path="biomass/dispatch" element={<BiomassDispatch />} />
        <Route path="biomass/buyers" element={<BiomassBuyers />} />
        <Route path="biomass/buyers/create" element={<CreateBiomassBuyer />} />

        <Route path="inventory" element={<Inventory />} />
        <Route path="inventory/items" element={<ItemPartsMaster />} />
        <Route path="inventory/low-stock-alerts" element={<LowStockAlerts />} />

        <Route path="purchase" element={<Purchase />} />
        <Route path="purchase/vendors" element={<VendorMasterLedger />} />

        <Route path="sales" element={<Sales />} />
        <Route path="sales/customer-master-ledger" element={<Customers />} />

        <Route path="employees" element={<Employees />} />
        <Route path="employees/new" element={<AddEmployee />} />
        <Route path="employees/:id/edit" element={<AddEmployee />} />
        <Route path="employees/tasks" element={<TaskAssignment />} />
        <Route path="employees/leave-requests" element={<LeaveRequests />} />

        <Route path="reports" element={<Reports />} />
        <Route path="reports/export" element={<ExportMISReports />} />

        <Route path="alerts" element={<Alerts />} />

        <Route path="settings" element={<Settings />} />
        <Route path="settings/audit-log" element={<AuditLog />} />
        <Route path="settings/organisation-profile" element={<OrganisationProfile />} />
      </Routes>
    </Suspense>
  );
}
