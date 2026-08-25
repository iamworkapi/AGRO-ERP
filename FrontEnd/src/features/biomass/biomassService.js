// Biomass Supply Chain Data Service

const LOCAL_STORAGE_KEY_BUYERS = "agro_biomass_buyers_v1";
const LOCAL_STORAGE_KEY_VENDORS = "agro_biomass_vendors_v1";
const LOCAL_STORAGE_KEY_COLLECTIONS = "agro_biomass_collections_v1";
const LOCAL_STORAGE_KEY_DISPATCHES = "agro_biomass_dispatches_v1";

// 1. PRE-SAVED BUYERS (jise hum maal detay hai - Stage 4)
export const DEFAULT_BUYERS = [
  {
    id: "BUYER-RELIANCE-01",
    buyerCode: "KGABYR001",
    name: "RELIANCE INDUSTRIES LIMITED",
    division: "BARABANKI MFG. DIVISION",
    address: "DEWARO P.O. VILLAGE GATA NO. 389 MIN 371, SONIKPUR HAIDARGARH, BARABANKI-Distt: UTTAR PRADESH",
    gstin: "09AAACR5055K2Z4",
    contactPerson: "Mr. S. K. Singh (Plant Purchase Head)",
    contactMobile: "9876543210",
    email: "procurement.barabanki@ril.com",
    plantType: "CBG Plant / Ethanol Division",
    targetQtyMt: 5000,
    agreedRatePerMt: 1850,
    fulfilledQtyMt: 2450.0,
    status: "ACTIVE",
    poNo: "RIL-CBG-2026-09",
    paymentTerms: "Net 15 Days",
  },
  {
    id: "BUYER-BALRAMPUR-02",
    buyerCode: "KGABYR002",
    name: "BALRAMPUR CHINI MILLS LTD. (BIO-ETHANOL DIVISION)",
    division: "BABHNAN BIO-MASS UNIT",
    address: "GONDA-GORAKHPUR HIGHWAY, GONDA, UTTAR PRADESH",
    gstin: "09AAACB1234F1Z9",
    contactPerson: "Mr. R. P. Sharma (Commercial VP)",
    contactMobile: "9415012345",
    email: "biofuel@balrampurchini.com",
    plantType: "Bio-Ethanol Plant",
    targetQtyMt: 3500,
    agreedRatePerMt: 1950,
    fulfilledQtyMt: 1820.0,
    status: "ACTIVE",
    poNo: "BCML-ETH-2026-44",
    paymentTerms: "Net 7 Days",
  },
  {
    id: "BUYER-NTPC-03",
    buyerCode: "KGABYR003",
    name: "NTPC BIOMASS POWER LIMITED",
    division: "UNCHAHAR THERMAL CO-FIRING PROJECT",
    address: "NTPC UNCHAHAR THERMAL POWER STATION, RAEBARELI, UP-229406",
    gstin: "09AAACN0255P1ZO",
    contactPerson: "Mr. Alok Mukherjee (DGM Biomass Sourcing)",
    contactMobile: "9839002233",
    email: "biomass.unchahar@ntpc.co.in",
    plantType: "Biomass Power Plant (Co-firing)",
    targetQtyMt: 4000,
    agreedRatePerMt: 2100,
    fulfilledQtyMt: 1200.0,
    status: "ACTIVE",
    poNo: "NTPC-BIO-2026-118",
    paymentTerms: "Net 30 Days",
  },
  {
    id: "BUYER-DALMIA-04",
    buyerCode: "KGABYR004",
    name: "DALMIA BHARAT SUGAR & BIO-ENERGY",
    division: "NIGOHI DISTILLERY & CBG PLANT",
    address: "NIGOHI, DISTT SHAHJAHANPUR, UTTAR PRADESH-242407",
    gstin: "09AAACD3391K1Z2",
    contactPerson: "Mr. Vikas Tiwari (Procurement Manager)",
    contactMobile: "9412998811",
    email: "bioenergy.nigohi@dalmiasugar.com",
    plantType: "CBG & Bio-Energy Plant",
    targetQtyMt: 2800,
    agreedRatePerMt: 1900,
    fulfilledQtyMt: 950.0,
    status: "ACTIVE",
    poNo: "DALMIA-CBG-2026-03",
    paymentTerms: "Net 15 Days",
  },
];

