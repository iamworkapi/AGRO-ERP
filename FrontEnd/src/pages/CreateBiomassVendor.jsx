import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import FormField from "../components/common/FormField";
import { saveNewVendor } from "../features/biomass/biomassService";
import { toast } from "../utils/toast";

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

  // Commercial Agreement & Purchase Order Term Sheet
  const [poNo, setPoNo] = useState(`PO-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [poDate, setPoDate] = useState(new Date().toISOString().slice(0, 10));
  const [tenure, setTenure] = useState("01.06.2026 to 31.10.2026");
  const [contractedQtyMt, setContractedQtyMt] = useState("1000");
  const [agreedPricePerMt, setAgreedPricePerMt] = useState("1400");

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
      toast.success(`Buyer "${companyName}" created successfully!`);
      navigate("/biomass/vendors");
    } catch (err) {
      toast.error("Failed to save buyer details.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%" }}>
      {/* Page Header */}
      <PageHeader
        title="Create New Buyer"
        subtitle="Onboard biomass procurement contractors, buyer networks, and farmer producer collectives"
      />

      {/* 2-Column Responsive Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }} className="responsive-grid-2">
        {/* Left Column: Form Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Section 1: Business Entity & Legal Compliance */}
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--line)",
                borderRadius: 14,
                padding: "18px 20px",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div style={{ paddingBottom: 10, borderBottom: "1px solid var(--line)", marginBottom: 14 }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "var(--ink)", display: "flex", alignItems: "center", gap: 8 }}>
                  <i className="fa-solid fa-building" style={{ color: "var(--primary)" }} />
                  1. Business Entity & Legal Compliance
                </h3>
                <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "var(--muted)" }}>
                  Registered vendor company details, legal tax identifiers, and sourcing networks
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }} className="responsive-grid-2">
                <div style={{ gridColumn: "1 / -1" }}>
                  <FormField
                    label="Buyer / Vendor Name"
                    required
                    icon="fa-solid fa-industry"
                    placeholder="e.g. SHREE RAM BIOMASS CONTRACTORS"
                    value={companyName}
                    onChange={setCompanyName}
                    compact
                    marginBottom={10}
                  />
                </div>

                <FormField
                  label="GSTIN Identification"
                  icon="fa-solid fa-file-invoice"
                  placeholder="e.g. 09IYZPS0291E1ZK"
                  value={gstin}
                  onChange={setGstin}
                  compact
                  marginBottom={10}
                />

                <FormField
                  label="Permanent Account Number (PAN)"
                  icon="fa-solid fa-id-card"
                  placeholder="e.g. IYZPS0291E"
                  value={panNo}
                  onChange={setPanNo}
                  compact
                  marginBottom={10}
                />

                <FormField
                  label="Sourcing Belt / Origin Network"
                  icon="fa-solid fa-map-location-dot"
                  placeholder="e.g. Unnao & Shahjahanpur Belt (35 Villages)"
                  value={sourcingArea}
                  onChange={setSourcingArea}
                  compact
                  marginBottom={10}
                />

                <FormField
                  label="Primary Raw Material Commodity"
                  icon="fa-solid fa-boxes-stacked"
                  placeholder="e.g. Biomass / Mustard Husk / PRALLI"
                  value={commodity}
                  onChange={setCommodity}
                  compact
                  marginBottom={10}
                />
              </div>
            </div>

            {/* Section 2: Authorized Representative & Contact Information */}
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--line)",
                borderRadius: 14,
                padding: "18px 20px",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div style={{ paddingBottom: 10, borderBottom: "1px solid var(--line)", marginBottom: 14 }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "var(--ink)", display: "flex", alignItems: "center", gap: 8 }}>
                  <i className="fa-solid fa-user-tie" style={{ color: "var(--primary)" }} />
                  2. Authorized Representative & Contact Desk
                </h3>
                <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "var(--muted)" }}>
                  Key representative contact details for dispatch coordination and billing
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }} className="responsive-grid-2">
                <FormField
                  label="Representative Full Name"
                  icon="fa-solid fa-user"
                  placeholder="e.g. Mr. Bhanu Pratap Singh"
                  value={representative}
                  onChange={setRepresentative}
                  compact
                  marginBottom={10}
                />

                <FormField
                  label="Contact Phone Number"
                  required
                  icon="fa-solid fa-phone"
                  placeholder="e.g. 9876543210"
                  value={contactNo}
                  onChange={setContactNo}
                  compact
                  marginBottom={10}
                />

                <div style={{ gridColumn: "1 / -1" }}>
                  <FormField
                    label="Official Email Address"
                    type="email"
                    icon="fa-solid fa-envelope"
                    placeholder="e.g. vendor.contact@shreerambiomass.com"
                    value={email}
                    onChange={setEmail}
                    compact
                    marginBottom={10}
                  />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <FormField
                    label="Full Operational / Registered Address"
                    type="textarea"
                    icon="fa-solid fa-location-dot"
                    placeholder="Enter complete office address, district, state, and pin code"
                    value={address}
                    onChange={setAddress}
                    compact
                    marginBottom={10}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Commercial Purchase Order & Sourcing Agreement */}
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--line)",
                borderRadius: 14,
                padding: "18px 20px",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div style={{ paddingBottom: 10, borderBottom: "1px solid var(--line)", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "var(--ink)", display: "flex", alignItems: "center", gap: 8 }}>
                    <i className="fa-solid fa-file-signature" style={{ color: "var(--primary)" }} />
                    3. Commercial PO Term Sheet & Rate Agreement
                  </h3>
                  <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "var(--muted)" }}>
                    Contracted biomass tonnage, agreed procurement price, and tenure
                  </p>
                </div>
                <Badge tone="success">ACTIVE TERM SHEET</Badge>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0 12px" }} className="responsive-grid-2">
                <FormField
                  label="PO Reference Number"
                  icon="fa-solid fa-hashtag"
                  placeholder="PO-2026-XXXX"
                  value={poNo}
                  onChange={setPoNo}
                  compact
                  marginBottom={10}
                />

                <FormField
                  label="Agreement Tenure"
                  icon="fa-solid fa-calendar-days"
                  placeholder="e.g. 01.06.2026 to 31.10.2026"
                  value={tenure}
                  onChange={setTenure}
                  compact
                  marginBottom={10}
                />

                <FormField
                  label="Contracted Volume (MT)"
                  type="number"
                  icon="fa-solid fa-weight-hanging"
                  placeholder="1000"
                  value={contractedQtyMt}
                  onChange={setContractedQtyMt}
                  compact
                  marginBottom={10}
                />

                <FormField
                  label="Agreed Sourcing Rate (₹/MT)"
                  type="number"
                  icon="fa-solid fa-indian-rupee-sign"
                  placeholder="1400"
                  value={agreedPricePerMt}
                  onChange={setAgreedPricePerMt}
                  compact
                  marginBottom={10}
                />
              </div>

              {/* Total Contract Estimated Value Banner */}
              <div
                style={{
                  background: "rgba(0, 184, 107, 0.08)",
                  border: "1px solid rgba(0, 184, 107, 0.2)",
                  borderRadius: 10,
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: 4,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <i className="fa-solid fa-calculator" style={{ color: "var(--primary-deep)", fontSize: 14 }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>
                    Estimated Total Sourcing Value:
                  </span>
                </div>
                <strong style={{ fontSize: 14, color: "var(--primary-deep)" }}>
                  ₹ {totalContractValue.toLocaleString("en-IN")}
                </strong>
              </div>
            </div>

            {/* Section 4: Bank Settlement & Disbursement Account */}
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--line)",
                borderRadius: 14,
                padding: "18px 20px",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div style={{ paddingBottom: 10, borderBottom: "1px solid var(--line)", marginBottom: 14 }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "var(--ink)", display: "flex", alignItems: "center", gap: 8 }}>
                  <i className="fa-solid fa-building-columns" style={{ color: "var(--primary)" }} />
                  4. Bank Settlement & Disbursement Details
                </h3>
                <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "var(--muted)" }}>
                  Official bank account for automated payment disbursal and invoicing
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 12px" }} className="responsive-grid-2">
                <FormField
                  label="Bank Name"
                  icon="fa-solid fa-landmark"
                  placeholder="e.g. State Bank of India"
                  value={bankName}
                  onChange={setBankName}
                  compact
                  marginBottom={10}
                />

                <FormField
                  label="Account Number"
                  icon="fa-solid fa-money-check"
                  placeholder="e.g. 39182746192"
                  value={accountNo}
                  onChange={setAccountNo}
                  compact
                  marginBottom={10}
                />

                <FormField
                  label="IFSC Code"
                  icon="fa-solid fa-shield"
                  placeholder="e.g. SBIN0001234"
                  value={ifscCode}
                  onChange={setIfscCode}
                  compact
                  marginBottom={10}
                />
              </div>
            </div>

            {/* Form Submit & Cancel Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 6 }}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate("/biomass/vendors")}
                style={{ padding: "8px 18px", fontSize: 12.5 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="btn-glow"
                style={{ padding: "8px 24px", fontSize: 12.5, fontWeight: 700 }}
              >
                {loading ? "Registering…" : "Register Vendor"}
              </Button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Instant Summary Card */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: 14,
              padding: "18px",
              boxShadow: "var(--shadow-sm)",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              position: "sticky",
              top: 14,
            }}
          >
            {/* Header Badge */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--line)", paddingBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>
                Buyer / Vendor Preview
              </span>
              <Badge tone="success">NEW ONBOARDING</Badge>
            </div>

            {/* Vendor Company Header */}
            <div>
              <h4 style={{ margin: "0 0 2px", fontSize: 15, fontWeight: 800, color: "var(--ink)", wordBreak: "break-word" }}>
                {companyName || "Buyer / Vendor Name"}
              </h4>
              <span style={{ fontSize: 11.5, color: "var(--primary-deep)", fontWeight: 600 }}>
                {commodity || "Biomass Supply"}
              </span>
            </div>

            {/* Live Details Box */}
            <div
              style={{
                background: "var(--canvas)",
                border: "1px solid var(--line)",
                borderRadius: 10,
                padding: "12px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                fontSize: 12,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>GSTIN:</span>
                <strong style={{ color: "var(--ink)", fontFamily: "monospace", fontSize: 11 }}>{gstin || "—"}</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>Representative:</span>
                <span style={{ color: "var(--ink)", fontWeight: 600 }}>{representative || "—"}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>Contact:</span>
                <span style={{ color: "var(--ink)" }}>{contactNo || "—"}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>Origin Belt:</span>
                <span style={{ color: "var(--ink-secondary)", maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {sourcingArea || "—"}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--line)", paddingTop: 8, marginTop: 2 }}>
                <span style={{ color: "var(--muted)" }}>Contracted Vol:</span>
                <strong style={{ color: "var(--primary-deep)" }}>{contractedQtyMt || "0"} MT</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>Agreed Sourcing Rate:</span>
                <strong style={{ color: "var(--ink)" }}>₹ {agreedPricePerMt || "0"} / MT</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", background: "var(--surface)", padding: "6px 8px", borderRadius: 6, border: "1px solid var(--line)" }}>
                <span style={{ color: "var(--muted)", fontWeight: 600 }}>Total Order Value:</span>
                <strong style={{ color: "var(--primary-deep)" }}>₹ {totalContractValue.toLocaleString("en-IN")}</strong>
              </div>
            </div>

            {/* Compliance Checklist */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 11 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: companyName ? "var(--primary-deep)" : "var(--muted)" }}>
                <i className={companyName ? "fa-solid fa-circle-check" : "fa-regular fa-circle"} />
                Entity Profile Setup
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: contactNo ? "var(--primary-deep)" : "var(--muted)" }}>
                <i className={contactNo ? "fa-solid fa-circle-check" : "fa-regular fa-circle"} />
                Contact Verification
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: gstin ? "var(--primary-deep)" : "var(--muted)" }}>
                <i className={gstin ? "fa-solid fa-circle-check" : "fa-regular fa-circle"} />
                GST Compliance
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: bankName && accountNo ? "var(--primary-deep)" : "var(--muted)" }}>
                <i className={bankName && accountNo ? "fa-solid fa-circle-check" : "fa-regular fa-circle"} />
                Banking & Settlement
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
