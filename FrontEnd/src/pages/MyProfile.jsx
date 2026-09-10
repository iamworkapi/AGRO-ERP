import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import FormField from "../components/common/FormField";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import { useAuth } from "../hooks/useAuth";
import { updateOwnProfile, changePassword, adaptProfile } from "../features/auth/api";
import { deleteOwnProfile } from "../features/profiles/api";
import { toast } from "../utils/toast";

const TABS = [
  { key: "profile", label: "Executive Profile", icon: "ri-id-card-line" },
  { key: "security", label: "Security & Credentials", icon: "ri-shield-check-line" },
  { key: "access", label: "Access & Governance", icon: "ri-node-tree" },
];

const PERMISSIONS_MAP = [
  { module: "Warehouse Hubs", desc: "Manage multi-depot storage, capacity & supervisors", icon: "ri-building-line" },
  { module: "Biomass Supply Chain", desc: "Moisture slabs, quality control & deduction rules", icon: "ri-fire-line" },
  { module: "Weighbridge Infrastructure", desc: "Weight machine calibration, gross/tare slips & logs", icon: "ri-scales-3-line" },
  { module: "Inventory & Stock Control", desc: "Item master, yard stack allocation & reorder limits", icon: "ri-archive-line" },
  { module: "Purchase & Vendor Ledgers", desc: "Vendor registration, purchase orders & settlement", icon: "ri-shopping-bag-3-line" },
  { module: "Sales & Industrial Offtake", desc: "Invoicing, industrial buyers & factory dispatch passes", icon: "ri-file-list-3-line" },
];

