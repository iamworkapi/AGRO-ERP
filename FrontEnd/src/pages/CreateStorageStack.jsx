import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import Button from "../components/common/Button";
import { useWarehouses } from "../features/warehouses/useWarehouses";
import { useAuth } from "../hooks/useAuth";
import {
  DEFAULT_WAREHOUSE_TCC,
  saveNewStack,
} from "../features/biomass/biomassService";
import { toast } from "../utils/toast";

export default function CreateStorageStack() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isScopedRole = user?.roleKey === "supervisor" || user?.roleKey === "warehouse_admin";
  const { warehouses } = useWarehouses();
  const myWarehouse = isScopedRole ? warehouses[0] : null;

  // Form State
  const [warehouseId, setWarehouseId] = useState(() => myWarehouse?.id || DEFAULT_WAREHOUSE_TCC.code);
  const [zone, setZone] = useState("Zone A (Covered Shed 1)");
  const [stackCode, setStackCode] = useState(`STACK-A-${Math.floor(100 + Math.random() * 900)}`);
  
  // Commodity & Volume
  const [cropName, setCropName] = useState("Paddy Straw");
  const [baleFormat, setBaleFormat] = useState("Square High-Density Bales (500kg)");
  const [tonnageMt, setTonnageMt] = useState("1000");
  const [baleCount, setBaleCount] = useState("3300");
  
  // Quality & Safety Probes
  const [moisturePct, setMoisturePct] = useState("14.5");
  const [probeSensorId, setProbeSensorId] = useState(`PROBE-IOT-${Math.floor(1000 + Math.random() * 9000)}`);
  const [probeTempC, setProbeTempC] = useState("28");
  const [tarpStatus, setTarpStatus] = useState("Waterproof Heavy PVC Tarp Covered");
  
  // Supervision & Date
  const [supervisorName, setSupervisorName] = useState(user?.name || DEFAULT_WAREHOUSE_TCC.supervisorName);
  const [stackDate, setStackDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [targetBuyer, setTargetBuyer] = useState("Open Pool / Industrial Factory Queue");
  const [notes, setNotes] = useState("");

  const [saving, setSaving] = useState(false);

  function handleAutoGenerateCode() {
    const zoneLetter = zone.includes("Zone B") ? "B" : zone.includes("Zone C") ? "C" : zone.includes("Zone D") ? "D" : "A";
    setStackCode(`STACK-${zoneLetter}-${Math.floor(100 + Math.random() * 900)}`);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!stackCode.trim()) {
      toast.error("Please enter a Stack Identifier Code");
      return;
    }
    if (!tonnageMt || Number(tonnageMt) <= 0) {
      toast.error("Please enter a valid Stack Weight in Metric Tons");
      return;
    }

    setSaving(true);
    try {
      const cropBadges = {
        "Paddy Straw": { bg: "rgba(93, 214, 44, 0.15)", color: "#5DD62C" },
        "Maize Stem": { bg: "rgba(255, 184, 0, 0.15)", color: "#FFB800" },
        "Wheat Straw": { bg: "rgba(0, 210, 255, 0.15)", color: "#00D2FF" },
        "Mustard Husk": { bg: "rgba(168, 85, 247, 0.15)", color: "#A855F7" },
        "Rice Husk": { bg: "rgba(236, 72, 153, 0.15)", color: "#EC4899" },
        "Grain & Wheat Bags": { bg: "rgba(245, 158, 11, 0.15)", color: "#F59E0B" },
      };

      const badgeInfo = cropBadges[cropName] || { bg: "rgba(93, 214, 44, 0.15)", color: "#5DD62C" };
      const tempNum = parseFloat(probeTempC) || 28;

      const newStack = {
        stackCode: stackCode.toUpperCase(),
        zone: zone.split(" ")[0] + " " + zone.split(" ")[1],
        fullZoneLabel: zone,
        cropName,
        cropBadge: cropName,
        cropBadgeBg: badgeInfo.bg,
        cropBadgeColor: badgeInfo.color,
        baleFormat,
        tonnageMt: parseFloat(tonnageMt) || 1000,
        baleCount: parseInt(baleCount, 10) || 3000,
        humidityPct: parseFloat(moisturePct) || 14.5,
        probeSensorId,
        probeTempC: tempNum,
        tempStatus: tempNum > 35 ? "Warning" : tempNum > 30 ? "Monitored" : "Normal",
        fireSafetyScore: tempNum > 35 ? "92.0% (Action Required)" : "98.5% (Safe)",
        tarpStatus,
        supervisorName,
        stackDate,
        targetBuyer,
        notes,
        warehouseCode: warehouseId || DEFAULT_WAREHOUSE_TCC.code,
      };

      saveNewStack(newStack);
      toast.success(`Stack "${newStack.stackCode}" registered in ${newStack.zone}!`);
      navigate("/biomass/storage");
    } catch (err) {
      toast.error("Failed to register storage stack entry.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 1000, margin: "0 auto", width: "100%", paddingBottom: 20 }}>
      {/* PAGE HEADER */}
      <PageHeader
        title="Register Storage & Yard Stack Entry"
        subtitle="Allocate raw biomass, compressed bales, or grain stock into designated yard zones & sheds"
        icon="ri-stack-line"
        badge="STACK ALLOCATION"
      />

      <div
        className="app-card"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: 16,
          padding: "16px 20px",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          
          {/* SECTION 1: WAREHOUSE & YARD ZONE ALLOCATION (COMPACT) */}
          <div
            style={{
              background: "var(--canvas)",
              border: "1px solid var(--line)",
              borderRadius: 12,
              padding: "12px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid var(--line)", paddingBottom: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: 6, background: "rgba(93, 214, 44, 0.15)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>
                <i className="ri-building-line" />
              </div>
              <h4 style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "var(--ink)" }}>
                1. Warehouse Facility &amp; Yard Zone Allocation
              </h4>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.5fr 1fr", gap: 10 }} className="responsive-grid-1">
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 4 }}>
                  Warehouse Facility *
                </label>
                <select
                  disabled={isScopedRole}
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(e.target.value)}
                  style={{
                    width: "100%",
                    height: 34,
                    padding: "0 10px",
                    fontSize: 12,
                    fontWeight: 600,
                    borderRadius: 8,
                    border: "1px solid var(--line-strong)",
                    background: "var(--surface)",
                    color: "var(--ink)",
                    outline: "none",
                  }}
                >
                  {warehouses.length > 0 ? (
                    warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.code})
                      </option>
                    ))
                  ) : (
                    <option value={DEFAULT_WAREHOUSE_TCC.code}>{DEFAULT_WAREHOUSE_TCC.name} ({DEFAULT_WAREHOUSE_TCC.code})</option>
                  )}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 4 }}>
                  Designated Yard Zone Location *
                </label>
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  style={{
                    width: "100%",
                    height: 34,
                    padding: "0 10px",
                    fontSize: 12,
                    fontWeight: 600,
                    borderRadius: 8,
                    border: "1px solid var(--line-strong)",
                    background: "var(--surface)",
                    color: "var(--ink)",
                    outline: "none",
                  }}
                >
                  <option value="Zone A (Covered Shed 1 - High Density Baler Bay)">Zone A (Covered Shed 1)</option>
                  <option value="Zone B (Covered Shed 2 - Standard Bale Storage)">Zone B (Covered Shed 2)</option>
                  <option value="Zone C (Open Yard North - Raw Parali Stacks)">Zone C (Open Yard North)</option>
                  <option value="Zone D (Open Yard South - Mustard &amp; Husk Depot)">Zone D (Open Yard South)</option>
                  <option value="Silo 1 (Grain &amp; Offtake Silo Complex)">Silo 1 (Grain Complex)</option>
                </select>
              </div>

              {/* Stack Identifier Code */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)" }}>
                    Stack Code *
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoGenerateCode}
                    style={{
                      background: "rgba(93, 214, 44, 0.12)",
                      border: "1px solid rgba(93, 214, 44, 0.3)",
                      color: "var(--primary)",
                      fontSize: 10,
                      fontWeight: 800,
                      padding: "1px 6px",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  >
                    Auto
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="STACK-A-101"
                  value={stackCode}
                  onChange={(e) => setStackCode(e.target.value)}
                  style={{
                    width: "100%",
                    height: 34,
                    padding: "0 10px",
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: 0.5,
                    borderRadius: 8,
                    border: "1px solid var(--line-strong)",
                    background: "var(--surface)",
                    color: "var(--ink)",
                    outline: "none",
                  }}
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: COMMODITY & VOLUME SPECIFICATIONS */}
          <div
            style={{
              background: "var(--canvas)",
              border: "1px solid var(--line)",
              borderRadius: 12,
              padding: "12px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid var(--line)", paddingBottom: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: 6, background: "rgba(255, 184, 0, 0.15)", color: "#FFB800", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>
                <i className="ri-stack-line" />
              </div>
              <h4 style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "var(--ink)" }}>
                2. Commodity Type &amp; Storage Volume
              </h4>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }} className="responsive-grid-2">
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 4 }}>
                  Commodity Stored *
                </label>
                <select
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  style={{
                    width: "100%",
                    height: 34,
                    padding: "0 10px",
                    fontSize: 12,
                    fontWeight: 600,
                    borderRadius: 8,
                    border: "1px solid var(--line-strong)",
                    background: "var(--surface)",
                    color: "var(--ink)",
                    outline: "none",
                  }}
                >
                  <option value="Paddy Straw">Paddy Straw (Parali)</option>
                  <option value="Maize Stem">Maize Stem / Stalks</option>
                  <option value="Wheat Straw">Wheat Straw (Bhoosa)</option>
                  <option value="Mustard Husk">Mustard Husk (Tuuri)</option>
                  <option value="Rice Husk">Rice Husk</option>
                  <option value="Grain &amp; Wheat Bags">Wheat &amp; Grain Bags</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 4 }}>
                  Bale Format
                </label>
                <select
                  value={baleFormat}
                  onChange={(e) => setBaleFormat(e.target.value)}
                  style={{
                    width: "100%",
                    height: 34,
                    padding: "0 10px",
                    fontSize: 12,
                    fontWeight: 600,
                    borderRadius: 8,
                    border: "1px solid var(--line-strong)",
                    background: "var(--surface)",
                    color: "var(--ink)",
                    outline: "none",
                  }}
                >
                  <option value="Square High-Density Bales (500kg)">Square Bales (500kg)</option>
                  <option value="Round Bales (300kg)">Round Bales (300kg)</option>
                  <option value="Standard Loose Bundles">Loose Bundles</option>
                  <option value="Loose Bulk / Shredded">Loose Bulk</option>
                  <option value="Jute Gunny Bags (50kg)">Gunny Bags (50kg)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 4 }}>
                  Stack Weight (MT) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="1000"
                  value={tonnageMt}
                  onChange={(e) => setTonnageMt(e.target.value)}
                  style={{
                    width: "100%",
                    height: 34,
                    padding: "0 10px",
                    fontSize: 12,
                    fontWeight: 700,
                    borderRadius: 8,
                    border: "1px solid var(--line-strong)",
                    background: "var(--surface)",
                    color: "var(--ink)",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 4 }}>
                  Total Bale Count *
                </label>
                <input
                  type="number"
                  required
                  placeholder="3300"
                  value={baleCount}
                  onChange={(e) => setBaleCount(e.target.value)}
                  style={{
                    width: "100%",
                    height: 34,
                    padding: "0 10px",
                    fontSize: 12,
                    fontWeight: 700,
                    borderRadius: 8,
                    border: "1px solid var(--line-strong)",
                    background: "var(--surface)",
                    color: "var(--ink)",
                    outline: "none",
                  }}
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: QUALITY, MOISTURE & IOT THERMAL PROBES */}
          <div
            style={{
              background: "var(--canvas)",
              border: "1px solid var(--line)",
              borderRadius: 12,
              padding: "12px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid var(--line)", paddingBottom: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: 6, background: "rgba(0, 210, 255, 0.15)", color: "#00D2FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>
                <i className="ri-temp-hot-line" />
              </div>
              <h4 style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "var(--ink)" }}>
                3. Quality, Moisture &amp; Wireless IoT Telemetry
              </h4>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }} className="responsive-grid-2">
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 4 }}>
                  Moisture (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="14.5"
                  value={moisturePct}
                  onChange={(e) => setMoisturePct(e.target.value)}
                  style={{
                    width: "100%",
                    height: 34,
                    padding: "0 10px",
                    fontSize: 12,
                    fontWeight: 700,
                    borderRadius: 8,
                    border: "1px solid var(--line-strong)",
                    background: "var(--surface)",
                    color: "var(--ink)",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 4 }}>
                  Thermal Probe (°C)
                </label>
                <input
                  type="number"
                  placeholder="28"
                  value={probeTempC}
                  onChange={(e) => setProbeTempC(e.target.value)}
                  style={{
                    width: "100%",
                    height: 34,
                    padding: "0 10px",
                    fontSize: 12,
                    fontWeight: 700,
                    borderRadius: 8,
                    border: "1px solid var(--line-strong)",
                    background: "var(--surface)",
                    color: "var(--ink)",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 4 }}>
                  IoT Probe ID
                </label>
                <input
                  type="text"
                  placeholder="PROBE-IOT-9921"
                  value={probeSensorId}
                  onChange={(e) => setProbeSensorId(e.target.value)}
                  style={{
                    width: "100%",
                    height: 34,
                    padding: "0 10px",
                    fontSize: 12,
                    fontWeight: 700,
                    borderRadius: 8,
                    border: "1px solid var(--line-strong)",
                    background: "var(--surface)",
                    color: "var(--ink)",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 4 }}>
                  Weather / Tarp Status
                </label>
                <select
                  value={tarpStatus}
                  onChange={(e) => setTarpStatus(e.target.value)}
                  style={{
                    width: "100%",
                    height: 34,
                    padding: "0 10px",
                    fontSize: 12,
                    fontWeight: 600,
                    borderRadius: 8,
                    border: "1px solid var(--line-strong)",
                    background: "var(--surface)",
                    color: "var(--ink)",
                    outline: "none",
                  }}
                >
                  <option value="Waterproof Heavy PVC Tarp Covered">PVC Tarp Covered</option>
                  <option value="Fire-Retardant Canvas Sheeting">Fire Canvas Sheeting</option>
                  <option value="Open Air Aerated Stack (Dry Season)">Open Air Stack</option>
                  <option value="Under Covered Steel Shed Roof">Covered Shed Roof</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 4: SUPERVISOR & COMPLETION DETAILS */}
          <div
            style={{
              background: "var(--canvas)",
              border: "1px solid var(--line)",
              borderRadius: 12,
              padding: "12px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid var(--line)", paddingBottom: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: 6, background: "rgba(168, 85, 247, 0.15)", color: "#A855F7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>
                <i className="ri-user-settings-line" />
              </div>
              <h4 style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "var(--ink)" }}>
                4. Yard Supervision &amp; Factory Dispatch Queue
              </h4>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.5fr", gap: 10 }} className="responsive-grid-1">
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 4 }}>
                  Yard Supervisor
                </label>
                <input
                  type="text"
                  placeholder="Ramesh Chandra"
                  value={supervisorName}
                  onChange={(e) => setSupervisorName(e.target.value)}
                  style={{
                    width: "100%",
                    height: 34,
                    padding: "0 10px",
                    fontSize: 12,
                    fontWeight: 600,
                    borderRadius: 8,
                    border: "1px solid var(--line-strong)",
                    background: "var(--surface)",
                    color: "var(--ink)",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 4 }}>
                  Stack Date
                </label>
                <input
                  type="date"
                  value={stackDate}
                  onChange={(e) => setStackDate(e.target.value)}
                  style={{
                    width: "100%",
                    height: 34,
                    padding: "0 10px",
                    fontSize: 12,
                    fontWeight: 600,
                    borderRadius: 8,
                    border: "1px solid var(--line-strong)",
                    background: "var(--surface)",
                    color: "var(--ink)",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 4 }}>
                  Target Offtake Queue
                </label>
                <select
                  value={targetBuyer}
                  onChange={(e) => setTargetBuyer(e.target.value)}
                  style={{
                    width: "100%",
                    height: 34,
                    padding: "0 10px",
                    fontSize: 12,
                    fontWeight: 600,
                    borderRadius: 8,
                    border: "1px solid var(--line-strong)",
                    background: "var(--surface)",
                    color: "var(--ink)",
                    outline: "none",
                  }}
                >
                  <option value="Open Pool / Industrial Factory Queue">Open Pool / Factory Queue</option>
                  <option value="Reserved: Reliance Industries CBG Project">Reliance CBG Project</option>
                  <option value="Reserved: Balrampur Chini Mills Bio-Ethanol">Balrampur Chini Mills</option>
                  <option value="Reserved: NTPC Biomass Thermal Co-firing">NTPC Biomass Co-firing</option>
                  <option value="Internal Seed &amp; Animal Feed Depot">Internal Seed Depot</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 4 }}>
                Additional Remarks / Notes
              </label>
              <input
                type="text"
                placeholder="e.g. Stacked via hydraulic baler. All 4 sides tarped with tie-downs."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{
                  width: "100%",
                  height: 34,
                  padding: "0 10px",
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid var(--line-strong)",
                  background: "var(--surface)",
                  color: "var(--ink)",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, borderTop: "1px solid var(--line)", paddingTop: 12 }}>
            <Button variant="secondary" size="sm" type="button" onClick={() => navigate("/biomass/storage")}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={saving}>
              {saving ? "Registering Stack…" : "Confirm & Save Storage Stack ➔"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
