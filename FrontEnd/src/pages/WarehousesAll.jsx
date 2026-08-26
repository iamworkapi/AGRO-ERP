import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import DataTable from "../components/common/DataTable";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import FormField from "../components/common/FormField";
import Modal from "../components/common/Modal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import AsyncState from "../components/common/AsyncState";
import { useWarehouses } from "../features/warehouses/useWarehouses";
import { toast } from "../utils/toast";

export default function WarehousesAll() {
  const navigate = useNavigate();
  const { warehouses, status, error, updateWarehouse, removeWarehouse } = useWarehouses();

  const [viewMode, setViewMode] = useState("table"); // "table" | "grid"
  const [searchTerm, setSearchTerm] = useState("");

  // Edit Modal State
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete Confirmation Modal State
  const [deletingWarehouseId, setDeletingWarehouseId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Summary Metrics
  const stats = useMemo(() => {
    const totalHubs = warehouses.length;
    const fullyStaffed = warehouses.filter((w) => w.admin && w.supervisor).length;
    const totalEmployees = warehouses.reduce((sum, w) => sum + (parseInt(w.staff) || 0), 0);
    const totalStock = warehouses.reduce((sum, w) => {
      const kg = parseInt((w.stock || "").replace(/[^0-9]/g, "")) || 0;
      return sum + kg;
    }, 0);

    return { totalHubs, fullyStaffed, totalEmployees, totalStock };
  }, [warehouses]);

  // Filtered warehouses for search
  const filteredWarehouses = useMemo(() => {
    if (!searchTerm.trim()) return warehouses;
    const term = searchTerm.toLowerCase();
    return warehouses.filter(
      (w) =>
        (w.name && w.name.toLowerCase().includes(term)) ||
        (w.code && w.code.toLowerCase().includes(term)) ||
        (w.address && w.address.toLowerCase().includes(term)) ||
        (w.admin && w.admin.toLowerCase().includes(term)) ||
        (w.supervisor && w.supervisor.toLowerCase().includes(term)) ||
        (w.gstin && w.gstin.toLowerCase().includes(term)) ||
        (w.contactPerson && w.contactPerson.toLowerCase().includes(term))
    );
  }, [warehouses, searchTerm]);

  const openEditModal = (w) => {
    setEditingWarehouse(w);
    setEditForm({
      name: w.name || "",
      companyName: w.companyName || "Kusumganga Agro Solutions Pvt. Ltd.",
      commodity: w.commodity || "Biomass / PRALLI / Mustard Husk",
      address: w.address || "",
      gstin: w.gstin || "09AALCK4355J1Z2",
      pan: w.pan || "AALCK4355J",
      contactPerson: w.contactPerson || "Mr. Jagdeep Singh",
      contactPhone: w.contactPhone || "7055000315",
      email: w.email || "kusumganga5@gmail.com",
      helpDeskPhone: w.helpDeskPhone || "7905525983",
      status: w.status === "Active" ? "active" : "inactive",
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const targetId = editingWarehouse?.id || editingWarehouse?._id;
    if (!targetId) {
      toast.error("Invalid warehouse target ID.");
      return;
    }
    setSavingEdit(true);
    try {
      await updateWarehouse(targetId, editForm);
      toast.success(`Warehouse "${editForm.name}" updated successfully.`);
      setEditingWarehouse(null);
    } catch (err) {
      toast.error(err?.message || "Failed to update warehouse.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingWarehouseId) return;
    setDeleting(true);
    try {
      await removeWarehouse(deletingWarehouseId);
      toast.success("Warehouse deleted / deactivated successfully.");
      setDeletingWarehouseId(null);
    } catch (err) {
      toast.error(err?.message || "Could not delete warehouse.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Top Header */}
      <PageHeader
        title="All Warehouses & Logistics Hubs"
        subtitle="Unified operational control for biomass procurement depots, weighbridge gates, and staff hierarchy"
      />

      <AsyncState status={status} error={error} loadingLabel="Loading warehouse hubs…" />

      {/* KPI Stat Cards Strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, boxShadow: "var(--shadow-xs)" }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(0, 184, 107, 0.12)", color: "var(--primary-deep)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>
            <i className="ri-building-line" />
          </div>
          <div>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>Total Depots</span>
            <strong style={{ fontSize: 15, color: "var(--ink)", display: "block", letterSpacing: "-0.02em" }}>{stats.totalHubs} Hubs</strong>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, boxShadow: "var(--shadow-xs)" }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(3, 105, 161, 0.12)", color: "#0369A1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>
            <i className="ri-user-settings-line" />
          </div>
          <div>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>Fully Staffed</span>
            <strong style={{ fontSize: 15, color: "#0369A1", display: "block", letterSpacing: "-0.02em" }}>{stats.fullyStaffed} / {stats.totalHubs} Hubs</strong>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, boxShadow: "var(--shadow-xs)" }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(217, 119, 6, 0.12)", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>
            <i className="ri-group-line" />
          </div>
          <div>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>Active Workforce</span>
            <strong style={{ fontSize: 15, color: "var(--ink)", display: "block", letterSpacing: "-0.02em" }}>{stats.totalEmployees} Employees</strong>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, boxShadow: "var(--shadow-xs)" }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(16, 185, 129, 0.12)", color: "#10B981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>
            <i className="ri-stack-line" />
          </div>
          <div>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>Stored Biomass</span>
            <strong style={{ fontSize: 15, color: "var(--primary-deep)", display: "block", letterSpacing: "-0.02em" }}>{stats.totalStock.toLocaleString()} kg</strong>
          </div>
        </div>
      </div>

      {/* VIEW SWITCHER CONTROL */}
      {(() => {
        const switcherElement = (
          <div style={{ display: "flex", background: "var(--canvas)", border: "1px solid var(--line)", borderRadius: 8, padding: 2, gap: 2 }}>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              style={{
                border: "none",
                padding: "5px 12px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                background: viewMode === "grid" ? "var(--surface)" : "transparent",
                color: viewMode === "grid" ? "var(--primary-deep)" : "var(--muted)",
                boxShadow: viewMode === "grid" ? "var(--shadow-xs)" : "none",
              }}
            >
              <i className="ri-layout-grid-line" /> Grid Cards
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              style={{
                border: "none",
                padding: "5px 12px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                background: viewMode === "table" ? "var(--surface)" : "transparent",
                color: viewMode === "table" ? "var(--primary-deep)" : "var(--muted)",
                boxShadow: viewMode === "table" ? "var(--shadow-xs)" : "none",
              }}
            >
              <i className="ri-table-list-line" /> Data Table
            </button>
          </div>
        );

        return viewMode === "grid" ? (
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: 14,
              boxShadow: "var(--shadow-sm)",
              overflow: "hidden",
            }}
          >
            {/* Header with Title & Switcher */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 18px",
                borderBottom: "1px solid var(--line)",
                gap: 12,
                flexWrap: "wrap",
                background: "var(--surface)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.01em" }}>
                  All warehouse listing
                </h3>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: "var(--canvas)", border: "1px solid var(--line)", color: "var(--muted)" }}>
                  {filteredWarehouses.length} {filteredWarehouses.length === 1 ? "Hub" : "Hubs"}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                {/* Search Input */}
                <div style={{ position: "relative", width: 260 }}>
                  <i
                    className="ri-search-line"
                    style={{
                      position: "absolute",
                      left: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--muted)",
                      fontSize: 11,
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Search warehouse, GSTIN..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "6px 10px 6px 28px",
                      borderRadius: 7,
                      border: "1px solid var(--line-strong)",
                      background: "var(--canvas)",
                      fontSize: 12,
                      color: "var(--ink)",
                    }}
                  />
                </div>
                {switcherElement}
              </div>
            </div>

            {/* Grid Content */}
            <div style={{ padding: "14px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
              {filteredWarehouses.map((w) => (
                <div
                  key={w.id}
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--line)",
                    borderRadius: 14,
                    overflow: "hidden",
                    boxShadow: "var(--shadow-sm)",
                    display: "flex",
                    flexDirection: "column",
                    transition: "all 0.2s ease",
                  }}
                >
                  {/* Card Top Banner */}
                  <div
                    style={{
                      background: "linear-gradient(135deg, #051F17 0%, #08281D 50%, #00B86B 100%)",
                      padding: "12px 14px",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(255, 255, 255, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>
                        <i className="ri-building-line" />
                      </div>
                      <span style={{ fontWeight: 800, fontSize: 13.5, letterSpacing: "-0.01em" }}>
                        {w.name}
                      </span>
                    </div>
                    <span
                      style={{
                        background: "rgba(0, 0, 0, 0.35)",
                        color: "white",
                        fontSize: 10.5,
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 12,
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                      }}
                    >
                      {w.status || "ACTIVE"}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                    {/* Company & Commodity Tag */}
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--muted)", borderBottom: "1px solid var(--line)", paddingBottom: 8 }}>
                      <span>{w.companyName || "Kusumganga Agro"}</span>
                      <strong style={{ color: "var(--primary-deep)" }}>{w.commodity || "Biomass"}</strong>
                    </div>

                    {/* Staffing Overview Pills */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, background: "var(--canvas)", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--line)" }}>
                      <div>
                        <span style={{ fontSize: 9.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", display: "block" }}>Admin</span>
                        <strong style={{ fontSize: 11.5, color: w.admin ? "var(--ink)" : "#D97706", display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <i className={`fa-solid ${w.admin ? "fa-user-shield" : "fa-circle-xmark"}`} style={{ fontSize: 10, color: w.admin ? "var(--primary)" : "#D97706" }} />
                          {w.admin || "Unassigned"}
                        </strong>
                      </div>

                      <div>
                        <span style={{ fontSize: 9.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", display: "block" }}>Supervisor</span>
                        <strong style={{ fontSize: 11.5, color: w.supervisor ? "var(--ink)" : "#D97706", display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <i className={`fa-solid ${w.supervisor ? "fa-user-gear" : "fa-circle-xmark"}`} style={{ fontSize: 10, color: w.supervisor ? "#0369A1" : "#D97706" }} />
                          {w.supervisor || "Unassigned"}
                        </strong>
                      </div>
                    </div>

                    {/* Tax & Contact Grid */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11.5 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--muted)" }}>GSTIN:</span>
                        <strong style={{ color: "var(--ink)", fontFamily: "monospace" }}>{w.gstin || "09AALCK4355J1Z2"}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--muted)" }}>Contact:</span>
                        <span style={{ color: "var(--ink)", fontWeight: 600 }}>{w.contactPerson || "Mr. Jagdeep Singh"}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--muted)" }}>Help Desk:</span>
                        <span style={{ color: "var(--ink)" }}>{w.helpDeskPhone || "7905525983"}</span>
                      </div>
                      {w.address && (
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                          <span style={{ color: "var(--muted)" }}>Location:</span>
                          <span style={{ color: "var(--ink-secondary)", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {w.address}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Mini Stats Ribbon */}
                    <div style={{ display: "flex", justifyContent: "space-between", background: "rgba(0, 184, 107, 0.08)", padding: "6px 10px", borderRadius: 6, fontSize: 11 }}>
                      <span style={{ color: "var(--primary-deep)", fontWeight: 600 }}>
                        <i className="ri-group-line" style={{ marginRight: 4 }} /> {w.staff || 0} Staff Deployed
                      </span>
                      <strong style={{ color: "var(--primary-deep)" }}>
                        <i className="ri-scales-3-line" style={{ marginRight: 4 }} /> {w.stock || "0 kg"}
                      </strong>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div
                    style={{
                      padding: "8px 12px",
                      background: "var(--canvas)",
                      borderTop: "1px solid var(--line)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 6,
                    }}
                  >
                    <Button
                      variant="secondary"
                      onClick={() => navigate(`/warehouses/detail?id=${w.id || ''}`)}
                      style={{ padding: "5px 10px", fontSize: 11, fontWeight: 700, flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4 }}
                    >
                      <i className="ri-line-chart-line" /> View Hub
                    </Button>

                    <Button
                      variant="secondary"
                      onClick={() => openEditModal(w)}
                      style={{ padding: "5px 10px", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}
                    >
                      <i className="ri-edit-line" /> Edit
                    </Button>

                    <button
                      type="button"
                      title="Delete Warehouse"
                      onClick={() => setDeletingWarehouseId(w.id)}
                      style={{
                        border: "1px solid rgba(220, 38, 38, 0.3)",
                        background: "rgba(220, 38, 38, 0.08)",
                        color: "#dc2626",
                        fontSize: 11,
                        fontWeight: 700,
                        borderRadius: 6,
                        padding: "5px 8px",
                        cursor: "pointer",
                      }}
                    >
                      <i className="ri-delete-bin-line" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <DataTable
            title="All warehouse listing"
            right={switcherElement}
            searchable
            searchPlaceholder="Search warehouse, GSTIN, contact..."
            keyField="id"
            rows={filteredWarehouses}
            emptyMessage="No warehouses match search criteria."
            columns={[
              {
                key: "name",
                label: "Warehouse / Hub",
                emphasize: true,
                render: (r) => (
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ fontWeight: 700, color: "var(--ink)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <i className="ri-building-line" style={{ color: "var(--primary)", fontSize: 13 }} />
                      {r.name}
                    </span>
                    <span style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 600 }}>
                      {r.companyName || "Kusumganga Agro Solutions Pvt. Ltd."}
                    </span>
                  </div>
                ),
              },
              {
                key: "taxDetails",
                label: "GSTIN / PAN",
                render: (r) => (
                  <div style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: 11 }}>
                    <span style={{ fontWeight: 700, color: "#0D3823", display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <i className="ri-file-line-invoice" style={{ color: "var(--primary)", fontSize: 10 }} />
                      GST: {r.gstin || "09AALCK4355J1Z2"}
                    </span>
                    <span style={{ color: "var(--muted)", fontWeight: 600 }}>
                      PAN: {r.pan || "AALCK4355J"}
                    </span>
                  </div>
                ),
              },
              {
                key: "contactInfo",
                label: "Contact & Help Desk",
                render: (r) => (
                  <div style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: 11 }}>
                    <span style={{ fontWeight: 700, color: "var(--ink)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <i className="ri-user-follow-line" style={{ color: "#059669", fontSize: 10 }} />
                      {r.contactPerson || "Mr. Jagdeep Singh"} ({r.contactPhone || "7055000315"})
                    </span>
                    <span style={{ color: "var(--muted)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <i className="ri-customer-service-2-line" style={{ color: "var(--primary)", fontSize: 9.5 }} />
                      Help Desk: {r.helpDeskPhone || "7905525983"}
                    </span>
                  </div>
                ),
              },
              {
                key: "admin",
                label: "Warehouse Admin",
                render: (r) =>
                  r.admin ? (
                    <span style={{ fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5 }}>
                      <i className="ri-user-settings-line" style={{ color: "var(--primary)", fontSize: 11 }} />
                      {r.admin}
                    </span>
                  ) : (
                    <Badge tone="warning">UNASSIGNED</Badge>
                  ),
              },
              {
                key: "supervisor",
                label: "Supervisor",
                render: (r) =>
                  r.supervisor ? (
                    <span style={{ fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5 }}>
                      <i className="ri-user-settings-line" style={{ color: "#0369A1", fontSize: 11 }} />
                      {r.supervisor}
                    </span>
                  ) : (
                    <Badge tone="warning">UNASSIGNED</Badge>
                  ),
              },
              {
                key: "status",
                label: "Status",
                render: (r) => (
                  <Badge tone={r.status === "Active" ? "success" : "warning"}>
                    {r.status ? r.status.toUpperCase() : "ACTIVE"}
                  </Badge>
                ),
              },
              {
                key: "actions",
                label: "CRUD Actions",
                sortable: false,
                render: (r) => (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {/* READ / VIEW */}
                    <button
                      type="button"
                      title="View Warehouse Details"
                      onClick={() => navigate(`/warehouses/detail?id=${r.id || ''}`)}
                      style={{
                        border: "1px solid var(--line-strong)",
                        background: "var(--canvas)",
                        color: "var(--primary-deep)",
                        fontSize: 11,
                        fontWeight: 700,
                        borderRadius: 6,
                        padding: "4px 8px",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <i className="ri-eye-line" style={{ fontSize: 10 }} /> View
                    </button>

                    {/* UPDATE / EDIT */}
                    <button
                      type="button"
                      title="Edit Warehouse Details"
                      onClick={() => openEditModal(r)}
                      style={{
                        border: "1px solid rgba(27, 94, 58, 0.3)",
                        background: "rgba(27, 94, 58, 0.08)",
                        color: "#0D3823",
                        fontSize: 11,
                        fontWeight: 700,
                        borderRadius: 6,
                        padding: "4px 8px",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <i className="ri-edit-line" style={{ fontSize: 10, color: "#1B5E3A" }} /> Edit
                    </button>

                    {/* DELETE / DEACTIVATE */}
                    <button
                      type="button"
                      title="Delete Warehouse"
                      onClick={() => setDeletingWarehouseId(r.id)}
                      style={{
                        border: "1px solid rgba(220, 38, 38, 0.3)",
                        background: "rgba(220, 38, 38, 0.08)",
                        color: "#dc2626",
                        fontSize: 11,
                        fontWeight: 700,
                        borderRadius: 6,
                        padding: "4px 8px",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <i className="ri-delete-bin-line" style={{ fontSize: 10 }} />
                    </button>
                  </div>
                ),
              },
            ]}
          />
        );
      })()}

      {/* EDIT WAREHOUSE MODAL */}
      {editingWarehouse && (
        <Modal
          isOpen={true}
          onClose={() => setEditingWarehouse(null)}
          title="Edit Warehouse Details"
        >
          <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
              <FormField
                label="Company Name"
                value={editForm.companyName}
                onChange={(val) => setEditForm((f) => ({ ...f, companyName: val }))}
                compact
                marginBottom={10}
              />
              <FormField
                label="Warehouse Name"
                required
                value={editForm.name}
                onChange={(val) => setEditForm((f) => ({ ...f, name: val }))}
                compact
                marginBottom={10}
              />
              <FormField
                label="GSTIN"
                value={editForm.gstin}
                onChange={(val) => setEditForm((f) => ({ ...f, gstin: val }))}
                compact
                marginBottom={10}
              />
              <FormField
                label="PAN"
                value={editForm.pan}
                onChange={(val) => setEditForm((f) => ({ ...f, pan: val }))}
                compact
                marginBottom={10}
              />
              <FormField
                label="Contact Person"
                value={editForm.contactPerson}
                onChange={(val) => setEditForm((f) => ({ ...f, contactPerson: val }))}
                compact
                marginBottom={10}
              />
              <FormField
                label="Contact Phone"
                value={editForm.contactPhone}
                onChange={(val) => setEditForm((f) => ({ ...f, contactPhone: val }))}
                compact
                marginBottom={10}
              />
              <FormField
                label="Email"
                type="email"
                value={editForm.email}
                onChange={(val) => setEditForm((f) => ({ ...f, email: val }))}
                compact
                marginBottom={10}
              />
              <FormField
                label="Help Desk Phone"
                value={editForm.helpDeskPhone}
                onChange={(val) => setEditForm((f) => ({ ...f, helpDeskPhone: val }))}
                compact
                marginBottom={10}
              />
              <div style={{ gridColumn: "1 / -1" }}>
                <FormField
                  label="Address"
                  type="textarea"
                  value={editForm.address}
                  onChange={(val) => setEditForm((f) => ({ ...f, address: val }))}
                  compact
                  marginBottom={10}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
              <Button type="button" variant="secondary" onClick={() => setEditingWarehouse(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={savingEdit} className="btn-glow">
                {savingEdit ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingWarehouseId && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setDeletingWarehouseId(null)}
          onConfirm={handleDelete}
          title="Delete Warehouse"
          message="Are you sure you want to deactivate or delete this warehouse? All associated records will remain archived."
          confirmLabel={deleting ? "Deleting…" : "Confirm Delete"}
          tone="danger"
        />
      )}
    </div>
  );
}
