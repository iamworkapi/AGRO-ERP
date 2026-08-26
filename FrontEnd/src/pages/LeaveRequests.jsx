import { useState } from "react";
import PageHeader from "../components/common/PageHeader";
import DataTable from "../components/common/DataTable";
import Badge from "../components/common/Badge";
import Avatar from "../components/common/Avatar";
import Modal from "../components/common/Modal";
import FormField from "../components/common/FormField";
import Button from "../components/common/Button";
import AsyncState from "../components/common/AsyncState";
import { useEmployees } from "../features/employees/useEmployees";
import { useAuth } from "../hooks/useAuth";
import { useDisclosure } from "../hooks/useDisclosure";
import { toast } from "../utils/toast";

const LEAVE_ICONS = {
  "Casual Leave": "ri-sun-cloudy-line",
  "Sick Leave": "ri-nurse-line",
  "Earned Leave": "ri-flight-takeoff-line",
  "Emergency Leave": "ri-first-aid-kit-line",
};

const LEAVE_TONES = {
  Approved: "success",
  Pending: "warning",
  Rejected: "error",
};

function emptyForm(defaultWarehouse = "Manimau Centre") {
  return {
    employee: "",
    warehouse: defaultWarehouse,
    type: "Casual Leave",
    startDate: "",
    endDate: "",
    days: 1,
    reason: "",
  };
}

function nameCell(name, index) {
  const initials = name ? name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() : "EM";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <Avatar initials={initials} index={index} />
      <span style={{ fontWeight: 700, color: "var(--ink)" }}>{name}</span>
    </div>
  );
}

