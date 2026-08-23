import { useCallback, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserCheck, UserX, Users, UserPlus, Phone, Mail, Calendar, Briefcase, Warehouse as WarehouseIcon, Plus } from "lucide-react";
import PageHeader from "../components/common/PageHeader";
import DataTable from "../components/common/DataTable";
import Badge from "../components/common/Badge";
import Avatar from "../components/common/Avatar";
import Button from "../components/common/Button";
import AsyncState from "../components/common/AsyncState";
import {
  StatCard,
  SectionHeader,
  QuickAction,
  StaggerContainer,
} from "../components/design-system/index";
import { useEmployees } from "../features/employees/useEmployees";
import { useWarehouses } from "../features/warehouses/useWarehouses";
import { useAuth } from "../hooks/useAuth";
import { toast } from "../utils/toast";

function LucideIconWrapper({ children, size = 16 }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: size, height: size, flexShrink: 0 }}>
      {children}
    </span>
  );
}

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
            ID: {employee.employeeCode}
          </span>
        )}
      </div>
    </div>
  );
}

const slideUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] } }),
};

export default function Employees() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSupervisor = user?.roleKey === "supervisor" || user?.role === "Supervisor";

  const { warehouses: ownScopedWarehouses } = useWarehouses();
  const myWarehouse = isSupervisor ? ownScopedWarehouses[0] : null;
  const assignedHub = myWarehouse?.name || "your warehouse";

  const { employees, status, error, deactivateEmployee } = useEmployees();
  const [busyId, setBusyId] = useState(null);
  const [filterTab, setFilterTab] = useState("all");

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

  const kpiCards = [
    {
      label: "Active Staff",
      value: `${activeCount} Staff`,
      trend: "Verified Active Duty",
      icon: <LucideIconWrapper><UserCheck size={16} /></LucideIconWrapper>,
      color: "#10B981",
      badge: `${activePct}% Roster`,
    },
    {
      label: "On Leave",
      value: `${onLeaveCount} Staff`,
      trend: "Sanctioned Leave",
      icon: <LucideIconWrapper size={16} />, // placeholder
      color: "#F59E0B",
      badge: `${onLeavePct}% Off-Duty`,
    },
    {
      label: "Inactive Staff",
      value: `${inactiveCount} Staff`,
      trend: "Deactivated Accounts",
      icon: <LucideIconWrapper><UserX size={16} /></LucideIconWrapper>,
      color: "#EF4444",
      badge: `${inactivePct}% Off-Roster`,
    },
    {
      label: "Total Roster",
      value: `${scopedEmployees.length}`,
      trend: "Registered Personnel",
      icon: <LucideIconWrapper><Users size={16} /></LucideIconWrapper>,
      color: "#3B82F6",
      badge: "100% Total",
    },
  ];

  return (
    <motion.div style={{ display: "flex", flexDirection: "column", gap: 14 }} initial="hidden" animate="visible">
      <PageHeader
        title={isSupervisor ? `Employee Directory — ${assignedHub}` : "Employee Directory"}
        subtitle={
          isSupervisor
            ? `Roster and personnel management for ${assignedHub}`
            : "All employees and their warehouse assignments across the organisation"
        }
      />

      <AsyncState status={status} error={error} loadingLabel="Loading employee directory..." />

      {/* KPI STAT CARDS */}
      <motion.div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }} className="responsive-grid-2">
        <StaggerContainer>
          {kpiCards.map((cfg) => (
            <StatCard key={cfg.label} {...cfg} />
          ))}
        </StaggerContainer>
      </motion.div>

      {/* DATA TABLE */}
      <Card hover={false}>
        <SectionHeader
          title="Employee Roster"
          subtitle={`${scopedEmployees.length} registered personnel`}
          action={
            <QuickAction
              icon={<Plus size={13} />}
              label="Add Employee"
              onClick={() => navigate("/employees/new")}
              color="var(--primary)"
            />
          }
        />
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
          {["all", "Active", "On Leave", "Inactive"].map((tab) => (
            <motion.button
              key={tab}
              whileTap={{ scale: 0.97 }}
              onClick={() => setFilterTab(tab)}
              style={{
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 700,
                borderRadius: 8,
                border: "none",
                background: filterTab === tab ? "var(--primary)" : "var(--canvas)",
                color: filterTab === tab ? "#fff" : "var(--ink)",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                boxShadow: filterTab === tab ? "0 2px 8px var(--primary-light)" : "none",
                transition: "all 0.2s ease",
              }}
            >
              {tab === "Active" && <UserCheck size={12} />}
              {tab === "On Leave" && <Calendar size={12} />}
              {tab === "Inactive" && <UserX size={12} />}
              {tab === "all" && <Users size={12} />}
              {tab === "all" ? `All (${scopedEmployees.length})` : `${tab} (${filterTab === "Active" ? activeCount : filterTab === "On Leave" ? onLeaveCount : inactiveCount})`}
            </motion.button>
          ))}
        </div>

        <DataTable
          keyField="id"
          rows={filteredEmployees}
          emptyTitle="No employees found"
          emptyDesc="Try adjusting your filters or add a new employee."
          columns={[
            {
              key: "name",
              label: "Employee",
              render: (e, idx) => employeeCell(e, idx),
            },
            {
              key: "designation",
              label: "Designation",
              render: (e) => (
                <span style={{ fontWeight: 600, color: "var(--ink)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <Briefcase size={12} style={{ color: "var(--muted)", flexShrink: 0 }} />
                  {e.designation || e.role || "Staff Member"}
                </span>
              ),
            },
            {
              key: "warehouse",
              label: "Warehouse Hub",
              render: (e) => (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontWeight: 600, color: "var(--primary-deep)" }}>
                  <WarehouseIcon size={12} style={{ flexShrink: 0 }} />
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
              label: "Contact",
              render: (e) => (
                <div style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: 12 }}>
                  {e.phone && (
                    <a href={`tel:${e.phone}`} style={{ color: "var(--ink)", textDecoration: "none", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <Phone size={10} style={{ color: "var(--muted)", flexShrink: 0 }} />
                      {e.phone}
                    </a>
                  )}
                  {e.email && (
                    <a href={`mailto:${e.email}`} style={{ color: "var(--muted)", textDecoration: "none", fontSize: 11.5, display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <Mail size={10} style={{ color: "var(--muted)", flexShrink: 0 }} />
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
                  <Calendar size={11} style={{ color: "var(--muted)", flexShrink: 0 }} />
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
              label: "Actions",
              render: (e) => (
                <div style={{ display: "flex", gap: 6 }}>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/employees/${e.id}/edit`)}
                    style={{
                      padding: "4px 10px",
                      fontSize: 11.5,
                      fontWeight: 700,
                      borderRadius: 6,
                      border: "1px solid var(--line)",
                      background: "var(--canvas)",
                      color: "var(--ink)",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <UserCheck size={12} /> Edit
                  </motion.button>
                  {e.status !== "Inactive" ? (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      disabled={busyId === e.id}
                      onClick={() => handleDeactivate(e)}
                      style={{
                        padding: "4px 10px",
                        fontSize: 11.5,
                        fontWeight: 700,
                        borderRadius: 6,
                        border: "1px solid #FEE2E2",
                        background: "#FEF2F2",
                        color: "#EF4444",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        opacity: busyId === e.id ? 0.5 : 1,
                      }}
                    >
                      <UserX size={12} /> Deactivate
                    </motion.button>
                  ) : (
                    <span style={{ fontSize: 11.5, color: "var(--muted)", fontStyle: "italic" }}>Off-Roster</span>
                  )}
                </div>
              ),
            },
          ]}
        />
      </Card>
    </motion.div>
  );
}
