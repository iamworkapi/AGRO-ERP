import { useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import Footer from "../components/layout/Footer";

export default function DashboardLayout({ children }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--canvas)", overflow: "hidden", position: "relative" }}>
      {mobileSidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileSidebarOpen(false)}
          aria-label="Close Mobile Navigation"
        />
      )}
      <Sidebar mobileOpen={mobileSidebarOpen} onCloseMobile={() => setMobileSidebarOpen(false)} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0 }}>
        <Topbar onToggleMobileSidebar={() => setMobileSidebarOpen((o) => !o)} />
        <main
          className="app-main animate-fade-in"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            padding: "8px 14px",
          }}
        >
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
