import { useState } from "react";
import PageHeader from "../components/common/PageHeader";
import DataTable from "../components/common/DataTable";
import Badge from "../components/common/Badge";
import Avatar from "../components/common/Avatar";
import Button from "../components/common/Button";
import AsyncState from "../components/common/AsyncState";
import { useAttendance } from "../features/attendance/useAttendance";
import { toast } from "../utils/toast";

const statusTone = { Present: "success", Late: "warning", Pending: "warning", Absent: "error" };

function nameCell(name, index) {
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <Avatar initials={initials} index={index} />
      <span style={{ fontWeight: 700, color: "var(--ink)" }}>{name}</span>
    </div>
  );
}

export default function ExceptionApprovals() {
  const { records, status, error, markPresent } = useAttendance();
  const exceptions = records.filter((r) => r.status !== "Present");
  const [busyId, setBusyId] = useState(null);

  async function handleMarkPresent(record) {
    setBusyId(record.id);
    try {
      await markPresent(record.id);
      toast.success(`${record.employee} marked present.`);
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || err.message || "Could not update this record.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <PageHeader
        title="Exception Approvals"
        subtitle="Late, pending and absent check-ins awaiting administrator review"
      />

      <AsyncState status={status} error={error} loadingLabel="Loading exceptions…" />

      {/* COMPACT SUMMARY STATS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }} className="responsive-grid-2">
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: "#FEF3C7", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            <i className="ri-user-3-line-clock" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>Pending Exceptions</p>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)", marginTop: 2 }}>{exceptions.length} Items</div>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: "#D1FAE5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            <i className="ri-checkbox-circle-fill" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>Approval Policy</p>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--ink)", marginTop: 2 }}>Manual Review</div>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: "var(--primary-tint)", color: "var(--primary-deep)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            <i className="ri-shield-check-line" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>Audit Logging</p>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginTop: 2 }}>Enabled</div>
          </div>
        </div>
      </div>

      <DataTable
        title="Pending Exceptions Queue"
        searchable
        searchPlaceholder="Search exception logs by name or warehouse..."
        keyField="id"
        rows={exceptions}
        emptyMessage="No pending attendance exceptions right now — all clear!"
        columns={[
          { key: "employee", label: "Employee", emphasize: true, render: (r, idx) => nameCell(r.employee, idx) },
          {
            key: "warehouse",
            label: "Warehouse Hub",
            render: (r) => (
              <span style={{ fontWeight: 600, color: "var(--ink)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                <i className="ri-building-line" style={{ color: "var(--primary)", fontSize: 11 }} />
                {r.warehouse}
              </span>
            ),
          },
          { key: "date", label: "Date" },
          {
            key: "checkIn",
            label: "Check-in",
            render: (r) => (
              <span style={{ fontWeight: 600, color: "#D97706", display: "inline-flex", alignItems: "center", gap: 5 }}>
                <i className="ri-login-box-line" style={{ fontSize: 11 }} />
                {r.checkIn}
              </span>
            ),
          },
          { key: "checkOut", label: "Check-out", render: (r) => <span style={{ fontSize: 12, color: "var(--muted)" }}>{r.checkOut}</span> },
          { key: "status", label: "Status", render: (r) => <Badge tone={statusTone[r.status] || "warning"}>{r.status.toUpperCase()}</Badge> },
          {
            key: "actions",
            label: "Actions",
            sortable: false,
            render: (r) => (
              <Button
                variant="secondary"
                disabled={busyId === r.id}
                style={{
                  padding: "5px 12px",
                  fontSize: 11.5,
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  background: "var(--primary-tint)",
                  color: "var(--primary-deep)",
                  borderColor: "var(--primary)",
                }}
                onClick={() => handleMarkPresent(r)}
              >
                <i className="ri-check-line" /> Mark Present
              </Button>
            ),
          },
        ]}
      />
    </div>
  );
}
