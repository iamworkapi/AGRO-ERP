import { useMemo } from "react";
import Card from "../components/common/Card";
import MoistureGauge from "../components/dashboard/MoistureGauge";
import WarehouseTable from "../components/dashboard/WarehouseTable";
import RecentActivity from "../components/dashboard/RecentActivity";
import PageHeader from "../components/common/PageHeader";
import AsyncState from "../components/common/AsyncState";
import { useDashboard } from "../features/dashboard/useDashboard";
import { useAuth } from "../hooks/useAuth";
import { useWarehouses } from "../features/warehouses/useWarehouses";
import { useEmployees } from "../features/employees/useEmployees";

function parseKg(display) {
  return Number(String(display || "0").replace(/[^0-9]/g, "")) || 0;
}

export default function Dashboard() {
  const { user } = useAuth();
  const isSupervisor = user?.roleKey === "supervisor" || user?.role === "Supervisor";

  const { recentActivity, moistureSnapshot, status, error } = useDashboard();

  // GET /warehouses is already scoped server-side to the caller's own
  // warehouse for anyone below Super Admin (see warehouse.service.js
  // listWarehouses) - real, ID-based scoping instead of guessing by name
  // against the mock org-wide list.
  const { warehouses: ownScopedWarehouses } = useWarehouses();
  const { employees } = useEmployees();
  const myWarehouse = isSupervisor ? ownScopedWarehouses[0] : null;
  const assignedHub = myWarehouse?.name || "Not Assigned Yet";

  const displayWarehouses = useMemo(() => {
    if (!isSupervisor) return ownScopedWarehouses;
    return myWarehouse
      ? [{ name: myWarehouse.name, commodity: myWarehouse.commodity, stock: myWarehouse.stock, attendance: "—", status: myWarehouse.status }]
      : [];
  }, [isSupervisor, myWarehouse, ownScopedWarehouses]);

  const kpiCards = useMemo(() => {
    if (isSupervisor) {
      return [
        {
          label: "Assigned Hub",
          value: assignedHub,
          trend: myWarehouse ? myWarehouse.commodity : "Awaiting assignment",
          icon: "fa-solid fa-warehouse",
          color: "#10B981",
          accentGradient: "linear-gradient(90deg, #059669 0%, #10B981 100%)",
          badge: myWarehouse ? myWarehouse.status : "Unassigned",
        },
        {
          label: "Attendance Today",
          value: "96% Present",
          trend: "+4 Staff On-Duty",
          icon: "fa-solid fa-user-check",
          color: "#3B82F6",
          accentGradient: "linear-gradient(90deg, #1D4ED8 0%, #3B82F6 100%)",
          badge: "Preview",
        },
        {
          label: "Hub Stock In-Hand",
          value: myWarehouse ? myWarehouse.stock : "0 kg",
          trend: myWarehouse ? myWarehouse.commodity : "No warehouse assigned",
          icon: "fa-solid fa-boxes-stacked",
          color: "#F59E0B",
          accentGradient: "linear-gradient(90deg, #D97706 0%, #F59E0B 100%)",
          badge: "Live",
        },
        {
          label: "Pending Weighments",
          value: "2 Slips",
          trend: "Verification Needed",
          icon: "fa-solid fa-file-signature",
          color: "#059669",
          accentGradient: "linear-gradient(90deg, #047857 0%, #34D399 100%)",
          badge: "Preview",
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
        value: "—",
        trend: "Purchase module in development",
        icon: "fa-solid fa-sack-dollar",
        color: "#059669",
        accentGradient: "linear-gradient(90deg, #047857 0%, #34D399 100%)",
        badge: "Preview",
      },
    ];
  }, [isSupervisor, myWarehouse, assignedHub, ownScopedWarehouses, employees.length]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <PageHeader
        title={isSupervisor ? `${assignedHub} Hub Overview` : "Organisation Overview"}
        subtitle={
          isSupervisor
            ? `Live operational dashboard for your assigned warehouse hub (${assignedHub})`
            : "Live, consolidated executive view across all PRALLI & grain procurement centres"
        }
      />

      <AsyncState status={status} error={error} loadingLabel="Loading dashboard…" />

      {/* KPI CARDS (static - no click interaction, each card stands alone) */}
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
                <div style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.02em" }}>
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

      {/* Main Grid: Warehouse Table & Moisture Snapshot */}
      <div style={{ display: "grid", gridTemplateColumns: "2.1fr 1fr", gap: 18 }} className="responsive-grid-2">
        <Card title={isSupervisor ? `Assigned Warehouse Status (${assignedHub})` : "Warehouse Operations & Stock Overview"}>
          <WarehouseTable rows={displayWarehouses} />
        </Card>
        <Card title="Moisture Snapshot (Today)">
          {moistureSnapshot && <MoistureGauge {...moistureSnapshot} />}
        </Card>
      </div>

      {/* Bottom Grid: Recent Activity Feed */}
      <Card title="Recent Activity Audit Feed">
        <RecentActivity items={recentActivity} />
      </Card>
    </div>
  );
}
