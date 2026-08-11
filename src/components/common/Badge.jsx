import { memo } from "react";
import { Tag } from "primereact/tag";

// Legacy call sites pass a domain status string instead of a tone.
const STATUS_TONE = {
  Accepted: "success",
  Pending: "warning",
  Cancel: "error",
};

const TONE_SEVERITY = { success: "success", warning: "warning", error: "danger", info: "info" };

// Rendered in nearly every DataTable status column - memoized for the same
// reason as Avatar (see comment there).
function Badge({ status, tone, variant, children }) {
  const resolvedTone = tone || variant || STATUS_TONE[status] || "warning";
  return <Tag value={children ?? status} severity={TONE_SEVERITY[resolvedTone] || "warning"} rounded />;
}

export default memo(Badge);