export default function LeaveRequests() {
  const { user } = useAuth();
  const isSupervisor = user?.roleKey === "supervisor" || user?.role === "Supervisor";
  const assignedHub = user?.warehouse || "Manimau Centre";

  const { leaveRequests, employees, status, error, approveLeave, rejectLeave, createLeave } = useEmployees();
  const { isOpen: open, open: openModal, close: closeModal } = useDisclosure();
  const [form, setForm] = useState(() => emptyForm(assignedHub));
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "Pending" | "Approved" | "Rejected"

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  // Scope leave requests for Supervisor if applicable
  const scopedRequests = isSupervisor
    ? leaveRequests.filter((r) => r.warehouse === assignedHub || r.warehouse?.includes(assignedHub.split(" ")[0]))
    : leaveRequests;

  const pendingCount = scopedRequests.filter((r) => r.status === "Pending").length;
  const approvedCount = scopedRequests.filter((r) => r.status === "Approved").length;
  const rejectedCount = scopedRequests.filter((r) => r.status === "Rejected").length;
  const totalCount = scopedRequests.length || 1;

  const pendingPct = ((pendingCount / totalCount) * 100).toFixed(0);
  const approvedPct = ((approvedCount / totalCount) * 100).toFixed(0);
  const rejectedPct = ((rejectedCount / totalCount) * 100).toFixed(0);

  const filteredRequests = scopedRequests.filter((r) => {
    if (statusFilter === "Pending") return r.status === "Pending";
    if (statusFilter === "Approved") return r.status === "Approved";
    if (statusFilter === "Rejected") return r.status === "Rejected";
    return true;
  });

  async function handleApprove(record) {
    setBusyId(record.id || record.employee);
    try {
      await approveLeave(record.id || record.employee);
      toast.success(`Leave request for ${record.employee} approved successfully.`);
    } catch (err) {
      toast.error(err?.message || "Could not approve leave request.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(record) {
    setBusyId(record.id || record.employee);
    try {
      await rejectLeave(record.id || record.employee);
      toast.success(`Leave request for ${record.employee} rejected.`);
    } catch (err) {
      toast.error(err?.message || "Could not reject leave request.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.employee || !form.reason) {
      toast.error("Please fill in employee name and leave reason.");
      return;
    }

    setSaving(true);
    try {
      const datesStr = form.startDate && form.endDate
        ? `${form.startDate} to ${form.endDate}`
        : form.startDate || "Upcoming";

      await createLeave({
        employee: form.employee,
        warehouse: isSupervisor ? assignedHub : form.warehouse,
        type: form.type,
        dates: datesStr,
        days: form.days || 1,
        reason: form.reason,
      });

      toast.success(`Leave application submitted for ${form.employee}.`);
      setForm(emptyForm(assignedHub));
      closeModal();
    } catch (err) {
      toast.error(err?.message || "Could not submit leave request.");
    } finally {
      setSaving(false);
    }
  }

  const employeeOptions = employees.length > 0
    ? employees.map((e) => e.name)
    : ["Anita Prasad", "Rajesh Yadav", "Manoj Kumar", "Sunita Devi", "Karan Singh"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <PageHeader
        title={isSupervisor ? `Employee Leave Management — ${assignedHub}` : "Employee Leave Management"}
        subtitle={
          isSupervisor
            ? `Review, approve, and track employee leave applications for ${assignedHub}`
            : "Submit, review, and manage employee leave applications across all warehouse hubs"
        }
      />

      <AsyncState status={status} error={error} loadingLabel="Loading leave requests…" />

      {/* HIGH-GLOW EXECUTIVE 4 STAT METRICS CARDS WITH INTERACTIVE FILTERING */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }} className="responsive-grid-2">
        
        {/* CARD 1: PENDING APPROVALS */}
        <div
          onClick={() => setStatusFilter("Pending")}
          style={{
            background: "var(--surface)",
            border: statusFilter === "Pending" ? "2px solid #F59E0B" : "1px solid rgba(245,158,11,0.2)",
            borderRadius: 16,
            padding: "16px 18px",
            boxShadow: statusFilter === "Pending" ? "0 12px 30px -4px rgba(245, 158, 11, 0.25)" : "0 6px 20px -2px rgba(0,0,0,0.04)",
            cursor: "pointer",
            position: "relative",
            overflow: "hidden",
            transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "#F59E0B", boxShadow: "0 2px 10px rgba(245, 158, 11, 0.5)" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.4 }}>
              Pending Review
            </span>
            <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 7px", borderRadius: 10, background: "#FEF3C7", color: "#D97706", border: "1px solid rgba(245,158,11,0.3)" }}>
              {pendingPct}% Action Needed
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", textShadow: "0 2px 10px rgba(245,158,11,0.2)" }}>{pendingCount} Requests</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Awaiting Approval</div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "#FEF3C7", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, border: "1px solid rgba(245,158,11,0.3)", boxShadow: "0 0 14px rgba(245,158,11,0.35)", flexShrink: 0 }}>
              <i className="ri-time-line-rotate-left" />
            </div>
          </div>

          <div style={{ width: "100%", height: 4, background: "var(--line)", borderRadius: 2, marginTop: 12, overflow: "hidden" }}>
            <div style={{ width: `${pendingPct}%`, height: "100%", background: "#F59E0B", borderRadius: 2, boxShadow: "0 0 8px rgba(245,158,11,0.8)", transition: "width 0.4s ease" }} />
          </div>
        </div>

        {/* CARD 2: APPROVED LEAVES */}
        <div
          onClick={() => setStatusFilter("Approved")}
          style={{
            background: "var(--surface)",
            border: statusFilter === "Approved" ? "2px solid #10B981" : "1px solid rgba(16,185,129,0.2)",
            borderRadius: 16,
            padding: "16px 18px",
            boxShadow: statusFilter === "Approved" ? "0 12px 30px -4px rgba(16, 185, 129, 0.25)" : "0 6px 20px -2px rgba(0,0,0,0.04)",
            cursor: "pointer",
            position: "relative",
            overflow: "hidden",
            transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "#10B981", boxShadow: "0 2px 10px rgba(16, 185, 129, 0.5)" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.4 }}>
              Approved Leaves
            </span>
            <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 7px", borderRadius: 10, background: "#D1FAE5", color: "#059669", border: "1px solid rgba(16,185,129,0.3)" }}>
              {approvedPct}% Granted
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", textShadow: "0 2px 10px rgba(16,185,129,0.2)" }}>{approvedCount}</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Verified Leave Sanctions</div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "#D1FAE5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, border: "1px solid rgba(16,185,129,0.3)", boxShadow: "0 0 14px rgba(16,185,129,0.35)", flexShrink: 0 }}>
              <i className="ri-checkbox-circle-fill" />
            </div>
          </div>

          <div style={{ width: "100%", height: 4, background: "var(--line)", borderRadius: 2, marginTop: 12, overflow: "hidden" }}>
            <div style={{ width: `${approvedPct}%`, height: "100%", background: "#10B981", borderRadius: 2, boxShadow: "0 0 8px rgba(16,185,129,0.8)", transition: "width 0.4s ease" }} />
          </div>
        </div>

        {/* CARD 3: REJECTED LEAVES */}
        <div
          onClick={() => setStatusFilter("Rejected")}
          style={{
            background: "var(--surface)",
            border: statusFilter === "Rejected" ? "2px solid #EF4444" : "1px solid rgba(239,68,68,0.2)",
            borderRadius: 16,
            padding: "16px 18px",
            boxShadow: statusFilter === "Rejected" ? "0 12px 30px -4px rgba(239, 68, 68, 0.25)" : "0 6px 20px -2px rgba(0,0,0,0.04)",
            cursor: "pointer",
            position: "relative",
            overflow: "hidden",
            transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "#EF4444", boxShadow: "0 2px 10px rgba(239, 68, 68, 0.5)" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.4 }}>
              Disapproved / Declined
            </span>
            <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 7px", borderRadius: 10, background: "#FEE2E2", color: "#EF4444", border: "1px solid rgba(239,68,68,0.3)" }}>
              {rejectedPct}% Rejected
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", textShadow: "0 2px 10px rgba(239,68,68,0.2)" }}>{rejectedCount}</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Declined Applications</div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "#FEE2E2", color: "#EF4444", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, border: "1px solid rgba(239,68,68,0.3)", boxShadow: "0 0 14px rgba(239,68,68,0.35)", flexShrink: 0 }}>
              <i className="ri-close-circle-line" />
            </div>
          </div>

          <div style={{ width: "100%", height: 4, background: "var(--line)", borderRadius: 2, marginTop: 12, overflow: "hidden" }}>
            <div style={{ width: `${rejectedPct}%`, height: "100%", background: "#EF4444", borderRadius: 2, boxShadow: "0 0 8px rgba(239,68,68,0.8)", transition: "width 0.4s ease" }} />
          </div>
        </div>

        {/* CARD 4: TOTAL APPLICATIONS */}
        <div
          onClick={() => setStatusFilter("all")}
          style={{
            background: "var(--surface)",
            border: statusFilter === "all" ? "2px solid #3B82F6" : "1px solid rgba(59,130,246,0.2)",
            borderRadius: 16,
            padding: "16px 18px",
            boxShadow: statusFilter === "all" ? "0 12px 30px -4px rgba(59, 130, 246, 0.25)" : "0 6px 20px -2px rgba(0,0,0,0.04)",
            cursor: "pointer",
            position: "relative",
            overflow: "hidden",
            transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg, #1D4ED8 0%, #3B82F6 100%)", boxShadow: "0 2px 10px rgba(59, 130, 246, 0.5)" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.4 }}>
              Total Applications
            </span>
            <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 7px", borderRadius: 10, background: "#EFF6FF", color: "#2563EB", border: "1px solid rgba(59,130,246,0.3)" }}>
              100% Total
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", textShadow: "0 2px 10px rgba(59,130,246,0.2)" }}>{scopedRequests.length}</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Leave Quota Register</div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "#EFF6FF", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, border: "1px solid rgba(59,130,246,0.3)", boxShadow: "0 0 14px rgba(59,130,246,0.35)", flexShrink: 0 }}>
              <i className="ri-calendar-line-minus" />
            </div>
          </div>

          <div style={{ width: "100%", height: 4, background: "var(--line)", borderRadius: 2, marginTop: 12, overflow: "hidden" }}>
            <div style={{ width: "100%", height: "100%", background: "linear-gradient(90deg, #1D4ED8 0%, #3B82F6 100%)", borderRadius: 2, boxShadow: "0 0 8px rgba(59,130,246,0.8)" }} />
          </div>
        </div>

      </div>

      {/* FILTER TABS & DATATABLE */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
          <div className="role-picker-container" style={{ width: "auto", marginBottom: 0, background: "var(--surface)", border: "1px solid var(--line)", padding: 3, borderRadius: 10 }}>
            <button
              type="button"
              className={`role-picker-option ${statusFilter === "all" ? "active" : ""}`}
              onClick={() => setStatusFilter("all")}
              style={{ padding: "6px 14px", fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <i className="ri-list-check" style={{ fontSize: 11 }} /> All Applications ({scopedRequests.length})
            </button>
            <button
              type="button"
              className={`role-picker-option ${statusFilter === "Pending" ? "active" : ""}`}
              onClick={() => setStatusFilter("Pending")}
              style={{ padding: "6px 14px", fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <i className="ri-time-line-rotate-left" style={{ fontSize: 11 }} /> Pending ({pendingCount})
            </button>
            <button
              type="button"
              className={`role-picker-option ${statusFilter === "Approved" ? "active" : ""}`}
              onClick={() => setStatusFilter("Approved")}
              style={{ padding: "6px 14px", fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <i className="ri-checkbox-circle-fill" style={{ fontSize: 11 }} /> Approved ({approvedCount})
            </button>
            <button
              type="button"
              className={`role-picker-option ${statusFilter === "Rejected" ? "active" : ""}`}
              onClick={() => setStatusFilter("Rejected")}
              style={{ padding: "6px 14px", fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <i className="ri-close-circle-line" style={{ fontSize: 11 }} /> Rejected ({rejectedCount})
            </button>
          </div>
        </div>

        <DataTable
          title={statusFilter === "all" ? "Leave Applications Directory" : `Leave Applications (${statusFilter.toUpperCase()})`}
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
              <i className="ri-calendar-line-plus" /> Apply for Leave
            </Button>
          }
          searchable
          searchPlaceholder="Search employee, leave type, warehouse, status..."
          keyField="id"
          rows={filteredRequests}
          emptyMessage="No matching leave applications found."
          columns={[
            {
              key: "employee",
              label: "Employee",
              emphasize: true,
              render: (r, idx) => nameCell(r.employee, idx),
            },
            {
              key: "type",
              label: "Leave Category",
              render: (r) => (
                <span style={{ fontWeight: 600, color: "var(--ink)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i className={LEAVE_ICONS[r.type] || "ri-calendar-line-day"} style={{ color: "var(--primary)", fontSize: 11 }} />
                  {r.type}
                </span>
              ),
            },
            {
              key: "warehouse",
              label: "Warehouse Hub",
              render: (r) => (
                <span style={{ fontWeight: 600, color: "var(--primary-deep)", display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <i className="ri-building-line" style={{ fontSize: 11 }} />
                  {r.warehouse || assignedHub}
                </span>
              ),
            },
            {
              key: "dates",
              label: "Leave Schedule",
              render: (r) => (
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink)" }}>
                    <i className="ri-calendar-line" style={{ fontSize: 11, marginRight: 5, color: "var(--muted)" }} />
                    {r.dates}
                  </span>
                  {r.days && (
                    <span style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 600 }}>
                      Duration: {r.days} {r.days === 1 ? "Day" : "Days"}
                    </span>
                  )}
                </div>
              ),
            },
            {
              key: "reason",
              label: "Reason / Notes",
              sortable: false,
              render: (r) => (
                <span style={{ fontSize: 12, color: "var(--ink-secondary)", fontStyle: r.reason ? "normal" : "italic" }}>
                  {r.reason || "No note provided"}
                </span>
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (r) => (
                <Badge tone={LEAVE_TONES[r.status] || "warning"}>
                  {r.status ? r.status.toUpperCase() : "PENDING"}
                </Badge>
              ),
            },
            {
              key: "actions",
              label: "Action",
              sortable: false,
              render: (r) => (
                <div style={{ display: "flex", gap: 6 }}>
                  {r.status === "Pending" ? (
                    <>
                      <Button
                        variant="secondary"
                        disabled={busyId === (r.id || r.employee)}
                        onClick={() => handleApprove(r)}
                        style={{ padding: "4px 10px", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4, background: "var(--primary-tint)", color: "var(--primary-deep)", borderColor: "var(--primary)" }}
                      >
                        <i className="ri-check-line" /> Approve
                      </Button>
                      <Button
                        variant="secondary"
                        disabled={busyId === (r.id || r.employee)}
                        onClick={() => handleReject(r)}
                        style={{ padding: "4px 10px", fontSize: 11, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4, color: "#EF4444", borderColor: "#FEE2E2", background: "#FEF2F2" }}
                      >
                        <i className="ri-close-line" /> Reject
                      </Button>
                    </>
                  ) : (
                    <span style={{ fontSize: 11.5, color: "var(--muted)", fontStyle: "italic" }}>Reviewed</span>
                  )}
                </div>
              ),
            },
          ]}
        />
      </div>

      {/* APPLY FOR LEAVE MODAL */}
      <Modal
        open={open}
        title="Apply for Employee Leave"
        subtitle="Submit a formal leave request for warehouse staff or field employees"
        onClose={() => closeModal()}
      >
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <FormField
            label="Employee Name"
            type="select"
            required
            icon="ri-user-3-line"
            value={form.employee}
            onChange={set("employee")}
            options={employeeOptions}
            placeholder="Select staff member"
            compact
            marginBottom={10}
          />

          <FormField
            label="Warehouse Hub"
            type="select"
            required
            disabled={isSupervisor}
            icon="ri-building-line"
            value={isSupervisor ? assignedHub : form.warehouse}
            onChange={set("warehouse")}
            options={isSupervisor ? [assignedHub] : ["Manimau Centre", "Betiya Hata Store", "Sai Complex Yard", "Gorakhpur North"]}
            compact
            marginBottom={10}
          />

          <FormField
            label="Leave Category"
            type="select"
            required
            icon="ri-stack-line"
            value={form.type}
            onChange={set("type")}
            options={["Casual Leave", "Sick Leave", "Earned Leave", "Emergency Leave"]}
            compact
            marginBottom={10}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }} className="responsive-grid-2">
            <FormField
              label="Start Date"
              type="date"
              icon="ri-calendar-line-day"
              value={form.startDate}
              onChange={set("startDate")}
              compact
              marginBottom={10}
            />
            <FormField
              label="End Date"
              type="date"
              icon="ri-calendar-line-day"
              value={form.endDate}
              onChange={set("endDate")}
              compact
              marginBottom={10}
            />
          </div>

          <FormField
            label="Reason for Leave"
            type="textarea"
            required
            icon="ri-chat-3-line"
            value={form.reason}
            onChange={set("reason")}
            placeholder="Provide brief details regarding reason for leave application..."
            compact
            marginBottom={12}
          />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
            <Button variant="secondary" type="button" onClick={() => closeModal()} style={{ padding: "7px 14px", fontSize: 12.5 }}>
              <i className="ri-close-line" /> Cancel
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
                  <i className="ri-loader-4-line spin" /> Submitting…
                </>
              ) : (
                <>
                  <i className="ri-send-plane-line" /> Submit Request
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
