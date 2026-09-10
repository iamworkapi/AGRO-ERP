import { useState, useEffect, useRef } from "react";
import FormField from "../components/common/FormField";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import Card from "../components/common/Card";
import AsyncState from "../components/common/AsyncState";
import { useAuth } from "../hooks/useAuth";
import { updateOwnProfile, changePassword, adaptProfile } from "../features/auth/api";
import { toast } from "../utils/toast";
import { apiClient } from "../services/apiClient";

const TABS = [
  { key: "profile", label: "Executive Profile", icon: "ri-id-card-line" },
  { key: "security", label: "Security & Credentials", icon: "ri-shield-check-line" },
  { key: "access", label: "Access & Governance", icon: "ri-node-tree" },
];

const ROOT_PERMISSIONS_MAP = [
  { module: "Multi-Hub Administration", desc: "Global authority over all warehouses, capacity & supervisor staffing", icon: "ri-building-line" },
  { module: "Biomass Supply Chain", desc: "4-stage supply chain control, moisture slabs & deduction tables", icon: "ri-fire-line" },
  { module: "Weighbridge Infrastructure", desc: "Gross/tare weighment override, weight machine calibrations & slips", icon: "ri-scales-3-line" },
  { module: "Inventory & Spare Parts", desc: "Centralized stock ledger, multi-hub transfers & low-stock alerts", icon: "ri-archive-line" },
  { module: "Purchase & Vendor Ledgers", desc: "Vendor registration, purchase orders & ledger balances", icon: "ri-shopping-bag-3-line" },
  { module: "Sales, Billing & Tax Invoicing", desc: "Industrial buyer directory, GSTIN billing & factory gate passes", icon: "ri-file-list-3-line" },
];

const ROLE_MATRIX = [
  { role: "Super Admin", key: "super_admin", color: "#7C3AED", users: "—", scope: "All Warehouses", perms: ["Full Access", "User Management", "Billing", "Reports", "Settings"] },
  { role: "Warehouse Admin", key: "warehouse_admin", color: "var(--primary)", users: "—", scope: "Assigned Warehouse", perms: ["Employees", "Attendance", "Inventory", "Weighments", "Vendors"] },
  { role: "Supervisor", key: "supervisor", color: "#2563EB", users: "—", scope: "Assigned Warehouse", perms: ["Attendance", "Weighments", "Stock Entry", "Dispatch"] },
  { role: "Operator", key: "operator", color: "#D97706", users: "—", scope: "Assigned Warehouse", perms: ["Weighments", "Stock Entry"] },
];

const GOVERNANCE_SECTIONS = [
  { key: "roles", label: "Role Matrix", icon: "ri-shield-user-line" },
  { key: "permissions", label: "Root Permissions", icon: "ri-key-2-line" },
  { key: "policies", label: "Security Policies", icon: "ri-lock-line" },
  { key: "logs", label: "Activity Log", icon: "ri-file-list-line" },
];

