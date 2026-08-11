import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import DataTable from "../components/common/DataTable";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import AsyncState from "../components/common/AsyncState";
import { useStockEntries } from "../features/stockEntries/useStockEntries";
import { useWarehouses } from "../features/warehouses/useWarehouses";
import { useAuth } from "../hooks/useAuth";

const STATUS_TONE = { approved: "success", pending: "warning", rejected: "error" };

export default function Weighment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isScopedRole = user?.roleKey === "supervisor" || user?.roleKey === "warehouse_admin";
  const { warehouses } = useWarehouses();
  const myWarehouseName = isScopedRole ? warehouses[0]?.name : null;

  const { entries, status, error } = useStockEntries();

  const approvedCount = useMemo(() => entries.filter((e) => e.status === "approved").length, [entries]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <PageHeader
        title={isScopedRole ? `Weighment Slips — ${myWarehouseName || "your warehouse"}` : "Weighment Slips"}
        subtitle={
          isScopedRole
            ? `Digitised weighment slips for ${myWarehouseName || "your assigned warehouse"}`
            : "Digitised weighment slips - net weight is gross minus tare, recorded per weight machine"
        }
      />

      <AsyncState status={status} error={error} loadingLabel="Loading weighment slips…" />

      {/* COMPACT STAT METRICS BAR */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }} className="responsive-grid-2">
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--primary-tint)", color: "var(--primary-deep)", display: "flex", alignItems: "center", justify: "center", fontSize: 14 }}>
            <i className="fa-solid fa-file-invoice" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>Total Slips</p>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)", marginTop: 2 }}>{entries.length} Slips</div>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: "#D1FAE5", color: "#059669", display: "flex", alignItems: "center", justify: "center", fontSize: 14 }}>
            <i className="fa-solid fa-circle-check" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>Approved Slips</p>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)", marginTop: 2 }}>{approvedCount}</div>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--primary-tint)", color: "var(--primary-deep)", display: "flex", alignItems: "center", justify: "center", fontSize: 14 }}>
            <i className="fa-solid fa-scale-balanced" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>Processed Weight</p>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--ink)", marginTop: 2 }}>Real-time</div>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: "#FEF3C7", color: "#D97706", display: "flex", alignItems: "center", justify: "center", fontSize: 14 }}>
            <i className="fa-solid fa-droplet" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>Weight Machines</p>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginTop: 2 }}>
              <a href="/weighment/machines" onClick={(e) => { e.preventDefault(); navigate("/weighment/machines"); }} style={{ color: "var(--primary-deep)", textDecoration: "none" }}>
                Manage &rarr;
              </a>
            </div>
          </div>
        </div>
      </div>

      <DataTable
        title={isScopedRole ? `Weighment Slips (${myWarehouseName || "your warehouse"})` : "Weighment Slips Directory"}
        right={
          <Button
            className="btn-glow"
            onClick={() => navigate("/weighment/new")}
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
            <i className="fa-solid fa-plus" /> New Weighment Slip
          </Button>
        }
        searchable
        searchPlaceholder="Search slip no, party, vehicle, commodity..."
        keyField="id"
        rows={entries}
        emptyMessage="No weighment slips recorded yet."
        columns={[
          {
            key: "slipNo",
            label: "Slip No.",
            emphasize: true,
            render: (r) => (
              <span style={{ fontWeight: 700, color: "var(--primary-deep)", display: "inline-flex", alignItems: "center", gap: 5 }}>
                <i className="fa-solid fa-hashtag" style={{ fontSize: 10 }} />
                {r.slipNo}
              </span>
            ),
          },
          {
            key: "warehouse",
            label: "Centre",
            render: (r) => (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
                <i className="fa-solid fa-warehouse" style={{ color: "var(--primary)", fontSize: 11 }} />
                {r.warehouse}
              </span>
            ),
          },
          {
            key: "partyName",
            label: "Party / Supplier",
            render: (r) => (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <i className="fa-solid fa-building-user" style={{ color: "var(--muted)", fontSize: 11 }} />
                {r.partyName || "—"}
              </span>
            ),
          },
          {
            key: "entryType",
            label: "Type",
            render: (r) => <Badge tone={r.entryType === "inward" ? "success" : "info"}>{r.entryType === "inward" ? "INWARD" : "OUTWARD"}</Badge>,
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
            key: "moisturePct",
            label: "Moisture",
            render: (r) => (
              <span style={{ fontWeight: 600, color: "#2563EB", display: "inline-flex", alignItems: "center", gap: 4 }}>
                <i className="fa-solid fa-droplet" style={{ fontSize: 10 }} />
                {r.moisturePct != null ? `${r.moisturePct}%` : "—"}
              </span>
            ),
          },
          { key: "grossWeightKg", label: "Gross Wt.", render: (r) => `${Number(r.grossWeightKg || 0).toLocaleString()} kg` },
          { key: "tareWeightKg", label: "Tare Wt.", render: (r) => `${Number(r.tareWeightKg || 0).toLocaleString()} kg` },
          {
            key: "netWeightKg",
            label: "Net Wt.",
            render: (r) => <strong style={{ color: "var(--primary-deep)", fontSize: 13 }}>{Number(r.netWeightKg || 0).toLocaleString()} kg</strong>,
          },
          {
            key: "status",
            label: "Status",
            render: (r) => <Badge tone={STATUS_TONE[r.status] || "warning"}>{r.status.toUpperCase()}</Badge>,
          },
        ]}
      />
    </div>
  );
}
