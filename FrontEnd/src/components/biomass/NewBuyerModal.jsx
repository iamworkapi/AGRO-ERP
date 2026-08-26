import { useState } from "react";
import { saveNewBuyer } from "../../features/biomass/biomassService";
import { toast } from "../../utils/toast";

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

  if (!isOpen) return null;

  function handleSubmit(e) {
    e.preventDefault();
    if (!name) {
      toast.error("Please enter Buyer / Consignee Company Name");
      return;
    }

    const newBuyer = {
      name: name.toUpperCase(),
      division: division || "BIO-ENERGY DIVISION",
      address: address || "UTTAR PRADESH",
      gstin: gstin.toUpperCase() || "09AAACR5055K2Z4",
      contactPerson,
      contactMobile,
      email,
      plantType,
      agreedRatePerMt: parseFloat(agreedRatePerMt) || 1850,
    };

    const updatedList = saveNewBuyer(newBuyer);
    onSaved(updatedList);
    toast.success(`New Industrial Buyer "${name}" added successfully!`);
    onClose();
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--line-strong)",
          borderRadius: 16,
          width: "100%",
          maxWidth: 720,
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--line)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "var(--surface-tint)",
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "var(--ink)" }}>
              Register New Industrial Buyer / Client (जिसको माल बेचना है)
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--muted)" }}>
              Add a new Bio-Ethanol Plant, Power Plant, CBG Plant or Factory Consignee
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--muted)" }}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 3 }}>
                Company / Buyer Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. NTPC BIOMASS POWER LIMITED"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: "100%", padding: "7px 10px", fontSize: 12, fontWeight: 700, borderRadius: 6, border: "1px solid var(--line-strong)" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 3 }}>
                Division / Plant Name
              </label>
              <input
                type="text"
                placeholder="e.g. UNNAO BIO-ENERGY DIVISION"
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                style={{ width: "100%", padding: "7px 10px", fontSize: 12, fontWeight: 700, borderRadius: 6, border: "1px solid var(--line-strong)" }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 3 }}>
              Full Plant Delivery Address (as per Bill To) *
            </label>
            <input
              type="text"
              required
              placeholder="P.O., Village, Gata No., Tehsil, District, State, Pincode"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{ width: "100%", padding: "7px 10px", fontSize: 12, borderRadius: 6, border: "1px solid var(--line-strong)" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 3 }}>
                GSTIN Number *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 09AAACR5055K2Z4"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                style={{ width: "100%", padding: "7px 10px", fontSize: 12, fontWeight: 700, borderRadius: 6, border: "1px solid var(--line-strong)" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 3 }}>
                Plant Type
              </label>
              <select
                value={plantType}
                onChange={(e) => setPlantType(e.target.value)}
                style={{ width: "100%", padding: "7px 10px", fontSize: 12, borderRadius: 6, border: "1px solid var(--line-strong)" }}
              >
                <option value="Bio-Ethanol Plant">Bio-Ethanol Plant</option>
                <option value="Biomass Power Plant">Biomass Power Plant</option>
                <option value="CBG (Bio-Gas) Plant">CBG (Bio-Gas) Plant</option>
                <option value="Paper & Board Mill">Paper & Board Mill</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 3 }}>
                Agreed Rate (₹/MT)
              </label>
              <input
                type="number"
                value={agreedRatePerMt}
                onChange={(e) => setAgreedRatePerMt(e.target.value)}
                style={{ width: "100%", padding: "7px 10px", fontSize: 12, fontWeight: 700, borderRadius: 6, border: "1px solid var(--line-strong)" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 3 }}>
                Plant Contact Person
              </label>
              <input
                type="text"
                placeholder="e.g. Mr. S. K. Singh (Purchase Head)"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                style={{ width: "100%", padding: "7px 10px", fontSize: 12, borderRadius: 6, border: "1px solid var(--line-strong)" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 3 }}>
                Contact Mobile Number
              </label>
              <input
                type="text"
                placeholder="10-digit mobile"
                value={contactMobile}
                onChange={(e) => setContactMobile(e.target.value)}
                style={{ width: "100%", padding: "7px 10px", fontSize: 12, borderRadius: 6, border: "1px solid var(--line-strong)" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
            <button type="button" onClick={onClose} style={{ padding: "8px 16px", fontSize: 12.5, borderRadius: 8, border: "1px solid var(--line)" }}>
              Cancel
            </button>
            <button type="submit" style={{ padding: "8px 20px", fontSize: 12.5, fontWeight: 800, borderRadius: 8, border: "none", background: "#2563EB", color: "#fff", cursor: "pointer" }}>
              💾 Save Industrial Buyer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
