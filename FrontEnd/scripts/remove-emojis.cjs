const fs = require("fs");
const path = require("path");

const SRC_DIR = path.join(__dirname, "..", "src");

const EMOJI_REPLACEMENTS = [
  { regex: /🚚\s*/g, replace: "" },
  { regex: /📦\s*/g, replace: "" },
  { regex: /🏢\s*/g, replace: "" },
  { regex: /🏬\s*/g, replace: "" },
  { regex: /🌾\s*/g, replace: "" },
  { regex: /🏭\s*/g, replace: "" },
  { regex: /📋\s*/g, replace: "" },
  { regex: /➕\s*/g, replace: "" },
  { regex: /🖨️\s*/g, replace: "" },
  { regex: /📍\s*/g, replace: "" },
  { regex: /⚡\s*/g, replace: "" },
  { regex: /🔒\s*/g, replace: "" },
  { regex: /☀️\s*/g, replace: "" },
  { regex: /🌙\s*/g, replace: "" },
  { regex: /🚜\s*/g, replace: "" },
  { regex: /⚖️\s*/g, replace: "" },
  { regex: /🔥\s*/g, replace: "" },
  { regex: /❄️\s*/g, replace: "" },
  { regex: /🛡️\s*/g, replace: "" },
  { regex: /⚙️\s*/g, replace: "" },
  { regex: /💰\s*/g, replace: "" },
  { regex: /💵\s*/g, replace: "" },
];

function processDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processDir(fullPath);
    } else if (entry.isFile() && /\.(jsx?|tsx?|html)$/.test(entry.name)) {
      let content = fs.readFileSync(fullPath, "utf8");
      let changed = false;
      for (const { regex, replace } of EMOJI_REPLACEMENTS) {
        if (regex.test(content)) {
          content = content.replace(regex, replace);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content, "utf8");
        console.log(`Cleaned emojis in: ${fullPath}`);
      }
    }
  }
}

processDir(SRC_DIR);
console.log("All raw emojis removed and sanitized successfully!");
