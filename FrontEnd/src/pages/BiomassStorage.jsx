import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import Modal from "../components/common/Modal";
import FormField from "../components/common/FormField";
import {
  DEFAULT_WAREHOUSE_TCC,
  getStoredStacks,
  saveNewStack,
  updateStack,
  deleteStack,
} from "../features/biomass/biomassService";
import { toast } from "../utils/toast";

export default function BiomassStorage() {
  const navigate = useNavigate();
  const [stacks, setStacks] = useState(getStoredStacks);
  const [selectedCropFilter, setSelectedCropFilter] = useState("ALL");
  const [selectedZoneFilter, setSelectedZoneFilter] = useState("ALL");

  // Modals
  const [isAddStackModalOpen, setIsAddStackModalOpen] = useState(false);
  const [selectedStackForAudit, setSelectedStackForAudit] = useState(null);
  const [probeTempInput, setProbeTempInput] = useState("");

  // New Stack Form
  const [newStackCode, setNewStackCode] = useState("");
  const [newZone, setNewZone] = useState("Zone A");
  const [newCrop, setNewCrop] = useState("Paddy Straw");
  const [newTonnage, setNewTonnage] = useState("1000");
  const [newBales, setNewBales] = useState("3300");
  const [newProbeTemp, setNewProbeTemp] = useState("28");

  // Filtered Stacks
  const filteredStacks = useMemo(() => {
    return stacks.filter((s) => {
      const matchCrop =
        selectedCropFilter === "ALL" ||
        s.cropName?.toLowerCase().includes(selectedCropFilter.toLowerCase()) ||
        s.cropId === selectedCropFilter;
      const matchZone = selectedZoneFilter === "ALL" || s.zone === selectedZoneFilter;
      return matchCrop && matchZone;
    });
  }, [stacks, selectedCropFilter, selectedZoneFilter]);

  // Aggregate Metrics
  const totalYardStockMt = useMemo(() => stacks.reduce((s, st) => s + (Number(st.tonnageMt) || 0), 0), [stacks]);
  const totalYardBales = useMemo(() => stacks.reduce((s, st) => s + (Number(st.baleCount) || 0), 0), [stacks]);
  const totalCapacityMt = DEFAULT_WAREHOUSE_TCC.totalCapacityMt || 10000;
  const yardUtilizationPct = Math.min(100, Math.round((totalYardStockMt / totalCapacityMt) * 100));

  function handleCreateStack(e) {
    e.preventDefault();
    const cropBadges = {
      "Paddy Straw": { bg: "rgba(93,214,44,0.15)", color: "#5DD62C" },
      "Maize Stem": { bg: "rgba(255,184,0,0.15)", color: "#FFB800" },
      "Wheat Straw": { bg: "rgba(0,210,255,0.15)", color: "#00D2FF" },
      "Mustard Husk": { bg: "rgba(168,85,247,0.15)", color: "#A855F7" },
    };

    const badgeInfo = cropBadges[newCrop] || { bg: "rgba(93,214,44,0.15)", color: "#5DD62C" };

    const newObj = {
      stackCode: newStackCode || `STACK-${newZone.replace(" ", "")}-${Math.floor(100 + Math.random() * 900)}`,
      zone: newZone,
      cropName: newCrop,
      cropBadge: newCrop,
      cropBadgeBg: badgeInfo.bg,
      cropBadgeColor: badgeInfo.color,
      tonnageMt: parseFloat(newTonnage) || 1000,
      baleCount: parseInt(newBales, 10) || 3000,
      probeTempC: parseInt(newProbeTemp, 10) || 28,
      tempStatus: parseInt(newProbeTemp, 10) > 35 ? "Warning" : parseInt(newProbeTemp, 10) > 30 ? "Monitored" : "Normal",
      fireSafetyScore: parseInt(newProbeTemp, 10) > 35 ? "92.0% (Action Required)" : "98.5% (Safe)",
      humidityPct: 15.5,
      stackDate: new Date().toISOString().slice(0, 10),
      warehouseCode: DEFAULT_WAREHOUSE_TCC.code,
    };

    const updated = saveNewStack(newObj);
    setStacks(updated);
    setIsAddStackModalOpen(false);
    toast.success(`New Stack "${newObj.stackCode}" allocated in ${newZone}!`);
    setNewStackCode("");
  }

  function handleOpenAudit(st) {
    setSelectedStackForAudit(st);
    setProbeTempInput(String(st.probeTempC || 28));
  }

  function handleUpdateTempSubmit(e) {
    e.preventDefault();
    if (!selectedStackForAudit) return;

    const tempNum = Number(probeTempInput);
    const tempStatus = tempNum > 35 ? "Warning" : tempNum > 30 ? "Monitored" : "Normal";
    const fireSafetyScore = tempNum > 35 ? "92.0% (Action Required)" : "98.5% (Safe)";

    const updated = updateStack(selectedStackForAudit.id, {
      probeTempC: tempNum,
      tempStatus,
      fireSafetyScore,
    });
    setStacks(updated);
    setSelectedStackForAudit(null);
    toast.success(`Probe temperature updated to ${tempNum}°C for ${selectedStackForAudit.stackCode}`);
  }

  function handleDeleteStack(id, code) {
    if (window.confirm(`Are you sure you want to de-allocate Stack ${code}?`)) {
      const updated = deleteStack(id);
      setStacks(updated);
      toast.success(`Stack ${code} de-allocated successfully.`);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, position: "relative" }}>
      {/* PAGE HEADER */}
      <PageHeader
        title="Storage & Yard Stacking"
        subtitle="Transit Collection Centre (TCC) • Multi-Zone Yard Stacks, Voxel Grid & Combustion Telemetry"
        icon="ri-stack-line"
        badge="TCC YARD NODE WB-01"
      />

      {/* TOP SPATIAL KPI METRICS STRIP */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        {/* Metric 1: Total Yard Stock */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 16,
            padding: "16px 18px",
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "var(--primary)", letterSpacing: "-0.02em" }}>
              {totalYardStockMt.toLocaleString("en-IN")} MT
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", marginTop: 2 }}>
              Total Yard Biomass
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
              Capacity: {totalCapacityMt.toLocaleString("en-IN")} MT ({yardUtilizationPct}%)
            </div>
          </div>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(93, 214, 44, 0.15)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            <i className="ri-stack-line" />
          </div>
        </div>

        {/* Metric 2: Total Stored Bales */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 16,
            padding: "16px 18px",
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#00D2FF", letterSpacing: "-0.02em" }}>
              {totalYardBales.toLocaleString("en-IN")} Bales
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", marginTop: 2 }}>
              Stored Bale Volume
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
              High-density square &amp; round bales
            </div>
          </div>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(0, 210, 255, 0.15)", color: "#00D2FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            <i className="ri-archive-line" />
          </div>
        </div>

        {/* Metric 3: Fire Safety & Thermal Probes */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 16,
            padding: "16px 18px",
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#FFB800", letterSpacing: "-0.02em" }}>
              98.5% (Safe)
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", marginTop: 2 }}>
              Combustion Risk Score
            </div>
            <div style={{ fontSize: 11, color: "var(--primary)", fontWeight: 700, marginTop: 4 }}>
              IoT Probes Sub-Threshold
            </div>
          </div>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(255, 184, 0, 0.15)", color: "#FFB800", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            <i className="ri-shield-check-line" />
          </div>
        </div>

        {/* Metric 4: Active Yard Stacks */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 16,
            padding: "16px 18px",
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "var(--ink)", letterSpacing: "-0.02em" }}>
              {stacks.length} Stacks
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", marginTop: 2 }}>
              Monitored Stack Zones
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
              Active across Zone A, B, C &amp; D
            </div>
          </div>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(168, 85, 247, 0.15)", color: "#A855F7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            <i className="ri-map-pin-2-line" />
          </div>
        </div>
      </div>

      {/* FILTER CONTROLS & ALLOCATION TOOLBAR */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: 14,
          padding: "10px 16px",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {/* Crop Filter */}
          <select
            value={selectedCropFilter}
            onChange={(e) => setSelectedCropFilter(e.target.value)}
            style={{
              height: 34,
              padding: "0 10px",
              fontSize: 12,
              fontWeight: 700,
              borderRadius: 8,
              border: "1px solid var(--line-strong)",
              background: "var(--canvas)",
              color: "var(--ink)",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="ALL">All Stored Commodities</option>
            <option value="paddy">Paddy Straw (Bales)</option>
            <option value="maize">Maize Stem / Stalks</option>
            <option value="wheat">Wheat Straw</option>
            <option value="mustard">Mustard Husk</option>
          </select>

          {/* Zone Filter */}
          <select
            value={selectedZoneFilter}
            onChange={(e) => setSelectedZoneFilter(e.target.value)}
            style={{
              height: 34,
              padding: "0 10px",
              fontSize: 12,
              fontWeight: 700,
              borderRadius: 8,
              border: "1px solid var(--line-strong)",
              background: "var(--canvas)",
              color: "var(--ink)",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="ALL">All Yard Zones (A, B, C, D)</option>
            <option value="Zone A">Zone A (Covered Shed 1)</option>
            <option value="Zone B">Zone B (Covered Shed 2)</option>
            <option value="Zone C">Zone C (Open Yard North)</option>
            <option value="Zone D">Zone D (Open Yard South)</option>
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 700 }}>
            Showing: <strong style={{ color: "var(--ink)" }}>{filteredStacks.length}</strong> active stacks
          </span>

          <Button
            size="sm"
            variant="primary"
            icon="ri-add-line"
            onClick={() => setIsAddStackModalOpen(true)}
            style={{ height: 34, fontSize: 12, padding: "0 12px" }}
          >
            Allocate New Stack
          </Button>
        </div>
      </div>

      {/* MAIN 2-COLUMN YARD COMMAND SECTION */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 2fr", gap: 16 }} className="responsive-grid-1">
        {/* LEFT PANEL: WAREHOUSE & TCC SPECIFICATIONS */}
        <div
          className="app-card"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 18,
            padding: "18px 20px",
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--line)", paddingBottom: 10 }}>
            <span style={{ fontSize: 12.5, fontWeight: 800, textTransform: "uppercase", color: "var(--ink)", letterSpacing: 0.3 }}>
              Facility &amp; Yard Telemetry
            </span>
            <Badge tone="success">LIVE LOAD CELLS</Badge>
          </div>

          {/* Center Name Card */}
          <div style={{ background: "rgba(93, 214, 44, 0.08)", border: "1px solid rgba(93, 214, 44, 0.25)", borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ fontSize: 14.5, fontWeight: 800, color: "var(--ink)", lineHeight: 1.3 }}>
              {DEFAULT_WAREHOUSE_TCC.name}
            </div>
            <div style={{ fontSize: 11.5, fontWeight: 800, color: "var(--primary)", marginTop: 4 }}>
              Node Identifier: {DEFAULT_WAREHOUSE_TCC.code}
            </div>
          </div>

          {/* Capacity Utilization Progress Bar */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 5 }}>
              <span style={{ color: "var(--muted)", fontWeight: 600 }}>Yard Storage Occupancy:</span>
              <strong style={{ color: "var(--ink)" }}>{yardUtilizationPct}% Full</strong>
            </div>
            <div style={{ width: "100%", height: 8, background: "var(--line)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ width: `${yardUtilizationPct}%`, height: "100%", background: "var(--primary)", borderRadius: 4 }} />
            </div>
          </div>

          {/* Sourcing Area & Storage Capacity Grid */}
          <div
            style={{
              background: "var(--canvas)",
              border: "1px solid var(--line)",
              borderRadius: 12,
              padding: "12px 14px",
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr",
              gap: 10,
              fontSize: 11.5,
            }}
          >
            <div>
              <span style={{ color: "var(--muted)", display: "block", fontSize: 10.5 }}>Sourcing Radius:</span>
              <strong style={{ color: "var(--ink)" }}>{DEFAULT_WAREHOUSE_TCC.sourcingArea}</strong>
            </div>

            <div>
              <span style={{ color: "var(--muted)", display: "block", fontSize: 10.5 }}>Max Yard Capacity:</span>
              <strong style={{ color: "var(--ink)" }}>{DEFAULT_WAREHOUSE_TCC.totalCapacityMt.toLocaleString("en-IN")} MT</strong>
            </div>

            <div style={{ borderTop: "1px dashed var(--line)", paddingTop: 6 }}>
              <span style={{ color: "var(--muted)", display: "block", fontSize: 10.5 }}>Current Stored Stock:</span>
              <strong style={{ color: "var(--primary)", fontSize: 12.5 }}>{totalYardStockMt.toLocaleString("en-IN")} MT</strong>
            </div>

            <div style={{ borderTop: "1px dashed var(--line)", paddingTop: 6 }}>
              <span style={{ color: "var(--muted)", display: "block", fontSize: 10.5 }}>Total Bales Count:</span>
              <strong style={{ color: "var(--ink)", fontSize: 12.5 }}>{totalYardBales.toLocaleString("en-IN")} Bales</strong>
            </div>
          </div>

          {/* Fire Safety Audit Probes Box */}
          <div style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.25)", borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ fontSize: 11.5, fontWeight: 800, color: "#059669", display: "flex", alignItems: "center", gap: 6 }}>
              <i className="ri-shield-check-line" /> Fire Safety Audit Status:
            </div>
            <div style={{ fontSize: 16, fontWeight: 900, color: "#059669", marginTop: 2 }}>
              {DEFAULT_WAREHOUSE_TCC.fireSafetyScore}
            </div>
            <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 2 }}>
              Automated thermal decay and moisture probe network active
            </div>
          </div>

          {/* Assigned Personnel Details */}
          <div style={{ borderTop: "1px solid var(--line)", paddingTop: 10, display: "flex", flexDirection: "column", gap: 5, fontSize: 11.5 }}>
            <div>
              👨‍💼 Supervisor: <strong style={{ color: "var(--ink)" }}>{DEFAULT_WAREHOUSE_TCC.supervisorName}</strong>
            </div>
            <div>
              📞 Contact: <strong style={{ color: "var(--ink)" }}>{DEFAULT_WAREHOUSE_TCC.supervisorPhone}</strong>
            </div>
            <div>
              📧 Email: <strong style={{ color: "var(--ink)" }}>{DEFAULT_WAREHOUSE_TCC.officialEmail}</strong>
            </div>
          </div>

          {/* Full Warehouse Detail Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/warehouses/detail")}
            style={{ width: "100%", height: 34, fontSize: 11.5 }}
          >
            View Warehouse Infrastructure &rarr;
          </Button>
        </div>

        {/* RIGHT SECTION: INTERACTIVE STACKING YARD GRID */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "var(--ink)", display: "flex", alignItems: "center", gap: 6 }}>
              <i className="ri-layout-grid-line" style={{ color: "var(--primary)" }} /> Yard Stacking &amp; Volume Telemetry
            </h3>
            <span style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 700 }}>
              {filteredStacks.length} Stacks Monitored
            </span>
          </div>

          {/* STACK CARDS GRID */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
            {filteredStacks.map((st) => {
              const isWarning = st.tempStatus === "Warning" || (st.probeTempC && st.probeTempC > 35);
              const isMonitored = st.tempStatus === "Monitored" || (st.probeTempC && st.probeTempC > 30);

              return (
                <div
                  key={st.id}
                  className="app-card"
                  style={{
                    background: "var(--surface)",
                    border: `1px solid ${isWarning ? "#FF3B56" : isMonitored ? "#FFB800" : "var(--line)"}`,
                    borderRadius: 14,
                    padding: "14px 16px",
                    boxShadow: "var(--shadow-sm)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    position: "relative",
                  }}
                >
                  {/* Stack Header & Crop Badge */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: "var(--ink)" }}>
                        {st.stackCode}
                      </span>
                      <span style={{ fontSize: 10.5, color: "var(--muted)", background: "var(--canvas)", padding: "1px 6px", borderRadius: 6, border: "1px solid var(--line)", fontWeight: 700 }}>
                        {st.zone}
                      </span>
                    </div>

                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 800,
                        padding: "2px 8px",
                        borderRadius: 12,
                        background: st.cropBadgeBg || "rgba(93,214,44,0.12)",
                        color: st.cropBadgeColor || "var(--primary)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      {st.cropName}
                    </span>
                  </div>

                  {/* Tonnage & Bale Breakdown */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", background: "var(--canvas)", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--line)" }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 900, color: "var(--ink)" }}>
                        {st.tonnageMt.toLocaleString("en-IN")} MT
                      </div>
                      <span style={{ fontSize: 10, color: "var(--muted)" }}>Gross Weight</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "var(--primary)" }}>
                        {st.baleCount.toLocaleString("en-IN")} Bales
                      </div>
                      <span style={{ fontSize: 10, color: "var(--muted)" }}>Bale Count</span>
                    </div>
                  </div>

                  {/* Thermal Probe & Fire Safety Indicator */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span>🌡️ Probe Temp:</span>
                      <strong style={{ color: isWarning ? "#FF3B56" : isMonitored ? "#FFB800" : "var(--primary)", fontSize: 12 }}>
                        {st.probeTempC || 28}°C
                      </strong>
                    </div>

                    <Badge tone={isWarning ? "error" : isMonitored ? "warning" : "success"}>
                      {st.tempStatus?.toUpperCase() || "NORMAL"}
                    </Badge>
                  </div>

                  {/* Humidity & Stack Date */}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "var(--muted)", borderTop: "1px solid var(--line)", paddingTop: 6 }}>
                    <span>💧 Humidity: <strong>{st.humidityPct || 15.5}%</strong></span>
                    <span>Stacked: <strong>{st.stackDate || "Recent"}</strong></span>
                  </div>

                  {/* Action Shortcuts */}
                  <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenAudit(st)}
                      style={{ flex: 1, height: 26, fontSize: 11, padding: "0 8px" }}
                    >
                      <i className="ri-temp-hot-line" style={{ marginRight: 3 }} /> Audit Probe
                    </Button>

                    <button
                      type="button"
                      onClick={() => handleDeleteStack(st.id, st.stackCode)}
                      title="De-allocate Stack"
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 6,
                        border: "1px solid rgba(255,59,86,0.3)",
                        background: "rgba(255,59,86,0.08)",
                        color: "#FF3B56",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                      }}
                    >
                      <i className="ri-delete-bin-line" />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredStacks.length === 0 && (
              <div style={{ gridColumn: "1 / -1", padding: 28, textAlign: "center", background: "var(--surface)", borderRadius: 14, border: "1px solid var(--line)" }}>
                <i className="ri-stack-line" style={{ fontSize: 32, color: "var(--muted)", marginBottom: 8, display: "block", opacity: 0.5 }} />
                <h3 style={{ margin: "0 0 4px", color: "var(--ink)", fontSize: 14 }}>No Stacks Found in this Filter</h3>
                <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>Try selecting "All Commodities" or "All Zones".</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL 1: ADD NEW STACK ALLOCATION */}
      <Modal open={isAddStackModalOpen} title="Allocate New Biomass Yard Stack" onClose={() => setIsAddStackModalOpen(false)}>
        <form onSubmit={handleCreateStack} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <FormField
            label="Stack Identifier Code"
            value={newStackCode}
            onChange={(val) => setNewStackCode(val)}
            placeholder="e.g. STACK-A-101 (leave empty for auto-generated)"
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
            <FormField
              label="Yard Zone Location"
              type="select"
              required
              value={newZone}
              onChange={(val) => setNewZone(val)}
              options={[
                { value: "Zone A", label: "Zone A (Covered Shed 1)" },
                { value: "Zone B", label: "Zone B (Covered Shed 2)" },
                { value: "Zone C", label: "Zone C (Open Yard North)" },
                { value: "Zone D", label: "Zone D (Open Yard South)" },
              ]}
            />
            <FormField
              label="Commodity / Crop"
              type="select"
              required
              value={newCrop}
              onChange={(val) => setNewCrop(val)}
              options={[
                { value: "Paddy Straw", label: "Paddy Straw (Bales)" },
                { value: "Maize Stem", label: "Maize Stem / Stalks" },
                { value: "Wheat Straw", label: "Wheat Straw" },
                { value: "Mustard Husk", label: "Mustard Husk" },
              ]}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
            <FormField
              label="Stack Weight (Tons / MT)"
              type="number"
              required
              value={newTonnage}
              onChange={(val) => setNewTonnage(val)}
              placeholder="1000"
            />
            <FormField
              label="Total Bale Count"
              type="number"
              required
              value={newBales}
              onChange={(val) => setNewBales(val)}
              placeholder="3300"
            />
          </div>
          <FormField
            label="Initial Thermal Probe Reading (°C)"
            type="number"
            value={newProbeTemp}
            onChange={(val) => setNewProbeTemp(val)}
            placeholder="28"
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
            <Button variant="secondary" type="button" onClick={() => setIsAddStackModalOpen(false)}>Cancel</Button>
            <Button type="submit">Allocate Stack &rarr;</Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: THERMAL PROBE AUDIT */}
      <Modal open={Boolean(selectedStackForAudit)} title={`Audit Thermal Probe: ${selectedStackForAudit?.stackCode || ""}`} onClose={() => setSelectedStackForAudit(null)}>
        <form onSubmit={handleUpdateTempSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={{ margin: 0, fontSize: 12.5, color: "var(--muted)" }}>
            Enter the latest sensor reading from the thermal probe inserted into {selectedStackForAudit?.stackCode}.
          </p>
          <FormField
            label="Probe Temperature (°C)"
            type="number"
            required
            value={probeTempInput}
            onChange={(val) => setProbeTempInput(val)}
            placeholder="e.g. 29"
          />
          <div style={{ fontSize: 11.5, color: "var(--muted)", margin: "-4px 0 6px" }}>
            Thresholds: &lt;30°C Normal | 31-35°C Monitored | &gt;35°C Combustion Alert
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Button variant="secondary" type="button" onClick={() => setSelectedStackForAudit(null)}>Cancel</Button>
            <Button type="submit">Save Probe Reading</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
