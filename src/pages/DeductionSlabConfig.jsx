import PageHeader from "../components/common/PageHeader";
import DataTable from "../components/common/DataTable";
import Badge from "../components/common/Badge";
import AsyncState from "../components/common/AsyncState";
import { useWeighment } from "../features/weighment/useWeighment";

export default function DeductionSlabConfig() {
  const { slabs, status, error } = useWeighment();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <PageHeader
        title="Deduction Slab Config"
        subtitle="Standard moisture thresholds and per-commodity deduction rules"
      />

      <AsyncState status={status} error={error} loadingLabel="Loading deduction slabs…" />

      {/* COMPACT SUMMARY METRICS BAR */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }} className="responsive-grid-2">
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--primary-tint)", color: "var(--primary-deep)", display: "flex", alignItems: "center", justify: "center", fontSize: 14 }}>
            <i className="fa-solid fa-wheat-awn" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>Configured Commodities</p>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)", marginTop: 2 }}>{slabs.length} Items</div>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: "#FEF3C7", color: "#D97706", display: "flex", alignItems: "center", justify: "center", fontSize: 14 }}>
            <i className="fa-solid fa-droplet" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>Standard Thresholds</p>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--ink)", marginTop: 2 }}>14.0% Average</div>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: "#D1FAE5", color: "#059669", display: "flex", alignItems: "center", justify: "center", fontSize: 14 }}>
            <i className="fa-solid fa-sliders" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>Calculation Engine</p>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginTop: 2 }}>Auto-Applied</div>
          </div>
        </div>
      </div>

      <DataTable
        title="Deduction Slab Rules"
        searchable
        searchPlaceholder="Search commodity or rule..."
        keyField="commodity"
        rows={slabs}
        emptyMessage="No deduction slabs configured."
        columns={[
          {
            key: "commodity",
            label: "Commodity",
            emphasize: true,
            render: (r) => (
              <span style={{ fontWeight: 700, color: "var(--ink)", display: "inline-flex", alignItems: "center", gap: 8 }}>
                <i className="fa-solid fa-wheat-awn" style={{ color: "var(--primary)", fontSize: 13 }} />
                {r.commodity}
              </span>
            ),
          },
          {
            key: "threshold",
            label: "Standard Moisture Threshold",
            render: (r) => (
              <span style={{ fontWeight: 600, color: "var(--ink)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                <i className="fa-solid fa-droplet" style={{ color: "#3B82F6", fontSize: 11 }} />
                <strong>{r.threshold}</strong>
              </span>
            ),
          },
          {
            key: "deductionPerPercent",
            label: "Deduction Rule",
            render: (r) => (
              <span style={{ fontSize: 12, color: "var(--ink-secondary)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                <i className="fa-solid fa-scale-unbalanced" style={{ color: "var(--muted)", fontSize: 11 }} />
                Deduct <strong>{r.deductionPerPercent}</strong> per 1% excess moisture
              </span>
            ),
          },
          {
            key: "status",
            label: "Rule Status",
            render: () => <Badge tone="success">ACTIVE RULE</Badge>,
          },
        ]}
      />
    </div>
  );
}
