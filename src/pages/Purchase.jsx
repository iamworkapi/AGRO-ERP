import { useState } from "react";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import DataTable from "../components/common/DataTable";
import Badge from "../components/common/Badge";
import Modal from "../components/common/Modal";
import FormField from "../components/common/FormField";
import Button from "../components/common/Button";
import AsyncState from "../components/common/AsyncState";
import { usePurchase } from "../features/purchase/usePurchase";
import { useDisclosure } from "../hooks/useDisclosure";

const poTone = { Received: "success", Approved: "success", Pending: "warning" };

function emptyForm() {
  return { vendor: "", warehouse: "", item: "", quantity: "", rate: "" };
}

export default function Purchase() {
  const { orders, status, error, addPurchaseOrder } = usePurchase();
  const { isOpen: open, open: openModal, close: closeModal } = useDisclosure();
  const [form, setForm] = useState(emptyForm());

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));
  const amount = (parseFloat(form.quantity) || 0) * (parseFloat(form.rate) || 0);

  async function handleSubmit(e) {
    e.preventDefault();
    await addPurchaseOrder({
      vendor: form.vendor,
      warehouse: form.warehouse,
      amount: `₹${amount.toLocaleString("en-IN")}`,
    });
    setForm(emptyForm());
    closeModal();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <PageHeader title="Purchase Orders" subtitle="All purchase orders raised against vendors" />

      <AsyncState status={status} error={error} loadingLabel="Loading purchase orders…" />

      <Card title="Purchase Orders" right={<Button onClick={() => openModal()}>+ New Purchase Order</Button>}>
        <DataTable
          keyField="poNumber"
          rows={orders}
          columns={[
            { key: "poNumber", label: "PO Number", emphasize: true },
            { key: "vendor", label: "Vendor" },
            { key: "warehouse", label: "Warehouse" },
            { key: "amount", label: "Amount" },
            { key: "status", label: "Status", render: (r) => <Badge tone={poTone[r.status]}>{r.status.toUpperCase()}</Badge> },
          ]}
        />
      </Card>

      <Modal open={open} title="New Purchase Order" onClose={() => closeModal()}>
        <form onSubmit={handleSubmit}>
          <FormField label="Vendor" required value={form.vendor} onChange={set("vendor")} placeholder="e.g. Pannu Agro Innovation" />
          <FormField label="Delivery Warehouse" type="select" required value={form.warehouse} onChange={set("warehouse")}
            options={["Manimau Centre", "Betiya Hata Store", "Sai Complex Yard", "Gorakhpur North"]} />
          <FormField label="Item" required value={form.item} onChange={set("item")} placeholder="e.g. Maize (Grade A)" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
            <FormField label="Quantity" type="number" required suffix="kg" value={form.quantity} onChange={set("quantity")} />
            <FormField label="Rate" type="number" required suffix="₹/kg" value={form.rate} onChange={set("rate")} />

          </div>
          <div style={{ background: "var(--canvas)", border: "1px solid var(--line)", borderRadius: 3, padding: "10px 14px", marginBottom: 18, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>Order Amount</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--primary-deep)" }}>₹{amount.toLocaleString("en-IN")}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Button variant="secondary" onClick={() => closeModal()}>Cancel</Button>
            <Button type="submit">Save Purchase Order</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
