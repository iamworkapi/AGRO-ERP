import React, { useState, useEffect } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { toast } from "../../utils/toast";

export default function PrintableWeighmentSlipModal({ isOpen, onClose, data, autoPrint = false }) {
  const [phone, setPhone] = useState("");
  const [copied, setCopied] = useState(false);

  // Auto-trigger print when modal opens if autoPrint is true or requested
  useEffect(() => {
    if (isOpen && data && autoPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen, data, autoPrint]);

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
    `*KUSUMGANGA AGRO SOLUTIONS PVT. LTD.* \n` +
    `*Center:* ${centerName}\n` +
    `📜 *RST / Slip No:* ${slipNo}\n` +
    `📅 *Date:* ${dateStr}\n` +
    `🌾 *Commodity:* ${commodity}\n` +
    `👤 *Vendor / Supplier:* ${partyName}\n` +
    `🚛 *Vehicle No:* ${vehicleNo}\n` +
    `-----------------------------------\n` +
    `*Gross Weight:* ${grossMt} MT (${grossKg.toLocaleString()} kg)\n` +
    `*Tare Weight:* ${tareMt} MT (${tareKg.toLocaleString()} kg)\n` +
    `*Net Weight:* ${netMt} MT (${netKg.toLocaleString()} kg)\n` +
    `💧 *Moisture:* ${moisture}% (Allowed: ${allowedMoisture}%)\n` +
    `✂️ *Moisture Cut:* ${dedPct}% (${deductionMt} MT)\n` +
    `*Actual Payable Wt:* ${actualMt} MT (${actualKg.toLocaleString()} kg)\n` +
    `*Purchase Rate:* ₹${rate.toLocaleString("en-IN")} / MT\n` +
    `*TOTAL PAYABLE:* ₹${totalAmount.toLocaleString("en-IN")}\n` +
    `-----------------------------------\n` +
    `Automated Weighbridge Token - Kusumganga Agro Solutions.`;

  // Clean HTML document for Chrome print window & download
  const downloadHTMLContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Weighment Receipt #${slipNo} - Kusumganga Agro</title>
  <style>
    @page {
      size: A5 portrait;
      margin: 10mm;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background: #ffffff;
      color: #000000;
      font-size: 11px;
      line-height: 1.4;
    }

    /* Screen-only toolbar */
    .toolbar {
      padding: 10px 14px;
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      background: #f1f5f9;
      border-bottom: 1px solid #cbd5e1;
      margin-bottom: 20px;
    }
    .btn {
      background: #0f172a;
      color: #fff;
      border: none;
      padding: 8px 16px;
      font-size: 12px;
      font-weight: bold;
      border-radius: 4px;
      cursor: pointer;
    }
    .btn-close { background: #ef4444; }

    /* Main Bill Book Card */
    .bill-book {
      width: 148mm;
      min-height: 200mm;
      margin: 0 auto;
      border: 2px solid #000;
      padding: 2px;
      background: #ffffff;
      position: relative;
    }
    
    .bill-inner {
      border: 1px solid #000;
      padding: 12px 15px;
      height: 100%;
    }

    /* Header Section */
    .header-section {
      text-align: center;
      border-bottom: 2px solid #000;
      padding-bottom: 10px;
      margin-bottom: 10px;
    }
    
    .header-top-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 6px;
    }

    .receipt-type {
      font-size: 9px;
      font-weight: bold;
      border: 1px solid #000;
      padding: 3px 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .copy-type {
      font-size: 9px;
      font-weight: bold;
      text-transform: uppercase;
      margin-top: 3px;
    }

    .company-name {
      font-size: 16px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #000;
    }
    .company-tagline {
      font-size: 9px;
      font-weight: bold;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .company-address {
      font-size: 10px;
      font-weight: 500;
    }

    /* Info Grid (2 Columns) */
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 15px;
    }
    
    .info-col {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .info-row {
      display: flex;
      border-bottom: 1px dashed #888;
      padding-bottom: 2px;
    }
    
    .info-label {
      width: 80px;
      font-size: 10px;
      font-weight: bold;
      color: #333;
    }
    
    .info-val {
      flex: 1;
      font-size: 11px;
      font-weight: 700;
    }
    .info-val-lg {
      font-size: 13px;
      font-weight: 900;
    }

    /* Weight Table Details */
    .section-title {
      font-size: 11px;
      font-weight: bold;
      text-transform: uppercase;
      background: #f1f5f9;
      padding: 4px 8px;
      border: 1px solid #000;
      border-bottom: none;
      margin-top: 10px;
    }

    .weight-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #000;
      margin-bottom: 15px;
    }
    
    .weight-table th, .weight-table td {
      border: 1px solid #000;
      padding: 6px 8px;
      text-align: right;
    }
    
    .weight-table th {
      background: #f8fafc;
      font-weight: bold;
      font-size: 10px;
      text-align: center;
    }
    
    .weight-table td.label-cell {
      text-align: left;
      font-weight: bold;
      font-size: 10px;
      width: 40%;
    }
    
    .weight-table td.val-cell {
      font-size: 11px;
      font-weight: 700;
    }
    
    .highlight-row {
      background: #f8fafc;
    }
    .highlight-row td {
      font-weight: 900 !important;
      font-size: 12px !important;
    }

    /* Payment Details Box */
    .payment-box {
      border: 1px solid #000;
      display: flex;
      justify-content: space-between;
      padding: 8px 12px;
      align-items: center;
      margin-bottom: 20px;
    }
    .rate-info {
      font-size: 10px;
      font-weight: bold;
    }
    .total-amt {
      font-size: 16px;
      font-weight: 900;
    }

    /* Terms and Signatures */
    .terms {
      font-size: 8px;
      color: #555;
      margin-bottom: 30px;
    }
    
    .signature-area {
      display: flex;
      justify-content: space-between;
      margin-top: 40px;
    }
    
    .sig-block {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 120px;
    }
    
    .sig-line {
      border-top: 1px solid #000;
      width: 100%;
      margin-bottom: 4px;
    }
    
    .sig-title {
      font-size: 9px;
      font-weight: bold;
      text-transform: uppercase;
    }
    
    .auth-signatory {
      font-size: 10px;
      font-weight: bold;
      margin-bottom: 25px;
    }

    @media print {
      .toolbar { display: none !important; }
      body { margin: 0; background: none; }
      .bill-book {
        width: 100%;
        border: 2px solid #000;
        min-height: auto;
      }
    }
  </style>
</head>
<body onload="setTimeout(function(){ window.print(); }, 250)">
  <div class="toolbar">
    <button class="btn" onclick="window.print()">Print Bill / Save PDF</button>
    <button class="btn btn-close" onclick="window.close()">✕ Close</button>
  </div>

  <div class="bill-book">
    <div class="bill-inner">
      
      <!-- Header -->
      <div class="header-section">
        <div class="header-top-row">
          <div class="receipt-type">Weighment Slip</div>
          <div class="copy-type">Original Copy</div>
        </div>
        
        <div class="company-name">Kusumganga Agro Solutions Pvt. Ltd.</div>
        <div class="company-tagline">Procurement & Warehousing Operations</div>
        <div class="company-address">24-A, Sai Complex, Betiya Hata, Gorakhpur (U.P.) 273001</div>
      </div>

      <!-- Info Grid -->
      <div class="info-grid">
        <!-- Left Col -->
        <div class="info-col">
          <div class="info-row">
            <span class="info-label">Slip No:</span>
            <span class="info-val info-val-lg">${slipNo}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Date:</span>
            <span class="info-val">${dateStr}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Center:</span>
            <span class="info-val">${centerName}</span>
          </div>
        </div>
        
        <!-- Right Col -->
        <div class="info-col">
          <div class="info-row">
            <span class="info-label">Vehicle No:</span>
            <span class="info-val" style="text-transform:uppercase;">${vehicleNo}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Party Name:</span>
            <span class="info-val">${partyName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Commodity:</span>
            <span class="info-val">${commodity}</span>
          </div>
        </div>
      </div>

      <!-- Weight Details -->
      <div class="section-title">Weight & Quality Assessment</div>
      <table class="weight-table">
        <thead>
          <tr>
            <th>Particulars</th>
            <th>Weight (KG)</th>
            <th>Weight (MT)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="label-cell">Gross Weight</td>
            <td class="val-cell">${grossKg.toLocaleString("en-IN")}</td>
            <td class="val-cell">${grossMt}</td>
          </tr>
          <tr>
            <td class="label-cell">Tare Weight</td>
            <td class="val-cell">${tareKg.toLocaleString("en-IN")}</td>
            <td class="val-cell">${tareMt}</td>
          </tr>
          <tr class="highlight-row">
            <td class="label-cell">Net Weight</td>
            <td class="val-cell">${netKg.toLocaleString("en-IN")}</td>
            <td class="val-cell">${netMt}</td>
          </tr>
          <tr>
            <td class="label-cell">Moisture Content</td>
            <td colspan="2" style="text-align:center; font-size:10px; font-weight:bold;">
              ${moisture}% &nbsp; (Allowed: ${allowedMoisture}%)
            </td>
          </tr>
          <tr>
            <td class="label-cell">Quality Deduction (${dedPct}%)</td>
            <td class="val-cell">${deductionKg.toFixed(0)}</td>
            <td class="val-cell">${deductionMt}</td>
          </tr>
          <tr class="highlight-row">
            <td class="label-cell">Actual Payable Weight</td>
            <td class="val-cell">${actualKg.toLocaleString("en-IN")}</td>
            <td class="val-cell">${actualMt}</td>
          </tr>
        </tbody>
      </table>

      <!-- Payment Box -->
      <div class="payment-box">
        <div class="rate-info">
          <div>Agreed Rate: &#8377; ${rate.toLocaleString("en-IN")} / MT</div>
        </div>
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="font-size:11px; font-weight:bold; text-transform:uppercase;">Total Payable:</span>
          <span class="total-amt">&#8377; ${totalAmount.toLocaleString("en-IN")}</span>
        </div>
      </div>

      <div class="terms">
        * This is a computer generated weighbridge slip.<br>
        * All weights are recorded by automated load cells.<br>
        * Subject to Gorakhpur jurisdiction only.
      </div>

      <!-- Signatures -->
      <div class="signature-area">
        <div class="sig-block">
          <div class="sig-line"></div>
          <div class="sig-title">Driver Sign</div>
        </div>
        
        <div class="sig-block">
          <div class="sig-line"></div>
          <div class="sig-title">Weighbridge Operator</div>
        </div>

        <div class="sig-block" style="width:160px;">
          <div class="auth-signatory">For Kusumganga Agro</div>
          <div class="sig-line"></div>
          <div class="sig-title">Authorized Signatory</div>
        </div>
      </div>

    </div>
  </div>
</body>
</html>`;

  // Direct High-Resolution Print Trigger
  function handleDirectPrint() {
    toast.info("Opening print dialog...");
    setTimeout(() => {
      window.print();
    }, 150);
  }

  // Opens dedicated Chrome tab with native Chrome Save as PDF / Print dialog
  function handleOpenChromePDFWindow() {
    const printWin = window.open("", "_blank");
    if (printWin) {
      printWin.document.write(downloadHTMLContent);
      printWin.document.close();
      printWin.focus();
      toast.success("Chrome PDF & Print window opened!");
    } else {
      toast.error("Pop-up blocked. Please allow pop-ups in Chrome address bar.");
    }
  }

  // File Download for Receipt Token
  function handleDownloadReceiptFile() {
    const blob = new Blob([downloadHTMLContent], { type: "text/html" });
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
        
        {/* Printable Paper Slip Container (Displayed Live in Modal & Print Target) */}
        <div
          id="printable-receipt-card"
          className="printable-receipt-card"
          style={{
            background: "#ffffff",
            color: "#000000",
            fontFamily: "'Segoe UI', Arial, sans-serif",
            margin: "0 auto",
            width: "100%",
            maxWidth: 500, /* Slightly wider for the modal view */
            fontSize: 11,
            lineHeight: 1.4,
            border: "2px solid #000",
            padding: 2,
            position: "relative",
            boxShadow: "0 10px 25px rgba(0,0,0,0.12)"
          }}
        >
          {/* We inject the exact same CSS for the modal rendering so it matches the PDF perfectly */}
          <style>{`
            .bill-inner-modal { border: 1px solid #000; padding: 12px 15px; height: 100%; }
            .header-section-m { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 10px; }
            .header-top-row-m { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; }
            .receipt-type-m { font-size: 9px; font-weight: bold; border: 1px solid #000; padding: 3px 6px; text-transform: uppercase; letter-spacing: 0.5px; }
            .copy-type-m { font-size: 9px; font-weight: bold; text-transform: uppercase; margin-top: 3px; }
            .company-name-m { font-size: 16px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; color: #000; }
            .company-tagline-m { font-size: 9px; font-weight: bold; text-transform: uppercase; margin-bottom: 4px; }
            .company-address-m { font-size: 10px; font-weight: 500; }
            .info-grid-m { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
            .info-col-m { display: flex; flex-direction: column; gap: 6px; }
            .info-row-m { display: flex; border-bottom: 1px dashed #888; padding-bottom: 2px; }
            .info-label-m { width: 80px; font-size: 10px; font-weight: bold; color: #333; }
            .info-val-m { flex: 1; font-size: 11px; font-weight: 700; }
            .info-val-lg-m { font-size: 13px; font-weight: 900; }
            .section-title-m { font-size: 11px; font-weight: bold; text-transform: uppercase; background: #f1f5f9; padding: 4px 8px; border: 1px solid #000; border-bottom: none; margin-top: 10px; }
            .weight-table-m { width: 100%; border-collapse: collapse; border: 1px solid #000; margin-bottom: 15px; }
            .weight-table-m th, .weight-table-m td { border: 1px solid #000; padding: 6px 8px; text-align: right; }
            .weight-table-m th { background: #f8fafc; font-weight: bold; font-size: 10px; text-align: center; }
            .weight-table-m td.label-cell-m { text-align: left; font-weight: bold; font-size: 10px; width: 40%; }
            .weight-table-m td.val-cell-m { font-size: 11px; font-weight: 700; }
            .highlight-row-m { background: #f8fafc; }
            .highlight-row-m td { font-weight: 900 !important; font-size: 12px !important; }
            .payment-box-m { border: 1px solid #000; display: flex; justify-content: space-between; padding: 8px 12px; align-items: center; margin-bottom: 20px; }
            .rate-info-m { font-size: 10px; font-weight: bold; }
            .total-amt-m { font-size: 16px; font-weight: 900; }
            .terms-m { font-size: 8px; color: #555; margin-bottom: 30px; }
            .signature-area-m { display: flex; justify-content: space-between; margin-top: 40px; }
            .sig-block-m { display: flex; flex-direction: column; align-items: center; width: 120px; }
            .sig-line-m { border-top: 1px solid #000; width: 100%; margin-bottom: 4px; }
            .sig-title-m { font-size: 9px; font-weight: bold; text-transform: uppercase; }
            .auth-signatory-m { font-size: 10px; font-weight: bold; margin-bottom: 25px; }
          `}</style>

          <div className="bill-inner-modal">
            
            {/* Header */}
            <div className="header-section-m">
              <div className="header-top-row-m">
                <div className="receipt-type-m">Weighment Slip</div>
                <div className="copy-type-m">Original Copy</div>
              </div>
              
              <div className="company-name-m">Kusumganga Agro Solutions Pvt. Ltd.</div>
              <div className="company-tagline-m">Procurement & Warehousing Operations</div>
              <div className="company-address-m">24-A, Sai Complex, Betiya Hata, Gorakhpur (U.P.) 273001</div>
            </div>

            {/* Info Grid */}
            <div className="info-grid-m">
              <div className="info-col-m">
                <div className="info-row-m">
                  <span className="info-label-m">Slip No:</span>
                  <span className="info-val-m info-val-lg-m">{slipNo}</span>
                </div>
                <div className="info-row-m">
                  <span className="info-label-m">Date:</span>
                  <span className="info-val-m">{dateStr}</span>
                </div>
                <div className="info-row-m">
                  <span className="info-label-m">Center:</span>
                  <span className="info-val-m">{centerName}</span>
                </div>
              </div>
              
              <div className="info-col-m">
                <div className="info-row-m">
                  <span className="info-label-m">Vehicle No:</span>
                  <span className="info-val-m" style={{textTransform: "uppercase"}}>{vehicleNo}</span>
                </div>
                <div className="info-row-m">
                  <span className="info-label-m">Party Name:</span>
                  <span className="info-val-m">{partyName}</span>
                </div>
                <div className="info-row-m">
                  <span className="info-label-m">Commodity:</span>
                  <span className="info-val-m">{commodity}</span>
                </div>
              </div>
            </div>

            {/* Weight Details */}
            <div className="section-title-m">Weight & Quality Assessment</div>
            <table className="weight-table-m">
              <thead>
                <tr>
                  <th>Particulars</th>
                  <th>Weight (KG)</th>
                  <th>Weight (MT)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="label-cell-m">Gross Weight</td>
                  <td className="val-cell-m">{grossKg.toLocaleString("en-IN")}</td>
                  <td className="val-cell-m">{grossMt}</td>
                </tr>
                <tr>
                  <td className="label-cell-m">Tare Weight</td>
                  <td className="val-cell-m">{tareKg.toLocaleString("en-IN")}</td>
                  <td className="val-cell-m">{tareMt}</td>
                </tr>
                <tr className="highlight-row-m">
                  <td className="label-cell-m">Net Weight</td>
                  <td className="val-cell-m">{netKg.toLocaleString("en-IN")}</td>
                  <td className="val-cell-m">{netMt}</td>
                </tr>
                <tr>
                  <td className="label-cell-m">Moisture Content</td>
                  <td colSpan="2" style={{textAlign: "center", fontSize: 10, fontWeight: "bold"}}>
                    {moisture}% &nbsp; (Allowed: {allowedMoisture}%)
                  </td>
                </tr>
                <tr>
                  <td className="label-cell-m">Quality Deduction ({dedPct}%)</td>
                  <td className="val-cell-m">{deductionKg.toFixed(0)}</td>
                  <td className="val-cell-m">{deductionMt}</td>
                </tr>
                <tr className="highlight-row-m">
                  <td className="label-cell-m">Actual Payable Weight</td>
                  <td className="val-cell-m">{actualKg.toLocaleString("en-IN")}</td>
                  <td className="val-cell-m">{actualMt}</td>
                </tr>
              </tbody>
            </table>

            {/* Payment Box */}
            <div className="payment-box-m">
              <div className="rate-info-m">
                <div>Agreed Rate: &#8377; {rate.toLocaleString("en-IN")} / MT</div>
              </div>
              <div style={{display: "flex", alignItems: "center", gap: 10}}>
                <span style={{fontSize: 11, fontWeight: "bold", textTransform: "uppercase"}}>Total Payable:</span>
                <span className="total-amt-m">&#8377; {totalAmount.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="terms-m">
              * This is a computer generated weighbridge slip.<br/>
              * All weights are recorded by automated load cells.<br/>
              * Subject to Gorakhpur jurisdiction only.
            </div>

            {/* Signatures */}
            <div className="signature-area-m">
              <div className="sig-block-m">
                <div className="sig-line-m"></div>
                <div className="sig-title-m">Driver Sign</div>
              </div>
              
              <div className="sig-block-m">
                <div className="sig-line-m"></div>
                <div className="sig-title-m">Weighbridge Operator</div>
              </div>

              <div className="sig-block-m" style={{width: 160}}>
                <div className="auth-signatory-m">For Kusumganga Agro</div>
                <div className="sig-line-m"></div>
                <div className="sig-title-m">Authorized Signatory</div>
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
              <i className={copied ? "ri-check-line" : "ri-file-copy-line"} /> {copied ? "Copied!" : "Copy Message Text"}
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--line)", paddingTop: 12, flexWrap: "wrap", gap: 8 }}>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={handleOpenChromePDFWindow}
              style={{
                padding: "8px 14px",
                fontSize: 12.5,
                fontWeight: 700,
                borderRadius: 8,
                border: "1px solid #0284c7",
                background: "#f0f9ff",
                color: "#0369a1",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6
              }}
            >
              <i className="fa-brands fa-chrome" style={{ color: "#0284c7" }} /> Open Chrome Tab PDF
            </button>

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
              <i className="ri-file-line-arrow-down" style={{ color: "#059669" }} /> Download Token HTML
            </button>

            <Button
              onClick={handleDirectPrint}
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
              <i className="ri-printer-line" /> Print Receipt / Save as PDF
            </Button>
          </div>
        </div>
      </div>

      {/* High-Resolution Media Print Engine */}
      <style>{`
        @media print {
          html, body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: 100% !important;
          }
          body > * {
            display: none !important;
          }
          .modal-overlay, .modal-container, .modal-backdrop {
            position: static !important;
            background: none !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            width: 100% !important;
          }
          #printable-receipt-card, #printable-receipt-card * {
            visibility: visible !important;
            display: block !important;
          }
          #printable-receipt-card {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            border: 2px solid #000000 !important;
            box-shadow: none !important;
            padding: 24px !important;
            background: #ffffff !important;
            color: #000000 !important;
            z-index: 99999999 !important;
          }
        }
      `}</style>
    </Modal>
  );
}
