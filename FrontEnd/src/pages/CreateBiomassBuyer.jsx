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

  const inputStyle = {
    width: "100%",
    height: 38,
    padding: "0 12px 0 34px",
    fontSize: 12.5,
    borderRadius: 9,
    border: "1px solid var(--line-strong)",
    background: "var(--canvas)",
    color: "var(--ink)",
    outline: "none",
    transition: "all var(--transition-fast)",
  };

  const selectStyle = {
    width: "100%",
    height: 38,
    padding: "0 28px 0 34px",
    fontSize: 12.5,
    fontWeight: 600,
    borderRadius: 9,
    border: "1px solid var(--line-strong)",
    background: "var(--canvas)",
    color: "var(--ink)",
    outline: "none",
    cursor: "pointer",
    appearance: "none",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 960, margin: "0 auto", width: "100%" }}>
      {/* PAGE HEADER */}
      <PageHeader
        title="Register Industrial Offtake Buyer"
        subtitle="Onboard bio-ethanol plants, power plants, CBG facilities, or industrial factory consignees"
        icon="ri-building-4-line"
        badge="CONSIGNEE ONBOARDING"
      />

      <Card
        title="Industrial Buyer / Consignee Registration"
        subtitle="Complete the commercial and logistical profile for this factory offtaker"
        accent="#5DD62C"
      >
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {/* Section 1: Entity Name & Division */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, paddingBottom: 6, borderBottom: "1px solid var(--line)" }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: "var(--primary-tint)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800 }}>
                01
              </div>
              <h4 style={{ margin: 0, fontSize: 13.5, fontWeight: 800, color: "var(--ink)" }}>
                Plant &amp; Off-taker Profile
              </h4>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 5 }}>
                  Company / Buyer Name <span style={{ color: "var(--primary)" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <i className="ri-building-line" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontSize: 14 }} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. NTPC BIOMASS POWER LIMITED"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ ...inputStyle, fontWeight: 700 }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "var(--primary)";
                      e.target.style.background = "var(--surface)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "var(--line-strong)";
                      e.target.style.background = "var(--canvas)";
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 5 }}>
                  Division / Plant Name
                </label>
                <div style={{ position: "relative" }}>
                  <i className="ri-community-line" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontSize: 14 }} />
                  <input
                    type="text"
                    placeholder="e.g. UNNAO BIO-ENERGY DIVISION"
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    style={{ ...inputStyle, fontWeight: 700 }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "var(--primary)";
                      e.target.style.background = "var(--surface)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "var(--line-strong)";
                      e.target.style.background = "var(--canvas)";
                    }}
                  />
                </div>
              </div>

              <div style={{ gridColumn: "span 2" }}>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 5 }}>
                  Full Plant Delivery Address (as per Bill To) <span style={{ color: "var(--primary)" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <i className="ri-map-pin-line" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontSize: 14 }} />
                  <input
                    type="text"
                    required
                    placeholder="P.O., Village, Gata No., Tehsil, District, State, Pincode"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    style={inputStyle}
                    onFocus={(e) => {
                      e.target.style.borderColor = "var(--primary)";
                      e.target.style.background = "var(--surface)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "var(--line-strong)";
                      e.target.style.background = "var(--canvas)";
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Taxation, Plant Type & Commercial Off-take Rate */}
          <div
            style={{
              background: "linear-gradient(135deg, rgba(93, 214, 44, 0.05) 0%, rgba(93, 214, 44, 0.01) 100%)",
              border: "1px solid rgba(93, 214, 44, 0.25)",
              borderRadius: 14,
              padding: "16px 18px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(93, 214, 44, 0.2)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800 }}>
                02
              </div>
              <h4 style={{ margin: 0, fontSize: 13.5, fontWeight: 800, color: "var(--ink)" }}>
                Plant Category, Tax &amp; Commercial Pricing
              </h4>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.2fr 1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                  GSTIN Number <span style={{ color: "var(--primary)" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <i className="ri-file-shield-line" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontSize: 14 }} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. 09AAACR5055K2Z4"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    style={{ ...inputStyle, fontWeight: 800, fontFamily: "monospace", letterSpacing: 0.5 }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "var(--primary)";
                      e.target.style.background = "var(--surface)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "var(--line-strong)";
                      e.target.style.background = "var(--canvas)";
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                  Plant Facility Type
                </label>
                <div style={{ position: "relative" }}>
                  <i className="ri-factory-line" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontSize: 14 }} />
                  <select
                    value={plantType}
                    onChange={(e) => setPlantType(e.target.value)}
                    style={selectStyle}
                    onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--line-strong)")}
                  >
                    <option value="Bio-Ethanol Plant">Bio-Ethanol Plant</option>
                    <option value="CBG Plant / Ethanol Division">CBG Plant / Ethanol Division</option>
                    <option value="Biomass Power Plant">Biomass Power Plant</option>
                    <option value="Biomass Power Plant (Co-firing)">Biomass Power Plant (Co-firing)</option>
                    <option value="CBG & Bio-Energy Plant">CBG &amp; Bio-Energy Plant</option>
                    <option value="Pellet / Briquette Mill">Pellet / Briquette Mill</option>
                    <option value="Paper & Packaging Mill">Paper &amp; Packaging Mill</option>
                  </select>
                  <i className="ri-arrow-down-s-line" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--muted)", fontSize: 14 }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                  Agreed Rate (₹/MT)
                </label>
                <div style={{ position: "relative" }}>
                  <i className="ri-money-rupee-circle-line" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontSize: 14 }} />
                  <input
                    type="number"
                    value={agreedRatePerMt}
                    onChange={(e) => setAgreedRatePerMt(e.target.value)}
                    style={{ ...inputStyle, fontWeight: 800, color: "var(--primary)" }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "var(--primary)";
                      e.target.style.background = "var(--surface)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "var(--line-strong)";
                      e.target.style.background = "var(--canvas)";
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                  Target Volume (MT)
                </label>
                <div style={{ position: "relative" }}>
                  <i className="ri-scales-3-line" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontSize: 14 }} />
                  <input
                    type="number"
                    value={targetQtyMt}
                    onChange={(e) => setTargetQtyMt(e.target.value)}
                    style={{ ...inputStyle, fontWeight: 800 }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "var(--primary)";
                      e.target.style.background = "var(--surface)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "var(--line-strong)";
                      e.target.style.background = "var(--canvas)";
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Key Personnel & Contacts */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, paddingBottom: 6, borderBottom: "1px solid var(--line)" }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: "var(--primary-tint)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800 }}>
                03
              </div>
              <h4 style={{ margin: 0, fontSize: 13.5, fontWeight: 800, color: "var(--ink)" }}>
                Plant Sourcing Representative &amp; Commercial Terms
              </h4>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 5 }}>
                  Plant Contact Person
                </label>
                <div style={{ position: "relative" }}>
                  <i className="ri-user-3-line" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontSize: 14 }} />
                  <input
                    type="text"
                    placeholder="e.g. Mr. S. K. Singh (Purchase Head)"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    style={inputStyle}
                    onFocus={(e) => {
                      e.target.style.borderColor = "var(--primary)";
                      e.target.style.background = "var(--surface)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "var(--line-strong)";
                      e.target.style.background = "var(--canvas)";
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 5 }}>
                  Contact Mobile Number
                </label>
                <div style={{ position: "relative" }}>
                  <i className="ri-phone-line" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontSize: 14 }} />
                  <input
                    type="text"
                    placeholder="10-digit mobile"
                    value={contactMobile}
                    onChange={(e) => setContactMobile(e.target.value)}
                    style={{ ...inputStyle, fontWeight: 700 }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "var(--primary)";
                      e.target.style.background = "var(--surface)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "var(--line-strong)";
                      e.target.style.background = "var(--canvas)";
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 5 }}>
                  Official Email Address
                </label>
                <div style={{ position: "relative" }}>
                  <i className="ri-mail-line" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontSize: 14 }} />
                  <input
                    type="email"
                    placeholder="procurement.plant@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={inputStyle}
                    onFocus={(e) => {
                      e.target.style.borderColor = "var(--primary)";
                      e.target.style.background = "var(--surface)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "var(--line-strong)";
                      e.target.style.background = "var(--canvas)";
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 5 }}>
                  Purchase Order Reference
                </label>
                <div style={{ position: "relative" }}>
                  <i className="ri-file-list-3-line" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontSize: 14 }} />
                  <input
                    type="text"
                    value={poNo}
                    onChange={(e) => setPoNo(e.target.value)}
                    style={inputStyle}
                    onFocus={(e) => {
                      e.target.style.borderColor = "var(--primary)";
                      e.target.style.background = "var(--surface)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "var(--line-strong)";
                      e.target.style.background = "var(--canvas)";
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 5 }}>
                  Payment Terms
                </label>
                <div style={{ position: "relative" }}>
                  <i className="ri-hand-coin-line" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontSize: 14 }} />
                  <select
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    style={selectStyle}
                    onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--line-strong)")}
                  >
                    <option value="Advance Payment">Advance Payment</option>
                    <option value="Net 7 Days">Net 7 Days</option>
                    <option value="Net 15 Days">Net 15 Days</option>
                    <option value="Net 30 Days">Net 30 Days</option>
                    <option value="On Delivery GRN">On Delivery GRN</option>
                  </select>
                  <i className="ri-arrow-down-s-line" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--muted)", fontSize: 14 }} />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10, borderTop: "1px solid var(--line)", paddingTop: 16 }}>
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
            >
              Save Industrial Buyer
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
