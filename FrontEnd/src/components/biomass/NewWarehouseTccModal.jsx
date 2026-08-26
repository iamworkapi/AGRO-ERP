import { useState } from "react";
import { toast } from "../../utils/toast";

export default function NewWarehouseTccModal({ isOpen, onClose, onSaved }) {
  const [name, setName] = useState("");
  const [code, setCode] = useState(`TCC-HUB-${Math.floor(10 + Math.random() * 90)}`);
  const [location, setLocation] = useState("Gorakhpur, Uttar Pradesh");
  const [sourcingArea, setSourcingArea] = useState("50-100 Surrounding Villages");
  const [totalCapacityMt, setTotalCapacityMt] = useState("12000");
  const [supervisorName, setSupervisorName] = useState("");
  const [supervisorPhone, setSupervisorPhone] = useState("");
  const [officialEmail, setOfficialEmail] = useState("");

  if (!isOpen) return null;

  function handleSubmit(e) {
    e.preventDefault();
    if (!name) {
      toast.error("Please enter Warehouse / TCC Hub Name");
      return;
    }

    const newHub = {
      id: `TCC-${Date.now()}`,
      name: name.toUpperCase(),
      code: code.toUpperCase(),
      location,
      sourcingArea,
      totalCapacityMt: parseFloat(totalCapacityMt) || 12000,
      activeStockMt: 0,
      totalBalesCount: 0,
      activeStacks: 0,
      fireSafetyScore: "100% (New Active)",
      supervisorName: supervisorName || "Assigned Supervisor",
      supervisorPhone,
      officialEmail,
    };

    if (onSaved) onSaved(newHub);
    toast.success(`New Transit Collection Center "${name}" registered successfully!`);
    onClose();
  }

  return (
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
          background: "var(--surface)",
          border: "1px solid var(--line-strong)",
          borderRadius: 16,
          width: "100%",
          maxWidth: 680,
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--line)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "var(--surface-tint)",
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "var(--ink)" }}>
              Register New Warehouse / Transit Collection Centre (TCC Hub)
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--muted)" }}>
              Admin task — Add a new storage yard, assign supervisor, and set capacity
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--muted)" }}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 3 }}>
                Warehouse / TCC Hub Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. BARABANKI TCC BIOMASS HUB"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: "100%", padding: "7px 10px", fontSize: 12, fontWeight: 700, borderRadius: 6, border: "1px solid var(--line-strong)" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 3 }}>
                Hub Center Code
              </label>
              <input
                type="text"
                placeholder="e.g. TCC-BARABANKI-02"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                style={{ width: "100%", padding: "7px 10px", fontSize: 12, fontWeight: 700, borderRadius: 6, border: "1px solid var(--line-strong)" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 3 }}>
                Hub Location / District
              </label>
              <input
                type="text"
                placeholder="e.g. Barabanki, Uttar Pradesh"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{ width: "100%", padding: "7px 10px", fontSize: 12, borderRadius: 6, border: "1px solid var(--line-strong)" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 3 }}>
                Total Storage Capacity (MT)
              </label>
              <input
                type="number"
                placeholder="e.g. 15000"
                value={totalCapacityMt}
                onChange={(e) => setTotalCapacityMt(e.target.value)}
                style={{ width: "100%", padding: "7px 10px", fontSize: 12, fontWeight: 700, borderRadius: 6, border: "1px solid var(--line-strong)" }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 3 }}>
              Sourcing Area / Village Network Scope
            </label>
            <input
              type="text"
              placeholder="e.g. Barabanki, Haidargarh & 80 Surrounding Villages"
              value={sourcingArea}
              onChange={(e) => setSourcingArea(e.target.value)}
              style={{ width: "100%", padding: "7px 10px", fontSize: 12, borderRadius: 6, border: "1px solid var(--line-strong)" }}
            />
          </div>

          <div style={{ background: "#F8FAFC", border: "1px solid #CBD5E1", borderRadius: 8, padding: 12 }}>
            <h4 style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 800, color: "#0F172A" }}>
              👨‍💼 Assigned Supervisor Information
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              <div>
                <label style={{ fontSize: 10.5, fontWeight: 700, color: "#475569" }}>Supervisor Name</label>
                <input type="text" placeholder="Full Name" value={supervisorName} onChange={(e) => setSupervisorName(e.target.value)} style={{ width: "100%", padding: 5, fontSize: 11.5, borderRadius: 4, border: "1px solid #94A3B8" }} />
              </div>
              <div>
                <label style={{ fontSize: 10.5, fontWeight: 700, color: "#475569" }}>Mobile Phone</label>
                <input type="text" placeholder="10-digit number" value={supervisorPhone} onChange={(e) => setSupervisorPhone(e.target.value)} style={{ width: "100%", padding: 5, fontSize: 11.5, borderRadius: 4, border: "1px solid #94A3B8" }} />
              </div>
              <div>
                <label style={{ fontSize: 10.5, fontWeight: 700, color: "#475569" }}>Official Email</label>
                <input type="email" placeholder="supervisor@email.com" value={officialEmail} onChange={(e) => setOfficialEmail(e.target.value)} style={{ width: "100%", padding: 5, fontSize: 11.5, borderRadius: 4, border: "1px solid #94A3B8" }} />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
            <button type="button" onClick={onClose} style={{ padding: "8px 16px", fontSize: 12.5, borderRadius: 8, border: "1px solid var(--line)" }}>
              Cancel
            </button>
            <button type="submit" style={{ padding: "8px 20px", fontSize: 12.5, fontWeight: 800, borderRadius: 8, border: "none", background: "#2563EB", color: "#fff", cursor: "pointer" }}>
              💾 Save Warehouse Hub
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
