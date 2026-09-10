import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import FormField from "../components/common/FormField";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import { useAuth } from "../hooks/useAuth";
import { updateOwnProfile, changePassword } from "../features/auth/api";
import { deleteOwnProfile } from "../features/profiles/api";
import { toast } from "../utils/toast";

export default function MyProfile() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const fileInputRef = useRef(null);

  const isSuperAdmin = (user?.roleKey || user?.role || "").toLowerCase() === "super_admin";
  const isWarehouseAdmin = (user?.roleKey || user?.role || "").toLowerCase() === "warehouse_admin";
  const displayRole = isSuperAdmin ? "Super Administrator" : isWarehouseAdmin ? "Warehouse Administrator" : "Warehouse Supervisor";
  const roleBadgeTone = isSuperAdmin ? "success" : isWarehouseAdmin ? "info" : "warning";

  // Profile Form
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    avatarUrl: "",
  });

  // Password
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [deletingProfile, setDeletingProfile] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [pwData, setPwData] = useState({ currentPassword: "", newPassword: "" });
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
      toast.info("Photo loaded! Click 'Save Changes' to update.");
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
      updateUser(res);
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
      setPwData({ currentPassword: "", newPassword: "" });
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || err.message || "Failed to change password.");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteOwnAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your profile? This action cannot be undone.")) return;
    setDeletingProfile(true);
    try {
      await deleteOwnProfile();
      toast.success("Profile deleted. Signing out...");
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
    toast.success("ID copied to clipboard!");
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Password strength
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
  const strengthLabel = score === 0 ? "" : score <= 25 ? "Weak" : score <= 75 ? "Moderate" : "Strong";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Identity Header */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: 14,
          overflow: "hidden",
          boxShadow: "var(--shadow-xs)",
        }}
      >
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div
                onClick={() => fileInputRef.current?.click()}
                title="Click to change photo"
                style={{
                  width: 58, height: 58, borderRadius: "50%",
                  background: formData.avatarUrl ? `url(${formData.avatarUrl}) center/cover no-repeat` : "linear-gradient(135deg, var(--primary) 0%, #166534 100%)",
                  border: "2.5px solid var(--surface)", boxShadow: "0 2px 10px rgba(93, 214, 44, 0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 22, fontWeight: 800, cursor: "pointer", overflow: "hidden",
                }}
              >
                {!formData.avatarUrl && (formData.fullName || "AD").slice(0, 2).toUpperCase()}
              </div>
              <span style={{ position: "absolute", bottom: 0, right: 0, width: 13, height: 13, borderRadius: "50%", background: "#10B981", border: "2px solid var(--surface)", boxShadow: "0 0 6px #10B981" }} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.02em" }}>{formData.fullName || user?.name || "Administrator"}</h1>
                <Badge tone={roleBadgeTone}>{displayRole.toUpperCase()}</Badge>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: "var(--primary-deep)", background: "rgba(93, 214, 44, 0.12)", padding: "2px 8px", borderRadius: 12 }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#10B981" }} /> Active &amp; Verified
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 4, fontSize: 12, color: "var(--muted)", flexWrap: "wrap" }}>
                <span><i className="ri-mail-line" style={{ color: "var(--primary)", marginRight: 4 }} />{formData.email || "No email"}</span>
                <span><i className="ri-phone-line" style={{ color: "var(--primary)", marginRight: 4 }} />{formData.phone || "No phone"}</span>
                <span><i className="ri-shield-keyhole-line" style={{ color: "var(--primary)", marginRight: 4 }} />{isSuperAdmin ? "Tier 0 (Root)" : isWarehouseAdmin ? "Tier 1 (Admin)" : "Tier 2 (Ops)"}</span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} />
            <Button variant="secondary" onClick={() => fileInputRef.current?.click()} style={{ padding: "6px 12px", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 5 }}>
              <i className="ri-camera-line" /> Change Photo
            </Button>
            {formData.avatarUrl && (
              <Button variant="secondary" onClick={() => setFormData((prev) => ({ ...prev, avatarUrl: "" }))} style={{ padding: "6px 10px", fontSize: 12, color: "var(--status-error)" }}>Remove</Button>
            )}
          </div>
        </div>
      </div>

      {/* 2-Column: Profile Form + Digital ID Card */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 310px", gap: 14 }} className="responsive-grid-2">
        {/* LEFT: Profile Details */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "18px 20px", boxShadow: "var(--shadow-xs)" }}>
          <div style={{ paddingBottom: 10, borderBottom: "1px solid var(--line)", marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "var(--ink)" }}>Personal &amp; Contact Details</h3>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--muted)" }}>Update your identity and communication records</p>
          </div>

          <form onSubmit={handleProfileSubmit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px" }} className="responsive-grid-2">
              <div style={{ gridColumn: "1 / -1" }}>
                <FormField label="Full Legal Name" required layout="vertical" icon="ri-user-3-line" value={formData.fullName} onChange={(val) => setFormData((prev) => ({ ...prev, fullName: val }))} placeholder="Your full name" compact marginBottom={6} />
              </div>
              <FormField label="Official Email" type="email" layout="vertical" icon="ri-mail-line" value={formData.email} onChange={(val) => setFormData((prev) => ({ ...prev, email: val }))} placeholder="you@company.com" compact marginBottom={6} />
              <FormField label="Mobile Phone (Login ID)" layout="vertical" icon="ri-phone-line" value={formData.phone} onChange={(val) => setFormData((prev) => ({ ...prev, phone: val }))} placeholder="98xxxxxxxx" compact marginBottom={6} />
              <div style={{ gridColumn: "1 / -1" }}>
                <FormField label="Address" type="textarea" layout="vertical" icon="ri-map-pin-line" value={formData.address} onChange={(val) => setFormData((prev) => ({ ...prev, address: val }))} placeholder="Your address" compact marginBottom={6} rows={2} />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 8, borderTop: "1px solid var(--line)" }}>
              <Button type="submit" disabled={saving} className="btn-glow" style={{ padding: "6px 20px", fontSize: 12, fontWeight: 700 }}>
                {saving ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </form>

          {/* Password Change Section */}
          <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 800, color: "var(--ink)", display: "flex", alignItems: "center", gap: 6 }}>
              <i className="ri-shield-keyhole-line" style={{ color: "var(--primary)" }} /> Change Password
            </h3>
            <form onSubmit={handlePasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <FormField label="Current Password" required layout="vertical" icon="ri-lock-line" type="password" value={pwData.currentPassword} onChange={(val) => setPwData((prev) => ({ ...prev, currentPassword: val }))} showPassword={showCurrentPw} onTogglePassword={() => setShowCurrentPw(!showCurrentPw)} placeholder="Enter current password" compact marginBottom={6} />
              <FormField label="New Password" required layout="vertical" icon="ri-lock-line" type="password" value={pwData.newPassword} onChange={(val) => setPwData((prev) => ({ ...prev, newPassword: val }))} showPassword={showNewPw} onTogglePassword={() => setShowNewPw(!showNewPw)} placeholder="Min 6 characters" compact marginBottom={6} />
              {pwData.newPassword && (
                <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1, height: 4, borderRadius: 2, background: "var(--line)", overflow: "hidden" }}>
                    <div style={{ width: `${score}%`, height: "100%", background: strengthColor, borderRadius: 2, transition: "width 0.3s ease" }} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: strengthColor, whiteSpace: "nowrap" }}>{strengthLabel}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button type="submit" disabled={savingPassword} className="btn-glow" style={{ padding: "6px 18px", fontSize: 12, fontWeight: 700 }}>
                  {savingPassword ? "Updating…" : "Update Password"}
                </Button>
              </div>
            </form>
          </div>

          {/* Danger Zone */}
          <div style={{ marginTop: 18, padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(239, 68, 68, 0.25)", background: "rgba(239, 68, 68, 0.03)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <div>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--status-error)", display: "flex", alignItems: "center", gap: 5 }}>
                <i className="ri-error-warning-line" /> Account Deletion Zone
              </span>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--muted)" }}>Permanently delete this account profile</p>
            </div>
            <Button type="button" disabled={deletingProfile} onClick={handleDeleteOwnAccount} style={{ padding: "5px 12px", fontSize: 11.5, fontWeight: 700, background: "rgba(239, 68, 68, 0.1)", color: "var(--status-error)", border: "1px solid rgba(239, 68, 68, 0.3)", display: "inline-flex", alignItems: "center", gap: 5 }}>
              <i className="ri-delete-bin-line" /> {deletingProfile ? "Deleting…" : "Delete Profile"}
            </Button>
          </div>
        </div>

        {/* RIGHT: Digital ID Card */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "16px 14px", boxShadow: "var(--shadow-xs)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <div style={{ width: "100%", padding: "6px 10px", borderRadius: 7, background: "linear-gradient(135deg, rgba(93, 214, 44, 0.15) 0%, rgba(51, 116, 24, 0.1) 100%)", border: "1px solid rgba(93, 214, 44, 0.3)", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10.5, fontWeight: 800, color: "var(--primary-deep)" }}>
              <i className="ri-shield-check-line" /><span>KUSUMGANGA ERP</span>
            </div>
            <span style={{ fontSize: 9.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Executive ID</span>
          </div>

          <div style={{ position: "relative", marginBottom: 8 }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: formData.avatarUrl ? `url(${formData.avatarUrl}) center/cover no-repeat` : "linear-gradient(135deg, var(--primary) 0%, #166534 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 18, border: "2px solid var(--surface)", boxShadow: "0 2px 8px rgba(93, 214, 44, 0.3)", overflow: "hidden" }}>
              {!formData.avatarUrl && (formData.fullName || "AD").slice(0, 2).toUpperCase()}
            </div>
            <span style={{ position: "absolute", bottom: 0, right: 0, width: 11, height: 11, borderRadius: "50%", background: "#10B981", border: "2px solid var(--surface)" }} />
          </div>

          <h4 style={{ margin: "0 0 3px", fontSize: 14, fontWeight: 800, color: "var(--ink)" }}>{formData.fullName || "Administrator"}</h4>
          <Badge tone={roleBadgeTone}>{displayRole.toUpperCase()}</Badge>

          <div style={{ width: "100%", background: "var(--canvas)", border: "1px solid var(--line)", borderRadius: 8, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6, textAlign: "left", fontSize: 11.5, margin: "12px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--muted)" }}>Organization:</span><strong style={{ color: "var(--ink)" }}>Kusumganga Agro</strong></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--muted)" }}>Phone:</span><span style={{ fontWeight: 600, color: "var(--ink)" }}>{formData.phone || "—"}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--muted)" }}>Email:</span><span style={{ fontWeight: 600, color: "var(--ink)", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{formData.email || "—"}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--muted)" }}>Governance:</span><span style={{ fontWeight: 700, color: "var(--primary-deep)" }}>{isSuperAdmin ? "Enterprise (All Hubs)" : "Assigned Hub"}</span></div>
          </div>

          <Button type="button" variant="secondary" onClick={copyCredentialInfo} style={{ width: "100%", fontSize: 11.5, padding: "6px 10px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
            <i className={copiedId ? "ri-check-line" : "ri-file-copy-line"} />{copiedId ? "Copied!" : "Copy Digital ID"}
          </Button>
        </div>
      </div>
    </div>
  );
}
