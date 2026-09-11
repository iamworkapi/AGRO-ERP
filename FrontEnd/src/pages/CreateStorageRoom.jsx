import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import FormField from "../components/common/FormField";
import { useWarehouses } from "../features/warehouses/useWarehouses";
import {
  DEFAULT_WAREHOUSE_TCC,
  saveNewStorageRoom,
  generateWarehouseRoomCode,
  getWarehouseCodePrefix,
} from "../features/biomass/biomassService";
import { toast } from "../utils/toast";

export default function CreateStorageRoom() {
  const navigate = useNavigate();
  const { warehouses } = useWarehouses();

  const initialWh = warehouses[0] || DEFAULT_WAREHOUSE_TCC;
  const initialWhCode = initialWh?.code || initialWh?.id || DEFAULT_WAREHOUSE_TCC.code;
  const initialWhName = initialWh?.name || DEFAULT_WAREHOUSE_TCC.name;

  const [form, setForm] = useState(() => ({
    name: "",
    roomCode: generateWarehouseRoomCode(initialWhCode, initialWhName, "Covered Steel Godown"),
    roomType: "Covered Steel Godown",
    warehouseCode: initialWhCode,
    warehouseName: initialWhName,
    zone: "Zone A",
    capacityMt: "3000",
    currentStockMt: "0",
    currentCommodity: "Paddy Straw (Parali Bales)",
    ambientTempC: "27",
    maxTempThresholdC: "32",
    humidityPct: "15.0",
    maxHumidityPct: "18.0",
    supervisorName: "Ramesh Chandra",
    contactMobile: "9876543210",
    status: "ACTIVE / OPERATIONAL",
    notes: "Main covered steel godown equipped with industrial exhaust ventilation and wireless thermal probes.",
  }));

  const [saving, setSaving] = useState(false);

  // Sync warehouse and room code on initial load if warehouses list populates
  useEffect(() => {
    if (warehouses.length > 0) {
      const currentWh = warehouses.find(
        (w) => w.code === form.warehouseCode || w.id === form.warehouseCode
      );
      if (!currentWh) {
        const first = warehouses[0];
        const code = first.code || first.id;
        setForm((prev) => ({
          ...prev,
          warehouseCode: code,
          warehouseName: first.name,
          roomCode: generateWarehouseRoomCode(code, first.name, prev.roomType),
        }));
      }
    }
  }, [warehouses]);

  const set = (key) => (value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  function handleWarehouseChange(selectedCode) {
    const selectedWh = warehouses.find((w) => w.code === selectedCode || w.id === selectedCode) || {
      code: selectedCode,
      name: form.warehouseName,
    };
    const newRoomCode = generateWarehouseRoomCode(selectedWh.code || selectedWh.id, selectedWh.name, form.roomType);
    setForm((prev) => ({
      ...prev,
      warehouseCode: selectedCode,
      warehouseName: selectedWh.name || prev.warehouseName,
      roomCode: newRoomCode,
    }));
  }

  function handleRoomTypeChange(selectedType) {
    const selectedWh = warehouses.find((w) => w.code === form.warehouseCode || w.id === form.warehouseCode) || {
      code: form.warehouseCode,
      name: form.warehouseName,
    };
    const newRoomCode = generateWarehouseRoomCode(selectedWh.code || selectedWh.id, selectedWh.name, selectedType);
    setForm((prev) => ({
      ...prev,
      roomType: selectedType,
      roomCode: newRoomCode,
    }));
  }

  function handleAutoGenerateCode() {
    const selectedWh = warehouses.find((w) => w.code === form.warehouseCode || w.id === form.warehouseCode) || {
      code: form.warehouseCode,
      name: form.warehouseName,
    };
    const newRoomCode = generateWarehouseRoomCode(selectedWh.code || selectedWh.id, selectedWh.name, form.roomType);
    setForm((prev) => ({ ...prev, roomCode: newRoomCode }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Please enter a room or godown name.");
      return;
    }
    if (!form.capacityMt || Number(form.capacityMt) <= 0) {
      toast.error("Please enter a valid storage capacity in MT.");
      return;
    }

    setSaving(true);
    try {
      const selectedWh = warehouses.find((w) => w.id === form.warehouseCode || w.code === form.warehouseCode);
      const whPrefix = getWarehouseCodePrefix(form.warehouseCode, selectedWh?.name || form.warehouseName);
      
      // Ensure the roomCode includes the warehouse identifier
      let cleanCode = form.roomCode.trim().toUpperCase();
      if (!cleanCode.includes(whPrefix)) {
        cleanCode = `${whPrefix}-${cleanCode}`;
      }

      const newObj = {
        name: form.name.trim(),
        roomCode: cleanCode,
        roomType: form.roomType,
        warehouseCode: form.warehouseCode,
        warehouseName: selectedWh ? selectedWh.name : form.warehouseName,
        zone: form.zone,
        capacityMt: parseFloat(form.capacityMt) || 0,
        currentStockMt: parseFloat(form.currentStockMt) || 0,
        currentCommodity: form.currentCommodity.trim(),
        ambientTempC: parseFloat(form.ambientTempC) || 27,
        maxTempThresholdC: parseFloat(form.maxTempThresholdC) || 32,
        humidityPct: parseFloat(form.humidityPct) || 15.0,
        maxHumidityPct: parseFloat(form.maxHumidityPct) || 18.0,
        supervisorName: form.supervisorName.trim(),
        contactMobile: form.contactMobile.trim(),
        status: form.status,
        notes: form.notes.trim(),
      };

      saveNewStorageRoom(newObj);
      toast.success(`Storage Room "${newObj.name}" (${newObj.roomCode}) created successfully!`);
      navigate("/warehouses/rooms");
    } catch (err) {
      toast.error("Failed to create storage room facility.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* PAGE HEADER */}
      <PageHeader
        title="Add Storage Room"
        subtitle="Register a new custom storage room, godown bay, cold chamber, or grain silo facility"
        badge="FACILITY REGISTRATION"
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate("/warehouses/rooms")}
            style={{ fontSize: 12, height: 32 }}
          >
            <i className="ri-arrow-left-line" style={{ marginRight: 4 }} /> Back to Storage Rooms
          </Button>
        }
      />

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* CARD 1: FACILITY IDENTIFICATION & ALLOCATION */}
        <Card
          title="Facility Identification & Classification"
          subtitle="Basic facility naming, unique identifier, type, and hub assignment"
          icon="ri-building-line"
          accent="#00F59B"
          headerStyle={{ padding: "10px 16px" }}
          bodyStyle={{ padding: "14px 16px" }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "10px 14px" }}>
            <FormField
              label="Room / Godown Name"
              required
              compact
              layout="vertical"
              value={form.name}
              onChange={set("name")}
              placeholder="e.g. Godown 03 - High Density Biomass Bay"
            />

            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Room Code <span style={{ color: "var(--status-error)", fontSize: 12, fontWeight: 800 }}>*</span>
                </label>
                <button
                  type="button"
                  onClick={handleAutoGenerateCode}
                  style={{
                    border: "none",
                    background: "var(--primary-tint)",
                    color: "var(--primary-deep)",
                    fontSize: 10.5,
                    fontWeight: 700,
                    padding: "1px 6px",
                    borderRadius: 5,
                    cursor: "pointer",
                  }}
                  title="Generate unique code with warehouse prefix"
                >
                  Auto Generate
                </button>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  borderRadius: 7,
                  border: "1px solid var(--line-strong)",
                  background: "var(--surface)",
                  overflow: "hidden",
                  height: 34,
                }}
              >
                <input
                  type="text"
                  value={form.roomCode}
                  onChange={(e) => set("roomCode")(e.target.value.toUpperCase())}
                  placeholder="e.g. WH-BTT-01-GDW-03"
                  required
                  style={{
                    width: "100%",
                    height: "100%",
                    fontSize: 12.5,
                    fontWeight: 800,
                    color: "var(--ink)",
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    padding: "0 10px",
                    letterSpacing: "0.4px",
                  }}
                />
              </div>
              <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 3 }}>
                Linked to Warehouse Code: <strong style={{ color: "var(--primary)" }}>{form.warehouseCode}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.2fr 1fr", gap: "10px 14px", marginTop: 10 }}>
            <FormField
              label="Facility / Chamber Type"
              type="select"
              required
              compact
              layout="vertical"
              value={form.roomType}
              onChange={handleRoomTypeChange}
              options={[
                { value: "Covered Steel Godown", label: "Covered Steel Godown" },
                { value: "Controlled Atmosphere Cold Chamber", label: "Controlled Atmosphere Cold Chamber" },
                { value: "Corrugated Metal Silo Tower", label: "Corrugated Metal Silo Tower" },
                { value: "Open Yard Stack Bay", label: "Open Yard Stack Bay" },
                { value: "Fumigated Seed Storage Bay", label: "Fumigated Seed Storage Bay" },
              ]}
            />

            <FormField
              label="Procurement Hub Facility"
              type="select"
              required
              compact
              layout="vertical"
              value={form.warehouseCode}
              onChange={handleWarehouseChange}
              options={
                warehouses.length > 0
                  ? warehouses.map((w) => ({ value: w.code || w.id, label: `${w.name} (${w.code || w.id})` }))
                  : [{ value: DEFAULT_WAREHOUSE_TCC.code, label: DEFAULT_WAREHOUSE_TCC.name }]
              }
            />

            <FormField
              label="Storage Zone / Sector"
              type="select"
              required
              compact
              layout="vertical"
              value={form.zone}
              onChange={set("zone")}
              options={[
                { value: "Zone A", label: "Zone A (Covered Shed 1)" },
                { value: "Zone B", label: "Zone B (Covered Shed 2)" },
                { value: "Zone C", label: "Zone C (North Yard)" },
                { value: "Zone D", label: "Zone D (South Silo Bay)" },
                { value: "Zone E", label: "Zone E (Open Extension)" },
              ]}
            />
          </div>
        </Card>

        {/* CARD 2: CAPACITY & STOCK PARTICULARS */}
        <Card
          title="Capacity & Stock Management"
          subtitle="Storage ratings, initial intake volume, and commodity assignments"
          icon="ri-stack-line"
          accent="#00D2FF"
          headerStyle={{ padding: "10px 16px" }}
          bodyStyle={{ padding: "14px 16px" }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.3fr 1fr", gap: "10px 14px" }}>
            <FormField
              label="Rated Capacity (MT)"
              type="number"
              required
              compact
              layout="vertical"
              value={form.capacityMt}
              onChange={set("capacityMt")}
              placeholder="3000"
            />

            <FormField
              label="Initial Stored Stock (MT)"
              type="number"
              compact
              layout="vertical"
              value={form.currentStockMt}
              onChange={set("currentStockMt")}
              placeholder="0"
            />

            <FormField
              label="Primary Commodity Stored"
              compact
              layout="vertical"
              value={form.currentCommodity}
              onChange={set("currentCommodity")}
              placeholder="e.g. Paddy Straw (Parali Bales)"
            />

            <FormField
              label="Operational Status"
              type="select"
              compact
              layout="vertical"
              value={form.status}
              onChange={set("status")}
              options={[
                { value: "ACTIVE / OPERATIONAL", label: "Active / Operational" },
                { value: "UNDER MAINTENANCE", label: "Under Maintenance" },
                { value: "SEASONAL BUFFER", label: "Seasonal Buffer" },
              ]}
            />
          </div>
        </Card>

        {/* CARD 3: CLIMATE TELEMETRY & SUPERVISION */}
        <Card
          title="Climate Telemetry, Supervision & Notes"
          subtitle="IoT sensor thresholds, assigned facility supervisor, and notes"
          icon="ri-temp-cold-line"
          accent="#A855F7"
          headerStyle={{ padding: "10px 16px" }}
          bodyStyle={{ padding: "14px 16px" }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "10px 14px" }}>
            <FormField
              label="Ambient Temp (°C)"
              type="number"
              compact
              layout="vertical"
              value={form.ambientTempC}
              onChange={set("ambientTempC")}
              placeholder="27"
            />

            <FormField
              label="Max Temp Limit (°C)"
              type="number"
              compact
              layout="vertical"
              value={form.maxTempThresholdC}
              onChange={set("maxTempThresholdC")}
              placeholder="32"
            />

            <FormField
              label="Humidity (%)"
              type="number"
              compact
              layout="vertical"
              value={form.humidityPct}
              onChange={set("humidityPct")}
              placeholder="15.0"
            />

            <FormField
              label="Max Humidity (%)"
              type="number"
              compact
              layout="vertical"
              value={form.maxHumidityPct}
              onChange={set("maxHumidityPct")}
              placeholder="18.0"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "10px 14px", marginTop: 10 }}>
            <FormField
              label="Facility Supervisor"
              compact
              layout="vertical"
              value={form.supervisorName}
              onChange={set("supervisorName")}
              placeholder="e.g. Ramesh Chandra"
            />

            <FormField
              label="Contact Mobile"
              compact
              layout="vertical"
              isPhone
              value={form.contactMobile}
              onChange={set("contactMobile")}
              placeholder="9876543210"
            />
          </div>

          <div style={{ marginTop: 10 }}>
            <FormField
              label="Equipment & Ventilation Notes"
              type="textarea"
              compact
              rows={2}
              layout="vertical"
              value={form.notes}
              onChange={set("notes")}
              placeholder="e.g. Equipped with 4 high-speed exhaust blowers, automatic wireless thermal probes, and heavy fire suppression reels."
            />
          </div>
        </Card>

        {/* BOTTOM ACTION BAR */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 10,
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 12,
            padding: "10px 16px",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <Button
            variant="secondary"
            size="sm"
            type="button"
            onClick={() => navigate("/warehouses/rooms")}
            style={{ fontSize: 12, height: 32, padding: "0 16px" }}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            size="sm"
            disabled={saving}
            style={{
              fontSize: 12,
              height: 32,
              padding: "0 20px",
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            {saving ? (
              <>
                <i className="ri-loader-4-line spin" /> Creating...
              </>
            ) : (
              <>
                <i className="ri-check-line" /> Create Storage Room
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
