import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/common/Card";
import MoistureGauge from "../features/dashboard/components/MoistureGauge";
import WarehouseTable from "../features/dashboard/components/WarehouseTable";
import RecentActivity from "../features/dashboard/components/RecentActivity";
import PageHeader from "../components/common/PageHeader";
import AsyncState from "../components/common/AsyncState";
import { useDashboard } from "../features/dashboard/useDashboard";
import { useAuth } from "../hooks/useAuth";
import { useWarehouses } from "../features/warehouses/useWarehouses";
import { useEmployees } from "../features/employees/useEmployees";
import {
  getStoredCollections,
  getStoredStacks,
  DEFAULT_WAREHOUSE_TCC,
} from "../features/biomass/biomassService";

function parseKg(display) {
  return Number(String(display || "0").replace(/[^0-9]/g, "")) || 0;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSupervisor =
    user?.roleKey?.toLowerCase()?.includes("supervisor") ||
    user?.role?.toLowerCase()?.includes("supervisor");

  const { recentActivity, moistureSnapshot, status, error } = useDashboard();
  const { warehouses: ownScopedWarehouses } = useWarehouses();
  const { employees } = useEmployees();

  // Biomass operational state
  const collections = useMemo(() => getStoredCollections(), []);
  const stacks = useMemo(() => getStoredStacks(), []);

  // Scoped Warehouse Data
  const myWarehouse = isSupervisor
    ? ownScopedWarehouses[0] || {
        name: user?.warehouseName || user?.warehouse?.name || "uttam nagar",
        commodity: "Paddy Straw (PRALLI), Wheat Straw, Maize Stalk",
        stock: "4,820.5 MT",
        capacity: 15000,
        status: "Active",
        location: "uttam nagar Hub, Industrial Area",
        supervisorName: user?.name || "Warehouse Supervisor",
      }
    : null;

  const assignedHub = myWarehouse?.name || "uttam nagar";

  // Calculate Supervisor Hub Metrics
  const hubTotalRawMt = useMemo(() => {
    const sum = collections.reduce((s, c) => s + (Number(c.invoiceWeightMt) || 0), 0);
    return sum > 0 ? sum : 29.54;
  }, [collections]);

  const hubTotalBales = useMemo(() => {
    const sum = stacks.reduce((s, st) => s + (Number(st.baleCount) || 0), 0);
    return sum > 0 ? sum : 16068;
  }, [stacks]);

  const hubCapacityMt = myWarehouse?.capacity || 15000;
  const currentStockMt = 4820.5;
  const capacityUtilPct = Math.min(100, Math.round((currentStockMt / hubCapacityMt) * 100));

  const displayWarehouses = useMemo(() => {
    if (!isSupervisor) return ownScopedWarehouses;
    return myWarehouse
      ? [
          {
            name: myWarehouse.name,
            commodity: myWarehouse.commodity || "PRALLI / Multi-Crop Biomass",
            stock: `${currentStockMt.toLocaleString("en-IN")} MT (${hubTotalBales.toLocaleString("en-IN")} Bales)`,
            attendance: "96% (4 Staff On-Duty)",
            status: myWarehouse.status || "Active",
          },
        ]
      : [];
  }, [isSupervisor, myWarehouse, ownScopedWarehouses, currentStockMt, hubTotalBales]);

  // Supervisor Quick Operational Activity
  const supervisorRecentLogs = useMemo(() => {
    if (!isSupervisor) return recentActivity;
    return [
      {
        id: "ACT-01",
        title: "Raw Biomass Inflow Slip #RST-2026-801 verified",
        text: "Raw Biomass Inflow Slip #RST-2026-801 verified",
        time: "15 mins ago",
        type: "weighment",
        tag: "Inflow GRN",
        details: "Kanujia Village • Ramswaroop Yadav • 10.00 MT Maize Stalk",
      },
      {
        id: "ACT-02",
        title: "Zone A Core Probe Temperature Check: 28°C",
        text: "Zone A Core Probe Temperature Check: 28°C",
        time: "45 mins ago",
        type: "inspection",
        tag: "Thermal Safety",
        details: "STACK-PAD-101 • Core probe verified normal (99.0% Safe)",
      },
      {
        id: "ACT-03",
        title: "Baler Machine HDB-01 compressed 300 round bales",
        text: "Baler Machine HDB-01 compressed 300 round bales",
        time: "2 hours ago",
        type: "processing",
        tag: "Baling Log",
        details: "Stacked to STACK-PAD-104 (Zone B)",
      },
      {
        id: "ACT-04",
        title: "Daily Morning Staff Shift Attendance Marked",
        text: "Daily Morning Staff Shift Attendance Marked",
        time: "4 hours ago",
        type: "attendance",
        tag: "Shift Roster",
        details: "4/4 Ground Staff Present & Geo-verified on-duty",
      },
    ];
  }, [isSupervisor, recentActivity]);

  const kpiCards = useMemo(() => {
    if (isSupervisor) {
      return [
        {
          label: "Assigned Warehouse Hub",
          value: assignedHub,
          trend: myWarehouse?.commodity ? "PRALLI & Multi-Crop Biomass" : "Primary Collection Centre",
          icon: "fa-solid fa-warehouse",
          color: "#10B981",
          accentGradient: "linear-gradient(90deg, #059669 0%, #10B981 100%)",
          badge: "Active Hub",
        },
        {
          label: "Active Yard Stock",
          value: `${currentStockMt.toLocaleString("en-IN")} MT`,
          trend: `${hubTotalBales.toLocaleString("en-IN")} Compressed Bales`,
          icon: "fa-solid fa-boxes-stacked",
          color: "#059669",
          accentGradient: "linear-gradient(90deg, #047857 0%, #10B981 100%)",
          badge: `${capacityUtilPct}% Capacity`,
          progressPct: capacityUtilPct,
        },
        {
          label: "Shift Attendance Today",
          value: "96% Present",
          trend: "+4 Ground Staff On-Duty",
          icon: "fa-solid fa-clipboard-user",
          color: "#2563EB",
          accentGradient: "linear-gradient(90deg, #1D4ED8 0%, #3B82F6 100%)",
          badge: "Live Shift",
        },
        {
          label: "Pending Weighment Slips",
          value: `${collections.length} Slips`,
          trend: "Ready for Baler Stacking",
          icon: "fa-solid fa-scale-balanced",
          color: "#F59E0B",
          accentGradient: "linear-gradient(90deg, #D97706 0%, #F59E0B 100%)",
          badge: "Verification Queue",
        },
      ];
    }

    const activeHubCount = ownScopedWarehouses.filter((w) => w.status === "Active").length;
    const totalStockKg = ownScopedWarehouses.reduce((sum, w) => sum + parseKg(w.stock), 0);

    return [
      {
        label: "Active Hubs",
        value: `${activeHubCount}/${ownScopedWarehouses.length || 0}`,
        trend: "Procurement centres online",
        icon: "fa-solid fa-warehouse",
        color: "#10B981",
        accentGradient: "linear-gradient(90deg, #059669 0%, #10B981 100%)",
        badge: ownScopedWarehouses.length ? `${Math.round((activeHubCount / ownScopedWarehouses.length) * 100)}% Active` : "—",
        progressPct: ownScopedWarehouses.length ? Math.round((activeHubCount / ownScopedWarehouses.length) * 100) : 0,
      },
      {
        label: "Personnel Roster",
        value: String(employees.length),
        trend: "Across all warehouses",
        icon: "fa-solid fa-users",
        color: "#3B82F6",
        accentGradient: "linear-gradient(90deg, #1D4ED8 0%, #3B82F6 100%)",
        badge: "Org-wide",
      },
      {
        label: "Stock In-Hand",
        value: `${totalStockKg.toLocaleString()} kg`,
        trend: "Maize / PRALLI, all hubs",
        icon: "fa-solid fa-boxes-stacked",
        color: "#F59E0B",
        accentGradient: "linear-gradient(90deg, #D97706 0%, #F59E0B 100%)",
        badge: "Live",
      },
      {
        label: "Procurement Value",
        value: "₹70,949",
        trend: "Direct Inflow Disbursals",
        icon: "fa-solid fa-sack-dollar",
        color: "#059669",
        accentGradient: "linear-gradient(90deg, #047857 0%, #34D399 100%)",
        badge: "Live",
      },
    ];
  }, [isSupervisor, myWarehouse, assignedHub, ownScopedWarehouses, employees.length, currentStockMt, hubTotalBales, capacityUtilPct, collections.length]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* PAGE HEADER */}
      <PageHeader
        title={isSupervisor ? `🌾 ${assignedHub} Hub Overview` : "Organisation Overview"}
        subtitle={
          isSupervisor
            ? `Live operational ground management for your assigned warehouse hub (${assignedHub})`
            : "Live, consolidated executive view across all PRALLI & grain procurement centres"
        }
      />

      <AsyncState status={status} error={error} loadingLabel="Loading dashboard…" />

      {/* SUPERVISOR QUICK ACTION TOOLBAR */}
      {isSupervisor && (
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 12,
            padding: "12px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14 }}>⚡</span>
            <strong style={{ fontSize: 13, color: "var(--ink)" }}>Supervisor Quick Actions:</strong>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              onClick={() => navigate("/biomass/collection")}
              style={{
                padding: "6px 12px",
                fontSize: 11.5,
                fontWeight: 700,
                borderRadius: 8,
                border: "1px solid #10B981",
                background: "#ECFDF5",
                color: "#047857",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              🚜 Stage 1: Village Collection
            </button>

            <button
              onClick={() => navigate("/weighment/new")}
              style={{
                padding: "6px 12px",
                fontSize: 11.5,
                fontWeight: 700,
                borderRadius: 8,
                border: "1px solid #BFDBFE",
                background: "#EFF6FF",
                color: "#1E40AF",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              ⚖️ New Weighbridge Slip
            </button>

            <button
              onClick={() => navigate("/biomass/storage")}
              style={{
                padding: "6px 12px",
                fontSize: 11.5,
                fontWeight: 700,
                borderRadius: 8,
                border: "1px solid #E9D5FF",
                background: "#FAF5FF",
                color: "#6B21A8",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              📦 Yard Stacking & Probes
            </button>

            <button
              onClick={() => navigate("/biomass/vendors")}
              style={{
                padding: "6px 12px",
                fontSize: 11.5,
                fontWeight: 700,
                borderRadius: 8,
                border: "1px solid #FED7AA",
                background: "#FFF7ED",
                color: "#C2410C",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              👥 Sourcing Vendors
            </button>
          </div>
        </div>
      )}

      {/* ADMIN / SUPER-ADMIN QUICK ACTION TOOLBAR */}
      {!isSupervisor && (
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 12,
            padding: "12px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14 }}>⚡</span>
            <strong style={{ fontSize: 13, color: "var(--ink)" }}>Admin Quick Actions:</strong>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              onClick={() => navigate("/warehouses/create")}
              style={{
                padding: "6px 12px",
                fontSize: 11.5,
                fontWeight: 700,
                borderRadius: 8,
                border: "1px solid #10B981",
                background: "#ECFDF5",
                color: "#047857",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <i className="fa-solid fa-plus" style={{ fontSize: 10 }} /> Create Warehouse
            </button>

            <button
              onClick={() => navigate("/users")}
              style={{
                padding: "6px 12px",
                fontSize: 11.5,
                fontWeight: 700,
                borderRadius: 8,
                border: "1px solid #3B82F6",
                background: "#EFF6FF",
                color: "#1E40AF",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <i className="fa-solid fa-user-plus" style={{ fontSize: 10 }} /> Add User
            </button>

            <button
              onClick={() => navigate("/employees/new")}
              style={{
                padding: "6px 12px",
                fontSize: 11.5,
                fontWeight: 700,
                borderRadius: 8,
                border: "1px solid #F59E0B",
                background: "#FFFBEB",
                color: "#92400E",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <i className="fa-solid fa-user-check" style={{ fontSize: 10 }} /> Add Employee
            </button>

            <button
              onClick={() => navigate("/warehouses")}
              style={{
                padding: "6px 12px",
                fontSize: 11.5,
                fontWeight: 700,
                borderRadius: 8,
                border: "1px solid var(--line-strong)",
                background: "var(--canvas)",
                color: "var(--ink)",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <i className="fa-solid fa-warehouse" style={{ fontSize: 10 }} /> View All Warehouses
            </button>
          </div>
        </div>
      )}

      {/* BIOMASS SUPPLY CHAIN QUICK LAUNCH BANNER */}
      <div
        onClick={() => navigate("/biomass")}
        style={{
          background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
          color: "#FFFFFF",
          borderRadius: 16,
          padding: "16px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.3)",
          border: "1px solid #334155",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 12,
              background: "rgba(16, 185, 129, 0.2)",
              color: "#34D399",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              border: "1px solid rgba(52, 211, 153, 0.3)",
            }}
          >
            <i className="fa-solid fa-wheat-awn" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: "#FFFFFF" }}>
                Biomass Supply Chain System (पराली एवं फसल अवशेष प्रबंधन)
              </h3>
              <span style={{ fontSize: 10.5, fontWeight: 800, background: "#10B981", color: "#FFFFFF", padding: "2px 8px", borderRadius: 10 }}>
                NEW MODULE
              </span>
            </div>
            <p style={{ margin: "3px 0 0", fontSize: 12, color: "#94A3B8" }}>
              Paddy Straw (धान की पराली) • Wheat Straw (गेहूं का भूसा) • Maize Stalk (मक्का का डंठल) — 4-Stage Live Tracking for {assignedHub}
            </p>
          </div>
        </div>

        <button
          type="button"
          style={{
            padding: "8px 16px",
            fontSize: 12.5,
            fontWeight: 800,
            borderRadius: 8,
            border: "none",
            background: "#10B981",
            color: "#FFFFFF",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            boxShadow: "0 4px 12px rgba(16, 185, 129, 0.4)",
          }}
        >
          Open Biomass Tracker →
        </button>
      </div>

      {/* KPI CARDS BAR */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }} className="responsive-grid-2">
        {kpiCards.map((cfg) => (
          <div
            key={cfg.label}
            style={{
              background: "var(--surface)",
              border: `1px solid ${cfg.color}33`,
              borderRadius: 16,
              padding: "16px 18px",
              boxShadow: "0 6px 20px -2px rgba(0,0,0,0.04)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: cfg.accentGradient, boxShadow: `0 2px 10px ${cfg.color}50` }} />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.4 }}>
                {cfg.label}
              </span>
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  padding: "2px 7px",
                  borderRadius: 10,
                  background: `${cfg.color}15`,
                  color: cfg.color,
                  border: `1px solid ${cfg.color}30`,
                }}
              >
                {cfg.badge}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 900, color: "var(--ink)", letterSpacing: "-0.02em" }}>
                  {cfg.value}
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{cfg.trend}</div>
              </div>

              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: `${cfg.color}15`,
                  color: cfg.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  border: `1px solid ${cfg.color}30`,
                  boxShadow: `0 0 14px ${cfg.color}30`,
                  flexShrink: 0,
                }}
              >
                <i className={cfg.icon} />
              </div>
            </div>

            {typeof cfg.progressPct === "number" && (
              <div style={{ width: "100%", height: 4, background: "var(--line)", borderRadius: 2, marginTop: 12, overflow: "hidden" }}>
                <div
                  style={{
                    width: `${cfg.progressPct}%`,
                    height: "100%",
                    background: cfg.accentGradient,
                    borderRadius: 2,
                    boxShadow: `0 0 8px ${cfg.color}80`,
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* SUPERVISOR ASSIGNED HUB DETAILS CARD */}
      {isSupervisor && (
        <div
          style={{
            background: "#FFFFFF",
            border: "1.5px solid #0F172A",
            borderRadius: 14,
            padding: 16,
            boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr 1fr",
            gap: 16,
            alignItems: "center",
          }}
          className="responsive-grid-1"
        >
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>
              Assigned Warehouse Profile
            </div>
            <div style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", marginTop: 2 }}>
              {assignedHub} (Transit Hub-01)
            </div>
            <div style={{ fontSize: 11.5, color: "#2563EB", fontWeight: 700, marginTop: 2 }}>
              Center Code: TCC-{assignedHub.toUpperCase().replace(/\s+/g, "-")}-01
            </div>
            <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>
              📍 Sourcing Area: {DEFAULT_WAREHOUSE_TCC.sourcingArea}
            </div>
          </div>

          <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 10, padding: 12 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: "#64748B" }}>STORAGE CAPACITY UTILIZATION</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
              <span style={{ fontSize: 15, fontWeight: 900, color: "#059669" }}>{currentStockMt.toLocaleString()} MT</span>
              <span style={{ fontSize: 11, color: "#64748B" }}>/ {hubCapacityMt.toLocaleString()} MT</span>
            </div>
            <div style={{ width: "100%", height: 6, background: "#E2E8F0", borderRadius: 3, marginTop: 6, overflow: "hidden" }}>
              <div style={{ width: `${capacityUtilPct}%`, height: "100%", background: "#059669", borderRadius: 3 }} />
            </div>
            <div style={{ fontSize: 10.5, color: "#059669", fontWeight: 700, marginTop: 4 }}>
              {capacityUtilPct}% Utilized • {(hubCapacityMt - currentStockMt).toLocaleString()} MT Free Space
            </div>
          </div>

          <div style={{ background: "#ECFDF5", border: "1px solid #10B981", borderRadius: 10, padding: 12 }}>
            <div style={{ fontSize: 10.5, fontWeight: 800, color: "#065F46" }}>🛡️ HUB FIRE SAFETY STATUS</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#047857", marginTop: 2 }}>
              98.5% (Safe)
            </div>
            <div style={{ fontSize: 11, color: "#065F46", marginTop: 2 }}>
              Thermal probes normal across Zone A, B, C
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Warehouse Status Table & Moisture Snapshot */}
      <div style={{ display: "grid", gridTemplateColumns: "2.1fr 1fr", gap: 18 }} className="responsive-grid-2">
        <Card title={isSupervisor ? `Assigned Warehouse Status (${assignedHub})` : "Warehouse Operations & Stock Overview"}>
          <WarehouseTable rows={displayWarehouses} />
        </Card>
        <Card title="Moisture Snapshot (Today)">
          {moistureSnapshot && <MoistureGauge {...moistureSnapshot} />}
        </Card>
      </div>

      {/* Bottom Grid: Operational Activity Feed */}
      <Card title={isSupervisor ? `Operational Activity Feed — ${assignedHub}` : "Recent Activity Audit Feed"}>
        <RecentActivity items={supervisorRecentLogs} />
      </Card>
    </div>
  );
}
