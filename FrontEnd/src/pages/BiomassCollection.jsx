import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import DataTable from "../components/common/DataTable";
import Button from "../components/common/Button";
import NewBiomassCollectionModal from "../components/biomass/NewBiomassCollectionModal";
import NewVendorModal from "../components/biomass/NewVendorModal";
import BiomassCollectionSlipModal from "../components/biomass/BiomassCollectionSlipModal";
import {
  CROPS_MASTER,
  DEFAULT_VILLAGES,
  getStoredVendors,
  getStoredCollections,
  saveNewCollection,
  deleteCollection,
} from "../features/biomass/biomassService";
import { toast } from "../utils/toast";

export default function BiomassCollection() {
  const navigate = useNavigate();

  // State Data
  const [collections, setCollections] = useState(getStoredCollections);
  const [vendorsList, setVendorsList] = useState(getStoredVendors);
  const [selectedVillageFilter, setSelectedVillageFilter] = useState("ALL");
  const [selectedCropFilter, setSelectedCropFilter] = useState("ALL");
  const [selectedVendorFilter, setSelectedVendorFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [isNewVendorModalOpen, setIsNewVendorModalOpen] = useState(false);
  const [selectedSlipForPrint, setSelectedSlipForPrint] = useState(null);

  // Active Highlighted Vendor for quick summary
  const [activeVendorId, setActiveVendorId] = useState(vendorsList[0]?.id || "");
  const currentVendor = vendorsList.find((v) => v.id === activeVendorId) || vendorsList[0];

  // Filtering
  const filteredCollections = useMemo(() => {
    return collections.filter((item) => {
      const matchSearch =
        item.slipNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.villageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.vehicleNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.vendorName && item.vendorName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchVillage =
        selectedVillageFilter === "ALL" ||
        item.villageName.toLowerCase().includes(selectedVillageFilter.toLowerCase());

      const matchCrop =
        selectedCropFilter === "ALL" ||
        item.cropId === selectedCropFilter ||
        item.cropName?.toLowerCase().includes(selectedCropFilter.toLowerCase());

      const matchVendor =
        selectedVendorFilter === "ALL" ||
        item.vendorId === selectedVendorFilter ||
        item.vendorName === selectedVendorFilter;

      return matchSearch && matchVillage && matchCrop && matchVendor;
    });
  }, [collections, searchQuery, selectedVillageFilter, selectedCropFilter, selectedVendorFilter]);

  // Aggregate Metrics
  const totalRawMt = useMemo(() => collections.reduce((s, c) => s + (Number(c.actualNetWeightMt) || 0), 0), [collections]);
  const totalGrnPayableMt = useMemo(() => collections.reduce((s, c) => s + (Number(c.invoiceWeightMt) || 0), 0), [collections]);
  const totalSpendRs = useMemo(() => collections.reduce((s, c) => s + (Number(c.totalAmountRs) || 0), 0), [collections]);
  const totalBalesProduced = useMemo(() => collections.reduce((s, c) => s + (Number(c.baleCountProduced) || 0), 0), [collections]);
  const avgMoisture = useMemo(() => {
    if (collections.length === 0) return 0;
    const sum = collections.reduce((s, c) => s + (Number(c.actualMoisturePct) || 0), 0);
    return (sum / collections.length).toFixed(1);
  }, [collections]);

  function handleSaveCollection(entry) {
    const updated = saveNewCollection(entry);
    setCollections(updated);
    toast.success(`Weighbridge Slip #${updated[0].slipNo} created for ${entry.farmerName}!`);
  }

  function handleDeleteSlip(id, slipNo) {
    if (window.confirm(`Delete Collection Slip ${slipNo}?`)) {
      const updated = deleteCollection(id);
      setCollections(updated);
      toast.success(`Slip ${slipNo} deleted.`);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* PAGE HEADER */}
      <PageHeader
        title="Stage 1: Biomass Collection"
        subtitle="Raw Biomass & Parali Inflow Tracking — 50–100 Villages Procurement Network, Weighbridge Slips & Vendor Mapping"
      />

      {/* TOP KPI METRICS BAR */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }} className="responsive-grid-2">
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "#FEF3C7", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            <i className="ri-truck-line" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Total Raw Inflow (MT)</p>
            <div style={{ fontSize: 18, fontWeight: 900, color: "var(--ink)", marginTop: 2 }}>{totalRawMt.toFixed(2)} MT</div>
            <span style={{ fontSize: 11, color: "#D97706", fontWeight: 700 }}>GRN Payable: {totalGrnPayableMt.toFixed(2)} MT</span>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "#D1FAE5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            <i className="ri-community-line" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Village Network</p>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#059669", marginTop: 2 }}>{DEFAULT_VILLAGES.length} Clusters</div>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>50–100 Sourcing Villages Active</span>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "#DBEAFE", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            <i className="ri-file-text-line" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Total Slips & Bales</p>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#2563EB", marginTop: 2 }}>{collections.length} Slips Logged</div>
            <span style={{ fontSize: 11, color: "#2563EB", fontWeight: 700 }}>{totalBalesProduced.toLocaleString("en-IN")} Bales Compressed</span>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "#F3E8FF", color: "#7E22CE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            <i className="ri-money-rupee-circle-line" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Collection Payout (₹)</p>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#7E22CE", marginTop: 2 }}>₹{totalSpendRs.toLocaleString("en-IN")}</div>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>Avg Moist: {avgMoisture}% (Norm &lt; 20%)</span>
          </div>
        </div>
      </div>

      {/* VILLAGE NETWORK CLUSTERS */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: 12,
          padding: 14,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: 13, fontWeight: 900, color: "var(--ink)", textTransform: "uppercase" }}>
              Sourcing Villages & Clusters Network
            </span>

            <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "var(--muted)" }}>
              Direct farm-gate aggregation covering 50–100 villages across Unnao, Hardoi, and Shahjahanpur
            </p>
          </div>
          {selectedVillageFilter !== "ALL" && (
            <button
              onClick={() => setSelectedVillageFilter("ALL")}
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#2563EB",
                background: "#EFF6FF",
                border: "1px solid #BFDBFE",
                padding: "3px 8px",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              ✕ Clear Filter ({selectedVillageFilter})
            </button>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }} className="responsive-grid-2">
          {DEFAULT_VILLAGES.map((v) => {
            const isSelected = selectedVillageFilter.toLowerCase().includes(v.name.split(" ")[0].toLowerCase());
            return (
              <div
                key={v.id}
                onClick={() => setSelectedVillageFilter(isSelected ? "ALL" : v.name.split(" ")[0])}
                style={{
                  background: isSelected ? "var(--primary-tint)" : "var(--canvas)",
                  border: isSelected ? "1.5px solid var(--primary)" : "1px solid var(--line)",
                  borderRadius: 10,
                  padding: "10px 12px",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ fontSize: 12.5, color: "var(--ink)" }}>{v.name}</strong>
                  <span style={{ fontSize: 10, fontWeight: 800, color: "#059669", background: "#D1FAE5", padding: "1px 5px", borderRadius: 4 }}>
                    {v.distanceKm} km
                  </span>
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>
                  Block: <strong>{v.block}</strong> | Farmers: <strong>{v.registeredFarmers}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2, fontSize: 11 }}>
                  <span style={{ fontWeight: 700, color: "#047857" }}>{v.primaryCrop}</span>
                  <span style={{ fontWeight: 800, color: "var(--ink)" }}>{v.totalTonnageDeliveredMt} MT</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* STAGE 1 MAIN LAYOUT: LEFT TABLE & RIGHT VENDOR DETAIL PANEL */}
      <div style={{ display: "grid", gridTemplateColumns: "2.3fr 1fr", gap: 16 }} className="responsive-grid-1">
        {/* LEFT COLUMN: COLLECTION ENTRIES TABLE & FILTERS */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Table Action Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 10,
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: 10,
              padding: "10px 12px",
            }}
          >
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <input
                type="text"
                placeholder="Search slip, farmer, vehicle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: "6px 10px",
                  fontSize: 12,
                  borderRadius: 6,
                  border: "1px solid var(--line-strong)",
                  width: 200,
                }}
              />

              <select
                value={selectedCropFilter}
                onChange={(e) => setSelectedCropFilter(e.target.value)}
                style={{ padding: "6px 10px", fontSize: 11.5, fontWeight: 700, borderRadius: 6, border: "1px solid var(--line-strong)" }}
              >
                <option value="ALL">All Crop Residues</option>
                {CROPS_MASTER.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedVendorFilter}
                onChange={(e) => setSelectedVendorFilter(e.target.value)}
                style={{ padding: "6px 10px", fontSize: 11.5, fontWeight: 700, borderRadius: 6, border: "1px solid var(--line-strong)" }}
              >
                <option value="ALL">All Supply Vendors</option>
                {vendorsList.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.companyName}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <Button
                onClick={() => setIsCollectionModalOpen(true)}
                style={{ padding: "7px 14px", fontSize: 12, fontWeight: 800, background: "var(--gradient-primary)", display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                New Raw Entry Slip
              </Button>
            </div>
          </div>

          {/* Collection Data Table */}
          <DataTable
            title="Stage 1: Raw Biomass Collection Register (Weighbridge & Farm Gate)"
            keyField="id"
            rows={filteredCollections}
            columns={[
              {
                key: "slipNo",
                label: "SLIP NO.",
                emphasize: true,
                render: (r) => (
                  <div>
                    <strong style={{ fontFamily: "monospace", color: "#1E40AF" }}>{r.slipNo}</strong>
                    <div style={{ fontSize: 10.5, color: "var(--muted)" }}>{r.date} {r.time || ""}</div>
                  </div>
                ),
              },
              {
                key: "villageName",
                label: "VILLAGE / FARMER",
                render: (r) => (
                  <div>
                    <strong style={{ color: "var(--ink)" }}>{r.villageName}</strong>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>{r.farmerName} ({r.farmerMobile})</div>
                  </div>
                ),
              },
              {
                key: "cropName",
                label: "CROP TYPE",
                render: (r) => <span style={{ fontWeight: 700, color: "#047857", fontSize: 11.5 }}>{r.cropName}</span>,
              },
              {
                key: "vehicleNo",
                label: "VEHICLE NO.",
                render: (r) => <span style={{ fontFamily: "monospace", fontWeight: 800, background: "#F1F5F9", padding: "2px 6px", borderRadius: 4 }}>{r.vehicleNo}</span>,
              },
              {
                key: "actualNetWeightMt",
                label: "RAW NET (MT)",
                render: (r) => `${r.actualNetWeightMt} MT`,
              },
              {
                key: "actualMoisturePct",
                label: "MOIST / ASH",
                render: (r) => (
                  <span style={{ fontSize: 11 }}>
                    {r.actualMoisturePct}% / {r.actualAshPct}%
                  </span>
                ),
              },
              {
                key: "invoiceWeightMt",
                label: "GRN PAYABLE",
                render: (r) => <strong style={{ color: "#0F172A", fontSize: 12.5 }}>{r.invoiceWeightMt} MT</strong>,
              },
              {
                key: "totalAmountRs",
                label: "TOTAL (₹)",
                render: (r) => <strong style={{ color: "#047857" }}>₹{(r.totalAmountRs || 0).toLocaleString("en-IN")}</strong>,
              },
              {
                key: "actions",
                label: "ACTIONS",
                render: (r) => (
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => setSelectedSlipForPrint(r)}
                      title="Print Weighbridge Slip"
                      style={{ padding: "4px 8px", fontSize: 11, fontWeight: 700, background: "#0F172A", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}
                    >
                      Print
                    </button>
                    <button
                      onClick={() => handleDeleteSlip(r.id, r.slipNo)}
                      title="Delete Slip"
                      style={{ padding: "4px 6px", fontSize: 11, background: "#FEE2E2", color: "#991B1B", border: "1px solid #FCA5A5", borderRadius: 4, cursor: "pointer" }}
                    >
                      🗑️
                    </button>
                  </div>
                ),
              },
            ]}
          />
        </div>

        {/* RIGHT COLUMN: RAW MATERIAL VENDOR SUMMARY PANEL (जहाँ से माल लिया जा रहा है) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{
              background: "#FFFFFF",
              border: "2px solid #0F172A",
              borderRadius: 12,
              padding: 16,
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #E2E8F0", paddingBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 900, textTransform: "uppercase", color: "#0F172A" }}>
                👤 Raw Material Vendor (जहाँ से माल लिया जा रहा है)
              </span>
              <button
                onClick={() => setIsNewVendorModalOpen(true)}
                style={{ fontSize: 11, fontWeight: 700, color: "#2563EB", background: "#EFF6FF", border: "1px solid #BFDBFE", padding: "3px 8px", borderRadius: 4, cursor: "pointer" }}
              >
                Add Vendor
              </button>
            </div>

            {/* Select Active Vendor Dropdown */}
            <div>
              <label style={{ fontSize: 10.5, fontWeight: 700, color: "#64748B", display: "block", marginBottom: 3 }}>
                Switch Active Supply Vendor:
              </label>
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
              <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12 }}>
                <div style={{ background: "#F8FAFC", padding: 10, borderRadius: 8, border: "1px solid #E2E8F0" }}>
                  <div style={{ fontSize: 14, fontWeight: 900, color: "#0F172A" }}>{currentVendor.companyName}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#2563EB", marginTop: 2 }}>
                    Code: {currentVendor.vendorCode} | GSTIN: {currentVendor.gstin}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 11.5 }}>
                  <div>👤 Rep: <strong>{currentVendor.representative}</strong></div>
                  <div>📞 Mobile: <strong>{currentVendor.contactNo}</strong></div>
                  <div style={{ gridColumn: "span 2" }}>📧 Email: <strong>{currentVendor.email}</strong></div>
                  <div style={{ gridColumn: "span 2" }}>Address: {currentVendor.address}</div>
                </div>

                <div style={{ background: "#FEF3C7", border: "1px solid #F59E0B", padding: "10px", borderRadius: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#92400E" }}>
                    Term Sheet PO No: #{currentVendor.poNo} (Date: {currentVendor.poDate})
                  </div>
                  <div style={{ fontSize: 10.5, color: "#B45309", marginTop: 2 }}>
                    Tenure: {currentVendor.tenure} | Agreed Price: <strong>₹{currentVendor.agreedPricePerMt}/MT</strong>
                  </div>
                  <div style={{ fontSize: 10.5, color: "#78350F", marginTop: 2 }}>
                    Contracted Target: <strong>{currentVendor.contractedQtyMt} MT</strong>
                  </div>
                </div>

                {/* Direct Link to Full Vendors Master Page */}
                <button
                  type="button"
                  onClick={() => navigate("/biomass/vendors")}
                  style={{
                    padding: "8px 12px",
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
                    marginTop: 4,
                  }}
                >
                  👥 Open Full Vendor Master & Directory →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODALS */}
      <NewBiomassCollectionModal
        isOpen={isCollectionModalOpen}
        onClose={() => setIsCollectionModalOpen(false)}
        onSave={handleSaveCollection}
      />

      <NewVendorModal
        isOpen={isNewVendorModalOpen}
        onClose={() => setIsNewVendorModalOpen(false)}
        onSaved={(updatedVendors) => {
          setVendorsList(updatedVendors);
          setActiveVendorId(updatedVendors[0]?.id || "");
        }}
      />

      <BiomassCollectionSlipModal
        slipData={selectedSlipForPrint}
        onClose={() => setSelectedSlipForPrint(null)}
      />
    </div>
  );
}