export default function MyProfile() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [deletingProfile, setDeletingProfile] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Robust Role Normalization
  const roleStr = (user?.role || "").toLowerCase();
  const roleKeyStr = (user?.roleKey || "").toLowerCase();
  const isSuperAdmin =
    roleKeyStr === "super_admin" ||
    roleStr === "super_admin" ||
    roleStr === "super admin";
  const isWarehouseAdmin =
    !isSuperAdmin && (roleKeyStr === "warehouse_admin" || roleKeyStr === "admin" || roleStr.includes("admin"));

  const displayRole = isSuperAdmin
    ? "Super Administrator"
    : isWarehouseAdmin
    ? "Warehouse Administrator"
    : "Warehouse Supervisor";

  const roleBadgeTone = isSuperAdmin ? "success" : isWarehouseAdmin ? "info" : "warning";

  // Profile Form
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    avatarUrl: "",
  });

  // Password Form State
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [showSavedPassword, setShowSavedPassword] = useState(false);
  const [savedPassword, setSavedPassword] = useState(user?.plainPassword || "SuperAdmin@2026");
  const [pwData, setPwData] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        avatarUrl: user.avatarUrl || "",
      });
      if (user.plainPassword) {
        setSavedPassword(user.plainPassword);
      }
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
      toast.info("Photo loaded! Click 'Save Changes' to update your account.");
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
      toast.success("Profile updated successfully!");
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

    setSavingPassword(true);
    try {
      await changePassword(pwData.currentPassword, pwData.newPassword);
      toast.success("Password changed successfully!");
      setSavedPassword(pwData.newPassword);
      setPwData({ currentPassword: "", newPassword: "" });
      setIsEditingPassword(false);
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || err.message || "Failed to change password.");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteOwnAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your profile? This will dissociate your user identity and sign you out immediately.")) {
      return;
    }
    setDeletingProfile(true);
    try {
      await deleteOwnProfile();
      toast.success("Profile deleted successfully. Signing out...");
      logout();
      navigate("/login");
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || err.message || "Failed to delete account.");
      setDeletingProfile(false);
    }
  };

  const copyCredentialInfo = () => {
    const info = `Name: ${formData.fullName || "User"}\nRole: ${displayRole}\nEmail: ${formData.email || "N/A"}\nPhone: ${formData.phone || "N/A"}`;
    navigator.clipboard?.writeText(info);
    setCopiedId(true);
    toast.success("ID details copied to clipboard!");
    setTimeout(() => setCopiedId(false), 2000);
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
  const strengthLabel = score === 0 ? "Empty" : score <= 25 ? "Weak" : score <= 75 ? "Moderate" : "Strong";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* ===================================================================== */}
      {/* 1. COMPACT EXECUTIVE IDENTITY HERO & TAB STRIP                        */}
      {/* ===================================================================== */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: 14,
          overflow: "hidden",
          boxShadow: "var(--shadow-xs)",
        }}
      >
        {/* Identity Header Row */}
        <div
          style={{
            padding: "16px 20px",
            background: "linear-gradient(135deg, rgba(93, 214, 44, 0.05) 0%, rgba(51, 116, 24, 0.02) 100%)",
            borderBottom: "1px solid var(--line)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 14,
          }}
        >
          {/* Left: Avatar + Details */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* 60px Ergonomic Avatar */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div
                onClick={() => fileInputRef.current?.click()}
                title="Click to change photo"
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: "50%",
                  background: formData.avatarUrl
                    ? `url(${formData.avatarUrl}) center/cover no-repeat`
                    : "linear-gradient(135deg, var(--primary) 0%, #166534 100%)",
                  border: "2.5px solid var(--surface)",
                  boxShadow: "0 2px 10px rgba(93, 214, 44, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: 22,
                  fontWeight: 800,
                  cursor: "pointer",
                  overflow: "hidden",
                }}
              >
                {!formData.avatarUrl && (formData.fullName || "AD").slice(0, 2).toUpperCase()}
              </div>
              <span
                title="Online & Verified"
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: 13,
                  height: 13,
                  borderRadius: "50%",
                  background: "#10B981",
                  border: "2px solid var(--surface)",
                  boxShadow: "0 0 6px #10B981",
                }}
              />
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.02em" }}>
                  {formData.fullName || user?.name || "Administrator"}
                </h1>
                <Badge tone={roleBadgeTone}>{displayRole.toUpperCase()}</Badge>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--primary-deep)",
                    background: "rgba(93, 214, 44, 0.12)",
                    padding: "2px 8px",
                    borderRadius: 12,
                  }}
                >
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#10B981" }} />
                  Active &amp; Verified
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 4, fontSize: 12, color: "var(--muted)", flexWrap: "wrap" }}>
                <span>
                  <i className="ri-mail-line" style={{ color: "var(--primary)", marginRight: 4 }} />
                  {formData.email || "No email"}
                </span>
                <span>
                  <i className="ri-phone-line" style={{ color: "var(--primary)", marginRight: 4 }} />
                  {formData.phone || "No phone"}
                </span>
                <span>
                  <i className="ri-shield-keyhole-line" style={{ color: "var(--primary)", marginRight: 4 }} />
                  {isSuperAdmin ? "Tier 0 (Root)" : isWarehouseAdmin ? "Tier 1 (Admin)" : "Tier 2 (Ops)"}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Quick Action Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
              style={{ padding: "6px 12px", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 5 }}
            >
              <i className="ri-camera-line" /> Change Photo
            </Button>
            {formData.avatarUrl && (
              <Button
                variant="secondary"
                onClick={() => setFormData((prev) => ({ ...prev, avatarUrl: "" }))}
                style={{ padding: "6px 10px", fontSize: 12, color: "var(--status-error)" }}
              >
                Remove
              </Button>
            )}
          </div>
        </div>

        {/* Integrated Compact Tab Navigation Bar */}
        <div
          style={{
            padding: "4px 14px",
            background: "var(--canvas)",
            display: "flex",
            alignItems: "center",
            gap: 4,
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
                  padding: "7px 14px",
                  borderRadius: 7,
                  fontSize: 12.5,
                  fontWeight: isActive ? 700 : 500,
                  cursor: "pointer",
                  border: isActive ? "1px solid var(--line-strong)" : "1px solid transparent",
                  background: isActive ? "var(--surface)" : "transparent",
                  color: isActive ? "var(--ink)" : "var(--muted)",
                  boxShadow: isActive ? "var(--shadow-xs)" : "none",
                  transition: "all 0.15s ease",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <i className={tab.icon} style={{ color: isActive ? "var(--primary)" : "inherit" }} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. MAIN WORKSPACE: 2-COLUMN HIGH-DENSITY GRID                         */}
      {/* ===================================================================== */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 310px", gap: 14 }} className="responsive-grid-2">
        {/* Left Column: Active Tab Content */}
        <div>
          {/* TAB 1: Profile Information */}
          {activeTab === "profile" && (
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--line)",
                borderRadius: 12,
                padding: "18px 20px",
                boxShadow: "var(--shadow-xs)",
              }}
            >
              <div style={{ paddingBottom: 10, borderBottom: "1px solid var(--line)", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 13.5, fontWeight: 800, color: "var(--ink)" }}>
                    Personal &amp; Contact Details
                  </h3>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--muted)" }}>
                    Official executive identity and communication records
                  </p>
                </div>
              </div>

              <form onSubmit={handleProfileSubmit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px" }} className="responsive-grid-2">
                  <div style={{ gridColumn: "1 / -1" }}>
                    <FormField
                      label="Full Legal Name"
                      required
                      layout="vertical"
                      icon="ri-user-3-line"
                      value={formData.fullName}
                      onChange={(val) => setFormData((prev) => ({ ...prev, fullName: val }))}
                      placeholder="Your full legal name"
                      compact
                      marginBottom={6}
                    />
                  </div>

                  <FormField
                    label="Official Email Address"
                    type="email"
                    layout="vertical"
                    icon="ri-mail-line"
                    value={formData.email}
                    onChange={(val) => setFormData((prev) => ({ ...prev, email: val }))}
                    placeholder="name@kusumganga.com"
                    compact
                    marginBottom={6}
                  />

                  <FormField
                    label="Mobile Phone (Primary Login ID)"
                    layout="vertical"
                    icon="ri-phone-line"
                    value={formData.phone}
                    onChange={(val) => setFormData((prev) => ({ ...prev, phone: val }))}
                    placeholder="e.g. 9891140379"
                    compact
                    marginBottom={6}
                  />

                  <div style={{ gridColumn: "1 / -1" }}>
                    <FormField
                      label="Headquarters / Operational Base Address"
                      type="textarea"
                      layout="vertical"
                      icon="ri-map-pin-line"
                      value={formData.address}
                      onChange={(val) => setFormData((prev) => ({ ...prev, address: val }))}
                      placeholder="e.g. Bettiah Central Procurement Hub, Bihar"
                      compact
                      marginBottom={6}
                      rows={2}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 8, borderTop: "1px solid var(--line)" }}>
                  <Button type="submit" disabled={saving} className="btn-glow" style={{ padding: "6px 20px", fontSize: 12, fontWeight: 700 }}>
                    {saving ? "Saving Changes…" : "Save Changes"}
                  </Button>
                </div>
              </form>

              {/* Danger Zone: Account Deletion / Deactivation */}
              <div
                style={{
                  marginTop: 14,
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "1px solid rgba(239, 68, 68, 0.25)",
                  background: "rgba(239, 68, 68, 0.03)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--status-error)", display: "flex", alignItems: "center", gap: 5 }}>
                    <i className="ri-error-warning-line" /> Account Deletion Zone
                  </span>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--muted)" }}>
                    Dissociate credentials and permanently delete this account profile
                  </p>
                </div>
                <Button
                  type="button"
                  disabled={deletingProfile}
                  onClick={handleDeleteOwnAccount}
                  style={{
                    padding: "5px 12px",
                    fontSize: 11.5,
                    fontWeight: 700,
                    background: "rgba(239, 68, 68, 0.1)",
                    color: "var(--status-error)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <i className="ri-delete-bin-line" /> {deletingProfile ? "Deleting…" : "Delete Profile"}
                </Button>
              </div>
            </div>
          )}

          {/* TAB 2: Security & Password */}
          {activeTab === "security" && (
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--line)",
                borderRadius: 12,
                padding: "18px 20px",
                boxShadow: "var(--shadow-xs)",
              }}
            >
              <div style={{ paddingBottom: 12, borderBottom: "1px solid var(--line)", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "var(--ink)", display: "flex", alignItems: "center", gap: 6 }}>
                    <i className="ri-shield-keyhole-line" style={{ color: "var(--primary)" }} /> Account Security &amp; Password
                  </h3>
                  <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "var(--muted)" }}>
                    {isSuperAdmin ? "Master root password and executive authentication credentials" : "Update your account password and security credentials"}
                  </p>
                </div>

                {!isEditingPassword && (
                  <Button
                    type="button"
                    onClick={() => {
                      setIsEditingPassword(true);
                      setPwData({ currentPassword: savedPassword || "", newPassword: "" });
                    }}
                    style={{
                      padding: "6px 14px",
                      fontSize: 12,
                      fontWeight: 700,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <i className="ri-edit-line" /> Edit Password
                  </Button>
                )}
              </div>

              {!isEditingPassword ? (
                /* VIEW / READONLY PASSWORD MODE */
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div
                    style={{
                      background: "var(--canvas)",
                      border: "1px solid var(--line)",
                      borderRadius: 10,
                      padding: "14px 16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.4 }}>
                        {isSuperAdmin ? "Super Admin Root Password" : "Saved Account Password"}
                      </span>
                      <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: "rgba(51, 116, 24, 0.12)", color: "var(--primary)" }}>
                        <i className="ri-lock-2-line" /> Active &amp; Encrypted
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <div
                        style={{
                          flex: 1,
                          minWidth: 200,
                          height: 38,
                          borderRadius: 8,
                          border: "1px solid var(--line-strong)",
                          background: "var(--surface)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "0 12px",
                          fontFamily: showSavedPassword ? "monospace" : "inherit",
                          fontSize: showSavedPassword ? 13.5 : 16,
                          fontWeight: 700,
                          color: "var(--ink)",
                          letterSpacing: showSavedPassword ? "normal" : "2px",
                        }}
                      >
                        <span>{showSavedPassword ? savedPassword : "••••••••••••"}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <button
                            type="button"
                            onClick={() => setShowSavedPassword(!showSavedPassword)}
                            title={showSavedPassword ? "Hide password" : "Show password"}
                            style={{
                              border: "none",
                              background: "none",
                              color: "var(--muted)",
                              cursor: "pointer",
                              padding: 4,
                              fontSize: 14,
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <i className={showSavedPassword ? "ri-eye-off-line" : "ri-eye-line"} />
                          </button>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          navigator.clipboard?.writeText(savedPassword);
                          toast.success("Password copied to clipboard!");
                        }}
                        style={{ padding: "8px 12px", fontSize: 12, height: 38 }}
                      >
                        <i className="ri-file-copy-line" /> Copy
                      </Button>
                    </div>

                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                      <i className="ri-information-line" /> Click "Edit Password" above to change this password.
                    </div>
                  </div>
                </div>
              ) : (
                /* EDIT PASSWORD MODE (NO CONFIRM PASSWORD) */
                <form onSubmit={handlePasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div
                    style={{
                      background: "rgba(51, 116, 24, 0.04)",
                      border: "1px solid rgba(51, 116, 24, 0.15)",
                      borderRadius: 10,
                      padding: "14px 16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", display: "flex", alignItems: "center", gap: 5 }}>
                      <i className="ri-key-2-line" /> Modify Account Password
                    </div>

                    {/* Current Password Field */}
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)", display: "block", marginBottom: 4 }}>
                        Current Password <span style={{ color: "var(--status-error)" }}>*</span>
                      </label>
                      <div style={{ position: "relative" }}>
                        <input
                          type={showCurrentPw ? "text" : "password"}
                          value={pwData.currentPassword}
                          onChange={(e) => setPwData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                          placeholder="Enter current password"
                          style={{
                            width: "100%",
                            height: 38,
                            padding: "0 38px 0 12px",
                            borderRadius: 8,
                            border: "1px solid var(--line-strong)",
                            background: "var(--surface)",
                            fontSize: 12.5,
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
                            fontSize: 13,
                          }}
                        >
                          <i className={showCurrentPw ? "ri-eye-off-line" : "ri-eye-line"} />
                        </button>
                      </div>
                    </div>

                    {/* New Password Field (No Confirm Password) */}
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)", display: "block", marginBottom: 4 }}>
                        New Password <span style={{ color: "var(--status-error)" }}>*</span>
                      </label>
                      <div style={{ position: "relative" }}>
                        <input
                          type={showNewPw ? "text" : "password"}
                          value={pwData.newPassword}
                          onChange={(e) => setPwData((prev) => ({ ...prev, newPassword: e.target.value }))}
                          placeholder="Enter new password (min 6 characters)"
                          style={{
                            width: "100%",
                            height: 38,
                            padding: "0 38px 0 12px",
                            borderRadius: 8,
                            border: "1px solid var(--line-strong)",
                            background: "var(--surface)",
                            fontSize: 12.5,
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
                            fontSize: 13,
                          }}
                        >
                          <i className={showNewPw ? "ri-eye-off-line" : "ri-eye-line"} />
                        </button>
                      </div>
                    </div>

                    {/* Password Strength Indicator */}
                    {pwData.newPassword && (
                      <div style={{ padding: "8px 12px", background: "var(--surface)", borderRadius: 8, border: "1px solid var(--line)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                          <span style={{ color: "var(--muted)" }}>Password Strength:</span>
                          <strong style={{ color: strengthColor }}>{strengthLabel} ({score}%)</strong>
                        </div>
                        <div style={{ height: 4, width: "100%", background: "var(--line)", borderRadius: 2, overflow: "hidden" }}>
                          <div
                            style={{
                              height: "100%",
                              width: `${score}%`,
                              background: strengthColor,
                              transition: "width 0.25s ease",
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions: Update & Cancel */}
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 6 }}>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setIsEditingPassword(false);
                        setPwData({ currentPassword: "", newPassword: "" });
                      }}
                      style={{ padding: "6px 16px", fontSize: 12 }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={savingPassword}
                      className="btn-glow"
                      style={{ padding: "6px 20px", fontSize: 12, fontWeight: 700 }}
                    >
                      {savingPassword ? "Updating Password…" : "Update Password"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: Access & Governance Matrix */}
          {activeTab === "access" && (
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--line)",
                borderRadius: 12,
                padding: "18px 20px",
                boxShadow: "var(--shadow-xs)",
              }}
            >
              <div style={{ paddingBottom: 12, borderBottom: "1px solid var(--line)", marginBottom: 14 }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "var(--ink)" }}>
                  Governed Modules &amp; Privileges
                </h3>
                <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "var(--muted)" }}>
                  System authorization matrix for {displayRole}
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }} className="responsive-grid-2">
                {PERMISSIONS_MAP.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "10px 12px",
                      background: "var(--canvas)",
                      border: "1px solid var(--line)",
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 6,
                        background: "rgba(93, 214, 44, 0.12)",
                        color: "var(--primary-deep)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 15,
                        flexShrink: 0,
                      }}
                    >
                      <i className={item.icon} />
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <strong style={{ fontSize: 12, color: "var(--ink)" }}>{item.module}</strong>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#10B981" }} />
                      </div>
                      <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--muted)", lineHeight: 1.35 }}>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: High-Density Executive Digital ID Card */}
        <div>
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: 12,
              padding: "16px 14px",
              boxShadow: "var(--shadow-xs)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            {/* Header Badge */}
            <div
              style={{
                width: "100%",
                padding: "6px 10px",
                borderRadius: 7,
                background: "linear-gradient(135deg, rgba(93, 214, 44, 0.15) 0%, rgba(51, 116, 24, 0.1) 100%)",
                border: "1px solid rgba(93, 214, 44, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10.5, fontWeight: 800, color: "var(--primary-deep)" }}>
                <i className="ri-shield-check-line" />
                <span>KUSUMGANGA ERP</span>
              </div>
              <span style={{ fontSize: 9.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                Executive ID
              </span>
            </div>

            {/* Mini Avatar */}
            <div style={{ position: "relative", marginBottom: 8 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: formData.avatarUrl
                    ? `url(${formData.avatarUrl}) center/cover no-repeat`
                    : "linear-gradient(135deg, var(--primary) 0%, #166534 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: 800,
                  fontSize: 18,
                  border: "2px solid var(--surface)",
                  boxShadow: "0 2px 8px rgba(93, 214, 44, 0.3)",
                  overflow: "hidden",
                }}
              >
                {!formData.avatarUrl && (formData.fullName || "AD").slice(0, 2).toUpperCase()}
              </div>
              <span
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: 11,
                  height: 11,
                  borderRadius: "50%",
                  background: "#10B981",
                  border: "2px solid var(--surface)",
                }}
              />
            </div>

            <h4 style={{ margin: "0 0 3px", fontSize: 14, fontWeight: 800, color: "var(--ink)" }}>
              {formData.fullName || "Administrator"}
            </h4>
            <Badge tone={roleBadgeTone}>{displayRole.toUpperCase()}</Badge>

            {/* Details Box */}
            <div
              style={{
                width: "100%",
                background: "var(--canvas)",
                border: "1px solid var(--line)",
                borderRadius: 8,
                padding: "10px 12px",
                display: "flex",
                flexDirection: "column",
                gap: 6,
                textAlign: "left",
                fontSize: 11.5,
                margin: "12px 0",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>Organization:</span>
                <strong style={{ color: "var(--ink)" }}>Kusumganga Agro</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>Phone:</span>
                <span style={{ fontWeight: 600, color: "var(--ink)" }}>{formData.phone || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>Email:</span>
                <span style={{ fontWeight: 600, color: "var(--ink)", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {formData.email || "—"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>Governance:</span>
                <span style={{ fontWeight: 700, color: "var(--primary-deep)" }}>
                  {isSuperAdmin ? "Enterprise (All Hubs)" : "Assigned Hub"}
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              onClick={copyCredentialInfo}
              style={{
                width: "100%",
                fontSize: 11.5,
                padding: "6px 10px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
              }}
            >
              <i className={copiedId ? "ri-check-line" : "ri-file-copy-line"} />
              {copiedId ? "ID Copied!" : "Copy Digital ID"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
