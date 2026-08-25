import { useState, useEffect, useRef } from "react";
import PageHeader from "../components/common/PageHeader";
import FormField from "../components/common/FormField";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import { useAuth } from "../hooks/useAuth";
import { updateOwnProfile, changePassword, adaptProfile } from "../features/auth/api";
import { toast } from "../utils/toast";

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=250&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=250&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=250&auto=format&fit=crop&q=80",
];

const TABS = [
  { key: "profile", label: "Executive Profile", icon: "fa-solid fa-id-card-clip" },
  { key: "security", label: "Security & Credentials", icon: "fa-solid fa-shield-halved" },
  { key: "access", label: "Access & Governance", icon: "fa-solid fa-network-wired" },
];

const PERMISSIONS_MAP = [
  { module: "Warehouse Hubs", desc: "Manage multi-depot storage, capacity & supervisors", icon: "fa-solid fa-warehouse", active: true },
  { module: "Biomass Processing & Moisture", desc: "Moisture slabs, 4-stage supply chain & moisture deduction", icon: "fa-solid fa-fire-burner", active: true },
  { module: "Weighbridge & Weighment Slips", desc: "Weight machine calibrations, GRN generation & slips", icon: "fa-solid fa-scale-balanced", active: true },
  { module: "Inventory & Stock Control", desc: "Item / parts master, transfer orders & low-stock alerts", icon: "fa-solid fa-boxes-stacked", active: true },
  { module: "Purchase & Vendor Ledgers", desc: "Purchase orders, vendor rate contracts & ledgers", icon: "fa-solid fa-cart-flatbed", active: true },
  { module: "Sales & Industrial Billing", desc: "Invoicing, buyer directory, credit terms & dispatch tracking", icon: "fa-solid fa-file-invoice-dollar", active: true },
];

