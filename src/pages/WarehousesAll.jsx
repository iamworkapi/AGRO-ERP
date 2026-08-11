import { useNavigate } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import DataTable from "../components/common/DataTable";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import AsyncState from "../components/common/AsyncState";
import { useWarehouses } from "../features/warehouses/useWarehouses";

export default function WarehousesAll() {
  const navigate = useNavigate();
  const { warehouses, status, error } = useWarehouses();

  const missingAdmin = warehouses.filter((w) => !w.admin);
  const missingSupervisor = warehouses.filter((w) => !w.supervisor);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <PageHeader title="All Warehouses" subtitle="All registered warehouses and procurement centres" />

      <AsyncState status={status} error={error} loadingLabel="Loading warehouses…" />

      {(missingAdmin.length > 0 || missingSupervisor.length > 0) && (
        <div style={{ background: "var(--primary-tint)", border: "1px solid var(--line)", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "var(--ink)", display: "flex", gap: 8, alignItems: "center" }}>
          <i className="fa-solid fa-triangle-exclamation" style={{ color: "var(--status-warning, #d97706)", fontSize: 14 }} />
          <div>
            {missingAdmin.length > 0 && (
              <span>{missingAdmin.length} warehouse(s) have no Warehouse Admin assigned. </span>
            )}
            {missingSupervisor.length > 0 && (
              <span>{missingSupervisor.length} warehouse(s) have no Warehouse Supervisor assigned.</span>
            )}
          </div>
        </div>
      )}

      <DataTable
        title="All Warehouses"
        right={
          <Button
            className="btn-glow"
            onClick={() => navigate("/warehouses/create")}
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
            <i className="fa-solid fa-plus" /> Add Warehouse
          </Button>
        }
        searchable
        searchPlaceholder="Search warehouses..."
        keyField="id"
        rows={warehouses}
        emptyMessage="No warehouses found."
        columns={[
          {
            key: "name",
            label: "Warehouse",
            emphasize: true,
            render: (r) => (
              <span style={{ fontWeight: 700, color: "var(--ink)", display: "inline-flex", alignItems: "center", gap: 8 }}>
                <i className="fa-solid fa-warehouse" style={{ color: "var(--primary)", fontSize: 13 }} />
                {r.name}
              </span>
            ),
          },
          {
            key: "commodity",
            label: "Commodity",
            render: (r) => (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <i className="fa-solid fa-wheat-awn" style={{ color: "var(--muted)", fontSize: 11 }} />
                {r.commodity}
              </span>
            ),
          },
          {
            key: "admin",
            label: "Warehouse Admin",
            render: (r) =>
              r.admin ? (
                <span style={{ fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i className="fa-solid fa-user-shield" style={{ color: "var(--primary)", fontSize: 11 }} />
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
                <span style={{ fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i className="fa-solid fa-user-gear" style={{ color: "var(--primary)", fontSize: 11 }} />
                  {r.supervisor}
                </span>
              ) : (
                <Badge tone="warning">UNASSIGNED</Badge>
              ),
          },
          { key: "staff", label: "Staff" },
          { key: "stock", label: "Stock" },
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
            label: "Action",
            sortable: false,
            render: (r) => (
              <button
                type="button"
                onClick={() => navigate(`/warehouses/detail?id=${r.id || ''}`)}
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
                  transition: "all var(--transition-fast)",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "var(--primary-tint)";
                  e.currentTarget.style.borderColor = "var(--primary)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "var(--canvas)";
                  e.currentTarget.style.borderColor = "var(--line-strong)";
                }}
              >
                <i className="fa-solid fa-arrow-right-long" style={{ fontSize: 10 }} /> View
              </button>
            ),
          },
        ]}
      />
    </div>
  );
}
