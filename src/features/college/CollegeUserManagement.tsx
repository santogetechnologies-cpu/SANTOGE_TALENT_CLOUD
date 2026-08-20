import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  AlertTriangle,
  Award,
  Sparkles,
  Briefcase,
  GraduationCap,
  Layers,
  UserCheck,
  ExternalLink,
} from 'lucide-react';

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

interface DepartmentOption {
  id: string;
  name: string;
  code: string;
  coordinator_name: string;
  coordinator_email: string;
}

const COLLEGE_ROLES: { value: Role; label: string; description: string }[] = [
  { value: 'DEPARTMENT_COORDINATOR', label: '🔬 Department Coordinator', description: 'Oversees department talent, academic readiness, and drive eligibility.' },
  { value: 'COLLEGE_PLACEMENT_OFFICER', label: '💼 Placement Officer (CPO)', description: 'Manages campus recruitment drives, company relationships, and offer letters.' },
  { value: 'MENTOR', label: '🧑‍🏫 Faculty Mentor', description: 'Guides students through learning tracks, simulators, and technical evaluations.' },
  { value: 'BATCH_COORDINATOR', label: '📢 Batch Coordinator', description: 'Monitors daily student completion, streak sync, and batch announcements.' },
  { value: 'STUDENT', label: '🎓 Student Learner', description: 'Student enrolled in career tracks, labs, and placement accelerators.' },
];

