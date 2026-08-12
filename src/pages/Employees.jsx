import { useCallback, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import DataTable from "../components/common/DataTable";
import Badge from "../components/common/Badge";
import Avatar from "../components/common/Avatar";
import Button from "../components/common/Button";
import AsyncState from "../components/common/AsyncState";
import { useEmployees } from "../features/employees/useEmployees";
import { useWarehouses } from "../features/warehouses/useWarehouses";
import { useAuth } from "../hooks/useAuth";
import { toast } from "../utils/toast";

function employeeCell(employee, index) {
  const initials = employee.name
    ? employee.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "EM";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {employee.avatarUrl ? (
        <img
          src={employee.avatarUrl}
          alt={employee.name}
          style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "1px solid var(--line)" }}
        />
      ) : (
        <Avatar initials={initials} index={index} />
      )}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontWeight: 700, color: "var(--ink)", fontSize: 13 }}>{employee.name}</span>
        {employee.employeeCode && (
          <span style={{ fontSize: 11, color: "var(--primary-deep)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
            <i className="fa-solid fa-id-card" style={{ fontSize: 10 }} />
            {employee.employeeCode}
          </span>
        )}
      </div>
    </div>
  );
}

export default function Employees() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSupervisor = user?.roleKey === "supervisor" || user?.role === "Supervisor";

  // GET /warehouses is already scoped server-side to the caller's own
  // warehouse for anyone below Super Admin - real, ID-based identity
  // instead of a hardcoded name guess.
  const { warehouses: ownScopedWarehouses } = useWarehouses();
  const myWarehouse = isSupervisor ? ownScopedWarehouses[0] : null;
  const assignedHub = myWarehouse?.name || "your warehouse";

  const { employees, status, error, deactivateEmployee } = useEmployees();
  const [busyId, setBusyId] = useState(null);
  const [filterTab, setFilterTab] = useState("all"); // "all" | "Active" | "On Leave" | "Inactive"

  // GET /employees is already scoped server-side to the caller's own
  // warehouse for a Supervisor/Warehouse Admin (see employee.service.js
  // listEmployees) - no client-side re-filtering needed, and re-filtering
  // by name here previously hid the roster entirely whenever the name
  // didn't match the hardcoded fallback above.
  const scopedEmployees = employees;

  const { activeCount, onLeaveCount, inactiveCount, activePct, onLeavePct, inactivePct } = useMemo(() => {
    const active = scopedEmployees.filter((e) => e.status === "Active" || !e.status).length;
    const onLeave = scopedEmployees.filter((e) => e.status === "On Leave").length;
    const inactive = scopedEmployees.filter((e) => e.status === "Inactive").length;
    const total = scopedEmployees.length || 1;
    return {
      activeCount: active,
      onLeaveCount: onLeave,
      inactiveCount: inactive,
      activePct: ((active / total) * 100).toFixed(0),
      onLeavePct: ((onLeave / total) * 100).toFixed(0),
      inactivePct: ((inactive / total) * 100).toFixed(0),
    };
  }, [scopedEmployees]);

  const filteredEmployees = useMemo(
    () =>
      scopedEmployees.filter((e) => {
        if (filterTab === "Active") return e.status === "Active" || !e.status;
        if (filterTab === "On Leave") return e.status === "On Leave";
        if (filterTab === "Inactive") return e.status === "Inactive";
        return true;
      }),
    [scopedEmployees, filterTab]
  );

  const handleDeactivate = useCallback(
    async (employee) => {
      setBusyId(employee.id);
      try {
        if (deactivateEmployee.unwrap) {
          await deactivateEmployee(employee.id).unwrap();
        } else {
          await deactivateEmployee(employee.id);
        }
        toast.success(`${employee.name} status updated.`);
      } catch (err) {
        toast.error(err?.message || "Could not update this employee.");
      } finally {
        setBusyId(null);
      }
    },
    [deactivateEmployee]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <PageHeader
        title={isSupervisor ? `Employee Directory — ${assignedHub}` : "Employee Directory"}
        subtitle={
          isSupervisor
            ? `Roster and personnel management for ${assignedHub}`
            : "All employees and their warehouse assignments across the organisation"
        }
      />

      <AsyncState status={status} error={error} loadingLabel="Loading employee directory…" />

      {/* HIGH-GLOW EXECUTIVE 4 STAT METRICS CARDS (static - filtering happens via the tab bar below) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }} className="responsive-grid-2">
        
        {/* CARD 1: ACTIVE ROSTER */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid rgba(16,185,129,0.2)",
            borderRadius: 16,
            padding: "16px 18px",
            boxShadow: "0 6px 20px -2px rgba(0,0,0,0.04)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "#10B981", boxShadow: "0 2px 10px rgba(16, 185, 129, 0.5)" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.4 }}>
              Active Staff
            </span>
            <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 7px", borderRadius: 10, background: "#D1FAE5", color: "#059669", border: "1px solid rgba(16,185,129,0.3)" }}>
              {activePct}% Active Roster
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", textShadow: "0 2px 10px rgba(16,185,129,0.2)" }}>{activeCount} Staff</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Verified Active Duty</div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "#D1FAE5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, border: "1px solid rgba(16,185,129,0.3)", boxShadow: "0 0 14px rgba(16,185,129,0.35)", flexShrink: 0 }}>
              <i className="fa-solid fa-user-check" />
            </div>
          </div>

          <div style={{ width: "100%", height: 4, background: "var(--line)", borderRadius: 2, marginTop: 12, overflow: "hidden" }}>
            <div style={{ width: `${activePct}%`, height: "100%", background: "#10B981", borderRadius: 2, boxShadow: "0 0 8px rgba(16,185,129,0.8)", transition: "width 0.4s ease" }} />
          </div>
        </div>

        {/* CARD 2: ON LEAVE */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid rgba(245,158,11,0.2)",
            borderRadius: 16,
            padding: "16px 18px",
            boxShadow: "0 6px 20px -2px rgba(0,0,0,0.04)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "#F59E0B", boxShadow: "0 2px 10px rgba(245, 158, 11, 0.5)" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.4 }}>
              On Leave
            </span>
            <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 7px", borderRadius: 10, background: "#FEF3C7", color: "#D97706", border: "1px solid rgba(245,158,11,0.3)" }}>
              {onLeavePct}% Off-Duty
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", textShadow: "0 2px 10px rgba(245,158,11,0.2)" }}>{onLeaveCount} Staff</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Sanctioned Leave</div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "#FEF3C7", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, border: "1px solid rgba(245,158,11,0.3)", boxShadow: "0 0 14px rgba(245,158,11,0.35)", flexShrink: 0 }}>
              <i className="fa-solid fa-umbrella-beach" />
            </div>
          </div>

          <div style={{ width: "100%", height: 4, background: "var(--line)", borderRadius: 2, marginTop: 12, overflow: "hidden" }}>
            <div style={{ width: `${onLeavePct}%`, height: "100%", background: "#F59E0B", borderRadius: 2, boxShadow: "0 0 8px rgba(245,158,11,0.8)", transition: "width 0.4s ease" }} />
          </div>
        </div>

        {/* CARD 3: INACTIVE / OFF-BOARDED */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: 16,
            padding: "16px 18px",
            boxShadow: "0 6px 20px -2px rgba(0,0,0,0.04)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "#EF4444", boxShadow: "0 2px 10px rgba(239, 68, 68, 0.5)" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.4 }}>
              Inactive Staff
            </span>
            <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 7px", borderRadius: 10, background: "#FEE2E2", color: "#EF4444", border: "1px solid rgba(239,68,68,0.3)" }}>
              {inactivePct}% Off-Roster
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", textShadow: "0 2px 10px rgba(239,68,68,0.2)" }}>{inactiveCount} Staff</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Deactivated Accounts</div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "#FEE2E2", color: "#EF4444", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, border: "1px solid rgba(239,68,68,0.3)", boxShadow: "0 0 14px rgba(239,68,68,0.35)", flexShrink: 0 }}>
              <i className="fa-solid fa-user-xmark" />
            </div>
          </div>

          <div style={{ width: "100%", height: 4, background: "var(--line)", borderRadius: 2, marginTop: 12, overflow: "hidden" }}>
            <div style={{ width: `${inactivePct}%`, height: "100%", background: "#EF4444", borderRadius: 2, boxShadow: "0 0 8px rgba(239,68,68,0.8)", transition: "width 0.4s ease" }} />
          </div>
        </div>

        {/* CARD 4: TOTAL ROSTER */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid rgba(59,130,246,0.2)",
            borderRadius: 16,
            padding: "16px 18px",
            boxShadow: "0 6px 20px -2px rgba(0,0,0,0.04)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg, #1D4ED8 0%, #3B82F6 100%)", boxShadow: "0 2px 10px rgba(59, 130, 246, 0.5)" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.4 }}>
              Total Roster
            </span>
            <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 7px", borderRadius: 10, background: "#EFF6FF", color: "#2563EB", border: "1px solid rgba(59,130,246,0.3)" }}>
              100% Total
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", textShadow: "0 2px 10px rgba(59,130,246,0.2)" }}>{scopedEmployees.length}</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Registered Personnel</div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "#EFF6FF", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, border: "1px solid rgba(59,130,246,0.3)", boxShadow: "0 0 14px rgba(59,130,246,0.35)", flexShrink: 0 }}>
              <i className="fa-solid fa-users" />
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
              className={`role-picker-option ${filterTab === "all" ? "active" : ""}`}
              onClick={() => setFilterTab("all")}
              style={{ padding: "6px 14px", fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <i className="fa-solid fa-list-check" style={{ fontSize: 11 }} /> All Staff ({scopedEmployees.length})
            </button>
            <button
              type="button"
              className={`role-picker-option ${filterTab === "Active" ? "active" : ""}`}
              onClick={() => setFilterTab("Active")}
              style={{ padding: "6px 14px", fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <i className="fa-solid fa-user-check" style={{ fontSize: 11 }} /> Active ({activeCount})
            </button>
            <button
              type="button"
              className={`role-picker-option ${filterTab === "On Leave" ? "active" : ""}`}
              onClick={() => setFilterTab("On Leave")}
              style={{ padding: "6px 14px", fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <i className="fa-solid fa-umbrella-beach" style={{ fontSize: 11 }} /> On Leave ({onLeaveCount})
            </button>
            <button
              type="button"
              className={`role-picker-option ${filterTab === "Inactive" ? "active" : ""}`}
              onClick={() => setFilterTab("Inactive")}
              style={{ padding: "6px 14px", fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <i className="fa-solid fa-user-xmark" style={{ fontSize: 11 }} /> Inactive ({inactiveCount})
            </button>
          </div>
        </div>

        <DataTable
          title={filterTab === "all" ? "Employee Directory" : `Employee Directory (${filterTab.toUpperCase()})`}
          right={
            <Button
              className="btn-glow"
              onClick={() => navigate("/employees/new")}
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
              <i className="fa-solid fa-user-plus" /> Add Employee
            </Button>
          }
          searchable
          searchPlaceholder="Search employees by name, designation, phone, warehouse..."
          keyField="id"
          rows={filteredEmployees}
          emptyMessage="No employees found matching the selected filter."
          columns={[
            {
              key: "name",
              label: "Employee",
              emphasize: true,
              render: (e, idx) => employeeCell(e, idx),
            },
            {
              key: "designation",
              label: "Designation",
              render: (e) => (
                <span style={{ fontWeight: 600, color: "var(--ink)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i className="fa-solid fa-briefcase" style={{ color: "var(--primary)", fontSize: 11 }} />
                  {e.designation || e.role || "Staff Member"}
                </span>
              ),
            },
            {
              key: "warehouse",
              label: "Warehouse Hub",
              render: (e) => (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontWeight: 600, color: "var(--primary-deep)" }}>
                  <i className="fa-solid fa-warehouse" style={{ fontSize: 11 }} />
                  {e.warehouseId ? (
                    <Link to={`/warehouses/detail?id=${e.warehouseId}`} style={{ color: "var(--primary-deep)", textDecoration: "none" }}>
                      {e.warehouse}
                    </Link>
                  ) : (
                    e.warehouse || assignedHub
                  )}
                </span>
              ),
            },
            {
              key: "contact",
              label: "Contact Channels",
              sortable: false,
              render: (e) => (
                <div style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: 12 }}>
                  {e.phone && (
                    <a href={`tel:${e.phone}`} style={{ color: "var(--ink)", textDecoration: "none", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <i className="fa-solid fa-phone" style={{ fontSize: 10, color: "var(--muted)" }} />
                      {e.phone}
                    </a>
                  )}
                  {e.email && (
                    <a href={`mailto:${e.email}`} style={{ color: "var(--muted)", textDecoration: "none", fontSize: 11.5, display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <i className="fa-solid fa-envelope" style={{ fontSize: 10, color: "var(--muted)" }} />
                      {e.email}
                    </a>
                  )}
                </div>
              ),
            },
            {
              key: "dateOfJoining",
              label: "Joined",
              render: (e) => (
                <span style={{ fontSize: 12, color: "var(--ink-secondary)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <i className="fa-solid fa-calendar-day" style={{ fontSize: 10, color: "var(--muted)" }} />
                  {e.dateOfJoining || "Recently"}
                </span>
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (r) => (
                <Badge tone={r.status === "Active" || !r.status ? "success" : r.status === "On Leave" ? "warning" : "error"}>
                  {(r.status || "ACTIVE").toUpperCase()}
                </Badge>
              ),
            },
            {
              key: "actions",
              label: "Action",
              sortable: false,
              render: (e) => (
                <div style={{ display: "flex", gap: 6 }}>
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/employees/${e.id}/edit`)}
                    style={{ padding: "4px 10px", fontSize: 11.5, fontWeight: 600 }}
                  >
                    <i className="fa-solid fa-pen" style={{ marginRight: 4 }} /> Edit
                  </Button>
                  {e.status !== "Inactive" ? (
                    <Button
                      variant="secondary"
                      disabled={busyId === e.id}
                      onClick={() => handleDeactivate(e)}
                      style={{ padding: "4px 10px", fontSize: 11.5, fontWeight: 600, color: "#EF4444", borderColor: "#FEE2E2", background: "#FEF2F2" }}
                    >
                      <i className="fa-solid fa-user-xmark" style={{ marginRight: 4 }} /> Deactivate
                    </Button>
                  ) : (
                    <span style={{ fontSize: 11.5, color: "var(--muted)", fontStyle: "italic", alignSelf: "center" }}>Off-Roster</span>
                  )}
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
