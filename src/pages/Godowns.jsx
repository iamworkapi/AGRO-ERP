import { useState } from "react";
import { Trash2, Pencil } from "lucide-react";

function LucideIconWrapper({ children, size = 16 }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: size, height: size, flexShrink: 0 }}>
      {children}
    </span>
  );
}
import { useDisclosure } from "../hooks/useDisclosure";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import DataTable from "../components/common/DataTable";
import Badge from "../components/common/Badge";
import Modal from "../components/common/Modal";
import FormField from "../components/common/FormField";
import Button from "../components/common/Button";
import AsyncState from "../components/common/AsyncState";
import { useGodowns } from "../features/godowns/useGodowns";
import { useWarehouses } from "../features/warehouses/useWarehouses";
import { useAuth } from "../hooks/useAuth";
import { toast } from "../utils/toast";

function fillPercent(current, capacity) {
  if (!capacity || capacity <= 0) return 0;
  return Math.min(100, Math.round((current / capacity) * 100));
}

function fillTone(pct) {
  if (pct >= 90) return "error";
  if (pct >= 70) return "warning";
  return "success";
}

export default function Godowns() {
  const { user } = useAuth();
  const isScopedRole = user?.roleKey === "supervisor" || user?.roleKey === "warehouse_admin";
  const canManage = user?.roleKey === "warehouse_admin" || user?.roleKey === "super_admin";
  const { warehouses } = useWarehouses();
  const myWarehouse = isScopedRole ? warehouses[0] : null;

  const { godowns, status, error, addGodown, editGodown, removeGodown } = useGodowns(myWarehouse?.id);
  const { isOpen: open, open: openModal, close: closeModal } = useDisclosure();
  const { isOpen: editOpen, open: openEdit, close: closeEdit } = useDisclosure();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", capacityMt: "", areaSqFt: "", godownType: "covered", notes: "" });
  const [editId, setEditId] = useState(null);

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.capacityMt) {
      toast.error("Godown name and capacity are required.");
      return;
    }
    setSaving(true);
    addGodown({
      warehouseId: myWarehouse?.id,
      name: form.name.toUpperCase(),
      capacityMt: parseFloat(form.capacityMt),
      areaSqFt: form.areaSqFt ? parseFloat(form.areaSqFt) : undefined,
      godownType: form.godownType,
      notes: form.notes,
    })
      .then(() => {
        toast.success(`Godown "${form.name}" created successfully!`);
        setForm({ name: "", capacityMt: "", areaSqFt: "", godownType: "covered", notes: "" });
        closeModal();
      })
      .catch(() => {})
      .finally(() => setSaving(false));
  }

  function handleEdit(g) {
    setEditId(g.id);
    setForm({
      name: g.name,
      capacityMt: String(g.capacityMt || ""),
      areaSqFt: g.areaSqFt ? String(g.areaSqFt) : "",
      godownType: g.godownType || "covered",
      notes: g.notes || "",
    });
    openEdit();
  }

  function handleUpdate(e) {
    e.preventDefault();
    setSaving(true);
    editGodown(editId, {
      name: form.name.toUpperCase(),
      capacityMt: parseFloat(form.capacityMt),
      areaSqFt: form.areaSqFt ? parseFloat(form.areaSqFt) : undefined,
      godownType: form.godownType,
      notes: form.notes,
    })
      .then(() => {
        toast.success("Godown updated.");
        closeEdit();
      })
      .catch(() => {})
      .finally(() => setSaving(false));
  }

  function handleDelete(g) {
    removeGodown(g.id).then(() => toast.success(`Godown "${g.name}" deleted.`));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <PageHeader
        title="Godown Management"
        subtitle={isScopedRole ? `Storage godowns at ${myWarehouse?.name || "your warehouse"}` : "All godowns across warehouses"}
        right={canManage && <Button onClick={openModal}>+ Add Godown</Button>}
      />

      <AsyncState status={status} error={error} loadingLabel="Loading godowns…" />

      {/* SUMMARY TILES */}
      {godowns.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }} className="responsive-grid-2">
          <Card title="Total Godowns" center>
            <div style={{ fontSize: 28, fontWeight: 900, color: "var(--ink)" }}>{godowns.length}</div>
          </Card>
          <Card title="Total Capacity" center>
            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)" }}>{godowns.reduce((s, g) => s + (g.capacityMt || 0), 0).toFixed(1)} MT</div>
          </Card>
          <Card title="Total Stock" center>
            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--primary-deep)" }}>{godowns.reduce((s, g) => s + (g.currentStockMt || 0), 0).toFixed(1)} MT</div>
          </Card>
        </div>
      )}

      <Card title="Godown List" right={canManage && <Button onClick={openModal}>+ Add Godown</Button>}>
        <DataTable
          keyField="id"
          rows={godowns}
          emptyMessage="No godowns registered yet. Add a godown to start tracking storage capacity."
          columns={[
            { key: "code", label: "Code", render: (g) => <code style={{ fontSize: 11 }}>{g.code || "—"}</code> },
            { key: "name", label: "Godown Name", emphasize: true, render: (g) => <strong>{g.name}</strong> },
            { key: "warehouse", label: "Warehouse", render: (g) => g.warehouse || "—" },
            {
              key: "fill",
              label: "Fill %",
              render: (g) => {
                const pct = fillPercent(g.currentStockMt, g.capacityMt);
                return (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, height: 6, background: "#e2e8f0", borderRadius: 3, overflow: "hidden", maxWidth: 80 }}>
                      <div style={{ height: "100%", width: `${pct}%", background: pct >= 90 ? "#dc2626" : pct >= 70 ? "#f59e0b" : "#10b981", borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{pct}%</span>
                  </div>
                );
              },
            },
            {
              key: "capacity",
              label: "Capacity / Stock",
              render: (g) => `${(g.capacityMt || 0).toFixed(1)} / ${(g.currentStockMt || 0).toFixed(1)} MT`,
            },
            { key: "godownType", label: "Type", render: (g) => <Badge tone={g.godownType === "covered" ? "success" : g.godownType === "open" ? "warning" : "info"}>{g.godownType?.toUpperCase()}</Badge> },
            {
              key: "status",
              label: "Status",
              render: (g) => <Badge tone={g.status === "active" ? "success" : g.status === "full" ? "error" : "warning"}>{g.status?.toUpperCase()}</Badge>,
            },
            ...(canManage ? [{
              key: "actions",
              label: "Actions",
              render: (g) => (
                <div style={{ display: "flex", gap: 6 }}>
                  <button type="button" onClick={() => handleEdit(g)} style={{ padding: "4px 10px", fontSize: 11.5, fontWeight: 600, borderRadius: 6, border: "1px solid var(--primary)", background: "var(--primary-tint)", color: "var(--primary-deep)", cursor: "pointer" }}>
                    <LucideIconWrapper size={16}><Pencil size={16} /></LucideIconWrapper> Edit
                  </button>
                  <button type="button" onClick={() => handleDelete(g)} style={{ padding: "4px 10px", fontSize: 11.5, fontWeight: 600, borderRadius: 6, border: "1px solid #ef4444", background: "#fef2f2", color: "#dc2626", cursor: "pointer" }}>
                    <LucideIconWrapper size={16}><Trash2 size={16} /></LucideIconWrapper>
                  </button>
                </div>
              ),
            }] : []),
          ]}
        />
      </Card>

      {/* ADD GODOWN MODAL */}
      <Modal open={open} title="Add New Godown" onClose={closeModal}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <FormField label="Godown Name *" value={form.name} onChange={set("name")} placeholder="e.g. Godown-A (Main)" compact required />
            <FormField label="Capacity (MT) *" type="number" value={form.capacityMt} onChange={set("capacityMt")} placeholder="500" compact required />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <FormField label="Area (sq. ft.)" type="number" value={form.areaSqFt} onChange={set("areaSqFt")} placeholder="Optional" compact />
            <FormField label="Type" type="select" value={form.godownType} onChange={set("godownType")} options={[
              { value: "covered", label: "Covered" },
              { value: "open", label: "Open" },
              { value: "shed", label: "Shed" },
            ]} compact />
          </div>
          <FormField label="Notes" value={form.notes} onChange={set("notes")} placeholder="Optional notes" />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
            <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving…" : "💾 Save Godown"}</Button>
          </div>
        </form>
      </Modal>

      {/* EDIT GODOWN MODAL */}
      <Modal open={editOpen} title="Edit Godown" onClose={closeEdit}>
        <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <FormField label="Godown Name *" value={form.name} onChange={set("name")} compact required />
            <FormField label="Capacity (MT) *" type="number" value={form.capacityMt} onChange={set("capacityMt")} compact required />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <FormField label="Area (sq. ft.)" type="number" value={form.areaSqFt} onChange={set("areaSqFt")} compact />
            <FormField label="Type" type="select" value={form.godownType} onChange={set("godownType")} options={[
              { value: "covered", label: "Covered" },
              { value: "open", label: "Open" },
              { value: "shed", label: "Shed" },
            ]} compact />
          </div>
          <FormField label="Notes" value={form.notes} onChange={set("notes")} />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
            <Button type="button" variant="secondary" onClick={closeEdit}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Update Godown"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
