import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import DataTable from "../components/common/DataTable";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import FormField from "../components/common/FormField";
import Modal from "../components/common/Modal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import AsyncState from "../components/common/AsyncState";
import { useWarehouses } from "../features/warehouses/useWarehouses";
import { toast } from "../utils/toast";

export default function WarehousesAll() {
  const navigate = useNavigate();
  const { warehouses, status, error, updateWarehouse, removeWarehouse } = useWarehouses();

  // Edit Modal State
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete Confirmation Modal State
  const [deletingWarehouseId, setDeletingWarehouseId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const missingAdmin = warehouses.filter((w) => !w.admin);
  const missingSupervisor = warehouses.filter((w) => !w.supervisor);

  const openEditModal = (w) => {
    setEditingWarehouse(w);
    setEditForm({
      name: w.name || "",
      companyName: w.companyName || "Kusumganga Agro Solutions Pvt. Ltd.",
      commodity: w.commodity || "Maize / PRALLI",
      address: w.address || "",
      gstin: w.gstin || "09AALCK4355J1Z2",
      pan: w.pan || "AALCK4355J",
      contactPerson: w.contactPerson || "Mr. Jagdeep Singh",
      contactPhone: w.contactPhone || "7055000315",
      email: w.email || "kusumganga5@gmail.com",
      helpDeskPhone: w.helpDeskPhone || "7905525983",
      status: w.status === "Active" ? "active" : "inactive",
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const targetId = editingWarehouse?.id || editingWarehouse?._id;
    if (!targetId) {
      toast.error("Invalid warehouse target ID.");
      return;
    }
    setSavingEdit(true);
    try {
      await updateWarehouse(targetId, editForm);
      toast.success(`Warehouse "${editForm.name}" updated successfully.`);
      setEditingWarehouse(null);
    } catch (err) {
      toast.error(err?.message || "Failed to update warehouse.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingWarehouseId) return;
    setDeleting(true);
    try {
      await removeWarehouse(deletingWarehouseId);
      toast.success("Warehouse deleted / deactivated successfully.");
      setDeletingWarehouseId(null);
    } catch (err) {
      toast.error(err?.message || "Could not delete warehouse.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <PageHeader title="All Warehouses & Logistics Hubs" subtitle="Unified CRUD management for procurement centres, GSTIN, PAN, and contacts" />

      <AsyncState status={status} error={error} loadingLabel="Loading warehouses…" />

      {(missingAdmin.length > 0 || missingSupervisor.length > 0) && (
        <div style={{ background: "var(--primary-tint)", border: "1px solid var(--line)", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "var(--ink)", display: "flex", gap: 8, alignItems: "center" }}>
          <i className="fa-solid fa-triangle-exclamation" style={{ color: "var(--status-warning, #d97706)", fontSize: 14 }} />
          <div>
            {missingAdmin.length > 0 && (
              <span>{missingAdmin.length} warehouse(s) have no Warehouse Admin assigned. </span>
            )}
            {missingSupervisor.length > 0 && (
              <span>{missingSupervisor.length} warehouse(s) have no Warehouse Supervisor assigned.</span>
            )}
          </div>
        </div>
      )}

      <DataTable
        title="All Warehouses (Complete Directory)"
        searchable
        searchPlaceholder="Search warehouse name, GSTIN, PAN, contact, city..."
        keyField="id"
        rows={warehouses}
        emptyMessage="No warehouses found."
        columns={[
          {
            key: "name",
            label: "Warehouse / Hub",
            emphasize: true,
            render: (r) => (
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontWeight: 700, color: "var(--ink)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i className="fa-solid fa-warehouse" style={{ color: "var(--primary)", fontSize: 13 }} />
                  {r.name}
                </span>
                <span style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 600 }}>
                  {r.companyName || "Kusumganga Agro Solutions Pvt. Ltd."}
                </span>
              </div>
            ),
          },
          {
            key: "taxDetails",
            label: "GSTIN / PAN",
            render: (r) => (
              <div style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: 11 }}>
                <span style={{ fontWeight: 700, color: "#0D3823", display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <i className="fa-solid fa-file-invoice" style={{ color: "var(--primary)", fontSize: 10 }} />
                  GST: {r.gstin || "09AALCK4355J1Z2"}
                </span>
                <span style={{ color: "var(--muted)", fontWeight: 600 }}>
                  PAN: {r.pan || "AALCK4355J"}
                </span>
              </div>
            ),
          },
          {
            key: "contactInfo",
            label: "Contact & Help Desk",
            render: (r) => (
              <div style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: 11 }}>
                <span style={{ fontWeight: 700, color: "var(--ink)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <i className="fa-solid fa-user-check" style={{ color: "#059669", fontSize: 10 }} />
                  {r.contactPerson || "Mr. Jagdeep Singh"} ({r.contactPhone || "7055000315"})
                </span>
                <span style={{ color: "var(--muted)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <i className="fa-solid fa-headset" style={{ color: "var(--primary)", fontSize: 9.5 }} />
                  Help Desk: {r.helpDeskPhone || "7905525983"} | {r.email || "kusumganga5@gmail.com"}
                </span>
              </div>
            ),
          },
          {
            key: "admin",
            label: "Warehouse Admin",
            render: (r) =>
              r.admin ? (
                <span style={{ fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5 }}>
                  <i className="fa-solid fa-user-shield" style={{ color: "var(--primary)", fontSize: 11 }} />
                  {r.admin}
                </span>
              ) : (
                <Badge tone="warning">UNASSIGNED</Badge>
              ),
          },
          {
            key: "supervisor",
            label: "Supervisor",
            render: (r) =>
              r.supervisor ? (
                <span style={{ fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5 }}>
                  <i className="fa-solid fa-user-gear" style={{ color: "var(--primary)", fontSize: 11 }} />
                  {r.supervisor}
                </span>
              ) : (
                <Badge tone="warning">UNASSIGNED</Badge>
              ),
          },
          {
            key: "status",
            label: "Status",
            render: (r) => (
              <Badge tone={r.status === "Active" ? "success" : "warning"}>
                {r.status ? r.status.toUpperCase() : "ACTIVE"}
              </Badge>
            ),
          },
          {
            key: "actions",
            label: "CRUD Actions",
            sortable: false,
            render: (r) => (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {/* READ / VIEW */}
                <button
                  type="button"
                  title="View Warehouse Details"
                  onClick={() => navigate(`/warehouses/detail?id=${r.id || ''}`)}
                  style={{
                    border: "1px solid var(--line-strong)",
                    background: "var(--canvas)",
                    color: "var(--primary-deep)",
                    fontSize: 11,
                    fontWeight: 700,
                    borderRadius: 6,
                    padding: "4px 8px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <i className="fa-solid fa-eye" style={{ fontSize: 10 }} /> View
                </button>

                {/* UPDATE / EDIT */}
                <button
                  type="button"
                  title="Edit Warehouse Details"
                  onClick={() => openEditModal(r)}
                  style={{
                    border: "1px solid rgba(27, 94, 58, 0.3)",
                    background: "rgba(27, 94, 58, 0.08)",
                    color: "#0D3823",
                    fontSize: 11,
                    fontWeight: 700,
                    borderRadius: 6,
                    padding: "4px 8px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <i className="fa-solid fa-pen-to-square" style={{ fontSize: 10, color: "#1B5E3A" }} /> Edit
                </button>

                {/* DELETE / DEACTIVATE */}
                <button
                  type="button"
                  title="Delete Warehouse"
                  onClick={() => setDeletingWarehouseId(r.id)}
                  style={{
                    border: "1px solid rgba(220, 38, 38, 0.3)",
                    background: "rgba(220, 38, 38, 0.08)",
                    color: "#dc2626",
                    fontSize: 11,
                    fontWeight: 700,
                    borderRadius: 6,
                    padding: "4px 8px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <i className="fa-solid fa-trash-can" style={{ fontSize: 10 }} />
                </button>
              </div>
            ),
          },
        ]}
      />

      {/* EDIT WAREHOUSE MODAL */}
      {editingWarehouse && (
        <Modal
          isOpen={true}
          onClose={() => setEditingWarehouse(null)}
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
                label="Warehouse Name"
                required
                value={editForm.name}
                onChange={(val) => setEditForm((f) => ({ ...f, name: val }))}
                compact
              />

              {/* Multi-Select Commodity Checkboxes Grid */}
              <div style={{ gridColumn: "1 / -1", margin: "6px 0 12px", background: "var(--canvas)", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--line)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 700, color: "#0D3823", margin: 0 }}>
                    <i className="fa-solid fa-wheat-awn" style={{ color: "var(--primary)" }} />
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
              <Button type="button" variant="outline" onClick={() => setEditingWarehouse(null)}>
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
        open={Boolean(deletingWarehouseId)}
        onClose={() => setDeletingWarehouseId(null)}
        onConfirm={handleDelete}
        title="Delete Warehouse?"
        message={
          <><strong style={{ display: 'block' }}>Warning: Permanent Deletion / Deactivation</strong>Are you sure you want to delete this warehouse hub? Assigned personnel will be unlinked.</>
        }
        confirmLabel="Yes, Delete Warehouse"
        loading={deleting}
        variant="danger"
      />
    </div>
  );
}
