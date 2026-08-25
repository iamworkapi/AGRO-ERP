import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import Button from "../components/common/Button";
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

  // Modals
  const [isAddStackModalOpen, setIsAddStackModalOpen] = useState(false);
  const [selectedStackForAudit, setSelectedStackForAudit] = useState(null);

  // New Stack Form
  const [newStackCode, setNewStackCode] = useState("");
  const [newZone, setNewZone] = useState("Zone A");
  const [newCrop, setNewCrop] = useState("Paddy Straw");
  const [newTonnage, setNewTonnage] = useState("1000");
  const [newBales, setNewBales] = useState("3300");
  const [newProbeTemp, setNewProbeTemp] = useState("28");

  // Filtered Stacks
  const filteredStacks = useMemo(() => {
    if (selectedCropFilter === "ALL") return stacks;
    return stacks.filter(
      (s) =>
        s.cropName?.toLowerCase().includes(selectedCropFilter.toLowerCase()) ||
        s.cropId === selectedCropFilter
    );
  }, [stacks, selectedCropFilter]);

  // Aggregate Metrics
  const totalYardStockMt = useMemo(() => stacks.reduce((s, st) => s + (Number(st.tonnageMt) || 0), 0), [stacks]);
  const totalYardBales = useMemo(() => stacks.reduce((s, st) => s + (Number(st.baleCount) || 0), 0), [stacks]);

  function handleCreateStack(e) {
    e.preventDefault();
    const cropBadges = {
      "Paddy Straw": { bg: "#D1FAE5", color: "#059669" },
      "Maize Stem": { bg: "#FEF3C7", color: "#D97706" },
      "Wheat Straw": { bg: "#DBEAFE", color: "#2563EB" },
      "Mustard Husk": { bg: "#F3E8FF", color: "#7E22CE" },
    };

    const badgeInfo = cropBadges[newCrop] || { bg: "#D1FAE5", color: "#059669" };

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
      humidityPct: 16.0,
      stackDate: new Date().toISOString().slice(0, 10),
      warehouseCode: DEFAULT_WAREHOUSE_TCC.code,
    };

    const updated = saveNewStack(newObj);
    setStacks(updated);
    setIsAddStackModalOpen(false);
    toast.success(`New Stack "${newObj.stackCode}" allocated in ${newZone}!`);
    setNewStackCode("");
  }

  function handleUpdateTemp(id, temp) {
    const tempNum = Number(temp);
    const tempStatus = tempNum > 35 ? "Warning" : tempNum > 30 ? "Monitored" : "Normal";
    const fireSafetyScore = tempNum > 35 ? "92.0% (Action Required)" : "98.5% (Safe)";

    const updated = updateStack(id, {
      probeTempC: tempNum,
      tempStatus,
      fireSafetyScore,
    });
    setStacks(updated);
    setSelectedStackForAudit(null);
    toast.success(`Probe temperature updated to ${tempNum}°C`);
  }

  function handleDeleteStack(id, code) {
    if (window.confirm(`Delete Stack ${code}?`)) {
      const updated = deleteStack(id);
      setStacks(updated);
      toast.success(`Stack ${code} removed.`);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* PAGE HEADER */}
      <PageHeader
        title="🏢 Stage 3: Storage & Yard Stacking (सुरक्षित भंडारण)"
        subtitle="Transit Collection Centre (TCC) — Storage Capacity, Real-time Stack Storing Volume & Fire Safety Audit Probes"
      />

      {/* TOP KPI METRICS BAR */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }} className="responsive-grid-2">
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "#D1FAE5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            <i className="fa-solid fa-warehouse" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Total Yard Stock</p>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#059669", marginTop: 2 }}>{totalYardStockMt.toLocaleString("en-IN")} MT</div>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>Capacity: {DEFAULT_WAREHOUSE_TCC.totalCapacityMt.toLocaleString("en-IN")} MT</span>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "#FEF3C7", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            <i className="fa-solid fa-boxes-stacked" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Total Stored Bales</p>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#D97706", marginTop: 2 }}>{totalYardBales.toLocaleString("en-IN")} Bales</div>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>Round & Square Bales</span>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "#ECFDF5", color: "#047857", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            <i className="fa-solid fa-shield-halved" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Fire Safety Audit</p>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#047857", marginTop: 2 }}>98.5% (Safe)</div>
            <span style={{ fontSize: 11, color: "#059669", fontWeight: 700 }}>Thermal Probes Active</span>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "#EFF6FF", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            <i className="fa-solid fa-cubes" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Active Yard Zones</p>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#2563EB", marginTop: 2 }}>{stacks.length} Active Stacks</div>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>Zone A, B & C Stacked</span>
          </div>
        </div>
      </div>

      {/* FILTER & ACTIONS BAR */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: 12,
          padding: "10px 14px",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <select
            value={selectedCropFilter}
            onChange={(e) => setSelectedCropFilter(e.target.value)}
            style={{
              padding: "8px 12px",
              fontSize: 12,
              fontWeight: 700,
              borderRadius: 8,
              border: "1px solid var(--line-strong)",
              background: "var(--surface)",
              color: "var(--ink)",
            }}
          >
            <option value="ALL">All Stored Crops</option>
            <option value="paddy">Paddy Straw (धान की पराली)</option>
            <option value="maize">Maize Stem (मक्का का डंठल)</option>
            <option value="wheat">Wheat Straw (गेहूं का भूसा)</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <Button
            onClick={() => setIsAddStackModalOpen(true)}
            style={{ padding: "8px 16px", fontSize: 12.5, fontWeight: 800, background: "#2563EB", display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            ➕ Add Stack Allocation
          </Button>
        </div>
      </div>

      {/* MAIN 2-COLUMN SECTION MATCHING USER SCREENSHOT EXACTLY */}
      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 2fr", gap: 18 }} className="responsive-grid-1">
        {/* LEFT SIDE PANEL: WAREHOUSE & TCC DETAILS */}
        <div
          style={{
            background: "#FFFFFF",
            border: "2px solid #0F172A",
            borderRadius: 14,
            padding: 18,
            boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {/* Panel Header */}
          <div style={{ borderBottom: "2px solid #0F172A", paddingBottom: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 900, textTransform: "uppercase", color: "#0F172A", letterSpacing: 0.3 }}>
              🏢 WAREHOUSE & TCC DETAILS (LEFT SIDE PANEL)
            </span>
          </div>

          {/* Blue Highlight Center Name Card */}
          <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 14.5, fontWeight: 900, color: "#0F172A", lineHeight: 1.3 }}>
              {DEFAULT_WAREHOUSE_TCC.name}
            </div>
            <div style={{ fontSize: 11.5, fontWeight: 800, color: "#2563EB", marginTop: 4 }}>
              Center Code: {DEFAULT_WAREHOUSE_TCC.code}
            </div>
          </div>

          {/* Sourcing Area & Storage Capacity Grid */}
          <div
            style={{
              background: "#FAF5FF",
              border: "1px solid #E9D5FF",
              borderRadius: 10,
              padding: "12px 14px",
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr",
              gap: 10,
              fontSize: 12,
            }}
          >
            <div>
              <span style={{ color: "#64748B", display: "block", fontSize: 11 }}>Sourcing Area:</span>
              <strong style={{ color: "#0F172A" }}>{DEFAULT_WAREHOUSE_TCC.sourcingArea}</strong>
            </div>

            <div>
              <span style={{ color: "#64748B", display: "block", fontSize: 11 }}>Storage Capacity:</span>
              <strong style={{ color: "#0F172A" }}>{DEFAULT_WAREHOUSE_TCC.totalCapacityMt.toLocaleString("en-IN")} MT</strong>
            </div>

            <div style={{ borderTop: "1px dashed #E9D5FF", paddingTop: 8 }}>
              <span style={{ color: "#64748B", display: "block", fontSize: 11 }}>Active Stock:</span>
              <strong style={{ color: "#059669", fontSize: 13 }}>{DEFAULT_WAREHOUSE_TCC.activeStockMt.toLocaleString("en-IN")} MT</strong>
            </div>

            <div style={{ borderTop: "1px dashed #E9D5FF", paddingTop: 8 }}>
              <span style={{ color: "#64748B", display: "block", fontSize: 11 }}>Total Bales:</span>
              <strong style={{ color: "#0F172A", fontSize: 13 }}>{DEFAULT_WAREHOUSE_TCC.totalBalesCount.toLocaleString("en-IN")} Bales</strong>
            </div>
          </div>

          {/* Fire Safety Audit Probes Box (Exact match) */}
          <div style={{ background: "#ECFDF5", border: "1.5px solid #10B981", borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 11.5, fontWeight: 800, color: "#065F46", display: "flex", alignItems: "center", gap: 6 }}>
              <span>🛡️</span> Fire Safety Audit Probes:
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#047857", marginTop: 2 }}>
              {DEFAULT_WAREHOUSE_TCC.fireSafetyScore}
            </div>
            <div style={{ fontSize: 11, color: "#065F46", marginTop: 2 }}>
              Spontaneous combustion risk control active
            </div>
          </div>

          {/* Assigned Supervisor & Personnel Details */}
          <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: 10, display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
            <div>
              👨‍💼 Assigned Supervisor: <strong>{DEFAULT_WAREHOUSE_TCC.supervisorName}</strong>
            </div>
            <div>
              📞 Mobile: <strong>{DEFAULT_WAREHOUSE_TCC.supervisorPhone}</strong>
            </div>
            <div>
              📧 Official Email: <strong>{DEFAULT_WAREHOUSE_TCC.officialEmail}</strong>
            </div>
          </div>

          {/* Admin Management Navigation Shortcut */}
          <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 6 }}>
            <button
              type="button"
              onClick={() => navigate("/warehouses/detail")}
              style={{
                padding: "8px 12px",
                fontSize: 11.5,
                fontWeight: 800,
                background: "#2563EB",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              🏢 View Full Warehouse Operations Detail →
            </button>
          </div>
        </div>

        {/* RIGHT SIDE SECTION: YARD STACKING & STORAGE VOLUME (TONS & BALES) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 900, color: "#0F172A", display: "flex", alignItems: "center", gap: 8 }}>
              <span>📦</span> Yard Stacking & Storage Volume (Tons & Bales)
            </h3>
            <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 700 }}>
              {filteredStacks.length} Stack Areas Monitored
            </span>
          </div>

          {/* STACK CARDS GRID (Exact Match to User Screenshot) */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }} className="responsive-grid-1">
            {filteredStacks.map((st) => (
              <div
                key={st.id}
                style={{
                  background: "#FFFFFF",
                  border: "1.5px solid #CBD5E1",
                  borderRadius: 12,
                  padding: 16,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  position: "relative",
                }}
              >
                {/* Stack Header & Crop Badge */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13.5, fontWeight: 900, color: "#0F172A" }}>
                    {st.stackCode}
                  </span>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 800,
                      background: st.cropBadgeBg || "#D1FAE5",
                      color: st.cropBadgeColor || "#059669",
                      padding: "2px 8px",
                      borderRadius: 6,
                    }}
                  >
                    {st.cropBadge || st.cropName}
                  </span>
                </div>

                {/* Tonnage in bold numbers */}
                <div style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", marginTop: 2 }}>
                  {(st.tonnageMt || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })} MT
                </div>

                {/* Bales Count & Probe Temperature Subtitle */}
                <div style={{ fontSize: 11.5, color: "#64748B", display: "flex", alignItems: "center", gap: 6 }}>
                  <span>{(st.baleCount || 0).toLocaleString("en-IN")} {st.baleType || "Bales"}</span>
                  <span>|</span>
                  <span style={{ fontWeight: 700, color: st.probeTempC > 30 ? "#D97706" : "#059669" }}>
                    Probe Temp: {st.probeTempC}°C ({st.tempStatus || "Normal"})
                  </span>
                </div>

                {/* Bottom Action strip */}
                <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: 8, marginTop: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 10.5, color: "#94A3B8" }}>
                    Zone: {st.zone} | Safety: {st.fireSafetyScore || "98.5%"}
                  </span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => setSelectedStackForAudit(st)}
                      style={{ padding: "3px 8px", fontSize: 11, fontWeight: 700, background: "#EFF6FF", color: "#1E40AF", border: "1px solid #BFDBFE", borderRadius: 4, cursor: "pointer" }}
                    >
                      🌡️ Probe Audit
                    </button>
                    <button
                      onClick={() => handleDeleteStack(st.id, st.stackCode)}
                      style={{ padding: "3px 6px", fontSize: 11, background: "#FEE2E2", color: "#991B1B", border: "1px solid #FCA5A5", borderRadius: 4, cursor: "pointer" }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Probe Telemetry & Yard Map Info Card */}
          <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 12.5, fontWeight: 800, color: "#0F172A", marginBottom: 6 }}>
              🛡️ Yard Fire Safety & Probe Standards (कृषि अपशिष्ट भंडारण सुरक्षा)
            </div>
            <div style={{ fontSize: 11.5, color: "#475569", lineHeight: 1.5 }}>
              • <strong>Optimal Core Temp:</strong> 25°C to 29°C (Green Safe Zone).<br />
              • <strong>Monitored Threshold:</strong> 30°C to 34°C (Increased ventilation & moisture probe required).<br />
              • <strong>Combustion Alert:</strong> &gt; 35°C (Immediate bale restacking & cooling probe activation).
            </div>
          </div>
        </div>
      </div>

      {/* ADD NEW STACK MODAL */}
      {isAddStackModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              border: "2px solid #0F172A",
              borderRadius: 16,
              width: "100%",
              maxWidth: 600,
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "14px 20px", background: "#0F172A", color: "#FFFFFF", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 900 }}>📦 Allocate New Yard Stack</h3>
              <button onClick={() => setIsAddStackModalOpen(false)} style={{ background: "transparent", border: "none", color: "#94A3B8", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>

            <form onSubmit={handleCreateStack} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#334155", display: "block", marginBottom: 3 }}>Stack ID / Name</label>
                  <input type="text" placeholder="e.g. STACK-PAD-105" value={newStackCode} onChange={(e) => setNewStackCode(e.target.value)} style={{ width: "100%", padding: 6, fontSize: 12, borderRadius: 6, border: "1px solid #CBD5E1" }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#334155", display: "block", marginBottom: 3 }}>Yard Zone</label>
                  <select value={newZone} onChange={(e) => setNewZone(e.target.value)} style={{ width: "100%", padding: 6, fontSize: 12, borderRadius: 6, border: "1px solid #CBD5E1" }}>
                    <option value="Zone A">Zone A (Paddy Main)</option>
                    <option value="Zone B">Zone B (Maize & Mix)</option>
                    <option value="Zone C">Zone C (Wheat Straw)</option>
                    <option value="Zone D">Zone D (Buffer Yard)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#334155", display: "block", marginBottom: 3 }}>Crop Commodity</label>
                  <select value={newCrop} onChange={(e) => setNewCrop(e.target.value)} style={{ width: "100%", padding: 6, fontSize: 12, borderRadius: 6, border: "1px solid #CBD5E1" }}>
                    <option value="Paddy Straw">Paddy Straw</option>
                    <option value="Maize Stem">Maize Stem</option>
                    <option value="Wheat Straw">Wheat Straw</option>
                    <option value="Mustard Husk">Mustard Husk</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#334155", display: "block", marginBottom: 3 }}>Stored Tonnage (MT)</label>
                  <input type="number" step="0.1" value={newTonnage} onChange={(e) => setNewTonnage(e.target.value)} style={{ width: "100%", padding: 6, fontSize: 12, fontWeight: 800, borderRadius: 6, border: "1px solid #CBD5E1" }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#334155", display: "block", marginBottom: 3 }}>Total Bales Count</label>
                  <input type="number" value={newBales} onChange={(e) => setNewBales(e.target.value)} style={{ width: "100%", padding: 6, fontSize: 12, borderRadius: 6, border: "1px solid #CBD5E1" }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#334155", display: "block", marginBottom: 3 }}>Initial Probe Temp (°C)</label>
                  <input type="number" value={newProbeTemp} onChange={(e) => setNewProbeTemp(e.target.value)} style={{ width: "100%", padding: 6, fontSize: 12, borderRadius: 6, border: "1px solid #CBD5E1" }} />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setIsAddStackModalOpen(false)} style={{ padding: "8px 16px", fontSize: 12, borderRadius: 6, border: "1px solid #CBD5E1" }}>Cancel</button>
                <button type="submit" style={{ padding: "8px 20px", fontSize: 12, fontWeight: 800, background: "#2563EB", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>
                  💾 Save Stack
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROBE AUDIT MODAL */}
      {selectedStackForAudit && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              border: "2px solid #0F172A",
              borderRadius: 14,
              width: "100%",
              maxWidth: 480,
              padding: 20,
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
            }}
          >
            <h3 style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 900, color: "#0F172A" }}>
              🌡️ Thermal Probe Temperature Audit — {selectedStackForAudit.stackCode}
            </h3>
            <p style={{ fontSize: 12, color: "#64748B", margin: "0 0 14px" }}>
              Update wireless digital thermocouple probe reading inside stack core
            </p>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>
                Current Core Temperature (°C)
              </label>
              <input
                type="number"
                defaultValue={selectedStackForAudit.probeTempC}
                id="tempInput"
                style={{ width: "100%", padding: "8px 12px", fontSize: 16, fontWeight: 900, borderRadius: 8, border: "2px solid #2563EB" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                type="button"
                onClick={() => setSelectedStackForAudit(null)}
                style={{ padding: "8px 16px", fontSize: 12, borderRadius: 6, border: "1px solid #CBD5E1" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const val = document.getElementById("tempInput").value;
                  handleUpdateTemp(selectedStackForAudit.id, val);
                }}
                style={{ padding: "8px 20px", fontSize: 12, fontWeight: 800, background: "#059669", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}
              >
                💾 Update Probe Reading
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
