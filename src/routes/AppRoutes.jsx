import { Routes, Route, Navigate, useLocation  } from "react-router-dom";
import { Dashboard, Auth } from "@/layouts";
import ProtectedRoute from "./ProtectedRoute";
import { isAuthenticated } from "../utils/auth";

const AuthWrapper = () => {
  const location = useLocation();
  const allowedPaths = ["/auth/sign-in", "/auth/forgot-password", "/auth/reset-password"];

  // Si NO está autenticado y trata de entrar a otra ruta que no sea sign-in o forgot-password
  if (!isAuthenticated() && !allowedPaths.includes(location.pathname)) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  // Si SÍ está autenticado y trata de ir al login o forgot, mándalo al dashboard
  if (isAuthenticated() && allowedPaths.includes(location.pathname)) {
    return <Navigate to="/dashboard/home" replace />;
  }

  return <Auth />;
};

const AppRoutes = () => {
  return (
    <Routes>

       {/* Rutas protegidas */}
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      {/* Rutas públicas, controladas por AuthWrapper */}
      <Route path="/auth/*" element={<AuthWrapper />} />
      {/* Redirección por defecto */}
      <Route
        path="*"
        element={
          isAuthenticated()
            ? <Navigate to="/dashboard/home" replace />
            : <Navigate to="/auth/sign-in" replace />
        }
      />
    </Routes>
  );
};

export default AppRoutes;
