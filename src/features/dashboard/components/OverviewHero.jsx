import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserCog, Wheat, Circle, CalendarDays, Clock, RefreshCw } from "lucide-react";
function LucideIconWrapper({ children, size }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: size, height: size, flexShrink: 0 }}>
      {children}
    </span>
  );
}



export default function OverviewHero({
  user,
  isSupervisor,
  assignedHub,
  timeRange,
  onTimeRangeChange,
  onRefresh,
}) {
  const navigate = useNavigate();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    if (onRefresh) onRefresh();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const getGreeting = () => {
    const hour = currentDateTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const userName = user?.fullName || user?.name || (isSupervisor ? "Warehouse Supervisor" : "System Administrator");
  const roleTitle = isSupervisor ? "Field Operations Supervisor" : (user?.role === "super_admin" || user?.roleKey === "super_admin" ? "Super Administrator" : "Warehouse Administrator");

  const formattedDate = currentDateTime.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const formattedTime = currentDateTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div
      style={{
        background: "linear-gradient(135deg, var(--palette-c1) 0%, var(--palette-c2) 40%, var(--palette-c3) 75%, var(--palette-c4) 100%)",
        borderRadius: 16,
        padding: "16px 20px",
        color: "#FFFFFF",
        boxShadow: "0 10px 24px -4px rgba(5, 31, 32, 0.4)",
        position: "relative",
        overflow: "hidden",
        border: "1px solid rgba(255, 255, 255, 0.12)",
      }}
    >
      {/* Ambient background decoration */}
      <div
        style={{
          position: "absolute",
          top: -50,
          right: -30,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(52, 211, 153, 0.22) 0%, rgba(13, 56, 35, 0) 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -30,
          left: "25%",
          width: 150,
          height: 150,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(13, 56, 35, 0) 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 14,
        }}
      >
        {/* Left Side: Greeting & Identity */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              color: "#FFFFFF",
              boxShadow: "0 6px 16px rgba(16, 185, 129, 0.3)",
              border: "1.5px solid rgba(255, 255, 255, 0.25)",
              flexShrink: 0,
            }}
          >
            <LucideIconWrapper size={20}>
              {isSupervisor ? <UserCog size={20} /> : <Wheat size={20} />}
            </LucideIconWrapper>
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 900,
                  color: "#FFFFFF",
                  letterSpacing: "-0.02em",
                }}
              >
                {getGreeting()}, {userName} 👋
              </h2>
              <span
                style={{
                  fontSize: 9.5,
                  fontWeight: 800,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  background: "rgba(52, 211, 153, 0.2)",
                  color: "#A7F3D0",
                  padding: "2px 8px",
                  borderRadius: 12,
                  border: "1px solid rgba(52, 211, 153, 0.35)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <LucideIconWrapper size={5}>
                  <Circle size={5} fill="#34D399" />
                </LucideIconWrapper>
                {roleTitle}
              </span>
            </div>

            <p style={{ margin: "3px 0 0", fontSize: 12, color: "#D1FAE5", opacity: 0.9 }}>
              {isSupervisor ? (
                <>
                  Assigned Operating Hub: <strong>{assignedHub}</strong> • Live Procurement & Weighbridge Desk
                </>
              ) : (
                <>
                  Consolidated Enterprise Telemetry • <strong>4 Hubs</strong>, Active Procurement & Dispatches
                </>
              )}
            </p>
          </div>
        </div>

        {/* Right Side: Clock & Time Range Filter Buttons */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
          {/* Live Date / Clock & Refresh */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                color: "#E2E8F0",
                background: "rgba(0, 0, 0, 0.25)",
                backdropFilter: "blur(8px)",
                padding: "6px 14px",
                borderRadius: 20,
                border: "1px solid rgba(255, 255, 255, 0.15)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <LucideIconWrapper size={13}>
                <CalendarDays size={13} />
              </LucideIconWrapper>
              <span>{formattedDate}</span>
              <span style={{ opacity: 0.4 }}>|</span>
              <LucideIconWrapper size={13}>
                <Clock size={13} />
              </LucideIconWrapper>
              <span style={{ fontFamily: "monospace", letterSpacing: "0.5px" }}>{formattedTime}</span>
            </div>

            <button
              type="button"
              onClick={handleRefreshClick}
              title="Refresh Live Metrics"
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.15)",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                color: "#FFFFFF",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
              }}
            >
              {isRefreshing ? (
                <span
                  style={{
                    display: "inline-flex",
                    animation: "spin 1s linear infinite",
                  }}
                >
                  <RefreshCw size={12} />
                </span>
              ) : (
                <LucideIconWrapper size={12}>
                  <RefreshCw size={12} />
                </LucideIconWrapper>
              )}
            </button>
          </div>

          {/* Time Range Selector Filter */}
          <div
            style={{
              display: "inline-flex",
              background: "rgba(0, 0, 0, 0.3)",
              backdropFilter: "blur(8px)",
              padding: 3,
              borderRadius: 12,
              border: "1px solid rgba(255, 255, 255, 0.14)",
            }}
          >
            {[
              { key: "today", label: "Today" },
              { key: "week", label: "This Week" },
              { key: "month", label: "This Month" },
              { key: "ytd", label: "Fiscal YTD" },
            ].map((t) => {
              const active = timeRange === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => onTimeRangeChange(t.key)}
                  style={{
                    border: "none",
                    padding: "5px 12px",
                    fontSize: 11.5,
                    fontWeight: active ? 800 : 600,
                    borderRadius: 9,
                    background: active ? "linear-gradient(135deg, #10B981 0%, #059669 100%)" : "transparent",
                    color: active ? "#FFFFFF" : "rgba(255, 255, 255, 0.75)",
                    cursor: "pointer",
                    boxShadow: active ? "0 2px 8px rgba(0,0,0,0.3)" : "none",
                    transition: "all 0.2s ease",
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
