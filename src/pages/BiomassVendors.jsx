import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import DataTable from "../components/common/DataTable";
import Button from "../components/common/Button";
import NewVendorModal from "../components/biomass/NewVendorModal";
import BiomassCollectionSlipModal from "../components/biomass/BiomassCollectionSlipModal";
import {
  getStoredVendors,
  updateVendor,
  deleteVendor,
  getStoredCollections,
} from "../features/biomass/biomassService";
import { toast } from "../utils/toast";

export default function BiomassVendors() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState(getStoredVendors);
  const [collections] = useState(getStoredCollections);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("cards"); // "cards" | "table"
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals & Drawers
  const [isNewVendorModalOpen, setIsNewVendorModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [selectedVendorForDetails, setSelectedVendorForDetails] = useState(null);
  const [selectedSlipForPrint, setSelectedSlipForPrint] = useState(null);

  // Edit Form state
  const [editForm, setEditForm] = useState({
    companyName: "",
    representative: "",
    contactNo: "",
    email: "",
    address: "",
    sourcingArea: "",
    gstin: "",
    poNo: "",
    poDate: "",
    tenure: "",
    contractedQtyMt: 1000,
    agreedPricePerMt: 1400,
  });

  // Calculate live stats for each vendor based on collections
  const vendorsWithStats = useMemo(() => {
    return vendors.map((v) => {
      const vendorCollections = collections.filter(
        (c) => c.vendorId === v.id || c.vendorName?.toLowerCase() === v.companyName?.toLowerCase()
      );
      const totalSourcedMt = vendorCollections.reduce((sum, c) => sum + (c.invoiceWeightMt || 0), 0);
      const totalSpendRs = vendorCollections.reduce((sum, c) => sum + (c.totalAmountRs || 0), 0);
      const effectiveSourcedMt = totalSourcedMt > 0 ? totalSourcedMt : (v.fulfilledQtyMt || 0);

      const progressPct = v.contractedQtyMt > 0
        ? Math.min(100, Math.round((effectiveSourcedMt / v.contractedQtyMt) * 100))
        : 0;

      return {
        ...v,
        collectionsCount: vendorCollections.length,
        actualSourcedMt: effectiveSourcedMt,
        totalSpendRs,
        progressPct,
        collectionsList: vendorCollections,
      };
    });
  }, [vendors, collections]);

  // Filtering
  const filteredVendors = useMemo(() => {
    return vendorsWithStats.filter((v) => {
      const matchSearch =
        v.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.vendorCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.representative.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.contactNo.includes(searchTerm) ||
        v.gstin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.sourcingArea && v.sourcingArea.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = statusFilter === "ALL" || v.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [vendorsWithStats, searchTerm, statusFilter]);

  // Aggregate Metrics
  const totalContracted = useMemo(() => vendors.reduce((s, v) => s + (Number(v.contractedQtyMt) || 0), 0), [vendors]);
  const totalFulfilled = useMemo(() => vendorsWithStats.reduce((s, v) => s + v.actualSourcedMt, 0), [vendorsWithStats]);
  const totalSpend = useMemo(() => vendorsWithStats.reduce((s, v) => s + v.totalSpendRs, 0), [vendorsWithStats]);

  function handleDeleteVendor(id, name) {
    if (window.confirm(`Are you sure you want to remove vendor "${name}"?`)) {
      const updated = deleteVendor(id);
      setVendors(updated);
      toast.success(`Vendor "${name}" deleted successfully.`);
      if (selectedVendorForDetails?.id === id) setSelectedVendorForDetails(null);
    }
  }

  function handleOpenEdit(vendor) {
    setEditingVendor(vendor);
    setEditForm({
      companyName: vendor.companyName || "",
      representative: vendor.representative || "",
      contactNo: vendor.contactNo || "",
      email: vendor.email || "",
      address: vendor.address || "",
      sourcingArea: vendor.sourcingArea || "",
      gstin: vendor.gstin || "",
      poNo: vendor.poNo || "",
      poDate: vendor.poDate || "",
      tenure: vendor.tenure || "",
      contractedQtyMt: vendor.contractedQtyMt || 1000,
      agreedPricePerMt: vendor.agreedPricePerMt || 1400,
    });
  }

  function handleSaveEdit(e) {
    e.preventDefault();
    if (!editingVendor) return;

    const updated = updateVendor(editingVendor.id, {
      companyName: editForm.companyName.toUpperCase(),
      representative: editForm.representative,
      contactNo: editForm.contactNo,
      email: editForm.email,
      address: editForm.address,
      sourcingArea: editForm.sourcingArea,
      gstin: editForm.gstin.toUpperCase(),
      poNo: editForm.poNo,
      poDate: editForm.poDate,
      tenure: editForm.tenure,
      contractedQtyMt: parseFloat(editForm.contractedQtyMt) || 1000,
      agreedPricePerMt: parseFloat(editForm.agreedPricePerMt) || 1400,
    });

    setVendors(updated);
    setEditingVendor(null);
    toast.success(`Vendor "${editForm.companyName}" details updated.`);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* PAGE HEADER */}
      <PageHeader
        title="👥 Biomass Vendor Master & Directory (आपूर्तिकर्ता सूची)"
        subtitle="Stage 1 Collection Partners — Raw Biomass Suppliers, Village Aggregators, FPOs & Supply Contractors"
      />

      {/* TOP KPI METRICS BAR */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }} className="responsive-grid-2">
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "#EFF6FF", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            <i className="fa-solid fa-users" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Active Sourcing Vendors</p>
            <div style={{ fontSize: 18, fontWeight: 900, color: "var(--ink)", marginTop: 2 }}>{vendors.length} Contractors</div>
            <span style={{ fontSize: 11, color: "#2563EB", fontWeight: 700 }}>100% Verified Partners</span>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "#FEF3C7", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            <i className="fa-solid fa-file-contract" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Total Contracted Tonnage</p>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#D97706", marginTop: 2 }}>{totalContracted.toLocaleString("en-IN")} MT</div>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>Under Active Term Sheets</span>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "#D1FAE5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            <i className="fa-solid fa-truck-ramp-box" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Total Sourced to Date</p>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#059669", marginTop: 2 }}>{totalFulfilled.toFixed(2)} MT</div>
            <span style={{ fontSize: 11, color: "#059669", fontWeight: 700 }}>
              {totalContracted > 0 ? Math.round((totalFulfilled / totalContracted) * 100) : 0}% Target Fulfilled
            </span>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "#F3E8FF", color: "#7E22CE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            <i className="fa-solid fa-indian-rupee-sign" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Procurement Spend</p>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#7E22CE", marginTop: 2 }}>
              ₹{(totalSpend || 70949).toLocaleString("en-IN")}
            </div>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>Direct Inflow Disbursals</span>
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
              placeholder="Search vendor name, GSTIN, contact, belt..."
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
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
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Contractors</option>
            <option value="COMPLETED">Contract Completed</option>
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
              onClick={() => navigate("/biomass/vendors/create")}
              style={{ padding: "8px 16px", fontSize: 12.5, fontWeight: 800, background: "#2563EB", display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              ➕ Create Vendor
            </Button>
            <button
              type="button"
              onClick={() => setIsNewVendorModalOpen(true)}
              style={{ padding: "8px 12px", fontSize: 12, fontWeight: 700, borderRadius: 8, border: "1px solid #BFDBFE", background: "#EFF6FF", color: "#1E40AF", cursor: "pointer" }}
            >
              ⚡ Quick Modal
            </button>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: VISUAL CARDS GRID */}
      {viewMode === "cards" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }} className="responsive-grid-1">
          {filteredVendors.map((vendor) => (
            <div
              key={vendor.id}
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
                    <span style={{ fontSize: 15, fontWeight: 900, color: "var(--ink)" }}>{vendor.companyName}</span>
                    <span style={{ fontSize: 10, fontWeight: 800, background: "#DBEAFE", color: "#1E40AF", padding: "2px 6px", borderRadius: 4, fontFamily: "monospace" }}>
                      {vendor.vendorCode}
                    </span>
                  </div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--primary)", marginTop: 2 }}>
                    📍 Sourcing Belt: {vendor.sourcingArea}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ fontSize: 10, fontWeight: 800, background: "#D1FAE5", color: "#065F46", padding: "3px 8px", borderRadius: 12 }}>
                    ● {vendor.status || "ACTIVE"}
                  </span>
                  <button
                    onClick={() => handleOpenEdit(vendor)}
                    title="Edit Vendor"
                    style={{ background: "#F1F5F9", border: "1px solid #CBD5E1", borderRadius: 6, padding: "4px 8px", fontSize: 11, cursor: "pointer" }}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteVendor(vendor.id, vendor.companyName)}
                    title="Delete Vendor"
                    style={{ background: "#FEE2E2", border: "1px solid #FCA5A5", color: "#991B1B", borderRadius: 6, padding: "4px 8px", fontSize: 11, cursor: "pointer" }}
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Key Details Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12, background: "var(--surface-tint)", padding: 10, borderRadius: 8 }}>
                <div>👤 Contact Person: <strong>{vendor.representative || "N/A"}</strong></div>
                <div>📞 Mobile: <strong style={{ color: "#2563EB" }}>{vendor.contactNo}</strong></div>
                <div>📧 Email: <strong>{vendor.email || "N/A"}</strong></div>
                <div>🏢 GSTIN: <strong style={{ fontFamily: "monospace" }}>{vendor.gstin}</strong></div>
                <div style={{ gridColumn: "span 2" }}>📍 Office Address: <span style={{ color: "var(--muted)" }}>{vendor.address}</span></div>
              </div>

              {/* Term Sheet & PO Card */}
              <div style={{ background: "#FEF3C7", border: "1px solid #F59E0B", borderRadius: 8, padding: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#92400E" }}>
                    📜 Purchase Order: #{vendor.poNo} (Date: {vendor.poDate})
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#B45309" }}>
                    ₹{vendor.agreedPricePerMt} / MT
                  </span>
                </div>
                <div style={{ fontSize: 11, color: "#78350F" }}>
                  Tenure: <strong>{vendor.tenure}</strong> | Target: <strong>{vendor.contractedQtyMt} MT</strong>
                </div>

                {/* Progress Bar */}
                <div style={{ marginTop: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, fontWeight: 700, color: "#92400E", marginBottom: 2 }}>
                    <span>Fulfilled: {vendor.actualSourcedMt.toFixed(1)} MT / {vendor.contractedQtyMt} MT</span>
                    <span>{vendor.progressPct}%</span>
                  </div>
                  <div style={{ width: "100%", height: 7, background: "#FDE68A", borderRadius: 4, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${vendor.progressPct}%`,
                        height: "100%",
                        background: vendor.progressPct > 75 ? "#059669" : "#D97706",
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
                  Total Inflows Logged: <strong style={{ color: "var(--ink)" }}>{vendor.collectionsCount} Slips</strong>
                </div>

                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => setSelectedVendorForDetails(vendor)}
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
                    📋 View Inflow Ledger
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredVendors.length === 0 && (
            <div style={{ gridColumn: "span 2", textAlign: "center", padding: "40px 20px", color: "var(--muted)" }}>
              <i className="fa-solid fa-users-slash" style={{ fontSize: 32, marginBottom: 8, display: "block" }} />
              No vendors found matching &ldquo;{searchTerm}&rdquo;
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 2: TABULAR DATA TABLE */}
      {viewMode === "table" && (
        <DataTable
          title="All Raw Biomass Vendors & Sourcing Master Register"
          searchable
          searchPlaceholder="Search vendor code, representative, gstin..."
          keyField="id"
          rows={filteredVendors}
          columns={[
            { key: "vendorCode", label: "CODE", emphasize: true, render: (r) => <strong style={{ fontFamily: "monospace", color: "#1E40AF" }}>{r.vendorCode}</strong> },
            {
              key: "companyName",
              label: "VENDOR / COMPANY",
              render: (r) => (
                <div>
                  <strong style={{ color: "var(--ink)" }}>{r.companyName}</strong>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>GSTIN: {r.gstin}</div>
                </div>
              ),
            },
            {
              key: "representative",
              label: "REPRESENTATIVE",
              render: (r) => (
                <div>
                  <div>{r.representative}</div>
                  <div style={{ fontSize: 11, color: "#2563EB", fontWeight: 700 }}>{r.contactNo}</div>
                </div>
              ),
            },
            { key: "sourcingArea", label: "SOURCING BELT", render: (r) => <span style={{ fontSize: 11.5 }}>{r.sourcingArea}</span> },
            {
              key: "poNo",
              label: "PO & TENURE",
              render: (r) => (
                <div style={{ fontSize: 11 }}>
                  <strong>#{r.poNo}</strong>
                  <div style={{ color: "var(--muted)" }}>{r.tenure}</div>
                </div>
              ),
            },
            {
              key: "contractedQtyMt",
              label: "CONTRACTED (MT)",
              render: (r) => `${r.contractedQtyMt} MT`,
            },
            {
              key: "actualSourcedMt",
              label: "FULFILLED (MT)",
              render: (r) => <strong style={{ color: "#059669" }}>{r.actualSourcedMt.toFixed(1)} MT ({r.progressPct}%)</strong>,
            },
            {
              key: "agreedPricePerMt",
              label: "AGREED RATE",
              render: (r) => `₹${r.agreedPricePerMt}/MT`,
            },
            {
              key: "actions",
              label: "ACTIONS",
              render: (r) => (
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => setSelectedVendorForDetails(r)}
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
                    onClick={() => handleDeleteVendor(r.id, r.companyName)}
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

      {/* VENDOR INFLOW LEDGER & DETAILS MODAL */}
      {selectedVendorForDetails && (
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
              maxWidth: 820,
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
                  👤 {selectedVendorForDetails.companyName} ({selectedVendorForDetails.vendorCode})
                </h3>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--muted)" }}>
                  Sourcing Contract Ledger & Delivered Raw Biomass Slips
                </p>
              </div>
              <button
                onClick={() => setSelectedVendorForDetails(null)}
                style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--muted)" }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Summary Header Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 8, padding: 10 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: "#1E40AF" }}>CONTRACTED TARGET</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "#1E3A8A", marginTop: 2 }}>
                    {selectedVendorForDetails.contractedQtyMt} MT
                  </div>
                  <div style={{ fontSize: 11, color: "#3B82F6" }}>PO #{selectedVendorForDetails.poNo}</div>
                </div>

                <div style={{ background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: 8, padding: 10 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: "#065F46" }}>DELIVERED WEIGHT (GRN)</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "#047857", marginTop: 2 }}>
                    {selectedVendorForDetails.actualSourcedMt.toFixed(2)} MT
                  </div>
                  <div style={{ fontSize: 11, color: "#10B981", fontWeight: 700 }}>
                    {selectedVendorForDetails.progressPct}% Target Achieved
                  </div>
                </div>

                <div style={{ background: "#FAF5FF", border: "1px solid #E9D5FF", borderRadius: 8, padding: 10 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: "#6B21A8" }}>AGREED RATE & VALUE</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "#581C87", marginTop: 2 }}>
                    ₹{selectedVendorForDetails.agreedPricePerMt} / MT
                  </div>
                  <div style={{ fontSize: 11, color: "#7E22CE" }}>
                    Total: ₹{(selectedVendorForDetails.totalSpendRs || 0).toLocaleString("en-IN")}
                  </div>
                </div>
              </div>

              {/* Sourced Raw Inflow Slips Table */}
              <div>
                <h4 style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 800, color: "var(--ink)" }}>
                  🚜 Raw Biomass Inflow Slips Sourced via this Vendor
                </h4>
                {selectedVendorForDetails.collectionsList?.length > 0 ? (
                  <div style={{ border: "1px solid var(--line)", borderRadius: 8, overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                      <thead>
                        <tr style={{ background: "var(--surface-tint)", textAlign: "left", fontSize: 11, fontWeight: 800, color: "var(--muted)", borderBottom: "1px solid var(--line)" }}>
                          <th style={{ padding: "8px 10px" }}>SLIP NO</th>
                          <th style={{ padding: "8px 10px" }}>DATE</th>
                          <th style={{ padding: "8px 10px" }}>VILLAGE & FARMER</th>
                          <th style={{ padding: "8px 10px" }}>VEHICLE</th>
                          <th style={{ padding: "8px 10px" }}>CROP</th>
                          <th style={{ padding: "8px 10px" }}>GRN (MT)</th>
                          <th style={{ padding: "8px 10px" }}>AMOUNT (₹)</th>
                          <th style={{ padding: "8px 10px" }}>ACTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedVendorForDetails.collectionsList.map((slip) => (
                          <tr key={slip.id} style={{ borderBottom: "1px solid var(--line)" }}>
                            <td style={{ padding: "8px 10px", fontWeight: 700, fontFamily: "monospace" }}>{slip.slipNo}</td>
                            <td style={{ padding: "8px 10px" }}>{slip.date}</td>
                            <td style={{ padding: "8px 10px" }}>{slip.villageName} ({slip.farmerName})</td>
                            <td style={{ padding: "8px 10px", fontFamily: "monospace" }}>{slip.vehicleNo}</td>
                            <td style={{ padding: "8px 10px", color: "#047857", fontWeight: 700 }}>{slip.cropName}</td>
                            <td style={{ padding: "8px 10px", fontWeight: 800 }}>{slip.invoiceWeightMt} MT</td>
                            <td style={{ padding: "8px 10px", fontWeight: 800, color: "#1E40AF" }}>₹{(slip.totalAmountRs || 0).toLocaleString("en-IN")}</td>
                            <td style={{ padding: "8px 10px" }}>
                              <button
                                onClick={() => setSelectedSlipForPrint(slip)}
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
                    No raw entry slips recorded under this vendor yet.
                  </div>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setSelectedVendorForDetails(null)}
                  style={{ padding: "8px 16px", fontSize: 12.5, borderRadius: 8, border: "1px solid var(--line)", background: "var(--surface)", cursor: "pointer" }}
                >
                  Close Ledger
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT VENDOR MODAL */}
      {editingVendor && (
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
                  ✏️ Edit Biomass Vendor ({editingVendor.vendorCode})
                </h3>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--muted)" }}>
                  Update vendor contact, address, and PO term sheet details
                </p>
              </div>
              <button onClick={() => setEditingVendor(null)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--muted)" }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 3 }}>
                    Vendor Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.companyName}
                    onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                    style={{ width: "100%", padding: "7px 10px", fontSize: 12, fontWeight: 700, borderRadius: 6, border: "1px solid var(--line-strong)" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 3 }}>
                    GSTIN Number
                  </label>
                  <input
                    type="text"
                    value={editForm.gstin}
                    onChange={(e) => setEditForm({ ...editForm, gstin: e.target.value })}
                    style={{ width: "100%", padding: "7px 10px", fontSize: 12, fontWeight: 700, borderRadius: 6, border: "1px solid var(--line-strong)" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 3 }}>
                    Representative Name
                  </label>
                  <input
                    type="text"
                    value={editForm.representative}
                    onChange={(e) => setEditForm({ ...editForm, representative: e.target.value })}
                    style={{ width: "100%", padding: "7px 10px", fontSize: 12, borderRadius: 6, border: "1px solid var(--line-strong)" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 3 }}>
                    Contact Mobile *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.contactNo}
                    onChange={(e) => setEditForm({ ...editForm, contactNo: e.target.value })}
                    style={{ width: "100%", padding: "7px 10px", fontSize: 12, fontWeight: 700, borderRadius: 6, border: "1px solid var(--line-strong)" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 3 }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    style={{ width: "100%", padding: "7px 10px", fontSize: 12, borderRadius: 6, border: "1px solid var(--line-strong)" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 3 }}>
                  Sourcing Area / Village Belt
                </label>
                <input
                  type="text"
                  value={editForm.sourcingArea}
                  onChange={(e) => setEditForm({ ...editForm, sourcingArea: e.target.value })}
                  style={{ width: "100%", padding: "7px 10px", fontSize: 12, borderRadius: 6, border: "1px solid var(--line-strong)" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 3 }}>
                  Full Office Address
                </label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  style={{ width: "100%", padding: "7px 10px", fontSize: 12, borderRadius: 6, border: "1px solid var(--line-strong)" }}
                />
              </div>

              <div style={{ background: "#F8FAFC", border: "1px solid #CBD5E1", borderRadius: 8, padding: 12, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                <div>
                  <label style={{ fontSize: 10.5, fontWeight: 700, color: "#475569" }}>PO Number</label>
                  <input type="text" value={editForm.poNo} onChange={(e) => setEditForm({ ...editForm, poNo: e.target.value })} style={{ width: "100%", padding: 5, fontSize: 11.5, borderRadius: 4, border: "1px solid #94A3B8" }} />
                </div>
                <div>
                  <label style={{ fontSize: 10.5, fontWeight: 700, color: "#475569" }}>Supply Tenure</label>
                  <input type="text" value={editForm.tenure} onChange={(e) => setEditForm({ ...editForm, tenure: e.target.value })} style={{ width: "100%", padding: 5, fontSize: 11.5, borderRadius: 4, border: "1px solid #94A3B8" }} />
                </div>
                <div>
                  <label style={{ fontSize: 10.5, fontWeight: 700, color: "#475569" }}>Contracted Qty (MT)</label>
                  <input type="number" value={editForm.contractedQtyMt} onChange={(e) => setEditForm({ ...editForm, contractedQtyMt: e.target.value })} style={{ width: "100%", padding: 5, fontSize: 11.5, borderRadius: 4, border: "1px solid #94A3B8" }} />
                </div>
                <div>
                  <label style={{ fontSize: 10.5, fontWeight: 700, color: "#475569" }}>Agreed Price (₹/MT)</label>
                  <input type="number" value={editForm.agreedPricePerMt} onChange={(e) => setEditForm({ ...editForm, agreedPricePerMt: e.target.value })} style={{ width: "100%", padding: 5, fontSize: 11.5, borderRadius: 4, border: "1px solid #94A3B8" }} />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setEditingVendor(null)} style={{ padding: "8px 16px", fontSize: 12.5, borderRadius: 8, border: "1px solid var(--line)" }}>
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

      {/* NEW VENDOR MODAL */}
      <NewVendorModal
        isOpen={isNewVendorModalOpen}
        onClose={() => setIsNewVendorModalOpen(false)}
        onSaved={(updatedList) => setVendors(updatedList)}
      />

      {/* PRINT SLIP MODAL */}
      <BiomassCollectionSlipModal
        slipData={selectedSlipForPrint}
        onClose={() => setSelectedSlipForPrint(null)}
      />
    </div>
  );
}
