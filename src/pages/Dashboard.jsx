import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Warehouse, Users, Boxes, IndianRupee, Plus, UserPlus, UserCheck, ClipboardList, WarehouseIcon, Truck, Scale, ArrowRight, Wheat } from "lucide-react";
import MoistureGauge from "../features/dashboard/components/MoistureGauge";
import WarehouseTable from "../features/dashboard/components/WarehouseTable";
import RecentActivity from "../features/dashboard/components/RecentActivity";
import PageHeader from "../components/common/PageHeader";
import AsyncState from "../components/common/AsyncState";
import {
  StatCard,
  SectionHeader,
  QuickAction,
  Card,
  StaggerContainer,
} from "../components/design-system/index";
import { useDashboard } from "../features/dashboard/useDashboard";
import { useAuth } from "../hooks/useAuth";
import { useWarehouses } from "../features/warehouses/useWarehouses";
import { useEmployees } from "../features/employees/useEmployees";
import {
  getStoredCollections,
  getStoredStacks,
  DEFAULT_WAREHOUSE_TCC,
} from "../features/biomass/biomassService";

const { slideUp, fadeIn } = { slideUp: { hidden: { opacity: 0, y: 12 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] } }) } };

function parseKg(display) {
  return Number(String(display || "0").replace(/[^0-9]/g, "")) || 0;
}

