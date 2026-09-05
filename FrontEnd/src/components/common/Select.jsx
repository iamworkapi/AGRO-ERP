import { Dropdown } from "primereact/dropdown";

export default function Select({
  value,
  onChange,
  options = [],
  placeholder = "Select...",
  style,
  inputStyle,
  disabled = false,
  hasLeftIcon = false,
  error = false,
  filter = false,
  showClear = false,
  className = "",
  onFocus,
  onBlur,
}) {
  const safeOptions = Array.isArray(options) ? options : [];
  const normalized = safeOptions.map((opt) =>
    typeof opt === "object" && opt !== null ? opt : { value: opt, label: String(opt ?? "") }
  );

  const isInvalid = Boolean(error);

  const mergedStyle = {
    width: "100%",
    ...style,
  };

  const mergedInputStyle = {
    border: "none",
    borderBottom: "none",
    boxShadow: "none",
    background: "transparent",
    outline: "none",
    ...inputStyle,
  };

  return (
    <Dropdown
      value={value ?? null}
      options={normalized}
      optionLabel="label"
      optionValue="value"
      onChange={(e) => onChange?.(e.value)}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled}
      filter={filter || normalized.length > 8}
      showClear={showClear}
      appendTo={typeof window !== "undefined" ? document.body : "self"}
      style={mergedStyle}
      className={`app-select-dropdown ${hasLeftIcon ? "has-left-icon" : ""} ${isInvalid ? "p-invalid has-error" : ""} ${className}`}
    />
  );
}
