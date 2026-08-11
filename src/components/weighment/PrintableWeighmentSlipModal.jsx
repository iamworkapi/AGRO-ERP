import React from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { toast } from "../../utils/toast";

export default function PrintableWeighmentSlipModal({ isOpen, onClose, data }) {
  if (!isOpen || !data) return null;

  const grossKg = parseFloat(data.grossWeightKg || data.gross || 0);
  const tareKg = parseFloat(data.tareWeightKg || data.tare || 0);
  const netKg = Math.max(0, grossKg - tareKg);
  
  const grossMt = (grossKg / 1000).toFixed(3);
  const tareMt = (tareKg / 1000).toFixed(3);
  const netMt = (netKg / 1000).toFixed(3);

  const moisture = parseFloat(data.moisturePct || data.moisture || 0);
  const allowedMoisture = parseFloat(data.allowedMoisturePct || 20);
  const diffPct = Math.max(0, moisture - allowedMoisture);
  const dedPct = parseFloat(data.deductionPct !== undefined ? data.deductionPct : diffPct);
  
  const deductionKg = (netKg * dedPct) / 100;
  const deductionMt = (deductionKg / 1000).toFixed(3);
  const actualKg = Math.max(0, netKg - deductionKg);
  const actualMt = (actualKg / 1000).toFixed(3);

  const rate = parseFloat(data.ratePerMt || data.rate || 1900);
  const totalAmount = data.totalAmountRs !== undefined 
    ? parseFloat(data.totalAmountRs) 
    : Math.round((actualKg / 1000) * rate * 100) / 100;

  const centerName = data.warehouse || data.centreName || "Gorakhpur Purchase Center";
  const dateStr = data.createdAt || data.date || new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
  const slipNo = data.slipNo || "720";
  const partyName = data.partyName || data.party || "—";
  const vehicleNo = data.vehicleNo || "—";
  const commodity = data.commodity || "Maize";

  function handlePrint() {
    window.print();
  }

  function handleWhatsAppShare() {
    const text = 
      `🌾 *KUSUMGANGA AGRO SOLUTIONS PVT. LTD.* 🌾\n` +
      `🏢 *Center:* ${centerName}\n` +
      `📜 *Slip No:* ${slipNo}\n` +
      `📅 *Date:* ${dateStr}\n` +
      `🌾 *Commodity:* ${commodity}\n` +
      `👤 *Party:* ${partyName}\n` +
      `🚛 *Vehicle No:* ${vehicleNo}\n` +
      `-----------------------------------\n` +
      `⚖️ *Gross Weight:* ${grossMt} MT (${grossKg} kg)\n` +
      `⚖️ *Tare Weight:* ${tareMt} MT (${tareKg} kg)\n` +
      `⚖️ *Net Weight:* ${netMt} MT (${netKg} kg)\n` +
      `💧 *Moisture:* ${moisture}% (Allowed: ${allowedMoisture}%)\n` +
      `✂️ *Deduction:* ${dedPct}% (${deductionMt} MT)\n` +
      `⚖️ *Actual Payable Weight:* ${actualMt} MT\n` +
      `💰 *Rate:* ₹${rate.toLocaleString("en-IN")} / MT\n` +
      `💵 *TOTAL AMOUNT:* ₹${totalAmount.toLocaleString("en-IN")}\n` +
      `-----------------------------------\n` +
      `Thank you for doing business with us!`;

    let phone = prompt("WhatsApp send karne ke liye mobile number darj karein (with country code e.g. 919876543210):");
    let url = "";
    if (phone) {
      phone = phone.replace(/[^0-9]/g, "");
      url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`;
    } else {
      url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    }
    window.open(url, "_blank");
    toast.success("WhatsApp message window opened!");
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Weighment Slip Receipt & Print" maxWidth={680}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Printable Paper Slip Container */}
        <div id="printable-receipt-slip" className="printable-receipt-card" style={{
          background: "#ffffff",
          color: "#000000",
          border: "2px solid #1e293b",
          borderRadius: 4,
          padding: "20px 24px",
          fontFamily: "'Courier New', Courier, monospace, sans-serif",
          boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
          margin: "0 auto",
          width: "100%",
          maxWidth: 580,
          fontSize: 13,
          lineHeight: 1.5
        }}>
          {/* Header */}
          <div style={{ textAlign: "center", borderBottom: "2px solid #000", paddingBottom: 6, marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, textTransform: "uppercase", letterSpacing: 0.5, color: "#000" }}>
              KUSUMGANGA AGRO SOLUTIONS PVT. LTD.
            </h2>
            <div style={{
              background: "#000",
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              padding: "2px 8px",
              marginTop: 4,
              borderRadius: 2,
              display: "inline-block"
            }}>
              24-A, Sai Complex, Betiya Hata Gorakhpur (U.P.) 273001
            </div>
          </div>

          {/* Slip Fields Grid */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dotted #666", paddingBottom: 4 }}>
              <span><strong>Center:</strong> {centerName}</span>
              <span><strong>Date:</strong> {dateStr}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dotted #666", paddingBottom: 4 }}>
              <span><strong>No.:</strong> <span style={{ fontSize: 15, fontWeight: "bold" }}>{slipNo}</span></span>
              <span><strong>Commodity:</strong> {commodity}</span>
            </div>

            <div style={{ borderBottom: "1px dotted #666", paddingBottom: 4 }}>
              <strong>Name of Party:</strong> {partyName}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dotted #666", paddingBottom: 4 }}>
              <span><strong>Moisture (%):</strong> {moisture}%</span>
              <span><strong>Slip No.:</strong> {slipNo}</span>
            </div>

            <div style={{ borderBottom: "1px dotted #666", paddingBottom: 4 }}>
              <strong>Vehicle No.:</strong> {vehicleNo}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, borderBottom: "1px dotted #666", paddingBottom: 4 }}>
              <span><strong>Gross Weight:</strong> {grossMt} MT ({grossKg} kg)</span>
              <span><strong>Tare Weight:</strong> {tareMt} MT ({tareKg} kg)</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, borderBottom: "1px dotted #666", paddingBottom: 4 }}>
              <span><strong>Deduction ({dedPct}%):</strong> {deductionMt} MT ({deductionKg.toFixed(0)} kg)</span>
              <span><strong>Net Weight:</strong> {netMt} MT ({netKg} kg)</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, background: "#f8fafc", padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: 4 }}>
              <span><strong>Rate:</strong> ₹{rate.toLocaleString("en-IN")} / MT</span>
              <span style={{ fontSize: 14, fontWeight: "bold", color: "#047857" }}>
                <strong>Total Amount:</strong> ₹{totalAmount.toLocaleString("en-IN")}
              </span>
            </div>

            {/* Signature Blocks */}
            <div style={{
              display: "flex",
              justify: "space-between",
              alignItems: "flex-end",
              marginTop: 28,
              paddingTop: 8,
              fontSize: 11,
              fontWeight: 700
            }}>
              <div style={{ borderTop: "1px solid #000", width: 130, textAlign: "center", paddingTop: 4 }}>
                Sign. of Driver
              </div>
              <div style={{ borderTop: "1px solid #000", width: 110, textAlign: "center", paddingTop: 4 }}>
                Security
              </div>
              <div style={{ borderTop: "1px solid #000", width: 140, textAlign: "center", paddingTop: 4 }}>
                Sign. of Supervisor
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Toolbar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--line)", paddingTop: 12 }}>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={handleWhatsAppShare}
              style={{
                padding: "8px 16px",
                fontSize: 12.5,
                fontWeight: 700,
                borderRadius: 8,
                border: "1px solid #16a34a",
                background: "#25D366",
                color: "#ffffff",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 2px 8px rgba(37, 211, 102, 0.3)"
              }}
            >
              <i className="fa-brands fa-whatsapp" style={{ fontSize: 14 }} /> Share on WhatsApp
            </button>

            <Button
              onClick={handlePrint}
              style={{
                padding: "8px 18px",
                fontSize: 12.5,
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "var(--gradient-primary)",
                boxShadow: "0 4px 12px rgba(0, 184, 107, 0.3)"
              }}
            >
              <i className="fa-solid fa-print" /> Print Receipt Slip
            </Button>
          </div>
        </div>
      </div>

      {/* Print CSS Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-receipt-slip, #printable-receipt-slip * {
            visibility: visible !important;
          }
          #printable-receipt-slip {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            border: 2px solid #000 !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </Modal>
  );
}
