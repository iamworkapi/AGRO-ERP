import Modal from "./Modal";
import Button from "./Button";

/**
 * Reusable "Are you sure?" confirmation dialog.
 *
 * Usage:
 *   <ConfirmDialog
 *     open={showConfirm}
 *     onClose={() => setShowConfirm(false)}
 *     onConfirm={handleDelete}
 *     title="Delete Warehouse?"
 *     message="This action cannot be undone. Assigned personnel will be unlinked."
 *     confirmLabel="Yes, Delete"
 *     loading={deleting}
 *     variant="danger"          // "danger" (red) | "warning" (amber) | "default" (primary)
 *   />
 */
export default function ConfirmDialog({
  open = false,
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmLabel = "Yes, Confirm",
  cancelLabel = "Cancel",
  loading = false,
  variant = "danger",
}) {
  const visible = open || isOpen || false;

  const palette = {
    danger: {
      bg: "#FEF2F2",
      border: "#FCA5A5",
      text: "#991B1B",
      icon: "#DC2626",
      btn: "#DC2626",
    },
    warning: {
      bg: "#FFFBEB",
      border: "#FCD34D",
      text: "#92400E",
      icon: "#D97706",
      btn: "#D97706",
    },
    default: {
      bg: "rgba(27, 94, 58, 0.06)",
      border: "rgba(27, 94, 58, 0.25)",
      text: "#0D3823",
      icon: "#1B5E3A",
      btn: "var(--primary)",
    },
  }[variant] || {
    bg: "#FEF2F2",
    border: "#FCA5A5",
    text: "#991B1B",
    icon: "#DC2626",
    btn: "#DC2626",
  };

  return (
    <Modal open={visible} onClose={onClose} title={title} width={440}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Alert banner */}
        <div
          style={{
            background: palette.bg,
            border: `1px solid ${palette.border}`,
            borderRadius: 10,
            padding: "12px 14px",
            color: palette.text,
            fontSize: 12.5,
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
          }}
        >
          <i
            className="ri-alert-line"
            style={{ fontSize: 18, color: palette.icon, flexShrink: 0, marginTop: 1 }}
          />
          <div style={{ lineHeight: 1.55 }}>{message}</div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            style={{
              background: palette.btn,
              color: "white",
              fontWeight: 700,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <>
                <i className="ri-loader-4-line ri-spin" style={{ marginRight: 6 }} />
                Processing…
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
