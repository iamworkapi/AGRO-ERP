const fs = require("fs");
const files = [
  "src/features/biomass/biomassService.js",
  "src/features/biomass/components/BiomassCollectionSlipModal.jsx",
  "src/features/biomass/components/NewBiomassDispatchModal.jsx",
  "src/pages/BiomassCollection.jsx",
  "src/pages/BiomassProcessing.jsx",
  "src/pages/BiomassStorage.jsx",
  "src/pages/BiomassSupplyChain.jsx",
  "src/pages/Dashboard.jsx",
];
for (const file of files) {
  let content = fs.readFileSync(file, "utf-8");
  let cleaned = content;
  cleaned = cleaned.replace(/\(\s+\)/g, "");
  cleaned = cleaned.replace(/\s+\)/g, ")");
  cleaned = cleaned.replace(/\(\s+/g, "(");
  if (cleaned !== content) {
    fs.writeFileSync(file, cleaned, "utf-8");
    console.log("Fixed: " + file);
  } else {
    console.log("OK: " + file);
  }
}
