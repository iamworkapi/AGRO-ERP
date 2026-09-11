import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import DataTable from "../components/common/DataTable";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import FormField from "../components/common/FormField";
import { useWarehouses } from "../features/warehouses/useWarehouses";
import { useAuth } from "../hooks/useAuth";
import {
  DEFAULT_WAREHOUSE_TCC,
  getStoredStorageRooms,
  saveNewStorageRoom,
  updateStorageRoom,
  deleteStorageRoom,
  generateWarehouseRoomCode,
  getWarehouseCodePrefix,
} from "../features/biomass/biomassService";
import { toast } from "../utils/toast";

function emptyRoomForm(defaultWarehouseId = "") {
  return {
    name: "",
    roomCode: generateWarehouseRoomCode(defaultWarehouseId || DEFAULT_WAREHOUSE_TCC.code, DEFAULT_WAREHOUSE_TCC.name, "Covered Steel Godown"),
    roomType: "Covered Steel Godown",
    warehouseCode: defaultWarehouseId || DEFAULT_WAREHOUSE_TCC.code,
    warehouseName: DEFAULT_WAREHOUSE_TCC.name,
    zone: "Zone A",
    capacityMt: "2500",
    ambientTempC: "26",
    maxTempThresholdC: "32",
    humidityPct: "14.5",
    maxHumidityPct: "18.0",
    supervisorName: "Ramesh Chandra",
    contactMobile: "9876543210",
    notes: "",
  };
}

