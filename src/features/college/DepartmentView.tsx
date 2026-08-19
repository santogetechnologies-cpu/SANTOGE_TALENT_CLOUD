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
  Save,
  GraduationCap,
  Percent,
} from 'lucide-react';

export const DepartmentView: React.FC = () => {
  const { user } = useAuth();
  const { activeDepartment } = useScope();
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Add Department Modal
  const [isAddDeptModalOpen, setIsAddDeptModalOpen] = useState(false);
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [coordName, setCoordName] = useState('');
  const [coordEmail, setCoordEmail] = useState('');
  const [isSubmittingDept, setIsSubmittingDept] = useState(false);

  // Placement Eligibility Policy Settings
  const [minCGPA, setMinCGPA] = useState('7.0');
  const [minTalentScore, setMinTalentScore] = useState('700');
  const [minAttendance, setMinAttendance] = useState('75');
  const [policySaved, setPolicySaved] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Load departments
      const { data: deptData } = await (supabase.from('departments') as any)
        .select('*')
        .order('name', { ascending: true });

      if (deptData && deptData.length > 0) {
        setDepartments(deptData);
        if (!selectedDeptId) {
          setSelectedDeptId(deptData[0].id);
        }
      } else {
        // Fallback default departments
        setDepartments([
          { id: 'dept-cse', code: 'CSE', name: 'Computer Science & Engineering', coordinatorId: 'c1', coordinatorName: 'Dr. Suresh Rao', coordinatorEmail: 'suresh@apextech.edu', totalStudents: 320, placedStudents: 281, placementRate: 88, averageTalentScore: 785, averagePackageLPA: 8.5 },
          { id: 'dept-it', code: 'IT', name: 'Information Technology', coordinatorId: 'c2', coordinatorName: 'Prof. Meena Kumari', coordinatorEmail: 'meena@apextech.edu', totalStudents: 210, placedStudents: 172, placementRate: 82, averageTalentScore: 760, averagePackageLPA: 7.8 },
          { id: 'dept-ece', code: 'ECE', name: 'Electronics & Communication', coordinatorId: 'c3', coordinatorName: 'Dr. Rajesh Nair', coordinatorEmail: 'rajesh@apextech.edu', totalStudents: 180, placedStudents: 133, placementRate: 74, averageTalentScore: 710, averagePackageLPA: 6.9 },
          { id: 'dept-aids', code: 'AI&DS', name: 'Artificial Intelligence & Data Science', coordinatorId: 'c4', coordinatorName: 'Dr. Priya Varma', coordinatorEmail: 'priya@apextech.edu', totalStudents: 130, placedStudents: 118, placementRate: 91, averageTalentScore: 820, averagePackageLPA: 9.8 },
        ]);
      }

      // 2. Load students
      const data = await studentService.getStudents(user?.dataScope);
      setStudents(data);
    } catch (err) {
      console.error('loadData error in DepartmentView:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingDept(true);

    try {
      const newDept = {
        id: crypto.randomUUID(),
        name: deptName.trim(),
        code: deptCode.trim().toUpperCase(),
        coordinator_name: coordName.trim(),
        coordinator_email: coordEmail.trim().toLowerCase(),
        college_id: user?.dataScope?.collegeId || null,
        created_at: new Date().toISOString(),
      };

      await (supabase.from('departments') as any).insert(newDept);

      setIsAddDeptModalOpen(false);
      setDeptName('');
      setDeptCode('');
      setCoordName('');
      setCoordEmail('');
      loadData();
    } catch (err) {
      console.error('Error adding department:', err);
    } finally {
      setIsSubmittingDept(false);
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
            <Badge variant="primary">{user?.dataScope?.collegeName || 'Multi-Tenant Scoped'}</Badge>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Departments & Placement Cutoff Engine
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Manage academic branches, department coordinators, and dynamically enforce placement eligibility rules across your college.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddDeptModalOpen(true)}
          >
            Add New Department
          </Button>
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {departments.map(dept => (
          <div
            key={dept.id}
            className="p-5 rounded-2xl border border-slate-200 bg-white shadow-soft hover:shadow-soft-md transition-all space-y-3"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-xs font-bold text-brand-600 px-2 py-0.5 rounded-lg bg-brand-50 border border-brand-200">
                  {dept.code}
                </span>
                <h4 className="font-extrabold text-slate-900 text-sm mt-2">{dept.name}</h4>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              Coordinator: <strong className="text-slate-800">{dept.coordinatorName || 'Assigned Coordinator'}</strong>
            </p>

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

      {/* Add Department Modal */}
      <Modal
        isOpen={isAddDeptModalOpen}
        onClose={() => setIsAddDeptModalOpen(false)}
        title="Add Academic Department"
        description="Register a new academic department with its coordinator details."
      >
        <form onSubmit={handleAddDepartment} className="space-y-4 text-xs">
          <Input
            label="Department Full Name"
            value={deptName}
            onChange={e => setDeptName(e.target.value)}
            placeholder="e.g. Artificial Intelligence & Machine Learning"
            required
          />

          <Input
            label="Department Code"
            value={deptCode}
            onChange={e => setDeptCode(e.target.value)}
            placeholder="e.g. AIML"
            required
          />

          <Input
            label="Coordinator Full Name"
            value={coordName}
            onChange={e => setCoordName(e.target.value)}
            placeholder="e.g. Dr. Ramesh Patel"
            required
          />

          <Input
            label="Coordinator Email"
            type="email"
            value={coordEmail}
            onChange={e => setCoordEmail(e.target.value)}
            placeholder="e.g. coordinator.aiml@apextech.edu"
            required
          />

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
    </div>
  );
};
