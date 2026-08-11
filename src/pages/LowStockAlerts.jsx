import { useMemo } from "react";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import DataTable from "../components/common/DataTable";
import Badge from "../components/common/Badge";
import AsyncState from "../components/common/AsyncState";
import { useItems } from "../features/items/useItems";
import { useWarehouses } from "../features/warehouses/useWarehouses";
import { useAuth } from "../hooks/useAuth";

export default function LowStockAlerts() {
  const { user } = useAuth();
  const isScopedRole = user?.roleKey === "supervisor" || user?.roleKey === "warehouse_admin";
  const { warehouses } = useWarehouses();
  const myWarehouseName = isScopedRole ? warehouses[0]?.name : null;

  const { items, status, error } = useItems();

  // Derived straight from the real item master (stockQty < reorderLevel) -
  // no separate mock list to drift out of sync with Item / Parts Master.
  const lowStockItems = useMemo(() => items.filter((it) => it.stockQty < it.reorderLevel), [items]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <PageHeader
        title="Low Stock Alerts"
        subtitle={
          isScopedRole
            ? `Items below their reorder level at ${myWarehouseName || "your assigned warehouse"}`
            : "Items below their reorder level, across all warehouses"
        }
      />

      <AsyncState status={status} error={error} loadingLabel="Loading low stock alerts…" />

      <Card title="Low Stock Alerts">
        <DataTable
          keyField="id"
          rows={lowStockItems}
          emptyMessage="No items below reorder level right now."
          columns={[
            { key: "code", label: "Code", emphasize: true },
            { key: "name", label: "Item" },
            { key: "warehouse", label: "Warehouse" },
            { key: "stock", label: "Current Stock", render: (it) => `${it.stock} ${it.unit}` },
            { key: "reorder", label: "Reorder Level", render: (it) => `${it.reorder} ${it.unit}` },
            { key: "status", label: "Status", render: () => <Badge tone="warning">LOW STOCK</Badge> },
          ]}
        />
      </Card>
    </div>
  );
}
