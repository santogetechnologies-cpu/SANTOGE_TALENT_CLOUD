import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { studentService } from '../../services/studentService';
import { collegeService } from '../../services/collegeService';
import { supabase } from '../../lib/supabase';
import { Student } from '../../types/student';
import { Department } from '../../types/college';
import { DataTable } from '../../components/shared/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Card } from '../../components/ui/Card';
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
  Edit2,
  AlertTriangle,
  RefreshCw,
  Mail,
  UserCheck,
  FileCheck2,
  UserPlus,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DepartmentView: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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

  // Edit Department Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deptToEdit, setDeptToEdit] = useState<Department | null>(null);
  const [editDeptName, setEditDeptName] = useState('');
  const [editDeptCode, setEditDeptCode] = useState('');
  const [editCoordName, setEditCoordName] = useState('');
  const [editCoordEmail, setEditCoordEmail] = useState('');
  const [isSubmittingEditDept, setIsSubmittingEditDept] = useState(false);
  const [editDeptError, setEditDeptError] = useState<string | null>(null);

  // Delete Department Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState<Department | null>(null);
  const [isDeletingDept, setIsDeletingDept] = useState(false);
  const [deleteDeptError, setDeleteDeptError] = useState<string | null>(null);

  // Helper to read cached policy immediately on load
  const getInitialPolicy = () => {
    try {
      const saved = localStorage.getItem('college_placement_eligibility_last');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { minCGPA: '7.0', minTalentScore: '700', minAttendance: '75' };
  };

  const initialPolicy = getInitialPolicy();
  // Real-time Placement Eligibility Policy Settings
  const [minCGPA, setMinCGPA] = useState(String(initialPolicy.minCGPA ?? '7.0'));
  const [minTalentScore, setMinTalentScore] = useState(String(initialPolicy.minTalentScore ?? '700'));
  const [minAttendance, setMinAttendance] = useState(String(initialPolicy.minAttendance ?? '75'));
  const [isSavingPolicy, setIsSavingPolicy] = useState(false);
  const [policySaved, setPolicySaved] = useState(false);
  const [policySaveError, setPolicySaveError] = useState<string | null>(null);

  const collegeName = user?.dataScope?.collegeName || 'My College';

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Resolve college ID
      let colId = user?.dataScope?.collegeId || null;
      if (!colId) {
        const { data: collegesData } = await (supabase.from('colleges') as any)
          .select('id, name')
          .limit(5);

        if (collegesData && collegesData.length > 0) {
          const matched = collegesData.find((c: any) => c.name === user?.dataScope?.collegeName);
          colId = matched ? matched.id : collegesData[0].id;
        }
      }
      setResolvedCollegeId(colId);

      // Instant Cache check for resolved college
      const policyKey = colId ? `college_placement_eligibility_${colId}` : 'college_placement_eligibility_global';
      try {
        const localCached = localStorage.getItem(policyKey) || localStorage.getItem('college_placement_eligibility_last');
        if (localCached) {
          const parsed = JSON.parse(localCached);
          if (parsed.minCGPA !== undefined) setMinCGPA(String(parsed.minCGPA));
          if (parsed.minTalentScore !== undefined) setMinTalentScore(String(parsed.minTalentScore));
          if (parsed.minAttendance !== undefined) setMinAttendance(String(parsed.minAttendance));
        }
      } catch (e) {}

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

      // 3. Load Real-time Placement Eligibility Policy from PostgreSQL system_settings
      const { data: policyData } = await (supabase.from('system_settings') as any)
        .select('*')
        .eq('key', policyKey)
        .maybeSingle();

      if (policyData?.value) {
        if (policyData.value.minCGPA !== undefined) setMinCGPA(String(policyData.value.minCGPA));
        if (policyData.value.minTalentScore !== undefined) setMinTalentScore(String(policyData.value.minTalentScore));
        if (policyData.value.minAttendance !== undefined) setMinAttendance(String(policyData.value.minAttendance));
        try {
          localStorage.setItem(policyKey, JSON.stringify(policyData.value));
          localStorage.setItem('college_placement_eligibility_last', JSON.stringify(policyData.value));
        } catch (e) {}
      }

      // 4. Load students for eligibility checking in real time
      let stuData: Student[] = [];
      if (colId) {
        const { data: rawStudents } = await (supabase.from('students') as any)
          .select('*')
          .eq('college_id', colId)
          .order('talent_score', { ascending: false });

        if (rawStudents && rawStudents.length > 0) {
          stuData = rawStudents.map((r: any) => studentService.mapDbStudentToDomain(r));
        } else {
          // If no student assigned to this specific college yet, check by name
          const { data: nameMatchStudents } = await (supabase.from('students') as any)
            .select('*')
            .ilike('college_name', `%${collegeName}%`)
            .order('talent_score', { ascending: false });

          if (nameMatchStudents && nameMatchStudents.length > 0) {
            stuData = nameMatchStudents.map((r: any) => studentService.mapDbStudentToDomain(r));
          } else {
            // General query fallback
            stuData = await studentService.getStudents(user?.dataScope);
          }
        }
      } else {
        stuData = await studentService.getStudents(user?.dataScope);
      }

      setStudents(stuData);
    } catch (err) {
      console.error('loadData error in DepartmentView:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Realtime subscription on departments, students, and system_settings
  useEffect(() => {
    const channel = supabase
      .channel('realtime-departments-eligibility')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'departments' },
        () => loadData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'students' },
        () => loadData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'system_settings' },
        () => loadData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, resolvedCollegeId]);

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingDept(true);
    setAddDeptError(null);

    try {
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

      if (error) throw new Error(error.message);

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

  const handleEditDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptToEdit) return;
    setIsSubmittingEditDept(true);
    setEditDeptError(null);

    try {
      const updated = await collegeService.updateDepartment(deptToEdit.id, {
        name: editDeptName.trim(),
        code: editDeptCode.trim().toUpperCase(),
        coordinatorName: editCoordName.trim(),
        coordinatorEmail: editCoordEmail.trim().toLowerCase(),
      });

      if (!updated) {
        const { error } = await (supabase.from('departments') as any)
          .update({
            name: editDeptName.trim(),
            code: editDeptCode.trim().toUpperCase(),
            coordinator_name: editCoordName.trim(),
            coordinator_email: editCoordEmail.trim().toLowerCase(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', deptToEdit.id);

        if (error) throw new Error(error.message);
      }

      setDepartments(prev =>
        prev.map(d =>
          d.id === deptToEdit.id
            ? {
                ...d,
                name: editDeptName.trim(),
                code: editDeptCode.trim().toUpperCase(),
                coordinatorName: editCoordName.trim(),
                coordinatorEmail: editCoordEmail.trim().toLowerCase(),
              }
            : d
        )
      );

      setIsEditModalOpen(false);
      setDeptToEdit(null);
      loadData();
    } catch (err: any) {
      console.error('Error updating department:', err);
      setEditDeptError(err.message || 'Failed to update department in database.');
    } finally {
      setIsSubmittingEditDept(false);
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

      if (error) throw new Error(error.message);

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

  // Real-time Save Eligibility Policy to PostgreSQL system_settings
  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPolicy(true);
    setPolicySaveError(null);

    try {
      let targetColId = resolvedCollegeId || user?.dataScope?.collegeId;
      if (!targetColId) {
        const { data: cols } = await (supabase.from('colleges') as any).select('id').limit(1).single();
        targetColId = cols?.id || 'default';
      }

      const policyValue = {
        minCGPA: parseFloat(minCGPA) || 7.0,
        minTalentScore: parseInt(minTalentScore, 10) || 700,
        minAttendance: parseFloat(minAttendance) || 75,
        collegeId: targetColId,
        collegeName,
        updatedAt: new Date().toISOString(),
      };

      const policyKey = targetColId ? `college_placement_eligibility_${targetColId}` : 'college_placement_eligibility_global';

      // 1. Immediately persist locally
      try {
        localStorage.setItem(policyKey, JSON.stringify(policyValue));
        localStorage.setItem('college_placement_eligibility_last', JSON.stringify(policyValue));
      } catch (e) {}

      // 2. Persist to PostgreSQL system_settings in realtime
      const { error } = await (supabase.from('system_settings') as any).upsert({
        key: policyKey,
        value: policyValue,
        description: `Campus placement eligibility cutoff policy for ${collegeName}`,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.warn('system_settings upsert notice:', error.message);
      }

      setPolicySaved(true);
      setTimeout(() => setPolicySaved(false), 3500);
    } catch (err: any) {
      console.error('handleSavePolicy error:', err);
      setPolicySaveError(err.message || 'Failed to save eligibility policy to PostgreSQL.');
    } finally {
      setIsSavingPolicy(false);
    }
  };

  const parsedMinCGPA = parseFloat(minCGPA) || 0;
  const parsedMinTalent = parseInt(minTalentScore, 10) || 0;
  const parsedMinAtt = parseFloat(minAttendance) || 0;

  const eligibleStudents = students.filter(
    s =>
      (s.cgpa || 0) >= parsedMinCGPA &&
      ((s.talentScore?.overallScore ?? s.talentScore) || 0) >= parsedMinTalent &&
      (s.attendancePercent || 0) >= parsedMinAtt
  );

  const eligibleCount = eligibleStudents.length;
  const totalStudentsCount = students.length;
  const eligiblePercentage = totalStudentsCount > 0 ? Math.round((eligibleCount / totalStudentsCount) * 100) : 0;

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
      render: (s: Student) => <span className="text-xs text-slate-700 font-semibold">{s.departmentName}</span>,
      sortable: true,
    },
    {
      key: 'cgpa',
      header: 'CGPA',
      render: (s: Student) => (
        <span className={`font-mono font-bold text-xs ${(s.cgpa || 0) >= parsedMinCGPA ? 'text-emerald-700' : 'text-rose-600'}`}>
          {s.cgpa?.toFixed(2) || '0.00'}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'talentScore',
      header: 'Talent Score',
      render: (s: Student) => {
        const score = s.talentScore?.overallScore ?? s.talentScore ?? 0;
        return (
          <span className={`font-mono font-bold ${score >= parsedMinTalent ? 'text-brand-600' : 'text-rose-600'}`}>
            {score}
          </span>
        );
      },
      sortable: true,
    },
    {
      key: 'attendance',
      header: 'Attendance',
      render: (s: Student) => (
        <span className={`font-mono text-xs font-bold ${(s.attendancePercent || 0) >= parsedMinAtt ? 'text-emerald-600' : 'text-rose-600'}`}>
          {s.attendancePercent || 0}%
        </span>
      ),
      sortable: true,
    },
    {
      key: 'eligibility',
      header: 'Drive Eligibility Status',
      render: (s: Student) => {
        const score = s.talentScore?.overallScore ?? s.talentScore ?? 0;
        const meetsCGPA = (s.cgpa || 0) >= parsedMinCGPA;
        const meetsTalent = score >= parsedMinTalent;
        const meetsAtt = (s.attendancePercent || 0) >= parsedMinAtt;
        const isEligible = meetsCGPA && meetsTalent && meetsAtt;

        if (isEligible) {
          return <Badge variant="success" size="sm">✓ Drive Eligible</Badge>;
        }

        const reasons = [];
        if (!meetsCGPA) reasons.push(`CGPA < ${parsedMinCGPA}`);
        if (!meetsTalent) reasons.push(`Score < ${parsedMinTalent}`);
        if (!meetsAtt) reasons.push(`Att < ${parsedMinAtt}%`);

        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            ✕ Ineligible ({reasons.join(', ')})
          </span>
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
              <Building2 className="w-3.5 h-3.5" /> Department & Placement Governance
            </span>
            <Badge variant="purple">{collegeName}</Badge>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Realtime Database Sync
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Departments & Placement Cutoff Engine
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Create, edit, and delete academic branches, assign department coordinators, and dynamically enforce campus-wide placement eligibility rules in real time.
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
              setDeptName('');
              setDeptCode('');
              setCoordName('');
              setCoordEmail('');
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
              {/* Header with Code, Edit and Delete Buttons */}
              <div className="flex justify-between items-start">
                <span className="font-mono text-xs font-bold text-brand-600 px-2 py-0.5 rounded-lg bg-brand-50 border border-brand-200">
                  {dept.code}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title="Edit Department"
                    onClick={() => {
                      setDeptToEdit(dept);
                      setEditDeptName(dept.name);
                      setEditDeptCode(dept.code);
                      setEditCoordName(dept.coordinatorName);
                      setEditCoordEmail(dept.coordinatorEmail);
                      setEditDeptError(null);
                      setIsEditModalOpen(true);
                    }}
                    className="text-slate-400 hover:text-brand-600 p-1.5 rounded-lg hover:bg-brand-50 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    title="Delete Department"
                    onClick={() => {
                      setDeptToDelete(dept);
                      setDeleteDeptError(null);
                      setIsDeleteModalOpen(true);
                    }}
                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
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

      {/* Real-time Placement Eligibility Threshold Form & Analytics */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-brand-600" /> Campus Placement Eligibility Rules
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Set campus-wide qualification cutoffs. Candidate eligibility updates dynamically across PostgreSQL.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-xs font-bold text-brand-700 bg-brand-50 px-3.5 py-1.5 rounded-xl border border-brand-200 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-brand-600" />
              <span>
                <strong>{eligibleCount}</strong> / {totalStudentsCount} Students Eligible ({eligiblePercentage}%)
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Cutoff Sliders / Form Inputs */}
        <form onSubmit={handleSavePolicy} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Minimum Academic CGPA
              </label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={minCGPA}
                onChange={e => setMinCGPA(e.target.value)}
                placeholder="7.0"
                required
              />
              <span className="text-[10px] text-slate-400 font-mono block">Cutoff: Students with CGPA ≥ {minCGPA}</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Minimum Talent Score (0–1000)
              </label>
              <Input
                type="number"
                step="10"
                min="0"
                max="1000"
                value={minTalentScore}
                onChange={e => setMinTalentScore(e.target.value)}
                placeholder="700"
                required
              />
              <span className="text-[10px] text-slate-400 font-mono block">Cutoff: Talent Score ≥ {minTalentScore}</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Minimum Attendance Percentage (%)
              </label>
              <Input
                type="number"
                step="1"
                min="0"
                max="100"
                value={minAttendance}
                onChange={e => setMinAttendance(e.target.value)}
                placeholder="75"
                required
              />
              <span className="text-[10px] text-slate-400 font-mono block">Cutoff: Attendance ≥ {minAttendance}%</span>
            </div>
          </div>

          {policySaveError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <XCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{policySaveError}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <div>
              {policySaved && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Eligibility criteria updated in PostgreSQL and synchronized in real time!
                </span>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSavingPolicy}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Eligibility Policy
            </Button>
          </div>
        </form>
      </div>

      {/* Scoped Student Eligibility Master Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-600" /> Student Placement Eligibility Roster
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-900">{students.length}</strong> enrolled students
          </span>
        </div>

        {students.length > 0 ? (
          <DataTable
            columns={columns}
            data={students}
            searchPlaceholder="Search candidate by name, roll number, or department..."
          />
        ) : (
          <Card className="p-10 text-center space-y-3">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <div>
              <h4 className="font-bold text-slate-800 text-sm">No Students Enrolled in this College Yet</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-0.5">
                Onboard or import students for {collegeName} using the Student Import Wizard to evaluate dynamic placement readiness and qualification cutoffs.
              </p>
            </div>
            <Button
              size="sm"
              variant="primary"
              leftIcon={<UserPlus className="w-4 h-4" />}
              onClick={() => navigate('/college/import')}
            >
              Import Students Wizard
            </Button>
          </Card>
        )}
      </div>

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

      {/* 2. Edit Academic Department Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setDeptToEdit(null);
        }}
        title="Edit Academic Department"
        description={`Update department information and coordinator credentials for ${collegeName} in PostgreSQL.`}
      >
        <form onSubmit={handleEditDepartment} className="space-y-4 text-xs">
          <Input
            label="Department Full Name"
            value={editDeptName}
            onChange={e => setEditDeptName(e.target.value)}
            placeholder="e.g. Computer Science & Engineering"
            required
          />

          <Input
            label="Department Code"
            value={editDeptCode}
            onChange={e => setEditDeptCode(e.target.value)}
            placeholder="e.g. CSE or 5656"
            required
          />

          <Input
            label="Coordinator Full Name"
            value={editCoordName}
            onChange={e => setEditCoordName(e.target.value)}
            placeholder="e.g. Dr. Priya Varma"
            required
          />

          <Input
            label="Coordinator Official Email"
            type="email"
            value={editCoordEmail}
            onChange={e => setEditCoordEmail(e.target.value)}
            placeholder="e.g. priya.varma@college.edu"
            required
          />

          {editDeptError && (
            <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 font-semibold text-xs flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{editDeptError}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false);
                setDeptToEdit(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmittingEditDept}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Department Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* 3. Delete Department Confirmation Modal */}
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
