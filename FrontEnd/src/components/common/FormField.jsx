import { useState, useMemo } from "react";
import { RadioButton } from "primereact/radiobutton";
import Select from "./Select";
import { sanitizePhone, isValidPhone } from "../../utils/phone";

const DEFAULT_LABEL_WIDTH = 130;
const GAP = 14;

export default function FormField({
  label,
  type = "text",
  value,
  onChange,
  options = [],
  placeholder,
  required = false,
  suffix,
  icon,
  disabled = false,
  readOnly = false,
  error,
  helperText,
  hint,
  compact = false,
  marginBottom,
  labelWidth = DEFAULT_LABEL_WIDTH,
  layout = "horizontal", // "horizontal" | "vertical"
  labelPosition, // "left" | "top"
  showPasswordToggle = false,
  showPassword = false,
  onTogglePassword,
  style = {},
  inputStyle = {},
  name,
  id,
  min,
  max,
  step,
  rows = 3,
  autoComplete,
  onFocus,
  onBlur,
  inputMode,
  maxLength,
  filter = false,
  showClear = false,
  isPhone = false,
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [internalShowPass, setInternalShowPass] = useState(false);

  // Detect if this is a phone / contact number field
  const isPhoneNumberField = useMemo(() => {
    if (isPhone || type === "tel" || type === "phone") return true;
    const lowerName = (name || "").toLowerCase();
    const lowerLabel = (label || "").toLowerCase();
    return (
      lowerName.includes("phone") ||
      lowerName.includes("mobile") ||
      lowerName.includes("contactno") ||
      lowerName.includes("contact_no") ||
      lowerLabel.includes("phone") ||
      lowerLabel.includes("mobile") ||
      lowerLabel.includes("contact number")
    );
  }, [isPhone, type, name, label]);

  // If phone field, resolve validation hint if invalid length
  const phoneHint = useMemo(() => {
    if (!isPhoneNumberField || !value) return null;
    const clean = String(value).replace(/\D/g, "");
    if (clean.length > 0 && clean.length < 10) {
      return `Enter 10-digit number (${clean.length}/10)`;
    }
    return null;
  }, [isPhoneNumberField, value]);

  const effectiveError = error || (isFocused && phoneHint ? phoneHint : undefined);
  const isInvalid = Boolean(error);
  const effectiveHint = error || helperText || hint || phoneHint;
  const isVertical = layout === "vertical" || labelPosition === "top";

  // If external password control is provided, use it; otherwise use internal state
  const effectiveShowPassword = showPassword !== undefined && onTogglePassword ? showPassword : internalShowPass;
  const handleTogglePassword = onTogglePassword || (() => setInternalShowPass((prev) => !prev));
  const isPasswordField = type === "password" || showPasswordToggle;

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  // Safe change handler that restricts phone inputs to 10 numeric digits only
  const handleInputChange = (rawVal) => {
    if (disabled || readOnly) return;
    if (isPhoneNumberField) {
      const sanitized = sanitizePhone(rawVal);
      onChange?.(sanitized);
    } else {
      onChange?.(rawVal);
    }
  };

  // Radio button special handling
  if (type === "radio") {
    const radioContent = (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          minHeight: 34,
          padding: "4px 0",
          ...inputStyle,
        }}
      >
        {options.map((opt, idx) => {
          const optVal = typeof opt === "object" ? opt.value : opt;
          const optLabel = typeof opt === "object" ? opt.label : opt;
          const isChecked = String(value ?? "").toUpperCase() === String(optVal ?? "").toUpperCase();
          const radioId = `${id || name || (label ? label.replace(/\s+/g, "_").toLowerCase() : "radio")}_${idx}`;

          return (
            <div key={optVal} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <RadioButton
                inputId={radioId}
                name={name || label}
                value={optVal}
                checked={isChecked}
                disabled={disabled || readOnly}
                onChange={(e) => !disabled && !readOnly && onChange?.(e.value)}
              />
              <label
                htmlFor={radioId}
                style={{
                  cursor: disabled || readOnly ? "not-allowed" : "pointer",
                  fontSize: 13,
                  fontWeight: isChecked ? 600 : 500,
                  color: isChecked ? "var(--ink)" : "var(--ink-secondary)",
                  userSelect: "none",
                  margin: 0,
                  textTransform: "none",
                  letterSpacing: "normal",
                }}
              >
                {optLabel}
              </label>
            </div>
          );
        })}
      </div>
    );

    return (
      <div
        className={`form-field-wrapper ${isInvalid ? "has-error" : ""} ${isVertical ? "is-vertical" : ""}`}
        style={{
          display: "flex",
          flexDirection: "column",
          marginBottom: marginBottom !== undefined ? marginBottom : compact ? 6 : 10,
          ...style,
        }}
      >
        {isVertical ? (
          <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
            {label && (
              <label
                htmlFor={id}
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: isInvalid ? "var(--status-error)" : "var(--muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: 4,
                }}
              >
                {label} {required && <span style={{ color: "var(--status-error)" }}>*</span>}
              </label>
            )}
            {radioContent}
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: GAP }}>
            {label && (
              <label
                htmlFor={id}
                style={{
                  width: labelWidth,
                  minWidth: labelWidth,
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: isInvalid ? "var(--status-error)" : "var(--ink-secondary)",
                }}
              >
                {label} {required && <span style={{ color: "var(--status-error)" }}>*</span>}
              </label>
            )}
            <div style={{ flex: 1 }}>{radioContent}</div>
          </div>
        )}
      </div>
    );
  }

  // Boxed container styling with separated icon block
  const containerStyle = {
    display: "flex",
    alignItems: type === "textarea" ? "flex-start" : "center",
    width: "100%",
    borderRadius: 7,
    border: isInvalid
      ? "1.5px solid var(--status-error)"
      : isFocused
      ? "1.5px solid var(--primary)"
      : "1px solid var(--line-strong)",
    background: disabled || readOnly ? "rgba(0, 0, 0, 0.025)" : "var(--surface)",
    boxShadow: isInvalid
      ? "0 0 0 2.5px rgba(239, 68, 68, 0.15)"
      : isFocused
      ? "0 0 0 2.5px rgba(51, 116, 24, 0.18)"
      : "none",
    transition: "border-color 150ms ease, box-shadow 150ms ease",
    overflow: "hidden",
    boxSizing: "border-box",
    minHeight: type === "textarea" ? (compact ? 62 : 78) : (compact ? 34 : 38),
    ...inputStyle,
  };

  const effectiveIcon = icon || (isPhoneNumberField ? "ri-phone-line" : null);

  // Dedicated separate icon tile style
  const iconTileStyle = {
    width: compact ? 34 : 38,
    height: type === "textarea" ? 34 : (compact ? 32 : 36),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--canvas)",
    borderRight: "1px solid var(--line)",
    color: isInvalid
      ? "var(--status-error)"
      : isFocused
      ? "var(--primary)"
      : "var(--muted)",
    fontSize: compact ? 13.5 : 15,
    flexShrink: 0,
    transition: "color 150ms ease",
  };

  const fieldControl = (
    <div
      className={`form-field-input-box ${isInvalid ? "has-error" : ""} ${isFocused ? "is-focused" : ""}`}
      style={containerStyle}
    >
      {/* SEPARATE ICON TILE */}
      {effectiveIcon && (
        <div style={iconTileStyle} aria-hidden="true">
          <i className={effectiveIcon} />
        </div>
      )}

      {/* INPUT / TEXTAREA / SELECT */}
      {type === "select" ? (
        <div style={{ flex: 1, minWidth: 0 }}>
          <Select
            value={value}
            onChange={disabled || readOnly ? undefined : onChange}
            options={options}
            placeholder={placeholder || `Select ${label?.toLowerCase() || ""}`}
            disabled={disabled || readOnly}
            error={isInvalid}
            filter={filter}
            showClear={showClear}
            style={{ borderWidth: 0 }}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>
      ) : type === "textarea" ? (
        <textarea
          id={id}
          name={name}
          value={value ?? ""}
          disabled={disabled}
          readOnly={readOnly}
          onChange={disabled || readOnly ? undefined : (e) => onChange?.(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          rows={rows}
          style={{
            flex: 1,
            minWidth: 0,
            border: "none",
            background: "transparent",
            outline: "none",
            padding: "8px 10px",
            fontSize: compact ? 12.5 : 13,
            color: disabled || readOnly ? "var(--ink-secondary)" : "var(--ink)",
            fontFamily: "inherit",
            resize: disabled || readOnly ? "none" : "vertical",
            boxSizing: "border-box",
            lineHeight: 1.4,
          }}
        />
      ) : (
        <div style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0, height: "100%" }}>
          <input
            id={id}
            name={name}
            type={
              isPasswordField
                ? effectiveShowPassword
                  ? "text"
                  : "password"
                : isPhoneNumberField
                ? "tel"
                : type
            }
            min={min}
            max={max}
            step={step}
            inputMode={isPhoneNumberField ? "numeric" : inputMode}
            pattern={isPhoneNumberField ? "[0-9]*" : undefined}
            maxLength={isPhoneNumberField ? 10 : maxLength}
            value={value ?? ""}
            disabled={disabled}
            readOnly={readOnly}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={
              placeholder || (isPhoneNumberField ? "10-digit mobile number" : undefined)
            }
            autoComplete={autoComplete}
            style={{
              flex: 1,
              minWidth: 0,
              height: compact ? 32 : 36,
              border: "none",
              background: "transparent",
              outline: "none",
              padding: "0 10px",
              fontSize: compact ? 12.5 : 13,
              color: disabled || readOnly ? "var(--ink-secondary)" : "var(--ink)",
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />

          {/* Suffix / Character counter for phone */}
          {isPhoneNumberField && value && String(value).length > 0 && (
            <span
              style={{
                padding: "0 8px",
                color: String(value).length === 10 ? "var(--primary)" : "var(--muted)",
                fontSize: 10.5,
                fontWeight: 700,
                flexShrink: 0,
                letterSpacing: "0.2px",
                userSelect: "none",
              }}
            >
              {String(value).length}/10
            </span>
          )}

          {suffix && !isPhoneNumberField && (
            <span
              style={{
                padding: "0 10px",
                color: "var(--muted)",
                fontSize: 11,
                fontWeight: 700,
                flexShrink: 0,
                letterSpacing: "0.4px",
                userSelect: "none",
              }}
            >
              {suffix}
            </span>
          )}

          {(showPasswordToggle || type === "password") && (
            <button
              type="button"
              onClick={handleTogglePassword}
              tabIndex={-1}
              aria-label={effectiveShowPassword ? "Hide password" : "Show password"}
              style={{
                border: "none",
                background: "transparent",
                color: "var(--muted)",
                cursor: "pointer",
                padding: "0 10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                flexShrink: 0,
                outline: "none",
              }}
            >
              <i className={effectiveShowPassword ? "ri-eye-off-line" : "ri-eye-line"} />
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div
      className={`form-field-wrapper ${isInvalid ? "has-error" : ""} ${isFocused ? "is-focused" : ""} ${isVertical ? "is-vertical" : ""}`}
      style={{
        display: "flex",
        flexDirection: "column",
        marginBottom: marginBottom !== undefined ? marginBottom : compact ? 6 : 10,
        ...style,
      }}
    >
      {isVertical ? (
        // Vertical (Top Label) layout
        <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
          {label && (
            <label
              htmlFor={id}
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: isInvalid
                  ? "var(--status-error)"
                  : isFocused
                  ? "var(--primary)"
                  : "var(--muted)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: 4,
                lineHeight: 1.2,
                display: "flex",
                alignItems: "center",
                gap: 3,
                transition: "color 150ms ease",
              }}
            >
              {label}
              {required && (
                <span
                  style={{ color: "var(--status-error)", fontSize: 12, fontWeight: 800 }}
                  title="Required field"
                >
                  *
                </span>
              )}
            </label>
          )}

          {fieldControl}
        </div>
      ) : (
        // Horizontal (Left Label) layout
        <div
          style={{
            display: "flex",
            alignItems: type === "textarea" ? "flex-start" : "center",
            gap: GAP,
            padding: compact ? "4px 0" : "6px 0",
            position: "relative",
          }}
        >
          {label && (
            <label
              htmlFor={id}
              style={{
                width: labelWidth,
                minWidth: labelWidth,
                fontSize: 12.5,
                fontWeight: 700,
                color: isInvalid
                  ? "var(--status-error)"
                  : isFocused
                  ? "var(--primary)"
                  : "var(--ink-secondary)",
                flexShrink: 0,
                letterSpacing: "0.01em",
                lineHeight: 1.3,
                marginTop: type === "textarea" ? 6 : 0,
                transition: "color 150ms ease",
              }}
            >
              {label}
              {required && (
                <span
                  style={{ color: "var(--status-error)", fontSize: 13, fontWeight: 800, marginLeft: 3 }}
                  title="Required field"
                >
                  *
                </span>
              )}
            </label>
          )}

          <div style={{ flex: 1, position: "relative", minWidth: 0 }}>
            {fieldControl}
          </div>
        </div>
      )}

      {effectiveHint && (
        <div
          style={{
            marginLeft: isVertical ? 0 : label ? labelWidth + GAP : 0,
            fontSize: 11,
            fontWeight: isInvalid || phoneHint ? 600 : 500,
            color: isInvalid || phoneHint ? "var(--status-error)" : "var(--muted)",
            display: "flex",
            alignItems: "center",
            gap: 4,
            marginTop: 3,
            lineHeight: 1.2,
            transition: "all 150ms ease",
          }}
        >
          {isInvalid || phoneHint ? (
            <i className="ri-error-warning-line" style={{ fontSize: 12, flexShrink: 0 }} />
          ) : (
            <i className="ri-information-line" style={{ fontSize: 12, flexShrink: 0 }} />
          )}
          <span>{effectiveHint}</span>
        </div>
      )}
    </div>
  );
}
