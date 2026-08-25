// 3x3 "ripple" grid loader (adapted from Uiverse.io by alexruix, restyled
// to the app's brand green instead of the original neon palette). One
// component, used everywhere something needs a loading indicator - see
// AsyncState.jsx (inline section loading) and App.jsx (full-app bootstrap
// splash) - instead of every call site picking its own spinner.
const DELAY_CLASSES = ["", "d1", "d2", "d1", "d2", "d2", "d3", "d3", "d4"];

export default function Loader({ size = 60, label }) {
  const cellSize = Math.max(size / 3 - 4, 4);

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div className="pr-loader" style={{ "--cell-size": `${cellSize}px` }}>
        {DELAY_CLASSES.map((delayClass, i) => (
          <div key={i} className={`pr-loader-cell${delayClass ? ` pr-loader-${delayClass}` : ""}`} />
        ))}
      </div>
      {label && <span style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 500 }}>{label}</span>}
    </div>
  );
}