export const CollegeUserManagement: React.FC = () => {
  const { user: currentCollegeAdmin } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<ProfileRecord[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [roleFilter, setRoleFilter] = useState<Role | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Create User Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('Santoge@2026');
  const [newRole, setNewRole] = useState<Role>('DEPARTMENT_COORDINATOR');
  const [newDeptName, setNewDeptName] = useState('');
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

  const collegeId = currentCollegeAdmin?.dataScope?.collegeId;
  const collegeName = currentCollegeAdmin?.dataScope?.collegeName || 'ABC Engineering College';

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. Resolve college ID
      let colId = collegeId;
      if (!colId) {
        const { data: cols } = await (supabase.from('colleges') as any)
          .select('id, name')
          .limit(5);

        if (cols && cols.length > 0) {
          const matched = cols.find((c: any) => c.name === collegeName);
          colId = matched ? matched.id : cols[0].id;
        }
      }

      // 2. Fetch scoped profiles
      let profileQuery = (supabase.from('profiles') as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (colId) {
        profileQuery = profileQuery.eq('college_id', colId);
      }

      if (roleFilter !== 'ALL') {
        profileQuery = profileQuery.eq('role', roleFilter);
      }

      const { data: profileData, error: profileError } = await profileQuery;
      if (profileError) {
        console.error('Error fetching college profiles:', profileError);
        setProfiles([]);
      } else {
        setProfiles(profileData || []);
      }

      // 3. Fetch real added departments for this college
      let deptQuery = (supabase.from('departments') as any)
        .select('id, name, code, coordinator_name, coordinator_email')
        .order('name', { ascending: true });

      if (colId) {
        deptQuery = deptQuery.eq('college_id', colId);
      }

      const { data: deptData, error: deptError } = await deptQuery;
      if (!deptError && deptData) {
        setDepartments(deptData);
      }
    } catch (err) {
      console.error('loadData exception in CollegeUserManagement:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [roleFilter, currentCollegeAdmin]);

  // Realtime Subscriptions on both profiles and departments
  useEffect(() => {
    const channel = supabase
      .channel('college-users-and-depts-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => loadData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'departments' },
        () => loadData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roleFilter, currentCollegeAdmin]);

  // When opening Create Modal or switching to DEPARTMENT_COORDINATOR, pre-select first department
  const handleOpenCreateModal = () => {
    setFormMessage(null);
    if (departments.length > 0) {
      const first = departments[0];
      setNewDeptName(first.name);
      setNewName(first.coordinator_name || '');
      setNewEmail(first.coordinator_email || '');
    } else {
      setNewDeptName('');
      setNewName('');
      setNewEmail('');
    }
    setNewRole('DEPARTMENT_COORDINATOR');
    setNewPassword('Santoge@2026');
    setIsCreateModalOpen(true);
  };

  const handleDepartmentChange = (selectedName: string) => {
    setNewDeptName(selectedName);
    const matched = departments.find(d => d.name === selectedName);
    if (matched) {
      if (matched.coordinator_name) setNewName(matched.coordinator_name);
      if (matched.coordinator_email) setNewEmail(matched.coordinator_email);
    }
  };

  const handleRoleChangeSelect = (selectedRole: Role) => {
    setNewRole(selectedRole);
    if (selectedRole === 'DEPARTMENT_COORDINATOR') {
      if (departments.length > 0) {
        const currentSelected = departments.find(d => d.name === newDeptName) || departments[0];
        setNewDeptName(currentSelected.name);
        if (currentSelected.coordinator_name) setNewName(currentSelected.coordinator_name);
        if (currentSelected.coordinator_email) setNewEmail(currentSelected.coordinator_email);
      }
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormMessage(null);

    const dataScope: DataScope = {
      scopeType: 'COLLEGE',
      collegeId: collegeId || undefined,
      collegeName: collegeName,
      departmentNames: newRole === 'DEPARTMENT_COORDINATOR' && newDeptName ? [newDeptName] : undefined,
    };

    try {
      await authService.signUp(newEmail, newPassword, newName, newRole, dataScope);
      setFormMessage({
        type: 'success',
        text: `User ${newName} provisioned for ${collegeName} in real time!`,
      });

      setTimeout(() => {
        setIsCreateModalOpen(false);
        setNewName('');
        setNewEmail('');
        setNewPassword('Santoge@2026');
        setFormMessage(null);
        loadData();
      }, 1200);
    } catch (err: any) {
      console.error('Error creating college user:', err);
      setFormMessage({ type: 'error', text: err.message || 'Failed to create user.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = async (userId: string, targetRole: Role) => {
    try {
      const targetScope: DataScope = {
        scopeType: 'COLLEGE',
        collegeId: collegeId || undefined,
        collegeName: collegeName,
      };

      const { error } = await (supabase.from('profiles') as any)
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
        ...(targetUser?.data_scope || { scopeType: 'COLLEGE' as const, collegeId, collegeName }),
        isActive: !currentActive,
      };

      const { error } = await (supabase.from('profiles') as any)
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
    if (userToDelete.id === currentCollegeAdmin?.id) {
      setDeleteError('You cannot delete your own active administrator account.');
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
      setDeleteError(err.message || 'Failed to delete user.');
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
    return (
      p.full_name?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.role?.toLowerCase().includes(q)
    );
  });

  // Calculate staff metrics
  const cpoCount = profiles.filter(p => p.role === 'COLLEGE_PLACEMENT_OFFICER').length;
  const coordinatorCount = profiles.filter(p => p.role === 'DEPARTMENT_COORDINATOR').length;
  const mentorCount = profiles.filter(p => p.role === 'MENTOR').length;

  const selectedDepartmentObj = departments.find(d => d.name === newDeptName);

  const columns = [
    {
      key: 'full_name',
      header: 'Staff Member & Email',
      render: (p: ProfileRecord) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs uppercase shrink-0">
            {p.full_name?.charAt(0) || p.email.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-slate-900">{p.full_name || 'Unnamed Staff'}</p>
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
      header: 'College Role',
      render: (p: ProfileRecord) => (
        <select
          value={p.role}
          onChange={e => handleRoleChange(p.id, e.target.value as Role)}
          className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 text-slate-800 outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
        >
          {COLLEGE_ROLES.map(r => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      ),
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
      header: 'Provisioned Date',
      render: (p: ProfileRecord) => (
        <span className="font-mono text-xs text-slate-600">
          {p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Recent'}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'actions',
      header: 'Administrative Actions',
      render: (p: ProfileRecord) => {
        const isActive = p.data_scope?.isActive !== false;
        return (
          <div className="flex items-center gap-1.5">
            {/* Reset Password */}
            <Button
              size="xs"
              variant="outline"
              title="Reset Password"
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

            {/* Toggle Active */}
            <Button
              size="xs"
              variant={isActive ? 'outline' : 'success'}
              onClick={() => handleToggleActive(p.id, isActive)}
            >
              {isActive ? 'Deactivate' : 'Activate'}
            </Button>

            {/* Delete User */}
            <Button
              size="xs"
              variant="danger"
              title="Revoke User Access"
              disabled={p.id === currentCollegeAdmin?.id}
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
              <ShieldCheck className="w-3.5 h-3.5" /> Institutional Access Control
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {collegeName}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            College Staff & User Management Dashboard
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Provision, manage roles, reset credentials, and govern access for Placement Officers, Department Coordinators, Mentors, and Staff in your college.
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
            onClick={handleOpenCreateModal}
          >
            Provision College Staff
          </Button>
        </div>
      </div>

      {/* Staff Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft">
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Total College Users</span>
          <span className="text-2xl font-black text-slate-900 font-mono">{profiles.length}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft">
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Placement Officers (CPO)</span>
          <span className="text-2xl font-black text-brand-600 font-mono">{cpoCount}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft">
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Department Coordinators</span>
          <span className="text-2xl font-black text-purple-600 font-mono">{coordinatorCount}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft">
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Faculty Mentors</span>
          <span className="text-2xl font-black text-emerald-600 font-mono">{mentorCount}</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-600 uppercase">Filter Role:</span>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
          >
            <option value="ALL">All Roles ({profiles.length})</option>
            {COLLEGE_ROLES.map(r => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Showing <span className="font-bold text-slate-900">{filteredProfiles.length}</span> staff member(s) in real time
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredProfiles}
        searchPlaceholder="Search staff by name, email, or role..."
      />

      {/* 1. Provision College User Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Provision College Staff or Coordinator"
        description={`Creates an authenticated identity isolated to ${collegeName}.`}
      >
        <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Select Institutional Role
            </label>
            <select
              value={newRole}
              onChange={e => handleRoleChangeSelect(e.target.value as Role)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-brand-500 outline-none cursor-pointer"
            >
              {COLLEGE_ROLES.map(r => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* If DEPARTMENT_COORDINATOR, show only added departments */}
          {newRole === 'DEPARTMENT_COORDINATOR' && (
            <div className="space-y-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              {departments.length > 0 ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Assigned Department (Added in College)
                  </label>
                  <select
                    value={newDeptName}
                    onChange={e => handleDepartmentChange(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-brand-500 outline-none cursor-pointer"
                    required
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.name}>
                        {d.name} ({d.code}) {d.coordinator_name ? `• ${d.coordinator_name}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    No Departments Added Yet
                  </div>
                  <p className="text-[11px] text-amber-700">
                    You have not added any academic departments in the <strong>Departments & Cutoffs</strong> engine yet.
                  </p>
                  <Button
                    type="button"
                    size="xs"
                    variant="outline"
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      navigate('/college/departments');
                    }}
                  >
                    Go to Departments Engine →
                  </Button>
                </div>
              )}

              {/* Coordinator on record banner */}
              {selectedDepartmentObj && (
                <div className="p-3 bg-blue-50/90 rounded-xl border border-blue-200 text-xs text-blue-900 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5 text-blue-800 text-[11px]">
                      <UserCheck className="w-3.5 h-3.5 text-blue-600" /> Department Coordinator on Record:
                    </span>
                    <Badge variant="primary" size="sm">{selectedDepartmentObj.code}</Badge>
                  </div>
                  <p className="font-bold text-slate-900">{selectedDepartmentObj.coordinator_name || 'No coordinator name assigned'}</p>
                  <p className="font-mono text-[11px] text-blue-700 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-blue-500" /> {selectedDepartmentObj.coordinator_email || 'No email assigned'}
                  </p>
                  <p className="text-[10px] text-blue-600 font-medium pt-0.5">
                    ✓ Official Institutional Email & Full Name auto-synced from department records.
                  </p>
                </div>
              )}
            </div>
          )}

          <Input
            label="Full Name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="e.g. Prof. Ananya Sen"
            required
          />

          <Input
            label="Official Institutional Email"
            type="email"
            value={newEmail}
            onChange={e => setNewEmail(e.target.value)}
            placeholder="e.g. ananya.sen@college.edu"
            required
          />

          <Input
            label="Initial Temporary Password"
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          {formMessage && (
            <div
              className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                formMessage.type === 'success'
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
              Provision Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* 2. Delete User Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setUserToDelete(null);
        }}
        title="Revoke Staff User Access"
        description="Permanently removes this staff account and revokes access to the college portal."
      >
        <div className="space-y-4 text-xs">
          {userToDelete && (
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-rose-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-rose-800 text-sm">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                Are you sure you want to revoke access for this user?
              </div>
              <div className="p-3 bg-white rounded-xl border border-rose-200 space-y-1 font-mono text-xs text-slate-800">
                <p><strong>Name:</strong> {userToDelete.full_name}</p>
                <p><strong>Email:</strong> {userToDelete.email}</p>
                <p><strong>Role:</strong> {userToDelete.role}</p>
              </div>
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
              Permanently Revoke Access
            </Button>
          </div>
        </div>
      </Modal>

      {/* 3. Reset Password Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => {
          setIsResetModalOpen(false);
          setUserToReset(null);
        }}
        title="Reset Staff Password"
        description="Issue a new temporary password for this college staff member."
      >
        <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-xs">
          {userToReset && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-500">Target Staff Member</span>
              <p className="font-bold text-slate-900 text-sm">{userToReset.full_name}</p>
              <p className="text-slate-500 font-mono text-[11px]">{userToReset.email} ({userToReset.role})</p>
            </div>
          )}

          <Input
            label="New Temporary Password"
            type="text"
            value={newTempPassword}
            onChange={e => setNewTempPassword(e.target.value)}
            placeholder="e.g. Santoge@2026"
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
              className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                resetMessage.type === 'success'
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
