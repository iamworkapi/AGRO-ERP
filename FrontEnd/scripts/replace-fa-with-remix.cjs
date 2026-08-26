const fs = require("fs");
const path = require("path");

const SRC_DIR = path.join(__dirname, "..", "src");

const MORE_FA_TO_REMIX = [
  { fa: /fa-solid fa-camera/g, ri: "ri-camera-line" },
  { fa: /fa-solid fa-id-card-clip/g, ri: "ri-id-card-line" },
  { fa: /fa-solid fa-id-card/g, ri: "ri-id-card-line" },
  { fa: /fa-solid fa-briefcase/g, ri: "ri-briefcase-line" },
  { fa: /fa-solid fa-address-book/g, ri: "ri-contacts-book-line" },
  { fa: /fa-solid fa-kit-medical/g, ri: "ri-first-aid-kit-line" },
  { fa: /fa-solid fa-tree-city/g, ri: "ri-community-line" },
  { fa: /fa-solid fa-headset/g, ri: "ri-customer-service-2-line" },
  { fa: /fa-solid fa-hashtag/g, ri: "ri-hashtag" },
  { fa: /fa-solid fa-wand-magic-sparkles/g, ri: "ri-magic-line" },
  { fa: /fa-solid fa-scale-unbalanced-flip/g, ri: "ri-scales-line" },
  { fa: /fa-solid fa-scale-unbalanced/g, ri: "ri-scales-line" },
  { fa: /fa-solid fa-calculator/g, ri: "ri-calculator-line" },
  { fa: /fa-solid fa-network-wired/g, ri: "ri-node-tree" },
  { fa: /fa-solid fa-chart-area/g, ri: "ri-line-chart-line" },
  { fa: /fa-solid fa-right-to-bracket/g, ri: "ri-login-box-line" },
  { fa: /fa-solid fa-hourglass-half/g, ri: "ri-hourglass-line" },
  { fa: /fa-solid fa-umbrella-beach/g, ri: "ri-sun-cloudy-line" },
  { fa: /fa-solid fa-notes-medical/g, ri: "ri-nurse-line" },
  { fa: /fa-solid fa-plane-departure/g, ri: "ri-flight-takeoff-line" },
  { fa: /fa-solid fa-list-check/g, ri: "ri-list-check" },
  { fa: /fa-solid fa-comment-dots/g, ri: "ri-chat-3-line" },
  { fa: /fa-solid fa-paper-plane/g, ri: "ri-send-plane-line" },
  { fa: /fa-solid fa-crown/g, ri: "ri-vip-crown-line" },
  { fa: /fa-solid fa-cart-flatbed/g, ri: "ri-shopping-bag-3-line" },
  { fa: /fa-solid fa-copy/g, ri: "ri-file-copy-line" },
  { fa: /fa-solid fa-barcode/g, ri: "ri-barcode-line" },
  { fa: /fa-solid fa-table-cells/g, ri: "ri-table-line" },
  { fa: /fa-solid fa-grid-2/g, ri: "ri-layout-grid-line" },
  { fa: /fa-solid fa-list/g, ri: "ri-list-unordered" },
  { fa: /fa-solid fa-clock-rotate-left/g, ri: "ri-history-line" },
  { fa: /fa-solid fa-diagram-project/g, ri: "ri-git-merge-line" },
  { fa: /fa-solid fa-microchip/g, ri: "ri-cpu-line" },
  { fa: /fa-solid fa-file-signature/g, ri: "ri-edit-box-line" },
  { fa: /fa-solid fa-file-circle-check/g, ri: "ri-file-check-line" },
  { fa: /fa-solid fa-bell-slash/g, ri: "ri-notification-off-line" },
  { fa: /fa-solid fa-key/g, ri: "ri-key-line" },
  { fa: /fa-solid fa-fingerprint/g, ri: "ri-fingerprint-line" },
  { fa: /fa-solid fa-shield-halved/g, ri: "ri-shield-check-line" },
  { fa: /fa-solid fa-toggle-on/g, ri: "ri-toggle-line" },
  { fa: /fa-solid fa-cloud-arrow-up/g, ri: "ri-upload-cloud-line" },
  { fa: /fa-solid fa-circle-play/g, ri: "ri-play-circle-line" },
  { fa: /fa-solid fa-circle-pause/g, ri: "ri-pause-circle-line" },
  { fa: /fa-solid fa-eye-slash/g, ri: "ri-eye-off-line" },
  { fa: /fa-solid fa-eye/g, ri: "ri-eye-line" },
  // Generic fallback for any other fa-solid fa-xxx
  { fa: /fa-solid fa-([a-z0-9-]+)/g, ri: "ri-$1-line" },
  { fa: /fa-regular fa-([a-z0-9-]+)/g, ri: "ri-$1-line" },
];

function processDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processDir(fullPath);
    } else if (entry.isFile() && /\.(jsx?|tsx?|html|css)$/.test(entry.name)) {
      let content = fs.readFileSync(fullPath, "utf8");
      let changed = false;
      for (const { fa, ri } of MORE_FA_TO_REMIX) {
        if (fa.test(content)) {
          content = content.replace(fa, ri);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content, "utf8");
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDir(SRC_DIR);
console.log("Full Remix Icon migration completed!");
