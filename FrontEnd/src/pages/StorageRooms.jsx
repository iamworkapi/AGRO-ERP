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
} from "../features/biomass/biomassService";
import { toast } from "../utils/toast";

function emptyRoomForm(defaultWarehouseId = "") {
  return {
    name: "",
    roomCode: "",
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
  const [viewMode, setViewMode] = useState("cards"); // "cards" | "table"
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

    return { totalRooms, totalCapacityMt, totalStockMt, avgFillPct, activeRooms };
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
      const selectedWh = warehouses.find((w) => w.id === roomForm.warehouseCode);
      const newObj = {
        name: roomForm.name.trim(),
        roomCode: roomForm.roomCode.trim() || `RM-${Math.floor(100 + Math.random() * 900)}`,
        roomType: roomForm.roomType,
        warehouseCode: roomForm.warehouseCode,
        warehouseName: selectedWh?.name || DEFAULT_WAREHOUSE_TCC.name,
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
        title="Storage Rooms, Godowns & Chamber Management"
        subtitle="Manage named warehouse godowns, cold chambers, grain silos, and designated stack bays"
        actions={
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {/* View Mode Switcher */}
            <div style={{ display: "flex", background: "var(--canvas)", border: "1px solid var(--line)", borderRadius: 8, padding: 3 }}>
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                style={{
                  padding: "5px 12px",
                  borderRadius: 6,
                  border: "none",
                  background: viewMode === "cards" ? "var(--primary)" : "transparent",
                  color: viewMode === "cards" ? "white" : "var(--ink-secondary)",
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <i className="ri-layout-grid-line" /> Cards
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                style={{
                  padding: "5px 12px",
                  borderRadius: 6,
                  border: "none",
                  background: viewMode === "table" ? "var(--primary)" : "transparent",
                  color: viewMode === "table" ? "white" : "var(--ink-secondary)",
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <i className="ri-list-unordered" /> Table
              </button>
            </div>

            <Button onClick={handleOpenAdd}>
              <i className="ri-add-line" style={{ marginRight: 6 }} /> Create Storage Room / Godown
            </Button>
          </div>
        }
      />

      {/* TOP KPI METRICS STRIP */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        {/* Card 1: Total Rooms */}
        <div className="app-card" style={{ padding: "16px 18px", borderRadius: 16, background: "var(--surface)", border: "1px solid var(--line)", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Total Storage Rooms
            </span>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(0,245,155,0.12)", color: "#00F59B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
              <i className="ri-door-open-line" />
            </div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "var(--ink)" }}>{stats.totalRooms} Facilities</div>
          <span style={{ fontSize: 11, color: "#00F59B", fontWeight: 700, marginTop: 4, display: "block" }}>
            {stats.activeRooms} Operational &amp; Ready
          </span>
        </div>

        {/* Card 2: Total Aggregate Capacity */}
        <div className="app-card" style={{ padding: "16px 18px", borderRadius: 16, background: "var(--surface)", border: "1px solid var(--line)", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Max Godown Capacity
            </span>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(0,210,255,0.12)", color: "#00D2FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
              <i className="ri-stack-line" />
            </div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#00D2FF" }}>{stats.totalCapacityMt.toLocaleString("en-IN")} MT</div>
          <span style={{ fontSize: 11, color: "var(--muted)", marginTop: 4, display: "block" }}>
            Across all sheds &amp; silos
          </span>
        </div>

        {/* Card 3: Currently Stored Stock */}
        <div className="app-card" style={{ padding: "16px 18px", borderRadius: 16, background: "var(--surface)", border: "1px solid var(--line)", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Current Stored Stock
            </span>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(255,184,0,0.12)", color: "#FFB800", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
              <i className="ri-weight-hanging-line" />
            </div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#FFB800" }}>{stats.totalStockMt.toLocaleString("en-IN")} MT</div>
          <span style={{ fontSize: 11, color: "var(--muted)", marginTop: 4, display: "block" }}>
            {stats.avgFillPct}% Total Yard Utilization
          </span>
        </div>

        {/* Card 4: Safety & Air Quality */}
        <div className="app-card" style={{ padding: "16px 18px", borderRadius: 16, background: "var(--surface)", border: "1px solid var(--line)", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Chamber Climate IoT
            </span>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(168,85,247,0.12)", color: "#A855F7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
              <i className="ri-temperature-arrow-down-line" />
            </div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#00F59B" }}>Active Telemetry</div>
          <span style={{ fontSize: 11, color: "var(--muted)", marginTop: 4, display: "block" }}>
            Wireless Temperature &amp; RH Probes
          </span>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: 14,
          padding: "12px 18px",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          {/* Search Box */}
          <div style={{ position: "relative", minWidth: 260 }}>
            <i className="ri-search-line" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontSize: 12 }} />
            <input
              type="text"
              placeholder="Search room name, code, commodity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "7px 12px 7px 32px",
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
              padding: "7px 12px",
              fontSize: 12,
              fontWeight: 700,
              borderRadius: 8,
              border: "1px solid var(--line-strong)",
              background: "var(--canvas)",
              color: "var(--ink)",
              outline: "none",
            }}
          >
            <option value="ALL">All Facility Types</option>
            <option value="Covered Steel Godown">Covered Steel Godowns</option>
            <option value="Controlled Atmosphere Cold Chamber">Cold Chambers</option>
            <option value="Corrugated Metal Silo Tower">Grain Silo Towers</option>
            <option value="Open Yard Stack Bay">Open Yard Stack Bays</option>
          </select>
        </div>

        <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 700 }}>
          Showing: <strong style={{ color: "var(--ink)" }}>{filteredRooms.length}</strong> rooms &amp; godowns
        </span>
      </div>

      {/* VIEW MODE 1: INTERACTIVE ROOM CARDS */}
      {viewMode === "cards" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {filteredRooms.map((r) => {
            const fillPct = r.capacityMt > 0 ? Math.round(((r.currentStockMt || 0) / r.capacityMt) * 100) : 0;
            const isNearFull = fillPct >= 85;

            return (
              <div
                key={r.id}
                className="app-card hover-card"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--line)",
                  borderRadius: 18,
                  padding: "20px 22px",
                  boxShadow: "var(--shadow-sm)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 14,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div>
                  {/* Top: Code, Type & Status */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          background: r.roomType.includes("Cold")
                            ? "rgba(0,210,255,0.12)"
                            : r.roomType.includes("Silo")
                            ? "rgba(255,184,0,0.12)"
                            : "rgba(0,245,155,0.12)",
                          color: r.roomType.includes("Cold")
                            ? "#00D2FF"
                            : r.roomType.includes("Silo")
                            ? "#FFB800"
                            : "#00F59B",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 18,
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        <i className={r.roomType.includes("Cold") ? "ri-snowflake-line" : r.roomType.includes("Silo") ? "ri-stack-line" : "ri-building-line"} />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: 15.5, fontWeight: 900, color: "var(--ink)", letterSpacing: "-0.01em" }}>
                          {r.name}
                        </h3>
                        <span style={{ fontSize: 11, color: "var(--muted)" }}>
                          Code: <strong>{r.roomCode}</strong> | {r.zone || "Zone A"}
                        </span>
                      </div>
                    </div>

                    <Badge tone={isNearFull ? "warning" : "success"}>
                      {isNearFull ? "NEAR CAPACITY" : "ACTIVE"}
                    </Badge>
                  </div>

                  {/* Commodity & Warehouse */}
                  <div style={{ background: "var(--canvas)", padding: "10px 14px", borderRadius: 10, border: "1px solid var(--line)", margin: "8px 0 10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 4 }}>
                      <span style={{ color: "var(--muted)" }}>Facility:</span>
                      <strong style={{ color: "var(--ink)" }}>{r.warehouseName || DEFAULT_WAREHOUSE_TCC.name}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5 }}>
                      <span style={{ color: "var(--muted)" }}>Stored Commodity:</span>
                      <strong style={{ color: "#00F59B" }}>{r.currentCommodity || "Open Storage Bay"}</strong>
                    </div>
                  </div>

                  {/* Capacity Fill Bar */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                      <span style={{ color: "var(--muted)", textTransform: "uppercase" }}>Fill Capacity</span>
                      <span style={{ color: "var(--ink)" }}>
                        {r.currentStockMt?.toLocaleString("en-IN") || 0} / {r.capacityMt?.toLocaleString("en-IN")} MT ({fillPct}%)
                      </span>
                    </div>
                    <div style={{ height: 6, width: "100%", background: "var(--line)", borderRadius: 3, overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${Math.min(100, fillPct)}%`,
                          height: "100%",
                          background: isNearFull ? "#FFB800" : "var(--primary)",
                          borderRadius: 3,
                        }}
                      />
                    </div>
                  </div>

                  {/* Temperature & Humidity Sensors */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--line)", fontSize: 11.5 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span>🌡️ Ambient Temp:</span>
                      <strong style={{ color: Number(r.ambientTempC) > Number(r.maxTempThresholdC) ? "#FF3B56" : "var(--ink)" }}>
                        {r.ambientTempC || 26}°C
                      </strong>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span>💧 Humidity:</span>
                      <strong style={{ color: Number(r.humidityPct) > Number(r.maxHumidityPct) ? "#FF3B56" : "var(--ink)" }}>
                        {r.humidityPct || 15}%
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={() => navigate("/biomass/storage/create")}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "1px solid var(--primary)",
                      background: "var(--primary-tint)",
                      color: "var(--primary-deep)",
                      fontWeight: 800,
                      fontSize: 11.5,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <i className="ri-stack-line" /> Allocate Stack
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(r)}
                    title="Edit Room Parameters"
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "1px solid var(--line)",
                      background: "var(--canvas)",
                      color: "var(--ink-secondary)",
                      fontWeight: 700,
                      fontSize: 11.5,
                      cursor: "pointer",
                    }}
                  >
                    <i className="ri-edit-line" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(r.id, r.name)}
                    title="Delete Room"
                    style={{
                      padding: "8px 10px",
                      borderRadius: 8,
                      border: "1px solid rgba(255,59,86,0.3)",
                      background: "rgba(255,59,86,0.08)",
                      color: "#FF3B56",
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    <i className="ri-delete-bin-line" />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredRooms.length === 0 && (
            <div style={{ gridColumn: "1 / -1", padding: 32, textAlign: "center", background: "var(--surface)", borderRadius: 14, border: "1px solid var(--line)" }}>
              <i className="ri-door-open-line" style={{ fontSize: 36, color: "var(--muted)", marginBottom: 10 }} />
              <h3 style={{ margin: "0 0 6px", color: "var(--ink)" }}>No Storage Rooms Found</h3>
              <p style={{ margin: "0 0 14px", fontSize: 13, color: "var(--muted)" }}>
                Click below to create your first custom named storage room, godown, or silo.
              </p>
              <Button onClick={handleOpenAdd}>
                <i className="ri-add-line" style={{ marginRight: 6 }} /> Create Storage Room / Godown
              </Button>
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 2: FULL DATA TABLE */}
      {viewMode === "table" && (
        <Card title="All Storage Rooms & Godown Facilities">
          <DataTable
            keyField="id"
            rows={filteredRooms}
            searchable
            searchPlaceholder="Search room code, name, zone, warehouse..."
            emptyMessage="No storage rooms found."
            columns={[
              {
                key: "name",
                label: "Room / Godown Name",
                emphasize: true,
                render: (r) => (
                  <div>
                    <strong style={{ color: "var(--ink)", fontSize: 13 }}>{r.name}</strong>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>Code: {r.roomCode} | {r.zone}</div>
                  </div>
                ),
              },
              { key: "roomType", label: "Facility Type" },
              { key: "warehouseName", label: "Warehouse Facility" },
              {
                key: "capacityMt",
                label: "Capacity & Stock",
                render: (r) => (
                  <div>
                    <strong>{r.capacityMt?.toLocaleString("en-IN")} MT</strong>
                    <div style={{ fontSize: 11, color: "#00F59B" }}>
                      Stock: {r.currentStockMt?.toLocaleString("en-IN") || 0} MT
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
                      onClick={() => navigate("/biomass/storage/create")}
                      style={{
                        padding: "4px 8px",
                        borderRadius: 6,
                        border: "1px solid var(--primary)",
                        background: "var(--primary-tint)",
                        color: "var(--primary-deep)",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Allocate
                    </button>
                    <button
                      onClick={() => handleOpenEdit(r)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: 6,
                        border: "1px solid var(--line)",
                        background: "var(--canvas)",
                        color: "var(--ink)",
                        fontSize: 11,
                        cursor: "pointer",
                      }}
                    >
                      Edit
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
      )}

      {/* MODAL: CREATE STORAGE ROOM */}
      <Modal open={isAddModalOpen} title="Create New Storage Room / Godown / Silo" onClose={() => setIsAddModalOpen(false)}>
        <form onSubmit={handleAddSubmit}>
          <FormField
            label="Room / Godown Name (Particular Name) *"
            required
            value={roomForm.name}
            onChange={(val) => setRoomForm((f) => ({ ...f, name: val }))}
            placeholder="e.g. Godown 01 - High Density Baler Bay or Cold Storage Room A-02"
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
            <FormField
              label="Room Identifier Code"
              value={roomForm.roomCode}
              onChange={(val) => setRoomForm((f) => ({ ...f, roomCode: val }))}
              placeholder="e.g. GDW-01 or RM-102"
            />
            <FormField
              label="Facility / Room Type"
              type="select"
              required
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
              label="Warehouse Facility Assignment"
              type="select"
              required
              value={roomForm.warehouseCode}
              onChange={(val) => setRoomForm((f) => ({ ...f, warehouseCode: val }))}
              options={
                warehouses.length > 0
                  ? warehouses.map((w) => ({ value: w.id, label: `${w.name} (${w.code})` }))
                  : [{ value: DEFAULT_WAREHOUSE_TCC.code, label: DEFAULT_WAREHOUSE_TCC.name }]
              }
            />
            <FormField
              label="Zone / Shed Area"
              type="select"
              required
              value={roomForm.zone}
              onChange={(val) => setRoomForm((f) => ({ ...f, zone: val }))}
              options={[
                { value: "Zone A", label: "Zone A (Covered Shed 1)" },
                { value: "Zone B", label: "Zone B (Covered Shed 2)" },
                { value: "Zone C", label: "Zone C (North Yard)" },
                { value: "Zone D", label: "Zone D (South Silo Bay)" },
              ]}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
            <FormField
              label="Rated Storage Capacity (MT) *"
              type="number"
              required
              value={roomForm.capacityMt}
              onChange={(val) => setRoomForm((f) => ({ ...f, capacityMt: val }))}
              placeholder="2500"
            />
            <FormField
              label="Assigned Room Supervisor"
              value={roomForm.supervisorName}
              onChange={(val) => setRoomForm((f) => ({ ...f, supervisorName: val }))}
              placeholder="e.g. Ramesh Chandra"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
            <FormField
              label="Max Safe Temperature Limit (°C)"
              type="number"
              value={roomForm.maxTempThresholdC}
              onChange={(val) => setRoomForm((f) => ({ ...f, maxTempThresholdC: val }))}
              placeholder="32"
            />
            <FormField
              label="Max Safe Humidity Limit (%)"
              type="number"
              value={roomForm.maxHumidityPct}
              onChange={(val) => setRoomForm((f) => ({ ...f, maxHumidityPct: val }))}
              placeholder="18.0"
            />
          </div>

          <FormField
            label="Ventilation & Equipment Notes"
            value={roomForm.notes}
            onChange={(val) => setRoomForm((f) => ({ ...f, notes: val }))}
            placeholder="e.g. Equipped with 4 high-speed exhaust blowers and automated wireless thermal probes."
          />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
            <Button variant="secondary" type="button" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Creating…" : "Create Storage Room"}</Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: EDIT STORAGE ROOM */}
      <Modal open={Boolean(editingRoom)} title={`Edit: ${editingRoom?.name || "Storage Room"}`} onClose={() => setEditingRoom(null)}>
        <form onSubmit={handleEditSubmit}>
          <FormField
            label="Room / Godown Name *"
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
              label="Rated Storage Capacity (MT) *"
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
