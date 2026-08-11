import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import DataTable from "../components/common/DataTable";
import Badge from "../components/common/Badge";
import AsyncState from "../components/common/AsyncState";
import { usePurchase } from "../features/purchase/usePurchase";

const vendorTone = { Paid: "success", "Partially Paid": "warning", Pending: "warning" };

export default function VendorMasterLedger() {
  const { vendorLedger, status, error } = usePurchase();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <PageHeader
        title="Vendor Master & Ledger"
        subtitle="Vendor purchase totals and outstanding payments"
      />

      <AsyncState status={status} error={error} loadingLabel="Loading vendor ledger…" />

      <Card title="Vendor Master & Ledger">
        <DataTable
          keyField="vendor"
          rows={vendorLedger}
          columns={[
            { key: "vendor", label: "Vendor", emphasize: true },
            { key: "totalPurchases", label: "Total Purchases" },
            { key: "outstanding", label: "Outstanding" },
            { key: "status", label: "Payment Status", render: (r) => <Badge tone={vendorTone[r.status]}>{r.status.toUpperCase()}</Badge> },
          ]}
        />
      </Card>
    </div>
  );
}
