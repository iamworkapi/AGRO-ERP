export const roles = [
  { role: "Super Admin", permissions: "Full system access", users: 1 },
  { role: "Warehouse Admin", permissions: "Warehouse-scoped management access", users: 4 },
  { role: "Supervisor", permissions: "Maintains warehouses and weighment slips", users: 3 },
  { role: "Warehouse Staff", permissions: "Stock, weighment & attendance entry", users: 26 },
  { role: "Field Employee", permissions: "Attendance & task access", users: 18 },
];

export const auditLog = [
  { action: "Weighment slip #18662 approved", user: "R. Tiwari", time: "10:24 AM" },
  { action: "Deduction slab updated \u2014 Maize", user: "Super Admin", time: "Yesterday, 4:12 PM" },
  { action: "New warehouse staff enrolled \u2014 Betiya Hata Store", user: "S. Yadav", time: "Yesterday, 11:05 AM" },
];

export const orgProfile = {
  name: "KUSUMGANGA AGRO SOLUTIONS PVT. LTD.",
  address: "24-A, Sai Complex, Betiya Hata Gorakhpur (U.P.) 273001",
  centres: 12,
  commodity: "PRALLI (Paddy Straw)",
  plan: "PRALLI ERP — 12 Warehouses & Purchase Centers",
};
