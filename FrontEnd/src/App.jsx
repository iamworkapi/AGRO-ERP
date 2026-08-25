import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import AppRoutes from "./routes/AppRoutes";
import ProtectedRoute from "./routes/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Toaster from "./components/common/Toaster";
import Loader from "./components/common/Loader";
import { useAuth } from "./hooks/useAuth";

// Keeps an already-signed-in user from landing back on the login/register
// screen (e.g. hitting back button, or a stale bookmark).
function PublicOnlyRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

function SplashScreen() {
  return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--canvas)" }}>
      <Loader size={72} label="Loading…" />
    </div>
  );
}

export default function App() {
  const { bootstrap, bootstrapped } = useAuth();

  // Confirms any token left over from a previous visit is still valid
  // (GET /auth/me) before deciding whether to show the app or the login
  // screen - see authSlice.js bootstrapAuthThunk.
  useEffect(() => {
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!bootstrapped) return <SplashScreen />;

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Toaster />
      <Routes>
        {/* Public, unauthenticated routes - no sidebar/topbar */}
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />

        {/* Everything else requires a session and renders inside the dashboard shell */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <AppRoutes />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