// 2. PRE-SAVED VENDORS (jise hum maal lete hai - Stage 1)
export const DEFAULT_VENDORS = [
  {
    id: "VENDOR-JYOTI-01",
    vendorCode: "KGASPL001",
    companyName: "JYOTI ENTERPRISES AND CONTRACTOR",
    gstin: "09IYZPS0291E1ZK",
    panNo: "IYZPS0291E",
    representative: "Mr. Bhanu Singh",
    contactNo: "7523841717",
    email: "jyotisinghllb1@gmail.com",
    address: "ANANDPURAM COLONY KANUJIA H STAR MARRIAGE LAWN SAHJHANPUR, UP-242001 INDIA",
    sourcingArea: "Unnao & Shahjahanpur Belt (35 Villages)",
    poNo: "20260501",
    poDate: "30-05-2026",
    tenure: "30.05.2026 to 30.09.2026",
    contractedQtyMt: 1500,
    agreedPricePerMt: 1400,
    fulfilledQtyMt: 780.5,
    status: "ACTIVE",
    bankName: "State Bank of India",
    accountNo: "XXXX-XXXX-3891",
    ifscCode: "SBIN0001234",
  },
  {
    id: "VENDOR-KISAAN-FED-02",
    vendorCode: "KGASPL002",
    companyName: "FARMER PRODUCER COOPERATIVE (UNNAO HUB)",
    gstin: "09AAFCU8812K1Z3",
    panNo: "AAFCU8812K",
    representative: "Sardar Gurpreet Singh",
    contactNo: "9839120456",
    email: "unnao.fpo@agrimail.com",
    address: "VILLAGE KANUJIA, DISTT UNNAO, UTTAR PRADESH",
    sourcingArea: "Unnao Surroundings (45 Villages)",
    poNo: "20260502",
    poDate: "01-06-2026",
    tenure: "01.06.2026 to 15.10.2026",
    contractedQtyMt: 2500,
    agreedPricePerMt: 1350,
    fulfilledQtyMt: 1240.0,
    status: "ACTIVE",
    bankName: "Punjab National Bank",
    accountNo: "XXXX-XXXX-5520",
    ifscCode: "PUNB0123400",
  },
  {
    id: "VENDOR-AWADH-03",
    vendorCode: "KGASPL003",
    companyName: "AWADH AGRO BIOMASS SOURCING CO.",
    gstin: "09ABWPA5521L1ZM",
    panNo: "ABWPA5521L",
    representative: "Mr. Rakesh Pandey",
    contactNo: "9451882310",
    email: "awadh.biomass@gmail.com",
    address: "HAIDARGARH ROAD, HARDOI & UNNAO BORDER, UP",
    sourcingArea: "Hardoi & Haidargarh Belt (20 Villages)",
    poNo: "20260503",
    poDate: "10-06-2026",
    tenure: "10.06.2026 to 31.10.2026",
    contractedQtyMt: 1800,
    agreedPricePerMt: 1420,
    fulfilledQtyMt: 410.2,
    status: "ACTIVE",
    bankName: "HDFC Bank",
    accountNo: "XXXX-XXXX-9912",
    ifscCode: "HDFC0000845",
  },
  {
    id: "VENDOR-KISSAN-SEVA-04",
    vendorCode: "KGASPL004",
    companyName: "KISSAN SEVA SAMITI AGRO FEDERATION",
    gstin: "09AAATK9911C1ZX",
    panNo: "AAATK9911C",
    representative: "Chaudhary Virendra Yadav",
    contactNo: "9838001144",
    email: "kissan.samiti@yahoo.co.in",
    address: "BLOCK PURWA, DISTT UNNAO, UP-209825",
    sourcingArea: "Purwa & Asoha Blocks (28 Villages)",
    poNo: "20260504",
    poDate: "15-06-2026",
    tenure: "15.06.2026 to 15.11.2026",
    contractedQtyMt: 2000,
    agreedPricePerMt: 1380,
    fulfilledQtyMt: 620.0,
    status: "ACTIVE",
    bankName: "Bank of Baroda",
    accountNo: "XXXX-XXXX-1104",
    ifscCode: "BARB0PURWAX",
  },
];

