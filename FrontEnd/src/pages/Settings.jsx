import { useState } from "react";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import DataTable from "../components/common/DataTable";
import Modal from "../components/common/Modal";
import FormField from "../components/common/FormField";
import Button from "../components/common/Button";
import AsyncState from "../components/common/AsyncState";
import { useSettings } from "../features/settings/useSettings";
import { useDisclosure } from "../hooks/useDisclosure";

function emptyForm() {
  return { role: "", permissions: "" };
}

export default function Settings() {
  const { roles, status, error, addRole } = useSettings();
  const { isOpen: open, open: openModal, close: closeModal } = useDisclosure();
  const [form, setForm] = useState(emptyForm());

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  async function handleSubmit(e) {
    e.preventDefault();
    await addRole({ role: form.role, permissions: form.permissions });
    setForm(emptyForm());
    closeModal();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <PageHeader title="Roles & Permissions" subtitle="System roles and what each one can access" />

      <AsyncState status={status} error={error} loadingLabel="Loading roles…" />

      <Card title="Roles & Permissions" right={<Button onClick={() => openModal()}>+ Add Role</Button>}>
        <DataTable
          keyField="role"
          rows={roles}
          columns={[
            { key: "role", label: "Role", emphasize: true },
            { key: "permissions", label: "Permissions" },
            { key: "users", label: "Users" },
          ]}
        />
      </Card>

      <Modal open={open} title="Add Role" onClose={() => closeModal()}>
        <form onSubmit={handleSubmit}>
          <FormField label="Role Name" required value={form.role} onChange={set("role")} placeholder="e.g. Accounts Officer" />
          <FormField label="Permissions Description" type="textarea" required value={form.permissions} onChange={set("permissions")} placeholder="e.g. View and export financial reports only" />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
            <Button variant="secondary" onClick={() => closeModal()}>Cancel</Button>
            <Button type="submit">Save Role</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
