import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
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

  const [viewMode, setViewMode] = useState("grid"); // "grid" | "table"
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
    <div style={{ display: "flex", flexDirection: "column", gap: 18, position: "relative" }}>
      {/* Top Header */}
      <PageHeader
        title="Weighbridge & Weight Machines Terminal"
        subtitle={
          isScopedRole
            ? `Active weighing scales and weighbridges at ${myWarehouse?.name || "your assigned warehouse"}`
            : "Enterprise weighbridge machinery, calibration logs & live capacity across all hubs"
        }
        actions={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* View Mode Toggle */}
            <div style={{ display: "flex", background: "var(--canvas)", border: "1px solid var(--line)", borderRadius: 8, padding: 3 }}>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                style={{
                  padding: "5px 12px",
                  borderRadius: 6,
                  border: "none",
                  background: viewMode === "grid" ? "var(--primary)" : "transparent",
                  color: viewMode === "grid" ? "white" : "var(--ink-secondary)",
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <i className="ri-layout-grid-line" /> Cards
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                style={{
                  padding: "5px 12px",
                  borderRadius: 6,
                  border: "none",
                  background: viewMode === "table" ? "var(--primary)" : "transparent",
                  color: viewMode === "table" ? "white" : "var(--ink-secondary)",
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <i className="ri-list-unordered" /> Table
              </button>
            </div>

            {canAdd && (
              <Button onClick={() => handleOpenAdd()}>
                <i className="ri-add-line" style={{ marginRight: 6 }} /> Register Scale
              </Button>
            )}
          </div>
        }
      />

      {/* Hero Stats Strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        {/* Card 1: Total Units */}
        <div className="app-card" style={{ padding: "16px 18px", borderRadius: 14, background: "var(--surface)", border: "1px solid var(--line)", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Total Weighbridges
            </span>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(0,245,155,0.12)", color: "#00F59B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>
              <i className="ri-scales-3-line" />
            </div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "var(--ink)" }}>{stats.total} Units</div>
          <span style={{ fontSize: 11, color: "var(--muted)", marginTop: 4, display: "block" }}>
            Installed &amp; connected
          </span>
        </div>

        {/* Card 2: Active & Online */}
        <div className="app-card" style={{ padding: "16px 18px", borderRadius: 14, background: "var(--surface)", border: "1px solid var(--line)", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Online &amp; Operational
            </span>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(16,185,129,0.12)", color: "#10B981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>
              <i className="ri-checkbox-circle-fill" />
            </div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#10B981" }}>{stats.active} Active</div>
          <span style={{ fontSize: 11, color: "var(--muted)", marginTop: 4, display: "block" }}>
            Ready for live tare/gross
          </span>
        </div>

        {/* Card 3: In Maintenance */}
        <div className="app-card" style={{ padding: "16px 18px", borderRadius: 14, background: "var(--surface)", border: "1px solid var(--line)", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Maintenance / Calib
            </span>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(245,158,11,0.12)", color: "#F59E0B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>
              <i className="ri-tools-line" />
            </div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: stats.maintenance > 0 ? "#F59E0B" : "var(--ink)" }}>
            {stats.maintenance} Units
          </div>
          <span style={{ fontSize: 11, color: "var(--muted)", marginTop: 4, display: "block" }}>
            Periodic calibration queue
          </span>
        </div>

        {/* Card 4: Aggregate Load Capacity */}
        <div className="app-card" style={{ padding: "16px 18px", borderRadius: 14, background: "var(--surface)", border: "1px solid var(--line)", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Max Axle Capacity
            </span>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(0,210,255,0.12)", color: "#00D2FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>
              <i className="ri-truck-line" />
            </div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#00D2FF" }}>{stats.totalCapacityMt} MT</div>
          <span style={{ fontSize: 11, color: "var(--muted)", marginTop: 4, display: "block" }}>
            Heavy vehicle weighbridge
          </span>
        </div>
      </div>

      <AsyncState status={status} error={error} loadingLabel="Connecting to weighbridge telemetry nodes…" />

      {/* VIEW MODE 1: INTERACTIVE ASSET CARDS GRID */}
      {viewMode === "grid" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {machines.map((m) => {
            const isOnline = m.status === "active";
            const capMt = m.capacityKg ? Math.round(m.capacityKg / 1000) : 60;
            const whName = m.warehouse?.name || myWarehouse?.name || "Assigned Warehouse";

            return (
              <div
                key={m.id || m._id}
                className="app-card hover-card"
                style={{
                  padding: "20px 22px",
                  borderRadius: 18,
                  background: "var(--surface)",
                  border: "1px solid var(--line)",
                  boxShadow: "var(--shadow-sm)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 14,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Top Section: Code & Status */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          background: isOnline ? "rgba(0,245,155,0.12)" : "rgba(245,158,11,0.12)",
                          color: isOnline ? "#00F59B" : "#F59E0B",
                          border: `1px solid ${isOnline ? "rgba(0,245,155,0.3)" : "rgba(245,158,11,0.3)"}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 18,
                        }}
                      >
                        <i className="ri-scales-3-line" />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: "var(--ink)", letterSpacing: "-0.01em" }}>
                          {m.machineCode}
                        </h3>
                        <span style={{ fontSize: 11, color: "var(--muted)" }}>{whName}</span>
                      </div>
                    </div>

                    <Badge tone={isOnline ? "success" : m.status === "maintenance" ? "warning" : "error"}>
                      {m.status ? m.status.toUpperCase() : "ACTIVE"}
                    </Badge>
                  </div>

                  {/* Make & Model specifications */}
                  <div style={{ background: "var(--canvas)", padding: "10px 14px", borderRadius: 10, border: "1px solid var(--line)", margin: "8px 0 12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: "var(--muted)" }}>Make / Brand:</span>
                      <strong style={{ color: "var(--ink)" }}>{m.make || "Avery Weigh-Tronix"}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                      <span style={{ color: "var(--muted)" }}>Indicator Model:</span>
                      <strong style={{ color: "var(--ink)" }}>{m.model || "ZM510 High Precision"}</strong>
                    </div>
                  </div>

                  {/* Capacity Bar */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                      <span style={{ color: "var(--muted)", textTransform: "uppercase" }}>Rated Axle Capacity</span>
                      <span style={{ color: "var(--ink)" }}>{m.capacityKg ? `${m.capacityKg.toLocaleString()} kg (${capMt} MT)` : "60,000 kg (60 MT)"}</span>
                    </div>
                    <div style={{ height: 6, width: "100%", background: "var(--line)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: "85%", height: "100%", background: isOnline ? "var(--primary)" : "#F59E0B", borderRadius: 3 }} />
                    </div>
                  </div>

                  {/* Calibration details */}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--muted)", marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--line)" }}>
                    <span>Installed: <strong>{m.installedOn ? new Date(m.installedOn).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "Active"}</strong></span>
                    <span>Next Calib: <strong style={{ color: isOnline ? "var(--ink)" : "#F59E0B" }}>{m.nextCalibrationDue ? new Date(m.nextCalibrationDue).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Standard"}</strong></span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                  <button
                    onClick={() => navigate("/weighment/create")}
                    style={{
                      flex: 1,
                      padding: "8px 10px",
                      borderRadius: 8,
                      border: "1px solid var(--primary)",
                      background: "var(--primary-tint)",
                      color: "var(--primary-deep)",
                      fontWeight: 800,
                      fontSize: 11.5,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 4,
                    }}
                  >
                    <i className="ri-file-text-line" /> Weigh Slip
                  </button>

                  <button
                    onClick={() => handleOpenCalib(m)}
                    title="Log Calibration"
                    style={{
                      padding: "8px 10px",
                      borderRadius: 8,
                      border: "1px solid var(--line)",
                      background: "var(--canvas)",
                      color: "var(--ink)",
                      fontWeight: 700,
                      fontSize: 11.5,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <i className="ri-tools-line" /> Calibrate
                  </button>

                  <button
                    onClick={() => handleOpenEdit(m)}
                    title="Edit Machine Settings"
                    style={{
                      padding: "8px 10px",
                      borderRadius: 8,
                      border: "1px solid var(--line)",
                      background: "var(--canvas)",
                      color: "var(--ink-secondary)",
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    <i className="ri-edit-line" />
                  </button>

                  <button
                    onClick={() => handleDeleteMachine(m.id || m._id, m.machineCode)}
                    title="Delete Machine"
                    style={{
                      padding: "8px 10px",
                      borderRadius: 8,
                      border: "1px solid rgba(239, 68, 68, 0.25)",
                      background: "rgba(239, 68, 68, 0.08)",
                      color: "var(--status-error)",
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    <i className="ri-delete-bin-line" />
                  </button>
                </div>
              </div>
            );
          })}

          {machines.length === 0 && (
            <div style={{ gridColumn: "1 / -1", padding: 32, textAlign: "center", background: "var(--surface)", borderRadius: 14, border: "1px solid var(--line)" }}>
              <i className="ri-scales-3-line" style={{ fontSize: 36, color: "var(--muted)", marginBottom: 10 }} />
              <h3 style={{ margin: "0 0 6px", color: "var(--ink)" }}>No Weight Machines Registered</h3>
              <p style={{ margin: "0 0 14px", fontSize: 13, color: "var(--muted)" }}>
                Register your first electronic weighbridge or scale to begin automated PRALLI stock weighment.
              </p>
              <Button onClick={() => handleOpenAdd()}>
                <i className="ri-add-line" style={{ marginRight: 6 }} /> Register Scale / Machine
              </Button>
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 2: FULL DATA TABLE */}
      {viewMode === "table" && (
        <Card title="All Registered Weighbridges & Scales">
          <DataTable
            keyField="id"
            rows={machines}
            searchable
            searchPlaceholder="Search machine code, make, model, warehouse..."
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
                  <Badge tone={m.status === "active" ? "success" : m.status === "maintenance" ? "warning" : "error"}>
                    {m.status ? m.status.toUpperCase() : "ACTIVE"}
                  </Badge>
                ),
              },
              {
                key: "actions",
                label: "Actions",
                render: (m) => (
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => navigate("/weighment/create")}
                      style={{
                        padding: "4px 8px",
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
        </Card>
      )}

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
