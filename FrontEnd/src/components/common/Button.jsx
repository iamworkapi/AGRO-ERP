import { memo } from "react";

export default function Button({
  children,
  onClick,
  variant = "primary", // "primary" | "secondary" | "outline" | "ghost" | "danger" | "success"
  size = "md", // "sm" | "md" | "lg"
  type = "button",
  icon,
  iconPosition = "left",
  loading = false,
  disabled = false,
  fullWidth = false,
  style = {},
  className = "",
  title,
}) {
  const isDisabled = disabled || loading;

  const sizeStyles = {
    sm: { height: 32, padding: "0 12px", fontSize: 12, borderRadius: 8, gap: 6 },
    md: { height: 38, padding: "0 16px", fontSize: 13, borderRadius: 10, gap: 8 },
    lg: { height: 44, padding: "0 22px", fontSize: 14, borderRadius: 12, gap: 10 },
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "secondary":
        return {
          background: "var(--canvas)",
          color: "var(--ink)",
          border: "1px solid var(--line-strong)",
          boxShadow: "var(--shadow-sm)",
        };
      case "outline":
        return {
          background: "transparent",
          color: "var(--primary)",
          border: "1.5px solid var(--primary)",
        };
      case "ghost":
        return {
          background: "transparent",
          color: "var(--ink)",
          border: "1px solid transparent",
        };
      case "danger":
        return {
          background: "var(--status-error)",
          color: "#FFFFFF",
          border: "1px solid var(--status-error)",
          boxShadow: "0 2px 8px rgba(220, 38, 38, 0.25)",
        };
      case "success":
        return {
          background: "var(--status-success)",
          color: "#FFFFFF",
          border: "1px solid var(--status-success)",
          boxShadow: "0 2px 8px rgba(93, 214, 44, 0.25)",
        };
      case "primary":
      default:
        return {
          background: "var(--primary)",
          color: "#FFFFFF",
          border: "1px solid var(--primary)",
          boxShadow: "0 2px 10px rgba(51, 116, 24, 0.25)",
        };
    }
  };

  const baseStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    letterSpacing: 0.2,
    cursor: isDisabled ? "not-allowed" : "pointer",
    opacity: isDisabled ? 0.65 : 1,
    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
    userSelect: "none",
    width: fullWidth ? "100%" : "auto",
    ...sizeStyles[size],
    ...getVariantStyles(),
    ...style,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      title={title}
      style={baseStyle}
      className={`app-btn btn-${variant} ${className}`}
    >
      {loading ? (
        <i className="ri-loader-4-line ri-spin" style={{ fontSize: size === "lg" ? 18 : 15 }} />
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <span style={{ display: "inline-flex", alignItems: "center" }}>
              {typeof icon === "string" ? <i className={icon} /> : icon}
            </span>
          )}
          {children && <span>{children}</span>}
          {icon && iconPosition === "right" && (
            <span style={{ display: "inline-flex", alignItems: "center" }}>
              {typeof icon === "string" ? <i className={icon} /> : icon}
            </span>
          )}
        </>
      )}
    </button>
  );
}