export default function StorageRooms() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isScopedRole = user?.roleKey === "supervisor" || user?.roleKey === "warehouse_admin";
  const { warehouses } = useWarehouses();
  const myWarehouse = isScopedRole ? warehouses[0] : null;

  const [rooms, setRooms] = useState(getStoredStorageRooms);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomForm, setRoomForm] = useState(() => emptyRoomForm(myWarehouse?.id));
  const [saving, setSaving] = useState(false);

  // Filtered Rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      const matchType = typeFilter === "ALL" || r.roomType === typeFilter;
      const term = searchTerm.toLowerCase();
      const matchSearch =
        !term ||
        r.name?.toLowerCase().includes(term) ||
        r.roomCode?.toLowerCase().includes(term) ||
        r.warehouseName?.toLowerCase().includes(term) ||
        r.zone?.toLowerCase().includes(term) ||
        r.currentCommodity?.toLowerCase().includes(term);
      return matchType && matchSearch;
    });
  }, [rooms, typeFilter, searchTerm]);

  // Aggregate Metrics
  const stats = useMemo(() => {
    const totalRooms = rooms.length;
    const totalCapacityMt = rooms.reduce((sum, r) => sum + (Number(r.capacityMt) || 0), 0);
    const totalStockMt = rooms.reduce((sum, r) => sum + (Number(r.currentStockMt) || 0), 0);
    const avgFillPct = totalCapacityMt > 0 ? Math.round((totalStockMt / totalCapacityMt) * 100) : 0;
    const activeRooms = rooms.filter((r) => r.status?.includes("ACTIVE")).length;
    const availableCapacityMt = Math.max(0, totalCapacityMt - totalStockMt);

    const temps = rooms.map((r) => Number(r.ambientTempC)).filter((n) => !isNaN(n) && n > 0);
    const avgTemp = temps.length ? (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1) : "24.5";

    const humidities = rooms.map((r) => Number(r.humidityPct)).filter((n) => !isNaN(n) && n > 0);
    const avgHumidity = humidities.length ? (humidities.reduce((a, b) => a + b, 0) / humidities.length).toFixed(1) : "14.2";

    return {
      totalRooms,
      totalCapacityMt,
      totalStockMt,
      avgFillPct,
      activeRooms,
      availableCapacityMt,
      avgTemp,
      avgHumidity,
    };
  }, [rooms]);

  function handleOpenAdd() {
    setRoomForm(emptyRoomForm(myWarehouse?.id));
    setIsAddModalOpen(true);
  }

  function handleAddSubmit(e) {
    e.preventDefault();
    if (!roomForm.name.trim()) {
      toast.error("Please enter a Room / Godown Name");
      return;
    }

    setSaving(true);
    try {
      const selectedWh = warehouses.find((w) => w.id === roomForm.warehouseCode || w.code === roomForm.warehouseCode);
      const whCode = selectedWh?.code || selectedWh?.id || roomForm.warehouseCode;
      const whName = selectedWh?.name || DEFAULT_WAREHOUSE_TCC.name;
      const newObj = {
        name: roomForm.name.trim(),
        roomCode: roomForm.roomCode.trim() || generateWarehouseRoomCode(whCode, whName, roomForm.roomType),
        roomType: roomForm.roomType,
        warehouseCode: whCode,
        warehouseName: whName,
        zone: roomForm.zone,
        capacityMt: parseFloat(roomForm.capacityMt) || 2000,
        currentStockMt: 0,
        currentCommodity: "Available / Empty Bay",
        ambientTempC: parseFloat(roomForm.ambientTempC) || 26,
        maxTempThresholdC: parseFloat(roomForm.maxTempThresholdC) || 32,
        humidityPct: parseFloat(roomForm.humidityPct) || 14.5,
        maxHumidityPct: parseFloat(roomForm.maxHumidityPct) || 18.0,
        supervisorName: roomForm.supervisorName,
        contactMobile: roomForm.contactMobile,
        status: "ACTIVE / OPERATIONAL",
        notes: roomForm.notes,
      };

      const updated = saveNewStorageRoom(newObj);
      setRooms(updated);
      setIsAddModalOpen(false);
      toast.success(`Storage Room "${newObj.name}" created successfully!`);
    } catch (err) {
      toast.error("Failed to create storage room.");
    } finally {
      setSaving(false);
    }
  }

  function handleOpenEdit(r) {
    setEditingRoom(r);
    setRoomForm({
      name: r.name || "",
      roomCode: r.roomCode || "",
      roomType: r.roomType || "Covered Steel Godown",
      warehouseCode: r.warehouseCode || DEFAULT_WAREHOUSE_TCC.code,
      warehouseName: r.warehouseName || DEFAULT_WAREHOUSE_TCC.name,
      zone: r.zone || "Zone A",
      capacityMt: String(r.capacityMt || "2500"),
      ambientTempC: String(r.ambientTempC || "26"),
      maxTempThresholdC: String(r.maxTempThresholdC || "32"),
      humidityPct: String(r.humidityPct || "14.5"),
      maxHumidityPct: String(r.maxHumidityPct || "18.0"),
      supervisorName: r.supervisorName || "",
      contactMobile: r.contactMobile || "",
      notes: r.notes || "",
    });
  }

  function handleEditSubmit(e) {
    e.preventDefault();
    if (!editingRoom) return;

    setSaving(true);
    try {
      const selectedWh = warehouses.find((w) => w.id === roomForm.warehouseCode);
      const updated = updateStorageRoom(editingRoom.id, {
        name: roomForm.name.trim(),
        roomCode: roomForm.roomCode.trim(),
        roomType: roomForm.roomType,
        warehouseCode: roomForm.warehouseCode,
        warehouseName: selectedWh?.name || editingRoom.warehouseName,
        zone: roomForm.zone,
        capacityMt: parseFloat(roomForm.capacityMt) || 2000,
        ambientTempC: parseFloat(roomForm.ambientTempC) || 26,
        maxTempThresholdC: parseFloat(roomForm.maxTempThresholdC) || 32,
        humidityPct: parseFloat(roomForm.humidityPct) || 14.5,
        maxHumidityPct: parseFloat(roomForm.maxHumidityPct) || 18.0,
        supervisorName: roomForm.supervisorName,
        contactMobile: roomForm.contactMobile,
        notes: roomForm.notes,
      });
      setRooms(updated);
      setEditingRoom(null);
      toast.success(`Storage Room "${roomForm.name}" updated!`);
    } catch (err) {
      toast.error("Failed to update storage room.");
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(id, name) {
    if (window.confirm(`Delete storage room "${name}"?`)) {
      const updated = deleteStorageRoom(id);
      setRooms(updated);
      toast.success(`Storage Room "${name}" removed.`);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, position: "relative" }}>
      {/* PAGE HEADER */}
      <PageHeader
        title="Storage Rooms"
      />

      {/* TOP KPI METRICS STRIP */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 14 }}>
        {/* Card 1: Total Rooms / Facilities */}
        <div
          className="app-card"
          style={{
            padding: "16px 18px 14px",
            borderRadius: 16,
            background: "var(--surface)",
            border: "1px solid var(--line)",
            boxShadow: "var(--shadow-sm)",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease, border-color 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.boxShadow = "var(--shadow-md)";
            e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "var(--shadow-sm)";
            e.currentTarget.style.borderColor = "var(--line)";
          }}
        >
          {/* Top subtle color accent bar */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: "linear-gradient(90deg, #10B981, rgba(16, 185, 129, 0.2))",
            }}
          />

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#10B981",
                    boxShadow: "0 0 8px #10B981",
                  }}
                />
                <span style={{ fontSize: 11, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Total Facilities
                </span>
              </div>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "rgba(16, 185, 129, 0.12)",
                  color: "#10B981",
                  border: "1px solid rgba(16, 185, 129, 0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                }}
              >
                <i className="ri-community-line" />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: 6, margin: "4px 0 8px" }}>
              <span style={{ fontSize: 26, fontWeight: 900, color: "var(--ink)", letterSpacing: "-0.02em", lineHeight: 1 }}>
                {stats.totalRooms}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                Godowns &amp; Rooms
              </span>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "3px 8px",
                borderRadius: 999,
                background: "rgba(16, 185, 129, 0.1)",
                color: "#10B981",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              <i className="ri-checkbox-circle-fill" style={{ fontSize: 12 }} />
              {stats.activeRooms} of {stats.totalRooms} Operational
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 11,
              color: "var(--muted)",
              borderTop: "1px solid var(--line)",
              paddingTop: 8,
              marginTop: 12,
            }}
          >
            <span>Ready for Intake</span>
            <span style={{ fontWeight: 700, color: "#10B981" }}>100% Available</span>
          </div>
        </div>

        {/* Card 2: Total Aggregate Capacity */}
        <div
          className="app-card"
          style={{
            padding: "16px 18px 14px",
            borderRadius: 16,
            background: "var(--surface)",
            border: "1px solid var(--line)",
            boxShadow: "var(--shadow-sm)",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease, border-color 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.boxShadow = "var(--shadow-md)";
            e.currentTarget.style.borderColor = "rgba(2, 132, 199, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "var(--shadow-sm)";
            e.currentTarget.style.borderColor = "var(--line)";
          }}
        >
          {/* Top subtle color accent bar */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: "linear-gradient(90deg, #0284C7, rgba(2, 132, 199, 0.2))",
            }}
          />

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#0284C7",
                    boxShadow: "0 0 8px #0284C7",
                  }}
                />
                <span style={{ fontSize: 11, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Rated Max Capacity
                </span>
              </div>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "rgba(2, 132, 199, 0.12)",
                  color: "#0284C7",
                  border: "1px solid rgba(2, 132, 199, 0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                }}
              >
                <i className="ri-stack-line" />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: 6, margin: "4px 0 8px" }}>
              <span style={{ fontSize: 26, fontWeight: 900, color: "#0284C7", letterSpacing: "-0.02em", lineHeight: 1 }}>
                {stats.totalCapacityMt.toLocaleString("en-IN")}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                Metric Tonnes
              </span>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "3px 8px",
                borderRadius: 999,
                background: "rgba(2, 132, 199, 0.1)",
                color: "#0284C7",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              <i className="ri-shield-check-line" style={{ fontSize: 12 }} />
              Certified Storage Limit
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 11,
              color: "var(--muted)",
              borderTop: "1px solid var(--line)",
              paddingTop: 8,
              marginTop: 12,
            }}
          >
            <span>Available Headroom</span>
            <span style={{ fontWeight: 800, color: "#0284C7" }}>
              {stats.availableCapacityMt.toLocaleString("en-IN")} MT Free
            </span>
          </div>
        </div>

        {/* Card 3: Currently Stored Stock & Utilization Progress */}
        <div
          className="app-card"
          style={{
            padding: "16px 18px 14px",
            borderRadius: 16,
            background: "var(--surface)",
            border: "1px solid var(--line)",
            boxShadow: "var(--shadow-sm)",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease, border-color 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.boxShadow = "var(--shadow-md)";
            e.currentTarget.style.borderColor = "rgba(245, 158, 11, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "var(--shadow-sm)";
            e.currentTarget.style.borderColor = "var(--line)";
          }}
        >
          {/* Top subtle color accent bar */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: "linear-gradient(90deg, #F59E0B, rgba(245, 158, 11, 0.2))",
            }}
          />

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#F59E0B",
                    boxShadow: "0 0 8px #F59E0B",
                  }}
                />
                <span style={{ fontSize: 11, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Current Stored Stock
                </span>
              </div>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "rgba(245, 158, 11, 0.12)",
                  color: "#F59E0B",
                  border: "1px solid rgba(245, 158, 11, 0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                }}
              >
                <i className="ri-pie-chart-2-line" />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", margin: "4px 0 6px" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontSize: 26, fontWeight: 900, color: "var(--ink)", letterSpacing: "-0.02em", lineHeight: 1 }}>
                  {stats.totalStockMt.toLocaleString("en-IN")}
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                  MT Stored
                </span>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: stats.avgFillPct > 80 ? "#EF4444" : "#F59E0B",
                  background: stats.avgFillPct > 80 ? "rgba(239, 68, 68, 0.12)" : "rgba(245, 158, 11, 0.12)",
                  padding: "2px 7px",
                  borderRadius: 6,
                }}
              >
                {stats.avgFillPct}% Fill
              </span>
            </div>

            {/* Dynamic Progress Indicator */}
            <div style={{ margin: "6px 0 4px" }}>
              <div style={{ height: 6, borderRadius: 999, background: "var(--canvas)", overflow: "hidden", border: "1px solid var(--line)" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${Math.min(100, Math.max(3, stats.avgFillPct))}%`,
                    borderRadius: 999,
                    background:
                      stats.avgFillPct > 80
                        ? "linear-gradient(90deg, #F59E0B, #EF4444)"
                        : "linear-gradient(90deg, #10B981, #F59E0B)",
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 11,
              color: "var(--muted)",
              borderTop: "1px solid var(--line)",
              paddingTop: 8,
              marginTop: 10,
            }}
          >
            <span>Yard Utilization</span>
            <span style={{ fontWeight: 700, color: "var(--ink)" }}>{100 - stats.avgFillPct}% Capacity Free</span>
          </div>
        </div>

        {/* Card 4: Chamber Climate IoT & Telemetry */}
        <div
          className="app-card"
          style={{
            padding: "16px 18px 14px",
            borderRadius: 16,
            background: "var(--surface)",
            border: "1px solid var(--line)",
            boxShadow: "var(--shadow-sm)",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease, border-color 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.boxShadow = "var(--shadow-md)";
            e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "var(--shadow-sm)";
            e.currentTarget.style.borderColor = "var(--line)";
          }}
        >
          {/* Top subtle color accent bar */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: "linear-gradient(90deg, #8B5CF6, rgba(139, 92, 246, 0.2))",
            }}
          />

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#8B5CF6",
                    boxShadow: "0 0 8px #8B5CF6",
                  }}
                />
                <span style={{ fontSize: 11, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Chamber Climate IoT
                </span>
              </div>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "rgba(139, 92, 246, 0.12)",
                  color: "#8B5CF6",
                  border: "1px solid rgba(139, 92, 246, 0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                }}
              >
                <i className="ri-temp-cold-line" />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", margin: "4px 0 8px" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontSize: 24, fontWeight: 900, color: "var(--ink)", letterSpacing: "-0.02em", lineHeight: 1 }}>
                  {stats.avgTemp}°C
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)" }}>
                  • {stats.avgHumidity}% RH
                </span>
              </div>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 10.5,
                  fontWeight: 800,
                  color: "#10B981",
                  background: "rgba(16, 185, 129, 0.12)",
                  padding: "2px 7px",
                  borderRadius: 999,
                }}
              >
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#10B981" }} />
                OPTIMAL
              </span>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "3px 8px",
                borderRadius: 999,
                background: "rgba(139, 92, 246, 0.1)",
                color: "#8B5CF6",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              <i className="ri-radar-line" style={{ fontSize: 12 }} />
              Live Telemetry Online
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 11,
              color: "var(--muted)",
              borderTop: "1px solid var(--line)",
              paddingTop: 8,
              marginTop: 12,
            }}
          >
            <span>Active Probes</span>
            <span style={{ fontWeight: 700, color: "#8B5CF6", display: "flex", alignItems: "center", gap: 3 }}>
              <i className="ri-signal-tower-line" /> {stats.totalRooms} Wireless Nodes
            </span>
          </div>
        </div>
      </div>

      {/* FULL DATA TABLE (WITH INTEGRATED HEADER CONTROLS) */}
      <Card
        title="All Storage Rooms & Godown Facilities"
        bodyStyle={{ padding: 0 }}
        headerStyle={{ padding: "10px 16px" }}
        right={
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {/* Search Box */}
            <div style={{ position: "relative", minWidth: 240 }}>
              <i
                className="ri-search-line"
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--muted)",
                  fontSize: 12,
                }}
              />
              <input
                type="text"
                placeholder="Search room name, code, commodity..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px 10px 6px 30px",
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid var(--line-strong)",
                  background: "var(--canvas)",
                  color: "var(--ink)",
                  outline: "none",
                }}
              />
            </div>

            {/* Facility Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{
                padding: "6px 10px",
                fontSize: 12,
                fontWeight: 600,
                borderRadius: 8,
                border: "1px solid var(--line-strong)",
                background: "var(--canvas)",
                color: "var(--ink)",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="ALL">All Facility Types</option>
              <option value="Covered Steel Godown">Covered Steel Godowns</option>
              <option value="Controlled Atmosphere Cold Chamber">Cold Chambers</option>
              <option value="Corrugated Metal Silo Tower">Grain Silo Towers</option>
              <option value="Open Yard Stack Bay">Open Yard Stack Bays</option>
            </select>

            {/* Add Room Button */}
            <Button
              size="sm"
              onClick={() => navigate("/warehouses/rooms/create")}
              style={{ fontSize: 12, height: 32, padding: "0 12px", fontWeight: 700, whiteSpace: "nowrap" }}
            >
              <i className="ri-add-line" style={{ marginRight: 4 }} /> Add Room
            </Button>
          </div>
        }
        footer={
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
            <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>
              Showing: <strong style={{ color: "var(--ink)" }}>{filteredRooms.length}</strong> rooms &amp; godowns
            </span>
            <span style={{ fontSize: 11.5, color: "var(--muted)" }}>
              Total Facilities: <strong style={{ color: "var(--ink)" }}>{rooms.length}</strong>
            </span>
          </div>
        }
      >
        <DataTable
          keyField="id"
          rows={filteredRooms}
          searchable={false}
          style={{ border: "none", borderRadius: 0, boxShadow: "none" }}
          emptyMessage="No storage rooms found."
          columns={[
            {
              key: "name",
              label: "Room / Godown Name",
              emphasize: true,
              render: (r) => (
                <div>
                  <div style={{ fontWeight: 800, color: "var(--ink)" }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>
                    Code: <strong>{r.roomCode}</strong> • {r.roomType}
                  </div>
                </div>
              ),
            },
            {
              key: "zone",
              label: "Facility & Zone",
              render: (r) => (
                <div>
                  <span style={{ fontWeight: 700 }}>{r.zone}</span>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>{r.warehouseName || r.warehouseCode}</div>
                </div>
              ),
            },
            {
              key: "capacity",
              label: "Capacity & Stock (MT)",
              render: (r) => (
                <div>
                  <div style={{ fontWeight: 800, color: "var(--ink)" }}>
                    {(r.currentStockMt || 0).toLocaleString("en-IN")} / {r.capacityMt?.toLocaleString("en-IN")} MT
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>
                    Commodity: <strong>{r.currentCommodity || "Open Storage Bay"}</strong>
                  </div>
                </div>
              ),
            },
            {
              key: "sensors",
              label: "Climate Telemetry",
              render: (r) => (
                <span style={{ fontSize: 11.5 }}>
                  🌡️ {r.ambientTempC}°C | 💧 {r.humidityPct}%
                </span>
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (r) => (
                <Badge tone={r.status?.includes("ACTIVE") ? "success" : "warning"}>
                  {r.status || "ACTIVE"}
                </Badge>
              ),
            },
            {
              key: "actions",
              label: "Actions",
              render: (r) => (
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => handleOpenEdit(r)}
                    style={{
                      padding: "4px 8px",
                      borderRadius: 6,
                      border: "1px solid var(--line-strong)",
                      background: "var(--surface)",
                      color: "var(--ink)",
                      fontSize: 11,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <i className="ri-edit-line" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(r.id, r.name)}
                    style={{
                      padding: "4px 8px",
                      borderRadius: 6,
                      border: "1px solid rgba(255,59,86,0.3)",
                      background: "rgba(255,59,86,0.08)",
                      color: "#FF3B56",
                      fontSize: 11,
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* MODAL: EDIT STORAGE ROOM */}
      <Modal open={Boolean(editingRoom)} title={`Edit: ${editingRoom?.name || "Storage Room"}`} onClose={() => setEditingRoom(null)}>
        <form onSubmit={handleEditSubmit}>
          <FormField
            label="Room / Godown Name"
            required
            value={roomForm.name}
            onChange={(val) => setRoomForm((f) => ({ ...f, name: val }))}
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
            <FormField
              label="Room Identifier Code"
              value={roomForm.roomCode}
              onChange={(val) => setRoomForm((f) => ({ ...f, roomCode: val }))}
            />
            <FormField
              label="Facility / Room Type"
              type="select"
              value={roomForm.roomType}
              onChange={(val) => setRoomForm((f) => ({ ...f, roomType: val }))}
              options={[
                { value: "Covered Steel Godown", label: "Covered Steel Godown" },
                { value: "Controlled Atmosphere Cold Chamber", label: "Controlled Atmosphere Cold Chamber" },
                { value: "Corrugated Metal Silo Tower", label: "Corrugated Metal Silo Tower" },
                { value: "Open Yard Stack Bay", label: "Open Yard Stack Bay" },
                { value: "Fumigated Seed Storage Bay", label: "Fumigated Seed Storage Bay" },
              ]}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
            <FormField
              label="Rated Storage Capacity (MT)"
              type="number"
              required
              value={roomForm.capacityMt}
              onChange={(val) => setRoomForm((f) => ({ ...f, capacityMt: val }))}
            />
            <FormField
              label="Assigned Supervisor"
              value={roomForm.supervisorName}
              onChange={(val) => setRoomForm((f) => ({ ...f, supervisorName: val }))}
            />
          </div>
          <FormField
            label="Ventilation & Equipment Notes"
            value={roomForm.notes}
            onChange={(val) => setRoomForm((f) => ({ ...f, notes: val }))}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
            <Button variant="secondary" type="button" onClick={() => setEditingRoom(null)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save Changes"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
