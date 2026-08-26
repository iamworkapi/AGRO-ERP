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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, boxShadow: "var(--shadow-xs)" }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(93, 214, 44, 0.15)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
            <i className="ri-store-2-line" />
          </div>
          <div>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>Active Vendors</span>
            <strong style={{ fontSize: 16, color: "var(--ink)", display: "block", letterSpacing: "-0.02em" }}>{vendors.length} Partners</strong>
            <span style={{ fontSize: 11, color: "var(--primary)", fontWeight: 700 }}>100% Verified</span>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, boxShadow: "var(--shadow-xs)" }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(217, 119, 6, 0.12)", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
            <i className="ri-file-line" />
          </div>
          <div>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>Contracted Volume</span>
            <strong style={{ fontSize: 16, color: "#D97706", display: "block", letterSpacing: "-0.02em" }}>{totalContracted.toLocaleString("en-IN")} MT</strong>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>Under Active Term Sheets</span>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, boxShadow: "var(--shadow-xs)" }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(0, 210, 255, 0.12)", color: "#00D2FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
            <i className="ri-truck-line" />
          </div>
          <div>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>Sourced to Date</span>
            <strong style={{ fontSize: 16, color: "var(--ink)", display: "block", letterSpacing: "-0.02em" }}>{totalFulfilled.toFixed(2)} MT</strong>
            <span style={{ fontSize: 11, color: "var(--primary)", fontWeight: 700 }}>
              {totalContracted > 0 ? Math.round((totalFulfilled / totalContracted) * 100) : 0}% Target Fulfilled
            </span>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, boxShadow: "var(--shadow-xs)" }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(168, 85, 247, 0.12)", color: "#A855F7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
            <i className="ri-money-rupee-circle-line" />
          </div>
          <div>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>Procurement Spend</span>
            <strong style={{ fontSize: 16, color: "var(--ink)", display: "block", letterSpacing: "-0.02em" }}>
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
        searchable
        searchPlaceholder="Search vendor name, GSTIN, contact, belt..."
        right={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                height: 32,
                padding: "0 10px",
                fontSize: 12,
                fontWeight: 700,
                borderRadius: 8,
                border: "1px solid var(--line-strong)",
                background: "var(--surface)",
                color: "var(--ink)",
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Vendors</option>
              <option value="COMPLETED">Contract Completed</option>
            </select>

            <Button
              size="sm"
              variant="primary"
              icon="ri-add-line"
              onClick={() => navigate("/biomass/vendors/create")}
              style={{ height: 32, fontSize: 11.5, padding: "0 10px" }}
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
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontWeight: 700, color: "var(--ink)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i className="ri-building-line" style={{ color: "var(--primary)", fontSize: 12 }} />
                  {r.companyName}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10.5, color: "var(--muted)" }}>
                  <span style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--primary-deep)" }}>{r.vendorCode}</span>
                  <span>•</span>
                  <span>{r.sourcingArea || "General Procurement Belt"}</span>
                </div>
              </div>
            ),
          },
          {
            key: "taxDetails",
            label: "GSTIN / PAN",
            render: (r) => (
              <div style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: 11 }}>
                <span style={{ fontWeight: 700, color: "#0D3823", display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <i className="ri-file-line-invoice" style={{ color: "var(--primary)", fontSize: 10 }} />
                  GST: {r.gstin || "09AAAAA0000A1Z5"}
                </span>
                <span style={{ color: "var(--muted)", fontWeight: 600 }}>
                  PAN: {r.panNo || "AAAAA0000A"}
                </span>
              </div>
            ),
          },
          {
            key: "representative",
            label: "Authorized Contact",
            render: (r) => (
              <div style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: 11 }}>
                <span style={{ fontWeight: 700, color: "var(--ink)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <i className="ri-user-follow-line" style={{ color: "#059669", fontSize: 10 }} />
                  {r.representative || "Representative"}
                </span>
                <span style={{ color: "var(--muted)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <i className="ri-phone-line" style={{ color: "var(--primary)", fontSize: 9.5 }} />
                  {r.contactNo}
                </span>
              </div>
            ),
          },
          {
            key: "poNo",
            label: "PO & Term Sheet",
            render: (r) => (
              <div style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: 11 }}>
                <span style={{ fontWeight: 700, color: "var(--ink)" }}>PO: {r.poNo || "PO-2026-001"}</span>
                <span style={{ color: "var(--muted)", fontSize: 10.5 }}>₹{r.agreedPricePerMt || 1400}/MT Rate</span>
              </div>
            ),
          },
          {
            key: "fulfillment",
            label: "Target Fulfillment",
            render: (r) => (
              <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 130 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                  <strong style={{ color: "var(--ink)" }}>{r.actualSourcedMt.toFixed(1)} MT</strong>
                  <span style={{ color: "var(--muted)" }}>/ {r.contractedQtyMt} MT</span>
                </div>
                <div style={{ height: 6, background: "var(--line)", borderRadius: 3, overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${r.progressPct}%`,
                      background: r.progressPct >= 100 ? "#10B981" : "var(--primary)",
                      borderRadius: 3,
                    }}
                  />
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: r.progressPct >= 100 ? "#059669" : "var(--primary-deep)" }}>
                  {r.progressPct}% Completed
                </span>
              </div>
            ),
          },
          {
            key: "status",
            label: "Status",
            render: (r) => (
              <Badge tone={r.status === "ACTIVE" ? "success" : "warning"}>
                {r.status || "ACTIVE"}
              </Badge>
            ),
          },
          {
            key: "actions",
            label: "Actions",
            sortable: false,
            render: (r) => (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {/* View Details */}
                <button
                  type="button"
                  title="View Buyer Profile & History"
                  onClick={() => setSelectedVendorForDetails(r)}
                  style={{
                    border: "1px solid var(--line-strong)",
                    background: "var(--canvas)",
                    color: "var(--primary-deep)",
                    fontSize: 11,
                    fontWeight: 700,
                    borderRadius: 6,
                    padding: "4px 8px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <i className="ri-eye-line" style={{ fontSize: 10 }} /> View
                </button>

                {/* Edit */}
                <button
                  type="button"
                  title="Edit Buyer Details"
                  onClick={() => handleOpenEdit(r)}
                  style={{
                    border: "1px solid rgba(27, 94, 58, 0.3)",
                    background: "rgba(27, 94, 58, 0.08)",
                    color: "#0D3823",
                    fontSize: 11,
                    fontWeight: 700,
                    borderRadius: 6,
                    padding: "4px 8px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <i className="ri-edit-line" style={{ fontSize: 10, color: "#1B5E3A" }} /> Edit
                </button>

                {/* Delete */}
                <button
                  type="button"
                  title="Delete Buyer"
                  onClick={() => handleDeleteVendor(r.id, r.companyName)}
                  style={{
                    border: "1px solid rgba(220, 38, 38, 0.3)",
                    background: "rgba(220, 38, 38, 0.08)",
                    color: "#dc2626",
                    fontSize: 11,
                    fontWeight: 700,
                    borderRadius: 6,
                    padding: "4px 8px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <i className="ri-delete-bin-line" style={{ fontSize: 10 }} />
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
                label="GSTIN Number"
                value={editForm.gstin}
                onChange={(val) => setEditForm((f) => ({ ...f, gstin: val }))}
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
