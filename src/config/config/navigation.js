// Navigation configuration with role-based permissions
// roles: ["admin"] restricts a group or section to Warehouse Admins and Super Admins only (hidden for Supervisors).
export const NAV_GROUPS = [
  { label: "Overview", path: "/", sections: ["Dashboard"] },
  {
    label: "Collection & Vendors",
    path: "/biomass/collection",
    sections: [
      { label: "Collection & Sourcing", path: "/biomass/collection" },
      { label: "Register New Vendor", path: "/biomass/vendors/create" },
    ],
    badge: true,
  },
  {
    label: "Weighment & Moisture",
    path: "/weighment",
    sections: [
      { label: "Weighment Slips & GRN Log", path: "/weighment" },
      { label: "New Weighment Slip", path: "/weighment/new" },
      { label: "Processing & Moisture Calculator", path: "/biomass/processing" },
      { label: "Weight Machines", path: "/weighment/machines" },
      { label: "Moisture Deduction Slabs", path: "/weighment/deduction-slabs", roles: ["admin"] },
    ],
    badge: true,
  },
  {
    label: "Storage & Stacking",
    path: "/biomass/storage",
    sections: [
      { label: "Yard Stacking & Probes", path: "/biomass/storage" },
      { label: "Warehouse Operations Detail", path: "/warehouses/detail", roles: ["admin"] },
    ],
  },
  {
    label: "Dispatch & Buyers",
    path: "/biomass/dispatch",
    sections: [
      { label: "Factory Dispatches", path: "/biomass/dispatch" },
      { label: "Industrial Buyer Directory", path: "/biomass/buyers" },
      { label: "Register New Buyer", path: "/biomass/buyers/create" },
    ],
    badge: true,
  },
  {
    label: "Biomass Master Tracker",
    path: "/biomass",
    sections: ["Master Tracker"],
    badge: true,
  },
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
