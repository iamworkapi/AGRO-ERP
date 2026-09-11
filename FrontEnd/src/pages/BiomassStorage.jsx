import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import Button from "../components/common/Button";
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

const ZONE_OPTIONS = [
  { value: "ALL", label: "All Storage Zones (सभी ज़ोन)" },
  { value: "Zone A", label: "Zone A — Covered Shed 1 (शेड 1)" },
  { value: "Zone B", label: "Zone B — Covered Shed 2 (शेड 2)" },
  { value: "Zone C", label: "Zone C — Open Yard North (खुला यार्ड उत्तर)" },
  { value: "Zone D", label: "Zone D — Open Yard South (खुला यार्ड दक्षिण)" },
];

const CROP_OPTIONS = [
  { value: "ALL", label: "All Commodities (सभी फसलें)", color: "#16a34a", bg: "rgba(22, 163, 74, 0.12)" },
  { value: "Paddy Straw", label: "Paddy Straw (धान की पराली)", color: "#15803d", bg: "#dcfce7" },
  { value: "Wheat Straw", label: "Wheat Straw (गेहूं का भूसा)", color: "#0284c7", bg: "#e0f2fe" },
  { value: "Maize Stem", label: "Maize Stem (मक्का डंठल)", color: "#b45309", bg: "#fef3c7" },
  { value: "Mustard Husk", label: "Mustard Husk (सरसों तूड़ी)", color: "#7e22ce", bg: "#f3e8ff" },
];

