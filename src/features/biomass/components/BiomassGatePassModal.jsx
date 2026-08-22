import { toast } from "../../../utils/toast";

export default function BiomassGatePassModal({ passData, onClose }) {
  if (!passData) return null;

  function triggerPrint() {
    const printWin = window.open("", "_blank");
    if (!printWin) {
      toast.error("Pop-up blocked! Please allow pop-ups to print the Gate Pass.");
      return;
    }

    printWin.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Biomass Gate Pass #${passData.gatePassNo} - Kusumganga Agro</title>
  <style>
    @page { size: A4 portrait; margin: 12mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #000; line-height: 1.4; background: #fff; }
    .toolbar { padding: 10px 16px; background: #f1f5f9; border-bottom: 1px solid #cbd5e1; display: flex; justify-content: flex-end; gap: 10px; }
    .btn { padding: 8px 16px; background: #0f172a; color: #fff; font-weight: bold; font-size: 12px; border: none; border-radius: 4px; cursor: pointer; }
    .btn-close { background: #ef4444; }
    
    .pass-container { width: 190mm; margin: 20px auto; border: 2px solid #000; padding: 15px; background: #fff; }
    .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 14px; }
    .title { font-size: 18px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; }
    .subtitle { font-size: 11px; font-weight: bold; text-transform: uppercase; }
    .address { font-size: 10px; margin-top: 2px; }
    
    .bill-to-box { border: 2px solid #000; padding: 10px 14px; margin-bottom: 14px; background: #fafafa; }
    .bill-to-title { font-size: 14px; font-weight: 900; text-transform: uppercase; margin-bottom: 4px; border-bottom: 1px solid #000; padding-bottom: 2px; }
    .buyer-name { font-size: 16px; font-weight: 900; letter-spacing: 0.5px; color: #000; }
    .buyer-address { font-size: 12px; font-weight: 700; margin-top: 4px; text-transform: uppercase; }
    .buyer-gstin { font-size: 13px; font-weight: 900; margin-top: 6px; }

    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 14px; }
    .info-table { width: 100%; border-collapse: collapse; border: 1px solid #000; }
    .info-table td { border: 1px solid #000; padding: 6px 8px; font-size: 11px; }
    .info-table td.lbl { font-weight: bold; background: #f1f5f9; width: 40%; }
    .info-table td.val { font-weight: 800; }

    .summary-box { border: 2px solid #000; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; margin-bottom: 20px; }
    .total-amt { font-size: 18px; font-weight: 900; }

    .signatures { display: flex; justify-content: space-between; margin-top: 50px; }
    .sig-box { width: 150px; text-align: center; border-top: 1px solid #000; padding-top: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase; }

    @media print {
      .toolbar { display: none !important; }
      body { margin: 0; }
      .pass-container { width: 100%; border: 2px solid #000; }
    }
  </style>
</head>
<body onload="setTimeout(function(){ window.print(); }, 250)">
  <div class="toolbar">
    <button class="btn" onclick="window.print()">🖨️ Print Pass / Save PDF</button>
    <button class="btn btn-close" onclick="window.close()">✕ Close</button>
  </div>

  <div class="pass-container">
    <div class="header">
      <div class="title">Kusumganga Agro Solutions Pvt. Ltd.</div>
      <div class="subtitle">Biomass Supply Chain — Dispatch Gate Pass & Commercial Challan</div>
      <div class="address">24-A, Sai Complex, Betiyahata, Gorakhpur (U.P.) 273001 | GSTIN: 09AALCK4355J1Z2</div>
    </div>

    <!-- Bill To Box (Image 1 Format) -->
    <div class="bill-to-box">
      <div class="bill-to-title">Bill To / Consignee Details:-</div>
      <div class="buyer-name">${passData.buyerName || "RELIANCE INDUSTRIES LIMITED"}</div>
      <div class="buyer-address">${passData.address || passData.destination}</div>
      <div class="buyer-gstin">GSTIN: ${passData.gstin || "09AAACR5055K2Z4"}</div>
    </div>

    <div class="grid-2">
      <!-- Left Info -->
      <table class="info-table">
        <tr><td class="lbl">Gate Pass No:</td><td class="val">${passData.gatePassNo}</td></tr>
        <tr><td class="lbl">Dispatch Date:</td><td class="val">${passData.date}</td></tr>
        <tr><td class="lbl">Commodity:</td><td class="val">${passData.cropName}</td></tr>
        <tr><td class="lbl">E-Way Bill No:</td><td class="val">${passData.ewayBillNo || "—"}</td></tr>
      </table>

      <!-- Right Info -->
      <table class="info-table">
        <tr><td class="lbl">Vehicle No:</td><td class="val" style="text-transform:uppercase;">${passData.vehicleNo}</td></tr>
        <tr><td class="lbl">Vehicle Type:</td><td class="val">${passData.vehicleType}</td></tr>
        <tr><td class="lbl">Driver Name:</td><td class="val">${passData.driverName || "—"}</td></tr>
        <tr><td class="lbl">Driver Phone:</td><td class="val">${passData.driverPhone || "—"}</td></tr>
      </table>
    </div>

    <!-- Weight & Commercial Details -->
    <table class="info-table" style="margin-bottom: 14px;">
      <tr style="background:#f1f5f9; font-weight:bold; text-transform:uppercase; text-align:center;">
        <td style="width:10%;">Sr.</td>
        <td>Product Description</td>
        <td>Bale Count</td>
        <td>Net Weight (MT)</td>
        <td>Agreed Rate (₹/MT)</td>
        <td>Total Invoice Value (₹)</td>
      </tr>
      <tr style="text-align:center; font-weight:700;">
        <td>1</td>
        <td style="text-align:left;">${passData.cropName} (HSN: 1213 00 00)</td>
        <td>${passData.baleCount || 0} Bales</td>
        <td>${passData.dispatchedTonnageMt} MT</td>
        <td>₹${(passData.agreedPriceMt || 1850).toLocaleString("en-IN")}</td>
        <td style="font-weight:900;">₹${(passData.totalInvoiceAmount || 0).toLocaleString("en-IN")}</td>
      </tr>
    </table>

    <div class="summary-box">
      <div>
        <div style="font-size:11px; font-weight:bold;">Tax Details: GST 0% (Exempt Agricultural Feedstock)</div>
        <div style="font-size:10px; color:#555;">Certified for Bio-Ethanol / Bio-CNG Manufacturing.</div>
      </div>
      <div style="text-align:right;">
        <span style="font-size:11px; font-weight:bold;">TOTAL VALUE:</span>
        <div class="total-amt">₹${(passData.totalInvoiceAmount || 0).toLocaleString("en-IN")}</div>
      </div>
    </div>

    <div class="signatures">
      <div class="sig-box">Security Gate Guard</div>
      <div class="sig-box">Trailer Driver Sign</div>
      <div class="sig-box">Weighbridge Operator</div>
      <div class="sig-box">For Kusumganga Agro</div>
    </div>
  </div>
</body>
</html>`);

    printWin.document.close();
    toast.success("Gate pass printed successfully!");
  }

  function handleShareWhatsApp() {
    const text =
      `🚚 *KUSUMGANGA AGRO SOLUTIONS PVT. LTD.* 🚚\n` +
      `📜 *DISPATCH GATE PASS:* ${passData.gatePassNo}\n` +
      `📅 *Date:* ${passData.date}\n` +
      `🏢 *Consignee (Bill To):* ${passData.buyerName}\n` +
      `📍 *Destination:* ${passData.address || passData.destination}\n` +
      `🆔 *GSTIN:* ${passData.gstin}\n` +
      `-----------------------------------\n` +
      `🚛 *Vehicle No:* ${passData.vehicleNo}\n` +
      `🌾 *Commodity:* ${passData.cropName}\n` +
      `📦 *Bales Count:* ${passData.baleCount} Bales\n` +
      `⚖️ *Dispatched Net Weight:* ${passData.dispatchedTonnageMt} MT\n` +
      `💰 *Agreed Rate:* ₹${passData.agreedPriceMt} / MT\n` +
      `💵 *TOTAL VALUE:* ₹${(passData.totalInvoiceAmount || 0).toLocaleString("en-IN")}\n` +
      `📑 *E-Way Bill:* ${passData.ewayBillNo || "—"}\n` +
      `-----------------------------------\n` +
      `Consignment in transit for industrial bio-energy supply.`;

    let phone = prompt("WhatsApp par bhejane ke liye mobile number darj karein (with country code e.g. 919876543210):");
    let url = "";
    if (phone) {
      phone = phone.replace(/[^0-9]/g, "");
      url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`;
    } else {
      url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    }
    window.open(url, "_blank");
    toast.success("WhatsApp window opened!");
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
          maxWidth: 680,
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
          padding: 20,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--line)", paddingBottom: 12, marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "var(--ink)" }}>
            📄 Factory Gate Pass #{passData.gatePassNo}
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--muted)" }}>
            ✕
          </button>
        </div>

        {/* Card View */}
        <div style={{ background: "#F8FAFC", border: "2px solid #0F172A", borderRadius: 10, padding: 16, marginBottom: 16 }}>
          {/* Bill To Box (Image 1 Specs) */}
          <div style={{ background: "#FFFFFF", border: "1.5px solid #0F172A", padding: 12, borderRadius: 6, marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: "#64748B", marginBottom: 2 }}>Bill To:-</div>
            <div style={{ fontSize: 15, fontWeight: 900, color: "#0F172A", textTransform: "uppercase" }}>{passData.buyerName}</div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "#334155", marginTop: 2, textTransform: "uppercase" }}>{passData.address || passData.destination}</div>
            <div style={{ fontSize: 12, fontWeight: 900, color: "#2563EB", marginTop: 4 }}>GSTIN: {passData.gstin || "09AAACR5055K2Z4"}</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 12, color: "#334155" }}>
            <div>📅 Date: <strong>{passData.date}</strong></div>
            <div>🚛 Vehicle No: <strong style={{ fontFamily: "monospace" }}>{passData.vehicleNo}</strong></div>
            <div>🌾 Commodity: <strong>{passData.cropName}</strong></div>
            <div>📦 Bales: <strong>{passData.baleCount} Bales</strong></div>
            <div>⚖️ Tonnage: <strong>{passData.dispatchedTonnageMt} MT</strong></div>
            <div>💰 Rate: <strong>₹{passData.agreedPriceMt}/MT</strong></div>
          </div>

          <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px dashed #CBD5E1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#64748B" }}>Total Invoice Amount:</span>
            <span style={{ fontSize: 18, fontWeight: 900, color: "#047857" }}>₹{(passData.totalInvoiceAmount || 0).toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button
            onClick={handleShareWhatsApp}
            style={{
              padding: "8px 14px",
              fontSize: 12.5,
              fontWeight: 700,
              borderRadius: 8,
              border: "1px solid #16a34a",
              background: "#f0fdf4",
              color: "#16a34a",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            💬 Share WhatsApp
          </button>

          <button
            onClick={triggerPrint}
            style={{
              padding: "8px 18px",
              fontSize: 12.5,
              fontWeight: 800,
              borderRadius: 8,
              border: "none",
              background: "var(--gradient-primary)",
              color: "#fff",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            🖨️ Print Official Gate Pass
          </button>
        </div>
      </div>
    </div>
  );
}
