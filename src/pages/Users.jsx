import { useState } from "react";
import { Check, X, Calendar, Warehouse, Phone, Mail, UserPlus, Shield, Clock, CheckCircle, Users as UsersIcon, Lock, User, Settings, UserX, UserCheck } from "lucide-react";

function LucideIconWrapper({ children, size = 16 }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: size, height: size, flexShrink: 0 }}>
      {children}
    </span>
  );
}
import { Link } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import DataTable from "../components/common/DataTable";
import Badge from "../components/common/Badge";
import Avatar from "../components/common/Avatar";
import Modal from "../components/common/Modal";
import FormField from "../components/common/FormField";
import Button from "../components/common/Button";
import AsyncState from "../components/common/AsyncState";
import PhotoPicker from "../components/common/PhotoPicker";
import { useDisclosure } from "../hooks/useDisclosure";
import { useAuth } from "../hooks/useAuth";
import { useProfiles } from "../features/profiles/useProfiles";
import { createUserSchema } from "../validators/profileValidators";
import { validateOrToast } from "../utils/validate";
import { toast } from "../utils/toast";

function getPasswordStrength(pw) {
  if (!pw) return { level: 0, label: "", color: "transparent" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { level: 1, label: "Weak", color: "#EF4444" };
  if (score <= 3) return { level: 2, label: "Medium", color: "#F59E0B" };
  return { level: 3, label: "Strong", color: "#10B981" };
}

function emptyForm(defaultRole) {
  return { role: defaultRole, fullName: "", phone: "", email: "", password: "", confirmPassword: "", avatarUrl: "" };
}

const STATUS_TONE = { active: "success", pending: "warning", inactive: "error" };

function nameCell(person, index) {
  const initials = person.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ position: "relative" }}>
        {person.avatarUrl ? (
          <img src={person.avatarUrl} alt={person.name} style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
        ) : (
          <Avatar initials={initials} index={index} />
        )}
        <span
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: person.status === "active" ? "#10B981" : person.status === "pending" ? "#F59E0B" : "#EF4444",
            border: "1.5px solid var(--surface)",
          }}
        />
      </div>
      <span style={{ fontWeight: 700, color: "var(--ink)" }}>{person.name}</span>
    </div>
  );
}