// 3. VILLAGE CLUSTERS & HARVEST NETWORK (50-100 Villages)
export const DEFAULT_VILLAGES = [
  { id: "VIL-01", name: "Kanujia Village (कनौजिया)", block: "Sikandarpur", distanceKm: 8, registeredFarmers: 42, totalTonnageDeliveredMt: 420.5, primaryCrop: "Paddy Straw", status: "ACTIVE SOURCING" },
  { id: "VIL-02", name: "Sahjanwa (सहजनवा)", block: "Nawabganj", distanceKm: 14, registeredFarmers: 38, totalTonnageDeliveredMt: 380.0, primaryCrop: "Paddy & Wheat Straw", status: "ACTIVE SOURCING" },
  { id: "VIL-03", name: "Bansgaon (बांसगांव)", block: "Purwa", distanceKm: 22, registeredFarmers: 29, totalTonnageDeliveredMt: 290.4, primaryCrop: "Wheat Straw", status: "ACTIVE SOURCING" },
  { id: "VIL-04", name: "Rampur Grant (रामपुर ग्रांट)", block: "Asoha", distanceKm: 18, registeredFarmers: 31, totalTonnageDeliveredMt: 310.8, primaryCrop: "Maize Stalk", status: "ACTIVE SOURCING" },
  { id: "VIL-05", name: "Gauri Kalan (गौरी कलां)", block: "Hasanganj", distanceKm: 25, registeredFarmers: 24, totalTonnageDeliveredMt: 215.0, primaryCrop: "Paddy Straw", status: "ACTIVE SOURCING" },
  { id: "VIL-06", name: "Miyanganj (मियांगंज)", block: "Miyanganj", distanceKm: 30, registeredFarmers: 35, totalTonnageDeliveredMt: 340.2, primaryCrop: "Multi-Crop Biomass", status: "ACTIVE SOURCING" },
  { id: "VIL-07", name: "Bichhiya (बिछिया)", block: "Bichhiya", distanceKm: 12, registeredFarmers: 28, totalTonnageDeliveredMt: 260.6, primaryCrop: "Paddy Straw", status: "ACTIVE SOURCING" },
  { id: "VIL-08", name: "Safipur Rural (सफीपुर ग्रामीण)", block: "Safipur", distanceKm: 34, registeredFarmers: 40, totalTonnageDeliveredMt: 410.0, primaryCrop: "Mustard Husk & Paddy", status: "ACTIVE SOURCING" },
];

// 4. WAREHOUSE & TCC DETAILS (Left side section - Stage 3)
export const DEFAULT_WAREHOUSE_TCC = {
  name: "UNNAO TRANSIT COLLECTION CENTRE (TCC HUB-01)",
  code: "TCC-UNNAO-MAIN",
  location: "Unnao, Uttar Pradesh",
  sourcingArea: "Unnao, Kanujia & 50-100 Surrounding Villages",
  totalCapacityMt: 15000,
  activeStockMt: 4820.5,
  totalBalesCount: 16068,
  activeStacks: 14,
  fireSafetyScore: "98.5% (Safe)",
  supervisorName: "Mr. Jagdeep Singh",
  supervisorPhone: "7055000315",
  officialEmail: "kusumganga5@gmail.com",
};

