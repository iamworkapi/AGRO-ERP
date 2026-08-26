import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/common/PageHeader";
import DataTable from "../components/common/DataTable";
import Badge from "../components/common/Badge";
import Avatar from "../components/common/Avatar";
import Modal from "../components/common/Modal";
import FormField from "../components/common/FormField";
import Button from "../components/common/Button";
import AsyncState from "../components/common/AsyncState";
import { useAttendance } from "../features/attendance/useAttendance";
import { useEmployees } from "../features/employees/useEmployees";
import { useWarehouses } from "../features/warehouses/useWarehouses";
import { useDisclosure } from "../hooks/useDisclosure";
import { useAuth } from "../hooks/useAuth";
import { createAttendanceSchema } from "../validators/attendanceValidators";
import { validateOrToast } from "../utils/validate";
import { toast } from "../utils/toast";

const statusTone = { Present: "success", Late: "warning", Pending: "warning", Absent: "error" };

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function emptyForm(defaultWarehouseId = "") {
  return { warehouseId: defaultWarehouseId, employeeId: "", date: todayIso(), checkInTime: "", checkOutTime: "", reason: "" };
}

function nameCell(name, index) {
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <Avatar initials={initials} index={index} />
      <span style={{ fontWeight: 700, color: "var(--ink)" }}>{name}</span>
    </div>
  );
}

