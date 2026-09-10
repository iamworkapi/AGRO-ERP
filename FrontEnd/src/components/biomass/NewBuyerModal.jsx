import { useState } from "react";
import Modal from "../common/Modal";
import FormField from "../common/FormField";
import Button from "../common/Button";
import { saveNewBuyer } from "../../features/biomass/biomassService";
import { toast } from "../../utils/toast";
import { isValidPhone, sanitizePhone } from "../../utils/phone";

export default function NewBuyerModal({ isOpen, onClose, onSaved }) {
  const [name, setName] = useState("");
  const [division, setDivision] = useState("");
  const [address, setAddress] = useState("");
  const [gstin, setGstin] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactMobile, setContactMobile] = useState("");
  const [email, setEmail] = useState("");
  const [plantType, setPlantType] = useState("Bio-Ethanol Plant");
  const [agreedRatePerMt, setAgreedRatePerMt] = useState("1850");

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter Buyer / Consignee Company Name.");
      return;
    }

    if (contactMobile && !isValidPhone(contactMobile)) {
      toast.error("Contact Mobile must be a valid 10-digit number.");
      return;
    }

    const newBuyer = {
      name: name.toUpperCase(),
      division: division || "BIO-ENERGY DIVISION",
      address: address || "UTTAR PRADESH",
      gstin: gstin.toUpperCase() || "09AAACR5055K2Z4",
      contactPerson,
      contactMobile: sanitizePhone(contactMobile),
      email,
      plantType,
      agreedRatePerMt: parseFloat(agreedRatePerMt) || 1850,
    };

    const updatedList = saveNewBuyer(newBuyer);
    onSaved?.(updatedList);
    toast.success(`New Industrial Buyer "${name}" added successfully!`);
    onClose?.();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register Industrial Buyer / Client"
      subtitle="Onboard a new Bio-Ethanol Plant, Power Plant, or Factory Consignee"
      icon="ri-user-star-line"
      width={600}
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Company Info */}
        <div style={{ background: "var(--canvas)", padding: "12px 14px", borderRadius: 10, border: "1px solid var(--line)" }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
            <i className="ri-building-line" /> Buyer Identity
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px 12px" }}>
            <FormField
              label="Company / Buyer Name"
              required
              layout="vertical"
              placeholder="e.g. BALRAMPUR CHINI MILLS LTD"
              value={name}
              onChange={setName}
              compact
              marginBottom={0}
            />
            <FormField
              label="Division / Unit"
              layout="vertical"
              placeholder="e.g. BIO-ENERGY DIVISION"
              value={division}
              onChange={setDivision}
              compact
              marginBottom={0}
            />
            <FormField
              label="GSTIN Number"
              layout="vertical"
              placeholder="e.g. 09AAACR5055K2Z4"
              value={gstin}
              onChange={(val) => setGstin((val || "").toUpperCase())}
              compact
              marginBottom={0}
            />
            <FormField
              label="Industry / Plant Type"
              layout="vertical"
              type="select"
              options={[
                "Bio-Ethanol Plant",
                "Thermal Power Plant",
                "Paper Mill Boiler",
                "CBG / Biogas Plant",
                "Cement Kiln Co-Firing",
                "Plywood / Biomass Boiler",
              ]}
              value={plantType}
              onChange={setPlantType}
              compact
              marginBottom={0}
            />
          </div>
        </div>

        {/* Contact Info */}
        <div style={{ background: "var(--canvas)", padding: "12px 14px", borderRadius: 10, border: "1px solid var(--line)" }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
            <i className="ri-contacts-line" /> Contact Person & Details
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px 12px" }}>
            <FormField
              label="Contact Person Name"
              layout="vertical"
              placeholder="e.g. Mr. Amit Verma (Purchase Head)"
              value={contactPerson}
              onChange={setContactPerson}
              compact
              marginBottom={0}
            />
            <FormField
              label="Contact Mobile (10 digits)"
              layout="vertical"
              type="tel"
              placeholder="10-digit mobile"
              value={contactMobile}
              onChange={setContactMobile}
              compact
              marginBottom={0}
            />
            <FormField
              label="Email Address"
              layout="vertical"
              type="email"
              placeholder="procurement@buyer.com"
              value={email}
              onChange={setEmail}
              compact
              marginBottom={0}
            />
            <FormField
              label="Agreed Rate (₹/MT)"
              layout="vertical"
              type="number"
              placeholder="1850"
              value={agreedRatePerMt}
              onChange={setAgreedRatePerMt}
              compact
              marginBottom={0}
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <FormField
            label="Plant / Delivery Address"
            layout="vertical"
            type="textarea"
            rows={2}
            placeholder="Plot No., Industrial Area, District, State"
            value={address}
            onChange={setAddress}
            compact
            marginBottom={0}
          />
        </div>

        {/* Sticky Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="btn-glow">
            Save Buyer Record
          </Button>
        </div>
      </form>
    </Modal>
  );
}
