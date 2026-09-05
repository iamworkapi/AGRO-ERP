import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import FormField from "../components/common/FormField";
import Button from "../components/common/Button";
import { useWarehouses } from "../features/warehouses/useWarehouses";
import { toast } from "../utils/toast";

function emptyForm() {
  return {
    name: "",
    companyName: "",
    commodity: "",
    address: "",
    gstin: "",
    pan: "",
    contactPerson: "",
    contactPhone: "",
    email: "",
    helpDeskPhone: "",
  };
}

export default function CreateWarehouse() {
  const navigate = useNavigate();
  const { addWarehouse } = useWarehouses();
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const handleGstinChange = (val) => {
    const sanitized = (val || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 15);
    setForm((f) => {
      const updated = { ...f, gstin: sanitized };
      if (sanitized.length === 15 && (!f.pan || f.pan.length < 10)) {
        updated.pan = sanitized.substring(2, 12);
        toast.info(`Auto-detected PAN from GSTIN: ${sanitized.substring(2, 12)}`);
      }
      return updated;
    });
  };

  const handlePanChange = (val) => {
    const sanitized = (val || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
    setForm((f) => ({ ...f, pan: sanitized }));
  };

  async function handleSubmit(e) {
    e.preventDefault();

    if (form.gstin?.trim() && form.gstin.trim().length !== 15) {
      toast.error("GSTIN must be exactly 15 alphanumeric characters (e.g. 09AALCK4355J1Z2).");
      return;
    }
    if (form.pan?.trim() && form.pan.trim().length !== 10) {
      toast.error("PAN must be exactly 10 alphanumeric characters (e.g. AALCK4355J).");
      return;
    }

    const payload = {
      name: form.name || "Kusumganga Agro Central Hub - Gorakhpur",
      companyName: form.companyName || "Kusumganga Agro Solutions Pvt. Ltd.",
      commodity: form.commodity || "Paddy Straw (Parali), Wheat Straw, Maize Stalk",
      address: form.address || "24-A, Sai Complex Betiyahata, Gorakhpur Uttar Pradesh, 273001",
      gstin: form.gstin || "09AALCK4355J1Z2",
      pan: form.pan || "AALCK4355J",
      contactPerson: form.contactPerson || "Mr. Jagdeep Singh",
      contactPhone: form.contactPhone || "7055000315",
      email: form.email || "kusumganga5@gmail.com",
      helpDeskPhone: form.helpDeskPhone || "7905525983",
    };

    setSaving(true);
    try {
      await addWarehouse(payload);
      toast.success(`${payload.name} was created successfully!`);
      navigate("/warehouses");
    } catch (err) {
      toast.error(err?.message || "Could not save the warehouse. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <PageHeader
        title="Add Warehouse"
        subtitle="Register a new procurement centre and location details"
      />

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

            {/* Section: Official Company & Warehouse Information */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, paddingBottom: 6, borderBottom: "1px solid var(--line)" }}>
                <i className="ri-building-line-flag" style={{ color: "var(--primary)", fontSize: 14 }} />
                <h3 style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)", margin: 0 }}>
                  Official Company & Location Details
                </h3>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }} className="responsive-grid-2">
                <FormField
                  label="Company Name"
                  required
                  icon="ri-building-line"
                  value={form.companyName}
                  onChange={set("companyName")}
                  placeholder="e.g. Kusumganga Agro Solutions Pvt. Ltd."
                  compact
                  marginBottom={12}
                />

                <FormField
                  label="Warehouse Hub Name"
                  required
                  icon="ri-building-line"
                  value={form.name}
                  onChange={set("name")}
                  placeholder="e.g. Kusumganga Agro Central Hub - Gorakhpur"
                  compact
                  marginBottom={12}
                />

                {/* Multi-Select Commodity Checkboxes Grid */}
                <div style={{ gridColumn: "1 / -1", marginBottom: 16, background: "var(--canvas)", padding: "12px 14px", borderRadius: 10, border: "1px solid var(--line)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 6 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 700, color: "#0D3823", margin: 0 }}>
                      <i className="ri-plant-line" style={{ color: "var(--primary)" }} />
                      Select Handled Commodities (Check Multiple Boxes) <span style={{ color: "var(--status-error)" }}>*</span>
                    </label>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => set("commodity")("Paddy Straw (Parali), Wheat Straw, Maize Stalk, Mustard Husk, Sugarcane Bagasse, Multi-Crop Biomass")}
                        style={{ border: "none", background: "none", color: "var(--primary-deep)", fontSize: 10.5, fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={() => set("commodity")("")}
                        style={{ border: "none", background: "none", color: "var(--muted)", fontSize: 10.5, fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}
                      >
                        Clear
                      </button>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#0D3823", background: "rgba(27, 94, 58, 0.12)", border: "1px solid rgba(27, 94, 58, 0.25)", padding: "3px 10px", borderRadius: 14 }}>
                        Selected ({form.commodity ? form.commodity.split(", ").length : 0}): {form.commodity || "None Selected"}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }} className="responsive-grid-2">
                    {[
                      "Paddy Straw (Parali)",
                      "Wheat Straw",
                      "Maize Stalk",
                      "Mustard Husk",
                      "Sugarcane Bagasse",
                      "Multi-Crop Biomass",
                    ].map((opt) => {
                      const currentSelected = form.commodity ? form.commodity.split(", ").map((s) => s.trim()) : [];
                      const isChecked = currentSelected.includes(opt);

                      const toggleItem = (targetOpt) => {
                        let nextSelected;
                        if (currentSelected.includes(targetOpt)) {
                          nextSelected = currentSelected.filter((item) => item !== targetOpt);
                        } else {
                          nextSelected = [...currentSelected, targetOpt];
                        }
                        set("commodity")(nextSelected.join(", "));
                      };

                      return (
                        <div
                          key={opt}
                          onClick={() => toggleItem(opt)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "9px 12px",
                            borderRadius: 8,
                            border: isChecked ? "2px solid #1B5E3A" : "1px solid var(--line-strong)",
                            background: isChecked ? "rgba(27, 94, 58, 0.14)" : "var(--surface)",
                            color: isChecked ? "#0D3823" : "var(--ink)",
                            fontWeight: isChecked ? 700 : 500,
                            fontSize: 12,
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            boxShadow: isChecked ? "0 2px 8px rgba(27, 94, 58, 0.15)" : "var(--shadow-sm)",
                            userSelect: "none",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleItem(opt)}
                            onClick={(e) => e.stopPropagation()}
                            style={{ accentColor: "#1B5E3A", cursor: "pointer", width: 17, height: 17, flexShrink: 0 }}
                          />
                          <span style={{ lineHeight: 1.2 }}>{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <FormField
                  label="GSTIN / Unique ID"
                  required
                  icon="ri-file-line-invoice"
                  maxLength={15}
                  value={form.gstin}
                  onChange={handleGstinChange}
                  placeholder="e.g. 09AALCK4355J1Z2"
                  helperText={`[${(form.gstin || "").length}/15 digits]`}
                  compact
                  marginBottom={12}
                />

                <FormField
                  label="PAN NO"
                  required
                  icon="ri-id-card-line"
                  maxLength={10}
                  value={form.pan}
                  onChange={handlePanChange}
                  placeholder="e.g. AALCK4355J"
                  helperText={`[${(form.pan || "").length}/10 digits]`}
                  compact
                  marginBottom={12}
                />

                <FormField
                  label="Primary Contact Person"
                  required
                  icon="ri-user-3-line"
                  value={form.contactPerson}
                  onChange={set("contactPerson")}
                  placeholder="e.g. Mr. Jagdeep Singh"
                  compact
                  marginBottom={12}
                />

                <FormField
                  label="Contact Phone"
                  required
                  icon="ri-phone-line"
                  value={form.contactPhone}
                  onChange={set("contactPhone")}
                  placeholder="e.g. 7055000315"
                  compact
                  marginBottom={12}
                />

                <FormField
                  label="Official Mail ID"
                  required
                  icon="ri-mail-line"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="e.g. kusumganga5@gmail.com"
                  compact
                  marginBottom={12}
                />

                <FormField
                  label="Help Desk Number"
                  required
                  icon="ri-customer-service-2-line"
                  value={form.helpDeskPhone}
                  onChange={set("helpDeskPhone")}
                  placeholder="e.g. 7905525983"
                  compact
                  marginBottom={12}
                />

                <div style={{ gridColumn: "1 / -1" }}>
                  <FormField
                    label="Full Address / Location"
                    type="textarea"
                    required
                    value={form.address}
                    onChange={set("address")}
                    placeholder="e.g. 24-A, Sai Complex Betiyahata, Gorakhpur Uttar Pradesh, 273001"
                    compact
                    marginBottom={12}
                  />
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
              <Button
                variant="secondary"
                type="button"
                onClick={() => navigate("/warehouses")}
                style={{ padding: "8px 16px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
              >
                <i className="ri-close-line" /> Cancel
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
                    <i className="ri-loader-4-line spin" /> Saving…
                  </>
                ) : (
                  <>
                    <i className="ri-check-line" /> Save Warehouse
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
              <i className="ri-eye-line" style={{ color: "var(--primary)", fontSize: 13 }} />
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
                  <i className="ri-building-line" />
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
                <div style={{ fontSize: 11, fontWeight: 700, color: "#0D3823" }}>
                  {form.companyName || "Legal Company Name"}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                  <span style={{ color: "var(--muted)" }}>GSTIN:</span>
                  <span style={{ fontWeight: 700, color: "var(--ink)" }}>{form.gstin || "—"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                  <span style={{ color: "var(--muted)" }}>PAN NO:</span>
                  <span style={{ fontWeight: 700, color: "var(--ink)" }}>{form.pan || "—"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                  <span style={{ color: "var(--muted)" }}>Contact:</span>
                  <span style={{ fontWeight: 700, color: "var(--ink)" }}>{form.contactPerson ? `${form.contactPerson} (${form.contactPhone || ""})` : "—"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                  <span style={{ color: "var(--muted)" }}>Help Desk:</span>
                  <span style={{ fontWeight: 700, color: "#1B5E3A" }}>{form.helpDeskPhone || "—"}</span>
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
              <i className="ri-information-line" style={{ color: "#33C689", fontSize: 14 }} />
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "white" }}>Setup Guidelines</span>
            </div>
            <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.72)", margin: 0, lineHeight: 1.45 }}>
              Once created, staff employees and personnel can be assigned to this warehouse from the Employee Management module.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
