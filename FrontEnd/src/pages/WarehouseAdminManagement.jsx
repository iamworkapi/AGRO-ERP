import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import FormField from "../components/common/FormField";
import Select from "../components/common/Select";
import AsyncState from "../components/common/AsyncState";
import { useWarehouses } from "../features/warehouses/useWarehouses";
import { createProfile, updateProfile } from "../features/profiles/api";
import { toast } from "../utils/toast";

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=250&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=250&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=250&auto=format&fit=crop&q=80",
];

function emptyForm(role = "warehouse_admin") {
  return {
    fullName: "",
    email: "",
    phone: "",
    password: "",
    address: "",
    avatarUrl: "",
    role,
  };
}

export default function WarehouseAdminManagement() {
  const navigate = useNavigate();
  const { warehouses, status, error, updateWarehouse, reload: reloadWarehouses } = useWarehouses();

  const [selectedHubId, setSelectedHubId] = useState("");
  const [activeRole, setActiveRole] = useState("admin"); // "admin" | "supervisor"
  const [isEditing, setIsEditing] = useState(false);

  const [adminForm, setAdminForm] = useState(emptyForm("warehouse_admin"));
  const [supervisorForm, setSupervisorForm] = useState(emptyForm("supervisor"));

  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef(null);
  const workspaceRef = useRef(null);

  // Auto-select first warehouse if none selected
  useEffect(() => {
    if (warehouses.length > 0 && !selectedHubId) {
      setSelectedHubId(warehouses[0].id);
    }
  }, [warehouses, selectedHubId]);

  const selectedWarehouse = warehouses.find((w) => w.id === selectedHubId) || warehouses[0] || null;

  // Whenever selectedWarehouse or activeRole changes, auto-populate if existing, or blank if unassigned
  const resetFormFromWarehouse = (targetRole, targetWh) => {
    const wh = targetWh || selectedWarehouse;
    if (!wh) return;

    if (targetRole === "admin") {
      if (wh.admin) {
        setAdminForm({
          fullName: wh.admin || "",
          phone: wh.adminPhone || "",
          email: wh.adminEmail || "",
          password: "",
          address: wh.adminAddress || "",
          avatarUrl: wh.adminAvatarUrl || "",
          role: "warehouse_admin",
        });
      } else {
        setAdminForm(emptyForm("warehouse_admin"));
      }
    } else {
      if (wh.supervisor) {
        setSupervisorForm({
          fullName: wh.supervisor || "",
          phone: wh.supervisorPhone || "",
          email: wh.supervisorEmail || "",
          password: "",
          address: wh.supervisorAddress || "",
          avatarUrl: wh.supervisorAvatarUrl || "",
          role: "supervisor",
        });
      } else {
        setSupervisorForm(emptyForm("supervisor"));
      }
    }
  };

  useEffect(() => {
    if (!selectedWarehouse) return;
    resetFormFromWarehouse("admin", selectedWarehouse);
    resetFormFromWarehouse("supervisor", selectedWarehouse);
    setIsEditing(false);
  }, [
    selectedWarehouse?.id,
    selectedWarehouse?.admin,
    selectedWarehouse?.adminEmail,
    selectedWarehouse?.adminPhone,
    selectedWarehouse?.adminAvatarUrl,
    selectedWarehouse?.adminAddress,
    selectedWarehouse?.supervisor,
    selectedWarehouse?.supervisorEmail,
    selectedWarehouse?.supervisorPhone,
    selectedWarehouse?.supervisorAvatarUrl,
    selectedWarehouse?.supervisorAddress,
  ]);

  // When switching between Admin and Supervisor tabs
  const handleSwitchRole = (newRole) => {
    setActiveRole(newRole);
    setIsEditing(false);
    resetFormFromWarehouse(newRole, selectedWarehouse);
  };

  const currentAdmin = selectedWarehouse?.admin
    ? {
        name: selectedWarehouse.admin,
        phone: selectedWarehouse.adminPhone || "",
        email: selectedWarehouse.adminEmail || "",
        avatarUrl: selectedWarehouse.adminAvatarUrl || "",
        address: selectedWarehouse.adminAddress || "",
      }
    : null;

  const currentSupervisor = selectedWarehouse?.supervisor
    ? {
        name: selectedWarehouse.supervisor,
        phone: selectedWarehouse.supervisorPhone || "",
        email: selectedWarehouse.supervisorEmail || "",
        avatarUrl: selectedWarehouse.supervisorAvatarUrl || "",
        address: selectedWarehouse.supervisorAddress || "",
      }
    : null;

  const isAssigned = activeRole === "admin" ? Boolean(selectedWarehouse?.admin) : Boolean(selectedWarehouse?.supervisor);
  const currentForm = activeRole === "admin" ? adminForm : supervisorForm;
  const isReadOnly = isAssigned && !isEditing;

  const setFormKey = (key, val) => {
    if (activeRole === "admin") {
      setAdminForm((prev) => ({ ...prev, [key]: val }));
    } else {
      setSupervisorForm((prev) => ({ ...prev, [key]: val }));
    }
  };

  const handleFileUpload = (file) => {
    if (!file || isReadOnly) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image file size should be less than 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormKey("avatarUrl", reader.result);
      toast.info("Avatar photo loaded.");
    };
    reader.readAsDataURL(file);
  };

  // Triggered when user clicks "Manage Admin" or "Manage Supervisor" in the bottom table
  const handleSelectFromTable = (w, targetRole = "admin") => {
    setSelectedHubId(w.id);
    setActiveRole(targetRole);
    setIsEditing(true); // Switch to editing mode right away for quick edits
    resetFormFromWarehouse(targetRole, w);
    workspaceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Submit Handler: Creates New or Updates Details
  const handleSaveStaff = async (e) => {
    if (e) e.preventDefault();

    if (!selectedWarehouse) {
      toast.error("Please select a warehouse first.");
      return;
    }

    const form = activeRole === "admin" ? adminForm : supervisorForm;
    const roleTitle = activeRole === "admin" ? "Warehouse Admin" : "Warehouse Supervisor";
    const roleKey = activeRole === "admin" ? "warehouse_admin" : "supervisor";

    if (!form.fullName.trim()) {
      toast.error(`Full Name is required.`);
      return;
    }
    if (!form.phone.trim() && !form.email.trim()) {
      toast.error(`Phone number or email is required.`);
      return;
    }

    // If creating a brand new unassigned staff, password is required
    if (!isAssigned && (!form.password || form.password.length < 6)) {
      toast.error(`Password must be at least 6 characters.`);
      return;
    }

    setSaving(true);
    try {
      if (!isAssigned) {
        // Create new account & bind to warehouse
        const payload = {
          fullName: form.fullName.trim(),
          phone: form.phone ? form.phone.trim() : undefined,
          email: form.email ? form.email.trim().toLowerCase() : undefined,
          password: form.password,
          address: form.address ? form.address.trim() : undefined,
          avatarUrl: form.avatarUrl || undefined,
          role: roleKey,
          warehouseId: selectedWarehouse.id,
        };

        await createProfile(payload);
        toast.success(`New ${roleTitle} created and assigned to ${selectedWarehouse.name}!`);
      } else {
        // Update existing user profile directly in DB
        const targetUserId = activeRole === "admin" ? selectedWarehouse.adminId : selectedWarehouse.supervisorId;
        const profilePayload = {
          fullName: form.fullName.trim(),
          phone: form.phone ? form.phone.trim() : undefined,
          email: form.email ? form.email.trim().toLowerCase() : undefined,
          address: form.address ? form.address.trim() : undefined,
          avatarUrl: form.avatarUrl || undefined,
        };
        if (form.password && form.password.length >= 6) {
          profilePayload.password = form.password;
        }

        if (targetUserId) {
          await updateProfile(targetUserId, profilePayload);
        } else {
          // Fallback warehouse update if no user id
          const patch = activeRole === "admin"
            ? {
                adminName: form.fullName.trim(),
                adminPhone: form.phone ? form.phone.trim() : undefined,
                adminEmail: form.email ? form.email.trim().toLowerCase() : undefined,
              }
            : {
                supervisorName: form.fullName.trim(),
                supervisorPhone: form.phone ? form.phone.trim() : undefined,
                supervisorEmail: form.email ? form.email.trim().toLowerCase() : undefined,
              };
          await updateWarehouse(selectedWarehouse.id, patch);
        }

        toast.success(`${roleTitle} profile and credentials updated successfully!`);
      }

      setIsEditing(false);
      await reloadWarehouses();
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || err.message || `Failed to save ${roleTitle}.`);
    } finally {
      setSaving(false);
    }
  };

  const displayName = currentForm.fullName || (activeRole === "admin" ? "Warehouse Admin" : "Warehouse Supervisor");
  const displayRole = activeRole === "admin" ? "WAREHOUSE ADMIN" : "WAREHOUSE SUPERVISOR";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Top Header */}
      <PageHeader
        title="Warehouse Admin Management"
        subtitle="Create, view, and update login credentials for Warehouse Admins and Supervisors"
      />

      <AsyncState status={status} error={error} loadingLabel="Loading warehouse personnel…" />

      {/* Warehouse Selector Card */}
      <div
        ref={workspaceRef}
        style={{
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: 12,
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 14,
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 280 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              background: "var(--primary-tint)",
              color: "var(--primary-deep)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            <i className="fa-solid fa-warehouse" />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
              Select Warehouse to Manage
            </label>
            <Select
              value={selectedHubId}
              onChange={(val) => {
                setSelectedHubId(val);
                setIsEditing(false);
              }}
              options={warehouses.map((w) => ({
                value: w.id,
                label: `${w.name} (${w.code})`,
              }))}
              hasLeftIcon
            />
          </div>
        </div>

        {/* Current Assigned Status Pills */}
        {selectedWarehouse && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                background: currentAdmin ? "rgba(0,184,107,0.08)" : "rgba(239,68,68,0.08)",
                border: `1px solid ${currentAdmin ? "rgba(0,184,107,0.25)" : "rgba(239,68,68,0.25)"}`,
                borderRadius: 8,
                padding: "6px 14px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <i className="fa-solid fa-user-shield" style={{ color: currentAdmin ? "var(--primary)" : "var(--status-error)", fontSize: 13 }} />
              <div>
                <span style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", display: "block" }}>Admin</span>
                <strong style={{ fontSize: 12.5, color: currentAdmin ? "var(--ink)" : "var(--status-error)" }}>
                  {currentAdmin?.name ? currentAdmin.name : "Unassigned"}
                </strong>
              </div>
            </div>

            <div
              style={{
                background: currentSupervisor ? "rgba(0,184,107,0.08)" : "rgba(217,119,6,0.08)",
                border: `1px solid ${currentSupervisor ? "rgba(0,184,107,0.25)" : "rgba(217,119,6,0.25)"}`,
                borderRadius: 8,
                padding: "6px 14px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <i className="fa-solid fa-user-gear" style={{ color: currentSupervisor ? "var(--primary)" : "#D97706", fontSize: 13 }} />
              <div>
                <span style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", display: "block" }}>Supervisor</span>
                <strong style={{ fontSize: 12.5, color: currentSupervisor?.name ? "var(--ink)" : "#D97706" }}>
                  {currentSupervisor?.name ? currentSupervisor.name : "Unassigned"}
                </strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2-COLUMN WORKSPACE: LEFT INPUT FORM & RIGHT INSTANT LIVE VIEW CARD */}
      {selectedWarehouse && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 18 }} className="responsive-grid-2">
          {/* COLUMN 1: INPUT & EDIT FORM */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: 12,
              padding: "20px 22px",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            {/* Role Switcher & Status */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, borderBottom: "1px solid var(--line)", paddingBottom: 12 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => handleSwitchRole("admin")}
                  style={{
                    padding: "7px 16px",
                    borderRadius: 8,
                    border: activeRole === "admin" ? "2px solid var(--primary)" : "1px solid var(--line)",
                    background: activeRole === "admin" ? "var(--primary-tint)" : "var(--canvas)",
                    color: activeRole === "admin" ? "var(--primary-deep)" : "var(--ink)",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <i className="fa-solid fa-user-shield" /> Warehouse Admin
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitchRole("supervisor")}
                  style={{
                    padding: "7px 16px",
                    borderRadius: 8,
                    border: activeRole === "supervisor" ? "2px solid var(--primary)" : "1px solid var(--line)",
                    background: activeRole === "supervisor" ? "var(--primary-tint)" : "var(--canvas)",
                    color: activeRole === "supervisor" ? "var(--primary-deep)" : "var(--ink)",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <i className="fa-solid fa-user-gear" /> Warehouse Supervisor
                </button>
              </div>

              {/* Status Indicator */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: isAssigned ? "var(--primary-deep)" : "#D97706",
                    background: isAssigned ? "var(--primary-tint)" : "rgba(217, 119, 6, 0.08)",
                    padding: "4px 10px",
                    borderRadius: 6,
                    border: isAssigned ? "1px solid rgba(0, 184, 107, 0.2)" : "1px solid rgba(217, 119, 6, 0.2)",
                  }}
                >
                  {isAssigned ? (isEditing ? "● Editing Details" : "● Assigned (Read Only)") : "○ Unassigned (Fill to Create)"}
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveStaff} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Photo & Avatar Section */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "var(--canvas)", borderRadius: 8, border: "1px solid var(--line)", opacity: isReadOnly ? 0.8 : 1 }}>
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: "50%",
                    background: currentForm.avatarUrl ? `url(${currentForm.avatarUrl}) center/cover no-repeat` : "var(--gradient-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: 800,
                    fontSize: 16,
                    flexShrink: 0,
                    overflow: "hidden",
                  }}
                >
                  {!currentForm.avatarUrl && (currentForm.fullName || "AD").slice(0, 2).toUpperCase()}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      disabled={isReadOnly}
                      onChange={(e) => handleFileUpload(e.target.files?.[0])}
                      style={{ display: "none" }}
                    />
                    <button
                      type="button"
                      disabled={isReadOnly}
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        padding: "4px 10px",
                        borderRadius: 6,
                        border: "1px solid var(--line-strong)",
                        background: isReadOnly ? "var(--canvas)" : "var(--surface)",
                        fontSize: 11.5,
                        fontWeight: 600,
                        cursor: isReadOnly ? "not-allowed" : "pointer",
                        color: isReadOnly ? "var(--muted)" : "var(--ink)",
                      }}
                    >
                      Upload Photo
                    </button>
                    {currentForm.avatarUrl && !isReadOnly && (
                      <button
                        type="button"
                        onClick={() => setFormKey("avatarUrl", "")}
                        style={{ border: "none", background: "none", color: "var(--status-error)", fontSize: 11, cursor: "pointer", textDecoration: "underline" }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {/* Preset Avatars */}
                  {!isReadOnly && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                      <span style={{ fontSize: 10.5, color: "var(--muted)" }}>Presets:</span>
                      {PRESET_AVATARS.map((url, i) => (
                        <div
                          key={i}
                          onClick={() => setFormKey("avatarUrl", url)}
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            background: `url(${url}) center/cover no-repeat`,
                            cursor: "pointer",
                            border: currentForm.avatarUrl === url ? "2px solid var(--primary)" : "1px solid transparent",
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Personal Details */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }} className="responsive-grid-2">
                <div style={{ gridColumn: "1 / -1" }}>
                  <FormField
                    label="Full Name"
                    required
                    disabled={isReadOnly}
                    icon="fa-solid fa-user"
                    value={currentForm.fullName}
                    onChange={(val) => setFormKey("fullName", val)}
                    placeholder={activeRole === "admin" ? "e.g. Manoj Kumar" : "e.g. Ramesh Singh"}
                    compact
                    marginBottom={10}
                  />
                </div>

                <FormField
                  label="Contact Phone (Login ID)"
                  required={!isAssigned}
                  disabled={isReadOnly}
                  icon="fa-solid fa-phone"
                  value={currentForm.phone}
                  onChange={(val) => setFormKey("phone", val)}
                  placeholder="e.g. 9876543210"
                  compact
                  marginBottom={10}
                />

                <FormField
                  label="Email Address"
                  type="email"
                  required={!isAssigned}
                  disabled={isReadOnly}
                  icon="fa-solid fa-envelope"
                  value={currentForm.email}
                  onChange={(val) => setFormKey("email", val)}
                  placeholder={activeRole === "admin" ? "e.g. manoj@kusumganga.com" : "e.g. ramesh@kusumganga.com"}
                  compact
                  marginBottom={10}
                />

                {/* Password Input */}
                <div style={{ gridColumn: "1 / -1", marginBottom: 10 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)", display: "block", marginBottom: 4 }}>
                    {!isAssigned ? "Login Password" : "Set New Password (Optional)"}
                    {!isAssigned && <span style={{ color: "var(--status-error)" }}> *</span>}
                  </label>

                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      disabled={isReadOnly}
                      readOnly={isReadOnly}
                      value={currentForm.password}
                      onChange={isReadOnly ? undefined : (e) => setFormKey("password", e.target.value)}
                      placeholder={
                        isReadOnly
                          ? "•••••••• (Password is protected)"
                          : !isAssigned
                          ? "Enter login password (at least 6 characters)"
                          : "Leave blank to keep existing password"
                      }
                      style={{
                        width: "100%",
                        padding: "8px 36px 8px 12px",
                        borderRadius: 8,
                        border: "1px solid var(--line-strong)",
                        background: isReadOnly ? "var(--canvas)" : "var(--surface)",
                        fontSize: 13,
                        color: isReadOnly ? "var(--muted)" : "var(--ink)",
                        cursor: isReadOnly ? "not-allowed" : "text",
                        pointerEvents: isReadOnly ? "none" : "auto",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
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
                      <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`} />
                    </button>
                  </div>
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <FormField
                    label="Residential / Office Address"
                    type="textarea"
                    disabled={isReadOnly}
                    icon="fa-solid fa-location-dot"
                    value={currentForm.address}
                    onChange={(val) => setFormKey("address", val)}
                    placeholder="e.g. Village Betiyahata, Block Sadar, Gorakhpur, UP"
                    compact
                    marginBottom={10}
                  />
                </div>
              </div>

              {/* Conditional Action Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 10, borderTop: "1px solid var(--line)" }}>
                {isReadOnly ? (
                  /* Read Only Mode: Show Edit Button */
                  <Button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    style={{
                      padding: "8px 20px",
                      fontSize: 12.5,
                      fontWeight: 700,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <i className="fa-solid fa-pen-to-square" /> Edit Details
                  </Button>
                ) : isAssigned ? (
                  /* Editable Mode for Existing Staff: Show Cancel & Save Changes */
                  <>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setIsEditing(false);
                        resetFormFromWarehouse(activeRole, selectedWarehouse);
                      }}
                      style={{ padding: "8px 16px", fontSize: 12.5 }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving} className="btn-glow" style={{ padding: "8px 22px", fontSize: 12.5, fontWeight: 700 }}>
                      {saving ? "Saving…" : "Save Changes"}
                    </Button>
                  </>
                ) : (
                  /* Creating New Staff: Show Create & Assign */
                  <Button type="submit" disabled={saving} className="btn-glow" style={{ padding: "8px 22px", fontSize: 12.5, fontWeight: 700 }}>
                    {saving ? "Creating…" : `Create & Assign ${activeRole === "admin" ? "Warehouse Admin" : "Supervisor"}`}
                  </Button>
                )}
              </div>
            </form>
          </div>

          {/* COLUMN 2: LIVE INSTANT CARD VIEW */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--line)",
                borderRadius: 14,
                padding: "20px",
                boxShadow: "var(--shadow-sm)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Header Gradient */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 54,
                  background: activeRole === "admin"
                    ? "linear-gradient(135deg, #051F17 0%, #07281D 50%, #00B86B 100%)"
                    : "linear-gradient(135deg, #082F49 0%, #0369A1 50%, #38BDF8 100%)",
                }}
              />

              {/* Live Avatar Preview */}
              <div style={{ position: "relative", marginTop: 14, marginBottom: 10 }}>
                <div
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: "50%",
                    background: currentForm.avatarUrl ? `url(${currentForm.avatarUrl}) center/cover no-repeat` : "var(--gradient-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: 800,
                    fontSize: 26,
                    boxShadow: "0 4px 14px rgba(0, 184, 107, 0.3)",
                    border: "3px solid var(--surface)",
                    overflow: "hidden",
                  }}
                >
                  {!currentForm.avatarUrl && (currentForm.fullName || "AD").slice(0, 2).toUpperCase()}
                </div>
                <span
                  style={{
                    position: "absolute",
                    bottom: 2,
                    right: 2,
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: isAssigned ? "#10B981" : "#D97706",
                    border: "2px solid var(--surface)",
                    boxShadow: isAssigned ? "0 0 6px #10B981" : "0 0 6px #D97706",
                  }}
                />
              </div>

              <h4 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 800, color: "var(--ink)" }}>
                {displayName}
              </h4>
              <div style={{ marginBottom: 12 }}>
                <Badge tone={activeRole === "admin" ? "success" : "info"}>
                  {displayRole}
                </Badge>
              </div>

              {/* Live Instant Details Box */}
              <div
                style={{
                  width: "100%",
                  background: "var(--canvas)",
                  border: "1px solid var(--line)",
                  borderRadius: 10,
                  padding: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  textAlign: "left",
                  fontSize: 12,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--muted)" }}>Hub:</span>
                  <span style={{ fontWeight: 700, color: "var(--ink)", maxWidth: 170, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {selectedWarehouse.name}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--muted)" }}>Status:</span>
                  <span style={{ fontWeight: 700, color: "var(--primary-deep)", textTransform: "capitalize" }}>
                    {activeRole === "admin" ? "Admin" : "Supervisor"}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--muted)" }}>Phone:</span>
                  <span style={{ fontWeight: 600, color: "var(--ink)" }}>{currentForm.phone || "—"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--muted)" }}>Email:</span>
                  <span style={{ fontWeight: 600, color: "var(--ink)", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {currentForm.email || "—"}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--muted)" }}>Password:</span>
                  <span style={{ fontWeight: 700, color: "var(--primary-deep)", fontFamily: "monospace" }}>
                    {currentForm.password ? (showPassword ? currentForm.password : "••••••••") : isAssigned ? "Saved on file" : "—"}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--muted)" }}>Address:</span>
                  <span style={{ fontWeight: 500, color: "var(--ink-secondary)", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {currentForm.address || "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warehouse Overview Table */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: 12,
          padding: "16px 20px",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <h4 style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: "var(--ink)" }}>
            <i className="fa-solid fa-table-list" style={{ color: "var(--primary)", marginRight: 8 }} />
            All Warehouses & Assigned Staff
          </h4>
          <span style={{ fontSize: 11.5, color: "var(--muted)" }}>{warehouses.length} Total Warehouses</span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--line)", background: "var(--canvas)" }}>
                <th style={{ padding: "10px 12px", fontWeight: 700, color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>Warehouse Hub</th>
                <th style={{ padding: "10px 12px", fontWeight: 700, color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>Assigned Admin</th>
                <th style={{ padding: "10px 12px", fontWeight: 700, color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>Assigned Supervisor</th>
                <th style={{ padding: "10px 12px", fontWeight: 700, color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "10px 12px", fontWeight: 700, color: "var(--muted)", fontSize: 11, textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {warehouses.map((w) => {
                const isSelected = w.id === selectedHubId;
                return (
                  <tr
                    key={w.id}
                    style={{
                      borderBottom: "1px solid var(--line)",
                      background: isSelected ? "rgba(0,184,107,0.04)" : "transparent",
                    }}
                  >
                    <td style={{ padding: "12px" }}>
                      <strong style={{ color: "var(--ink)", display: "block" }}>{w.name}</strong>
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>{w.code} &bull; {w.commodity}</span>
                    </td>
                    <td style={{ padding: "12px" }}>
                      {w.admin ? (
                        <div>
                          <strong style={{ color: "var(--ink)" }}>{w.admin}</strong>
                          <span style={{ display: "block", fontSize: 11, color: "var(--muted)" }}>📞 {w.adminPhone || "—"}</span>
                        </div>
                      ) : (
                        <span style={{ color: "var(--status-error)", fontSize: 11.5, fontWeight: 600 }}>● Unassigned</span>
                      )}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {w.supervisor ? (
                        <div>
                          <strong style={{ color: "var(--ink)" }}>{w.supervisor}</strong>
                          <span style={{ display: "block", fontSize: 11, color: "var(--muted)" }}>📞 {w.supervisorPhone || "—"}</span>
                        </div>
                      ) : (
                        <span style={{ color: "#D97706", fontSize: 11.5, fontWeight: 600 }}>● Unassigned</span>
                      )}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <Badge tone={w.status === "inactive" ? "error" : "success"}>
                        {w.status === "inactive" ? "INACTIVE" : "ACTIVE"}
                      </Badge>
                    </td>
                    <td style={{ padding: "12px", textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                        <Button
                          variant={isSelected && activeRole === "admin" ? "primary" : "secondary"}
                          onClick={() => handleSelectFromTable(w, "admin")}
                          style={{ padding: "4px 10px", fontSize: 11.5, display: "inline-flex", alignItems: "center", gap: 4 }}
                        >
                          <i className="fa-solid fa-user-shield" /> Manage Admin
                        </Button>
                        <Button
                          variant={isSelected && activeRole === "supervisor" ? "primary" : "secondary"}
                          onClick={() => handleSelectFromTable(w, "supervisor")}
                          style={{ padding: "4px 10px", fontSize: 11.5, display: "inline-flex", alignItems: "center", gap: 4 }}
                        >
                          <i className="fa-solid fa-user-gear" /> Manage Supervisor
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
