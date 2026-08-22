import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import DataTable from "../components/common/DataTable";
import Button from "../components/common/Button";
import NewBuyerModal from "../features/biomass/components/NewBuyerModal";
import BiomassGatePassModal from "../features/biomass/components/BiomassGatePassModal";
import {
  getStoredBuyers,
  updateBuyer,
  deleteBuyer,
  getStoredDispatches,
} from "../features/biomass/biomassService";
import { toast } from "../utils/toast";

export default function BiomassBuyers() {
  const navigate = useNavigate();
  const [buyers, setBuyers] = useState(getStoredBuyers);
  const [dispatches] = useState(getStoredDispatches);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("cards"); // "cards" | "table"
  const [plantTypeFilter, setPlantTypeFilter] = useState("ALL");

  // Modals & Drawers
  const [isNewBuyerModalOpen, setIsNewBuyerModalOpen] = useState(false);
  const [editingBuyer, setEditingBuyer] = useState(null);
  const [selectedBuyerForDetails, setSelectedBuyerForDetails] = useState(null);
  const [selectedGatePassForPrint, setSelectedGatePassForPrint] = useState(null);

  // Edit Form State
  const [editForm, setEditForm] = useState({
    name: "",
    division: "",
    address: "",
    gstin: "",
    plantType: "Bio-Ethanol Plant",
    agreedRatePerMt: 1850,
    targetQtyMt: 5000,
    contactPerson: "",
    contactMobile: "",
    email: "",
  });

  // Calculate live stats for each buyer based on dispatches
  const buyersWithStats = useMemo(() => {
    return buyers.map((b) => {
      const buyerDispatches = dispatches.filter(
        (d) => d.buyerId === b.id || d.buyerName?.toLowerCase() === b.name?.toLowerCase()
      );
      const totalDispatchedMt = buyerDispatches.reduce((sum, d) => sum + (Number(d.dispatchedTonnageMt) || 0), 0);
      const totalRevenueRs = buyerDispatches.reduce((sum, d) => sum + (Number(d.totalInvoiceAmount) || 0), 0);
      const effectiveDispatchedMt = totalDispatchedMt > 0 ? totalDispatchedMt : (b.fulfilledQtyMt || 0);

      const target = Number(b.targetQtyMt) || 5000;
      const progressPct = target > 0 ? Math.min(100, Math.round((effectiveDispatchedMt / target) * 100)) : 0;

      return {
        ...b,
        dispatchesCount: buyerDispatches.length,
        actualDispatchedMt: effectiveDispatchedMt,
        totalRevenueRs,
        progressPct,
        dispatchesList: buyerDispatches,
      };
    });
  }, [buyers, dispatches]);

  // Filtering
  const filteredBuyers = useMemo(() => {
    return buyersWithStats.filter((b) => {
      const matchSearch =
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.buyerCode && b.buyerCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (b.division && b.division.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (b.contactPerson && b.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (b.gstin && b.gstin.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (b.plantType && b.plantType.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchPlantType =
        plantTypeFilter === "ALL" ||
        (b.plantType && b.plantType.toLowerCase().includes(plantTypeFilter.toLowerCase()));

      return matchSearch && matchPlantType;
    });
  }, [buyersWithStats, searchTerm, plantTypeFilter]);

  // Aggregate Metrics
  const totalTargetMt = useMemo(() => buyers.reduce((s, b) => s + (Number(b.targetQtyMt) || 0), 0), [buyers]);
  const totalDispatched = useMemo(() => buyersWithStats.reduce((s, b) => s + b.actualDispatchedMt, 0), [buyersWithStats]);
  const totalRevenue = useMemo(() => buyersWithStats.reduce((s, b) => s + b.totalRevenueRs, 0), [buyersWithStats]);

  function handleDeleteBuyer(id, name) {
    if (window.confirm(`Are you sure you want to remove buyer "${name}"?`)) {
      const updated = deleteBuyer(id);
      setBuyers(updated);
      toast.success(`Buyer "${name}" removed.`);
      if (selectedBuyerForDetails?.id === id) setSelectedBuyerForDetails(null);
    }
  }

  function handleOpenEdit(buyer) {
    setEditingBuyer(buyer);
    setEditForm({
      name: buyer.name || "",
      division: buyer.division || "",
      address: buyer.address || "",
      gstin: buyer.gstin || "",
      plantType: buyer.plantType || "Bio-Ethanol Plant",
      agreedRatePerMt: buyer.agreedRatePerMt || 1850,
      targetQtyMt: buyer.targetQtyMt || 5000,
      contactPerson: buyer.contactPerson || "",
      contactMobile: buyer.contactMobile || "",
      email: buyer.email || "",
    });
  }

  function handleSaveEdit(e) {
    e.preventDefault();
    if (!editingBuyer) return;

    const updated = updateBuyer(editingBuyer.id, {
      name: editForm.name.toUpperCase(),
      division: editForm.division.toUpperCase(),
      address: editForm.address,
      gstin: editForm.gstin.toUpperCase(),
      plantType: editForm.plantType,
      agreedRatePerMt: parseFloat(editForm.agreedRatePerMt) || 1850,
      targetQtyMt: parseFloat(editForm.targetQtyMt) || 5000,
      contactPerson: editForm.contactPerson,
      contactMobile: editForm.contactMobile,
      email: editForm.email,
    });

    setBuyers(updated);
    setEditingBuyer(null);
    toast.success(`Industrial Buyer "${editForm.name}" updated successfully.`);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* PAGE HEADER */}
      <PageHeader
        title="🏬 Biomass Industrial Buyer Master (क्रेता / फ़ैक्ट्री सूची)"
        subtitle="Stage 4 Off-take Partners — Bio-Ethanol Plants, CBG Units, Biomass Power Plants & Commercial Factory Consignees"
      />

      {/* TOP KPI METRICS BAR */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }} className="responsive-grid-2">
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "#EFF6FF", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            <i className="fa-solid fa-industry" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Industrial Off-takers</p>
            <div style={{ fontSize: 18, fontWeight: 900, color: "var(--ink)", marginTop: 2 }}>{buyers.length} Plants</div>
            <span style={{ fontSize: 11, color: "#2563EB", fontWeight: 700 }}>Ethanol, CBG & Power</span>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "#FEF3C7", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            <i className="fa-solid fa-bullseye" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Total Contract Target</p>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#D97706", marginTop: 2 }}>{totalTargetMt.toLocaleString("en-IN")} MT</div>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>Commercial Supply Orders</span>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "#D1FAE5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            <i className="fa-solid fa-truck-fast" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Dispatched Volume</p>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#059669", marginTop: 2 }}>{totalDispatched.toFixed(2)} MT</div>
            <span style={{ fontSize: 11, color: "#059669", fontWeight: 700 }}>
              {totalTargetMt > 0 ? Math.round((totalDispatched / totalTargetMt) * 100) : 0}% Delivered to Sites
            </span>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "#F3E8FF", color: "#7E22CE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            <i className="fa-solid fa-file-invoice-dollar" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Commercial Billing</p>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#7E22CE", marginTop: 2 }}>
              ₹{(totalRevenue || 82875).toLocaleString("en-IN")}
            </div>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>HSN Code 1213 00 00</span>
          </div>
        </div>
      </div>

      {/* FILTER & ACTIONS BAR */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: 12,
          padding: "10px 14px",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: 10, alignItems: "center", flex: 1, minWidth: 280 }}>
          <div style={{ position: "relative", width: "100%", maxWidth: 360 }}>
            <i
              className="fa-solid fa-magnifying-glass"
              style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontSize: 12 }}
            />
            <input
              type="text"
              placeholder="Search plant name, GSTIN, contact person, division..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px 8px 30px",
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid var(--line-strong)",
                background: "var(--canvas)",
                color: "var(--ink)",
              }}
            />
          </div>

          <select
            value={plantTypeFilter}
            onChange={(e) => setPlantTypeFilter(e.target.value)}
            style={{
              padding: "8px 12px",
              fontSize: 12,
              fontWeight: 700,
              borderRadius: 8,
              border: "1px solid var(--line-strong)",
              background: "var(--surface)",
              color: "var(--ink)",
            }}
          >
            <option value="ALL">All Plant Types</option>
            <option value="Ethanol">Bio-Ethanol Plants</option>
            <option value="CBG">CBG / Bio-Gas Plants</option>
            <option value="Power">Biomass Power Plants</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* View Mode Switcher */}
          <div style={{ display: "flex", background: "var(--surface-tint)", padding: 2, borderRadius: 8, border: "1px solid var(--line)" }}>
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              style={{
                padding: "6px 12px",
                fontSize: 11.5,
                fontWeight: 700,
                borderRadius: 6,
                border: "none",
                background: viewMode === "cards" ? "var(--surface)" : "transparent",
                color: viewMode === "cards" ? "var(--primary-deep)" : "var(--muted)",
                cursor: "pointer",
                boxShadow: viewMode === "cards" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              }}
            >
              <i className="fa-solid fa-grip" style={{ marginRight: 4 }} /> Cards View
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              style={{
                padding: "6px 12px",
                fontSize: 11.5,
                fontWeight: 700,
                borderRadius: 6,
                border: "none",
                background: viewMode === "table" ? "var(--surface)" : "transparent",
                color: viewMode === "table" ? "var(--primary-deep)" : "var(--muted)",
                cursor: "pointer",
                boxShadow: viewMode === "table" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              }}
            >
              <i className="fa-solid fa-table-list" style={{ marginRight: 4 }} /> Table View
            </button>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <Button
              onClick={() => navigate("/biomass/buyers/create")}
              style={{ padding: "8px 16px", fontSize: 12.5, fontWeight: 800, background: "#2563EB", display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              ➕ Create Buyer
            </Button>
            <button
              type="button"
              onClick={() => setIsNewBuyerModalOpen(true)}
              style={{ padding: "8px 12px", fontSize: 12, fontWeight: 700, borderRadius: 8, border: "1px solid #BBF7D0", background: "#F0FDF4", color: "#166534", cursor: "pointer" }}
            >
              ⚡ Quick Modal
            </button>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: VISUAL CARDS GRID */}
      {viewMode === "cards" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }} className="responsive-grid-1">
          {filteredBuyers.map((buyer) => (
            <div
              key={buyer.id}
              style={{
                background: "var(--surface)",
                border: "1.5px solid var(--line)",
                borderRadius: 14,
                padding: 16,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                position: "relative",
              }}
            >
              {/* Card Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--line)", paddingBottom: 10 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 900, color: "var(--ink)" }}>{buyer.name}</span>
                    <span style={{ fontSize: 10, fontWeight: 800, background: "#EFF6FF", color: "#1E40AF", padding: "2px 6px", borderRadius: 4, fontFamily: "monospace" }}>
                      {buyer.buyerCode || "KGABYR"}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", marginTop: 2 }}>
                    🏭 {buyer.division}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ fontSize: 10, fontWeight: 800, background: "#D1FAE5", color: "#065F46", padding: "3px 8px", borderRadius: 12 }}>
                    ● {buyer.plantType || "Bio-Ethanol"}
                  </span>
                  <button
                    onClick={() => handleOpenEdit(buyer)}
                    title="Edit Buyer"
                    style={{ background: "#F1F5F9", border: "1px solid #CBD5E1", borderRadius: 6, padding: "4px 8px", fontSize: 11, cursor: "pointer" }}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteBuyer(buyer.id, buyer.name)}
                    title="Delete Buyer"
                    style={{ background: "#FEE2E2", border: "1px solid #FCA5A5", color: "#991B1B", borderRadius: 6, padding: "4px 8px", fontSize: 11, cursor: "pointer" }}
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Delivery Address & GSTIN Box */}
              <div style={{ background: "var(--surface-tint)", padding: 10, borderRadius: 8, fontSize: 12, display: "flex", flexDirection: "column", gap: 4 }}>
                <div>📍 <strong>Delivery Plant Address:</strong></div>
                <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase" }}>{buyer.address}</div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: "#059669", marginTop: 2 }}>
                  GSTIN: <span style={{ fontFamily: "monospace" }}>{buyer.gstin}</span>
                </div>
              </div>

              {/* Contact Person & Terms */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 11.5 }}>
                <div>👤 Contact: <strong>{buyer.contactPerson || "Plant Head"}</strong></div>
                <div>📞 Mobile: <strong style={{ color: "#2563EB" }}>{buyer.contactMobile || "N/A"}</strong></div>
                <div style={{ gridColumn: "span 2" }}>📧 Official Email: <strong>{buyer.email || "N/A"}</strong></div>
              </div>

              {/* Off-take Contract & Commercial Rate Card */}
              <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 8, padding: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#1E40AF" }}>
                    📜 Commercial Supply Rate: ₹{buyer.agreedRatePerMt} / MT
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#1E3A8A" }}>
                    Target: {buyer.targetQtyMt || 5000} MT
                  </span>
                </div>

                {/* Progress Bar */}
                <div style={{ marginTop: 2 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, fontWeight: 700, color: "#1E40AF", marginBottom: 2 }}>
                    <span>Dispatched: {buyer.actualDispatchedMt.toFixed(1)} MT / {buyer.targetQtyMt || 5000} MT</span>
                    <span>{buyer.progressPct}%</span>
                  </div>
                  <div style={{ width: "100%", height: 7, background: "#DBEAFE", borderRadius: 4, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${buyer.progressPct}%`,
                        height: "100%",
                        background: buyer.progressPct > 70 ? "#059669" : "#2563EB",
                        borderRadius: 4,
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--line)", paddingTop: 8 }}>
                <div style={{ fontSize: 11.5, color: "var(--muted)" }}>
                  Trailers Sent: <strong style={{ color: "var(--ink)" }}>{buyer.dispatchesCount} Gate Passes</strong>
                </div>

                <button
                  onClick={() => setSelectedBuyerForDetails(buyer)}
                  style={{
                    padding: "5px 10px",
                    fontSize: 11.5,
                    fontWeight: 700,
                    borderRadius: 6,
                    border: "1px solid #CBD5E1",
                    background: "var(--surface)",
                    color: "var(--ink)",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  🚚 View Dispatch Ledger
                </button>
              </div>
            </div>
          ))}

          {filteredBuyers.length === 0 && (
            <div style={{ gridColumn: "span 2", textAlign: "center", padding: "40px 20px", color: "var(--muted)" }}>
              <i className="fa-solid fa-industry" style={{ fontSize: 32, marginBottom: 8, display: "block" }} />
              No buyers found matching &ldquo;{searchTerm}&rdquo;
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 2: TABULAR DATA TABLE */}
      {viewMode === "table" && (
        <DataTable
          title="All Industrial Biomass Buyers Register"
          searchable
          searchPlaceholder="Search buyer code, division, GSTIN..."
          keyField="id"
          rows={filteredBuyers}
          columns={[
            { key: "buyerCode", label: "CODE", emphasize: true, render: (r) => <strong style={{ fontFamily: "monospace", color: "#1E40AF" }}>{r.buyerCode || "KGABYR"}</strong> },
            {
              key: "name",
              label: "BUYER / COMPANY",
              render: (r) => (
                <div>
                  <strong style={{ color: "var(--ink)" }}>{r.name}</strong>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>{r.division}</div>
                </div>
              ),
            },
            {
              key: "plantType",
              label: "PLANT TYPE",
              render: (r) => <span style={{ fontWeight: 700, color: "#047857" }}>{r.plantType}</span>,
            },
            {
              key: "gstin",
              label: "GSTIN",
              render: (r) => <span style={{ fontFamily: "monospace", fontSize: 11.5 }}>{r.gstin}</span>,
            },
            {
              key: "contactPerson",
              label: "CONTACT PERSON",
              render: (r) => (
                <div>
                  <div>{r.contactPerson}</div>
                  <div style={{ fontSize: 11, color: "#2563EB" }}>{r.contactMobile}</div>
                </div>
              ),
            },
            {
              key: "targetQtyMt",
              label: "TARGET (MT)",
              render: (r) => `${r.targetQtyMt || 5000} MT`,
            },
            {
              key: "actualDispatchedMt",
              label: "DISPATCHED",
              render: (r) => <strong style={{ color: "#2563EB" }}>{r.actualDispatchedMt.toFixed(1)} MT ({r.progressPct}%)</strong>,
            },
            {
              key: "agreedRatePerMt",
              label: "RATE (₹/MT)",
              render: (r) => `₹${r.agreedRatePerMt}`,
            },
            {
              key: "actions",
              label: "ACTIONS",
              render: (r) => (
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => setSelectedBuyerForDetails(r)}
                    style={{ padding: "4px 8px", fontSize: 11, fontWeight: 700, background: "#EFF6FF", color: "#1E40AF", border: "1px solid #BFDBFE", borderRadius: 4, cursor: "pointer" }}
                  >
                    Ledger
                  </button>
                  <button
                    onClick={() => handleOpenEdit(r)}
                    style={{ padding: "4px 6px", fontSize: 11, background: "#F1F5F9", border: "1px solid #CBD5E1", borderRadius: 4, cursor: "pointer" }}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteBuyer(r.id, r.name)}
                    style={{ padding: "4px 6px", fontSize: 11, background: "#FEE2E2", border: "1px solid #FCA5A5", color: "#991B1B", borderRadius: 4, cursor: "pointer" }}
                  >
                    🗑️
                  </button>
                </div>
              ),
            },
          ]}
        />
      )}

      {/* BUYER DISPATCH LEDGER MODAL */}
      {selectedBuyerForDetails && (
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
              border: "1.5px solid var(--line-strong)",
              borderRadius: 16,
              width: "100%",
              maxWidth: 840,
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--line)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "var(--surface-tint)",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: "var(--ink)" }}>
                  🏬 {selectedBuyerForDetails.name}
                </h3>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--muted)" }}>
                  {selectedBuyerForDetails.division} — Industrial Delivery & Gate Pass Ledger
                </p>
              </div>
              <button
                onClick={() => setSelectedBuyerForDetails(null)}
                style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--muted)" }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Summary Metrics */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 8, padding: 10 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: "#1E40AF" }}>TARGET VOLUME</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "#1E3A8A", marginTop: 2 }}>
                    {selectedBuyerForDetails.targetQtyMt || 5000} MT
                  </div>
                  <div style={{ fontSize: 11, color: "#3B82F6" }}>Plant: {selectedBuyerForDetails.plantType}</div>
                </div>

                <div style={{ background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: 8, padding: 10 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: "#065F46" }}>DELIVERED TONNAGE</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "#047857", marginTop: 2 }}>
                    {selectedBuyerForDetails.actualDispatchedMt.toFixed(2)} MT
                  </div>
                  <div style={{ fontSize: 11, color: "#10B981", fontWeight: 700 }}>
                    {selectedBuyerForDetails.progressPct}% Contract Fulfilled
                  </div>
                </div>

                <div style={{ background: "#FAF5FF", border: "1px solid #E9D5FF", borderRadius: 8, padding: 10 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: "#6B21A8" }}>AGREED RATE & BILLING</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "#581C87", marginTop: 2 }}>
                    ₹{selectedBuyerForDetails.agreedRatePerMt} / MT
                  </div>
                  <div style={{ fontSize: 11, color: "#7E22CE" }}>
                    Total: ₹{(selectedBuyerForDetails.totalRevenueRs || 0).toLocaleString("en-IN")}
                  </div>
                </div>
              </div>

              {/* Delivery History Table */}
              <div>
                <h4 style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 800, color: "var(--ink)" }}>
                  🚚 Outbound Industrial Heavy Trailer Dispatches
                </h4>
                {selectedBuyerForDetails.dispatchesList?.length > 0 ? (
                  <div style={{ border: "1px solid var(--line)", borderRadius: 8, overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                      <thead>
                        <tr style={{ background: "var(--surface-tint)", textAlign: "left", fontSize: 11, fontWeight: 800, color: "var(--muted)", borderBottom: "1px solid var(--line)" }}>
                          <th style={{ padding: "8px 10px" }}>GATE PASS NO</th>
                          <th style={{ padding: "8px 10px" }}>DATE</th>
                          <th style={{ padding: "8px 10px" }}>VEHICLE</th>
                          <th style={{ padding: "8px 10px" }}>COMMODITY</th>
                          <th style={{ padding: "8px 10px" }}>TONNAGE</th>
                          <th style={{ padding: "8px 10px" }}>INVOICE (₹)</th>
                          <th style={{ padding: "8px 10px" }}>ACTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedBuyerForDetails.dispatchesList.map((disp) => (
                          <tr key={disp.id} style={{ borderBottom: "1px solid var(--line)" }}>
                            <td style={{ padding: "8px 10px", fontWeight: 700, fontFamily: "monospace" }}>{disp.gatePassNo}</td>
                            <td style={{ padding: "8px 10px" }}>{disp.date}</td>
                            <td style={{ padding: "8px 10px", fontFamily: "monospace" }}>{disp.vehicleNo}</td>
                            <td style={{ padding: "8px 10px", color: "#047857", fontWeight: 700 }}>{disp.cropName}</td>
                            <td style={{ padding: "8px 10px", fontWeight: 800 }}>{disp.dispatchedTonnageMt} MT</td>
                            <td style={{ padding: "8px 10px", fontWeight: 800, color: "#1E40AF" }}>₹{(disp.totalInvoiceAmount || 0).toLocaleString("en-IN")}</td>
                            <td style={{ padding: "8px 10px" }}>
                              <button
                                onClick={() => setSelectedGatePassForPrint(disp)}
                                style={{ padding: "3px 6px", fontSize: 11, background: "#0F172A", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}
                              >
                                🖨️
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: 20, background: "var(--surface-tint)", borderRadius: 8, color: "var(--muted)", fontSize: 12 }}>
                    No dispatch gate passes recorded for this plant yet.
                  </div>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setSelectedBuyerForDetails(null)}
                  style={{ padding: "8px 16px", fontSize: 12.5, borderRadius: 8, border: "1px solid var(--line)", background: "var(--surface)", cursor: "pointer" }}
                >
                  Close Ledger
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT BUYER MODAL */}
      {editingBuyer && (
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
              maxWidth: 720,
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--line)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "var(--surface-tint)",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "var(--ink)" }}>
                  ✏️ Edit Industrial Buyer / Plant
                </h3>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--muted)" }}>
                  Update consignee billing details, plant address, and commercial agreed rate
                </p>
              </div>
              <button onClick={() => setEditingBuyer(null)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--muted)" }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 3 }}>
                    Company / Buyer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    style={{ width: "100%", padding: "7px 10px", fontSize: 12, fontWeight: 700, borderRadius: 6, border: "1px solid var(--line-strong)" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 3 }}>
                    Division / Plant Name
                  </label>
                  <input
                    type="text"
                    value={editForm.division}
                    onChange={(e) => setEditForm({ ...editForm, division: e.target.value })}
                    style={{ width: "100%", padding: "7px 10px", fontSize: 12, fontWeight: 700, borderRadius: 6, border: "1px solid var(--line-strong)" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 3 }}>
                  Full Plant Delivery Address (as per Bill To) *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  style={{ width: "100%", padding: "7px 10px", fontSize: 12, borderRadius: 6, border: "1px solid var(--line-strong)" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 3 }}>
                    GSTIN Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.gstin}
                    onChange={(e) => setEditForm({ ...editForm, gstin: e.target.value })}
                    style={{ width: "100%", padding: "7px 10px", fontSize: 12, fontWeight: 700, borderRadius: 6, border: "1px solid var(--line-strong)" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 3 }}>
                    Plant Type
                  </label>
                  <select
                    value={editForm.plantType}
                    onChange={(e) => setEditForm({ ...editForm, plantType: e.target.value })}
                    style={{ width: "100%", padding: "7px 10px", fontSize: 12, fontWeight: 700, borderRadius: 6, border: "1px solid var(--line-strong)" }}
                  >
                    <option value="Bio-Ethanol Plant">Bio-Ethanol Plant</option>
                    <option value="CBG Plant / Ethanol Division">CBG Plant / Ethanol Division</option>
                    <option value="Biomass Power Plant">Biomass Power Plant</option>
                    <option value="Pellet / Briquette Mill">Pellet / Briquette Mill</option>
                    <option value="Paper & Packaging Mill">Paper & Packaging Mill</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 3 }}>
                    Agreed Rate (₹/MT)
                  </label>
                  <input
                    type="number"
                    value={editForm.agreedRatePerMt}
                    onChange={(e) => setEditForm({ ...editForm, agreedRatePerMt: e.target.value })}
                    style={{ width: "100%", padding: "7px 10px", fontSize: 12, fontWeight: 800, borderRadius: 6, border: "1px solid var(--line-strong)" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 3 }}>
                    Plant Contact Person
                  </label>
                  <input
                    type="text"
                    value={editForm.contactPerson}
                    onChange={(e) => setEditForm({ ...editForm, contactPerson: e.target.value })}
                    style={{ width: "100%", padding: "7px 10px", fontSize: 12, borderRadius: 6, border: "1px solid var(--line-strong)" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 3 }}>
                    Contact Mobile
                  </label>
                  <input
                    type="text"
                    value={editForm.contactMobile}
                    onChange={(e) => setEditForm({ ...editForm, contactMobile: e.target.value })}
                    style={{ width: "100%", padding: "7px 10px", fontSize: 12, borderRadius: 6, border: "1px solid var(--line-strong)" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 3 }}>
                    Target Off-take (MT)
                  </label>
                  <input
                    type="number"
                    value={editForm.targetQtyMt}
                    onChange={(e) => setEditForm({ ...editForm, targetQtyMt: e.target.value })}
                    style={{ width: "100%", padding: "7px 10px", fontSize: 12, borderRadius: 6, border: "1px solid var(--line-strong)" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setEditingBuyer(null)} style={{ padding: "8px 16px", fontSize: 12.5, borderRadius: 8, border: "1px solid var(--line)" }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: "8px 20px", fontSize: 12.5, fontWeight: 800, borderRadius: 8, border: "none", background: "#2563EB", color: "#fff", cursor: "pointer" }}>
                  💾 Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW BUYER MODAL */}
      <NewBuyerModal
        isOpen={isNewBuyerModalOpen}
        onClose={() => setIsNewBuyerModalOpen(false)}
        onSaved={(updatedBuyers) => setBuyers(updatedBuyers)}
      />

      {/* PRINT GATE PASS MODAL */}
      <BiomassGatePassModal
        passData={selectedGatePassForPrint}
        onClose={() => setSelectedGatePassForPrint(null)}
      />
    </div>
  );
}
