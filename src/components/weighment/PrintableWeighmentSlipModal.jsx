import React, { useState, useRef } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { toast } from "../../utils/toast";

export default function PrintableWeighmentSlipModal({ isOpen, onClose, data }) {
  const [phone, setPhone] = useState("");
  const [copied, setCopied] = useState(false);
  const iframeRef = useRef(null);

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
  const commodity = data.commodity || "PRALLI";

  const whatsappMessageText =
    `🌾 *KUSUMGANGA AGRO SOLUTIONS PVT. LTD.* 🌾\n` +
    `🏢 *Center:* ${centerName}\n` +
    `📜 *RST / Slip No:* ${slipNo}\n` +
    `📅 *Date:* ${dateStr}\n` +
    `🌾 *Commodity:* ${commodity}\n` +
    `👤 *Party / Farmer:* ${partyName}\n` +
    `🚛 *Vehicle No:* ${vehicleNo}\n` +
    `-----------------------------------\n` +
    `⚖️ *Gross Weight:* ${grossMt} MT (${grossKg.toLocaleString()} kg)\n` +
    `⚖️ *Tare Weight:* ${tareMt} MT (${tareKg.toLocaleString()} kg)\n` +
    `⚖️ *Net Weight:* ${netMt} MT (${netKg.toLocaleString()} kg)\n` +
    `💧 *Moisture:* ${moisture}% (Allowed: ${allowedMoisture}%)\n` +
    `✂️ *Moisture Cut:* ${dedPct}% (${deductionMt} MT)\n` +
    `⚖️ *Actual Payable Wt:* ${actualMt} MT (${actualKg.toLocaleString()} kg)\n` +
    `💰 *Purchase Rate:* ₹${rate.toLocaleString("en-IN")} / MT\n` +
    `💵 *TOTAL PAYABLE:* ₹${totalAmount.toLocaleString("en-IN")}\n` +
    `-----------------------------------\n` +
    `Automated Weighbridge Token - Kusumganga Agro Solutions.`;

  // HTML content for clean printing
  const iframeHTMLContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Weighbridge Receipt #${slipNo}</title>
  <style>
    @page { size: A5 portrait; margin: 10mm; }
    body {
      font-family: 'Courier New', Courier, monospace, sans-serif;
      background: #ffffff;
      color: #000000;
      margin: 0;
      padding: 10px;
      font-size: 13px;
      line-height: 1.5;
    }
    .receipt-card {
      border: 2px solid #000000;
      padding: 18px 22px;
      max-width: 550px;
      margin: 0 auto;
    }
    .header { text-align: center; border-bottom: 2px solid #000000; padding-bottom: 6px; margin-bottom: 12px; }
    .header h2 { margin: 0; font-size: 18px; font-weight: 900; text-transform: uppercase; }
    .address-badge { background: #000000; color: #ffffff; font-size: 10.5px; font-weight: bold; padding: 2px 8px; display: inline-block; margin-top: 4px; }
    .row { display: flex; justify-content: space-between; border-bottom: 1px dotted #666666; padding-bottom: 4px; margin-bottom: 5px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; border-bottom: 1px dotted #666666; padding-bottom: 4px; margin-bottom: 5px; }
    .amount-box { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; background: #f0fdf4; padding: 8px 12px; border: 1px solid #000000; margin-top: 6px; font-weight: bold; }
    .signatures { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 32px; font-size: 11px; font-weight: bold; }
    .sig-box { border-top: 1px solid #000000; width: 120px; text-align: center; padding-top: 4px; }
  </style>
</head>
<body>
  <div class="receipt-card">
    <div class="header">
      <h2>KUSUMGANGA AGRO SOLUTIONS PVT. LTD.</h2>
      <div class="address-badge">24-A, Sai Complex, Betiya Hata Gorakhpur (U.P.) 273001</div>
    </div>
    <div class="row"><span><strong>Center:</strong> ${centerName}</span><span><strong>Date:</strong> ${dateStr}</span></div>
    <div class="row"><span><strong>No. / RST:</strong> <span style="font-size:16px; font-weight:900;">${slipNo}</span></span><span><strong>Commodity:</strong> ${commodity}</span></div>
    <div class="row" style="display:block;"><strong>Name of Party:</strong> ${partyName}</div>
    <div class="row"><span><strong>Moisture (%):</strong> ${moisture}% (Allowed: ${allowedMoisture}%)</span><span><strong>Slip No.:</strong> ${slipNo}</span></div>
    <div class="row" style="display:block;"><strong>Vehicle No.:</strong> <span style="font-family:monospace; font-weight:bold;">${vehicleNo}</span></div>
    <div class="grid-2"><span><strong>Gross Weight:</strong> ${grossMt} MT (${grossKg.toLocaleString()} kg)</span><span><strong>Tare Weight:</strong> ${tareMt} MT (${tareKg.toLocaleString()} kg)</span></div>
    <div class="grid-2"><span><strong>Deduction (${dedPct}%):</strong> ${deductionMt} MT (${deductionKg.toFixed(0)} kg)</span><span><strong>Net Weight:</strong> ${netMt} MT (${netKg.toLocaleString()} kg)</span></div>
    <div class="amount-box">
      <span><strong>Purchase Rate:</strong> ₹${rate.toLocaleString("en-IN")} / MT</span>
      <span style="font-size:15px; color:#047857;"><strong>Total Amount:</strong> ₹${totalAmount.toLocaleString("en-IN")}</span>
    </div>
    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:12px; font-size:10px; color:#64748b; border-top:1px dashed #cbd5e1; padding-top:6px;">
      <span>Automated Weighbridge Token | Verification: RST-${slipNo}-KG</span>
      <span style="font-family:monospace; letter-spacing:2px;">||||| | |||| || |||||| | |||</span>
    </div>
    <div class="signatures">
      <div class="sig-box">Sign. of Driver</div>
      <div class="sig-box">Security</div>
      <div class="sig-box">Sign. of Supervisor</div>
    </div>
  </div>
</body>
</html>`;

  // 100% Reliable Print Function using IFrame (No pop-up blockers!)
  function handleIframePrint() {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.focus();
        iframeRef.current.contentWindow.print();
        toast.success("Print dialog opened!");
      } catch (err) {
        window.print();
      }
    } else {
      window.print();
    }
  }

  // File Download for Receipt Token
  function handleDownloadReceiptFile() {
    const blob = new Blob([iframeHTMLContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Weighbridge_Receipt_RST_${slipNo}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Receipt RST-${slipNo} downloaded successfully!`);
  }

  function handleDirectWhatsAppSend() {
    let cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone && !cleanPhone.startsWith("91") && cleanPhone.length === 10) {
      cleanPhone = "91" + cleanPhone;
    }
    const url = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(whatsappMessageText)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappMessageText)}`;
    
    window.open(url, "_blank");
    toast.success("WhatsApp window opened!");
  }

  function handleCopyText() {
    navigator.clipboard.writeText(whatsappMessageText);
    setCopied(true);
    toast.success("Receipt text copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Weighment Slip Receipt & Print Studio" maxWidth={720}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        
        {/* Hidden Print Iframe */}
        <iframe
          ref={iframeRef}
          srcDoc={iframeHTMLContent}
          style={{ position: "absolute", width: 0, height: 0, border: "none", visibility: "hidden" }}
          title="Print Receipt Engine"
        />

        {/* Printable Paper Slip Container (Displayed Live in Modal) */}
        <div
          id="printable-receipt-slip"
          className="printable-receipt-card"
          style={{
            background: "#ffffff",
            color: "#0f172a",
            border: "2px solid #1e293b",
            borderRadius: 8,
            padding: "24px 28px",
            fontFamily: "'Courier New', Courier, monospace, sans-serif",
            boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
            margin: "0 auto",
            width: "100%",
            maxWidth: 620,
            fontSize: 13,
            lineHeight: 1.5,
            position: "relative",
            overflow: "hidden"
          }}
        >
          {/* Background Watermark Seal */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%) rotate(-25deg)",
              fontSize: 44,
              fontWeight: 900,
              color: "rgba(0, 184, 107, 0.06)",
              letterSpacing: 2,
              pointerEvents: "none",
              whiteSpace: "nowrap",
              textTransform: "uppercase",
              padding: "10px 30px"
            }}
          >
            KUSUMGANGA AGRO
          </div>

          {/* Company Letterhead Header */}
          <div style={{ textAlign: "center", borderBottom: "2px solid #0f172a", paddingBottom: 8, marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 4 }}>
              <i className="fa-solid fa-wheat-awn" style={{ color: "#059669", fontSize: 20 }} />
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, textTransform: "uppercase", letterSpacing: 0.5, color: "#0f172a" }}>
                KUSUMGANGA AGRO SOLUTIONS PVT. LTD.
              </h2>
            </div>
            <div
              style={{
                background: "#0f172a",
                color: "#ffffff",
                fontSize: 11,
                fontWeight: 700,
                padding: "3px 12px",
                borderRadius: 3,
                display: "inline-block",
                letterSpacing: 0.3
              }}
            >
              24-A, Sai Complex, Betiya Hata Gorakhpur (U.P.) 273001
            </div>
          </div>

          {/* Slip Content Grid */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, position: "relative", zIndex: 1 }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dotted #94a3b8", paddingBottom: 4 }}>
              <span><strong>Center:</strong> {centerName}</span>
              <span><strong>Date:</strong> {dateStr}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dotted #94a3b8", paddingBottom: 4 }}>
              <span><strong>No. / RST:</strong> <span style={{ fontSize: 16, fontWeight: 900, color: "#059669" }}>{slipNo}</span></span>
              <span><strong>Commodity:</strong> {commodity}</span>
            </div>

            <div style={{ borderBottom: "1px dotted #94a3b8", paddingBottom: 4 }}>
              <strong>Name of Party:</strong> {partyName}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dotted #94a3b8", paddingBottom: 4 }}>
              <span><strong>Moisture (%):</strong> {moisture}% (Allowed: {allowedMoisture}%)</span>
              <span><strong>Slip No.:</strong> {slipNo}</span>
            </div>

            <div style={{ borderBottom: "1px dotted #94a3b8", paddingBottom: 4 }}>
              <strong>Vehicle No.:</strong> <span style={{ fontFamily: "monospace", fontWeight: "bold" }}>{vehicleNo}</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, borderBottom: "1px dotted #94a3b8", paddingBottom: 4 }}>
              <span><strong>Gross Weight:</strong> {grossMt} MT ({grossKg.toLocaleString()} kg)</span>
              <span><strong>Tare Weight:</strong> {tareMt} MT ({tareKg.toLocaleString()} kg)</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, borderBottom: "1px dotted #94a3b8", paddingBottom: 4 }}>
              <span><strong>Deduction ({dedPct}%):</strong> {deductionMt} MT ({deductionKg.toFixed(0)} kg)</span>
              <span><strong>Net Weight:</strong> {netMt} MT ({netKg.toLocaleString()} kg)</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, background: "#f0fdf4", padding: "8px 12px", border: "1px solid #86efac", borderRadius: 4, marginTop: 4 }}>
              <span><strong>Purchase Rate:</strong> ₹{rate.toLocaleString("en-IN")} / MT</span>
              <span style={{ fontSize: 15, fontWeight: 900, color: "#166534" }}>
                <strong>Total Amount:</strong> ₹{totalAmount.toLocaleString("en-IN")}
              </span>
            </div>

            {/* Footer Verification Barcode simulation */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 8, borderTop: "1px dashed #cbd5e1" }}>
              <div style={{ fontSize: 9.5, color: "#64748b" }}>
                Automated Weighbridge Token | Verification Code: RST-{slipNo}-KG
              </div>
              <div style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: 2, background: "#e2e8f0", padding: "2px 6px", borderRadius: 2 }}>
                ||||| | |||| || |||||| | |||
              </div>
            </div>

            {/* Signature Blocks */}
            <div
              style={{
                display: "flex",
                justify: "space-between",
                alignItems: "flex-end",
                marginTop: 24,
                paddingTop: 8,
                fontSize: 11,
                fontWeight: 700
              }}
            >
              <div style={{ borderTop: "1px solid #0f172a", width: 130, textAlign: "center", paddingTop: 4 }}>
                Sign. of Driver
              </div>
              <div style={{ borderTop: "1px solid #0f172a", width: 110, textAlign: "center", paddingTop: 4 }}>
                Security
              </div>
              <div style={{ borderTop: "1px solid #0f172a", width: 140, textAlign: "center", paddingTop: 4 }}>
                Sign. of Supervisor
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp Sharing Controls Bar */}
        <div style={{ background: "var(--canvas)", border: "1px solid var(--line)", borderRadius: 10, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)", display: "flex", alignItems: "center", gap: 6 }}>
              <i className="fa-brands fa-whatsapp" style={{ color: "#25D366", fontSize: 15 }} /> Direct WhatsApp Share
            </span>
            <button
              type="button"
              onClick={handleCopyText}
              style={{
                border: "none",
                background: "transparent",
                color: "var(--primary-deep)",
                fontSize: 11.5,
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 4
              }}
            >
              <i className={copied ? "fa-solid fa-check" : "fa-solid fa-copy"} /> {copied ? "Copied!" : "Copy Message Text"}
            </button>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              placeholder="Enter mobile no (e.g. 9876543210)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                flex: 1,
                padding: "7px 12px",
                fontSize: 12.5,
                borderRadius: 8,
                border: "1px solid var(--line-strong)",
                outline: "none",
                background: "var(--surface)",
                color: "var(--ink)"
              }}
            />
            <button
              type="button"
              onClick={handleDirectWhatsAppSend}
              style={{
                padding: "7px 16px",
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
                boxShadow: "0 2px 6px rgba(37, 211, 102, 0.3)"
              }}
            >
              <i className="fa-brands fa-whatsapp" /> Send on WhatsApp
            </button>
          </div>
        </div>

        {/* Bottom Toolbar Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--line)", paddingTop: 12 }}>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={handleDownloadReceiptFile}
              style={{
                padding: "8px 14px",
                fontSize: 12.5,
                fontWeight: 700,
                borderRadius: 8,
                border: "1px solid var(--line-strong)",
                background: "var(--surface)",
                color: "var(--ink)",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6
              }}
            >
              <i className="fa-solid fa-file-arrow-down" style={{ color: "#0284c7" }} /> Download Token HTML
            </button>

            <Button
              onClick={handleIframePrint}
              style={{
                padding: "8px 20px",
                fontSize: 13,
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "var(--gradient-primary)",
                boxShadow: "0 4px 12px rgba(0, 184, 107, 0.3)"
              }}
            >
              <i className="fa-solid fa-print" /> Print Receipt Slip Now
            </Button>
          </div>
        </div>
      </div>

      {/* Embedded High-Res Media Print CSS Engine */}
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
            padding: 20px !important;
          }
        }
      `}</style>
    </Modal>
  );
}
