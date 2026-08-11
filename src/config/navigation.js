// Navigation configuration with role-based permissions
// roles: ["admin"] restricts a group or section to Warehouse Admins and Super Admins only (hidden for Supervisors).
export const NAV_GROUPS = [
  { label: "Overview", path: "/", sections: ["Dashboard"] },
  {
    label: "Warehouses",
    path: "/warehouses",
    roles: ["admin"],
    sections: [
      { label: "All Warehouses", path: "/warehouses", roles: ["admin"] },
      { label: "Warehouse Detail", path: "/warehouses/detail", roles: ["admin"] },
      { label: "Warehouse Admin Management", path: "/warehouses/admin-management", roles: ["admin"] },
    ],
  },
  {
    label: "Users & Admins",
    path: "/users",
    roles: ["admin"],
    sections: [
      { label: "All Users", path: "/users", roles: ["admin"] },
      { label: "Admin & Supervisor Directory", path: "/warehouses/admin-management", roles: ["admin"] },
    ],
    badge: true,
  },
  {
    label: "Attendance",
    path: "/attendance",
    sections: [
      { label: "Daily Attendance", path: "/attendance" },
      { label: "Exception Approvals", path: "/attendance/exceptions" },
      { label: "Employee Location Map", path: "/attendance/location-map" },
    ],
  },
  {
    label: "Weighment & Moisture",
    path: "/weighment",
    sections: [
      { label: "Weighment Slips", path: "/weighment" },
      { label: "New Weighment Slip", path: "/weighment/new" },
      { label: "Weight Machines", path: "/weighment/machines" },
      { label: "Deduction Slab Config", path: "/weighment/deduction-slabs", roles: ["admin"] },
    ],
    badge: true,
  },
  {
    label: "Inventory",
    path: "/inventory",
    sections: [
      { label: "Stock Overview", path: "/inventory" },
      { label: "Item / Parts Master", path: "/inventory/items" },
      { label: "Low Stock Alerts", path: "/inventory/low-stock-alerts" },
    ],
    badge: true,
  },
  {
    label: "Purchase",
    path: "/purchase",
    sections: [
      { label: "Purchase Orders", path: "/purchase" },
      { label: "Vendor Master & Ledger", path: "/purchase/vendors" },
    ],
  },
  {
    label: "Sales & Billing",
    path: "/sales",
    sections: [
      { label: "Invoices", path: "/sales" },
      { label: "Customer Master & Ledger", path: "/sales/customer-master-ledger" },
    ],
  },
  {
    label: "Employees",
    path: "/employees",
    sections: [
      { label: "Employee Directory", path: "/employees" },
      { label: "Task Assignment", path: "/employees/tasks" },
      { label: "Leave Requests", path: "/employees/leave-requests" },
    ],
  },
  {
    label: "Reports",
    path: "/reports",
    sections: [
      { label: "Analytics Centre", path: "/reports" },
      { label: "Export MIS Reports", path: "/reports/export" },
    ],
  },
  { label: "Alerts & Exceptions", path: "/alerts", sections: ["All Exceptions"], badge: true },
  {
    label: "Settings",
    path: "/settings",
    roles: ["admin"],
    sections: [
      { label: "Roles & Permissions", path: "/settings", roles: ["admin"] },
      { label: "Audit Log", path: "/settings/audit-log", roles: ["admin"] },
      { label: "Organisation Profile", path: "/settings/organisation-profile", roles: ["admin"] },
    ],
  },
];