export default function BiomassStorage() {
  const navigate = useNavigate();
  const [stacks, setStacks] = useState(getStoredStacks);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedZone, setSelectedZone] = useState("ALL");
  const [selectedCrop, setSelectedCrop] = useState("ALL");

  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [tempAuditStack, setTempAuditStack] = useState(null);
  const [tempInput, setTempInput] = useState("");
  const [editingStack, setEditingStack] = useState(null);

  // New Stack Form State
  const [newForm, setNewForm] = useState({
    stackCode: "",
    zone: "Zone A",
    cropName: "Paddy Straw",
    tonnageMt: "1200",
    baleCount: "3600",
    probeTempC: "27",
    humidityPct: "15.0",
    notes: "",
  });

  // Aggregates
  const totalWeightMt = useMemo(
    () => stacks.reduce((sum, s) => sum + (Number(s.tonnageMt) || 0), 0),
    [stacks]
  );
  const totalBales = useMemo(
    () => stacks.reduce((sum, s) => sum + (Number(s.baleCount) || 0), 0),
    [stacks]
  );
  const totalCapacityMt = DEFAULT_WAREHOUSE_TCC.totalCapacityMt || 15000;
  const usedPercent = Math.min(100, Math.round((totalWeightMt / totalCapacityMt) * 100));

  // High Temperature / Alert Count
  const warningCount = useMemo(
    () => stacks.filter((s) => (Number(s.probeTempC) || 0) > 35).length,
    [stacks]
  );

  // Filtered Stacks List
  const filteredStacks = useMemo(() => {
    return stacks.filter((st) => {
      const matchZone = selectedZone === "ALL" || st.zone === selectedZone;
      const matchCrop =
        selectedCrop === "ALL" ||
        (st.cropName || "").toLowerCase().includes(selectedCrop.toLowerCase());
      const query = searchQuery.trim().toLowerCase();
      const matchSearch =
        !query ||
        (st.stackCode || "").toLowerCase().includes(query) ||
        (st.zone || "").toLowerCase().includes(query) ||
        (st.cropName || "").toLowerCase().includes(query);

      return matchZone && matchCrop && matchSearch;
    });
  }, [stacks, selectedZone, selectedCrop, searchQuery]);

  // Open Add Modal with smart defaults
  function handleOpenAddModal() {
    const defaultZone = selectedZone !== "ALL" ? selectedZone : "Zone A";
    const letter = defaultZone.replace("Zone ", "").trim() || "A";
    setNewForm({
      stackCode: `STACK-${letter}-${Math.floor(100 + Math.random() * 900)}`,
      zone: defaultZone,
      cropName: selectedCrop !== "ALL" ? selectedCrop : "Paddy Straw",
      tonnageMt: "1000",
      baleCount: "3000",
      probeTempC: "27",
      humidityPct: "15.0",
      notes: "",
    });
    setIsAddModalOpen(true);
  }

  function handleSaveNewStack(e) {
    e.preventDefault();
    const cropDef = CROP_OPTIONS.find((c) => c.value === newForm.cropName) || CROP_OPTIONS[1];
    const tempNum = parseFloat(newForm.probeTempC) || 28;

    const newStackObj = {
      stackCode: newForm.stackCode.trim().toUpperCase(),
      zone: newForm.zone,
      cropName: newForm.cropName,
      cropBadge: newForm.cropName,
      cropBadgeBg: cropDef.bg,
      cropBadgeColor: cropDef.color,
      tonnageMt: parseFloat(newForm.tonnageMt) || 0,
      baleCount: parseInt(newForm.baleCount, 10) || 0,
      probeTempC: tempNum,
      tempStatus: tempNum > 35 ? "Warning" : tempNum > 30 ? "Monitored" : "Normal",
      fireSafetyScore: tempNum > 35 ? "90.0% (Action Required)" : "99.0% (Safe)",
      humidityPct: parseFloat(newForm.humidityPct) || 15.0,
      stackDate: new Date().toISOString().slice(0, 10),
      notes: newForm.notes,
      warehouseCode: DEFAULT_WAREHOUSE_TCC.code,
    };

    const updated = saveNewStack(newStackObj);
    setStacks(updated);
    setIsAddModalOpen(false);
    toast.success(`Stack "${newStackObj.stackCode}" added successfully!`);
  }

  // Handle Temp Update Modal
  function handleOpenTempAudit(stack) {
    setTempAuditStack(stack);
    setTempInput(String(stack.probeTempC || 28));
  }

  function handleSaveTempAudit(e) {
    e.preventDefault();
    if (!tempAuditStack) return;
    const tempNum = parseFloat(tempInput) || 28;
    const tempStatus = tempNum > 35 ? "Warning" : tempNum > 30 ? "Monitored" : "Normal";
    const fireSafetyScore = tempNum > 35 ? "90.0% (High Heat - Inspect)" : "99.0% (Safe)";

    const updated = updateStack(tempAuditStack.id, {
      probeTempC: tempNum,
      tempStatus,
      fireSafetyScore,
    });
    setStacks(updated);
    setTempAuditStack(null);
    toast.success(`Temperature updated to ${tempNum}°C for ${tempAuditStack.stackCode}`);
  }

  // Handle Edit Stack
  function handleOpenEdit(stack) {
    setEditingStack({
      ...stack,
      tonnageMt: String(stack.tonnageMt || ""),
      baleCount: String(stack.baleCount || ""),
      probeTempC: String(stack.probeTempC || ""),
    });
  }

  function handleSaveEdit(e) {
    e.preventDefault();
    if (!editingStack) return;
    const tempNum = parseFloat(editingStack.probeTempC) || 28;
    const cropDef = CROP_OPTIONS.find((c) => c.value === editingStack.cropName) || CROP_OPTIONS[1];

    const updated = updateStack(editingStack.id, {
      stackCode: editingStack.stackCode,
      zone: editingStack.zone,
      cropName: editingStack.cropName,
      cropBadgeBg: cropDef.bg,
      cropBadgeColor: cropDef.color,
      tonnageMt: parseFloat(editingStack.tonnageMt) || 0,
      baleCount: parseInt(editingStack.baleCount, 10) || 0,
      probeTempC: tempNum,
      tempStatus: tempNum > 35 ? "Warning" : tempNum > 30 ? "Monitored" : "Normal",
    });
    setStacks(updated);
    setEditingStack(null);
    toast.success(`Stack "${editingStack.stackCode}" updated!`);
  }

  // Handle Delete Stack
  function handleDelete(stack) {
    if (window.confirm(`Are you sure you want to remove Stack "${stack.stackCode}"?`)) {
      const updated = deleteStack(stack.id);
      setStacks(updated);
      toast.success(`Stack "${stack.stackCode}" removed from yard.`);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "relative" }}>
      {/* 1. CLEAN PAGE HEADER (BUTTONS REMOVED AS REQUESTED) */}
      <PageHeader
        title="Storage & Yard Stacking"
      />

      {/* 2. NEW DEDICATED NAVIGATION & ACTION HEADER (TO MOVE ON THIS) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: 14,
          padding: "12px 18px",
          boxShadow: "var(--shadow-sm)",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        {/* Navigation Switch to Move Between Yard Stacks & Storage Rooms */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--canvas)", padding: 4, borderRadius: 10, border: "1px solid var(--line)" }}>
          <button
            type="button"
            style={{
              border: "none",
              background: "var(--primary)",
              color: "#ffffff",
              padding: "8px 16px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 800,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 2px 6px rgba(51, 116, 24, 0.25)",
              cursor: "default",
            }}
          >
            <i className="ri-stack-line" /> Storage & Yard Stacking
          </button>
          <button
            type="button"
            onClick={() => navigate("/warehouses/rooms")}
            style={{
              border: "none",
              background: "transparent",
              color: "var(--ink)",
              padding: "8px 16px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              cursor: "pointer",
              transition: "all 140ms ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--surface)";
              e.currentTarget.style.color = "var(--primary-deep)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--ink)";
            }}
            title="Move to Storage Rooms"
          >
            <i className="ri-door-open-line" style={{ color: "var(--primary)" }} /> Storage Rooms &rarr;
          </button>
        </div>

        {/* Action Button: + Add New Stack */}
        <Button
          variant="primary"
          icon="ri-add-circle-fill"
          onClick={handleOpenAddModal}
          style={{ fontSize: 13, height: 40, padding: "0 18px", fontWeight: 800 }}
        >
          + Add New Stack
        </Button>
      </div>

      {/* 3. TOP 4 OVERVIEW STAT CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        {/* Stat 1: Total Stored Stock */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 14,
            padding: "16px 18px",
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Total Stock in Yard
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: "var(--ink)", marginTop: 4 }}>
              {totalWeightMt.toLocaleString("en-IN")} <span style={{ fontSize: 14, fontWeight: 700 }}>MT</span>
            </div>
            <div style={{ fontSize: 11.5, color: "var(--primary-deep)", fontWeight: 700, marginTop: 4 }}>
              {usedPercent}% of {totalCapacityMt.toLocaleString("en-IN")} MT Capacity
            </div>
          </div>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "var(--primary-tint)",
              color: "var(--primary-deep)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
            }}
          >
            <i className="ri-scales-3-line" />
          </div>
        </div>

        {/* Stat 2: Total Bales */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 14,
            padding: "16px 18px",
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Total Stored Bales
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: "var(--ink)", marginTop: 4 }}>
              {totalBales.toLocaleString("en-IN")} <span style={{ fontSize: 14, fontWeight: 700 }}>Bales</span>
            </div>
            <div style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600, marginTop: 4 }}>
              High-density tied bales
            </div>
          </div>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "rgba(2, 132, 199, 0.12)",
              color: "#0284c7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
            }}
          >
            <i className="ri-archive-stack-line" />
          </div>
        </div>

        {/* Stat 3: Active Stacks */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 14,
            padding: "16px 18px",
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Active Yard Stacks
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: "var(--ink)", marginTop: 4 }}>
              {stacks.length} <span style={{ fontSize: 14, fontWeight: 700 }}>Stacks</span>
            </div>
            <div style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600, marginTop: 4 }}>
              Across storage zones
            </div>
          </div>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "rgba(126, 34, 206, 0.12)",
              color: "#7e22ce",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
            }}
          >
            <i className="ri-grid-fill" />
          </div>
        </div>

        {/* Stat 4: Yard Condition / Safety */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 14,
            padding: "16px 18px",
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Yard Temperature Status
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 900,
                color: warningCount > 0 ? "#dc2626" : "#15803d",
                marginTop: 4,
              }}
            >
              {warningCount > 0 ? `⚠️ ${warningCount} Need Check` : "✓ All Safe & Cool"}
            </div>
            <div style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600, marginTop: 4 }}>
              {warningCount > 0 ? "Inspect hot stacks immediately" : "All temperatures below 30°C"}
            </div>
          </div>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: warningCount > 0 ? "rgba(220, 38, 38, 0.12)" : "rgba(21, 128, 61, 0.12)",
              color: warningCount > 0 ? "#dc2626" : "#15803d",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
            }}
          >
            <i className={warningCount > 0 ? "ri-temp-hot-line" : "ri-shield-check-line"} />
          </div>
        </div>
      </div>

      {/* 4. SEARCH & FILTER TOOLBAR (TABS & TABLE TOGGLE COMPLETELY REMOVED) */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: 14,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          boxShadow: "var(--shadow-sm)",
        }}
      >
        {/* Left: Search Box & Dropdowns */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 260, flexWrap: "wrap" }}>
          <div style={{ position: "relative", minWidth: 240, flex: 1, maxWidth: 360 }}>
            <i
              className="ri-search-line"
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--muted)",
                fontSize: 16,
              }}
            />
            <input
              type="text"
              placeholder="Search by Stack code, crop, or zone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                height: 38,
                padding: "0 12px 0 36px",
                fontSize: 13,
                fontWeight: 600,
                borderRadius: 9,
                border: "1px solid var(--line-strong)",
                background: "var(--canvas)",
                color: "var(--ink)",
                outline: "none",
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--muted)",
                  cursor: "pointer",
                  fontSize: 16,
                }}
              >
                <i className="ri-close-line" />
              </button>
            )}
          </div>

          {/* Zone Filter Dropdown */}
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            style={{
              height: 38,
              padding: "0 12px",
              fontSize: 12.5,
              fontWeight: 700,
              borderRadius: 9,
              border: "1px solid var(--line-strong)",
              background: "var(--canvas)",
              color: "var(--ink)",
              outline: "none",
              cursor: "pointer",
            }}
          >
            {ZONE_OPTIONS.map((z) => (
              <option key={z.value} value={z.value}>
                {z.label}
              </option>
            ))}
          </select>

          {/* Crop Filter Dropdown */}
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            style={{
              height: 38,
              padding: "0 12px",
              fontSize: 12.5,
              fontWeight: 700,
              borderRadius: 9,
              border: "1px solid var(--line-strong)",
              background: "var(--canvas)",
              color: "var(--ink)",
              outline: "none",
              cursor: "pointer",
            }}
          >
            {CROP_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Right: Showing Count */}
        <span style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600 }}>
          Showing: <strong style={{ color: "var(--ink)" }}>{filteredStacks.length}</strong> active stacks
        </span>
      </div>

      {/* 5. ONLY CLEAN CARDS VIEW (TABLE REMOVED) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        {filteredStacks.map((st) => {
          const isWarning = (st.probeTempC && Number(st.probeTempC) > 35) || st.tempStatus === "Warning";
          const isMonitored = (st.probeTempC && Number(st.probeTempC) > 30) || st.tempStatus === "Monitored";

          return (
            <div
              key={st.id}
              style={{
                background: "var(--surface)",
                border: isWarning
                  ? "1.5px solid #ef4444"
                  : isMonitored
                  ? "1.5px solid #f59e0b"
                  : "1px solid var(--line)",
                borderRadius: 14,
                padding: "16px",
                boxShadow: "var(--shadow-sm)",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                position: "relative",
                transition: "transform 140ms ease, box-shadow 140ms ease",
              }}
            >
              {/* Header: Code & Zone */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 15, fontWeight: 900, color: "var(--ink)", letterSpacing: "0.2px" }}>
                      {st.stackCode}
                    </span>
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>
                    <i className="ri-map-pin-line" style={{ marginRight: 3, color: "var(--primary)" }} />
                    {st.zone}
                  </div>
                </div>

                {/* Crop Badge */}
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    padding: "3px 9px",
                    borderRadius: 12,
                    background: st.cropBadgeBg || "var(--primary-tint)",
                    color: st.cropBadgeColor || "var(--primary-deep)",
                    border: "1px solid rgba(0, 0, 0, 0.05)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {st.cropName}
                </span>
              </div>

              {/* Main Numbers: Weight & Bales */}
              <div
                style={{
                  background: "var(--canvas)",
                  borderRadius: 10,
                  padding: "12px 14px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                  border: "1px solid var(--line)",
                }}
              >
                <div>
                  <span style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>
                    Total Weight
                  </span>
                  <div style={{ fontSize: 18, fontWeight: 900, color: "var(--ink)", marginTop: 2 }}>
                    {Number(st.tonnageMt || 0).toLocaleString("en-IN")}{" "}
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>MT</span>
                  </div>
                </div>

                <div style={{ borderLeft: "1px solid var(--line)", paddingLeft: 12 }}>
                  <span style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>
                    Bale Count
                  </span>
                  <div style={{ fontSize: 18, fontWeight: 900, color: "var(--primary-deep)", marginTop: 2 }}>
                    {Number(st.baleCount || 0).toLocaleString("en-IN")}{" "}
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>Bales</span>
                  </div>
                </div>
              </div>

              {/* Health: Temperature & Safety Status */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "6px 10px",
                  borderRadius: 8,
                  background: isWarning ? "#fee2e2" : isMonitored ? "#fef3c7" : "rgba(22, 163, 74, 0.08)",
                  border: isWarning ? "1px solid #fca5a5" : isMonitored ? "1px solid #fde68a" : "1px solid rgba(22, 163, 74, 0.2)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <i
                    className={isWarning ? "ri-fire-line" : "ri-temp-hot-line"}
                    style={{ color: isWarning ? "#dc2626" : isMonitored ? "#d97706" : "#15803d", fontSize: 15 }}
                  />
                  <span style={{ fontSize: 12, fontWeight: 800, color: isWarning ? "#dc2626" : isMonitored ? "#b45309" : "#15803d" }}>
                    {st.probeTempC || 28}°C Temp
                  </span>
                </div>

                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 800,
                    padding: "2px 6px",
                    borderRadius: 4,
                    background: isWarning ? "#dc2626" : isMonitored ? "#d97706" : "#15803d",
                    color: "#ffffff",
                  }}
                >
                  {isWarning ? "ACTION REQUIRED" : isMonitored ? "MONITORED" : "SAFE / NORMAL"}
                </span>
              </div>

              {/* Date & Moisture */}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--muted)" }}>
                <span>💧 Moisture: {st.humidityPct || 15}%</span>
                <span>Stacked: {st.stackDate || "Recent"}</span>
              </div>

              {/* Actions Toolbar */}
              <div style={{ display: "flex", gap: 6, paddingTop: 4, borderTop: "1px solid var(--line)" }}>
                <button
                  type="button"
                  onClick={() => handleOpenTempAudit(st)}
                  style={{
                    flex: 1,
                    height: 32,
                    fontSize: 12,
                    fontWeight: 700,
                    borderRadius: 8,
                    border: "1px solid var(--line-strong)",
                    background: "var(--surface)",
                    color: "var(--ink)",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                  }}
                  title="Check and update temperature reading"
                >
                  <i className="ri-temp-hot-line" style={{ color: "var(--primary)" }} /> Check Temp
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenEdit(st)}
                  style={{
                    height: 32,
                    padding: "0 10px",
                    fontSize: 12,
                    fontWeight: 700,
                    borderRadius: 8,
                    border: "1px solid var(--line-strong)",
                    background: "var(--surface)",
                    color: "var(--ink)",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                  }}
                  title="Edit weight or bales"
                >
                  <i className="ri-edit-line" /> Edit
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(st)}
                  style={{
                    height: 32,
                    width: 32,
                    borderRadius: 8,
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    background: "#fef2f2",
                    color: "#dc2626",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                  }}
                  title="Delete or de-allocate stack"
                >
                  <i className="ri-delete-bin-line" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* EMPTY STATE */}
      {filteredStacks.length === 0 && (
        <div
          style={{
            background: "var(--surface)",
            border: "1px dashed var(--line-strong)",
            borderRadius: 16,
            padding: "40px 20px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "var(--canvas)",
              color: "var(--muted)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              marginBottom: 12,
            }}
          >
            <i className="ri-stack-line" />
          </div>
          <h3 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 800, color: "var(--ink)" }}>
            No Stacks Found
          </h3>
          <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--muted)" }}>
            {searchQuery
              ? `No stacks matching "${searchQuery}". Clear your search or filter.`
              : "There are no stacks registered in this zone yet."}
          </p>
          <Button variant="primary" icon="ri-add-line" onClick={handleOpenAddModal}>
            + Create First Stack in this Zone
          </Button>
        </div>
      )}

      {/* MODAL 1: ADD NEW STACK (EASY & SIMPLE) */}
      <Modal open={isAddModalOpen} title="Add New Storage Stack (नया स्टैक जोड़ें)" onClose={() => setIsAddModalOpen(false)}>
        <form onSubmit={handleSaveNewStack} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <p style={{ margin: 0, fontSize: 12.5, color: "var(--muted)" }}>
            Enter stack details to track stored biomass in the warehouse yard.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 12 }}>
            <FormField
              label="Stack Number / Code *"
              value={newForm.stackCode}
              onChange={(val) => setNewForm((prev) => ({ ...prev, stackCode: val }))}
              placeholder="e.g. STACK-A-101"
              required
            />

            <FormField
              label="Storage Zone / Shed *"
              type="select"
              value={newForm.zone}
              onChange={(val) => setNewForm((prev) => ({ ...prev, zone: val }))}
              options={ZONE_OPTIONS.filter((z) => z.value !== "ALL")}
              required
            />
          </div>

          <FormField
            label="Commodity / Crop Name *"
            type="select"
            value={newForm.cropName}
            onChange={(val) => setNewForm((prev) => ({ ...prev, cropName: val }))}
            options={CROP_OPTIONS.filter((c) => c.value !== "ALL")}
            required
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField
              label="Total Weight (Tons / MT) *"
              type="number"
              value={newForm.tonnageMt}
              onChange={(val) => setNewForm((prev) => ({ ...prev, tonnageMt: val }))}
              placeholder="1000"
              required
            />

            <FormField
              label="Total Bale Count *"
              type="number"
              value={newForm.baleCount}
              onChange={(val) => setNewForm((prev) => ({ ...prev, baleCount: val }))}
              placeholder="3000"
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField
              label="Current Temperature (°C)"
              type="number"
              value={newForm.probeTempC}
              onChange={(val) => setNewForm((prev) => ({ ...prev, probeTempC: val }))}
              placeholder="27"
              help="Default is 27°C (Normal)"
            />

            <FormField
              label="Moisture Level (%)"
              type="number"
              value={newForm.humidityPct}
              onChange={(val) => setNewForm((prev) => ({ ...prev, humidityPct: val }))}
              placeholder="15.0"
              help="Standard is ~15%"
            />
          </div>

          <FormField
            label="Notes / Remarks (Optional)"
            value={newForm.notes}
            onChange={(val) => setNewForm((prev) => ({ ...prev, notes: val }))}
            placeholder="e.g. Covered with waterproof tarpaulin"
          />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
            <Button variant="secondary" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" icon="ri-check-line">
              Save Stack to Yard
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: QUICK TEMPERATURE UPDATE */}
      <Modal
        open={Boolean(tempAuditStack)}
        title={`Check & Update Temperature: ${tempAuditStack?.stackCode || ""}`}
        onClose={() => setTempAuditStack(null)}
      >
        <form onSubmit={handleSaveTempAudit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: "var(--canvas)", padding: "12px 14px", borderRadius: 10, border: "1px solid var(--line)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>
              {tempAuditStack?.stackCode} — {tempAuditStack?.zone}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
              Crop: {tempAuditStack?.cropName} • Stored: {tempAuditStack?.tonnageMt} MT ({tempAuditStack?.baleCount} Bales)
            </div>
          </div>

          <FormField
            label="Current Temperature Reading (°C) *"
            type="number"
            value={tempInput}
            onChange={(val) => setTempInput(val)}
            placeholder="e.g. 28"
            required
            autoFocus
          />

          {/* Simple Safety Threshold Guide */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#15803d" }}>
              <i className="ri-checkbox-circle-fill" /> Below 30°C: Safe & Normal (सुरक्षित)
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#d97706" }}>
              <i className="ri-alert-fill" /> 31°C - 35°C: Monitored (निगरानी रखें)
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#dc2626" }}>
              <i className="ri-error-warning-fill" /> Above 35°C: Hot / Action Required (तुरंत ठंडा करें)
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
            <Button variant="secondary" type="button" onClick={() => setTempAuditStack(null)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" icon="ri-save-line">
              Save Reading
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: EDIT STACK DETAILS */}
      <Modal
        open={Boolean(editingStack)}
        title={`Edit Stack: ${editingStack?.stackCode || ""}`}
        onClose={() => setEditingStack(null)}
      >
        {editingStack && (
          <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 12 }}>
              <FormField
                label="Stack Code"
                value={editingStack.stackCode}
                onChange={(val) => setEditingStack((prev) => ({ ...prev, stackCode: val }))}
                required
              />

              <FormField
                label="Zone / Shed"
                type="select"
                value={editingStack.zone}
                onChange={(val) => setEditingStack((prev) => ({ ...prev, zone: val }))}
                options={ZONE_OPTIONS.filter((z) => z.value !== "ALL")}
                required
              />
            </div>

            <FormField
              label="Commodity / Crop"
              type="select"
              value={editingStack.cropName}
              onChange={(val) => setEditingStack((prev) => ({ ...prev, cropName: val }))}
              options={CROP_OPTIONS.filter((c) => c.value !== "ALL")}
              required
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <FormField
                label="Weight (Tons / MT)"
                type="number"
                value={editingStack.tonnageMt}
                onChange={(val) => setEditingStack((prev) => ({ ...prev, tonnageMt: val }))}
                required
              />

              <FormField
                label="Bale Count"
                type="number"
                value={editingStack.baleCount}
                onChange={(val) => setEditingStack((prev) => ({ ...prev, baleCount: val }))}
                required
              />
            </div>

            <FormField
              label="Temperature (°C)"
              type="number"
              value={editingStack.probeTempC}
              onChange={(val) => setEditingStack((prev) => ({ ...prev, probeTempC: val }))}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
              <Button variant="secondary" type="button" onClick={() => setEditingStack(null)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" icon="ri-check-line">
                Update Stack
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
