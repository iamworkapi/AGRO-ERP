// Navigation configuration with role-based permissions.
// Each group carries an `icon` key pointing to a RemixIcon class string;
// SidebarGroup renders it inside a rounded icon badge.
// roles: ["admin"] on a group or section hides it from Supervisors.
export const NAV_GROUPS = [
  {
    label: "Overview",
    path: "/",
    icon: "ri-dashboard-3-line",
    sections: ["Dashboard"],
  },
  {
    label: "Biomass Vendors",
    path: "/biomass/vendors",
    icon: "ri-store-2-line",
    roles: ["admin", "supervisor"],
    sections: [
      { label: "Vendor Directory", path: "/biomass/vendors" },
      { label: "Add Vendor", path: "/biomass/vendors/create", roles: ["admin", "supervisor"] },
    ],
    badge: true,
  },
  {
    label: "Weighment Slips",
    path: "/weighment",
    icon: "ri-scales-3-line",
    roles: ["admin", "supervisor"],
    sections: [
      { label: "All Slips", path: "/weighment" },
      { label: "New Slip", path: "/weighment/new", roles: ["admin", "supervisor"] },
      { label: "Weight Machines", path: "/weighment/machines", roles: ["admin", "supervisor"] },
      { label: "Deduction Slabs", path: "/weighment/deduction-slabs", roles: ["admin"] },
    ],
    badge: true,
  },
  {
    label: "Storage & Stacks",
    path: "/biomass/storage",
    icon: "ri-archive-stack-line",
    roles: ["admin", "supervisor"],
    sections: [
      { label: "Yard Stacks & Probes", path: "/biomass/storage" },
      { label: "Storage Rooms", path: "/warehouses/rooms", roles: ["admin", "supervisor"] },
      { label: "Allocate New Stack", path: "/biomass/storage/create", roles: ["admin", "supervisor"] },
      { label: "Warehouse Ops", path: "/warehouses/detail", roles: ["admin"] },
    ],
  },
  {
    label: "Factory Dispatch",
    path: "/biomass/dispatch",
    icon: "ri-truck-line",
    roles: ["admin", "supervisor"],
    sections: [
      { label: "Gate Pass & Dispatches", path: "/biomass/dispatch" },
      { label: "Industrial Buyers", path: "/biomass/buyers", roles: ["admin", "supervisor"] },
      { label: "Add Industrial Buyer", path: "/biomass/buyers/create", roles: ["admin", "supervisor"] },
    ],
    badge: true,
  },
  {
    label: "Warehouses",
    path: "/warehouses",
    icon: "ri-building-line",
    sections: [
      { label: "All Warehouses", path: "/warehouses" },
      { label: "Add Warehouse", path: "/warehouses/create", roles: ["admin", "super_admin"] },
      { label: "Admin & Supervisor Management", path: "/warehouses/admin-management", roles: ["admin", "super_admin"] },
      { label: "Warehouse Detail", path: "/warehouses/detail", roles: ["admin"] },
      { label: "Storage Rooms", path: "/warehouses/rooms", roles: ["admin", "supervisor"] },
    ],
  },
  {
    label: "Inventory",
    path: "/inventory",
    icon: "ri-archive-line",
    roles: ["admin", "supervisor"],
    sections: [
      { label: "Stock Overview", path: "/inventory" },
      { label: "Parts Master", path: "/inventory/items", roles: ["admin"] },
      { label: "Low Stock Alerts", path: "/inventory/low-stock-alerts", roles: ["admin"] },
    ],
    badge: true,
  },
  {
    label: "Purchase",
    path: "/purchase",
    icon: "ri-shopping-cart-line",
    roles: ["admin", "supervisor"],
    sections: [
      { label: "Purchase Orders", path: "/purchase" },
      { label: "Vendor Master", path: "/purchase/vendors", roles: ["admin"] },
      { label: "Biomass Vendors", path: "/biomass/vendors", roles: ["admin"] },
      { label: "Add Biomass Vendor", path: "/biomass/vendors/create", roles: ["admin"] },
    ],
  },
  {
    label: "Sales & Billing",
    path: "/sales",
    icon: "ri-file-list-3-line",
    roles: ["admin", "supervisor"],
    sections: [
      { label: "Invoices", path: "/sales" },
      { label: "Customer Master", path: "/sales/customer-master-ledger", roles: ["admin"] },
      { label: "Industrial Buyers", path: "/biomass/buyers", roles: ["admin"] },
      { label: "Add Buyer", path: "/biomass/buyers/create", roles: ["admin"] },
    ],
  },
  {
    label: "Products",
    path: "/products",
    icon: "ri-shopping-bag-2-line",
    roles: ["admin", "supervisor"],
    sections: [
      { label: "All Products", path: "/products" },
      { label: "Add Product", path: "/products/create", roles: ["admin", "supervisor"] },
    ],
    badge: true,
  },
  {
    label: "Goods & Invoices",
    path: "/goods",
    icon: "ri-file-list-3-line",
    roles: ["admin", "supervisor"],
    sections: [
      { label: "Goods Register", path: "/goods" },
      { label: "Add Invoice", path: "/goods/create", roles: ["admin", "supervisor"] },
      { label: "Customer Master", path: "/sales/customer-master-ledger", roles: ["admin"] },
    ],
  },
  {
    label: "Employees",
    path: "/employees",
    icon: "ri-team-line",
    sections: [
      { label: "Directory", path: "/employees" },
      { label: "Task Assignment", path: "/employees/tasks", roles: ["admin", "supervisor"] },
      { label: "Leave Requests", path: "/employees/leave-requests", roles: ["admin", "supervisor"] },
    ],
  },
  {
    label: "Reports",
    path: "/reports",
    icon: "ri-bar-chart-box-line",
    sections: [
      { label: "Analytics Centre", path: "/reports" },
      { label: "Export MIS Reports", path: "/reports/export", roles: ["admin", "supervisor"] },
    ],
  },
  {
    label: "Alerts & Events",
    path: "/alerts",
    icon: "ri-alarm-warning-line",
    sections: ["All Exceptions"],
    badge: true,
  },
  {
    label: "Settings",
    path: "/settings/my-profile",
    icon: "ri-settings-3-line",
    sections: [
      { label: "My Profile", path: "/settings/my-profile" },
    ],
  },
];