export default function MyProfile() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Profile Form
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    avatarUrl: "",
  });

  // Password Form
  const [pwData, setPwData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        avatarUrl: user.avatarUrl || "",
      });
    }
  }, [user]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image file size must be less than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, avatarUrl: reader.result }));
      toast.info("Photo loaded! Remember to click 'Save Changes' to update.");
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      toast.error("Full Name is required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email ? formData.email.trim().toLowerCase() : undefined,
        phone: formData.phone ? formData.phone.trim() : undefined,
        address: formData.address ? formData.address.trim() : undefined,
        avatarUrl: formData.avatarUrl || undefined,
      };

      const res = await updateOwnProfile(payload);
      const adapted = adaptProfile(res);
      updateUser(adapted);
      toast.success("Executive profile details updated successfully!");
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!pwData.currentPassword) {
      toast.error("Please enter your current password.");
      return;
    }
    if (pwData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    if (pwData.newPassword !== pwData.confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }

    setSavingPassword(true);
    try {
      await changePassword(pwData.currentPassword, pwData.newPassword);
      toast.success("Password changed successfully! Please use your new password next time you sign in.");
      setPwData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || err.message || "Failed to change password.");
    } finally {
      setSavingPassword(false);
    }
  };

  const copyCredentialInfo = () => {
    const info = `User: ${formData.fullName || "User"}\nRole: ${displayRole}\nEmail: ${formData.email || "N/A"}\nPhone: ${formData.phone || "N/A"}`;
    navigator.clipboard?.writeText(info);
    setCopiedId(true);
    toast.success("Digital ID details copied to clipboard!");
    setTimeout(() => setCopiedId(false), 2500);
  };

  // Password matrix validation
  const hasMinLen = pwData.newPassword.length >= 6;
  const hasUppercase = /[A-Z]/.test(pwData.newPassword);
  const hasNumber = /[0-9]/.test(pwData.newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(pwData.newPassword);

  let score = 0;
  if (hasMinLen) score += 25;
  if (hasUppercase) score += 25;
  if (hasNumber) score += 25;
  if (hasSpecial) score += 25;

  const strengthColor = score <= 25 ? "var(--status-error)" : score <= 75 ? "#D97706" : "var(--primary)";
  const strengthLabel = score === 0 ? "Empty" : score <= 25 ? "Weak" : score <= 75 ? "Moderate" : "Strong Security";

  const displayRole = user?.role === "super_admin"
    ? "Super Administrator"
    : user?.role === "warehouse_admin"
    ? "Warehouse Administrator"
    : "Warehouse Supervisor";

  const roleBadgeTone = user?.role === "super_admin"
    ? "success"
    : user?.role === "warehouse_admin"
    ? "info"
    : "warning";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Top Page Header */}
      <PageHeader
        title="My Profile"
        subtitle="Manage your executive identity, access permissions, security credentials, and organization profile"
      />

      {/* KPI Stat Cards Strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(0, 184, 107, 0.12)", color: "var(--primary-deep)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
            <i className="fa-solid fa-shield-check" />
          </div>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>Status</span>
            <strong style={{ fontSize: 13, color: "var(--primary-deep)", display: "block" }}>Active & Verified</strong>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(3, 105, 161, 0.12)", color: "#0369A1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
            <i className="fa-solid fa-crown" />
          </div>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>Clearance</span>
            <strong style={{ fontSize: 13, color: "var(--ink)", display: "block" }}>{user?.role === "super_admin" ? "Tier 0 (Root)" : "Tier 1 (Admin)"}</strong>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(217, 119, 6, 0.12)", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
            <i className="fa-solid fa-network-wired" />
          </div>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>Governed Hubs</span>
            <strong style={{ fontSize: 13, color: "var(--ink)", display: "block" }}>{user?.role === "super_admin" ? "All Multi-Hubs" : user?.warehouse || "Assigned Hub"}</strong>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(16, 185, 129, 0.12)", color: "#10B981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
            <i className="fa-solid fa-lock" />
          </div>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>Authentication</span>
            <strong style={{ fontSize: 13, color: "var(--ink)", display: "block" }}>JWT Token Bearer</strong>
          </div>
        </div>
      </div>

      {/* Hero Banner Header Card */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "var(--shadow-sm)",
          position: "relative",
        }}
      >
        {/* Cover Gradient Mesh */}
        <div
          style={{
            height: 125,
            background: "linear-gradient(135deg, #051F17 0%, #07281D 35%, #00B86B 100%)",
            position: "relative",
          }}
        >
          {/* Top Right Holographic Badge */}
          <div
            style={{
              position: "absolute",
              top: 14,
              right: 18,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                background: "rgba(0, 0, 0, 0.45)",
                backdropFilter: "blur(10px)",
                color: "white",
                fontSize: 11,
                fontWeight: 700,
                padding: "5px 12px",
                borderRadius: 20,
                border: "1px solid rgba(255, 255, 255, 0.2)",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <i className="fa-solid fa-circle-check" style={{ color: "#10B981" }} /> Kusumganga Agro ERP Master
            </span>
          </div>
        </div>

        {/* Hero Info Bar */}
        <div
          style={{
            padding: "0 24px 20px",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
            marginTop: -48,
          }}
        >
          {/* Left: Avatar + Names */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 18, flexWrap: "wrap" }}>
            {/* Elevated Avatar */}
            <div style={{ position: "relative" }}>
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: "50%",
                  background: formData.avatarUrl ? `url(${formData.avatarUrl}) center/cover no-repeat` : "var(--gradient-primary)",
                  border: "4px solid var(--surface)",
                  boxShadow: "0 8px 24px rgba(0, 184, 107, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: 34,
                  fontWeight: 800,
                  overflow: "hidden",
                }}
              >
                {!formData.avatarUrl && (formData.fullName || "AD").slice(0, 2).toUpperCase()}
              </div>

              {/* Online Live Pulse */}
              <span
                style={{
                  position: "absolute",
                  bottom: 4,
                  right: 4,
                  width: 15,
                  height: 15,
                  borderRadius: "50%",
                  background: "#10B981",
                  border: "3px solid var(--surface)",
                  boxShadow: "0 0 10px #10B981",
                }}
              />
            </div>

            <div style={{ marginBottom: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <h2 style={{ margin: 0, fontSize: 21, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.02em" }}>
                  {formData.fullName || user?.name || "Administrator"}
                </h2>
                <Badge tone={roleBadgeTone}>{displayRole.toUpperCase()}</Badge>
              </div>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--muted)" }}>
                <i className="fa-solid fa-envelope" style={{ marginRight: 5, color: "var(--primary)" }} /> {formData.email || "No email configured"} &bull;{" "}
                <i className="fa-solid fa-phone" style={{ marginRight: 5, marginLeft: 6, color: "var(--primary)" }} /> {formData.phone || "No phone configured"}
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
            <Button
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              style={{ padding: "7px 15px", fontSize: 12.5, display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <i className="fa-solid fa-camera" /> Change Photo
            </Button>
            {formData.avatarUrl && (
              <Button
                variant="secondary"
                onClick={() => setFormData((prev) => ({ ...prev, avatarUrl: "" }))}
                style={{ padding: "7px 12px", fontSize: 12.5, color: "var(--status-error)" }}
              >
                Remove
              </Button>
            )}
          </div>
        </div>

        {/* Tab Navigation Strip */}
        <div
          style={{
            borderTop: "1px solid var(--line)",
            background: "var(--canvas)",
            padding: "5px 18px",
            display: "flex",
            gap: 6,
          }}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: "9px 18px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
                  cursor: "pointer",
                  border: "none",
                  background: isActive ? "var(--surface)" : "transparent",
                  color: isActive ? "var(--primary-deep)" : "var(--muted)",
                  boxShadow: isActive ? "var(--shadow-xs)" : "none",
                  transition: "all 0.15s ease",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                }}
              >
                <i className={tab.icon} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2-Column Main Workspace */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }} className="responsive-grid-2">
        {/* Left Column: Tab Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* TAB 1: Profile Information */}
          {activeTab === "profile" && (
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--line)",
                borderRadius: 14,
                padding: "22px 24px",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div style={{ paddingBottom: 14, borderBottom: "1px solid var(--line)", marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "var(--ink)" }}>
                  Personal & Executive Contact Information
                </h3>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--muted)" }}>
                  Maintain your official identity, login contact numbers, and office addresses
                </p>
              </div>

              <form onSubmit={handleProfileSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Preset Avatar Selection Bar */}
                <div
                  style={{
                    padding: "12px 14px",
                    background: "var(--canvas)",
                    borderRadius: 10,
                    border: "1px solid var(--line)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-secondary)" }}>
                    Quick Select Preset Avatars:
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {PRESET_AVATARS.map((url, i) => (
                      <div
                        key={i}
                        onClick={() => setFormData((prev) => ({ ...prev, avatarUrl: url }))}
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: "50%",
                          background: `url(${url}) center/cover no-repeat`,
                          cursor: "pointer",
                          border: formData.avatarUrl === url ? "2px solid var(--primary)" : "2px solid transparent",
                          transform: formData.avatarUrl === url ? "scale(1.15)" : "scale(1)",
                          boxShadow: formData.avatarUrl === url ? "0 0 8px rgba(0, 184, 107, 0.4)" : "none",
                          transition: "all 0.15s ease",
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }} className="responsive-grid-2">
                  <div style={{ gridColumn: "1 / -1" }}>
                    <FormField
                      label="Full Legal Name"
                      required
                      icon="fa-solid fa-user-tie"
                      value={formData.fullName}
                      onChange={(val) => setFormData((prev) => ({ ...prev, fullName: val }))}
                      placeholder="Your full legal name"
                      compact
                      marginBottom={12}
                    />
                  </div>

                  <FormField
                    label="Official Email Address"
                    type="email"
                    icon="fa-solid fa-envelope"
                    value={formData.email}
                    onChange={(val) => setFormData((prev) => ({ ...prev, email: val }))}
                    placeholder="name@kusumganga.com"
                    compact
                    marginBottom={12}
                  />

                  <FormField
                    label="Mobile Phone (Primary Login ID)"
                    icon="fa-solid fa-phone"
                    value={formData.phone}
                    onChange={(val) => setFormData((prev) => ({ ...prev, phone: val }))}
                    placeholder="e.g. 9876543210"
                    compact
                    marginBottom={12}
                  />

                  <div style={{ gridColumn: "1 / -1" }}>
                    <FormField
                      label="Residential / Headquarters Address"
                      type="textarea"
                      icon="fa-solid fa-location-dot"
                      value={formData.address}
                      onChange={(val) => setFormData((prev) => ({ ...prev, address: val }))}
                      placeholder="e.g. 24-A, Sai Complex Betiyahata, Gorakhpur Uttar Pradesh, 273001"
                      compact
                      marginBottom={12}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 14, borderTop: "1px solid var(--line)" }}>
                  <Button type="submit" disabled={saving} className="btn-glow" style={{ padding: "9px 26px", fontSize: 13, fontWeight: 700 }}>
                    {saving ? "Saving Changes…" : "Save Changes"}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: Security & Password */}
          {activeTab === "security" && (
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--line)",
                borderRadius: 14,
                padding: "22px 24px",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div style={{ paddingBottom: 14, borderBottom: "1px solid var(--line)", marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "var(--ink)" }}>
                  Change Account Password & Access Key
                </h3>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--muted)" }}>
                  Ensure your account credentials meet organizational security guidelines
                </p>
              </div>

              <form onSubmit={handlePasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Current Password */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)", display: "block", marginBottom: 4 }}>
                    Current Password <span style={{ color: "var(--status-error)" }}>*</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showCurrentPw ? "text" : "password"}
                      value={pwData.currentPassword}
                      onChange={(e) => setPwData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="Enter your current password"
                      style={{
                        width: "100%",
                        padding: "9px 38px 9px 12px",
                        borderRadius: 8,
                        border: "1px solid var(--line-strong)",
                        background: "var(--surface)",
                        fontSize: 13,
                        color: "var(--ink)",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      style={{
                        position: "absolute",
                        right: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        border: "none",
                        background: "none",
                        color: "var(--muted)",
                        cursor: "pointer",
                        fontSize: 12,
                      }}
                    >
                      <i className={`fa-solid ${showCurrentPw ? "fa-eye-slash" : "fa-eye"}`} />
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)", display: "block", marginBottom: 4 }}>
                    New Password <span style={{ color: "var(--status-error)" }}>*</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showNewPw ? "text" : "password"}
                      value={pwData.newPassword}
                      onChange={(e) => setPwData((prev) => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Minimum 6 characters"
                      style={{
                        width: "100%",
                        padding: "9px 38px 9px 12px",
                        borderRadius: 8,
                        border: "1px solid var(--line-strong)",
                        background: "var(--surface)",
                        fontSize: 13,
                        color: "var(--ink)",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      style={{
                        position: "absolute",
                        right: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        border: "none",
                        background: "none",
                        color: "var(--muted)",
                        cursor: "pointer",
                        fontSize: 12,
                      }}
                    >
                      <i className={`fa-solid ${showNewPw ? "fa-eye-slash" : "fa-eye"}`} />
                    </button>
                  </div>

                  {/* Dynamic Strength Meter & Checklist */}
                  {pwData.newPassword && (
                    <div style={{ marginTop: 10, padding: "10px 12px", background: "var(--canvas)", borderRadius: 8, border: "1px solid var(--line)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 5 }}>
                        <span style={{ color: "var(--muted)" }}>Password Security Score:</span>
                        <strong style={{ color: strengthColor }}>{strengthLabel} ({score}%)</strong>
                      </div>
                      <div style={{ height: 5, width: "100%", background: "var(--line)", borderRadius: 3, overflow: "hidden", marginBottom: 8 }}>
                        <div
                          style={{
                            height: "100%",
                            width: `${score}%`,
                            background: strengthColor,
                            transition: "all 0.3s ease",
                          }}
                        />
                      </div>

                      {/* Checklist badges */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, fontSize: 11 }}>
                        <span style={{ color: hasMinLen ? "var(--primary-deep)" : "var(--muted)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <i className={hasMinLen ? "fa-solid fa-circle-check" : "fa-regular fa-circle"} /> 6+ Chars
                        </span>
                        <span style={{ color: hasUppercase ? "var(--primary-deep)" : "var(--muted)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <i className={hasUppercase ? "fa-solid fa-circle-check" : "fa-regular fa-circle"} /> Uppercase
                        </span>
                        <span style={{ color: hasNumber ? "var(--primary-deep)" : "var(--muted)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <i className={hasNumber ? "fa-solid fa-circle-check" : "fa-regular fa-circle"} /> Number
                        </span>
                        <span style={{ color: hasSpecial ? "var(--primary-deep)" : "var(--muted)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <i className={hasSpecial ? "fa-solid fa-circle-check" : "fa-regular fa-circle"} /> Symbol
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm New Password */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)", display: "block", marginBottom: 4 }}>
                    Confirm New Password <span style={{ color: "var(--status-error)" }}>*</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showConfirmPw ? "text" : "password"}
                      value={pwData.confirmPassword}
                      onChange={(e) => setPwData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Re-enter your new password"
                      style={{
                        width: "100%",
                        padding: "9px 38px 9px 12px",
                        borderRadius: 8,
                        border: "1px solid var(--line-strong)",
                        background: "var(--surface)",
                        fontSize: 13,
                        color: "var(--ink)",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPw(!showConfirmPw)}
                      style={{
                        position: "absolute",
                        right: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        border: "none",
                        background: "none",
                        color: "var(--muted)",
                        cursor: "pointer",
                        fontSize: 12,
                      }}
                    >
                      <i className={`fa-solid ${showConfirmPw ? "fa-eye-slash" : "fa-eye"}`} />
                    </button>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 14, borderTop: "1px solid var(--line)" }}>
                  <Button type="submit" disabled={savingPassword} className="btn-glow" style={{ padding: "9px 26px", fontSize: 13, fontWeight: 700 }}>
                    {savingPassword ? "Updating Password…" : "Update Password"}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: Role & Access Privileges */}
          {activeTab === "access" && (
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--line)",
                borderRadius: 14,
                padding: "22px 24px",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div style={{ paddingBottom: 14, borderBottom: "1px solid var(--line)", marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "var(--ink)" }}>
                  Governed Modules & Privileges Matrix
                </h3>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--muted)" }}>
                  Operational permissions mapped to your assigned organizational role
                </p>
              </div>

              {/* Permissions Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="responsive-grid-2">
                {PERMISSIONS_MAP.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "14px",
                      background: "var(--canvas)",
                      border: "1px solid var(--line)",
                      borderRadius: 10,
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: "rgba(0, 184, 107, 0.12)",
                        color: "var(--primary-deep)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 16,
                        flexShrink: 0,
                      }}
                    >
                      <i className={item.icon} />
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <strong style={{ fontSize: 13, color: "var(--ink)" }}>{item.module}</strong>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }} />
                      </div>
                      <p style={{ margin: "3px 0 0", fontSize: 11.5, color: "var(--muted)", lineHeight: 1.4 }}>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: High-Tech Digital Executive ID Smart Card */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: 16,
              padding: "22px 20px",
              boxShadow: "var(--shadow-md)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Holographic Header Band with Smart NFC Chip */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 64,
                background: "linear-gradient(135deg, #051F17 0%, #07281D 40%, #00B86B 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 16px",
              }}
            >
              <div style={{ width: 24, height: 18, borderRadius: 3, border: "1px solid rgba(255, 215, 0, 0.7)", background: "rgba(255, 215, 0, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 8, color: "#FFD700", fontWeight: 900 }}>NFC</span>
              </div>
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 10, letterSpacing: 1, fontWeight: 700 }}>KUSUMGANGA ERP</span>
            </div>

            {/* Avatar Preview */}
            <div style={{ position: "relative", marginTop: 22, marginBottom: 10 }}>
              <div
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: "50%",
                  background: formData.avatarUrl ? `url(${formData.avatarUrl}) center/cover no-repeat` : "var(--gradient-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: 800,
                  fontSize: 30,
                  boxShadow: "0 6px 20px rgba(0, 184, 107, 0.35)",
                  border: "3px solid var(--surface)",
                  overflow: "hidden",
                }}
              >
                {!formData.avatarUrl && (formData.fullName || "AD").slice(0, 2).toUpperCase()}
              </div>
              <span
                style={{
                  position: "absolute",
                  bottom: 2,
                  right: 2,
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: "#10B981",
                  border: "2px solid var(--surface)",
                  boxShadow: "0 0 8px #10B981",
                }}
              />
            </div>

            <h4 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 800, color: "var(--ink)" }}>
              {formData.fullName || "Administrator"}
            </h4>
            <div style={{ marginBottom: 14 }}>
              <Badge tone={roleBadgeTone}>
                {displayRole.toUpperCase()}
              </Badge>
            </div>

            {/* Live Instant Details Box */}
            <div
              style={{
                width: "100%",
                background: "var(--canvas)",
                border: "1px solid var(--line)",
                borderRadius: 12,
                padding: "14px",
                display: "flex",
                flexDirection: "column",
                gap: 9,
                textAlign: "left",
                fontSize: 12,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>Organization:</span>
                <strong style={{ color: "var(--ink)" }}>Kusumganga Agro</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>Phone (ID):</span>
                <span style={{ fontWeight: 600, color: "var(--ink)" }}>{formData.phone || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>Email:</span>
                <span style={{ fontWeight: 600, color: "var(--ink)", maxWidth: 170, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {formData.email || "—"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>Clearance:</span>
                <span style={{ fontWeight: 700, color: "var(--primary-deep)" }}>● Active System User</span>
              </div>
              {formData.address && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--muted)" }}>Location:</span>
                  <span style={{ fontWeight: 500, color: "var(--ink-secondary)", maxWidth: 170, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {formData.address}
                  </span>
                </div>
              )}
            </div>

            {/* Copy & Share Credential Button */}
            <Button
              type="button"
              variant="secondary"
              onClick={copyCredentialInfo}
              style={{
                width: "100%",
                marginTop: 12,
                fontSize: 12,
                padding: "7px 12px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <i className={copiedId ? "fa-solid fa-check" : "fa-solid fa-copy"} />
              {copiedId ? "ID Details Copied!" : "Copy Digital ID"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
