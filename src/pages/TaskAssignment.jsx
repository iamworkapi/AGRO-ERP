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

const CATEGORY_ICONS = {
  Field: "fa-solid fa-tractor",
  Inventory: "fa-solid fa-boxes-stacked",
  Weighment: "fa-solid fa-scale-balanced",
  General: "fa-solid fa-clipboard-check",
};

const PRIORITY_TONES = {
  High: "error",
  Medium: "warning",
  Normal: "info",
};

const STATUS_TONES = {
  Completed: "success",
  "In Progress": "warning",
  "Not Started": "neutral",
};

function emptyTaskForm(defaultWarehouse = "Manimau Centre") {
  return {
    task: "",
    assignedTo: "",
    warehouse: defaultWarehouse,
    category: "General",
    priority: "Normal",
    dueDate: "",
    description: "",
  };
}

function nameCell(name, index) {
  const initials = name
    ? name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "ST";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <Avatar initials={initials} index={index} />
      <span style={{ fontWeight: 700, color: "var(--ink)", fontSize: 13 }}>{name}</span>
    </div>
  );
}

export default function TaskAssignment() {
  const { user } = useAuth();
  const isSupervisor = user?.roleKey === "supervisor" || user?.role === "Supervisor";
  const assignedHub = user?.warehouse || "Manimau Centre";

  const { tasks, employees, status, error, createTask, completeTask } = useEmployees();
  const { isOpen: open, open: openModal, close: closeModal } = useDisclosure();
  const [form, setForm] = useState(() => emptyTaskForm(assignedHub));
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "In Progress" | "Not Started" | "Completed" | "High"

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  // Scope tasks for Supervisor to their assigned warehouse
  const scopedTasks = isSupervisor
    ? tasks.filter((t) => t.warehouse === assignedHub || t.warehouse?.includes(assignedHub.split(" ")[0]))
    : tasks;

  const inProgressCount = scopedTasks.filter((t) => t.status === "In Progress").length;
  const completedCount = scopedTasks.filter((t) => t.status === "Completed").length;
  const notStartedCount = scopedTasks.filter((t) => t.status === "Not Started").length;
  const highPriorityCount = scopedTasks.filter((t) => t.priority === "High").length;
  const totalCount = scopedTasks.length || 1;

  const inProgressPct = ((inProgressCount / totalCount) * 100).toFixed(0);
  const completedPct = ((completedCount / totalCount) * 100).toFixed(0);
  const highPriorityPct = ((highPriorityCount / totalCount) * 100).toFixed(0);

  const filteredTasks = scopedTasks.filter((t) => {
    if (statusFilter === "In Progress") return t.status === "In Progress";
    if (statusFilter === "Not Started") return t.status === "Not Started";
    if (statusFilter === "Completed") return t.status === "Completed";
    if (statusFilter === "High") return t.priority === "High";
    return true;
  });

  async function handleComplete(taskRecord) {
    setBusyId(taskRecord.id || taskRecord.task);
    try {
      await completeTask(taskRecord.id || taskRecord.task);
      toast.success(`Task "${taskRecord.task}" marked completed.`);
    } catch (err) {
      toast.error(err?.message || "Could not complete task.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.task || !form.assignedTo) {
      toast.error("Please enter task title and select an employee.");
      return;
    }

    setSaving(true);
    try {
      await createTask({
        task: form.task,
        assignedTo: form.assignedTo,
        warehouse: isSupervisor ? assignedHub : form.warehouse,
        category: form.category,
        priority: form.priority,
        due: form.dueDate || "Today",
        description: form.description,
      });

      toast.success(`Task assigned to ${form.assignedTo} successfully.`);
      setForm(emptyTaskForm(assignedHub));
      closeModal();
    } catch (err) {
      toast.error(err?.message || "Could not assign task.");
    } finally {
      setSaving(false);
    }
  }

  const staffOptions = employees.length > 0
    ? employees.map((e) => e.name)
    : ["Sunita Devi", "Manoj Kumar", "Rajesh Yadav", "Karan Singh", "Anita Prasad"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <PageHeader
        title={isSupervisor ? `Operational Task Assignment — ${assignedHub}` : "Operational Task Assignment"}
        subtitle={
          isSupervisor
            ? `Assign, track, and dispatch operational tasks for ${assignedHub} staff crews`
            : "Assign, track, and dispatch operational tasks for warehouse staff & field crews"
        }
      />

      <AsyncState status={status} error={error} loadingLabel="Loading task roster…" />

      {/* HIGH-GLOW EXECUTIVE 4 STAT METRICS CARDS WITH INTERACTIVE FILTERING */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }} className="responsive-grid-2">
        
        {/* CARD 1: IN PROGRESS */}
        <div
          onClick={() => setStatusFilter("In Progress")}
          style={{
            background: "var(--surface)",
            border: statusFilter === "In Progress" ? "2px solid #F59E0B" : "1px solid rgba(245,158,11,0.2)",
            borderRadius: 16,
            padding: "16px 18px",
            boxShadow: statusFilter === "In Progress" ? "0 12px 30px -4px rgba(245, 158, 11, 0.25)" : "0 6px 20px -2px rgba(0,0,0,0.04)",
            cursor: "pointer",
            position: "relative",
            overflow: "hidden",
            transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "#F59E0B", boxShadow: "0 2px 10px rgba(245, 158, 11, 0.5)" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.4 }}>
              Active Tasks
            </span>
            <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 7px", borderRadius: 10, background: "#FEF3C7", color: "#D97706", border: "1px solid rgba(245,158,11,0.3)" }}>
              {inProgressPct}% In Progress
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", textShadow: "0 2px 10px rgba(245,158,11,0.2)" }}>{inProgressCount} Tasks</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Ongoing Operations</div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "#FEF3C7", color: "#D97706", display: "flex", alignItems: "center", justify: "center", fontSize: 16, border: "1px solid rgba(245,158,11,0.3)", boxShadow: "0 0 14px rgba(245,158,11,0.35)", flexShrink: 0 }}>
              <i className="fa-solid fa-spinner spin" />
            </div>
          </div>

          <div style={{ width: "100%", height: 4, background: "var(--line)", borderRadius: 2, marginTop: 12, overflow: "hidden" }}>
            <div style={{ width: `${inProgressPct}%`, height: "100%", background: "#F59E0B", borderRadius: 2, boxShadow: "0 0 8px rgba(245,158,11,0.8)", transition: "width 0.4s ease" }} />
          </div>
        </div>

        {/* CARD 2: COMPLETED TASKS */}
        <div
          onClick={() => setStatusFilter("Completed")}
          style={{
            background: "var(--surface)",
            border: statusFilter === "Completed" ? "2px solid #10B981" : "1px solid rgba(16,185,129,0.2)",
            borderRadius: 16,
            padding: "16px 18px",
            boxShadow: statusFilter === "Completed" ? "0 12px 30px -4px rgba(16, 185, 129, 0.25)" : "0 6px 20px -2px rgba(0,0,0,0.04)",
            cursor: "pointer",
            position: "relative",
            overflow: "hidden",
            transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "#10B981", boxShadow: "0 2px 10px rgba(16, 185, 129, 0.5)" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.4 }}>
              Completed Tasks
            </span>
            <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 7px", borderRadius: 10, background: "#D1FAE5", color: "#059669", border: "1px solid rgba(16,185,129,0.3)" }}>
              {completedPct}% Completed
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", textShadow: "0 2px 10px rgba(16,185,129,0.2)" }}>{completedCount}</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Verified Finished Tasks</div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "#D1FAE5", color: "#059669", display: "flex", alignItems: "center", justify: "center", fontSize: 16, border: "1px solid rgba(16,185,129,0.3)", boxShadow: "0 0 14px rgba(16,185,129,0.35)", flexShrink: 0 }}>
              <i className="fa-solid fa-circle-check" />
            </div>
          </div>

          <div style={{ width: "100%", height: 4, background: "var(--line)", borderRadius: 2, marginTop: 12, overflow: "hidden" }}>
            <div style={{ width: `${completedPct}%`, height: "100%", background: "#10B981", borderRadius: 2, boxShadow: "0 0 8px rgba(16,185,129,0.8)", transition: "width 0.4s ease" }} />
          </div>
        </div>

        {/* CARD 3: HIGH PRIORITY TASKS */}
        <div
          onClick={() => setStatusFilter("High")}
          style={{
            background: "var(--surface)",
            border: statusFilter === "High" ? "2px solid #EF4444" : "1px solid rgba(239,68,68,0.2)",
            borderRadius: 16,
            padding: "16px 18px",
            boxShadow: statusFilter === "High" ? "0 12px 30px -4px rgba(239, 68, 68, 0.25)" : "0 6px 20px -2px rgba(0,0,0,0.04)",
            cursor: "pointer",
            position: "relative",
            overflow: "hidden",
            transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "#EF4444", boxShadow: "0 2px 10px rgba(239, 68, 68, 0.5)" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.4 }}>
              Urgent / High Priority
            </span>
            <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 7px", borderRadius: 10, background: "#FEE2E2", color: "#EF4444", border: "1px solid rgba(239,68,68,0.3)" }}>
              {highPriorityPct}% Urgent
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", textShadow: "0 2px 10px rgba(239,68,68,0.2)" }}>{highPriorityCount}</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>High Priority Items</div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "#FEE2E2", color: "#EF4444", display: "flex", alignItems: "center", justify: "center", fontSize: 16, border: "1px solid rgba(239,68,68,0.3)", boxShadow: "0 0 14px rgba(239,68,68,0.35)", flexShrink: 0 }}>
              <i className="fa-solid fa-triangle-exclamation" />
            </div>
          </div>

          <div style={{ width: "100%", height: 4, background: "var(--line)", borderRadius: 2, marginTop: 12, overflow: "hidden" }}>
            <div style={{ width: `${highPriorityPct}%`, height: "100%", background: "#EF4444", borderRadius: 2, boxShadow: "0 0 8px rgba(239,68,68,0.8)", transition: "width 0.4s ease" }} />
          </div>
        </div>

        {/* CARD 4: TOTAL DISPATCHED */}
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
              Total Tasks
            </span>
            <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 7px", borderRadius: 10, background: "#EFF6FF", color: "#2563EB", border: "1px solid rgba(59,130,246,0.3)" }}>
              100% Total
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", textShadow: "0 2px 10px rgba(59,130,246,0.2)" }}>{scopedTasks.length}</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Task Register</div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "#EFF6FF", color: "#2563EB", display: "flex", alignItems: "center", justify: "center", fontSize: 16, border: "1px solid rgba(59,130,246,0.3)", boxShadow: "0 0 14px rgba(59,130,246,0.35)", flexShrink: 0 }}>
              <i className="fa-solid fa-list-check" />
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
              <i className="fa-solid fa-list-check" style={{ fontSize: 11 }} /> All Tasks ({scopedTasks.length})
            </button>
            <button
              type="button"
              className={`role-picker-option ${statusFilter === "In Progress" ? "active" : ""}`}
              onClick={() => setStatusFilter("In Progress")}
              style={{ padding: "6px 14px", fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <i className="fa-solid fa-spinner" style={{ fontSize: 11 }} /> In Progress ({inProgressCount})
            </button>
            <button
              type="button"
              className={`role-picker-option ${statusFilter === "Not Started" ? "active" : ""}`}
              onClick={() => setStatusFilter("Not Started")}
              style={{ padding: "6px 14px", fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <i className="fa-solid fa-hourglass-start" style={{ fontSize: 11 }} /> Not Started ({notStartedCount})
            </button>
            <button
              type="button"
              className={`role-picker-option ${statusFilter === "Completed" ? "active" : ""}`}
              onClick={() => setStatusFilter("Completed")}
              style={{ padding: "6px 14px", fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <i className="fa-solid fa-circle-check" style={{ fontSize: 11 }} /> Completed ({completedCount})
            </button>
          </div>
        </div>

        <DataTable
          title={statusFilter === "all" ? "Operational Task Roster" : `Operational Tasks (${statusFilter.toUpperCase()})`}
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
              <i className="fa-solid fa-plus" /> Assign New Task
            </Button>
          }
          searchable
          searchPlaceholder="Search task title, assigned staff, warehouse, priority..."
          keyField="id"
          rows={filteredTasks}
          emptyMessage="No tasks found matching the selected filter."
          columns={[
            {
              key: "task",
              label: "Task Details",
              emphasize: true,
              render: (r) => (
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontWeight: 700, color: "var(--ink)", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <i className={CATEGORY_ICONS[r.category] || "fa-solid fa-clipboard-list"} style={{ color: "var(--primary)", fontSize: 12 }} />
                    {r.task}
                  </span>
                  {r.description && (
                    <span style={{ fontSize: 11.5, color: "var(--muted)", fontStyle: "italic" }}>
                      {r.description}
                    </span>
                  )}
                </div>
              ),
            },
            {
              key: "assignedTo",
              label: "Assigned Staff",
              render: (r, idx) => nameCell(r.assignedTo, idx),
            },
            {
              key: "warehouse",
              label: "Warehouse Hub",
              render: (r) => (
                <span style={{ fontWeight: 600, color: "var(--primary-deep)", display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <i className="fa-solid fa-warehouse" style={{ fontSize: 11 }} />
                  {r.warehouse || assignedHub}
                </span>
              ),
            },
            {
              key: "priority",
              label: "Priority",
              render: (r) => (
                <Badge tone={PRIORITY_TONES[r.priority] || "info"}>
                  {(r.priority || "NORMAL").toUpperCase()}
                </Badge>
              ),
            },
            {
              key: "due",
              label: "Deadline",
              render: (r) => (
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)", display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <i className="fa-regular fa-calendar-check" style={{ color: "var(--muted)", fontSize: 11 }} />
                  {r.due}
                </span>
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (r) => (
                <Badge tone={STATUS_TONES[r.status] || "warning"}>
                  {(r.status || "IN PROGRESS").toUpperCase()}
                </Badge>
              ),
            },
            {
              key: "actions",
              label: "Action",
              sortable: false,
              render: (r) =>
                r.status !== "Completed" ? (
                  <Button
                    variant="secondary"
                    disabled={busyId === (r.id || r.task)}
                    onClick={() => handleComplete(r)}
                    style={{ padding: "4px 10px", fontSize: 11.5, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4, background: "var(--primary-tint)", color: "var(--primary-deep)", borderColor: "var(--primary)" }}
                  >
                    <i className="fa-solid fa-check" /> Complete
                  </Button>
                ) : (
                  <span style={{ fontSize: 11.5, color: "#059669", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <i className="fa-solid fa-circle-check" /> Finished
                  </span>
                ),
            },
          ]}
        />
      </div>

      {/* ASSIGN NEW TASK MODAL */}
      <Modal
        open={open}
        title="Assign Operational Task"
        subtitle="Dispatch a new operational task to warehouse personnel or field staff"
        onClose={() => closeModal()}
      >
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <FormField
            label="Task Title"
            required
            icon="fa-solid fa-clipboard-list"
            value={form.task}
            onChange={set("task")}
            placeholder="e.g. Moisture Verification & Grain Sampling — Lot 40"
            compact
            marginBottom={10}
          />

          <FormField
            label="Assigned Staff Member"
            type="select"
            required
            icon="fa-solid fa-user"
            value={form.assignedTo}
            onChange={set("assignedTo")}
            options={staffOptions}
            placeholder="Select staff member"
            compact
            marginBottom={10}
          />

          <FormField
            label="Warehouse Hub"
            type="select"
            required
            disabled={isSupervisor}
            icon="fa-solid fa-warehouse"
            value={isSupervisor ? assignedHub : form.warehouse}
            onChange={set("warehouse")}
            options={isSupervisor ? [assignedHub] : ["Manimau Centre", "Betiya Hata Store", "Sai Complex Yard", "Gorakhpur North"]}
            compact
            marginBottom={10}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }} className="responsive-grid-2">
            <FormField
              label="Priority Level"
              type="select"
              required
              icon="fa-solid fa-triangle-exclamation"
              value={form.priority}
              onChange={set("priority")}
              options={["High", "Medium", "Normal"]}
              compact
              marginBottom={10}
            />

            <FormField
              label="Task Category"
              type="select"
              required
              icon="fa-solid fa-layer-group"
              value={form.category}
              onChange={set("category")}
              options={["Field", "Inventory", "Weighment", "General"]}
              compact
              marginBottom={10}
            />
          </div>

          <FormField
            label="Due Date / Deadline"
            type="date"
            icon="fa-solid fa-calendar-day"
            value={form.dueDate}
            onChange={set("dueDate")}
            compact
            marginBottom={10}
          />

          <FormField
            label="Task Instructions & Notes"
            type="textarea"
            icon="fa-solid fa-comment-dots"
            value={form.description}
            onChange={set("description")}
            placeholder="Provide specific instructions or field location notes..."
            compact
            marginBottom={12}
          />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
            <Button variant="secondary" type="button" onClick={() => closeModal()} style={{ padding: "7px 14px", fontSize: 12.5 }}>
              <i className="fa-solid fa-xmark" /> Cancel
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
                  <i className="fa-solid fa-circle-notch spin" /> Dispatching…
                </>
              ) : (
                <>
                  <i className="fa-solid fa-paper-plane" /> Dispatch Task
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