// 4.1 YARD STACKING MASTER (Image 3 Specs: Tons & Bales)
export const DEFAULT_STACKS = [
  {
    id: "STACK-PAD-101",
    stackCode: "STACK-PAD-101 (Zone A)",
    zone: "Zone A",
    cropId: "paddy_straw",
    cropName: "Paddy Straw",
    cropBadge: "Paddy Straw",
    cropBadgeBg: "#D1FAE5",
    cropBadgeColor: "#059669",
    tonnageMt: 1450.0,
    baleCount: 4830,
    baleType: "Round Bales",
    probeTempC: 28,
    tempStatus: "Normal",
    fireSafetyScore: "99.0% (Safe)",
    humidityPct: 16.5,
    stackDate: "2026-08-10",
    warehouseCode: "TCC-UNNAO-MAIN",
    status: "ACTIVE STACK",
  },
  {
    id: "STACK-MZE-305",
    stackCode: "STACK-MZE-305 (Zone B)",
    zone: "Zone B",
    cropId: "maize_stalk",
    cropName: "Maize Stem",
    cropBadge: "Maize Stem",
    cropBadgeBg: "#FEF3C7",
    cropBadgeColor: "#D97706",
    tonnageMt: 2120.5,
    baleCount: 7060,
    baleType: "Bales",
    probeTempC: 31,
    tempStatus: "Monitored",
    fireSafetyScore: "97.8% (Monitored)",
    humidityPct: 18.2,
    stackDate: "2026-08-08",
    warehouseCode: "TCC-UNNAO-MAIN",
    status: "ACTIVE STACK",
  },
  {
    id: "STACK-WHT-202",
    stackCode: "STACK-WHT-202 (Zone C)",
    zone: "Zone C",
    cropId: "wheat_straw",
    cropName: "Wheat Straw",
    cropBadge: "Wheat Straw",
    cropBadgeBg: "#DBEAFE",
    cropBadgeColor: "#2563EB",
    tonnageMt: 1250.0,
    baleCount: 4178,
    baleType: "Bales",
    probeTempC: 26,
    tempStatus: "Normal",
    fireSafetyScore: "99.5% (Safe)",
    humidityPct: 14.8,
    stackDate: "2026-08-05",
    warehouseCode: "TCC-UNNAO-MAIN",
    status: "ACTIVE STACK",
  },
  {
    id: "STACK-PAD-104",
    stackCode: "STACK-PAD-104 (Zone B)",
    zone: "Zone B",
    cropId: "paddy_straw",
    cropName: "Paddy Straw",
    cropBadge: "Paddy Straw",
    cropBadgeBg: "#D1FAE5",
    cropBadgeColor: "#059669",
    tonnageMt: 850.0,
    baleCount: 2833,
    baleType: "Bales",
    probeTempC: 27,
    tempStatus: "Normal",
    fireSafetyScore: "98.2% (Safe)",
    humidityPct: 17.0,
    stackDate: "2026-08-11",
    warehouseCode: "TCC-UNNAO-MAIN",
    status: "ACTIVE STACK",
  },
];

const LOCAL_STORAGE_KEY_STACKS = "agro_biomass_stacks_v1";

export function getStoredStacks() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_STACKS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_STACKS;
}

export function saveNewStack(stack) {
  const stacks = getStoredStacks();
  const newObj = {
    id: `STACK-${Date.now()}`,
    stackCode: stack.stackCode || `STACK-${stack.zone || "Zone A"}-${Math.floor(100 + Math.random() * 900)}`,
    status: "ACTIVE STACK",
    ...stack,
  };
  const updated = [newObj, ...stacks];
  localStorage.setItem(LOCAL_STORAGE_KEY_STACKS, JSON.stringify(updated));
  return updated;
}

export function updateStack(id, updatedFields) {
  const stacks = getStoredStacks();
  const updated = stacks.map((s) => (s.id === id ? { ...s, ...updatedFields } : s));
  localStorage.setItem(LOCAL_STORAGE_KEY_STACKS, JSON.stringify(updated));
  return updated;
}

export function deleteStack(id) {
  const stacks = getStoredStacks();
  const updated = stacks.filter((s) => s.id !== id);
  localStorage.setItem(LOCAL_STORAGE_KEY_STACKS, JSON.stringify(updated));
  return updated;
}

// 5. CROP SPECIFICATIONS
export const CROPS_MASTER = [
  {
    id: "paddy_straw",
    name: "Paddy Straw (धान की पराली)",
    englishName: "Paddy Straw",
    hindiName: "धान की पराली",
    defaultRateMt: 1900,
    agreedMoisture: 20,
    agreedAsh: 20,
    maxMoistureLimit: 28,
    maxAshLimit: 35,
    balingYieldPct: 92,
  },
  {
    id: "wheat_straw",
    name: "Wheat Straw (गेहूं का भूसा/पराली)",
    englishName: "Wheat Straw",
    hindiName: "गेहूं का भूसा",
    defaultRateMt: 2400,
    agreedMoisture: 15,
    agreedAsh: 15,
    maxMoistureLimit: 25,
    maxAshLimit: 30,
    balingYieldPct: 95,
  },
  {
    id: "maize_stalk",
    name: "Maize Stalk / Stem Bales (मक्का का डंठल)",
    englishName: "Maize Stem Round Bales",
    hindiName: "मक्का का डंठल",
    defaultRateMt: 1400,
    agreedMoisture: 20,
    agreedAsh: 20,
    maxMoistureLimit: 28,
    maxAshLimit: 35,
    balingYieldPct: 90,
  },
  {
    id: "mustard_husk",
    name: "Mustard Husk / Tuuri (सरसों तूड़ी)",
    englishName: "Mustard Husk",
    hindiName: "सरसों तूड़ी",
    defaultRateMt: 2100,
    agreedMoisture: 16,
    agreedAsh: 18,
    maxMoistureLimit: 24,
    maxAshLimit: 28,
    balingYieldPct: 94,
  },
];

