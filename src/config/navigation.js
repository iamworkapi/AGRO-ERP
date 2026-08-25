// Navigation configuration with role-based permissions
// roles: ["super_admin", "warehouse_admin"] shows for both.
export const NAV_GROUPS = [
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
];
