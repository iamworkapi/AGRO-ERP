import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import FormField from "../components/common/FormField";
import Button from "../components/common/Button";
import { useWarehouses } from "../features/warehouses/useWarehouses";
import {
  DEFAULT_WAREHOUSE_TCC,
  getWarehouseCodePrefix,
  saveNewBuyer,
} from "../features/biomass/biomassService";
import { createBuyer } from "../features/biomass/api";
import { toast } from "../utils/toast";
import { isValidPhone, sanitizePhone } from "../utils/phone";

// Indian State Codes mapping for GSTIN quick identification
const GSTIN_STATES = {
  "01": "Jammu & Kashmir",
  "02": "Himachal Pradesh",
  "03": "Punjab",
  "04": "Chandigarh",
  "05": "Uttarakhand",
  "06": "Haryana",
  "07": "Delhi",
  "08": "Rajasthan",
  "09": "Uttar Pradesh",
  "10": "Bihar",
  "19": "West Bengal",
  "23": "Madhya Pradesh",
  "24": "Gujarat",
  "27": "Maharashtra",
};

const COMMODITY_FEEDSTOCKS = [
  { id: "paddy_straw", name: "Paddy Straw Round Bales", icon: "ri-plant-line", defaultRate: 1900 },
  { id: "maize_stalk", name: "Maize Stalk Bales", icon: "ri-seedling-line", defaultRate: 1400 },
  { id: "wheat_straw", name: "Wheat Straw Bales", icon: "ri-leaf-line", defaultRate: 2400 },
  { id: "mustard_husk", name: "Mustard Husk / Tuuri", icon: "ri-contrast-drop-2-line", defaultRate: 2100 },
  { id: "rice_husk", name: "Rice Husk Bulk", icon: "ri-bubble-chart-line", defaultRate: 1750 },
  { id: "bagasse", name: "Sugarcane Bagasse & Pith", icon: "ri-stack-line", defaultRate: 1600 },
];

