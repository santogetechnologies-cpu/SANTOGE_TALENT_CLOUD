import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useScope } from '../../contexts/ScopeContext';
import { ROLE_DEFINITIONS } from '../../permissions/roles';
import { getRoleDashboardPath } from '../../permissions/guards';
import { Role } from '../../types/auth';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Sparkles } from 'lucide-react';
import clsx from 'clsx';

export const DevRoleSwitcher: React.FC = () => {
  const { user, role, login } = useAuth();
  const { activeCollege, selectCollege, availableColleges } = useScope();
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const navigate = useNavigate();

  // Hide completely in production builds if configured
  const isDev = (import.meta as any).env?.DEV;
  if (!isDev) return null;

  const roleCreds: { email: string; role: Role; label: string; sub: string; category: string }[] = [
    { email: 'admin@santoge.com', role: 'SUPER_ADMIN', label: '1. Super Admin', sub: 'Full platform access (All data)', category: 'Platform Administration' },
    { email: 'ops@santoge.com', role: 'OPERATIONS_MANAGER', label: '2. Operations Manager', sub: 'Batches, mentors & at-risk queues', category: 'Platform Administration' },
    { email: 'finance@santoge.com', role: 'FINANCE_ADMIN', label: '3. Finance Admin', sub: 'Verification, invoices, subscriptions', category: 'Platform Administration' },
    { email: 'content@santoge.com', role: 'CONTENT_MANAGER', label: '4. Content Manager', sub: 'Draft → Review → Publish workflow', category: 'Platform Administration' },
    { email: 'principal@apextech.edu', role: 'COLLEGE_SUPER_ADMIN', label: '5. College Super Admin', sub: 'Apex Institute (Single college)', category: 'College CPOS' },
    { email: 'ananya.sen@apextech.edu', role: 'COLLEGE_PLACEMENT_OFFICER', label: '6. Placement Officer (CPO)', sub: 'Apex Campus Drives & CRM', category: 'College CPOS' },
    { email: 'arvind.sharma@apextech.edu', role: 'DEPARTMENT_COORDINATOR', label: '7. Dept Coordinator (CSE)', sub: 'Apex CSE Dept only', category: 'College CPOS' },
    { email: 'suresh.mentor@santoge.com', role: 'MENTOR', label: '8. Mentor (Suresh)', sub: 'Assigned Batches & Interventions', category: 'Learning Operations' },
    { email: 'priya.coord@santoge.com', role: 'BATCH_COORDINATOR', label: '9. Batch Coordinator (Priya)', sub: 'Batch Sync & Telegram Announcements', category: 'Learning Operations' },
    { email: 'rahul.sharma@apextech.edu', role: 'STUDENT', label: '10. Student (Rahul Sharma)', sub: 'Personalized Learning & Placement', category: 'Student' },
    { email: 'sarah@techcorp.com', role: 'RECRUITER', label: '11. Recruiter (TechCorp)', sub: 'Talent Discovery & Kanban Pipeline', category: 'Recruiter' },
  ];

  const handleSelectRole = async (email: string, targetRole: Role) => {
    setIsSwitching(true);
    try {
      await login(email, 'Santoge@2026');
      setIsOpen(false);
      const dest = getRoleDashboardPath(targetRole);
      navigate(dest);
    } catch (e) {
      console.warn('Dev login notice:', e);
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen && (
        <div className="mb-2 w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Header */}
          <div className="bg-slate-900 text-white p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <div>
                <h4 className="text-xs font-bold tracking-wide">DEV ROLE & SCOPE SWITCHER</h4>
                <p className="text-[10px] text-slate-400">Authenticating via Supabase</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white text-xs font-bold px-2 py-0.5 rounded hover:bg-slate-800"
            >
              ✕
            </button>
          </div>

          {/* Active Scope Card */}
          <div className="p-3 bg-slate-50 border-b border-slate-100 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-600">Active User:</span>
              <span className="font-bold text-slate-900">{user?.name}</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="font-semibold text-slate-600">Scope Type:</span>
              <span className="px-1.5 py-0.5 bg-brand-100 text-brand-800 rounded font-mono text-[11px] font-bold">
                {user?.dataScope.scopeType}
              </span>
            </div>
            {user?.dataScope.collegeName && (
              <div className="flex items-center justify-between mt-1">
                <span className="font-semibold text-slate-600">Scoped College:</span>
                <span className="text-slate-800 truncate max-w-[180px] font-medium">{user.dataScope.collegeName}</span>
              </div>
            )}
          </div>

          {/* Role List */}
          <div className="max-h-72 overflow-y-auto p-2 divide-y divide-slate-100">
            {roleCreds.map(opt => {
              const isSelected = user?.role === opt.role;
              return (
                <button
                  key={opt.email}
                  disabled={isSwitching}
                  onClick={() => handleSelectRole(opt.email, opt.role)}
                  className={clsx(
                    'w-full text-left p-2.5 rounded-xl text-xs transition-colors flex items-start justify-between gap-2 cursor-pointer',
                    isSelected
                      ? 'bg-brand-50 border border-brand-200 text-brand-900 font-bold'
                      : 'hover:bg-slate-100 text-slate-700'
                  )}
                >
                  <div>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                      <span>{opt.label}</span>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-ping" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{opt.email}</p>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 bg-slate-200/60 rounded text-slate-600 font-medium shrink-0">
                    {opt.category}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Multi-College Isolation Switcher */}
          <div className="p-3 bg-slate-50 border-t border-slate-100 text-xs">
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
              Switch Active College Context:
            </label>
            <select
              value={activeCollege?.id || ''}
              onChange={e => selectCollege(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-brand-500 outline-none"
            >
              {availableColleges.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-full shadow-soft-lg hover:shadow-glow-brand transition-all border border-slate-700 font-medium text-xs cursor-pointer active:scale-95"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-bold">Role:</span>
        <span className="text-brand-300 font-mono">{ROLE_DEFINITIONS[role]?.title?.split(' ')[0] || role}</span>
        <ChevronDown className={clsx('w-3.5 h-3.5 transition-transform', isOpen && 'rotate-180')} />
      </button>
    </div>
  );
};