export default function Attendance() {
  const { user } = useAuth();
  const isScopedRole = user?.roleKey === "supervisor" || user?.roleKey === "warehouse_admin";
  const { warehouses } = useWarehouses();
  const myWarehouse = isScopedRole ? warehouses[0] : null;

  const { records, status, error, addRecord } = useAttendance();
  const { employees } = useEmployees();
  const { isOpen: open, open: openModal, close: closeModal } = useDisclosure();
  const [form, setForm] = useState(() => emptyForm());
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "Present" | "Late" | "Pending"

  useEffect(() => {
    if (isScopedRole && myWarehouse?.id) {
      setForm((f) => (f.warehouseId ? f : { ...f, warehouseId: myWarehouse.id }));
    }
  }, [isScopedRole, myWarehouse?.id]);

  const employeeOptions = useMemo(
    () =>
      employees
        .filter((e) => !form.warehouseId || e.warehouseId === form.warehouseId)
        .map((e) => ({ value: e.id, label: e.name })),
    [employees, form.warehouseId]
  );

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  async function handleSubmit(e) {
    e.preventDefault();
    const parsed = validateOrToast(createAttendanceSchema, form);
    if (!parsed) return;

    setSaving(true);
    try {
      await addRecord(parsed);
      toast.success("Attendance correction submitted for approval.");
      setForm(emptyForm(myWarehouse?.id || ""));
      closeModal();
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || err.message || "Could not submit this correction.");
    } finally {
      setSaving(false);
    }
  }

  const presentCount = records.filter((r) => r.status === "Present").length;
  const lateCount = records.filter((r) => r.status === "Late").length;
  const pendingCount = records.filter((r) => r.status === "Pending" || r.status === "Absent").length;

  const totalCount = records.length || 1;
  const presentPct = ((presentCount / totalCount) * 100).toFixed(0);
  const latePct = ((lateCount / totalCount) * 100).toFixed(0);
  const pendingPct = ((pendingCount / totalCount) * 100).toFixed(0);

  const filteredRecords = records.filter((r) => {
    if (statusFilter === "Present") return r.status === "Present";
    if (statusFilter === "Late") return r.status === "Late";
    if (statusFilter === "Pending") return r.status === "Pending" || r.status === "Absent";
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <PageHeader
        title="Daily Attendance"
        subtitle={
          isScopedRole
            ? `Manual attendance corrections for ${myWarehouse?.name || "your assigned warehouse"}`
            : "Manual attendance corrections across all warehouses, pending Warehouse Admin sign-off"
        }
      />

      <AsyncState status={status} error={error} loadingLabel="Loading attendance records…" />

      {/* STAT METRICS CARDS (static - filtering happens via the tab bar below) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }} className="responsive-grid-2">
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: "14px 16px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #059669 0%, #10B981 100%)" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.4 }}>Total Records</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)" }}>{records.length}</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>All Logged Entries</div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--primary-tint)", color: "var(--primary-deep)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>
              <i className="ri-group-line" />
            </div>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: "14px 16px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "#10B981" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.4 }}>Present</span>
            <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 7px", borderRadius: 10, background: "#D1FAE5", color: "#059669" }}>{presentPct}%</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)" }}>{presentCount}</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Verified</div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "#D1FAE5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>
              <i className="ri-checkbox-circle-fill" />
            </div>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: "14px 16px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "#F59E0B" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.4 }}>Late</span>
            <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 7px", borderRadius: 10, background: "#FEF3C7", color: "#D97706" }}>{latePct}%</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)" }}>{lateCount}</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Requires Approval</div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "#FEF3C7", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>
              <i className="ri-user-3-line-clock" />
            </div>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: "14px 16px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "#EF4444" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.4 }}>Pending Review</span>
            <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 7px", borderRadius: 10, background: "#FEE2E2", color: "#EF4444" }}>{pendingPct}%</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)" }}>{pendingCount}</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Action Needed</div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "#FEE2E2", color: "#EF4444", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>
              <i className="ri-alert-line" />
            </div>
          </div>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="role-picker-container" style={{ width: "auto", marginBottom: 0, background: "var(--surface)", border: "1px solid var(--line)", padding: 3, borderRadius: 10, display: "inline-flex" }}>
        <button type="button" className={`role-picker-option ${statusFilter === "all" ? "active" : ""}`} onClick={() => setStatusFilter("all")} style={{ padding: "6px 14px", fontSize: 12, fontWeight: 700 }}>
          All ({records.length})
        </button>
        <button type="button" className={`role-picker-option ${statusFilter === "Present" ? "active" : ""}`} onClick={() => setStatusFilter("Present")} style={{ padding: "6px 14px", fontSize: 12, fontWeight: 700 }}>
          Present ({presentCount})
        </button>
        <button type="button" className={`role-picker-option ${statusFilter === "Late" ? "active" : ""}`} onClick={() => setStatusFilter("Late")} style={{ padding: "6px 14px", fontSize: 12, fontWeight: 700 }}>
          Late ({lateCount})
        </button>
        <button type="button" className={`role-picker-option ${statusFilter === "Pending" ? "active" : ""}`} onClick={() => setStatusFilter("Pending")} style={{ padding: "6px 14px", fontSize: 12, fontWeight: 700 }}>
          Pending / Absent ({pendingCount})
        </button>
      </div>

      <DataTable
        title={statusFilter === "all" ? "Daily Attendance Roster" : `Filtered Attendance (${statusFilter})`}
        right={
          <Button
            className="btn-glow"
            onClick={() => openModal()}
            style={{ padding: "7px 14px", fontSize: 12.5, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6, background: "var(--gradient-primary)", boxShadow: "0 3px 10px rgba(0, 184, 107, 0.3)" }}
          >
            <i className="ri-edit-line" /> Manual Correction
          </Button>
        }
        searchable
        searchPlaceholder="Search employee, warehouse, status..."
        keyField="id"
        rows={filteredRecords}
        emptyMessage="No matching attendance logs found."
        columns={[
          { key: "employee", label: "Employee", emphasize: true, render: (r, idx) => nameCell(r.employee, idx) },
          {
            key: "warehouse",
            label: "Warehouse Hub",
            render: (r) => (
              <span style={{ fontWeight: 600, color: "var(--ink)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                <i className="ri-building-line" style={{ color: "var(--primary)", fontSize: 11 }} />
                {r.warehouse}
              </span>
            ),
          },
          { key: "date", label: "Date" },
          {
            key: "checkIn",
            label: "Check-in Time",
            render: (r) => (
              <span style={{ fontWeight: 600, color: "var(--primary-deep)", display: "inline-flex", alignItems: "center", gap: 5 }}>
                <i className="ri-login-box-line" style={{ fontSize: 11 }} />
                {r.checkIn}
              </span>
            ),
          },
          {
            key: "checkOut",
            label: "Check-out Time",
            render: (r) => (
              <span style={{ fontSize: 12, color: "var(--muted)", display: "inline-flex", alignItems: "center", gap: 5 }}>
                <i className="ri-right-from-bracket-line" style={{ fontSize: 11 }} />
                {r.checkOut}
              </span>
            ),
          },
          { key: "status", label: "Status", render: (r) => <Badge tone={statusTone[r.status] || "warning"}>{r.status.toUpperCase()}</Badge> },
        ]}
      />

      {/* MANUAL CORRECTION MODAL */}
      <Modal open={open} title="Manual Attendance Correction" subtitle="Submit a manual check-in/out adjustment for admin approval." onClose={() => closeModal()}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <FormField
            label="Warehouse Hub"
            type="select"
            required
            disabled={isScopedRole}
            icon="ri-building-line"
            value={form.warehouseId}
            onChange={set("warehouseId")}
            options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
            compact
            marginBottom={10}
          />
          <FormField
            label="Employee"
            type="select"
            required
            icon="ri-user-3-line"
            value={form.employeeId}
            onChange={set("employeeId")}
            options={employeeOptions}
            placeholder={form.warehouseId ? "Select employee" : "Select a warehouse first"}
            compact
            marginBottom={10}
          />
          <FormField label="Date" type="date" required value={form.date} onChange={set("date")} compact marginBottom={10} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }} className="responsive-grid-2">
            <FormField label="Check-in Time" type="time" icon="ri-login-box-line" value={form.checkInTime} onChange={set("checkInTime")} compact marginBottom={10} />
            <FormField label="Check-out Time" type="time" icon="ri-right-from-bracket-line" value={form.checkOutTime} onChange={set("checkOutTime")} compact marginBottom={10} />
          </div>
          <FormField
            label="Reason for Correction"
            type="textarea"
            icon="ri-chat-3-line"
            value={form.reason}
            onChange={set("reason")}
            placeholder="e.g. Device offline at check-in, confirmed present by warehouse admin"
            compact
            marginBottom={12}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
            <Button variant="secondary" type="button" onClick={() => closeModal()} style={{ padding: "7px 14px", fontSize: 12.5 }}>
              <i className="ri-close-line" /> Cancel
            </Button>
            <Button type="submit" disabled={saving} className="btn-glow" style={{ padding: "7px 16px", fontSize: 12.5, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6, background: "var(--gradient-primary)" }}>
              {saving ? (
                <>
                  <i className="ri-loader-4-line spin" /> Submitting…
                </>
              ) : (
                <>
                  <i className="ri-send-plane-line" /> Submit for Approval
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
