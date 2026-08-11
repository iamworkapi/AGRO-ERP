import { useEffect, useState } from "react";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import DataTable from "../components/common/DataTable";
import Badge from "../components/common/Badge";
import Modal from "../components/common/Modal";
import FormField from "../components/common/FormField";
import Button from "../components/common/Button";
import AsyncState from "../components/common/AsyncState";
import { useWeightMachines } from "../features/weightMachines/useWeightMachines";
import { useWarehouses } from "../features/warehouses/useWarehouses";
import { useAuth } from "../hooks/useAuth";
import { useDisclosure } from "../hooks/useDisclosure";
import { createWeightMachineSchema } from "../validators/weightMachineValidators";
import { validateOrToast } from "../utils/validate";
import { toast } from "../utils/toast";

function emptyForm(defaultWarehouseId = "") {
  return { warehouseId: defaultWarehouseId, machineCode: "", make: "", model: "", capacityKg: "", installedOn: "" };
}

export default function WeightMachines() {
  const { user } = useAuth();
  const isScopedRole = user?.roleKey === "supervisor" || user?.roleKey === "warehouse_admin";
  // Provisioning a machine is admin-level per the backend (warehouse_admin /
  // super_admin only) - a Supervisor maintains stock against machines but
  // doesn't add new physical assets.
  const canAdd = user?.roleKey === "warehouse_admin" || user?.roleKey === "super_admin";
  const { warehouses } = useWarehouses();
  const myWarehouse = isScopedRole ? warehouses[0] : null;

  const { machines, status, error, addMachine } = useWeightMachines();
  const { isOpen: open, open: openModal, close: closeModal } = useDisclosure();
  const [form, setForm] = useState(() => emptyForm());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isScopedRole && myWarehouse?.id) {
      setForm((f) => (f.warehouseId ? f : { ...f, warehouseId: myWarehouse.id }));
    }
  }, [isScopedRole, myWarehouse?.id]);

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  async function handleSubmit(e) {
    e.preventDefault();
    const parsed = validateOrToast(createWeightMachineSchema, form);
    if (!parsed) return;

    setSaving(true);
    try {
      const created = await addMachine(parsed);
      toast.success(`${created.machineCode} added.`);
      setForm(emptyForm(myWarehouse?.id || ""));
      closeModal();
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || err.message || "Could not add this weight machine.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <PageHeader
        title="Weight Machines"
        subtitle={
          isScopedRole
            ? `Weighbridge machines at ${myWarehouse?.name || "your assigned warehouse"}`
            : "Weighbridge machines across all warehouses"
        }
      />

      <AsyncState status={status} error={error} loadingLabel="Loading weight machines…" />

      <Card
        title="Weight Machines"
        right={canAdd && <Button onClick={() => openModal()}>+ Add Weight Machine</Button>}
      >
        <DataTable
          keyField="id"
          rows={machines}
          searchable
          searchPlaceholder="Search machine code, make, model..."
          emptyMessage={
            isScopedRole
              ? "No weight machines yet. Ask your Warehouse Admin to add one before logging stock entries."
              : "No weight machines recorded yet."
          }
          columns={[
            { key: "machineCode", label: "Machine Code", emphasize: true },
            { key: "warehouse", label: "Warehouse" },
            { key: "make", label: "Make", render: (m) => m.make || "—" },
            { key: "model", label: "Model", render: (m) => m.model || "—" },
            { key: "capacityKg", label: "Capacity", render: (m) => (m.capacityKg ? `${m.capacityKg.toLocaleString()} kg` : "—") },
            { key: "nextCalibrationDue", label: "Next Calibration", render: (m) => m.nextCalibrationDue || "—" },
            {
              key: "status",
              label: "Status",
              render: (m) => (
                <Badge tone={m.status === "active" ? "success" : m.status === "maintenance" ? "warning" : "error"}>
                  {m.status.toUpperCase()}
                </Badge>
              ),
            },
          ]}
        />
      </Card>

      <Modal open={open} title="Add Weight Machine" onClose={() => closeModal()}>
        <form onSubmit={handleSubmit}>
          <FormField label="Machine Code" required value={form.machineCode} onChange={set("machineCode")} placeholder="e.g. WM-UTN-01" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
            <FormField label="Make" value={form.make} onChange={set("make")} placeholder="e.g. Avery Weigh-Tronix" />
            <FormField label="Model" value={form.model} onChange={set("model")} placeholder="e.g. ZM510" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
            <FormField label="Capacity (kg)" type="number" value={form.capacityKg} onChange={set("capacityKg")} placeholder="0" />
            <FormField label="Installed On" type="date" value={form.installedOn} onChange={set("installedOn")} />
          </div>
          <FormField
            label="Warehouse"
            type="select"
            required
            disabled={isScopedRole}
            value={form.warehouseId}
            onChange={set("warehouseId")}
            options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
          />
          {isScopedRole && (
            <p style={{ fontSize: 11, color: "var(--muted)", margin: "-8px 0 12px" }}>Locked to your assigned warehouse.</p>
          )}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
            <Button variant="secondary" type="button" onClick={() => closeModal()}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save Machine"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
