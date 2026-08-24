// Navigation configuration with role-based permissions
// roles: ["super_admin", "warehouse_admin"] shows for both; ["supervisor"] for supervisors only.
export const NAV_GROUPS = [
  { label: "Overview", path: "/", sections: ["Dashboard"] },
  {
    label: "Warehouses",
    path: "/warehouses",
    roles: ["super_admin", "warehouse_admin"],
    sections: [
      { label: "All Warehouses", path: "/warehouses", roles: ["super_admin", "warehouse_admin"] },
      { label: "Add Warehouse", path: "/warehouses/create", roles: ["super_admin", "warehouse_admin"] },
      { label: "Warehouse Detail", path: "/warehouses/detail", roles: ["super_admin", "warehouse_admin"] },
      { label: "Warehouse Admin Management", path: "/warehouses/admin-management", roles: ["super_admin", "warehouse_admin"] },
    ],
  },
  {
    label: "Users & Admins",
    path: "/users",
    roles: ["super_admin", "warehouse_admin"],
    sections: [
      { label: "All Users", path: "/users", roles: ["super_admin", "warehouse_admin"] },
      { label: "Admin & Supervisor Directory", path: "/warehouses/admin-management", roles: ["super_admin", "warehouse_admin"] },
    ],
    badge: true,
  },
  {
    label: "Weighment & Moisture",
    path: "/weighment",
    sections: [
      { label: "Weighment Slips", path: "/weighment" },
      { label: "New Weighment Slip", path: "/weighment/new" },
      { label: "Weight Machines", path: "/weighment/machines" },
      { label: "Deduction Slab Config", path: "/weighment/deduction-slabs", roles: ["super_admin", "warehouse_admin"] },
    ],
    badge: true,
  },
  {
    label: "Biomass 4-Stage Master",
    path: "/biomass",
    sections: ["4-Stage Master Tracker"],
    badge: true,
  },
  {
    label: "Stage 1: Collection & Vendors",
    path: "/biomass/collection",
    sections: [
      { label: "Stage 1: Collection", path: "/biomass/collection" },
      { label: "Biomass Vendor Directory", path: "/biomass/vendors" },
      { label: "Register New Vendor", path: "/biomass/vendors/create" },
    ],
    badge: true,
  },
  {
    label: "Stage 2: Process & Moisture",
    path: "/biomass/processing",
    sections: [
      { label: "Processing & Moisture Calculator", path: "/biomass/processing" },
      { label: "Weighment Slips & GRN Log", path: "/weighment" },
      { label: "New Weighment Entry", path: "/weighment/new" },
      { label: "Moisture Deduction Slabs", path: "/weighment/deduction-slabs", roles: ["super_admin", "warehouse_admin"] },
    ],
    badge: true,
  },
  {
    label: "Stage 3: Storage",
    path: "/biomass/storage",
    sections: [
      { label: "Yard Stacking & Probes", path: "/biomass/storage" },
      { label: "Warehouse Operations Detail", path: "/warehouses/detail", roles: ["super_admin", "warehouse_admin"] },
    ],
  },
  {
    label: "Stage 4: Dispatch & Buyers",
    path: "/biomass/dispatch",
    sections: [
      { label: "Stage 4: Factory Dispatches", path: "/biomass/dispatch" },
      { label: "Biomass Buyer Directory", path: "/biomass/buyers" },
      { label: "Register New Buyer", path: "/biomass/buyers/create" },
    ],
    badge: true,
  },
  {
    label: "Inventory",
    path: "/inventory",
    roles: ["super_admin", "warehouse_admin"],
    sections: [
      { label: "Stock Overview", path: "/inventory", roles: ["super_admin", "warehouse_admin"] },
      { label: "Item / Parts Master", path: "/inventory/items", roles: ["super_admin", "warehouse_admin"] },
      { label: "Low Stock Alerts", path: "/inventory/low-stock-alerts", roles: ["super_admin", "warehouse_admin"] },
    ],
    badge: true,
  },
  {
    label: "Purchase",
    path: "/purchase",
    roles: ["super_admin", "warehouse_admin"],
    sections: [
      { label: "Purchase Orders", path: "/purchase", roles: ["super_admin", "warehouse_admin"] },
      { label: "Vendor Master & Ledger", path: "/purchase/vendors", roles: ["super_admin", "warehouse_admin"] },
      { label: "Biomass Vendor Directory", path: "/biomass/vendors", roles: ["super_admin", "warehouse_admin"] },
      { label: "Create Biomass Vendor", path: "/biomass/vendors/create", roles: ["super_admin", "warehouse_admin"] },
    ],
  },
  {
    label: "Sales & Billing",
    path: "/sales",
    roles: ["super_admin", "warehouse_admin"],
    sections: [
      { label: "Invoices", path: "/sales", roles: ["super_admin", "warehouse_admin"] },
      { label: "Customer Master & Ledger", path: "/sales/customer-master-ledger", roles: ["super_admin", "warehouse_admin"] },
      { label: "Industrial Buyer Directory", path: "/biomass/buyers", roles: ["super_admin", "warehouse_admin"] },
      { label: "Create Industrial Buyer", path: "/biomass/buyers/create", roles: ["super_admin", "warehouse_admin"] },
    ],
  },
  {
    label: "Employees",
    path: "/employees",
    roles: ["super_admin", "warehouse_admin"],
    sections: [
      { label: "Employee Directory", path: "/employees", roles: ["super_admin", "warehouse_admin"] },
      { label: "Task Assignment", path: "/employees/tasks", roles: ["super_admin", "warehouse_admin"] },
      { label: "Leave Requests", path: "/employees/leave-requests", roles: ["super_admin", "warehouse_admin"] },
      { label: "Payroll", path: "/reports/payroll", roles: ["super_admin", "warehouse_admin"] },
    ],
  },
  {
    label: "Reports",
    path: "/reports",
    roles: ["super_admin", "warehouse_admin"],
    sections: [
      { label: "Analytics Centre", path: "/reports", roles: ["super_admin", "warehouse_admin"] },
      { label: "Export MIS Reports", path: "/reports/export", roles: ["super_admin", "warehouse_admin"] },
    ],
  },
  {
    label: "Alerts & Exceptions",
    path: "/alerts",
    roles: ["super_admin", "warehouse_admin"],
    sections: ["All Exceptions"],
    badge: true,
  },
  {
    label: "Settings",
    path: "/settings",
    roles: ["super_admin", "warehouse_admin"],
    sections: [
      { label: "Roles & Permissions", path: "/settings", roles: ["super_admin", "warehouse_admin"] },
      { label: "Audit Log", path: "/settings/audit-log", roles: ["super_admin"] },
      { label: "Organisation Profile", path: "/settings/organisation-profile", roles: ["super_admin", "warehouse_admin"] },
    ],
  },
];
