import { useState } from "react";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import DataTable from "../components/common/DataTable";
import Badge from "../components/common/Badge";
import Modal from "../components/common/Modal";
import FormField from "../components/common/FormField";
import Button from "../components/common/Button";
import AsyncState from "../components/common/AsyncState";
import { useSales } from "../features/sales/useSales";
import { useDisclosure } from "../hooks/useDisclosure";

const tone = { Paid: "success", "Partially Paid": "warning", Pending: "warning" };

function emptyForm() {
  return { customer: "", warehouse: "", item: "", quantity: "", rate: "" };
}

export default function Sales() {
  const { invoices, status, error, addInvoice } = useSales();
  const { isOpen: open, open: openModal, close: closeModal } = useDisclosure();
  const [form, setForm] = useState(emptyForm());

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));
  const amount = (parseFloat(form.quantity) || 0) * (parseFloat(form.rate) || 0);

  async function handleSubmit(e) {
    e.preventDefault();
    await addInvoice({
      customer: form.customer,
      warehouse: form.warehouse,
      amount: `₹${amount.toLocaleString("en-IN")}`,
    });
    setForm(emptyForm());
    closeModal();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <PageHeader title="Invoices" subtitle="All customer invoices raised across warehouses" />

      <AsyncState status={status} error={error} loadingLabel="Loading invoices…" />

      <Card title="Invoices" right={<Button onClick={() => openModal()}>+ New Invoice</Button>}>
        <DataTable
          keyField="invoiceNo"
          rows={invoices}
          columns={[
            { key: "invoiceNo", label: "Invoice No.", emphasize: true },
            { key: "customer", label: "Customer" },
            { key: "warehouse", label: "Warehouse" },
            { key: "amount", label: "Amount" },
            { key: "status", label: "Status", render: (r) => <Badge tone={tone[r.status]}>{r.status.toUpperCase()}</Badge> },
          ]}
        />
      </Card>

      <Modal open={open} title="New Invoice" onClose={() => closeModal()}>
        <form onSubmit={handleSubmit}>
          <FormField label="Customer" required value={form.customer} onChange={set("customer")} placeholder="e.g. Green Fields Dealers" />
          <FormField label="Dispatch Warehouse" type="select" required value={form.warehouse} onChange={set("warehouse")}
            options={["Manimau Centre", "Betiya Hata Store", "Sai Complex Yard", "Gorakhpur North"]} />
          <FormField label="Item" required value={form.item} onChange={set("item")} placeholder="e.g. Maize (Grade A)" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
            <FormField label="Quantity" type="number" required suffix="kg" value={form.quantity} onChange={set("quantity")} />
            <FormField label="Rate" type="number" required suffix="₹/kg" value={form.rate} onChange={set("rate")} />
          </div>
          <div style={{ background: "var(--canvas)", border: "1px solid var(--line)", borderRadius: 3, padding: "10px 14px", marginBottom: 18, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>Invoice Amount</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--primary-deep)" }}>₹{amount.toLocaleString("en-IN")}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Button variant="secondary" onClick={() => closeModal()}>Cancel</Button>
            <Button type="submit">Save Invoice</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
