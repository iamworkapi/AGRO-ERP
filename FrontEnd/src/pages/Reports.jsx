import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import StatCard from "../components/common/StatCard";
import AsyncState from "../components/common/AsyncState";
import Badge from "../components/common/Badge";
import { useReports } from "../features/reports/useReports";
import { useAuth } from "../hooks/useAuth";

const TAB_OPTIONS = [
  { key: "overview", label: "Overview", icon: "ri-bar-chart-line" },
  { key: "warehouses", label: "Warehouse Breakdown", icon: "ri-building-line" },
  { key: "financial", label: "Purchase vs Sales", icon: "ri-money-dollar-circle-line" },
  { key: "operations", label: "Operations", icon: "ri-scales-3-line" },
];

export default function Reports() {
  const { user } = useAuth();
  const { stats, warehouseBreakdown = [], availableReports, status, error } = useReports();
  const [activeTab, setActiveTab] = useState("overview");

  const isSuperAdmin = user?.roleKey === "super_admin";
  const totalStockValue = stats.find((s) => s.label.includes("Stock"));
  const totalCollections = stats.find((s) => s.label.includes("Collections"));
  const totalDispatches = stats.find((s) => s.label.includes("Dispatches"));
  const totalEmployees = stats.find((s) => s.label.includes("Employees"));
  const totalWeighments = stats.find((s) => s.label.includes("Weighments"));

  const topStat = stats[0];
  const restStats = stats.slice(1);

  // Build warehouse table rows from breakdown data
  const whRows = useMemo(() => warehouseBreakdown.map((wh) => ({
    id: wh.id,
    name: wh.name,
    code: wh.code,
    commodity: wh.commodity,
    status: wh.status,
    stockKg: wh.stock?.kg || 0,
    stockValue: wh.stock?.value || 0,
    weighmentsTotal: wh.weighments?.total || 0,
    collectionsMt: wh.collections?.mt || 0,
    collectionsValue: wh.collections?.value || 0,
    dispatchesMt: wh.dispatches?.mt || 0,
    dispatchesValue: wh.dispatches?.value || 0,
    employees: wh.employees || 0,
    contactPerson: wh.contactPerson,
    contactPhone: wh.contactPhone,
  })), [warehouseBreakdown]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <PageHeader
        title="Analytics Centre"
        subtitle={isSuperAdmin ? "Organisation-wide performance across all warehouses" : "Your warehouse performance at a glance"}
      />

      <AsyncState status={status} error={error} loadingLabel="Loading analytics…" />

      {/* TAB STRIP */}
      <div style={{ display: "flex", gap: 4, background: "var(--canvas)", padding: 3, borderRadius: 10, border: "1px solid var(--line)", width: "fit-content" }}>
        {TAB_OPTIONS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "7px 16px",
              borderRadius: 8,
              fontSize: 12.5,
              fontWeight: activeTab === tab.key ? 700 : 500,
              cursor: "pointer",
              border: "none",
              background: activeTab === tab.key ? "var(--surface)" : "transparent",
              color: activeTab === tab.key ? "var(--ink)" : "var(--muted)",
              boxShadow: activeTab === tab.key ? "var(--shadow-xs)" : "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              transition: "all 0.15s ease",
            }}
          >
            <i className={tab.icon} style={{ fontSize: 12 }} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: OVERVIEW */}
      {activeTab === "overview" && (
        <>
          {/* Hero Stats */}
          {topStat && (
            <div style={{
              background: "linear-gradient(135deg, rgba(93,214,44,0.08) 0%, rgba(27,94,58,0.04) 100%)",
              border: "1px solid rgba(93,214,44,0.2)",
              borderRadius: 14,
              padding: "20px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 16,
            }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                  {topStat.label}
                </span>
                <div style={{ fontSize: 28, fontWeight: 900, color: "var(--ink)", marginTop: 2, letterSpacing: "-0.02em" }}>
                  {topStat.value}
                </div>
                {topStat.sub && (
                  <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>{topStat.sub}</span>
                )}
                {topStat.trend && (
                  <div style={{ marginTop: 4, fontSize: 11.5, fontWeight: 700, color: topStat.trendUp ? "#059669" : "var(--muted)" }}>
                    <i className={topStat.trendUp ? "ri-arrow-up-line" : "ri-information-line"} style={{ marginRight: 4 }} />
                    {topStat.trend}
                  </div>
                )}
              </div>
              <div style={{
                width: 56, height: 56, borderRadius: 14,
                background: "var(--primary-tint)", color: "var(--primary-deep)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
                border: "1px solid rgba(93,214,44,0.2)",
              }}>
                <i className="ri-bar-chart-box-line" />
              </div>
            </div>
          )}

          {/* Stat Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            {restStats.map((s, i) => (
              <div key={i} style={{
                background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12,
                padding: "14px 16px", boxShadow: "var(--shadow-xs)",
              }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>
                  {s.label}
                </span>
                <div style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", marginTop: 4 }}>
                  {s.value}
                </div>
                {s.sub && (
                  <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500 }}>{s.sub}</span>
                )}
                {s.trend && (
                  <div style={{ marginTop: 3, fontSize: 11, fontWeight: 700, color: s.trendUp ? "#059669" : "var(--muted)" }}>
                    {s.trend}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Per-Warehouse Summary */}
          {isSuperAdmin && whRows.length > 0 && (
            <Card
              title="All Warehouses — Quick Summary"
              subtitle={`${whRows.length} warehouse${whRows.length > 1 ? "s" : ""} in network`}
              right={
                <Badge tone="info">{whRows.length} Active</Badge>
              }
            >
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10 }}>
                {whRows.map((wh) => (
                  <Link
                    key={wh.id}
                    to={`/warehouses/detail?id=${wh.id}`}
                    style={{
                      textDecoration: "none",
                      padding: "12px 14px",
                      background: "var(--canvas)",
                      border: "1px solid var(--line)",
                      borderRadius: 10,
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--primary)";
                      e.currentTarget.style.background = "var(--primary-tint)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--line)";
                      e.currentTarget.style.background = "var(--canvas)";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: "var(--ink)" }}>
                        <i className="ri-building-line" style={{ color: "var(--primary)", marginRight: 5 }} />
                        {wh.name}
                      </span>
                      <Badge tone={wh.status === "active" || wh.status === "Active" ? "success" : "warning"} style={{ fontSize: 10 }}>
                        {wh.status || "Active"}
                      </Badge>
                    </div>
                    {wh.commodity && (
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>
                        <i className="ri-fire-line" style={{ marginRight: 3 }} />{wh.commodity}
                      </span>
                    )}
                    {wh.contactPerson && (
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>
                        <i className="ri-user-line" style={{ marginRight: 3 }} />{wh.contactPerson}
                        {wh.contactPhone && ` (${wh.contactPhone})`}
                      </span>
                    )}
                    <span style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 600 }}>
                      {Number(wh.stockKg).toLocaleString("en-IN")} kg stock | {Number(wh.dispatchesMt).toFixed(2)} MT dispatched | {wh.employees} staff
                    </span>
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      {/* TAB: WAREHOUSE BREAKDOWN */}
      {activeTab === "warehouses" && (
        <Card
          title="Warehouse-wise Performance"
          subtitle="Stock, weighments, collections, dispatches and staff per hub"
        >
          {whRows.length === 0 ? (
            <p style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", padding: 24 }}>
              No warehouses found.
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--line)" }}>
                    <th style={{ textAlign: "left", padding: "8px 10px", fontWeight: 700, color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>Warehouse</th>
                    <th style={{ textAlign: "left", padding: "8px 10px", fontWeight: 700, color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>Code</th>
                    <th style={{ textAlign: "left", padding: "8px 10px", fontWeight: 700, color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>Commodity</th>
                    <th style={{ textAlign: "right", padding: "8px 10px", fontWeight: 700, color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>Stock (kg)</th>
                    <th style={{ textAlign: "right", padding: "8px 10px", fontWeight: 700, color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>Stock Value</th>
                    <th style={{ textAlign: "right", padding: "8px 10px", fontWeight: 700, color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>Weighments</th>
                    <th style={{ textAlign: "right", padding: "8px 10px", fontWeight: 700, color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>Collections (MT)</th>
                    <th style={{ textAlign: "right", padding: "8px 10px", fontWeight: 700, color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>Dispatches (MT)</th>
                    <th style={{ textAlign: "right", padding: "8px 10px", fontWeight: 700, color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>Employees</th>
                    <th style={{ textAlign: "center", padding: "8px 10px", fontWeight: 700, color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {whRows.map((wh) => (
                    <tr key={wh.id} style={{ borderBottom: "1px solid var(--line)" }}>
                      <td style={{ padding: "10px 10px", fontWeight: 600, color: "var(--ink)" }}>{wh.name}</td>
                      <td style={{ padding: "10px 10px", color: "var(--muted)", fontFamily: "monospace" }}>{wh.code || "—"}</td>
                      <td style={{ padding: "10px 10px", color: "var(--muted)" }}>{wh.commodity || "—"}</td>
                      <td style={{ padding: "10px 10px", textAlign: "right", fontWeight: 600, color: "var(--ink)" }}>
                        {Number(wh.stockKg).toLocaleString("en-IN")}
                      </td>
                      <td style={{ padding: "10px 10px", textAlign: "right" }}>
                        {wh.stockValue ? `₹${Number(wh.stockValue).toLocaleString("en-IN")}` : "—"}
                      </td>
                      <td style={{ padding: "10px 10px", textAlign: "right" }}>{wh.weighmentsTotal || "—"}</td>
                      <td style={{ padding: "10px 10px", textAlign: "right" }}>{Number(wh.collectionsMt).toFixed(2)}</td>
                      <td style={{ padding: "10px 10px", textAlign: "right", fontWeight: 600, color: "var(--primary-deep)" }}>
                        {Number(wh.dispatchesMt).toFixed(2)}
                      </td>
                      <td style={{ padding: "10px 10px", textAlign: "right" }}>{wh.employees || "—"}</td>
                      <td style={{ padding: "10px 10px", textAlign: "center" }}>
                        <Badge tone={wh.status === "active" || wh.status === "Active" ? "success" : "warning"} style={{ fontSize: 10 }}>
                          {wh.status || "Active"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* TAB: FINANCIAL */}
      {activeTab === "financial" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card
            title="Purchase vs Sales"
            subtitle="Inbound biomass collections vs outbound dispatches to buyers"
          >
            <p style={{ color: "var(--muted)", fontSize: 13, margin: "8px 0 0" }}>
              {totalCollections ? `Total Inbound: ${totalCollections.value} (${totalCollections.sub || ""})` : "No collection data yet."}
              {" "} |{" "}
              {totalDispatches ? `Total Outbound: ${totalDispatches.value} (${totalDispatches.sub || ""})` : "No dispatch data yet."}
            </p>
            {topStat && topStat.trend && (
              <div style={{ marginTop: 10, padding: "10px 14px", background: "var(--primary-tint)", borderRadius: 8, fontSize: 13, fontWeight: 700, color: "var(--primary-deep)" }}>
                <i className="ri-arrow-up-line" style={{ marginRight: 5 }} />
                {topStat.trend}
              </div>
            )}
          </Card>

          <Card title="Per-Warehouse Financial Summary">
            {whRows.length === 0 ? (
              <p style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", padding: 24 }}>No warehouses.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--line)" }}>
                      <th style={{ textAlign: "left", padding: "8px 10px", fontWeight: 700, color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>Warehouse</th>
                      <th style={{ textAlign: "right", padding: "8px 10px", fontWeight: 700, color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>Collections (MT)</th>
                      <th style={{ textAlign: "right", padding: "8px 10px", fontWeight: 700, color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>Collection Value</th>
                      <th style={{ textAlign: "right", padding: "8px 10px", fontWeight: 700, color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>Dispatches (MT)</th>
                      <th style={{ textAlign: "right", padding: "8px 10px", fontWeight: 700, color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>Dispatch Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {whRows.map((wh) => (
                      <tr key={wh.id} style={{ borderBottom: "1px solid var(--line)" }}>
                        <td style={{ padding: "10px 10px", fontWeight: 600, color: "var(--ink)" }}>{wh.name}</td>
                        <td style={{ padding: "10px 10px", textAlign: "right" }}>{Number(wh.collectionsMt).toFixed(2)}</td>
                        <td style={{ padding: "10px 10px", textAlign: "right" }}>
                          {wh.collectionsValue ? `₹${Number(wh.collectionsValue).toLocaleString("en-IN")}` : "—"}
                        </td>
                        <td style={{ padding: "10px 10px", textAlign: "right", fontWeight: 600, color: "var(--primary-deep)" }}>
                          {Number(wh.dispatchesMt).toFixed(2)}
                        </td>
                        <td style={{ padding: "10px 10px", textAlign: "right", fontWeight: 700 }}>
                          {wh.dispatchesValue ? `₹${Number(wh.dispatchesValue).toLocaleString("en-IN")}` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB: OPERATIONS */}
      {activeTab === "operations" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card
            title="Weighments & Stock"
            subtitle="Weighbridge entries, stock entries and inventory across all warehouses"
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
              <div style={{ padding: "14px", background: "var(--canvas)", borderRadius: 10, border: "1px solid var(--line)" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Total Weighments</span>
                <div style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", marginTop: 4 }}>
                  {totalWeighments ? totalWeighments.value : "—"}
                </div>
                {totalWeighments?.sub && (
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>{totalWeighments.sub}</span>
                )}
              </div>
              <div style={{ padding: "14px", background: "var(--canvas)", borderRadius: 10, border: "1px solid var(--line)" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Total Stock</span>
                <div style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", marginTop: 4 }}>
                  {totalStockValue ? totalStockValue.value : "—"}
                </div>
                {totalStockValue?.sub && (
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>{totalStockValue.sub}</span>
                )}
              </div>
              <div style={{ padding: "14px", background: "var(--canvas)", borderRadius: 10, border: "1px solid var(--line)" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Employees</span>
                <div style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", marginTop: 4 }}>
                  {totalEmployees ? totalEmployees.value : "—"}
                </div>
                {totalEmployees?.sub && (
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>{totalEmployees.sub}</span>
                )}
              </div>
            </div>
          </Card>

          <Card
            title="Per-Warehouse Operations"
            subtitle="Weighments, collections, dispatches, stock and employee count"
          >
            {whRows.length === 0 ? (
              <p style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", padding: 24 }}>No warehouses.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--line)" }}>
                      <th style={{ textAlign: "left", padding: "8px 10px", fontWeight: 700, color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>Warehouse</th>
                      <th style={{ textAlign: "right", padding: "8px 10px", fontWeight: 700, color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>Stock (kg)</th>
                      <th style={{ textAlign: "right", padding: "8px 10px", fontWeight: 700, color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>Weighments</th>
                      <th style={{ textAlign: "right", padding: "8px 10px", fontWeight: 700, color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>Collections (MT)</th>
                      <th style={{ textAlign: "right", padding: "8px 10px", fontWeight: 700, color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>Dispatches (MT)</th>
                      <th style={{ textAlign: "right", padding: "8px 10px", fontWeight: 700, color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>Employees</th>
                    </tr>
                  </thead>
                  <tbody>
                    {whRows.map((wh) => (
                      <tr key={wh.id} style={{ borderBottom: "1px solid var(--line)" }}>
                        <td style={{ padding: "10px 10px", fontWeight: 600, color: "var(--ink)" }}>{wh.name}</td>
                        <td style={{ padding: "10px 10px", textAlign: "right" }}>{Number(wh.stockKg).toLocaleString("en-IN")}</td>
                        <td style={{ padding: "10px 10px", textAlign: "right" }}>{wh.weighmentsTotal || "—"}</td>
                        <td style={{ padding: "10px 10px", textAlign: "right" }}>{Number(wh.collectionsMt).toFixed(2)}</td>
                        <td style={{ padding: "10px 10px", textAlign: "right", fontWeight: 600, color: "var(--primary-deep)" }}>{Number(wh.dispatchesMt).toFixed(2)}</td>
                        <td style={{ padding: "10px 10px", textAlign: "right" }}>{wh.employees || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* QUICK LINKS */}
      <Card title="Quick Links">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <Link to="/reports/export" style={{ color: "var(--primary-deep)", fontWeight: 600, fontSize: 13, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5 }}>
            <i className="ri-download-line" /> Export MIS Reports ({availableReports.length} available)
          </Link>
          <Link to="/weighment" style={{ color: "var(--primary-deep)", fontWeight: 600, fontSize: 13, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5, marginLeft: 16 }}>
            <i className="ri-scales-3-line" /> Weighment Slips
          </Link>
          <Link to="/biomass/dispatch" style={{ color: "var(--primary-deep)", fontWeight: 600, fontSize: 13, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5, marginLeft: 16 }}>
            <i className="ri-truck-line" /> Buyer Dispatches
          </Link>
          <Link to="/inventory" style={{ color: "var(--primary-deep)", fontWeight: 600, fontSize: 13, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5, marginLeft: 16 }}>
            <i className="ri-archive-line" /> Stock Ledger
          </Link>
        </div>
      </Card>
    </div>
  );
}
