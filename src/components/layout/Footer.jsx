export default function Footer() {
  return (
    <footer
      style={{
        flexShrink: 0,
        padding: "10px 40px",
        borderTop: "1px solid var(--line)",
        background: "var(--surface)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: 11.5,
        color: "var(--muted)",
      }}
    >
      <span>&copy; {new Date().getFullYear()} Kusumganga Agro Solutions Pvt. Ltd. All rights reserved.</span>
      <span>
        PRALLI Procurement ERP (12 Centers)
      </span>
    </footer>
  );
}
