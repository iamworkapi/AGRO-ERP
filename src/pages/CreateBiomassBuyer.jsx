import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { saveNewBuyer } from "../features/biomass/biomassService";
import { toast } from "../utils/toast";

export default function CreateBiomassBuyer() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [division, setDivision] = useState("");
  const [address, setAddress] = useState("");
  const [gstin, setGstin] = useState("");
  const [plantType, setPlantType] = useState("Bio-Ethanol Plant");
  const [agreedRatePerMt, setAgreedRatePerMt] = useState("1850");
  const [targetQtyMt, setTargetQtyMt] = useState("5000");

  const [contactPerson, setContactPerson] = useState("");
  const [contactMobile, setContactMobile] = useState("");
  const [email, setEmail] = useState("");
  const [poNo, setPoNo] = useState(`PO-BUYER-${Math.floor(100 + Math.random() * 900)}`);
  const [paymentTerms, setPaymentTerms] = useState("Net 15 Days");

  const [loading, setLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
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

    setLoading(true);
    try {
      const newBuyer = {
        name: name.toUpperCase(),
        division: division ? division.toUpperCase() : "",
        address,
        gstin: gstin.toUpperCase(),
        plantType,
        agreedRatePerMt: parseFloat(agreedRatePerMt) || 1850,
        targetQtyMt: parseFloat(targetQtyMt) || 5000,
        contactPerson,
        contactMobile,
        email,
        poNo,
        paymentTerms,
      };

      saveNewBuyer(newBuyer);
      toast.success(`Industrial Buyer "${name}" registered successfully!`);
      navigate("/biomass/buyers");
    } catch (err) {
      toast.error("Failed to register buyer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 900, margin: "0 auto", width: "100%" }}>
      {/* PAGE HEADER */}
      <PageHeader
        title="🏬 Register New Industrial Buyer / Client (   )"
        subtitle="Add a new Bio-Ethanol Plant, Power Plant, CBG Plant, or Factory Consignee to the off-take system"
      />

      <Card title="Industrial Buyer / Consignee Registration Details">
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Section 1: Entity Name & Division */}
          <div>
            <h4 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 800, color: "var(--ink)", borderBottom: "1px solid var(--line)", paddingBottom: 6 }}>
              🏭 1. Plant & Off-taker Profile
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 4 }}>
                  Company / Buyer Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NTPC BIOMASS POWER LIMITED"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", fontSize: 12.5, fontWeight: 700, borderRadius: 8, border: "1px solid var(--line-strong)" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 4 }}>
                  Division / Plant Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. UNNAO BIO-ENERGY DIVISION"
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", fontSize: 12.5, fontWeight: 700, borderRadius: 8, border: "1px solid var(--line-strong)" }}
                />
              </div>

              <div style={{ gridColumn: "span 2" }}>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 4 }}>
                  Full Plant Delivery Address (as per Bill To) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="P.O., Village, Gata No., Tehsil, District, State, Pincode"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", fontSize: 12.5, borderRadius: 8, border: "1px solid var(--line-strong)" }}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Taxation, Plant Type & Commercial Off-take Rate */}
          <div style={{ background: "#EFF6FF", border: "1.5px solid #BFDBFE", borderRadius: 10, padding: 14 }}>
            <h4 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 900, color: "#1E40AF" }}>
              ⚖️ 2. Plant Category, Tax & Commercial Pricing
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.2fr 1fr 1fr", gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#1E3A8A", display: "block", marginBottom: 3 }}>
                  GSTIN Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 09AAACR5055K2Z4"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  style={{ width: "100%", padding: "7px 10px", fontSize: 12, fontWeight: 700, borderRadius: 6, border: "1px solid #93C5FD", background: "#FFFFFF" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#1E3A8A", display: "block", marginBottom: 3 }}>
                  Plant Type
                </label>
                <select
                  value={plantType}
                  onChange={(e) => setPlantType(e.target.value)}
                  style={{ width: "100%", padding: "7px 10px", fontSize: 12, fontWeight: 700, borderRadius: 6, border: "1px solid #93C5FD", background: "#FFFFFF" }}
                >
                  <option value="Bio-Ethanol Plant">Bio-Ethanol Plant</option>
                  <option value="CBG Plant / Ethanol Division">CBG Plant / Ethanol Division</option>
                  <option value="Biomass Power Plant">Biomass Power Plant</option>
                  <option value="Biomass Power Plant (Co-firing)">Biomass Power Plant (Co-firing)</option>
                  <option value="CBG & Bio-Energy Plant">CBG & Bio-Energy Plant</option>
                  <option value="Pellet / Briquette Mill">Pellet / Briquette Mill</option>
                  <option value="Paper & Packaging Mill">Paper & Packaging Mill</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#1E3A8A", display: "block", marginBottom: 3 }}>
                  Agreed Rate (₹/MT)
                </label>
                <input
                  type="number"
                  value={agreedRatePerMt}
                  onChange={(e) => setAgreedRatePerMt(e.target.value)}
                  style={{ width: "100%", padding: "7px 10px", fontSize: 12, fontWeight: 800, borderRadius: 6, border: "1px solid #93C5FD", background: "#FFFFFF" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#1E3A8A", display: "block", marginBottom: 3 }}>
                  Target (MT)
                </label>
                <input
                  type="number"
                  value={targetQtyMt}
                  onChange={(e) => setTargetQtyMt(e.target.value)}
                  style={{ width: "100%", padding: "7px 10px", fontSize: 12, fontWeight: 800, borderRadius: 6, border: "1px solid #93C5FD", background: "#FFFFFF" }}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Key Personnel & Contacts */}
          <div>
            <h4 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 800, color: "var(--ink)", borderBottom: "1px solid var(--line)", paddingBottom: 6 }}>
              👤 3. Plant Sourcing Representative & Contact
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 4 }}>
                  Plant Contact Person
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mr. S. K. Singh (Purchase Head)"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", fontSize: 12.5, borderRadius: 8, border: "1px solid var(--line-strong)" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 4 }}>
                  Contact Mobile Number
                </label>
                <input
                  type="text"
                  placeholder="10-digit mobile"
                  value={contactMobile}
                  onChange={(e) => setContactMobile(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", fontSize: 12.5, fontWeight: 700, borderRadius: 8, border: "1px solid var(--line-strong)" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 4 }}>
                  Official Email Address
                </label>
                <input
                  type="email"
                  placeholder="procurement.plant@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", fontSize: 12.5, borderRadius: 8, border: "1px solid var(--line-strong)" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 4 }}>
                  Purchase Order Reference
                </label>
                <input
                  type="text"
                  value={poNo}
                  onChange={(e) => setPoNo(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", fontSize: 12.5, borderRadius: 8, border: "1px solid var(--line-strong)" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 4 }}>
                  Payment Terms
                </label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", fontSize: 12.5, borderRadius: 8, border: "1px solid var(--line-strong)" }}
                >
                  <option value="Advance Payment">Advance Payment</option>
                  <option value="Net 7 Days">Net 7 Days</option>
                  <option value="Net 15 Days">Net 15 Days</option>
                  <option value="Net 30 Days">Net 30 Days</option>
                  <option value="On Delivery GRN">On Delivery GRN</option>
                </select>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, borderTop: "1px solid var(--line)", paddingTop: 14, marginTop: 6 }}>
            <button
              type="button"
              onClick={() => navigate("/biomass/buyers")}
              style={{ padding: "9px 18px", fontSize: 13, fontWeight: 700, borderRadius: 8, border: "1px solid var(--line)", background: "var(--surface)", cursor: "pointer" }}
            >
              Cancel
            </button>
            <Button
              type="submit"
              disabled={loading}
              style={{ padding: "9px 24px", fontSize: 13, fontWeight: 800, background: "#2563EB" }}
            >
              {loading ? "Saving…" : "💾 Save Industrial Buyer"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
