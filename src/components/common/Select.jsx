import { Dropdown } from "primereact/dropdown";

// Bare dropdown control, no label - used standalone or via FormField's
// type="select" branch, so a single place owns the select's look and feel.
export default function Select({ value, onChange, options, placeholder = "Select...", style, disabled, hasLeftIcon }) {
  // Plain strings (most pages) use the same text as value and label.
  // {value, label} objects (e.g. picking a profile by id but showing their
  // name) are also supported so callers aren't forced to fake an id-less
  // selection just to satisfy this component.
  const normalized = options.map((opt) => (typeof opt === "object" && opt !== null ? opt : { value: opt, label: opt }));

  return (
    <Dropdown
      value={value || null}
      options={normalized}
      optionLabel="label"
      optionValue="value"
      onChange={(e) => onChange(e.value)}
      placeholder={placeholder}
      disabled={disabled}
      appendTo={typeof window !== "undefined" ? document.body : "self"}
      className={hasLeftIcon ? "has-left-icon" : ""}
      style={{ width: "100%", ...style }}
    />
  );
}
