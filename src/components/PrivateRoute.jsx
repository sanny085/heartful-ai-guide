import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

// Simple auth guard for protected routes
const PrivateRoute = ({ children }) => {
  const { user = false, loading } = useAuth();

  // While auth state is resolving, avoid flashing the protected screen
  if (loading) return null;

  return user ? children : <Navigate to="/auth" replace />;
};

export default PrivateRoute;

