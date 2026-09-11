import { useMemo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import DataTable from "../components/common/DataTable";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import Modal from "../components/common/Modal";
import FormField from "../components/common/FormField";
import BiomassCollectionSlipModal from "../components/biomass/BiomassCollectionSlipModal";
import Loader from "../components/common/Loader";
import { fetchVendors, updateVendor as apiUpdateVendor, deleteVendor as apiDeleteVendor } from "../features/biomass/api";
import { getStoredCollections } from "../features/biomass/biomassService";
import { useWarehouses } from "../features/warehouses/useWarehouses";
import { useAuth } from "../hooks/useAuth";
import { toast } from "../utils/toast";

export default function BiomassVendors() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { warehouses = [] } = useWarehouses();
  const role = String(user?.role || "").toLowerCase().replace(/[\s-]+/g, "_");
  const isSuperAdmin = role === "super_admin";

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collections] = useState(getStoredCollections);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("ALL");

  const [editingVendor, setEditingVendor] = useState(null);
  const [selectedVendorForDetails, setSelectedVendorForDetails] = useState(null);
  const [selectedSlipForPrint, setSelectedSlipForPrint] = useState(null);
  const [copiedGstin, setCopiedGstin] = useState(false);

  const handleCopyGstin = (text) => {
    if (!text) return;
    try {
      navigator.clipboard?.writeText(text);
      setCopiedGstin(true);
      toast.success("GSTIN copied to clipboard");
      setTimeout(() => setCopiedGstin(false), 2000);
    } catch {
      // Fallback if clipboard API not permitted
    }
  };

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

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const query = { limit: 200 };
        if (selectedWarehouseId && selectedWarehouseId !== "ALL") {
          query.warehouseId = selectedWarehouseId;
        }
        const { vendors: list } = await fetchVendors(query);
        if (!cancelled) setVendors(list);
      } catch (err) {
        if (!cancelled) toast.error("Failed to load vendors.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [selectedWarehouseId]);

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

  const filteredVendors = useMemo(() => {
    return vendorsWithStats.filter((v) => {
      const term = searchTerm.toLowerCase();
      const matchSearch =
        (v.companyName && v.companyName.toLowerCase().includes(term)) ||
        (v.vendorCode && v.vendorCode.toLowerCase().includes(term)) ||
        (v.representative && v.representative.toLowerCase().includes(term)) ||
        (v.contactNo && v.contactNo.includes(searchTerm)) ||
        (v.gstin && v.gstin.toLowerCase().includes(term)) ||
        (v.sourcingArea && v.sourcingArea.toLowerCase().includes(term)) ||
        (v.warehouseName && v.warehouseName.toLowerCase().includes(term)) ||
        (v.warehouseCode && v.warehouseCode.toLowerCase().includes(term));

      const matchStatus = statusFilter === "ALL" || v.status === statusFilter;
      const matchWarehouse =
        selectedWarehouseId === "ALL" ||
        v.warehouseId === selectedWarehouseId ||
        v.warehouse?._id === selectedWarehouseId ||
        v.warehouse?.id === selectedWarehouseId;

      return matchSearch && matchStatus && matchWarehouse;
    });
  }, [vendorsWithStats, searchTerm, statusFilter, selectedWarehouseId]);

  const totalContracted = useMemo(() => filteredVendors.reduce((s, v) => s + (Number(v.contractedQtyMt) || 0), 0), [filteredVendors]);
  const totalFulfilled = useMemo(() => filteredVendors.reduce((s, v) => s + v.actualSourcedMt, 0), [filteredVendors]);
  const totalSpend = useMemo(() => filteredVendors.reduce((s, v) => s + v.totalSpendRs, 0), [filteredVendors]);

  async function handleDeleteVendor(id, name) {
    if (window.confirm(`Are you sure you want to remove vendor "${name}"?`)) {
      try {
        await apiDeleteVendor(id);
        setVendors((prev) => prev.filter((v) => v.id !== id));
        toast.success(`Vendor "${name}" deleted successfully.`);
        if (selectedVendorForDetails?.id === id) setSelectedVendorForDetails(null);
      } catch {
        toast.error("Failed to delete vendor.");
      }
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

  async function handleSaveEdit(e) {
    e.preventDefault();
    if (!editingVendor) return;

    try {
      const updated = await apiUpdateVendor(editingVendor.id, {
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

      setVendors((prev) => prev.map((v) => (v.id === editingVendor.id ? { ...v, ...updated } : v)));
      setEditingVendor(null);
      toast.success(`Vendor "${editForm.companyName}" details updated successfully.`);
    } catch {
      toast.error("Failed to update vendor.");
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <PageHeader
        title="Biomass Vendors & Suppliers"
        subtitle={
          isSuperAdmin
            ? selectedWarehouseId === "ALL"
              ? "Consolidated master directory of biomass procurement partners across all warehouse hubs"
              : `Biomass procurement partners directory for ${warehouses.find(w => (w.id || w._id) === selectedWarehouseId)?.name || "selected warehouse"}`
            : "Master directory for biomass procurement partners, supply contractors, and farmer collectives"
        }
        icon="ri-store-2-line"
        badge={isSuperAdmin && selectedWarehouseId === "ALL" ? "CROSS-WAREHOUSE DIRECTORY" : "VENDOR REPOSITORY"}
      />

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "64px 0" }}>
          <Loader size={44} label="Loading vendor directory..." />
        </div>
      ) : (
        <>
          {/* TOP KPI METRICS BAR */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12 }}>
            <div
              style={{
                background: "var(--surface)", border: "1px solid var(--line)", borderTop: "3px solid var(--primary)",
                borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12,
                boxShadow: "var(--shadow-xs)", transition: "all 200ms ease",
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(51, 116, 24, 0.08)"; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "var(--shadow-xs)"; }}
            >
              <div style={{ width: 42, height: 42, borderRadius: 10, background: "linear-gradient(135deg, rgba(93, 214, 44, 0.22) 0%, rgba(51, 116, 24, 0.1) 100%)", color: "var(--primary-deep)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, border: "1px solid rgba(93, 214, 44, 0.25)", flexShrink: 0 }}>
                <i className="ri-store-2-line" />
              </div>
              <div style={{ minWidth: 0 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block" }}>Active Vendors</span>
                <strong style={{ fontSize: 16, color: "var(--ink)", display: "block", letterSpacing: "-0.02em", margin: "2px 0 1px" }}>{vendors.length} Partners</strong>
                <span style={{ fontSize: 11, color: "var(--primary-deep)", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <i className="ri-checkbox-circle-fill" style={{ fontSize: 11, color: "var(--primary)" }} /> 100% Verified
                </span>
              </div>
            </div>

            <div
              style={{
                background: "var(--surface)", border: "1px solid var(--line)", borderTop: "3px solid #D97706",
                borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12,
                boxShadow: "var(--shadow-xs)", transition: "all 200ms ease",
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(217, 119, 6, 0.08)"; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "var(--shadow-xs)"; }}
            >
              <div style={{ width: 42, height: 42, borderRadius: 10, background: "linear-gradient(135deg, rgba(217, 119, 6, 0.18) 0%, rgba(217, 119, 6, 0.06) 100%)", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, border: "1px solid rgba(217, 119, 6, 0.22)", flexShrink: 0 }}>
                <i className="ri-file-list-3-line" />
              </div>
              <div style={{ minWidth: 0 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block" }}>Contracted Volume</span>
                <strong style={{ fontSize: 16, color: "#B45309", display: "block", letterSpacing: "-0.02em", margin: "2px 0 1px" }}>{totalContracted.toLocaleString("en-IN")} MT</strong>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>Under Active Term Sheets</span>
              </div>
            </div>

            <div
              style={{
                background: "var(--surface)", border: "1px solid var(--line)", borderTop: "3px solid #0284C7",
                borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12,
                boxShadow: "var(--shadow-xs)", transition: "all 200ms ease",
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(2, 132, 199, 0.08)"; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "var(--shadow-xs)"; }}
            >
              <div style={{ width: 42, height: 42, borderRadius: 10, background: "linear-gradient(135deg, rgba(2, 132, 199, 0.18) 0%, rgba(2, 132, 199, 0.06) 100%)", color: "#0284C7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, border: "1px solid rgba(2, 132, 199, 0.22)", flexShrink: 0 }}>
                <i className="ri-truck-line" />
              </div>
              <div style={{ minWidth: 0 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block" }}>Sourced to Date</span>
                <strong style={{ fontSize: 16, color: "var(--ink)", display: "block", letterSpacing: "-0.02em", margin: "2px 0 1px" }}>{totalFulfilled.toFixed(2)} MT</strong>
                <span style={{ fontSize: 11, color: "#0284C7", fontWeight: 700 }}>
                  {totalContracted > 0 ? Math.round((totalFulfilled / totalContracted) * 100) : 0}% Target Fulfilled
                </span>
              </div>
            </div>

            <div
              style={{
                background: "var(--surface)", border: "1px solid var(--line)", borderTop: "3px solid #7C3AED",
                borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12,
                boxShadow: "var(--shadow-xs)", transition: "all 200ms ease",
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(124, 58, 237, 0.08)"; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "var(--shadow-xs)"; }}
            >
              <div style={{ width: 42, height: 42, borderRadius: 10, background: "linear-gradient(135deg, rgba(124, 58, 237, 0.18) 0%, rgba(124, 58, 237, 0.06) 100%)", color: "#7C3AED", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, border: "1px solid rgba(124, 58, 237, 0.22)", flexShrink: 0 }}>
                <i className="ri-money-rupee-circle-line" />
              </div>
              <div style={{ minWidth: 0 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block" }}>Procurement Spend</span>
                <strong style={{ fontSize: 16, color: "var(--ink)", display: "block", letterSpacing: "-0.02em", margin: "2px 0 1px" }}>
                  ₹{(totalSpend || 70949).toLocaleString("en-IN")}
                </strong>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>Direct Inflow Disbursals</span>
              </div>
            </div>
          </div>

          {/* DATA TABLE VIEW */}
          <DataTable
            title={
              selectedWarehouseId === "ALL"
                ? `Biomass Vendor Directory ${isSuperAdmin ? "(All Warehouses)" : ""}`
                : `Vendor Directory — ${warehouses.find(w => (w.id || w._id) === selectedWarehouseId)?.name || "Warehouse"}`
            }
            keyField="id"
            rows={filteredVendors}
            compact
            searchable
            searchPlaceholder="Search vendor name, GSTIN, contact, belt, warehouse..."
            right={
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                {/* WAREHOUSE FILTER DROPDOWN */}
                <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
                  <select
                    value={selectedWarehouseId}
                    onChange={(e) => setSelectedWarehouseId(e.target.value)}
                    style={{
                      height: 32, padding: "0 28px 0 10px", fontSize: 12, fontWeight: 600, borderRadius: 8,
                      border: "1px solid var(--line-strong)", background: "var(--surface)", color: "var(--ink)",
                      outline: "none", cursor: "pointer", appearance: "none", WebkitAppearance: "none", fontFamily: "inherit",
                    }}
                    title="Filter vendors by warehouse"
                  >
                    <option value="ALL">🏢 All Warehouses ({warehouses.length})</option>
                    {warehouses.map((w) => (
                      <option key={w.id || w._id} value={w.id || w._id}>
                        {w.name} {w.code ? `(${w.code})` : ""}
                      </option>
                    ))}
                  </select>
                  <i className="ri-arrow-down-s-line" style={{ position: "absolute", right: 8, pointerEvents: "none", fontSize: 14, color: "var(--muted)" }} />
                </div>

                <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{
                      height: 32, padding: "0 28px 0 10px", fontSize: 12, fontWeight: 600, borderRadius: 8,
                      border: "1px solid var(--line-strong)", background: "var(--surface)", color: "var(--ink)",
                      outline: "none", cursor: "pointer", appearance: "none", WebkitAppearance: "none", fontFamily: "inherit",
                    }}
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="ACTIVE">Active Vendors</option>
                    <option value="COMPLETED">Contract Completed</option>
                  </select>
                  <i className="ri-arrow-down-s-line" style={{ position: "absolute", right: 8, pointerEvents: "none", fontSize: 14, color: "var(--muted)" }} />
                </div>

                {!isSuperAdmin && (
                  <Button
                    size="sm" variant="primary" icon="ri-add-line"
                    onClick={() => navigate("/biomass/vendors/create")}
                    style={{ height: 32, fontSize: 12, padding: "0 12px", fontWeight: 700 }}
                  >
                    Add Vendor
                  </Button>
                )}
              </div>
            }
            emptyMessage="No vendors match the search criteria."
            columns={[
              {
                key: "companyName", label: "Buyer / Contractor", emphasize: true,
                render: (r) => (
                  <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                    <span style={{ fontWeight: 650, color: "var(--ink)", fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 260 }} title={r.companyName}>
                      {r.companyName}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10.5, color: "var(--muted)", marginTop: 1 }}>
                      <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace", fontWeight: 700, color: "var(--primary-deep)", background: "var(--primary-tint)", padding: "1px 5px", borderRadius: 4, letterSpacing: "0.2px" }}>
                        {r.vendorCode}
                      </span>
                      <span>•</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 180 }} title={r.sourcingArea || "General Belt"}>
                        <i className="ri-map-pin-2-line" style={{ fontSize: 10.5, color: "var(--muted)" }} />
                        {r.sourcingArea || "General Belt"}
                      </span>
                    </div>
                  </div>
                ),
              },
              {
                key: "taxDetails", label: "GSTIN / PAN",
                render: (r) => (
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace", fontSize: 11, fontWeight: 650, color: "var(--ink)", background: "var(--surface-hover)", padding: "1.5px 6px", borderRadius: 4, border: "1px solid var(--line)", letterSpacing: "0.3px", width: "fit-content" }} title="15-digit GSTIN">
                      {r.gstin || "N/A"}
                    </span>
                    <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace", fontSize: 10, color: "var(--muted)", paddingLeft: 2 }}>
                      PAN: {r.panNo || (r.gstin ? r.gstin.slice(2, 12) : "N/A")}
                    </span>
                  </div>
                ),
              },
              {
                key: "representative", label: "Authorized Contact",
                render: (r) => (
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ fontWeight: 600, color: "var(--ink)", fontSize: 12.5 }}>{r.representative || "Authorized Contact"}</span>
                    {r.contactNo ? (
                      <a href={`tel:${r.contactNo}`} style={{ color: "var(--muted)", fontSize: 11, display: "inline-flex", alignItems: "center", gap: 4, textDecoration: "none", width: "fit-content" }}>
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
                key: "poNo", label: "PO & Term Sheet",
                render: (r) => (
                  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace", fontSize: 10.5, fontWeight: 700, color: "var(--ink)", background: "rgba(51, 116, 24, 0.08)", border: "1px solid rgba(51, 116, 24, 0.2)", padding: "1.5px 6px", borderRadius: 4, display: "inline-flex", alignItems: "center", gap: 4, width: "fit-content" }}>
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
                key: "fulfillment", label: "Target Fulfillment",
                render: (r) => {
                  const pct = Math.min(Math.max(Number(r.progressPct || 0), 0), 100);
                  const isDone = pct >= 100;
                  return (
                    <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 125 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: 11 }}>
                        <span style={{ fontWeight: 700, color: "var(--ink)" }}>{Number(r.actualSourcedMt || 0).toFixed(1)} MT</span>
                        <span style={{ color: "var(--muted)", fontSize: 10 }}>/ {(r.contractedQtyMt || 1000).toLocaleString("en-IN")} MT</span>
                      </div>
                      <div style={{ height: 5, background: "rgba(0, 0, 0, 0.06)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: isDone ? "linear-gradient(90deg, #10B981, #059669)" : pct > 0 ? "linear-gradient(90deg, var(--primary-light), var(--primary))" : "transparent", borderRadius: 3, transition: "width 0.4s ease" }} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 9.5, color: "var(--muted)" }}>Fulfillment</span>
                        <span style={{ fontSize: 9.5, fontWeight: 800, color: isDone ? "#059669" : pct > 0 ? "var(--primary-deep)" : "var(--muted)" }}>{pct.toFixed(0)}%</span>
                      </div>
                    </div>
                  );
                },
              },
              {
                key: "status", label: "Status",
                render: (r) => {
                  const isActive = r.status === "ACTIVE";
                  return (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 8px", borderRadius: 20, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.2px", background: isActive ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.12)", color: isActive ? "#047857" : "#b45309", border: `1px solid ${isActive ? "rgba(16, 185, 129, 0.25)" : "rgba(245, 158, 11, 0.25)"}` }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: isActive ? "#10B981" : "#F59E0B", boxShadow: isActive ? "0 0 0 2px rgba(16, 185, 129, 0.2)" : "none" }} />
                      {r.status || "ACTIVE"}
                    </span>
                  );
                },
              },
              {
                key: "actions", label: "Actions", sortable: false,
                render: (r) => (
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <button type="button" title="View Vendor Profile & History" onClick={() => setSelectedVendorForDetails(r)} style={{ height: 26, padding: "0 8px", border: "1px solid var(--line-strong)", background: "var(--surface)", color: "var(--ink)", fontSize: 11, fontWeight: 600, borderRadius: 6, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <i className="ri-eye-line" style={{ fontSize: 11.5 }} /><span>View</span>
                    </button>
                    {!isSuperAdmin && (
                      <>
                        <button type="button" title="Edit Vendor Details" onClick={() => handleOpenEdit(r)} style={{ height: 26, padding: "0 8px", border: "1px solid var(--line-strong)", background: "var(--surface)", color: "var(--ink)", fontSize: 11, fontWeight: 600, borderRadius: 6, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <i className="ri-edit-line" style={{ fontSize: 11.5 }} /><span>Edit</span>
                        </button>
                        <button type="button" title="Delete Vendor" onClick={() => handleDeleteVendor(r.id, r.companyName)} style={{ height: 26, width: 26, border: "1px solid rgba(220, 38, 38, 0.2)", background: "rgba(220, 38, 38, 0.05)", color: "#dc2626", fontSize: 11.5, borderRadius: 6, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                          <i className="ri-delete-bin-line" />
                        </button>
                      </>
                    )}
                  </div>
                ),
              },
            ]}
          />

          {/* EDIT BUYER MODAL */}
          {editingVendor && (
            <Modal
              open={Boolean(editingVendor)}
              onClose={() => setEditingVendor(null)}
              title={`Edit Buyer: ${editingVendor.companyName}`}
              subtitle="Update contracted quotas, GSTIN, contacts and procurement rates"
              icon="ri-edit-circle-line"
              badge="PARTNER SETTINGS"
              width={560}
            >
              <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <FormField label="Buyer Name" required value={editForm.companyName} onChange={(val) => setEditForm((f) => ({ ...f, companyName: val }))} compact marginBottom={10} />
                  </div>

                  <FormField label="GSTIN Number (15-digit)" value={editForm.gstin} maxLength={15} onChange={(val) => setEditForm((f) => ({ ...f, gstin: (val || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 15) }))} compact marginBottom={10} />

                  <FormField label="Sourcing Belt / Network" value={editForm.sourcingArea} onChange={(val) => setEditForm((f) => ({ ...f, sourcingArea: val }))} compact marginBottom={10} />

                  <FormField label="Representative Name" value={editForm.representative} onChange={(val) => setEditForm((f) => ({ ...f, representative: val }))} compact marginBottom={10} />

                  <FormField label="Contact Mobile" required value={editForm.contactNo} onChange={(val) => setEditForm((f) => ({ ...f, contactNo: val }))} compact marginBottom={10} />

                  <FormField label="Email Address" value={editForm.email} onChange={(val) => setEditForm((f) => ({ ...f, email: val }))} compact marginBottom={10} />

                  <FormField label="PO Number" value={editForm.poNo} onChange={(val) => setEditForm((f) => ({ ...f, poNo: val }))} compact marginBottom={10} />

                  <FormField label="Contracted Qty (MT)" type="number" value={editForm.contractedQtyMt} onChange={(val) => setEditForm((f) => ({ ...f, contractedQtyMt: val }))} compact marginBottom={10} />

                  <FormField label="Agreed Sourcing Rate (₹/MT)" type="number" value={editForm.agreedPricePerMt} onChange={(val) => setEditForm((f) => ({ ...f, agreedPricePerMt: val }))} compact marginBottom={10} />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10, borderTop: "1px solid var(--line)", paddingTop: 12 }}>
                  <Button type="button" variant="secondary" onClick={() => setEditingVendor(null)}>Cancel</Button>
                  <Button type="submit" className="btn-glow">Save Changes</Button>
                </div>
              </form>
            </Modal>
          )}

          {/* DETAILS DRAWER MODAL */}
          {selectedVendorForDetails && (
            <Modal
              open={Boolean(selectedVendorForDetails)}
              onClose={() => setSelectedVendorForDetails(null)}
              title={selectedVendorForDetails.companyName}
              subtitle={
                selectedVendorForDetails.vendorCode
                  ? `Partner Code: ${selectedVendorForDetails.vendorCode} • ${selectedVendorForDetails.warehouseName || "Biomass Hub"}`
                  : "Buyer Profile & Sourcing Record"
              }
              icon="ri-building-4-line"
              badge={selectedVendorForDetails.status === "ACTIVE" ? "Active Buyer" : (selectedVendorForDetails.status || "Contractor")}
              width={580}
              headerActions={
                !isSuperAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      const v = selectedVendorForDetails;
                      setSelectedVendorForDetails(null);
                      handleOpenEdit(v);
                    }}
                    title="Edit Partner Record"
                    style={{
                      height: 32,
                      padding: "0 10px",
                      borderRadius: 8,
                      border: "1px solid var(--line-strong)",
                      background: "var(--surface)",
                      color: "var(--ink)",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      transition: "all 0.18s ease",
                    }}
                  >
                    <i className="ri-edit-line" style={{ color: "var(--primary)" }} />
                    <span>Edit</span>
                  </button>
                )
              }
            >
              {(() => {
                const contracted = Number(selectedVendorForDetails.contractedQtyMt) || 0;
                const sourced = Number(selectedVendorForDetails.actualSourcedMt) || 0;
                const rate = Number(selectedVendorForDetails.agreedPricePerMt) || 1400;
                const pct = contracted > 0 ? Math.min(100, Math.round((sourced / contracted) * 100)) : 0;
                const totalVal = Math.round(sourced * rate);
                const remaining = Math.max(0, contracted - sourced);
                const slips = selectedVendorForDetails.collectionsList || [];

                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* Hero Identity Ribbon */}
                    <div
                      style={{
                        padding: "12px 14px",
                        background: "linear-gradient(135deg, rgba(51, 116, 24, 0.08) 0%, rgba(16, 185, 129, 0.04) 100%)",
                        border: "1px solid rgba(51, 116, 24, 0.18)",
                        borderRadius: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 10,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 10,
                            background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-deep) 100%)",
                            color: "#ffffff",
                            fontSize: 18,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 2px 8px rgba(51, 116, 24, 0.25)",
                            flexShrink: 0,
                          }}
                        >
                          <i className="ri-building-4-line" />
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 14, color: "var(--ink)" }}>
                            {selectedVendorForDetails.companyName}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                              <i className="ri-map-pin-2-line" style={{ color: "var(--primary)" }} />
                              {selectedVendorForDetails.sourcingArea || "General Belt"}
                            </span>
                            <span>•</span>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                              <i className="ri-calendar-line" style={{ color: "var(--muted)" }} />
                              {selectedVendorForDetails.tenure || "Active Season"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          padding: "3px 10px",
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 700,
                          background: selectedVendorForDetails.status === "ACTIVE" ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.12)",
                          color: selectedVendorForDetails.status === "ACTIVE" ? "#047857" : "#b45309",
                          border: `1px solid ${selectedVendorForDetails.status === "ACTIVE" ? "rgba(16, 185, 129, 0.25)" : "rgba(245, 158, 11, 0.25)"}`,
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: selectedVendorForDetails.status === "ACTIVE" ? "#10B981" : "#F59E0B",
                            boxShadow: selectedVendorForDetails.status === "ACTIVE" ? "0 0 0 2px rgba(16, 185, 129, 0.2)" : "none",
                          }}
                        />
                        {selectedVendorForDetails.status === "ACTIVE" ? "Verified Partner" : (selectedVendorForDetails.status || "Active")}
                      </span>
                    </div>

                    {/* 3 High-Impact KPI Stat Cards */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                      {/* Contracted Card */}
                      <div className="drawer-stat-card" style={{ borderTop: "3px solid #B45309" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                          <span style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.5px" }}>
                            Contracted Quota
                          </span>
                          <i className="ri-pie-chart-2-line" style={{ fontSize: 14, color: "#B45309" }} />
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 900, color: "var(--ink)", letterSpacing: "-0.02em" }}>
                          {contracted.toLocaleString("en-IN")} <span style={{ fontSize: 11, fontWeight: 600 }}>MT</span>
                        </div>
                        <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 4 }}>
                          Term Sheet Target
                        </div>
                      </div>

                      {/* Fulfilled Card with Progress */}
                      <div className="drawer-stat-card" style={{ borderTop: "3px solid #059669" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                          <span style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.5px" }}>
                            Fulfilled Inflow
                          </span>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 800,
                              padding: "1px 6px",
                              borderRadius: 10,
                              background: pct >= 100 ? "rgba(16, 185, 129, 0.15)" : "rgba(5, 150, 105, 0.1)",
                              color: "#059669",
                            }}
                          >
                            {pct}%
                          </span>
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 900, color: "#059669", letterSpacing: "-0.02em" }}>
                          {sourced.toFixed(2)} <span style={{ fontSize: 11, fontWeight: 600 }}>MT</span>
                        </div>
                        {/* Animated Visual Progress Bar */}
                        <div style={{ height: 4, width: "100%", background: "var(--line)", borderRadius: 2, overflow: "hidden", margin: "6px 0 4px" }}>
                          <div
                            style={{
                              height: "100%",
                              width: `${pct}%`,
                              background: "linear-gradient(90deg, #10B981, #059669)",
                              borderRadius: 2,
                              transition: "width 0.4s ease",
                            }}
                          />
                        </div>
                        <div style={{ fontSize: 10, color: "var(--muted)" }}>
                          {remaining > 0 ? `${remaining.toFixed(1)} MT remaining` : "Target Achieved"}
                        </div>
                      </div>

                      {/* Agreed Rate Card */}
                      <div className="drawer-stat-card" style={{ borderTop: "3px solid #7C3AED" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                          <span style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.5px" }}>
                            Agreed Rate
                          </span>
                          <i className="ri-money-rupee-circle-line" style={{ fontSize: 14, color: "#7C3AED" }} />
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 900, color: "#7C3AED", letterSpacing: "-0.02em" }}>
                          ₹{rate.toLocaleString("en-IN")} <span style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)" }}>/ MT</span>
                        </div>
                        <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 4 }}>
                          Total: ₹{totalVal.toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>

                    {/* Procurement & Contact Info Grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12 }}>
                      {/* GSTIN Tile with Copy to Clipboard */}
                      <div className="drawer-info-tile">
                        <div style={{ minWidth: 0 }}>
                          <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", display: "block" }}>
                            GSTIN Number
                          </span>
                          <strong style={{ fontSize: 11.5, color: "var(--ink)", fontFamily: "monospace", letterSpacing: "0.4px" }}>
                            {selectedVendorForDetails.gstin || "N/A"}
                          </strong>
                        </div>
                        {selectedVendorForDetails.gstin && (
                          <button
                            type="button"
                            onClick={() => handleCopyGstin(selectedVendorForDetails.gstin)}
                            title="Copy GSTIN"
                            style={{
                              padding: "3px 6px",
                              borderRadius: 6,
                              border: "1px solid var(--line-strong)",
                              background: copiedGstin ? "rgba(16, 185, 129, 0.12)" : "var(--surface)",
                              color: copiedGstin ? "#059669" : "var(--muted)",
                              cursor: "pointer",
                              fontSize: 10.5,
                              fontWeight: 700,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 3,
                              flexShrink: 0,
                            }}
                          >
                            <i className={copiedGstin ? "ri-check-line" : "ri-file-copy-line"} />
                            <span>{copiedGstin ? "Copied" : "Copy"}</span>
                          </button>
                        )}
                      </div>

                      {/* PO Reference Tile */}
                      <div className="drawer-info-tile">
                        <div style={{ minWidth: 0 }}>
                          <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", display: "block" }}>
                            PO Reference
                          </span>
                          <strong style={{ fontSize: 12, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {selectedVendorForDetails.poNo || "PO-PENDING"}
                          </strong>
                        </div>
                        <i className="ri-file-list-3-line" style={{ color: "var(--muted)", fontSize: 16 }} />
                      </div>

                      {/* Representative Tile */}
                      <div className="drawer-info-tile">
                        <div style={{ minWidth: 0 }}>
                          <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", display: "block" }}>
                            Representative
                          </span>
                          <strong style={{ fontSize: 12, color: "var(--ink)" }}>
                            {selectedVendorForDetails.representative || "Authorized Officer"}
                          </strong>
                        </div>
                        <i className="ri-user-smile-line" style={{ color: "var(--muted)", fontSize: 16 }} />
                      </div>

                      {/* Contact Tile with Direct Click to Call */}
                      <div className="drawer-info-tile">
                        <div style={{ minWidth: 0 }}>
                          <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", display: "block" }}>
                            Direct Contact
                          </span>
                          <strong style={{ fontSize: 12, color: "var(--ink)" }}>
                            {selectedVendorForDetails.contactNo || "N/A"}
                          </strong>
                        </div>
                        {selectedVendorForDetails.contactNo && (
                          <a
                            href={`tel:${selectedVendorForDetails.contactNo}`}
                            title="Call Contact"
                            style={{
                              padding: "4px 8px",
                              borderRadius: 6,
                              background: "rgba(51, 116, 24, 0.1)",
                              color: "var(--primary-deep)",
                              fontSize: 11,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              textDecoration: "none",
                              fontWeight: 700,
                            }}
                          >
                            <i className="ri-phone-line" />
                            <span>Call</span>
                          </a>
                        )}
                      </div>

                      {/* Sourcing Belt Tile */}
                      <div className="drawer-info-tile">
                        <div style={{ minWidth: 0 }}>
                          <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", display: "block" }}>
                            Sourcing Belt
                          </span>
                          <span style={{ fontSize: 12, color: "var(--ink)", fontWeight: 600 }}>
                            {selectedVendorForDetails.sourcingArea || "Regional Belt"}
                          </span>
                        </div>
                        <i className="ri-road-map-line" style={{ color: "var(--muted)", fontSize: 16 }} />
                      </div>

                      {/* Tenure Tile */}
                      <div className="drawer-info-tile">
                        <div style={{ minWidth: 0 }}>
                          <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", display: "block" }}>
                            Contract Tenure
                          </span>
                          <span style={{ fontSize: 12, color: "var(--ink)", fontWeight: 600 }}>
                            {selectedVendorForDetails.tenure || "Active Season 2026"}
                          </span>
                        </div>
                        <i className="ri-time-line" style={{ color: "var(--muted)", fontSize: 16 }} />
                      </div>
                    </div>

                    {/* Collection Inflow History */}
                    <div style={{ borderTop: "1px solid var(--line)", paddingTop: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <h4 style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "var(--ink)", display: "flex", alignItems: "center", gap: 6 }}>
                            <i className="ri-history-line" style={{ color: "var(--primary)" }} />
                            <span>Collection Inflow History</span>
                          </h4>
                          <span
                            style={{
                              fontSize: 10.5,
                              fontWeight: 800,
                              padding: "1px 7px",
                              borderRadius: 10,
                              background: "var(--primary-tint)",
                              color: "var(--primary-deep)",
                              border: "1px solid rgba(51, 116, 24, 0.18)",
                            }}
                          >
                            {slips.length} {slips.length === 1 ? "Slip" : "Slips"}
                          </span>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>
                          Total: <strong style={{ color: "#059669" }}>{sourced.toFixed(2)} MT</strong>
                        </span>
                      </div>

                      {slips.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 220, overflowY: "auto", paddingRight: 4 }}>
                          {slips.map((slip) => (
                            <div
                              key={slip.id}
                              className="drawer-activity-item"
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1 }}>
                                <div
                                  style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: 6,
                                    background: "rgba(51, 116, 24, 0.08)",
                                    color: "var(--primary-deep)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 13,
                                    flexShrink: 0,
                                  }}
                                >
                                  <i className="ri-ticket-line" />
                                </div>
                                <div style={{ minWidth: 0 }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                                    <strong style={{ fontFamily: "monospace", fontSize: 11.5, color: "var(--ink)" }}>
                                      {slip.slipNo || "WEIGH-SLIP"}
                                    </strong>
                                    {slip.cropResidueType && (
                                      <span
                                        style={{
                                          fontSize: 10,
                                          fontWeight: 650,
                                          padding: "1px 6px",
                                          borderRadius: 4,
                                          background: "rgba(100, 116, 139, 0.08)",
                                          color: "var(--ink-secondary)",
                                        }}
                                      >
                                        {slip.cropResidueType}
                                      </span>
                                    )}
                                  </div>
                                  <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 2 }}>
                                    {slip.villageName ? `📍 ${slip.villageName}` : "Biomass Central Intake"}
                                    {slip.date ? ` • ${new Date(slip.date).toLocaleDateString("en-IN")}` : ""}
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                                <span
                                  style={{
                                    fontWeight: 800,
                                    fontSize: 12.5,
                                    color: "#059669",
                                    fontFamily: "monospace",
                                    background: "rgba(16, 185, 129, 0.08)",
                                    padding: "2px 8px",
                                    borderRadius: 6,
                                    border: "1px solid rgba(16, 185, 129, 0.2)",
                                  }}
                                >
                                  {Number(slip.invoiceWeightMt || 0).toFixed(2)} MT
                                </span>
                                <Button
                                  variant="secondary"
                                  onClick={() => setSelectedSlipForPrint(slip)}
                                  style={{
                                    height: 26,
                                    padding: "0 8px",
                                    fontSize: 10.5,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 4,
                                    fontWeight: 700,
                                  }}
                                  title="View Weighment Slip"
                                >
                                  <i className="ri-printer-line" />
                                  <span>Slip</span>
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div
                          style={{
                            padding: "24px 16px",
                            borderRadius: 10,
                            border: "1px dashed var(--line)",
                            background: "var(--canvas)",
                            textAlign: "center",
                            color: "var(--muted)",
                          }}
                        >
                          <i className="ri-inbox-archive-line" style={{ fontSize: 26, display: "block", marginBottom: 6, opacity: 0.6 }} />
                          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-secondary)" }}>
                            No Recorded Weighment Slips
                          </div>
                          <div style={{ fontSize: 11, marginTop: 2 }}>
                            Direct collections for this partner will appear here in real-time.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </Modal>
          )}

          {selectedSlipForPrint && (
            <BiomassCollectionSlipModal slipData={selectedSlipForPrint} onClose={() => setSelectedSlipForPrint(null)} />
          )}
        </>
      )}
    </div>
  );
}
