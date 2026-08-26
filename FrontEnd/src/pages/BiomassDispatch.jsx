import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import DataTable from "../components/common/DataTable";
import Badge from "../components/common/Badge";
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
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [selectedGatePassForPrint, setSelectedGatePassForPrint] = useState(null);

  const filteredDispatches = useMemo(() => {
    return dispatches.filter((d) => {
      const matchBuyer =
        selectedBuyerFilter === "ALL" ||
        d.buyerName?.toLowerCase().includes(selectedBuyerFilter.toLowerCase());
      const matchStatus =
        statusFilter === "ALL" ||
        (d.status && d.status.toLowerCase().includes(statusFilter.toLowerCase()));
      return matchBuyer && matchStatus;
    });
  }, [dispatches, selectedBuyerFilter, statusFilter]);

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
  const avgRatePerMt = totalDispatchedMt > 0 ? Math.round(totalInvoiceRevenue / totalDispatchedMt) : 1900;

  function handleSaveDispatch(newDispatch) {
    const updated = saveNewDispatch(newDispatch);
    setDispatches(updated);
    setIsDispatchModalOpen(false);
    toast.success(`Gate Pass ${newDispatch.gatePassNo} generated for ${newDispatch.buyerName}!`);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, position: "relative" }}>
      {/* PAGE HEADER */}
      <PageHeader
        title="Stage 4: Factory Dispatches & Offtake Logistics"
        subtitle="Outbound Heavy Trailer Fleet, Industrial Plant Commercial Billing & GST-Compliant Gate Passes"
        actions={
          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="secondary" onClick={() => navigate("/biomass/buyers/create")}>
              <i className="ri-building-4-line" style={{ marginRight: 6 }} /> Register Buyer Plant
            </Button>
            <Button onClick={() => setIsDispatchModalOpen(true)}>
              <i className="ri-truck-line" style={{ marginRight: 6 }} /> Create Dispatch Gate Pass
            </Button>
          </div>
        }
      />

      {/* TOP SPATIAL KPI METRICS STRIP */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        {/* Metric 1: Total Dispatched Tonnage */}
        <div className="app-card" style={{ padding: "16px 18px", borderRadius: 16, background: "var(--surface)", border: "1px solid var(--line)", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Total Dispatched
            </span>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(0,210,255,0.12)", color: "#00D2FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
              <i className="ri-truck-fast-line" />
            </div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#00D2FF" }}>{totalDispatchedMt.toFixed(2)} MT</div>
          <span style={{ fontSize: 11, color: "var(--muted)", marginTop: 4, display: "block" }}>
            Heavy multi-axle trailers logged
          </span>
        </div>

        {/* Metric 2: Total Commercial Revenue */}
        <div className="app-card" style={{ padding: "16px 18px", borderRadius: 16, background: "var(--surface)", border: "1px solid var(--line)", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Total Billed Revenue
            </span>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(0,245,155,0.12)", color: "#00F59B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
              <i className="ri-money-rupee-circle-line" />
            </div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#00F59B" }}>₹{totalInvoiceRevenue.toLocaleString("en-IN")}</div>
          <span style={{ fontSize: 11, color: "var(--muted)", marginTop: 4, display: "block" }}>
            Avg Realization: ₹{avgRatePerMt.toLocaleString("en-IN")}/MT
          </span>
        </div>

        {/* Metric 3: Total Bales Dispatched */}
        <div className="app-card" style={{ padding: "16px 18px", borderRadius: 16, background: "var(--surface)", border: "1px solid var(--line)", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Dispatched Bales
            </span>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(255,184,0,0.12)", color: "#FFB800", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
              <i className="ri-archive-line" />
            </div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#FFB800" }}>{totalBalesDispatched.toLocaleString("en-IN")} Bales</div>
          <span style={{ fontSize: 11, color: "var(--muted)", marginTop: 4, display: "block" }}>
            Offloaded from storage stacks
          </span>
        </div>

        {/* Metric 4: Industrial Buyer Plants */}
        <div className="app-card" style={{ padding: "16px 18px", borderRadius: 16, background: "var(--surface)", border: "1px solid var(--line)", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Active Buyer Plants
            </span>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(168,85,247,0.12)", color: "#A855F7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
              <i className="ri-shield-user-line" />
            </div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "var(--ink)" }}>{buyersList.length} Plants</div>
          <span style={{ fontSize: 11, color: "#00F59B", fontWeight: 700, marginTop: 4, display: "block" }}>
            Bio-Ethanol, CBG &amp; Power Stations
          </span>
        </div>
      </div>

      {/* INDUSTRIAL BUYERS & OFFTAKE DIRECTORY MATRIX */}
      <div
        className="app-card"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: 18,
          padding: "20px 22px",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, borderBottom: "1px solid var(--line)", paddingBottom: 10, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 900, color: "var(--ink)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 8 }}>
              <i className="ri-building-4-line" style={{ color: "var(--primary)", fontSize: 17 }} />
              Industrial Buyer Plant Directories &amp; Fulfillment Tracking
            </h3>
            <p style={{ margin: "3px 0 0", fontSize: 11.5, color: "var(--muted)" }}>
              Active off-takers with commercial contracts, delivery sites, GSTIN, and contracted quota delivery progress
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/biomass/buyers")}
            style={{
              fontSize: 11.5,
              fontWeight: 800,
              color: "var(--primary)",
              background: "var(--canvas)",
              border: "1px solid var(--line)",
              padding: "6px 12px",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            View All {buyersList.length} Buyer Profiles &rarr;
          </button>
        </div>

        {/* Buyers Grid Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }} className="responsive-grid-1">
          {buyersList.map((b) => {
            const targetQty = b.targetQtyMt || 5000;
            const fulfilledQty = b.fulfilledQtyMt || 2450;
            const progressPct = Math.min(100, Math.round((fulfilledQty / targetQty) * 100));

            return (
              <div
                key={b.id}
                className="app-card hover-card"
                style={{
                  background: "var(--canvas)",
                  border: "1px solid var(--line)",
                  borderRadius: 14,
                  padding: "16px 18px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                    <span style={{ fontSize: 10.5, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>
                      {b.plantType || "Industrial Off-taker"}
                    </span>
                    <span style={{ fontSize: 10.5, fontWeight: 800, color: "#00F59B", background: "rgba(0,245,155,0.12)", padding: "2px 8px", borderRadius: 12 }}>
                      PO: {b.poNo || "Active"}
                    </span>
                  </div>

                  <h4 style={{ margin: 0, fontSize: 14.5, fontWeight: 900, color: "var(--ink)" }}>{b.name}</h4>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#00D2FF", marginTop: 2 }}>{b.division}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4, lineHeight: 1.3, display: "flex", alignItems: "center", gap: 4 }}>
                    <i className="ri-map-pin-line" style={{ fontSize: 12, color: "var(--muted)" }} />
                    {b.address ? b.address.slice(0, 75) + "…" : "Industrial Site"}
                  </div>

                  {/* Quota Progress Bar */}
                  <div style={{ marginTop: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, marginBottom: 3 }}>
                      <span style={{ color: "var(--muted)" }}>Contract Fulfillment</span>
                      <span style={{ color: "var(--ink)" }}>
                        {fulfilledQty.toLocaleString("en-IN")} / {targetQty.toLocaleString("en-IN")} MT ({progressPct}%)
                      </span>
                    </div>
                    <div style={{ height: 5, width: "100%", background: "var(--line)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${progressPct}%`, height: "100%", background: "var(--primary)", borderRadius: 3 }} />
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--line)", paddingTop: 8, marginTop: 4 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 800, color: "var(--ink)" }}>GST: {b.gstin}</span>
                  <span style={{ fontSize: 11.5, fontWeight: 900, color: "#FFB800" }}>₹{b.agreedRatePerMt || 1850}/MT</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* OUTBOUND DISPATCHES REGISTER TABLE */}
      <div
        className="app-card"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: 18,
          padding: "20px 22px",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 900, color: "var(--ink)", display: "flex", alignItems: "center", gap: 8 }}>
              <i className="ri-file-list-3-line" style={{ color: "var(--primary)", fontSize: 17 }} />
              Outbound Industrial Deliveries &amp; E-Way Gate Pass Register
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "var(--muted)" }}>
              Official transport gate passes with net weights, e-way bills, and printable challans
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {/* Buyer Filter */}
            <select
              value={selectedBuyerFilter}
              onChange={(e) => setSelectedBuyerFilter(e.target.value)}
              style={{
                padding: "6px 12px",
                fontSize: 12,
                fontWeight: 700,
                borderRadius: 8,
                border: "1px solid var(--line-strong)",
                background: "var(--canvas)",
                color: "var(--ink)",
                outline: "none",
              }}
            >
              <option value="ALL">All Industrial Buyers</option>
              {buyersList.map((b) => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: "6px 12px",
                fontSize: 12,
                fontWeight: 700,
                borderRadius: 8,
                border: "1px solid var(--line-strong)",
                background: "var(--canvas)",
                color: "var(--ink)",
                outline: "none",
              }}
            >
              <option value="ALL">All Delivery Statuses</option>
              <option value="DELIVERED">Delivered &amp; Reconciled</option>
              <option value="TRANSIT">In Transit to Site</option>
              <option value="PENDING">Pending Loading</option>
            </select>
          </div>
        </div>


        <DataTable
          searchable
          searchPlaceholder="Search gate pass, vehicle trailer, buyer, commodity..."
          keyField="id"
          rows={filteredDispatches}
          emptyMessage="No outbound dispatches found matching criteria."
          columns={[
            {
              key: "gatePassNo",
              label: "Gate Pass No.",
              emphasize: true,
              render: (r) => (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(0,210,255,0.12)", color: "#00D2FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>
                    <i className="ri-file-text-line" />
                  </div>
                  <div>
                    <strong style={{ color: "var(--ink)" }}>{r.gatePassNo}</strong>
                    <div style={{ fontSize: 10.5, color: "var(--muted)" }}>E-Way: {r.ewayBillNo || "Generated"}</div>
                  </div>
                </div>
              ),
            },
            {
              key: "date",
              label: "Dispatch Date",
              render: (r) => (
                <span style={{ fontSize: 12 }}>
                  {r.date ? new Date(r.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Recent"}
                </span>
              ),
            },
            {
              key: "buyerName",
              label: "Buyer / Consignee",
              render: (r) => (
                <div>
                  <strong style={{ color: "var(--ink)" }}>{r.buyerName}</strong>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>{r.division || "Offtake Division"}</div>
                </div>
              ),
            },
            {
              key: "vehicleNo",
              label: "Vehicle Trailer",
              render: (r) => (
                <span style={{ fontFamily: "monospace", fontWeight: 800, color: "var(--ink)", background: "var(--canvas)", padding: "3px 8px", borderRadius: 6, border: "1px solid var(--line)" }}>
                  {r.vehicleNo}
                </span>
              ),
            },
            {
              key: "commodity",
              label: "Commodity & Bales",
              render: (r) => (
                <div>
                  <div style={{ fontWeight: 600 }}>{r.cropName || "Paddy Straw"}</div>
                  <div style={{ fontSize: 11, color: "#00F59B" }}>{r.baleCount} Bales</div>
                </div>
              ),
            },
            {
              key: "dispatchedTonnageMt",
              label: "Net Weight",
              render: (r) => <strong style={{ color: "var(--ink)" }}>{r.dispatchedTonnageMt} MT</strong>,
            },
            {
              key: "totalInvoiceAmount",
              label: "Billed Total (₹)",
              render: (r) => (
                <div>
                  <strong style={{ color: "#00F59B", fontSize: 13 }}>
                    ₹{(r.totalInvoiceAmount || 0).toLocaleString("en-IN")}
                  </strong>
                  <div style={{ fontSize: 10.5, color: "var(--muted)" }}>
                    @ ₹{r.agreedPriceMt || 1950}/MT
                  </div>
                </div>
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (r) => (
                <Badge tone={r.status?.includes("DELIVERED") ? "success" : "info"}>
                  {r.status || "IN TRANSIT"}
                </Badge>
              ),
            },
            {
              key: "actions",
              label: "Pass Action",
              render: (r) => (
                <button
                  type="button"
                  onClick={() => setSelectedGatePassForPrint(r)}
                  style={{
                    padding: "6px 12px",
                    fontSize: 11,
                    fontWeight: 800,
                    background: "var(--primary-tint)",
                    color: "var(--primary-deep)",
                    border: "1px solid var(--primary)",
                    borderRadius: 6,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <i className="ri-printer-line" /> View Pass
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
