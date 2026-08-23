const fs = require("fs");
const path = require("path");

const srcDir = path.join(process.cwd(), "src");

function findJSXFiles(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findJSXFiles(full));
    } else if (entry.name.endsWith(".jsx")) {
      results.push(full);
    }
  }
  return results;
}

const files = findJSXFiles(srcDir);
let foundAny = false;

for (const f of files) {
  const content = fs.readFileSync(f, "utf8");
  // Check if any lucide-react import includes LucideIconWrapper
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('from "lucide-react"') && line.includes("LucideIconWrapper")) {
      console.log(`${path.relative(process.cwd(), f)}:${i + 1}: LucideIconWrapper still imported from lucide-react`);
      foundAny = true;
    }
  }
}

if (!foundAny) {
  console.log("No stale LucideIconWrapper imports from lucide-react found.");
}
