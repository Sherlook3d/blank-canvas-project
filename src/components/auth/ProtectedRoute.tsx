import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { usePagePermission } from '@/hooks/usePagePermission';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  pageKey?: string;
}

export function ProtectedRoute({ children, allowedRoles, pageKey }: ProtectedRouteProps) {
  const { user, profile, role, isLoading } = useAuth();
  const location = useLocation();
  const { hasPermission, isLoading: isLoadingPermission } = usePagePermission(pageKey || '');

  if (isLoading || (pageKey && isLoadingPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // User is logged in but has no hotel - redirect to setup
  if (profile && !profile.hotel_id) {
    return <Navigate to="/setup" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  // Check page-specific permission if pageKey is provided
  if (pageKey && hasPermission === false) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
