import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import FormField from "../components/common/FormField";
import Button from "../components/common/Button";
import PrintableWeighmentSlipModal from "../components/weighment/PrintableWeighmentSlipModal";
import { useStockEntries } from "../features/stockEntries/useStockEntries";
import { useWeightMachines } from "../features/weightMachines/useWeightMachines";
import { useWarehouses } from "../features/warehouses/useWarehouses";
import { useAuth } from "../hooks/useAuth";
import { createStockEntrySchema } from "../validators/stockEntryValidators";
import { validateOrToast } from "../utils/validate";
import { toast } from "../utils/toast";
import { getStoredVendors } from "../features/biomass/biomassService";

const COMMODITY_DEFAULTS = {
  PRALLI: { allowedMoisture: "20", rate: "1900" },
  "PRALLI (Baled)": { allowedMoisture: "18", rate: "1950" },
  "PRALLI (Loose)": { allowedMoisture: "22", rate: "1850" },
  "Mustard Husk": { allowedMoisture: "15", rate: "2400" },
  "Paddy Straw": { allowedMoisture: "20", rate: "1850" },
  "Wheat Straw": { allowedMoisture: "14", rate: "2200" },
  "Cane Bagasse / Pellets": { allowedMoisture: "16", rate: "2100" },
  "Corn Stover / Biomass": { allowedMoisture: "18", rate: "1950" },
};

const STANDARD_COMMODITIES = Object.keys(COMMODITY_DEFAULTS);

