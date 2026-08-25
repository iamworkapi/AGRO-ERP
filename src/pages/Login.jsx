import { useState } from "react";
import {
  Warehouse,
  Eye,
  EyeOff,
  CheckCircle,
  Key,
  Shield,
  Lock,
  Mail,
  LogIn,
  User,
  UserCheck,
  Settings,
  Wheat,
  Network,
  Sparkles,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import FormField from "../components/common/FormField";
import Loader from "../components/common/Loader";
import Button from "../components/common/Button";
import { useAuth } from "../hooks/useAuth";
import { loginSchema, forgotPasswordSchema, resetPasswordSchema } from "../validators/authValidators";
import { validateOrToast } from "../utils/validate";
import { toast } from "../utils/toast";
import { requestPasswordReset, resetPassword } from "../features/auth/api";

function LucideIconWrapper({ children, size = 16 }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        flexShrink: 0,
      }}
    >
      {children}
    </span>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const WAREHOUSES = [
    {
      id: "wh_1",
      name: "Warehouse #1 — Kusumganga Central Hub (Barabanki)",
      adminEmail: "admin@pralli.com",
      adminPass: "admin@123",
      supervisorEmail: "supervisor@pralli.com",
      supervisorPass: "supervisor12",
    },
  ];

  const [selectedWarehouseId, setSelectedWarehouseId] = useState("wh_1");
  const [selectedRole, setSelectedRole] = useState("super_admin");
  const [form, setForm] = useState({ identifier: "iamworkapi@gmail.com", password: "admin12" });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState("request"); // "request" | "verify"
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
    const wh = WAREHOUSES.find((w) => w.id === selectedWarehouseId) || WAREHOUSES[0];
    if (roleKey === "super_admin") {
      setForm({ identifier: "iamworkapi@gmail.com", password: "admin12" });
    } else if (roleKey === "admin") {
      setForm({ identifier: wh.adminEmail, password: wh.adminPass });
    } else if (roleKey === "supervisor") {
      setForm({ identifier: wh.supervisorEmail, password: wh.supervisorPass });
    }
  };

  const handleWarehouseChange = (whId) => {
    setSelectedWarehouseId(whId);
    const wh = WAREHOUSES.find((w) => w.id === whId) || WAREHOUSES[0];
    if (selectedRole === "admin") {
      setForm({ identifier: wh.adminEmail, password: wh.adminPass });
    } else if (selectedRole === "supervisor") {
      setForm({ identifier: wh.supervisorEmail, password: wh.supervisorPass });
    }
  };

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
      subLabel: "Full Access",
      icon: <LucideIconWrapper size={13}><Shield size={13} /></LucideIconWrapper>,
      identifier: "iamworkapi@gmail.com",
      password: "admin12",
    },
    {
      key: "admin",
      label: "Admin",
      subLabel: "Warehouse Admin",
      icon: <LucideIconWrapper size={13}><UserCheck size={13} /></LucideIconWrapper>,
      identifier: "admin@pralli.com",
      password: "admin@123",
    },
    {
      key: "supervisor",
      label: "Supervisor",
      subLabel: "Floor Ops",
      icon: <LucideIconWrapper size={13}><Settings size={13} /></LucideIconWrapper>,
      identifier: "supervisor@pralli.com",
      password: "supervisor12",
    },
  ];

  return (
    <AuthLayout>
      <div className="auth-unified-card animate-slide-up">
        {/* Top Glowing Gradient Accent Bar */}
        <div className="auth-card-top-bar" />

        {/* UNIFIED BRAND & PORTAL HEADER */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          {/* Logo Badge */}
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: "50%",
                background: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 24px rgba(16, 185, 129, 0.25), 0 2px 6px rgba(0, 0, 0, 0.1)",
                border: "2px solid #E2E8F0",
                position: "relative",
              }}
            >
              <img
                src="/Agro-Logo.svg"
                alt="Kusumganga Agro Logo"
                style={{
                  height: 42,
                  width: 42,
                  objectFit: "contain",
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  color: "#062316",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.1,
                }}
              >
                KUSUMGANGA AGRO
              </span>
              <span
                style={{
                  background: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
                  color: "white",
                  fontSize: 9.5,
                  fontWeight: 800,
                  padding: "2px 7px",
                  borderRadius: 10,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                ERP Portal
              </span>
            </div>
            <span style={{ fontSize: 11.5, color: "#64748B", fontWeight: 600 }}>
              Biomass Supply Chain & Multi-Hub Warehouse Command Hub
            </span>
          </div>
        </div>

        {/* TACTILE 3-SEGMENTED ROLE SWITCHER */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 10.5, fontWeight: 800, color: "#062316", textTransform: "uppercase", letterSpacing: "0.6px" }}>
              Select Login Role
            </span>
            <span style={{ fontSize: 10, color: "#059669", fontWeight: 700, display: "flex", alignItems: "center", gap: 3 }}>
              <Sparkles size={11} /> Quick Credentials Loaded
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
                  {r.icon}
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>

          {/* Selected Role Capability Notice */}
          <div style={{ marginTop: 8, textAlign: "center" }}>
            <span
              style={{
                fontSize: 10.5,
                color: "#062316",
                fontWeight: 700,
                background: "rgba(16, 185, 129, 0.12)",
                padding: "4px 12px",
                borderRadius: 20,
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <LucideIconWrapper size={11}><Shield size={11} /></LucideIconWrapper>
              {selectedRole === "super_admin" && "Super Admin — Full Multi-Hub Access & Audit Logs"}
              {selectedRole === "admin" && "Admin — Warehouse Operations & Stock Ledger"}
              {selectedRole === "supervisor" && "Supervisor — Floor Weighbridge & Moisture Deductions"}
            </span>
          </div>

          {/* WAREHOUSE / HUB SELECTOR DROPDOWN FOR ADMIN & SUPERVISOR ROLES */}
          {selectedRole !== "super_admin" && (
            <div style={{ marginTop: 12, textAlign: "left" }} className="animate-fade-in">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <label style={{ fontSize: 10.5, fontWeight: 800, color: "#062316", textTransform: "uppercase", letterSpacing: "0.6px" }}>
                  Select Warehouse Hub
                </label>
                <span style={{ fontSize: 9.5, color: "#059669", fontWeight: 700 }}>
                  {selectedRole === "admin" ? "Admin Hub" : "Supervisor Hub"}
                </span>
              </div>
              <div className="auth-modern-input-group" style={{ marginBottom: 0 }}>
                <LucideIconWrapper size={16}><Warehouse size={16} color="#059669" /></LucideIconWrapper>
                <select
                  value={selectedWarehouseId}
                  onChange={(e) => handleWarehouseChange(e.target.value)}
                  className="auth-modern-input-field"
                  style={{
                    cursor: "pointer",
                    fontWeight: 700,
                    color: "#0F172A",
                    appearance: "none",
                    WebkitAppearance: "none",
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23059669' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 8px center",
                    paddingRight: 24,
                  }}
                >
                  {WAREHOUSES.map((wh) => (
                    <option key={wh.id} value={wh.id} style={{ color: "#0F172A", fontWeight: 600 }}>
                      {wh.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* LOGIN CREDENTIALS FORM */}
        <form onSubmit={handleSubmit}>
          {/* Email / Phone Field */}
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#334155", marginBottom: 4 }}>
              Account Identifier
            </label>
            <div className="auth-modern-input-group">
              <LucideIconWrapper size={16}><User size={16} color="#64748B" /></LucideIconWrapper>
              <input
                type="text"
                required
                value={form.identifier}
                onChange={(e) => set("identifier")(e.target.value)}
                placeholder="Phone or Email Address"
                className="auth-modern-input-field"
              />
            </div>
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#334155", marginBottom: 4 }}>
              Security Password
            </label>
            <div className="auth-modern-input-group">
              <LucideIconWrapper size={16}><Lock size={16} color="#64748B" /></LucideIconWrapper>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={form.password}
                onChange={(e) => set("password")(e.target.value)}
                placeholder="Enter password"
                className="auth-modern-input-field"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#64748B",
                  cursor: "pointer",
                  padding: "0 4px",
                  display: "flex",
                  alignItems: "center",
                }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <LucideIconWrapper size={15}><EyeOff size={15} /></LucideIconWrapper>
                ) : (
                  <LucideIconWrapper size={15}><Eye size={15} /></LucideIconWrapper>
                )}
              </button>
            </div>
          </div>

          {/* Action Row: Remember me & Forgot Password */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", userSelect: "none" }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: "#059669", width: 14, height: 14, cursor: "pointer" }}
              />
              <span style={{ fontSize: 12, color: "#475569", fontWeight: 600 }}>Remember this device</span>
            </label>

            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              style={{
                border: "none",
                background: "transparent",
                color: "#059669",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <LucideIconWrapper size={12}><Key size={12} /></LucideIconWrapper> Forgot Password?
            </button>
          </div>

          {/* Modern Full-Width Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="btn-glow"
            style={{
              width: "100%",
              padding: "12px 20px",
              fontSize: 14,
              fontWeight: 800,
              borderRadius: 14,
              background: "linear-gradient(135deg, #062316 0%, #0D3823 40%, #165E3A 80%, #059669 100%)",
              boxShadow: "0 8px 24px rgba(6, 35, 22, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              border: "none",
              color: "white",
              letterSpacing: "0.02em",
              cursor: "pointer",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
            }}
          >
            {isLoading ? (
              <>
                <LucideIconWrapper size={15}><Loader size={15} /></LucideIconWrapper> Authenticating...
              </>
            ) : (
              <>
                Sign In to Kusumganga ERP <LucideIconWrapper size={15}><LogIn size={15} /></LucideIconWrapper>
              </>
            )}
          </Button>
        </form>

        {/* Feature Trust Pills at the base of the single card */}
        <div className="auth-feature-pills">
          <span className="auth-feature-pill-item">
            <Wheat size={12} color="#059669" /> Weighbridge & Moisture
          </span>
          <span className="auth-feature-pill-item">
            <Network size={12} color="#059669" /> 12 Hubs Live Sync
          </span>
          <span className="auth-feature-pill-item">
            <Shield size={12} color="#059669" /> Audited Ledger
          </span>
        </div>
      </div>

      {/* Forgot Password Modal - real 2-step OTP flow */}
      {showForgotModal && (
        <div
          onClick={closeForgotModal}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(1, 11, 6, 0.75)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="animate-toast"
            style={{
              background: "#FFFFFF",
              width: 400,
              maxWidth: "100%",
              borderRadius: 18,
              border: "1px solid #E2E8F0",
              padding: 24,
              boxShadow: "0 24px 60px rgba(0, 0, 0, 0.4)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#062316", display: "flex", alignItems: "center", gap: 8 }}>
                <LucideIconWrapper size={17}><Key size={17} color="#059669" /></LucideIconWrapper>
                {forgotStep === "request" ? "Reset Password" : "Enter Reset Code"}
              </h3>
              <button
                onClick={closeForgotModal}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: 20,
                  cursor: "pointer",
                  color: "#94A3B8",
                  lineHeight: 1,
                }}
              >
                &times;
              </button>
            </div>

            {forgotStep === "request" ? (
              <form onSubmit={handleForgotRequest}>
                <p style={{ fontSize: 12.5, color: "#64748B", margin: "0 0 14px", lineHeight: 1.45 }}>
                  Enter your registered phone or email. We'll send a 6-digit verification code to your registered contact method.
                </p>
                <FormField
                  label="Registered Email or Phone"
                  required
                  icon={<LucideIconWrapper size={16}><Mail size={16} /></LucideIconWrapper>}
                  value={forgotIdentifier}
                  onChange={setForgotIdentifier}
                  placeholder="e.g. admin@pralli.com"
                  compact
                  marginBottom={14}
                />
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
                  <Button variant="secondary" type="button" onClick={closeForgotModal} style={{ padding: "8px 14px", fontSize: 12.5 }}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={forgotLoading}
                    style={{
                      padding: "8px 16px",
                      fontSize: 12.5,
                      background: "linear-gradient(135deg, #062316 0%, #059669 100%)",
                      border: "none",
                      color: "white",
                    }}
                  >
                    {forgotLoading ? "Sending Code…" : "Send Reset Code"}
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleForgotVerify}>
                {forgotInfo && (
                  <div
                    style={{
                      padding: "10px 12px",
                      background: "rgba(16, 185, 129, 0.12)",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      borderRadius: 10,
                      fontSize: 12,
                      color: "#062316",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                      marginBottom: 14,
                    }}
                  >
                    <LucideIconWrapper size={15}><CheckCircle size={15} color="#059669" /></LucideIconWrapper>
                    <span>{forgotInfo}</span>
                  </div>
                )}
                <FormField
                  label="6-Digit Code"
                  required
                  icon={<LucideIconWrapper size={16}><Shield size={16} /></LucideIconWrapper>}
                  value={forgotOtp}
                  onChange={(v) => setForgotOtp(v.replace(/\D/g, "").slice(0, 6))}
                  placeholder="123456"
                  compact
                  marginBottom={12}
                />
                <FormField
                  label="New Password"
                  type="password"
                  required
                  icon={<LucideIconWrapper size={16}><Lock size={16} /></LucideIconWrapper>}
                  value={forgotNewPassword}
                  onChange={setForgotNewPassword}
                  placeholder="••••••••"
                  compact
                  marginBottom={12}
                  showPasswordToggle
                  showPassword={forgotShowNewPassword}
                  onTogglePassword={() => setForgotShowNewPassword((v) => !v)}
                />
                <FormField
                  label="Confirm New Password"
                  type="password"
                  required
                  icon={<LucideIconWrapper size={16}><Lock size={16} /></LucideIconWrapper>}
                  value={forgotConfirmPassword}
                  onChange={setForgotConfirmPassword}
                  placeholder="••••••••"
                  compact
                  marginBottom={6}
                />
                <button
                  type="button"
                  onClick={() => setForgotStep("request")}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#059669",
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: "pointer",
                    padding: "6px 0",
                  }}
                >
                  &larr; Use a different email/phone or resend code
                </button>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
                  <Button variant="secondary" type="button" onClick={closeForgotModal} style={{ padding: "8px 14px", fontSize: 12.5 }}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={forgotLoading}
                    style={{
                      padding: "8px 16px",
                      fontSize: 12.5,
                      background: "linear-gradient(135deg, #062316 0%, #059669 100%)",
                      border: "none",
                      color: "white",
                    }}
                  >
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
