export const inventoryStats = [
  { label: "Total SKUs", value: "86", trend: "across all warehouses" },
  { label: "Total Stock Value", value: "\u20b93.4Cr", trend: "+6.1% this week" },
  { label: "Low Stock Items", value: "3", trend: "below reorder level" },
  { label: "Batches Ageing > 60 Days", value: "5", trend: "flagged for review" },
];

export const items = [
  { code: "MZ-001", name: "Maize (Grade A)", category: "Commodity", unit: "kg", warehouse: "Manimau Centre", stock: "48,200", reorder: "10,000" },
  { code: "PR-002", name: "PRALLI Bales", category: "Crop Residue", unit: "kg", warehouse: "Betiya Hata Store", stock: "112,400", reorder: "20,000" },
  { code: "SD-014", name: "Hybrid Seed Bags", category: "Seeds", unit: "bags", warehouse: "Sai Complex Yard", stock: "340", reorder: "500" },
  { code: "FT-021", name: "NPK Fertiliser", category: "Fertiliser", unit: "bags", warehouse: "Gorakhpur North", stock: "120", reorder: "300" },
];

export const lowStockAlerts = [
  { item: "Hybrid Seed Bags", warehouse: "Sai Complex Yard", stock: "340 bags", reorder: "500 bags" },
  { item: "NPK Fertiliser", warehouse: "Gorakhpur North", stock: "120 bags", reorder: "300 bags" },
  { item: "Tractor Spare Filters", warehouse: "Manimau Centre", stock: "8 units", reorder: "25 units" },
];
