import { useState, useMemo } from "react";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import StatTile from "../components/common/StatTile";
import AsyncState from "../components/common/AsyncState";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import FormField from "../components/common/FormField";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { useReports } from "../features/reports/useReports";
import { useAuth } from "../hooks/useAuth";
import {
  fetchStockValuation,
  fetchAttendanceSummaryReport,
  fetchMoistureTrend,
  fetchPurchaseVsSales,
  fetchOutstanding,
} from "../features/reports/api";
import { toast } from "../utils/toast";

const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];

function fmtRs(n) {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(1)}Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`;
  if (n >= 1e3) return `₹${(n / 1e3).toFixed(1)}K`;
  return `₹${n}`;
}

function fmtMt(n) {
  return `${(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 1 })} MT`;
}

const TABS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "stock", label: "Stock Valuation" },
  { key: "attendance", label: "Attendance" },
  { key: "moisture", label: "Moisture Trend" },
  { key: "financial", label: "Purchase vs Sales" },
  { key: "outstanding", label: "Outstanding" },
];

export default function Reports() {
  const { stats, status, error } = useReports();
  const { user } = useAuth();
  const [tab, setTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);

  // Stock valuation state
  const [stockData, setStockData] = useState([]);
  const [stockFrom, setStockFrom] = useState("");
  const [stockTo, setStockTo] = useState("");

  // Attendance state
  const [attendanceMonth, setAttendanceMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [attendanceSummary, setAttendanceSummary] = useState(null);

  // Moisture state
  const [moistureData, setMoistureData] = useState([]);
  const [moistureFrom, setMoistureFrom] = useState("");
  const [moistureTo, setMoistureTo] = useState("");
  const [moistureGroup, setMoistureGroup] = useState("day");

  // Financial state
  const [financialData, setFinancialData] = useState([]);
  const [finFrom, setFinFrom] = useState("");
  const [finTo, setFinTo] = useState("");
  const [finGroup, setFinGroup] = useState("month");

  // Outstanding state
  const [outstandingData, setOutstandingData] = useState(null);

  const warehouseId = user?.warehouseId;

  async function loadStock() {
    setLoading(true);
    try {
      const { list } = await fetchStockValuation(warehouseId, { from: stockFrom || undefined, to: stockTo || undefined });
      setStockData(list);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadAttendance() {
    setLoading(true);
    try {
      const data = await fetchAttendanceSummaryReport(warehouseId, attendanceMonth);
      setAttendanceSummary(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadMoisture() {
    setLoading(true);
    try {
      const data = await fetchMoistureTrend(warehouseId, { from: moistureFrom || undefined, to: moistureTo || undefined, groupBy: moistureGroup });
      setMoistureData(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadFinancial() {
    setLoading(true);
    try {
      const data = await fetchPurchaseVsSales(warehouseId, { from: finFrom || undefined, to: finTo || undefined, groupBy: finGroup });
      setFinancialData(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadOutstanding() {
    setLoading(true);
    try {
      const data = await fetchOutstanding(warehouseId);
      setOutstandingData(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleTabChange(t) {
    setTab(t);
    if (t === "stock" && stockData.length === 0) loadStock();
    if (t === "attendance" && !attendanceSummary) loadAttendance();
    if (t === "moisture" && moistureData.length === 0) loadMoisture();
    if (t === "financial" && financialData.length === 0) loadFinancial();
    if (t === "outstanding" && !outstandingData) loadOutstanding();
  }

  const dashboardStats = stats;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <PageHeader title="Analytics Centre" subtitle="Organisation-wide performance at a glance" />

      <AsyncState status={status} error={error} loadingLabel="Loading analytics…" />

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 4, borderBottom: "2px solid var(--line)", paddingBottom: 0 }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => handleTabChange(t.key)}
            style={{
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 700,
              border: "none",
              background: "transparent",
              color: tab === t.key ? "var(--primary-deep)" : "var(--muted)",
              borderBottom: tab === t.key ? "2px solid var(--primary-deep)" : "2px solid transparent",
              cursor: "pointer",
              marginBottom: -2,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && <AsyncState status="loading" loadingLabel="Loading report data…" />}

      {/* ── Dashboard Tab ── */}
      {tab === "dashboard" && dashboardStats && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            <StatTile label="Stock In-Hand" value={fmtMt(dashboardStats.totalStockKg)} trend={fmtRs(dashboardStats.totalStockValue)} />
            <StatTile label="Total Weighments" value={String(dashboardStats.totalWeighments)} trend={`${dashboardStats.pendingWeighments} pending approval`} />
            <StatTile label="Attendance Rate" value={`${dashboardStats.attendanceRate}%`} trend={`${dashboardStats.totalEmployees} employees`} />
            <StatTile label="Collections (MT)" value={fmtMt(dashboardStats.totalCollectionsMt)} trend={`${dashboardStats.totalCollections} slips`} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            <StatTile label="Dispatches (MT)" value={fmtMt(dashboardStats.totalDispatchesMt)} trend={fmtRs(dashboardStats.totalDispatchesValue)} />
            <StatTile label="Total Dispatches" value={String(dashboardStats.totalDispatches)} trend="Outbound deliveries" />
            <StatTile label="Active Warehouses" value={String(dashboardStats.activeWarehouses)} trend="Procurement centres" />
            <StatTile label="Active Employees" value={String(dashboardStats.totalEmployees)} trend="On payroll" />
          </div>
        </div>
      )}

      {/* ── Stock Valuation Tab ── */}
      {tab === "stock" && (
        <Card
          title="Warehouse-wise Stock Valuation"
          right={
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="date" value={stockFrom} onChange={(e) => setStockFrom(e.target.value)} style={{ padding: "4px 8px", fontSize: 12, border: "1px solid var(--line)", borderRadius: 6 }} />
              <span style={{ color: "var(--muted)", fontSize: 12 }}>to</span>
              <input type="date" value={stockTo} onChange={(e) => setStockTo(e.target.value)} style={{ padding: "4px 8px", fontSize: 12, border: "1px solid var(--line)", borderRadius: 6 }} />
              <Button onClick={loadStock} variant="secondary">Apply</Button>
            </div>
          }
        >
          {stockData.length === 0 ? (
            <p style={{ color: "var(--muted)", fontSize: 13, padding: 16 }}>No stock data available for the selected period.</p>
          ) : (
            <div style={{ width: "100%", height: 400 }}>
              <ResponsiveContainer>
                <BarChart data={stockData.map((r) => ({ label: `${r.commodity} (${r.warehouse})`, kg: r.totalKg, value: r.totalValue }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={80} />
                  <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}K kg`} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [v.toLocaleString("en-IN"), "kg"]} />
                  <Legend />
                  <Bar dataKey="kg" name="Net Weight (kg)" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {stockData.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--line)", textAlign: "left" }}>
                    <th style={{ padding: "8px 4px" }}>Warehouse</th>
                    <th style={{ padding: "8px 4px" }}>Commodity</th>
                    <th style={{ padding: "8px 4px" }}>Type</th>
                    <th style={{ padding: "8px 4px", textAlign: "right" }}>Weight (kg)</th>
                    <th style={{ padding: "8px 4px", textAlign: "right" }}>Value</th>
                    <th style={{ padding: "8px 4px", textAlign: "right" }}>Slips</th>
                  </tr>
                </thead>
                <tbody>
                  {stockData.map((row, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--line)" }}>
                      <td style={{ padding: "6px 4px" }}>{row.warehouse}</td>
                      <td style={{ padding: "6px 4px" }}>{row.commodity}</td>
                      <td style={{ padding: "6px 4px" }}>{row.entryType}</td>
                      <td style={{ padding: "6px 4px", textAlign: "right" }}>{row.totalKg.toLocaleString("en-IN")}</td>
                      <td style={{ padding: "6px 4px", textAlign: "right" }}>{fmtRs(row.totalValue)}</td>
                      <td style={{ padding: "6px 4px", textAlign: "right" }}>{row.slipCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* ── Attendance Tab ── */}
      {tab === "attendance" && (
        <Card
          title="Attendance Summary"
          right={
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="month" value={attendanceMonth} onChange={(e) => setAttendanceMonth(e.target.value)} style={{ padding: "4px 8px", fontSize: 12, border: "1px solid var(--line)", borderRadius: 6 }} />
              <Button onClick={loadAttendance} variant="secondary">Apply</Button>
            </div>
          }
        >
          {attendanceSummary && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
                <StatTile label="Present" value={String(attendanceSummary.present)} trend={`${attendanceSummary.attendanceRate}% rate`} color="#10B981" />
                <StatTile label="Late" value={String(attendanceSummary.late)} trend="Arrived late" color="#F59E0B" />
                <StatTile label="Absent" value={String(attendanceSummary.absent)} trend="Unexcused absence" color="#EF4444" />
                <StatTile label="Pending Review" value={String(attendanceSummary.pending)} trend="Awaiting approval" color="#8B5CF6" />
              </div>

              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Present", value: attendanceSummary.present },
                        { name: "Late", value: attendanceSummary.late },
                        { name: "Absent", value: attendanceSummary.absent },
                        { name: "Pending", value: attendanceSummary.pending },
                      ].filter((d) => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {[
                        { name: "Present", color: "#10B981" },
                        { name: "Late", color: "#F59E0B" },
                        { name: "Absent", color: "#EF4444" },
                        { name: "Pending", color: "#8B5CF6" },
                      ].map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* ── Moisture Trend Tab ── */}
      {tab === "moisture" && (
        <Card
          title="Moisture & Deduction Trend"
          right={
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <input type="date" value={moistureFrom} onChange={(e) => setMoistureFrom(e.target.value)} style={{ padding: "4px 8px", fontSize: 12, border: "1px solid var(--line)", borderRadius: 6 }} />
              <span style={{ color: "var(--muted)", fontSize: 12 }}>to</span>
              <input type="date" value={moistureTo} onChange={(e) => setMoistureTo(e.target.value)} style={{ padding: "4px 8px", fontSize: 12, border: "1px solid var(--line)", borderRadius: 6 }} />
              <select value={moistureGroup} onChange={(e) => { setMoistureGroup(e.target.value); loadMoisture(); }} style={{ padding: "4px 8px", fontSize: 12, border: "1px solid var(--line)", borderRadius: 6 }}>
                <option value="day">Daily</option>
                <option value="month">Monthly</option>
              </select>
              <Button onClick={loadMoisture} variant="secondary">Apply</Button>
            </div>
          }
        >
          {moistureData.length === 0 ? (
            <p style={{ color: "var(--muted)", fontSize: 13, padding: 16 }}>No moisture data available for the selected period.</p>
          ) : (
            <div style={{ width: "100%", height: 400 }}>
              <ResponsiveContainer>
                <LineChart data={moistureData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} domain={[0, 50]} />
                  <Tooltip formatter={(v) => [`${v}%`, ""]} />
                  <Legend />
                  <Line type="monotone" dataKey="moisture" name="Avg Moisture %" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="allowed" name="Allowed Threshold" stroke="#10B981" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  <Line type="monotone" dataKey="deduction" name="Deduction %" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      )}

      {/* ── Financial Tab ── */}
      {tab === "financial" && (
        <Card
          title="Purchase vs Sales Trend"
          right={
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <input type="date" value={finFrom} onChange={(e) => setFinFrom(e.target.value)} style={{ padding: "4px 8px", fontSize: 12, border: "1px solid var(--line)", borderRadius: 6 }} />
              <span style={{ color: "var(--muted)", fontSize: 12 }}>to</span>
              <input type="date" value={finTo} onChange={(e) => setFinTo(e.target.value)} style={{ padding: "4px 8px", fontSize: 12, border: "1px solid var(--line)", borderRadius: 6 }} />
              <select value={finGroup} onChange={(e) => { setFinGroup(e.target.value); loadFinancial(); }} style={{ padding: "4px 8px", fontSize: 12, border: "1px solid var(--line)", borderRadius: 6 }}>
                <option value="day">Daily</option>
                <option value="month">Monthly</option>
              </select>
              <Button onClick={loadFinancial} variant="secondary">Apply</Button>
            </div>
          }
        >
          {financialData.length === 0 ? (
            <p style={{ color: "var(--muted)", fontSize: 13, padding: 16 }}>No financial data available for the selected period.</p>
          ) : (
            <div style={{ width: "100%", height: 400 }}>
              <ResponsiveContainer>
                <BarChart data={financialData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [fmtMt(v), ""]} />
                  <Legend />
                  <Bar dataKey="purchaseMt" name="Purchase (MT)" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="salesMt" name="Sales (MT)" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      )}

      {/* ── Outstanding Tab ── */}
      {tab === "outstanding" && outstandingData && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Card title="Vendor Outstanding">
            {outstandingData.vendors.length === 0 ? (
              <p style={{ color: "var(--muted)", fontSize: 13, padding: 16 }}>No vendor data available.</p>
            ) : (
              <DataTable
                keyField="vendorId"
                rows={outstandingData.vendors}
                columns={[
                  { key: "vendorName", label: "Vendor", emphasize: true },
                  { key: "weight", label: "Total Weight (MT)", render: (r) => fmtMt(r.weight) },
                  { key: "amount", label: "Total Amount", render: (r) => fmtRs(r.amount) },
                  { key: "slips", label: "Slips" },
                ]}
              />
            )}
          </Card>
          <Card title="Customer / Buyer Outstanding">
            {outstandingData.customers.length === 0 ? (
              <p style={{ color: "var(--muted)", fontSize: 13, padding: 16 }}>No customer data available.</p>
            ) : (
              <DataTable
                keyField="buyerId"
                rows={outstandingData.customers}
                columns={[
                  { key: "buyerName", label: "Buyer", emphasize: true },
                  { key: "mt", label: "Dispatched (MT)", render: (r) => fmtMt(r.mt) },
                  { key: "amount", label: "Value (INR)", render: (r) => fmtRs(r.amount) },
                  { key: "delivered", label: "Delivered" },
                  { key: "pending", label: "Pending" },
                ]}
              />
            )}
          </Card>
        </div>
      )}

      {/* Quick Links */}
      <Card title="Quick Links">
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Button variant="secondary" onClick={() => navigate("/reports/export")}>Export MIS Reports</Button>
        </div>
      </Card>
    </div>
  );
}

function navigate(path) {
  window.location.href = path;
}
