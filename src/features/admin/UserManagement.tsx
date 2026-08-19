import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { authService } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';
import { Role, DataScope } from '../../types/auth';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { DataTable } from '../../components/shared/DataTable';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Mail,
  Building,
  KeyRound,
  RefreshCw,
  Trash2,
  RotateCcw,
  AlertTriangle,
  Radio,
  Award,
  Sparkles,
} from 'lucide-react';

interface CollegeOption {
  id: string;
  name: string;
  code: string;
  city: string;
  admin_name: string;
  admin_email: string;
  placement_officer_name: string;
  placement_officer_email: string;
}

interface ProfileRecord {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  phone?: string;
  avatar_url?: string;
  data_scope?: DataScope & { isActive?: boolean };
  created_at: string;
}

const ALL_ROLES: { value: Role; label: string; isCollegeScoped?: boolean }[] = [
  { value: 'SUPER_ADMIN', label: '👑 Super Admin (Full Platform)' },
  { value: 'COLLEGE_SUPER_ADMIN', label: '🏛️ College Super Admin', isCollegeScoped: true },
  { value: 'COLLEGE_PLACEMENT_OFFICER', label: '💼 Placement Officer (CPO)', isCollegeScoped: true },
  { value: 'DEPARTMENT_COORDINATOR', label: '🔬 Department Coordinator', isCollegeScoped: true },
  { value: 'MENTOR', label: '🧑‍🏫 Mentor', isCollegeScoped: true },
  { value: 'BATCH_COORDINATOR', label: '📢 Batch Coordinator', isCollegeScoped: true },
  { value: 'STUDENT', label: '🎓 Student Learner', isCollegeScoped: true },
  { value: 'RECRUITER', label: '🏢 Recruiter' },
  { value: 'OPERATIONS_MANAGER', label: '⚙️ Operations Manager' },
  { value: 'FINANCE_ADMIN', label: '💳 Finance Admin' },
  { value: 'CONTENT_MANAGER', label: '📝 Content Manager' },
];

