import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function WaitingForAssignment() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const res = await fetch("/api/v1/warehouses", {
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        });
        if (res.ok) {
          const body = await res.json();
          const list = body?.data || [];
          if (list.length > 0) {
            window.location.href = "/";
          }
        }
      } catch {
        // Still waiting — stay on this page.
      }
    }, 8000);

    setChecked(true);
    return () => clearInterval(timer);
  }, []);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0D3823 0%, #1B5E3A 50%, #2E8B57 100%)",
        padding: 20,
      }}
    >
      <div
        style={{
          background: "var(--surface)",
          borderRadius: 20,
          padding: "40px 36px",
          maxWidth: 460,
          width: "100%",
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        {/* Animated icon */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(93, 214, 44, 0.2) 0%, rgba(27, 94, 58, 0.1) 100%)",
            border: "3px solid rgba(93, 214, 44, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            animation: "pulse-border 2s ease-in-out infinite",
          }}
        >
          <i
            className="ri-warehouse-line"
            style={{ fontSize: 36, color: "var(--primary)", animation: "pulse-icon 2s ease-in-out infinite" }}
          />
        </div>

        <h1
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: "var(--ink)",
            margin: "0 0 8px",
            letterSpacing: "-0.02em",
          }}
        >
          Awaiting Warehouse Assignment
        </h1>

        <p
          style={{
            fontSize: 13,
            color: "var(--muted)",
            lineHeight: 1.6,
            margin: "0 0 6px",
          }}
        >
          Hello, <strong>{user?.name || "User"}</strong>. Your account is active, but you have not been assigned to a warehouse yet.
        </p>

        <p
          style={{
            fontSize: 12.5,
            color: "var(--muted)",
            lineHeight: 1.5,
            margin: "0 0 24px",
          }}
        >
          Please contact your <strong>Super Administrator</strong> to assign you to a warehouse hub. You will be redirected automatically once the assignment is complete.
        </p>

        <div
          style={{
            background: "var(--canvas)",
            border: "1px solid var(--line)",
            borderRadius: 12,
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "var(--primary-tint)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <i className="ri-user-line" style={{ fontSize: 18, color: "var(--primary-deep)" }} />
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)" }}>{user?.name || "User"}</div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>
              {user?.role === "warehouse_admin" ? "Warehouse Admin" : "Supervisor"} &middot; {user?.email || user?.phone || ""}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            fontSize: 11.5,
            color: "var(--muted)",
            marginBottom: 16,
          }}
        >
          <i className="ri-refresh-line spin" style={{ fontSize: 14 }} />
          Checking for assignment every 8 seconds&hellip;
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 20px",
            fontSize: 12,
            fontWeight: 700,
            color: "var(--status-error)",
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.25)",
            borderRadius: 20,
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          <i className="ri-logout-box-line" style={{ fontSize: 14 }} />
          Logout &amp; Switch Account
        </button>
      </div>

      <style>{`
        @keyframes pulse-border {
          0%, 100% { border-color: rgba(93, 214, 44, 0.3); box-shadow: 0 0 0 0 rgba(93, 214, 44, 0.2); }
          50% { border-color: rgba(93, 214, 44, 0.7); box-shadow: 0 0 0 12px rgba(93, 214, 44, 0); }
        }
        @keyframes pulse-icon {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
}
