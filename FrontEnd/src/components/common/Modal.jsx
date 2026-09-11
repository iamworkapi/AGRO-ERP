import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";

/**
 * Reusable Right-Slide Animated Drawer & Popup Modal.
 * Slides in from the right edge with a silky smooth spring cubic-bezier,
 * backdrop blur, responsive sizing, ESC close, and body scroll lock.
 *
 * Props:
 * - open / isOpen: boolean
 * - onClose: () => void
 * - title: string | ReactNode
 * - subtitle: string | ReactNode
 * - icon: string (remixicon class, e.g. "ri-building-line")
 * - badge: string | ReactNode
 * - width: number | string (default: 520)
 * - position: "right" | "center" (default: "right")
 * - footer: ReactNode (optional sticky footer actions)
 * - headerActions: ReactNode (optional extra buttons in header)
 * - closeOnBackdrop: boolean (default: true)
 * - closeOnEsc: boolean (default: true)
 * - children: ReactNode
 */
export default function Modal({
  open,
  isOpen,
  title,
  subtitle,
  icon,
  badge,
  onClose,
  children,
  width = 520,
  position = "right",
  footer,
  headerActions,
  closeOnBackdrop = true,
  closeOnEsc = true,
}) {
  const visible = Boolean(open ?? isOpen);
  const [mounted, setMounted] = useState(visible);
  const [isClosing, setIsClosing] = useState(false);
  const closeTimeoutRef = useRef(null);

  // Sync mounted state when visible prop changes
  useEffect(() => {
    if (visible) {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
      setMounted(true);
      setIsClosing(false);
    } else if (mounted) {
      setIsClosing(true);
      closeTimeoutRef.current = setTimeout(() => {
        setMounted(false);
        setIsClosing(false);
      }, 200);
    }

    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, [visible]);

  // Handle ESC key press
  useEffect(() => {
    if (!mounted || isClosing || !closeOnEsc) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleTriggerClose(e);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mounted, isClosing, closeOnEsc]);

  // Lock body scroll when drawer is visible
  useEffect(() => {
    if (mounted && !isClosing) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mounted, isClosing]);

  const handleTriggerClose = (e) => {
    if (e) {
      e.preventDefault?.();
      e.stopPropagation?.();
    }
    if (isClosing) return;

    // 1. Immediately invoke onClose so parent state clears (crucial for conditionally-rendered modals)
    onClose?.();

    // 2. Play exit animation in case parent does not unmount immediately
    setIsClosing(true);
    closeTimeoutRef.current = setTimeout(() => {
      setMounted(false);
      setIsClosing(false);
    }, 200);
  };

  if (!mounted) return null;

  const resolvedWidth = typeof width === "number" ? `${width}px` : width;

  const drawerContent = (
    <div
      className={`slide-drawer-portal ${position === "center" ? "slide-drawer-center" : ""}`}
      role="dialog"
      aria-modal="true"
      style={
        position === "center"
          ? {
              position: "fixed",
              inset: 0,
              zIndex: 1200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
            }
          : undefined
      }
    >
      {/* Backdrop with Blur */}
      <div
        className={`slide-drawer-backdrop ${isClosing ? "closing" : ""}`}
        onClick={closeOnBackdrop ? handleTriggerClose : undefined}
      />

      {/* Slide Panel */}
      <div
        className={`slide-drawer-panel ${isClosing ? "closing" : ""}`}
        style={
          position === "center"
            ? {
                width: resolvedWidth,
                maxWidth: "96vw",
                maxHeight: "92vh",
                height: "auto",
                borderRadius: 18,
                border: "1px solid var(--line)",
                boxShadow: "0 24px 72px rgba(0, 0, 0, 0.28), 0 4px 16px rgba(0, 0, 0, 0.1)",
                animation: isClosing
                  ? "modalScaleOutCenter 200ms cubic-bezier(0.4, 0, 1, 1) forwards"
                  : "modalScaleInCenter 260ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
              }
            : {
                width: resolvedWidth,
              }
        }
      >
        {/* Top Accent Gradient Bar */}
        <div
          style={{
            height: 3,
            width: "100%",
            background: "linear-gradient(90deg, var(--primary) 0%, #34d399 50%, var(--primary-deep) 100%)",
            flexShrink: 0,
          }}
        />

        {/* Header */}
        <div className="slide-drawer-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
            {icon && (
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: "var(--primary-tint)",
                  color: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 19,
                  flexShrink: 0,
                  boxShadow: "0 2px 6px rgba(51, 116, 24, 0.12)",
                }}
              >
                <i className={icon} />
              </div>
            )}
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 15.5,
                    fontWeight: 800,
                    color: "var(--ink)",
                    letterSpacing: "-0.01em",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {title}
                </h3>
                {badge && (
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 800,
                      padding: "2px 8px",
                      borderRadius: 12,
                      background: "var(--primary-tint)",
                      color: "var(--primary-deep)",
                      letterSpacing: "0.2px",
                      border: "1px solid rgba(51, 116, 24, 0.18)",
                    }}
                  >
                    {badge}
                  </span>
                )}
              </div>
              {subtitle && (
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: "var(--muted)",
                    marginTop: 2,
                    lineHeight: 1.3,
                  }}
                >
                  {subtitle}
                </div>
              )}
            </div>
          </div>

          {/* Header Action Buttons & Close Icon */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {headerActions}
            <button
              type="button"
              onClick={handleTriggerClose}
              aria-label="Close (ESC)"
              title="Close (ESC)"
              className="slide-drawer-close-btn"
            >
              <i className="ri-close-line" />
            </button>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="slide-drawer-body">{children}</div>

        {/* Optional Sticky Footer */}
        {footer && <div className="slide-drawer-footer">{footer}</div>}
      </div>
    </div>
  );

  return createPortal(drawerContent, document.body);
}
