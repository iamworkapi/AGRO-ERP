import { useState } from "react";
import Modal from "../common/Modal";
import FormField from "../common/FormField";
import Button from "../common/Button";
import { saveNewVendor } from "../../features/biomass/biomassService";
import { toast } from "../../utils/toast";
import { isValidPhone, sanitizePhone } from "../../utils/phone";

export default function NewVendorModal({ isOpen, onClose, onSaved }) {
  const [companyName, setCompanyName] = useState("");
  const [gstin, setGstin] = useState("");
  const [representative, setRepresentative] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [sourcingArea, setSourcingArea] = useState("");
  const [poNo, setPoNo] = useState(`2026050${Math.floor(3 + Math.random() * 9)}`);
  const [poDate, setPoDate] = useState(new Date().toISOString().slice(0, 10));
  const [tenure, setTenure] = useState("30.05.2026 to 30.09.2026");
  const [contractedQtyMt, setContractedQtyMt] = useState("1000");
  const [agreedPricePerMt, setAgreedPricePerMt] = useState("1400");

  function handleSubmit(e) {
    e.preventDefault();
    if (!companyName.trim()) {
      toast.error("Please enter Vendor Company Name.");
      return;
    }

    if (contactNo && !isValidPhone(contactNo)) {
      toast.error("Contact Mobile must be a valid 10-digit number.");
      return;
    }

    const newVendor = {
      companyName: companyName.toUpperCase(),
      gstin: gstin.toUpperCase() || "09AAAAA0000A1Z5",
      representative,
      contactNo: sanitizePhone(contactNo),
      email,
      address,
      sourcingArea: sourcingArea || "Unnao & Surrounding Villages",
      poNo,
      poDate,
      tenure,
      contractedQtyMt: parseFloat(contractedQtyMt) || 1000,
      agreedPricePerMt: parseFloat(agreedPricePerMt) || 1400,
    };

    const updatedList = saveNewVendor(newVendor);
    onSaved?.(updatedList);
    toast.success(`New Raw Material Vendor "${companyName}" added successfully!`);
    onClose?.();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register New Raw Material Vendor"
      subtitle="Onboard a new raw straw supplier, procurement contractor, or farmer producer collective"
      icon="ri-user-add-line"
      width={600}
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Basic Identification */}
        <div style={{ background: "var(--canvas)", padding: "12px 14px", borderRadius: 10, border: "1px solid var(--line)" }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
            <i className="ri-building-line" /> Vendor Details
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px 12px" }}>
            <FormField
              label="Vendor Company Name"
              required
              layout="vertical"
              placeholder="e.g. SHREE RAM BIOMASS CONTRACTOR"
              value={companyName}
              onChange={setCompanyName}
              compact
              marginBottom={0}
            />
            <FormField
              label="GSTIN Number"
              layout="vertical"
              placeholder="e.g. 09IYZPS0291E1ZK"
              value={gstin}
              onChange={(val) => setGstin((val || "").toUpperCase())}
              compact
              marginBottom={0}
            />
          </div>
        </div>

        {/* Contact Info */}
        <div style={{ background: "var(--canvas)", padding: "12px 14px", borderRadius: 10, border: "1px solid var(--line)" }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
            <i className="ri-contacts-line" /> Contact Information
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px 12px" }}>
            <FormField
              label="Representative Name"
              layout="vertical"
              placeholder="e.g. Mr. Bhanu Singh"
              value={representative}
              onChange={setRepresentative}
              compact
              marginBottom={0}
            />
            <FormField
              label="Contact Mobile (10 digits)"
              layout="vertical"
              type="tel"
              placeholder="10-digit mobile"
              value={contactNo}
              onChange={setContactNo}
              compact
              marginBottom={0}
            />
            <FormField
              label="Email Address"
              layout="vertical"
              type="email"
              placeholder="vendor@email.com"
              value={email}
              onChange={setEmail}
              compact
              marginBottom={0}
            />
            <FormField
              label="Sourcing Area"
              layout="vertical"
              placeholder="e.g. Unnao & Surrounding Villages"
              value={sourcingArea}
              onChange={setSourcingArea}
              compact
              marginBottom={0}
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <FormField
            label="Full Office Address"
            layout="vertical"
            type="textarea"
            rows={2}
            placeholder="Colony, Tehsil, District, State, Pincode"
            value={address}
            onChange={setAddress}
            compact
            marginBottom={0}
          />
        </div>

        {/* Commercial & PO Terms */}
        <div style={{ background: "var(--canvas)", border: "1px solid var(--line)", borderRadius: 10, padding: "12px 14px" }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
            <i className="ri-file-list-3-line" /> PO Contract & Pricing Terms
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "10px 12px" }}>
            <FormField
              label="PO Number"
              layout="vertical"
              value={poNo}
              onChange={setPoNo}
              compact
              marginBottom={0}
            />
            <FormField
              label="Supply Tenure"
              layout="vertical"
              value={tenure}
              onChange={setTenure}
              compact
              marginBottom={0}
            />
            <FormField
              label="Qty (MT)"
              layout="vertical"
              type="number"
              value={contractedQtyMt}
              onChange={setContractedQtyMt}
              compact
              marginBottom={0}
            />
            <FormField
              label="Price (₹/MT)"
              layout="vertical"
              type="number"
              value={agreedPricePerMt}
              onChange={setAgreedPricePerMt}
              compact
              marginBottom={0}
            />
          </div>
        </div>

        {/* Sticky Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="btn-glow">
            Save New Vendor
          </Button>
        </div>
      </form>
    </Modal>
  );
}
