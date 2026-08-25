import { useState } from "react";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import DataTable from "../components/common/DataTable";
import Badge from "../components/common/Badge";
import Modal from "../components/common/Modal";
import FormField from "../components/common/FormField";
import Button from "../components/common/Button";
import AsyncState from "../components/common/AsyncState";
import { useAlerts } from "../features/alerts/useAlerts";
import { useDisclosure } from "../hooks/useDisclosure";

export default function Alerts() {
  const { exceptions, status, error, resolveException } = useAlerts();
  const { isOpen: open, open: openModal, close: closeModal } = useDisclosure();
  const [active, setActive] = useState(null);
  const [note, setNote] = useState("");

  function openResolve(row) {
    setActive(row);
    setNote("");
    openModal();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await resolveException(active.description);
    closeModal();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <PageHeader title="Alerts & Exceptions" subtitle="Stock variance, attendance, weighment and security flags" />

      <AsyncState status={status} error={error} loadingLabel="Loading exceptions…" />

      <Card title="All Exceptions">
        <DataTable
          keyField="description"
          rows={exceptions}
          columns={[
            { key: "type", label: "Type", emphasize: true },
            { key: "warehouse", label: "Warehouse" },
            { key: "description", label: "Description" },
            {
              key: "status", label: "Status",
              render: (r) => r.status === "Resolved"
                ? <Badge tone="success">RESOLVED</Badge>
                : <button onClick={() => openResolve(r)} style={{ border: "1px solid var(--line)", background: "var(--surface)", borderRadius: 3, padding: "3px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer", color: "var(--primary-deep)" }}>Resolve</button>,
            },
          ]}
        />
      </Card>

      <Modal open={open} title="Resolve Exception" onClose={closeModal}>
        <form onSubmit={handleSubmit}>
          <p style={{ fontSize: 13, color: "var(--ink)", marginTop: 0 }}>{active?.description}</p>
          <FormField label="Resolution Note" type="textarea" required value={note} onChange={setNote} placeholder="Describe how this was resolved" />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button type="submit">Mark Resolved</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
