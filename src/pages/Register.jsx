import { useState } from "react";
import { UserPlus, Shield, Settings, CheckCircle, Lock, Mail, Phone, User, Loader } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import FormField from "../components/common/FormField";
import Button from "../components/common/Button";
import { registerUser } from "../features/auth/api";
import { registerSchema } from "../validators/authValidators";
import { validateOrToast } from "../utils/validate";
import { toast } from "../utils/toast";

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

function emptyForm() {
  return {
    role: "",
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  };
}

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm());
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const set = (key) => (val) => {
    setForm((f) => ({ ...f, [key]: val }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const parsed = validateOrToast(registerSchema, form);
    if (!parsed) return;

    setIsLoading(true);
    try {
      await registerUser(parsed);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1400);
    } catch (err) {
      toast.error(err?.message || "Could not submit your registration. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="auth-unified-card animate-slide-up">
        {/* Top Glowing Gradient Accent Bar */}
        <div className="auth-card-top-bar" />

        {/* Brand & Heading */}
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: "50%",
                background: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 24px rgba(16, 185, 129, 0.25)",
                border: "2px solid #E2E8F0",
              }}
            >
              <img
                src="/Agro-Logo.svg"
                alt="Kusumganga Agro Logo"
                style={{
                  height: 36,
                  width: 36,
                  objectFit: "contain",
                }}
              />
            </div>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: "#062316", margin: "0 0 3px", letterSpacing: "-0.02em" }}>
            Create an Account
          </h2>
          <p style={{ fontSize: 12, color: "#64748B", margin: 0 }}>
            For Warehouse Admins and Warehouse Supervisors
          </p>
        </div>

        {success ? (
          <div
            style={{
              textAlign: "center",
              padding: "24px 16px",
              background: "rgba(16, 185, 129, 0.12)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              borderRadius: 14,
            }}
            className="animate-fade-in"
          >
            <div style={{ fontSize: 32, marginBottom: 8, color: "#059669" }}>
              <LucideIconWrapper size={32}><CheckCircle size={32} /></LucideIconWrapper>
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#062316", margin: "0 0 4px" }}>
              Account Request Submitted!
            </h3>
            <p style={{ fontSize: 12.5, color: "#475569", margin: 0 }}>
              Redirecting to sign in page in a moment...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Role Picker Segmented Control */}
            <div style={{ marginBottom: 12 }}>
              <span style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                Register As <span style={{ color: "var(--status-error)" }}>*</span>
              </span>
              <div className="role-picker-container">
                <button
                  type="button"
                  className={`role-picker-option ${form.role === "Warehouse Admin" ? "active" : ""}`}
                  onClick={() => set("role")("Warehouse Admin")}
                >
                  <LucideIconWrapper size={15}><Shield size={15} /></LucideIconWrapper> Warehouse Admin
                </button>
                <button
                  type="button"
                  className={`role-picker-option ${form.role === "Supervisor" ? "active" : ""}`}
                  onClick={() => set("role")("Supervisor")}
                >
                  <LucideIconWrapper size={15}><Settings size={15} /></LucideIconWrapper> Supervisor
                </button>
              </div>
            </div>

            <FormField
              label="Full Name"
              required
              icon={<LucideIconWrapper size={16}><User size={16} /></LucideIconWrapper>}
              value={form.fullName}
              onChange={set("fullName")}
              placeholder="e.g. Manoj Kumar"
              compact
              marginBottom={10}
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 10px" }}>
              <FormField
                label="Phone Number"
                type="tel"
                required
                icon={<LucideIconWrapper size={16}><Phone size={16} /></LucideIconWrapper>}
                value={form.phone}
                onChange={set("phone")}
                placeholder="98xxxxxxxx"
                compact
                marginBottom={10}
              />
              <FormField
                label="Email (optional)"
                type="email"
                icon={<LucideIconWrapper size={16}><Mail size={16} /></LucideIconWrapper>}
                value={form.email}
                onChange={set("email")}
                placeholder="you@company.com"
                compact
                marginBottom={10}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 10px" }}>
              <FormField
                label="Password"
                type="password"
                required
                icon={<LucideIconWrapper size={16}><Lock size={16} /></LucideIconWrapper>}
                value={form.password}
                onChange={set("password")}
                placeholder="••••••••"
                compact
                marginBottom={10}
              />
              <FormField
                label="Confirm Password"
                type="password"
                required
                icon={<LucideIconWrapper size={16}><Lock size={16} /></LucideIconWrapper>}
                value={form.confirmPassword}
                onChange={set("confirmPassword")}
                placeholder="••••••••"
                compact
                marginBottom={10}
              />
            </div>

            <div
              style={{
                background: "rgba(16, 185, 129, 0.08)",
                border: "1px solid rgba(16, 185, 129, 0.2)",
                borderRadius: 10,
                padding: "8px 10px",
                margin: "2px 0 14px",
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
              }}
            >
              <LucideIconWrapper size={14}><Shield size={14} color="#059669" /></LucideIconWrapper>
              <p style={{ fontSize: 11, color: "#062316", margin: 0, lineHeight: 1.35, fontWeight: 500 }}>
                <strong>Note:</strong> Super Admin reviews and activates accounts. Supervisors add staff & field employees after logging in.
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="btn-glow"
              style={{
                width: "100%",
                padding: "11px 16px",
                fontSize: 13.5,
                fontWeight: 800,
                borderRadius: 12,
                background: "linear-gradient(135deg, #062316 0%, #0D3823 40%, #165E3A 80%, #059669 100%)",
                boxShadow: "0 6px 20px rgba(6, 35, 22, 0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                color: "white",
                border: "none",
              }}
            >
              {isLoading ? (
                <>
                  <LucideIconWrapper size={14}><Loader size={14} /></LucideIconWrapper> Submitting…
                </>
              ) : (
                <>
                  Submit Registration Request <LucideIconWrapper size={14}><UserPlus size={14} /></LucideIconWrapper>
                </>
              )}
            </Button>
          </form>
        )}

        {!success && (
          <div style={{ textAlign: "center", marginTop: 14, paddingTop: 10, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
            <p style={{ fontSize: 12, color: "#64748B", margin: 0 }}>
              Already have an account?{" "}
              <Link to="/login" style={{ color: "#059669", fontWeight: 700, textDecoration: "none" }}>
                Sign in
              </Link>
            </p>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
