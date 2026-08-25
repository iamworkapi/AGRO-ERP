import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import FormField from "../components/common/FormField";
import Button from "../components/common/Button";
import { registerUser } from "../features/auth/api";
import { registerSchema } from "../validators/authValidators";
import { validateOrToast } from "../utils/validate";
import { toast } from "../utils/toast";

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
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
          Create an account
        </h2>
        <p style={{ fontSize: 12.5, color: "var(--muted)", margin: 0, lineHeight: 1.4 }}>
          For Warehouse Admins and Warehouse Supervisors.
        </p>
      </div>

      {success ? (
        <div style={{ textAlign: "center", padding: "28px 16px", background: "var(--primary-tint)", border: "1px solid var(--line)", borderRadius: 12 }} className="animate-fade-in">
          <div style={{ fontSize: 32, marginBottom: 8, color: "var(--primary-deep)" }}>
            <i className="fa-solid fa-circle-check" />
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--primary-deep)", margin: "0 0 4px" }}>
            Account Request Submitted!
          </h3>
          <p style={{ fontSize: 12.5, color: "var(--ink-secondary)", margin: 0 }}>
            Redirecting to sign in page in a moment...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Custom Role Picker Segmented Control */}
          <div style={{ marginBottom: 12 }}>
            <span style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--ink-secondary)", marginBottom: 6 }}>
              Register As <span style={{ color: "var(--status-error)" }}>*</span>
            </span>
            <div className="role-picker-container">
              <button
                type="button"
                className={`role-picker-option ${form.role === "Warehouse Admin" ? "active" : ""}`}
                onClick={() => set("role")("Warehouse Admin")}
              >
                <i className="fa-solid fa-user-shield" /> Warehouse Admin
              </button>
              <button
                type="button"
                className={`role-picker-option ${form.role === "Supervisor" ? "active" : ""}`}
                onClick={() => set("role")("Supervisor")}
              >
                <i className="fa-solid fa-user-gear" /> Supervisor
              </button>
            </div>
          </div>

          <FormField
            label="Full Name"
            required
            icon="fa-solid fa-user"
            value={form.fullName}
            onChange={set("fullName")}
            placeholder="e.g. Manoj Kumar"
            compact
            marginBottom={11}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 10px" }}>
            <FormField
              label="Phone Number"
              type="tel"
              required
              icon="fa-solid fa-phone"
              value={form.phone}
              onChange={set("phone")}
              placeholder="98xxxxxxxx"
              compact
              marginBottom={11}
            />
            <FormField
              label="Email (optional)"
              type="email"
              icon="fa-solid fa-envelope"
              value={form.email}
              onChange={set("email")}
              placeholder="you@company.com"
              compact
              marginBottom={11}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 10px" }}>
            <FormField
              label="Password"
              type="password"
              required
              icon="fa-solid fa-lock"
              value={form.password}
              onChange={set("password")}
              placeholder="••••••••"
              compact
              marginBottom={11}
            />
            <FormField
              label="Confirm Password"
              type="password"
              required
              icon="fa-solid fa-lock"
              value={form.confirmPassword}
              onChange={set("confirmPassword")}
              placeholder="••••••••"
              compact
              marginBottom={11}
            />
          </div>

          <div style={{ background: "var(--canvas)", border: "1px solid var(--line)", borderRadius: 8, padding: "8px 10px", margin: "2px 0 14px", display: "flex", gap: 8, alignItems: "flex-start" }}>
            <i className="fa-solid fa-shield-halved" style={{ color: "var(--primary)", fontSize: 13, marginTop: 2, flexShrink: 0 }} />
            <p style={{ fontSize: 11, color: "var(--muted)", margin: 0, lineHeight: 1.35 }}>
              <strong>Note:</strong> Super Admin reviews and activates accounts. Supervisors add staff & field employees to warehouse rosters after logging in.
            </p>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="btn-glow"
            style={{
              width: "100%",
              padding: "10px 16px",
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
                <i className="fa-solid fa-circle-notch spin" style={{ fontSize: 14 }} /> Submitting…
              </>
            ) : (
              <>
                Submit Registration Request <i className="fa-solid fa-user-plus" style={{ fontSize: 13 }} />
              </>
            )}
          </Button>
        </form>
      )}

      {!success && (
        <div style={{ textAlign: "center", marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
          <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--primary-deep)", fontWeight: 700, textDecoration: "none" }}>
              Sign in
            </Link>
          </p>
        </div>
      )}
    </AuthLayout>
  );
}
