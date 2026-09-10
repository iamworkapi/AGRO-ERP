export default function Footer() {
  return (
    <footer
      className="app-footer"
      style={{
        flexShrink: 0,
        padding: "8px 24px",
        borderTop: "1px solid var(--line)",
        background: "var(--surface)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: 11,
        color: "var(--muted)",
      }}
    >
      <span>&copy; {new Date().getFullYear()} Kusumganga Agro Solutions Pvt. Ltd. All rights reserved.</span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }} />
        Parali Biomass ERP &bull; Bettiah Central Hub
      </span>
    </footer>
  );
}
