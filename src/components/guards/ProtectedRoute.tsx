import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Role, Permission } from '../../types/auth';
import { hasPermission } from '../../permissions/guards';
import { AccessDenied } from './AccessDenied';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
  requiredPermission?: Permission;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requiredPermission,
}) => {
  const { user, role, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Authenticating SantoGe Talent Cloud...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <AccessDenied requiredRoleOrPermission={`Role: ${allowedRoles.join(', ')}`} />;
  }

  if (requiredPermission && !hasPermission(user, requiredPermission)) {
    return <AccessDenied requiredRoleOrPermission={`Permission: ${requiredPermission}`} />;
  }

  return <>{children}</>;
};

export const PermissionGuard: React.FC<{
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ permission, children, fallback = null }) => {
  const { user } = useAuth();
  if (!hasPermission(user, permission)) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
};
