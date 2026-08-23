import { useEffect, useMemo, useState } from "react";
import { X, Send, Check, Plus, MessageSquare, Calendar, User, Warehouse, Loader } from "lucide-react";

function LucideIconWrapper({ children, size = 16 }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: size, height: size, flexShrink: 0 }}>
      {children}
    </span>
  );
}
import PageHeader from "../components/common/PageHeader";
import DataTable from "../components/common/DataTable";
import Badge from "../components/common/Badge";
import Avatar from "../components/common/Avatar";
import Modal from "../components/common/Modal";
import FormField from "../components/common/FormField";
import Button from "../components/common/Button";
import AsyncState from "../components/common/AsyncState";
import { useLeaveRequests } from "../features/leaveRequests/useLeaveRequests";
import { useEmployees } from "../features/employees/useEmployees";
import { useWarehouses } from "../features/warehouses/useWarehouses";
import { useDisclosure } from "../hooks/useDisclosure";
import { useAuth } from "../hooks/useAuth";
import { validateOrToast } from "../utils/validate";
import { toast } from "../utils/toast";

const leaveTypeBadge = {
  casual: "info",
  sick: "warning",
  earned: "success",
  maternity: "purple",
  paternity: "purple",
  unpaid: "danger",
  other: "secondary",
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function emptyForm(defaultWarehouseId = "") {
  return {
    warehouseId: defaultWarehouseId,
    employeeId: "",
    leaveType: "casual",
    fromDate: todayIso(),
    toDate: todayIso(),
    reason: "",
  };
}

function nameCell(name, index) {
  if (!name) return "-";
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <Avatar initials={initials} index={index} />
      <span style={{ fontWeight: 700, color: "var(--ink)" }}>{name}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const tone =
    status === "approved"
      ? "success"
      : status === "pending"
        ? "warning"
        : status === "rejected"
          ? "danger"
          : "secondary";
  return <Badge tone={tone}>{status?.toUpperCase()}</Badge>;
}

export default function LeaveRequests() {
  const { user } = useAuth();
  const isScopedRole = user?.roleKey === "supervisor" || user?.roleKey === "warehouse_admin";
  const { warehouses } = useWarehouses();
  const myWarehouse = isScopedRole ? warehouses[0] : null;

  const { leaveRequests, status, error, reload, addLeaveRequest, doReview, summary } = useLeaveRequests();
  const { employees } = useEmployees();
  const { isOpen: open, open: openModal, close: closeModal } = useDisclosure();
  const { isOpen: reviewOpen, open: openReview, close: closeReview } = useDisclosure();
  const [form, setForm] = useState(() => emptyForm());
  const [saving, setSaving] = useState(false);
  const [reviewingId, setReviewingId] = useState(null);
  const [reviewDecision, setReviewDecision] = useState("approved");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    if (isScopedRole && myWarehouse?.id) {
      setForm((f) => (f.warehouseId ? f : { ...f, warehouseId: myWarehouse.id }));
    }
  }, [isScopedRole, myWarehouse?.id]);

  const employeeOptions = useMemo(
    () =>
      employees
        .filter((e) => !form.warehouseId || e.warehouseId === form.warehouseId)
        .map((e) => ({ value: e.id, label: `${e.name} (${e.code})` })),
    [employees, form.warehouseId]
  );

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  async function handleSubmit(e) {
    e.preventDefault();
    const parsed = validateOrToast(
      {
        validate: () => {
          if (!form.employeeId) return { success: false, message: "Select an employee." };
          if (!form.fromDate) return { success: false, message: "From date is required." };
          if (!form.toDate) return { success: false, message: "To date is required." };
          if (form.toDate < form.fromDate) return { success: false, message: "To date cannot be before from date." };
          return { success: true };
        },
      },
      form
    );
    if (!parsed) return;

    setSaving(true);
    try {
      await addLeaveRequest(parsed);
      toast.success("Leave request submitted successfully.");
      setForm(emptyForm(myWarehouse?.id || ""));
      closeModal();
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || err.message || "Could not submit leave request.");
    } finally {
      setSaving(false);
    }
  }

  async function handleReview() {
    if (!reviewingId) return;
    try {
      await doReview(reviewingId, reviewDecision);
      toast.success(`Leave request ${reviewDecision}.`);
      setReviewingId(null);
      closeReview();
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || err.message || "Could not review leave request.");
    }
  }

  const pendingCount = summary?.pending || 0;

  const filteredRecords = leaveRequests.filter((r) => {
    if (filterStatus === "all") return true;
    return r.status === filterStatus;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <PageHeader
        title="Leave Management"
        subtitle={
          isScopedRole
            ? `Leave requests for ${myWarehouse?.name || "your assigned warehouse"}`
            : "Track and approve leave requests across all warehouses"
        }
      />

      <AsyncState status={status} error={error} loadingLabel="Loading leave requests…" />

      {/* SUMMARY TILES */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }} className="responsive-grid-2">
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: "14px 16px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "var(--primary)" }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.4 }}>Total Requests</span>
          <div style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)", marginTop: 6 }}>{summary?.total || 0}</div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: "14px 16px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "#F59E0B" }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.4 }}>Pending Approval</span>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#D97706", marginTop: 6 }}>{summary?.pending || 0}</div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: "14px 16px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "#10B981" }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.4 }}>Approved</span>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#059669", marginTop: 6 }}>{summary?.approved || 0}</div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: "14px 16px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "#EF4444" }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.4 }}>Rejected</span>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#DC2626", marginTop: 6 }}>{summary?.rejected || 0}</div>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="role-picker-container" style={{ width: "auto", marginBottom: 0, background: "var(--surface)", border: "1px solid var(--line)", padding: 3, borderRadius: 10, display: "inline-flex" }}>
        <button type="button" className={`role-picker-option ${filterStatus === "all" ? "active" : ""}`} onClick={() => setFilterStatus("all")} style={{ padding: "6px 14px", fontSize: 12, fontWeight: 700 }}>
          All ({leaveRequests.length})
        </button>
        <button type="button" className={`role-picker-option ${filterStatus === "pending" ? "active" : ""}`} onClick={() => setFilterStatus("pending")} style={{ padding: "6px 14px", fontSize: 12, fontWeight: 700 }}>
          Pending ({pendingCount})
        </button>
        <button type="button" className={`role-picker-option ${filterStatus === "approved" ? "active" : ""}`} onClick={() => setFilterStatus("approved")} style={{ padding: "6px 14px", fontSize: 12, fontWeight: 700 }}>
          Approved ({summary?.approved || 0})
        </button>
        <button type="button" className={`role-picker-option ${filterStatus === "rejected" ? "active" : ""}`} onClick={() => setFilterStatus("rejected")} style={{ padding: "6px 14px", fontSize: 12, fontWeight: 700 }}>
          Rejected ({summary?.rejected || 0})
        </button>
      </div>

      <DataTable
        title="Leave Requests"
        right={
          <Button
            className="btn-glow"
            onClick={openModal}
            style={{ padding: "7px 14px", fontSize: 12.5, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6, background: "var(--gradient-primary)", boxShadow: "0 3px 10px rgba(0, 184, 107, 0.3)" }}
          >
            <LucideIconWrapper size={16}><Plus size={16} /></LucideIconWrapper> New Leave Request
          </Button>
        }
        searchable
        searchPlaceholder="Search employee, leave type, status..."
        keyField="id"
        rows={filteredRecords}
        emptyMessage="No matching leave requests found."
        columns={[
          {
            key: "employee",
            label: "Employee",
            emphasize: true,
            render: (r) => nameCell(r.employeeName, r.employeeName),
          },
          {
            key: "leaveType",
            label: "Type",
            render: (r) => <Badge tone={leaveTypeBadge[r.leaveType] || "secondary"}>{r.leaveType?.toUpperCase()}</Badge>,
          },
          { key: "fromDate", label: "From" },
          { key: "toDate", label: "To" },
          { key: "totalDays", label: "Days" },
          { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
          {
            key: "appliedBy",
            label: "Applied By",
            render: (r) => <span style={{ fontSize: 12 }}>{r.appliedByName}</span>,
          },
          {
            key: "actions",
            label: "",
            render: (r) =>
              r.status === "pending" ? (
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => { setReviewingId(r.id); setReviewDecision("approved"); openReview(); }}
                    style={{ background: "#D1FAE5", color: "#059669", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                    title="Approve"
                  >
                    <LucideIconWrapper size={16}><Check size={16} /></LucideIconWrapper> Approve
                  </button>
                  <button
                    onClick={() => { setReviewingId(r.id); setReviewDecision("rejected"); openReview(); }}
                    style={{ background: "#FEE2E2", color: "#DC2626", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                    title="Reject"
                  >
                    <LucideIconWrapper size={16}><X size={16} /></LucideIconWrapper> Reject
                  </button>
                </div>
              ) : (
                <span style={{ fontSize: 11, color: "var(--muted)" }}>{r.reviewedBy ? `by ${r.reviewedBy}` : ""}</span>
              ),
          },
        ]}
      />

      {/* CREATE LEAVE REQUEST MODAL */}
      <Modal open={open} title="New Leave Request" subtitle="Submit a leave request for an employee." onClose={closeModal}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <FormField
            label="Warehouse Hub"
            type="select"
            required
            disabled={isScopedRole}
            icon={<LucideIconWrapper size={16}><Warehouse size={16} /></LucideIconWrapper>}
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
            icon={<LucideIconWrapper size={16}><User size={16} /></LucideIconWrapper>}
            value={form.employeeId}
            onChange={set("employeeId")}
            options={employeeOptions}
            placeholder={form.warehouseId ? "Select employee" : "Select a warehouse first"}
            compact
            marginBottom={10}
          />
          <FormField
            label="Leave Type"
            type="select"
            icon={<LucideIconWrapper size={16}><Calendar size={16} /></LucideIconWrapper>}
            value={form.leaveType}
            onChange={set("leaveType")}
            options={[
              { value: "casual", label: "Casual" },
              { value: "sick", label: "Sick" },
              { value: "earned", label: "Earned" },
              { value: "maternity", label: "Maternity" },
              { value: "paternity", label: "Paternity" },
              { value: "unpaid", label: "Unpaid" },
              { value: "other", label: "Other" },
            ]}
            compact
            marginBottom={10}
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }} className="responsive-grid-2">
            <FormField label="From Date" type="date" required icon={<LucideIconWrapper size={16}><Calendar size={16} /></LucideIconWrapper>} value={form.fromDate} onChange={set("fromDate")} compact marginBottom={10} />
            <FormField label="To Date" type="date" required icon={<LucideIconWrapper size={16}><Calendar size={16} /></LucideIconWrapper>} value={form.toDate} onChange={set("toDate")} compact marginBottom={10} />
          </div>
          <FormField
            label="Reason (optional)"
            type="textarea"
            icon={<LucideIconWrapper size={16}><MessageSquare size={16} /></LucideIconWrapper>}
            value={form.reason}
            onChange={set("reason")}
            placeholder="Reason for leave..."
            compact
            marginBottom={12}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
            <Button variant="secondary" type="button" onClick={() => closeModal()} style={{ padding: "7px 14px", fontSize: 12.5 }}>
              <LucideIconWrapper size={16}><X size={16} /></LucideIconWrapper> Cancel
            </Button>
            <Button type="submit" disabled={saving} className="btn-glow" style={{ padding: "7px 16px", fontSize: 12.5, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6, background: "var(--gradient-primary)" }}>
              {saving ? (
                <>
                  <LucideIconWrapper size={14}><Loader size={14} /></LucideIconWrapper> Submitting…
                </>
              ) : (
                <>
                  <LucideIconWrapper size={16}><Send size={16} /></LucideIconWrapper> Submit Request
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* REVIEW MODAL */}
      <Modal open={reviewOpen} title={reviewDecision === "approved" ? "Approve Leave Request" : "Reject Leave Request"} onClose={closeReview}>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>
          You are about to <strong>{reviewDecision}</strong> this leave request. This action will be recorded in the audit log.
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
          <Button variant="secondary" type="button" onClick={() => closeReview()} style={{ padding: "7px 14px", fontSize: 12.5 }}>
            <LucideIconWrapper size={16}><X size={16} /></LucideIconWrapper> Cancel
          </Button>
          <Button
            type="button"
            onClick={handleReview}
            style={{
              padding: "7px 16px",
              fontSize: 12.5,
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: reviewDecision === "approved" ? "#059669" : "#DC2626",
              color: "#fff",
              border: "none",
            }}
          >
            {reviewDecision === "approved" ? <LucideIconWrapper size={14}><Check size={14} /></LucideIconWrapper> : <LucideIconWrapper size={14}><X size={14} /></LucideIconWrapper>} {reviewDecision === "approved" ? "Approve" : "Reject"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
