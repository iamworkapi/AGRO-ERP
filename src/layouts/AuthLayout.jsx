const FEATURES = [
  "Real-time stock, moisture & weighment tracking",
  "Role-based access for Admins, Supervisors & Staff",
  "Audited attendance, purchase and billing workflows",
];

export default function AuthLayout({ children }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--canvas)", overflow: "hidden" }}>
      {/* Left Hero Brand Panel */}
      <div
        className="auth-brand-panel"
        style={{
          flex: "0 0 45%",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "44px 52px",
          color: "white",
          background: "linear-gradient(155deg, #051F17 0%, #07281D 45%, #0F382A 100%)",
        }}
      >
        {/* Animated Background Mesh Orbs */}
        <div
          className="animate-pulse-glow"
          aria-hidden="true"
          style={{
            position: "absolute",
            width: 440,
            height: 440,
            borderRadius: "50%",
            top: -120,
            right: -100,
            background: "radial-gradient(circle, rgba(0, 184, 107, 0.28), transparent 70%)",
            filter: "blur(20px)",
            pointerEvents: "none",
          }}
        />
        <div
          className="animate-float"
          aria-hidden="true"
          style={{
            position: "absolute",
            width: 340,
            height: 340,
            borderRadius: "50%",
            bottom: -80,
            left: -60,
            background: "radial-gradient(circle, rgba(51, 198, 137, 0.2), transparent 70%)",
            filter: "blur(24px)",
            pointerEvents: "none",
          }}
        />

        {/* Brand Header & Headline */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 44 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: "var(--gradient-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 18,
                color: "white",
                boxShadow: "0 4px 14px rgba(0, 184, 107, 0.4)",
              }}
            >
              <i className="fa-solid fa-wheat-awn" style={{ fontSize: 18 }} />
            </div>
            <div>
              <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: "-0.03em", color: "white" }}>
                PRALLI
              </span>
              <span style={{ fontSize: 10.5, background: "rgba(0, 184, 107, 0.2)", color: "#33C689", padding: "2px 8px", borderRadius: 12, marginLeft: 10, fontWeight: 600, border: "1px solid rgba(0, 184, 107, 0.3)" }}>
                v2.4 Enterprise
              </span>
            </div>
          </div>

          <h1 style={{ fontSize: 30, lineHeight: 1.25, fontWeight: 800, margin: "0 0 14px", maxWidth: 400, color: "white", letterSpacing: "-0.03em" }}>
            Run every warehouse from one intelligent command centre.
          </h1>
          <p style={{ fontSize: 13.5, color: "rgba(255, 255, 255, 0.72)", maxWidth: 380, lineHeight: 1.6, margin: "0 0 28px" }}>
            Real-time PRALLI, grain weighment, moisture deductions, and multi-location inventory &mdash; audited and unified.
          </p>

          {/* Floating Metric Badges */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
            <div style={{ background: "rgba(255, 255, 255, 0.08)", backdropFilter: "blur(10px)", border: "1px solid rgba(255, 255, 255, 0.12)", borderRadius: 8, padding: "6px 12px", display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 8px #10B981" }} />
              <i className="fa-solid fa-warehouse" style={{ fontSize: 11, color: "#33C689" }} />
              12 Active Hubs Live
            </div>
            <div style={{ background: "rgba(255, 255, 255, 0.08)", backdropFilter: "blur(10px)", border: "1px solid rgba(255, 255, 255, 0.12)", borderRadius: 8, padding: "6px 12px", display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>
              <i className="fa-solid fa-shield-halved" style={{ fontSize: 12, color: "#33C689" }} />
              256-Bit Encrypted
            </div>
          </div>
        </div>

        {/* Features Checklist */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 12, margin: "20px 0" }}>
          {FEATURES.map((feature) => (
            <div key={feature} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: "rgba(0, 184, 107, 0.22)",
                  color: "#33C689",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(0, 184, 107, 0.3)",
                  fontSize: 11,
                }}
              >
                <i className="fa-solid fa-check" />
              </span>
              <span style={{ fontSize: 13, color: "rgba(255, 255, 255, 0.88)", fontWeight: 500 }}>{feature}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255, 255, 255, 0.1)", paddingTop: 16 }}>
          <p style={{ fontSize: 11.5, color: "rgba(255, 255, 255, 0.45)", margin: 0 }}>
            &copy; {new Date().getFullYear()} Orish Agro ERP Platform.
          </p>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 500, display: "flex", alignItems: "center", gap: 5 }}>
            <i className="fa-solid fa-certificate" style={{ color: "#33C689", fontSize: 10 }} /> ISO 27001
          </span>
        </div>
      </div>

      {/* Right Form Card Panel */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 20px" }}>
        <div className="auth-mobile-logo" style={{ display: "none", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div
            style={{
              width: 34, height: 34, borderRadius: 8, background: "var(--gradient-primary)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 16, color: "white",
            }}
          >
            <i className="fa-solid fa-wheat-awn" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 18, color: "var(--ink)" }}>PRALLI</span>
        </div>

        <div className="animate-slide-up" style={{ width: 420, maxWidth: "100%" }}>
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: 16,
              boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.07), 0 0 0 1px rgba(0, 0, 0, 0.03)",
              padding: "28px 30px 24px",
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
                background: "linear-gradient(90deg, #059669 0%, #10B981 50%, #34D399 100%)",
              }}
            />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

