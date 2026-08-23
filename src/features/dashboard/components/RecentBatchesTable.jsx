import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Tractor, Boxes, Truck, Scale, X, Search, Eye, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react";
function LucideIconWrapper({ children, size }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: size, height: size, flexShrink: 0 }}>
      {children}
    </span>
  );
}



export default function RecentBatchesTable({ rows = [] }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const defaultBatches = [
    {
      id: "SLIP-2026-801",
      name: "Paddy Straw Inflow #801",
      vendor: "Kanujia FPO Aggregators",
      vendorLogo: "🌾",
      vendorColor: "#6366F1",
      date: "May 22, 2026",
      progress: 75,
      progressColor: "#6366F1",
      status: "In Progress",
      statusVariant: "info",
      priority: "Grade A",
      priorityVariant: "high",
      Icon: Tractor,
      iconBg: "#EEF2FF",
      iconColor: "#6366F1",
      tonnage: "10.00 MT",
    },
    {
      id: "SLIP-2026-802",
      name: "Maize Stalk Baling Batch",
      vendor: "Sahjanwa Kisan Samiti",
      vendorLogo: "🌽",
      vendorColor: "#0284C7",
      date: "May 20, 2026",
      progress: 45,
      progressColor: "#38BDF8",
      status: "In Progress",
      statusVariant: "info",
      priority: "Grade B",
      priorityVariant: "medium",
      Icon: Boxes,
      iconBg: "#F0F9FF",
      iconColor: "#0284C7",
      tonnage: "19.50 MT",
    },
    {
      id: "SLIP-2026-803",
      name: "Factory Off-take Gate Pass",
      vendor: "Reliance Industries Ltd",
      vendorLogo: "🏭",
      vendorColor: "#10B981",
      date: "May 18, 2026",
      progress: 100,
      progressColor: "#10B981",
      status: "Completed",
      statusVariant: "success",
      priority: "Grade A",
      priorityVariant: "low",
      Icon: Truck,
      iconBg: "#ECFDF5",
      iconColor: "#059669",
      tonnage: "43.50 MT",
    },
    {
      id: "SLIP-2026-804",
      name: "Wheat Straw Moisture Test",
      vendor: "Bansgaon Bio Fuels",
      vendorLogo: "🌾",
      vendorColor: "#F59E0B",
      date: "May 16, 2026",
      progress: 20,
      progressColor: "#F59E0B",
      status: "On Hold",
      statusVariant: "warning",
      priority: "Grade B",
      priorityVariant: "medium",
      Icon: Scale,
      iconBg: "#FFFBEB",
      iconColor: "#D97706",
      tonnage: "14.20 MT",
    },
    {
      id: "SLIP-2026-805",
      name: "Mustard Husk Transit Slip",
      vendor: "Bighapur Agro Logistics",
      vendorLogo: "🚚",
      vendorColor: "#EF4444",
      date: "May 15, 2026",
      progress: 10,
      progressColor: "#EF4444",
      status: "Cancelled",
      statusVariant: "danger",
      priority: "Grade C",
      priorityVariant: "high",
      Icon: X,
      iconBg: "#FEF2F2",
      iconColor: "#DC2626",
      tonnage: "8.00 MT",
    },
  ];

  const allItems = rows.length > 0 ? rows : defaultBatches;

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchSearch =
        search === "" ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.vendor.toLowerCase().includes(search.toLowerCase()) ||
        item.id.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        statusFilter === "ALL" ||
        item.status.toLowerCase() === statusFilter.toLowerCase();

      return matchSearch && matchStatus;
    });
  }, [allItems, search, statusFilter]);

  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;
  const paginatedItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getStatusBadge = (status) => {
    if (status === "Completed") {
      return { bg: "#ECFDF5", color: "#047857", border: "#A7F3D0" };
    }
    if (status === "In Progress") {
      return { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" };
    }
    if (status === "On Hold") {
      return { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A" };
    }
    if (status === "Cancelled") {
      return { bg: "#FEE2E2", color: "#B91C1C", border: "#FCA5A5" };
    }
    return { bg: "var(--canvas)", color: "var(--ink)", border: "var(--line)" };
  };

  const getPriorityBadge = (p) => {
    if (p.includes("Grade A") || p === "High") {
      return { bg: "#FEE2E2", color: "#B91C1C" };
    }
    if (p.includes("Grade B") || p === "Medium") {
      return { bg: "#FFFBEB", color: "#B45309" };
    }
    return { bg: "#ECFDF5", color: "#047857" };
  };

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: 16,
        boxShadow: "0 4px 16px -2px rgba(5, 31, 32, 0.04)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Table Header: Title + Search + Status Filter */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--line)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "var(--ink)" }}>
            Recent Procurement & Dispatch Batches
          </h3>
          <span style={{ fontSize: 11.5, color: "var(--muted)" }}>
            Live status of weighing, stacking, and factory deliveries
          </span>
        </div>

        {/* Search & Filter Toolbar */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {/* Search Box */}
          <div style={{ position: "relative", minWidth: 200 }}>
            <span
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                display: "inline-flex",
                color: "var(--muted)",
              }}
            >
              <Search size={11.5} />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search batches..."
              style={{
                width: "100%",
                padding: "6px 12px 6px 30px",
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid var(--line-strong)",
                background: "var(--canvas)",
                color: "var(--ink)",
                outline: "none",
              }}
            />
          </div>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 600,
              borderRadius: 8,
              border: "1px solid var(--line-strong)",
              background: "var(--surface)",
              color: "var(--ink)",
              cursor: "pointer",
            }}
          >
            <option value="ALL">All Status</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div style={{ overflowX: "auto", width: "100%" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
          <thead>
            <tr
              style={{
                textAlign: "left",
                color: "var(--muted)",
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.4px",
                borderBottom: "1px solid var(--line)",
                background: "var(--canvas)",
              }}
            >
              <th style={{ padding: "10px 16px" }}>Batch / Slip Name</th>
              <th style={{ padding: "10px 16px" }}>Vendor / Cluster</th>
              <th style={{ padding: "10px 16px" }}>Date</th>
              <th style={{ padding: "10px 16px", minWidth: 140 }}>QC / Progress</th>
              <th style={{ padding: "10px 16px" }}>Status</th>
              <th style={{ padding: "10px 16px" }}>Grade / Quality</th>
              <th style={{ padding: "10px 16px", textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((row, idx) => {
              const statusStyle = getStatusBadge(row.status);
              const priorityStyle = getPriorityBadge(row.priority);

              return (
                <tr
                  key={row.id || idx}
                  style={{
                    borderBottom: "1px solid var(--line)",
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {/* Batch Name with Icon Box */}
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 8,
                          background: row.iconBg || "#EEF2FF",
                          color: row.iconColor || "#6366F1",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 14,
                          flexShrink: 0,
                        }}
                      >
                        <LucideIconWrapper size={14}>
                          <row.Icon size={14} />
                        </LucideIconWrapper>
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: "var(--ink)" }}>{row.name}</div>
                        <div style={{ fontSize: 10.5, color: "var(--muted)" }}>{row.tonnage || row.id}</div>
                      </div>
                    </div>
                  </td>

                  {/* Vendor / Client */}
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, color: "var(--ink)" }}>
                      <span>{row.vendorLogo}</span>
                      <span>{row.vendor}</span>
                    </div>
                  </td>

                  {/* Date */}
                  <td style={{ padding: "12px 16px", color: "var(--muted)", fontWeight: 500 }}>
                    {row.date}
                  </td>

                  {/* Progress / QC */}
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700 }}>
                        <span style={{ color: "var(--ink)" }}>{row.progress}%</span>
                      </div>
                      <div style={{ width: "100%", height: 5, background: "var(--line)", borderRadius: 3, overflow: "hidden" }}>
                        <div
                          style={{
                            width: `${row.progress}%`,
                            height: "100%",
                            background: row.progressColor,
                            borderRadius: 3,
                          }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 6,
                        background: statusStyle.bg,
                        color: statusStyle.color,
                        border: `1px solid ${statusStyle.border}`,
                        display: "inline-block",
                      }}
                    >
                      {row.status}
                    </span>
                  </td>

                  {/* Priority / Grade */}
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 6,
                        background: priorityStyle.bg,
                        color: priorityStyle.color,
                        display: "inline-block",
                      }}
                    >
                      {row.priority}
                    </span>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => navigate("/biomass/collection")}
                        style={{
                          border: "none",
                          background: "transparent",
                          color: "var(--muted)",
                          cursor: "pointer",
                          padding: 4,
                          fontSize: 13,
                        }}
                        title="View Details"
                      >
                        <LucideIconWrapper size={13}>
                          <Eye size={13} />
                        </LucideIconWrapper>
                      </button>
                      <button
                        type="button"
                        style={{
                          border: "none",
                          background: "transparent",
                          color: "var(--muted)",
                          cursor: "pointer",
                          padding: 4,
                          fontSize: 13,
                        }}
                      >
                        <LucideIconWrapper size={13}>
                          <MoreVertical size={13} />
                        </LucideIconWrapper>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div
        style={{
          padding: "12px 20px",
          borderTop: "1px solid var(--line)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10,
          fontSize: 12,
          color: "var(--muted)",
        }}
      >
        <div>
          Showing {filteredItems.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{" "}
          {Math.min(currentPage * pageSize, filteredItems.length)} of {filteredItems.length} records
        </div>

        {/* Page navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            style={{
              border: "1px solid var(--line)",
              background: "var(--surface)",
              borderRadius: 6,
              padding: "4px 8px",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              opacity: currentPage === 1 ? 0.5 : 1,
              color: "var(--ink)",
            }}
          >
            <LucideIconWrapper size={10}>
              <ChevronLeft size={10} />
            </LucideIconWrapper>
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setCurrentPage(p)}
              style={{
                border: p === currentPage ? "1px solid var(--palette-c4)" : "1px solid var(--line)",
                background: p === currentPage ? "var(--palette-c4)" : "var(--surface)",
                color: p === currentPage ? "#FFFFFF" : "var(--ink)",
                borderRadius: 6,
                padding: "4px 9px",
                fontSize: 11.5,
                fontWeight: p === currentPage ? 800 : 600,
                cursor: "pointer",
              }}
            >
              {p}
            </button>
          ))}

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            style={{
              border: "1px solid var(--line)",
              background: "var(--surface)",
              borderRadius: 6,
              padding: "4px 8px",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              opacity: currentPage === totalPages ? 0.5 : 1,
              color: "var(--ink)",
            }}
          >
            <LucideIconWrapper size={10}>
              <ChevronRight size={10} />
            </LucideIconWrapper>
          </button>
        </div>
      </div>
    </div>
  );
}
