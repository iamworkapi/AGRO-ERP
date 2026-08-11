import { useEffect, useState } from "react";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import DataTable from "../components/common/DataTable";
import Modal from "../components/common/Modal";
import FormField from "../components/common/FormField";
import Button from "../components/common/Button";
import AsyncState from "../components/common/AsyncState";
import { useItems } from "../features/items/useItems";
import { useWarehouses } from "../features/warehouses/useWarehouses";
import { useAuth } from "../hooks/useAuth";
import { useDisclosure } from "../hooks/useDisclosure";
import { createItemSchema } from "../validators/itemValidators";
import { validateOrToast } from "../utils/validate";
import { toast } from "../utils/toast";

function emptyForm(defaultWarehouseId = "") {
  return { warehouseId: defaultWarehouseId, name: "", category: "", unit: "", stock: "", reorder: "" };
}

export default function ItemPartsMaster() {
  const { user } = useAuth();
  const isScopedRole = user?.roleKey === "supervisor" || user?.roleKey === "warehouse_admin";
  const { warehouses } = useWarehouses();
  const myWarehouse = isScopedRole ? warehouses[0] : null;

  const { items, status, error, addItem } = useItems();
  const { isOpen: open, open: openModal, close: closeModal } = useDisclosure();
  const [form, setForm] = useState(() => emptyForm());
  const [saving, setSaving] = useState(false);

  // useWarehouses() resolves asynchronously, so a Supervisor/Warehouse
  // Admin's own warehouse isn't known yet on first render - fill it in as
  // soon as it arrives instead of only at mount.
  useEffect(() => {
    if (isScopedRole && myWarehouse?.id) {
      setForm((f) => (f.warehouseId ? f : { ...f, warehouseId: myWarehouse.id }));
    }
  }, [isScopedRole, myWarehouse?.id]);

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  async function handleSubmit(e) {
    e.preventDefault();
    const parsed = validateOrToast(createItemSchema, form);
    if (!parsed) return;

    setSaving(true);
    try {
      const created = await addItem(parsed);
      toast.success(`${created.name} added to the item master.`);
      setForm(emptyForm(myWarehouse?.id || ""));
      closeModal();
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || err.message || "Could not add this item. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <PageHeader
        title="Item / Parts Master"
        subtitle={isScopedRole ? `Item master data for ${myWarehouse?.name || "your assigned warehouse"}` : "Item master data and per-warehouse stock"}
      />

      <AsyncState status={status} error={error} loadingLabel="Loading items…" />

      <Card title="Item / Parts Master" right={<Button onClick={() => openModal()}>+ Add Item</Button>}>
        <DataTable
          keyField="id"
          rows={items}
          searchable
          searchPlaceholder="Search item code, name, category..."
          emptyMessage="No items recorded yet."
          columns={[
            { key: "code", label: "Code", emphasize: true },
            { key: "name", label: "Item" },
            { key: "category", label: "Category" },
            { key: "warehouse", label: "Warehouse" },
            { key: "stock", label: "Stock", render: (it) => `${it.stock} ${it.unit}` },
            { key: "reorder", label: "Reorder Level", render: (it) => `${it.reorder} ${it.unit}` },
          ]}
        />
      </Card>

      <Modal open={open} title="Add Item" onClose={() => closeModal()}>
        <form onSubmit={handleSubmit}>
          <FormField label="Item Name" required value={form.name} onChange={set("name")} placeholder="e.g. Maize (Grade A)" />
          <FormField
            label="Category"
            type="select"
            required
            value={form.category}
            onChange={set("category")}
            options={["Commodity", "Crop Residue", "Seeds", "Fertiliser", "Equipment Parts"]}
          />
          <FormField
            label="Unit of Measure"
            type="select"
            required
            value={form.unit}
            onChange={set("unit")}
            options={["kg", "bags", "units", "litres"]}
          />
          <FormField
            label="Warehouse"
            type="select"
            required
            disabled={isScopedRole}
            value={form.warehouseId}
            onChange={set("warehouseId")}
            options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
          />
          {isScopedRole && (
            <p style={{ fontSize: 11, color: "var(--muted)", margin: "-8px 0 12px" }}>Locked to your assigned warehouse.</p>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
            <FormField label="Opening Stock" type="number" value={form.stock} onChange={set("stock")} placeholder="0" />
            <FormField label="Reorder Level" type="number" required value={form.reorder} onChange={set("reorder")} placeholder="0" />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
            <Button variant="secondary" type="button" onClick={() => closeModal()}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save Item"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
