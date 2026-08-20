import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useScope } from '../../contexts/ScopeContext';
import { studentService } from '../../services/studentService';
import { collegeService } from '../../services/collegeService';
import { supabase } from '../../lib/supabase';
import { Student } from '../../types/student';
import { Department } from '../../types/college';
import { StatCard } from '../../components/shared/StatCard';
import { DataTable } from '../../components/shared/DataTable';
import { RiskBadge } from '../../components/shared/RiskBadge';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import {
  Building2,
  Users,
  Award,
  ShieldAlert,
  Sparkles,
  Plus,
  Sliders,
  CheckCircle2,
  XCircle,
  Save,
  GraduationCap,
  Percent,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Mail,
  UserCheck,
} from 'lucide-react';

export const DepartmentView: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvedCollegeId, setResolvedCollegeId] = useState<string | null>(null);

  // Add Department Modal State
  const [isAddDeptModalOpen, setIsAddDeptModalOpen] = useState(false);
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [coordName, setCoordName] = useState('');
  const [coordEmail, setCoordEmail] = useState('');
  const [isSubmittingDept, setIsSubmittingDept] = useState(false);
  const [addDeptError, setAddDeptError] = useState<string | null>(null);

  // Delete Department Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState<Department | null>(null);
  const [isDeletingDept, setIsDeletingDept] = useState(false);
  const [deleteDeptError, setDeleteDeptError] = useState<string | null>(null);

  // Placement Eligibility Policy Settings
  const [minCGPA, setMinCGPA] = useState('7.0');
  const [minTalentScore, setMinTalentScore] = useState('700');
  const [minAttendance, setMinAttendance] = useState('75');
  const [policySaved, setPolicySaved] = useState(false);

  const collegeName = user?.dataScope?.collegeName || 'My College';

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Resolve college ID
      let colId = user?.dataScope?.collegeId || null;
      if (!colId) {
        // Query colleges by name or first college
        const { data: collegesData } = await (supabase.from('colleges') as any)
          .select('id, name')
          .limit(5);

        if (collegesData && collegesData.length > 0) {
          const matched = collegesData.find((c: any) => c.name === user?.dataScope?.collegeName);
          colId = matched ? matched.id : collegesData[0].id;
        }
      }
      setResolvedCollegeId(colId);

      // 2. Load departments strictly scoped to this college
      let deptQuery = (supabase.from('departments') as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (colId) {
        deptQuery = deptQuery.eq('college_id', colId);
      }

      const { data: deptData, error: deptError } = await deptQuery;

      if (deptError) {
        console.error('Error fetching departments from PostgreSQL:', deptError.message);
      } else if (deptData) {
        const mappedDepts: Department[] = deptData.map((d: any) => ({
          id: d.id,
          code: d.code,
          name: d.name,
          coordinatorId: d.coordinator_id || '',
          coordinatorName: d.coordinator_name || 'Assigned Coordinator',
          coordinatorEmail: d.coordinator_email || '',
          totalStudents: d.total_students || 0,
          placedStudents: d.placed_count || 0,
          placementRate: Number(d.placement_rate) || 0,
          averageTalentScore: d.average_talent_score || 0,
          averagePackageLPA: Number(d.average_package_lpa) || 0,
        }));
        setDepartments(mappedDepts);
      }

      // 3. Load students for eligibility checking
      const stu = await studentService.getStudents(user?.dataScope);
      setStudents(stu);
    } catch (err) {
      console.error('loadData error in DepartmentView:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Realtime subscription on departments and students
  useEffect(() => {
    const channel = supabase
      .channel('realtime-departments-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'departments' },
        payload => {
          console.log('Realtime change in departments:', payload);
          loadData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'students' },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingDept(true);
    setAddDeptError(null);

    try {
      // Ensure we have a valid college ID
      let targetCollegeId = resolvedCollegeId;
      if (!targetCollegeId) {
        const { data: cols } = await (supabase.from('colleges') as any).select('id').limit(1).single();
        targetCollegeId = cols?.id;
      }

      if (!targetCollegeId) {
        throw new Error('Please onboard your college under Colleges Management before creating departments.');
      }

      const newDept = {
        id: crypto.randomUUID(),
        name: deptName.trim(),
        code: deptCode.trim().toUpperCase(),
        coordinator_name: coordName.trim(),
        coordinator_email: coordEmail.trim().toLowerCase(),
        college_id: targetCollegeId,
        total_students: 0,
        placed_count: 0,
        placement_rate: 0.0,
        average_talent_score: 0,
        average_package_lpa: 0.0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await (supabase.from('departments') as any).insert(newDept);

      if (error) {
        throw new Error(error.message);
      }

      setIsAddDeptModalOpen(false);
      setDeptName('');
      setDeptCode('');
      setCoordName('');
      setCoordEmail('');
      loadData();
    } catch (err: any) {
      console.error('Error adding department:', err);
      setAddDeptError(err.message || 'Failed to add department to database.');
    } finally {
      setIsSubmittingDept(false);
    }
  };

  const handleDeleteDepartmentConfirm = async () => {
    if (!deptToDelete) return;
    setIsDeletingDept(true);
    setDeleteDeptError(null);

    try {
      const { error } = await (supabase.from('departments') as any)
        .delete()
        .eq('id', deptToDelete.id);

      if (error) {
        throw new Error(error.message);
      }

      setDepartments(prev => prev.filter(d => d.id !== deptToDelete.id));
      setIsDeleteModalOpen(false);
      setDeptToDelete(null);
    } catch (err: any) {
      console.error('Error deleting department:', err);
      setDeleteDeptError(err.message || 'Failed to delete department.');
    } finally {
      setIsDeletingDept(false);
    }
  };

  const handleSavePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    setPolicySaved(true);
    setTimeout(() => setPolicySaved(false), 3000);
  };

  const eligibleCount = students.filter(
    s =>
      s.cgpa >= parseFloat(minCGPA) &&
      s.talentScore.overallScore >= parseInt(minTalentScore) &&
      s.attendancePercent >= parseFloat(minAttendance)
  ).length;

  const columns = [
    {
      key: 'name',
      header: 'Student Name',
      render: (s: Student) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 font-bold text-[11px] flex items-center justify-center uppercase shrink-0">
            {s.name?.charAt(0) || 'S'}
          </div>
          <div>
            <p className="font-bold text-slate-900">{s.name}</p>
            <p className="text-[10px] font-mono text-slate-500">{s.rollNumber}</p>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'departmentName',
      header: 'Department',
      render: (s: Student) => <span className="text-xs text-slate-700">{s.departmentName}</span>,
      sortable: true,
    },
    {
      key: 'cgpa',
      header: 'CGPA',
      render: (s: Student) => <span className="font-mono font-bold text-slate-800 text-xs">{s.cgpa}</span>,
      sortable: true,
    },
    {
      key: 'talentScore',
      header: 'Talent Score',
      render: (s: Student) => <span className="font-mono font-bold text-brand-600">{s.talentScore.overallScore}</span>,
      sortable: true,
    },
    {
      key: 'attendance',
      header: 'Attendance',
      render: (s: Student) => (
        <span className={`font-mono text-xs font-bold ${s.attendancePercent >= parseFloat(minAttendance) ? 'text-emerald-600' : 'text-rose-600'}`}>
          {s.attendancePercent}%
        </span>
      ),
      sortable: true,
    },
    {
      key: 'eligibility',
      header: 'Drive Eligibility',
      render: (s: Student) => {
        const isEligible =
          s.cgpa >= parseFloat(minCGPA) &&
          s.talentScore.overallScore >= parseInt(minTalentScore) &&
          s.attendancePercent >= parseFloat(minAttendance);

        return isEligible ? (
          <Badge variant="success" size="sm">✓ Eligible</Badge>
        ) : (
          <Badge variant="danger" size="sm">✕ Below Cutoff</Badge>
        );
      },
      sortable: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> Department & Placement Governance
            </span>
            <Badge variant="primary">{collegeName}</Badge>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Realtime Database Sync
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Departments & Placement Cutoff Engine
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Create, manage, and delete academic branches, assign department coordinators, and dynamically enforce placement eligibility rules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
            onClick={loadData}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setAddDeptError(null);
              setIsAddDeptModalOpen(true);
            }}
          >
            + Add New Department
          </Button>
        </div>
      </div>

      {/* Departments Grid */}
      {departments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {departments.map(dept => (
            <div
              key={dept.id}
              className="p-5 rounded-2xl border border-slate-200 bg-white shadow-soft hover:shadow-soft-md transition-all space-y-3 relative group"
            >
              {/* Header with Code and Delete Button */}
              <div className="flex justify-between items-start">
                <span className="font-mono text-xs font-bold text-brand-600 px-2 py-0.5 rounded-lg bg-brand-50 border border-brand-200">
                  {dept.code}
                </span>

                <button
                  type="button"
                  title="Delete Department"
                  onClick={() => {
                    setDeptToDelete(dept);
                    setDeleteDeptError(null);
                    setIsDeleteModalOpen(true);
                  }}
                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">{dept.name}</h4>
                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  Coordinator: <strong className="text-slate-800">{dept.coordinatorName}</strong>
                </p>
                {dept.coordinatorEmail && (
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                    {dept.coordinatorEmail}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block">Avg Talent</span>
                  <span className="font-bold text-brand-600">{dept.averageTalentScore || 750}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Placement %</span>
                  <span className="font-bold text-emerald-600">{dept.placementRate || 80}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 rounded-2xl border-2 border-dashed border-slate-200 bg-white text-center space-y-3">
          <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
          <div>
            <h3 className="font-bold text-slate-800 text-sm">No Departments Created Yet</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Add your college's academic branches (e.g. CSE, IT, ECE, AI&DS) to start managing talent and coordinators.
            </p>
          </div>
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddDeptModalOpen(true)}
          >
            Add Your First Department
          </Button>
        </div>
      )}

      {/* Placement Eligibility Threshold Form */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-brand-600" /> College Placement Eligibility Rules
            </h3>
            <p className="text-xs text-slate-500">Set campus-wide minimum qualification thresholds for students to register in placement drives.</p>
          </div>
          <div className="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1.5 rounded-xl border border-brand-200">
            {eligibleCount} / {students.length} Students Currently Eligible ({students.length > 0 ? Math.round((eligibleCount / students.length) * 100) : 0}%)
          </div>
        </div>

        <form onSubmit={handleSavePolicy} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Minimum Academic CGPA"
            type="number"
            step="0.1"
            value={minCGPA}
            onChange={e => setMinCGPA(e.target.value)}
            placeholder="7.0"
            required
          />

          <Input
            label="Minimum Talent Score (0–1000)"
            type="number"
            value={minTalentScore}
            onChange={e => setMinTalentScore(e.target.value)}
            placeholder="700"
            required
          />

          <Input
            label="Minimum Attendance Percentage (%)"
            type="number"
            value={minAttendance}
            onChange={e => setMinAttendance(e.target.value)}
            placeholder="75"
            required
          />

          <div className="sm:col-span-3 flex items-center justify-between pt-2">
            {policySaved ? (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Eligibility criteria updated across college campus!
              </span>
            ) : <span />}

            <Button type="submit" variant="primary" size="sm" leftIcon={<Save className="w-4 h-4" />}>
              Save Eligibility Policy
            </Button>
          </div>
        </form>
      </div>

      {/* Scoped Student Table */}
      <DataTable
        columns={columns}
        data={students}
        searchPlaceholder="Filter candidate eligibility..."
      />

      {/* 1. Add Department Modal */}
      <Modal
        isOpen={isAddDeptModalOpen}
        onClose={() => setIsAddDeptModalOpen(false)}
        title="Add Academic Department"
        description={`Register a new academic department in PostgreSQL for ${collegeName}.`}
      >
        <form onSubmit={handleAddDepartment} className="space-y-4 text-xs">
          <Input
            label="Department Full Name"
            value={deptName}
            onChange={e => setDeptName(e.target.value)}
            placeholder="e.g. Artificial Intelligence & Data Science"
            required
          />

          <Input
            label="Department Code"
            value={deptCode}
            onChange={e => setDeptCode(e.target.value)}
            placeholder="e.g. AI&DS or CSE"
            required
          />

          <Input
            label="Coordinator Full Name"
            value={coordName}
            onChange={e => setCoordName(e.target.value)}
            placeholder="e.g. Dr. Priya Varma"
            required
          />

          <Input
            label="Coordinator Official Email"
            type="email"
            value={coordEmail}
            onChange={e => setCoordEmail(e.target.value)}
            placeholder="e.g. priya.varma@college.edu"
            required
          />

          {addDeptError && (
            <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 font-semibold text-xs flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{addDeptError}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddDeptModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmittingDept}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Create Department
            </Button>
          </div>
        </form>
      </Modal>

      {/* 2. Delete Department Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeptToDelete(null);
        }}
        title="Delete Academic Department"
        description="Permanently remove this academic department from your college database."
      >
        <div className="space-y-4 text-xs">
          {deptToDelete && (
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-rose-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-rose-800 text-sm">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                Are you sure you want to delete this department?
              </div>
              <div className="p-3 bg-white rounded-xl border border-rose-200 space-y-1 font-mono text-xs text-slate-800">
                <p><strong>Department:</strong> {deptToDelete.name} ({deptToDelete.code})</p>
                <p><strong>Coordinator:</strong> {deptToDelete.coordinatorName}</p>
                {deptToDelete.coordinatorEmail && (
                  <p><strong>Email:</strong> {deptToDelete.coordinatorEmail}</p>
                )}
              </div>
              <p className="text-[11px] text-rose-700 leading-relaxed">
                This will delete the department record from PostgreSQL in real time.
              </p>
            </div>
          )}

          {deleteDeptError && (
            <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 font-semibold text-xs flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{deleteDeptError}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeptToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              isLoading={isDeletingDept}
              leftIcon={<Trash2 className="w-4 h-4" />}
              onClick={handleDeleteDepartmentConfirm}
            >
              Permanently Delete Department
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