export default function SuperAdminProfile() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    avatarUrl: "",
  });

  // Password State
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [showSavedPassword, setShowSavedPassword] = useState(false);
  const [savedPassword, setSavedPassword] = useState(user?.plainPassword || "SuperAdmin@2026");
  const [pwData, setPwData] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // Governance State
  const [govTab, setGovTab] = useState("roles");
  const [userCounts, setUserCounts] = useState({});
  const [auditLogs, setAuditLogs] = useState([]);
  const [govLoading, setGovLoading] = useState(false);
  const [govError, setGovError] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || user.name || "Super Admin",
        email: user.email || "iamworkapi@gmail.com",
        phone: user.phone || "9891140379",
        address: user.address || "Bettiah Central Hub, Bihar",
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
      toast.success("Super Admin profile updated successfully!");
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
      toast.success("Master password updated successfully!");
      setSavedPassword(pwData.newPassword);
      setPwData({ currentPassword: "", newPassword: "" });
      setIsEditingPassword(false);
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || err.message || "Failed to change password.");
    } finally {
      setSavingPassword(false);
    }
  };

  const copyCredentialInfo = () => {
    const info = `Super Admin: ${formData.fullName}\nRole: Root Super Administrator\nClearance: Tier 0 (Enterprise Root)\nEmail: ${formData.email}\nPhone: ${formData.phone}`;
    navigator.clipboard?.writeText(info);
    setCopiedId(true);
    toast.success("Master ID details copied to clipboard!");
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Load governance data when access tab is active
  useEffect(() => {
    if (activeTab !== "access") return;
    let cancelled = false;

    async function loadGovernanceData() {
      setGovLoading(true);
      setGovError(null);
      try {
        const [countsRes, auditRes] = await Promise.all([
          apiClient.get("/users/counts-by-role").catch(() => ({ data: { data: {} } })),
          apiClient.get("/audit?limit=20").catch(() => ({ data: { data: [] } })),
        ]);
        if (!cancelled) {
          setUserCounts(countsRes.data?.data || {});
          setAuditLogs(Array.isArray(auditRes.data?.data) ? auditRes.data.data : []);
        }
      } catch {
        if (!cancelled) setGovError("Failed to load governance data.");
      } finally {
        if (!cancelled) setGovLoading(false);
      }
    }

    loadGovernanceData();
    return () => { cancelled = true; };
  }, [activeTab]);

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
      {/* 1. COMPACT EXECUTIVE IDENTITY HERO & TAB STRIP */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: 14,
          overflow: "hidden",
          boxShadow: "var(--shadow-xs)",
        }}
      >
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
          {/* Avatar + Details */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
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
                {!formData.avatarUrl && (formData.fullName || "SA").slice(0, 2).toUpperCase()}
              </div>
              <span
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
                  {formData.fullName || "Super Admin"}
                </h1>
                <Badge tone="success">SUPER ADMINISTRATOR</Badge>
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
                  Enterprise Root Active
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 4, fontSize: 12, color: "var(--muted)", flexWrap: "wrap" }}>
                <span>
                  <i className="ri-mail-line" style={{ color: "var(--primary)", marginRight: 4 }} />
                  {formData.email}
                </span>
                <span>
                  <i className="ri-phone-line" style={{ color: "var(--primary)", marginRight: 4 }} />
                  {formData.phone}
                </span>
                <span>
                  <i className="ri-shield-keyhole-line" style={{ color: "var(--primary)", marginRight: 4 }} />
                  Tier 0 (Root Clearance)
                </span>
              </div>
            </div>
          </div>

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

        {/* Tab Navigation */}
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

      {/* 2. MAIN WORKSPACE */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 310px", gap: 14 }} className="responsive-grid-2">
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
              <div style={{ paddingBottom: 12, borderBottom: "1px solid var(--line)", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "var(--ink)" }}>
                    Master Identity &amp; Contact Details
                  </h3>
                  <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "var(--muted)" }}>
                    Global root administrator credentials and official records
                  </p>
                </div>
              </div>

              <form onSubmit={handleProfileSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }} className="responsive-grid-2">
                  <div style={{ gridColumn: "1 / -1" }}>
                    <FormField
                      label="Full Legal Name"
                      required
                      icon="ri-user-3-line"
                      value={formData.fullName}
                      onChange={(val) => setFormData((prev) => ({ ...prev, fullName: val }))}
                      placeholder="Super Admin"
                      compact
                      marginBottom={10}
                    />
                  </div>

                  <FormField
                    label="Master Email Address"
                    type="email"
                    icon="ri-mail-line"
                    value={formData.email}
                    onChange={(val) => setFormData((prev) => ({ ...prev, email: val }))}
                    placeholder="iamworkapi@gmail.com"
                    compact
                    marginBottom={10}
                  />

                  <FormField
                    label="Direct Phone (Login ID)"
                    icon="ri-phone-line"
                    value={formData.phone}
                    onChange={(val) => setFormData((prev) => ({ ...prev, phone: val }))}
                    placeholder="9891140379"
                    compact
                    marginBottom={10}
                  />

                  <div style={{ gridColumn: "1 / -1" }}>
                    <FormField
                      label="Headquarters Address"
                      type="textarea"
                      icon="ri-map-pin-line"
                      value={formData.address}
                      onChange={(val) => setFormData((prev) => ({ ...prev, address: val }))}
                      placeholder="Bettiah Central Hub, Bihar"
                      compact
                      marginBottom={10}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 10, borderTop: "1px solid var(--line)" }}>
                  <Button type="submit" disabled={saving} className="btn-glow" style={{ padding: "7px 22px", fontSize: 12.5, fontWeight: 700 }}>
                    {saving ? "Saving Changes…" : "Save Changes"}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: Root Access Password */}
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
                    <i className="ri-shield-keyhole-line" style={{ color: "var(--primary)" }} /> Root Access Password
                  </h3>
                  <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "var(--muted)" }}>
                    Master root credentials for enterprise Super Administrator access
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
                        Super Admin Root Master Password
                      </span>
                      <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: "rgba(51, 116, 24, 0.12)", color: "var(--primary)" }}>
                        <i className="ri-lock-2-line" /> Tier 0 Root Active
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
                          toast.success("Master password copied to clipboard!");
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
                      <i className="ri-key-2-line" /> Modify Master Password
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

          {/* TAB 3: Access & Governance */}
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
              <div style={{ paddingBottom: 10, borderBottom: "1px solid var(--line)", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "var(--ink)" }}>
                    Access & Governance
                  </h3>
                  <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "var(--muted)" }}>
                    Enterprise-wide user roles, permissions, security policies & activity audit trail
                  </p>
                </div>
                <span style={{ fontSize: 10.5, fontWeight: 700, padding: "3px 10px", borderRadius: 10, background: "rgba(124,58,237,0.1)", color: "#7C3AED" }}>
                  <i className="ri-node-tree" /> 4 Roles | Full Governance
                </span>
              </div>

              {/* Sub-tab navigation */}
              <div style={{ display: "flex", gap: 3, background: "var(--canvas)", padding: 3, borderRadius: 8, border: "1px solid var(--line)", width: "fit-content", marginBottom: 16 }}>
                {GOVERNANCE_SECTIONS.map((tab) => {
                  const isActive = govTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setGovTab(tab.key)}
                      style={{
                        padding: "5px 13px",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: isActive ? 700 : 500,
                        cursor: "pointer",
                        border: "none",
                        background: isActive ? "var(--surface)" : "transparent",
                        color: isActive ? "var(--ink)" : "var(--muted)",
                        boxShadow: isActive ? "var(--shadow-xs)" : "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        transition: "all 0.15s ease",
                      }}
                    >
                      <i className={tab.icon} style={{ fontSize: 11.5, color: isActive ? "#7C3AED" : "inherit" }} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <AsyncState status={govLoading ? "loading" : "succeeded"} error={govError} loadingLabel="Loading governance data…" />

              {/* Sub-tab: Roles */}
              {govTab === "roles" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
                    {ROLE_MATRIX.map((role) => {
                      const count = userCounts[role.key] || userCounts[role.key.replace("_", "")] || "—";
                      return (
                        <div
                          key={role.key}
                          style={{
                            padding: "14px 16px",
                            background: "var(--canvas)",
                            border: "1px solid var(--line)",
                            borderRadius: 10,
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{
                                width: 30, height: 30, borderRadius: 7,
                                background: `${role.color}18`, color: role.color,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 14, fontWeight: 700,
                              }}>
                                <i className="ri-user-settings-line" />
                              </div>
                              <span style={{ fontWeight: 700, fontSize: 13, color: "var(--ink)" }}>{role.role}</span>
                            </div>
                            <span style={{
                              fontSize: 10.5, fontWeight: 700, padding: "2px 8px", borderRadius: 10,
                              background: `${role.color}18`, color: role.color,
                            }}>
                              {typeof count === "number" ? `${count} user${count !== 1 ? "s" : ""}` : count}
                            </span>
                          </div>
                          <span style={{ fontSize: 11, color: "var(--muted)", display: "flex", alignItems: "center", gap: 4 }}>
                            <i className="ri-focus-3-line" style={{ fontSize: 10 }} />
                            Scope: {role.scope}
                          </span>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                            {role.perms.map((p) => (
                              <span key={p} style={{
                                fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 6,
                                background: "var(--primary-tint)", color: "var(--primary-deep)",
                                border: "1px solid rgba(93,214,44,0.2)",
                              }}>
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Role hierarchy visual */}
                  <Card title="Role Hierarchy" subtitle="Authority levels from enterprise root to operational staff" style={{ marginTop: 4 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                      {ROLE_MATRIX.map((role, i) => (
                        <div key={role.key} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderBottom: i < ROLE_MATRIX.length - 1 ? "1px solid var(--line)" : "none" }}>
                          <div style={{
                            width: 8, height: 8, borderRadius: "50%", background: role.color,
                            boxShadow: `0 0 6px ${role.color}44`, flexShrink: 0,
                          }} />
                          <span style={{ fontWeight: 700, fontSize: 12.5, color: "var(--ink)", minWidth: 130 }}>{role.role}</span>
                          <span style={{ fontSize: 11, color: "var(--muted)", flex: 1 }}>{role.scope}</span>
                          <div style={{ display: "flex", gap: 4 }}>
                            {role.perms.slice(0, 3).map((p) => (
                              <span key={p} style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600, background: "var(--canvas)", padding: "2px 6px", borderRadius: 4 }}>{p}</span>
                            ))}
                            {role.perms.length > 3 && (
                              <span style={{ fontSize: 10, color: "var(--primary)", fontWeight: 700 }}>+{role.perms.length - 3}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}

              {/* Sub-tab: Root Permissions */}
              {govTab === "permissions" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 12 }}>
                  {["Enterprise Governance", "Financial Controls", "Operational Authority", "Security & Compliance"].map((group, gi) => {
                    const items = ROOT_PERMISSIONS_MAP.slice(gi * 2, gi * 2 + 2);
                    return (
                      <div key={group} style={{
                        background: "var(--canvas)", border: "1px solid var(--line)",
                        borderRadius: 10, padding: "14px 16px",
                      }}>
                        <h4 style={{ margin: "0 0 12px", fontSize: 12.5, fontWeight: 800, color: "var(--ink)", display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{
                            width: 6, height: 6, borderRadius: "50%",
                            background: "#7C3AED", boxShadow: "0 0 6px #7C3AED66",
                          }} />
                          {group}
                        </h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {items.map((item, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 10px", background: "var(--surface)", borderRadius: 7, border: "1px solid var(--line)" }}>
                              <div style={{
                                width: 28, height: 28, borderRadius: 6,
                                background: "rgba(124,58,237,0.1)", color: "#7C3AED",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 13, flexShrink: 0,
                              }}>
                                <i className={item.icon} />
                              </div>
                              <div>
                                <strong style={{ fontSize: 12, color: "var(--ink)", display: "block" }}>{item.module}</strong>
                                <span style={{ fontSize: 10.5, color: "var(--muted)", lineHeight: 1.35 }}>{item.desc}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Sub-tab: Security Policies */}
              {govTab === "policies" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 10 }}>
                  {[
                    { title: "Password Policy", icon: "ri-lock-2-line", items: ["Minimum 8 characters", "Uppercase + lowercase required", "Numeric & special character required", "Rotation every 90 days", "No reuse of last 5 passwords"] },
                    { title: "Access Control", icon: "ri-shield-check-line", items: ["JWT-based authentication", "Role-based access control (RBAC)", "Warehouse-scoped permissions", "Token version invalidation on password change", "Auto-logout on inactivity (configurable)"] },
                    { title: "Data Governance", icon: "ri-database-2-line", items: ["All writes audited with actor, action & timestamp", "PII encryption for email & phone", "Pagination on all list endpoints", "Error masking — internal errors not exposed", "CORS-restricted to approved origins"] },
                    { title: "Compliance", icon: "ri-file-shield-line", items: ["GST-compliant invoice generation", "Biometric-ready attendance modules", "Weighment slip audit trail", "Stock valuation ledger", "Vendor ledger reconciliation"] },
                  ].map((section) => (
                    <Card key={section.title} title={section.title} subtitle="" style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: 7,
                          background: "rgba(124,58,237,0.1)", color: "#7C3AED",
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
                        }}>
                          <i className={section.icon} />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 12.5, color: "var(--ink)" }}>{section.title}</span>
                      </div>
                      <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
                        {section.items.map((item) => (
                          <li key={item} style={{ fontSize: 11.5, color: "var(--muted)", lineHeight: 1.4 }}>{item}</li>
                        ))}
                      </ul>
                    </Card>
                  ))}
                </div>
              )}

              {/* Sub-tab: Activity Log */}
              {govTab === "logs" && (
                <Card title="Recent Activity Log" subtitle="Last actions across the platform (audit trail)">
                  {auditLogs.length === 0 ? (
                    <p style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", padding: 20 }}>No activity recorded yet.</p>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                        <thead>
                          <tr style={{ borderBottom: "2px solid var(--line)" }}>
                            <th style={{ textAlign: "left", padding: "7px 10px", fontWeight: 700, color: "var(--muted)", fontSize: 10.5, textTransform: "uppercase" }}>Timestamp</th>
                            <th style={{ textAlign: "left", padding: "7px 10px", fontWeight: 700, color: "var(--muted)", fontSize: 10.5, textTransform: "uppercase" }}>Action</th>
                            <th style={{ textAlign: "left", padding: "7px 10px", fontWeight: 700, color: "var(--muted)", fontSize: 10.5, textTransform: "uppercase" }}>Entity</th>
                            <th style={{ textAlign: "left", padding: "7px 10px", fontWeight: 700, color: "var(--muted)", fontSize: 10.5, textTransform: "uppercase" }}>Details</th>
                          </tr>
                        </thead>
                        <tbody>
                          {auditLogs.map((log, i) => (
                            <tr key={i} style={{ borderBottom: "1px solid var(--line)" }}>
                              <td style={{ padding: "8px 10px", color: "var(--muted)", fontSize: 11, whiteSpace: "nowrap" }}>
                                {log.timestamp ? new Date(log.timestamp).toLocaleString("en-IN") : "—"}
                              </td>
                              <td style={{ padding: "8px 10px" }}>
                                <Badge tone={log.action?.includes("delete") ? "error" : log.action?.includes("create") ? "success" : "info"} style={{ fontSize: 10 }}>
                                  {log.action || "action"}
                                </Badge>
                              </td>
                              <td style={{ padding: "8px 10px", fontWeight: 600, color: "var(--ink)", fontSize: 12 }}>{log.entityType || "—"}</td>
                              <td style={{ padding: "8px 10px", color: "var(--muted)", fontSize: 11, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {JSON.stringify(log.metadata || {}).slice(0, 80) || "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Digital ID */}
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
                <span>KUSUMGANGA ROOT</span>
              </div>
              <span style={{ fontSize: 9.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                Super Admin ID
              </span>
            </div>

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
                {!formData.avatarUrl && (formData.fullName || "SA").slice(0, 2).toUpperCase()}
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
              {formData.fullName || "Super Admin"}
            </h4>
            <Badge tone="success">SUPER ADMINISTRATOR</Badge>

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
                <span style={{ color: "var(--muted)" }}>Authority:</span>
                <strong style={{ color: "var(--ink)" }}>Enterprise Root</strong>
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
                <span style={{ color: "var(--muted)" }}>Scope:</span>
                <span style={{ fontWeight: 700, color: "var(--primary-deep)" }}>
                  All Warehouses (Global)
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
              {copiedId ? "ID Copied!" : "Copy Master ID"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
