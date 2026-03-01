import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  requireAdmin?: boolean;
  requirePermission?: string | string[];
}

const ProtectedRoute = ({ requireAdmin = false, requirePermission }: ProtectedRouteProps) => {
  const { isAuthenticated, isAdmin, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requirePermission) {
    const permissionsToCheck = Array.isArray(requirePermission) ? requirePermission : [requirePermission];
    const hasPermission = isAdmin || permissionsToCheck.some(p => (user?.permissions || []).includes(p));
    if (!hasPermission) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
