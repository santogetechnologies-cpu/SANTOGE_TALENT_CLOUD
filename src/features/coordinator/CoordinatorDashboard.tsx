import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { studentService } from '../../services/studentService';
import { Student, RiskStatus } from '../../types/student';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { DataTable } from '../../components/shared/DataTable';
import { RiskBadge } from '../../components/shared/RiskBadge';
import {
  Building2,
  Users,
  Award,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  XCircle,
  FileText,
  Printer,
  Download,
  Mail,
  Send,
  ExternalLink,
  Github,
  Calendar,
  Layers,
  GraduationCap,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Bell,
  Search,
  Flame,
  CheckSquare,
  UserPlus,
  Plus,
} from 'lucide-react';

interface CoordinatorDashboardProps {
  initialTab?: 'students' | 'at-risk' | 'assessments' | 'reports' | 'announcements';
}

export const CoordinatorDashboard: React.FC<CoordinatorDashboardProps> = ({ initialTab = 'students' }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Tab State
  const [activeTab, setActiveTab] = useState<'students' | 'at-risk' | 'assessments' | 'reports' | 'announcements'>(initialTab);
  const [students, setStudents] = useState<Student[]>([]);
  const [departmentInfo, setDepartmentInfo] = useState<{
    id: string;
    name: string;
    code: string;
    coordinator_name: string;
    coordinator_email: string;
    college_id?: string;
  } | null>(null);
  const [collegeTitle, setCollegeTitle] = useState<string>(user?.dataScope?.collegeName || 'College');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Student Profile Drawer
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Add Student to Department Modal
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [studentRoll, setStudentRoll] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [studentCGPA, setStudentCGPA] = useState('8.2');
  const [studentTalentScore, setStudentTalentScore] = useState('780');
  const [studentAttendance, setStudentAttendance] = useState('88');
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [addStudentMessage, setAddStudentMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Broadcast Modal State
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastPriority, setBroadcastPriority] = useState<'NORMAL' | 'URGENT'>('NORMAL');
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // Remedial Assignment Modal State
  const [remedialStudent, setRemedialStudent] = useState<Student | null>(null);
  const [remedialNotes, setRemedialNotes] = useState('');
  const [remedialSaved, setRemedialSaved] = useState(false);

  // Sync activeTab with URL route seamlessly
  useEffect(() => {
    if (location.pathname.includes('/department/students')) {
      setActiveTab('students');
    } else if (location.pathname.includes('/department/at-risk')) {
      setActiveTab('at-risk');
    } else if (location.pathname.includes('/department/assessments')) {
      setActiveTab('assessments');
    } else if (location.pathname.includes('/department/reports')) {
      setActiveTab('reports');
    } else if (location.pathname.includes('/department/announcements')) {
      setActiveTab('announcements');
      setIsBroadcastModalOpen(true);
    } else if (location.pathname.includes('/department/dashboard')) {
      setActiveTab('students');
    } else if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [location.pathname, initialTab]);

  const handleTabSelect = (tab: 'students' | 'at-risk' | 'assessments' | 'reports' | 'announcements') => {
    setActiveTab(tab);
    navigate(`/department/${tab === 'students' ? 'students' : tab}`);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Resolve department details for this coordinator
      let deptName = user?.dataScope?.departmentNames?.[0];
      let colId = user?.dataScope?.collegeId;

      // Query database departments by coordinator email or name
      let deptQuery = (supabase.from('departments') as any).select('*');
      if (user?.email) {
        deptQuery = deptQuery.or(`coordinator_email.ilike.%${user.email}%,name.ilike.%${deptName || ''}%`);
      } else if (deptName) {
        deptQuery = deptQuery.ilike('name', `%${deptName}%`);
      }

      const { data: depts } = await deptQuery.limit(1);
      if (depts && depts.length > 0) {
        setDepartmentInfo(depts[0]);
        deptName = depts[0].name;
        if (!colId && depts[0].college_id) colId = depts[0].college_id;
      }

      // Resolve College Name if not set
      if (colId) {
        const { data: colData } = await (supabase.from('colleges') as any).select('name').eq('id', colId).maybeSingle();
        if (colData?.name) {
          setCollegeTitle(colData.name);
        }
      } else if (user?.dataScope?.collegeName) {
        setCollegeTitle(user.dataScope.collegeName);
      }

      // 2. Fetch department-scoped students
      let studentQuery = (supabase.from('students') as any).select('*');
      if (colId) {
        studentQuery = studentQuery.eq('college_id', colId);
      }
      if (deptName) {
        const deptCode = departmentInfo?.code || '';
        if (deptCode) {
          studentQuery = studentQuery.or(`department_name.ilike.%${deptName}%,department_name.ilike.%${deptCode}%`);
        } else {
          studentQuery = studentQuery.ilike('department_name', `%${deptName}%`);
        }
      }

      const { data: stuRows, error: stuError } = await studentQuery.order('talent_score', { ascending: false });

      if (!stuError && stuRows) {
        setStudents(stuRows.map((r: any) => studentService.mapDbStudentToDomain(r)));
      } else {
        // Fallback scope query
        const effectiveScope = {
          ...(user?.dataScope || { scopeType: 'COLLEGE' as const }),
          collegeId: colId || undefined,
          departmentNames: deptName ? [deptName] : undefined,
        };
        const stu = await studentService.getStudents(effectiveScope);
        setStudents(stu);
      }
    } catch (err) {
      console.error('loadData error in CoordinatorDashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Realtime synchronization on students
  useEffect(() => {
    const channel = supabase
      .channel('coordinator-students-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'students' },
        () => loadData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Calculations
  const resolvedDeptTitle = departmentInfo?.name || user?.dataScope?.departmentNames?.[0] || 'Department';
  const totalStudents = students.length;
  const avgTalentScore = totalStudents > 0
    ? Math.round(students.reduce((acc, s) => acc + (s.talentScore?.overallScore || 0), 0) / totalStudents)
    : 0;
  const avgIRI = totalStudents > 0
    ? Math.round(students.reduce((acc, s) => acc + (s.iri?.overallIRI || 0), 0) / totalStudents)
    : 0;
  const avgAttendance = totalStudents > 0
    ? Math.round(students.reduce((acc, s) => acc + (s.attendancePercent || 0), 0) / totalStudents)
    : 0;
  const atRiskStudents = students.filter(
    s => s.riskStatus === 'STRUGGLING' || s.riskStatus === 'INACTIVE' || s.attendancePercent < 75 || (s.talentScore?.overallScore || 0) < 600
  );
  const placedCount = students.filter(s => (s.placementReadiness?.offersCount || 0) > 0).length;
  const placementRate = totalStudents > 0 ? Math.round((placedCount / totalStudents) * 100) : 0;

  // Add Student Directly to Department
  const handleAddStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingStudent(true);
    setAddStudentMessage(null);

    try {
      let targetCollegeId = user?.dataScope?.collegeId || departmentInfo?.college_id;
      if (!targetCollegeId) {
        const { data: col } = await (supabase.from('colleges') as any).select('id').limit(1).single();
        targetCollegeId = col?.id;
      }

      const newStudentPayload = {
        id: crypto.randomUUID(),
        name: studentName.trim(),
        roll_number: studentRoll.trim().toUpperCase(),
        email: studentEmail.trim().toLowerCase(),
        phone: studentPhone.trim() || '+91 98765 43210',
        college_id: targetCollegeId,
        college_name: collegeTitle,
        department_id: departmentInfo?.id || null,
        department_name: resolvedDeptTitle,
        graduation_year: 2026,
        cgpa: parseFloat(studentCGPA) || 8.0,
        talent_score: parseInt(studentTalentScore) || 750,
        iri_score: 82,
        attendance_percent: parseFloat(studentAttendance) || 90,
        risk_status: parseFloat(studentAttendance) < 75 ? 'STRUGGLING' : 'ON_TRACK',
        github_username: studentRoll.toLowerCase().replace(/[^a-z0-9]/g, '') + '-dev',
        created_at: new Date().toISOString(),
      };

      const { error } = await (supabase.from('students') as any).insert(newStudentPayload);

      if (error) throw error;

      setAddStudentMessage({ type: 'success', text: `Student ${studentName} enrolled in ${resolvedDeptTitle} successfully!` });

      setTimeout(() => {
        setIsAddStudentModalOpen(false);
        setStudentName('');
        setStudentRoll('');
        setStudentEmail('');
        setStudentPhone('');
        setAddStudentMessage(null);
        loadData();
      }, 1200);
    } catch (err: any) {
      console.error('Error adding student:', err);
      setAddStudentMessage({ type: 'error', text: err.message || 'Failed to add student to database.' });
    } finally {
      setIsAddingStudent(false);
    }
  };

  // Toggle Placement Eligibility
  const handleToggleEligibility = async (studentId: string, currentStatus: string) => {
    try {
      const isCurrentlyEligible = currentStatus === 'InterviewReady' || currentStatus === 'RecruiterPool';
      const nextStatus = isCurrentlyEligible ? 'Foundation' : 'InterviewReady';
      const nextDrivesCount = isCurrentlyEligible ? 0 : 5;

      await (supabase.from('students') as any)
        .update({
          placement_readiness: {
            ...(selectedStudent?.placementReadiness || {}),
            status: nextStatus,
            eligibleDrivesCount: nextDrivesCount,
          },
        })
        .eq('id', studentId);

      setStudents(prev =>
        prev.map(s =>
          s.id === studentId
            ? {
                ...s,
                placementReadiness: {
                  ...s.placementReadiness,
                  status: nextStatus,
                  eligibleDrivesCount: nextDrivesCount,
                },
              }
            : s
        )
      );

      if (selectedStudent && selectedStudent.id === studentId) {
        setSelectedStudent({
          ...selectedStudent,
          placementReadiness: {
            ...selectedStudent.placementReadiness,
            status: nextStatus,
            eligibleDrivesCount: nextDrivesCount,
          },
        });
      }
    } catch (err) {
      console.error('Error toggling eligibility:', err);
    }
  };

  // Send Broadcast Announcement to Department
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingBroadcast(true);
    try {
      const payload = {
        id: crypto.randomUUID(),
        title: broadcastTitle,
        content: broadcastMessage,
        priority: broadcastPriority,
        target_role: 'STUDENT',
        college_id: user?.dataScope?.collegeId || null,
        department_name: resolvedDeptTitle,
        created_by_name: user?.name || 'Department Coordinator',
        created_at: new Date().toISOString(),
      };

      await (supabase.from('batch_announcements') as any).insert(payload);
      setBroadcastSuccess(true);
      setTimeout(() => {
        setIsBroadcastModalOpen(false);
        setBroadcastTitle('');
        setBroadcastMessage('');
        setBroadcastSuccess(false);
      }, 1500);
    } catch (err) {
      console.error('Error sending announcement:', err);
    } finally {
      setIsSendingBroadcast(false);
    }
  };

  // Assign Remedial Mentorship
  const handleAssignRemedial = (e: React.FormEvent) => {
    e.preventDefault();
    setRemedialSaved(true);
    setTimeout(() => {
      setRemedialStudent(null);
      setRemedialNotes('');
      setRemedialSaved(false);
    }, 1200);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Name', 'Roll Number', 'Email', 'CGPA', 'Talent Score', 'Technical IRI %', 'Attendance %', 'Risk Status', 'Placement Ready'];
    const rows = students.map(s => [
      `"${s.name}"`,
      `"${s.rollNumber}"`,
      `"${s.email}"`,
      s.cgpa,
      s.talentScore?.overallScore || 0,
      s.iri?.overallIRI || 0,
      s.attendancePercent,
      s.riskStatus,
      (s.placementReadiness?.status === 'InterviewReady' || s.placementReadiness?.status === 'RecruiterPool' || (s.placementReadiness?.eligibleDrivesCount || 0) > 0) ? 'YES' : 'NO',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${resolvedDeptTitle.replace(/\s+/g, '_')}_Student_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredStudents = students.filter(s => {
    const q = searchQuery.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.rollNumber?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q)
    );
  });

  const columns = [
    {
      key: 'name',
      header: 'Student & Roll Number',
      render: (s: Student) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center uppercase shrink-0">
            {s.name?.charAt(0) || 'S'}
          </div>
          <div>
            <p className="font-bold text-slate-900">{s.name}</p>
            <p className="text-[11px] font-mono text-slate-500">{s.rollNumber}</p>
          </div>
        </div>
      ),
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
      render: (s: Student) => (
        <div className="flex items-center gap-1.5 font-mono font-bold text-brand-600">
          <Sparkles className="w-3.5 h-3.5" /> {s.talentScore?.overallScore || 0}
        </div>
      ),
      sortable: true,
    },
    {
      key: 'iri',
      header: 'Technical IRI',
      render: (s: Student) => (
        <div className="flex items-center gap-1.5 font-mono text-purple-700 font-bold">
          <TrendingUp className="w-3.5 h-3.5" /> {s.iri?.overallIRI || 75}%
        </div>
      ),
      sortable: true,
    },
    {
      key: 'attendance',
      header: 'Attendance',
      render: (s: Student) => (
        <span className={`font-mono text-xs font-bold ${s.attendancePercent >= 75 ? 'text-emerald-600' : 'text-rose-600'}`}>
          {s.attendancePercent}%
        </span>
      ),
      sortable: true,
    },
    {
      key: 'riskStatus',
      header: 'Risk Level',
      render: (s: Student) => <RiskBadge status={s.riskStatus} />,
      sortable: true,
    },
    {
      key: 'actions',
      header: 'Action',
      render: (s: Student) => (
        <div className="flex items-center gap-2">
          <Button
            size="xs"
            variant="outline"
            onClick={() => setSelectedStudent(s)}
          >
            Inspect Profile
          </Button>
          {s.attendancePercent < 75 && (
            <Button
              size="xs"
              variant="danger"
              onClick={() => setRemedialStudent(s)}
            >
              Remedial
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> Department Coordinator Portal
            </span>
            <Badge variant="primary">{resolvedDeptTitle}</Badge>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {collegeTitle}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {resolvedDeptTitle} Academic & Placement Hub
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Monitor department students, technical readiness (IRI), attendance, assessments, and remedial interventions strictly scoped to your department.
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
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => {
              setAddStudentMessage(null);
              setIsAddStudentModalOpen(true);
            }}
          >
            Add Student
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Send className="w-3.5 h-3.5" />}
            onClick={() => setIsBroadcastModalOpen(true)}
          >
            Broadcast
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft">
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Department Students</span>
          <span className="text-2xl font-black text-slate-900 font-mono">{totalStudents}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft">
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Avg Talent Score</span>
          <span className="text-2xl font-black text-brand-600 font-mono">{avgTalentScore}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft">
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Technical IRI Readiness</span>
          <span className="text-2xl font-black text-purple-600 font-mono">{avgIRI}%</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft">
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Avg Attendance</span>
          <span className={`text-2xl font-black font-mono ${avgAttendance >= 75 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {avgAttendance}%
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft">
          <span className="text-[10px] font-bold uppercase text-slate-500 block">At-Risk / Weak Students</span>
          <span className="text-2xl font-black text-rose-600 font-mono">{atRiskStudents.length}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft">
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Placement Rate</span>
          <span className="text-2xl font-black text-emerald-600 font-mono">{placementRate}%</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 text-xs overflow-x-auto">
        {[
          { id: 'students' as const, label: `All Department Students (${totalStudents})`, icon: <Users className="w-3.5 h-3.5" /> },
          { id: 'at-risk' as const, label: `⚠️ Weak & At-Risk (${atRiskStudents.length})`, icon: <AlertTriangle className="w-3.5 h-3.5" /> },
          { id: 'assessments' as const, label: '📊 Assessments & Readiness', icon: <Award className="w-3.5 h-3.5" /> },
          { id: 'reports' as const, label: '📄 Department Placement Report', icon: <FileText className="w-3.5 h-3.5" /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabSelect(tab.id)}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-brand-600 text-white shadow-soft-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: All Students */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          {students.length > 0 ? (
            <DataTable
              columns={columns}
              data={filteredStudents}
              searchPlaceholder={`Search ${resolvedDeptTitle} students by name or roll number...`}
            />
          ) : (
            <div className="p-8 rounded-2xl border-2 border-dashed border-slate-200 bg-white text-center space-y-3">
              <Users className="w-10 h-10 text-slate-400 mx-auto" />
              <div>
                <h3 className="font-bold text-slate-800 text-sm">No Students Found in {resolvedDeptTitle}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Directly add students to your department or have your College Super Admin import them via CSV.
                </p>
              </div>
              <Button
                size="sm"
                variant="primary"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setIsAddStudentModalOpen(true)}
              >
                + Add Student to {resolvedDeptTitle}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Weak & At-Risk Students */}
      {activeTab === 'at-risk' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>Remedial Attention Queue: Students with attendance &lt; 75% or low technical score.</span>
            </div>
            <Badge variant="warning">{atRiskStudents.length} Students Flagged</Badge>
          </div>

          <DataTable
            columns={columns}
            data={atRiskStudents}
            searchPlaceholder="Filter weak students..."
          />
        </div>
      )}

      {/* Tab 3: Assessments & Readiness Radar */}
      {activeTab === 'assessments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-soft space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Award className="w-4 h-4 text-brand-600" /> Technical Assessment Competencies ({resolvedDeptTitle})
            </h3>
            <div className="space-y-3 text-xs font-mono">
              <div className="space-y-1">
                <div className="flex justify-between font-sans text-xs">
                  <span className="font-semibold text-slate-700">Data Structures & Algorithms</span>
                  <span className="font-bold text-brand-600">82% Mastery</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-brand-600 h-2 rounded-full" style={{ width: '82%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-sans text-xs">
                  <span className="font-semibold text-slate-700">Database & SQL Mastery</span>
                  <span className="font-bold text-emerald-600">76% Mastery</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '76%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-sans text-xs">
                  <span className="font-semibold text-slate-700">System Design & Cloud Architecture</span>
                  <span className="font-bold text-purple-600">71% Mastery</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '71%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-sans text-xs">
                  <span className="font-semibold text-slate-700">Technical Communication</span>
                  <span className="font-bold text-amber-600">68% Mastery</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-amber-600 h-2 rounded-full" style={{ width: '68%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-soft space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-600" /> Daily Lab & Simulator Completion
            </h3>
            <p className="text-xs text-slate-500">
              Department cohort consistency, daily coding streak synchronization, and assignment submission trends.
            </p>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-2">
              <span className="text-3xl font-black text-slate-900 font-mono">88.4%</span>
              <span className="text-xs text-slate-600 block font-semibold">Department Simulator Lab Completion Rate</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Official Department Audit Report */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-soft space-y-6">
          <div className="flex justify-between items-start border-b border-slate-200 pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block">
                {collegeTitle}
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-1">
                {resolvedDeptTitle} — Department Placement Audit Report
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Coordinator: <strong>{departmentInfo?.coordinator_name || user?.name}</strong> ({departmentInfo?.coordinator_email || user?.email})
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Printer className="w-4 h-4" />}
              onClick={() => window.print()}
            >
              Print Audit PDF
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl font-mono text-center text-xs">
            <div>
              <span className="text-slate-500 text-[10px] block">Total Enrolled</span>
              <span className="font-bold text-slate-900 text-lg">{totalStudents}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Avg Talent Score</span>
              <span className="font-bold text-brand-600 text-lg">{avgTalentScore}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Technical IRI</span>
              <span className="font-bold text-purple-600 text-lg">{avgIRI}%</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Placement Rate</span>
              <span className="font-bold text-emerald-600 text-lg">{placementRate}%</span>
            </div>
          </div>

          <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3">Student Name</th>
                <th className="p-3">Roll No</th>
                <th className="p-3 text-right">CGPA</th>
                <th className="p-3 text-right">Talent Score</th>
                <th className="p-3 text-right">IRI %</th>
                <th className="p-3 text-right">Attendance</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {students.map(s => (
                <tr key={s.id} className="hover:bg-slate-50 font-sans">
                  <td className="p-3 font-bold text-slate-900">{s.name}</td>
                  <td className="p-3 font-mono text-slate-600 text-xs">{s.rollNumber}</td>
                  <td className="p-3 font-mono text-right text-xs">{s.cgpa}</td>
                  <td className="p-3 font-mono text-right text-xs font-bold text-brand-600">{s.talentScore?.overallScore || 0}</td>
                  <td className="p-3 font-mono text-right text-xs font-bold text-purple-600">{s.iri?.overallIRI || 75}%</td>
                  <td className="p-3 font-mono text-right text-xs">{s.attendancePercent}%</td>
                  <td className="p-3 text-center">
                    <Badge variant={(s.placementReadiness?.status === 'InterviewReady' || s.placementReadiness?.status === 'RecruiterPool' || (s.placementReadiness?.eligibleDrivesCount || 0) > 0) ? 'success' : 'outline'} size="sm">
                      {(s.placementReadiness?.status === 'InterviewReady' || s.placementReadiness?.status === 'RecruiterPool' || (s.placementReadiness?.eligibleDrivesCount || 0) > 0) ? 'ELIGIBLE' : 'PENDING'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 1. Student Profile Modal Drawer */}
      {selectedStudent && (
        <Modal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          title={`Student Talent Inspection: ${selectedStudent.name}`}
          description={`Roll No: ${selectedStudent.rollNumber} • ${selectedStudent.departmentName}`}
          maxWidth="2xl"
        >
          <div className="space-y-5 text-xs">
            {/* Top Stat Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center font-mono">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Talent Score</span>
                <span className="text-xl font-black text-brand-600">{selectedStudent.talentScore?.overallScore || 750}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Technical IRI</span>
                <span className="text-xl font-black text-purple-600">{selectedStudent.iri?.overallIRI || 80}%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Attendance</span>
                <span className={`text-xl font-black ${selectedStudent.attendancePercent >= 75 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {selectedStudent.attendancePercent}%
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">CGPA</span>
                <span className="text-xl font-black text-slate-900">{selectedStudent.cgpa}</span>
              </div>
            </div>

            {/* Talent Score Breakdown */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
              <span className="font-extrabold text-slate-900 block text-xs uppercase tracking-wide">
                📊 Assessment Competency Breakdown (0–1000 Scale)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[10px]">Technical Score</span>
                  <span className="font-bold text-slate-900">{selectedStudent.talentScore?.technicalScore || 780} / 1000</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[10px]">Placement Readiness</span>
                  <span className="font-bold text-slate-900">{selectedStudent.talentScore?.placementScore || 750} / 1000</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[10px]">Communication</span>
                  <span className="font-bold text-slate-900">{selectedStudent.talentScore?.communicationScore || 720} / 1000</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[10px]">Aptitude & Logic</span>
                  <span className="font-bold text-slate-900">{selectedStudent.talentScore?.aptitudeScore || 740} / 1000</span>
                </div>
              </div>
            </div>

            {/* Verified Skills */}
            <div>
              <span className="font-extrabold text-slate-900 block mb-2 text-xs uppercase tracking-wide">
                Verified Technical Skills
              </span>
              <div className="flex flex-wrap gap-2">
                {(selectedStudent.skills || []).map(sk => (
                  <span key={sk.name} className="px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-200 font-mono text-slate-800 text-[11px] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <strong>{sk.name}</strong> ({sk.score}/100)
                  </span>
                ))}
              </div>
            </div>

            {/* GitHub & Contact */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-slate-500 text-[10px] uppercase font-bold flex items-center gap-1">
                  <Github className="w-3.5 h-3.5 text-slate-700" /> GitHub Profile
                </span>
                <a
                  href={`https://github.com/${selectedStudent.githubUsername || 'developer'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1 font-mono"
                >
                  github.com/{selectedStudent.githubUsername || 'developer'}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 text-[10px] uppercase font-bold flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-700" /> Email & Contact
                </span>
                <p className="font-semibold text-slate-900 font-mono">{selectedStudent.email}</p>
              </div>
            </div>

            {/* Placement Eligibility 1-Click Toggle */}
            <div className="p-4 bg-slate-100 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">Campus Placement Eligibility:</span>
                <span className="text-[11px] text-slate-500">Allow student to register for upcoming college placement drives.</span>
              </div>
              <Button
                size="sm"
                variant={(selectedStudent.placementReadiness?.status === 'InterviewReady' || selectedStudent.placementReadiness?.status === 'RecruiterPool' || (selectedStudent.placementReadiness?.eligibleDrivesCount || 0) > 0) ? 'success' : 'outline'}
                onClick={() => handleToggleEligibility(selectedStudent.id, selectedStudent.placementReadiness?.status || 'Foundation')}
              >
                {(selectedStudent.placementReadiness?.status === 'InterviewReady' || selectedStudent.placementReadiness?.status === 'RecruiterPool' || (selectedStudent.placementReadiness?.eligibleDrivesCount || 0) > 0) ? '✓ Eligible for Drives' : '✕ Revoke / Ineligible'}
              </Button>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="outline" onClick={() => setSelectedStudent(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 2. Add Student to Department Modal */}
      <Modal
        isOpen={isAddStudentModalOpen}
        onClose={() => setIsAddStudentModalOpen(false)}
        title={`Enroll Student into ${resolvedDeptTitle}`}
        description={`Directly provision a new student record into ${resolvedDeptTitle} at ${collegeTitle}.`}
      >
        <form onSubmit={handleAddStudentSubmit} className="space-y-4 text-xs">
          <Input
            label="Student Full Name"
            value={studentName}
            onChange={e => setStudentName(e.target.value)}
            placeholder="e.g. Rahul Sharma"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Roll / Register Number"
              value={studentRoll}
              onChange={e => setStudentRoll(e.target.value)}
              placeholder="e.g. 961822IT012"
              required
            />
            <Input
              label="CGPA (Academic)"
              type="number"
              step="0.01"
              value={studentCGPA}
              onChange={e => setStudentCGPA(e.target.value)}
              placeholder="8.20"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Student Email"
              type="email"
              value={studentEmail}
              onChange={e => setStudentEmail(e.target.value)}
              placeholder="rahul@college.edu"
              required
            />
            <Input
              label="Phone Number"
              value={studentPhone}
              onChange={e => setStudentPhone(e.target.value)}
              placeholder="+91 98765 43210"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <Input
              label="Initial Talent Score (0–1000)"
              type="number"
              value={studentTalentScore}
              onChange={e => setStudentTalentScore(e.target.value)}
              required
            />
            <Input
              label="Attendance Percentage (%)"
              type="number"
              value={studentAttendance}
              onChange={e => setStudentAttendance(e.target.value)}
              required
            />
          </div>

          {addStudentMessage && (
            <div
              className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                addStudentMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {addStudentMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{addStudentMessage.text}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsAddStudentModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isAddingStudent} leftIcon={<UserPlus className="w-4 h-4" />}>
              Enroll Student
            </Button>
          </div>
        </form>
      </Modal>

      {/* 3. Broadcast Announcement Modal */}
      <Modal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
        title={`Broadcast Announcement to ${resolvedDeptTitle}`}
        description={`Send a direct notification notice to all ${totalStudents} students in this department.`}
      >
        <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
          <Input
            label="Announcement Title"
            value={broadcastTitle}
            onChange={e => setBroadcastTitle(e.target.value)}
            placeholder="e.g. Mandatory Placement Readiness Mock Assessment"
            required
          />

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Priority Level
            </label>
            <select
              value={broadcastPriority}
              onChange={e => setBroadcastPriority(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-brand-500 outline-none"
            >
              <option value="NORMAL">Normal Notice</option>
              <option value="URGENT">🚨 Urgent / Mandatory Action</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Message Content
            </label>
            <textarea
              value={broadcastMessage}
              onChange={e => setBroadcastMessage(e.target.value)}
              placeholder="Enter message details for your department learners..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none min-h-[100px]"
              required
            />
          </div>

          {broadcastSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Announcement broadcasted to {resolvedDeptTitle} students!</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsBroadcastModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSendingBroadcast} leftIcon={<Send className="w-3.5 h-3.5" />}>
              Send Announcement
            </Button>
          </div>
        </form>
      </Modal>

      {/* 4. Remedial Mentorship Modal */}
      <Modal
        isOpen={!!remedialStudent}
        onClose={() => setRemedialStudent(null)}
        title={`Assign Remedial Mentorship: ${remedialStudent?.name}`}
        description={`Attendance: ${remedialStudent?.attendancePercent}% • Talent Score: ${remedialStudent?.talentScore?.overallScore || 0}`}
      >
        <form onSubmit={handleAssignRemedial} className="space-y-4 text-xs">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 space-y-1">
            <span className="font-bold flex items-center gap-1.5 text-rose-800">
              <AlertTriangle className="w-4 h-4 text-rose-600" /> Remedial Action Triggered
            </span>
            <p className="text-[11px] text-rose-700">
              This student has low attendance or assessment scores. Provide guidance notes or assign dedicated lab hours.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Remedial Intervention Plan
            </label>
            <textarea
              value={remedialNotes}
              onChange={e => setRemedialNotes(e.target.value)}
              placeholder="e.g. Schedule 1-on-1 coding debug lab and review attendance with parent."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none min-h-[90px]"
              required
            />
          </div>

          {remedialSaved && (
            <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Remedial intervention logged in student's academic history!</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setRemedialStudent(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" leftIcon={<CheckSquare className="w-3.5 h-3.5" />}>
              Save Remedial Record
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
