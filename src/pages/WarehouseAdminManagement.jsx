import { useState } from "react";
import {  Eye, Shield, Users, Settings, Phone, AlertTriangle, ChevronDown, Mail, Warehouse, CheckCircle , GitBranch, ExternalLink, List, Network } from "lucide-react";
function LucideIconWrapper({ children, size = 16 }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: size, height: size, flexShrink: 0 }}>
      {children}
    </span>
  );
}
import { Link, useNavigate } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import DataTable from "../components/common/DataTable";
import Badge from "../components/common/Badge";
import Select from "../components/common/Select";
import AsyncState from "../components/common/AsyncState";
import { useWarehouses } from "../features/warehouses/useWarehouses";
import { useEmployees } from "../features/employees/useEmployees";

function personCell(name, phone, role, index) {
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          flexShrink: 0,
          background: index % 2 === 0 ? "var(--gradient-primary)" : "var(--primary-tint)",
          color: index % 2 === 0 ? "white" : "var(--primary-deep)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: 11.5,
          boxShadow: "0 2px 6px rgba(0, 184, 107, 0.2)",
        }}
      >
        {initials}
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontWeight: 700, color: "var(--ink)", fontSize: 13 }}>{name}</span>
        {phone && (
          <span style={{ fontSize: 11, color: "var(--muted)", display: "flex", alignItems: "center", gap: 4 }}>
            <LucideIconWrapper size={9}><Phone size={9} /></LucideIconWrapper> {phone}
          </span>
        )}
      </div>
    </div>
  );
}

function warehouseLink(warehouseName, warehouseId) {
  if (!warehouseName || warehouseName === "Unassigned") {
    return <Badge tone="warning">UNASSIGNED</Badge>;
  }
  return (
    <Link
      to={`/warehouses/detail?id=${encodeURIComponent(warehouseId || "")}`}
      style={{
        color: "var(--primary-deep)",
        fontWeight: 600,
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12.5,
      }}
    >
      <LucideIconWrapper size={11}><Warehouse size={11} /></LucideIconWrapper>
      {warehouseName}
    </Link>
  );
}

// Fallback staff roster for previewing complete hierarchy trees
const MOCK_STAFF_PER_HUB = {
  "wh-1": [
    { name: "Ramesh Sharma", designation: "Weighbridge Operator", phone: "9876543210" },
    { name: "Sunita Devi", designation: "Moisture & Quality Assayer", phone: "9812345670" },
    { name: "Vijay Verma", designation: "Stack & Inventory Handler", phone: "9823456789" },
    { name: "Karan Singh", designation: "Security & Gate Supervisor", phone: "9834567890" },
  ],
  "wh-2": [
    { name: "Amit Shukla", designation: "Grain Procurement Executive", phone: "9845678901" },
    { name: "Pooja Yadav", designation: "Lab Analyst", phone: "9856789012" },
    { name: "Dinesh Kumar", designation: "Forklift Operator", phone: "9867890123" },
  ],
  "wh-3": [
    { name: "Suresh Gupta", designation: "Weighment Officer", phone: "9878901234" },
    { name: "Deepak Maurya", designation: "Warehouse Yard Controller", phone: "9889012345" },
  ],
};

