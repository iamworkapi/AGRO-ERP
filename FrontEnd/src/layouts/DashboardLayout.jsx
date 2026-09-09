import { useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import Footer from "../components/layout/Footer";
import BottomNavigation from "../components/layout/BottomNavigation";
import MobileAppHubModal from "../components/layout/MobileAppHubModal";

export default function DashboardLayout({ children }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [appHubOpen, setAppHubOpen] = useState(false);

  return (
    <div
      className="app-dashboard-root"
      style={{
        display: "flex",
        height: "100vh",
        background: "var(--canvas)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Desktop Mobile Drawer Backdrop (if traditional sidebar opened) */}
      {mobileSidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileSidebarOpen(false)}
          aria-label="Close Mobile Navigation"
        />
      )}

      {/* Desktop & Tablet Sidebar */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className="app-content-viewport"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          minHeight: 0,
          position: "relative",
        }}
      >
        <Topbar
          onToggleMobileSidebar={() => setMobileSidebarOpen((o) => !o)}
          onOpenAppHub={() => setAppHubOpen(true)}
        />

        <main
          className="app-main animate-fade-in"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            className="app-main-content"
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {children}
          </div>
        </main>

        <Footer />
      </div>

      {/* Mobile iOS / Android Bottom Navigation Bar */}
      <BottomNavigation
        isAppHubOpen={appHubOpen}
        onOpenAppHub={() => setAppHubOpen((cur) => !cur)}
      />

      {/* Mobile App Hub Bottom Sheet Modal */}
      <MobileAppHubModal
        isOpen={appHubOpen}
        onClose={() => setAppHubOpen(false)}
      />
    </div>
  );
}
