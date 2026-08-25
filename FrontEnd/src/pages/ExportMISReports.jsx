import { useState } from "react";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import DataTable from "../components/common/DataTable";
import Modal from "../components/common/Modal";
import FormField from "../components/common/FormField";
import Button from "../components/common/Button";
import AsyncState from "../components/common/AsyncState";
import { useReports } from "../features/reports/useReports";
import { useDisclosure } from "../hooks/useDisclosure";

function emptyForm() {
  return { report: "", from: "", to: "", format: "PDF" };
}

export default function ExportMISReports() {
  const { availableReports, status, error } = useReports();
  const { isOpen: open, open: openModal, close: closeModal } = useDisclosure();
  const [form, setForm] = useState(emptyForm());

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  function handleSubmit(e) {
    e.preventDefault();
    closeModal();
    setForm(emptyForm());
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <PageHeader
        title="Export MIS Reports"
        subtitle="Generate and download exportable MIS reports"
      />

      <AsyncState status={status} error={error} loadingLabel="Loading available reports…" />

      <Card title="Export MIS Reports" right={<Button onClick={() => openModal()}>+ Generate Report</Button>}>
        <DataTable
          keyField="name"
          rows={availableReports}
          columns={[
            { key: "name", label: "Report", emphasize: true },
            { key: "format", label: "Available Formats" },
          ]}
        />
      </Card>

      <Modal open={open} title="Generate Report" onClose={() => closeModal()}>
        <form onSubmit={handleSubmit}>
          <FormField label="Report" type="select" required value={form.report} onChange={set("report")}
            options={availableReports.map((r) => r.name)} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
            <FormField label="From Date" type="date" required value={form.from} onChange={set("from")} />
            <FormField label="To Date" type="date" required value={form.to} onChange={set("to")} />
          </div>
          <FormField label="Format" type="select" required value={form.format} onChange={set("format")} options={["PDF", "Excel"]} />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
            <Button variant="secondary" onClick={() => closeModal()}>Cancel</Button>
            <Button type="submit">Generate & Download</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
