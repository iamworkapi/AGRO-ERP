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
  const visible = open ?? isOpen ?? false;
  const [mounted, setMounted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const closeTimeoutRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      setIsClosing(false);
    } else if (mounted && !isClosing) {
      // Trigger exit animation
      setIsClosing(true);
      closeTimeoutRef.current = setTimeout(() => {
        setMounted(false);
        setIsClosing(false);
      }, 220);
    }

    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, [visible, mounted, isClosing]);

  // Handle ESC key press
  useEffect(() => {
    if (!mounted || isClosing || !closeOnEsc) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleTriggerClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mounted, isClosing, closeOnEsc]);

  // Lock body scroll when drawer is visible
  useEffect(() => {
    if (mounted) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mounted]);

  const handleTriggerClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    closeTimeoutRef.current = setTimeout(() => {
      setMounted(false);
      setIsClosing(false);
      onClose?.();
    }, 220);
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
                borderRadius: 16,
                border: "1px solid var(--line)",
                animation: isClosing ? "drawerBackdropFadeOut 200ms ease forwards" : "drawerBackdropFadeIn 240ms ease forwards",
              }
            : {
                width: resolvedWidth,
              }
        }
      >
        {/* Header */}
        <div className="slide-drawer-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
            {icon && (
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "rgba(51, 116, 24, 0.12)",
                  color: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  flexShrink: 0,
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
                    fontSize: 16,
                    fontWeight: 700,
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
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 12,
                      background: "rgba(51, 116, 24, 0.12)",
                      color: "var(--primary)",
                      letterSpacing: 0.2,
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
                    fontWeight: 400,
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
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            {headerActions}
            <button
              type="button"
              onClick={handleTriggerClose}
              aria-label="Close popup"
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: "1px solid var(--line)",
                background: "var(--surface)",
                color: "var(--muted)",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 17,
                transition: "all 150ms ease",
                padding: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--ink)";
                e.currentTarget.style.borderColor = "var(--line-strong)";
                e.currentTarget.style.background = "var(--canvas)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--muted)";
                e.currentTarget.style.borderColor = "var(--line)";
                e.currentTarget.style.background = "var(--surface)";
              }}
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
