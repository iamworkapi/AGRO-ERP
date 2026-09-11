import { useEffect, useState, useRef } from "react";
import { subscribeToasts, toast } from "../../utils/toast";

const TOAST_CONFIG = {
  success: {
    icon: "ri-checkbox-circle-fill",
    title: "Success",
    accent: "#16A34A",
    accentLight: "#5DD62C",
    bgTint: "rgba(22, 163, 74, 0.08)",
    border: "rgba(22, 163, 74, 0.25)",
    iconColor: "#16A34A",
  },
  error: {
    icon: "ri-error-warning-fill",
    title: "Error",
    accent: "#DC2626",
    accentLight: "#FF3B56",
    bgTint: "rgba(220, 38, 38, 0.08)",
    border: "rgba(220, 38, 38, 0.25)",
    iconColor: "#DC2626",
  },
  warning: {
    icon: "ri-alert-fill",
    title: "Warning",
    accent: "#D97706",
    accentLight: "#FFB800",
    bgTint: "rgba(217, 119, 6, 0.08)",
    border: "rgba(217, 119, 6, 0.25)",
    iconColor: "#D97706",
  },
  info: {
    icon: "ri-information-fill",
    title: "Information",
    accent: "#2563EB",
    accentLight: "#00D2FF",
    bgTint: "rgba(37, 99, 235, 0.08)",
    border: "rgba(37, 99, 235, 0.25)",
    iconColor: "#2563EB",
  },
};

function ToastItem({ item, onDismiss }) {
  const [isExiting, setIsExiting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);
  const remainingRef = useRef(item.duration || 4500);
  const startRef = useRef(Date.now());

  const config = TOAST_CONFIG[item.type] || TOAST_CONFIG.info;
  const title = item.title || config.title;

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(item.id);
    }, 280);
  };

  useEffect(() => {
    if (!item.duration) return;

    const startTimer = () => {
      startRef.current = Date.now();
      timerRef.current = setTimeout(() => {
        handleClose();
      }, remainingRef.current);
    };

    if (!isPaused) {
      startTimer();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPaused, item.duration]);

  const handleMouseEnter = () => {
    setIsPaused(true);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      const elapsed = Date.now() - startRef.current;
      remainingRef.current = Math.max(remainingRef.current - elapsed, 500);
    }
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`agro-toast-card ${isExiting ? "agro-toast-exit" : "agro-toast-enter"}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        "--toast-accent": config.accent,
        "--toast-duration": `${item.duration || 4500}ms`,
        borderColor: config.border,
      }}
    >
      {/* Colored Left Accent Glow Indicator */}
      <div
        className="agro-toast-accent-bar"
        style={{
          background: `linear-gradient(180deg, ${config.accentLight || config.accent} 0%, ${config.accent} 100%)`,
        }}
      />

      <div className="agro-toast-body">
        {/* Crisp Icon Pill */}
        <div
          className="agro-toast-icon-wrap"
          style={{
            background: config.bgTint,
            color: config.iconColor,
            borderColor: config.border,
          }}
        >
          <i className={config.icon} />
        </div>

        {/* Text Content */}
        <div className="agro-toast-content">
          <div className="agro-toast-title" style={{ color: config.accent }}>
            {title}
          </div>
          <div className="agro-toast-message">{item.message}</div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="agro-toast-close-btn"
          aria-label="Dismiss Notification"
          title="Dismiss"
        >
          <i className="ri-close-line" />
        </button>
      </div>

      {/* Animated Countdown Progress Bar */}
      {item.duration > 0 && (
        <div className="agro-toast-progress-track">
          <div
            className="agro-toast-progress-bar"
            style={{
              background: config.accent,
              animationPlayState: isPaused ? "paused" : "running",
            }}
          />
        </div>
      )}
    </div>
  );
}

export default function Toaster() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    return subscribeToasts((items) => {
      setToasts([...items]);
    });
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="agro-toaster-container">
      {toasts.map((item) => (
        <ToastItem key={item.id} item={item} onDismiss={toast.dismiss} />
      ))}
    </div>
  );
}
