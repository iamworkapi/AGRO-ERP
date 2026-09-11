import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import AppRoutes from "./routes/AppRoutes";
import ProtectedRoute from "./routes/ProtectedRoute";
import WaitingForAssignment from "./pages/WaitingForAssignment";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Toaster from "./components/common/Toaster";
import Loader from "./components/common/Loader";
import { useAuth } from "./hooks/useAuth";

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

  useEffect(() => {
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!bootstrapped) return <SplashScreen />;

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Toaster />
      <Routes>
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
        <Route
          path="/waiting-for-assignment"
          element={
            <ProtectedRoute>
              <WaitingForAssignment />
            </ProtectedRoute>
          }
        />

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
