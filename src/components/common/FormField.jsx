import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import Select from "./Select";

export default function FormField({
  label,
  type = "text",
  value,
  onChange,
  options,
  placeholder,
  required,
  suffix,
  icon,
  compact = false,
  marginBottom = 14,
  style = {},
  inputStyle = {},
  disabled = false,
  // Externally-controlled password visibility (caller owns the show/hide
  // state, e.g. so a single toggle click can be wired to analytics or kept
  // in sync elsewhere). When only `type="password"` is given with none of
  // these, PrimeReact's own <Password toggleMask> manages it internally -
  // simpler, and the standard behavior for every other password field.
  showPasswordToggle = false,
  showPassword = false,
  onTogglePassword,
}) {
  const inputHeight = compact ? 34 : 38;
  const hasLeftIcon = Boolean(icon);
  const basePad = { paddingLeft: hasLeftIcon ? 34 : undefined };

  let control;
  if (type === "select") {
    control = (
      <Select
        value={value}
        onChange={onChange}
        options={options}
        placeholder={placeholder || `Select ${label?.toLowerCase() || ""}`}
        hasLeftIcon={hasLeftIcon}
        disabled={disabled}
        style={{ height: inputHeight, ...inputStyle }}
      />
    );
  } else if (type === "textarea") {
    control = (
      <InputTextarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        style={{ width: "100%", resize: "vertical", ...basePad, ...inputStyle }}
      />
    );
  } else if (showPasswordToggle) {
    control = (
      <InputText
        type={showPassword ? "text" : "password"}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ width: "100%", height: inputHeight, paddingRight: 36, ...basePad, ...inputStyle }}
      />
    );
  } else if (type === "password") {
    control = (
      <Password
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        toggleMask
        feedback={false}
        inputStyle={{ width: "100%", height: inputHeight, ...basePad, ...inputStyle }}
        style={{ width: "100%" }}
      />
    );
  } else {
    control = (
      <InputText
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ width: "100%", height: inputHeight, paddingRight: suffix ? 40 : undefined, ...basePad, ...inputStyle }}
      />
    );
  }

  return (
    <div style={{ marginBottom, ...style }}>
      {label && (
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--ink-secondary)", marginBottom: 6 }}>
          {label}
          {required && <span style={{ color: "var(--status-error)" }}> *</span>}
        </label>
      )}
      <div style={{ position: "relative" }}>
        {hasLeftIcon && (
          <i
            className={icon}
            style={{
              position: "absolute",
              left: 12,
              top: type === "textarea" ? 12 : "50%",
              transform: type === "textarea" ? "none" : "translateY(-50%)",
              color: "#94A3B8",
              fontSize: 13,
              zIndex: 2,
              pointerEvents: "none",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 16,
              height: 16,
            }}
          />
        )}
        {control}
        {showPasswordToggle && (
          <Button
            type="button"
            icon={showPassword ? "pi pi-eye-slash" : "pi pi-eye"}
            text
            rounded
            onClick={onTogglePassword}
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
            style={{ position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)", width: 30, height: 30, color: "var(--muted)" }}
          />
        )}
        {suffix && !showPasswordToggle && (
          <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
