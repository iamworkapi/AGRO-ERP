import { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { RadioButton } from "primereact/radiobutton";
import Select from "./Select";

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
}) {
  const [isFocused, setIsFocused] = useState(false);
  const isInvalid = Boolean(error);
  const effectiveHint = error || helperText || hint;
  const isVertical = layout === "vertical" || labelPosition === "top";

  function dashedStyle(extra = {}) {
    return {
      width: "100%",
      fontSize: 13,
      fontWeight: 400,
      color: disabled ? "var(--muted)" : "var(--ink)",
      background: disabled ? "rgba(0,0,0,0.02)" : "transparent",
      border: "none",
      borderBottom: isInvalid
        ? "1px dashed var(--status-error)"
        : isFocused
        ? "1px dashed var(--primary)"
        : "1px dashed var(--line-strong)",
      borderRadius: 0,
      outline: "none",
      transition: "all 180ms cubic-bezier(0.4, 0, 0.2, 1)",
      fontFamily: "inherit",
      padding: compact ? "4px 0" : "6px 0",
      boxShadow: isInvalid
        ? "0 3px 8px rgba(220, 38, 38, 0.08)"
        : isFocused
        ? "0 3px 10px rgba(93, 214, 44, 0.12)"
        : "none",
      ...inputStyle,
      ...extra,
    };
  }

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };
  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  let control;
  if (type === "select") {
    control = (
      <Select
        value={value}
        onChange={disabled || readOnly ? undefined : onChange}
        options={options}
        placeholder={placeholder || `Select ${label?.toLowerCase() || ""}`}
        disabled={disabled || readOnly}
        error={isInvalid}
        filter={filter}
        showClear={showClear}
        style={inputStyle}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    );
  } else if (type === "radio") {
    control = (
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
            <div
              key={optVal}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
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
  } else if (type === "textarea") {
    control = (
      <InputTextarea
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
        aria-invalid={isInvalid}
        style={dashedStyle({
          resize: disabled || readOnly ? "none" : "vertical",
          opacity: disabled ? 0.65 : 1,
          cursor: disabled ? "not-allowed" : "text",
        })}
      />
    );
  } else if (showPasswordToggle) {
    control = (
      <InputText
        id={id}
        name={name}
        type={showPassword ? "text" : "password"}
        value={value ?? ""}
        disabled={disabled}
        readOnly={readOnly}
        onChange={disabled || readOnly ? undefined : (e) => onChange?.(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={isInvalid}
        style={dashedStyle({
          paddingRight: 36,
          paddingLeft: icon ? 26 : undefined,
          opacity: disabled ? 0.65 : 1,
        })}
      />
    );
  } else if (type === "password") {
    control = (
      <Password
        id={id}
        name={name}
        value={value ?? ""}
        disabled={disabled}
        readOnly={readOnly}
        onChange={disabled || readOnly ? undefined : (e) => onChange?.(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        toggleMask
        feedback={false}
        inputStyle={dashedStyle({
          paddingLeft: icon ? 26 : undefined,
        })}
        style={{ width: "100%" }}
        className={isInvalid ? "p-invalid" : ""}
      />
    );
  } else {
    control = (
      <InputText
        id={id}
        name={name}
        type={type}
        min={min}
        max={max}
        step={step}
        inputMode={inputMode}
        maxLength={maxLength}
        value={value ?? ""}
        disabled={disabled}
        readOnly={readOnly}
        onChange={disabled || readOnly ? undefined : (e) => onChange?.(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={isInvalid}
        style={dashedStyle({
          paddingLeft: icon ? 26 : undefined,
          paddingRight: suffix ? 48 : undefined,
          opacity: disabled ? 0.65 : 1,
          cursor: disabled ? "not-allowed" : "text",
        })}
      />
    );
  }

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
                  style={{
                    color: "var(--status-error)",
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                  title="Required field"
                >
                  *
                </span>
              )}
            </label>
          )}

          <div style={{ position: "relative", display: "flex", alignItems: "center", width: "100%" }}>
            {icon && (
              <i
                className={icon}
                style={{
                  position: "absolute",
                  left: 2,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: isInvalid
                    ? "var(--status-error)"
                    : isFocused
                    ? "var(--primary)"
                    : "var(--muted)",
                  fontSize: 14,
                  zIndex: 2,
                  pointerEvents: "none",
                  transition: "color 150ms ease",
                }}
              />
            )}
            <div style={{ width: "100%" }}>{control}</div>

            {showPasswordToggle && (
              <Button
                type="button"
                icon={showPassword ? "ri-eye-off-line" : "ri-eye-line"}
                text
                rounded
                onClick={onTogglePassword}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{
                  position: "absolute",
                  right: 0,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 28,
                  height: 28,
                  color: "var(--muted)",
                  padding: 0,
                }}
              />
            )}

            {suffix && !showPasswordToggle && (
              <span
                style={{
                  position: "absolute",
                  right: 2,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 10,
                  color: isFocused ? "var(--primary-deep)" : "var(--ink-secondary)",
                  fontWeight: 800,
                  pointerEvents: "none",
                  transition: "all 150ms ease",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  background: isFocused ? "var(--primary-tint)" : "rgba(0, 0, 0, 0.05)",
                  padding: "2px 6px",
                  borderRadius: 4,
                  lineHeight: 1.2,
                }}
              >
                {suffix}
              </span>
            )}
          </div>
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
                  style={{
                    color: "var(--status-error)",
                    fontSize: 13,
                    fontWeight: 800,
                    marginLeft: 3,
                  }}
                  title="Required field"
                >
                  *
                </span>
              )}
            </label>
          )}

          <div style={{ flex: 1, position: "relative", minWidth: 0 }}>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              {icon && (
                <i
                  className={icon}
                  style={{
                    position: "absolute",
                    left: 2,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: isInvalid
                      ? "var(--status-error)"
                      : isFocused
                      ? "var(--primary)"
                      : "var(--muted)",
                    fontSize: 14,
                    zIndex: 2,
                    pointerEvents: "none",
                    transition: "color 150ms ease",
                  }}
                />
              )}
              <div style={{ width: "100%" }}>{control}</div>
            </div>

            {showPasswordToggle && (
              <Button
                type="button"
                icon={showPassword ? "ri-eye-off-line" : "ri-eye-line"}
                text
                rounded
                onClick={onTogglePassword}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{
                  position: "absolute",
                  right: 0,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 28,
                  height: 28,
                  color: "var(--muted)",
                  padding: 0,
                }}
              />
            )}

            {suffix && !showPasswordToggle && (
              <span
                style={{
                  position: "absolute",
                  right: 2,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 10,
                  color: isFocused ? "var(--primary-deep)" : "var(--ink-secondary)",
                  fontWeight: 800,
                  pointerEvents: "none",
                  transition: "all 150ms ease",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  background: isFocused ? "var(--primary-tint)" : "rgba(0, 0, 0, 0.05)",
                  padding: "2px 6px",
                  borderRadius: 4,
                  lineHeight: 1.2,
                }}
              >
                {suffix}
              </span>
            )}
          </div>
        </div>
      )}

      {effectiveHint && (
        <div
          style={{
            marginLeft: isVertical ? 0 : label ? labelWidth + GAP : 0,
            fontSize: 11,
            fontWeight: isInvalid ? 600 : 500,
            color: isInvalid ? "var(--status-error)" : "var(--muted)",
            display: "flex",
            alignItems: "center",
            gap: 4,
            marginTop: 2,
            lineHeight: 1.2,
            transition: "all 150ms ease",
          }}
        >
          {isInvalid ? (
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