export default function WarehouseAdminManagement() {
  const navigate = useNavigate();
  const { warehouses, admins, supervisors, status, error } = useWarehouses();
  const { employees } = useEmployees();
  
  const [viewMode, setViewMode] = useState("hierarchy"); // "hierarchy" | "directory"
  const [activeTab, setActiveTab] = useState("admins"); // "admins" | "supervisors"
  const [selectedHubId, setSelectedHubId] = useState("all"); // "all" or warehouse.id

  const fullyStaffed = warehouses.filter((w) => w.admin && w.supervisor).length;
  const missingCoverage = warehouses.length - fullyStaffed;

  const activeWarehouses = selectedHubId === "all"
    ? warehouses
    : warehouses.filter((w) => w.id === selectedHubId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <PageHeader
        title="Warehouse Admin Management"
        subtitle="Hierarchy tree breakdown of Admins, Supervisors, and Hub Staff across all warehouses"
      />

      <AsyncState status={status} error={error} loadingLabel="Loading personnel details…" />

      {/* COMPACT STAT TILES BAR */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }} className="responsive-grid-2">
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: "var(--primary-tint)", color: "var(--primary-deep)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            <LucideIconWrapper size={16}><Shield size={16} /></LucideIconWrapper>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>Warehouse Admins</p>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)", marginTop: 2 }}>{admins.length}</div>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: "var(--primary-tint)", color: "var(--primary-deep)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            <LucideIconWrapper size={16}><Settings size={16} /></LucideIconWrapper>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>Warehouse Supervisors</p>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)", marginTop: 2 }}>{supervisors.length}</div>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: "#D1FAE5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            <LucideIconWrapper size={16}><CheckCircle size={16} /></LucideIconWrapper>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>Fully Staffed Hubs</p>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)", marginTop: 2 }}>{fullyStaffed}</div>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: "#FEF3C7", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            <LucideIconWrapper size={16}><AlertTriangle size={16} /></LucideIconWrapper>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>Missing Coverage</p>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)", marginTop: 2 }}>{missingCoverage}</div>
          </div>
        </div>
      </div>

      {/* VIEW MODE SWITCHER & WAREHOUSE DROPDOWN SELECTOR */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        {/* View Mode Toggle: Hierarchy Tree vs Directory Table */}
        <div className="role-picker-container" style={{ width: "auto", marginBottom: 0 }}>
          <button
            type="button"
            className={`role-picker-option ${viewMode === "hierarchy" ? "active" : ""}`}
            onClick={() => setViewMode("hierarchy")}
            style={{ padding: "6px 14px", display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <LucideIconWrapper size={16}><Network size={16} /></LucideIconWrapper> Hierarchy Flow View
          </button>
          <button
            type="button"
            className={`role-picker-option ${viewMode === "directory" ? "active" : ""}`}
            onClick={() => setViewMode("directory")}
            style={{ padding: "6px 14px", display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <LucideIconWrapper size={16}><List size={16} /></LucideIconWrapper> Directory Table View
          </button>
        </div>

        {/* Warehouse Dropdown Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 5 }}>
            <LucideIconWrapper size={16}><Warehouse size={16} /></LucideIconWrapper> Select Warehouse:
          </span>
          <div style={{ minWidth: 260 }}>
            <Select
              value={selectedHubId}
              onChange={(val) => setSelectedHubId(val)}
              options={[
                { value: "all", label: `All Warehouses (${warehouses.length} Hubs)` },
                ...warehouses.map((w) => ({ value: w.id, label: `${w.name} (${w.code})` }))
              ]}
              hasLeftIcon
            />
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODE 1: VISUAL ORGANIZATIONAL HIERARCHY TREE VIEW              */}
      {/* ------------------------------------------------------------- */}
      {viewMode === "hierarchy" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {activeWarehouses.map((wh) => {
            const adminObj = admins.find((a) => a.warehouseId === wh.id) || (wh.admin ? { name: wh.admin, phone: wh.adminPhone, email: `admin.${wh.code.toLowerCase()}@agro.com` } : null);
            const superObj = supervisors.find((s) => s.warehouseId === wh.id) || (wh.supervisor ? { name: wh.supervisor, phone: wh.supervisorPhone, email: `supervisor.${wh.code.toLowerCase()}@agro.com` } : null);

            // Filter real employees for this warehouse, fallback to mock staff if empty
            const realStaff = employees.filter((e) => e.warehouseId === wh.id || e.warehouse === wh.name);
            const staffList = realStaff.length ? realStaff : (MOCK_STAFF_PER_HUB[wh.id] || []);

            return (
              <div
                key={wh.id}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--line)",
                  borderRadius: 14,
                  padding: "20px 22px",
                  boxShadow: "var(--shadow-sm)",
                  position: "relative",
                }}
              >
                {/* Top Green Accent Line */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    borderTopLeftRadius: 14,
                    borderTopRightRadius: 14,
                    background: "linear-gradient(90deg, #059669 0%, #10B981 100%)",
                  }}
                />

                {/* Warehouse Title Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 14, borderBottom: "1px solid var(--line)", marginBottom: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: "var(--primary-tint)", color: "var(--primary-deep)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>
                      <LucideIconWrapper size={16}><Warehouse size={16} /></LucideIconWrapper>
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>{wh.name}</h3>
                      <p style={{ margin: 0, fontSize: 11.5, color: "var(--muted)" }}>
                        Code: <strong>{wh.code}</strong> &bull; Capacity: <strong>{wh.capacity}</strong> &bull; Location: {wh.location}
                      </p>
                    </div>
                  </div>

                  <Link
                    to={`/warehouses/detail?id=${encodeURIComponent(wh.id)}`}
                    style={{
                      padding: "5px 12px",
                      fontSize: 11.5,
                      fontWeight: 600,
                      borderRadius: 6,
                      border: "1px solid var(--line-strong)",
                      background: "var(--canvas)",
                      color: "var(--primary-deep)",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <LucideIconWrapper size={10}><ExternalLink size={10} /></LucideIconWrapper> View Warehouse Detail
                  </Link>
                </div>

                {/* 3-TIER ORGANIZATIONAL HIERARCHY FLOW DIAGRAM */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                  
                  {/* LEVEL 1: WAREHOUSE ADMIN */}
                  <div
                    style={{
                      width: "100%",
                      maxWidth: 420,
                      background: "var(--surface)",
                      border: "2px solid var(--primary)",
                      borderRadius: 12,
                      padding: "12px 16px",
                      boxShadow: "0 4px 14px rgba(0, 184, 107, 0.15)",
                      position: "relative",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, paddingBottom: 6, borderBottom: "1px solid var(--line)" }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: "var(--primary-deep)", textTransform: "uppercase", letterSpacing: 0.5, display: "inline-flex", alignItems: "center", gap: 5 }}>
                        <LucideIconWrapper size={16}><Shield size={16} /></LucideIconWrapper> Level 1 &bull; Warehouse Admin
                      </span>
                      <Badge tone="success">FULL HUB AUTHORITY</Badge>
                    </div>

                    {adminObj ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--gradient-primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, boxShadow: "0 2px 8px rgba(0,184,107,0.3)" }}>
                          {adminObj.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <strong style={{ fontSize: 14, color: "var(--ink)" }}>{adminObj.name}</strong>
                          <span style={{ fontSize: 11.5, color: "var(--muted)", display: "flex", alignItems: "center", gap: 8 }}>
                            <span><LucideIconWrapper size={10}><Phone size={10} /></LucideIconWrapper> {adminObj.phone || "N/A"}</span>
                            <span>&bull;</span>
                            <span><LucideIconWrapper size={10}><Mail size={10} /></LucideIconWrapper> {adminObj.email || "N/A"}</span>
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding: "8px 0", fontSize: 12, color: "var(--status-error)", display: "flex", alignItems: "center", gap: 6 }}>
                        <LucideIconWrapper size={16}><AlertTriangle size={16} /></LucideIconWrapper> Unassigned Admin &mdash; Action Required
                      </div>
                    )}
                  </div>

                  {/* VERTICAL CONNECTOR ARROW 1 */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "4px 0" }}>
                    <div style={{ width: 2, height: 20, background: "var(--primary)" }} />
                    <LucideIconWrapper size={11}><ChevronDown size={11} /></LucideIconWrapper>
                  </div>

                  {/* LEVEL 2: WAREHOUSE SUPERVISOR */}
                  <div
                    style={{
                      width: "100%",
                      maxWidth: 420,
                      background: "var(--primary-tint)",
                      border: "1px solid var(--primary)",
                      borderRadius: 12,
                      padding: "12px 16px",
                      position: "relative",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, paddingBottom: 6, borderBottom: "1px solid rgba(0, 184, 107, 0.2)" }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: "var(--primary-deep)", textTransform: "uppercase", letterSpacing: 0.5, display: "inline-flex", alignItems: "center", gap: 5 }}>
                        <LucideIconWrapper size={16}><Settings size={16} /></LucideIconWrapper> Level 2 &bull; Warehouse Supervisor
                      </span>
                      <Badge tone="info">OPERATIONAL LEAD</Badge>
                    </div>

                    {superObj ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--surface)", border: "2px solid var(--primary)", color: "var(--primary-deep)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13 }}>
                          {superObj.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <strong style={{ fontSize: 13.5, color: "var(--ink)" }}>{superObj.name}</strong>
                          <span style={{ fontSize: 11.5, color: "var(--muted)", display: "flex", alignItems: "center", gap: 8 }}>
                            <span><LucideIconWrapper size={10}><Phone size={10} /></LucideIconWrapper> {superObj.phone || "N/A"}</span>
                            <span>&bull;</span>
                            <span>Reports To: <strong>{adminObj ? adminObj.name : "Admin"}</strong></span>
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding: "6px 0", fontSize: 12, color: "var(--status-warning, #d97706)", display: "flex", alignItems: "center", gap: 6 }}>
                        <LucideIconWrapper size={16}><AlertTriangle size={16} /></LucideIconWrapper> Unassigned Supervisor
                      </div>
                    )}
                  </div>

                  {/* VERTICAL CONNECTOR ARROW 2 */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "4px 0" }}>
                    <div style={{ width: 2, height: 20, background: "var(--line-strong)" }} />
                    <LucideIconWrapper size={11}><GitBranch size={11} /></LucideIconWrapper>
                  </div>

                  {/* LEVEL 3: OPERATIONAL STAFF & EMPLOYEES GRID */}
                  <div
                    style={{
                      width: "100%",
                      background: "var(--canvas)",
                      border: "1px solid var(--line)",
                      borderRadius: 12,
                      padding: "14px 16px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, paddingBottom: 6, borderBottom: "1px solid var(--line)" }}>
                      <span style={{ fontSize: 10.5, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5, display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <LucideIconWrapper size={16}><Users size={16} /></LucideIconWrapper> Level 3 &bull; Hub Staff & Operatives ({staffList.length} Personnel)
                      </span>
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>Reports to Supervisor</span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat( auto-fit, minmax(220px, 1fr) )", gap: 10 }}>
                      {staffList.map((emp, index) => {
                        const empInitials = (emp.name || emp.fullName || "Staff").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
                        return (
                          <div
                            key={index}
                            style={{
                              background: "var(--surface)",
                              border: "1px solid var(--line)",
                              borderRadius: 10,
                              padding: "10px 12px",
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              boxShadow: "var(--shadow-xs)",
                            }}
                          >
                            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--primary-tint)", color: "var(--primary-deep)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11, flexShrink: 0 }}>
                              {empInitials}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                              <strong style={{ fontSize: 12.5, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {emp.name || emp.fullName}
                              </strong>
                              <span style={{ fontSize: 11, color: "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {emp.designation || emp.role || "Warehouse Operative"}
                              </span>
                              {emp.phone && (
                                <span style={{ fontSize: 10.5, color: "var(--primary-deep)", marginTop: 2, display: "inline-flex", alignItems: "center", gap: 4 }}>
                                  <LucideIconWrapper size={9}><Phone size={9} /></LucideIconWrapper> {emp.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODE 2: DIRECTORY TABLE VIEW (Admins / Supervisors)             */}
      {/* ------------------------------------------------------------- */}
      {viewMode === "directory" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 10 }}>
            <div className="role-picker-container" style={{ width: "auto", marginBottom: 0 }}>
              <button
                type="button"
                className={`role-picker-option ${activeTab === "admins" ? "active" : ""}`}
                onClick={() => setActiveTab("admins")}
                style={{ padding: "6px 14px" }}
              >
                <LucideIconWrapper size={16}><Shield size={16} /></LucideIconWrapper> Warehouse Admins ({admins.length})
              </button>
              <button
                type="button"
                className={`role-picker-option ${activeTab === "supervisors" ? "active" : ""}`}
                onClick={() => setActiveTab("supervisors")}
                style={{ padding: "6px 14px" }}
              >
                <LucideIconWrapper size={16}><Settings size={16} /></LucideIconWrapper> Warehouse Supervisors ({supervisors.length})
              </button>
            </div>
          </div>

          {activeTab === "admins" ? (
            <DataTable
              title="Warehouse Admins Directory"
              searchable
              searchPlaceholder="Search admins by name, warehouse, contact..."
              keyField="name"
              rows={admins}
              emptyMessage="No warehouse admins found."
              columns={[
                {
                  key: "name",
                  label: "Warehouse Admin",
                  emphasize: true,
                  render: (a, idx) => personCell(a.name, a.phone, "Admin", idx),
                },
                {
                  key: "warehouse",
                  label: "Assigned Warehouse",
                  render: (a) => warehouseLink(a.warehouse, a.warehouseId),
                },
                {
                  key: "staffManaged",
                  label: "Staff Managed",
                  render: (a) => (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12 }}>
                      <LucideIconWrapper size={10}><Users size={10} /></LucideIconWrapper>
                      {warehouses.find((w) => w.id === a.warehouseId)?.staff ?? "0"} member(s)
                    </span>
                  ),
                },
                {
                  key: "status",
                  label: "Status",
                  render: () => <Badge tone="success">ACTIVE</Badge>,
                },
                {
                  key: "actions",
                  label: "Action",
                  sortable: false,
                  render: (a) => (
                    <button
                      type="button"
                      onClick={() => navigate(`/warehouses/detail?id=${encodeURIComponent(a.warehouseId || '')}`)}
                      style={{
                        border: "1px solid var(--line-strong)",
                        background: "var(--canvas)",
                        color: "var(--primary-deep)",
                        fontSize: 11.5,
                        fontWeight: 600,
                        borderRadius: 6,
                        padding: "4px 10px",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <LucideIconWrapper size={10}><Eye size={10} /></LucideIconWrapper> View Hub
                    </button>
                  ),
                },
              ]}
            />
          ) : (
            <DataTable
              title="Warehouse Supervisors Directory"
              searchable
              searchPlaceholder="Search supervisors by name, warehouse, admin..."
              keyField="name"
              rows={supervisors}
              emptyMessage="No supervisors found."
              columns={[
                {
                  key: "name",
                  label: "Supervisor",
                  emphasize: true,
                  render: (s, idx) => personCell(s.name, s.phone, "Supervisor", idx),
                },
                {
                  key: "warehouse",
                  label: "Assigned Warehouse",
                  render: (s) => warehouseLink(s.warehouse, s.warehouseId),
                },
                {
                  key: "reportsTo",
                  label: "Reports To (Admin)",
                  render: (s) => (
                    <span style={{ fontWeight: 600, color: "var(--ink-secondary)", display: "inline-flex", alignItems: "center", gap: 5 }}>
                      <LucideIconWrapper size={11}><Shield size={11} /></LucideIconWrapper>
                      {s.reportsTo || "Unassigned"}
                    </span>
                  ),
                },
                {
                  key: "status",
                  label: "Status",
                  render: () => <Badge tone="success">ACTIVE</Badge>,
                },
                {
                  key: "actions",
                  label: "Action",
                  sortable: false,
                  render: (s) => (
                    <button
                      type="button"
                      onClick={() => navigate(`/warehouses/detail?id=${encodeURIComponent(s.warehouseId || '')}`)}
                      style={{
                        border: "1px solid var(--line-strong)",
                        background: "var(--canvas)",
                        color: "var(--primary-deep)",
                        fontSize: 11.5,
                        fontWeight: 600,
                        borderRadius: 6,
                        padding: "4px 10px",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <LucideIconWrapper size={10}><Eye size={10} /></LucideIconWrapper> View Hub
                    </button>
                  ),
                },
              ]}
            />
          )}
        </div>
      )}
    </div>
  );
}
