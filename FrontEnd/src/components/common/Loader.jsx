import { useId } from "react";

/**
 * Universal Agro-ERP Orbital Loader Component
 * Scalable from micro buttons (14px) to full-page splashes (72px).
 *
 * @param {number} size - Outer diameter in px (default 40)
 * @param {string} label - Optional caption text
 * @param {boolean} inline - Horizontal layout (icon + text side by side)
 * @param {string} variant - "primary" (brand emerald) | "white" (buttons) | "muted"
 * @param {boolean} fullPage - Fixed fullscreen viewport overlay with frosted glass
 * @param {boolean} overlay - Absolute parent-fill overlay with frosted glass
 * @param {string} className - Extra CSS class
 * @param {object} style - Extra styles for the container
 */
export default function Loader({
  size = 40,
  label,
  inline = false,
  variant = "primary",
  fullPage = false,
  overlay = false,
  className = "",
  style = {},
}) {
  const rawId = useId();
  const gradId = `agroLoaderGrad_${rawId.replace(/:/g, "_")}`;

  const strokeWidth = Math.max(Math.round(size / 8.5), 2);
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const colorMap = {
    primary: {
      gradientStart: "var(--primary, #00b86b)",
      gradientEnd: "var(--primary-light, #5dd62c)",
      track: "rgba(0, 184, 107, 0.12)",
      core: "var(--primary, #00b86b)",
    },
    white: {
      gradientStart: "#ffffff",
      gradientEnd: "rgba(255, 255, 255, 0.35)",
      track: "rgba(255, 255, 255, 0.18)",
      core: "#ffffff",
    },
    muted: {
      gradientStart: "var(--muted, #64748b)",
      gradientEnd: "rgba(100, 116, 139, 0.25)",
      track: "rgba(100, 116, 139, 0.1)",
      core: "var(--muted, #64748b)",
    },
  };

  const colors = colorMap[variant] || colorMap.primary;

  const spinnerSvg = (
    <div
      className={`agro-loader-orbital ${className}`}
      style={{
        width: size,
        height: size,
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        ...style,
      }}
      aria-label={label || "Loading"}
      role="status"
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{
          animation: "agroOrbitalSpin 0.9s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite",
        }}
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.gradientStart} />
            <stop offset="100%" stopColor={colors.gradientEnd} stopOpacity="0.08" />
          </linearGradient>
        </defs>

        {/* Static Background Track Ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={colors.track}
          strokeWidth={strokeWidth}
        />

        {/* Dynamic Spinning Gradient Arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * 0.32}
          strokeLinecap="round"
        />
      </svg>

      {/* Luminous Core Node (for loaders >= 22px) */}
      {size >= 22 && (
        <div
          style={{
            position: "absolute",
            width: Math.max(Math.round(size * 0.2), 4),
            height: Math.max(Math.round(size * 0.2), 4),
            borderRadius: "50%",
            background: colors.core,
            boxShadow: variant === "primary" ? "0 0 8px rgba(0, 184, 107, 0.65)" : "none",
            animation: "agroCorePulse 1.3s ease-in-out infinite",
          }}
        />
      )}
    </div>
  );

  if (fullPage || overlay) {
    return (
      <div
        style={{
          position: fullPage ? "fixed" : "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255, 255, 255, 0.78)",
          backdropFilter: "blur(6px)",
          gap: 12,
        }}
      >
        {spinnerSvg}
        {label && (
          <span
            style={{
              fontSize: size > 48 ? 14 : 12.5,
              fontWeight: 700,
              color: "var(--ink)",
              letterSpacing: "0.2px",
              animation: "agroTextPulse 1.8s ease-in-out infinite",
            }}
          >
            {label}
          </span>
        )}
      </div>
    );
  }

  if (inline) {
    return (
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        {spinnerSvg}
        {label && (
          <span style={{ fontSize: size < 20 ? 11.5 : 12.5, fontWeight: 600, color: "var(--muted)" }}>
            {label}
          </span>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      {spinnerSvg}
      {label && (
        <span
          style={{
            fontSize: size > 48 ? 13.5 : 12,
            fontWeight: 600,
            color: "var(--muted)",
            animation: "agroTextPulse 1.8s ease-in-out infinite",
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
