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
      { label: "Add Warehouse", path: "/warehouses/create", roles: ["admin"] },
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
      { label: "Moisture Deduction Slabs", path: "/weighment/deduction-slabs", roles: ["admin"] },
    ],
    badge: true,
  },
  {
    label: "Stage 3: Storage",
    path: "/biomass/storage",
    sections: [
      { label: "Yard Stacking & Probes", path: "/biomass/storage" },
      { label: "Warehouse Operations Detail", path: "/warehouses/detail", roles: ["admin"] },
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
    roles: ["admin"],
    sections: [
      { label: "Stock Overview", path: "/inventory", roles: ["admin"] },
      { label: "Item / Parts Master", path: "/inventory/items", roles: ["admin"] },
      { label: "Low Stock Alerts", path: "/inventory/low-stock-alerts", roles: ["admin"] },
    ],
    badge: true,
  },
  {
    label: "Purchase",
    path: "/purchase",
    roles: ["admin"],
    sections: [
      { label: "Purchase Orders", path: "/purchase", roles: ["admin"] },
      { label: "Vendor Master & Ledger", path: "/purchase/vendors", roles: ["admin"] },
      { label: "Biomass Vendor Directory", path: "/biomass/vendors", roles: ["admin"] },
      { label: "Create Biomass Vendor", path: "/biomass/vendors/create", roles: ["admin"] },
    ],
  },
  {
    label: "Sales & Billing",
    path: "/sales",
    roles: ["admin"],
    sections: [
      { label: "Invoices", path: "/sales", roles: ["admin"] },
      { label: "Customer Master & Ledger", path: "/sales/customer-master-ledger", roles: ["admin"] },
      { label: "Industrial Buyer Directory", path: "/biomass/buyers", roles: ["admin"] },
      { label: "Create Industrial Buyer", path: "/biomass/buyers/create", roles: ["admin"] },
    ],
  },
  {
    label: "Employees",
    path: "/employees",
    roles: ["admin"],
    sections: [
      { label: "Employee Directory", path: "/employees", roles: ["admin"] },
      { label: "Task Assignment", path: "/employees/tasks", roles: ["admin"] },
      { label: "Leave Requests", path: "/employees/leave-requests", roles: ["admin"] },
      { label: "Payroll", path: "/reports/payroll", roles: ["admin"] },
    ],
  },
  {
    label: "Reports",
    path: "/reports",
    roles: ["admin"],
    sections: [
      { label: "Analytics Centre", path: "/reports", roles: ["admin"] },
      { label: "Export MIS Reports", path: "/reports/export", roles: ["admin"] },
    ],
  },
  {
    label: "Alerts & Exceptions",
    path: "/alerts",
    roles: ["admin"],
    sections: ["All Exceptions"],
    badge: true,
  },
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
