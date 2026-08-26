import { memo } from "react";

const STATUS_MAP = {
  Accepted: "success",
  Approved: "success",
  Delivered: "success",
  Present: "success",
  Active: "success",
  Safe: "success",
  Normal: "success",
  Pending: "warning",
  Monitored: "warning",
  Processing: "warning",
  "In Transit": "info",
  Transit: "info",
  Rejected: "error",
  Cancel: "error",
  Emergency: "error",
  Warning: "error",
};

const TONE_STYLES = {
  success: {
    bg: "rgba(93, 214, 44, 0.16)",
    color: "var(--primary)",
    border: "rgba(93, 214, 44, 0.35)",
    dot: "#5DD62C",
  },
  warning: {
    bg: "rgba(255, 184, 0, 0.15)",
    color: "#D97706",
    border: "rgba(255, 184, 0, 0.35)",
    dot: "#FFB800",
  },
  error: {
    bg: "rgba(255, 59, 86, 0.15)",
    color: "#DC2626",
    border: "rgba(255, 59, 86, 0.35)",
    dot: "#FF3B56",
  },
  info: {
    bg: "rgba(0, 210, 255, 0.15)",
    color: "#0284C7",
    border: "rgba(0, 210, 255, 0.35)",
    dot: "#00D2FF",
  },
  purple: {
    bg: "rgba(168, 85, 247, 0.15)",
    color: "#9333EA",
    border: "rgba(168, 85, 247, 0.35)",
    dot: "#A855F7",
  },
  neutral: {
    bg: "var(--canvas)",
    color: "var(--muted)",
    border: "var(--line)",
    dot: "var(--muted)",
  },
};

function Badge({
  status,
  tone,
  variant,
  dot = true,
  children,
  style = {},
  className = "",
}) {
  const label = children ?? status ?? "";
  const resolvedTone = tone || variant || STATUS_MAP[status] || STATUS_MAP[label] || "neutral";
  const theme = TONE_STYLES[resolvedTone] || TONE_STYLES.neutral;

  return (
    <span
      className={`app-badge badge-${resolvedTone} ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 9px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.3,
        background: theme.bg,
        color: theme.color,
        border: `1px solid ${theme.border}`,
        lineHeight: 1.2,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: theme.dot,
            boxShadow: `0 0 5px ${theme.dot}`,
            flexShrink: 0,
          }}
        />
      )}
      <span>{label}</span>
    </span>
  );
}

export default memo(Badge);
