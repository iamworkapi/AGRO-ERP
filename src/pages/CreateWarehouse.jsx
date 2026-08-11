import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import FormField from "../components/common/FormField";
import Button from "../components/common/Button";
import AsyncState from "../components/common/AsyncState";
import { useWarehouses, useAvailableWarehouseStaff } from "../features/warehouses/useWarehouses";
import { createWarehouseSchema } from "../validators/warehouseValidators";
import { validateOrToast } from "../utils/validate";
import { toast } from "../utils/toast";

function emptyForm() {
  return { name: "", commodity: "", adminId: "", adminName: "", supervisorId: "", supervisorName: "", address: "" };
}

function staffOptions(people) {
  return people.map((p) => ({ value: p.id, label: p.phone ? `${p.fullName} (${p.phone})` : p.fullName }));
}

export default function CreateWarehouse() {
  const navigate = useNavigate();
  const { addWarehouse } = useWarehouses();
  const { admins, supervisors, status, error: loadError } = useAvailableWarehouseStaff();
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  async function handleSubmit(e) {
    e.preventDefault();
    const parsed = validateOrToast(createWarehouseSchema, form);
    if (!parsed) return;

    setSaving(true);
    try {
      await addWarehouse(parsed).unwrap();
      toast.success(`${parsed.name} was created successfully.`);
      navigate("/warehouses");
    } catch (err) {
      toast.error(err?.message || "Could not save the warehouse. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const noEligibleStaff = status === "succeeded" && (admins.length === 0 || supervisors.length === 0);

  const selectedAdmin = admins.find((a) => String(a.id) === String(form.adminId));
  const selectedSupervisor = supervisors.find((s) => String(s.id) === String(form.supervisorId));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <PageHeader
        title="Add Warehouse"
        subtitle="Register a new procurement centre and assign required management personnel"
      />

      <AsyncState status={status} error={loadError} loadingLabel="Loading eligible admins and supervisors…" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 18 }} className="responsive-grid-2">
        {/* Main Form Section */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 14,
            boxShadow: "var(--shadow-sm)",
            padding: "22px 24px",
            position: "relative",
          }}
        >
          {/* Accent Line */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              borderTopLeftRadius: 14,
              borderTopRightRadius: 14,
              background: "linear-gradient(90deg, #059669 0%, #10B981 100%)",
            }}
          />

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Section 1: Basic Information */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, paddingBottom: 6, borderBottom: "1px solid var(--line)" }}>
                <i className="fa-solid fa-warehouse" style={{ color: "var(--primary)", fontSize: 14 }} />
                <h3 style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)", margin: 0 }}>
                  Basic Information
                </h3>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }} className="responsive-grid-2">
                <FormField
                  label="Warehouse Name"
                  required
                  icon="fa-solid fa-building"
                  value={form.name}
                  onChange={set("name")}
                  placeholder="e.g. Manimau Centre"
                  compact
                  marginBottom={12}
                />

                <FormField
                  label="Commodity"
                  type="select"
                  required
                  value={form.commodity}
                  onChange={set("commodity")}
                  options={["Maize", "PRALLI", "Maize / PRALLI", "Seeds", "Fertiliser"]}
                  compact
                  marginBottom={12}
                />
              </div>
            </div>

            {/* Section 2: Management Personnel */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, paddingBottom: 6, borderBottom: "1px solid var(--line)" }}>
                <i className="fa-solid fa-users-gear" style={{ color: "var(--primary)", fontSize: 14 }} />
                <h3 style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)", margin: 0 }}>
                  Management Personnel
                </h3>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }} className="responsive-grid-2">
                <div>
                  <FormField
                    label="Warehouse Admin Account"
                    type="select"
                    required
                    value={form.adminId}
                    onChange={(val) => {
                      set("adminId")(val);
                      const adm = admins.find((a) => String(a.id) === String(val));
                      if (adm) set("adminName")(adm.fullName);
                    }}
                    options={staffOptions(admins)}
                    compact
                    marginBottom={8}
                  />
                  <FormField
                    label="Admin Full Name"
                    required
                    icon="fa-solid fa-user-shield"
                    value={form.adminName || (selectedAdmin ? selectedAdmin.fullName : "")}
                    onChange={set("adminName")}
                    placeholder="e.g. Manoj Kumar"
                    compact
                    marginBottom={12}
                  />
                </div>

                <div>
                  <FormField
                    label="Warehouse Supervisor Account"
                    type="select"
                    required
                    value={form.supervisorId}
                    onChange={(val) => {
                      set("supervisorId")(val);
                      const sup = supervisors.find((s) => String(s.id) === String(val));
                      if (sup) set("supervisorName")(sup.fullName);
                    }}
                    options={staffOptions(supervisors)}
                    compact
                    marginBottom={8}
                  />
                  <FormField
                    label="Supervisor Full Name"
                    required
                    icon="fa-solid fa-user-gear"
                    value={form.supervisorName || (selectedSupervisor ? selectedSupervisor.fullName : "")}
                    onChange={set("supervisorName")}
                    placeholder="e.g. Ramesh Singh"
                    compact
                    marginBottom={12}
                  />
                </div>
              </div>

              {/* Personnel Assignment Note */}
              <div style={{ background: "var(--canvas)", border: "1px solid var(--line)", borderRadius: 8, padding: "10px 12px", margin: "2px 0 6px", display: "flex", gap: 10, alignItems: "flex-start" }}>
                <i className="fa-solid fa-shield-halved" style={{ color: "var(--primary)", fontSize: 13, marginTop: 2, flexShrink: 0 }} />
                <p style={{ fontSize: 11.5, color: "var(--ink-secondary)", margin: 0, lineHeight: 1.4 }}>
                  <strong>Note:</strong> Every warehouse requires an assigned Warehouse Admin and Supervisor. Only active, unassigned staff accounts appear in the dropdowns.
                </p>
              </div>

              {noEligibleStaff && (
                <div style={{ fontSize: 12, color: "var(--status-warning, #92400e)", background: "var(--status-warning-bg, #fef3c7)", border: "1px solid rgba(217, 119, 6, 0.2)", borderRadius: 8, padding: "10px 12px", marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
                  <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: 14, flexShrink: 0 }} />
                  <span>
                    No eligible {admins.length === 0 ? "Warehouse Admins" : "Warehouse Supervisors"} available right now. Approve a pending signup first.
                  </span>
                </div>
              )}
            </div>

            {/* Section 3: Location Details */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid var(--line)" }}>
                <i className="fa-solid fa-location-dot" style={{ color: "var(--primary)", fontSize: 14 }} />
                <h3 style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)", margin: 0 }}>
                  Location & Address
                </h3>
              </div>

              <FormField
                label="Address / GPS Location"
                type="textarea"
                value={form.address}
                onChange={set("address")}
                placeholder="e.g. 24-A, Sai Complex, Betiya Hata, Gorakhpur (U.P.) 273001"
                compact
                marginBottom={8}
              />
            </div>

            {/* Action Bar */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
              <Button
                variant="secondary"
                type="button"
                onClick={() => navigate("/warehouses")}
                style={{ padding: "8px 16px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
              >
                <i className="fa-solid fa-xmark" /> Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="btn-glow"
                style={{
                  padding: "8px 18px",
                  fontSize: 13,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "var(--gradient-primary)",
                  boxShadow: "0 4px 12px rgba(0, 184, 107, 0.3)",
                }}
              >
                {saving ? (
                  <>
                    <i className="fa-solid fa-circle-notch spin" /> Saving…
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-check" /> Save Warehouse
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Right Live Summary / Preview Card */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: 14,
              padding: "18px 20px",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, paddingBottom: 8, borderBottom: "1px solid var(--line)" }}>
              <i className="fa-solid fa-eye" style={{ color: "var(--primary)", fontSize: 13 }} />
              <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>Live Card Preview</h4>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "var(--primary-tint)",
                    color: "var(--primary-deep)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  <i className="fa-solid fa-warehouse" />
                </div>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", display: "block" }}>
                    {form.name || "Warehouse Name"}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500 }}>
                    Commodity: <strong style={{ color: "var(--ink-secondary)" }}>{form.commodity || "Not Selected"}</strong>
                  </span>
                </div>
              </div>

              <div style={{ background: "var(--canvas)", border: "1px solid var(--line)", borderRadius: 8, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5 }}>
                  <span style={{ color: "var(--muted)", display: "flex", alignItems: "center", gap: 5 }}>
                    <i className="fa-solid fa-user-shield" style={{ color: "var(--primary)", fontSize: 11 }} /> Admin:
                  </span>
                  <span style={{ fontWeight: 600, color: "var(--ink)" }}>
                    {selectedAdmin ? selectedAdmin.fullName : "Unassigned"}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5 }}>
                  <span style={{ color: "var(--muted)", display: "flex", alignItems: "center", gap: 5 }}>
                    <i className="fa-solid fa-user-gear" style={{ color: "var(--primary)", fontSize: 11 }} /> Supervisor:
                  </span>
                  <span style={{ fontWeight: 600, color: "var(--ink)" }}>
                    {selectedSupervisor ? selectedSupervisor.fullName : "Unassigned"}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 4 }}>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>Initial Status:</span>
                <span style={{ fontSize: 10.5, fontWeight: 600, color: "#10B981", background: "var(--primary-tint)", padding: "2px 8px", borderRadius: 10 }}>
                  ● Active Hub
                </span>
              </div>
            </div>
          </div>

          <div
            style={{
              background: "linear-gradient(135deg, #051F17 0%, #07281D 100%)",
              borderRadius: 14,
              padding: "16px 18px",
              color: "white",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <i className="fa-solid fa-circle-info" style={{ color: "#33C689", fontSize: 14 }} />
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "white" }}>Setup Guidelines</span>
            </div>
            <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.72)", margin: 0, lineHeight: 1.45 }}>
              Once created, staff employees can be enrolled in this warehouse from the Employee Management module.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
