import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import DataTable from "../components/common/DataTable";
import Button from "../components/common/Button";
import BiomassCollectionSlipModal from "../features/biomass/components/BiomassCollectionSlipModal";
import {
  getStoredCollections,
  calculateGrnInvoiceWeight,
} from "../features/biomass/biomassService";
import { toast } from "../utils/toast";

export default function BiomassProcessing() {
  const navigate = useNavigate();
  const [collections] = useState(getStoredCollections);
  const [selectedCrop, setSelectedCrop] = useState("ALL");
  const [selectedSlipForPrint, setSelectedSlipForPrint] = useState(null);

  // GRN Live Formula Interactive Calculator State
  const [calcNetWt, setCalcNetWt] = useState("10.00");
  const [calcActualMoist, setCalcActualMoist] = useState("22.5");
  const [calcActualAsh, setCalcActualAsh] = useState("18.0");
  const [calcAgreedMoist, setCalcAgreedMoist] = useState("20.0");
  const [calcAgreedAsh, setCalcAgreedAsh] = useState("20.0");

  const liveGrnResult = useMemo(() => {
    return calculateGrnInvoiceWeight(
      parseFloat(calcNetWt) || 10,
      parseFloat(calcActualMoist) || 20,
      parseFloat(calcActualAsh) || 20,
      parseFloat(calcAgreedMoist) || 20,
      parseFloat(calcAgreedAsh) || 20
    );
  }, [calcNetWt, calcActualMoist, calcActualAsh, calcAgreedMoist, calcAgreedAsh]);

  const filteredCollections = useMemo(() => {
    if (selectedCrop === "ALL") return collections;
    return collections.filter((c) => c.cropName?.toLowerCase().includes(selectedCrop.toLowerCase()));
  }, [collections, selectedCrop]);

  const totalActualNetMt = useMemo(
    () => collections.reduce((s, c) => s + (Number(c.actualNetWeightMt) || 0), 0),
    [collections]
  );
  const totalInvoiceMt = useMemo(
    () => collections.reduce((s, c) => s + (Number(c.invoiceWeightMt) || 0), 0),
    [collections]
  );
  const totalBalesProduced = useMemo(
    () => collections.reduce((s, c) => s + (Number(c.baleCountProduced) || 0), 0),
    [collections]
  );
  const avgMoisturePct = useMemo(() => {
    if (!collections.length) return 0;
    const sum = collections.reduce((s, c) => s + (Number(c.actualMoisturePct) || 0), 0);
    return (sum / collections.length).toFixed(1);
  }, [collections]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* PAGE HEADER */}
      <PageHeader
        title="⚙️ Stage 2: Process & Moisture Weight (प्रसंस्करण एवं नमी वजन)"
        subtitle="Standard GRN Lorry Weight Formula, Moisture / Ash Deduction Testing & Baler Compressing Log"
      />

      {/* TOP KPI CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }} className="responsive-grid-2">
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "#EFF6FF", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            <i className="fa-solid fa-scale-balanced" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Actual Net Weight</p>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#2563EB", marginTop: 2 }}>{totalActualNetMt.toFixed(2)} MT</div>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>Total Gross - Tare</span>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "#ECFDF5", color: "#047857", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            <i className="fa-solid fa-file-invoice" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Adjusted GRN Invoice</p>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#047857", marginTop: 2 }}>{totalInvoiceMt.toFixed(2)} MT</div>
            <span style={{ fontSize: 11, color: "#059669", fontWeight: 700 }}>After Quality Deductions</span>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "#FEF3C7", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            <i className="fa-solid fa-droplet" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Average Moisture %</p>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#D97706", marginTop: 2 }}>{avgMoisturePct}%</div>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>Standard Target: 20%</span>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "#FAF5FF", color: "#7E22CE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            <i className="fa-solid fa-boxes-stacked" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Total Bales Produced</p>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#7E22CE", marginTop: 2 }}>{totalBalesProduced} Bales</div>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>High Density Round Bales</span>
          </div>
        </div>
      </div>

      {/* LIVE FORMULA CALCULATOR (IMAGE 2 SPECIFICATION) */}
      <div style={{ background: "#FFFFFF", border: "2px solid #0F172A", borderRadius: 14, padding: 18, boxShadow: "0 4px 14px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, borderBottom: "1.5px solid #E2E8F0", paddingBottom: 10 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 900, color: "#0F172A", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 8 }}>
              <span>⚖️</span> Processing GRN Lorry Weight Formula (मानकीकृत बिलिंग सूत्र)
            </h3>
            <p style={{ margin: "3px 0 0", fontSize: 11.5, color: "#475569" }}>
              <strong>Formula:</strong> Actual Net Wt × (100% - Actual Moist% - Actual Ash%) / (100% - Agreed Moist% - Agreed Ash%)
            </p>
          </div>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#991B1B", background: "#FEE2E2", padding: "4px 12px", borderRadius: 8, border: "1px solid #FCA5A5" }}>
            Rejection Limit: Moisture &gt; 28% OR Ash &gt; 35%
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 14 }} className="responsive-grid-2">
          <div>
            <label style={{ fontSize: 11, fontWeight: 800, color: "#334155", display: "block", marginBottom: 4 }}>Actual Net Wt (MT)</label>
            <input type="number" step="0.01" value={calcNetWt} onChange={(e) => setCalcNetWt(e.target.value)} style={{ width: "100%", padding: "8px 10px", fontSize: 13, fontWeight: 900, borderRadius: 8, border: "1.5px solid #94A3B8" }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 800, color: "#334155", display: "block", marginBottom: 4 }}>Actual Moist %</label>
            <input type="number" step="0.1" value={calcActualMoist} onChange={(e) => setCalcActualMoist(e.target.value)} style={{ width: "100%", padding: "8px 10px", fontSize: 13, fontWeight: 900, borderRadius: 8, border: "1.5px solid #94A3B8" }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 800, color: "#334155", display: "block", marginBottom: 4 }}>Actual Ash %</label>
            <input type="number" step="0.1" value={calcActualAsh} onChange={(e) => setCalcActualAsh(e.target.value)} style={{ width: "100%", padding: "8px 10px", fontSize: 13, fontWeight: 900, borderRadius: 8, border: "1.5px solid #94A3B8" }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 800, color: "#334155", display: "block", marginBottom: 4 }}>Agreed Max Moist %</label>
            <input type="number" step="0.1" value={calcAgreedMoist} onChange={(e) => setCalcAgreedMoist(e.target.value)} style={{ width: "100%", padding: "8px 10px", fontSize: 13, fontWeight: 900, borderRadius: 8, border: "1.5px solid #94A3B8" }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 800, color: "#334155", display: "block", marginBottom: 4 }}>Agreed Max Ash %</label>
            <input type="number" step="0.1" value={calcAgreedAsh} onChange={(e) => setCalcAgreedAsh(e.target.value)} style={{ width: "100%", padding: "8px 10px", fontSize: 13, fontWeight: 900, borderRadius: 8, border: "1.5px solid #94A3B8" }} />
          </div>
        </div>

        {/* Calculation Result Banner */}
        <div style={{ background: liveGrnResult.isRejected ? "#FEE2E2" : "#ECFDF5", border: liveGrnResult.isRejected ? "1.5px solid #EF4444" : "1.5px solid #10B981", borderRadius: 10, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {liveGrnResult.isRejected ? (
            <div style={{ color: "#991B1B", fontWeight: 900, fontSize: 13.5 }}>
              🚨 REJECTION ALERT: {liveGrnResult.rejectionReason}
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#065F46" }}>
                Calculation: {calcNetWt} MT × (100% - {calcActualMoist}% - {calcActualAsh}%) / (100% - {calcAgreedMoist}% - {calcAgreedAsh}%) = <strong>{liveGrnResult.invoiceWeightMt} MT</strong>
              </div>
              <div style={{ fontSize: 15, fontWeight: 900, color: "#047857", marginTop: 4 }}>
                Final Adjusted GRN Weight for Invoice: {liveGrnResult.invoiceWeightMt} MT (Deduction: {liveGrnResult.deductionMt} MT)
              </div>
            </div>
          )}

          <Button
            onClick={() => navigate("/weighment/new")}
            style={{ padding: "8px 16px", fontSize: 12, fontWeight: 800, background: "#0F172A" }}
          >
            ⚖️ Create New Weighbridge Entry
          </Button>
        </div>
      </div>

      {/* FILTER & PROCESSING TABLE */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "14px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 900, color: "var(--ink)" }}>
            📋 Stage 2: Weighbridge & Baler Compressing Log
          </h3>
          <div style={{ display: "flex", gap: 10 }}>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              style={{ padding: "6px 12px", fontSize: 12, borderRadius: 6, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink)" }}
            >
              <option value="ALL">All Crops</option>
              <option value="paddy">Paddy Straw</option>
              <option value="maize">Maize Stalk</option>
              <option value="wheat">Wheat Straw</option>
            </select>
          </div>
        </div>

        <DataTable
          searchable
          keyField="id"
          rows={filteredCollections}
          columns={[
            { key: "slipNo", label: "SLIP NO.", emphasize: true },
            { key: "date", label: "DATE" },
            { key: "cropName", label: "CROP" },
            { key: "grossWeightMt", label: "GROSS (MT)" },
            { key: "tareWeightMt", label: "TARE (MT)" },
            { key: "actualNetWeightMt", label: "ACTUAL NET (MT)" },
            { key: "actualMoisturePct", label: "MOIST %", render: (r) => `${r.actualMoisturePct}%` },
            { key: "actualAshPct", label: "ASH %", render: (r) => `${r.actualAshPct}%` },
            {
              key: "invoiceWeightMt",
              label: "GRN INVOICE (MT)",
              render: (r) => <strong style={{ color: "#059669", fontSize: 13 }}>{r.invoiceWeightMt} MT</strong>,
            },
            { key: "balerMachine", label: "BALER MACHINE" },
            {
              key: "baleCountProduced",
              label: "BALES COUNT",
              render: (r) => <span style={{ fontWeight: 800 }}>{r.baleCountProduced} Bales</span>,
            },
            {
              key: "actions",
              label: "SLIP",
              render: (r) => (
                <button
                  onClick={() => setSelectedSlipForPrint(r)}
                  style={{ padding: "4px 10px", fontSize: 11, fontWeight: 700, background: "#EFF6FF", color: "#1E40AF", border: "1px solid #BFDBFE", borderRadius: 6, cursor: "pointer" }}
                >
                  🖨️ RST Slip
                </button>
              ),
            },
          ]}
        />
      </div>

      {/* RST SLIP MODAL */}
      <BiomassCollectionSlipModal
        slipData={selectedSlipForPrint}
        onClose={() => setSelectedSlipForPrint(null)}
      />
    </div>
  );
}
