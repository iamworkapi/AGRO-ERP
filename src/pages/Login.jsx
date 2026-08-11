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
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [selectedRole, setSelectedRole] = useState(null);
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
    setSelectedRole(null);
  };

  const handleRoleSelect = (roleKey, identifier, password) => {
    setSelectedRole(roleKey);
    setForm({ identifier, password });
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
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)", margin: 0, letterSpacing: "-0.02em" }}>
            Welcome back 👋
          </h2>
          <span style={{ fontSize: 10.5, fontWeight: 600, color: "var(--primary-deep)", background: "var(--primary-tint)", padding: "2px 9px", borderRadius: 12, display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 6px #10B981" }} />
            Live Portal
          </span>
        </div>
        <p style={{ fontSize: 12.5, color: "var(--muted)", margin: 0, lineHeight: 1.4 }}>
          Sign in to access your PRALLI warehouse dashboard.
        </p>
      </div>

      {/* NEXT-LEVEL QUICK DEMO ROLE SELECTOR CARDS */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Quick Demo Login Roles
          </span>
          <span style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 500 }}>
            Click to auto-fill
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
          {DEMO_ROLES.map((r) => {
            const isActive = selectedRole === r.key || form.identifier === r.identifier;
            return (
              <button
                key={r.key}
                type="button"
                onClick={() => handleRoleSelect(r.key, r.identifier, r.password)}
                className="hover-lift"
                style={{
                  padding: "8px 6px",
                  borderRadius: 10,
                  border: isActive ? "1.5px solid var(--primary)" : "1px solid var(--line-strong)",
                  background: isActive ? "var(--primary-tint)" : "var(--canvas)",
                  color: isActive ? "var(--primary-deep)" : "var(--ink-secondary)",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 3,
                  position: "relative",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: isActive ? "0 4px 12px rgba(0, 184, 107, 0.15)" : "none",
                }}
              >
                {isActive && (
                  <span style={{ position: "absolute", top: 4, right: 4, fontSize: 9, color: "var(--primary)" }}>
                    <i className="fa-solid fa-circle-check" />
                  </span>
                )}
                <i className={r.icon} style={{ fontSize: 13, color: isActive ? "var(--primary)" : "var(--muted)" }} />
                <span style={{ fontSize: 11.5, fontWeight: 700, lineHeight: 1.1 }}>{r.label}</span>
                <span style={{ fontSize: 9.5, color: isActive ? "var(--primary-deep)" : "var(--muted)", fontWeight: 500 }}>{r.subLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <FormField
          label="Phone or Email Address"
          required
          icon="fa-solid fa-user-large"
          value={form.identifier}
          onChange={set("identifier")}
          placeholder="e.g. admin@pralli.com"
          compact
          marginBottom={12}
        />

        <FormField
          label="Password"
          type={showPassword ? "text" : "password"}
          required
          icon="fa-solid fa-lock"
          value={form.password}
          onChange={set("password")}
          placeholder="••••••••"
          compact
          marginBottom={12}
          showPasswordToggle
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
        />

        {/* Options Row: Remember Me & Forgot Password */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "2px 0 16px" }}>
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
            style={{
              border: "none",
              background: "transparent",
              color: "var(--primary-deep)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              padding: 0,
              display: "flex",
              alignItems: "center",
              gap: 4
            }}
          >
            <i className="fa-solid fa-key" style={{ fontSize: 10 }} /> Forgot password?
          </button>
        </div>

        {/* Submit Button with Shimmer & Loading Spinner */}
        <Button
          type="submit"
          disabled={isLoading}
          className="btn-glow"
          style={{
            width: "100%",
            padding: "11px 16px",
            fontSize: 13.5,
            fontWeight: 700,
            borderRadius: "var(--radius)",
            background: "var(--gradient-primary)",
            boxShadow: "0 4px 14px rgba(0, 184, 107, 0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {isLoading ? (
            <>
              <i className="fa-solid fa-circle-notch spin" style={{ fontSize: 14 }} />
              Signing in...
            </>
          ) : (
            <>
              Sign In to PRALLI <i className="fa-solid fa-arrow-right-to-bracket" style={{ fontSize: 13 }} />
            </>
          )}
        </Button>
      </form>

      <div style={{ textAlign: "center", marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
        <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>
          New warehouse admin or staff member?{" "}
          <Link to="/register" style={{ color: "var(--primary-deep)", fontWeight: 700, textDecoration: "none" }}>
            Create an account
          </Link>
        </p>
      </div>

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
