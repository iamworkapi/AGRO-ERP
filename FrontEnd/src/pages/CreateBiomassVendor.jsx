import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import FormField from "../components/common/FormField";
import { saveNewVendor, getStoredVendors, getStoredBuyers } from "../features/biomass/biomassService";
import { toast } from "../utils/toast";

function generateNextPoNo() {
  try {
    const vendors = getStoredVendors() || [];
    const buyers = getStoredBuyers ? getStoredBuyers() : [];
    const all = [...vendors, ...buyers];
    const currentYear = new Date().getFullYear();
    let maxNum = 1000;

    all.forEach((v) => {
      const match = String(v.poNo || "").match(/PO-(?:202\d-)?(\d+)/i) || String(v.poNo || "").match(/(\d{4,})/);
      if (match) {
        const n = parseInt(match[1], 10);
        if (!isNaN(n) && n >= 1000 && n < 99000 && n > maxNum) {
          maxNum = n;
        }
      }
    });

    return `PO-${currentYear}-${maxNum + 1}`;
  } catch {
    return `PO-${new Date().getFullYear()}-1001`;
  }
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
  padding: "8px 0",
  transition: "all 180ms ease",
  fontFamily: "inherit",
};

export default function CreateBiomassVendor() {
  const navigate = useNavigate();

  // Basic & Legal Info
  const [companyName, setCompanyName] = useState("");
  const [gstin, setGstin] = useState("");
  const [panNo, setPanNo] = useState("");
  const [representative, setRepresentative] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [sourcingArea, setSourcingArea] = useState("");
  const [commodity, setCommodity] = useState("Biomass / Mustard Husk / PRALLI");

  // Commercial Agreement & Purchase Order Term Sheet (Sequential Order)
  const [poNo, setPoNo] = useState(() => generateNextPoNo());
  const [poDate, setPoDate] = useState(new Date().toISOString().slice(0, 10));
  const [tenurePreset, setTenurePreset] = useState("kharif");
  const [tenureStartDate, setTenureStartDate] = useState("2026-06-01");
  const [tenureEndDate, setTenureEndDate] = useState("2026-10-31");
  const [contractedQtyMt, setContractedQtyMt] = useState("1000");
  const [agreedPricePerMt, setAgreedPricePerMt] = useState("1400");

  const tenure = useMemo(() => {
    if (!tenureStartDate && !tenureEndDate) return "01.06.2026 to 31.10.2026";
    const fmt = (dStr) => {
      if (!dStr) return "";
      const [y, m, d] = dStr.split("-");
      return `${d}.${m}.${y}`;
    };
    return `${fmt(tenureStartDate)} to ${fmt(tenureEndDate)}`;
  }, [tenureStartDate, tenureEndDate]);

  const handleTenurePresetChange = (e) => {
    const val = e.target.value;
    setTenurePreset(val);
    const now = new Date();
    const curYear = now.getFullYear();

    if (val === "kharif") {
      setTenureStartDate(`${curYear}-06-01`);
      setTenureEndDate(`${curYear}-10-31`);
    } else if (val === "rabi") {
      setTenureStartDate(`${curYear}-11-01`);
      setTenureEndDate(`${curYear + 1}-03-31`);
    } else if (val === "annual") {
      setTenureStartDate(`${curYear}-04-01`);
      setTenureEndDate(`${curYear + 1}-03-31`);
    } else if (val === "half_year") {
      const start = new Date();
      const end = new Date();
      end.setMonth(end.getMonth() + 6);
      setTenureStartDate(start.toISOString().slice(0, 10));
      setTenureEndDate(end.toISOString().slice(0, 10));
    } else if (val === "quarter") {
      const start = new Date();
      const end = new Date();
      end.setMonth(end.getMonth() + 3);
      setTenureStartDate(start.toISOString().slice(0, 10));
      setTenureEndDate(end.toISOString().slice(0, 10));
    }
  };

  // Bank Info
  const [bankName, setBankName] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [ifscCode, setIfscCode] = useState("");

  const [loading, setLoading] = useState(false);

  // Live contract value calculation
  const totalContractValue = useMemo(() => {
    const qty = parseFloat(contractedQtyMt) || 0;
    const rate = parseFloat(agreedPricePerMt) || 0;
    return qty * rate;
  }, [contractedQtyMt, agreedPricePerMt]);

  const handleDashedFocus = (e) => {
    e.target.style.borderBottom = "1.5px dashed var(--primary)";
    e.target.style.boxShadow = "0 3px 8px rgba(0, 184, 107, 0.12)";
  };

  const handleDashedBlur = (e) => {
    e.target.style.borderBottom = "1.5px dashed var(--line-strong)";
    e.target.style.boxShadow = "none";
  };

  const handleGstinChange = (e) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 15);
    setGstin(val);
    // Standard Indian GSTIN: Characters 3 to 12 is the 10-digit PAN
    if (val.length === 15 && (!panNo || panNo.length < 10)) {
      const extractedPan = val.substring(2, 12);
      setPanNo(extractedPan);
      toast.info(`Auto-detected PAN from GSTIN: ${extractedPan}`);
    }
  };

  const handlePanChange = (e) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
    setPanNo(val);
  };

  function handleSubmit(e) {
    e.preventDefault();
    if (!companyName.trim()) {
      toast.error("Please enter Vendor Entity Name.");
      return;
    }
    if (!contactNo.trim()) {
      toast.error("Please enter Primary Contact Mobile Number.");
      return;
    }
    if (gstin.trim() && gstin.trim().length !== 15) {
      toast.error("GSTIN must be exactly 15 alphanumeric characters (e.g. 27AAHCM1258Q1ZW).");
      return;
    }
    if (panNo.trim() && panNo.trim().length !== 10) {
      toast.error("PAN must be exactly 10 alphanumeric characters (e.g. AAHCM1258Q).");
      return;
    }

    setLoading(true);
    try {
      const newVendor = {
        companyName: companyName.trim().toUpperCase(),
        gstin: gstin.trim().toUpperCase() || "09AAAAA0000A1Z5",
        panNo: panNo.trim().toUpperCase() || "AAAAA0000A",
        representative: representative.trim(),
        contactNo: contactNo.trim(),
        email: email.trim().toLowerCase(),
        address: address.trim(),
        sourcingArea: sourcingArea.trim() || "Local Village Procurement Network",
        commodity,
        poNo,
        poDate,
        tenure,
        contractedQtyMt: parseFloat(contractedQtyMt) || 1000,
        agreedPricePerMt: parseFloat(agreedPricePerMt) || 1400,
        bankName: bankName.trim(),
        accountNo: accountNo.trim(),
        ifscCode: ifscCode.trim().toUpperCase(),
      };

      saveNewVendor(newVendor);
      toast.success(`Buyer / Vendor "${companyName}" onboarded successfully!`);
      navigate("/biomass/vendors");
    } catch (err) {
      toast.error("Failed to save buyer details.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%", maxWidth: "100%" }}>
      {/* Top Back Navigation */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button
          type="button"
          onClick={() => navigate("/biomass/vendors")}
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
          <i className="ri-arrow-left-line" /> Back to Vendor Directory
        </button>

        <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>
          Biomass Procurement & Buyer Onboarding
        </span>
      </div>

      {/* Page Header */}
      <PageHeader
        title="Create New Buyer / Vendor"
        subtitle="Full-width onboarding studio: register corporate entities, dispatch agreements, contracted tonnage, and banking credentials"
      />

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Section 1: Business Entity & Legal Compliance (Full Width) */}
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
                Business Entity & Legal Compliance
              </h3>
            </div>
            <span style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600 }}>Step 1 of 4: Corporate Profile</span>
          </div>

          {/* Row 1: Company Name, GSTIN, PAN, Commodity (4 Columns) */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px 18px", marginBottom: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "var(--ink)", marginBottom: 4 }}>
                Buyer / Vendor Company Name <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Maschio Gaspardo India Private Limited"
                style={DASHED_INPUT_STYLE}
                onFocus={handleDashedFocus}
                onBlur={handleDashedBlur}
              />
              <span style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 4, display: "block" }}>
                Registered corporate or trade entity name
              </span>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>
                GSTIN Identification Number
              </label>
              <input
                type="text"
                maxLength={15}
                value={gstin}
                onChange={handleGstinChange}
                placeholder="e.g. 27AAHCM1258Q1ZW"
                style={{
                  ...DASHED_INPUT_STYLE,
                  fontWeight: 400,
                  letterSpacing: "0.5px",
                }}
                onFocus={handleDashedFocus}
                onBlur={handleDashedBlur}
              />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ fontSize: 10.5, color: "var(--muted)" }}>
                  [15-digit]
                </span>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: gstin.length === 15 ? "#16a34a" : gstin.length > 0 ? "#d97706" : "var(--muted)",
                    background: gstin.length === 15 ? "#f0fdf4" : gstin.length > 0 ? "#fffbeb" : "transparent",
                    padding: "1px 6px",
                    borderRadius: 4,
                  }}
                >
                  [{gstin.length}/15 digits]
                </span>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>
                Permanent Account Number (PAN)
              </label>
              <input
                type="text"
                maxLength={10}
                value={panNo}
                onChange={handlePanChange}
                placeholder="e.g. AAHCM1258Q"
                style={{
                  ...DASHED_INPUT_STYLE,
                  fontWeight: 400,
                  letterSpacing: "0.5px",
                }}
                onFocus={handleDashedFocus}
                onBlur={handleDashedBlur}
              />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ fontSize: 10.5, color: "var(--muted)" }}>
                  [10-digit]
                </span>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: panNo.length === 10 ? "#16a34a" : panNo.length > 0 ? "#d97706" : "var(--muted)",
                    background: panNo.length === 10 ? "#f0fdf4" : panNo.length > 0 ? "#fffbeb" : "transparent",
                    padding: "1px 6px",
                    borderRadius: 4,
                  }}
                >
                  [{panNo.length}/10 digits]
                </span>
              </div>
            </div>

            <FormField
              label="Primary Raw Material Commodity"
              type="select"
              value={commodity}
              onChange={setCommodity}
              options={[
                "Biomass / Mustard Husk / PRALLI",
                "PRALLI (Baled)",
                "PRALLI (Loose)",
                "Mustard Husk",
                "Paddy Straw",
                "Wood Chips",
              ]}
              layout="vertical"
              marginBottom={0}
              inputStyle={{ borderBottom: "1.5px dashed var(--line-strong)", borderRadius: 0, background: "transparent" }}
            />
          </div>

          {/* Row 2: Sourcing Belt & Full Address (2 Columns) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 18px" }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>
                Sourcing Belt / Origin Network
              </label>
              <input
                type="text"
                value={sourcingArea}
                onChange={(e) => setSourcingArea(e.target.value)}
                placeholder="e.g. Unnao & Shahjahanpur Belt (35 Villages)"
                style={DASHED_INPUT_STYLE}
                onFocus={handleDashedFocus}
                onBlur={handleDashedBlur}
              />
              <span style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 4, display: "block" }}>
                Primary agricultural collection zones or plant delivery hub
              </span>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>
                Full Operational / Registered Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter complete office address, district, state, and pin code"
                style={DASHED_INPUT_STYLE}
                onFocus={handleDashedFocus}
                onBlur={handleDashedBlur}
              />
              <span style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 4, display: "block" }}>
                Headquarters or operational procurement office address
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Authorized Representative & Contact Desk (Full Width) */}
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
                Authorized Representative & Contact Desk
              </h3>
            </div>
            <span style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600 }}>Step 2 of 4: Liaison Desk</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px 18px" }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>
                Representative Full Name
              </label>
              <input
                type="text"
                value={representative}
                onChange={(e) => setRepresentative(e.target.value)}
                placeholder="e.g. Mr. Bhanu Pratap Singh"
                style={DASHED_INPUT_STYLE}
                onFocus={handleDashedFocus}
                onBlur={handleDashedBlur}
              />
              <span style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 4, display: "block" }}>
                Primary liaison officer for dispatch and order tracking
              </span>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>
                Contact Phone Number <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                maxLength={10}
                required
                value={contactNo}
                onChange={(e) => setContactNo(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
                placeholder="e.g. 9876543210"
                style={DASHED_INPUT_STYLE}
                onFocus={handleDashedFocus}
                onBlur={handleDashedBlur}
              />
              <span style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 4, display: "block" }}>
                Active mobile line for dispatch updates and OTPs
              </span>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>
                Official Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. vendor.contact@shreerambiomass.com"
                style={DASHED_INPUT_STYLE}
                onFocus={handleDashedFocus}
                onBlur={handleDashedBlur}
              />
              <span style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 4, display: "block" }}>
                Invoicing, billing statements, and contract communications
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Commercial PO Term Sheet & Rate Agreement (Full Width) */}
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
                3
              </span>
              <h3 style={{ fontSize: 13.5, fontWeight: 800, color: "var(--ink)", margin: 0 }}>
                Commercial PO Term Sheet & Rate Agreement
              </h3>
            </div>
            <Badge tone="success">ACTIVE TERM SHEET</Badge>
          </div>

          {/* 4 Commercial Columns with Dashed Border Bottom (Agreement Tenure has wider column for dual dates) */}
          <div style={{ display: "grid", gridTemplateColumns: "minmax(180px, 1fr) minmax(340px, 1.8fr) minmax(180px, 1fr) minmax(180px, 1fr)", gap: "14px 20px", marginBottom: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>
                PO Reference Number
              </label>
              <input
                type="text"
                value={poNo}
                onChange={(e) => setPoNo(e.target.value)}
                placeholder="PO-2026-1001"
                style={DASHED_INPUT_STYLE}
                onFocus={handleDashedFocus}
                onBlur={handleDashedBlur}
              />
              <span style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 4, display: "block" }}>
                Auto-assigned sequential order PO identifier
              </span>
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)" }}>
                  Agreement Tenure
                </label>
                <select
                  value={tenurePreset}
                  onChange={handleTenurePresetChange}
                  style={{
                    fontSize: 10.5,
                    fontWeight: 600,
                    color: "var(--primary-deep)",
                    background: "var(--primary-tint)",
                    border: "1px solid var(--primary-light)",
                    borderRadius: 4,
                    padding: "1px 6px",
                    outline: "none",
                    cursor: "pointer",
                  }}
                  title="Select procurement term preset"
                >
                  <option value="kharif">Kharif (Jun–Oct)</option>
                  <option value="rabi">Rabi (Nov–Mar)</option>
                  <option value="annual">Full Year (12 Mos)</option>
                  <option value="half_year">Half Year (6 Mos)</option>
                  <option value="quarter">Quarter (3 Mos)</option>
                  <option value="custom">Custom Dates</option>
                </select>
              </div>

              {/* Start and End Date dropdown calendar pickers */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <span style={{ fontSize: 9.5, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700, display: "block" }}>
                    Start Date
                  </span>
                  <input
                    type="date"
                    value={tenureStartDate}
                    onChange={(e) => {
                      setTenureStartDate(e.target.value);
                      setTenurePreset("custom");
                    }}
                    style={{
                      ...DASHED_INPUT_STYLE,
                      fontSize: 13,
                      padding: "5px 0",
                      cursor: "pointer",
                    }}
                    onFocus={handleDashedFocus}
                    onBlur={handleDashedBlur}
                  />
                </div>

                <div>
                  <span style={{ fontSize: 9.5, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700, display: "block" }}>
                    End Date
                  </span>
                  <input
                    type="date"
                    value={tenureEndDate}
                    min={tenureStartDate}
                    onChange={(e) => {
                      setTenureEndDate(e.target.value);
                      setTenurePreset("custom");
                    }}
                    style={{
                      ...DASHED_INPUT_STYLE,
                      fontSize: 13,
                      padding: "5px 0",
                      cursor: "pointer",
                    }}
                    onFocus={handleDashedFocus}
                    onBlur={handleDashedBlur}
                  />
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ fontSize: 10.5, color: "var(--muted)" }}>
                  Validity window
                </span>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--primary-deep)" }}>
                  {tenure}
                </span>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>
                Contracted Volume (MT)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={contractedQtyMt}
                onChange={(e) => setContractedQtyMt(e.target.value)}
                placeholder="1000"
                style={DASHED_INPUT_STYLE}
                onFocus={handleDashedFocus}
                onBlur={handleDashedBlur}
              />
              <span style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 4, display: "block" }}>
                Tonnage committed under agreement
              </span>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>
                Agreed Sourcing Rate (₹/MT)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={agreedPricePerMt}
                onChange={(e) => setAgreedPricePerMt(e.target.value)}
                placeholder="1400"
                style={DASHED_INPUT_STYLE}
                onFocus={handleDashedFocus}
                onBlur={handleDashedBlur}
              />
              <span style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 4, display: "block" }}>
                Per Metric Ton contracted rate
              </span>
            </div>
          </div>

          {/* Live Order Calculation Banner (Wide & Understandable) */}
          <div
            style={{
              background: "var(--canvas)",
              border: "1px solid var(--line)",
              borderRadius: 10,
              padding: "12px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
              marginTop: 6,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "var(--primary-tint)",
                  color: "var(--primary-deep)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                }}
              >
                <i className="ri-calculator-line" />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                  Contract Value Calculation
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)", marginTop: 2 }}>
                  {contractedQtyMt || "0"} MT × ₹{agreedPricePerMt || "0"}/MT
                </div>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                Total Order Value
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "var(--primary-deep)", marginTop: 2 }}>
                ₹ {totalContractValue.toLocaleString("en-IN")}
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Bank Settlement & Disbursement Details (Full Width) */}
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
                4
              </span>
              <h3 style={{ fontSize: 13.5, fontWeight: 800, color: "var(--ink)", margin: 0 }}>
                Bank Settlement & Disbursement Details
              </h3>
            </div>
            <span style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600 }}>Step 4 of 4: Direct Deposit Credentials</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px 18px" }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>
                Bank Name
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. State Bank of India"
                style={DASHED_INPUT_STYLE}
                onFocus={handleDashedFocus}
                onBlur={handleDashedBlur}
              />
              <span style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 4, display: "block" }}>
                Commercial bank name
              </span>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>
                Account Number
              </label>
              <input
                type="text"
                value={accountNo}
                onChange={(e) => setAccountNo(e.target.value)}
                placeholder="e.g. 39182746192"
                style={DASHED_INPUT_STYLE}
                onFocus={handleDashedFocus}
                onBlur={handleDashedBlur}
              />
              <span style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 4, display: "block" }}>
                Beneficiary current or settlement account number
              </span>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>
                IFSC Code
              </label>
              <input
                type="text"
                maxLength={11}
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 11))}
                placeholder="e.g. SBIN0001234"
                style={{
                  ...DASHED_INPUT_STYLE,
                  letterSpacing: "0.5px",
                }}
                onFocus={handleDashedFocus}
                onBlur={handleDashedBlur}
              />
              <span style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 4, display: "block" }}>
                11-character branch IFSC identifier
              </span>
            </div>
          </div>
        </div>

        {/* Live Buyer / Vendor Compliance & Summary Strip (Full Width) */}
        <div
          style={{
            background: "var(--surface)",
            border: "1.5px solid var(--primary-tint)",
            borderRadius: 14,
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 14,
            boxShadow: "var(--shadow-sm)",
          }}
        >
          {/* Left: Entity Name & Tags */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: "var(--primary-tint)",
                color: "var(--primary)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
              }}
            >
              <i className="ri-building-2-line" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 900, color: "var(--ink)" }}>
                {companyName || "Buyer / Vendor Name"}
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                {gstin ? `GSTIN: ${gstin}` : "GSTIN pending"} | {commodity}
              </div>
            </div>
          </div>

          {/* Center: Compliance Checklist Chips */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", fontSize: 12 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5, color: companyName ? "#15803d" : "var(--muted)", fontWeight: 600 }}>
              <i className={companyName ? "ri-checkbox-circle-fill" : "ri-circle-line"} style={{ color: companyName ? "#16a34a" : "var(--muted)" }} />
              Entity Profile
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5, color: contactNo ? "#15803d" : "var(--muted)", fontWeight: 600 }}>
              <i className={contactNo ? "ri-checkbox-circle-fill" : "ri-circle-line"} style={{ color: contactNo ? "#16a34a" : "var(--muted)" }} />
              Contact
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5, color: gstin ? "#15803d" : "var(--muted)", fontWeight: 600 }}>
              <i className={gstin ? "ri-checkbox-circle-fill" : "ri-circle-line"} style={{ color: gstin ? "#16a34a" : "var(--muted)" }} />
              GST Code
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5, color: bankName && accountNo ? "#15803d" : "var(--muted)", fontWeight: 600 }}>
              <i className={bankName && accountNo ? "ri-checkbox-circle-fill" : "ri-circle-line"} style={{ color: bankName && accountNo ? "#16a34a" : "var(--muted)" }} />
              Bank Deposit
            </span>
          </div>

          {/* Right: Total Value */}
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Contract Order Value
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "var(--primary-deep)" }}>
              ₹ {totalContractValue.toLocaleString("en-IN")}
            </div>
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
          <button
            type="button"
            onClick={() => navigate("/biomass/vendors")}
            style={{
              padding: "8px 16px",
              fontSize: 12.5,
              fontWeight: 600,
              borderRadius: 8,
              border: "1px solid var(--line-strong)",
              background: "var(--surface)",
              color: "var(--ink)",
              cursor: "pointer",
            }}
          >
            <i className="ri-arrow-left-line" style={{ marginRight: 4 }} /> Return to Vendor Directory
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Button
              variant="secondary"
              type="button"
              onClick={() => navigate("/biomass/vendors")}
              style={{ padding: "8px 18px", fontSize: 13 }}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={loading}
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
              {loading ? (
                <>
                  <i className="ri-loader-4-line spin" /> Registering Buyer / Vendor...
                </>
              ) : (
                <>
                  <i className="ri-check-line" /> Register Buyer / Vendor
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
