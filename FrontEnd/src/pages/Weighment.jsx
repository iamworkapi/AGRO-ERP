import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import DataTable from "../components/common/DataTable";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import AsyncState from "../components/common/AsyncState";
import PrintableWeighmentSlipModal from "../components/weighment/PrintableWeighmentSlipModal";
import { useStockEntries } from "../features/stockEntries/useStockEntries";
import { useWarehouses } from "../features/warehouses/useWarehouses";
import { useAuth } from "../hooks/useAuth";
import { toast } from "../utils/toast";

const STATUS_TONE = { approved: "success", pending: "warning", rejected: "error" };

function iconBtnStyle(iconColor, bgColor) {
  return {
    width: 30,
    height: 30,
    borderRadius: 8,
    border: `1px solid ${bgColor}`,
    background: bgColor,
    color: iconColor,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    transition: "all 150ms ease",
  };
}

export default function Weighment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isScopedRole = user?.roleKey === "supervisor" || user?.roleKey === "warehouse_admin";
  const { warehouses } = useWarehouses();
  const myWarehouseName = isScopedRole ? warehouses[0]?.name : null;

  const { entries, status, error, reload, deleteEntry } = useStockEntries();

  const [activeTab, setActiveTab] = useState("register"); // "register" | "list"
  const [commodityFilter, setCommodityFilter] = useState("ALL");
  const [selectedSlipForPrint, setSelectedSlipForPrint] = useState(null);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    if (commodityFilter === "ALL") return entries;
    return entries.filter((e) => e.commodity?.toLowerCase() === commodityFilter.toLowerCase());
  }, [entries, commodityFilter]);

  const approvedCount = useMemo(() => filteredEntries.filter((e) => e.status === "approved").length, [filteredEntries]);

  // Aggregate stats for metrics bar
  const totalNetMt = useMemo(() => filteredEntries.reduce((sum, e) => sum + (e.actualWeightMt || (e.netWeightKg || 0) / 1000), 0), [filteredEntries]);
  const totalAmountSum = useMemo(() => filteredEntries.reduce((sum, e) => sum + (e.totalAmountRs || 0), 0), [filteredEntries]);
  const totalDeductionSum = useMemo(() => filteredEntries.reduce((sum, e) => sum + (e.totalDeductionMt || 0), 0), [filteredEntries]);

  // Function to export daily register to CSV
  function handleExportCSV() {
    if (!filteredEntries.length) {
      toast.error("No entries available to export.");
      return;
    }

    const headers = [
      "Sr. No.",
      "R.S.T No.",
      "Vehicle No.",
      "Date",
      "Commodity",
      "Party Name",
      "Gross Weight (MT)",
      "Tare Weight (MT)",
      "Net Weight (MT)",
      "Moisture %",
      "Allowed Moisture %",
      "Difference %",
      "Deduction %",
      "Total Deduction (MT)",
      "Actual Weight (MT)",
      "Rate (Rs.)",
      "Total Amount (Rs.)",
    ];

    const rows = filteredEntries.map((e, index) => [
      index + 1,
      `"${e.slipNo || ""}"`,
      `"${e.vehicleNo || ""}"`,
      `"${e.createdAt || ""}"`,
      `"${e.commodity || ""}"`,
      `"${e.partyName || ""}"`,
      (e.grossWeightKg / 1000).toFixed(3),
      (e.tareWeightKg / 1000).toFixed(3),
      (e.netWeightKg / 1000).toFixed(3),
      e.moisturePct || 20,
      e.allowedMoisturePct || 20,
      Math.max(0, (e.moisturePct || 20) - (e.allowedMoisturePct || 20)),
      e.deductionPct || 0,
      (e.totalDeductionMt || 0).toFixed(3),
      (e.actualWeightMt || (e.netWeightKg / 1000)).toFixed(3),
      e.ratePerMt || 1900,
      (e.totalAmountRs || 0).toFixed(2),
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Daily_Weight_Register_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Daily Weight Register exported to CSV successfully!");
  }

  function triggerDirectPrint(r) {
    setSelectedSlipForPrint(r);
    
    const printWin = window.open("", "_blank");
    if (!printWin) {
      toast.error("Pop-up blocked. Please click allow pop-ups for this site to print.");
      return;
    }

    const grossKg = parseFloat(r.grossWeightKg || 0);
    const tareKg = parseFloat(r.tareWeightKg || 0);
    const netKg = Math.max(0, grossKg - tareKg);
    const grossMt = (grossKg / 1000).toFixed(3);
    const tareMt = (tareKg / 1000).toFixed(3);
    const netMt = (netKg / 1000).toFixed(3);
    const moisture = parseFloat(r.moisturePct || 20);
    const allowedMoisture = parseFloat(r.allowedMoisturePct || 20);
    const diffPct = Math.max(0, moisture - allowedMoisture);
    const dedPct = parseFloat(r.deductionPct !== undefined ? r.deductionPct : diffPct);
    const deductionKg = (netKg * dedPct) / 100;
    const deductionMt = (deductionKg / 1000).toFixed(3);
    const actualKg = Math.max(0, netKg - deductionKg);
    const actualMt = (actualKg / 1000).toFixed(3);
    const rate = parseFloat(r.ratePerMt || 1900);
    const totalAmount = r.totalAmountRs !== undefined ? parseFloat(r.totalAmountRs) : Math.round((actualKg / 1000) * rate * 100) / 100;
    const centerName = r.warehouse || "Gorakhpur Purchase Center";
    const dateStr = r.createdAt || new Date().toLocaleDateString("en-IN");
    const slipNo = r.slipNo || "720";
    const partyName = r.partyName || "";
    const vehicleNo = r.vehicleNo || "";
    const commodity = r.commodity || "PRALLI";

    const purchasedProducts = r.purchasedProducts || [];
    const hasProducts = purchasedProducts.length > 0;
    const goodsTotal = r.productPurchaseTotalRs || (hasProducts ? purchasedProducts.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) : 0);
    const netPayable = r.netPayableToPartyRs != null ? r.netPayableToPartyRs : (hasProducts ? Math.max(0, totalAmount - goodsTotal) : totalAmount);
    const netReceivable = r.netReceivableFromPartyRs != null ? r.netReceivableFromPartyRs : (hasProducts ? Math.max(0, goodsTotal - totalAmount) : 0);

    printWin.document.write(`<!DOCTYPE html>
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

      ${hasProducts ? `
      <!-- Products Purchased Against Weighment Bill -->
      <div class="section-title" style="margin-top:10px; background:#fef3c7; color:#92400e; border-color:#f59e0b;">
        Products Purchased Against Weighment Bill
      </div>
      <table class="weight-table" style="margin-bottom:12px; border-color:#f59e0b;">
        <thead>
          <tr style="background:#fffbeb;">
            <th style="text-align:left; border-color:#f59e0b;">Item / Product</th>
            <th style="text-align:center; border-color:#f59e0b;">Qty</th>
            <th style="text-align:right; border-color:#f59e0b;">Rate (₹)</th>
            <th style="text-align:right; border-color:#f59e0b;">Total (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${purchasedProducts.map(p => `
            <tr>
              <td style="text-align:left; font-weight:700; border-color:#f59e0b;">${p.productName}</td>
              <td style="text-align:center; border-color:#f59e0b;">${p.quantity} ${p.unit || 'Units'}</td>
              <td style="text-align:right; border-color:#f59e0b;">₹${(Number(p.rate) || 0).toLocaleString('en-IN')}</td>
              <td style="text-align:right; font-weight:700; border-color:#f59e0b;">₹${(Number(p.amount) || 0).toLocaleString('en-IN')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      ` : ''}

      <!-- Payment Box -->
      <div class="payment-box" style="${hasProducts ? 'flex-direction:column; align-items:stretch; gap:6px;' : ''}">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div class="rate-info">
            <div>Agreed Rate: &#8377; ${rate.toLocaleString("en-IN")} / MT</div>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:11px; font-weight:bold; text-transform:uppercase;">Pralli Bill Total:</span>
            <span style="font-size:14px; font-weight:bold;">&#8377; ${totalAmount.toLocaleString("en-IN")}</span>
          </div>
        </div>

        ${hasProducts ? `
        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px dashed #cbd5e1; padding-top:4px; font-size:11px; color:#b45309; font-weight:700;">
          <span>Less: Purchased Products Deducted:</span>
          <span>- &#8377; ${goodsTotal.toLocaleString("en-IN")}</span>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; border-top:2px solid #000; padding-top:6px;">
          <span style="font-size:12px; font-weight:900; text-transform:uppercase; color:${netPayable > 0 ? '#16a34a' : '#ea580c'};">
            ${netPayable > 0 ? 'Net Cash Payable to Vendor:' : 'Net Cash Receivable from Vendor:'}
          </span>
          <span style="font-size:16px; font-weight:900; color:${netPayable > 0 ? '#16a34a' : '#ea580c'};">
            &#8377; ${(netPayable > 0 ? netPayable : netReceivable).toLocaleString("en-IN")}
          </span>
        </div>
        ` : ''}
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
</html>`);
    printWin.document.close();
    toast.success("Professional Bill Book print opened!");
  }

  function handleShareWhatsApp(r) {
    const grossMt = (r.grossWeightKg / 1000).toFixed(3);
    const tareMt = (r.tareWeightKg / 1000).toFixed(3);
    const netMt = (r.netWeightKg / 1000).toFixed(3);
    const actualMt = (r.actualWeightMt || netMt).toString();
    const rate = r.ratePerMt || 1900;
    const totalAmt = r.totalAmountRs || 0;

    let goodsSection = "";
    let settlementSection = `*TOTAL AMOUNT:* ₹${totalAmt.toLocaleString("en-IN")}\n`;
    if (r.purchasedProducts && r.purchasedProducts.length > 0) {
      const pItems = r.purchasedProducts.map(p => `  • ${p.productName}: ${p.quantity} ${p.unit || 'Units'} @ ₹${Number(p.rate).toLocaleString("en-IN")} = ₹${Number(p.amount).toLocaleString("en-IN")}`).join("\n");
      const goodsTotal = r.productPurchaseTotalRs || r.purchasedProducts.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
      const netPayable = r.netPayableToPartyRs != null ? r.netPayableToPartyRs : Math.max(0, totalAmt - goodsTotal);
      const netReceivable = r.netReceivableFromPartyRs != null ? r.netReceivableFromPartyRs : Math.max(0, goodsTotal - totalAmt);

      goodsSection =
        `-----------------------------------\n` +
        `🛍️ *PURCHASED PRODUCTS:*\n` +
        `${pItems}\n` +
        `*Total Goods Deducted:* -₹${goodsTotal.toLocaleString("en-IN")}\n`;

      if (netReceivable > 0) {
        settlementSection =
          `*Pralli Bill Total:* ₹${totalAmt.toLocaleString("en-IN")}\n` +
          `*Goods Deducted:* -₹${goodsTotal.toLocaleString("en-IN")}\n` +
          `⚠️ *NET CASH DUE FROM VENDOR:* ₹${netReceivable.toLocaleString("en-IN")}\n`;
      } else {
        settlementSection =
          `*Pralli Bill Total:* ₹${totalAmt.toLocaleString("en-IN")}\n` +
          `*Goods Deducted:* -₹${goodsTotal.toLocaleString("en-IN")}\n` +
          `💰 *FINAL NET PAYABLE TO VENDOR:* ₹${netPayable.toLocaleString("en-IN")}\n`;
      }
    }

    const text =
      `*KUSUMGANGA AGRO SOLUTIONS PVT. LTD.* \n` +
      `*Center:* ${r.warehouse || "Gorakhpur Center"}\n` +
      `📜 *Slip No:* ${r.slipNo}\n` +
      `📅 *Date:* ${r.createdAt}\n` +
      `*Commodity:* ${r.commodity}\n` +
      `👤 *Party:* ${r.partyName || "—"}\n` +
      `🚛 *Vehicle No:* ${r.vehicleNo || "—"}\n` +
      `-----------------------------------\n` +
      `*Gross Weight:* ${grossMt} MT\n` +
      `*Tare Weight:* ${tareMt} MT\n` +
      `*Net Weight:* ${netMt} MT\n` +
      `💧 *Moisture:* ${r.moisturePct || 20}% (Allowed: ${r.allowedMoisturePct || 20}%)\n` +
      `✂️ *Deduction:* ${r.deductionPct || 0}%\n` +
      `*Actual Payable Weight:* ${actualMt} MT\n` +
      `*Rate:* ₹${rate.toLocaleString("en-IN")} / MT\n` +
      goodsSection +
      settlementSection +
      `-----------------------------------\n` +
      `Automated Weighbridge Token - Kusumganga Agro Solutions.`;

    let phone = prompt("WhatsApp send karne ke liye mobile number darj karein (with country code e.g. 919876543210):");
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
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* ================================================================== */}
      {/* 1. HERO COMMAND HEADER                                             */}
      {/* ================================================================== */}
      <PageHeader
        title={`PRALLI Weighment Slips — ${myWarehouseName || "Betia Hata Gorakhpur"}`}
        badge="WEIGHBRIDGE WB-01 ONLINE"
        location="Betia Hata, Gorakhpur, Uttar Pradesh"
        subtitle="Automated Load Cells Active • Digitised Purchase Register & Auto QC Deductions"
        icon="ri-scales-3-line"
      />

      <AsyncState status={status} error={error} loadingLabel="Loading weighment slips…" />

      {/* ================================================================== */}
      {/* 2. TOP METRIC STAT CARDS (4-UP GRID)                               */}
      {/* ================================================================== */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 16,
            padding: "16px 18px",
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "var(--ink)", letterSpacing: "-0.02em" }}>
              {filteredEntries.length} Slips
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", marginTop: 2 }}>
              Total Slips Logged
            </div>
          </div>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(93, 214, 44, 0.15)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            <i className="ri-file-list-3-line" />
          </div>
        </div>

        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 16,
            padding: "16px 18px",
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "var(--ink)", letterSpacing: "-0.02em" }}>
              {approvedCount} Slips
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", marginTop: 2 }}>
              Approved QC Passes
            </div>
          </div>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(0, 210, 255, 0.15)", color: "#00D2FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            <i className="ri-checkbox-circle-line" />
          </div>
        </div>

        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 16,
            padding: "16px 18px",
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "var(--primary)", letterSpacing: "-0.02em" }}>
              {totalNetMt.toFixed(2)} MT
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", marginTop: 2 }}>
              Actual Net Biomass
            </div>
          </div>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(255, 184, 0, 0.15)", color: "#FFB800", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            <i className="ri-scales-3-line" />
          </div>
        </div>

        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 16,
            padding: "16px 18px",
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "var(--ink)", letterSpacing: "-0.02em" }}>
              ₹{totalAmountSum.toLocaleString("en-IN")}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", marginTop: 2 }}>
              Total Purchase Value
            </div>
          </div>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(168, 85, 247, 0.15)", color: "#A855F7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            <i className="ri-money-rupee-circle-line" />
          </div>
        </div>
      </div>



      {/* ================================================================== */}
      {/* 4. MAIN WEIGHT REGISTER / SLIPS TABLE                              */}
      {/* ================================================================== */}
      {activeTab === "register" ? (
        <DataTable
          title="Daily Purchase & Weight Register"
          searchable
          exportable
          exportFilename="daily_weight_register"
          searchPlaceholder="Search slip #, vehicle, party..."
          keyField="id"
          rows={filteredEntries}
          emptyMessage="No weight register entries recorded yet."
          columns={[
            {
              key: "srNo",
              label: "SR.",
              render: (_, options) => <span style={{ color: "var(--muted)", fontWeight: 700, fontSize: 12 }}>{(options?.rowIndex !== undefined ? options.rowIndex + 1 : 1)}</span>,
            },
            {
              key: "slipNo",
              label: "R.S.T SLIP NO.",
              emphasize: true,
              render: (r) => (
                <span style={{ fontWeight: 800, color: "var(--ink)", display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12.5 }}>
                  <i className="ri-hashtag" style={{ color: "var(--primary)", fontSize: 11 }} />
                  {r.slipNo}
                </span>
              ),
            },
            {
              key: "vehicleNo",
              label: "VEHICLE NO.",
              render: (r) => (
                <span
                  style={{
                    fontWeight: 800,
                    fontFamily: "monospace",
                    color: "var(--ink)",
                    background: "var(--canvas)",
                    padding: "2px 6px",
                    borderRadius: 6,
                    border: "1px solid var(--line)",
                    fontSize: 11.5,
                    textTransform: "uppercase",
                  }}
                >
                  {r.vehicleNo || "—"}
                </span>
              ),
            },
            {
              key: "createdAt",
              label: "DATE",
              render: (r) => <span style={{ fontSize: 11.5, color: "var(--muted)" }}>{r.createdAt || "Today"}</span>,
            },
            {
              key: "grossWeightKg",
              label: "GROSS (MT)",
              render: (r) => <span style={{ fontSize: 12 }}>{(r.grossWeightKg / 1000).toFixed(3)}</span>,
            },
            {
              key: "tareWeightKg",
              label: "TARE (MT)",
              render: (r) => <span style={{ fontSize: 12 }}>{(r.tareWeightKg / 1000).toFixed(3)}</span>,
            },
            {
              key: "netWeightKg",
              label: "NET (MT)",
              render: (r) => <strong style={{ color: "var(--ink)", fontSize: 12.5 }}>{(r.netWeightKg / 1000).toFixed(3)}</strong>,
            },
            {
              key: "moisturePct",
              label: "MOISTURE %",
              render: (r) => {
                const isHigh = (r.moisturePct || 20) > (r.allowedMoisturePct || 20);
                return (
                  <span
                    style={{
                      background: isHigh ? "rgba(255, 184, 0, 0.15)" : "rgba(93, 214, 44, 0.15)",
                      color: isHigh ? "#D97706" : "var(--primary)",
                      border: `1px solid ${isHigh ? "rgba(255, 184, 0, 0.3)" : "rgba(93, 214, 44, 0.3)"}`,
                      padding: "2px 7px",
                      borderRadius: 6,
                      fontWeight: 800,
                      fontSize: 11,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 3,
                    }}
                  >
                    <i className="ri-drop-line" style={{ fontSize: 10 }} />
                    {r.moisturePct != null ? `${r.moisturePct}%` : "20%"}
                  </span>
                );
              },
            },
            {
              key: "allowedMoisturePct",
              label: "ALLOWED %",
              render: (r) => <span style={{ fontSize: 12 }}>{r.allowedMoisturePct || 20}%</span>,
            },
            {
              key: "diffPct",
              label: "DIFF %",
              render: (r) => {
                const diff = Math.max(0, (r.moisturePct || 20) - (r.allowedMoisturePct || 20));
                return <span style={{ color: diff > 0 ? "#DC2626" : "var(--muted)", fontWeight: diff > 0 ? 800 : 500, fontSize: 12 }}>{diff}%</span>;
              },
            },
            {
              key: "totalDeductionMt",
              label: "DED. (MT)",
              render: (r) => <span style={{ fontSize: 12 }}>{(r.totalDeductionMt || 0).toFixed(3)}</span>,
            },
            {
              key: "actualWeightMt",
              label: "ACTUAL WT. (MT)",
              render: (r) => (
                <span
                  style={{
                    background: "var(--primary-tint)",
                    color: "var(--primary)",
                    border: "1px solid var(--primary-tint)",
                    padding: "3px 8px",
                    borderRadius: 6,
                    fontWeight: 800,
                    fontSize: 12,
                  }}
                >
                  {(r.actualWeightMt || (r.netWeightKg / 1000)).toFixed(3)} MT
                </span>
              ),
            },
            {
              key: "ratePerMt",
              label: "RATE (₹)",
              render: (r) => <span style={{ fontSize: 12 }}>₹{(r.ratePerMt || 1900).toLocaleString("en-IN")}</span>,
            },
            {
              key: "totalAmountRs",
              label: "TOTAL AMOUNT (₹)",
              render: (r) => {
                const hasProducts = r.purchasedProducts && r.purchasedProducts.length > 0;
                const netPayable = r.netPayableToPartyRs != null ? r.netPayableToPartyRs : r.totalAmountRs;
                const netReceivable = r.netReceivableFromPartyRs || 0;
                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {hasProducts ? (
                      <>
                        <span style={{ fontSize: 11, color: "var(--muted-color)", textDecoration: "line-through" }}>
                          ₹{(r.totalAmountRs || 0).toLocaleString("en-IN")}
                        </span>
                        <div>
                          <span style={{ fontSize: 10, background: "#fef3c7", color: "#b45309", padding: "1px 5px", borderRadius: 4, fontWeight: 700 }}>
                            -₹{(r.productPurchaseTotalRs || 0).toLocaleString("en-IN")} Goods
                          </span>
                        </div>
                        {netPayable > 0 ? (
                          <strong style={{ color: "#16a34a", fontSize: 12 }}>
                            Net: ₹{netPayable.toLocaleString("en-IN")}
                          </strong>
                        ) : (
                          <strong style={{ color: "#ea580c", fontSize: 12 }}>
                            Due: ₹{netReceivable.toLocaleString("en-IN")}
                          </strong>
                        )}
                      </>
                    ) : (
                      <strong style={{ color: "var(--primary)", fontSize: 13 }}>
                        ₹{(r.totalAmountRs || 0).toLocaleString("en-IN")}
                      </strong>
                    )}
                  </div>
                );
              },
            },
            {
              key: "actions",
              label: "ACTIONS",
              render: (r) => (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "var(--canvas)", padding: "3px 5px", borderRadius: 10, border: "1px solid var(--line)" }}>
                  <button type="button" title="View Details" onClick={() => setSelectedSlipForPrint(r)} style={iconBtnStyle("#6b7280", "#e5e7eb")}>
                    <i className="ri-eye-line" />
                  </button>
                  <button type="button" title="Edit Entry" onClick={() => navigate(`/weighment/${r.id}/edit`)} style={iconBtnStyle("#0284c7", "#7dd3fc")}>
                    <i className="ri-edit-line" />
                  </button>
                  <button type="button" title="Print Receipt" onClick={() => triggerDirectPrint(r)} style={iconBtnStyle("#7c3aed", "#e9d5ff")}>
                    <i className="ri-printer-line" />
                  </button>
                  <button type="button" title="Share via WhatsApp" onClick={() => handleShareWhatsApp(r)} style={{ ...iconBtnStyle("#25D366", "#dcfce7"), background: "#25D366", color: "#fff", border: "none" }}>
                    <i className="ri-whatsapp-line" />
                  </button>
                  <div style={{ width: 1, height: 18, background: "var(--line)", margin: "0 2px" }} />
                  <button type="button" title="Delete Entry" onClick={async () => { if (window.confirm("Delete this weighment slip? This cannot be undone.")) { try { await deleteEntry(r.id); toast.success("Slip deleted."); reload(); } catch (err) { toast.error(err?.response?.data?.error?.message || "Delete failed."); } } }} style={iconBtnStyle("#dc2626", "#fecaca")}>
                    <i className="ri-delete-bin-line" />
                  </button>
                </div>
              ),
            },
          ]}
        />
      ) : (

        /* Standard Cards / Directory Table */
        <DataTable
          title={isScopedRole ? `Weighment Slips (${myWarehouseName || "your warehouse"})` : "Weighment Slips Directory"}
          searchable
          searchPlaceholder="Search slip no, party, vehicle, commodity..."
          keyField="id"
          rows={filteredEntries}
          emptyMessage="No weighment slips recorded yet."
          columns={[
            {
              key: "slipNo",
              label: "Slip No.",
              emphasize: true,
              render: (r) => (
                <span style={{ fontWeight: 800, color: "var(--primary-deep)", display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <i className="ri-hashtag" style={{ fontSize: 10 }} />
                  {r.slipNo}
                </span>
              ),
            },
            {
              key: "warehouse",
              label: "Centre",
              render: (r) => (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
                  <i className="ri-building-line" style={{ color: "var(--primary)", fontSize: 11 }} />
                  {r.warehouse}
                </span>
              ),
            },
            {
              key: "partyName",
              label: "Party / Supplier",
              render: (r) => (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i className="ri-building-line-user" style={{ color: "var(--muted)", fontSize: 11 }} />
                  {r.partyName || "—"}
                </span>
              ),
            },
            {
              key: "entryType",
              label: "Type",
              render: (r) => <Badge tone={r.entryType === "inward" ? "success" : "info"}>{r.entryType === "inward" ? "INWARD" : "OUTWARD"}</Badge>,
            },
            {
              key: "commodity",
              label: "Commodity",
              render: (r) => (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i className="ri-plant-line" style={{ color: "var(--muted)", fontSize: 11 }} />
                  {r.commodity}
                </span>
              ),
            },
            {
              key: "moisturePct",
              label: "Moisture",
              render: (r) => (
                <span style={{ fontWeight: 600, color: "#2563EB", display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <i className="ri-drop-line" style={{ fontSize: 10 }} />
                  {r.moisturePct != null ? `${r.moisturePct}%` : "—"}
                </span>
              ),
            },
            { key: "grossWeightKg", label: "Gross Wt.", render: (r) => `${Number(r.grossWeightKg || 0).toLocaleString()} kg` },
            { key: "tareWeightKg", label: "Tare Wt.", render: (r) => `${Number(r.tareWeightKg || 0).toLocaleString()} kg` },
            {
              key: "netWeightKg",
              label: "Net Wt.",
              render: (r) => <strong style={{ color: "var(--primary-deep)", fontSize: 13 }}>{Number(r.netWeightKg || 0).toLocaleString()} kg</strong>,
            },
            {
              key: "status",
              label: "Status",
              render: (r) => <Badge tone={STATUS_TONE[r.status] || "warning"}>{r.status.toUpperCase()}</Badge>,
            },
            {
              key: "actions",
              label: "ACTIONS",
              width: 180,
              render: (r) => (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "var(--canvas)", padding: "3px 5px", borderRadius: 10, border: "1px solid var(--line)" }}>
                  <button type="button" title="View Details" onClick={() => setSelectedSlipForPrint(r)} style={iconBtnStyle("#6b7280", "#e5e7eb")}>
                    <i className="ri-eye-line" />
                  </button>
                  <button type="button" title="Edit Entry" onClick={() => navigate(`/weighment/${r.id}/edit`)} style={iconBtnStyle("#0284c7", "#7dd3fc")}>
                    <i className="ri-edit-line" />
                  </button>
                  <button type="button" title="Print Receipt" onClick={() => triggerDirectPrint(r)} style={iconBtnStyle("#7c3aed", "#e9d5ff")}>
                    <i className="ri-printer-line" />
                  </button>
                  <button type="button" title="Share via WhatsApp" onClick={() => handleShareWhatsApp(r)} style={{ ...iconBtnStyle("#25D366", "#dcfce7"), background: "#25D366", color: "#fff", border: "none" }}>
                    <i className="ri-whatsapp-line" />
                  </button>
                  <div style={{ width: 1, height: 18, background: "var(--line)", margin: "0 2px" }} />
                  <button type="button" title="Delete Entry" onClick={async () => { if (window.confirm("Delete this weighment slip?")) { try { await deleteEntry(r.id); toast.success("Slip deleted."); reload(); } catch (err) { toast.error(err?.response?.data?.error?.message || "Delete failed."); } } }} style={iconBtnStyle("#dc2626", "#fecaca")}>
                    <i className="ri-delete-bin-line" />
                  </button>
                </div>
              ),
            },
          ]}
        />
      )}

      {/* Printable Receipt Modal */}
      <PrintableWeighmentSlipModal
        isOpen={Boolean(selectedSlipForPrint)}
        onClose={() => setSelectedSlipForPrint(null)}
        data={selectedSlipForPrint}
      />
    </div>
  );
}
