import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import DataTable from "../components/common/DataTable";
import AsyncState from "../components/common/AsyncState";
import { useSettings } from "../features/settings/useSettings";

export default function AuditLog() {
  const { auditLog, status, error } = useSettings();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <PageHeader
        title="Audit Log"
        subtitle="Recent actions performed across the organisation"
      />

      <AsyncState status={status} error={error} loadingLabel="Loading audit log…" />

      <Card title="Audit Log">
        <DataTable
          keyField="action"
          rows={auditLog}
          columns={[
            { key: "action", label: "Action", emphasize: true },
            { key: "user", label: "Performed By" },
            { key: "time", label: "Time" },
          ]}
        />
      </Card>
    </div>
  );
}
