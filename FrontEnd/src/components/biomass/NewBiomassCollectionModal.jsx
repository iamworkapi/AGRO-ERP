import { useState } from "react";
import {
  CROPS_MASTER,
  getStoredVendors,
  calculateGrnInvoiceWeight,
} from "../../features/biomass/biomassService";
import { toast } from "../../utils/toast";

export default function NewBiomassCollectionModal({ isOpen, onClose, onSave }) {
  const vendors = getStoredVendors();
  const [selectedCropId, setSelectedCropId] = useState("maize_stalk");
  const [selectedVendorId, setSelectedVendorId] = useState(vendors[0]?.id || "");
  const [villageName, setVillageName] = useState("Kanujia Village");
  const [farmerName, setFarmerName] = useState("");
  const [farmerMobile, setFarmerMobile] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [vehicleType, setVehicleType] = useState("Tractor Trolley");

  // Weighbridge & Quality Parameters
  const [grossWeightMt, setGrossWeightMt] = useState("14.50");
  const [tareWeightMt, setTareWeightMt] = useState("4.50");
  const [actualMoisturePct, setActualMoisturePct] = useState("20");
  const [actualAshPct, setActualAshPct] = useState("22");
  const [agreedMoisturePct, setAgreedMoisturePct] = useState("20");
  const [agreedAshPct, setAgreedAshPct] = useState("20");
  const [balerMachine, setBalerMachine] = useState("High Density Baler HDB-01");
  const [baleCount, setBaleCount] = useState("300");

  if (!isOpen) return null;

  const currentCrop = CROPS_MASTER.find((c) => c.id === selectedCropId) || CROPS_MASTER[0];
  const currentVendor = vendors.find((v) => v.id === selectedVendorId) || vendors[0];

  const grossMt = parseFloat(grossWeightMt) || 0;
  const tareMt = parseFloat(tareWeightMt) || 0;
  const actualNetMt = Math.max(0, grossMt - tareMt);

  // Calculate GRN Invoice Claimable Weight using Image 2 / PDF Formula
  const grnResult = calculateGrnInvoiceWeight({
    actualWeightMt: actualNetMt,
    actualMoisturePct: parseFloat(actualMoisturePct) || 20,
    actualAshPct: parseFloat(actualAshPct) || 20,
    agreedMoisturePct: parseFloat(agreedMoisturePct) || 20,
    agreedAshPct: parseFloat(agreedAshPct) || 20,
  });

  const rateMt = currentCrop.defaultRateMt || 1400;
  const totalAmountRs = grnResult.isRejected ? 0 : Math.round(grnResult.invoiceWeightMt * rateMt);

  function handleSubmit(e) {
    e.preventDefault();
    if (!farmerName) {
      toast.error("Please enter Farmer / Aggregator Name");
      return;
    }
    if (!vehicleNo) {
      toast.error("Please enter Vehicle Number");
      return;
    }

    if (grnResult.isRejected) {
      if (!confirm(`Warning: ${grnResult.rejectionReason} Do you still wish to submit as REJECTED entry?`)) {
        return;
      }
    }

    const payload = {
      cropId: currentCrop.id,
      cropName: currentCrop.name,
      vendorId: currentVendor.id,
      vendorName: currentVendor.companyName,
      villageName,
      farmerName,
      farmerMobile,
      vehicleNo: vehicleNo.toUpperCase(),
      vehicleType,
      grossWeightMt: grossMt,
      tareWeightMt: tareMt,
      actualNetWeightMt: actualNetMt,
      actualMoisturePct: parseFloat(actualMoisturePct) || 20,
      actualAshPct: parseFloat(actualAshPct) || 20,
      agreedMoisturePct: parseFloat(agreedMoisturePct) || 20,
      agreedAshPct: parseFloat(agreedAshPct) || 20,
      invoiceWeightMt: grnResult.invoiceWeightMt,
      ratePerMt: rateMt,
      totalAmountRs,
      balerMachine,
      baleCountProduced: parseInt(baleCount, 10) || 0,
      stackAssigned: `STACK-${currentCrop.id.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
    };

    onSave(payload);
    toast.success("New raw straw collection slip recorded!");
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
          maxWidth: 780,
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
              New Raw Biomass Entry & Weighbridge Slip (Stage 1 & 2)
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--muted)" }}>
              Record collection gate entry, calculate GRN moisture/ash invoice weight & assign baling
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 20,
              cursor: "pointer",
              color: "var(--muted)",
            }}
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Crop & Vendor Selection */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 4 }}>
                1. Select Biomass Commodity (फसल अवशेष) *
              </label>
              <select
                value={selectedCropId}
                onChange={(e) => setSelectedCropId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  fontSize: 12.5,
                  fontWeight: 700,
                  borderRadius: 8,
                  border: "1px solid var(--line-strong)",
                  background: "var(--surface)",
                  color: "var(--ink)",
                }}
              >
                {CROPS_MASTER.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (Agreed Rate: ₹{c.defaultRateMt}/MT)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 4 }}>
                2. Vendor Company (जहाँ से माल लिया है) *
              </label>
              <select
                value={selectedVendorId}
                onChange={(e) => setSelectedVendorId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  fontSize: 12.5,
                  fontWeight: 700,
                  borderRadius: 8,
                  border: "1px solid var(--line-strong)",
                  background: "var(--surface)",
                  color: "var(--ink)",
                }}
              >
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.companyName} ({v.vendorCode} — {v.representative})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Farmer & Transport Details */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 3 }}>
                Village Name (गाँव)
              </label>
              <input
                type="text"
                value={villageName}
                onChange={(e) => setVillageName(e.target.value)}
                placeholder="e.g. Kanujia Village"
                style={{ width: "100%", padding: "7px 10px", fontSize: 12, borderRadius: 6, border: "1px solid var(--line-strong)" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 3 }}>
                Farmer / Aggregator Name *
              </label>
              <input
                type="text"
                required
                value={farmerName}
                onChange={(e) => setFarmerName(e.target.value)}
                placeholder="e.g. Ramswaroop Yadav"
                style={{ width: "100%", padding: "7px 10px", fontSize: 12, borderRadius: 6, border: "1px solid var(--line-strong)" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 3 }}>
                Mobile Number
              </label>
              <input
                type="text"
                value={farmerMobile}
                onChange={(e) => setFarmerMobile(e.target.value)}
                placeholder="10-digit mobile"
                style={{ width: "100%", padding: "7px 10px", fontSize: 12, borderRadius: 6, border: "1px solid var(--line-strong)" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 3 }}>
                Vehicle No. *
              </label>
              <input
                type="text"
                required
                value={vehicleNo}
                onChange={(e) => setVehicleNo(e.target.value)}
                placeholder="e.g. UP 32 AT 8841"
                style={{ width: "100%", padding: "7px 10px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", borderRadius: 6, border: "1px solid var(--line-strong)" }}
              />
            </div>
          </div>

          {/* Weighbridge & Quality Parameters Section (Image 2 Formula) */}
          <div style={{ background: "#F8FAFC", border: "1px solid #CBD5E1", borderRadius: 10, padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 12.5, fontWeight: 800, color: "#0F172A", textTransform: "uppercase", letterSpacing: 0.5 }}>
                Stage 2: Weighbridge & Lab Quality Test (Image 2 GRN Formula)
              </span>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#64748B" }}>
                Formula: Actual Weight × (100% - Moist% - Ash%) / (100% - AgreedMoist% - AgreedAsh%)
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
              <div>
                <label style={{ fontSize: 10.5, fontWeight: 700, color: "#475569" }}>Gross (MT)</label>
                <input
                  type="number"
                  step="0.01"
                  value={grossWeightMt}
                  onChange={(e) => setGrossWeightMt(e.target.value)}
                  style={{ width: "100%", padding: "6px", fontSize: 12, fontWeight: 700, borderRadius: 6, border: "1px solid #94A3B8" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 10.5, fontWeight: 700, color: "#475569" }}>Tare (MT)</label>
                <input
                  type="number"
                  step="0.01"
                  value={tareWeightMt}
                  onChange={(e) => setTareWeightMt(e.target.value)}
                  style={{ width: "100%", padding: "6px", fontSize: 12, fontWeight: 700, borderRadius: 6, border: "1px solid #94A3B8" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 10.5, fontWeight: 700, color: "#475569" }}>Actual Moist %</label>
                <input
                  type="number"
                  step="0.1"
                  value={actualMoisturePct}
                  onChange={(e) => setActualMoisturePct(e.target.value)}
                  style={{ width: "100%", padding: "6px", fontSize: 12, fontWeight: 700, borderRadius: 6, border: "1px solid #94A3B8" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 10.5, fontWeight: 700, color: "#475569" }}>Actual Ash %</label>
                <input
                  type="number"
                  step="0.1"
                  value={actualAshPct}
                  onChange={(e) => setActualAshPct(e.target.value)}
                  style={{ width: "100%", padding: "6px", fontSize: 12, fontWeight: 700, borderRadius: 6, border: "1px solid #94A3B8" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 10.5, fontWeight: 700, color: "#475569" }}>Agreed Moist%</label>
                <input
                  type="number"
                  step="0.1"
                  value={agreedMoisturePct}
                  onChange={(e) => setAgreedMoisturePct(e.target.value)}
                  style={{ width: "100%", padding: "6px", fontSize: 12, borderRadius: 6, border: "1px solid #94A3B8" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 10.5, fontWeight: 700, color: "#475569" }}>Agreed Ash%</label>
                <input
                  type="number"
                  step="0.1"
                  value={agreedAshPct}
                  onChange={(e) => setAgreedAshPct(e.target.value)}
                  style={{ width: "100%", padding: "6px", fontSize: 12, borderRadius: 6, border: "1px solid #94A3B8" }}
                />
              </div>
            </div>

            {/* Real-time Calculation Result Box */}
            <div
              style={{
                marginTop: 10,
                padding: "10px 14px",
                borderRadius: 8,
                background: grnResult.isRejected ? "#FEE2E2" : "#ECFDF5",
                border: grnResult.isRejected ? "1px solid #EF4444" : "1px solid #10B981",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {grnResult.isRejected ? (
                <div style={{ color: "#991B1B", fontSize: 12, fontWeight: 700 }}>
                  🚨 <strong>VEHICLE REJECTED:</strong> {grnResult.rejectionReason}
                </div>
              ) : (
                <>
                  <div>
                    <div style={{ fontSize: 11, color: "#065F46", fontWeight: 700 }}>
                      Actual Net Wt: <strong>{actualNetMt.toFixed(2)} MT</strong> | Formula Ratio: <strong>{grnResult.ratioMultiplier}</strong>
                    </div>
                    <div style={{ fontSize: 13, color: "#047857", fontWeight: 900, marginTop: 2 }}>
                      Invoice Claimable Weight: {grnResult.invoiceWeightMt} MT (Deduction: {grnResult.deductionMt} MT)
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 10.5, color: "#065F46", fontWeight: 700 }}>Rate: ₹{rateMt}/MT</div>
                    <div style={{ fontSize: 15, color: "#065F46", fontWeight: 900 }}>Total Payable: ₹{totalAmountRs.toLocaleString("en-IN")}</div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Baler Machine & Packing */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 4 }}>
                Baler Machine Assigned
              </label>
              <select
                value={balerMachine}
                onChange={(e) => setBalerMachine(e.target.value)}
                style={{ width: "100%", padding: "7px 10px", fontSize: 12, borderRadius: 6, border: "1px solid var(--line-strong)" }}
              >
                <option value="High Density Baler HDB-01">High Density Baler HDB-01 (Square Bales)</option>
                <option value="Square Baler SB-02">Square Baler SB-02 (Medium Bales)</option>
                <option value="Round Baler RB-03">Round Baler RB-03 (Stem Round Bales)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 4 }}>
                Total Bales Produced (संख्या)
              </label>
              <input
                type="number"
                value={baleCount}
                onChange={(e) => setBaleCount(e.target.value)}
                placeholder="e.g. 300 bales"
                style={{ width: "100%", padding: "7px 10px", fontSize: 12, fontWeight: 700, borderRadius: 6, border: "1px solid var(--line-strong)" }}
              />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "8px 16px",
                fontSize: 12.5,
                fontWeight: 700,
                borderRadius: 8,
                border: "1px solid var(--line)",
                background: "var(--surface)",
                cursor: "pointer",
              }}
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
              ✓ Save Collection Entry & Print Slip
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
