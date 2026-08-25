import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import DataTable from "../components/common/DataTable";
import Button from "../components/common/Button";
import NewBiomassDispatchModal from "../components/biomass/NewBiomassDispatchModal";
import BiomassGatePassModal from "../components/biomass/BiomassGatePassModal";
import {
  getStoredDispatches,
  getStoredBuyers,
  saveNewDispatch,
} from "../features/biomass/biomassService";
import { toast } from "../utils/toast";

export default function BiomassDispatch() {
  const navigate = useNavigate();
  const [dispatches, setDispatches] = useState(getStoredDispatches);
  const [buyersList] = useState(getStoredBuyers);
  const [selectedBuyerFilter, setSelectedBuyerFilter] = useState("ALL");

  // Modals
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [selectedGatePassForPrint, setSelectedGatePassForPrint] = useState(null);

  const filteredDispatches = useMemo(() => {
    if (selectedBuyerFilter === "ALL") return dispatches;
    return dispatches.filter((d) => d.buyerName?.toLowerCase().includes(selectedBuyerFilter.toLowerCase()));
  }, [dispatches, selectedBuyerFilter]);

  const totalDispatchedMt = useMemo(
    () => dispatches.reduce((s, d) => s + (Number(d.dispatchedTonnageMt) || 0), 0),
    [dispatches]
  );
  const totalInvoiceRevenue = useMemo(
    () => dispatches.reduce((s, d) => s + (Number(d.totalInvoiceAmount) || 0), 0),
    [dispatches]
  );
  const totalBalesDispatched = useMemo(
    () => dispatches.reduce((s, d) => s + (Number(d.baleCount) || 0), 0),
    [dispatches]
  );

  function handleSaveDispatch(newDispatch) {
    const updated = saveNewDispatch(newDispatch);
    setDispatches(updated);
    setIsDispatchModalOpen(false);
    toast.success(`Gate Pass ${newDispatch.gatePassNo} generated for ${newDispatch.buyerName}!`);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* PAGE HEADER */}
      <PageHeader
        title="🚚 Stage 4: Factory Dispatches (फ़ैक्ट्री प्रेषण)"
        subtitle="Outbound Heavy Trailer Deliveries, Industrial Buyer Billing & Dispatch Gate Passes (Reliance, Balrampur, CBG Plants)"
      />

      {/* TOP KPI CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }} className="responsive-grid-2">
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "#EFF6FF", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            <i className="fa-solid fa-truck-fast" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Total Dispatched MT</p>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#2563EB", marginTop: 2 }}>{totalDispatchedMt.toFixed(2)} MT</div>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>Heavy Trailers Dispatched</span>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "#ECFDF5", color: "#047857", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            <i className="fa-solid fa-indian-rupee-sign" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Total Billed Revenue</p>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#047857", marginTop: 2 }}>₹{totalInvoiceRevenue.toLocaleString("en-IN")}</div>
            <span style={{ fontSize: 11, color: "#059669", fontWeight: 700 }}>Active Invoices</span>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "#FEF3C7", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            <i className="fa-solid fa-boxes-packing" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Dispatched Bales</p>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#D97706", marginTop: 2 }}>{totalBalesDispatched.toLocaleString("en-IN")} Bales</div>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>From Yard Stacks</span>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "#FAF5FF", color: "#7E22CE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            <i className="fa-solid fa-building-shield" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Active Buyer Plants</p>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#7E22CE", marginTop: 2 }}>{buyersList.length} Plants</div>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>Bio-Ethanol & Power</span>
          </div>
        </div>
      </div>

      {/* PRE-SAVED BUYERS SECTION (IMAGE 1 SPEC: RELIANCE INDUSTRIES) */}
      <div style={{ background: "#FFFFFF", border: "2px solid #0F172A", borderRadius: 14, padding: 18, boxShadow: "0 4px 14px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, borderBottom: "1.5px solid #E2E8F0", paddingBottom: 10 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 900, color: "#0F172A", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 8 }}>
              <span>🏬</span> Industrial Buyer Plant Directories (जिस फ़ैक्ट्री को माल जाता है)
            </h3>
            <p style={{ margin: "3px 0 0", fontSize: 11.5, color: "#475569" }}>
              Consignee delivery addresses, GSTIN numbers, agreed commercial rates & plant supervisors
            </p>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <Button
              onClick={() => navigate("/biomass/buyers/create")}
              style={{ padding: "8px 14px", fontSize: 12, fontWeight: 800, background: "#2563EB", display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              ➕ Register New Buyer
            </Button>
            <Button
              onClick={() => setIsDispatchModalOpen(true)}
              style={{ padding: "8px 16px", fontSize: 12, fontWeight: 800, background: "#059669", display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              🚚 Create Dispatch Gate Pass
            </Button>
          </div>
        </div>

        {/* Buyers Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }} className="responsive-grid-1">
          {buyersList.map((b) => (
            <div key={b.id} style={{ background: "#F8FAFC", border: "1.5px solid #CBD5E1", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>Bill To / Consignee Details:</div>
              <div style={{ fontSize: 15, fontWeight: 900, color: "#0F172A" }}>{b.name}</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#2563EB" }}>{b.division}</div>
              <div style={{ fontSize: 11, color: "#334155", textTransform: "uppercase", lineHeight: 1.4 }}>{b.address}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #E2E8F0", paddingTop: 8, marginTop: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 900, color: "#059669" }}>GSTIN: {b.gstin}</span>
                <span style={{ fontSize: 11.5, fontWeight: 800, color: "#D97706" }}>Agreed Rate: ₹{b.agreedRatePerMt || 1850}/MT</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DISPATCHES DATA TABLE */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "14px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 900, color: "var(--ink)" }}>
            📋 Stage 4: Outbound Industrial Deliveries Register
          </h3>
          <div style={{ display: "flex", gap: 10 }}>
            <select
              value={selectedBuyerFilter}
              onChange={(e) => setSelectedBuyerFilter(e.target.value)}
              style={{ padding: "6px 12px", fontSize: 12, borderRadius: 6, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink)" }}
            >
              <option value="ALL">All Industrial Buyers</option>
              {buyersList.map((b) => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        <DataTable
          searchable
          keyField="id"
          rows={filteredDispatches}
          columns={[
            { key: "gatePassNo", label: "GATE PASS NO.", emphasize: true },
            { key: "date", label: "DATE" },
            {
              key: "buyerName",
              label: "BUYER / CONSIGNEE",
              render: (r) => (
                <div>
                  <strong style={{ color: "var(--ink)" }}>{r.buyerName}</strong>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>{r.division}</div>
                </div>
              ),
            },
            {
              key: "vehicleNo",
              label: "TRAILER NO.",
              render: (r) => <span style={{ fontFamily: "monospace", fontWeight: 800 }}>{r.vehicleNo}</span>,
            },
            { key: "cropName", label: "COMMODITY" },
            { key: "baleCount", label: "BALES", render: (r) => `${r.baleCount} Bales` },
            { key: "dispatchedTonnageMt", label: "TONNAGE (MT)", render: (r) => `${r.dispatchedTonnageMt} MT` },
            {
              key: "totalInvoiceAmount",
              label: "TOTAL INVOICE (₹)",
              render: (r) => <strong style={{ color: "#2563EB", fontSize: 13 }}>₹{(r.totalInvoiceAmount || 0).toLocaleString("en-IN")}</strong>,
            },
            {
              key: "actions",
              label: "ACTIONS",
              render: (r) => (
                <button
                  onClick={() => setSelectedGatePassForPrint(r)}
                  style={{ padding: "4px 10px", fontSize: 11, fontWeight: 700, background: "#0F172A", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}
                >
                  🖨️ View & Print Pass
                </button>
              ),
            },
          ]}
        />
      </div>

      {/* MODALS */}
      <NewBiomassDispatchModal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        onSave={handleSaveDispatch}
      />

      <BiomassGatePassModal
        passData={selectedGatePassForPrint}
        onClose={() => setSelectedGatePassForPrint(null)}
      />
    </div>
  );
}
