import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import warehousesReducer from "../features/warehouses/warehousesSlice";
import weighmentReducer from "../features/weighment/weighmentSlice";
import attendanceReducer from "../features/attendance/attendanceSlice";
import inventoryReducer from "../features/inventory/inventorySlice";
import purchaseReducer from "../features/purchase/purchaseSlice";
import salesReducer from "../features/sales/salesSlice";
import customersReducer from "../features/customers/customersSlice";
import employeesReducer from "../features/employees/employeesSlice";
import reportsReducer from "../features/reports/reportsSlice";
import settingsReducer from "../features/settings/settingsSlice";
import alertsReducer from "../features/alerts/alertsSlice";
import dashboardReducer from "../features/dashboard/dashboardSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    warehouses: warehousesReducer,
    weighment: weighmentReducer,
    attendance: attendanceReducer,
    inventory: inventoryReducer,
    purchase: purchaseReducer,
    sales: salesReducer,
    customers: customersReducer,
    employees: employeesReducer,
    reports: reportsReducer,
    settings: settingsReducer,
    alerts: alertsReducer,
    dashboard: dashboardReducer,
  },
});
