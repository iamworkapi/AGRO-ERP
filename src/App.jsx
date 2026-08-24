import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import AppRoutes from "./routes/AppRoutes";
import ProtectedRoute from "./routes/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Toaster from "./components/common/Toaster";
import Loader from "./components/common/Loader";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { useDispatch } from "react-redux";
import { setBootstrapped } from "./features/auth/authSlice";
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
  const dispatch = useDispatch();

  // Confirms any token left over from a previous visit is still valid
  // (GET /auth/me) before deciding whether to show the app or the login
  // screen - see authSlice.js bootstrapAuthThunk.
  useEffect(() => {
    bootstrap();

    // Fallback: if network/backend check takes more than 2.5s, exit splash screen
    const timer = setTimeout(() => {
      dispatch(setBootstrapped());
    }, 2500);

    return () => clearTimeout(timer);
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
              <ErrorBoundary>
                <DashboardLayout>
                  <AppRoutes />
                </DashboardLayout>
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
