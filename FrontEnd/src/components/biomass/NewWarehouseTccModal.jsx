import { useState } from "react";
import Modal from "../common/Modal";
import FormField from "../common/FormField";
import Button from "../common/Button";
import { toast } from "../../utils/toast";
import { isValidPhone, sanitizePhone } from "../../utils/phone";

export default function NewWarehouseTccModal({ isOpen, onClose, onSaved }) {
  const [name, setName] = useState("");
  const [code, setCode] = useState(`TCC-HUB-${Math.floor(10 + Math.random() * 90)}`);
  const [location, setLocation] = useState("Gorakhpur, Uttar Pradesh");
  const [sourcingArea, setSourcingArea] = useState("50-100 Surrounding Villages");
  const [totalCapacityMt, setTotalCapacityMt] = useState("12000");
  const [supervisorName, setSupervisorName] = useState("");
  const [supervisorPhone, setSupervisorPhone] = useState("");
  const [officialEmail, setOfficialEmail] = useState("");

  if (!isOpen) return null;

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter Warehouse / TCC Hub Name.");
      return;
    }

    if (supervisorPhone && !isValidPhone(supervisorPhone)) {
      toast.error("Supervisor Phone must be a valid 10-digit number.");
      return;
    }

    const newHub = {
      id: `TCC-${Date.now()}`,
      name: name.toUpperCase(),
      code: code.toUpperCase(),
      location,
      sourcingArea,
      totalCapacityMt: parseFloat(totalCapacityMt) || 12000,
      activeStockMt: 0,
      totalBalesCount: 0,
      activeStacks: 0,
      fireSafetyScore: "100% (New Active)",
      supervisorName: supervisorName || "Assigned Supervisor",
      supervisorPhone: sanitizePhone(supervisorPhone),
      officialEmail,
    };

    if (onSaved) onSaved(newHub);
    toast.success(`New Transit Collection Center "${name}" registered successfully!`);
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register Warehouse / TCC Hub"
      subtitle="Add a new biomass storage yard, assign supervisor, and configure depot capacity"
      icon="ri-building-2-line"
      width={600}
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Hub Specs */}
        <div style={{ background: "var(--canvas)", padding: "12px 14px", borderRadius: 10, border: "1px solid var(--line)" }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
            <i className="ri-building-line" /> Hub Information
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px 12px" }}>
            <FormField
              label="Warehouse / Hub Name"
              required
              layout="vertical"
              placeholder="e.g. BARABANKI TCC BIOMASS HUB"
              value={name}
              onChange={setName}
              compact
              marginBottom={0}
            />
            <FormField
              label="Hub Center Code"
              layout="vertical"
              placeholder="e.g. TCC-BARABANKI-02"
              value={code}
              onChange={(val) => setCode((val || "").toUpperCase())}
              compact
              marginBottom={0}
            />
            <FormField
              label="Location / District"
              layout="vertical"
              placeholder="e.g. Barabanki, Uttar Pradesh"
              value={location}
              onChange={setLocation}
              compact
              marginBottom={0}
            />
            <FormField
              label="Total Capacity (MT)"
              layout="vertical"
              type="number"
              placeholder="12000"
              value={totalCapacityMt}
              onChange={setTotalCapacityMt}
              compact
              marginBottom={0}
            />
          </div>
        </div>

        {/* Sourcing Area */}
        <div>
          <FormField
            label="Sourcing Area / Village Network Scope"
            layout="vertical"
            placeholder="e.g. Barabanki, Haidargarh & 80 Surrounding Villages"
            value={sourcingArea}
            onChange={setSourcingArea}
            compact
            marginBottom={0}
          />
        </div>

        {/* Supervisor Details */}
        <div style={{ background: "var(--canvas)", padding: "12px 14px", borderRadius: 10, border: "1px solid var(--line)" }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
            <i className="ri-user-settings-line" /> Assigned Supervisor Details
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px 12px" }}>
            <FormField
              label="Supervisor Name"
              layout="vertical"
              placeholder="e.g. Mr. Rajesh Sharma"
              value={supervisorName}
              onChange={setSupervisorName}
              compact
              marginBottom={0}
            />
            <FormField
              label="Supervisor Phone (10 digits)"
              layout="vertical"
              type="tel"
              placeholder="10-digit mobile"
              value={supervisorPhone}
              onChange={setSupervisorPhone}
              compact
              marginBottom={0}
            />
            <div style={{ gridColumn: "1 / -1" }}>
              <FormField
                label="Official Email"
                layout="vertical"
                type="email"
                placeholder="supervisor@kusumganga.com"
                value={officialEmail}
                onChange={setOfficialEmail}
                compact
                marginBottom={0}
              />
            </div>
          </div>
        </div>

        {/* Sticky Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="btn-glow">
            Save Warehouse Hub
          </Button>
        </div>
      </form>
    </Modal>
  );
}
