export default function BiomassCollectionSlipModal({ slipData, onClose }) {
  if (!slipData) return null;

  const printDocument = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Biomass Collection Slip #${slipData.slipNo} - Kusumganga Agro</title>
        <style>
          @page { size: A5 landscape; margin: 10mm; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 10px;
            color: #0f172a;
            font-size: 11px;
            background: #fff;
          }
          .ticket-container {
            border: 2px solid #0f172a;
            border-radius: 6px;
            padding: 12px 14px;
            max-width: 700px;
            margin: 0 auto;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 8px;
            margin-bottom: 10px;
          }
          .company-title {
            font-size: 16px;
            font-weight: 900;
            color: #047857;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .subtitle {
            font-size: 10px;
            font-weight: 700;
            color: #475569;
          }
          .badge-slip {
            background: #0f172a;
            color: #fff;
            padding: 4px 10px;
            font-size: 12px;
            font-weight: 800;
            border-radius: 4px;
            font-family: monospace;
          }
          .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 10px;
          }
          .section-box {
            border: 1px solid #cbd5e1;
            background: #f8fafc;
            border-radius: 4px;
            padding: 8px 10px;
          }
          .section-title {
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            color: #475569;
            margin-bottom: 4px;
            border-bottom: 1px dashed #cbd5e1;
            padding-bottom: 2px;
          }
          .data-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
          }
          .label { color: #64748b; font-size: 10px; }
          .val { font-weight: 700; color: #0f172a; }
          .table-weight {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
            font-size: 11px;
          }
          .table-weight th, .table-weight td {
            border: 1px solid #0f172a;
            padding: 5px 8px;
            text-align: left;
          }
          .table-weight th {
            background: #e2e8f0;
            font-weight: 800;
            font-size: 10px;
            text-transform: uppercase;
          }
          .amount-highlight {
            background: #ecfdf5;
            border: 1.5px solid #10b981;
            padding: 8px 12px;
            border-radius: 4px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 8px;
          }
          .signatures {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 15px;
            margin-top: 24px;
            text-align: center;
          }
          .sign-line {
            border-top: 1px dashed #0f172a;
            padding-top: 4px;
            font-size: 9.5px;
            font-weight: 700;
            color: #334155;
          }
        </style>
      </head>
      <body>
        <div class="ticket-container">
          <div class="header">
            <div>
              <div class="company-title">🌾 KUSUMGANGA AGRO PRIVATE LIMITED</div>
              <div class="subtitle">Transit Collection Centre (TCC) — Biomass Sourcing & Weighbridge Slip (Stage 1)</div>
            </div>
            <div style="text-align: right;">
              <div class="badge-slip">${slipData.slipNo}</div>
              <div style="font-size: 10px; font-weight: 700; color: #475569; margin-top: 3px;">Date: ${slipData.date} | ${slipData.time || "10:00 AM"}</div>
            </div>
          </div>

          <div class="grid-2">
            <div class="section-box">
              <div class="section-title">🚜 Village & Farmer Procurement </div>
              <div class="data-row"><span class="label">Sourcing Village:</span> <span class="val">${slipData.villageName}</span></div>
              <div class="data-row"><span class="label">Farmer Name:</span> <span class="val">${slipData.farmerName}</span></div>
              <div class="data-row"><span class="label">Farmer Mobile:</span> <span class="val">${slipData.farmerMobile}</span></div>
              <div class="data-row"><span class="label">Crop Residue:</span> <span class="val" style="color: #047857;">${slipData.cropName}</span></div>
            </div>

            <div class="section-box">
              <div class="section-title">👤 Sourcing Vendor & Vehicle </div>
              <div class="data-row"><span class="label">Contractor/Vendor:</span> <span class="val">${slipData.vendorName || "JYOTI ENTERPRISES"}</span></div>
              <div class="data-row"><span class="label">Vehicle No:</span> <span class="val" style="font-family: monospace;">${slipData.vehicleNo}</span></div>
              <div class="data-row"><span class="label">Vehicle Type:</span> <span class="val">${slipData.vehicleType || "Tractor Trolley"}</span></div>
              <div class="data-row"><span class="label">Baler / Stack:</span> <span class="val">${slipData.balerMachine || "HDB-01"} / ${slipData.stackAssigned || "Zone A"}</span></div>
            </div>
          </div>

          <table class="table-weight">
            <thead>
              <tr>
                <th>Gross Weight (MT)</th>
                <th>Tare Weight (MT)</th>
                <th>Actual Net Weight (MT)</th>
                <th>Actual Moisture %</th>
                <th>Actual Ash %</th>
                <th>GRN Payable Weight (MT)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${slipData.grossWeightMt} MT</td>
                <td>${slipData.tareWeightMt} MT</td>
                <td><strong>${slipData.actualNetWeightMt} MT</strong></td>
                <td>${slipData.actualMoisturePct}% (Std: 20%)</td>
                <td>${slipData.actualAshPct}% (Std: 20%)</td>
                <td><strong style="color: #047857; font-size: 13px;">${slipData.invoiceWeightMt} MT</strong></td>
              </tr>
            </tbody>
          </table>

          <div class="amount-highlight">
            <div>
              <div style="font-size: 10px; color: #065f46; font-weight: 700;">Rate per Metric Ton: ₹${slipData.ratePerMt}/MT (Agreed Contract Rate)</div>
              <div style="font-size: 9.5px; color: #047857;">Deduction applied: ${Math.max(0, (slipData.actualNetWeightMt - slipData.invoiceWeightMt)).toFixed(2)} MT as per quality slab formula</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 10px; font-weight: 700; color: #065f46;">TOTAL PAYABLE AMOUNT</div>
              <div style="font-size: 16px; font-weight: 900; color: #047857;">₹${(slipData.totalAmountRs || 0).toLocaleString("en-IN")}</div>
            </div>
          </div>

          <div class="signatures">
            <div class="sign-line">Farmer / Tractor Driver</div>
            <div class="sign-line">Sourcing Contractor / Vendor</div>
            <div class="sign-line">Weighbridge Supervisor (Kusumganga)</div>
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (<div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.7)",
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
          background: "#FFFFFF",
          border: "2px solid #0F172A",
          borderRadius: 16,
          width: "100%",
          maxWidth: 680,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "14px 20px",
            background: "#0F172A",
            color: "#FFFFFF",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>🌾</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: 0.3 }}>
                WEIGHBRIDGE RAW COLLECTION SLIP #{slipData.slipNo}
              </div>
              <div style={{ fontSize: 11, color: "#94A3B8" }}>
                Stage 1: Village Procurement & Weighment Voucher
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#94A3B8",
              fontSize: 20,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Top Info Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: "#64748B", textTransform: "uppercase", marginBottom: 6 }}>
                🌾 Village & Farmer Sourcing
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>{slipData.villageName}</div>
              <div style={{ fontSize: 12, color: "#334155", marginTop: 2 }}>
                Farmer: <strong>{slipData.farmerName}</strong> ({slipData.farmerMobile})
              </div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: "#059669", marginTop: 4 }}>
                Residue: {slipData.cropName}
              </div>
            </div>

            <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: "#64748B", textTransform: "uppercase", marginBottom: 6 }}>
                👤 Contractor & Vehicle Logistics
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>
                {slipData.vendorName || "JYOTI ENTERPRISES"}
              </div>
              <div style={{ fontSize: 12, color: "#334155", marginTop: 2 }}>
                Vehicle: <strong style={{ fontFamily: "monospace" }}>{slipData.vehicleNo}</strong> ({slipData.vehicleType || "Tractor"})
              </div>
              <div style={{ fontSize: 11.5, color: "#64748B", marginTop: 4 }}>
                Baler: {slipData.balerMachine || "HDB-01"} | Stack: {slipData.stackAssigned || "Zone A"}
              </div>
            </div>
          </div>

          {/* Weight Matrix */}
          <div style={{ border: "1.5px solid #CBD5E1", borderRadius: 8, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", background: "#F1F5F9", padding: "8px 10px", fontSize: 10.5, fontWeight: 800, color: "#475569", borderBottom: "1px solid #CBD5E1" }}>
              <span>GROSS (MT)</span>
              <span>TARE (MT)</span>
              <span>ACTUAL NET</span>
              <span>MOISTURE</span>
              <span>ASH %</span>
              <span>GRN PAYABLE</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", padding: "10px 10px", fontSize: 12, fontWeight: 700, color: "#0F172A", background: "#FFFFFF", alignItems: "center" }}>
              <span>{slipData.grossWeightMt} MT</span>
              <span>{slipData.tareWeightMt} MT</span>
              <span>{slipData.actualNetWeightMt} MT</span>
              <span>{slipData.actualMoisturePct}%</span>
              <span>{slipData.actualAshPct}%</span>
              <span style={{ color: "#059669", fontSize: 13, fontWeight: 900 }}>{slipData.invoiceWeightMt} MT</span>
            </div>
          </div>

          {/* Payable Total Card */}
          <div
            style={{
              background: "#ECFDF5",
              border: "1.5px solid #10B981",
              borderRadius: 8,
              padding: "12px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#065F46" }}>
                Commercial Rate: ₹{slipData.ratePerMt} / MT
              </div>
              <div style={{ fontSize: 10.5, color: "#047857", marginTop: 2 }}>
                GRN Formula: {slipData.actualNetWeightMt} MT × (100% - {slipData.actualMoisturePct}% - {slipData.actualAshPct}%) / (100% - 20% - 20%)
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: "#065F46", textTransform: "uppercase" }}>
                Total Payable (₹)
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#047857" }}>
                ₹{(slipData.totalAmountRs || 0).toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
            <button
              onClick={onClose}
              style={{
                padding: "8px 16px",
                fontSize: 12,
                fontWeight: 700,
                borderRadius: 8,
                border: "1px solid #CBD5E1",
                background: "#FFFFFF",
                color: "#475569",
                cursor: "pointer",
              }}
            >
              Close
            </button>
            <button
              onClick={printDocument}
              style={{
                padding: "8px 20px",
                fontSize: 12,
                fontWeight: 800,
                borderRadius: 8,
                border: "none",
                background: "#047857",
                color: "#FFFFFF",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              🖨️ Print Slip / Gate Pass
            </button>
          </div>
        </div>
      </div>
    </div>);
}