function emptyForm(defaultWarehouseId = "") {
  return {
    slipNo: "RST-18001",
    warehouseId: defaultWarehouseId,
    weightMachineId: "",
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

const DASHED_INPUT_STYLE = {
  width: "100%",
  fontSize: 13.5,
  fontWeight: 400,
  color: "var(--ink)",
  background: "transparent",
  border: "none",
  borderBottom: "1.5px dashed var(--line-strong)",
  borderRadius: 0,
  outline: "none",
  padding: "7px 0",
  transition: "all 180ms ease",
  fontFamily: "inherit",
};

export default function CreateWeighmentSlip() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isScopedRole = user?.roleKey === "supervisor" || user?.roleKey === "warehouse_admin";

  const { warehouses } = useWarehouses();
  const myWarehouse = isScopedRole ? warehouses[0] : null;

  const [form, setForm] = useState(() => emptyForm());
  const [saving, setSaving] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Commodity Multiple-Select Checklist State
  const [selectedCommodities, setSelectedCommodities] = useState(["PRALLI"]);
  const [customCommodityInput, setCustomCommodityInput] = useState("");
  const [isCommodityDropdownOpen, setIsCommodityDropdownOpen] = useState(false);
  const commodityDropdownRef = useRef(null);

  const registeredVendors = useMemo(() => {
    try {
      return getStoredVendors() || [];
    } catch {
      return [];
    }
  }, []);

  // Close commodity checklist on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (commodityDropdownRef.current && !commodityDropdownRef.current.contains(event.target)) {
        setIsCommodityDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleCommodity = (item) => {
    let next;
    if (selectedCommodities.includes(item)) {
      next = selectedCommodities.filter((c) => c !== item);
    } else {
      next = [...selectedCommodities, item];
    }
    setSelectedCommodities(next);
    const commStr = next.join(", ");
    setForm((f) => {
      const updated = { ...f, commodity: commStr };
      if (next.length > 0 && COMMODITY_DEFAULTS[next[0]]) {
        updated.allowedMoisture = COMMODITY_DEFAULTS[next[0]].allowedMoisture;
        updated.rate = COMMODITY_DEFAULTS[next[0]].rate;
      }
      return updated;
    });
  };

  const removeCommodity = (item) => {
    const next = selectedCommodities.filter((c) => c !== item);
    setSelectedCommodities(next);
    const commStr = next.join(", ");
    setForm((f) => {
      const updated = { ...f, commodity: commStr };
      if (next.length > 0 && COMMODITY_DEFAULTS[next[0]]) {
        updated.allowedMoisture = COMMODITY_DEFAULTS[next[0]].allowedMoisture;
        updated.rate = COMMODITY_DEFAULTS[next[0]].rate;
      }
      return updated;
    });
  };

  const handleAddCustomCommodity = (e) => {
    if (e) e.preventDefault();
    const trimmed = customCommodityInput.trim();
    if (!trimmed) return;
    if (!selectedCommodities.includes(trimmed)) {
      const next = [...selectedCommodities, trimmed];
      setSelectedCommodities(next);
      setForm((f) => ({ ...f, commodity: next.join(", ") }));
    }
    setCustomCommodityInput("");
  };

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

  const { entries, addEntry } = useStockEntries();

  // Automatic order list sequence calculation
  const nextSeqSlipNo = useMemo(() => {
    if (!entries || entries.length === 0) return "RST-18001";
    let maxNum = 18000;
    entries.forEach((e) => {
      const match = String(e.slipNo || "").match(/(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    });
    return `RST-${maxNum + 1}`;
  }, [entries]);

  // Automatically update to next sequential order slip number
  useEffect(() => {
    if (nextSeqSlipNo) {
      setForm((f) => {
        if (!f.slipNo || f.slipNo === "RST-18001" || f.slipNo.startsWith("RST-")) {
          return { ...f, slipNo: nextSeqSlipNo };
        }
        return f;
      });
    }
  }, [nextSeqSlipNo]);

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
    setForm((f) => ({ ...f, slipNo: nextSeqSlipNo }));
    toast.info(`Auto-assigned next ordered Slip No: ${nextSeqSlipNo}`);
  }

  const handleDashedFocus = (e) => {
    e.target.style.borderBottom = "1.5px dashed var(--primary)";
    e.target.style.boxShadow = "0 3px 8px rgba(0, 184, 107, 0.12)";
  };

  const handleDashedBlur = (e) => {
    e.target.style.borderBottom = "1.5px dashed var(--line-strong)";
    e.target.style.boxShadow = "none";
  };

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
      toast.success(`Weighment slip #${form.slipNo} saved successfully.`);
      navigate("/weighment");
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || err.message || "Could not save this weighment slip.");
    } finally {
      setSaving(false);
    }
  }

  const selectedWarehouseObj = warehouses.find((w) => w.id === form.warehouseId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%", maxWidth: "100%" }}>
      {/* Top Back Navigation Bar */}
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
          <i className="ri-arrow-left-line" /> Back to Weighment Slips & Register
        </button>

        <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>
          Order Sequence: <strong style={{ color: "var(--primary-deep)" }}>{form.slipNo}</strong>
        </span>
      </div>

      <PageHeader
        title="Create Weighment Slip"
        subtitle="Full-width weighbridge station with automatic order list sequencing, live moisture cut evaluation, and dashed input design"
        badge="WEIGHMENT SLIP"
      />

      {noActiveMachine && (
        <div style={{ background: "#fef3c7", border: "1px solid rgba(217, 119, 6, 0.25)", borderRadius: 12, padding: "12px 16px", display: "flex", gap: 12, alignItems: "flex-start" }}>
          <i className="ri-alert-line" style={{ color: "#D97706", fontSize: 18, marginTop: 1 }} />
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#92400e" }}>No active weighbridge / scale found for this hub</p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#92400e" }}>
              Please register or activate a weight machine for this warehouse to record gross and tare weights.{" "}
              <a href="/weighment/machines" onClick={(e) => { e.preventDefault(); navigate("/weighment/machines"); }} style={{ color: "#92400e", fontWeight: 700, textDecoration: "underline" }}>
                + Add / Manage Weight Machines &rarr;
              </a>
            </p>
          </div>
        </div>
      )}

      {/* Main Full-Width Form */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        
        {/* Step 1: Slip No (Position #1) & Arrival Details (Full Width Card) */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 14,
            padding: "18px 22px",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, paddingBottom: 8, borderBottom: "1px solid var(--line)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "var(--primary-tint)",
                  color: "var(--primary-deep)",
                  fontSize: 12,
                  fontWeight: 800,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                1
              </span>
              <h3 style={{ fontSize: 13.5, fontWeight: 800, color: "var(--ink)", margin: 0 }}>
                Slip Sequence & Vehicle Arrival Details
              </h3>
            </div>
            <span style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600 }}>Step 1: Automatic Order Sequence</span>
          </div>

          {/* Row 1: Slip No is in POSITION #1, followed by Facility & Meta (4 Columns) */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px 18px", marginBottom: 16 }}>
            
            {/* POSITION #1: R.S.T / Slip Number (Automatic Order List Way) */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <label style={{ fontSize: 12, fontWeight: 800, color: "var(--primary-deep)", display: "flex", alignItems: "center", gap: 4 }}>
                  <i className="ri-hashtag" style={{ color: "var(--primary)" }} /> R.S.T / Slip Number <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <button
                  type="button"
                  onClick={handleAutoGenerateSlipNo}
                  style={{
                    border: "none",
                    background: "var(--primary-tint)",
                    color: "var(--primary-deep)",
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 6,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                  title="Auto-fetch next order list sequence number"
                >
                  <i className="ri-magic-line" /> Auto Order
                </button>
              </div>
              <input
                type="text"
                value={form.slipNo}
                onChange={(e) => set("slipNo")(e.target.value)}
                placeholder="e.g. RST-18001"
                required
                style={{
                  ...DASHED_INPUT_STYLE,
                  fontSize: 14,
                  color: "var(--primary-deep)",
                }}
                onFocus={handleDashedFocus}
                onBlur={handleDashedBlur}
              />
              <span style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 4, display: "block" }}>
                Auto-assigned next ordered slip in register
              </span>
            </div>

            {/* Position #2: Procurement Centre */}
            <FormField
              label="Procurement Centre"
              type="select"
              required
              disabled={isScopedRole}
              value={form.warehouseId}
              onChange={set("warehouseId")}
              options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
              layout="vertical"
              marginBottom={0}
              inputStyle={{ borderBottom: "1.5px dashed var(--line-strong)", borderRadius: 0, background: "transparent" }}
            />

            {/* Position #3: Weight Machine / Scale */}
            <FormField
              label="Weight Machine / Scale"
              type="select"
              required
              value={form.weightMachineId}
              onChange={set("weightMachineId")}
              options={activeMachines.map((m) => ({ value: m.id, label: `${m.machineCode} (Active Scale)` }))}
              placeholder={form.warehouseId ? "Select weight machine" : "Select a centre first"}
              layout="vertical"
              marginBottom={0}
              inputStyle={{ borderBottom: "1.5px dashed var(--line-strong)", borderRadius: 0, background: "transparent" }}
            />

            {/* Position #4: Entry Type */}
            <FormField
              label="Entry Type"
              type="select"
              required
              value={form.entryType}
              onChange={set("entryType")}
              options={[
                { value: "inward", label: "Inward [Procurement from vendor]" },
                { value: "outward", label: "Outward (Factory Dispatch)" },
              ]}
              layout="vertical"
              marginBottom={0}
              inputStyle={{ borderBottom: "1.5px dashed var(--line-strong)", borderRadius: 0, background: "transparent" }}
            />
          </div>

          {/* Row 2: Vendor / Supplier Name, Vehicle No & Commodity Checklist */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: "14px 18px" }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>
                Vendor / Supplier Name
              </label>
              <input
                type="text"
                list="vendor-party-suggestions"
                value={form.party}
                onChange={(e) => set("party")(e.target.value)}
                placeholder="e.g. Ramesh Singh / Kusumganga Supplier"
                style={DASHED_INPUT_STYLE}
                onFocus={handleDashedFocus}
                onBlur={handleDashedBlur}
              />
              <datalist id="vendor-party-suggestions">
                {registeredVendors.map((v) => (
                  <option key={v.id || v.vendorCode || v.companyName} value={v.companyName}>
                    {v.vendorCode ? `[${v.vendorCode}] ` : ""}{v.companyName}
                  </option>
                ))}
              </datalist>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>
                Vehicle Registration No.
              </label>
              <input
                type="text"
                value={form.vehicleNo}
                onChange={(e) => set("vehicleNo")(e.target.value.toUpperCase())}
                placeholder="e.g. UP 27 AF 2860"
                style={{
                  ...DASHED_INPUT_STYLE,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
                onFocus={handleDashedFocus}
                onBlur={handleDashedBlur}
              />
            </div>

            {/* Position #7: Commodity / Crop Name (Multi-Select Checklist) */}
            <div ref={commodityDropdownRef} style={{ position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)", display: "flex", alignItems: "center", gap: 4 }}>
                  <span>Commodity / Crop Name</span>
                  <span style={{ color: "#dc2626" }}>*</span>
                </label>
                {selectedCommodities.length > 0 && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: "var(--primary-deep)",
                      background: "var(--primary-tint)",
                      padding: "1px 6px",
                      borderRadius: 10,
                    }}
                  >
                    {selectedCommodities.length} Selected
                  </span>
                )}
              </div>

              {/* Trigger Input Area with Dashed Underline */}
              <div
                onClick={() => setIsCommodityDropdownOpen((prev) => !prev)}
                style={{
                  ...DASHED_INPUT_STYLE,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  minHeight: 34,
                  padding: "5px 0",
                  gap: 6,
                }}
                title="Click to open commodity checklist"
              >
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center", flex: 1, minWidth: 0 }}>
                  {selectedCommodities.length === 0 ? (
                    <span style={{ color: "#94A3B8" }}>Select commodity / crop (Checklist)</span>
                  ) : (
                    selectedCommodities.map((item) => (
                      <span
                        key={item}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 3,
                          background: "var(--primary-tint)",
                          color: "var(--primary-deep)",
                          border: "1px solid rgba(93, 214, 44, 0.3)",
                          borderRadius: 6,
                          padding: "1px 6px",
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCommodity(item);
                        }}
                        title="Click to remove"
                      >
                        {item}
                        <i className="ri-close-line" style={{ fontSize: 12 }} />
                      </span>
                    ))
                  )}
                </div>
                <i
                  className={isCommodityDropdownOpen ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"}
                  style={{ color: "var(--muted)", fontSize: 16, flexShrink: 0 }}
                />
              </div>

              {/* Interactive Checklist Dropdown Panel */}
              {isCommodityDropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    minWidth: 270,
                    zIndex: 60,
                    marginTop: 6,
                    background: "var(--surface)",
                    border: "1px solid var(--line-strong)",
                    borderRadius: 12,
                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.14)",
                    padding: 10,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 6, borderBottom: "1px solid var(--line)" }}>
                    <span style={{ fontSize: 10.5, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Commodity Checklist
                    </span>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCommodities(STANDARD_COMMODITIES);
                          setForm((f) => ({ ...f, commodity: STANDARD_COMMODITIES.join(", ") }));
                        }}
                        style={{
                          border: "none",
                          background: "transparent",
                          color: "var(--primary-deep)",
                          fontSize: 10.5,
                          fontWeight: 700,
                          cursor: "pointer",
                          padding: 0,
                        }}
                      >
                        Select All
                      </button>
                      <span style={{ color: "var(--line)" }}>•</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCommodities([]);
                          setForm((f) => ({ ...f, commodity: "" }));
                        }}
                        style={{
                          border: "none",
                          background: "transparent",
                          color: "var(--muted)",
                          fontSize: 10.5,
                          fontWeight: 700,
                          cursor: "pointer",
                          padding: 0,
                        }}
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Checklist Options */}
                  <div style={{ maxHeight: 190, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
                    {STANDARD_COMMODITIES.map((c) => {
                      const checked = selectedCommodities.includes(c);
                      return (
                        <label
                          key={c}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "5px 8px",
                            borderRadius: 6,
                            cursor: "pointer",
                            background: checked ? "var(--primary-tint)" : "transparent",
                            transition: "background 150ms ease",
                          }}
                          onMouseOver={(e) => {
                            if (!checked) e.currentTarget.style.background = "var(--surface-hover)";
                          }}
                          onMouseOut={(e) => {
                            if (!checked) e.currentTarget.style.background = "transparent";
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleCommodity(c)}
                            style={{
                              accentColor: "var(--primary)",
                              cursor: "pointer",
                              width: 15,
                              height: 15,
                            }}
                          />
                          <span style={{ fontSize: 12, fontWeight: checked ? 700 : 500, color: checked ? "var(--primary-deep)" : "var(--ink)", flex: 1 }}>
                            {c}
                          </span>
                          {COMMODITY_DEFAULTS[c] && (
                            <span style={{ fontSize: 9.5, color: "var(--muted)" }}>
                              {COMMODITY_DEFAULTS[c].allowedMoisture}% moist
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>

                  {/* Add Custom Crop Residue / Commodity */}
                  <div style={{ display: "flex", gap: 6, paddingTop: 6, borderTop: "1px solid var(--line)" }}>
                    <input
                      type="text"
                      placeholder="+ Other crop/residue"
                      value={customCommodityInput}
                      onChange={(e) => setCustomCommodityInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCustomCommodity(e);
                        }
                      }}
                      style={{
                        flex: 1,
                        height: 28,
                        fontSize: 11.5,
                        padding: "0 8px",
                        border: "1px solid var(--line-strong)",
                        borderRadius: 6,
                        background: "var(--surface)",
                        color: "var(--ink)",
                        outline: "none",
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomCommodity}
                      style={{
                        height: 28,
                        padding: "0 10px",
                        borderRadius: 6,
                        border: "none",
                        background: "var(--primary)",
                        color: "#fff",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 2: Scale Measurements & Quality Assessment (Full Width Card with Dashed Inputs) */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 14,
            padding: "18px 22px",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, paddingBottom: 8, borderBottom: "1px solid var(--line)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "var(--primary-tint)",
                  color: "var(--primary-deep)",
                  fontSize: 12,
                  fontWeight: 800,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                2
              </span>
              <h3 style={{ fontSize: 13.5, fontWeight: 800, color: "var(--ink)", margin: 0 }}>
                Scale Measurements & Quality Assessment
              </h3>
            </div>
            <span style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600 }}>Step 2: Live Weighbridge Inputs</span>
          </div>

          {/* 3 Main Measurement Input Blocks (Dashed Bottom Border) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px 20px", marginBottom: 16 }}>
            {/* Gross Weight */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: "var(--ink)" }}>
                  Gross Weight (Loaded) <span style={{ color: "#ef4444" }}>*</span>
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--primary-deep)", background: "var(--primary-tint)", padding: "1px 6px", borderRadius: 4 }}>
                  {form.gross ? `${((parseFloat(form.gross) || 0) / 1000).toFixed(3)} MT` : "0.000 MT"}
                </span>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={form.gross}
                  onChange={(e) => set("gross")(e.target.value)}
                  placeholder="0"
                  style={{
                    ...DASHED_INPUT_STYLE,
                    fontSize: 15,
                    paddingRight: 32,
                  }}
                  onFocus={handleDashedFocus}
                  onBlur={handleDashedBlur}
                />
                <span style={{ position: "absolute", right: 0, bottom: 8, fontSize: 11.5, fontWeight: 800, color: "var(--muted)" }}>
                  KG
                </span>
              </div>
              <span style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 4, display: "block" }}>
                Total truck weight with loaded PRALLI
              </span>
            </div>

            {/* Tare Weight */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: "var(--ink)" }}>
                  Tare Weight (Empty Truck) <span style={{ color: "#ef4444" }}>*</span>
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--primary-deep)", background: "var(--primary-tint)", padding: "1px 6px", borderRadius: 4 }}>
                  {form.tare ? `${((parseFloat(form.tare) || 0) / 1000).toFixed(3)} MT` : "0.000 MT"}
                </span>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={form.tare}
                  onChange={(e) => set("tare")(e.target.value)}
                  placeholder="0"
                  style={{
                    ...DASHED_INPUT_STYLE,
                    fontSize: 15,
                    paddingRight: 32,
                  }}
                  onFocus={handleDashedFocus}
                  onBlur={handleDashedBlur}
                />
                <span style={{ position: "absolute", right: 0, bottom: 8, fontSize: 11.5, fontWeight: 800, color: "var(--muted)" }}>
                  KG
                </span>
              </div>
              <span style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 4, display: "block" }}>
                Empty truck weight after unloading
              </span>
            </div>

            {/* 3. Allowed Moisture Baseline (%) */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: "var(--ink)" }}>
                  Allowed Moisture Baseline (%)
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--primary-deep)", background: "var(--primary-tint)", padding: "1px 6px", borderRadius: 4 }}>
                  Baseline: {form.allowedMoisture || 20}%
                </span>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  inputMode="decimal"
                  value={form.allowedMoisture}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/,/g, ".");
                    if (raw === "" || /^[0-9]*\.?[0-9]*$/.test(raw)) {
                      set("allowedMoisture")(raw);
                    }
                  }}
                  placeholder="20.0"
                  style={{
                    ...DASHED_INPUT_STYLE,
                    fontSize: 15,
                    paddingRight: 28,
                  }}
                  onFocus={handleDashedFocus}
                  onBlur={handleDashedBlur}
                />
                <span style={{ position: "absolute", right: 0, bottom: 8, fontSize: 13, fontWeight: 800, color: "var(--muted)" }}>
                  %
                </span>
              </div>
              <span style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 4, display: "block" }}>
                Moisture up to this % is accepted with zero weight penalty
              </span>
            </div>
          </div>

          {/* Recorded Moisture Level & Purchase Rate (2 Columns with Dashed Border-Bottom) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px", borderTop: "1px solid var(--line)", paddingTop: 14 }}>
            {/* Recorded Moisture Level */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: "var(--ink)" }}>
                  Recorded Moisture Level (%)
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    padding: "1px 6px",
                    borderRadius: 4,
                    color: calc.moistureStatus === "danger" ? "#dc2626" : calc.moistureStatus === "warning" ? "#d97706" : "#059669",
                    background: calc.moistureStatus === "danger" ? "#fee2e2" : calc.moistureStatus === "warning" ? "#ffedd5" : "var(--primary-tint)",
                  }}
                >
                  {calc.excessPct > 0 ? `${calc.excessPct}% Cut Applied` : "Within Safe Limit"}
                </span>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  inputMode="decimal"
                  value={form.moisture}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/,/g, ".");
                    if (raw === "" || /^[0-9]*\.?[0-9]*$/.test(raw)) {
                      set("moisture")(raw);
                    }
                  }}
                  placeholder="20.0"
                  style={{
                    ...DASHED_INPUT_STYLE,
                    fontSize: 15,
                    paddingRight: 28,
                  }}
                  onFocus={handleDashedFocus}
                  onBlur={handleDashedBlur}
                />
                <span style={{ position: "absolute", right: 0, bottom: 8, fontSize: 13, fontWeight: 800, color: "var(--muted)" }}>
                  %
                </span>
              </div>
              <span style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 4, display: "block" }}>
                Lab / probe moisture reading (baseline is {calc.allowed}%)
              </span>
            </div>

            {/* Purchase Rate */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: "var(--ink)" }}>
                  Purchase Rate (₹ / MT)
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--primary-deep)", background: "var(--primary-tint)", padding: "1px 6px", borderRadius: 4 }}>
                  ₹{form.rate ? Number(form.rate).toLocaleString() : "0"} / MT
                </span>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type="number"
                  value={form.rate}
                  onChange={(e) => set("rate")(e.target.value)}
                  placeholder="1900"
                  style={{
                    ...DASHED_INPUT_STYLE,
                    fontSize: 15,
                    paddingLeft: 22,
                  }}
                  onFocus={handleDashedFocus}
                  onBlur={handleDashedBlur}
                />
                <span style={{ position: "absolute", left: 0, bottom: 8, fontSize: 14, fontWeight: 800, color: "var(--muted)" }}>
                  ₹
                </span>
              </div>
              <span style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 4, display: "block" }}>
                Per Metric Ton agreed procurement rate
              </span>
            </div>
          </div>
        </div>

        {/* Step 3: Live Automatic Calculation & Quality Breakdown (Full Width Visual Board) */}
        <div
          style={{
            background: "var(--surface)",
            border: "1.5px solid var(--primary-tint)",
            borderRadius: 14,
            padding: "20px 22px",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <i className="ri-calculator-line" style={{ color: "var(--primary)", fontSize: 16 }} />
              <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)", margin: 0 }}>
                Live Automatic Calculation & Bill Breakdown
              </h3>
            </div>
            {calc.over ? (
              <span style={{ fontSize: 11.5, fontWeight: 800, color: "#b45309", background: "#fef3c7", border: "1px solid #fde68a", padding: "3px 10px", borderRadius: 20 }}>
                ⚠️ Moisture Cut Applied ({calc.deductionPct}%)
              </span>
            ) : (
              <span style={{ fontSize: 11.5, fontWeight: 800, color: "#15803d", background: "#dcfce7", border: "1px solid #bbf7d0", padding: "3px 10px", borderRadius: 20 }}>
                ✓ Zero Quality Deduction
              </span>
            )}
          </div>

          {/* 4-Card Horizontal Metric Board */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 14, marginBottom: 14 }}>
            {/* Metric 1: Net Weight */}
            <div style={{ background: "var(--surface-hover)", border: "1px solid var(--line)", borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.3px" }}>
                1. Raw Net Weight
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "var(--ink)", marginTop: 4 }}>
                {calc.netWeightMt.toFixed(3)} <span style={{ fontSize: 13, fontWeight: 600 }}>MT</span>
              </div>
              <div style={{ fontSize: 11.5, color: "var(--ink-secondary)", fontWeight: 600, marginTop: 2 }}>
                {calc.beforeDeduction.toLocaleString("en-IN")} kg (Gross − Tare)
              </div>
            </div>

            {/* Metric 2: Moisture Assessment */}
            <div style={{ background: "var(--surface-hover)", border: "1px solid var(--line)", borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.3px" }}>
                2. Moisture Assessment
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: calc.over ? "#d97706" : "var(--ink)", marginTop: 4 }}>
                {form.moisture || 0}% <span style={{ fontSize: 13, fontWeight: 600 }}>(Base: {calc.allowed}%)</span>
              </div>
              <div style={{ fontSize: 11.5, color: calc.over ? "#b45309" : "var(--muted)", fontWeight: 600, marginTop: 2 }}>
                {calc.over ? `- ${calc.deductionMt.toFixed(3)} MT (${calc.deductionKg.toFixed(0)} kg cut)` : "No moisture cut penalty"}
              </div>
            </div>

            {/* Metric 3: Actual Payable Weight */}
            <div style={{ background: "var(--surface-hover)", border: "1px solid var(--line)", borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.3px" }}>
                3. Final Payable Weight
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "var(--primary-deep)", marginTop: 4 }}>
                {calc.actualWeightMt.toFixed(3)} <span style={{ fontSize: 13, fontWeight: 600 }}>MT</span>
              </div>
              <div style={{ fontSize: 11.5, color: "var(--ink-secondary)", fontWeight: 600, marginTop: 2 }}>
                {calc.actualWeightKg.toLocaleString("en-IN")} kg payable
              </div>
            </div>

            {/* Metric 4: Total Payable Bill */}
            <div
              style={{
                background: "linear-gradient(135deg, #15803d 0%, #166534 100%)",
                borderRadius: 10,
                padding: "14px 18px",
                color: "#ffffff",
                boxShadow: "0 4px 14px rgba(22, 101, 52, 0.25)",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "rgba(255,255,255,0.85)" }}>
                4. Total Amount Payable
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, marginTop: 4 }}>
                ₹{calc.totalAmountRs.toLocaleString("en-IN")}
              </div>
              <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.9)", fontWeight: 600, marginTop: 2 }}>
                Agreed Rate: ₹{calc.rate.toLocaleString("en-IN")} / MT
              </div>
            </div>
          </div>

          {/* Transparent Calculation Flow Strip */}
          <div
            style={{
              background: "var(--canvas)",
              border: "1px solid var(--line)",
              borderRadius: 8,
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 10,
              fontSize: 12,
              color: "var(--ink)",
            }}
          >
            <span style={{ fontWeight: 600, color: "var(--muted)" }}>Live Calculation Formula:</span>
            <span style={{ fontWeight: 700 }}>
              Raw Net: <strong style={{ color: "var(--primary-deep)" }}>{calc.netWeightMt.toFixed(3)} MT</strong>
              {" "}− Moisture Cut: <strong style={{ color: calc.over ? "#b45309" : "var(--muted)" }}>{calc.deductionMt.toFixed(3)} MT</strong>
              {" "}= Payable Wt: <strong style={{ color: "var(--primary-deep)" }}>{calc.actualWeightMt.toFixed(3)} MT</strong>
              {" "}× Rate: <strong>₹{calc.rate}/MT</strong>
              {" "}➔ Total: <strong style={{ color: "#15803d", fontSize: 13 }}>₹{calc.totalAmountRs.toLocaleString("en-IN")}</strong>
            </span>
          </div>
        </div>

        {/* Action Controls Toolbar (Full Width) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 14,
            padding: "14px 20px",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          {/* Left: Instant Print & WhatsApp */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setShowPrintModal(true)}
              style={{
                padding: "8px 14px",
                fontSize: 12,
                fontWeight: 700,
                borderRadius: 8,
                border: "1px solid var(--line-strong)",
                background: "var(--surface)",
                color: "var(--ink)",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <i className="ri-printer-line" style={{ color: "var(--primary)" }} /> Preview & Print Receipt Slip
            </button>

            <button
              type="button"
              onClick={() => setShowPrintModal(true)}
              style={{
                padding: "8px 14px",
                fontSize: 12,
                fontWeight: 700,
                borderRadius: 8,
                border: "1px solid #16a34a",
                background: "#25D366",
                color: "#ffffff",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <i className="fa-brands fa-whatsapp" /> Share on WhatsApp
            </button>
          </div>

          {/* Right: Cancel & Submit */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Button
              variant="secondary"
              type="button"
              onClick={() => navigate("/weighment")}
              style={{ padding: "8px 18px", fontSize: 13 }}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={saving || noActiveMachine}
              style={{
                padding: "8px 24px",
                fontSize: 13,
                fontWeight: 800,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "var(--gradient-primary)",
                boxShadow: "0 4px 12px rgba(0, 184, 107, 0.3)",
              }}
            >
              {saving ? (
                <>
                  <i className="ri-loader-4-line spin" /> Saving Weighment Slip...
                </>
              ) : (
                <>
                  <i className="ri-check-line" /> Save Weighment Slip
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Printable Receipt Modal */}
      <PrintableWeighmentSlipModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        data={{
          warehouse: selectedWarehouseObj?.name || "Gorakhpur Purchase Center",
          slipNo: form.slipNo || "RST-18001",
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
