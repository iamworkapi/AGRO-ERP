import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import FormField from "../components/common/FormField";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import PrintableWeighmentSlipModal from "../features/weighment/components/PrintableWeighmentSlipModal";
import { useWeighment } from "../features/weighment/useWeighment";
import { useStockEntries } from "../features/stockEntries/useStockEntries";
import { useWeightMachines } from "../features/weightMachines/useWeightMachines";
import { useWarehouses } from "../features/warehouses/useWarehouses";
import { useAuth } from "../hooks/useAuth";
import { createStockEntrySchema } from "../validators/stockEntryValidators";
import { validateOrToast } from "../utils/validate";
import { toast } from "../utils/toast";

const COMMODITY_DEFAULTS = {
  PRALLI: { allowedMoisture: "20", rate: "1900" },
  "PRALLI (Baled)": { allowedMoisture: "18", rate: "1950" },
  "PRALLI (Loose)": { allowedMoisture: "22", rate: "1850" },
};

function emptyForm(defaultWarehouseId = "") {
  const randomSlip = "RST-" + Math.floor(18000 + Math.random() * 1000);
  return {
    warehouseId: defaultWarehouseId,
    weightMachineId: "",
    slipNo: randomSlip,
    entryType: "inward",
    party: "",
    vehicleNo: "",
    commodity: "PRALLI",
    gross: "",
    tare: "",
    moisture: "20",
    allowedMoisture: "20",
    rate: "1900",
  };
}

function useMoistureCalc(form) {
  return useMemo(() => {
    const gross = parseFloat(form.gross) || 0;
    const tare = parseFloat(form.tare) || 0;
    const moisture = parseFloat(form.moisture) || 0;
    const allowed = parseFloat(form.allowedMoisture) || 20;
    const rate = parseFloat(form.rate) || 1900;

    const beforeDeduction = Math.max(gross - tare, 0); // Net weight in kg
    const netWeightMt = beforeDeduction / 1000;

    const excessPct = Math.max(moisture - allowed, 0);
    const deductionPct = excessPct; // 1% weight cut per 1% excess moisture
    const deductionKg = (beforeDeduction * deductionPct) / 100;
    const deductionMt = deductionKg / 1000;

    const actualWeightKg = Math.max(0, beforeDeduction - deductionKg);
    const actualWeightMt = actualWeightKg / 1000;

    const totalAmountRs = Math.round(actualWeightMt * rate * 100) / 100;

    // Moisture Level Status: safe (<allowed), caution (allowed to allowed+5), high (>allowed+5)
    let moistureStatus = "safe";
    if (excessPct > 5) moistureStatus = "danger";
    else if (excessPct > 0) moistureStatus = "warning";

    return {
      beforeDeduction,
      netWeightMt,
      allowed,
      excessPct,
      deductionPct,
      deductionKg,
      deductionMt,
      actualWeightKg,
      actualWeightMt,
      rate,
      totalAmountRs,
      over: excessPct > 0,
      moistureStatus,
    };
  }, [form]);
}