export default function CreateBiomassBuyer() {
  const navigate = useNavigate();
  const { warehouses } = useWarehouses();

  const initialWh = warehouses[0] || DEFAULT_WAREHOUSE_TCC;
  const initialWhCode = initialWh?.code || initialWh?.id || DEFAULT_WAREHOUSE_TCC.code;
  const initialWhPrefix = getWarehouseCodePrefix(initialWhCode, initialWh?.name || DEFAULT_WAREHOUSE_TCC.name);

  // Form State
  const [warehouseCode, setWarehouseCode] = useState(initialWhCode);
  const [warehouseName, setWarehouseName] = useState(initialWh?.name || DEFAULT_WAREHOUSE_TCC.name);

  const [name, setName] = useState("RELIANCE INDUSTRIES LIMITED");
  const [division, setDivision] = useState("BARABANKI MFG. DIVISION");
  const [plantType, setPlantType] = useState("Bio-Ethanol Plant");
  const [address, setAddress] = useState(
    "Plot No. 12-14, Industrial Growth Area, Haidargarh Road, Barabanki, Uttar Pradesh - 225001"
  );

  const [gstin, setGstin] = useState("09AAACR5055K2Z4");
  const [poNo, setPoNo] = useState(`${initialWhPrefix}-PO-2026-901`);
  const [paymentTerms, setPaymentTerms] = useState("Net 15 Days");
  const [contractTenure, setContractTenure] = useState("Annual Contract (2026-2027)");

  const [targetQtyMt, setTargetQtyMt] = useState("5000");
  const [agreedRatePerMt, setAgreedRatePerMt] = useState("1850");
  const [selectedCommodities, setSelectedCommodities] = useState([
    "Paddy Straw Round Bales",
    "Maize Stalk Bales",
  ]);
  const [maxMoisturePct, setMaxMoisturePct] = useState("20");
  const [maxAshPct, setMaxAshPct] = useState("18");

  const [contactPerson, setContactPerson] = useState("Mr. Sukhwinder Singh (Procurement Lead)");
  const [contactMobile, setContactMobile] = useState("9812345678");
  const [email, setEmail] = useState("procurement.bioethanol@reliance.com");
  const [unloadingNotes, setUnloadingNotes] = useState(
    "Hydraulic tipper ramp & 60 MT electronic weighbridge operational 24x7 at Plant Gate 2."
  );

  const [loading, setLoading] = useState(false);
  const [copiedGstin, setCopiedGstin] = useState(false);

  // Sync warehouse name and prefix if warehouses load asynchronously
  useEffect(() => {
    if (warehouses && warehouses.length > 0) {
      const match = warehouses.find((w) => w.code === warehouseCode || w.id === warehouseCode);
      if (match && match.name !== warehouseName) {
        setWarehouseName(match.name);
      }
    }
  }, [warehouses, warehouseCode, warehouseName]);

  const currentWhPrefix = useMemo(() => {
    return getWarehouseCodePrefix(warehouseCode, warehouseName);
  }, [warehouseCode, warehouseName]);

  // Handle warehouse change & synchronize PO / agreement code
  function handleWarehouseChange(val) {
    const selected = warehouses.find((w) => w.code === val || w.id === val);
    const newCode = selected?.code || selected?.id || val;
    const newName = selected?.name || warehouseName;
    const newPrefix = getWarehouseCodePrefix(newCode, newName);

    setWarehouseCode(newCode);
    setWarehouseName(newName);

    // Keep PO number linked to the new warehouse code
    const numPart = poNo.match(/(\d+)$/)?.[1] || "901";
    setPoNo(`${newPrefix}-PO-2026-${numPart}`);
  }

  function handleAutoGeneratePoNo() {
    const num = Math.floor(100 + Math.random() * 900);
    setPoNo(`${currentWhPrefix}-PO-2026-${num}`);
  }

  function toggleCommodity(commName) {
    setSelectedCommodities((prev) => {
      if (prev.includes(commName)) {
        return prev.length > 1 ? prev.filter((c) => c !== commName) : prev;
      }
      return [...prev, commName];
    });
  }

  // Live Calculations
  const targetTonnage = parseFloat(targetQtyMt) || 0;
  const unitRate = parseFloat(agreedRatePerMt) || 0;
  const totalCommitmentRs = Math.round(targetTonnage * unitRate);
  const monthlyAverageMt = targetTonnage > 0 ? Math.round(targetTonnage / 12) : 0;

  // Format Lakhs / Crores
  const formattedCommitmentWords = useMemo(() => {
    if (totalCommitmentRs >= 10000000) {
      return `₹${(totalCommitmentRs / 10000000).toFixed(2)} Cr`;
    }
    if (totalCommitmentRs >= 100000) {
      return `₹${(totalCommitmentRs / 100000).toFixed(2)} Lakhs`;
    }
    return `₹${totalCommitmentRs.toLocaleString("en-IN")}`;
  }, [totalCommitmentRs]);

  // GSTIN Details
  const gstinState = useMemo(() => {
    if (gstin && gstin.length >= 2) {
      return GSTIN_STATES[gstin.slice(0, 2)] || "State Code: " + gstin.slice(0, 2);
    }
    return "";
  }, [gstin]);

  const panFromGstin = useMemo(() => {
    if (gstin && gstin.length >= 12) {
      return gstin.slice(2, 12);
    }
    return "";
  }, [gstin]);

  function handleCopyGstin() {
    if (gstin) {
      navigator.clipboard.writeText(gstin.trim());
      setCopiedGstin(true);
      setTimeout(() => setCopiedGstin(false), 1800);
      toast.success("GSTIN copied to clipboard!");
    }
  }

  async function handleSubmit(e) {
    if (e) e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter Company / Buyer Name");
      return;
    }
    if (!address.trim()) {
      toast.error("Please enter Plant Delivery Address");
      return;
    }
    if (!gstin.trim()) {
      toast.error("Please enter GSTIN Number");
      return;
    }
    if (contactMobile && !isValidPhone(contactMobile)) {
      toast.error("Please enter a valid 10-digit Indian Mobile number.");
      return;
    }

    setLoading(true);
    try {
      const sanitizedPhone = contactMobile ? sanitizePhone(contactMobile) : "";
      const payload = {
        name: name.trim().toUpperCase(),
        division: division ? division.trim().toUpperCase() : "",
        address: address.trim(),
        gstin: gstin.trim().toUpperCase(),
        plantType,
        agreedRatePerMt: unitRate,
        targetQtyMt: targetTonnage,
        contactPerson: contactPerson.trim(),
        contactMobile: sanitizedPhone,
        email: email.trim().toLowerCase(),
        poNo: poNo.trim().toUpperCase(),
        paymentTerms,
        // Extra ERP metadata
        warehouseCode,
        warehouseName,
        contractTenure,
        acceptedCommodities: selectedCommodities,
        maxMoisturePct: parseFloat(maxMoisturePct) || 20,
        maxAshPct: parseFloat(maxAshPct) || 18,
        unloadingNotes: unloadingNotes.trim(),
      };

      // 1. Sync to local storage for instant demo/UI responsiveness
      saveNewBuyer(payload);

      // 2. Call backend API
      try {
        await createBuyer(payload);
      } catch (apiErr) {
        console.warn("Backend API notice (buyer stored locally):", apiErr);
      }

      toast.success(`Industrial Buyer "${payload.name}" registered with Hub ${currentWhPrefix}!`);
      navigate("/biomass/buyers");
    } catch (err) {
      toast.error("Failed to register industrial buyer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* PAGE HEADER */}
      <PageHeader
        title="Register Industrial Offtake Buyer"
        subtitle="Onboard bio-ethanol plants, power utilities, CBG facilities, and commercial factory consignees"
        badge="CONSIGNEE ONBOARDING"
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate("/biomass/buyers")}
            style={{ fontSize: 12, height: 32 }}
          >
            <i className="ri-arrow-left-line" style={{ marginRight: 4 }} /> Back to Offtake Buyers
          </Button>
        }
      />

      {/* MAIN TWO-COLUMN LAYOUT */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 360px",
          gap: 16,
          alignItems: "start",
        }}
        className="create-buyer-responsive-grid"
      >
        {/* LEFT COLUMN: MODULAR FORM CARDS */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* CARD 1: PLANT ENTITY & FACILITY CLASSIFICATION */}
          <Card
            title="Plant Entity &amp; Facility Classification"
            subtitle="Corporate identification, industrial plant division, and supplying dispatch hub"
            icon="ri-building-4-line"
            accent="var(--primary)"
            headerStyle={{ padding: "10px 16px" }}
            bodyStyle={{ padding: "14px 16px" }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "10px 14px" }}>
              <FormField
                label="Company / Offtake Buyer Name"
                required
                compact
                layout="vertical"
                value={name}
                onChange={setName}
                placeholder="e.g. RELIANCE INDUSTRIES LIMITED"
              />

              <FormField
                label="Division / Manufacturing Unit"
                compact
                layout="vertical"
                value={division}
                onChange={setDivision}
                placeholder="e.g. BARABANKI MFG. DIVISION"
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "10px 14px", marginTop: 10 }}>
              <FormField
                label="Plant Facility Category"
                type="select"
                compact
                layout="vertical"
                value={plantType}
                onChange={setPlantType}
                options={[
                  { value: "Bio-Ethanol Plant", label: "Bio-Ethanol Plant (Grain / 2G Lignocellulosic)" },
                  { value: "CBG Plant / Ethanol Division", label: "CBG Plant / Compressed Bio-Gas Facility" },
                  { value: "Biomass Power Plant", label: "Biomass Dedicated Power Utility" },
                  { value: "Biomass Power Plant (Co-firing)", label: "Thermal Power Station (Co-Firing Pellets)" },
                  { value: "CBG & Bio-Energy Plant", label: "CBG & Bio-Energy Plant" },
                  { value: "Pellet / Briquette Mill", label: "Industrial Pellet / Briquetting Plant" },
                  { value: "Paper & Packaging Mill", label: "Pulp, Paper & Packaging Board Mill" },
                ]}
              />

              {/* Linked Supplying Warehouse Hub */}
              <div>
                <label
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  Supplying Warehouse Hub <span style={{ color: "var(--status-error)" }}>*</span>
                </label>
                <select
                  value={warehouseCode}
                  onChange={(e) => handleWarehouseChange(e.target.value)}
                  style={{
                    width: "100%",
                    height: 34,
                    padding: "0 10px",
                    fontSize: 12.5,
                    fontWeight: 600,
                    borderRadius: 7,
                    border: "1px solid var(--line-strong)",
                    background: "var(--surface)",
                    color: "var(--ink)",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  {warehouses && warehouses.length > 0 ? (
                    warehouses.map((w) => (
                      <option key={w.id || w.code} value={w.code || w.id}>
                        {w.name} ({w.code || w.id})
                      </option>
                    ))
                  ) : (
                    <option value={DEFAULT_WAREHOUSE_TCC.code}>
                      {DEFAULT_WAREHOUSE_TCC.name} ({DEFAULT_WAREHOUSE_TCC.code})
                    </option>
                  )}
                </select>
                <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 3 }}>
                  Dispatch Hub Code: <strong style={{ color: "var(--primary)" }}>{currentWhPrefix}</strong>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 10 }}>
              <FormField
                label="Full Plant Delivery Address (as per Bill-To Consignee)"
                required
                compact
                layout="vertical"
                type="textarea"
                rows={2}
                value={address}
                onChange={setAddress}
                placeholder="Complete physical plant address including industrial area, Tehsil, District, State & Pincode..."
              />
            </div>
          </Card>

          {/* CARD 2: TAXATION, PO REFERENCE & COMMERCIAL TERMS */}
          <Card
            title="Taxation, Purchase Order &amp; Billing Terms"
            subtitle="GST regulatory details, automated PO code bound to warehouse, and credit terms"
            icon="ri-file-text-line"
            accent="#0284C7"
            headerStyle={{ padding: "10px 16px" }}
            bodyStyle={{ padding: "14px 16px" }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.2fr", gap: "10px 14px" }}>
              {/* GSTIN with quick detection */}
              <div>
                <FormField
                  label="GSTIN Number (15-digit)"
                  required
                  compact
                  layout="vertical"
                  maxLength={15}
                  value={gstin}
                  onChange={(val) => setGstin((val || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 15))}
                  placeholder="e.g. 09AAACR5055K2Z4"
                  inputStyle={{ fontFamily: "monospace", letterSpacing: "0.5px", fontWeight: 700 }}
                />
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, fontSize: 10.5 }}>
                  {gstinState && (
                    <span
                      style={{
                        background: "rgba(2, 132, 199, 0.1)",
                        color: "#0284C7",
                        padding: "1px 6px",
                        borderRadius: 4,
                        fontWeight: 700,
                      }}
                    >
                      <i className="ri-map-pin-2-line" style={{ marginRight: 2 }} /> {gstinState}
                    </span>
                  )}
                  {panFromGstin && (
                    <span style={{ color: "var(--muted)", fontWeight: 600 }}>
                      PAN: <strong style={{ color: "var(--ink)" }}>{panFromGstin}</strong>
                    </span>
                  )}
                </div>
              </div>

              {/* Purchase Order Reference (Bound to Warehouse Code) */}
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <label
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Purchase Order / Contract Ref <span style={{ color: "var(--status-error)" }}>*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoGeneratePoNo}
                    style={{
                      border: "none",
                      background: "rgba(2, 132, 199, 0.12)",
                      color: "#0284C7",
                      fontSize: 10.5,
                      fontWeight: 700,
                      padding: "1px 6px",
                      borderRadius: 5,
                      cursor: "pointer",
                    }}
                    title="Regenerate PO sequence with warehouse prefix"
                  >
                    Auto Generate
                  </button>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    borderRadius: 7,
                    border: "1px solid var(--line-strong)",
                    background: "var(--surface)",
                    overflow: "hidden",
                    height: 34,
                  }}
                >
                  <input
                    type="text"
                    value={poNo}
                    onChange={(e) => setPoNo(e.target.value.toUpperCase())}
                    placeholder="e.g. WH-BTT-01-PO-2026-901"
                    required
                    style={{
                      width: "100%",
                      height: "100%",
                      fontSize: 12.5,
                      fontWeight: 800,
                      color: "var(--ink)",
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      padding: "0 10px",
                      fontFamily: "monospace",
                      letterSpacing: "0.4px",
                    }}
                  />
                </div>
                <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 3 }}>
                  Linked to Supplying Hub: <strong style={{ color: "#0284C7" }}>{currentWhPrefix}</strong>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 14px", marginTop: 10 }}>
              <FormField
                label="Commercial Payment Terms"
                type="select"
                compact
                layout="vertical"
                value={paymentTerms}
                onChange={setPaymentTerms}
                options={[
                  { value: "Net 15 Days", label: "Net 15 Days (Factory GRN Verification)" },
                  { value: "Net 30 Days", label: "Net 30 Days (Standard Corporate Cycle)" },
                  { value: "Net 7 Days", label: "Net 7 Days (Accelerated Settlement)" },
                  { value: "Advance Payment", label: "100% Advance Payment Prior to Dispatch" },
                  { value: "On Delivery GRN", label: "Immediate Payment on Goods Receipt Note" },
                ]}
              />

              <FormField
                label="Contract Term / Season"
                type="select"
                compact
                layout="vertical"
                value={contractTenure}
                onChange={setContractTenure}
                options={[
                  { value: "Annual Contract (2026-2027)", label: "Annual Contract (2026-2027 Full Year)" },
                  { value: "Kharif Season 2026", label: "Kharif Paddy Season (Jun 2026 - Nov 2026)" },
                  { value: "Rabi Season 2026-27", label: "Rabi Harvest Season (Dec 2026 - May 2027)" },
                  { value: "Multi-Year Supply Agreement", label: "Multi-Year Long Term Sourcing PPA (3 Years)" },
                ]}
              />
            </div>
          </Card>

          {/* CARD 3: COMMERCIAL QUOTA, PRICING & ACCEPTED FEEDSTOCK */}
          <Card
            title="Commercial Quota &amp; Biomass Commodity Pricing"
            subtitle="Agreed tonnage commitments, delivery gate rates, and accepted residue types"
            icon="ri-money-rupee-circle-line"
            accent="#10B981"
            headerStyle={{ padding: "10px 16px" }}
            bodyStyle={{ padding: "14px 16px" }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.2fr 1fr 1fr", gap: "10px 14px" }}>
              <FormField
                label="Contract Target Volume"
                type="number"
                required
                compact
                layout="vertical"
                suffix="MT"
                value={targetQtyMt}
                onChange={setTargetQtyMt}
                placeholder="5000"
              />

              <FormField
                label="Commercial Gate Rate"
                type="number"
                required
                compact
                layout="vertical"
                suffix="₹ / MT"
                value={agreedRatePerMt}
                onChange={setAgreedRatePerMt}
                placeholder="1850"
              />

              <FormField
                label="Max Moisture"
                type="number"
                compact
                layout="vertical"
                suffix="%"
                value={maxMoisturePct}
                onChange={setMaxMoisturePct}
                placeholder="20"
              />

              <FormField
                label="Max Ash Content"
                type="number"
                compact
                layout="vertical"
                suffix="%"
                value={maxAshPct}
                onChange={setMaxAshPct}
                placeholder="18"
              />
            </div>

            {/* Accepted Biomass Residues Tag Selection */}
            <div style={{ marginTop: 14 }}>
              <label
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Accepted Biomass Agricultural Feedstocks (Click to Toggle)
              </label>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {COMMODITY_FEEDSTOCKS.map((crop) => {
                  const isSelected = selectedCommodities.includes(crop.name);
                  return (
                    <button
                      key={crop.id}
                      type="button"
                      onClick={() => toggleCommodity(crop.name)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 8,
                        fontSize: 11.5,
                        fontWeight: 700,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        cursor: "pointer",
                        border: isSelected
                          ? "1.5px solid #10B981"
                          : "1px solid var(--line-strong)",
                        background: isSelected
                          ? "rgba(16, 185, 129, 0.12)"
                          : "var(--surface)",
                        color: isSelected ? "#047857" : "var(--ink-secondary)",
                        transition: "all 150ms ease",
                      }}
                    >
                      <i className={isSelected ? "ri-checkbox-circle-fill" : crop.icon} style={{ color: isSelected ? "#10B981" : "var(--muted)" }} />
                      <span>{crop.name}</span>
                      <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600 }}>
                        (₹{crop.defaultRate})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* CARD 4: PLANT PERSONNEL & LOGISTICS CONTACT */}
          <Card
            title="Plant Sourcing Personnel &amp; Logistics Contact"
            subtitle="Commercial point of contact, gate weighbridge phone, and unloading guidance"
            icon="ri-contacts-line"
            accent="#8B5CF6"
            headerStyle={{ padding: "10px 16px" }}
            bodyStyle={{ padding: "14px 16px" }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1.2fr", gap: "10px 14px" }}>
              <FormField
                label="Procurement / Plant Head"
                compact
                layout="vertical"
                value={contactPerson}
                onChange={setContactPerson}
                placeholder="e.g. Mr. Sukhwinder Singh"
              />

              <FormField
                label="Direct Mobile Number"
                compact
                layout="vertical"
                isPhone
                value={contactMobile}
                onChange={setContactMobile}
                placeholder="10-digit mobile"
              />

              <FormField
                label="Official Email Address"
                compact
                layout="vertical"
                value={email}
                onChange={setEmail}
                placeholder="procurement@company.com"
              />
            </div>

            <div style={{ marginTop: 10 }}>
              <FormField
                label="Plant Gate Logistics &amp; Unloading Instructions"
                compact
                layout="vertical"
                value={unloadingNotes}
                onChange={setUnloadingNotes}
                placeholder="e.g. Weighbridge operational 24x7, hydraulic ramp tipping available, driver PPE mandatory..."
              />
            </div>
          </Card>

          {/* BOTTOM ACTION BAR */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 12,
              padding: "12px 16px",
              background: "var(--surface)",
              borderRadius: 12,
              border: "1px solid var(--line)",
            }}
          >
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => navigate("/biomass/buyers")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              icon="ri-checkbox-circle-line"
              style={{ fontWeight: 800, padding: "0 22px" }}
            >
              Save Industrial Buyer
            </Button>
          </div>
        </form>

        {/* RIGHT COLUMN: STICKY OFFTAKE SUMMARY PREVIEW CARD */}
        <div style={{ position: "sticky", top: 16, display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Card: Live Contract Summary */}
          <div
            style={{
              background: "var(--surface)",
              borderRadius: 16,
              border: "1px solid var(--line)",
              padding: "18px 16px",
              boxShadow: "var(--shadow-sm)",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {/* Header: Company & Offtake Ribbon */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "linear-gradient(135deg, rgba(27,94,58,0.15) 0%, rgba(16,185,129,0.2) 100%)",
                  border: "1px solid rgba(27,94,58,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--primary)",
                  fontSize: 22,
                  flexShrink: 0,
                }}
              >
                <i className="ri-building-4-line" />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: "#047857",
                      background: "rgba(16, 185, 129, 0.12)",
                      padding: "2px 7px",
                      borderRadius: 999,
                      letterSpacing: "0.4px",
                    }}
                  >
                    ACTIVE OFFTAKER
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: "#0284C7",
                      background: "rgba(2, 132, 199, 0.1)",
                      padding: "2px 7px",
                      borderRadius: 999,
                    }}
                  >
                    {currentWhPrefix}
                  </span>
                </div>
                <h3
                  style={{
                    margin: "4px 0 2px",
                    fontSize: 14,
                    fontWeight: 800,
                    color: "var(--ink)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={name}
                >
                  {name || "Company / Buyer Name"}
                </h3>
                <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>
                  {division || plantType}
                </div>
              </div>
            </div>

            {/* Live Financial & Volume KPI Tiles */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                background: "var(--canvas)",
                padding: "12px 10px",
                borderRadius: 12,
                border: "1px solid var(--line)",
              }}
            >
              <div>
                <span style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                  Total Commitment
                </span>
                <div style={{ fontSize: 16, fontWeight: 900, color: "#10B981", marginTop: 2 }}>
                  {formattedCommitmentWords}
                </div>
                <div style={{ fontSize: 9.5, color: "var(--muted)", marginTop: 1 }}>
                  ₹{totalCommitmentRs.toLocaleString("en-IN")}
                </div>
              </div>

              <div>
                <span style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                  Contract Quota
                </span>
                <div style={{ fontSize: 16, fontWeight: 900, color: "var(--ink)", marginTop: 2 }}>
                  {targetTonnage.toLocaleString("en-IN")} MT
                </div>
                <div style={{ fontSize: 9.5, color: "var(--muted)", marginTop: 1 }}>
                  ~{monthlyAverageMt} MT / month
                </div>
              </div>
            </div>

            {/* Quick Sourcing Agreement Details */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 11.5 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--muted)", fontWeight: 600 }}>Agreed Rate</span>
                <strong style={{ color: "#047857", fontWeight: 800 }}>
                  ₹{unitRate.toLocaleString("en-IN")} / MT
                </strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--muted)", fontWeight: 600 }}>Supplying Hub</span>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontWeight: 700,
                    color: "var(--ink)",
                    background: "rgba(0,0,0,0.04)",
                    padding: "2px 6px",
                    borderRadius: 4,
                  }}
                >
                  {currentWhPrefix}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--muted)", fontWeight: 600 }}>PO Reference</span>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontWeight: 700,
                    color: "#0284C7",
                    background: "rgba(2, 132, 199, 0.08)",
                    padding: "2px 6px",
                    borderRadius: 4,
                  }}
                >
                  {poNo}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--muted)", fontWeight: 600 }}>Payment Terms</span>
                <strong style={{ color: "var(--ink)" }}>{paymentTerms}</strong>
              </div>

              {/* GSTIN Badge with Copy */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: 6,
                  borderTop: "1px dashed var(--line)",
                }}
              >
                <div>
                  <span style={{ fontSize: 10, color: "var(--muted)", display: "block" }}>
                    GSTIN ({gstinState || "India"})
                  </span>
                  <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 11, color: "var(--ink)" }}>
                    {gstin || "—"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyGstin}
                  style={{
                    border: "none",
                    background: copiedGstin ? "#10B981" : "var(--canvas)",
                    color: copiedGstin ? "#fff" : "var(--muted)",
                    width: 26,
                    height: 26,
                    borderRadius: 6,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 150ms ease",
                  }}
                  title="Copy GSTIN"
                >
                  <i className={copiedGstin ? "ri-check-line" : "ri-file-copy-line"} style={{ fontSize: 12 }} />
                </button>
              </div>
            </div>

            {/* Selected Feedstock Tags */}
            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 10 }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--muted)",
                  textTransform: "uppercase",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Accepted Crops ({selectedCommodities.length})
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {selectedCommodities.map((item) => (
                  <span
                    key={item}
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#065F46",
                      background: "rgba(16, 185, 129, 0.1)",
                      padding: "2px 7px",
                      borderRadius: 6,
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Action in Sidebar */}
            <Button
              type="button"
              variant="primary"
              size="md"
              loading={loading}
              onClick={handleSubmit}
              icon="ri-checkbox-circle-line"
              style={{ width: "100%", marginTop: 4, fontWeight: 800 }}
            >
              Save Industrial Buyer
            </Button>

            <div style={{ fontSize: 10.5, color: "var(--muted)", textAlign: "center", lineHeight: 1.4 }}>
              <i className="ri-shield-check-line" style={{ color: "#10B981", marginRight: 4 }} />
              All outward dispatches, weighbridge bills, and gate passes will tie to this buyer and warehouse code.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
