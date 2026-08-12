import { Link, useSearchParams } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import FormField from "../components/common/FormField";
import Badge from "../components/common/Badge";
import AsyncState from "../components/common/AsyncState";
import { useWarehouses } from "../features/warehouses/useWarehouses";

function RoleCard({ roleLabel, name, phone, email, icon, gradient = false }) {
  if (!name) {
    return (
      <div
        style={{
          border: "1px dashed var(--line-strong)",
          borderRadius: 12,
          padding: "16px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          background: "var(--canvas)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <i className={`fa-solid ${icon}`} style={{ color: "var(--muted)", fontSize: 13 }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.4 }}>
              {roleLabel}
            </span>
          </div>
          <Badge tone="warning">UNASSIGNED</Badge>
        </div>
        <p style={{ margin: 0, fontSize: 12, color: "var(--ink-secondary)" }}>
          No {roleLabel.toLowerCase()} assigned to this warehouse hub yet.
        </p>
        <Link
          to="/warehouses/admin-management"
          style={{ fontSize: 12, fontWeight: 600, color: "var(--primary-deep)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
        >
          Assign Personnel <i className="fa-solid fa-arrow-right" style={{ fontSize: 10 }} />
        </Link>
      </div>
    );
  }

  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div
      style={{
        border: "1px solid var(--line)",
        borderRadius: 12,
        padding: "16px 18px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        background: "var(--surface)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: "50%",
          flexShrink: 0,
          background: gradient ? "var(--gradient-primary)" : "var(--primary-tint)",
          color: gradient ? "white" : "var(--primary-deep)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: 14,
          boxShadow: gradient ? "0 3px 8px rgba(0, 184, 107, 0.25)" : "none",
        }}
      >
        {initials}
      </div>
      <div style={{ minWidth: 0, flexGrow: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <i className={`fa-solid ${icon}`} style={{ color: "var(--primary)", fontSize: 11 }} />
          <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.4 }}>
            {roleLabel}
          </span>
        </div>
        <p style={{ margin: "2px 0 0", fontSize: 14, fontWeight: 700, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {name}
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 4, flexWrap: "wrap" }}>
          {phone && (
            <span style={{ fontSize: 11.5, color: "var(--muted)", display: "flex", alignItems: "center", gap: 4 }}>
              <i className="fa-solid fa-phone" style={{ fontSize: 9.5, color: "var(--primary)" }} /> {phone}
            </span>
          )}
          {email && (
            <span style={{ fontSize: 11.5, color: "var(--muted)", display: "flex", alignItems: "center", gap: 4 }}>
              <i className="fa-solid fa-envelope" style={{ fontSize: 9.5, color: "var(--primary)" }} /> {email}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WarehouseDetail() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { warehouses, status, error } = useWarehouses();

  const requestedId = searchParams.get("id");
  const warehouse = warehouses.find((w) => w.id === requestedId) ?? warehouses[0];

  function handleSelect(id) {
    setSearchParams(id ? { id } : {});
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <PageHeader
        title="Warehouse Detail"
        subtitle="Deep-dive into a single warehouse's roles, stock and status"
      />

      <AsyncState status={status} error={error} loadingLabel="Loading warehouse profile…" />

      {!warehouse && status === "succeeded" && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: 24, textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}>
            No warehouse found. Add a warehouse first to view details.
          </p>
        </div>
      )}

      {warehouse && (
        <>
          {/* HEADER HERO CARD */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: 14,
              padding: "18px 20px",
              boxShadow: "var(--shadow-sm)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Top Accent Gradient Bar */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: "linear-gradient(90deg, #059669 0%, #10B981 100%)",
              }}
            />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    flexShrink: 0,
                    background: "var(--gradient-primary)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    boxShadow: "0 4px 12px rgba(0, 184, 107, 0.3)",
                  }}
                >
                  <i className="fa-solid fa-warehouse" />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {warehouse.name}
                    </h2>
                    <Badge tone={warehouse.status === "Active" ? "success" : "warning"}>
                      {warehouse.status ? warehouse.status.toUpperCase() : "ACTIVE"}
                    </Badge>
                  </div>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--muted)", fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
                    <span><i className="fa-solid fa-barcode" style={{ fontSize: 10 }} /> Code: <strong>{warehouse.code || "WH-MAIN"}</strong></span>
                    <span>•</span>
                    <span><i className="fa-solid fa-wheat-awn" style={{ fontSize: 10, color: "var(--primary)" }} /> Commodity: <strong>{warehouse.commodity}</strong></span>
                  </p>
                </div>
              </div>

              <div style={{ minWidth: 220 }}>
                <FormField
                  label="Switch Warehouse"
                  type="select"
                  value={warehouse.id}
                  onChange={handleSelect}
                  options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
                  compact
                  marginBottom={0}
                />
              </div>
            </div>

            {(warehouse.address || warehouse.createdAt) && (
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--line)", display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
                {warehouse.address && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <i className="fa-solid fa-location-dot" style={{ color: "var(--primary)", fontSize: 13 }} />
                    <div>
                      <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>Address</p>
                      <p style={{ margin: "1px 0 0", fontSize: 12, color: "var(--ink-secondary)", maxWidth: 500 }}>{warehouse.address}</p>
                    </div>
                  </div>
                )}
                {warehouse.createdAt && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <i className="fa-solid fa-calendar-check" style={{ color: "var(--primary)", fontSize: 13 }} />
                    <div>
                      <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>Registered Date</p>
                      <p style={{ margin: "1px 0 0", fontSize: 12, color: "var(--ink-secondary)" }}>{warehouse.createdAt}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* COMPACT STAT METRICS TILES */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }} className="responsive-grid-2">
            <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: "var(--primary-tint)", color: "var(--primary-deep)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                <i className="fa-solid fa-wheat-awn" />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>Commodity</p>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginTop: 2 }}>{warehouse.commodity}</div>
              </div>
            </div>

            <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: "var(--primary-tint)", color: "var(--primary-deep)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                <i className="fa-solid fa-users" />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>Enrolled Staff</p>
                <div style={{ fontSize: 15, fontWeight: 800, color: "var(--ink)", marginTop: 2 }}>{warehouse.staff || 0} Members</div>
              </div>
            </div>

            <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: "#D1FAE5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                <i className="fa-solid fa-boxes-stacked" />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>Current Stock</p>
                <div style={{ fontSize: 15, fontWeight: 800, color: "var(--ink)", marginTop: 2 }}>{warehouse.stock || "0 kg"}</div>
              </div>
            </div>

            <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: "var(--primary-tint)", color: "var(--primary-deep)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                <i className="fa-solid fa-circle-check" />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>Operating Status</p>
                <div style={{ marginTop: 2 }}>
                  <Badge tone={warehouse.status === "Active" ? "success" : "warning"}>
                    {warehouse.status ? warehouse.status.toUpperCase() : "ACTIVE"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* MANAGEMENT TEAM SECTION */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: 14,
              padding: "18px 20px",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, paddingBottom: 8, borderBottom: "1px solid var(--line)" }}>
              <i className="fa-solid fa-users-gear" style={{ color: "var(--primary)", fontSize: 14 }} />
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>Management Personnel</h3>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="responsive-grid-2">
              <RoleCard
                roleLabel="Warehouse Admin"
                name={warehouse.admin}
                phone={warehouse.adminPhone}
                email={warehouse.adminEmail}
                icon="fa-user-shield"
                gradient
              />
              <RoleCard
                roleLabel="Warehouse Supervisor"
                name={warehouse.supervisor}
                phone={warehouse.supervisorPhone}
                email={warehouse.supervisorEmail}
                icon="fa-user-gear"
              />
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12.5, paddingTop: 4 }}>
            <Link
              to="/warehouses"
              style={{ color: "var(--ink-secondary)", fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <i className="fa-solid fa-arrow-left-long" /> Back to All Warehouses
            </Link>
            <Link
              to="/warehouses/admin-management"
              style={{ color: "var(--primary-deep)", fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              Manage Personnel <i className="fa-solid fa-arrow-right-long" />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
