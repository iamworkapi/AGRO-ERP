import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import DataTable from "../components/common/DataTable";
import Button from "../components/common/Button";
import NewBiomassCollectionModal from "../components/biomass/NewBiomassCollectionModal";
import NewBiomassDispatchModal from "../components/biomass/NewBiomassDispatchModal";
import BiomassGatePassModal from "../components/biomass/BiomassGatePassModal";
import NewVendorModal from "../components/biomass/NewVendorModal";
import NewBuyerModal from "../components/biomass/NewBuyerModal";
import NewWarehouseTccModal from "../components/biomass/NewWarehouseTccModal";
import {
  CROPS_MASTER,
  getStoredVendors,
  saveNewVendor,
  getStoredBuyers,
  DEFAULT_WAREHOUSE_TCC,
  getStoredCollections,
  saveNewCollection,
  getStoredDispatches,
  saveNewDispatch,
  calculateGrnInvoiceWeight,
} from "../features/biomass/biomassService";
import { toast } from "../utils/toast";

export default function BiomassSupplyChain() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("stage1"); // "stage1" | "stage2" | "stage3" | "stage4" | "analytics"
  const [cropFilter, setCropFilter] = useState("ALL");

  // State Data
  const [collections, setCollections] = useState(getStoredCollections);
  const [dispatches, setDispatches] = useState(getStoredDispatches);
  const [vendorsList, setVendorsList] = useState(getStoredVendors);
  const [buyersList, setBuyersList] = useState(getStoredBuyers);
  const [activeVendorId, setActiveVendorId] = useState(vendorsList[0]?.id || "");

  // Modals
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [selectedGatePassForPrint, setSelectedGatePassForPrint] = useState(null);

  // Quick Master Registration Modals
  const [isNewVendorModalOpen, setIsNewVendorModalOpen] = useState(false);
  const [isNewBuyerModalOpen, setIsNewBuyerModalOpen] = useState(false);
  const [isNewWarehouseModalOpen, setIsNewWarehouseModalOpen] = useState(false);

  // New Vendor Form Toggle (Stage 1 Right Side)
  const [showAddVendorForm, setShowAddVendorForm] = useState(false);
  const [newVendorCompany, setNewVendorCompany] = useState("");
  const [newVendorGstin, setNewVendorGstin] = useState("");
  const [newVendorRep, setNewVendorRep] = useState("");
  const [newVendorContact, setNewVendorContact] = useState("");
  const [newVendorAddress, setNewVendorAddress] = useState("");

  // Interactive Live Calculator (Stage 2)
  const [calcNetWt, setCalcNetWt] = useState("10.00");
  const [calcActualMoist, setCalcActualMoist] = useState("20");
  const [calcActualAsh, setCalcActualAsh] = useState("22");
  const [calcAgreedMoist, setCalcAgreedMoist] = useState("20");
  const [calcAgreedAsh, setCalcAgreedAsh] = useState("20");

  const currentVendor = vendorsList.find((v) => v.id === activeVendorId) || vendorsList[0];

  // Filter collections & dispatches by crop
  const filteredCollections = useMemo(() => {
    if (cropFilter === "ALL") return collections;
    return collections.filter((c) => c.cropId === cropFilter);
  }, [collections, cropFilter]);

  const filteredDispatches = useMemo(() => {
    if (cropFilter === "ALL") return dispatches;
    return dispatches.filter((d) => d.cropName?.toLowerCase().includes(cropFilter.replace("_", " ")));
  }, [dispatches, cropFilter]);

  // Aggregate Metrics
  const totalCollectedMt = useMemo(() => collections.reduce((s, c) => s + (c.invoiceWeightMt || 0), 0), [collections]);
  const totalBalesCount = useMemo(() => collections.reduce((s, c) => s + (c.baleCountProduced || 0), 0), [collections]);
  const totalDispatchedMt = useMemo(() => dispatches.reduce((s, d) => s + (d.dispatchedTonnageMt || 0), 0), [dispatches]);
  const totalDispatchRev = useMemo(() => dispatches.reduce((s, d) => s + (d.totalInvoiceAmount || 0), 0), [dispatches]);

  // GRN Live Calc Output
  const liveGrnResult = calculateGrnInvoiceWeight({
    actualWeightMt: parseFloat(calcNetWt) || 0,
    actualMoisturePct: parseFloat(calcActualMoist) || 0,
    actualAshPct: parseFloat(calcActualAsh) || 0,
    agreedMoisturePct: parseFloat(calcAgreedMoist) || 20,
    agreedAshPct: parseFloat(calcAgreedAsh) || 20,
  });

  function handleSaveCollection(entry) {
    const updated = saveNewCollection(entry);
    setCollections(updated);
  }

  function handleSaveDispatch(entry) {
    const updated = saveNewDispatch(entry);
    setDispatches(updated);
  }

  function handleAddVendorSubmit(e) {
    e.preventDefault();
    if (!newVendorCompany) {
      toast.error("Please enter Vendor Company Name");
      return;
    }
    const updated = saveNewVendor({
      companyName: newVendorCompany.toUpperCase(),
      gstin: newVendorGstin.toUpperCase(),
      representative: newVendorRep,
      contactNo: newVendorContact,
      address: newVendorAddress,
      sourcingArea: "Unnao & Surrounding Villages",
    });
    setVendorsList(updated);
    setActiveVendorId(updated[0].id);
    setShowAddVendorForm(false);
    toast.success(`New Raw Material Vendor "${newVendorCompany}" registered!`);
    setNewVendorCompany("");
    setNewVendorGstin("");
    setNewVendorRep("");
    setNewVendorContact("");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* PAGE HEADER */}
      <PageHeader
        title="Biomass Supply Chain Management"
        subtitle="Complete 4-Stage Tracking — Collection, Processing, Storage, & Offtake Dispatches"
      />

      {/* TOP KPI METRICS BAR */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }} className="responsive-grid-2">
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: "#FEF3C7", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            <i className="fa-solid fa-wheat-awn" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Total Collected & Baled</p>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)", marginTop: 2 }}>{totalCollectedMt.toFixed(2)} MT</div>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>{totalBalesCount.toLocaleString("en-IN")} Bales Produced</span>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: "#D1FAE5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            <i className="fa-solid fa-warehouse" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Active Yard Stock (Unnao TCC)</p>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#059669", marginTop: 2 }}>{DEFAULT_WAREHOUSE_TCC.activeStockMt.toLocaleString("en-IN")} MT</div>
            <span style={{ fontSize: 11, color: "#059669", fontWeight: 700 }}>Fire Safety: 98.5% (Safe)</span>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: "#DBEAFE", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            <i className="fa-solid fa-truck-fast" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Factory Dispatched</p>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#2563EB", marginTop: 2 }}>{totalDispatchedMt.toFixed(2)} MT</div>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>{dispatches.length} Heavy Trailers Sent</span>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: "#F3E8FF", color: "#7E22CE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            <i className="fa-solid fa-file-invoice-dollar" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Dispatch Commercial Revenue</p>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#7E22CE", marginTop: 2 }}>₹{totalDispatchRev.toLocaleString("en-IN")}</div>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>HSN Code 1213 00 00</span>
          </div>
        </div>
      </div>

      {/* CROP OPTIONS SELECTOR BAR & ACTION BUTTONS */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--line)", paddingBottom: 10, flexWrap: "wrap", gap: 10 }}>
        {/* Stage Tabs */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <button
            onClick={() => setActiveTab("stage1")}
            style={{
              padding: "8px 14px",
              fontSize: 12.5,
              fontWeight: 700,
              borderRadius: 8,
              border: activeTab === "stage1" ? "1px solid var(--primary)" : "1px solid var(--line)",
              background: activeTab === "stage1" ? "var(--primary-tint)" : "var(--surface)",
              color: activeTab === "stage1" ? "var(--primary-deep)" : "var(--ink)",
              cursor: "pointer",
            }}
          >
            🚜 Stage 1: Collection
          </button>

          <button
            onClick={() => setActiveTab("stage2")}
            style={{
              padding: "8px 14px",
              fontSize: 12.5,
              fontWeight: 700,
              borderRadius: 8,
              border: activeTab === "stage2" ? "1px solid var(--primary)" : "1px solid var(--line)",
              background: activeTab === "stage2" ? "var(--primary-tint)" : "var(--surface)",
              color: activeTab === "stage2" ? "var(--primary-deep)" : "var(--ink)",
              cursor: "pointer",
            }}
          >
            ⚖️ Stage 2: Processing & Baling
          </button>

          <button
            onClick={() => setActiveTab("stage3")}
            style={{
              padding: "8px 14px",
              fontSize: 12.5,
              fontWeight: 700,
              borderRadius: 8,
              border: activeTab === "stage3" ? "1px solid var(--primary)" : "1px solid var(--line)",
              background: activeTab === "stage3" ? "var(--primary-tint)" : "var(--surface)",
              color: activeTab === "stage3" ? "var(--primary-deep)" : "var(--ink)",
              cursor: "pointer",
            }}
          >
            🏢 Stage 3: Storage & Stacking
          </button>

          <button
            onClick={() => setActiveTab("stage4")}
            style={{
              padding: "8px 14px",
              fontSize: 12.5,
              fontWeight: 700,
              borderRadius: 8,
              border: activeTab === "stage4" ? "1px solid var(--primary)" : "1px solid var(--line)",
              background: activeTab === "stage4" ? "var(--primary-tint)" : "var(--surface)",
              color: activeTab === "stage4" ? "var(--primary-deep)" : "var(--ink)",
              cursor: "pointer",
            }}
          >
            🚚 Stage 4: Factory Dispatches
          </button>
        </div>

        {/* Crop Selection Filter & Actions */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <select
            value={cropFilter}
            onChange={(e) => setCropFilter(e.target.value)}
            style={{
              padding: "7px 12px",
              fontSize: 12,
              fontWeight: 700,
              borderRadius: 8,
              border: "1px solid var(--line-strong)",
              background: "var(--surface)",
              color: "var(--ink)",
            }}
          >
            <option value="ALL">All Crop Residues</option>
            <option value="paddy_straw">Paddy Straw</option>
            <option value="wheat_straw">Wheat Straw</option>
            <option value="maize_stalk">Maize Stalk</option>
          </select>

          {/* Quick Registration Modals Trigger Bar */}
          <div style={{ display: "flex", gap: 6 }}>
            <button
              type="button"
              onClick={() => setIsNewVendorModalOpen(true)}
              style={{
                padding: "6px 10px",
                fontSize: 11.5,
                fontWeight: 700,
                borderRadius: 8,
                border: "1px solid #BFDBFE",
                background: "#EFF6FF",
                color: "#1E40AF",
                cursor: "pointer",
              }}
            >
              👤 + New Vendor
            </button>

            <button
              type="button"
              onClick={() => setIsNewBuyerModalOpen(true)}
              style={{
                padding: "6px 10px",
                fontSize: 11.5,
                fontWeight: 700,
                borderRadius: 8,
                border: "1px solid #BBF7D0",
                background: "#F0FDF4",
                color: "#166534",
                cursor: "pointer",
              }}
            >
              🏬 + New Buyer
            </button>

            <button
              type="button"
              onClick={() => setIsNewWarehouseModalOpen(true)}
              style={{
                padding: "6px 10px",
                fontSize: 11.5,
                fontWeight: 700,
                borderRadius: 8,
                border: "1px solid #E9D5FF",
                background: "#FAF5FF",
                color: "#6B21A8",
                cursor: "pointer",
              }}
            >
              🏢 + New Warehouse
            </button>
          </div>

          <Button
            onClick={() => setIsCollectionModalOpen(true)}
            style={{ padding: "7px 14px", fontSize: 12.5, fontWeight: 700, background: "var(--gradient-primary)" }}
          >
            ➕ New Raw Entry (Stage 1)
          </Button>

          <Button
            onClick={() => setIsDispatchModalOpen(true)}
            style={{ padding: "7px 14px", fontSize: 12.5, fontWeight: 700, background: "#2563EB" }}
          >
            🚚 New Factory Dispatch (Stage 4)
          </Button>
        </div>
      </div>

      {/* STAGE 1: COLLECTION (IMAGE 3 SPEC: LEFT TABLE & RIGHT SIDE VENDOR SECTION) */}
      {activeTab === "stage1" && (
        <div style={{ display: "grid", gridTemplateColumns: "2.2fr 1fr", gap: 16 }}>
          {/* Left Table: Collection Entries */}
          <div>
            <DataTable
              title="Stage 1: Raw Biomass Collection Register (50-100 Villages)"
              searchable
              searchPlaceholder="Search village, farmer, vehicle, crop..."
              keyField="id"
              rows={filteredCollections}
              columns={[
                { key: "slipNo", label: "SLIP NO.", emphasize: true },
                { key: "date", label: "DATE", render: (r) => <span style={{ fontSize: 11.5 }}>{r.date}</span> },
                { key: "villageName", label: "VILLAGE / FARMER", render: (r) => <div><strong style={{ color: "var(--ink)" }}>{r.villageName}</strong><div style={{ fontSize: 11, color: "var(--muted)" }}>{r.farmerName} ({r.farmerMobile})</div></div> },
                { key: "cropName", label: "CROP TYPE", render: (r) => <span style={{ fontWeight: 700, color: "#047857" }}>{r.cropName}</span> },
                { key: "vehicleNo", label: "VEHICLE NO.", render: (r) => <span style={{ fontFamily: "monospace", fontWeight: 700 }}>{r.vehicleNo}</span> },
                { key: "actualNetWeightMt", label: "RAW NET (MT)", render: (r) => `${r.actualNetWeightMt} MT` },
                { key: "invoiceWeightMt", label: "GRN PAYABLE (MT)", render: (r) => <strong style={{ color: "#0F172A" }}>{r.invoiceWeightMt} MT</strong> },
                { key: "totalAmountRs", label: "TOTAL (₹)", render: (r) => `₹${(r.totalAmountRs || 0).toLocaleString("en-IN")}` },
              ]}
            />
          </div>

          {/* RIGHT SIDE VENDOR SECTION (jise maal leta hu - Image 3 Specs) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ background: "#FFFFFF", border: "2px solid #0F172A", borderRadius: 12, padding: 14, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #E2E8F0", paddingBottom: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 900, textTransform: "uppercase", color: "#0F172A" }}>
                  <i className="fa-solid fa-user" /> Sourcing Partner / Contractor
                </span>
                <button
                  onClick={() => setShowAddVendorForm(!showAddVendorForm)}
                  style={{ fontSize: 11, fontWeight: 700, color: "#2563EB", background: "#EFF6FF", border: "1px solid #BFDBFE", padding: "3px 8px", borderRadius: 4, cursor: "pointer" }}
                >
                  {showAddVendorForm ? "✕ Cancel" : "➕ Add Vendor"}
                </button>
              </div>

              {!showAddVendorForm ? (
                <>
                  {/* Select Active Vendor Dropdown */}
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: 10.5, fontWeight: 700, color: "#64748B", display: "block", marginBottom: 3 }}>Switch Active Supply Vendor:</label>
                    <select
                      value={activeVendorId}
                      onChange={(e) => setActiveVendorId(e.target.value)}
                      style={{ width: "100%", padding: "6px 8px", fontSize: 12, fontWeight: 700, borderRadius: 6, border: "1px solid #94A3B8" }}
                    >
                      {vendorsList.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.companyName} ({v.vendorCode})
                        </option>
                      ))}
                    </select>
                  </div>

                  {currentVendor && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12 }}>
                      <div style={{ background: "#F8FAFC", padding: 10, borderRadius: 8, border: "1px solid #E2E8F0" }}>
                        <div style={{ fontSize: 14, fontWeight: 900, color: "#0F172A" }}>{currentVendor.companyName}</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#2563EB", marginTop: 2 }}>Vendor Code: {currentVendor.vendorCode} | GST: {currentVendor.gstin}</div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 11.5 }}>
                        <div>👤 Representative: <strong>{currentVendor.representative}</strong></div>
                        <div>📞 Contact: <strong>{currentVendor.contactNo}</strong></div>
                        <div style={{ gridColumn: "span 2" }}>📧 Email: <strong>{currentVendor.email}</strong></div>
                        <div style={{ gridColumn: "span 2" }}>📍 Address: {currentVendor.address}</div>
                      </div>

                      <div style={{ background: "#FEF3C7", border: "1px solid #F59E0B", padding: "8px 10px", borderRadius: 6, marginTop: 4 }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: "#92400E" }}>Term Sheet PO No: #{currentVendor.poNo} (Date: {currentVendor.poDate})</div>
                        <div style={{ fontSize: 10.5, color: "#B45309" }}>Tenure: {currentVendor.tenure} | Agreed Rate: ₹{currentVendor.agreedPricePerMt}/MT</div>
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate("/biomass/vendors")}
                        style={{
                          marginTop: 6,
                          padding: "7px 10px",
                          fontSize: 11.5,
                          fontWeight: 800,
                          background: "#2563EB",
                          color: "#FFFFFF",
                          border: "none",
                          borderRadius: 6,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                        }}
                      >
                        👥 Open Full Vendor Master & Directory →
                      </button>
                    </div>
                  )}
                </>
              ) : (
                /* Dynamic Add Vendor Form */
                <form onSubmit={handleAddVendorSubmit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <h4 style={{ margin: 0, fontSize: 12.5, fontWeight: 800, color: "#1E40AF" }}>Register New Biomass Vendor</h4>
                  <input type="text" required placeholder="Company Name *" value={newVendorCompany} onChange={(e) => setNewVendorCompany(e.target.value)} style={{ width: "100%", padding: 6, fontSize: 11.5, borderRadius: 4, border: "1px solid #94A3B8" }} />
                  <input type="text" placeholder="GSTIN No" value={newVendorGstin} onChange={(e) => setNewVendorGstin(e.target.value)} style={{ width: "100%", padding: 6, fontSize: 11.5, borderRadius: 4, border: "1px solid #94A3B8" }} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    <input type="text" placeholder="Representative Name" value={newVendorRep} onChange={(e) => setNewVendorRep(e.target.value)} style={{ width: "100%", padding: 6, fontSize: 11.5, borderRadius: 4, border: "1px solid #94A3B8" }} />
                    <input type="text" placeholder="Contact Mobile" value={newVendorContact} onChange={(e) => setNewVendorContact(e.target.value)} style={{ width: "100%", padding: 6, fontSize: 11.5, borderRadius: 4, border: "1px solid #94A3B8" }} />
                  </div>
                  <input type="text" placeholder="Vendor Office Address" value={newVendorAddress} onChange={(e) => setNewVendorAddress(e.target.value)} style={{ width: "100%", padding: 6, fontSize: 11.5, borderRadius: 4, border: "1px solid #94A3B8" }} />
                  <button type="submit" style={{ padding: "6px", fontSize: 11.5, fontWeight: 700, background: "#2563EB", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>
                    💾 Save Vendor Details
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STAGE 2: PROCESSING (IMAGE 2 FORMULA & BALING LOG) */}
      {activeTab === "stage2" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* IMAGE 2 LIVE GRN FORMULA CALCULATOR CARD */}
          <div style={{ background: "#F8FAFC", border: "2px solid #0F172A", borderRadius: 12, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 900, color: "#0F172A", textTransform: "uppercase" }}>
                  ⚖️ Processing GRN Lorry Weight Formula (Image 2 & PDF Page 2)
                </h3>
                <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "#475569" }}>
                  Formula: Actual Wt × (100% - Actual Moist% - Actual Ash%) / (100% - Agreed Moist% - Agreed Ash%)
                </p>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#991B1B", background: "#FEE2E2", padding: "4px 10px", borderRadius: 6 }}>
                Rejection: Moisture &gt; 28% OR Ash &gt; 35%
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 10.5, fontWeight: 700, color: "#334155" }}>Actual Net Weight (MT)</label>
                <input type="number" step="0.01" value={calcNetWt} onChange={(e) => setCalcNetWt(e.target.value)} style={{ width: "100%", padding: 6, fontSize: 12, fontWeight: 800, borderRadius: 6, border: "1px solid #94A3B8" }} />
              </div>
              <div>
                <label style={{ fontSize: 10.5, fontWeight: 700, color: "#334155" }}>Actual Moist %</label>
                <input type="number" step="0.1" value={calcActualMoist} onChange={(e) => setCalcActualMoist(e.target.value)} style={{ width: "100%", padding: 6, fontSize: 12, fontWeight: 700, borderRadius: 6, border: "1px solid #94A3B8" }} />
              </div>
              <div>
                <label style={{ fontSize: 10.5, fontWeight: 700, color: "#334155" }}>Actual Ash %</label>
                <input type="number" step="0.1" value={calcActualAsh} onChange={(e) => setCalcActualAsh(e.target.value)} style={{ width: "100%", padding: 6, fontSize: 12, fontWeight: 700, borderRadius: 6, border: "1px solid #94A3B8" }} />
              </div>
              <div>
                <label style={{ fontSize: 10.5, fontWeight: 700, color: "#334155" }}>Agreed Max Moist %</label>
                <input type="number" step="0.1" value={calcAgreedMoist} onChange={(e) => setCalcAgreedMoist(e.target.value)} style={{ width: "100%", padding: 6, fontSize: 12, borderRadius: 6, border: "1px solid #94A3B8" }} />
              </div>
              <div>
                <label style={{ fontSize: 10.5, fontWeight: 700, color: "#334155" }}>Agreed Max Ash %</label>
                <input type="number" step="0.1" value={calcAgreedAsh} onChange={(e) => setCalcAgreedAsh(e.target.value)} style={{ width: "100%", padding: 6, fontSize: 12, borderRadius: 6, border: "1px solid #94A3B8" }} />
              </div>
            </div>

            <div style={{ background: liveGrnResult.isRejected ? "#FEE2E2" : "#ECFDF5", border: liveGrnResult.isRejected ? "1.5px solid #EF4444" : "1.5px solid #10B981", borderRadius: 8, padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {liveGrnResult.isRejected ? (
                <div style={{ color: "#991B1B", fontWeight: 800, fontSize: 13 }}>
                  🚨 {liveGrnResult.rejectionReason}
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#065F46" }}>
                    Calculation: {calcNetWt} MT × (100% - {calcActualMoist}% - {calcActualAsh}%) / (100% - {calcAgreedMoist}% - {calcAgreedAsh}%) = <strong>{liveGrnResult.invoiceWeightMt} MT</strong>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: "#047857", marginTop: 2 }}>
                    Adjusted Weight Considered for Invoice Claim: {liveGrnResult.invoiceWeightMt} MT (Deduction: {liveGrnResult.deductionMt} MT)
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Processing Entries Table */}
          <DataTable
            title="Stage 2: Weighbridge & Baler Compressing Log"
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
              { key: "invoiceWeightMt", label: "GRN INVOICE (MT)", render: (r) => <strong style={{ color: "#059669" }}>{r.invoiceWeightMt} MT</strong> },
              { key: "balerMachine", label: "BALER MACHINE" },
              { key: "baleCountProduced", label: "BALES COUNT", render: (r) => <span style={{ fontWeight: 800 }}>{r.baleCountProduced} Bales</span> },
            ]}
          />
        </div>
      )}

      {/* STAGE 3: STORAGE (IMAGE 3 SPEC: LEFT WAREHOUSE SECTION & RIGHT STACK GRID) */}
      {activeTab === "stage3" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 2fr", gap: 16 }}>
          {/* LEFT SIDE WAREHOUSE DETAILS PANEL (Image 3 Specs) */}
          <div style={{ background: "#FFFFFF", border: "2px solid #0F172A", borderRadius: 12, padding: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
            <div style={{ borderBottom: "2px solid #0F172A", paddingBottom: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 900, textTransform: "uppercase", color: "#0F172A" }}>
                🏢 Warehouse & TCC Details (Left Side Panel)
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 12 }}>
              <div style={{ background: "#F1F5F9", padding: 10, borderRadius: 8, border: "1px solid #CBD5E1" }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: "#0F172A" }}>{DEFAULT_WAREHOUSE_TCC.name}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#2563EB", marginTop: 2 }}>Center Code: {DEFAULT_WAREHOUSE_TCC.code}</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, background: "#FAF5FF", padding: 10, borderRadius: 8, border: "1px solid #E9D5FF" }}>
                <div>Sourcing Area: <strong>{DEFAULT_WAREHOUSE_TCC.sourcingArea}</strong></div>
                <div>Storage Capacity: <strong>{DEFAULT_WAREHOUSE_TCC.totalCapacityMt.toLocaleString("en-IN")} MT</strong></div>
                <div>Active Stock: <strong style={{ color: "#059669" }}>{DEFAULT_WAREHOUSE_TCC.activeStockMt.toLocaleString("en-IN")} MT</strong></div>
                <div>Total Bales: <strong>{DEFAULT_WAREHOUSE_TCC.totalBalesCount.toLocaleString("en-IN")} Bales</strong></div>
              </div>

              <div style={{ background: "#ECFDF5", border: "1px solid #10B981", padding: 10, borderRadius: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#065F46" }}>🛡️ Fire Safety Audit Probes:</div>
                <div style={{ fontSize: 15, fontWeight: 900, color: "#047857", marginTop: 2 }}>{DEFAULT_WAREHOUSE_TCC.fireSafetyScore}</div>
                <div style={{ fontSize: 10.5, color: "#065F46" }}>Spontaneous combustion risk control active</div>
              </div>

              <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: 8, fontSize: 11.5 }}>
                <div>👨‍💼 Assigned Supervisor: <strong>{DEFAULT_WAREHOUSE_TCC.supervisorName}</strong></div>
                <div>📞 Mobile: <strong>{DEFAULT_WAREHOUSE_TCC.supervisorPhone}</strong></div>
                <div>📧 Official Email: <strong>{DEFAULT_WAREHOUSE_TCC.officialEmail}</strong></div>
              </div>

              {/* ADMIN, WAREHOUSE ADMIN & SUPERVISOR HIERARCHY PANEL */}
              <div style={{ marginTop: 10, background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 8, padding: 10 }}>
                <div style={{ fontSize: 11.5, fontWeight: 800, color: "#1E40AF", display: "flex", alignItems: "center", gap: 4 }}>
                  <i className="fa-solid fa-user-gear" /> Governance, Monitoring & Operations Hierarchy
                </div>
                <div style={{ fontSize: 10.5, color: "#1E3A8A", marginTop: 4, lineHeight: 1.4 }}>
                  • <strong>Super Admin / Admin:</strong> Creates new warehouses/TCC hubs & assigns Admins/Supervisors.<br />
                  • <strong>Warehouse Admin:</strong> Monitors daily operations, weighment logs, GRN deductions, stock levels & factory dispatches.<br />
                  • <strong>Supervisor:</strong> Operates daily ground work — Collection gate entries, Weighbridge weighment, Baler compressing, Stack audits & Truck dispatches.
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => navigate("/warehouses/create")}
                    style={{ padding: "6px 10px", fontSize: 11, fontWeight: 700, background: "#2563EB", color: "#FFFFFF", border: "none", borderRadius: 6, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
                  >
                    🏢 Create New Warehouse / Hub (Admin Only)
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/warehouses/admin-management")}
                    style={{ padding: "6px 10px", fontSize: 11, fontWeight: 700, background: "#FFFFFF", color: "#2563EB", border: "1px solid #93C5FD", borderRadius: 6, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
                  >
                    👥 Assign Admin & Supervisor to Warehouse
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Stack IDs & Yard Storage Grid */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "var(--ink)" }}>
              📦 Yard Stacking & Storage Volume (Tons & Bales)
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
              <div style={{ background: "#FFFFFF", border: "1px solid #CBD5E1", borderRadius: 10, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>STACK-PAD-101 (Zone A)</span>
                  <span style={{ fontSize: 10, fontWeight: 700, background: "#D1FAE5", color: "#059669", padding: "2px 6px", borderRadius: 4 }}>Paddy Straw</span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", marginTop: 6 }}>1,450.00 MT</div>
                <div style={{ fontSize: 11, color: "#64748B" }}>4,830 Round Bales | Probe Temp: 28°C (Normal)</div>
              </div>

              <div style={{ background: "#FFFFFF", border: "1px solid #CBD5E1", borderRadius: 10, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>STACK-MZE-305 (Zone B)</span>
                  <span style={{ fontSize: 10, fontWeight: 700, background: "#FEF3C7", color: "#D97706", padding: "2px 6px", borderRadius: 4 }}>Maize Stem</span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", marginTop: 6 }}>2,120.50 MT</div>
                <div style={{ fontSize: 11, color: "#64748B" }}>7,060 Bales | Probe Temp: 31°C (Monitored)</div>
              </div>

              <div style={{ background: "#FFFFFF", border: "1px solid #CBD5E1", borderRadius: 10, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>STACK-WHT-202 (Zone C)</span>
                  <span style={{ fontSize: 10, fontWeight: 700, background: "#DBEAFE", color: "#2563EB", padding: "2px 6px", borderRadius: 4 }}>Wheat Straw</span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", marginTop: 6 }}>1,250.00 MT</div>
                <div style={{ fontSize: 11, color: "#64748B" }}>4,178 Bales | Probe Temp: 26°C (Normal)</div>
              </div>

              <div style={{ background: "#FFFFFF", border: "1px solid #CBD5E1", borderRadius: 10, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>STACK-PAD-104 (Zone B)</span>
                  <span style={{ fontSize: 10, fontWeight: 700, background: "#D1FAE5", color: "#059669", padding: "2px 6px", borderRadius: 4 }}>Paddy Straw</span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", marginTop: 6 }}>850.00 MT</div>
                <div style={{ fontSize: 11, color: "#64748B" }}>2,833 Bales | Probe Temp: 27°C (Normal)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 4: FACTORY DISPATCH (IMAGE 1 SPEC: PRE-SAVED RELIANCE BUYER & ADD ANOTHER BUYER INPUT FIELDS) */}
      {activeTab === "stage4" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* PRE-SAVED BUYERS CARDS (Image 1 Specs: RELIANCE INDUSTRIES LIMITED) */}
          <div style={{ background: "#FFFFFF", border: "2px solid #0F172A", borderRadius: 12, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 900, color: "#0F172A", textTransform: "uppercase" }}>
                🏬 Industrial Offtake Buyers
              </h3>
              <Button onClick={() => setIsDispatchModalOpen(true)} style={{ padding: "6px 12px", fontSize: 12, fontWeight: 700 }}>
                ➕ Create Dispatch Gate Pass
              </Button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {buyersList.map((b) => (
                <div key={b.id} style={{ background: "#F8FAFC", border: "1.5px solid #CBD5E1", borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>Bill To / Consignee Details:-</div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: "#0F172A", marginTop: 2 }}>{b.name}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#2563EB", marginTop: 2 }}>{b.division}</div>
                  <div style={{ fontSize: 11, color: "#334155", marginTop: 4, textTransform: "uppercase" }}>{b.address}</div>
                  <div style={{ fontSize: 12, fontWeight: 900, color: "#059669", marginTop: 6 }}>GSTIN: {b.gstin}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Factory Dispatches Table */}
          <DataTable
            title="Stage 4: Outbound Industrial Deliveries Register"
            searchable
            keyField="id"
            rows={filteredDispatches}
            columns={[
              { key: "gatePassNo", label: "GATE PASS NO.", emphasize: true },
              { key: "date", label: "DATE" },
              { key: "buyerName", label: "BUYER / CONSIGNEE", render: (r) => <div><strong style={{ color: "var(--ink)" }}>{r.buyerName}</strong><div style={{ fontSize: 11, color: "var(--muted)" }}>{r.division}</div></div> },
              { key: "vehicleNo", label: "TRAILER NO.", render: (r) => <span style={{ fontFamily: "monospace", fontWeight: 700 }}>{r.vehicleNo}</span> },
              { key: "cropName", label: "COMMODITY" },
              { key: "baleCount", label: "BALES", render: (r) => `${r.baleCount} Bales` },
              { key: "dispatchedTonnageMt", label: "TONNAGE (MT)", render: (r) => `${r.dispatchedTonnageMt} MT` },
              { key: "totalInvoiceAmount", label: "TOTAL INVOICE (₹)", render: (r) => <strong style={{ color: "#2563EB" }}>₹{(r.totalInvoiceAmount || 0).toLocaleString("en-IN")}</strong> },
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
      )}

      {/* MODALS */}
      <NewBiomassCollectionModal
        isOpen={isCollectionModalOpen}
        onClose={() => setIsCollectionModalOpen(false)}
        onSave={handleSaveCollection}
      />

      <NewBiomassDispatchModal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        onSave={handleSaveDispatch}
      />

      <BiomassGatePassModal
        passData={selectedGatePassForPrint}
        onClose={() => setSelectedGatePassForPrint(null)}
      />

      <NewVendorModal
        isOpen={isNewVendorModalOpen}
        onClose={() => setIsNewVendorModalOpen(false)}
        onSaved={(updatedVendors) => setVendorsList(updatedVendors)}
      />

      <NewBuyerModal
        isOpen={isNewBuyerModalOpen}
        onClose={() => setIsNewBuyerModalOpen(false)}
        onSaved={(updatedBuyers) => setBuyersList(updatedBuyers)}
      />

      <NewWarehouseTccModal
        isOpen={isNewWarehouseModalOpen}
        onClose={() => setIsNewWarehouseModalOpen(false)}
        onSaved={() => toast.success("Warehouse added! You can also manage personnel in Admin Management.")}
      />
    </div>
  );
}
