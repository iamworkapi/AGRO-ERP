import { Shield } from "lucide-react";

export default function AuthLayout({ children }) {
  return (
    <div className="auth-unified-container">
      {/* Ambient background glow layers */}
      <div className="auth-ambient-glow auth-ambient-glow-1" aria-hidden="true" />
      <div className="auth-ambient-glow auth-ambient-glow-2" aria-hidden="true" />
      <div className="auth-ambient-glow auth-ambient-glow-3" aria-hidden="true" />
      <div className="auth-ambient-grid" aria-hidden="true" />

      {/* Main Unified Content Area */}
      <main className="auth-unified-content">
        {children}
      </main>

      {/* Single Unified Page Footer */}
      <footer className="auth-unified-footer">
        <span className="auth-footer-badge">
          <Shield size={12} /> AES-256 Encrypted • Multi-Hub ERP Command Centre
        </span>
        <span style={{ fontSize: 11, opacity: 0.75 }}>
          &copy; {new Date().getFullYear()} Kusumganga Agro Solutions Pvt Ltd. All rights reserved.
        </span>
      </footer>
    </div>
  );
}
