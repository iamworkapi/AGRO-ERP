import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
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
  return {
    warehouseId: defaultWarehouseId,
    machineCode: "",
    make: "",
    model: "",
    capacityKg: "",
    installedOn: "",
    status: "active",
    lastCalibratedOn: "",
    nextCalibrationDue: "",
  };
}

export default function WeightMachines() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isScopedRole = user?.roleKey === "supervisor" || user?.roleKey === "warehouse_admin";
  const canAdd = Boolean(user); // Super Admin, Warehouse Admin, Supervisor all have access
  
  const { warehouses } = useWarehouses();
  
  // Resolve assigned warehouse from user profile, localStorage or first available hub
  const assignedWarehouse = useMemo(() => {
    if (user?.warehouseId) {
      const found = warehouses.find((w) => (w.id || w._id) === user.warehouseId);
      if (found) return found;
    }
    if (user?.warehouse) {
      if (typeof user.warehouse === "object") return user.warehouse;
      const found = warehouses.find((w) => (w.id || w._id) === user.warehouse);
      if (found) return found;
    }
    const storedWh = localStorage.getItem("active_warehouse_id") || localStorage.getItem("selectedWarehouseId");
    if (storedWh) {
      const found = warehouses.find((w) => (w.id || w._id) === storedWh);
      if (found) return found;
    }
    return warehouses[0] || null;
  }, [user, warehouses]);

  const myWarehouse = isScopedRole ? assignedWarehouse : null;

  const { machines, status, error, reload, addMachine, updateMachine, deleteMachine } = useWeightMachines();
  const { isOpen: openAdd, open: openAddModal, close: closeAddModal } = useDisclosure();
  const { isOpen: openEdit, open: openEditModal, close: closeEditModal } = useDisclosure();
  const { isOpen: openCalib, open: openCalibModal, close: closeCalibModal } = useDisclosure();

  const [form, setForm] = useState(() => emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [calibMachine, setCalibMachine] = useState(null);
  const [calibForm, setCalibForm] = useState({ lastCalibratedOn: "", nextCalibrationDue: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const defaultWhId = assignedWarehouse?.id || assignedWarehouse?._id || warehouses[0]?.id || warehouses[0]?._id || "";
    if (defaultWhId) {
      setForm((f) => (f.warehouseId ? f : { ...f, warehouseId: defaultWhId }));
    }
  }, [assignedWarehouse, warehouses]);

  function handleOpenAdd() {
    const defaultWhId = assignedWarehouse?.id || assignedWarehouse?._id || warehouses[0]?.id || warehouses[0]?._id || "";
    setForm(emptyForm(defaultWhId));
    openAddModal();
  }

  async function handleDeleteMachine(id, code) {
    if (!window.confirm(`Are you sure you want to remove scale ${code || ""}?`)) return;
    try {
      await deleteMachine(id);
      toast.success(`Weight machine ${code || ""} deleted successfully.`);
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || err.message || "Could not delete weight machine.");
    }
  }

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  // Aggregate Metrics
  const stats = useMemo(() => {
    const total = machines.length;
    const active = machines.filter((m) => m.status === "active").length;
    const maintenance = machines.filter((m) => m.status === "maintenance").length;
    const totalCapacityKg = machines.reduce((sum, m) => sum + (Number(m.capacityKg) || 0), 0);
    const totalCapacityMt = Math.round(totalCapacityKg / 1000);

    return { total, active, maintenance, totalCapacityMt };
  }, [machines]);

  async function handleAddSubmit(e) {
    e.preventDefault();
    const effectiveWarehouseId = form.warehouseId || assignedWarehouse?.id || assignedWarehouse?._id || warehouses[0]?.id || warehouses[0]?._id || undefined;
    const submissionData = {
      ...form,
      warehouseId: effectiveWarehouseId,
    };
    const parsed = validateOrToast(createWeightMachineSchema, submissionData);
    if (!parsed) return;

    setSaving(true);
    try {
      const created = await addMachine(parsed);
      toast.success(`Weight Machine ${created.machineCode} registered successfully.`);
      setForm(emptyForm(effectiveWarehouseId || ""));
      closeAddModal();
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || err.message || "Could not add this weight machine.");
    } finally {
      setSaving(false);
    }
  }

  function handleOpenEdit(m) {
    setEditingId(m.id || m._id);
    setForm({
      warehouseId: m.warehouse?._id || m.warehouse?.id || m.warehouse || "",
      machineCode: m.machineCode || "",
      make: m.make || "",
      model: m.model || "",
      capacityKg: m.capacityKg || "",
      installedOn: m.installedOn ? m.installedOn.slice(0, 10) : "",
      status: m.status || "active",
      lastCalibratedOn: m.lastCalibratedOn ? m.lastCalibratedOn.slice(0, 10) : "",
      nextCalibrationDue: m.nextCalibrationDue ? m.nextCalibrationDue.slice(0, 10) : "",
    });
    openEditModal();
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    if (!editingId) return;

    setSaving(true);
    try {
      await updateMachine(editingId, {
        make: form.make,
        model: form.model,
        capacityKg: Number(form.capacityKg),
        status: form.status,
        lastCalibratedOn: form.lastCalibratedOn || undefined,
        nextCalibrationDue: form.nextCalibrationDue || undefined,
      });
      toast.success("Weight machine configuration updated.");
      closeEditModal();
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || err.message || "Could not update machine.");
    } finally {
      setSaving(false);
    }
  }

  function handleOpenCalib(m) {
    setCalibMachine(m);
    const today = new Date().toISOString().slice(0, 10);
    const nextDue = new Date();
    nextDue.setDate(nextDue.getDate() + 90); // 90-day standard calibration interval
    setCalibForm({
      lastCalibratedOn: today,
      nextCalibrationDue: nextDue.toISOString().slice(0, 10),
    });
    openCalibModal();
  }

  async function handleCalibSubmit(e) {
    e.preventDefault();
    if (!calibMachine) return;

    setSaving(true);
    try {
      await updateMachine(calibMachine.id || calibMachine._id, {
        lastCalibratedOn: calibForm.lastCalibratedOn,
        nextCalibrationDue: calibForm.nextCalibrationDue,
        status: "active",
      });
      toast.success(`Calibration record updated for ${calibMachine.machineCode}.`);
      closeCalibModal();
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || err.message || "Could not update calibration.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, position: "relative" }}>
      {/* Top Header */}
      <PageHeader
        title="Weight Machines"
        subtitle={
          isScopedRole
            ? `Active weighing scales and weighbridges at ${myWarehouse?.name || "your assigned warehouse"}`
            : "Enterprise weighbridge machinery, calibration logs & live capacity across all hubs"
        }
        badge="SCALES & WEIGHBRIDGES"
      />

      {/* Hero Stats Strip (Compact Modern Design) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
        {/* Card 1: Total Units */}
        <div
          className="app-card"
          style={{
            padding: "12px 14px",
            borderRadius: 12,
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderTop: "3px solid var(--primary)",
            boxShadow: "var(--shadow-xs)",
            transition: "all 150ms ease",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Total Weighbridges
            </span>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: "var(--primary-tint)", color: "var(--primary-deep)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>
              <i className="ri-scales-3-line" />
            </div>
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.01em" }}>{stats.total} Units</div>
          <span style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 2, display: "block" }}>
            Installed &amp; connected
          </span>
        </div>

        {/* Card 2: Active & Online */}
        <div
          className="app-card"
          style={{
            padding: "12px 14px",
            borderRadius: 12,
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderTop: "3px solid #10B981",
            boxShadow: "var(--shadow-xs)",
            transition: "all 150ms ease",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Online &amp; Operational
            </span>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(16,185,129,0.12)", color: "#10B981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>
              <i className="ri-checkbox-circle-fill" />
            </div>
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#10B981", letterSpacing: "-0.01em" }}>{stats.active} Active</div>
          <span style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 2, display: "block" }}>
            Ready for live tare/gross
          </span>
        </div>

        {/* Card 3: In Maintenance */}
        <div
          className="app-card"
          style={{
            padding: "12px 14px",
            borderRadius: 12,
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderTop: "3px solid #F59E0B",
            boxShadow: "var(--shadow-xs)",
            transition: "all 150ms ease",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Maintenance / Calib
            </span>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(245,158,11,0.12)", color: "#F59E0B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>
              <i className="ri-tools-line" />
            </div>
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: stats.maintenance > 0 ? "#F59E0B" : "var(--ink)", letterSpacing: "-0.01em" }}>
            {stats.maintenance} Units
          </div>
          <span style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 2, display: "block" }}>
            Periodic calibration queue
          </span>
        </div>

        {/* Card 4: Aggregate Load Capacity */}
        <div
          className="app-card"
          style={{
            padding: "12px 14px",
            borderRadius: 12,
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderTop: "3px solid #0284C7",
            boxShadow: "var(--shadow-xs)",
            transition: "all 150ms ease",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Max Axle Capacity
            </span>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(2,132,199,0.12)", color: "#0284C7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>
              <i className="ri-truck-line" />
            </div>
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#0284C7", letterSpacing: "-0.01em" }}>{stats.totalCapacityMt} MT</div>
          <span style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 2, display: "block" }}>
            Heavy vehicle weighbridge
          </span>
        </div>
      </div>

      <DataTable
        title="All Registered Weighbridges & Scales"
        subtitle={
          isScopedRole
            ? `Hub: ${assignedWarehouse?.name || "Assigned Warehouse"} • Active weighment telemetry`
            : "Active weighment telemetry and operational scales across enterprise facilities"
        }
        keyField="id"
        rows={machines}
        compact
        searchable
        searchPlaceholder="Search machine code, make, model, warehouse..."
        right={
          canAdd && (
            <Button
              size="sm"
              variant="primary"
              icon="ri-add-line"
              onClick={handleOpenAdd}
              style={{ height: 32, fontSize: 12, padding: "0 12px", fontWeight: 700 }}
            >
              Register New Machine
            </Button>
          )
        }
        emptyMessage="No weight machines recorded yet."
        columns={[
          {
            key: "machineCode",
            label: "Machine Code",
            emphasize: true,
                render: (m) => (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, background: "var(--primary-tint)", color: "var(--primary-deep)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>
                      <i className="ri-scales-3-line" />
                    </div>
                    <strong>{m.machineCode}</strong>
                  </div>
                ),
              },
              {
                key: "warehouse",
                label: "Warehouse Location",
                render: (m) => m.warehouse?.name || myWarehouse?.name || "Assigned Warehouse",
              },
              {
                key: "make",
                label: "Make & Model",
                render: (m) => (
                  <div>
                    <div style={{ fontWeight: 600 }}>{m.make || "—"}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>{m.model || "—"}</div>
                  </div>
                ),
              },
              {
                key: "capacityKg",
                label: "Rated Capacity",
                render: (m) => (
                  <strong style={{ color: "var(--ink)" }}>
                    {m.capacityKg ? `${m.capacityKg.toLocaleString()} kg (${Math.round(m.capacityKg / 1000)} MT)` : "—"}
                  </strong>
                ),
              },
              {
                key: "nextCalibrationDue",
                label: "Next Calibration",
                render: (m) => (
                  <span style={{ fontSize: 11.5 }}>
                    {m.nextCalibrationDue ? new Date(m.nextCalibrationDue).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Standard"}
                  </span>
                ),
              },
              {
                key: "status",
                label: "Status",
                render: (m) => (
                  <Badge tone={m.status === "active" ? "success" : m.status === "maintenance" ? "warning" : "error"} size="sm">
                    {m.status ? m.status.toUpperCase() : "ACTIVE"}
                  </Badge>
                ),
              },
              {
                key: "actions",
                label: "Actions",
                render: (m) => (
                  <div style={{ display: "flex", gap: 5 }}>
                    <button
                      onClick={() => navigate("/weighment/new")}
                      style={{
                        padding: "3px 8px",
                        borderRadius: 6,
                        border: "1px solid var(--primary)",
                        background: "var(--primary-tint)",
                        color: "var(--primary-deep)",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Weigh
                    </button>
                    <button
                      onClick={() => handleOpenCalib(m)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: 6,
                        border: "1px solid var(--line)",
                        background: "var(--canvas)",
                        color: "var(--ink)",
                        fontSize: 11,
                        cursor: "pointer",
                      }}
                    >
                      Calibrate
                    </button>
                    <button
                      onClick={() => handleOpenEdit(m)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: 6,
                        border: "1px solid var(--line)",
                        background: "var(--canvas)",
                        color: "var(--ink)",
                        fontSize: 11,
                        cursor: "pointer",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteMachine(m.id || m._id, m.machineCode)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: 6,
                        border: "1px solid rgba(239, 68, 68, 0.25)",
                        background: "rgba(239, 68, 68, 0.08)",
                        color: "var(--status-error)",
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ),
              },
            ]}
          />

      {/* MODAL 1: ADD WEIGHT MACHINE */}
      <Modal open={openAdd} title="Register New Weighbridge / Scale" onClose={() => closeAddModal()}>
        <form onSubmit={handleAddSubmit}>
          <FormField
            label="Machine Code / Identifier"
            required
            value={form.machineCode}
            onChange={set("machineCode")}
            placeholder="e.g. WM-UTN-01 or WB-MAIN-SCALE"
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
            <FormField label="Manufacturer / Make" value={form.make} onChange={set("make")} placeholder="e.g. Avery Weigh-Tronix" />
            <FormField label="Terminal / Model" value={form.model} onChange={set("model")} placeholder="e.g. ZM510 Precision" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
            <FormField label="Capacity (kg)" type="number" value={form.capacityKg} onChange={set("capacityKg")} placeholder="60000" />
            <FormField label="Installed On" type="date" value={form.installedOn} onChange={set("installedOn")} />
          </div>
          
          {/* Warehouse Hub Display / Selector */}
          {isScopedRole ? (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>
                Warehouse Hub Assignment <span style={{ color: "var(--status-error)" }}>*</span>
              </label>
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: "var(--canvas)",
                  border: "1px solid var(--line)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--ink)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <i className="ri-building-2-line" style={{ color: "var(--primary)", fontSize: 16 }} />
                  <span>{assignedWarehouse?.name || "Main Regional Warehouse Hub"}</span>
                  {assignedWarehouse?.code && (
                    <span style={{ fontSize: 11, background: "var(--primary-tint)", color: "var(--primary-deep)", padding: "2px 8px", borderRadius: 6 }}>
                      {assignedWarehouse.code}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", display: "flex", alignItems: "center", gap: 4 }}>
                  <i className="ri-lock-line" /> Auto-Bound (Read-Only)
                </span>
              </div>
            </div>
          ) : (
            <FormField
              label="Warehouse Hub Assignment"
              type="select"
              required
              value={form.warehouseId || assignedWarehouse?.id || assignedWarehouse?._id || ""}
              onChange={set("warehouseId")}
              options={warehouses.map((w) => ({ value: w.id || w._id, label: `${w.name} (${w.code})` }))}
            />
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
            <Button variant="secondary" type="button" onClick={() => closeAddModal()}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Registering…" : "Register Scale"}</Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: EDIT WEIGHT MACHINE */}
      <Modal open={openEdit} title="Edit Weighbridge Asset" onClose={() => closeEditModal()}>
        <form onSubmit={handleEditSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
            <FormField label="Manufacturer / Make" value={form.make} onChange={set("make")} placeholder="e.g. Avery Weigh-Tronix" />
            <FormField label="Terminal / Model" value={form.model} onChange={set("model")} placeholder="e.g. ZM510" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
            <FormField label="Capacity (kg)" type="number" value={form.capacityKg} onChange={set("capacityKg")} placeholder="60000" />
            <FormField
              label="Operating Status"
              type="select"
              value={form.status}
              onChange={set("status")}
              options={[
                { value: "active", label: "Active & Operational" },
                { value: "maintenance", label: "In Maintenance / Calibration" },
                { value: "inactive", label: "Decommissioned / Inactive" },
              ]}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
            <FormField label="Last Calibrated On" type="date" value={form.lastCalibratedOn} onChange={set("lastCalibratedOn")} />
            <FormField label="Next Calibration Due" type="date" value={form.nextCalibrationDue} onChange={set("nextCalibrationDue")} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
            <Button variant="secondary" type="button" onClick={() => closeEditModal()}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Updating…" : "Save Changes"}</Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: LOG CALIBRATION RECORD */}
      <Modal
        open={openCalib}
        title={`Log Calibration: ${calibMachine?.machineCode || "Weighbridge"}`}
        onClose={() => closeCalibModal()}
      >
        <form onSubmit={handleCalibSubmit}>
          <p style={{ margin: "0 0 14px", fontSize: 13, color: "var(--muted)" }}>
            Update official calibration certificate records and set next inspection schedule.
          </p>
          <FormField
            label="Calibration Date (Certified On)"
            type="date"
            required
            value={calibForm.lastCalibratedOn}
            onChange={(val) => setCalibForm((f) => ({ ...f, lastCalibratedOn: val }))}
          />
          <FormField
            label="Next Calibration Due Date"
            type="date"
            required
            value={calibForm.nextCalibrationDue}
            onChange={(val) => setCalibForm((f) => ({ ...f, nextCalibrationDue: val }))}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
            <Button variant="secondary" type="button" onClick={() => closeCalibModal()}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving Record…" : "Verify & Activate Scale"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