// Helper: Image 2 & PDF Page 2 GRN Lorry Weight Formula
// Invoice Weight = Actual Weighbridge Wt * (100% - Actual Moist% - Actual Ash%) / (100% - Agreed Moist% - Agreed Ash%)
export function calculateGrnInvoiceWeight({
  actualWeightMt,
  actualMoisturePct = 20,
  actualAshPct = 20,
  agreedMoisturePct = 20,
  agreedAshPct = 20,
}) {
  const actualWt = Number(actualWeightMt) || 0;
  const moist = Number(actualMoisturePct) || 0;
  const ash = Number(actualAshPct) || 0;
  const agreedMoist = Number(agreedMoisturePct) || 20;
  const agreedAsh = Number(agreedAshPct) || 20;

  // Check Rejection criteria
  if (moist > 28) {
    return {
      isRejected: true,
      rejectionReason: `Vehicle REJECTED: Moisture content (${moist}%) exceeds maximum allowable limit of 28%.`,
      invoiceWeightMt: 0,
      deductionMt: actualWt,
    };
  }

  if (ash > 35) {
    return {
      isRejected: true,
      rejectionReason: `Vehicle REJECTED: Ash content (${ash}%) exceeds maximum allowable limit of 35%.`,
      invoiceWeightMt: 0,
      deductionMt: actualWt,
    };
  }

  const numerator = 100 - moist - ash;
  const denominator = 100 - agreedMoist - agreedAsh;

  if (denominator <= 0 || numerator <= 0) {
    return {
      isRejected: true,
      rejectionReason: "Invalid quality parameters entered.",
      invoiceWeightMt: 0,
      deductionMt: actualWt,
    };
  }

  const invoiceWeightMt = Number((actualWt * (numerator / denominator)).toFixed(3));
  const deductionMt = Number(Math.max(0, actualWt - invoiceWeightMt).toFixed(3));

  return {
    isRejected: false,
    rejectionReason: null,
    invoiceWeightMt,
    deductionMt,
    ratioMultiplier: Number((numerator / denominator).toFixed(4)),
  };
}

// Store helpers: Buyers
export function getStoredBuyers() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_BUYERS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_BUYERS;
}

export function saveNewBuyer(buyer) {
  const buyers = getStoredBuyers();
  const newObj = {
    id: `BUYER-${Date.now()}`,
    buyerCode: `KGABYR${String(buyers.length + 1).padStart(3, "0")}`,
    fulfilledQtyMt: 0,
    status: "ACTIVE",
    ...buyer,
  };
  const updated = [newObj, ...buyers];
  localStorage.setItem(LOCAL_STORAGE_KEY_BUYERS, JSON.stringify(updated));
  return updated;
}

export function updateBuyer(id, updatedFields) {
  const buyers = getStoredBuyers();
  const updated = buyers.map((b) => (b.id === id ? { ...b, ...updatedFields } : b));
  localStorage.setItem(LOCAL_STORAGE_KEY_BUYERS, JSON.stringify(updated));
  return updated;
}

export function deleteBuyer(id) {
  const buyers = getStoredBuyers();
  const updated = buyers.filter((b) => b.id !== id);
  localStorage.setItem(LOCAL_STORAGE_KEY_BUYERS, JSON.stringify(updated));
  return updated;
}

export function getBuyerById(id) {
  const buyers = getStoredBuyers();
  return buyers.find((b) => b.id === id) || null;
}

// Store helpers: Vendors
export function getStoredVendors() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_VENDORS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_VENDORS;
}

export function saveNewVendor(vendor) {
  const vendors = getStoredVendors();
  const newObj = {
    id: `VENDOR-${Date.now()}`,
    vendorCode: `KGASPL${String(vendors.length + 1).padStart(3, "0")}`,
    fulfilledQtyMt: 0,
    status: "ACTIVE",
    ...vendor,
  };
  const updated = [newObj, ...vendors];
  localStorage.setItem(LOCAL_STORAGE_KEY_VENDORS, JSON.stringify(updated));
  return updated;
}

export function updateVendor(id, updatedFields) {
  const vendors = getStoredVendors();
  const updated = vendors.map((v) => (v.id === id ? { ...v, ...updatedFields } : v));
  localStorage.setItem(LOCAL_STORAGE_KEY_VENDORS, JSON.stringify(updated));
  return updated;
}

