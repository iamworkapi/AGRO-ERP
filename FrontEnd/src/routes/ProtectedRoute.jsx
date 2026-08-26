import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// Two layers, same as the backend: is there a session at all (isAuthenticated),
// and if `roles` is given, does this session's role match (mirrors the
// backend's authorize(...roles) gate so the UI doesn't offer actions the
// API would reject anyway).
export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && !roles.includes(user?.roleKey)) {
    return <AccessDenied />;
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