function LucideIconRenderer({ children, size = 16 }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: size, height: size, flexShrink: 0 }}>
      {children}
    </span>
  );
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

  const collections = useMemo(() => getStoredCollections(), []);
  const stacks = useMemo(() => getStoredStacks(), []);

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
        title: "Zone A Core Probe Temperature Check: 28 C",
        text: "Zone A Core Probe Temperature Check: 28 C",
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
          icon: <LucideIconRenderer><Warehouse size={16} /></LucideIconRenderer>,
          color: "#10B981",
          badge: "Active Hub",
        },
        {
          label: "Active Yard Stock",
          value: `${currentStockMt.toLocaleString("en-IN")} MT`,
          trend: `${hubTotalBales.toLocaleString("en-IN")} Compressed Bales`,
          icon: <LucideIconRenderer><Boxes size={16} /></LucideIconRenderer>,
          color: "#059669",
          badge: `${capacityUtilPct}% Capacity`,
          progressPct: capacityUtilPct,
        },
        {
          label: "Shift Attendance Today",
          value: "96% Present",
          trend: "+4 Ground Staff On-Duty",
          icon: <LucideIconRenderer><Users size={16} /></LucideIconRenderer>,
          color: "#2563EB",
          badge: "Live Shift",
        },
        {
          label: "Pending Weighment Slips",
          value: `${collections.length} Slips`,
          trend: "Ready for Baler Stacking",
          icon: <LucideIconRenderer><Scale size={16} /></LucideIconRenderer>,
          color: "#F59E0B",
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
        icon: <LucideIconRenderer><Warehouse size={16} /></LucideIconRenderer>,
        color: "#10B981",
        badge: ownScopedWarehouses.length ? `${Math.round((activeHubCount / ownScopedWarehouses.length) * 100)}% Active` : "—",
        progressPct: ownScopedWarehouses.length ? Math.round((activeHubCount / ownScopedWarehouses.length) * 100) : 0,
      },
      {
        label: "Personnel Roster",
        value: String(employees.length),
        trend: "Across all warehouses",
        icon: <LucideIconRenderer><Users size={16} /></LucideIconRenderer>,
        color: "#3B82F6",
        badge: "Org-wide",
      },
      {
        label: "Stock In-Hand",
        value: `${totalStockKg.toLocaleString()} kg`,
        trend: "Maize / PRALLI, all hubs",
        icon: <LucideIconRenderer><Boxes size={16} /></LucideIconRenderer>,
        color: "#F59E0B",
        badge: "Live",
      },
      {
        label: "Procurement Value",
        value: "₹70,949",
        trend: "Direct Inflow Disbursals",
        icon: <LucideIconRenderer><IndianRupee size={16} /></LucideIconRenderer>,
        color: "#059669",
        badge: "Live",
      },
    ];
  }, [isSupervisor, myWarehouse, assignedHub, ownScopedWarehouses, employees.length, currentStockMt, hubTotalBales, capacityUtilPct, collections.length]);

  const adminQuickActions = [
    { label: "Create Warehouse", icon: <Plus size={13} />, onClick: () => navigate("/warehouses/create"), color: "#10B981" },
    { label: "Add User", icon: <UserPlus size={13} />, onClick: () => navigate("/users"), color: "#3B82F6" },
    { label: "Add Employee", icon: <UserCheck size={13} />, onClick: () => navigate("/employees/new"), color: "#F59E0B" },
    { label: "Audit Log", icon: <ClipboardList size={13} />, onClick: () => navigate("/settings/audit-log"), color: "#F59E0B" },
    { label: "View Warehouses", icon: <WarehouseIcon size={13} />, onClick: () => navigate("/warehouses"), color: "var(--primary)" },
  ];

  const supervisorQuickActions = [
    { label: "Collection Entry", icon: <Truck size={13} />, onClick: () => navigate("/biomass/collection"), color: "#10B981" },
    { label: "Weighment Slip", icon: <Scale size={13} />, onClick: () => navigate("/weighment/new"), color: "#2563EB" },
    { label: "View Storage", icon: <Warehouse size={13} />, onClick: () => navigate("/biomass/storage"), color: "#7C3AED" },
    { label: "Dispatch Log", icon: <ArrowRight size={13} />, onClick: () => navigate("/biomass/dispatch"), color: "#C2410C" },
  ];

  return (
    <motion.div style={{ display: "flex", flexDirection: "column", gap: 14 }} initial="hidden" animate="visible">
      {/* PAGE HEADER */}
      <PageHeader
        title={isSupervisor ? assignedHub : "Organisation Overview"}
        subtitle={
          isSupervisor
            ? `Live operational ground management for your assigned warehouse hub (${assignedHub})`
            : "Live, consolidated executive view across all procurement centres"
        }
      />

      <AsyncState status={status} error={error} loadingLabel="Loading dashboard..." />

      {/* SUPERVISOR QUICK ACTIONS */}
      {isSupervisor && (
        <Card hover={false}>
          <SectionHeader
            title="Quick Actions"
            subtitle="Common tasks for your assigned hub"
            action={
              <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>Supervisor Panel</span>
            }
          />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
            {supervisorQuickActions.map((action) => (
              <QuickAction key={action.label} {...action} />
            ))}
          </div>
        </Card>
      )}

      {/* ADMIN QUICK ACTIONS */}
      {!isSupervisor && (
        <Card hover={false}>
          <SectionHeader
            title="Quick Actions"
            subtitle="Common administrative tasks"
            action={
              <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>Admin Panel</span>
            }
          />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
            {adminQuickActions.map((action) => (
              <QuickAction key={action.label} {...action} />
            ))}
          </div>
        </Card>
      )}

      {/* BIOMASS SUPPLY CHAIN BANNER */}
      <motion.div
        onClick={() => navigate("/biomass")}
        style={{
          background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
          color: "#FFFFFF",
          borderRadius: 14,
          padding: "18px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.3)",
          border: "1px solid #334155",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
        whileHover={{ y: -2, boxShadow: "0 14px 30px -5px rgba(15, 23, 42, 0.4)" }}
        whileTap={{ scale: 0.995 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "rgba(16, 185, 129, 0.2)",
              color: "#34D399",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(52, 211, 153, 0.3)",
              flexShrink: 0,
            }}
          >
            <LucideIconRenderer size={22}><Wheat size={22} /></LucideIconRenderer>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.01em" }}>
                Biomass Supply Chain System
              </h3>
              <span style={{ fontSize: 10, fontWeight: 700, background: "#10B981", color: "#FFFFFF", padding: "2px 8px", borderRadius: 10 }}>
                NEW MODULE
              </span>
            </div>
            <p style={{ margin: "3px 0 0", fontSize: 12, color: "#94A3B8" }}>
              Paddy Straw  • Wheat Straw  • Maize Stalk  — 4-Stage Live Tracking for {assignedHub}
            </p>
          </div>
        </div>

        <motion.button
          type="button"
          style={{
            padding: "8px 16px",
            fontSize: 12.5,
            fontWeight: 700,
            borderRadius: 8,
            border: "none",
            background: "#10B981",
            color: "#FFFFFF",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            boxShadow: "0 4px 12px rgba(16, 185, 129, 0.4)",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          Open Biomass Tracker <ArrowRight size={13} />
        </motion.button>
      </motion.div>

      {/* KPI CARDS */}
      <motion.div
        style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}
        className="responsive-grid-2"
        variants={fadeIn}
      >
        <StaggerContainer>
          {kpiCards.map((cfg) => (
            <StatCard
              key={cfg.label}
              label={cfg.label}
              value={cfg.value}
              trend={cfg.trend}
              icon={cfg.icon}
              color={cfg.color}
              progressPct={cfg.progressPct}
            />
          ))}
        </StaggerContainer>
      </motion.div>

      {/* SUPERVISOR HUB DETAILS */}
      {isSupervisor && myWarehouse && (
        <Card hover={false}>
          <SectionHeader
            title={`Hub Profile: ${assignedHub}`}
            subtitle="Operational status and capacity overview"
          />
          <motion.div
            style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}
            className="responsive-grid-2"
            variants={slideUp}
          >
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.4 }}>
                Assigned Warehouse Profile
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", marginTop: 2 }}>
                {assignedHub} (Transit Hub-01)
              </div>
              <div style={{ fontSize: 11, color: "#2563EB", fontWeight: 600, marginTop: 2 }}>
                Center Code: TCC-{assignedHub.toUpperCase().replace(/\s+/g, "-")}-01
              </div>
              <div style={{ fontSize: 11, color: "#475569", marginTop: 3 }}>
                Sourcing Area: {DEFAULT_WAREHOUSE_TCC.sourcingArea}
              </div>
            </div>

            <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.3 }}>Storage Capacity</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: "#059669" }}>{currentStockMt.toLocaleString()} MT</span>
                <span style={{ fontSize: 11, color: "#64748B" }}>/ {hubCapacityMt.toLocaleString()} MT</span>
              </div>
              <div style={{ width: "100%", height: 5, background: "#E2E8F0", borderRadius: 3, marginTop: 6, overflow: "hidden" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${capacityUtilPct}%` }}
                  transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                  style={{ height: "100%", background: "#059669", borderRadius: 3 }}
                />
              </div>
              <div style={{ fontSize: 10.5, color: "#059669", fontWeight: 700, marginTop: 4 }}>
                {capacityUtilPct}% Utilized • {(hubCapacityMt - currentStockMt).toLocaleString()} MT Free
              </div>
            </div>

            <div style={{ background: "#ECFDF5", border: "1px solid #10B981", borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#065F46", textTransform: "uppercase", letterSpacing: 0.3 }}>Hub Fire Safety Status</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#047857", marginTop: 2 }}>
                98.5% (Safe)
              </div>
              <div style={{ fontSize: 11, color: "#065F46", marginTop: 2 }}>
                Thermal probes normal across Zone A, B, C
              </div>
            </div>
          </motion.div>
        </Card>
      )}

      {/* Main Grid: Warehouse Status Table & Moisture Snapshot */}
      <motion.div
        style={{ display: "grid", gridTemplateColumns: "2.1fr 1fr", gap: 14 }}
        className="responsive-grid-2"
        variants={fadeIn}
      >
        <Card
          title={isSupervisor ? `Assigned Warehouse (${assignedHub})` : "Warehouse Operations & Stock Overview"}
        >
          <WarehouseTable rows={displayWarehouses} />
        </Card>
        <Card title="Moisture Snapshot (Today)">
          {moistureSnapshot && <MoistureGauge {...moistureSnapshot} />}
        </Card>
      </motion.div>

      {/* Bottom Grid: Operational Activity Feed */}
      <Card title={isSupervisor ? `Activity Feed — ${assignedHub}` : "Recent Activity Audit Feed"}>
        <RecentActivity items={supervisorRecentLogs} />
      </Card>
    </motion.div>
  );
}
