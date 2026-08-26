import { useMemo, useState } from "react";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import StatCard from "../components/common/StatCard";
import DataTable from "../components/common/DataTable";
import Badge from "../components/common/Badge";
import Select from "../components/common/Select";
import AsyncState from "../components/common/AsyncState";
import { useStockEntries } from "../features/stockEntries/useStockEntries";
import { useWarehouses } from "../features/warehouses/useWarehouses";
import { useAuth } from "../hooks/useAuth";

export default function Inventory() {
  const { user } = useAuth();
  const isScopedRole = user?.roleKey === "supervisor" || user?.roleKey === "warehouse_admin";
  const isSuperAdmin = user?.roleKey === "super_admin";

  // A Supervisor/Warehouse Admin is always scoped server-side to their own
  // warehouse regardless of this filter (see backend stockEntry.service.js
  // listStockEntries) - the picker below only matters for Super Admin, who
  // gets the full org-wide ledger by default.
  const [warehouseFilter, setWarehouseFilter] = useState("");
  const { warehouses } = useWarehouses();
  const { entries, status, error } = useStockEntries(warehouseFilter || undefined);

  const myWarehouseName = isScopedRole ? warehouses[0]?.name : null;

  const stats = useMemo(() => {
    const approved = entries.filter((e) => e.status === "approved");
    const pending = entries.filter((e) => e.status === "pending");
    const totalNetKg = approved.reduce((sum, e) => sum + (e.netWeightKg || 0), 0);
    return [
      { label: "Total Entries", value: String(entries.length), trend: "Weighment slips logged", icon: "ri-file-list-line", iconColor: "#3B82F6" },
      { label: "Approved Slips", value: String(approved.length), trend: "Verified by Admin", icon: "ri-checkbox-circle-fill", iconColor: "#10B981" },
      { label: "Pending Review", value: String(pending.length), trend: pending.length ? "Awaiting approval" : "All clear", icon: "ri-hourglass-line", iconColor: "#F59E0B" },
      { label: "Net Stock (Approved)", value: `${totalNetKg.toLocaleString()} kg`, trend: "Inward - outward, approved only", icon: "ri-stack-line", iconColor: "#059669" },
    ];
  }, [entries]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <PageHeader
        title="Stock Overview"
        subtitle={
          isScopedRole
            ? `Weighment-based stock ledger for ${myWarehouseName || "your assigned warehouse"}`
            : "Organisation-wide weighment stock ledger across all warehouses"
        }
      />

      <AsyncState status={status} error={error} loadingLabel="Loading stock ledger…" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }} className="responsive-grid-2">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <Card
        title="Stock Entry Ledger"
        right={
          isSuperAdmin && (
            <div style={{ width: 220 }}>
              <Select
                value={warehouseFilter}
                onChange={setWarehouseFilter}
                placeholder="All warehouses"
                options={[{ value: "", label: "All warehouses" }, ...warehouses.map((w) => ({ value: w.id, label: w.name }))]}
              />
            </div>
          )
        }
      >
        <DataTable
          keyField="id"
          rows={entries}
          searchable
          searchPlaceholder="Search slip no, party, commodity..."
          emptyMessage="No stock entries recorded yet."
          columns={[
            { key: "slipNo", label: "Slip No.", emphasize: true, render: (e) => `#${e.slipNo}` },
            ...(isSuperAdmin ? [{ key: "warehouse", label: "Warehouse" }] : []),
            { key: "commodity", label: "Commodity" },
            { key: "partyName", label: "Party / Supplier", render: (e) => e.partyName || "—" },
            {
              key: "entryType",
              label: "Type",
              render: (e) => (
                <Badge tone={e.entryType === "inward" ? "success" : "info"}>
                  {e.entryType === "inward" ? "INWARD" : "OUTWARD"}
                </Badge>
              ),
            },
            { key: "grossWeightKg", label: "Gross Wt.", render: (e) => `${Number(e.grossWeightKg || 0).toLocaleString()} kg` },
            { key: "tareWeightKg", label: "Tare Wt.", render: (e) => `${Number(e.tareWeightKg || 0).toLocaleString()} kg` },
            { key: "netWeightKg", label: "Net Wt.", render: (e) => `${Number(e.netWeightKg || 0).toLocaleString()} kg` },
            { key: "moisturePct", label: "Moisture", render: (e) => (e.moisturePct != null ? `${e.moisturePct}%` : "—") },
            {
              key: "status",
              label: "Status",
              render: (e) => (
                <Badge tone={e.status === "approved" ? "success" : e.status === "rejected" ? "error" : "warning"}>
                  {e.status.toUpperCase()}
                </Badge>
              ),
            },
            { key: "createdAt", label: "Logged On" },
          ]}
        />
      </Card>
    </div>
  );
}
