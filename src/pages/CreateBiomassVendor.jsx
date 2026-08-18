import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { saveNewVendor } from "../features/biomass/biomassService";
import { toast } from "../utils/toast";

export default function CreateBiomassVendor() {
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState("");
  const [gstin, setGstin] = useState("");
  const [panNo, setPanNo] = useState("");
  const [representative, setRepresentative] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [sourcingArea, setSourcingArea] = useState("");

  // Term Sheet & PO
  const [poNo, setPoNo] = useState(`2026050${Math.floor(5 + Math.random() * 9)}`);
  const [poDate, setPoDate] = useState(new Date().toISOString().slice(0, 10));
  const [tenure, setTenure] = useState("01.06.2026 to 31.10.2026");
  const [contractedQtyMt, setContractedQtyMt] = useState("1000");
  const [agreedPricePerMt, setAgreedPricePerMt] = useState("1400");

  // Bank Info
  const [bankName, setBankName] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [ifscCode, setIfscCode] = useState("");

  const [loading, setLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!companyName.trim()) {
      toast.error("Please enter Vendor Company Name");
      return;
    }
    if (!contactNo.trim()) {
      toast.error("Please enter Contact Mobile Number");
      return;
    }

    setLoading(true);
    try {
      const newVendor = {
        companyName: companyName.toUpperCase(),
        gstin: gstin.toUpperCase() || "09AAAAA0000A1Z5",
        panNo: panNo.toUpperCase(),
        representative,
        contactNo,
        email,
        address,
        sourcingArea: sourcingArea || "Unnao & Surrounding Villages (40 Villages)",
        poNo,
        poDate,
        tenure,
        contractedQtyMt: parseFloat(contractedQtyMt) || 1000,
        agreedPricePerMt: parseFloat(agreedPricePerMt) || 1400,
        bankName,
        accountNo,
        ifscCode,
      };

      saveNewVendor(newVendor);
      toast.success(`Raw Material Vendor "${companyName}" created successfully!`);
      navigate("/biomass/vendors");
    } catch (err) {
      toast.error("Failed to save vendor details.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 900, margin: "0 auto", width: "100%" }}>
      {/* PAGE HEADER */}
      <PageHeader
        title="👤 Register New Raw Material Vendor (जहाँ से माल लेना है)"
        subtitle="Add a new biomass supply contractor, farmer aggregation collective, or FPO to the system"
      />

      <Card title="Vendor Profile & Supply Term Sheet Details">
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Section 1: Basic Company & Legal Info */}
          <div>
            <h4 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 800, color: "var(--ink)", borderBottom: "1px solid var(--line)", paddingBottom: 6 }}>
              🏢 1. Company & Legal Information
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 4 }}>
                  Vendor Company / Entity Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SHREE RAM BIOMASS CONTRACTOR"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", fontSize: 12.5, fontWeight: 700, borderRadius: 8, border: "1px solid var(--line-strong)" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 4 }}>
                  GSTIN Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 09IYZPS0291E1ZK"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", fontSize: 12.5, fontWeight: 700, borderRadius: 8, border: "1px solid var(--line-strong)" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 4 }}>
                  PAN Card Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. IYZPS0291E"
                  value={panNo}
                  onChange={(e) => setPanNo(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", fontSize: 12.5, borderRadius: 8, border: "1px solid var(--line-strong)" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 4 }}>
                  Sourcing Belt / Village Network
                </label>
                <input
                  type="text"
                  placeholder="e.g. Unnao & Shahjahanpur Belt (35 Villages)"
                  value={sourcingArea}
                  onChange={(e) => setSourcingArea(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", fontSize: 12.5, borderRadius: 8, border: "1px solid var(--line-strong)" }}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Contact & Key Persons */}
          <div>
            <h4 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 800, color: "var(--ink)", borderBottom: "1px solid var(--line)", paddingBottom: 6 }}>
              👤 2. Authorized Representative & Contacts
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 4 }}>
                  Representative Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mr. Bhanu Singh"
                  value={representative}
                  onChange={(e) => setRepresentative(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", fontSize: 12.5, borderRadius: 8, border: "1px solid var(--line-strong)" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 4 }}>
                  Contact Mobile *
                </label>
                <input
                  type="text"
                  required
                  placeholder="10-digit mobile number"
                  value={contactNo}
                  onChange={(e) => setContactNo(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", fontSize: 12.5, fontWeight: 700, borderRadius: 8, border: "1px solid var(--line-strong)" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 4 }}>
                  Official Email Address
                </label>
                <input
                  type="email"
                  placeholder="vendor@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", fontSize: 12.5, borderRadius: 8, border: "1px solid var(--line-strong)" }}
                />
              </div>

              <div style={{ gridColumn: "span 3" }}>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 4 }}>
                  Full Office / Registered Address
                </label>
                <input
                  type="text"
                  placeholder="Colony, Tehsil, District, State, Pincode"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", fontSize: 12.5, borderRadius: 8, border: "1px solid var(--line-strong)" }}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Commercial Purchase Order & Supply Agreement */}
          <div style={{ background: "#FEF3C7", border: "1.5px solid #F59E0B", borderRadius: 10, padding: 14 }}>
            <h4 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 900, color: "#92400E" }}>
              📜 3. Purchase Order Term Sheet & Commercial Agreement
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#78350F", display: "block", marginBottom: 3 }}>
                  PO Number
                </label>
                <input
                  type="text"
                  value={poNo}
                  onChange={(e) => setPoNo(e.target.value)}
                  style={{ width: "100%", padding: "6px 10px", fontSize: 12, borderRadius: 6, border: "1px solid #D97706", background: "#FFFBEB" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#78350F", display: "block", marginBottom: 3 }}>
                  Supply Tenure
                </label>
                <input
                  type="text"
                  value={tenure}
                  onChange={(e) => setTenure(e.target.value)}
                  style={{ width: "100%", padding: "6px 10px", fontSize: 12, borderRadius: 6, border: "1px solid #D97706", background: "#FFFBEB" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#78350F", display: "block", marginBottom: 3 }}>
                  Contracted Qty (MT)
                </label>
                <input
                  type="number"
                  value={contractedQtyMt}
                  onChange={(e) => setContractedQtyMt(e.target.value)}
                  style={{ width: "100%", padding: "6px 10px", fontSize: 12, fontWeight: 800, borderRadius: 6, border: "1px solid #D97706", background: "#FFFBEB" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#78350F", display: "block", marginBottom: 3 }}>
                  Agreed Price (₹/MT)
                </label>
                <input
                  type="number"
                  value={agreedPricePerMt}
                  onChange={(e) => setAgreedPricePerMt(e.target.value)}
                  style={{ width: "100%", padding: "6px 10px", fontSize: 12, fontWeight: 800, borderRadius: 6, border: "1px solid #D97706", background: "#FFFBEB" }}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Bank & Settlement Details */}
          <div>
            <h4 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 800, color: "var(--ink)", borderBottom: "1px solid var(--line)", paddingBottom: 6 }}>
              💳 4. Bank Settlement Account
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 4 }}>
                  Bank Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. State Bank of India"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", fontSize: 12.5, borderRadius: 8, border: "1px solid var(--line-strong)" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 4 }}>
                  Account Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 39182746192"
                  value={accountNo}
                  onChange={(e) => setAccountNo(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", fontSize: 12.5, borderRadius: 8, border: "1px solid var(--line-strong)" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 4 }}>
                  IFSC Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. SBIN0001234"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", fontSize: 12.5, borderRadius: 8, border: "1px solid var(--line-strong)" }}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, borderTop: "1px solid var(--line)", paddingTop: 14, marginTop: 6 }}>
            <button
              type="button"
              onClick={() => navigate("/biomass/vendors")}
              style={{ padding: "9px 18px", fontSize: 13, fontWeight: 700, borderRadius: 8, border: "1px solid var(--line)", background: "var(--surface)", cursor: "pointer" }}
            >
              Cancel
            </button>
            <Button
              type="submit"
              disabled={loading}
              style={{ padding: "9px 24px", fontSize: 13, fontWeight: 800, background: "#2563EB" }}
            >
              {loading ? "Saving…" : "💾 Save & Register Vendor"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
