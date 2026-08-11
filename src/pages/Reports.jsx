import { Link } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import StatCard from "../components/common/StatCard";
import AsyncState from "../components/common/AsyncState";
import { useReports } from "../features/reports/useReports";

export default function Reports() {
  const { stats, availableReports, status, error } = useReports();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <PageHeader title="Analytics Centre" subtitle="Organisation-wide performance at a glance" />

      <AsyncState status={status} error={error} loadingLabel="Loading analytics…" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "var(--line)", border: "1px solid var(--line)" }}>
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <Card title="Quick Links">
        <Link to="/reports/export" style={{ color: "var(--primary-deep)", fontWeight: 600, fontSize: 13, textDecoration: "none" }}>
          Export MIS Reports ({availableReports.length} available) &rarr;
        </Link>
      </Card>
    </div>
  );
}
