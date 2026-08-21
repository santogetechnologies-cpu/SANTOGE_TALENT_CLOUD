import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { studentService } from '../../services/studentService';
import { supabase } from '../../lib/supabase';
import { Student, RiskStatus } from '../../types/student';
import { Department } from '../../types/college';
import { DataTable } from '../../components/shared/DataTable';
import { RiskBadge } from '../../components/shared/RiskBadge';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import {
  Users,
  Search,
  Filter,
  Download,
  FileText,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Mail,
  Phone,
  GraduationCap,
  Github,
  Calendar,
  Award,
  CheckCircle2,
  XCircle,
  TrendingUp,
  UserPlus,
  Building,
  Layers,
  FileCheck2,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const StudentDirectory: React.FC = () => {
  const { user, role } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [resolvedCollegeId, setResolvedCollegeId] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [riskFilter, setRiskFilter] = useState<RiskStatus | 'ALL'>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Add Single Student Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentRoll, setNewStudentRoll] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [newStudentDept, setNewStudentDept] = useState('');
  const [newStudentCGPA, setNewStudentCGPA] = useState('');
  const [newStudentGithub, setNewStudentGithub] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addMessage, setAddMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Resolve college ID
      let colId = user?.dataScope?.collegeId || null;
      if (!colId) {
        const { data: cols } = await (supabase.from('colleges') as any).select('id, name').limit(5);
        if (cols && cols.length > 0) {
          const matched = cols.find((c: any) => c.name === user?.dataScope?.collegeName);
          colId = matched ? matched.id : cols[0].id;
        }
      }
      setResolvedCollegeId(colId);

      // 2. Load strictly created departments from PostgreSQL for this college
      let deptQuery = (supabase.from('departments') as any)
        .select('*')
        .order('name', { ascending: true });

      if (colId) {
        deptQuery = deptQuery.eq('college_id', colId);
      }

      const { data: deptData, error: deptError } = await deptQuery;
      if (deptError) {
        console.error('Error loading departments:', deptError.message);
      } else if (deptData) {
        const mappedDepts: Department[] = deptData.map((d: any) => ({
          id: d.id,
          code: d.code,
          name: d.name,
          coordinatorId: d.coordinator_id || '',
          coordinatorName: d.coordinator_name || '',
          coordinatorEmail: d.coordinator_email || '',
          totalStudents: d.total_students || 0,
          placedStudents: d.placed_count || 0,
          placementRate: Number(d.placement_rate) || 0,
          averageTalentScore: d.average_talent_score || 0,
          averagePackageLPA: Number(d.average_package_lpa) || 0,
        }));
        setDepartments(mappedDepts);

        // Auto-select first real department if not already selected
        if (mappedDepts.length > 0) {
          setNewStudentDept(prev => {
            if (prev && mappedDepts.some(d => d.name === prev)) return prev;
            return mappedDepts[0].name;
          });
        } else {
          setNewStudentDept('');
        }
      }

      // 3. Load students for this college
      const data = await studentService.getStudents(
        colId ? { scopeType: 'COLLEGE', collegeId: colId } : user?.dataScope,
        riskFilter !== 'ALL' ? { riskStatus: riskFilter } : undefined
      );
      setStudents(data);
    } catch (err) {
      console.error('loadData error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, riskFilter]);

  // Realtime subscription on students and departments
  useEffect(() => {
    const channel = supabase
      .channel('college-students-and-depts-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'students' },
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
  }, [user]);

  const departmentsList = departments.length > 0
    ? departments.map(d => d.name)
    : Array.from(new Set(students.map(s => s.departmentName).filter(Boolean)));

  const filteredStudents = students.filter(s => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      s.name.toLowerCase().includes(q) ||
      s.rollNumber.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.departmentName.toLowerCase().includes(q) ||
      s.skills.some(sk => sk.name.toLowerCase().includes(q));

    const matchesDept = departmentFilter === 'ALL' || s.departmentName === departmentFilter;

    return matchesSearch && matchesDept;
  });

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAddMessage(null);

    try {
      if (!newStudentName.trim()) {
        throw new Error('Please enter student full name.');
      }
      if (!newStudentRoll.trim()) {
        throw new Error('Please enter student roll number / ID.');
      }
      if (!newStudentCGPA.trim()) {
        throw new Error('Please enter academic CGPA.');
      }

      const parsedCgpa = parseFloat(newStudentCGPA);
      if (isNaN(parsedCgpa) || parsedCgpa < 0 || parsedCgpa > 10) {
        throw new Error('Academic CGPA must be a valid number between 0.0 and 10.0.');
      }

      const selectedDeptObj = departments.find(d => d.name === newStudentDept);
      if (!selectedDeptObj && departments.length === 0) {
        throw new Error('Please create an academic department in Departments & Cutoffs first.');
      }

      if (!newStudentEmail.trim() || !newStudentEmail.includes('@')) {
        throw new Error('Please enter a valid student email address.');
      }

      const collegeIdToUse = resolvedCollegeId || user?.dataScope?.collegeId || null;
      const collegeNameToUse = user?.dataScope?.collegeName || 'My College';

      const { data, error } = await (supabase.from('students') as any)
        .insert({
          id: crypto.randomUUID(),
          name: newStudentName.trim(),
          roll_number: newStudentRoll.trim(),
          email: newStudentEmail.trim().toLowerCase(),
          phone: newStudentPhone.trim(),
          department_id: selectedDeptObj?.id || null,
          department_name: selectedDeptObj?.name || newStudentDept,
          college_id: collegeIdToUse,
          college_name: collegeNameToUse,
          cgpa: parsedCgpa,
          talent_score: 720,
          iri_score: 76.0,
          attendance_percent: 92.0,
          risk_status: 'ON_TRACK',
          github_username: newStudentGithub.trim() || 'student-dev',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Update total_students count on the department in PostgreSQL
      if (selectedDeptObj?.id) {
        try {
          await (supabase.from('departments') as any)
            .update({
              total_students: (selectedDeptObj.totalStudents || 0) + 1,
              updated_at: new Date().toISOString(),
            })
            .eq('id', selectedDeptObj.id);
        } catch (e) { }
      }

      setAddMessage({ type: 'success', text: `Student ${newStudentName} added successfully to ${selectedDeptObj?.name || newStudentDept}!` });
      setTimeout(() => {
        setIsAddModalOpen(false);
        setNewStudentName('');
        setNewStudentRoll('');
        setNewStudentCGPA('');
        setNewStudentEmail('');
        setNewStudentPhone('');
        setNewStudentGithub('');
        setAddMessage(null);
        loadData();
      }, 1200);
    } catch (err: any) {
      console.error('Error adding student:', err);
      setAddMessage({ type: 'error', text: err.message || 'Failed to add student.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePlacementEligibility = async (student: Student) => {
    try {
      const isCurrentlyReady = student.placementReadiness.status === 'InterviewReady';
      const newStatus = isCurrentlyReady ? 'Foundation' : 'InterviewReady';

      await (supabase.from('students') as any)
        .update({
          talent_score: isCurrentlyReady ? 680 : 850,
          updated_at: new Date().toISOString(),
        })
        .eq('id', student.id);

      setSelectedStudent(prev => prev ? {
        ...prev,
        placementReadiness: {
          ...prev.placementReadiness,
          status: newStatus as any,
          score: isCurrentlyReady ? 65 : 90,
        },
      } : null);

      loadData();
    } catch (err) {
      console.error('Error toggling placement readiness:', err);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Student & Roll Number',
      render: (s: Student) => (
        <div className="flex items-center gap-3">
          <img
            src={s.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={s.name}
            className="w-9 h-9 rounded-full object-cover border border-slate-200"
          />
          <div>
            <p className="font-extrabold text-slate-900 text-xs">{s.name}</p>
            <p className="font-mono text-[10px] text-slate-500">{s.rollNumber}</p>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'departmentName',
      header: 'Department',
      render: (s: Student) => (
        <Badge variant="purple" size="sm">
          {s.departmentName}
        </Badge>
      ),
      sortable: true,
    },
    {
      key: 'talentScore',
      header: 'Talent Score',
      render: (s: Student) => (
        <div className="flex items-center gap-2">
          <span className="font-mono font-black text-brand-600 text-xs">
            {s.talentScore.overallScore}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">/ 1000</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'iri',
      header: 'Technical IRI',
      render: (s: Student) => (
        <div className="flex items-center gap-2">
          <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: `${s.iri.overallIRI}%` }}
            />
          </div>
          <span className="font-mono font-bold text-slate-700 text-xs">
            {s.iri.overallIRI}%
          </span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'placementStatus',
      header: 'Placement Status',
      render: (s: Student) => (
        <Badge
          variant={
            s.placementReadiness.status === 'InterviewReady'
              ? 'success'
              : s.placementReadiness.status === 'Advanced'
                ? 'primary'
                : 'warning'
          }
          size="sm"
        >
          {s.placementReadiness.status}
        </Badge>
      ),
      sortable: true,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (s: Student) => (
        <Button
          size="xs"
          variant="outline"
          leftIcon={<FileText className="w-3 h-3 text-slate-400" />}
          onClick={() => setSelectedStudent(s)}
        >
          Inspect Profile
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Institutional Talent Directory
            </span>
            <Badge variant="purple">{user?.dataScope?.collegeName || 'My College'}</Badge>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Realtime Sync
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            College Student Master Roster
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Manage candidates, inspect verified skill footprints, monitor risk status, and track drive placements in real time.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
            onClick={loadData}
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={() => navigate('/college/import')}
          >
            Bulk Import CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<UserPlus className="w-4 h-4" />}
            onClick={() => {
              setNewStudentName('');
              setNewStudentRoll('');
              setNewStudentCGPA('');
              setNewStudentEmail('');
              setNewStudentPhone('');
              setNewStudentGithub('');
              setAddMessage(null);
              setIsAddModalOpen(true);
            }}
          >
            + Add Single Student
          </Button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-soft flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-slate-400" /> Status:
          </div>
          {(['ALL', 'ON_TRACK', 'PARTIAL', 'STRUGGLING', 'INACTIVE'] as const).map(status => (
            <button
              key={status}
              onClick={() => setRiskFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${riskFilter === status
                ? 'bg-brand-600 text-white shadow-soft'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
            >
              {status === 'ALL' ? `All Statuses (${students.length})` : status.replace('_', ' ')}
            </button>
          ))}
        </div>

        {departmentsList.length > 0 && (
          <div className="w-full md:w-auto">
            <select
              value={departmentFilter}
              onChange={e => setDepartmentFilter(e.target.value)}
              className="w-full md:w-48 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-semibold focus:ring-2 focus:ring-brand-500 outline-none cursor-pointer"
            >
              <option value="ALL">All Departments ({students.length})</option>
              {departmentsList.map(dept => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Student Directory Table */}
      <DataTable
        columns={columns}
        data={filteredStudents}
        searchPlaceholder="Search candidates by name, roll number, department, or technical skill..."
      />

      {/* 1. Student Profile Modal */}
      {selectedStudent && (
        <Modal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          title={`Verified Talent Profile: ${selectedStudent.name}`}
          description={`${selectedStudent.departmentName} • ${selectedStudent.rollNumber}`}
          maxWidth="2xl"
        >
          <div className="space-y-6 text-xs">
            {/* Header Identity Card */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-3">
                <img
                  src={selectedStudent.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={selectedStudent.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
                />
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{selectedStudent.name}</h3>
                  <p className="text-slate-500 text-xs font-mono">{selectedStudent.email}</p>
                  <p className="text-slate-400 text-[11px] font-mono mt-0.5">{selectedStudent.phone}</p>
                </div>
              </div>
              <div className="text-right space-y-1">
                <RiskBadge status={selectedStudent.riskStatus} />
                <p className="text-[10px] text-slate-400 font-mono block">Batch: {selectedStudent.graduationYear}</p>
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-brand-50/50 rounded-xl border border-brand-100 text-center">
                <span className="text-[10px] font-bold uppercase text-brand-600 block">Talent Score</span>
                <span className="text-xl font-black text-brand-700 font-mono">
                  {selectedStudent.talentScore.overallScore}
                </span>
              </div>
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-center">
                <span className="text-[10px] font-bold uppercase text-emerald-600 block">Technical IRI</span>
                <span className="text-xl font-black text-emerald-700 font-mono">
                  {selectedStudent.iri.overallIRI}%
                </span>
              </div>
              <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 text-center">
                <span className="text-[10px] font-bold uppercase text-purple-600 block">Academic CGPA</span>
                <span className="text-xl font-black text-purple-700 font-mono">
                  {selectedStudent.cgpa?.toFixed(2) || '8.50'}
                </span>
              </div>
            </div>

            {/* Verified Skills */}
            <div className="space-y-2">
              <span className="font-bold text-slate-900 block uppercase text-[10px] tracking-wider">
                Verified Technical Proficiencies
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(selectedStudent.skills || []).map(skill => (
                  <span
                    key={skill.name}
                    className="px-2.5 py-1 bg-slate-100 text-slate-700 font-mono text-[10px] rounded-lg font-semibold border border-slate-200"
                  >
                    {skill.name} ({skill.score}%)
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <Button
                size="sm"
                variant={selectedStudent.placementReadiness.status === 'InterviewReady' ? 'outline' : 'primary'}
                leftIcon={<Award className="w-3.5 h-3.5" />}
                onClick={() => handleTogglePlacementEligibility(selectedStudent)}
              >
                {selectedStudent.placementReadiness.status === 'InterviewReady'
                  ? 'Set to Foundation'
                  : 'Approve for Campus Drives'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setSelectedStudent(null)}>
                Close Profile
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 2. Add Single Student Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setNewStudentCGPA('');
          setAddMessage(null);
        }}
        title="Add Single Student to College"
        description={`Directly provision a student record isolated to ${user?.dataScope?.collegeName || 'your college'}.`}
      >
        <form onSubmit={handleAddStudent} className="space-y-4 text-xs">
          <Input
            label="Full Name"
            value={newStudentName}
            onChange={e => setNewStudentName(e.target.value)}
            placeholder="Full Name"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Roll Number / Student ID"
              value={newStudentRoll}
              onChange={e => setNewStudentRoll(e.target.value)}
              placeholder="0000000000"
              required
            />
            <Input
              label="Academic CGPA"
              type="number"
              step="0.01"
              min="0"
              max="10"
              value={newStudentCGPA}
              onChange={e => setNewStudentCGPA(e.target.value)}
              placeholder="0.0 - 10.0"
              required
            />
          </div>

          {/* Department Selection: Strictly from PostgreSQL Created Departments */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Academic Department
            </label>
            {departments.length > 0 ? (
              <select
                value={newStudentDept}
                onChange={e => setNewStudentDept(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-brand-500 outline-none cursor-pointer"
                required
              >
                {departments.map(dept => (
                  <option key={dept.id} value={dept.name}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  No Academic Departments Created Yet
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Please create your college's academic department branches in <strong>Departments & Cutoffs</strong> first before provisioning students.
                </p>
                <Button
                  type="button"
                  size="xs"
                  variant="outline"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    navigate('/college/departments');
                  }}
                >
                  + Go to Departments & Cutoffs →
                </Button>
              </div>
            )}
          </div>

          <Input
            label="Email Address"
            type="email"
            value={newStudentEmail}
            onChange={e => setNewStudentEmail(e.target.value)}
            placeholder="student@gmail.com"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Phone Number"
              value={newStudentPhone}
              onChange={e => setNewStudentPhone(e.target.value)}
              placeholder="+91 XXXXXXXXXX"
            />
            <Input
              label="GitHub Username"
              value={newStudentGithub}
              onChange={e => setNewStudentGithub(e.target.value)}
              placeholder="UserName"
            />
          </div>

          {addMessage && (
            <div
              className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${addMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
            >
              {addMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{addMessage.text}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              disabled={departments.length === 0}
              leftIcon={<UserPlus className="w-4 h-4" />}
            >
              Add Student
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