export function deleteVendor(id) {
  const vendors = getStoredVendors();
  const updated = vendors.filter((v) => v.id !== id);
  localStorage.setItem(LOCAL_STORAGE_KEY_VENDORS, JSON.stringify(updated));
  return updated;
}

export function getVendorById(id) {
  const vendors = getStoredVendors();
  return vendors.find((v) => v.id === id) || null;
}

// Sample Collections Data (Stage 1)
export const INITIAL_COLLECTIONS = [
  {
    id: "COL-801",
    slipNo: "RST-2026-801",
    date: "2026-08-14",
    time: "09:30 AM",
    villageName: "Kanujia Village (कनौजिया)",
    farmerName: "Ramswaroop Yadav",
    farmerMobile: "9838123456",
    vehicleNo: "UP 32 AT 8841",
    vehicleType: "Tractor Trolley",
    cropId: "maize_stalk",
    cropName: "Maize Stem Round Bales",
    vendorId: "VENDOR-JYOTI-01",
    vendorName: "JYOTI ENTERPRISES AND CONTRACTOR",
    grossWeightMt: 14.5,
    tareWeightMt: 4.5,
    actualNetWeightMt: 10.0,
    actualMoisturePct: 20,
    actualAshPct: 22,
    agreedMoisturePct: 20,
    agreedAshPct: 20,
    invoiceWeightMt: 8.83,
    ratePerMt: 1400,
    totalAmountRs: 12362,
    balerMachine: "High Density Baler HDB-01",
    baleCountProduced: 300,
    stackAssigned: "STACK-PAD-104 (Zone B)",
    status: "PROCESSED & BALED",
    paymentStatus: "PAID",
  },
  {
    id: "COL-802",
    slipNo: "RST-2026-802",
    date: "2026-08-14",
    time: "11:15 AM",
    villageName: "Sahjanwa (सहजनवा)",
    farmerName: "Baldev Singh",
    farmerMobile: "9450987654",
    vehicleNo: "UP 53 CT 1920",
    vehicleType: "Hydraulic Trailer",
    cropId: "paddy_straw",
    cropName: "Paddy Straw",
    vendorId: "VENDOR-JYOTI-01",
    vendorName: "JYOTI ENTERPRISES AND CONTRACTOR",
    grossWeightMt: 18.2,
    tareWeightMt: 6.2,
    actualNetWeightMt: 12.0,
    actualMoisturePct: 18,
    actualAshPct: 19,
    agreedMoisturePct: 20,
    agreedAshPct: 20,
    invoiceWeightMt: 12.6,
    ratePerMt: 1900,
    totalAmountRs: 23940,
    balerMachine: "Square Baler SB-02",
    baleCountProduced: 420,
    stackAssigned: "STACK-PAD-101 (Zone A)",
    status: "PROCESSED & BALED",
    paymentStatus: "PAID",
  },
  {
    id: "COL-803",
    slipNo: "RST-2026-803",
    date: "2026-08-13",
    time: "02:40 PM",
    villageName: "Bansgaon (बांसगांव)",
    farmerName: "Mahendra Kumar",
    farmerMobile: "9792011223",
    vehicleNo: "UP 53 BT 4410",
    vehicleType: "Tractor Trolley",
    cropId: "wheat_straw",
    cropName: "Wheat Straw",
    vendorId: "VENDOR-KISAAN-FED-02",
    vendorName: "FARMER PRODUCER COOPERATIVE (UNNAO HUB)",
    grossWeightMt: 12.0,
    tareWeightMt: 4.0,
    actualNetWeightMt: 8.0,
    actualMoisturePct: 14,
    actualAshPct: 15,
    agreedMoisturePct: 15,
    agreedAshPct: 15,
    invoiceWeightMt: 8.11,
    ratePerMt: 2400,
    totalAmountRs: 19464,
    balerMachine: "Round Baler RB-03",
    baleCountProduced: 280,
    stackAssigned: "STACK-WHT-202 (Zone C)",
    status: "PROCESSED & BALED",
    paymentStatus: "PENDING",
  },
  {
    id: "COL-804",
    slipNo: "RST-2026-804",
    date: "2026-08-13",
    time: "04:10 PM",
    villageName: "Rampur Grant (रामपुर ग्रांट)",
    farmerName: "Jagdish Prasad",
    farmerMobile: "9919876543",
    vehicleNo: "UP 32 BK 7721",
    vehicleType: "Tractor Trolley",
    cropId: "mustard_husk",
    cropName: "Mustard Husk / Tuuri",
    vendorId: "VENDOR-AWADH-03",
    vendorName: "AWADH AGRO BIOMASS SOURCING CO.",
    grossWeightMt: 10.8,
    tareWeightMt: 3.8,
    actualNetWeightMt: 7.0,
    actualMoisturePct: 15,
    actualAshPct: 16,
    agreedMoisturePct: 16,
    agreedAshPct: 18,
    invoiceWeightMt: 7.23,
    ratePerMt: 2100,
    totalAmountRs: 15183,
    balerMachine: "Square Baler SB-01",
    baleCountProduced: 210,
    stackAssigned: "STACK-MZE-305 (Zone B)",
    status: "PROCESSED & BALED",
    paymentStatus: "PAID",
  },
];