export default function Users() {
  const { user } = useAuth();
  // A Warehouse Admin can only ever create/see a Supervisor for their own
  // warehouse (enforced server-side too - see backend/src/services/profile.service.js);
  // the Super Admin gets the full org-wide directory and can create either role.
  const isWarehouseAdmin = user?.roleKey === "warehouse_admin";

  const { profiles, status, error, createProfile, approveProfile, updateProfileStatus } = useProfiles();
  const { isOpen: open, open: openModal, close: closeModal } = useDisclosure();
  const [form, setForm] = useState(() => emptyForm(isWarehouseAdmin ? "Supervisor" : "Warehouse Admin"));
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [filterTab, setFilterTab] = useState("all"); // "all" | "active" | "pending"

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const activeCount = profiles.filter((p) => p.status === "active").length;
  const pendingCount = profiles.filter((p) => p.status === "pending").length;
  const adminCount = profiles.filter((p) => p.role?.includes("Admin")).length;

  const activePct = ((activeCount / (profiles.length || 1)) * 100).toFixed(0);
  const pendingPct = ((pendingCount / (profiles.length || 1)) * 100).toFixed(0);
  const adminPct = ((adminCount / (profiles.length || 1)) * 100).toFixed(0);

  const filteredProfiles = profiles.filter((p) => {
    if (filterTab === "active") return p.status === "active";
    if (filterTab === "pending") return p.status === "pending";
    if (filterTab === "admin") return p.role?.includes("Admin");
    return true;
  });

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    const { confirmPassword, ...schemaFields } = form;
    const parsed = validateOrToast(createUserSchema, schemaFields);
    if (!parsed) return;

    setSaving(true);
    try {
      const created = await createProfile(parsed);
      toast.success(`${created.name} was created and activated successfully.`);
      setForm(emptyForm(isWarehouseAdmin ? "Supervisor" : "Warehouse Admin"));
      closeModal();
    } catch (err) {
      toast.error(err?.message || "Could not create this user. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleApprove(profile) {
    setBusyId(profile.id);
    try {
      await approveProfile(profile.id);
      toast.success(`${profile.name} approved and activated.`);
    } catch (err) {
      toast.error(err?.message || "Could not approve this account.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleToggleStatus(profile) {
    const nextStatus = profile.status === "active" ? "inactive" : "active";
    setBusyId(profile.id);
    try {
      await updateProfileStatus(profile.id, nextStatus);
      toast.success(`${profile.name} is now ${nextStatus}.`);
    } catch (err) {
      toast.error(err?.message || "Could not update this account's status.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <PageHeader
        title={isWarehouseAdmin ? "Your Warehouse Team" : "All Users"}
        subtitle={isWarehouseAdmin ? "You and the Supervisor assigned to your warehouse" : "Warehouse Admins and Supervisors across the organisation"}
      />

      <AsyncState status={status} error={error} loadingLabel="Loading user directory…" />

      {/* HIGH-GLOW EXECUTIVE 4 STAT METRICS CARDS WITH INTERACTIVE FILTERING */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }} className="responsive-grid-2">
        
        {/* CARD 1: TOTAL ACCOUNTS */}
        <div
          onClick={() => setFilterTab("all")}
          style={{
            background: "var(--surface)",
            border: filterTab === "all" ? "2px solid var(--primary)" : "1px solid rgba(0,184,107,0.2)",
            borderRadius: 16,
            padding: "16px 18px",
            boxShadow: filterTab === "all" ? "0 12px 30px -4px rgba(0, 184, 107, 0.25)" : "0 6px 20px -2px rgba(0,0,0,0.04)",
            cursor: "pointer",
            position: "relative",
            overflow: "hidden",
            transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg, #059669 0%, #10B981 100%)", boxShadow: "0 2px 10px rgba(16, 185, 129, 0.5)" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.4 }}>
              Total Accounts
            </span>
            <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 7px", borderRadius: 10, background: "var(--primary-tint)", color: "var(--primary-deep)", border: "1px solid rgba(0,184,107,0.3)" }}>
              100% Total
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", textShadow: "0 2px 10px rgba(0,184,107,0.2)" }}>{profiles.length} Users</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Org-Wide Directory</div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--primary-tint)", color: "var(--primary-deep)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, border: "1px solid rgba(0,184,107,0.3)", boxShadow: "0 0 14px rgba(0,184,107,0.35)", flexShrink: 0 }}>
              <LucideIconWrapper size={16}><UsersIcon size={16} /></LucideIconWrapper>
            </div>
          </div>

          <div style={{ width: "100%", height: 4, background: "var(--line)", borderRadius: 2, marginTop: 12, overflow: "hidden" }}>
            <div style={{ width: "100%", height: "100%", background: "linear-gradient(90deg, #059669 0%, #10B981 100%)", borderRadius: 2, boxShadow: "0 0 8px rgba(16,185,129,0.8)" }} />
          </div>
        </div>

        {/* CARD 2: ACTIVE USERS */}
        <div
          onClick={() => setFilterTab("active")}
          style={{
            background: "var(--surface)",
            border: filterTab === "active" ? "2px solid #10B981" : "1px solid rgba(16,185,129,0.2)",
            borderRadius: 16,
            padding: "16px 18px",
            boxShadow: filterTab === "active" ? "0 12px 30px -4px rgba(16, 185, 129, 0.25)" : "0 6px 20px -2px rgba(0,0,0,0.04)",
            cursor: "pointer",
            position: "relative",
            overflow: "hidden",
            transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "#10B981", boxShadow: "0 2px 10px rgba(16, 185, 129, 0.5)" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.4 }}>
              Active Users
            </span>
            <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 7px", borderRadius: 10, background: "#D1FAE5", color: "#059669", border: "1px solid rgba(16,185,129,0.3)" }}>
              {activePct}% Active
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", textShadow: "0 2px 10px rgba(16,185,129,0.2)" }}>{activeCount}</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Enabled Accounts</div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "#D1FAE5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, border: "1px solid rgba(16,185,129,0.3)", boxShadow: "0 0 14px rgba(16,185,129,0.35)", flexShrink: 0 }}>
              <LucideIconWrapper size={16}><CheckCircle size={16} /></LucideIconWrapper>
            </div>
          </div>

          <div style={{ width: "100%", height: 4, background: "var(--line)", borderRadius: 2, marginTop: 12, overflow: "hidden" }}>
            <div style={{ width: `${activePct}%`, height: "100%", background: "#10B981", borderRadius: 2, boxShadow: "0 0 8px rgba(16,185,129,0.8)", transition: "width 0.4s ease" }} />
          </div>
        </div>

        {/* CARD 3: PENDING APPROVAL */}
        <div
          onClick={() => setFilterTab("pending")}
          style={{
            background: "var(--surface)",
            border: filterTab === "pending" ? "2px solid #F59E0B" : "1px solid rgba(245,158,11,0.2)",
            borderRadius: 16,
            padding: "16px 18px",
            boxShadow: filterTab === "pending" ? "0 12px 30px -4px rgba(245, 158, 11, 0.25)" : "0 6px 20px -2px rgba(0,0,0,0.04)",
            cursor: "pointer",
            position: "relative",
            overflow: "hidden",
            transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "#F59E0B", boxShadow: "0 2px 10px rgba(245, 158, 11, 0.5)" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.4 }}>
              Pending Approval
            </span>
            <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 7px", borderRadius: 10, background: "#FEF3C7", color: "#D97706", border: "1px solid rgba(245,158,11,0.3)" }}>
              {pendingPct}% Pending
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", textShadow: "0 2px 10px rgba(245,158,11,0.2)" }}>{pendingCount}</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Awaiting Action</div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "#FEF3C7", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, border: "1px solid rgba(245,158,11,0.3)", boxShadow: "0 0 14px rgba(245,158,11,0.35)", flexShrink: 0 }}>
              <LucideIconWrapper size={16}><Clock size={16} /></LucideIconWrapper>
            </div>
          </div>

          <div style={{ width: "100%", height: 4, background: "var(--line)", borderRadius: 2, marginTop: 12, overflow: "hidden" }}>
            <div style={{ width: `${pendingPct}%`, height: "100%", background: "#F59E0B", borderRadius: 2, boxShadow: "0 0 8px rgba(245,158,11,0.8)", transition: "width 0.4s ease" }} />
          </div>
        </div>

        {/* CARD 4: WAREHOUSE ADMINS */}
        <div
          onClick={() => setFilterTab("admin")}
          style={{
            background: "var(--surface)",
            border: filterTab === "admin" ? "2px solid #3B82F6" : "1px solid rgba(59,130,246,0.2)",
            borderRadius: 16,
            padding: "16px 18px",
            boxShadow: filterTab === "admin" ? "0 12px 30px -4px rgba(59, 130, 246, 0.25)" : "0 6px 20px -2px rgba(0,0,0,0.04)",
            cursor: "pointer",
            position: "relative",
            overflow: "hidden",
            transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg, #1D4ED8 0%, #3B82F6 100%)", boxShadow: "0 2px 10px rgba(59, 130, 246, 0.5)" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.4 }}>
              Warehouse Admins
            </span>
            <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 7px", borderRadius: 10, background: "#EFF6FF", color: "#2563EB", border: "1px solid rgba(59,130,246,0.3)" }}>
              {adminPct}% Admins
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", textShadow: "0 2px 10px rgba(59,130,246,0.2)" }}>{adminCount}</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Hub Managers</div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "#EFF6FF", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, border: "1px solid rgba(59,130,246,0.3)", boxShadow: "0 0 14px rgba(59,130,246,0.35)", flexShrink: 0 }}>
              <LucideIconWrapper size={16}><Shield size={16} /></LucideIconWrapper>
            </div>
          </div>

          <div style={{ width: "100%", height: 4, background: "var(--line)", borderRadius: 2, marginTop: 12, overflow: "hidden" }}>
            <div style={{ width: `${adminPct}%`, height: "100%", background: "#3B82F6", borderRadius: 2, boxShadow: "0 0 8px rgba(59,130,246,0.8)", transition: "width 0.4s ease" }} />
          </div>
        </div>

      </div>

      {/* FILTER TABS & DATATABLE */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
          <div className="role-picker-container" style={{ width: "auto", marginBottom: 0, background: "var(--surface)", border: "1px solid var(--line)", padding: 3, borderRadius: 10 }}>
            <button
              type="button"
              className={`role-picker-option ${filterTab === "all" ? "active" : ""}`}
              onClick={() => setFilterTab("all")}
              style={{ padding: "6px 14px", fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <LucideIconWrapper size={11}><UsersIcon size={11} /></LucideIconWrapper> All Users ({profiles.length})
            </button>
            <button
              type="button"
              className={`role-picker-option ${filterTab === "active" ? "active" : ""}`}
              onClick={() => setFilterTab("active")}
              style={{ padding: "6px 14px", fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <LucideIconWrapper size={11}><CheckCircle size={11} /></LucideIconWrapper> Active ({activeCount})
            </button>
            <button
              type="button"
              className={`role-picker-option ${filterTab === "pending" ? "active" : ""}`}
              onClick={() => setFilterTab("pending")}
              style={{ padding: "6px 14px", fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <LucideIconWrapper size={11}><Clock size={11} /></LucideIconWrapper> Pending ({pendingCount})
            </button>
            <button
              type="button"
              className={`role-picker-option ${filterTab === "admin" ? "active" : ""}`}
              onClick={() => setFilterTab("admin")}
              style={{ padding: "6px 14px", fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <LucideIconWrapper size={11}><Shield size={11} /></LucideIconWrapper> Admins ({adminCount})
            </button>
          </div>
        </div>

        <DataTable
          title={filterTab === "all" ? "User Accounts Directory" : `User Accounts (${filterTab.toUpperCase()})`}
          right={
            <Button
              className="btn-glow"
              onClick={() => openModal()}
              style={{
                padding: "7px 14px",
                fontSize: 12.5,
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "var(--gradient-primary)",
                boxShadow: "0 3px 10px rgba(0, 184, 107, 0.3)",
              }}
            >
              <LucideIconWrapper size={16}><UserPlus size={16} /></LucideIconWrapper> Create User
            </Button>
          }
          searchable
          searchPlaceholder="Search users by name, role, email, phone..."
          keyField="id"
          rows={filteredProfiles}
          emptyMessage="No matching user accounts found."
          columns={[
            {
              key: "name",
              label: "Name",
              emphasize: true,
              render: (p, idx) => nameCell(p, idx),
            },
            {
              key: "role",
              label: "Role",
              render: (p) => (
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 12,
                    color: p.role?.includes("Admin") ? "#1D4ED8" : "var(--primary-deep)",
                    background: p.role?.includes("Admin") ? "#EFF6FF" : "var(--primary-tint)",
                    border: `1px solid ${p.role?.includes("Admin") ? "rgba(59,130,246,0.3)" : "rgba(0,184,107,0.3)"}`,
                    padding: "3px 9px",
                    borderRadius: 12,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {p.role?.includes("Admin") ? <LucideIconWrapper size={11}><Shield size={11} /></LucideIconWrapper> : <LucideIconWrapper size={11}><Settings size={11} /></LucideIconWrapper>} {p.role}
                </span>
              ),
            },
            {
              key: "contact",
              label: "Contact Details",
              sortable: false,
              render: (p) => (
                <div style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: 11.5 }}>
                  {p.email && (
                    <a href={`mailto:${p.email}`} style={{ color: "var(--ink)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <LucideIconWrapper size={10}><Mail size={10} /></LucideIconWrapper>
                      {p.email}
                    </a>
                  )}
                  {p.phone && (
                    <a href={`tel:${p.phone}`} style={{ color: "var(--muted)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <LucideIconWrapper size={9}><Phone size={9} /></LucideIconWrapper>
                      {p.phone}
                    </a>
                  )}
                </div>
              ),
            },
            {
              key: "warehouse",
              label: "Assigned Warehouse",
              render: (p) =>
                p.warehouse ? (
                  <Link
                    to={`/warehouses/detail?id=${p.warehouseId}`}
                    style={{
                      color: "var(--primary-deep)",
                      background: "var(--primary-tint)",
                      border: "1px solid rgba(0,184,107,0.25)",
                      padding: "3px 8px",
                      borderRadius: 10,
                      fontWeight: 700,
                      fontSize: 11.5,
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <LucideIconWrapper size={10}><Warehouse size={10} /></LucideIconWrapper>
                    {p.warehouse}
                  </Link>
                ) : (
                  <span style={{ color: "var(--muted)", fontSize: 12 }}>Unassigned</span>
                ),
            },
            {
              key: "status",
              label: "Status",
              render: (p) => (
                <Badge tone={STATUS_TONE[p.status] || "warning"}>
                  {p.status ? p.status.toUpperCase() : "PENDING"}
                </Badge>
              ),
            },
            {
              key: "createdAt",
              label: "Joined",
              render: (p) => (
                <span style={{ fontSize: 11.5, color: "var(--muted)" }}>
                  <LucideIconWrapper size={10}><Calendar size={10} /></LucideIconWrapper>
                  {p.createdAt || "Recent"}
                </span>
              ),
            },
            {
              key: "actions",
              label: "Action",
              sortable: false,
              render: (p) => (
                <div style={{ display: "flex", gap: 6 }}>
                  {p.status === "pending" && (
                    <Button
                      variant="secondary"
                      disabled={busyId === p.id}
                      onClick={() => handleApprove(p)}
                      style={{ padding: "4px 10px", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4, background: "var(--primary-tint)", color: "var(--primary-deep)", borderColor: "var(--primary)" }}
                    >
                      <LucideIconWrapper size={16}><Check size={16} /></LucideIconWrapper> Approve
                    </Button>
                  )}
                  {p.status !== "pending" && (
                    <Button
                      variant="secondary"
                      disabled={busyId === p.id}
                      onClick={() => handleToggleStatus(p)}
                      style={{ padding: "4px 10px", fontSize: 11, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}
                    >
                      {p.status === "active" ? <LucideIconWrapper size={14}><UserX size={14} /></LucideIconWrapper> : <LucideIconWrapper size={14}><UserCheck size={14} /></LucideIconWrapper>}
                      {p.status === "active" ? "Deactivate" : "Activate"}
                    </Button>
                  )}
                </div>
              ),
            },
          ]}
        />
      </div>

      {/* CREATE USER MODAL */}
      <Modal
        open={open}
        title={isWarehouseAdmin ? "Add Supervisor" : "Create User Account"}
        subtitle={
          isWarehouseAdmin
            ? "Creates an active Supervisor account for your warehouse immediately"
            : "Creates an active Warehouse Admin or Supervisor account immediately"
        }
        onClose={() => closeModal()}
      >
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <PhotoPicker value={form.avatarUrl} onChange={set("avatarUrl")} name={form.fullName} />

          {isWarehouseAdmin ? (
            <div style={{ background: "var(--canvas)", border: "1px solid var(--line)", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "var(--ink-secondary)", marginBottom: 2 }}>
              Role: <strong>Supervisor</strong> - Warehouse Admins can only add a Supervisor to their own warehouse.
            </div>
          ) : (
            <FormField
              label="Role"
              type="select"
              required
              value={form.role}
              onChange={set("role")}
              options={["Warehouse Admin", "Supervisor"]}
              compact
              marginBottom={10}
            />
          )}
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }} className="responsive-grid-2">
            <FormField
              label="Phone Number"
              type="tel"
              icon={<LucideIconWrapper size={16}><Phone size={16} /></LucideIconWrapper>}
              value={form.phone}
              onChange={set("phone")}
              placeholder="98xxxxxxxx"
              compact
              marginBottom={10}
            />
            <FormField
              label="Email Address"
              type="email"
              icon={<LucideIconWrapper size={16}><Mail size={16} /></LucideIconWrapper>}
              value={form.email}
              onChange={set("email")}
              placeholder="you@company.com"
              compact
              marginBottom={10}
            />
          </div>
          <FormField
            label="Temporary Password"
            type="password"
            required
            icon={<LucideIconWrapper size={16}><Lock size={16} /></LucideIconWrapper>}
            value={form.password}
            onChange={set("password")}
            placeholder="At least 8 characters"
            compact
            marginBottom={4}
          />
          {/* Password strength bar */}
          {form.password && (() => {
            const s = getPasswordStrength(form.password);
            return (
              <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ flex: 1, height: 5, borderRadius: 3, background: "var(--line)", overflow: "hidden" }}>
                  <div style={{ width: `${(s.level / 3) * 100}%`, height: "100%", background: s.color, borderRadius: 3, transition: "width 0.3s ease" }} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: s.color, whiteSpace: "nowrap" }}>{s.label}</span>
              </div>
            );
          })()}
          <FormField
            label="Confirm Password"
            type="password"
            required
            icon={<LucideIconWrapper size={16}><Lock size={16} /></LucideIconWrapper>}
            value={form.confirmPassword}
            onChange={set("confirmPassword")}
            placeholder="Re-type the password"
            compact
            marginBottom={10}
            error={form.confirmPassword && form.password !== form.confirmPassword ? "Passwords do not match" : ""}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
            <Button variant="secondary" type="button" onClick={() => closeModal()} style={{ padding: "7px 14px", fontSize: 12.5 }}>
              <LucideIconWrapper size={16}><X size={16} /></LucideIconWrapper> Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="btn-glow"
              style={{
                padding: "7px 16px",
                fontSize: 12.5,
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "var(--gradient-primary)",
              }}
            >
              {saving ? (
                <>
                  <LucideIconWrapper size={14}><Loader size={14} /></LucideIconWrapper> Creating…
                </>
              ) : (
                <>
                  <LucideIconWrapper size={16}><Check size={16} /></LucideIconWrapper> Create User
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
