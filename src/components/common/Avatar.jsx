import { memo } from "react";
import { Avatar as PrimeAvatar } from "primereact/avatar";

const avatarColors = [
  "#4F46E5", "#059669", "#D97706", "#DC2626", "#7C3AED",
  "#0891B2", "#DB2777", "#EA580C", "#2563EB", "#65A30D",
];

// Rendered per-row in every DataTable that shows a person (Employees, Users,
// Warehouse staff lists) - memoized so a parent re-render (e.g. one row's
// status changing) doesn't re-render every other row's avatar.
function Avatar({ initials, index = 0 }) {
  const bg = avatarColors[index % avatarColors.length];
  return (
    <PrimeAvatar
      label={initials}
      shape="circle"
      style={{ backgroundColor: bg, color: "white", fontWeight: 700, fontSize: 13, flexShrink: 0 }}
    />
  );
}

export default memo(Avatar);
