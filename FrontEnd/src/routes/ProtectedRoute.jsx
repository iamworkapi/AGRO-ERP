import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && !roles.includes(user?.roleKey)) {
    return <AccessDenied />;
  }

  // Unassigned admin/supervisor can log in but are sent to a waiting
  // screen — they can still use "My Profile" and change their password,
  // but the dashboard and other scoped modules stay hidden until the
  // Super Admin assigns them to a warehouse.
  const isUnassignedScopedUser =
    (user?.roleKey === "warehouse_admin" || user?.roleKey === "supervisor") &&
    !user?.warehouseId;

  if (isUnassignedScopedUser && location.pathname !== "/waiting-for-assignment" && location.pathname !== "/settings/my-profile") {
    return <Navigate to="/waiting-for-assignment" replace />;
  }

  return children;
}

function AccessDenied() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: "80px 20px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 32 }}></div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)", margin: 0 }}>Access Denied</h2>
      <p style={{ fontSize: 13, color: "var(--muted)", margin: 0, maxWidth: 360 }}>
        Your account doesn&rsquo;t have permission to view this page. Contact a Super Admin if you believe this is a mistake.
      </p>
    </div>
  );
}
