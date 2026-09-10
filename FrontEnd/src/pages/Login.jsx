import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import FormField from "../components/common/FormField";
import Button from "../components/common/Button";
import { useAuth } from "../hooks/useAuth";
import { loginSchema, forgotPasswordSchema, resetPasswordSchema } from "../validators/authValidators";
import { validateOrToast } from "../utils/validate";
import { toast } from "../utils/toast";
import { requestPasswordReset, resetPassword } from "../features/auth/api";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
  const [selectedRole, setSelectedRole] = useState("super_admin");
  const [warehouseDropdownOpen, setWarehouseDropdownOpen] = useState(false);
  const [warehouseSearchQuery, setWarehouseSearchQuery] = useState("");
  const [form, setForm] = useState({ identifier: "iamworkapi@gmail.com", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setWarehouseDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    fetch("/api/v1/warehouses/public")
      .then((res) => res.json())
      .then((body) => {
        if (!mounted) return;
        const list = body?.data || [];
        setWarehouses(list);
        if (list.length > 0) {
          setSelectedWarehouseId(list[0].id);
        }
      })
      .catch((err) => {
        console.error("Failed to load warehouses from database:", err);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState("request");
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [forgotShowNewPassword, setForgotShowNewPassword] = useState(false);
  const [forgotInfo, setForgotInfo] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const set = (key) => (val) => {
    setForm((f) => ({ ...f, [key]: val }));
  };

  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
    setWarehouseDropdownOpen(false);
    if (roleKey === "super_admin") {
      setForm({ identifier: "iamworkapi@gmail.com", password: "" });
    } else {
      setForm({ identifier: "", password: "" });
    }
  };

  const handleWarehouseChange = (whId) => {
    setSelectedWarehouseId(whId);
    setForm((f) => ({ ...f, identifier: "", password: "" }));
  };

  const selectedWh = warehouses.find((w) => w.id === selectedWarehouseId) || warehouses[0];
  const filteredWarehouses = warehouses.filter((w) =>
    (w.name || "").toLowerCase().includes(warehouseSearchQuery.toLowerCase()) ||
    (w.address || "").toLowerCase().includes(warehouseSearchQuery.toLowerCase())
  );

  async function handleSubmit(e) {
    e.preventDefault();
    const parsed = validateOrToast(loginSchema, form);
    if (!parsed) return;

    setIsLoading(true);
    try {
      await login(parsed).unwrap();
      navigate("/");
    } catch (err) {
      toast.error(err?.message || "Invalid login credentials — please check your phone/email and password.");
    } finally {
      setIsLoading(false);
    }
  }

  function closeForgotModal() {
    setShowForgotModal(false);
    setForgotStep("request");
    setForgotIdentifier("");
    setForgotOtp("");
    setForgotNewPassword("");
    setForgotConfirmPassword("");
    setForgotShowNewPassword(false);
    setForgotInfo("");
  }

  async function handleForgotRequest(e) {
    e.preventDefault();
    const parsed = validateOrToast(forgotPasswordSchema, { identifier: forgotIdentifier });
    if (!parsed) return;

    setForgotLoading(true);
    try {
      const message = await requestPasswordReset(parsed.identifier);
      setForgotInfo(message);
      setForgotStep("verify");
    } catch (err) {
      toast.error(err?.message || "Could not send a reset code. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  }

  async function handleForgotVerify(e) {
    e.preventDefault();
    const parsed = validateOrToast(resetPasswordSchema, {
      identifier: forgotIdentifier,
      otp: forgotOtp,
      newPassword: forgotNewPassword,
      confirmPassword: forgotConfirmPassword,
    });
    if (!parsed) return;

    setForgotLoading(true);
    try {
      await resetPassword(parsed);
      toast.success("Password updated. Please sign in with your new password.");
      closeForgotModal();
    } catch (err) {
      toast.error(err?.message || "Could not reset your password. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  }

  const DEMO_ROLES = [
    {
      key: "super_admin",
      label: "Super Admin",
      icon: "fa-solid fa-user-shield",
    },
    {
      key: "admin",
      label: "Warehouse Admin",
      icon: "fa-solid fa-user-check",
    },
    {
      key: "supervisor",
      label: "Supervisor",
      icon: "fa-solid fa-user-gear",
    },
  ];

  return (
    <AuthLayout>
      {/* MOBILE BRAND LOGO */}
      <div className="auth-mobile-logo" style={{ alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ background: "#FFFFFF", borderRadius: "50%", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.12)", flexShrink: 0 }}>
          <img src="/Agro-Logo.svg" alt="Kusumganga Logo" style={{ width: 28, height: 28, objectFit: "contain" }} />
        </div>
        <div style={{ textAlign: "left" }}>
          <span style={{ fontWeight: 900, fontSize: 15, color: "#0D3823", display: "block", lineHeight: 1.15, letterSpacing: "-0.01em" }}>
            KUSUMGANGA AGRO
          </span>
          <span style={{ fontSize: 9.5, color: "#1B5E3A", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            ERP Portal
          </span>
        </div>
      </div>

      {/* HEADER */}
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, color: "#0D3823", margin: "0 0 3px", letterSpacing: "-0.02em" }}>
          Welcome Back
        </h2>
        <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>
          Sign in to your Kusumganga ERP account
        </span>
      </div>

      {/* ROLE SELECTOR */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ marginBottom: 6, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 10.5, fontWeight: 800, color: "#0D3823", textTransform: "uppercase", letterSpacing: "0.6px" }}>
            Select Login Role
          </span>
          <span style={{ fontSize: 10, color: "#1B5E3A", fontWeight: 700 }}>
            {selectedRole === "super_admin" ? "Enterprise Mode" : "Hub Node Mode"}
          </span>
        </div>

        <div className="tactile-segmented-container">
          {DEMO_ROLES.map((r) => {
            const isActive = selectedRole === r.key;
            return (
              <button
                key={r.key}
                type="button"
                onClick={() => handleRoleSelect(r.key)}
                className={`tactile-segmented-btn ${isActive ? "active" : "inactive"}`}
              >
                <i className={r.icon} style={{ fontSize: 11, color: isActive ? "#9AE6B4" : "rgba(255,255,255,0.6)" }} />
                <span>{r.label}</span>
              </button>
            );
          })}
        </div>

        {/* Compact Role Notice / Warehouse Dropdown */}
        {selectedRole === "super_admin" ? (
          <div style={{ marginTop: 8, textAlign: "center" }}>
            <span style={{ fontSize: 11, color: "#166534", fontWeight: 700, background: "rgba(22, 163, 74, 0.08)", padding: "3px 12px", borderRadius: 16, display: "inline-flex", alignItems: "center", gap: 5, border: "1px solid rgba(22, 163, 74, 0.15)" }}>
              <i className="fa-solid fa-shield-halved" style={{ fontSize: 10, color: "#16A34A" }} />
              Super Admin • Full Multi-Hub Access & Audit Logs
            </span>
          </div>
        ) : (
          <div style={{ marginTop: 8, position: "relative", width: "100%" }} ref={dropdownRef}>
            <div
              className={`auth-wh-selector-trigger ${warehouseDropdownOpen ? "open" : ""}`}
              onClick={() => setWarehouseDropdownOpen(!warehouseDropdownOpen)}
              role="button"
              tabIndex={0}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                <i className="fa-solid fa-warehouse" style={{ color: "#16A34A", fontSize: 12, marginLeft: 2 }} />
                <span style={{ fontSize: 11.5, fontWeight: 700, color: "#0D3823", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {selectedWh ? selectedWh.name : "Select Warehouse Hub..."}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <span style={{ fontSize: 9.5, color: "#15803D", fontWeight: 700, background: "rgba(22, 163, 74, 0.12)", padding: "1px 6px", borderRadius: 6 }}>
                  {selectedRole === "admin" ? "Admin Hub" : "Supervisor Hub"}
                </span>
                <i className="fa-solid fa-chevron-down" style={{ color: "#16A34A", fontSize: 10, transition: "transform 0.2s ease", transform: warehouseDropdownOpen ? "rotate(180deg)" : "rotate(0)" }} />
              </div>
            </div>

            {/* FLYOUT DROPDOWN (Positioned Absolute — Never pushes or resizes the card) */}
            {warehouseDropdownOpen && (
              <div className="auth-wh-menu-dropdown">
                {warehouses.length > 3 && (
                  <div style={{ position: "relative", marginBottom: 6 }}>
                    <input
                      type="text"
                      placeholder="Search warehouse..."
                      value={warehouseSearchQuery}
                      onChange={(e) => setWarehouseSearchQuery(e.target.value)}
                      className="auth-wh-search-input"
                      autoFocus
                    />
                    <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: "var(--muted)" }} />
                  </div>
                )}
                <div style={{ maxHeight: 150, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
                  {filteredWarehouses.length === 0 ? (
                    <div style={{ padding: "8px 10px", fontSize: 11, color: "var(--muted)", textAlign: "center" }}>No warehouses found</div>
                  ) : (
                    filteredWarehouses.map((wh) => {
                      const isSelected = selectedWarehouseId === wh.id;
                      return (
                        <button
                          key={wh.id}
                          type="button"
                          className={`auth-wh-item ${isSelected ? "selected" : ""}`}
                          onClick={() => {
                            handleWarehouseChange(wh.id);
                            setWarehouseDropdownOpen(false);
                            setWarehouseSearchQuery("");
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                            <i className="fa-solid fa-location-dot" style={{ color: isSelected ? "#16A34A" : "var(--muted)", fontSize: 11 }} />
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 11.5, fontWeight: isSelected ? 800 : 600, color: "#0D3823" }}>{wh.name}</div>
                              {wh.address && <div style={{ fontSize: 9.5, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{wh.address}</div>}
                            </div>
                          </div>
                          {isSelected && <i className="fa-solid fa-circle-check" style={{ color: "#16A34A", fontSize: 12, flexShrink: 0 }} />}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* LOGIN FORM */}
      <form onSubmit={handleSubmit}>
        {/* Email / Phone */}
        <div className="underline-input-group" style={{ marginBottom: 12 }}>
          <i className="fa-solid fa-user-large underline-input-icon" />
          <input
            type="text"
            required
            value={form.identifier}
            onChange={(e) => set("identifier")(e.target.value)}
            placeholder="Email or Phone Number"
            className="underline-input-field"
            autoComplete="username"
          />
        </div>

        {/* Password */}
        <div className="underline-input-group" style={{ marginBottom: 12 }}>
          <i className="fa-solid fa-lock underline-input-icon" />
          <input
            type={showPassword ? "text" : "password"}
            required
            value={form.password}
            onChange={(e) => set("password")(e.target.value)}
            placeholder="Your Password"
            className="underline-input-field"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{ border: "none", background: "transparent", color: "var(--muted)", cursor: "pointer", padding: "0 4px" }}
          >
            <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`} style={{ fontSize: 14 }} />
          </button>
        </div>

        {/* Remember me & Forgot */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8, marginBottom: 20 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", userSelect: "none" }}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ accentColor: "var(--primary)", width: 14, height: 14, cursor: "pointer" }}
            />
            <span style={{ fontSize: 12, color: "var(--ink-secondary)", fontWeight: 500 }}>Remember me</span>
          </label>

          <button
            type="button"
            onClick={() => setShowForgotModal(true)}
            style={{ border: "none", background: "transparent", color: "#0D3823", fontSize: 12, fontWeight: 700, cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 5 }}
          >
            <i className="fa-solid fa-key" style={{ fontSize: 11, color: "#1B5E3A" }} /> Forgot Password?
          </button>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isLoading}
          className="btn-glow"
          style={{
            width: "100%",
            padding: "11px 20px",
            fontSize: 13.5,
            fontWeight: 800,
            borderRadius: 24,
            background: "linear-gradient(135deg, #0D3823 0%, #1B5E3A 50%, #2E8B57 100%)",
            boxShadow: "0 6px 18px rgba(13, 56, 35, 0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            border: "none",
            letterSpacing: "0.03em",
          }}
        >
          {isLoading ? (
            <>
              <i className="fa-solid fa-circle-notch spin" style={{ fontSize: 14 }} />
              Signing in...
            </>
          ) : (
            <>
              Sign In <i className="fa-solid fa-arrow-right-to-bracket" style={{ fontSize: 13 }} />
            </>
          )}
        </Button>
      </form>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div
          onClick={closeForgotModal}
          style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.65)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999, padding: 16 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="animate-toast"
            style={{ background: "var(--surface)", width: 380, maxWidth: "100%", borderRadius: 14, border: "1px solid var(--line)", padding: 20, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                <i className="fa-solid fa-key" style={{ color: "#1B5E3A" }} />
                {forgotStep === "request" ? "Reset Password" : "Enter Verification Code"}
              </h3>
              <button type="button" onClick={closeForgotModal} style={{ border: "none", background: "transparent", fontSize: 18, color: "var(--muted)", cursor: "pointer" }}>&times;</button>
            </div>

            {forgotStep === "request" ? (
              <form onSubmit={handleForgotRequest}>
                <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 12px" }}>
                  Enter your registered email or phone. We'll send a 6-digit verification code to all your contact methods.
                </p>
                <FormField label="Registered Email or Phone" required icon="fa-solid fa-envelope" value={forgotIdentifier} onChange={setForgotIdentifier} placeholder="e.g. admin@pralli.com" compact marginBottom={12} />
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
                  <Button variant="secondary" type="button" onClick={closeForgotModal} style={{ padding: "7px 12px", fontSize: 12 }}>Cancel</Button>
                  <Button type="submit" disabled={forgotLoading} style={{ padding: "7px 14px", fontSize: 12 }}>
                    {forgotLoading ? "Sending…" : "Send Code"}
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleForgotVerify}>
                {forgotInfo && (
                  <div style={{ padding: "10px 12px", background: "var(--primary-tint)", border: "1px solid var(--line)", borderRadius: 8, fontSize: 12, color: "var(--primary-deep)", display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 14 }}>
                    <i className="fa-solid fa-circle-check" style={{ fontSize: 14, marginTop: 1 }} />
                    <span>{forgotInfo}</span>
                  </div>
                )}
                <FormField label="6-Digit Code" required icon="fa-solid fa-shield-halved" value={forgotOtp} onChange={(v) => setForgotOtp(v.replace(/\D/g, "").slice(0, 6))} placeholder="123456" compact marginBottom={12} />
                <FormField label="New Password" type="password" required icon="fa-solid fa-lock" value={forgotNewPassword} onChange={setForgotNewPassword} placeholder="Min 8 characters" compact marginBottom={12} showPasswordToggle showPassword={forgotShowNewPassword} onTogglePassword={() => setForgotShowNewPassword((v) => !v)} />
                <FormField label="Confirm Password" type="password" required icon="fa-solid fa-lock" value={forgotConfirmPassword} onChange={setForgotConfirmPassword} placeholder="Re-enter password" compact marginBottom={4} />
                <button type="button" onClick={() => setForgotStep("request")} style={{ border: "none", background: "transparent", color: "var(--primary-deep)", fontSize: 11.5, fontWeight: 600, cursor: "pointer", padding: "6px 0" }}>
                  &larr; Different email/phone or resend
                </button>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 10 }}>
                  <Button variant="secondary" type="button" onClick={closeForgotModal} style={{ padding: "7px 12px", fontSize: 12 }}>Cancel</Button>
                  <Button type="submit" disabled={forgotLoading} style={{ padding: "7px 14px", fontSize: 12 }}>
                    {forgotLoading ? "Verifying…" : "Reset Password"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
