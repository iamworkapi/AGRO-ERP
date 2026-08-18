import { useState } from "react";
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

  const WAREHOUSES = [
    {
      id: "wh_1",
      name: "Warehouse #1 — Kusumganga Central Hub (Nashik)",
      adminEmail: "admin@pralli.com",
      supervisorEmail: "supervisor@pralli.com",
      adminPass: "Password@123",
      supervisorPass: "Password@123",
    },
    {
      id: "wh_2",
      name: "Warehouse #2 — Satara Grain Processing Hub",
      adminEmail: "admin.satara@kusumganga.com",
      supervisorEmail: "supervisor.satara@kusumganga.com",
      adminPass: "Password@123",
      supervisorPass: "Password@123",
    },
    {
      id: "wh_3",
      name: "Warehouse #3 — Sangli Agri Storage & Bio-Hub",
      adminEmail: "admin.sangli@kusumganga.com",
      supervisorEmail: "supervisor.sangli@kusumganga.com",
      adminPass: "Password@123",
      supervisorPass: "Password@123",
    },
    {
      id: "wh_4",
      name: "Warehouse #4 — Kolhapur Biomass Distribution Centre",
      adminEmail: "admin.kolhapur@kusumganga.com",
      supervisorEmail: "supervisor.kolhapur@kusumganga.com",
      adminPass: "Password@123",
      supervisorPass: "Password@123",
    },
  ];

  const [selectedWarehouseId, setSelectedWarehouseId] = useState("wh_1");
  const [selectedRole, setSelectedRole] = useState("super_admin");
  const [form, setForm] = useState({ identifier: "superadmin@pralli.com", password: "Password@123" });
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
      setForm({ identifier: "superadmin@pralli.com", password: "Password@123" });
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
      icon: "fa-solid fa-user-shield",
      identifier: "superadmin@pralli.com",
      password: "Password@123",
      color: "#10B981",
    },
    {
      key: "admin",
      label: "Admin",
      subLabel: "Warehouse Admin",
      icon: "fa-solid fa-user-check",
      identifier: "admin@pralli.com",
      password: "Password@123",
      color: "#059669",
    },
    {
      key: "supervisor",
      label: "Supervisor",
      subLabel: "Floor Ops",
      icon: "fa-solid fa-user-gear",
      identifier: "supervisor@pralli.com",
      password: "Password@123",
      color: "#0D9488",
    },
  ];

  return (
    <AuthLayout>
      {/* RIGHT SIDE HEADER */}
      <div style={{ textAlign: "center", marginBottom: 18 }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, color: "#0D3823", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
          Welcome Back 👋
        </h2>
        <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>
          Sign in to your Kusumganga ERP portal
        </span>
      </div>

      {/* TACTILE 3-SEGMENTED ROLE SWITCHER (MATCHING USER REFERENCE IMAGE) */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ marginBottom: 6, textAlign: "left" }}>
          <span style={{ fontSize: 10.5, fontWeight: 800, color: "#0D3823", textTransform: "uppercase", letterSpacing: "0.6px" }}>
            Select Login Role
          </span>
        </div>

        <div className="tactile-segmented-container">
          {DEMO_ROLES.map((r) => {
            const isActive = selectedRole === r.key || form.identifier === r.identifier;
            return (
              <button
                key={r.key}
                type="button"
                onClick={() => handleRoleSelect(r.key, r.identifier, r.password)}
                className={`tactile-segmented-btn ${isActive ? "active" : "inactive"}`}
              >
                <i className={r.icon} style={{ fontSize: 11.5, color: isActive ? "#9AE6B4" : "rgba(255,255,255,0.6)" }} />
                <span>{r.label}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Role Capability Notice */}
        <div style={{ marginTop: 8, textAlign: "center" }}>
          <span style={{ fontSize: 10.5, color: "#0D3823", fontWeight: 700, background: "rgba(27, 94, 58, 0.1)", padding: "4px 14px", borderRadius: 20, border: "none", display: "inline-flex", alignItems: "center", gap: 6, boxShadow: "0 2px 6px rgba(0,0,0,0.03)" }}>
            <i className="fa-solid fa-shield-halved" style={{ fontSize: 10, color: "#1B5E3A" }} />
            {selectedRole === "super_admin" && "Super Admin — Full Multi-Hub Access & Audit Logs"}
            {selectedRole === "admin" && "Admin — Warehouse Operations & Stock Ledger"}
            {selectedRole === "supervisor" && "Supervisor — Floor Weighbridge & Moisture Deductions"}
            {!selectedRole && "Select a role above to pre-fill credentials"}
          </span>
        </div>

        {/* WAREHOUSE / HUB SELECTOR DROPDOWN FOR ADMIN & SUPERVISOR ROLES */}
        {selectedRole !== "super_admin" && (
          <div style={{ marginTop: 14, textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <label style={{ fontSize: 10.5, fontWeight: 800, color: "#0D3823", textTransform: "uppercase", letterSpacing: "0.6px" }}>
                Select Warehouse / Hub
              </label>
              <span style={{ fontSize: 9.5, color: "#1B5E3A", fontWeight: 700 }}>
                {selectedRole === "admin" ? "Admin Hub" : "Supervisor Hub"}
              </span>
            </div>
            <div className="underline-input-group" style={{ marginBottom: 0 }}>
              <i className="fa-solid fa-warehouse underline-input-icon" style={{ color: "#1B5E3A" }} />
              <select
                value={selectedWarehouseId}
                onChange={(e) => handleWarehouseChange(e.target.value)}
                className="underline-input-field"
                style={{
                  cursor: "pointer",
                  fontWeight: 700,
                  color: "#0D3823",
                  appearance: "none",
                  WebkitAppearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%231B5E3A' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 8px center",
                  paddingRight: 24,
                }}
              >
                {WAREHOUSES.map((wh) => (
                  <option key={wh.id} value={wh.id} style={{ color: "#0D3823", fontWeight: 600 }}>
                    {wh.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* UNDERLINE INPUT FORM */}
      <form onSubmit={handleSubmit}>
        {/* Email / Phone Field */}
        <div className="underline-input-group">
          <i className="fa-solid fa-user-large underline-input-icon" />
          <input
            type="text"
            required
            value={form.identifier}
            onChange={(e) => set("identifier")(e.target.value)}
            placeholder="Phone or Email Address"
            className="underline-input-field"
          />
        </div>

        {/* Password Field */}
        <div className="underline-input-group">
          <i className="fa-solid fa-lock underline-input-icon" />
          <input
            type={showPassword ? "text" : "password"}
            required
            value={form.password}
            onChange={(e) => set("password")(e.target.value)}
            placeholder="Password"
            className="underline-input-field"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{ border: "none", background: "transparent", color: "var(--muted)", cursor: "pointer", padding: "0 4px" }}
          >
            <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`} style={{ fontSize: 14 }} />
          </button>
        </div>

        {/* Action Row: Remember me & Forgot Password */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, marginBottom: 26 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", userSelect: "none" }}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ accentColor: "var(--primary)", width: 14, height: 14, cursor: "pointer" }}
            />
            <span style={{ fontSize: 12.5, color: "var(--ink-secondary)", fontWeight: 500 }}>Remember me</span>
          </label>

          <button
            type="button"
            onClick={() => setShowForgotModal(true)}
            style={{
              border: "none",
              background: "transparent",
              color: "#0D3823",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              padding: 0,
              display: "flex",
              alignItems: "center",
              gap: 5
            }}
          >
            <i className="fa-solid fa-key" style={{ fontSize: 11, color: "#1B5E3A" }} /> Forgot Password?
          </button>
        </div>

        {/* Modern Full-Width Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="btn-glow"
          style={{
            width: "100%",
            padding: "13px 20px",
            fontSize: 14,
            fontWeight: 800,
            borderRadius: 30,
            background: "linear-gradient(135deg, #0D3823 0%, #1B5E3A 50%, #2E8B57 100%)",
            boxShadow: "0 8px 24px rgba(13, 56, 35, 0.38)",
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
              <i className="fa-solid fa-circle-notch spin" style={{ fontSize: 15 }} />
              Signing in...
            </>
          ) : (
            <>
              Sign In to Kusumganga ERP <i className="fa-solid fa-arrow-right-to-bracket" style={{ fontSize: 14 }} />
            </>
          )}
        </Button>
      </form>



      {/* Forgot Password Modal - real 2-step OTP flow: request a code (sent
          to every email/phone on file), then verify it and set a new
          password. See backend/src/services/passwordReset.service.js. */}
      {showForgotModal && (
        <div
          onClick={closeForgotModal}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(6px)",
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
              background: "var(--surface)",
              width: 380,
              maxWidth: "100%",
              borderRadius: 14,
              border: "1px solid var(--line)",
              padding: 20,
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                <i className="fa-solid fa-key" style={{ color: "var(--primary)" }} />
                {forgotStep === "request" ? "Reset Password" : "Enter Reset Code"}
              </h3>
              <button
                onClick={closeForgotModal}
                style={{ border: "none", background: "transparent", fontSize: 18, cursor: "pointer", color: "var(--muted)" }}
              >
                &times;
              </button>
            </div>

            {forgotStep === "request" ? (
              <form onSubmit={handleForgotRequest}>
                <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 12px" }}>
                  Enter your registered phone or email. We'll send a 6-digit code to every
                  contact method on your account (email and/or SMS).
                </p>
                <FormField
                  label="Registered Email or Phone"
                  required
                  icon="fa-solid fa-envelope"
                  value={forgotIdentifier}
                  onChange={setForgotIdentifier}
                  placeholder="e.g. admin@pralli.com"
                  compact
                  marginBottom={12}
                />
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
                  <Button variant="secondary" type="button" onClick={closeForgotModal} style={{ padding: "7px 12px", fontSize: 12 }}>Cancel</Button>
                  <Button type="submit" disabled={forgotLoading} style={{ padding: "7px 14px", fontSize: 12 }}>
                    {forgotLoading ? "Sending…" : "Send Reset Code"}
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
                <FormField
                  label="6-Digit Code"
                  required
                  icon="fa-solid fa-shield-halved"
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
                  icon="fa-solid fa-lock"
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
                  icon="fa-solid fa-lock"
                  value={forgotConfirmPassword}
                  onChange={setForgotConfirmPassword}
                  placeholder="••••••••"
                  compact
                  marginBottom={4}
                />
                <button
                  type="button"
                  onClick={() => setForgotStep("request")}
                  style={{ border: "none", background: "transparent", color: "var(--primary-deep)", fontSize: 11.5, fontWeight: 600, cursor: "pointer", padding: "6px 0" }}
                >
                  &larr; Use a different email/phone or resend code
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
