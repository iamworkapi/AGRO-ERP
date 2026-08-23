import { Wheat, Network, Check, Shield } from "lucide-react";

function iconWrapper(children, size) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: size, height: size, flexShrink: 0 }}>
      {children}
    </span>
  );
}

const FEATURES = [
  "Real-time stock, moisture & weighment tracking",
  "Role-based access for Admins, Supervisors & Staff",
  "Audited attendance, purchase and billing workflows",
];

export default function AuthLayout({ children }) {
  return (
    <div style={{ height: "100vh", maxHeight: "100vh", display: "flex", background: "linear-gradient(135deg, #03150C 0%, #0D3823 45%, #144B2E 85%, #082115 100%)", overflow: "hidden" }}>
      {/* Left Hero Brand Panel (Always visible on Desktop/Laptop) */}
      <div
        className="auth-brand-panel auth-geometric-hero"
        style={{
          flex: "1 1 50%",
          minWidth: 460,
          height: "100vh",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "32px 48px",
          color: "white",
          boxSizing: "border-box",
        }}
      >
        {/* Layered Diagonal Ribbons & Organic Ambient Lighting */}
        <div className="auth-ribbon-1" aria-hidden="true" />
        <div className="auth-ribbon-2" aria-hidden="true" />
        <div className="auth-ribbon-3" aria-hidden="true" />

        <div
          className="animate-pulse-glow"
          aria-hidden="true"
          style={{
            position: "absolute",
            width: 480,
            height: 480,
            borderRadius: "50%",
            top: -140,
            right: -120,
            background: "radial-gradient(circle, rgba(46, 139, 87, 0.38), transparent 70%)",
            filter: "blur(35px)",
            pointerEvents: "none",
          }}
        />

        {/* Brand Header */}
        <div style={{ position: "relative", zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div
              className="agro-glass-badge"
              style={{
                padding: "8px 18px",
                borderRadius: 28,
                display: "flex",
                alignItems: "center",
                gap: 12,
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.22)",
                border: "none",
              }}
            >
              <div
                style={{
                  background: "#FFFFFF",
                  borderRadius: "50%",
                  width: 44,
                  height: 44,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.25)",
                  flexShrink: 0,
                }}
              >
                <img
                  src="/Agro-Logo.svg"
                  alt="Kusumganga Agro Logo"
                  style={{
                    height: 34,
                    width: 34,
                    objectFit: "contain",
                  }}
                />
              </div>
              <div style={{ borderLeft: "1px solid rgba(255, 255, 255, 0.25)", paddingLeft: 12 }}>
                <span style={{ fontWeight: 900, fontSize: 16, letterSpacing: "-0.01em", color: "white", display: "block", lineHeight: 1.1 }}>
                  KUSUMGANGA AGRO
                </span>
                <span style={{ fontSize: 10, color: "#9AE6B4", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  Solutions Pvt Ltd • ERP System
                </span>
              </div>
            </div>
          </div>

          <h1 style={{ fontSize: 28, lineHeight: 1.22, fontWeight: 900, margin: "0 0 10px", maxWidth: 440, color: "white", letterSpacing: "-0.03em" }}>
            Intelligent Command Centre for Modern Agriculture.
          </h1>
          <p style={{ fontSize: 13.5, color: "rgba(255, 255, 255, 0.88)", maxWidth: 430, lineHeight: 1.55, margin: "0 0 20px" }}>
            Unified real-time management for biomass supply chain, grain weighment, moisture deductions, and audited warehouse inventory.
          </p>

          {/* Interactive Feature Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16, maxWidth: 460 }}>
            <div className="agro-glass-badge" style={{ borderRadius: 12, padding: "10px 14px", display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 800, color: "#FFFFFF" }}>
                {iconWrapper(<Wheat size={13} />, 13)}
                Biomass Weighment
              </div>
              <span style={{ fontSize: 10.5, color: "rgba(255, 255, 255, 0.75)", lineHeight: 1.35 }}>
                Automated gross & tare slips with moisture deductions
              </span>
            </div>

            <div className="agro-glass-badge" style={{ borderRadius: 12, padding: "10px 14px", display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 800, color: "#FFFFFF" }}>
                {iconWrapper(<Network size={12} />, 12)}
                12 Live Hubs
              </div>
              <span style={{ fontSize: 10.5, color: "rgba(255, 255, 255, 0.75)", lineHeight: 1.35 }}>
                Real-time multi-warehouse stock sync & vehicle tracking
              </span>
            </div>
          </div>
        </div>

        {/* Features Checklist */}
        <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", gap: 10, margin: "10px 0" }}>
          {FEATURES.map((feature) => (
            <div key={feature} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: "rgba(72, 187, 120, 0.3)",
                  color: "#9AE6B4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(72, 187, 120, 0.5)",
                  fontSize: 10,
                }}
              >
                {iconWrapper(<Check size={10} />, 10)}
              </span>
              <span style={{ fontSize: 13, color: "rgba(255, 255, 255, 0.95)", fontWeight: 500 }}>{feature}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ position: "relative", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255, 255, 255, 0.16)", paddingTop: 14 }}>
          <p style={{ fontSize: 11.5, color: "rgba(255, 255, 255, 0.7)", margin: 0 }}>
            &copy; {new Date().getFullYear()} Kusumganga Agro Solutions Pvt Ltd. All rights reserved.
          </p>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
            {iconWrapper(<Shield size={11} />, 11)} AES-256 Encrypted
          </span>
        </div>
      </div>

      {/* Right Form Card Panel */}
      <div style={{ flex: "1 1 50%", minWidth: 400, height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 24px", background: "transparent", boxSizing: "border-box" }}>
        <div className="animate-slide-up" style={{ width: 420, maxWidth: "100%", position: "relative" }}>
          <div
            className="agro-glass-card"
            style={{
              borderRadius: 28,
              padding: "28px 32px 24px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Top Glowing Gradient Accent Bar */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                borderRadius: "28px 28px 0 0",
                background: "linear-gradient(90deg, #0D3823 0%, #1B5E3A 50%, #2E8B57 100%)",
              }}
            />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

