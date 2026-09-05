import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import DataTable from "../components/common/DataTable";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import Modal from "../components/common/Modal";
import FormField from "../components/common/FormField";
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
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals & Drawers
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
      const term = searchTerm.toLowerCase();
      const matchSearch =
        (v.companyName && v.companyName.toLowerCase().includes(term)) ||
        (v.vendorCode && v.vendorCode.toLowerCase().includes(term)) ||
        (v.representative && v.representative.toLowerCase().includes(term)) ||
        (v.contactNo && v.contactNo.includes(searchTerm)) ||
        (v.gstin && v.gstin.toLowerCase().includes(term)) ||
        (v.sourcingArea && v.sourcingArea.toLowerCase().includes(term));

      const matchStatus = statusFilter === "ALL" || v.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [vendorsWithStats, searchTerm, statusFilter]);

  // Aggregate Metrics
  const totalContracted = useMemo(() => vendors.reduce((s, v) => s + (Number(v.contractedQtyMt) || 0), 0), [vendors]);
  const totalFulfilled = useMemo(() => vendorsWithStats.reduce((s, v) => s + v.actualSourcedMt, 0), [vendorsWithStats]);
  const totalSpend = useMemo(() => vendorsWithStats.reduce((s, v) => s + v.totalSpendRs, 0), [vendorsWithStats]);

  function handleDeleteVendor(id, name) {
    if (window.confirm(`Are you sure you want to remove buyer "${name}"?`)) {
      const updated = deleteVendor(id);
      setVendors(updated);
      toast.success(`Buyer "${name}" deleted successfully.`);
      if (selectedVendorForDetails?.id === id) setSelectedVendorForDetails(null);
    }
  }

  function handleOpenEdit(v) {
    setEditingVendor(v);
    setEditForm({
      companyName: v.companyName || "",
      representative: v.representative || "",
      contactNo: v.contactNo || "",
      email: v.email || "",
      address: v.address || "",
      sourcingArea: v.sourcingArea || "",
      gstin: v.gstin || "",
      poNo: v.poNo || "",
      poDate: v.poDate || "",
      tenure: v.tenure || "",
      contractedQtyMt: v.contractedQtyMt || 1000,
      agreedPricePerMt: v.agreedPricePerMt || 1400,
    });
  }

  function handleSaveEdit(e) {
    e.preventDefault();
    if (!editForm.companyName.trim()) {
      toast.error("Buyer Name is required.");
      return;
    }
    if (editForm.gstin.trim() && editForm.gstin.trim().length !== 15) {
      toast.error("GSTIN must be exactly 15 alphanumeric characters (e.g. 27AAHCM1258Q1ZW).");
      return;
    }

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
    toast.success(`Buyer "${editForm.companyName}" details updated successfully.`);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* PAGE HEADER */}
      <PageHeader
        title="Biomass Vendors & Suppliers"
        subtitle="Master directory for biomass procurement partners, supply contractors, and farmer collectives"
        icon="ri-store-2-line"
        badge="VENDOR REPOSITORY"
      />

      {/* TOP KPI METRICS BAR */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12 }}>
        {/* Card 1: Active Partners */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderTop: "3px solid var(--primary)",
            borderRadius: 14,
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            boxShadow: "var(--shadow-xs)",
            transition: "all 200ms ease",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 8px 20px rgba(51, 116, 24, 0.08)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "var(--shadow-xs)";
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              background: "linear-gradient(135deg, rgba(93, 214, 44, 0.22) 0%, rgba(51, 116, 24, 0.1) 100%)",
              color: "var(--primary-deep)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              border: "1px solid rgba(93, 214, 44, 0.25)",
              flexShrink: 0,
            }}
          >
            <i className="ri-store-2-line" />
          </div>
          <div style={{ minWidth: 0 }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block" }}>
              Active Vendors
            </span>
            <strong style={{ fontSize: 16, color: "var(--ink)", display: "block", letterSpacing: "-0.02em", margin: "2px 0 1px" }}>
              {vendors.length} Partners
            </strong>
            <span style={{ fontSize: 11, color: "var(--primary-deep)", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
              <i className="ri-checkbox-circle-fill" style={{ fontSize: 11, color: "var(--primary)" }} /> 100% Verified
            </span>
          </div>
        </div>

        {/* Card 2: Contracted Volume */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderTop: "3px solid #D97706",
            borderRadius: 14,
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            boxShadow: "var(--shadow-xs)",
            transition: "all 200ms ease",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 8px 20px rgba(217, 119, 6, 0.08)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "var(--shadow-xs)";
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              background: "linear-gradient(135deg, rgba(217, 119, 6, 0.18) 0%, rgba(217, 119, 6, 0.06) 100%)",
              color: "#D97706",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              border: "1px solid rgba(217, 119, 6, 0.22)",
              flexShrink: 0,
            }}
          >
            <i className="ri-file-list-3-line" />
          </div>
          <div style={{ minWidth: 0 }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block" }}>
              Contracted Volume
            </span>
            <strong style={{ fontSize: 16, color: "#B45309", display: "block", letterSpacing: "-0.02em", margin: "2px 0 1px" }}>
              {totalContracted.toLocaleString("en-IN")} MT
            </strong>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>Under Active Term Sheets</span>
          </div>
        </div>

        {/* Card 3: Sourced to Date */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderTop: "3px solid #0284C7",
            borderRadius: 14,
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            boxShadow: "var(--shadow-xs)",
            transition: "all 200ms ease",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 8px 20px rgba(2, 132, 199, 0.08)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "var(--shadow-xs)";
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              background: "linear-gradient(135deg, rgba(2, 132, 199, 0.18) 0%, rgba(2, 132, 199, 0.06) 100%)",
              color: "#0284C7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              border: "1px solid rgba(2, 132, 199, 0.22)",
              flexShrink: 0,
            }}
          >
            <i className="ri-truck-line" />
          </div>
          <div style={{ minWidth: 0 }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block" }}>
              Sourced to Date
            </span>
            <strong style={{ fontSize: 16, color: "var(--ink)", display: "block", letterSpacing: "-0.02em", margin: "2px 0 1px" }}>
              {totalFulfilled.toFixed(2)} MT
            </strong>
            <span style={{ fontSize: 11, color: "#0284C7", fontWeight: 700 }}>
              {totalContracted > 0 ? Math.round((totalFulfilled / totalContracted) * 100) : 0}% Target Fulfilled
            </span>
          </div>
        </div>

        {/* Card 4: Procurement Spend */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderTop: "3px solid #7C3AED",
            borderRadius: 14,
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            boxShadow: "var(--shadow-xs)",
            transition: "all 200ms ease",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 8px 20px rgba(124, 58, 237, 0.08)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "var(--shadow-xs)";
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              background: "linear-gradient(135deg, rgba(124, 58, 237, 0.18) 0%, rgba(124, 58, 237, 0.06) 100%)",
              color: "#7C3AED",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              border: "1px solid rgba(124, 58, 237, 0.22)",
              flexShrink: 0,
            }}
          >
            <i className="ri-money-rupee-circle-line" />
          </div>
          <div style={{ minWidth: 0 }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block" }}>
              Procurement Spend
            </span>
            <strong style={{ fontSize: 16, color: "var(--ink)", display: "block", letterSpacing: "-0.02em", margin: "2px 0 1px" }}>
              ₹{(totalSpend || 70949).toLocaleString("en-IN")}
            </strong>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>Direct Inflow Disbursals</span>
          </div>
        </div>
      </div>

      {/* DATA TABLE VIEW */}
      <DataTable
        title="Biomass Vendor Directory"
        keyField="id"
        rows={filteredVendors}
        compact
        searchable
        searchPlaceholder="Search vendor name, GSTIN, contact, belt..."
        right={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  height: 32,
                  padding: "0 28px 0 10px",
                  fontSize: 12,
                  fontWeight: 600,
                  borderRadius: 8,
                  border: "1px solid var(--line-strong)",
                  background: "var(--surface)",
                  color: "var(--ink)",
                  outline: "none",
                  cursor: "pointer",
                  appearance: "none",
                  WebkitAppearance: "none",
                  fontFamily: "inherit",
                }}
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active Vendors</option>
                <option value="COMPLETED">Contract Completed</option>
              </select>
              <i
                className="ri-arrow-down-s-line"
                style={{
                  position: "absolute",
                  right: 8,
                  pointerEvents: "none",
                  fontSize: 14,
                  color: "var(--muted)",
                }}
              />
            </div>

            <Button
              size="sm"
              variant="primary"
              icon="ri-add-line"
              onClick={() => navigate("/biomass/vendors/create")}
              style={{ height: 32, fontSize: 12, padding: "0 12px", fontWeight: 700 }}
            >
              Add Vendor
            </Button>
          </div>
        }
        emptyMessage="No buyers match the search criteria."
        columns={[
          {
            key: "companyName",
            label: "Buyer / Contractor",
            emphasize: true,
            render: (r) => (
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "linear-gradient(135deg, rgba(93, 214, 44, 0.2) 0%, rgba(51, 116, 24, 0.1) 100%)",
                    color: "var(--primary-deep)",
                    fontSize: 11.5,
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    border: "1px solid rgba(93, 214, 44, 0.25)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  }}
                >
                  {(r.companyName || "V").slice(0, 2).toUpperCase()}
                </div>
                <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                  <span
                    style={{
                      fontWeight: 650,
                      color: "var(--ink)",
                      fontSize: 13,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: 220,
                    }}
                    title={r.companyName}
                  >
                    {r.companyName}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10.5, color: "var(--muted)", marginTop: 1 }}>
                    <span
                      style={{
                        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                        fontWeight: 700,
                        color: "var(--primary-deep)",
                        background: "var(--primary-tint)",
                        padding: "1px 5px",
                        borderRadius: 4,
                        letterSpacing: "0.2px",
                      }}
                    >
                      {r.vendorCode}
                    </span>
                    <span>•</span>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 2,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: 140,
                      }}
                      title={r.sourcingArea || "General Belt"}
                    >
                      <i className="ri-map-pin-2-line" style={{ fontSize: 10.5, color: "var(--muted)" }} />
                      {r.sourcingArea || "General Belt"}
                    </span>
                  </div>
                </div>
              </div>
            ),
          },
          {
            key: "taxDetails",
            label: "GSTIN / PAN",
            render: (r) => (
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span
                  style={{
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                    fontSize: 11,
                    fontWeight: 650,
                    color: "var(--ink)",
                    background: "var(--surface-hover)",
                    padding: "1.5px 6px",
                    borderRadius: 4,
                    border: "1px solid var(--line)",
                    letterSpacing: "0.3px",
                    width: "fit-content",
                  }}
                  title="15-digit GSTIN"
                >
                  {r.gstin || "N/A"}
                </span>
                <span
                  style={{
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                    fontSize: 10,
                    color: "var(--muted)",
                    paddingLeft: 2,
                  }}
                >
                  PAN: {r.panNo || (r.gstin ? r.gstin.slice(2, 12) : "N/A")}
                </span>
              </div>
            ),
          },
          {
            key: "representative",
            label: "Authorized Contact",
            render: (r) => (
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontWeight: 600, color: "var(--ink)", fontSize: 12.5 }}>
                  {r.representative || "Authorized Contact"}
                </span>
                {r.contactNo ? (
                  <a
                    href={`tel:${r.contactNo}`}
                    style={{
                      color: "var(--muted)",
                      fontSize: 11,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      textDecoration: "none",
                      width: "fit-content",
                      transition: "color 150ms ease",
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.color = "var(--primary-deep)")}
                    onMouseOut={(e) => (e.currentTarget.style.color = "var(--muted)")}
                    title="Click to call"
                  >
                    <i className="ri-phone-line" style={{ color: "var(--primary)", fontSize: 11 }} />
                    {r.contactNo}
                  </a>
                ) : (
                  <span style={{ color: "var(--muted)", fontSize: 11 }}>No contact</span>
                )}
              </div>
            ),
          },
          {
            key: "poNo",
            label: "PO & Term Sheet",
            render: (r) => (
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <span
                  style={{
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: "var(--ink)",
                    background: "rgba(51, 116, 24, 0.08)",
                    border: "1px solid rgba(51, 116, 24, 0.2)",
                    padding: "1.5px 6px",
                    borderRadius: 4,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    width: "fit-content",
                  }}
                >
                  <i className="ri-file-text-line" style={{ fontSize: 10, color: "var(--primary-deep)" }} />
                  {r.poNo || "PO-2026-001"}
                </span>
                <span style={{ color: "var(--primary-deep)", fontSize: 11, fontWeight: 700 }}>
                  ₹{(r.agreedPricePerMt || 1400).toLocaleString("en-IN")}{" "}
                  <span style={{ fontSize: 9.5, fontWeight: 500, color: "var(--muted)" }}>/MT</span>
                </span>
              </div>
            ),
          },
          {
            key: "fulfillment",
            label: "Target Fulfillment",
            render: (r) => {
              const pct = Math.min(Math.max(Number(r.progressPct || 0), 0), 100);
              const isDone = pct >= 100;
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 125 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: 11 }}>
                    <span style={{ fontWeight: 700, color: "var(--ink)" }}>
                      {Number(r.actualSourcedMt || 0).toFixed(1)} MT
                    </span>
                    <span style={{ color: "var(--muted)", fontSize: 10 }}>
                      / {(r.contractedQtyMt || 1000).toLocaleString("en-IN")} MT
                    </span>
                  </div>
                  <div style={{ height: 5, background: "rgba(0, 0, 0, 0.06)", borderRadius: 3, overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: isDone
                          ? "linear-gradient(90deg, #10B981, #059669)"
                          : pct > 0
                          ? "linear-gradient(90deg, var(--primary-light), var(--primary))"
                          : "transparent",
                        borderRadius: 3,
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 9.5, color: "var(--muted)" }}>Fulfillment</span>
                    <span
                      style={{
                        fontSize: 9.5,
                        fontWeight: 800,
                        color: isDone ? "#059669" : pct > 0 ? "var(--primary-deep)" : "var(--muted)",
                      }}
                    >
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            },
          },
          {
            key: "status",
            label: "Status",
            render: (r) => {
              const isActive = r.status === "ACTIVE";
              return (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "3px 8px",
                    borderRadius: 20,
                    fontSize: 10.5,
                    fontWeight: 700,
                    letterSpacing: "0.2px",
                    background: isActive ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.12)",
                    color: isActive ? "#047857" : "#b45309",
                    border: `1px solid ${isActive ? "rgba(16, 185, 129, 0.25)" : "rgba(245, 158, 11, 0.25)"}`,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: isActive ? "#10B981" : "#F59E0B",
                      boxShadow: isActive ? "0 0 0 2px rgba(16, 185, 129, 0.2)" : "none",
                    }}
                  />
                  {r.status || "ACTIVE"}
                </span>
              );
            },
          },
          {
            key: "actions",
            label: "Actions",
            sortable: false,
            render: (r) => (
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                {/* View Details */}
                <button
                  type="button"
                  title="View Buyer Profile & History"
                  onClick={() => setSelectedVendorForDetails(r)}
                  style={{
                    height: 26,
                    padding: "0 8px",
                    border: "1px solid var(--line-strong)",
                    background: "var(--surface)",
                    color: "var(--ink)",
                    fontSize: 11,
                    fontWeight: 600,
                    borderRadius: 6,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    transition: "all 150ms ease",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = "var(--primary)";
                    e.currentTarget.style.background = "var(--primary-tint)";
                    e.currentTarget.style.color = "var(--primary-deep)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = "var(--line-strong)";
                    e.currentTarget.style.background = "var(--surface)";
                    e.currentTarget.style.color = "var(--ink)";
                  }}
                >
                  <i className="ri-eye-line" style={{ fontSize: 11.5 }} />
                  <span>View</span>
                </button>

                {/* Edit */}
                <button
                  type="button"
                  title="Edit Buyer Details"
                  onClick={() => handleOpenEdit(r)}
                  style={{
                    height: 26,
                    padding: "0 8px",
                    border: "1px solid var(--line-strong)",
                    background: "var(--surface)",
                    color: "var(--ink)",
                    fontSize: 11,
                    fontWeight: 600,
                    borderRadius: 6,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    transition: "all 150ms ease",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = "#2563eb";
                    e.currentTarget.style.background = "rgba(37, 99, 235, 0.08)";
                    e.currentTarget.style.color = "#1d4ed8";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = "var(--line-strong)";
                    e.currentTarget.style.background = "var(--surface)";
                    e.currentTarget.style.color = "var(--ink)";
                  }}
                >
                  <i className="ri-edit-line" style={{ fontSize: 11.5 }} />
                  <span>Edit</span>
                </button>

                {/* Delete */}
                <button
                  type="button"
                  title="Delete Buyer"
                  onClick={() => handleDeleteVendor(r.id, r.companyName)}
                  style={{
                    height: 26,
                    width: 26,
                    border: "1px solid rgba(220, 38, 38, 0.2)",
                    background: "rgba(220, 38, 38, 0.05)",
                    color: "#dc2626",
                    fontSize: 11.5,
                    borderRadius: 6,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 150ms ease",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = "#dc2626";
                    e.currentTarget.style.color = "#ffffff";
                    e.currentTarget.style.borderColor = "#dc2626";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = "rgba(220, 38, 38, 0.05)";
                    e.currentTarget.style.color = "#dc2626";
                    e.currentTarget.style.borderColor = "rgba(220, 38, 38, 0.2)";
                  }}
                >
                  <i className="ri-delete-bin-line" />
                </button>
              </div>
            ),
          },
        ]}
      />

      {/* EDIT BUYER MODAL */}
      {editingVendor && (
        <Modal
          isOpen={true}
          onClose={() => setEditingVendor(null)}
          title="Edit Buyer Details"
        >
          <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <FormField
                  label="Buyer Name"
                  required
                  value={editForm.companyName}
                  onChange={(val) => setEditForm((f) => ({ ...f, companyName: val }))}
                  compact
                  marginBottom={10}
                />
              </div>

              <FormField
                label="GSTIN Number (15-digit)"
                value={editForm.gstin}
                maxLength={15}
                onChange={(val) => setEditForm((f) => ({ ...f, gstin: (val || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 15) }))}
                compact
                marginBottom={10}
              />

              <FormField
                label="Sourcing Belt / Network"
                value={editForm.sourcingArea}
                onChange={(val) => setEditForm((f) => ({ ...f, sourcingArea: val }))}
                compact
                marginBottom={10}
              />

              <FormField
                label="Representative Name"
                value={editForm.representative}
                onChange={(val) => setEditForm((f) => ({ ...f, representative: val }))}
                compact
                marginBottom={10}
              />

              <FormField
                label="Contact Mobile"
                required
                value={editForm.contactNo}
                onChange={(val) => setEditForm((f) => ({ ...f, contactNo: val }))}
                compact
                marginBottom={10}
              />

              <FormField
                label="Email Address"
                value={editForm.email}
                onChange={(val) => setEditForm((f) => ({ ...f, email: val }))}
                compact
                marginBottom={10}
              />

              <FormField
                label="PO Number"
                value={editForm.poNo}
                onChange={(val) => setEditForm((f) => ({ ...f, poNo: val }))}
                compact
                marginBottom={10}
              />

              <FormField
                label="Contracted Qty (MT)"
                type="number"
                value={editForm.contractedQtyMt}
                onChange={(val) => setEditForm((f) => ({ ...f, contractedQtyMt: val }))}
                compact
                marginBottom={10}
              />

              <FormField
                label="Agreed Sourcing Rate (₹/MT)"
                type="number"
                value={editForm.agreedPricePerMt}
                onChange={(val) => setEditForm((f) => ({ ...f, agreedPricePerMt: val }))}
                compact
                marginBottom={10}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10, borderTop: "1px solid var(--line)", paddingTop: 12 }}>
              <Button type="button" variant="secondary" onClick={() => setEditingVendor(null)}>
                Cancel
              </Button>
              <Button type="submit" className="btn-glow">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* DETAILS DRAWER MODAL */}
      {selectedVendorForDetails && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedVendorForDetails(null)}
          title={`Buyer Details: ${selectedVendorForDetails.companyName}`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Quick Stat Strip */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, background: "var(--canvas)", padding: 12, borderRadius: 10, border: "1px solid var(--line)" }}>
              <div>
                <span style={{ fontSize: 10.5, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>Contracted Volume</span>
                <strong style={{ fontSize: 14, color: "var(--ink)", display: "block" }}>{selectedVendorForDetails.contractedQtyMt} MT</strong>
              </div>
              <div>
                <span style={{ fontSize: 10.5, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>Fulfilled to Date</span>
                <strong style={{ fontSize: 14, color: "#059669", display: "block" }}>{selectedVendorForDetails.actualSourcedMt.toFixed(2)} MT</strong>
              </div>
              <div>
                <span style={{ fontSize: 10.5, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>Agreed Rate</span>
                <strong style={{ fontSize: 14, color: "var(--primary-deep)", display: "block" }}>₹{selectedVendorForDetails.agreedPricePerMt || 1400} / MT</strong>
              </div>
            </div>

            {/* Entity Information */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 12 }}>
              <div>
                <span style={{ color: "var(--muted)" }}>GSTIN:</span>
                <strong style={{ marginLeft: 6, color: "var(--ink)", fontFamily: "monospace" }}>{selectedVendorForDetails.gstin}</strong>
              </div>
              <div>
                <span style={{ color: "var(--muted)" }}>PO Reference:</span>
                <strong style={{ marginLeft: 6, color: "var(--ink)" }}>{selectedVendorForDetails.poNo}</strong>
              </div>
              <div>
                <span style={{ color: "var(--muted)" }}>Representative:</span>
                <strong style={{ marginLeft: 6, color: "var(--ink)" }}>{selectedVendorForDetails.representative}</strong>
              </div>
              <div>
                <span style={{ color: "var(--muted)" }}>Contact:</span>
                <strong style={{ marginLeft: 6, color: "var(--ink)" }}>{selectedVendorForDetails.contactNo}</strong>
              </div>
              <div>
                <span style={{ color: "var(--muted)" }}>Sourcing Belt:</span>
                <span style={{ marginLeft: 6, color: "var(--ink-secondary)" }}>{selectedVendorForDetails.sourcingArea || "General Region"}</span>
              </div>
              <div>
                <span style={{ color: "var(--muted)" }}>Tenure:</span>
                <span style={{ marginLeft: 6, color: "var(--ink-secondary)" }}>{selectedVendorForDetails.tenure || "Active Season"}</span>
              </div>
            </div>

            {/* Dispatches / Collection Inflow History */}
            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 10 }}>
              <h4 style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 800, color: "var(--ink)" }}>
                Collection Inflow History ({selectedVendorForDetails.collectionsList?.length || 0} Entries)
              </h4>
              {selectedVendorForDetails.collectionsList?.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 180, overflowY: "auto" }}>
                  {selectedVendorForDetails.collectionsList.map((slip) => (
                    <div
                      key={slip.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "6px 10px",
                        borderRadius: 6,
                        background: "var(--canvas)",
                        border: "1px solid var(--line)",
                        fontSize: 11.5,
                      }}
                    >
                      <div>
                        <strong>{slip.slipNo}</strong> • {slip.villageName || "Hub Entry"} ({slip.cropResidueType})
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 700, color: "var(--primary-deep)" }}>{slip.invoiceWeightMt} MT</span>
                        <Button
                          variant="secondary"
                          onClick={() => setSelectedSlipForPrint(slip)}
                          style={{ padding: "2px 6px", fontSize: 10 }}
                        >
                          Slip
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: 11.5, color: "var(--muted)", fontStyle: "italic" }}>
                  No recorded weighment slips for this partner yet.
                </p>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* PRINT SLIP MODAL */}
      {selectedSlipForPrint && (
        <BiomassCollectionSlipModal
          slipData={selectedSlipForPrint}
          onClose={() => setSelectedSlipForPrint(null)}
        />
      )}
    </div>
  );
}
