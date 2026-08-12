// Biomass Supply Chain Data Service

const LOCAL_STORAGE_KEY_BUYERS = "agro_biomass_buyers_v1";
const LOCAL_STORAGE_KEY_VENDORS = "agro_biomass_vendors_v1";
const LOCAL_STORAGE_KEY_COLLECTIONS = "agro_biomass_collections_v1";
const LOCAL_STORAGE_KEY_DISPATCHES = "agro_biomass_dispatches_v1";

// 1. PRE-SAVED BUYERS (jise hum maal detay hai - Stage 4)
export const DEFAULT_BUYERS = [
  {
    id: "BUYER-RELIANCE-01",
    name: "RELIANCE INDUSTRIES LIMITED",
    division: "BARABANKI MFG. DIVISION",
    address: "DEWARO P.O. VILLAGE GATA NO. 389 MIN 371, SONIKPUR HAIDARGARH, BARABANKI-Distt: UTTAR PRADESH",
    gstin: "09AAACR5055K2Z4",
    contactPerson: "Plant Purchase Head - Reliance Barabanki",
    contactMobile: "9876543210",
    email: "procurement.barabanki@ril.com",
    plantType: "CBG Plant / Ethanol Division",
    targetQtyMt: 5000,
    agreedRatePerMt: 1850,
  },
  {
    id: "BUYER-BALRAMPUR-02",
    name: "BALRAMPUR CHINI MILLS LTD. (BIO-ETHANOL DIVISION)",
    division: "BABHNAN BIO-MASS UNIT",
    address: "GONDA-GORAKHPUR HIGHWAY, GONDA, UTTAR PRADESH",
    gstin: "09AAACB1234F1Z9",
    contactPerson: "Mr. R. P. Sharma",
    contactMobile: "9415012345",
    email: "biofuel@balrampurchini.com",
    plantType: "Ethanol Plant",
    targetQtyMt: 3500,
    agreedRatePerMt: 1950,
  },
];

// 2. PRE-SAVED VENDORS (jise hum maal lete hai - Stage 1)
export const DEFAULT_VENDORS = [
  {
    id: "VENDOR-JYOTI-01",
    vendorCode: "KGASPL001",
    companyName: "JYOTI ENTERPRISES AND CONTRACTOR",
    gstin: "09IYZPS0291E1ZK",
    representative: "Mr. Bhanu Singh",
    contactNo: "7523841717",
    email: "jyotisinghllb1@gmail.com",
    address: "ANANDPURAM COLONY KANUJIA H STAR MARRIAGE LAWN SAHJHANPUR, UP-242001 INDIA",
    sourcingArea: "Unnao & Shahjahanpur Belt",
    poNo: "20260501",
    poDate: "30-05-2026",
    tenure: "30.05.2026 to 30.09.2026",
    contractedQtyMt: 1000,
    agreedPricePerMt: 1400,
  },
  {
    id: "VENDOR-KISAAN-FED-02",
    vendorCode: "KGASPL002",
    companyName: "FARMER PRODUCER COOPERATIVE (UNNAO HUB)",
    gstin: "09AAFCU8812K1Z3",
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
  },
];

// 3. WAREHOUSE & TCC DETAILS (Left side section - Stage 3)
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

// 4. CROP SPECIFICATIONS
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

// Store helpers
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
    ...buyer,
  };
  const updated = [newObj, ...buyers];
  localStorage.setItem(LOCAL_STORAGE_KEY_BUYERS, JSON.stringify(updated));
  return updated;
}

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
    ...vendor,
  };
  const updated = [newObj, ...vendors];
  localStorage.setItem(LOCAL_STORAGE_KEY_VENDORS, JSON.stringify(updated));
  return updated;
}

// Sample Collections Data
export const INITIAL_COLLECTIONS = [
  {
    id: "COL-801",
    slipNo: "RST-2026-801",
    date: "2026-08-12",
    villageName: "Kanujia Village",
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
  },
  {
    id: "COL-802",
    slipNo: "RST-2026-802",
    date: "2026-08-12",
    villageName: "Sahjanwa",
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
  },
  {
    id: "COL-803",
    slipNo: "RST-2026-803",
    date: "2026-08-11",
    villageName: "Bansgaon",
    farmerName: "Mahendra Kumar",
    farmerMobile: "9792011223",
    vehicleNo: "UP 53 BT 4410",
    vehicleType: "Tractor Trolley",
    cropId: "wheat_straw",
    cropName: "Wheat Straw",
    vendorId: "VENDOR-KISAAN-FED-02",
    vendorName: "FARMER PRODUCER COOPERATIVE",
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
  },
];

// Sample Dispatches Data
export const INITIAL_DISPATCHES = [
  {
    id: "DISP-901",
    gatePassNo: "GP-2026-901",
    date: "2026-08-12",
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
    date: "2026-08-11",
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
    status: "PROCESSED & BALED",
    ...entry,
  };
  const updated = [newObj, ...collections];
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
