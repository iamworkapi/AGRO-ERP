import { useState } from "react";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import DataTable from "../components/common/DataTable";
import Modal from "../components/common/Modal";
import FormField from "../components/common/FormField";
import Button from "../components/common/Button";
import AsyncState from "../components/common/AsyncState";
import { downloadExport } from "../features/reports/api";
import { useAuth } from "../hooks/useAuth";
import { toast } from "../utils/toast";

const AVAILABLE_REPORTS = [
  { key: "stock-valuation", name: "Stock Valuation", formats: ["excel"], description: "Warehouse-wise commodity stock with net weight and value" },
  { key: "attendance-summary", name: "Attendance Summary", formats: ["excel"], description: "Employee attendance breakdown by status" },
  { key: "moisture-trend", name: "Moisture Trend", formats: ["excel"], description: "Average moisture, allowed threshold, and deduction over time" },
  { key: "purchase-vs-sales", name: "Purchase vs Sales", formats: ["excel"], description: "Monthly procurement and dispatch tonnage comparison" },
  { key: "outstanding", name: "Outstanding Payables & Receivables", formats: ["excel"], description: "Vendor outstanding dues and buyer delivery status" },
];

export default function ExportMISReports() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ report: "", from: "", to: "" });

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  async function handleDownload() {
    if (!form.report) {
      toast.error("Please select a report type.");
      return;
    }

    const warehouseId = user?.warehouseId;
    setLoading(true);
    try {
      await downloadExport({
        reportType: form.report,
        format: "excel",
        from: form.from || undefined,
        to: form.to || undefined,
        warehouseId,
      });
      toast.success("Report downloaded successfully.");
      setOpen(false);
      setForm({ report: "", from: "", to: "" });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <PageHeader
        title="Export MIS Reports"
        subtitle="Generate and download Excel reports for your warehouse"
      />

      <AsyncState status="idle" loadingLabel="Loading available reports…" />

      <Card title="Available Reports" right={<Button onClick={() => setOpen(true)}>+ Generate Report</Button>}>
        <DataTable
          keyField="key"
          rows={AVAILABLE_REPORTS}
          columns={[
            { key: "name", label: "Report", emphasize: true },
            { key: "formats", label: "Format", render: (r) => "Excel (.xlsx)" },
            { key: "description", label: "Description" },
          ]}
        />
      </Card>

      <Modal open={open} title="Generate Report" onClose={() => { setOpen(false); setForm({ report: "", from: "", to: "" }); }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <FormField
            label="Report"
            type="select"
            required
            value={form.report}
            onChange={set("report")}
            options={AVAILABLE_REPORTS.map((r) => ({ value: r.key, label: r.name }))}
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
            <FormField label="From Date" type="date" value={form.from} onChange={set("from")} />
            <FormField label="To Date" type="date" value={form.to} onChange={set("to")} />
          </div>
          <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>
            Leave dates empty to export all-time data. The report will be generated as an Excel file.
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
            <Button variant="secondary" onClick={() => { setOpen(false); setForm({ report: "", from: "", to: "" }); }}>Cancel</Button>
            <Button onClick={handleDownload} loading={loading}>Download Excel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
