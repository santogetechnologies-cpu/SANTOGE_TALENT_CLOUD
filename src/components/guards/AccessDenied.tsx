import React from 'react';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getRoleDashboardPath } from '../../permissions/guards';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';

export const AccessDenied: React.FC<{ requiredRoleOrPermission?: string }> = ({ requiredRoleOrPermission }) => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const homePath = getRoleDashboardPath(role);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center text-rose-600 mb-5 shadow-soft">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900">Access Restricted</h1>
      <p className="mt-2 text-sm text-slate-600 max-w-md">
        You do not have permission or data scope authorization to view this module.
      </p>

      <div className="mt-4 p-3 bg-slate-100 rounded-xl text-xs text-slate-600 inline-block text-left">
        <p><span className="font-semibold text-slate-900">Current Role:</span> {user?.roleTitle || role}</p>
        <p><span className="font-semibold text-slate-900">Scope Type:</span> {user?.dataScope.scopeType}</p>
        {requiredRoleOrPermission && (
          <p><span className="font-semibold text-slate-900">Required:</span> {requiredRoleOrPermission}</p>
        )}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Button variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate(-1)}>
          Go Back
        </Button>
        <Button variant="primary" leftIcon={<Home className="w-4 h-4" />} onClick={() => navigate(homePath)}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};
