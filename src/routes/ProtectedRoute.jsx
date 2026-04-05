import { Navigate } from "react-router-dom";
import { isAuthenticated, hasAnyPermission } from "../utils/auth";

const ProtectedRoute = ({ children, requiredPermissions }) => {
  if (!isAuthenticated()) return <Navigate to="/auth/sign-in" replace />;
  if (requiredPermissions && !hasAnyPermission(requiredPermissions)) {
    return <Navigate to="/dashboard/home" replace />;
  }
  return children;
};

export default ProtectedRoute;