export default function CreateWeighmentSlip() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isScopedRole = user?.roleKey === "supervisor" || user?.roleKey === "warehouse_admin";

  const { warehouses } = useWarehouses();
  const myWarehouse = isScopedRole ? warehouses[0] : null;

  const [form, setForm] = useState(() => emptyForm());
  const [saving, setSaving] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const calc = useMoistureCalc(form);

  useEffect(() => {
    if (isScopedRole && myWarehouse?.id) {
      setForm((f) => (f.warehouseId ? f : { ...f, warehouseId: myWarehouse.id }));
    }
  }, [isScopedRole, myWarehouse?.id]);

  const { machines, status: machinesStatus } = useWeightMachines(form.warehouseId || undefined);
  const activeMachines = useMemo(() => machines.filter((m) => m.status === "active"), [machines]);

  useEffect(() => {
    setForm((f) => (f.weightMachineId && activeMachines.some((m) => m.id === f.weightMachineId) ? f : { ...f, weightMachineId: "" }));
  }, [activeMachines]);

  const { addEntry } = useStockEntries();

  const set = (key) => (val) => {
    setForm((f) => {
      const updated = { ...f, [key]: val };
      if (key === "commodity" && COMMODITY_DEFAULTS[val]) {
        updated.allowedMoisture = COMMODITY_DEFAULTS[val].allowedMoisture;
        updated.rate = COMMODITY_DEFAULTS[val].rate;
      }
      return updated;
    });
  };

  function handleAutoGenerateSlipNo() {
    const generated = "RST-" + Math.floor(18000 + Math.random() * 1000);
    setForm((f) => ({ ...f, slipNo: generated }));
    toast.info(`Generated Slip No: ${generated}`);
  }

  const noActiveMachine = form.warehouseId && machinesStatus === "succeeded" && activeMachines.length === 0;

  async function handleSubmit(e) {
    e.preventDefault();
    const parsed = validateOrToast(createStockEntrySchema, {
      warehouseId: form.warehouseId,
      weightMachineId: form.weightMachineId,
      slipNo: form.slipNo,
      entryType: form.entryType,
      commodity: form.commodity,
      partyName: form.party,
      vehicleNo: form.vehicleNo,
      grossWeightKg: form.gross,
      tareWeightKg: form.tare,
      moisturePct: form.moisture,
      allowedMoisturePct: form.allowedMoisture,
      deductionPct: calc.deductionPct,
      ratePerMt: form.rate,
    });
    if (!parsed) return;

    setSaving(true);
    try {
      await addEntry(parsed);
      toast.success(`Weighment slip #${form.slipNo} saved.`);
      navigate("/weighment");
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || err.message || "Could not save this weighment slip.");
    } finally {
      setSaving(false);
    }
  }

  const selectedWarehouseObj = warehouses.find((w) => w.id === form.warehouseId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button
          type="button"
          onClick={() => navigate("/weighment")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            border: "none",
            background: "transparent",
            padding: 0,
            fontSize: 12.5,
            fontWeight: 600,
            color: "var(--ink-secondary)",
            cursor: "pointer",
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = "var(--primary-deep)")}
          onMouseOut={(e) => (e.currentTarget.style.color = "var(--ink-secondary)")}
        >
          <i className="fa-solid fa-arrow-left-long" /> Back to Weighment Slips & Register
        </button>
      </div>

      <PageHeader
        title="New PRALLI Weighment Slip & Bill Generator"
        subtitle="Record gross/tare weights, moisture percentage & auto-calculate PRALLI moisture cut & net payable bill"
      />

      {noActiveMachine && (
        <div style={{ background: "var(--status-warning-bg, #fef3c7)", border: "1px solid rgba(217, 119, 6, 0.25)", borderRadius: 10, padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-start" }}>
          <i className="fa-solid fa-triangle-exclamation" style={{ color: "#D97706", fontSize: 15, marginTop: 1 }} />
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#92400e" }}>No active weight machine found</p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#92400e" }}>
              {isScopedRole
                ? "Ask your Warehouse Admin to add a weight machine before logging a weighment slip."
                : "Add a weight machine for this warehouse before logging a weighment slip."}{" "}
              <a href="/weighment/machines" onClick={(e) => { e.preventDefault(); navigate("/weighment/machines"); }} style={{ color: "#92400e", fontWeight: 700, textDecoration: "underline" }}>
                Manage Weight Machines &rarr;
              </a>
            </p>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 18 }} className="responsive-grid-2">
        {/* Main Entry Form */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 14,
            padding: "20px 22px",
            boxShadow: "var(--shadow-sm)",
            position: "relative",
          }}
        >
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

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Section 1: Facility, Machine & Commodity */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid var(--line)" }}>
                <i className="fa-solid fa-warehouse" style={{ color: "var(--primary)", fontSize: 13 }} />
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", margin: 0 }}>
                  Procurement Hub & Weight Machine
                </h3>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }} className="responsive-grid-2">
                <FormField
                  label="Procurement Centre"
                  type="select"
                  required
                  disabled={isScopedRole}
                  value={form.warehouseId}
                  onChange={set("warehouseId")}
                  options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
                  compact
                  marginBottom={10}
                />

                <FormField
                  label="Weight Machine"
                  type="select"
                  required
                  value={form.weightMachineId}
                  onChange={set("weightMachineId")}
                  options={activeMachines.map((m) => ({ value: m.id, label: m.machineCode }))}
                  placeholder={form.warehouseId ? "Select machine" : "Select a centre first"}
                  compact
                  marginBottom={10}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }} className="responsive-grid-2">
                <div style={{ position: "relative" }}>
                  <FormField
                    label="R.S.T / Slip Number"
                    required
                    icon="fa-solid fa-hashtag"
                    value={form.slipNo}
                    onChange={set("slipNo")}
                    placeholder="e.g. RST-720"
                    compact
                    marginBottom={10}
                  />
                  <button
                    type="button"
                    onClick={handleAutoGenerateSlipNo}
                    title="Auto generate slip sequence number"
                    style={{
                      position: "absolute",
                      right: 6,
                      top: 26,
                      border: "none",
                      background: "var(--primary-tint)",
                      color: "var(--primary-deep)",
                      fontSize: 10.5,
                      fontWeight: 700,
                      padding: "3px 7px",
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                  >
                    Auto <i className="fa-solid fa-wand-magic-sparkles" />
                  </button>
                </div>

                <FormField
                  label="Entry Type"
                  type="select"
                  required
                  value={form.entryType}
                  onChange={set("entryType")}
                  options={[{ value: "inward", label: "Inward (Procurement)" }, { value: "outward", label: "Outward (Dispatch)" }]}
                  compact
                  marginBottom={10}
                />
              </div>

              <FormField
                label="Commodity / Crop Name"
                type="select"
                required
                value={form.commodity}
                onChange={set("commodity")}
                options={["PRALLI", "PRALLI (Baled)", "PRALLI (Loose)"]}
                compact
                marginBottom={10}
              />
            </div>

            {/* Section 2: Party & Vehicle Info */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid var(--line)" }}>
                <i className="fa-solid fa-truck-ramp-box" style={{ color: "var(--primary)", fontSize: 13 }} />
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", margin: 0 }}>
                  Supplier / Farmer & Vehicle Details
                </h3>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }} className="responsive-grid-2">
                <FormField
                  label="Name of Party / Farmer"
                  icon="fa-solid fa-building-user"
                  value={form.party}
                  onChange={set("party")}
                  placeholder="e.g. Kusumganga Agro Supplier"
                  compact
                  marginBottom={10}
                />

                <FormField
                  label="Vehicle Registration No."
                  icon="fa-solid fa-truck"
                  value={form.vehicleNo}
                  onChange={set("vehicleNo")}
                  placeholder="e.g. UP27 AF 2860"
                  compact
                  marginBottom={10}
                />
              </div>
            </div>

            {/* Section 3: Weight, Moisture & Rate Measurements */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid var(--line)" }}>
                <i className="fa-solid fa-scale-balanced" style={{ color: "var(--primary)", fontSize: 13 }} />
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", margin: 0 }}>
                  Weight, Moisture & Rate Measurements
                </h3>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 10px" }} className="responsive-grid-2">
                <FormField
                  label="Gross Weight"
                  type="number"
                  required
                  icon="fa-solid fa-scale-unbalanced"
                  suffix="kg"
                  value={form.gross}
                  onChange={set("gross")}
                  placeholder="0"
                  compact
                  marginBottom={8}
                />
                <FormField
                  label="Tare Weight"
                  type="number"
                  required
                  icon="fa-solid fa-scale-balanced"
                  suffix="kg"
                  value={form.tare}
                  onChange={set("tare")}
                  placeholder="0"
                  compact
                  marginBottom={8}
                />
                <FormField
                  label="Moisture Level"
                  type="number"
                  icon="fa-solid fa-droplet"
                  suffix="%"
                  value={form.moisture}
                  onChange={set("moisture")}
                  placeholder="0.0"
                  compact
                  marginBottom={8}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 10px", marginTop: 4 }} className="responsive-grid-2">
                <FormField
                  label="Allowed Moisture Baseline"
                  type="number"
                  icon="fa-solid fa-shield-halved"
                  suffix="%"
                  value={form.allowedMoisture}
                  onChange={set("allowedMoisture")}
                  placeholder="20"
                  compact
                  marginBottom={8}
                />
                <FormField
                  label="Purchase Rate"
                  type="number"
                  icon="fa-solid fa-indian-rupee-sign"
                  suffix="₹ / MT"
                  value={form.rate}
                  onChange={set("rate")}
                  placeholder="1900"
                  compact
                  marginBottom={8}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
              <Button
                variant="secondary"
                type="button"
                onClick={() => navigate("/weighment")}
                style={{ padding: "8px 16px", fontSize: 12.5, display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <i className="fa-solid fa-xmark" /> Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving || noActiveMachine}
                className="btn-glow"
                style={{
                  padding: "8px 18px",
                  fontSize: 12.5,
                  fontWeight: 700,
                  display: "inline-flex",
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
                    <i className="fa-solid fa-check" /> Save Weighment Slip
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Real-time Net Weight, Moisture Meter & Live Preview Card */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          
          {/* Live Calculation Panel */}
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
              <i className="fa-solid fa-calculator" style={{ color: "var(--primary)", fontSize: 13 }} />
              <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>
                Live Net Weight & Bill Breakdown
              </h4>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: "var(--muted)", display: "flex", alignItems: "center", gap: 5 }}>
                  <i className="fa-solid fa-scale-unbalanced" style={{ fontSize: 11 }} /> Gross - Tare (Net Weight):
                </span>
                <span style={{ fontWeight: 700, color: "var(--ink)" }}>
                  {calc.netWeightMt.toFixed(3)} MT ({calc.beforeDeduction.toFixed(0)} kg)
                </span>
              </div>

              {/* Moisture Level Gauge Meter Bar */}
              <div style={{ background: "var(--canvas)", border: "1px solid var(--line)", borderRadius: 8, padding: "8px 10px", marginTop: 2 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                  <span>Moisture Level Indicator:</span>
                  <span style={{
                    color: calc.moistureStatus === "danger" ? "#dc2626" : calc.moistureStatus === "warning" ? "#d97706" : "#059669"
                  }}>
                    {form.moisture || "0"}% (Allowed: {calc.allowed}%)
                  </span>
                </div>
                <div style={{ width: "100%", height: 6, background: "#e2e8f0", borderRadius: 3, overflow: "hidden", position: "relative" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.min(100, ((parseFloat(form.moisture) || 0) / 40) * 100)}%`,
                      background: calc.moistureStatus === "danger" ? "#dc2626" : calc.moistureStatus === "warning" ? "#f59e0b" : "#10b981",
                      transition: "width 0.3s ease"
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: "var(--muted)", display: "flex", alignItems: "center", gap: 5 }}>
                  <i className="fa-solid fa-droplet" style={{ fontSize: 11 }} /> Moisture Deduction ({calc.deductionPct.toFixed(1)}%):
                </span>
                <span style={{ fontWeight: 700, color: calc.over ? "#d97706" : "var(--ink)" }}>
                  - {calc.deductionMt.toFixed(3)} MT ({calc.deductionKg.toFixed(0)} kg)
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: "var(--muted)", display: "flex", alignItems: "center", gap: 5 }}>
                  <i className="fa-solid fa-scale-balanced" style={{ fontSize: 11 }} /> Actual Payable Weight:
                </span>
                <span style={{ fontWeight: 800, color: "var(--primary-deep)" }}>
                  {calc.actualWeightMt.toFixed(3)} MT
                </span>
              </div>

              <div
                style={{
                  background: "var(--primary-tint)",
                  border: "1px solid rgba(0, 184, 107, 0.25)",
                  borderRadius: 10,
                  padding: "12px 14px",
                  marginTop: 4,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>
                  Total Payable Amount (At ₹{calc.rate}/MT)
                </span>
                <span style={{ fontSize: 24, fontWeight: 900, color: "var(--primary-deep)", marginTop: 2 }}>
                  ₹{calc.totalAmountRs.toLocaleString("en-IN")}
                </span>
              </div>

              {calc.over && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2 }}>
                  <Badge tone="warning">⚡ MOISTURE DEDUCTION APPLIED ({calc.deductionPct}%)</Badge>
                </div>
              )}

              {/* Quick Actions: Print Receipt Slip & WhatsApp */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8, paddingTop: 10, borderTop: "1px solid var(--line)" }}>
                <button
                  type="button"
                  onClick={() => setShowPrintModal(true)}
                  style={{
                    padding: "8px 10px",
                    fontSize: 11.5,
                    fontWeight: 700,
                    borderRadius: 8,
                    border: "1px solid var(--line-strong)",
                    background: "var(--canvas)",
                    color: "var(--ink)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    transition: "all 0.15s ease",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = "var(--primary)";
                    e.currentTarget.style.background = "var(--primary-tint)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = "var(--line-strong)";
                    e.currentTarget.style.background = "var(--canvas)";
                  }}
                >
                  <i className="fa-solid fa-print" style={{ color: "var(--primary)" }} /> Print Receipt Slip
                </button>

                <button
                  type="button"
                  onClick={() => setShowPrintModal(true)}
                  style={{
                    padding: "8px 10px",
                    fontSize: 11.5,
                    fontWeight: 700,
                    borderRadius: 8,
                    border: "1px solid #16a34a",
                    background: "#25D366",
                    color: "white",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    boxShadow: "0 2px 6px rgba(37, 211, 102, 0.3)",
                    transition: "all 0.15s ease",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = "#1da851";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = "#25D366";
                  }}
                >
                  <i className="fa-brands fa-whatsapp" style={{ fontSize: 13 }} /> Share WhatsApp
                </button>
              </div>
            </div>
          </div>

          {/* Mini Live Kusumganga Receipt Preview Card */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: 12,
              padding: "12px 14px",
              boxShadow: "var(--shadow-sm)",
              fontSize: 11,
              fontFamily: "'Courier New', Courier, monospace",
              color: "#0f172a"
            }}
          >
            <div style={{ fontWeight: 900, textAlign: "center", textTransform: "uppercase", fontSize: 11.5, borderBottom: "1px dashed #64748b", paddingBottom: 4, marginBottom: 6 }}>
              KUSUMGANGA AGRO SOLUTIONS
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>No: {form.slipNo || "720"}</span>
              <span>Date: {new Date().toLocaleDateString("en-IN")}</span>
            </div>
            <div>Party: {form.party || "Unspecified"}</div>
            <div>Vehicle: {form.vehicleNo || "N/A"}</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
              <span>Gross: {calc.netWeightMt > 0 ? ((parseFloat(form.gross)||0)/1000).toFixed(3) : "0"} MT</span>
              <span>Tare: {calc.netWeightMt > 0 ? ((parseFloat(form.tare)||0)/1000).toFixed(3) : "0"} MT</span>
            </div>
            <div style={{ fontWeight: 700, color: "#059669", marginTop: 2 }}>
              Net Payable: {calc.actualWeightMt.toFixed(3)} MT (₹{calc.totalAmountRs.toLocaleString("en-IN")})
            </div>
          </div>

        </div>
      </div>

      {/* Printable Receipt Modal */}
      <PrintableWeighmentSlipModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        data={{
          warehouse: selectedWarehouseObj?.name || "Gorakhpur Purchase Center",
          slipNo: form.slipNo || "720",
          commodity: form.commodity,
          partyName: form.party,
          vehicleNo: form.vehicleNo,
          grossWeightKg: form.gross,
          tareWeightKg: form.tare,
          moisturePct: form.moisture,
          allowedMoisturePct: form.allowedMoisture,
          deductionPct: calc.deductionPct,
          ratePerMt: form.rate,
          totalAmountRs: calc.totalAmountRs,
        }}
      />
    </div>
  );
}
