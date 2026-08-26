import { useMemo } from "react";
import PageHeader from "../components/common/PageHeader";
import Badge from "../components/common/Badge";
import Avatar from "../components/common/Avatar";
import AsyncState from "../components/common/AsyncState";
import { useAttendance } from "../features/attendance/useAttendance";

const PIN_POSITIONS = [
  { top: "28%", left: "22%" },
  { top: "45%", left: "58%" },
  { top: "68%", left: "34%" },
  { top: "22%", left: "72%" },
];

export default function EmployeeLocationMap() {
  const { records, status, error } = useAttendance();

  // No real GPS/geo hardware exists yet - this derives "last known location"
  // from each employee's most recent attendance record (warehouse + check-in
  // time) rather than fabricating live coordinates. One entry per employee,
  // most recent record wins.
  const employeeLocations = useMemo(() => {
    const byEmployee = new Map();
    for (const r of records) {
      const existing = byEmployee.get(r.employeeId);
      if (!existing || r.date > existing.date) byEmployee.set(r.employeeId, r);
    }
    return [...byEmployee.values()].map((r) => ({
      employee: r.employee,
      warehouse: r.warehouse,
      lastSeen: `${r.date}, ${r.checkIn !== "—" ? r.checkIn : "no check-in time logged"}`,
      accuracy: r.status === "Present" || r.status === "Late" ? "Checked in" : "Last known - not yet checked in",
    }));
  }, [records]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <PageHeader
        title="Employee Location Map"
        subtitle="Last logged check-in per employee, derived from attendance records"
      />

      <AsyncState status={status} error={error} loadingLabel="Loading locations…" />

      {/* COMPACT MAP CONTAINER */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: 14,
          padding: "16px 18px",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, paddingBottom: 8, borderBottom: "1px solid var(--line)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <i className="ri-map-pin-user-line" style={{ color: "var(--primary)", fontSize: 14 }} />
            <h3 style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: "var(--ink)" }}>
              Warehouse Field Overview
            </h3>
          </div>
          <span style={{ fontSize: 11, color: "var(--muted)", display: "inline-flex", alignItems: "center", gap: 4 }}>
            <i className="ri-information-line" style={{ color: "var(--primary)" }} /> Illustrative positions, not live GPS
          </span>
        </div>

        <div
          style={{
            position: "relative",
            height: 280,
            borderRadius: 12,
            background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
            overflow: "hidden",
            boxShadow: "inset 0 0 20px rgba(0,0,0,0.5)",
          }}
        >
          {/* Subtle grid lines background overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          />

          {employeeLocations.map((loc, i) => {
            const pos = PIN_POSITIONS[i % PIN_POSITIONS.length];
            return (
              <div
                key={loc.employee}
                title={`${loc.employee} — ${loc.warehouse}`}
                style={{
                  position: "absolute",
                  top: pos.top,
                  left: pos.left,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  transform: "translate(-50%, -50%)",
                  cursor: "pointer",
                  zIndex: 2,
                }}
              >
                {/* Radar pulse marker */}
                <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: "rgba(16, 185, 129, 0.3)",
                      position: "absolute",
                      animation: "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
                    }}
                  />
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      background: "#10B981",
                      border: "2px solid white",
                      boxShadow: "0 0 10px #10B981",
                    }}
                  />
                </div>

                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: "white",
                    background: "rgba(15, 23, 42, 0.85)",
                    backdropFilter: "blur(4px)",
                    padding: "3px 8px",
                    borderRadius: 12,
                    marginTop: 4,
                    whiteSpace: "nowrap",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <i className="ri-user-3-line" style={{ fontSize: 9, color: "#10B981" }} />
                  {loc.employee.split(" ")[0]} ({loc.warehouse})
                </span>
              </div>
            );
          })}
        </div>

        <p style={{ margin: "10px 0 0", fontSize: 11.5, color: "var(--muted)", display: "flex", alignItems: "center", gap: 5 }}>
          <i className="ri-information-line" style={{ color: "var(--primary)" }} />
          Positions on the map are illustrative only - there is no GPS hardware integration yet. The list below reflects real attendance data.
        </p>
      </div>

      {/* LAST KNOWN LOCATIONS CARDS GRID */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: 14,
          padding: "18px 20px",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, paddingBottom: 8, borderBottom: "1px solid var(--line)" }}>
          <i className="ri-map-pin-line" style={{ color: "var(--primary)", fontSize: 14 }} />
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>
            Last Logged Check-In per Employee
          </h3>
        </div>

        {employeeLocations.length === 0 ? (
          <p style={{ fontSize: 12.5, color: "var(--muted)", textAlign: "center", padding: "20px 0" }}>
            No attendance records logged yet.
          </p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat( auto-fit, minmax(280px, 1fr) )", gap: 12 }}>
            {employeeLocations.map((loc, idx) => {
              const initials = loc.employee.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
              return (
                <div
                  key={loc.employee}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 14px",
                    border: "1px solid var(--line)",
                    borderRadius: 12,
                    background: "var(--surface-hover)",
                    boxShadow: "var(--shadow-xs)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar initials={initials} index={idx} />
                    <div>
                      <strong style={{ fontSize: 13, color: "var(--ink)" }}>{loc.employee}</strong>
                      <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "var(--muted)", display: "flex", alignItems: "center", gap: 4 }}>
                        <i className="ri-building-line" style={{ color: "var(--primary)", fontSize: 10 }} />
                        {loc.warehouse}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--primary-deep)", display: "block" }}>
                      <i className="ri-time-line" style={{ fontSize: 10, marginRight: 4 }} />
                      {loc.lastSeen}
                    </span>
                    <Badge tone="success">{loc.accuracy}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
