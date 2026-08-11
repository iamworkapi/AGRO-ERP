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

export default function Weighment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isScopedRole = user?.roleKey === "supervisor" || user?.roleKey === "warehouse_admin";
  const { warehouses } = useWarehouses();
  const myWarehouseName = isScopedRole ? warehouses[0]?.name : null;

  const { entries, status, error } = useStockEntries();

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

  function handleShareWhatsApp(r) {
    const grossMt = (r.grossWeightKg / 1000).toFixed(3);
    const tareMt = (r.tareWeightKg / 1000).toFixed(3);
    const netMt = (r.netWeightKg / 1000).toFixed(3);
    const actualMt = (r.actualWeightMt || netMt).toString();
    const rate = r.ratePerMt || 1900;
    const totalAmt = r.totalAmountRs || 0;

    const text =
      `🌾 *KUSUMGANGA AGRO SOLUTIONS PVT. LTD.* 🌾\n` +
      `🏢 *Center:* ${r.warehouse || "Gorakhpur Center"}\n` +
      `📜 *Slip No:* ${r.slipNo}\n` +
      `📅 *Date:* ${r.createdAt}\n` +
      `🌾 *Commodity:* ${r.commodity}\n` +
      `👤 *Party:* ${r.partyName || "—"}\n` +
      `🚛 *Vehicle No:* ${r.vehicleNo || "—"}\n` +
      `-----------------------------------\n` +
      `⚖️ *Gross Weight:* ${grossMt} MT\n` +
      `⚖️ *Tare Weight:* ${tareMt} MT\n` +
      `⚖️ *Net Weight:* ${netMt} MT\n` +
      `💧 *Moisture:* ${r.moisturePct || 20}% (Allowed: ${r.allowedMoisturePct || 20}%)\n` +
      `✂️ *Deduction:* ${r.deductionPct || 0}%\n` +
      `⚖️ *Actual Payable Weight:* ${actualMt} MT\n` +
      `💰 *Rate:* ₹${rate.toLocaleString("en-IN")} / MT\n` +
      `💵 *TOTAL AMOUNT:* ₹${totalAmt.toLocaleString("en-IN")}\n` +
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
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <PageHeader
        title={isScopedRole ? `PRALLI Weighment Slips — ${myWarehouseName || "your warehouse"}` : "PRALLI Daily Weight Register & Procurement Ledger"}
        subtitle={
          isScopedRole
            ? `Digitised PRALLI weighment slips & daily purchase register for ${myWarehouseName || "your assigned warehouse"}`
            : "Digitised PRALLI weighment slips & daily procurement register with moisture cut, auto bill calculation and print studio"
        }
      />

      <AsyncState status={status} error={error} loadingLabel="Loading weighment slips…" />

      {/* COMPACT STAT METRICS BAR */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }} className="responsive-grid-2">
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--primary-tint)", color: "var(--primary-deep)", display: "flex", alignItems: "center", justify: "center", fontSize: 14 }}>
            <i className="fa-solid fa-file-invoice" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>Total Slips</p>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)", marginTop: 2 }}>{filteredEntries.length} Slips</div>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: "#D1FAE5", color: "#059669", display: "flex", alignItems: "center", justify: "center", fontSize: 14 }}>
            <i className="fa-solid fa-circle-check" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>Approved Slips</p>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)", marginTop: 2 }}>{approvedCount}</div>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--primary-tint)", color: "var(--primary-deep)", display: "flex", alignItems: "center", justify: "center", fontSize: 14 }}>
            <i className="fa-solid fa-scale-balanced" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>Actual Net Weight</p>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--ink)", marginTop: 2 }}>{totalNetMt.toFixed(2)} MT</div>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: "#FEF3C7", color: "#D97706", display: "flex", alignItems: "center", justify: "center", fontSize: 14 }}>
            <i className="fa-solid fa-indian-rupee-sign" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>Total Purchase Bill</p>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--primary-deep)", marginTop: 2 }}>
              ₹{totalAmountSum.toLocaleString("en-IN")}
            </div>
          </div>
        </div>
      </div>

      {/* VIEW SELECTION TAB BAR, COMMODITY FILTER & ACTIONS */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--line)", paddingBottom: 8, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            type="button"
            onClick={() => setActiveTab("register")}
            style={{
              padding: "7px 14px",
              fontSize: 12.5,
              fontWeight: 700,
              borderRadius: 8,
              border: activeTab === "register" ? "1px solid var(--primary)" : "1px solid var(--line)",
              background: activeTab === "register" ? "var(--primary-tint)" : "var(--surface)",
              color: activeTab === "register" ? "var(--primary-deep)" : "var(--ink-secondary)",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <i className="fa-solid fa-table-cells" /> Daily Weight Register (Ledger View)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("list")}
            style={{
              padding: "7px 14px",
              fontSize: 12.5,
              fontWeight: 700,
              borderRadius: 8,
              border: activeTab === "list" ? "1px solid var(--primary)" : "1px solid var(--line)",
              background: activeTab === "list" ? "var(--primary-tint)" : "var(--surface)",
              color: activeTab === "list" ? "var(--primary-deep)" : "var(--ink-secondary)",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <i className="fa-solid fa-list-check" /> Slips Cards View
          </button>

          {/* Commodity Filter dropdown */}
          <select
            value={commodityFilter}
            onChange={(e) => setCommodityFilter(e.target.value)}
            style={{
              padding: "6px 10px",
              fontSize: 12,
              fontWeight: 600,
              borderRadius: 8,
              border: "1px solid var(--line-strong)",
              background: "var(--surface)",
              color: "var(--ink)",
              outline: "none"
            }}
          >
            <option value="ALL">All Commodities</option>
            <option value="Maize">Maize</option>
            <option value="Wheat">Wheat</option>
            <option value="Paddy">Paddy</option>
            <option value="PRALLI">PRALLI</option>
            <option value="Mustard">Mustard</option>
            <option value="Seeds">Seeds</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={handleExportCSV}
            style={{
              padding: "7px 12px",
              fontSize: 12,
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
            <i className="fa-solid fa-file-excel" /> Export Excel / CSV
          </button>

          <Button
            className="btn-glow"
            onClick={() => navigate("/weighment/new")}
            style={{
              padding: "7px 14px",
              fontSize: 12.5,
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "var(--gradient-primary)",
              boxShadow: "0 3px 10px rgba(0, 184, 107, 0.3)",
            }}
          >
            <i className="fa-solid fa-plus" /> New Weighment Slip
          </Button>
        </div>
      </div>

      {activeTab === "register" ? (
        /* Image 2 Style Daily Weight Register Table */
        <DataTable
          title="Daily Purchase & Weight Register (KUSUMGANGA AGRO SOLUTIONS)"
          searchable
          searchPlaceholder="Search slip no, party, vehicle, commodity..."
          keyField="id"
          rows={filteredEntries}
          emptyMessage="No weight register entries recorded yet."
          columns={[
            {
              key: "srNo",
              label: "Sr.",
              render: (_, options) => <span style={{ color: "var(--muted)", fontWeight: 600 }}>{(options?.rowIndex !== undefined ? options.rowIndex + 1 : 1)}</span>,
            },
            {
              key: "slipNo",
              label: "R.S.T No.",
              emphasize: true,
              render: (r) => (
                <button
                  type="button"
                  onClick={() => setSelectedSlipForPrint(r)}
                  title="Click to View & Print Receipt Slip PDF"
                  style={{
                    border: "1px solid #10B981",
                    background: "#E5F8F0",
                    color: "#009657",
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    transition: "all 0.15s ease",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = "#059669";
                    e.currentTarget.style.color = "#ffffff";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = "#E5F8F0";
                    e.currentTarget.style.color = "#009657";
                  }}
                >
                  <i className="fa-solid fa-print" style={{ fontSize: 11 }} />
                  #{r.slipNo}
                </button>
              ),
            },
            {
              key: "quickPrint",
              label: "Print Slip",
              render: (r) => (
                <button
                  type="button"
                  onClick={() => setSelectedSlipForPrint(r)}
                  style={{
                    padding: "4px 9px",
                    fontSize: 11.5,
                    fontWeight: 700,
                    borderRadius: 6,
                    border: "1px solid #059669",
                    background: "#f0fdf4",
                    color: "#059669",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    whiteSpace: "nowrap"
                  }}
                >
                  <i className="fa-solid fa-file-pdf" /> Print / View PDF
                </button>
              ),
            },
            {
              key: "vehicleNo",
              label: "Vehicle No.",
              render: (r) => (
                <span style={{ fontWeight: 600, fontFamily: "monospace" }}>{r.vehicleNo || "—"}</span>
              ),
            },
            {
              key: "createdAt",
              label: "Date",
              render: (r) => <span style={{ fontSize: 11.5 }}>{r.createdAt || "—"}</span>,
            },
            {
              key: "grossWeightKg",
              label: "Gross (MT)",
              render: (r) => (r.grossWeightKg / 1000).toFixed(3),
            },
            {
              key: "tareWeightKg",
              label: "Tare (MT)",
              render: (r) => (r.tareWeightKg / 1000).toFixed(3),
            },
            {
              key: "netWeightKg",
              label: "Net (MT)",
              render: (r) => <strong>{(r.netWeightKg / 1000).toFixed(3)}</strong>,
            },
            {
              key: "moisturePct",
              label: "Moisture %",
              render: (r) => (
                <span style={{ color: (r.moisturePct || 20) > (r.allowedMoisturePct || 20) ? "#d97706" : "var(--ink)", fontWeight: 600 }}>
                  {r.moisturePct != null ? `${r.moisturePct}%` : "20%"}
                </span>
              ),
            },
            {
              key: "allowedMoisturePct",
              label: "Allowed %",
              render: (r) => `${r.allowedMoisturePct || 20}%`,
            },
            {
              key: "diffPct",
              label: "Diff %",
              render: (r) => {
                const diff = Math.max(0, (r.moisturePct || 20) - (r.allowedMoisturePct || 20));
                return <span style={{ color: diff > 0 ? "#dc2626" : "var(--muted)" }}>{diff}%</span>;
              },
            },
            {
              key: "totalDeductionMt",
              label: "Total Ded. (MT)",
              render: (r) => (r.totalDeductionMt || 0).toFixed(3),
            },
            {
              key: "actualWeightMt",
              label: "Actual Wt. (MT)",
              render: (r) => <strong style={{ color: "var(--primary-deep)" }}>{(r.actualWeightMt || (r.netWeightKg / 1000)).toFixed(3)}</strong>,
            },
            {
              key: "ratePerMt",
              label: "Rate (Rs.)",
              render: (r) => `₹${(r.ratePerMt || 1900).toLocaleString("en-IN")}`,
            },
            {
              key: "totalAmountRs",
              label: "Total Amount (Rs.)",
              render: (r) => (
                <strong style={{ color: "#047857", fontSize: 13 }}>
                  ₹{(r.totalAmountRs || 0).toLocaleString("en-IN")}
                </strong>
              ),
            },
            {
              key: "actions",
              label: "Actions",
              render: (r) => (
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    type="button"
                    title="Print Receipt Slip"
                    onClick={() => setSelectedSlipForPrint(r)}
                    style={{
                      padding: "4px 8px",
                      fontSize: 11,
                      fontWeight: 600,
                      borderRadius: 6,
                      border: "1px solid var(--line)",
                      background: "var(--surface)",
                      color: "var(--primary-deep)",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <i className="fa-solid fa-print" /> Print
                  </button>

                  <button
                    type="button"
                    title="Share via WhatsApp"
                    onClick={() => handleShareWhatsApp(r)}
                    style={{
                      padding: "4px 8px",
                      fontSize: 11,
                      fontWeight: 700,
                      borderRadius: 6,
                      border: "1px solid #16a34a",
                      background: "#25D366",
                      color: "#fff",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <i className="fa-brands fa-whatsapp" /> WhatsApp
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
                <button
                  type="button"
                  onClick={() => setSelectedSlipForPrint(r)}
                  title="Click to View & Print Receipt Slip PDF"
                  style={{
                    border: "1px solid #10B981",
                    background: "#E5F8F0",
                    color: "#009657",
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <i className="fa-solid fa-print" style={{ fontSize: 11 }} />
                  #{r.slipNo}
                </button>
              ),
            },
            {
              key: "warehouse",
              label: "Centre",
              render: (r) => (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
                  <i className="fa-solid fa-warehouse" style={{ color: "var(--primary)", fontSize: 11 }} />
                  {r.warehouse}
                </span>
              ),
            },
            {
              key: "partyName",
              label: "Party / Supplier",
              render: (r) => (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i className="fa-solid fa-building-user" style={{ color: "var(--muted)", fontSize: 11 }} />
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
                  <i className="fa-solid fa-wheat-awn" style={{ color: "var(--muted)", fontSize: 11 }} />
                  {r.commodity}
                </span>
              ),
            },
            {
              key: "moisturePct",
              label: "Moisture",
              render: (r) => (
                <span style={{ fontWeight: 600, color: "#2563EB", display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <i className="fa-solid fa-droplet" style={{ fontSize: 10 }} />
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
              label: "Actions",
              render: (r) => (
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    type="button"
                    title="Print Receipt Slip"
                    onClick={() => setSelectedSlipForPrint(r)}
                    style={{
                      padding: "4px 8px",
                      fontSize: 11,
                      fontWeight: 600,
                      borderRadius: 6,
                      border: "1px solid var(--line)",
                      background: "var(--surface)",
                      color: "var(--primary-deep)",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <i className="fa-solid fa-print" /> Print
                  </button>

                  <button
                    type="button"
                    title="Share via WhatsApp"
                    onClick={() => handleShareWhatsApp(r)}
                    style={{
                      padding: "4px 8px",
                      fontSize: 11,
                      fontWeight: 700,
                      borderRadius: 6,
                      border: "1px solid #16a34a",
                      background: "#25D366",
                      color: "#fff",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <i className="fa-brands fa-whatsapp" /> WhatsApp
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
