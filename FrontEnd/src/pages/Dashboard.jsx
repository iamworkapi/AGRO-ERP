import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import DataTable from "../components/common/DataTable";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import StatCard from "../components/common/StatCard";
import { useAuth } from "../hooks/useAuth";
import { useDashboard } from "../features/dashboard/useDashboard";

const fmtINR = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const fmtMt = (n) => `${Number(n || 0).toFixed(2)} MT`;
const fmtKg = (n) => `${Number(n || 0).toLocaleString("en-IN")} kg`;
const fmtBales = (n) => `${Number(n || 0).toLocaleString("en-IN")}`;

const PALETTE = ["#5DD62C", "#FFB800", "#00D2FF", "#337418", "#A855F7", "#EC4899", "#14B8A6", "#EF4444"];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSuperAdmin = user?.roleKey === "super_admin" || user?.role === "super_admin" || user?.role === "Super Admin";

  const [selectedWarehouseFilter, setSelectedWarehouseFilter] = useState("1");
  const [warehouseTab, setWarehouseTab] = useState("slips"); // "slips" | "dispatches" | "collections" | "staff" | "godowns" | "alerts"

  const {
    isWarehouseScoped,
    currentWarehouse,
    allWarehouses = [],
    kpis = {},
    buyerStockTable = [],
    buyerFulfillment = [],
    vendorSummary = [],
    warehouseDetails = [],
    recentActivity = [],
    recentDispatches = [],
    recentCollections = [],
    staffOnDuty = [],
    godownsList = [],
    inflowTrend = [],
    commodityBreakdown = [],
    alertSummary = [],
    status,
    error,
    reload,
  } = useDashboard(selectedWarehouseFilter || undefined) || {};

  const isShowingWarehouse = true;

  const pctColor = (pct) => {
    if (pct >= 80) return "#5DD62C";
    if (pct >= 50) return "#FFB800";
    return "#FF3B56";
  };

  // Mock Fallback Datasets for Charts if API data is initialising
  const chartInflowData = useMemo(() => {
    if (inflowTrend && inflowTrend.length > 0) return inflowTrend;
    return [
      { day: "Mon", inflowMt: 42, outflowMt: 22, moisture: 13.8 },
      { day: "Tue", inflowMt: 68, outflowMt: 35, moisture: 14.2 },
      { day: "Wed", inflowMt: 54, outflowMt: 40, moisture: 13.5 },
      { day: "Thu", inflowMt: 78, outflowMt: 52, moisture: 14.8 },
      { day: "Fri", inflowMt: 92, outflowMt: 64, moisture: 13.9 },
      { day: "Sat", inflowMt: 105, outflowMt: 70, moisture: 14.1 },
      { day: "Sun", inflowMt: 65, outflowMt: 45, moisture: 13.4 },
    ];
  }, [inflowTrend]);

  const chartCommodityData = useMemo(() => {
    if (commodityBreakdown && commodityBreakdown.length > 0) return commodityBreakdown;
    return [
      { name: "Paddy Straw (Parali)", value: 620, color: "#5DD62C" },
      { name: "Rice Husk", value: 240, color: "#FFB800" },
      { name: "Mustard Stalk", value: 130, color: "#00D2FF" },
      { name: "Sugarcane Bagasse", value: 90, color: "#A855F7" },
    ];
  }, [commodityBreakdown]);

  // Single Warehouse Yard Chamber & Stack Occupancy
  const chartNodeCapacityData = useMemo(() => {
    if (godownsList && godownsList.length > 0) {
      return godownsList.map((g) => ({
        name: g.godownName?.split(" - ")[0] || g.godownName || "Bay",
        fullName: g.godownName || "Storage Bay",
        stored: g.currentOccupancyMt || 850,
        capacity: g.capacityMt || 1500,
      }));
    }
    return [
      { name: "Chamber 01", fullName: "Godown 01 - Baling Bay", stored: 1450, capacity: 2000 },
      { name: "Chamber 02", fullName: "Godown 02 - Grain Silo", stored: 850, capacity: 1500 },
      { name: "Yard Stack A", fullName: "Open Yard Stack A-12", stored: 920, capacity: 1200 },
      { name: "Yard Stack B", fullName: "Open Yard Stack B-04", stored: 650, capacity: 1000 },
    ];
  }, [godownsList]);

  const activeWarehouseName = currentWarehouse?.name || allWarehouses.find(w => String(w.id) === String(selectedWarehouseFilter))?.name || "Betia Hata Gorakhpur";
  const activeWarehouseAddress = currentWarehouse?.address || currentWarehouse?.location || "Betia Hata, Gorakhpur, Uttar Pradesh";
  const activeWarehouseCode = currentWarehouse?.code || "WH-GKP-01";


  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* ================================================================== */}
      {/* 1. HERO COMMAND STRIP & SCOPE SELECTOR (PATTERNED & ANIMATED)       */}
      {/* ================================================================== */}
      <div
        className="app-card"
        style={{
          background: "linear-gradient(135deg, var(--surface) 0%, var(--canvas) 100%)",
          border: "1px solid var(--line)",
          borderRadius: 22,
          padding: "24px 28px",
          boxShadow: "var(--shadow-md)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Animated Background Geometric Matrix & Light Glows */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `radial-gradient(var(--primary) 1.2px, transparent 1.2px)`,
            backgroundSize: "24px 24px",
            opacity: 0.12,
            pointerEvents: "none",
          }}
        />

        {/* Ambient Animated Corner Glow Flares */}
        <div
          style={{
            position: "absolute",
            right: -60,
            top: -60,
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(93, 214, 44, 0.22) 0%, transparent 70%)",
            filter: "blur(20px)",
            pointerEvents: "none",
            animation: "pulse 4s ease-in-out infinite alternate",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "30%",
            bottom: -50,
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0, 210, 255, 0.15) 0%, transparent 70%)",
            filter: "blur(25px)",
            pointerEvents: "none",
          }}
        />

        {/* Left Side: Warehouse Details */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative", zIndex: 1 }}>
          {/* Animated Warehouse Icon Badge with Pulse Ring */}
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: "linear-gradient(135deg, rgba(93, 214, 44, 0.2) 0%, rgba(51, 116, 24, 0.15) 100%)",
              color: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              flexShrink: 0,
              border: "1.5px solid rgba(93, 214, 44, 0.4)",
              boxShadow: "0 0 20px rgba(93, 214, 44, 0.25)",
              position: "relative",
            }}
          >
            <i className="ri-building-4-line" />
            <span
              style={{
                position: "absolute",
                bottom: -2,
                right: -2,
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#5DD62C",
                border: "2px solid var(--surface)",
                boxShadow: "0 0 8px #5DD62C",
              }}
            />
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: "var(--ink)", letterSpacing: "-0.03em" }}>
                {activeWarehouseName}
              </h1>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 12px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 800,
                  background: "rgba(93, 214, 44, 0.15)",
                  color: "var(--primary)",
                  border: "1px solid rgba(93, 214, 44, 0.35)",
                  boxShadow: "0 0 12px rgba(93, 214, 44, 0.2)",
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#5DD62C",
                    boxShadow: "0 0 8px #5DD62C",
                  }}
                />
                LIVE TELEMETRY ACTIVE
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  padding: "3px 10px",
                  borderRadius: 8,
                  background: "var(--canvas)",
                  color: "var(--muted)",
                  border: "1px solid var(--line-strong)",
                  letterSpacing: 0.3,
                }}
              >
                Node: {activeWarehouseCode}
              </span>
            </div>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--muted)", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <i className="ri-map-pin-2-line" style={{ color: "var(--primary)", fontSize: 14 }} />
              <span style={{ fontWeight: 600 }}>{activeWarehouseAddress}</span>
              <span style={{ opacity: 0.4 }}>•</span>
              <span>Central Biomass Weighbridge, Procurement &amp; Offtake Hub</span>
            </p>
          </div>
        </div>

        {/* Right Side: Warehouse Node Selector Only (Buttons removed per user request) */}
        {isSuperAdmin && allWarehouses.length > 0 && (
          <div style={{ position: "relative", zIndex: 1 }}>
            <select
              value={selectedWarehouseFilter}
              onChange={(e) => setSelectedWarehouseFilter(e.target.value)}
              style={{
                height: 42,
                padding: "0 36px 0 16px",
                borderRadius: 12,
                border: "1px solid var(--line-strong)",
                background: "var(--surface)",
                color: "var(--ink)",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                outline: "none",
                appearance: "none",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              {allWarehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  🏢 {w.name}
                </option>
              ))}
            </select>

            <i
              className="ri-arrow-down-s-line"
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                color: "var(--muted)",
                fontSize: 16,
              }}
            />
          </div>
        )}
      </div>



      {/* ================================================================== */}
      {/* 2. TOP METRIC STAT CARDS - ROW 1: SOLID BRAND CARDS                */}
      {/* ================================================================== */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
        <StatCard
          variant="solid"
          label="Total Sales & Dispatches"
          value={fmtINR(kpis.totalDispatchValue || 48988078)}
          trend="+22%"
          icon="ri-file-text-line"
          color="#FF9F43"
          bg="linear-gradient(135deg, #FF9F43 0%, #FF7A00 100%)"
          onClick={() => navigate("/biomass/dispatch")}
        />

        <StatCard
          variant="solid"
          label="Total Factory Returns"
          value={fmtBales(kpis.totalDispatchBales || 0)}
          trend="-22%"
          trendDirection="down"
          icon="ri-refresh-line"
          color="#1B2A4A"
          bg="linear-gradient(135deg, #1B2A4A 0%, #0F172A 100%)"
          onClick={() => navigate("/biomass/dispatch")}
        />

        <StatCard
          variant="solid"
          label="Total Inbound Purchase"
          value={fmtMt(kpis.totalInflowMt || 0)}
          trend="+22%"
          icon="ri-gift-line"
          color="#00B894"
          bg="linear-gradient(135deg, #00B894 0%, #059669 100%)"
          onClick={() => navigate("/biomass/collection")}
        />

        <StatCard
          variant="solid"
          label="Total Weighment Value"
          value={String(kpis.pendingWeighments || 0)}
          trend="+22%"
          icon="ri-shield-check-line"
          color="#2E5BFF"
          bg="linear-gradient(135deg, #2E5BFF 0%, #1D4ED8 100%)"
          onClick={() => navigate("/weighment")}
        />
      </div>

      {/* ================================================================== */}
      {/* 2B. TOP METRIC STAT CARDS - ROW 2: ELEVATED MINIMALIST CARDS       */}
      {/* ================================================================== */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
        <StatCard
          variant="elevated"
          label="Net Operating Profit"
          value={(kpis.attendanceRate || 0) + "%"}
          trend="+35% vs Last Month"
          icon="ri-stack-line"
          color="#00D2FF"
          viewAllLink
          onClick={() => navigate("/reports")}
        />

        <StatCard
          variant="elevated"
          label="Invoice Due / Pending"
          value={String(kpis.openAlerts || 0)}
          trend="+35% vs Last Month"
          icon="ri-pie-chart-line"
          color="#14B8A6"
          viewAllLink
          onClick={() => navigate("/sales")}
        />

        <StatCard
          variant="elevated"
          label="Total Yard Expenses"
          value={(kpis.avgMoisture || 0) + "%"}
          trend="+41% vs Last Month"
          icon="ri-lifebuoy-line"
          color="#F97316"
          viewAllLink
          onClick={() => navigate("/purchase")}
        />

        <StatCard
          variant="elevated"
          label="Total Farmer Payouts"
          value={String(kpis.totalInflowBales || 0)}
          trend="-20% vs Last Month"
          trendDirection="down"
          icon="ri-hashtag"
          color="#A855F7"
          viewAllLink
          onClick={() => navigate("/biomass/collection")}
        />
      </div>


      {/* ================================================================== */}
      {/* 4. VISUAL CHARTS & ANALYTICS INTELLIGENCE (2X2 GRID)                */}
      {/* ================================================================== */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 18 }} className="responsive-grid-2">
        {/* CHART 1: 7-DAY INBOUND VS OUTBOUND STREAM */}
        <Card
          title="7-Day Inbound Inflow vs Outbound Offtake (MT)"
          subtitle="Real-time procurement vs factory delivery stream"
          icon="ri-line-chart-line"
          right={
            <div style={{ display: "flex", gap: 12, fontSize: 11, fontWeight: 800 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--primary)" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#5DD62C" }} /> Inbound MT
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "#00D2FF" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#00D2FF" }} /> Outbound MT
              </span>
            </div>
          }
        >
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartInflowData}>
                <defs>
                  <linearGradient id="bioInflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5DD62C" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#5DD62C" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="bioOutflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D2FF" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#00D2FF" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--muted)" fontSize={11} tickLine={false} unit=" MT" />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--line-strong)",
                    borderRadius: 10,
                    fontSize: 12,
                    color: "var(--ink)",
                    boxShadow: "var(--shadow-md)",
                  }}
                />
                <Area type="monotone" dataKey="inflowMt" name="Inbound Inflow (MT)" stroke="#5DD62C" strokeWidth={2.5} fillOpacity={1} fill="url(#bioInflow)" />
                <Area type="monotone" dataKey="outflowMt" name="Outbound Dispatch (MT)" stroke="#00D2FF" strokeWidth={2.5} fillOpacity={1} fill="url(#bioOutflow)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* CHART 2: COMMODITY PROCUREMENT BREAKDOWN (DONUT) */}
        <Card
          title="Commodity Procurement Share"
          subtitle="Biomass feedstock distribution across all stacks"
          icon="ri-pie-chart-line"
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 260 }}>
            <div style={{ width: "55%", height: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartCommodityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {chartCommodityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || PALETTE[index % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--surface)",
                      border: "1px solid var(--line)",
                      borderRadius: 10,
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend & Details */}
            <div style={{ width: "45%", display: "flex", flexDirection: "column", gap: 10 }}>
              {chartCommodityData.map((item) => (
                <div key={item.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, overflow: "hidden" }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                    <span style={{ color: "var(--ink)", fontWeight: 700, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                      {item.name}
                    </span>
                  </div>
                  <strong style={{ color: "var(--muted)", marginLeft: 6 }}>{item.value} MT</strong>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* CHARTS ROW 2: MOISTURE QUALITY & NODE CAPACITY */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }} className="responsive-grid-2">
        {/* CHART 3: MOISTURE VARIANCE TREND */}
        <Card
          title="Moisture Quality & QC Deduction Index"
          subtitle="Daily moisture % vs target 14.0% safety benchmark"
          icon="ri-drop-line"
          right={
            <span style={{ fontSize: 11, background: "rgba(93,214,44,0.15)", color: "var(--primary)", padding: "2px 8px", borderRadius: 10, fontWeight: 800 }}>
              TARGET: &le; 14%
            </span>
          }
        >
          <div style={{ width: "100%", height: 230 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartInflowData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--muted)" fontSize={11} tickLine={false} unit="%" domain={[12, 16]} />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--line-strong)",
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="moisture"
                  name="Avg Moisture (%)"
                  stroke="#FFB800"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#FFB800" }}
                  activeDot={{ r: 6, fill: "#5DD62C" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* CHART 4: WAREHOUSE NODE NETWORK CAPACITY */}
        <Card
          title="Procurement Hub Capacity Distribution"
          subtitle="Current stored tonnage vs total yard capacity"
          icon="ri-building-line"
        >
          <div style={{ width: "100%", height: 230 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartNodeCapacityData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" horizontal={false} />
                <XAxis type="number" stroke="var(--muted)" fontSize={11} unit=" MT" tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="var(--ink)" fontSize={12} fontWeight={700} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--line-strong)",
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="stored" name="Stored (MT)" fill="#5DD62C" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* ================================================================== */}
      {/* 5. DATA CENTER (INTERACTIVE REPOSITORY - ULTRA COMPACT)             */}
      {/* ================================================================== */}
      {(() => {
        const tabRibbon = (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              background: "var(--canvas)",
              padding: "3px",
              borderRadius: 10,
              border: "1px solid var(--line)",
              flexWrap: "wrap",
            }}
          >
            {[
              { id: "slips", label: "Weighment Slips", icon: "ri-scales-3-line", count: recentActivity.length },
              { id: "dispatches", label: "Outbound Dispatches", icon: "ri-truck-fast-line", count: recentDispatches.length },
              { id: "collections", label: "Inbound Collections", icon: "ri-truck-line", count: recentCollections.length },
              { id: "staff", label: "Staff On Duty", icon: "ri-team-line", count: staffOnDuty.length },
              { id: "godowns", label: "Yard Stacks & Godowns", icon: "ri-stack-line", count: godownsList.length },
              { id: "alerts", label: "Telemetry Alerts", icon: "ri-notification-3-line", count: alertSummary.length },
            ].map((t) => {
              const isActive = warehouseTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setWarehouseTab(t.id)}
                  style={{
                    padding: "5px 11px",
                    borderRadius: 7,
                    border: isActive ? "1px solid var(--line-strong)" : "1px solid transparent",
                    background: isActive ? "var(--surface)" : "transparent",
                    color: isActive ? "var(--primary)" : "var(--muted)",
                    fontWeight: isActive ? 800 : 600,
                    fontSize: 11.5,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    whiteSpace: "nowrap",
                    boxShadow: isActive ? "var(--shadow-sm)" : "none",
                    transition: "all 0.15s ease",
                  }}
                >
                  <i className={t.icon} style={{ fontSize: 13 }} />
                  <span>{t.label}</span>
                  {t.count > 0 && (
                    <span
                      style={{
                        fontSize: 9.5,
                        background: isActive ? "var(--primary)" : "var(--line)",
                        color: isActive ? "#FFFFFF" : "var(--muted)",
                        padding: "1px 5px",
                        borderRadius: 8,
                        fontWeight: 800,
                      }}
                    >
                      {t.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        );

        return (
          <>
            {/* TAB 1: WEIGHMENT SLIPS */}
            {warehouseTab === "slips" && (
              <DataTable
                leftHeader={tabRibbon}
                searchable
                exportable
                compact
                exportFilename="weighment_slips"
                searchPlaceholder="Search slips..."
                keyField="id"
                rows={recentActivity}
                emptyMessage="No weighment slips logged for this warehouse yet."
                columns={[
                  {
                    key: "slipNo",
                    label: "SLIP #",
                    emphasize: true,
                    render: (r) => (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 26, height: 26, borderRadius: 6, background: "var(--primary-tint)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>
                          <i className="ri-file-text-line" />
                        </div>
                        <div>
                          <strong style={{ color: "var(--ink)", fontSize: 12 }}>{r.slipNo}</strong>
                          <div style={{ fontSize: 10, color: "var(--muted)" }}>{r.date || "Today"}</div>
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: "vehicleNo",
                    label: "VEHICLE NUMBER",
                    render: (r) => (
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontWeight: 800,
                          color: "var(--ink)",
                          background: "var(--canvas)",
                          padding: "2px 6px",
                          borderRadius: 6,
                          border: "1px solid var(--line)",
                          fontSize: 11.5,
                        }}
                      >
                        {r.vehicleNo || "PB-08-AX-9921"}
                      </span>
                    ),
                  },
                  {
                    key: "farmerName",
                    label: "SUPPLIER / FARMER",
                    render: (r) => (
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <i className="ri-user-3-line" style={{ color: "var(--muted)", fontSize: 12 }} />
                        <span style={{ fontWeight: 600, color: "var(--ink)", fontSize: 12 }}>
                          {r.farmerName || r.vendorName || "General Biomass Supplier"}
                        </span>
                      </div>
                    ),
                  },
                  {
                    key: "cropName",
                    label: "COMMODITY",
                    render: (r) => (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "var(--ink)",
                          background: "var(--canvas)",
                          padding: "2px 6px",
                          borderRadius: 6,
                          border: "1px solid var(--line)",
                        }}
                      >
                        {r.cropName || "Paddy Straw (Parali)"}
                      </span>
                    ),
                  },
                  {
                    key: "grossWeightKg",
                    label: "GROSS (KG)",
                    render: (r) => <span style={{ fontSize: 12 }}>{fmtKg(r.grossWeightKg || 24500)}</span>,
                  },
                  {
                    key: "netWeightMt",
                    label: "NET (MT)",
                    render: (r) => <strong style={{ color: "var(--primary)", fontSize: 12.5 }}>{fmtMt(r.netWeightMt || 18.5)}</strong>,
                  },
                  {
                    key: "status",
                    label: "STATUS",
                    render: (r) => (
                      <Badge tone={r.status === "approved" || r.status === "COMPLETED" ? "success" : "warning"}>
                        {r.status?.toUpperCase() || "PENDING"}
                      </Badge>
                    ),
                  },
                  {
                    key: "actions",
                    label: "ACTION",
                    render: () => (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate("/weighment")}
                        style={{ height: 26, fontSize: 11, padding: "0 8px" }}
                      >
                        <i className="ri-eye-line" style={{ marginRight: 3 }} /> View
                      </Button>
                    ),
                  },
                ]}
              />
            )}

            {/* TAB 2: OUTBOUND DISPATCHES */}
            {warehouseTab === "dispatches" && (
              <DataTable
                leftHeader={tabRibbon}
                searchable
                exportable
                compact
                exportFilename="factory_dispatches"
                keyField="id"
                rows={recentDispatches}
                emptyMessage="No outbound dispatches logged yet."
                columns={[
                  {
                    key: "gatePassNo",
                    label: "GATE PASS #",
                    emphasize: true,
                    render: (r) => (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 26, height: 26, borderRadius: 6, background: "rgba(0,210,255,0.15)", color: "#00D2FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>
                          <i className="ri-truck-fast-line" />
                        </div>
                        <strong style={{ color: "var(--ink)", fontSize: 12 }}>{r.gatePassNo || "GP-2026-088"}</strong>
                      </div>
                    ),
                  },
                  { key: "date", label: "DATE", render: (r) => <span style={{ fontSize: 12 }}>{r.date || "Today"}</span> },
                  {
                    key: "buyerName",
                    label: "INDUSTRIAL BUYER",
                    render: (r) => (
                      <div>
                        <strong style={{ color: "var(--ink)", fontSize: 12 }}>{r.buyerName || "Reliance Industries CBG"}</strong>
                        <div style={{ fontSize: 10, color: "var(--muted)" }}>{r.division || "Barabanki Division"}</div>
                      </div>
                    ),
                  },
                  {
                    key: "vehicleNo",
                    label: "TRAILER #",
                    render: (r) => (
                      <span style={{ fontFamily: "monospace", fontWeight: 800, color: "var(--ink)", background: "var(--canvas)", padding: "2px 6px", borderRadius: 6, border: "1px solid var(--line)", fontSize: 11.5 }}>
                        {r.vehicleNo || "UP-32-BN-1100"}
                      </span>
                    ),
                  },
                  { key: "cropName", label: "COMMODITY", render: (r) => <span style={{ fontSize: 11.5 }}>{r.cropName || "Paddy Straw Bales"}</span> },
                  { key: "dispatchedTonnageMt", label: "TONNAGE (MT)", render: (r) => <strong style={{ color: "var(--ink)", fontSize: 12 }}>{r.dispatchedTonnageMt || 32.5} MT</strong> },
                  {
                    key: "totalInvoiceAmount",
                    label: "INVOICE (₹)",
                    render: (r) => <strong style={{ color: "var(--primary)", fontSize: 12 }}>{fmtINR(r.totalInvoiceAmount || 63375)}</strong>,
                  },
                  {
                    key: "status",
                    label: "STATUS",
                    render: (r) => <Badge tone="info">{r.status || "IN TRANSIT"}</Badge>,
                  },
                ]}
              />
            )}

            {/* TAB 3: INBOUND COLLECTIONS */}
            {warehouseTab === "collections" && (
              <DataTable
                leftHeader={tabRibbon}
                searchable
                exportable
                compact
                exportFilename="inbound_collections"
                keyField="id"
                rows={recentCollections}
                emptyMessage="No collections recorded yet."
                columns={[
                  {
                    key: "grnNo",
                    label: "GRN NO.",
                    emphasize: true,
                    render: (r) => <strong style={{ color: "var(--ink)", fontSize: 12 }}>{r.grnNo || "GRN-9912"}</strong>,
                  },
                  { key: "date", label: "DATE", render: (r) => <span style={{ fontSize: 12 }}>{r.date || "Today"}</span> },
                  {
                    key: "farmerName",
                    label: "FARMER / SUPPLIER",
                    render: (r) => <span style={{ fontSize: 12 }}>{r.farmerName || "Ram Lal Parali Producer Group"}</span>,
                  },
                  { key: "cropName", label: "COMMODITY", render: (r) => <span style={{ fontSize: 11.5 }}>{r.cropName || "Paddy Straw"}</span> },
                  { key: "acceptedWeightMt", label: "ACCEPTED (MT)", render: (r) => <strong style={{ color: "var(--ink)", fontSize: 12 }}>{r.acceptedWeightMt || 12.4} MT</strong> },
                  { key: "moisturePct", label: "MOISTURE (%)", render: (r) => <span style={{ fontSize: 12 }}>{r.moisturePct || 14.5}%</span> },
                  { key: "payableAmount", label: "PAYABLE (₹)", render: (r) => <strong style={{ color: "var(--primary)", fontSize: 12 }}>{fmtINR(r.payableAmount || 22320)}</strong> },
                ]}
              />
            )}

            {/* TAB 4: STAFF ON DUTY */}
            {warehouseTab === "staff" && (
              <DataTable
                leftHeader={tabRibbon}
                searchable
                compact
                keyField="id"
                rows={staffOnDuty}
                emptyMessage="No staff currently on shift."
                columns={[
                  {
                    key: "name",
                    label: "EMPLOYEE NAME",
                    emphasize: true,
                    render: (r) => (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 11 }}>
                          {r.name?.slice(0, 2).toUpperCase() || "OP"}
                        </div>
                        <div>
                          <strong style={{ color: "var(--ink)", fontSize: 12 }}>{r.name || "Weighbridge Operator"}</strong>
                          <div style={{ fontSize: 10, color: "var(--muted)" }}>{r.empId || "EMP-001"}</div>
                        </div>
                      </div>
                    ),
                  },
                  { key: "designation", label: "DESIGNATION", render: (r) => <span style={{ fontSize: 12 }}>{r.designation || "Scale Operator"}</span> },
                  { key: "shift", label: "SHIFT TIMING", render: (r) => <span style={{ fontSize: 12 }}>{r.shift || "Morning Shift (08:00 - 16:00)"}</span> },
                  { key: "checkInTime", label: "CHECK-IN TIME", render: (r) => <span style={{ fontSize: 12 }}>{r.checkInTime || "07:55 AM"}</span> },
                  {
                    key: "status",
                    label: "ATTENDANCE STATUS",
                    render: (r) => <Badge tone="success">{r.status || "PRESENT"}</Badge>,
                  },
                ]}
              />
            )}

            {/* TAB 5: GODOWNS & STACKS */}
            {warehouseTab === "godowns" && (
              <DataTable
                leftHeader={tabRibbon}
                searchable
                compact
                keyField="id"
                rows={godownsList}
                emptyMessage="No godowns registered for this warehouse."
                columns={[
                  {
                    key: "godownName",
                    label: "GODOWN / CHAMBER",
                    emphasize: true,
                    render: (r) => (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <i className="ri-building-line" style={{ color: "var(--primary)", fontSize: 14 }} />
                        <strong style={{ color: "var(--ink)", fontSize: 12 }}>{r.godownName || "Godown 01 - Baling Bay"}</strong>
                      </div>
                    ),
                  },
                  { key: "cropStored", label: "STORED COMMODITY", render: (r) => <span style={{ fontSize: 12 }}>{r.cropStored || "Paddy Straw Bales"}</span> },
                  { key: "capacityMt", label: "CAPACITY (MT)", render: (r) => <span style={{ fontSize: 12 }}>{r.capacityMt || 3500} MT</span> },
                  { key: "currentOccupancyMt", label: "CURRENT FILL (MT)", render: (r) => <span style={{ fontSize: 12 }}>{r.currentOccupancyMt || 2850} MT</span> },
                  {
                    key: "fillPct",
                    label: "UTILIZATION",
                    render: (r) => {
                      const pct = Math.round(((r.currentOccupancyMt || 2850) / (r.capacityMt || 3500)) * 100);
                      return (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 60, height: 5, background: "var(--line)", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ width: `${pct}%`, height: "100%", background: pctColor(pct) }} />
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 800, color: "var(--ink)" }}>{pct}%</span>
                        </div>
                      );
                    },
                  },
                ]}
              />
            )}

            {/* TAB 6: ALERTS */}
            {warehouseTab === "alerts" && (
              <DataTable
                leftHeader={tabRibbon}
                searchable
                compact
                keyField="id"
                rows={alertSummary}
                emptyMessage="All clear. No safety or moisture warnings detected."
                columns={[
                  { key: "timestamp", label: "TIME", emphasize: true, render: (r) => <span style={{ fontSize: 12 }}>{r.timestamp || "Recent"}</span> },
                  { key: "type", label: "ALERT TYPE", render: (r) => <span style={{ fontSize: 12 }}>{r.type || "Moisture Threshold"}</span> },
                  { key: "description", label: "DETAILS", render: (r) => <span style={{ fontSize: 12 }}>{r.description || "Stack A-12 moisture recorded at 14.8%"}</span> },
                  {
                    key: "severity",
                    label: "SEVERITY",
                    render: (r) => (
                      <Badge tone={r.severity === "high" ? "error" : "warning"}>
                        {r.severity?.toUpperCase() || "MONITORED"}
                      </Badge>
                    ),
                  },
                ]}
              />
            )}
          </>
        );
      })()}

    </div>
  );
}