export const UserManagement: React.FC = () => {
  const { user: currentSuperAdmin } = useAuth();
  const [profiles, setProfiles] = useState<ProfileRecord[]>([]);
  const [colleges, setColleges] = useState<CollegeOption[]>([]);
  const [roleFilter, setRoleFilter] = useState<Role | 'ALL'>('ALL');
  const [collegeFilter, setCollegeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRealtimeActive, setIsRealtimeActive] = useState(false);

  // Create User Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('Santoge@2026');
  const [newRole, setNewRole] = useState<Role>('COLLEGE_SUPER_ADMIN');
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Delete User Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<ProfileRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Reset Password Modal State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [userToReset, setUserToReset] = useState<ProfileRecord | null>(null);
  const [newTempPassword, setNewTempPassword] = useState('Santoge@2026');
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch colleges
      const { data: collegesData, error: collegesError } = await (supabase
        .from('colleges') as any)
        .select('id, name, code, city, admin_name, admin_email, placement_officer_name, placement_officer_email')
        .order('name', { ascending: true });

      if (collegesError) {
        console.warn('Colleges query warning:', collegesError.message);
      } else {
        const list: CollegeOption[] = collegesData || [];
        setColleges(list);
        if (list.length > 0 && !selectedCollegeId) {
          setSelectedCollegeId(list[0].id);
        }
      }

      // 2. Fetch profiles
      let query = (supabase.from('profiles') as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (roleFilter !== 'ALL') {
        query = query.eq('role', roleFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching profiles:', error);
        setProfiles([]);
      } else {
        setProfiles(data || []);
      }
    } catch (err) {
      console.error('loadData exception:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial Load
  useEffect(() => {
    loadData();
  }, [roleFilter]);

  // Realtime Subscription on PostgreSQL profiles and colleges tables
  useEffect(() => {
    const channel = supabase
      .channel('realtime-user-management')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        payload => {
          console.log('Realtime change in profiles table:', payload);
          setIsRealtimeActive(true);
          loadData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'colleges' },
        payload => {
          console.log('Realtime change in colleges table:', payload);
          setIsRealtimeActive(true);
          loadData();
        }
      )
      .subscribe(status => {
        if (status === 'SUBSCRIBED') {
          setIsRealtimeActive(true);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roleFilter]);

  const selectedCollege = colleges.find(c => c.id === selectedCollegeId) || (colleges.length > 0 ? colleges[0] : null);

  const isSelectedRoleCollegeScoped = [
    'COLLEGE_SUPER_ADMIN',
    'COLLEGE_PLACEMENT_OFFICER',
    'DEPARTMENT_COORDINATOR',
    'MENTOR',
    'BATCH_COORDINATOR',
    'STUDENT',
  ].includes(newRole);

  const handleAutofillCollegeContact = (type: 'admin' | 'placement') => {
    if (!selectedCollege) return;
    if (type === 'admin') {
      setNewName(selectedCollege.admin_name || 'College Admin');
      setNewEmail(selectedCollege.admin_email || `admin@${selectedCollege.code.toLowerCase()}.edu`);
    } else if (type === 'placement') {
      setNewName(selectedCollege.placement_officer_name || 'Placement Officer');
      setNewEmail(selectedCollege.placement_officer_email || `placement@${selectedCollege.code.toLowerCase()}.edu`);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormMessage(null);

    let dataScope: DataScope = { scopeType: newRole === 'SUPER_ADMIN' ? 'ALL' : 'SELF' };

    if (isSelectedRoleCollegeScoped) {
      if (selectedCollege) {
        dataScope = {
          scopeType: 'COLLEGE',
          collegeId: selectedCollege.id,
          collegeName: selectedCollege.name,
        };
      } else {
        dataScope = {
          scopeType: 'COLLEGE',
        };
      }
    }

    try {
      await authService.signUp(newEmail, newPassword, newName, newRole, dataScope);
      setFormMessage({ type: 'success', text: `User account created & bound to ${dataScope.collegeName || 'Platform'} in realtime!` });
      setTimeout(() => {
        setIsCreateModalOpen(false);
        setNewName('');
        setNewEmail('');
        setNewPassword('Santoge@2026');
        setFormMessage(null);
        loadData();
      }, 1000);
    } catch (err: any) {
      console.error('Error creating user:', err);
      setFormMessage({ type: 'error', text: err.message || 'Failed to create user.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = async (userId: string, targetRole: Role) => {
    try {
      const isTargetCollegeScoped = [
        'COLLEGE_SUPER_ADMIN',
        'COLLEGE_PLACEMENT_OFFICER',
        'DEPARTMENT_COORDINATOR',
        'MENTOR',
        'BATCH_COORDINATOR',
        'STUDENT',
      ].includes(targetRole);

      const targetScope: DataScope = isTargetCollegeScoped && selectedCollege
        ? { scopeType: 'COLLEGE', collegeId: selectedCollege.id, collegeName: selectedCollege.name }
        : { scopeType: targetRole === 'SUPER_ADMIN' ? 'ALL' : 'SELF' };

      const { error } = await (supabase
        .from('profiles') as any)
        .update({
          role: targetRole,
          data_scope: targetScope,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (!error) {
        setProfiles(prev =>
          prev.map(p => (p.id === userId ? { ...p, role: targetRole, data_scope: targetScope } : p))
        );
      }
    } catch (err) {
      console.error('Error updating role:', err);
    }
  };

  const handleToggleActive = async (userId: string, currentActive: boolean) => {
    try {
      const targetUser = profiles.find(p => p.id === userId);
      const updatedScope = {
        ...(targetUser?.data_scope || { scopeType: 'SELF' as const }),
        isActive: !currentActive,
      };

      const { error } = await (supabase
        .from('profiles') as any)
        .update({
          data_scope: updatedScope,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (!error) {
        setProfiles(prev =>
          prev.map(p => (p.id === userId ? { ...p, data_scope: updatedScope } : p))
        );
      }
    } catch (err) {
      console.error('Error toggling active status:', err);
    }
  };

  const handleDeleteUserConfirm = async () => {
    if (!userToDelete) return;
    if (userToDelete.id === currentSuperAdmin?.id) {
      setDeleteError('You cannot delete your own active Super Admin account.');
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await authService.deleteUser(userToDelete.id);
      setProfiles(prev => prev.filter(p => p.id !== userToDelete.id));
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (err: any) {
      console.error('Error deleting user:', err);
      setDeleteError(err.message || 'Failed to delete user from database.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToReset) return;

    setIsResetting(true);
    setResetMessage(null);

    try {
      const result = await authService.adminResetPassword(userToReset.email, newTempPassword);
      setResetMessage({ type: 'success', text: result.message });
      setTimeout(() => {
        setIsResetModalOpen(false);
        setUserToReset(null);
        setResetMessage(null);
      }, 1800);
    } catch (err: any) {
      console.error('Error resetting password:', err);
      setResetMessage({ type: 'error', text: err.message || 'Failed to reset password.' });
    } finally {
      setIsResetting(false);
    }
  };

  const filteredProfiles = profiles.filter(p => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      p.full_name?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.role?.toLowerCase().includes(q) ||
      p.data_scope?.collegeName?.toLowerCase().includes(q);

    const matchesCollege =
      collegeFilter === 'ALL' ||
      p.data_scope?.collegeId === collegeFilter ||
      p.data_scope?.collegeName === collegeFilter;

    return matchesSearch && matchesCollege;
  });

  const columns = [
    {
      key: 'full_name',
      header: 'User & Email',
      render: (p: ProfileRecord) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs uppercase shrink-0">
            {p.full_name?.charAt(0) || p.email.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-slate-900">{p.full_name || 'Unnamed User'}</p>
            <p className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
              <Mail className="w-3 h-3 text-slate-400" /> {p.email}
            </p>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'role',
      header: 'Assigned Role',
      render: (p: ProfileRecord) => (
        <select
          value={p.role}
          onChange={e => handleRoleChange(p.id, e.target.value as Role)}
          className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 text-slate-800 outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
        >
          {ALL_ROLES.map(r => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      ),
      sortable: true,
    },
    {
      key: 'college',
      header: 'Assigned College / Scope',
      render: (p: ProfileRecord) => {
        if (p.data_scope?.collegeName) {
          return (
            <div className="flex items-center gap-1.5 text-xs text-slate-800 font-semibold">
              <Building className="w-3.5 h-3.5 text-brand-600 shrink-0" />
              <span className="truncate max-w-[200px]">{p.data_scope.collegeName}</span>
            </div>
          );
        }
        if (p.data_scope?.scopeType === 'ALL' || p.role === 'SUPER_ADMIN') {
          return <Badge variant="purple" size="sm">🌐 Platform Scope</Badge>;
        }
        return <Badge variant="outline" size="sm">👤 Self Scoped</Badge>;
      },
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      render: (p: ProfileRecord) => {
        const isActive = p.data_scope?.isActive !== false;
        return (
          <Badge variant={isActive ? 'success' : 'danger'} size="sm">
            {isActive ? 'ACTIVE' : 'DEACTIVATED'}
          </Badge>
        );
      },
      sortable: true,
    },
    {
      key: 'created_at',
      header: 'Joined Date',
      render: (p: ProfileRecord) => (
        <span className="font-mono text-xs text-slate-600">
          {p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Recent'}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'actions',
      header: 'Super Admin Actions',
      render: (p: ProfileRecord) => {
        const isActive = p.data_scope?.isActive !== false;
        return (
          <div className="flex items-center gap-1.5">
            {/* Reset Password Button */}
            <Button
              size="xs"
              variant="outline"
              title="Reset User Password"
              leftIcon={<KeyRound className="w-3 h-3 text-amber-600" />}
              onClick={() => {
                setUserToReset(p);
                setNewTempPassword('Santoge@2026');
                setResetMessage(null);
                setIsResetModalOpen(true);
              }}
            >
              Reset
            </Button>

            {/* Toggle Active / Deactivate */}
            <Button
              size="xs"
              variant={isActive ? 'outline' : 'success'}
              onClick={() => handleToggleActive(p.id, isActive)}
            >
              {isActive ? 'Deactivate' : 'Activate'}
            </Button>

            {/* Delete User Button */}
            <Button
              size="xs"
              variant="danger"
              title="Delete User Permanently"
              disabled={p.id === currentSuperAdmin?.id}
              leftIcon={<Trash2 className="w-3 h-3" />}
              onClick={() => {
                setUserToDelete(p);
                setDeleteError(null);
                setIsDeleteModalOpen(true);
              }}
            >
              Delete
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Platform Access Control
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Realtime Database Sync Active
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            User Management & Security Administration
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Provision, delete users, reset credentials, and govern multi-tenant institutional data scopes with live PostgreSQL synchronization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={loadData}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<UserPlus className="w-4 h-4" />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create New User
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-600 uppercase">Role:</span>
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
            >
              <option value="ALL">All Roles ({profiles.length})</option>
              {ALL_ROLES.map(r => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* College Filter */}
          {colleges.length > 0 && (
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-600 uppercase">College:</span>
              <select
                value={collegeFilter}
                onChange={e => setCollegeFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
              >
                <option value="ALL">All Colleges ({colleges.length})</option>
                {colleges.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Showing <span className="font-bold text-slate-900">{filteredProfiles.length}</span> user(s) in real time
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredProfiles}
        searchPlaceholder="Search users by name, email, role, or college..."
      />

      {/* 1. Create User Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Provision New User Account"
        description="Creates a new identity in Supabase Auth and binds their profile and institutional scope in PostgreSQL."
      >
        <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
          {/* Role Selection First */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Select User Role
            </label>
            <select
              value={newRole}
              onChange={e => {
                const r = e.target.value as Role;
                setNewRole(r);
                if (r === 'COLLEGE_SUPER_ADMIN' && selectedCollege) {
                  handleAutofillCollegeContact('admin');
                } else if (r === 'COLLEGE_PLACEMENT_OFFICER' && selectedCollege) {
                  handleAutofillCollegeContact('placement');
                }
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-brand-500 outline-none"
            >
              {ALL_ROLES.map(r => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* College Scope Selection & Details Box */}
          {isSelectedRoleCollegeScoped && (
            <div className="p-4 bg-brand-50/60 rounded-2xl border border-brand-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-brand-900 text-xs flex items-center gap-1.5 uppercase">
                  <Building className="w-4 h-4 text-brand-600" /> Assigned Institution / College
                </span>
                <Badge variant="primary" size="sm">Multi-Tenant Isolation</Badge>
              </div>

              {colleges.length > 0 ? (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Choose Target College:
                    </label>
                    <select
                      value={selectedCollegeId}
                      onChange={e => {
                        setSelectedCollegeId(e.target.value);
                        const c = colleges.find(item => item.id === e.target.value);
                        if (c) {
                          if (newRole === 'COLLEGE_SUPER_ADMIN') {
                            setNewName(c.admin_name || 'College Admin');
                            setNewEmail(c.admin_email || `admin@${c.code.toLowerCase()}.edu`);
                          } else if (newRole === 'COLLEGE_PLACEMENT_OFFICER') {
                            setNewName(c.placement_officer_name || 'Placement Officer');
                            setNewEmail(c.placement_officer_email || `placement@${c.code.toLowerCase()}.edu`);
                          }
                        }
                      }}
                      className="w-full bg-white border border-brand-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-brand-500 outline-none cursor-pointer"
                    >
                      {colleges.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.code}) — {c.city}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* College Identity & Email Preview Card */}
                  {selectedCollege && (
                    <div className="p-3 bg-white rounded-xl border border-brand-200 text-xs space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-extrabold text-slate-900 text-sm">{selectedCollege.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">Code: {selectedCollege.code} • City: {selectedCollege.city}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-[11px]">
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5">
                          <span className="font-bold text-slate-600 text-[10px] uppercase flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-purple-600" /> College Super Admin
                          </span>
                          <p className="font-bold text-slate-900">{selectedCollege.admin_name || 'Not Configured'}</p>
                          <p className="font-mono text-slate-500 text-[10px] truncate">{selectedCollege.admin_email || 'No email'}</p>
                          {newRole === 'COLLEGE_SUPER_ADMIN' && selectedCollege.admin_email && (
                            <button
                              type="button"
                              onClick={() => handleAutofillCollegeContact('admin')}
                              className="mt-1 text-[10px] font-bold text-brand-600 hover:text-brand-800 underline block"
                            >
                              ⚡ Use this Admin Name & Email
                            </button>
                          )}
                        </div>

                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5">
                          <span className="font-bold text-slate-600 text-[10px] uppercase flex items-center gap-1">
                            <Award className="w-3 h-3 text-emerald-600" /> Placement Officer (CPO)
                          </span>
                          <p className="font-bold text-slate-900">{selectedCollege.placement_officer_name || 'Not Configured'}</p>
                          <p className="font-mono text-slate-500 text-[10px] truncate">{selectedCollege.placement_officer_email || 'No email'}</p>
                          {newRole === 'COLLEGE_PLACEMENT_OFFICER' && selectedCollege.placement_officer_email && (
                            <button
                              type="button"
                              onClick={() => handleAutofillCollegeContact('placement')}
                              className="mt-1 text-[10px] font-bold text-brand-600 hover:text-brand-800 underline block"
                            >
                              ⚡ Use this Placement Officer Name & Email
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs">
                  <p className="font-bold">No Colleges Onboarded Yet</p>
                  <p className="text-[11px] mt-0.5">
                    Please onboard your institution under <strong>Colleges Management</strong> first, or the user will be provisioned with pending scope.
                  </p>
                </div>
              )}
            </div>
          )}

          <Input
            label="Full Name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Full Name"
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={newEmail}
            onChange={e => setNewEmail(e.target.value)}
            placeholder="Email Address"
            required
          />

          <Input
            label="Initial Password"
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder=""
            required
          />

          {formMessage && (
            <div
              className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${formMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
            >
              {formMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{formMessage.text}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              leftIcon={<UserPlus className="w-4 h-4" />}
            >
              Create User Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* 2. Delete User Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setUserToDelete(null);
        }}
        title="Permanently Delete User Account"
        description="This action cannot be undone. The user identity and all database associations will be removed."
      >
        <div className="space-y-4 text-xs">
          {userToDelete && (
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-rose-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-rose-800 text-sm">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                Are you sure you want to delete this user?
              </div>
              <div className="p-3 bg-white rounded-xl border border-rose-200 space-y-1 font-mono text-xs text-slate-800">
                <p><strong>Name:</strong> {userToDelete.full_name}</p>
                <p><strong>Email:</strong> {userToDelete.email}</p>
                <p><strong>Role:</strong> {userToDelete.role}</p>
                {userToDelete.data_scope?.collegeName && (
                  <p><strong>College:</strong> {userToDelete.data_scope.collegeName}</p>
                )}
              </div>
              <p className="text-[11px] text-rose-700 leading-relaxed">
                Deleting this user will immediately revoke all portal access and remove their credentials from PostgreSQL.
              </p>
            </div>
          )}

          {deleteError && (
            <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 font-semibold text-xs flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{deleteError}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setUserToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              isLoading={isDeleting}
              leftIcon={<Trash2 className="w-4 h-4" />}
              onClick={handleDeleteUserConfirm}
            >
              Permanently Delete User
            </Button>
          </div>
        </div>
      </Modal>

      {/* 3. Reset User Password Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => {
          setIsResetModalOpen(false);
          setUserToReset(null);
        }}
        title="Reset User Password & Access"
        description="Issue a new temporary password and dispatch a Supabase Auth reset confirmation."
      >
        <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-xs">
          {userToReset && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-500">Target User Account</span>
              <p className="font-bold text-slate-900 text-sm">{userToReset.full_name}</p>
              <p className="text-slate-500 font-mono text-[11px]">{userToReset.email} ({userToReset.role})</p>
            </div>
          )}

          <Input
            label="New Temporary Password"
            type="text"
            value={newTempPassword}
            onChange={e => setNewTempPassword(e.target.value)}
            placeholder="e.g. Santoge@2026 or SecretPass#123"
            required
          />

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="xs"
              leftIcon={<Sparkles className="w-3 h-3 text-brand-600" />}
              onClick={() => {
                const randomPass = 'SantoGe@' + Math.floor(1000 + Math.random() * 9000);
                setNewTempPassword(randomPass);
              }}
            >
              Generate Strong Password
            </Button>
          </div>

          {resetMessage && (
            <div
              className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${resetMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
            >
              {resetMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{resetMessage.text}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsResetModalOpen(false);
                setUserToReset(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isResetting}
              leftIcon={<KeyRound className="w-4 h-4" />}
            >
              Confirm Password Reset
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
