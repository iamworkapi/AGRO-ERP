import React, { useState, useEffect } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { toast } from "../../utils/toast";
import { numberToWordsINR } from "../../utils/formatters";

const COMPANY_PROFILE = {
  name: "KUSUM GANGA AGROSOLUTIONS PVT LTD",
  tagline: "Agri-Input, Equipment & Warehouse Operations",
  address: "24-A, Sai Kripa Complex, Premchand Park, Betiah Hata, Gorakhpur, Uttar Pradesh - 273001",
  gstin: "09AALCK4355J1Z2",
  state: "Uttar Pradesh",
  stateCode: "09",
  contact: "+91 6393294600",
  email: "kusumganga5@gmail.com",
};

export default function PrintableInvoiceModal({ isOpen, onClose, invoice, autoPrint = false }) {
  const [phone, setPhone] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && invoice && autoPrint) {
      const timer = setTimeout(() => {
        handleDirectPrint();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen, invoice, autoPrint]);

  if (!isOpen || !invoice) return null;

  const invNo = invoice.invoiceNo || invoice.supplierInvoiceNo || "INV-0001";
  const invDate = invoice.invoiceDate || invoice.supplierInvoiceDate || invoice.createdAt || new Date();
  const dateFormatted = new Date(invDate).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const supplierName = invoice.supplier || "—";
  const supplierGstin = invoice.supplierGstin || "Unregistered / URP";
  const consigneeName = invoice.consignee || COMPANY_PROFILE.name;
  const consigneeGstin = invoice.consigneeGstin || COMPANY_PROFILE.gstin;
  const consigneeAddress = invoice.consigneeAddress || COMPANY_PROFILE.address;
  const warehouse = invoice.warehouse || "Gorakhpur Central Hub";
  const ewayBillNo = invoice.ewayBillNo || "—";

  const rawItems = Array.isArray(invoice.items) && invoice.items.length > 0 ? invoice.items : [];
  const items = rawItems.map((it, idx) => {
    const qty = Number(it.quantity) || 0;
    const rate = Number(it.rate) || 0;
    const disc = Number(it.discountPct) || 0;
    const lineTotal = disc > 0 ? qty * rate * (1 - disc / 100) : qty * rate;
    return {
      sNo: idx + 1,
      description: it.description || "Product Item",
      hsnCode: it.hsnCode || "—",
      quantity: qty,
      unit: it.unit || "PCS",
      rate: rate,
      discountPct: disc,
      amount: it.amount != null ? Number(it.amount) : lineTotal,
    };
  });

  const totalItemAmount =
    invoice.totalItemAmount != null
      ? Number(invoice.totalItemAmount)
      : items.reduce((acc, it) => acc + it.amount, 0);

  const cgstPct = Number(invoice.cgstPct) || 0;
  const sgstPct = Number(invoice.sgstPct) || 0;
  const igstPct = Number(invoice.igstPct) || 0;

  const cgstAmount = Math.round(totalItemAmount * (cgstPct / 100) * 100) / 100;
  const sgstAmount = Math.round(totalItemAmount * (sgstPct / 100) * 100) / 100;
  const igstAmount = Math.round(totalItemAmount * (igstPct / 100) * 100) / 100;
  const calculatedTax = cgstAmount + sgstAmount + igstAmount;
  const totalTaxAmount = invoice.taxAmount != null ? Number(invoice.taxAmount) : calculatedTax;

  const grandTotal =
    invoice.grandTotal != null
      ? Number(invoice.grandTotal)
      : Math.round((totalItemAmount + totalTaxAmount) * 100) / 100;

  const amountInWords =
    invoice.amountInWords || numberToWordsINR(grandTotal) || "INR Zero Only";

  const invoiceSummaryText =
    `*TAX INVOICE - ${COMPANY_PROFILE.name}*\n` +
    `📄 *Invoice No:* ${invNo}\n` +
    `📅 *Date:* ${dateFormatted}\n` +
    `🏢 *Supplier:* ${supplierName} (GSTIN: ${supplierGstin})\n` +
    `📍 *Warehouse:* ${warehouse}\n` +
    `📦 *Items:* ${items.length} item(s)\n` +
    `💰 *Taxable Subtotal:* ₹${totalItemAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}\n` +
    `📊 *Total Tax:* ₹${totalTaxAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}\n` +
    `💵 *GRAND TOTAL:* ₹${grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}\n` +
    `📝 *Amount in Words:* ${amountInWords}\n`;

  // HTML content for direct popup / download
  const printableHTMLContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice_${invNo}_${supplierName.replace(/[^a-zA-Z0-9]/g, "_")}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 8mm;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: #ffffff;
      color: #0f172a;
      font-size: 11px;
      line-height: 1.35;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .toolbar {
      padding: 10px 14px;
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      background: #f8fafc;
      border-bottom: 1px solid #cbd5e1;
      margin-bottom: 16px;
    }
    .btn {
      background: #166534;
      color: #ffffff;
      border: none;
      padding: 7px 15px;
      font-size: 12px;
      font-weight: 700;
      border-radius: 6px;
      cursor: pointer;
    }
    .btn-close { background: #64748b; }
    .inv-sheet {
      width: 194mm;
      margin: 0 auto;
      border: 1.5px solid #0f172a;
      background: #ffffff;
      padding: 14px 18px;
    }
    .inv-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1.5px solid #0f172a;
      padding-bottom: 10px;
      margin-bottom: 10px;
    }
    .inv-title-badge {
      display: inline-block;
      background: #166534;
      color: #ffffff;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1px;
      padding: 3px 10px;
      border-radius: 3px;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .company-name {
      font-size: 17px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -0.2px;
      text-transform: uppercase;
    }
    .company-sub {
      font-size: 9.5px;
      color: #475569;
      margin-top: 2px;
      max-width: 480px;
    }
    .meta-box {
      text-align: right;
      font-size: 10px;
    }
    .meta-row {
      display: flex;
      justify-content: flex-end;
      gap: 6px;
      margin-bottom: 2px;
    }
    .meta-label { color: #64748b; font-weight: 600; }
    .meta-val { font-weight: 800; color: #0f172a; }

    .party-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      border: 1px solid #cbd5e1;
      background: #f8fafc;
      padding: 8px 12px;
      margin-bottom: 12px;
      border-radius: 4px;
    }
    .party-card h4 {
      font-size: 9.5px;
      font-weight: 800;
      color: #166534;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 2px;
    }
    .party-name { font-size: 12px; font-weight: 800; color: #0f172a; margin-bottom: 2px; }
    .party-detail { font-size: 9.5px; color: #334155; line-height: 1.3; }

    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
      border: 1px solid #0f172a;
    }
    .items-table th, .items-table td {
      border: 1px solid #94a3b8;
      padding: 5px 7px;
    }
    .items-table th {
      background: #f1f5f9;
      font-size: 9.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      color: #0f172a;
      text-align: center;
    }
    .items-table td { font-size: 10px; }
    .col-r { text-align: right; }
    .col-c { text-align: center; }

    .summary-section {
      display: grid;
      grid-template-columns: 1.25fr 1fr;
      gap: 12px;
      margin-bottom: 12px;
    }
    .words-box {
      border: 1px solid #cbd5e1;
      padding: 8px 10px;
      border-radius: 4px;
      background: #fafafa;
    }
    .words-label { font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; }
    .words-val { font-size: 10.5px; font-weight: 800; color: #0f172a; margin-top: 2px; }

    .calc-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #cbd5e1;
    }
    .calc-table td {
      padding: 4px 8px;
      font-size: 10px;
      border-bottom: 1px solid #e2e8f0;
    }
    .calc-table .grand-row td {
      background: #f0fdf4;
      font-weight: 900;
      font-size: 13px;
      color: #166534;
      border-top: 1.5px solid #166534;
      border-bottom: none;
    }

    .footer-grid {
      display: grid;
      grid-template-columns: 1.3fr 1fr;
      gap: 14px;
      border-top: 1px solid #cbd5e1;
      padding-top: 10px;
      margin-top: 8px;
    }
    .bank-box { font-size: 9px; color: #475569; line-height: 1.4; }
    .bank-box strong { color: #0f172a; }
    .terms-box { font-size: 8.5px; color: #64748b; margin-top: 4px; }
    .sig-area {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      justify-content: flex-end;
      text-align: center;
    }
    .sig-line {
      width: 160px;
      border-top: 1px solid #0f172a;
      margin-top: 45px;
      padding-top: 3px;
      font-size: 9.5px;
      font-weight: 700;
    }

    @media print {
      .toolbar { display: none !important; }
      body { margin: 0; background: none; }
      .inv-sheet {
        width: 100%;
        border: 1.5px solid #000000;
        padding: 8mm;
      }
    }
  </style>
</head>
<body onload="setTimeout(function(){ window.print(); }, 250)">
  <div class="toolbar">
    <button class="btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
    <button class="btn btn-close" onclick="window.close()">✕ Close</button>
  </div>

  <div class="inv-sheet">
    <div class="inv-header">
      <div>
        <span class="inv-title-badge">TAX INVOICE</span>
        <div class="company-name">${COMPANY_PROFILE.name}</div>
        <div class="company-sub">${COMPANY_PROFILE.address}</div>
        <div class="company-sub">
          <strong>GSTIN:</strong> ${COMPANY_PROFILE.gstin} | <strong>State:</strong> ${COMPANY_PROFILE.state} (${COMPANY_PROFILE.stateCode}) | <strong>Phone:</strong> ${COMPANY_PROFILE.contact}
        </div>
      </div>
      <div class="meta-box">
        <div class="meta-row"><span class="meta-label">Invoice No:</span> <span class="meta-val">${invNo}</span></div>
        <div class="meta-row"><span class="meta-label">Invoice Date:</span> <span class="meta-val">${dateFormatted}</span></div>
        <div class="meta-row"><span class="meta-label">Warehouse:</span> <span class="meta-val">${warehouse}</span></div>
        <div class="meta-row"><span class="meta-label">E-Way Bill:</span> <span class="meta-val">${ewayBillNo}</span></div>
      </div>
    </div>

    <div class="party-grid">
      <div class="party-card">
        <h4>Billed From (Supplier)</h4>
        <div class="party-name">${supplierName}</div>
        <div class="party-detail"><strong>GSTIN / UIN:</strong> ${supplierGstin}</div>
        <div class="party-detail"><strong>State:</strong> ${COMPANY_PROFILE.state} (${COMPANY_PROFILE.stateCode})</div>
      </div>
      <div class="party-card">
        <h4>Shipped To / Consignee</h4>
        <div class="party-name">${consigneeName}</div>
        <div class="party-detail">${consigneeAddress}</div>
        <div class="party-detail"><strong>GSTIN / UIN:</strong> ${consigneeGstin}</div>
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th style="width:30px;">#</th>
          <th>Description of Goods</th>
          <th style="width:75px;">HSN / SAC</th>
          <th style="width:55px;">Qty</th>
          <th style="width:45px;">Unit</th>
          <th style="width:75px;">Rate (₹)</th>
          <th style="width:50px;">Disc %</th>
          <th style="width:90px;">Taxable Value (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${items.length === 0 ? `
          <tr>
            <td colspan="8" style="text-align:center; padding:15px; color:#64748b;">No line items registered on this invoice</td>
          </tr>
        ` : items.map((it) => `
          <tr>
            <td class="col-c">${it.sNo}</td>
            <td style="font-weight:700;">${it.description}</td>
            <td class="col-c">${it.hsnCode}</td>
            <td class="col-r" style="font-weight:700;">${it.quantity.toLocaleString("en-IN")}</td>
            <td class="col-c">${it.unit}</td>
            <td class="col-r">₹${it.rate.toFixed(2)}</td>
            <td class="col-c">${it.discountPct > 0 ? it.discountPct + "%" : "—"}</td>
            <td class="col-r" style="font-weight:700;">₹${it.amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>

    <div class="summary-section">
      <div class="words-box">
        <div class="words-label">Amount Chargeable in Words</div>
        <div class="words-val">${amountInWords}</div>
        <div class="terms-box">
          * Terms: Goods once received cannot be returned. Subject to Gorakhpur jurisdiction.
        </div>
      </div>

      <table class="calc-table">
        <tbody>
          <tr>
            <td style="color:#64748b;">Subtotal (Taxable Value):</td>
            <td class="col-r" style="font-weight:700;">₹${totalItemAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
          </tr>
          ${cgstPct > 0 ? `
            <tr>
              <td style="color:#64748b;">CGST (${cgstPct}%):</td>
              <td class="col-r">₹${cgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
            </tr>
          ` : ""}
          ${sgstPct > 0 ? `
            <tr>
              <td style="color:#64748b;">SGST (${sgstPct}%):</td>
              <td class="col-r">₹${sgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
            </tr>
          ` : ""}
          ${igstPct > 0 ? `
            <tr>
              <td style="color:#64748b;">IGST (${igstPct}%):</td>
              <td class="col-r">₹${igstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
            </tr>
          ` : ""}
          <tr>
            <td style="color:#64748b;">Total GST Tax:</td>
            <td class="col-r" style="font-weight:700;">₹${totalTaxAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
          </tr>
          <tr class="grand-row">
            <td>Grand Total (₹):</td>
            <td class="col-r">₹${grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="footer-grid">
      <div class="bank-box">
        <strong>Bank Details for Settlement:</strong><br>
        Bank: State Bank of India | Branch: Betiah Hata, Gorakhpur<br>
        A/C Name: Kusum Ganga Agrosolutions Pvt Ltd<br>
        A/C No: 42019876543 | IFSC: SBIN0001234
      </div>
      <div class="sig-area">
        <div style="font-size:9px; font-weight:700; text-transform:uppercase;">For ${COMPANY_PROFILE.name}</div>
        <div class="sig-line">Authorized Signatory</div>
      </div>
    </div>
  </div>
</body>
</html>`;

  function handleDirectPrint() {
    toast.info("Preparing print preview...");
    let iframe = document.getElementById("invoice-print-frame");
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.id = "invoice-print-frame";
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      document.body.appendChild(iframe);
    }
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(printableHTMLContent);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (err) {
        console.warn("Iframe print fallback:", err);
        window.print();
      }
    }, 350);
  }

  function handleOpenChromePDFWindow() {
    const printWin = window.open("", "_blank");
    if (printWin) {
      printWin.document.write(printableHTMLContent);
      printWin.document.close();
      printWin.focus();
      toast.success("Chrome PDF tab opened!");
    } else {
      toast.error("Pop-up blocked. Please enable pop-ups to open PDF window.");
    }
  }

  function handleDownloadInvoiceFile() {
    const blob = new Blob([printableHTMLContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Tax_Invoice_${invNo}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Invoice ${invNo} downloaded!`);
  }

  function handleCopyText() {
    navigator.clipboard.writeText(invoiceSummaryText);
    setCopied(true);
    toast.success("Invoice summary copied!");
    setTimeout(() => setCopied(false), 2500);
  }

  function handleDirectWhatsAppSend() {
    let cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone && !cleanPhone.startsWith("91") && cleanPhone.length === 10) {
      cleanPhone = "91" + cleanPhone;
    }
    const url = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(invoiceSummaryText)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(invoiceSummaryText)}`;

    window.open(url, "_blank");
    toast.success("WhatsApp window opened!");
  }

  return (
    <Modal open={isOpen} onClose={onClose} title="Tax Invoice Viewer & Print Studio" width={840}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Top Quick Actions Bar */}
        <div
          className="no-print invoice-toolbar"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 8,
            padding: "8px 12px",
            background: "var(--surface-hover)",
            borderRadius: 10,
            border: "1px solid var(--line)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: "var(--primary-deep)",
                background: "var(--primary-tint)",
                padding: "3px 8px",
                borderRadius: 6,
                letterSpacing: "0.2px",
              }}
            >
              {invNo}
            </span>
            <span style={{ fontSize: 11.5, color: "var(--ink-secondary)", fontWeight: 600 }}>
              {supplierName}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={handleOpenChromePDFWindow}
              style={{
                padding: "6px 12px",
                fontSize: 11.5,
                fontWeight: 700,
                borderRadius: 8,
                border: "1px solid #0284c7",
                background: "#f0f9ff",
                color: "#0369a1",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
              title="Open in dedicated tab with PDF print preset"
            >
              <i className="ri-external-link-line" /> Open PDF Tab
            </button>

            <button
              type="button"
              onClick={handleDownloadInvoiceFile}
              style={{
                padding: "6px 12px",
                fontSize: 11.5,
                fontWeight: 700,
                borderRadius: 8,
                border: "1px solid var(--line-strong)",
                background: "var(--surface)",
                color: "var(--ink)",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
              title="Download standalone HTML invoice"
            >
              <i className="ri-download-2-line" /> Download HTML
            </button>

            <Button
              onClick={handleDirectPrint}
              style={{
                padding: "6px 16px",
                fontSize: 12,
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <i className="ri-printer-line" /> Print / Save as PDF
            </Button>
          </div>
        </div>

        {/* Live Printable Invoice Card Preview (Print Target) */}
        <div
          id="printable-invoice-card"
          className="printable-invoice-card"
          style={{
            background: "#ffffff",
            color: "#0f172a",
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            border: "1.5px solid #0f172a",
            borderRadius: 6,
            padding: "16px 20px",
            fontSize: 11,
            lineHeight: 1.35,
            boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              borderBottom: "1.5px solid #0f172a",
              paddingBottom: 10,
              marginBottom: 10,
              gap: 12,
            }}
          >
            <div>
              <span
                style={{
                  display: "inline-block",
                  background: "#166534",
                  color: "#ffffff",
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: "1px",
                  padding: "2px 8px",
                  borderRadius: 3,
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                TAX INVOICE
              </span>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#0f172a", textTransform: "uppercase" }}>
                {COMPANY_PROFILE.name}
              </div>
              <div style={{ fontSize: 9.5, color: "#475569", marginTop: 2, maxWidth: 440 }}>
                {COMPANY_PROFILE.address}
              </div>
              <div style={{ fontSize: 9.5, color: "#475569", marginTop: 2 }}>
                <strong>GSTIN:</strong> {COMPANY_PROFILE.gstin} | <strong>State:</strong> {COMPANY_PROFILE.state} ({COMPANY_PROFILE.stateCode}) | <strong>Phone:</strong> {COMPANY_PROFILE.contact}
              </div>
            </div>

            <div style={{ textAlign: "right", fontSize: 10.5, flexShrink: 0 }}>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginBottom: 2 }}>
                <span style={{ color: "#64748b", fontWeight: 600 }}>Invoice No:</span>
                <span style={{ fontWeight: 800, color: "#0f172a" }}>{invNo}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginBottom: 2 }}>
                <span style={{ color: "#64748b", fontWeight: 600 }}>Invoice Date:</span>
                <span style={{ fontWeight: 800, color: "#0f172a" }}>{dateFormatted}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginBottom: 2 }}>
                <span style={{ color: "#64748b", fontWeight: 600 }}>Warehouse:</span>
                <span style={{ fontWeight: 800, color: "#0f172a" }}>{warehouse}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                <span style={{ color: "#64748b", fontWeight: 600 }}>E-Way Bill:</span>
                <span style={{ fontWeight: 700, color: "#0f172a" }}>{ewayBillNo}</span>
              </div>
            </div>
          </div>

          {/* Party Details 2-Col Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              border: "1px solid #cbd5e1",
              background: "#f8fafc",
              padding: "8px 12px",
              marginBottom: 12,
              borderRadius: 4,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 9.5,
                  fontWeight: 800,
                  color: "#166534",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: 3,
                  borderBottom: "1px solid #e2e8f0",
                  paddingBottom: 2,
                }}
              >
                Billed From (Supplier)
              </div>
              <div style={{ fontSize: 11.5, fontWeight: 800, color: "#0f172a" }}>{supplierName}</div>
              <div style={{ fontSize: 9.5, color: "#334155", marginTop: 2 }}>
                <strong>GSTIN / UIN:</strong> {supplierGstin}
              </div>
              <div style={{ fontSize: 9.5, color: "#334155" }}>
                <strong>State:</strong> {COMPANY_PROFILE.state} ({COMPANY_PROFILE.stateCode})
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: 9.5,
                  fontWeight: 800,
                  color: "#166534",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: 3,
                  borderBottom: "1px solid #e2e8f0",
                  paddingBottom: 2,
                }}
              >
                Shipped To (Consignee)
              </div>
              <div style={{ fontSize: 11.5, fontWeight: 800, color: "#0f172a" }}>{consigneeName}</div>
              <div style={{ fontSize: 9.5, color: "#334155", marginTop: 2 }}>{consigneeAddress}</div>
              <div style={{ fontSize: 9.5, color: "#334155" }}>
                <strong>GSTIN / UIN:</strong> {consigneeGstin}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: 10,
              border: "1px solid #0f172a",
            }}
          >
            <thead>
              <tr style={{ background: "#f1f5f9" }}>
                <th style={{ border: "1px solid #94a3b8", padding: "5px 6px", fontSize: 9.5, fontWeight: 800, width: 28, textAlign: "center" }}>#</th>
                <th style={{ border: "1px solid #94a3b8", padding: "5px 8px", fontSize: 9.5, fontWeight: 800, textAlign: "left" }}>Description of Goods</th>
                <th style={{ border: "1px solid #94a3b8", padding: "5px 6px", fontSize: 9.5, fontWeight: 800, width: 75, textAlign: "center" }}>HSN / SAC</th>
                <th style={{ border: "1px solid #94a3b8", padding: "5px 6px", fontSize: 9.5, fontWeight: 800, width: 55, textAlign: "right" }}>Qty</th>
                <th style={{ border: "1px solid #94a3b8", padding: "5px 6px", fontSize: 9.5, fontWeight: 800, width: 45, textAlign: "center" }}>Unit</th>
                <th style={{ border: "1px solid #94a3b8", padding: "5px 6px", fontSize: 9.5, fontWeight: 800, width: 80, textAlign: "right" }}>Rate (₹)</th>
                <th style={{ border: "1px solid #94a3b8", padding: "5px 6px", fontSize: 9.5, fontWeight: 800, width: 50, textAlign: "center" }}>Disc %</th>
                <th style={{ border: "1px solid #94a3b8", padding: "5px 8px", fontSize: 9.5, fontWeight: 800, width: 95, textAlign: "right" }}>Taxable Value (₹)</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ border: "1px solid #94a3b8", textAlign: "center", padding: 14, color: "#64748b" }}>
                    No line items recorded on this invoice.
                  </td>
                </tr>
              ) : (
                items.map((it) => (
                  <tr key={it.sNo}>
                    <td style={{ border: "1px solid #94a3b8", padding: "4px 6px", textAlign: "center", fontSize: 10 }}>{it.sNo}</td>
                    <td style={{ border: "1px solid #94a3b8", padding: "4px 8px", fontWeight: 700, fontSize: 10 }}>{it.description}</td>
                    <td style={{ border: "1px solid #94a3b8", padding: "4px 6px", textAlign: "center", fontSize: 10 }}>{it.hsnCode}</td>
                    <td style={{ border: "1px solid #94a3b8", padding: "4px 6px", textAlign: "right", fontWeight: 700, fontSize: 10 }}>
                      {it.quantity.toLocaleString("en-IN")}
                    </td>
                    <td style={{ border: "1px solid #94a3b8", padding: "4px 6px", textAlign: "center", fontSize: 10 }}>{it.unit}</td>
                    <td style={{ border: "1px solid #94a3b8", padding: "4px 6px", textAlign: "right", fontSize: 10 }}>₹{it.rate.toFixed(2)}</td>
                    <td style={{ border: "1px solid #94a3b8", padding: "4px 6px", textAlign: "center", fontSize: 10 }}>
                      {it.discountPct > 0 ? `${it.discountPct}%` : "—"}
                    </td>
                    <td style={{ border: "1px solid #94a3b8", padding: "4px 8px", textAlign: "right", fontWeight: 700, fontSize: 10 }}>
                      ₹{it.amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Calculations & Words Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr",
              gap: 12,
              marginBottom: 10,
            }}
          >
            <div
              style={{
                border: "1px solid #cbd5e1",
                padding: "8px 10px",
                borderRadius: 4,
                background: "#fafafa",
              }}
            >
              <div style={{ fontSize: 9, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                Amount Chargeable in Words
              </div>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: "#0f172a", marginTop: 3 }}>
                {amountInWords}
              </div>
              <div style={{ fontSize: 8.5, color: "#64748b", marginTop: 8 }}>
                * Declaration: Certified that the particulars given above are true and correct.
              </div>
            </div>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                border: "1px solid #cbd5e1",
              }}
            >
              <tbody>
                <tr>
                  <td style={{ padding: "4px 8px", fontSize: 10, color: "#64748b", borderBottom: "1px solid #e2e8f0" }}>
                    Subtotal (Taxable Value):
                  </td>
                  <td style={{ padding: "4px 8px", fontSize: 10, fontWeight: 700, textAlign: "right", borderBottom: "1px solid #e2e8f0" }}>
                    ₹{totalItemAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
                {cgstPct > 0 && (
                  <tr>
                    <td style={{ padding: "4px 8px", fontSize: 10, color: "#64748b", borderBottom: "1px solid #e2e8f0" }}>
                      CGST ({cgstPct}%):
                    </td>
                    <td style={{ padding: "4px 8px", fontSize: 10, textAlign: "right", borderBottom: "1px solid #e2e8f0" }}>
                      ₹{cgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                )}
                {sgstPct > 0 && (
                  <tr>
                    <td style={{ padding: "4px 8px", fontSize: 10, color: "#64748b", borderBottom: "1px solid #e2e8f0" }}>
                      SGST ({sgstPct}%):
                    </td>
                    <td style={{ padding: "4px 8px", fontSize: 10, textAlign: "right", borderBottom: "1px solid #e2e8f0" }}>
                      ₹{sgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                )}
                {igstPct > 0 && (
                  <tr>
                    <td style={{ padding: "4px 8px", fontSize: 10, color: "#64748b", borderBottom: "1px solid #e2e8f0" }}>
                      IGST ({igstPct}%):
                    </td>
                    <td style={{ padding: "4px 8px", fontSize: 10, textAlign: "right", borderBottom: "1px solid #e2e8f0" }}>
                      ₹{igstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                )}
                <tr>
                  <td style={{ padding: "4px 8px", fontSize: 10, color: "#64748b", borderBottom: "1px solid #e2e8f0" }}>
                    Total GST Tax:
                  </td>
                  <td style={{ padding: "4px 8px", fontSize: 10, fontWeight: 700, textAlign: "right", borderBottom: "1px solid #e2e8f0" }}>
                    ₹{totalTaxAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr style={{ background: "#f0fdf4" }}>
                  <td style={{ padding: "5px 8px", fontSize: 12, fontWeight: 900, color: "#166534", borderTop: "1.5px solid #166534" }}>
                    Grand Total (₹):
                  </td>
                  <td style={{ padding: "5px 8px", fontSize: 12.5, fontWeight: 900, color: "#166534", textAlign: "right", borderTop: "1.5px solid #166534" }}>
                    ₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.3fr 1fr",
              gap: 12,
              borderTop: "1px solid #cbd5e1",
              paddingTop: 8,
              marginTop: 6,
            }}
          >
            <div style={{ fontSize: 9, color: "#475569", lineHeight: 1.4 }}>
              <strong style={{ color: "#0f172a" }}>Bank Details for Settlement:</strong><br />
              Bank: State Bank of India | Branch: Betiah Hata, Gorakhpur<br />
              A/C Name: Kusum Ganga Agrosolutions Pvt Ltd<br />
              A/C No: 42019876543 | IFSC: SBIN0001234
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "flex-end", textAlign: "center" }}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" }}>
                For {COMPANY_PROFILE.name}
              </div>
              <div style={{ width: 150, borderTop: "1px solid #0f172a", marginTop: 40, paddingTop: 3, fontSize: 9.5, fontWeight: 700 }}>
                Authorized Signatory
              </div>
            </div>
          </div>
        </div>

        {/* Quick WhatsApp & Share Strip */}
        <div
          className="no-print whatsapp-strip"
          style={{
            background: "var(--surface-hover)",
            border: "1px solid var(--line)",
            borderRadius: 10,
            padding: "8px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 260 }}>
            <i className="ri-whatsapp-line" style={{ color: "#16a34a", fontSize: 16 }} />
            <input
              type="text"
              placeholder="Enter phone number (e.g. 9876543210)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                flex: 1,
                padding: "5px 10px",
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid var(--line-strong)",
                background: "var(--surface)",
                color: "var(--ink)",
                outline: "none",
              }}
            />
            <button
              type="button"
              onClick={handleDirectWhatsAppSend}
              style={{
                padding: "5px 12px",
                fontSize: 11.5,
                fontWeight: 700,
                borderRadius: 8,
                border: "none",
                background: "#16a34a",
                color: "#ffffff",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              Share
            </button>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
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
                gap: 4,
              }}
            >
              <i className={copied ? "ri-check-line" : "ri-file-copy-line"} />
              {copied ? "Copied!" : "Copy Summary"}
            </button>

            <Button variant="secondary" onClick={onClose} style={{ padding: "5px 14px", fontSize: 12 }}>
              Close
            </Button>
          </div>
        </div>
      </div>

      {/* Media Print Engine isolating printable invoice card */}
      <style>{`
        @media print {
          html, body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          #root,
          .app-sidebar,
          .app-header,
          .no-print,
          .invoice-toolbar,
          .whatsapp-strip,
          .p-dialog-header {
            display: none !important;
          }
          .p-dialog-mask {
            display: block !important;
            position: static !important;
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
          .p-dialog {
            display: block !important;
            position: static !important;
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .p-dialog-content {
            display: block !important;
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
          }
          #printable-invoice-card {
            display: block !important;
            visibility: visible !important;
            position: static !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 auto !important;
            padding: 6mm !important;
            border: 1.5px solid #000000 !important;
            box-shadow: none !important;
            background: #ffffff !important;
            color: #000000 !important;
            border-radius: 0 !important;
            page-break-inside: avoid !important;
          }
          #printable-invoice-card * {
            visibility: visible !important;
          }
        }
      `}</style>
    </Modal>
  );
}
