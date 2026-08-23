import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Users, CircleCheck, CircleX, Clock, Plus, Warehouse as WarehouseIcon } from "lucide-react";
import PageHeader from "../components/common/PageHeader";
import DataTable from "../components/common/DataTable";
import Badge from "../components/common/Badge";
import Avatar from "../components/common/Avatar";
import Modal from "../components/common/Modal";
import FormField from "../components/common/FormField";
import Button from "../components/common/Button";
import AsyncState from "../components/common/AsyncState";
import {
  StatCard,
  SectionHeader,
  QuickAction,
  StaggerContainer,
} from "../components/design-system/index";
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

function LucideIconWrapper({ children, size = 16 }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: size, height: size, flexShrink: 0 }}>
      {children}
    </span>
  );
}

export default function Attendance() {
  const { user } = useAuth();
  const isScopedRole = user?.roleKey === "supervisor" || user?.roleKey === "warehouse_admin";
  const { warehouses } = useWarehouses();
  const myWarehouse = isScopedRole ? warehouses[0] : null;

  const { records, status, error, addRecord, summary } = useAttendance();
  const { employees } = useEmployees();
  const { isOpen: open, open: openModal, close: closeModal } = useDisclosure();
  const [form, setForm] = useState(() => emptyForm());
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

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

  const presentCount = summary?.present || 0;
  const absentCount = summary?.absent || 0;
  const lateCount = summary?.late || 0;
  const pendingCount = summary?.pending || 0;
  const attendanceRate = summary?.attendanceRate || 0;
  const totalEmployees = summary?.totalEmployees || 0;

  const presentPct = totalEmployees > 0 ? ((presentCount / totalEmployees) * 100).toFixed(0) : "0";
  const latePct = totalEmployees > 0 ? ((lateCount / totalEmployees) * 100).toFixed(0) : "0";
  const pendingPct = totalEmployees > 0 ? ((pendingCount / totalEmployees) * 100).toFixed(0) : "0";

  const filteredRecords = records.filter((r) => {
    if (statusFilter === "Present") return r.status === "Present";
    if (statusFilter === "Late") return r.status === "Late";
    if (statusFilter === "Pending") return r.status === "Pending" || r.status === "Absent";
    return true;
  });

  const kpiCards = [
    {
      label: "Total Staff",
      value: `${totalEmployees}`,
      trend: "Active Employees",
      icon: <LucideIconWrapper><Users size={16} /></LucideIconWrapper>,
      color: "#3B82F6",
    },
    {
      label: "Present Today",
      value: `${presentCount}`,
      trend: `${presentPct}% attendance rate`,
      icon: <LucideIconWrapper><CircleCheck size={16} /></LucideIconWrapper>,
      color: "#10B981",
      progressPct: Number(presentPct),
    },
    {
      label: "Absent",
      value: `${absentCount}`,
      trend: "Marked absent",
      icon: <LucideIconWrapper><CircleX size={16} /></LucideIconWrapper>,
      color: "#EF4444",
    },
    {
      label: "Pending Review",
      value: `${pendingCount}`,
      trend: "Awaiting approval",
      icon: <LucideIconWrapper><Clock size={16} /></LucideIconWrapper>,
      color: "#F59E0B",
    },
  ];

  return (
    <motion.div style={{ display: "flex", flexDirection: "column", gap: 14 }} initial="hidden" animate="visible">
      <PageHeader
        title="Daily Attendance"
        subtitle={
          isScopedRole
            ? `Corrections for ${myWarehouse?.name || "your warehouse"}`
            : "Corrections across all warehouses, pending Warehouse Admin sign-off"
        }
      />

      <AsyncState status={status} error={error} loadingLabel="Loading attendance records..." />

      {/* KPI STAT CARDS */}
      <motion.div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }} className="responsive-grid-2">
        <StaggerContainer>
          {kpiCards.map((cfg) => (
            <StatCard key={cfg.label} {...cfg} />
          ))}
        </StaggerContainer>
      </motion.div>

      {/* Attendance Rate Bar */}
      <motion.div
        variants={slideUp}
        style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "14px 16px" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)" }}>Attendance Rate</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: attendanceRate >= 80 ? "#059669" : attendanceRate >= 50 ? "#D97706" : "#DC2626" }}>{attendanceRate}%</span>
        </div>
        <div style={{ width: "100%", height: 6, background: "var(--line)", borderRadius: 3, overflow: "hidden" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, attendanceRate)}%` }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            style={{ height: "100%", borderRadius: 3, background: attendanceRate >= 80 ? "#10B981" : attendanceRate >= 50 ? "#F59E0B" : "#EF4444" }}
          />
        </div>
      </motion.div>

      {/* Data Table */}
      <SectionHeader
        title="Attendance Roster"
        subtitle={`${records.length} records`}
        action={
          <QuickAction icon={<Plus size={13} />} label="Manual Correction" onClick={openModal} color="#10B981" />
        }
      />

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
        {["all", "Present", "Late", "Pending"].map((tab) => {
          const count = tab === "all" ? records.length : tab === "Present" ? presentCount : tab === "Late" ? lateCount : pendingCount;
          return (
            <motion.button
              key={tab}
              whileTap={{ scale: 0.97 }}
              onClick={() => setStatusFilter(tab)}
              style={{
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 700,
                borderRadius: 8,
                border: "none",
                background: statusFilter === tab ? "var(--primary)" : "var(--canvas)",
                color: statusFilter === tab ? "#fff" : "var(--ink)",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                boxShadow: statusFilter === tab ? "0 2px 8px var(--primary-light)" : "none",
                transition: "all 0.2s ease",
              }}
            >
              {tab === "Present" && <CircleCheck size={12} />}
              {tab === "Late" && <Clock size={12} />}
              {tab === "Pending" && <CircleX size={12} />}
              {tab === "all" && <Users size={12} />}
              {tab} ({count})
            </motion.button>
          );
        })}
      </div>

      <motion.div variants={fadeIn}>
        <DataTable
          keyField="id"
          rows={filteredRecords}
          emptyTitle="No matching attendance logs"
          emptyDesc="Try adjusting filters or add a correction."
          columns={[
            { key: "employee", label: "Employee", render: (r, idx) => nameCell(r.employee, idx) },
            {
              key: "warehouse",
              label: "Hub",
              render: (r) => (
                <span style={{ fontWeight: 600, color: "var(--primary-deep)", display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <LucideIconWrapper><WarehouseIcon size={12} /></LucideIconWrapper>
                  {r.warehouse}
                </span>
              ),
            },
            { key: "date", label: "Date" },
            {
              key: "checkIn",
              label: "Check-in",
              render: (r) => (
                <span style={{ fontWeight: 600, color: "var(--primary-deep)" }}>{r.checkIn}</span>
              ),
            },
            {
              key: "checkOut",
              label: "Check-out",
              render: (r) => (
                <span style={{ fontSize: 12, color: "var(--muted)" }}>{r.checkOut}</span>
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (r) => <Badge tone={statusTone[r.status] || "warning"}>{r.status?.toUpperCase()}</Badge>,
            },
          ]}
        />
      </motion.div>

      {/* MANUAL CORRECTION MODAL */}
      <Modal open={open} title="Manual Attendance Correction" subtitle="Submit a check-in/out adjustment for admin approval." onClose={() => closeModal()}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <FormField
            label="Warehouse Hub"
            type="select"
            required
            disabled={isScopedRole}
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
            value={form.employeeId}
            onChange={set("employeeId")}
            options={employeeOptions}
            placeholder={form.warehouseId ? "Select employee" : "Select warehouse first"}
            compact
            marginBottom={10}
          />
          <FormField label="Date" type="date" required value={form.date} onChange={set("date")} compact marginBottom={10} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }} className="responsive-grid-2">
            <FormField label="Check-in Time" type="time" value={form.checkInTime} onChange={set("checkInTime")} compact marginBottom={10} />
            <FormField label="Check-out Time" type="time" value={form.checkOutTime} onChange={set("checkOutTime")} compact marginBottom={10} />
          </div>
          <FormField
            label="Reason for Correction"
            type="textarea"
            value={form.reason}
            onChange={set("reason")}
            placeholder="e.g. Device offline at check-in, confirmed present"
            compact
            marginBottom={12}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
            <Button variant="secondary" type="button" onClick={() => closeModal()} style={{ padding: "7px 14px", fontSize: 12.5 }}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} style={{ padding: "7px 16px", fontSize: 12.5, fontWeight: 700, background: "var(--primary)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>
              {saving ? "Submitting..." : "Submit for Approval"}
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
