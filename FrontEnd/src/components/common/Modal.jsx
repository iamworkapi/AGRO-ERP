import { Dialog } from "primereact/dialog";

// PrimeReact's Dialog already handles what this component used to hand-roll:
// Escape-to-close, focus trap, body-scroll lock, backdrop click-to-close.
export default function Modal({ open, isOpen, title, onClose, children, width = 500, subtitle }) {
  const visible = open ?? isOpen ?? false;
  const header = (
    <div>
      <div style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>{title}</div>
      {subtitle && <div style={{ fontSize: 12, fontWeight: 400, color: "var(--muted)", marginTop: 2 }}>{subtitle}</div>}
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={onClose}
      header={header}
      style={{ width }}
      breakpoints={{ "960px": "94vw" }}
      modal
      dismissableMask
      draggable={false}
      resizable={false}
    >
      {children}
    </Dialog>
  );
}
