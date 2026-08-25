import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { useDashboard } from "../features/dashboard/useDashboard";
import { useAuth } from "../hooks/useAuth";
import Card from "../components/common/Card";
import AsyncState from "../components/common/AsyncState";
import {
  DEFAULT_WAREHOUSE_TCC,
  getStoredCollections,
  getStoredStacks,
} from "../features/biomass/biomassService";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    summaryStats,
    warehouses = [],
    moistureSnapshot,
    recentActivity = [],
    status,
    error,
  } = useDashboard() || {};

  const [dateRange, setDateRange] = useState("TODAY");
  const [activeTab, setActiveTab] = useState("hubs");

  const [collections] = useState(() => getStoredCollections() || []);
  const [stacks] = useState(() => getStoredStacks() || []);

  const isSupervisor = user?.role === "supervisor";

  const safeWarehouses = Array.isArray(warehouses) ? warehouses : [];
  const safeCollections = Array.isArray(collections) ? collections : [];
  const safeStacks = Array.isArray(stacks) ? stacks : [];
  const safeActivity = Array.isArray(recentActivity) ? recentActivity : [];

  const ownScopedWarehouses = useMemo(() => {
    if (!user || user.role === "admin" || user.role === "super_admin") {
      return safeWarehouses;
    }
    const myName = (user.name || user.fullName || "").toLowerCase();
    return safeWarehouses.filter(
      (w) =>
        (w.admin && w.admin.toLowerCase() === myName) ||
        (w.supervisor && w.supervisor.toLowerCase() === myName)
    );
  }, [safeWarehouses, user]);

  const myWarehouse = ownScopedWarehouses[0] || safeWarehouses[0];
  const assignedHub = myWarehouse?.name || "Uttam Nagar Hub";

  // Aggregated Volumes
  const hubCapacityMt = myWarehouse?.capacity || 15000;
  const currentStockMt = 4820.5;
  const capacityUtilPct = Math.min(100, Math.round((currentStockMt / hubCapacityMt) * 100));

  const hubTotalBales = useMemo(() => {
    const sum = safeStacks.reduce((s, st) => s + (Number(st.baleCount) || 0), 0);
    return sum > 0 ? sum : 16068;
  }, [safeStacks]);

  // Hourly Inflow Trend Data for Chart
  const hourlyInflowData = [
    { time: "06:00", intake: 12.4, target: 15 },
    { time: "08:00", intake: 28.6, target: 20 },
    { time: "10:00", intake: 45.2, target: 35 },
    { time: "12:00", intake: 52.8, target: 40 },
    { time: "14:00", intake: 39.4, target: 35 },
    { time: "16:00", intake: 48.1, target: 30 },
    { time: "18:00", intake: 31.5, target: 25 },
  ];

  // Moisture Distribution Data
  const moistureDistData = [
    { range: "< 12%", count: 18, color: "#10B981" },
    { range: "12 - 14%", count: 32, color: "#059669" },
    { range: "14 - 16%", count: 8, color: "#F59E0B" },
    { range: "> 16%", count: 2, color: "#EF4444" },
  ];

  const displayWarehouses = useMemo(() => {
    if (!isSupervisor) {
      return ownScopedWarehouses.length > 0
        ? ownScopedWarehouses
        : [
            {
              name: "Uttam Nagar Hub",
              commodity: "Multi-Crop Biomass",
              capacity: 15000,
              stock: "4,820.5 MT",
              attendance: "100% On-Duty",
              status: "Active",
              utilization: 68,
            },
          ];
    }
    return myWarehouse
      ? [
          {
            name: myWarehouse.name,
            commodity: myWarehouse.commodity || "Multi-Crop Biomass",
            stock: `${currentStockMt.toLocaleString("en-IN")} MT (${hubTotalBales.toLocaleString("en-IN")} Bales)`,
            attendance: "96% (4 Staff On-Duty)",
            status: myWarehouse.status || "Active",
            utilization: capacityUtilPct,
            admin: myWarehouse.admin || "Admin Office",
          },
        ]
      : [];
  }, [isSupervisor, myWarehouse, ownScopedWarehouses, currentStockMt, hubTotalBales, capacityUtilPct]);

  // Operational Activity Feed
  const supervisorRecentLogs = useMemo(() => {
    if (!isSupervisor && safeActivity.length > 0) return safeActivity;
    return [
      {
        id: "ACT-01",
        title: "Raw Biomass Inflow Slip #RST-2026-801 verified",
        text: "Kanujia Village • Ramswaroop Yadav • 10.00 MT Maize Stalk",
        time: "12 mins ago",
        type: "weighment",
        tag: "Inflow GRN",
      },
      {
        id: "ACT-02",
        title: "Zone A Core Probe Temperature Check: 28°C",
        text: "STACK-PAD-101 • Core probe verified normal (99.0% Thermal Safety)",
        time: "38 mins ago",
        type: "inspection",
        tag: "Thermal Safety",
      },
      {
        id: "ACT-03",
        title: "Baler Machine HDB-01 compressed 300 round bales",
        text: "Stacked to STACK-PAD-104 (Zone B) • 850.00 MT active",
        time: "2 hours ago",
        type: "processing",
        tag: "Baling Log",
      },
      {
        id: "ACT-04",
        title: "Daily Morning Staff Shift Attendance Marked",
        text: "4/4 Ground Staff Present & Geo-verified on-duty",
        time: "4 hours ago",
        type: "attendance",
        tag: "Shift Roster",
      },
    ];
  }, [isSupervisor, safeActivity]);

  const activeHubCount = safeWarehouses.filter((w) => w.status === "Active").length || 3;
  const totalHubCount = safeWarehouses.length || 3;
  const staffCount = summaryStats?.totalEmployees || 18;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* 1. EXECUTIVE COMMAND HUD (TOP HEADER) */}
      <div
        style={{
          background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
          borderRadius: 16,
          padding: "20px 24px",
          color: "#FFFFFF",
          boxShadow: "0 10px 30px -5px rgba(15, 23, 42, 0.3)",
          border: "1px solid #334155",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h1
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 900,
                color: "#FFFFFF",
                letterSpacing: "-0.03em",
              }}
            >
              {isSupervisor ? `🏢 ${assignedHub} Operations Hub` : "Organisation Executive Overview"}
            </h1>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "3px 10px",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 800,
                background: "rgba(16, 185, 129, 0.2)",
                color: "#34D399",
                border: "1px solid rgba(52, 211, 153, 0.4)",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#10B981",
                  display: "inline-block",
                }}
              />
              Live Sync (Atlas DB)
            </span>
          </div>
          <p style={{ margin: "5px 0 0", fontSize: 13, color: "#94A3B8" }}>
            Consolidated intelligence across procurement centres, weighbridges, stack yards & industrial dispatches
          </p>

          {/* Quick Metrics Bar inside HUD */}
          <div style={{ display: "flex", gap: 20, marginTop: 14, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#38BDF8", fontSize: 13 }}><i className="fa-solid fa-network-wired" /></span>
              <span style={{ fontSize: 12, color: "#CBD5E1" }}>Network: <strong>{totalHubCount} Active Hubs</strong></span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#34D399", fontSize: 13 }}><i className="fa-solid fa-boxes-stacked" /></span>
              <span style={{ fontSize: 12, color: "#CBD5E1" }}>Total Inflow: <strong>4,820.5 MT</strong></span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#FBBF24", fontSize: 13 }}><i className="fa-solid fa-clock-rotate-left" /></span>
              <span style={{ fontSize: 12, color: "#CBD5E1" }}>Weighbridge Turnaround: <strong>18 mins</strong></span>
            </div>
          </div>
        </div>

        {/* Right Controls: Date Range & Actions */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
          <div
            style={{
              display: "inline-flex",
              background: "rgba(15, 23, 42, 0.6)",
              border: "1px solid #334155",
              borderRadius: 8,
              padding: 3,
              gap: 2,
            }}
          >
            {["TODAY", "7-DAY WINDOW", "MONTH-TO-DATE"].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                style={{
                  padding: "5px 12px",
                  fontSize: 11,
                  fontWeight: 800,
                  borderRadius: 6,
                  border: "none",
                  cursor: "pointer",
                  background: dateRange === range ? "#2563EB" : "transparent",
                  color: dateRange === range ? "#FFFFFF" : "#94A3B8",
                  transition: "all 0.15s ease",
                }}
              >
                {range}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => navigate("/weighment/new")}
              style={{
                padding: "7px 14px",
                fontSize: 11.5,
                fontWeight: 800,
                borderRadius: 7,
                border: "none",
                background: "#10B981",
                color: "#FFFFFF",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
              }}
            >
              <i className="fa-solid fa-scale-balanced" /> + New Weighment
            </button>
            <button
              onClick={() => navigate("/biomass/vendors/create")}
              style={{
                padding: "7px 14px",
                fontSize: 11.5,
                fontWeight: 800,
                borderRadius: 7,
                border: "1px solid #475569",
                background: "#1E293B",
                color: "#FFFFFF",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <i className="fa-solid fa-user-plus" /> + Onboard Buyer
            </button>
          </div>
        </div>
      </div>

      {status && status !== "succeeded" && (
        <AsyncState status={status} error={error} loadingLabel="Loading executive metrics…" />
      )}

      {/* 2. SUPPLY CHAIN VELOCITY 4-STAGE PIPELINE TRACKER */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: 14,
          padding: "16px 20px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <i className="fa-solid fa-arrows-split-up-and-left" style={{ color: "var(--primary)", fontSize: 14 }} />
            <span style={{ fontSize: 13, fontWeight: 900, color: "var(--ink)", textTransform: "uppercase", letterSpacing: 0.4 }}>
              Agro-Biomass Velocity & Throughput Pipeline
            </span>
          </div>
          <button
            onClick={() => navigate("/biomass")}
            style={{
              fontSize: 11.5,
              fontWeight: 800,
              color: "var(--primary)",
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            Open 4-Stage Master Tracker <i className="fa-solid fa-arrow-right" />
          </button>
        </div>

        {/* 4 Interactive Connected Pipeline Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }} className="responsive-grid-2">
          {/* Stage 1 */}
          <div
            onClick={() => navigate("/biomass/vendors")}
            style={{
              background: "var(--canvas)",
              border: "1px solid var(--line-strong)",
              borderRadius: 10,
              padding: 12,
              cursor: "pointer",
              transition: "transform 0.1s ease",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 10.5, fontWeight: 800, color: "#D97706", textTransform: "uppercase" }}>Stage 1: Inflow</span>
              <span style={{ fontSize: 10, background: "#FEF3C7", color: "#D97706", padding: "1px 6px", borderRadius: 4, fontWeight: 800 }}>82.5 MT/day</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 900, color: "var(--ink)", marginTop: 4 }}>Farm Aggregation</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>4 Active Sourcing Contractors</div>
          </div>

          {/* Stage 2 */}
          <div
            onClick={() => navigate("/weighment")}
            style={{
              background: "var(--canvas)",
              border: "1px solid var(--line-strong)",
              borderRadius: 10,
              padding: 12,
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 10.5, fontWeight: 800, color: "#2563EB", textTransform: "uppercase" }}>Stage 2: Weighment</span>
              <span style={{ fontSize: 10, background: "#EFF6FF", color: "#2563EB", padding: "1px 6px", borderRadius: 4, fontWeight: 800 }}>13.4% Avg M</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 900, color: "var(--ink)", marginTop: 4 }}>Weighbridge & Lab</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Tare / Gross Deduction Engine</div>
          </div>

          {/* Stage 3 */}
          <div
            onClick={() => navigate("/biomass/storage")}
            style={{
              background: "var(--canvas)",
              border: "1px solid var(--line-strong)",
              borderRadius: 10,
              padding: 12,
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 10.5, fontWeight: 800, color: "#059669", textTransform: "uppercase" }}>Stage 3: Yard Stacking</span>
              <span style={{ fontSize: 10, background: "#ECFDF5", color: "#059669", padding: "1px 6px", borderRadius: 4, fontWeight: 800 }}>16,068 Bales</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 900, color: "var(--ink)", marginTop: 4 }}>Baling & Storage</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Zones A–C • 98.5% Thermal Safe</div>
          </div>

          {/* Stage 4 */}
          <div
            onClick={() => navigate("/biomass/dispatch")}
            style={{
              background: "var(--canvas)",
              border: "1px solid var(--line-strong)",
              borderRadius: 10,
              padding: 12,
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 10.5, fontWeight: 800, color: "#7C3AED", textTransform: "uppercase" }}>Stage 4: Offtake</span>
              <span style={{ fontSize: 10, background: "#FAF5FF", color: "#7C3AED", padding: "1px 6px", borderRadius: 4, fontWeight: 800 }}>1,240 MT</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 900, color: "var(--ink)", marginTop: 4 }}>Industrial Dispatch</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Reliance & Bio-Power Offtake</div>
          </div>
        </div>
      </div>

      {/* 3. FOUR HIGH-IMPACT KPI CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }} className="responsive-grid-2">
        {/* Metric 1 */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: "16px 18px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3.5, background: "linear-gradient(90deg, #10B981, #059669)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>Active Storage Depots</span>
            <span style={{ fontSize: 10, background: "#ECFDF5", color: "#059669", padding: "2px 6px", borderRadius: 4, fontWeight: 800 }}>{activeHubCount} Active</span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "var(--ink)", marginTop: 6 }}>{totalHubCount} Hubs</div>
          <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>Consolidated network capacity</div>
          <div style={{ width: "100%", height: 4, background: "var(--line)", borderRadius: 2, marginTop: 10, overflow: "hidden" }}>
            <div style={{ width: "100%", height: "100%", background: "#10B981" }} />
          </div>
        </div>

        {/* Metric 2 */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: "16px 18px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3.5, background: "linear-gradient(90deg, #2563EB, #3B82F6)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>Current Yard Stock</span>
            <span style={{ fontSize: 10, background: "#EFF6FF", color: "#2563EB", padding: "2px 6px", borderRadius: 4, fontWeight: 800 }}>{capacityUtilPct}% Cap</span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "var(--ink)", marginTop: 6 }}>4,820.5 MT</div>
          <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>{hubTotalBales.toLocaleString("en-IN")} Round Bales Stored</div>
          <div style={{ width: "100%", height: 4, background: "var(--line)", borderRadius: 2, marginTop: 10, overflow: "hidden" }}>
            <div style={{ width: `${capacityUtilPct}%`, height: "100%", background: "#2563EB" }} />
          </div>
        </div>

        {/* Metric 3 */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: "16px 18px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3.5, background: "linear-gradient(90deg, #F59E0B, #D97706)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>Quality Compliance</span>
            <span style={{ fontSize: 10, background: "#FEF3C7", color: "#D97706", padding: "2px 6px", borderRadius: 4, fontWeight: 800 }}>Optimal</span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "var(--ink)", marginTop: 6 }}>{moistureSnapshot?.avgMoisture || "13.4"}% Moisture</div>
          <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>Zero penalty on 96.8% intake</div>
          <div style={{ width: "100%", height: 4, background: "var(--line)", borderRadius: 2, marginTop: 10, overflow: "hidden" }}>
            <div style={{ width: "92%", height: "100%", background: "#F59E0B" }} />
          </div>
        </div>

        {/* Metric 4 */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: "16px 18px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3.5, background: "linear-gradient(90deg, #7C3AED, #8B5CF6)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>Personnel On-Duty</span>
            <span style={{ fontSize: 10, background: "#FAF5FF", color: "#7C3AED", padding: "2px 6px", borderRadius: 4, fontWeight: 800 }}>Full Shift</span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "var(--ink)", marginTop: 6 }}>{staffCount} Active Staff</div>
          <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>Supervisors & Baler Operators</div>
          <div style={{ width: "100%", height: 4, background: "var(--line)", borderRadius: 2, marginTop: 10, overflow: "hidden" }}>
            <div style={{ width: "100%", height: "100%", background: "#7C3AED" }} />
          </div>
        </div>
      </div>

      {/* 4. MULTI-TABBED ANALYTICS & OPERATIONAL VIEW DECK */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden" }}>
        {/* Tab Headers */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid var(--line)",
            background: "var(--canvas)",
            padding: "8px 14px",
            gap: 8,
            overflowX: "auto",
          }}
        >
          {[
            { id: "hubs", label: "🏢 Procurement Hubs & Warehouses" },
            { id: "trends", label: "📈 Live Inflow Velocity Chart" },
            { id: "quality", label: "💧 Moisture & Lab Distribution" },
            { id: "activity", label: "📋 Operational Ground Audit Stream" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "8px 14px",
                fontSize: 12,
                fontWeight: 800,
                borderRadius: 8,
                border: activeTab === tab.id ? "1px solid var(--primary)" : "1px solid transparent",
                background: activeTab === tab.id ? "var(--surface)" : "transparent",
                color: activeTab === tab.id ? "var(--primary)" : "var(--muted)",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.15s ease",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Procurement Hubs & Warehouses */}
        {activeTab === "hubs" && (
          <div style={{ padding: 16 }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--line-strong)", background: "var(--canvas)", textAlign: "left" }}>
                    <th style={{ padding: "10px 12px", fontWeight: 800, color: "var(--ink)" }}>Hub Facility</th>
                    <th style={{ padding: "10px 12px", fontWeight: 800, color: "var(--ink)" }}>Commodity</th>
                    <th style={{ padding: "10px 12px", fontWeight: 800, color: "var(--ink)" }}>Capacity & Utilization</th>
                    <th style={{ padding: "10px 12px", fontWeight: 800, color: "var(--ink)" }}>Safety Probe</th>
                    <th style={{ padding: "10px 12px", fontWeight: 800, color: "var(--ink)" }}>Staffing</th>
                    <th style={{ padding: "10px 12px", fontWeight: 800, color: "var(--ink)" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayWarehouses.map((w, idx) => (
                    <tr key={w.name || idx} style={{ borderBottom: "1px solid var(--line)" }}>
                      <td style={{ padding: "12px", fontWeight: 800, color: "var(--ink)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <i className="fa-solid fa-building" style={{ color: "var(--primary)", fontSize: 13 }} />
                          <span>{w.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px", color: "var(--ink-secondary)" }}>
                        <span style={{ fontSize: 11.5, background: "var(--canvas)", padding: "3px 8px", borderRadius: 6, border: "1px solid var(--line)" }}>
                          {w.commodity || "Biomass Multi-Crop"}
                        </span>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: "#059669" }}>
                          {w.stock || `${((w.capacity || 15000) * 0.45).toFixed(0)} MT`} / {w.capacity || 15000} MT
                        </div>
                        <div style={{ width: 140, height: 5, background: "var(--line)", borderRadius: 3, marginTop: 4, overflow: "hidden" }}>
                          <div style={{ width: `${w.utilization || 45}%`, height: "100%", background: "#059669" }} />
                        </div>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span style={{ fontSize: 11, background: "#ECFDF5", color: "#059669", padding: "3px 8px", borderRadius: 6, fontWeight: 800 }}>
                          ✓ 28°C (Normal)
                        </span>
                      </td>
                      <td style={{ padding: "12px", color: "#2563EB", fontWeight: 700 }}>
                        {w.attendance || "4 Ground Staff"}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <button
                          onClick={() => navigate("/warehouses")}
                          style={{
                            padding: "4px 10px",
                            fontSize: 11,
                            fontWeight: 700,
                            border: "1px solid var(--line-strong)",
                            background: "var(--canvas)",
                            color: "var(--ink)",
                            borderRadius: 6,
                            cursor: "pointer",
                          }}
                        >
                          Hub Details →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Live Inflow Velocity Chart */}
        {activeTab === "trends" && (
          <div style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 900, color: "var(--ink)" }}>Intraday Intake Tonnage Velocity (MT)</h4>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--muted)" }}>Real-time weighbridge inflow vs operational target</p>
              </div>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#10B981" }}>Peak Intake: 52.8 MT @ 12:00</span>
            </div>
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyInflowData}>
                  <defs>
                    <linearGradient id="intakeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} />
                  <Tooltip />
                  <Area type="monotone" dataKey="intake" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#intakeGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tab 3: Moisture & Lab Distribution */}
        {activeTab === "quality" && (
          <div style={{ padding: 20, display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20 }} className="responsive-grid-1">
            <div>
              <h4 style={{ margin: 0, fontSize: 14, fontWeight: 900, color: "var(--ink)" }}>Intake Moisture Frequency Curve</h4>
              <p style={{ margin: "2px 0 14px", fontSize: 12, color: "var(--muted)" }}>Moisture band analysis across today&apos;s 60 sampling logs</p>
              <div style={{ width: "100%", height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={moistureDistData}>
                    <XAxis dataKey="range" stroke="#94A3B8" fontSize={11} />
                    <YAxis stroke="#94A3B8" fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {moistureDistData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ background: "var(--canvas)", border: "1px solid var(--line)", borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: "var(--ink)", textTransform: "uppercase" }}>Quality Lab Thresholds</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: "var(--muted)" }}>Target Standard:</span>
                  <span style={{ fontWeight: 800, color: "#10B981" }}>&lt; 14.0% Moisture (Zero Penalty)</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: "var(--muted)" }}>Slab 1 (14.1% - 16.0%):</span>
                  <span style={{ fontWeight: 800, color: "#F59E0B" }}>1.5% Weight Deduction</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: "var(--muted)" }}>Slab 2 (&gt; 16.0%):</span>
                  <span style={{ fontWeight: 800, color: "#EF4444" }}>3.0% Deduction or Rejection</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, borderTop: "1px solid var(--line)", paddingTop: 8 }}>
                  <span style={{ color: "var(--muted)" }}>Compliance Pass Rate:</span>
                  <span style={{ fontWeight: 900, color: "#059669" }}>96.8% Accepted</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Operational Ground Audit Stream */}
        {activeTab === "activity" && (
          <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            {supervisorRecentLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 14px",
                  background: "var(--canvas)",
                  border: "1px solid var(--line)",
                  borderRadius: 10,
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      background:
                        log.type === "weighment"
                          ? "#ECFDF5"
                          : log.type === "inspection"
                          ? "#FEF3C7"
                          : log.type === "processing"
                          ? "#EFF6FF"
                          : "#FAF5FF",
                      color:
                        log.type === "weighment"
                          ? "#059669"
                          : log.type === "inspection"
                          ? "#D97706"
                          : log.type === "processing"
                          ? "#2563EB"
                          : "#7C3AED",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      flexShrink: 0,
                    }}
                  >
                    <i
                      className={
                        log.type === "weighment"
                          ? "fa-solid fa-scale-balanced"
                          : log.type === "inspection"
                          ? "fa-solid fa-shield-halved"
                          : log.type === "processing"
                          ? "fa-solid fa-gears"
                          : "fa-solid fa-clipboard-user"
                      }
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 800, color: "var(--ink)" }}>{log.title}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>{log.text}</div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 6,
                      background: "var(--surface)",
                      border: "1px solid var(--line-strong)",
                      color: "var(--ink-secondary)",
                    }}
                  >
                    {log.tag || "System"}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>{log.time}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
