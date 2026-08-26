import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import FormField from "../components/common/FormField";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import AsyncState from "../components/common/AsyncState";
import { useWarehouses } from "../features/warehouses/useWarehouses";
import { toast } from "../utils/toast";

function RoleCard({ roleLabel, name, phone, email, avatarUrl, address, icon, gradient = false }) {
  if (!name) {
    return (
      <div
        style={{
          border: "1px dashed var(--line-strong)",
          borderRadius: 12,
          padding: "16px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          background: "var(--canvas)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <i className={`fa-solid ${icon}`} style={{ color: "var(--muted)", fontSize: 13 }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.4 }}>
              {roleLabel}
            </span>
          </div>
          <Badge tone="warning">UNASSIGNED</Badge>
        </div>
        <p style={{ margin: 0, fontSize: 12, color: "var(--ink-secondary)" }}>
          No {roleLabel.toLowerCase()} assigned to this warehouse hub yet.
        </p>
        <Link
          to="/warehouses/admin-management"
          style={{ fontSize: 12, fontWeight: 600, color: "var(--primary-deep)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
        >
          Assign Personnel <i className="ri-arrow-right-line" style={{ fontSize: 10 }} />
        </Link>
      </div>
    );
  }

  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div
      style={{
        border: "1px solid var(--line)",
        borderRadius: 12,
        padding: "16px 18px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        background: "var(--surface)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: "50%",
          flexShrink: 0,
          background: avatarUrl ? `url(${avatarUrl}) center/cover no-repeat` : (gradient ? "var(--gradient-primary)" : "var(--primary-tint)"),
          color: gradient ? "white" : "var(--primary-deep)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: 15,
          boxShadow: avatarUrl || gradient ? "0 3px 8px rgba(0, 184, 107, 0.25)" : "none",
          border: avatarUrl ? "2px solid var(--surface)" : "none",
          overflow: "hidden",
        }}
      >
        {!avatarUrl && initials}
      </div>
      <div style={{ minWidth: 0, flexGrow: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <i className={`fa-solid ${icon}`} style={{ color: "var(--primary)", fontSize: 11 }} />
          <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.4 }}>
            {roleLabel}
          </span>
        </div>
        <h4 style={{ margin: "2px 0 0", fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>{name}</h4>
        <div style={{ marginTop: 4, display: "flex", flexWrap: "wrap", gap: "4px 12px", fontSize: 11.5, color: "var(--ink-secondary)" }}>
          <span><i className="ri-phone-line" style={{ fontSize: 10, color: "var(--muted)" }} /> {phone || "—"}</span>
          <span><i className="ri-mail-line" style={{ fontSize: 10, color: "var(--muted)" }} /> {email || "—"}</span>
          {address && (
            <span style={{ width: "100%", color: "var(--muted)", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}>
              <i className="ri-map-pin-line" style={{ fontSize: 10, color: "var(--primary)" }} /> {address}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WarehouseDetail() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { warehouses, status, error, updateWarehouse, removeWarehouse } = useWarehouses();

  const requestedId = searchParams.get("id");
  const warehouse = warehouses.find((w) => w.id === requestedId) ?? warehouses[0];

  // Edit Modal State
  const [editingModalOpen, setEditingModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete Confirmation Modal State
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function handleSelect(id) {
    setSearchParams(id ? { id } : {});
  }

  const openEditModal = () => {
    if (!warehouse) return;
    setEditForm({
      name: warehouse.name || "",
      companyName: warehouse.companyName || "Kusumganga Agro Solutions Pvt. Ltd.",
      commodity: warehouse.commodity || "Paddy Straw (Parali)",
      address: warehouse.address || "",
      gstin: warehouse.gstin || "09AALCK4355J1Z2",
      pan: warehouse.pan || "AALCK4355J",
      contactPerson: warehouse.contactPerson || "Mr. Jagdeep Singh",
      contactPhone: warehouse.contactPhone || "7055000315",
      email: warehouse.email || "kusumganga5@gmail.com",
      helpDeskPhone: warehouse.helpDeskPhone || "7905525983",
      status: warehouse.status === "Active" ? "active" : "inactive",
    });
    setEditingModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const targetId = warehouse?.id || warehouse?._id;
    if (!targetId) {
      toast.error("Invalid warehouse target ID.");
      return;
    }
    setSavingEdit(true);
    try {
      await updateWarehouse(targetId, editForm);
      toast.success(`Warehouse "${editForm.name}" updated successfully.`);
      setEditingModalOpen(false);
    } catch (err) {
      toast.error(err?.message || "Failed to update warehouse.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    const targetId = warehouse?.id || warehouse?._id;
    if (!targetId) return;
    setDeleting(true);
    try {
      await removeWarehouse(targetId);
      toast.success(`Warehouse "${warehouse.name}" deleted successfully.`);
      setConfirmDeleteOpen(false);
      navigate("/warehouses");
    } catch (err) {
      toast.error(err?.message || "Could not delete warehouse.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <PageHeader
        title="Warehouse Detail"
        subtitle="Deep-dive into a single warehouse's roles, stock and status"
      />

      <AsyncState status={status} error={error} loadingLabel="Loading warehouse profile…" />

      {!warehouse && status === "succeeded" && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: 24, textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}>
            No warehouse found. Add a warehouse first to view details.
          </p>
        </div>
      )}

      {warehouse && (
        <>
          {/* HEADER HERO CARD */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: 14,
              padding: "18px 20px",
              boxShadow: "var(--shadow-sm)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Top Accent Gradient Bar */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: "linear-gradient(90deg, #059669 0%, #10B981 100%)",
              }}
            />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    flexShrink: 0,
                    background: "var(--gradient-primary)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    boxShadow: "0 4px 12px rgba(0, 184, 107, 0.3)",
                  }}
                >
                  <i className="ri-building-line" />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {warehouse.name}
                    </h2>
                    <Badge tone={warehouse.status === "Active" ? "success" : "warning"}>
                      {warehouse.status ? warehouse.status.toUpperCase() : "ACTIVE"}
                    </Badge>
                  </div>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--muted)", fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
                    <span><i className="ri-barcode-line" style={{ fontSize: 10 }} /> Code: <strong>{warehouse.code || "WH-MAIN"}</strong></span>
                    <span>•</span>
                    <span><i className="ri-plant-line" style={{ fontSize: 10, color: "var(--primary)" }} /> Commodity: <strong>{warehouse.commodity}</strong></span>
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginLeft: "auto" }}>
                <div style={{ minWidth: 200 }}>
                  <FormField
                    label="Switch Warehouse"
                    type="select"
                    value={warehouse.id}
                    onChange={handleSelect}
                    options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
                    compact
                    marginBottom={0}
                  />
                </div>

                <Button
                  type="button"
                  onClick={openEditModal}
                  style={{
                    padding: "6px 12px",
                    fontSize: 12,
                    fontWeight: 700,
                    background: "rgba(27, 94, 58, 0.12)",
                    color: "#0D3823",
                    border: "1px solid rgba(27, 94, 58, 0.3)",
                    marginTop: 18,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    cursor: "pointer",
                  }}
                >
                  <i className="ri-edit-line" /> Edit
                </Button>

                <Button
                  type="button"
                  onClick={() => setConfirmDeleteOpen(true)}
                  style={{
                    padding: "6px 12px",
                    fontSize: 12,
                    fontWeight: 700,
                    background: "rgba(225, 29, 72, 0.1)",
                    color: "#e11d48",
                    border: "1px solid rgba(225, 29, 72, 0.3)",
                    marginTop: 18,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    cursor: "pointer",
                  }}
                >
                  <i className="ri-delete-bin-line" /> Delete
                </Button>
              </div>
            </div>
          </div>

          {/* OFFICIAL COMPANY CREDENTIALS & CONTACT CARD */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: 14,
              padding: "18px 20px",
              boxShadow: "var(--shadow-sm)",
              marginTop: 14,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, paddingBottom: 8, borderBottom: "1px solid var(--line)" }}>
              <i className="ri-building-line-flag" style={{ color: "var(--primary)", fontSize: 14 }} />
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>
                Official Registration & Contact Credentials
              </h3>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }} className="responsive-grid-2">
              {/* Company & GSTIN */}
              <div style={{ border: "1px solid var(--line)", borderRadius: 10, padding: "12px 14px", background: "var(--canvas)" }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.4, display: "block" }}>
                  Legal Company Name
                </span>
                <p style={{ margin: "2px 0 6px", fontSize: 13, fontWeight: 800, color: "#0D3823" }}>
                  {warehouse.companyName || "Kusumganga Agro Solutions Pvt. Ltd."}
                </p>
                <div style={{ fontSize: 11.5, color: "var(--ink)", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                  <i className="ri-file-line-invoice" style={{ color: "var(--primary)" }} />
                  GSTIN: {warehouse.gstin || "09AALCK4355J1Z2"}
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>
                  PAN NO: {warehouse.pan || "AALCK4355J"}
                </div>
              </div>

              {/* Primary Contact Person */}
              <div style={{ border: "1px solid var(--line)", borderRadius: 10, padding: "12px 14px", background: "var(--canvas)" }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.4, display: "block" }}>
                  Primary Contact Person
                </span>
                <p style={{ margin: "2px 0 6px", fontSize: 13, fontWeight: 800, color: "var(--ink)" }}>
                  <i className="ri-user-3-line-tie" style={{ color: "#059669", marginRight: 6 }} />
                  {warehouse.contactPerson || "Mr. Jagdeep Singh"}
                </p>
                <div style={{ fontSize: 11.5, color: "var(--ink-secondary)", display: "flex", alignItems: "center", gap: 6 }}>
                  <i className="ri-phone-line" style={{ color: "var(--primary)", fontSize: 10 }} />
                  {warehouse.contactPhone || "7055000315"}
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                  <i className="ri-mail-line" style={{ color: "var(--primary)", fontSize: 9.5 }} />
                  {warehouse.email || "kusumganga5@gmail.com"}
                </div>
              </div>

              {/* Help Desk & Address */}
              <div style={{ border: "1px solid var(--line)", borderRadius: 10, padding: "12px 14px", background: "var(--canvas)" }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.4, display: "block" }}>
                  Help Desk & Location Address
                </span>
                <p style={{ margin: "2px 0 6px", fontSize: 12.5, fontWeight: 800, color: "#1B5E3A", display: "flex", alignItems: "center", gap: 6 }}>
                  <i className="ri-customer-service-2-line" style={{ color: "var(--primary)" }} />
                  Help Desk: {warehouse.helpDeskPhone || "7905525983"}
                </p>
                <div style={{ fontSize: 11, color: "var(--ink-secondary)", display: "flex", alignItems: "flex-start", gap: 6, lineHeight: 1.35 }}>
                  <i className="ri-map-pin-line" style={{ color: "var(--primary)", marginTop: 2 }} />
                  <span>{warehouse.address || "24-A, Sai Complex Betiyahata, Gorakhpur Uttar Pradesh, 273001"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* COMPACT STAT METRICS TILES */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }} className="responsive-grid-2">
            <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: "var(--primary-tint)", color: "var(--primary-deep)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                <i className="ri-plant-line" />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>Commodity</p>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginTop: 2 }}>{warehouse.commodity}</div>
              </div>
            </div>

            <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: "var(--primary-tint)", color: "var(--primary-deep)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                <i className="ri-group-line" />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>Enrolled Staff</p>
                <div style={{ fontSize: 15, fontWeight: 800, color: "var(--ink)", marginTop: 2 }}>{warehouse.staff || 0} Members</div>
              </div>
            </div>

            <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: "#D1FAE5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                <i className="ri-stack-line" />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>Current Stock</p>
                <div style={{ fontSize: 15, fontWeight: 800, color: "var(--ink)", marginTop: 2 }}>{warehouse.stock || "0 kg"}</div>
              </div>
            </div>

            <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: "var(--primary-tint)", color: "var(--primary-deep)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                <i className="ri-checkbox-circle-fill" />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>Operating Status</p>
                <div style={{ marginTop: 2 }}>
                  <Badge tone={warehouse.status === "Active" ? "success" : "warning"}>
                    {warehouse.status ? warehouse.status.toUpperCase() : "ACTIVE"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* MANAGEMENT TEAM SECTION */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: 14,
              padding: "18px 20px",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, paddingBottom: 8, borderBottom: "1px solid var(--line)" }}>
              <i className="ri-group-line-gear" style={{ color: "var(--primary)", fontSize: 14 }} />
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>Management Personnel</h3>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="responsive-grid-2">
              <RoleCard
                roleLabel="Warehouse Admin"
                name={warehouse.admin}
                phone={warehouse.adminPhone}
                email={warehouse.adminEmail}
                avatarUrl={warehouse.adminAvatarUrl}
                address={warehouse.adminAddress}
                icon="fa-user-shield"
                gradient
              />
              <RoleCard
                roleLabel="Warehouse Supervisor"
                name={warehouse.supervisor}
                phone={warehouse.supervisorPhone}
                email={warehouse.supervisorEmail}
                avatarUrl={warehouse.supervisorAvatarUrl}
                address={warehouse.supervisorAddress}
                icon="fa-user-gear"
              />
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12.5, paddingTop: 4 }}>
            <Link
              to="/warehouses"
              style={{ color: "var(--ink-secondary)", fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <i className="ri-arrow-left-line-long" /> Back to All Warehouses
            </Link>
            <Link
              to="/warehouses/admin-management"
              style={{ color: "var(--primary-deep)", fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              Manage Personnel <i className="ri-arrow-right-line-long" />
            </Link>
          </div>
          {/* EDIT WAREHOUSE MODAL */}
          {editingModalOpen && (
            <Modal
              isOpen={true}
              onClose={() => setEditingModalOpen(false)}
              title="Edit Warehouse Details"
            >
              <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
                  <FormField
                    label="Company Name"
                    value={editForm.companyName}
                    onChange={(val) => setEditForm((f) => ({ ...f, companyName: val }))}
                    compact
                  />
                  <FormField
                    label="Warehouse Hub Name"
                    required
                    value={editForm.name}
                    onChange={(val) => setEditForm((f) => ({ ...f, name: val }))}
                    compact
                  />

                  {/* Multi-Select Commodity Checkboxes Grid */}
                  <div style={{ gridColumn: "1 / -1", margin: "6px 0 12px", background: "var(--canvas)", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--line)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
                      <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 700, color: "#0D3823", margin: 0 }}>
                        <i className="ri-plant-line" style={{ color: "var(--primary)" }} />
                        Handled Commodities (Check Multiple Boxes) *
                      </label>
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: "#0D3823", background: "rgba(27, 94, 58, 0.12)", border: "1px solid rgba(27, 94, 58, 0.25)", padding: "2px 8px", borderRadius: 12 }}>
                        Selected ({editForm.commodity ? editForm.commodity.split(", ").length : 0}): {editForm.commodity || "None Selected"}
                      </span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                      {[
                        "Paddy Straw (Parali)",
                        "Wheat Straw",
                        "Maize Stalk",
                        "Mustard Husk",
                        "Sugarcane Bagasse",
                        "Multi-Crop Biomass",
                      ].map((opt) => {
                        const currentSelected = editForm.commodity ? editForm.commodity.split(", ").map((s) => s.trim()) : [];
                        const isChecked = currentSelected.includes(opt);

                        const toggleItem = (targetOpt) => {
                          let nextSelected;
                          if (currentSelected.includes(targetOpt)) {
                            nextSelected = currentSelected.filter((item) => item !== targetOpt);
                          } else {
                            nextSelected = [...currentSelected, targetOpt];
                          }
                          setEditForm((f) => ({ ...f, commodity: nextSelected.join(", ") }));
                        };

                        return (
                          <div
                            key={opt}
                            onClick={() => toggleItem(opt)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              padding: "7px 10px",
                              borderRadius: 6,
                              border: isChecked ? "2px solid #1B5E3A" : "1px solid var(--line-strong)",
                              background: isChecked ? "rgba(27, 94, 58, 0.14)" : "var(--surface)",
                              color: isChecked ? "#0D3823" : "var(--ink)",
                              fontWeight: isChecked ? 700 : 500,
                              fontSize: 11.5,
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                              userSelect: "none",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleItem(opt)}
                              onClick={(e) => e.stopPropagation()}
                              style={{ accentColor: "#1B5E3A", cursor: "pointer", width: 16, height: 16, flexShrink: 0 }}
                            />
                            <span style={{ lineHeight: 1.2 }}>{opt}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <FormField
                    label="GSTIN / Unique ID"
                    value={editForm.gstin}
                    onChange={(val) => setEditForm((f) => ({ ...f, gstin: val }))}
                    compact
                  />
                  <FormField
                    label="PAN NO"
                    value={editForm.pan}
                    onChange={(val) => setEditForm((f) => ({ ...f, pan: val }))}
                    compact
                  />
                  <FormField
                    label="Contact Person"
                    value={editForm.contactPerson}
                    onChange={(val) => setEditForm((f) => ({ ...f, contactPerson: val }))}
                    compact
                  />
                  <FormField
                    label="Contact Phone"
                    value={editForm.contactPhone}
                    onChange={(val) => setEditForm((f) => ({ ...f, contactPhone: val }))}
                    compact
                  />
                  <FormField
                    label="Official Mail ID"
                    value={editForm.email}
                    onChange={(val) => setEditForm((f) => ({ ...f, email: val }))}
                    compact
                  />
                  <FormField
                    label="Help Desk Number"
                    value={editForm.helpDeskPhone}
                    onChange={(val) => setEditForm((f) => ({ ...f, helpDeskPhone: val }))}
                    compact
                  />
                  <FormField
                    label="Address"
                    value={editForm.address}
                    onChange={(val) => setEditForm((f) => ({ ...f, address: val }))}
                    compact
                  />
                  <FormField
                    label="Status"
                    type="select"
                    value={editForm.status}
                    onChange={(val) => setEditForm((f) => ({ ...f, status: val }))}
                    options={[
                      { value: "active", label: "Active" },
                      { value: "inactive", label: "Inactive" },
                    ]}
                    compact
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
                  <Button type="button" variant="outline" onClick={() => setEditingModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={savingEdit}>
                    {savingEdit ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Modal>
          )}

          {/* DELETE CONFIRMATION MODAL */}
          <ConfirmDialog
            open={confirmDeleteOpen}
            onClose={() => setConfirmDeleteOpen(false)}
            onConfirm={handleDelete}
            title="Delete Warehouse?"
            message={
              <><strong style={{ display: 'block' }}>Warning: Permanent Deletion / Deactivation</strong>Are you sure you want to delete <strong>\u201C{warehouse?.name}\u201D</strong>? Assigned personnel will be unlinked.</>
            }
            confirmLabel="Yes, Delete Warehouse"
            loading={deleting}
            variant="danger"
          />
        </>
      )}
    </div>
  );
}