// Sample Dispatches Data (Stage 4)
export const INITIAL_DISPATCHES = [
  {
    id: "DISP-901",
    gatePassNo: "GP-2026-901",
    date: "2026-08-14",
    buyerId: "BUYER-RELIANCE-01",
    buyerName: "RELIANCE INDUSTRIES LIMITED",
    division: "BARABANKI MFG. DIVISION",
    gstin: "09AAACR5055K2Z4",
    destination: "BARABANKI MFG. DIVISION, HAIDARGARH",
    vehicleNo: "UP 32 ET 9920",
    vehicleType: "Heavy 14-Wheeler Trailer",
    driverName: "Sukhwinder Singh",
    driverPhone: "9812345678",
    cropName: "Maize Stem Round Bales",
    baleCount: 650,
    dispatchedTonnageMt: 19.5,
    agreedPriceMt: 1850,
    totalInvoiceAmount: 36075,
    ewayBillNo: "221049581920",
    status: "IN TRANSIT TO RELIANCE SITE",
  },
  {
    id: "DISP-902",
    gatePassNo: "GP-2026-902",
    date: "2026-08-13",
    buyerId: "BUYER-BALRAMPUR-02",
    buyerName: "BALRAMPUR CHINI MILLS LTD.",
    division: "BABHNAN BIO-MASS UNIT",
    gstin: "09AAACB1234F1Z9",
    destination: "GONDA BIO-ETHANOL PLANT",
    vehicleNo: "UP 53 DT 3311",
    vehicleType: "Heavy 18-Wheeler Trailer",
    driverName: "Dharmendra Verma",
    driverPhone: "9415998877",
    cropName: "Paddy Straw Bales",
    baleCount: 800,
    dispatchedTonnageMt: 24.0,
    agreedPriceMt: 1950,
    totalInvoiceAmount: 46800,
    ewayBillNo: "221049581944",
    status: "DELIVERED & RECONCILED",
  },
];

export function getStoredCollections() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_COLLECTIONS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_COLLECTIONS;
}

export function saveNewCollection(entry) {
  const collections = getStoredCollections();
  const newObj = {
    id: `COL-${Date.now()}`,
    slipNo: `RST-2026-${Math.floor(800 + Math.random() * 900)}`,
    date: new Date().toISOString().slice(0, 10),
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    status: "PROCESSED & BALED",
    paymentStatus: "PENDING",
    ...entry,
  };
  const updated = [newObj, ...collections];
  localStorage.setItem(LOCAL_STORAGE_KEY_COLLECTIONS, JSON.stringify(updated));
  return updated;
}

export function deleteCollection(id) {
  const collections = getStoredCollections();
  const updated = collections.filter((c) => c.id !== id);
  localStorage.setItem(LOCAL_STORAGE_KEY_COLLECTIONS, JSON.stringify(updated));
  return updated;
}

export function getStoredDispatches() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_DISPATCHES);
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_DISPATCHES;
}

export function saveNewDispatch(dispatch) {
  const dispatches = getStoredDispatches();
  const newObj = {
    id: `DISP-${Date.now()}`,
    gatePassNo: `GP-2026-${Math.floor(900 + Math.random() * 900)}`,
    date: new Date().toISOString().slice(0, 10),
    status: "IN TRANSIT TO SITE",
    ...dispatch,
  };
  const updated = [newObj, ...dispatches];
  localStorage.setItem(LOCAL_STORAGE_KEY_DISPATCHES, JSON.stringify(updated));
  return updated;
}
