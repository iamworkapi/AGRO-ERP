import { useState } from "react";
import PageHeader from "../components/common/PageHeader";
import LineStatCard from "../components/common/LineStatCard";
import DataTable from "../components/common/DataTable";
import Badge from "../components/common/Badge";
import Avatar from "../components/common/Avatar";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import FormField from "../components/common/FormField";
import AsyncState from "../components/common/AsyncState";
import { useCustomers } from "../features/customers/useCustomers";
import { useDisclosure } from "../hooks/useDisclosure";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function emptyForm() {
  return { name: "", company: "", email: "", phone: "", gstin: "", address: "", receivables: "", status: "Pending" };
}

function initialsFor(name) {
  return name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export default function Customers() {
  const { stats: customerStats, customers, status, error: loadError, addCustomer } = useCustomers();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const { isOpen: open, open: openModal, close: closeModal } = useDisclosure();
  const [form, setForm] = useState(emptyForm());
  const [error, setError] = useState("");
  const perPage = 8;

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.company || !form.email || !form.phone) {
      setError("Customer Name, Company Name, Email Address and Work Phone are required.");
      return;
    }
    if (!EMAIL_PATTERN.test(form.email)) {
      setError("Enter a valid email address.");
      return;
    }
    setError("");
    const openingBalance = Number(form.receivables) || 0;
    await addCustomer({
      id: Date.now(),
      name: form.name,
      company: form.company,
      email: form.email,
      phone: form.phone,
      gstin: form.gstin,
      address: form.address,
      receivables: `USD ${openingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      status: form.status,
      avatar: initialsFor(form.name),
    });
    setForm(emptyForm());
    closeModal();
    setCurrentPage(1);
  }

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const toggleRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedRows.length === paginated.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginated.map((c) => c.id));
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader
        title="All Customers"
        subtitle="Customer master data, receivables and account status"
      />

      <AsyncState status={status} error={loadError} loadingLabel="Loading customers…" />

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button style={{ padding: "10px 24px", fontSize: 14 }} onClick={() => openModal()}>
          + Add New Customers
        </Button>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {customerStats.slice(0, 3).map((s) => (
          <LineStatCard key={s.label} {...s} />
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
        <LineStatCard {...customerStats[3]} />
        <div />
      </div>

      {/* Data Table */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: "var(--radius)",
          boxShadow: "var(--shadow-sm)",
          overflow: "hidden",
        }}
      >
        {/* Table Toolbar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 24px",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: 10, fontSize: 14, color: "var(--muted)" }}>🔍</span>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              style={{
                padding: "10px 14px 10px 36px",
                border: "1px solid var(--line)",
                borderRadius: "var(--radius-sm)",
                outline: "none",
                fontSize: 13,
                width: 280,
                color: "var(--ink)",
                background: "var(--surface)",
                transition: "border var(--transition-fast)",
              }}
              onFocus={(e) => (e.target.style.border = "1px solid var(--primary)")}
              onBlur={(e) => (e.target.style.border = "1px solid var(--line)")}
            />
          </div>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              border: "1px solid var(--line)",
              borderRadius: "var(--radius-sm)",
              background: "var(--surface)",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--ink-secondary)",
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: 14 }}>🔽</span> Filter by
          </button>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto", padding: "0 8px" }}>
          <DataTable
            keyField="id"
            rows={paginated}
            emptyMessage="No customers found."
            rowStyle={(c) => (selectedRows.includes(c.id) ? { background: "var(--primary-tint)" } : undefined)}
            columns={[
              {
                key: "select",
                label: (
                  <input
                    type="checkbox"
                    checked={selectedRows.length === paginated.length && paginated.length > 0}
                    onChange={toggleAll}
                    style={checkboxStyle}
                  />
                ),
                render: (c) => (
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(c.id)}
                    onChange={() => toggleRow(c.id)}
                    style={checkboxStyle}
                  />
                ),
              },
              {
                key: "name",
                label: "Customer Name",
                render: (c) => {
                  const i = paginated.indexOf(c);
                  return (
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar initials={c.avatar} index={i} />
                      <span style={{ fontWeight: 600, color: "var(--ink)" }}>{c.name}</span>
                    </div>
                  );
                },
              },
              { key: "company", label: "Company Name" },
              { key: "email", label: "Email Address" },
              { key: "phone", label: "Work Phone" },
              { key: "receivables", label: "Receivables", emphasize: true },
              { key: "status", label: "Status", render: (c) => <Badge status={c.status} /> },
              {
                key: "actions",
                label: "Actions",
                render: () => (
                  <div style={{ display: "flex", gap: 8 }}>
                    <ActionBtn icon="🗑️" title="Delete" />
                    <ActionBtn icon="✏️" title="Edit" />
                  </div>
                ),
              },
            ]}
          />
        </div>

        {/* Pagination */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "14px 24px",
            borderTop: "1px solid var(--line)",
            background: "var(--surface)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <PaginationBtn
              label="‹"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            />
            {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map((p) => (
              <PaginationBtn
                key={p}
                label={String(p)}
                active={currentPage === p}
                onClick={() => setCurrentPage(p)}
              />
            ))}
            {totalPages > 3 && (
              <>
                <span style={{ padding: "0 4px", color: "var(--muted)" }}>...</span>
                <PaginationBtn
                  label={String(totalPages)}
                  active={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                />
              </>
            )}
            <PaginationBtn
              label="›"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>
              Showing {Math.min((currentPage - 1) * perPage + 1, filtered.length)} to{" "}
              {Math.min(currentPage * perPage, filtered.length)} of {filtered.length} entries
            </span>
            <button
              style={{
                padding: "6px 12px",
                border: "1px solid var(--line)",
                borderRadius: "var(--radius-sm)",
                background: "var(--surface)",
                fontSize: 12,
                fontWeight: 600,
                color: "var(--ink-secondary)",
                cursor: "pointer",
              }}
            >
              Show {perPage} ▾
            </button>
          </div>
        </div>
      </div>

      <Modal open={open} title="Customer Details" onClose={() => closeModal()} width={560}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <FormField label="Customer Name" required value={form.name} onChange={set("name")} placeholder="e.g. Ramesh Kumar" />
            <FormField label="Company Name" required value={form.company} onChange={set("company")} placeholder="e.g. Kumar Traders" />
            <FormField label="Email Address" type="email" required value={form.email} onChange={set("email")} placeholder="name@company.com" />
            <FormField label="Work Phone" required value={form.phone} onChange={set("phone")} placeholder="98xxxxxxxx" />
            <FormField label="GSTIN (optional)" value={form.gstin} onChange={set("gstin")} placeholder="09ABCDE1234F1Z5" />
            <FormField label="Status" type="select" required value={form.status} onChange={set("status")}
              options={["Accepted", "Pending", "Cancel"]} />
          </div>

          <FormField label="Billing Address" type="textarea" value={form.address} onChange={set("address")} placeholder="Street, City, State, PIN" />
          <FormField label="Opening Receivables" type="number" value={form.receivables} onChange={set("receivables")} placeholder="0" suffix="USD" />

          {error && (
            <p style={{ fontSize: 12, color: "var(--ink)", background: "var(--primary-tint)", border: "1px solid var(--line)", borderRadius: 3, padding: "8px 10px", marginBottom: 14 }}>
              {error}
            </p>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
            <Button variant="secondary" onClick={() => closeModal()}>Cancel</Button>
            <Button type="submit">Save Customer</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

/* ---------- tiny helper components ---------- */

function ActionBtn({ icon, title }) {
  return (
    <button
      title={title}
      style={{
        width: 32,
        height: 32,
        borderRadius: "var(--radius-sm)",
        border: "1px solid var(--line)",
        background: "var(--surface)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        fontSize: 14,
        transition: "background var(--transition-fast)",
      }}
      onMouseOver={(e) => (e.currentTarget.style.background = "var(--surface-hover)")}
      onMouseOut={(e) => (e.currentTarget.style.background = "var(--surface)")}
    >
      {icon}
    </button>
  );
}

function PaginationBtn({ label, active, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        minWidth: 32,
        height: 32,
        borderRadius: "var(--radius-sm)",
        border: active ? "none" : "1px solid var(--line)",
        background: active ? "var(--primary)" : "var(--surface)",
        color: active ? "white" : disabled ? "var(--faint)" : "var(--ink-secondary)",
        fontWeight: 600,
        fontSize: 13,
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all var(--transition-fast)",
      }}
    >
      {label}
    </button>
  );
}

/* ---------- shared table styles ---------- */

const checkboxStyle = {
  width: 16,
  height: 16,
  accentColor: "var(--primary)",
  cursor: "pointer",
};
