import { useState } from "react";
import {
  CROPS_MASTER,
  getStoredBuyers,
  saveNewBuyer,
} from "../biomassService";
import { toast } from "../../../utils/toast";

export default function NewBiomassDispatchModal({ isOpen, onClose, onSave }) {
  const [buyersList, setBuyersList] = useState(getStoredBuyers);
  const [selectedBuyerId, setSelectedBuyerId] = useState(buyersList[0]?.id || "");
  const [showAddBuyerForm, setShowAddBuyerForm] = useState(false);

  // New Buyer Form Inputs
  const [newBuyerName, setNewBuyerName] = useState("");
  const [newBuyerDivision, setNewBuyerDivision] = useState("");
  const [newBuyerAddress, setNewBuyerAddress] = useState("");
  const [newBuyerGstin, setNewBuyerGstin] = useState("");
  const [newBuyerContact, setNewBuyerContact] = useState("");
  const [newBuyerMobile, setNewBuyerMobile] = useState("");

  // Dispatch Logistics Inputs
  const [cropId, setCropId] = useState("maize_stalk");
  const [vehicleNo, setVehicleNo] = useState("UP 32 ET 9920");
  const [vehicleType, setVehicleType] = useState("Heavy 14-Wheeler Trailer");
  const [driverName, setDriverName] = useState("Sukhwinder Singh");
  const [driverPhone, setDriverPhone] = useState("9812345678");
  const [baleCount, setBaleCount] = useState("650");
  const [dispatchedTonnageMt, setDispatchedTonnageMt] = useState("19.50");
  const [agreedPriceMt, setAgreedPriceMt] = useState("1850");
  const [ewayBillNo, setEwayBillNo] = useState(`2210${Math.floor(100000 + Math.random() * 900000)}`);

  if (!isOpen) return null;

  const currentCrop = CROPS_MASTER.find((c) => c.id === cropId) || CROPS_MASTER[0];
  const selectedBuyer = buyersList.find((b) => b.id === selectedBuyerId) || buyersList[0];

  const tonnage = parseFloat(dispatchedTonnageMt) || 0;
  const rate = parseFloat(agreedPriceMt) || selectedBuyer?.agreedRatePerMt || 1850;
  const totalInvoiceAmt = Math.round(tonnage * rate);

  function handleSaveCustomBuyer(e) {
    e.preventDefault();
    if (!newBuyerName) {
      toast.error("Please enter Buyer / Company Name");
      return;
    }
    const created = saveNewBuyer({
      name: newBuyerName.toUpperCase(),
      division: newBuyerDivision,
      address: newBuyerAddress,
      gstin: newBuyerGstin.toUpperCase(),
      contactPerson: newBuyerContact,
      contactMobile: newBuyerMobile,
      plantType: "Bio-Ethanol / Power Plant",
      agreedRatePerMt: rate,
    });
    setBuyersList(created);
    setSelectedBuyerId(created[0].id);
    setShowAddBuyerForm(false);
    toast.success(`New Buyer "${newBuyerName}" saved successfully!`);
    // Reset add buyer fields
    setNewBuyerName("");
    setNewBuyerDivision("");
    setNewBuyerAddress("");
    setNewBuyerGstin("");
  }

  function handleSubmitDispatch(e) {
    e.preventDefault();
    if (!vehicleNo) {
      toast.error("Please enter Vehicle / Heavy Trailer Number");
      return;
    }

    const payload = {
      buyerId: selectedBuyer.id,
      buyerName: selectedBuyer.name,
      division: selectedBuyer.division,
      address: selectedBuyer.address,
      gstin: selectedBuyer.gstin,
      destination: `${selectedBuyer.name}, ${selectedBuyer.division}`,
      vehicleNo: vehicleNo.toUpperCase(),
      vehicleType,
      driverName,
      driverPhone,
      cropName: currentCrop.name,
      baleCount: parseInt(baleCount, 10) || 0,
      dispatchedTonnageMt: tonnage,
      agreedPriceMt: rate,
      totalInvoiceAmount: totalInvoiceAmt,
      ewayBillNo,
    };

    onSave(payload);
    toast.success("Factory Dispatch Gate Pass generated!");
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
          maxWidth: 820,
          maxHeight: "92vh",
          overflowY: "auto",
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
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
              🚚 Stage 4: New Industrial Dispatch Gate Pass (आगे फ़ैक्ट्री भेजना)
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--muted)" }}>
              Select saved buyer (Reliance / Balrampur) or create a new buyer company & issue Gate Pass
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--muted)" }}>
            ✕
          </button>
        </div>

        <div style={{ padding: 20 }}>
          {/* BUYER SELECTOR BAR & ADD NEW BUYER BUTTON */}
          <div style={{ background: "#F1F5F9", border: "1px solid #CBD5E1", borderRadius: 10, padding: 14, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 800, color: "#0F172A", textTransform: "uppercase" }}>
                1. Buyer Selection (जिस फ़ैक्ट्री / कंपनी को माल दे रहे हैं) *
              </label>
              <button
                type="button"
                onClick={() => setShowAddBuyerForm(!showAddBuyerForm)}
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: "#2563EB",
                  background: "#EFF6FF",
                  border: "1px solid #BFDBFE",
                  padding: "4px 10px",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                {showAddBuyerForm ? "✕ Close New Buyer Form" : "➕ Add / Save Another Buyer"}
              </button>
            </div>

            {!showAddBuyerForm ? (
              <div>
                <select
                  value={selectedBuyerId}
                  onChange={(e) => setSelectedBuyerId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    fontSize: 13,
                    fontWeight: 700,
                    borderRadius: 8,
                    border: "1px solid #94A3B8",
                    background: "#FFFFFF",
                    color: "#0F172A",
                  }}
                >
                  {buyersList.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} — {b.division} (GSTIN: {b.gstin})
                    </option>
                  ))}
                </select>

                {selectedBuyer && (
                  <div style={{ marginTop: 10, background: "#FFFFFF", padding: 10, borderRadius: 6, border: "1px solid #E2E8F0", fontSize: 11.5, color: "#334155" }}>
                    <div style={{ fontWeight: 800, color: "#0F172A" }}>{selectedBuyer.name} ({selectedBuyer.division})</div>
                    <div style={{ color: "#475569", marginTop: 2 }}>📍 {selectedBuyer.address}</div>
                    <div style={{ fontWeight: 700, color: "#2563EB", marginTop: 2 }}>GSTIN: {selectedBuyer.gstin}</div>
                  </div>
                )}
              </div>
            ) : (
              /* DYNAMIC ADD ANOTHER BUYER FORM */
              <div style={{ background: "#FFFFFF", padding: 14, borderRadius: 8, border: "1px solid #93C5FD", marginTop: 8 }}>
                <h4 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 800, color: "#1E40AF" }}>
                  📝 Register New Buyer / Client (जिसको माल बेचना है)
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 10.5, fontWeight: 700, color: "#334155" }}>Company / Buyer Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. NTPC BIOMASS POWER LTD"
                      value={newBuyerName}
                      onChange={(e) => setNewBuyerName(e.target.value)}
                      style={{ width: "100%", padding: 6, fontSize: 12, borderRadius: 6, border: "1px solid #94A3B8" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 10.5, fontWeight: 700, color: "#334155" }}>Division / Plant Name</label>
                    <input
                      type="text"
                      placeholder="e.g. UNNAO BIO-POWER DIVISION"
                      value={newBuyerDivision}
                      onChange={(e) => setNewBuyerDivision(e.target.value)}
                      style={{ width: "100%", padding: 6, fontSize: 12, borderRadius: 6, border: "1px solid #94A3B8" }}
                    />
                  </div>
                  <div style={{ gridColumn: "span 2" }}>
                    <label style={{ fontSize: 10.5, fontWeight: 700, color: "#334155" }}>Full Plant Delivery Address</label>
                    <input
                      type="text"
                      placeholder="Village, Tehsil, District, State, Pincode"
                      value={newBuyerAddress}
                      onChange={(e) => setNewBuyerAddress(e.target.value)}
                      style={{ width: "100%", padding: 6, fontSize: 12, borderRadius: 6, border: "1px solid #94A3B8" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 10.5, fontWeight: 700, color: "#334155" }}>GSTIN Number *</label>
                    <input
                      type="text"
                      placeholder="e.g. 09AAACR5055K2Z4"
                      value={newBuyerGstin}
                      onChange={(e) => setNewBuyerGstin(e.target.value)}
                      style={{ width: "100%", padding: 6, fontSize: 12, fontWeight: 700, borderRadius: 6, border: "1px solid #94A3B8" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 10.5, fontWeight: 700, color: "#334155" }}>Contact Mobile</label>
                    <input
                      type="text"
                      placeholder="Contact number"
                      value={newBuyerMobile}
                      onChange={(e) => setNewBuyerMobile(e.target.value)}
                      style={{ width: "100%", padding: 6, fontSize: 12, borderRadius: 6, border: "1px solid #94A3B8" }}
                    />
                  </div>
                </div>
                <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setShowAddBuyerForm(false)}
                    style={{ padding: "5px 10px", fontSize: 11.5, borderRadius: 6, border: "1px solid #CBD5E1" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCustomBuyer}
                    style={{ padding: "5px 14px", fontSize: 11.5, fontWeight: 700, borderRadius: 6, background: "#2563EB", color: "#fff", border: "none" }}
                  >
                    💾 Save & Select New Buyer
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* DISPATCH LOGISTICS FORM */}
          <form onSubmit={handleSubmitDispatch} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 3 }}>
                  Commodity Being Dispatched
                </label>
                <select
                  value={cropId}
                  onChange={(e) => setCropId(e.target.value)}
                  style={{ width: "100%", padding: "7px 10px", fontSize: 12, fontWeight: 700, borderRadius: 6, border: "1px solid var(--line-strong)" }}
                >
                  {CROPS_MASTER.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 3 }}>
                  Heavy Trailer / Truck No. *
                </label>
                <input
                  type="text"
                  required
                  value={vehicleNo}
                  onChange={(e) => setVehicleNo(e.target.value)}
                  placeholder="e.g. UP 32 ET 9920"
                  style={{ width: "100%", padding: "7px 10px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", borderRadius: 6, border: "1px solid var(--line-strong)" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 3 }}>
                  Driver Name & Mobile
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="Driver Name"
                    style={{ width: "100%", padding: "6px", fontSize: 11.5, borderRadius: 6, border: "1px solid var(--line-strong)" }}
                  />
                  <input
                    type="text"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    placeholder="Phone"
                    style={{ width: "100%", padding: "6px", fontSize: 11.5, borderRadius: 6, border: "1px solid var(--line-strong)" }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 3 }}>
                  Loaded Bale Count (संख्या)
                </label>
                <input
                  type="number"
                  value={baleCount}
                  onChange={(e) => setBaleCount(e.target.value)}
                  style={{ width: "100%", padding: "7px 10px", fontSize: 12, fontWeight: 700, borderRadius: 6, border: "1px solid var(--line-strong)" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 3 }}>
                  Dispatched Tonnage (MT) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={dispatchedTonnageMt}
                  onChange={(e) => setDispatchedTonnageMt(e.target.value)}
                  style={{ width: "100%", padding: "7px 10px", fontSize: 12, fontWeight: 800, borderRadius: 6, border: "1px solid var(--line-strong)" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 3 }}>
                  Contracted Rate (₹/MT)
                </label>
                <input
                  type="number"
                  value={agreedPriceMt}
                  onChange={(e) => setAgreedPriceMt(e.target.value)}
                  style={{ width: "100%", padding: "7px 10px", fontSize: 12, fontWeight: 700, borderRadius: 6, border: "1px solid var(--line-strong)" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 3 }}>
                  E-Way Bill Number
                </label>
                <input
                  type="text"
                  value={ewayBillNo}
                  onChange={(e) => setEwayBillNo(e.target.value)}
                  style={{ width: "100%", padding: "7px 10px", fontSize: 12, fontFamily: "monospace", borderRadius: 6, border: "1px solid var(--line-strong)" }}
                />
              </div>
            </div>

            {/* Total Billing Box */}
            <div style={{ background: "#ECFDF5", border: "1px solid #10B981", padding: "12px 16px", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#065F46", textTransform: "uppercase" }}>Estimated Commercial Value:</span>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#047857" }}>₹{totalInvoiceAmt.toLocaleString("en-IN")}</div>
              </div>
              <div style={{ fontSize: 11.5, color: "#065F46", textAlign: "right" }}>
                <div>Tonnage: <strong>{tonnage} MT</strong> @ ₹{rate}/MT</div>
                <div>HSN Code: <strong>1213 00 00 (0% GST)</strong></div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
              <button
                type="button"
                onClick={onClose}
                style={{ padding: "8px 16px", fontSize: 12.5, fontWeight: 700, borderRadius: 8, border: "1px solid var(--line)", background: "var(--surface)", cursor: "pointer" }}
              >
                Cancel
              </button>

              <button
                type="submit"
                style={{
                  padding: "8px 20px",
                  fontSize: 12.5,
                  fontWeight: 800,
                  borderRadius: 8,
                  border: "none",
                  background: "var(--gradient-primary)",
                  color: "#fff",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(0, 184, 107, 0.3)",
                }}
              >
                🚚 Generate Factory Gate Pass
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
