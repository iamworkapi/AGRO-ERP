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
      <span>&copy; {new Date().getFullYear()} Orish Agro. All rights reserved.</span>
      <span>
        Crafted by <strong style={{ color: "var(--ink-secondary)", fontWeight: 600 }}>Orish</strong>
      </span>
    </footer>
  );
}
