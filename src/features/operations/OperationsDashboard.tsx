import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { operationsService } from '../../services/operationsService';
import { studentService } from '../../services/studentService';
import { collegeService } from '../../services/collegeService';
import { Batch, MentorIntervention, BatchAnnouncement } from '../../types/operations';
import { Student } from '../../types/student';
import { College } from '../../types/college';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { DataTable } from '../../components/shared/DataTable';
import { RiskBadge } from '../../components/shared/RiskBadge';
import { StatCard } from '../../components/shared/StatCard';
import {
  Layers,
  Users,
  Compass,
  ShieldAlert,
  FileCheck2,
  PhoneCall,
  ArrowRight,
  TrendingUp,
  CreditCard,
  LifeBuoy,
  Building2,
  FileText,
  Printer,
  Download,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Github,
  Mail,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  BookOpen,
  Send,
  MessageSquare,
  ShieldCheck,
  CheckSquare,
  Terminal,
} from 'lucide-react';

interface PaymentRecord {
  id: string;
  student_name: string;
  roll_number: string;
  college_name: string;
  amount: number;
  status: 'VERIFIED' | 'PENDING' | 'OVERDUE' | 'REJECTED';
  payment_method: string;
  transaction_ref: string;
  created_at: string;
}

interface SupportTicket {
  id: string;
  student_name: string;
  roll_number: string;
  college_name: string;
  category: 'ACADEMIC_DOUBT' | 'ATTENDANCE_DISCREPANCY' | 'PORTAL_ACCESS' | 'LAB_ISSUE' | 'PLACEMENT_HELP';
  subject: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  created_at: string;
}

interface OperationsDashboardProps {
  initialTab?: 'overview' | 'students' | 'batches' | 'mentors' | 'attendance' | 'assignments' | 'payments' | 'support' | 'colleges' | 'reports';
}

export const OperationsDashboard: React.FC<OperationsDashboardProps> = ({ initialTab = 'overview' }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Tab State
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'batches' | 'mentors' | 'attendance' | 'assignments' | 'payments' | 'support' | 'colleges' | 'reports'>(initialTab);

  // Data States
  const [batches, setBatches] = useState<Batch[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [interventions, setInterventions] = useState<MentorIntervention[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isCreateBatchModalOpen, setIsCreateBatchModalOpen] = useState(false);
  const [newBatchName, setNewBatchName] = useState('');
  const [newBatchCode, setNewBatchCode] = useState('');
  const [newBatchTrack, setNewBatchTrack] = useState('Full Stack Cloud Architecture');
  const [newBatchMentor, setNewBatchMentor] = useState('Dr. Priya Varma');
  const [newBatchCollege, setNewBatchCollege] = useState('');
  const [isCreatingBatch, setIsCreatingBatch] = useState(false);

  // Remedial / Support Response Modal
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketResolutionNote, setTicketResolutionNote] = useState('');
  const [ticketStatusUpdate, setTicketStatusUpdate] = useState<'RESOLVED' | 'IN_PROGRESS'>('RESOLVED');

  // URL Route Synchronization
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/operations/students')) {
      setActiveTab('students');
    } else if (path.includes('/operations/batches')) {
      setActiveTab('batches');
    } else if (path.includes('/operations/mentors')) {
      setActiveTab('mentors');
    } else if (path.includes('/operations/attendance')) {
      setActiveTab('attendance');
    } else if (path.includes('/operations/assignments')) {
      setActiveTab('assignments');
    } else if (path.includes('/operations/payments')) {
      setActiveTab('payments');
    } else if (path.includes('/operations/support') || path.includes('/operations/at-risk')) {
      setActiveTab('support');
    } else if (path.includes('/operations/colleges')) {
      setActiveTab('colleges');
    } else if (path.includes('/operations/reports')) {
      setActiveTab('reports');
    } else if (path === '/operations' || path === '/operations/') {
      setActiveTab('overview');
    } else if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [location.pathname, initialTab]);

  const handleTabSelect = (tab: typeof activeTab) => {
    setActiveTab(tab);
    navigate(`/operations/${tab === 'overview' ? '' : tab}`);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Batches & Interventions
      const b = await operationsService.getBatches(user?.dataScope);
      setBatches(b);

      const interv = await operationsService.getInterventions();
      setInterventions(interv);

      // 2. Students
      const stu = await studentService.getStudents(user?.dataScope);
      setStudents(stu);

      // 3. Assigned Colleges
      const cols = await collegeService.getColleges();
      setColleges(cols);
      if (cols.length > 0 && !newBatchCollege) {
        setNewBatchCollege(cols[0].id);
      }

      // 4. Mock Payments Data
      setPayments([
        { id: 'pay-1', student_name: 'Rahul Sharma', roll_number: '961822CS01', college_name: 'Ponjesly College of Engineering', amount: 15000, status: 'VERIFIED', payment_method: 'UPI / Razorpay', transaction_ref: 'TXN_9874839', created_at: '2026-08-18' },
        { id: 'pay-2', student_name: 'Sneha Patel', roll_number: '961822IT04', college_name: 'Ponjesly College of Engineering', amount: 15000, status: 'VERIFIED', payment_method: 'Net Banking', transaction_ref: 'TXN_4837291', created_at: '2026-08-17' },
        { id: 'pay-3', student_name: 'Aditya Varma', roll_number: '961822CS12', college_name: 'Apex Institute of Technology', amount: 15000, status: 'PENDING', payment_method: 'Direct Bank Transfer', transaction_ref: 'TXN_2910384', created_at: '2026-08-19' },
        { id: 'pay-4', student_name: 'Kavita Menon', roll_number: '961822EC08', college_name: 'Apex Institute of Technology', amount: 15000, status: 'OVERDUE', payment_method: 'Pending Invoice', transaction_ref: 'INV_PENDING_04', created_at: '2026-08-10' },
      ]);

      // 5. Support & Intervention Tickets
      setTickets([
        { id: 't-101', student_name: 'Kavita Menon', roll_number: '961822EC08', college_name: 'Apex Institute of Technology', category: 'ATTENDANCE_DISCREPANCY', subject: 'Missed daily 40m sync due to campus exam conflict', priority: 'HIGH', status: 'OPEN', created_at: '2026-08-19' },
        { id: 't-102', student_name: 'Aditya Varma', roll_number: '961822CS12', college_name: 'Apex Institute of Technology', category: 'LAB_ISSUE', subject: 'Docker container timeout in Cloud Architecture Lab #4', priority: 'MEDIUM', status: 'IN_PROGRESS', created_at: '2026-08-18' },
        { id: 't-103', student_name: 'Vikram Singh', roll_number: '961822IT09', college_name: 'Ponjesly College of Engineering', category: 'PLACEMENT_HELP', subject: 'Mock Interview scheduling request with Senior Mentor', priority: 'MEDIUM', status: 'RESOLVED', created_at: '2026-08-16' },
      ]);
    } catch (err) {
      console.error('loadData exception in OperationsDashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Realtime backend sync
  useEffect(() => {
    const channel = supabase
      .channel('operations-realtime-sub')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'batches' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mentor_interventions' }, () => loadData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Calculations
  const totalStudents = students.length;
  const avgAttendance = totalStudents > 0
    ? Math.round(students.reduce((acc, s) => acc + (s.attendancePercent || 0), 0) / totalStudents)
    : 0;
  const atRiskStudents = students.filter(
    s => s.riskStatus === 'STRUGGLING' || s.riskStatus === 'INACTIVE' || s.attendancePercent < 75 || (s.talentScore?.overallScore || 0) < 600
  );
  const openTickets = tickets.filter(t => t.status !== 'RESOLVED');

  const handleCreateBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingBatch(true);
    try {
      const selectedCol = colleges.find(c => c.id === newBatchCollege) || colleges[0];
      const created = await operationsService.createBatch({
        collegeId: selectedCol?.id || 'col-apex',
        name: newBatchName,
        code: newBatchCode.toUpperCase(),
        trackName: newBatchTrack,
        mentorName: newBatchMentor,
        coordinatorName: selectedCol?.adminName || 'College Admin',
        startDate: '2026-09-01',
        endDate: '2026-12-31',
      });

      if (created) {
        setBatches(prev => [created, ...prev]);
      }
      setIsCreateBatchModalOpen(false);
      setNewBatchName('');
      setNewBatchCode('');
    } catch (err) {
      console.error('Error creating batch:', err);
    } finally {
      setIsCreatingBatch(false);
    }
  };

  const handleResolveTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setTickets(prev =>
      prev.map(t => (t.id === selectedTicket.id ? { ...t, status: ticketStatusUpdate } : t))
    );
    setSelectedTicket(null);
    setTicketResolutionNote('');
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Roll Number', 'College', 'Department', 'CGPA', 'Talent Score', 'Technical IRI', 'Attendance %', 'Risk Status'];
    const rows = students.map(s => [
      `"${s.name}"`,
      `"${s.rollNumber}"`,
      `"${s.collegeName}"`,
      `"${s.departmentName}"`,
      s.cgpa,
      s.talentScore?.overallScore || 0,
      s.iri?.overallIRI || 0,
      s.attendancePercent,
      s.riskStatus,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SantoGe_Operations_Cohort_Manifest.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredStudents = students.filter(s => {
    const q = searchQuery.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.rollNumber?.toLowerCase().includes(q) ||
      s.collegeName?.toLowerCase().includes(q) ||
      s.departmentName?.toLowerCase().includes(q)
    );
  });

  const studentColumns = [
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
            <p className="text-[11px] font-mono text-slate-500">{s.rollNumber} • {s.collegeName}</p>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'departmentName',
      header: 'Department',
      render: (s: Student) => <span className="text-xs text-slate-700 font-medium">{s.departmentName}</span>,
      sortable: true,
    },
    {
      key: 'talentScore',
      header: 'Talent Score',
      render: (s: Student) => (
        <div className="flex items-center gap-1 font-mono font-bold text-brand-600">
          <Sparkles className="w-3.5 h-3.5" /> {s.talentScore?.overallScore || 0}
        </div>
      ),
      sortable: true,
    },
    {
      key: 'iri',
      header: 'Technical IRI',
      render: (s: Student) => (
        <div className="flex items-center gap-1 font-mono font-bold text-purple-700">
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
      header: 'Inspection',
      render: (s: Student) => (
        <Button size="xs" variant="outline" onClick={() => setSelectedStudent(s)}>
          Inspect Progress
        </Button>
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
              <Layers className="w-3.5 h-3.5" /> Operations Command Center
            </span>
            <Badge variant="primary">Operations Manager</Badge>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Realtime Active
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Learning Operations & Cohort Governance Hub
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Oversee assigned partner colleges, students, batches, mentors, sync attendance, assignments, and support requests across the platform.
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
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsCreateBatchModalOpen(true)}
          >
            Create Batch Cohort
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={handleExportCSV}
          >
            Export Manifest
          </Button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft">
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Total Students</span>
          <span className="text-2xl font-black text-slate-900 font-mono">{totalStudents}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft">
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Active Batches</span>
          <span className="text-2xl font-black text-brand-600 font-mono">{batches.length}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft">
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Assigned Colleges</span>
          <span className="text-2xl font-black text-purple-600 font-mono">{colleges.length}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft">
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Avg Attendance</span>
          <span className={`text-2xl font-black font-mono ${avgAttendance >= 75 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {avgAttendance}%
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft">
          <span className="text-[10px] font-bold uppercase text-slate-500 block">At-Risk Learners</span>
          <span className="text-2xl font-black text-rose-600 font-mono">{atRiskStudents.length}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft">
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Open Support Tickets</span>
          <span className="text-2xl font-black text-amber-600 font-mono">{openTickets.length}</span>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 text-xs overflow-x-auto">
        {[
          { id: 'overview' as const, label: 'Command Overview', icon: <Layers className="w-3.5 h-3.5" /> },
          { id: 'students' as const, label: `Students & Progress (${totalStudents})`, icon: <Users className="w-3.5 h-3.5" /> },
          { id: 'batches' as const, label: `Batches & Cohorts (${batches.length})`, icon: <Compass className="w-3.5 h-3.5" /> },
          { id: 'attendance' as const, label: 'Attendance & Pacing', icon: <FileCheck2 className="w-3.5 h-3.5" /> },
          { id: 'assignments' as const, label: 'Assignments & Labs', icon: <Terminal className="w-3.5 h-3.5" /> },
          { id: 'payments' as const, label: 'Payment Status', icon: <CreditCard className="w-3.5 h-3.5" /> },
          { id: 'support' as const, label: `Support & Interventions (${openTickets.length})`, icon: <LifeBuoy className="w-3.5 h-3.5" /> },
          { id: 'colleges' as const, label: `Assigned Colleges (${colleges.length})`, icon: <Building2 className="w-3.5 h-3.5" /> },
          { id: 'reports' as const, label: 'Operational Reports', icon: <FileText className="w-3.5 h-3.5" /> },
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

      {/* 1. Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Batches Overview */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Compass className="w-4 h-4 text-brand-600" /> Active Placement Cohorts
              </h3>
              <Button variant="ghost" size="xs" onClick={() => handleTabSelect('batches')}>
                View All Batches →
              </Button>
            </div>
            <div className="space-y-3">
              {batches.slice(0, 4).map(b => (
                <div key={b.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900">{b.name}</h4>
                      <p className="text-[11px] text-slate-500">{b.collegeName} • Mentor: <strong>{b.mentorName}</strong></p>
                    </div>
                    <Badge variant="primary" size="sm">{b.code}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
                    <div>Enrolled: <strong className="text-slate-900">{b.totalStudents}</strong></div>
                    <div>Active: <strong className="text-emerald-600">{b.activeToday}</strong></div>
                    <div>Attendance: <strong className="text-brand-600">{b.attendancePercent}%</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Urgent At-Risk / Support Requests */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" /> Priority Remedial Queue
              </h3>
              <Button variant="outline" size="xs" onClick={() => handleTabSelect('support')}>
                Open Support Center →
              </Button>
            </div>
            <div className="space-y-2.5">
              {atRiskStudents.slice(0, 4).map(s => (
                <div key={s.id} className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center uppercase shrink-0">
                      {s.name?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{s.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{s.rollNumber} • {s.collegeName}</p>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-rose-700 font-bold block">{s.attendancePercent}% Att.</span>
                    <span className="text-[10px] text-slate-500">Score: {s.talentScore?.overallScore || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Students & Progress Tab */}
      {activeTab === 'students' && (
        <DataTable
          columns={studentColumns}
          data={filteredStudents}
          searchPlaceholder="Search students across all assigned colleges..."
        />
      )}

      {/* 3. Batches & Cohorts Tab */}
      {activeTab === 'batches' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Batch Cohort Operations</h3>
              <p className="text-xs text-slate-500">Manage placement cohort pacing, mentor assignment, and completion targets.</p>
            </div>
            <Button
              size="sm"
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsCreateBatchModalOpen(true)}
            >
              + Create New Batch
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {batches.map(b => (
              <div key={b.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-soft space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base">{b.name}</h4>
                    <p className="text-xs text-brand-600 font-medium">{b.trackName}</p>
                  </div>
                  <Badge variant="primary" size="sm">{b.code}</Badge>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <p className="text-slate-600">🏛️ College: <strong>{b.collegeName}</strong></p>
                  <p className="text-slate-600">🧑‍🏫 Mentor: <strong>{b.mentorName}</strong></p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono pt-1">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <span className="text-[10px] text-slate-500 block">Enrolled</span>
                    <span className="font-bold text-slate-900">{b.totalStudents}</span>
                  </div>
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <span className="text-[10px] text-slate-500 block">Active</span>
                    <span className="font-bold text-emerald-600">{b.activeToday}</span>
                  </div>
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <span className="text-[10px] text-slate-500 block">Attendance</span>
                    <span className="font-bold text-brand-600">{b.attendancePercent}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Attendance & Pacing Tab */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold">
              <FileCheck2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Daily 40-Minute Placement Sync: {avgAttendance}% overall cohort attendance across platform.</span>
            </div>
            <Badge variant="success">Synchronized</Badge>
          </div>

          <DataTable
            columns={studentColumns}
            data={students.filter(s => s.attendancePercent < 75)}
            searchPlaceholder="Search attendance defaulters (< 75%)..."
          />
        </div>
      )}

      {/* 5. Assignments & Labs Tab */}
      {activeTab === 'assignments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-soft space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Terminal className="w-4 h-4 text-brand-600" /> Interactive Lab Milestones
            </h3>
            <p className="text-xs text-slate-500">Live student execution across cloud environments, debugging clinics, and DSA challenges.</p>
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
                <span>Cloud & Containerization Labs</span>
                <Badge variant="success">88% Completed</Badge>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
                <span>SQL & Data Pipeline Clinic</span>
                <Badge variant="primary">92% Completed</Badge>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
                <span>Core CS & OS Simulator</span>
                <Badge variant="warning">74% Completed</Badge>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-soft space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-600" /> Weekly Project Studio Submissions
            </h3>
            <p className="text-xs text-slate-500">Capstone industry projects verified through automated linting and code quality scans.</p>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
              <span className="text-3xl font-black text-slate-900 font-mono">142</span>
              <p className="text-xs text-slate-600 font-semibold">Projects Submitted for Review This Sprint</p>
            </div>
          </div>
        </div>
      )}

      {/* 6. Payment Status Tab */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-blue-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold">
              <CreditCard className="w-5 h-5 text-blue-600 shrink-0" />
              <span>Student Registration & Fee Status Monitoring (Read-Only Operational View).</span>
            </div>
            <Badge variant="primary">{payments.length} Records Tracked</Badge>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-soft">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Student Name</th>
                  <th className="p-3.5">Roll Number</th>
                  <th className="p-3.5">College</th>
                  <th className="p-3.5 text-right">Fee Amount</th>
                  <th className="p-3.5">Txn Reference</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-xs">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 font-sans">
                    <td className="p-3.5 font-bold text-slate-900">{p.student_name}</td>
                    <td className="p-3.5 font-mono text-slate-600">{p.roll_number}</td>
                    <td className="p-3.5 text-slate-600">{p.college_name}</td>
                    <td className="p-3.5 font-mono text-right font-bold text-slate-900">₹{p.amount.toLocaleString()}</td>
                    <td className="p-3.5 font-mono text-slate-500">{p.transaction_ref}</td>
                    <td className="p-3.5 text-center">
                      <Badge
                        variant={
                          p.status === 'VERIFIED' ? 'success' : p.status === 'PENDING' ? 'warning' : 'danger'
                        }
                        size="sm"
                      >
                        {p.status}
                      </Badge>
                    </td>
                    <td className="p-3.5 font-mono text-right text-slate-500">{p.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. Support & Interventions Tab */}
      {activeTab === 'support' && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold">
              <LifeBuoy className="w-5 h-5 text-amber-600 shrink-0" />
              <span>Student Support & Escalation Queue: Assist learners with attendance, labs, and mentoring.</span>
            </div>
            <Badge variant="warning">{openTickets.length} Action Items</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tickets.map(t => (
              <div key={t.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-soft space-y-3">
                <div className="flex justify-between items-start">
                  <Badge variant={t.priority === 'HIGH' ? 'danger' : 'primary'} size="sm">
                    {t.priority} PRIORITY
                  </Badge>
                  <Badge variant={t.status === 'RESOLVED' ? 'success' : 'warning'} size="sm">
                    {t.status}
                  </Badge>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-xs">{t.subject}</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Student: <strong>{t.student_name}</strong> ({t.roll_number})</p>
                  <p className="text-[10px] text-slate-400">{t.college_name}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-[10px] text-slate-400 font-mono">{t.created_at}</span>
                  {t.status !== 'RESOLVED' && (
                    <Button size="xs" variant="primary" onClick={() => setSelectedTicket(t)}>
                      Respond & Resolve
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. Assigned Colleges Tab */}
      {activeTab === 'colleges' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {colleges.map(c => (
            <div key={c.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-soft space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">{c.name}</h4>
                  <p className="text-xs text-slate-500">{c.city}, {c.state}</p>
                </div>
                <Badge variant="primary" size="sm">{c.code}</Badge>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <p className="text-slate-700">🏛️ Admin: <strong>{c.adminName}</strong></p>
                <p className="text-slate-700">💼 CPO: <strong>{c.placementOfficerName}</strong></p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono pt-1">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">Total Students</span>
                  <span className="font-bold text-slate-900">{c.totalStudents}</span>
                </div>
                <div className="p-2 bg-slate-100 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">Placement %</span>
                  <span className="font-bold text-emerald-600">{c.placementPercentage || 85}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 9. Operational Reports Tab */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-soft space-y-6">
          <div className="flex justify-between items-start border-b border-slate-200 pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block">
                SantoGe Talent Cloud Operations
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-1">
                Platform Operations & Cohort Pacing Audit Report
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Generated by Operations Manager: <strong>{user?.name || user?.email}</strong>
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Printer className="w-4 h-4" />}
              onClick={() => window.print()}
            >
              Print Operations PDF
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl font-mono text-center text-xs">
            <div>
              <span className="text-slate-500 text-[10px] block">Active Cohorts</span>
              <span className="font-bold text-slate-900 text-lg">{batches.length}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Enrolled Students</span>
              <span className="font-bold text-brand-600 text-lg">{totalStudents}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Average Attendance</span>
              <span className="font-bold text-emerald-600 text-lg">{avgAttendance}%</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">At-Risk Interventions</span>
              <span className="font-bold text-rose-600 text-lg">{atRiskStudents.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* 1. Inspect Student Modal Drawer */}
      {selectedStudent && (
        <Modal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          title={`Operational Progress: ${selectedStudent.name}`}
          description={`Roll No: ${selectedStudent.rollNumber} • ${selectedStudent.collegeName} (${selectedStudent.departmentName})`}
          maxWidth="2xl"
        >
          <div className="space-y-5 text-xs">
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

            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
              <span className="font-extrabold text-slate-900 block text-xs uppercase tracking-wide">
                📊 Operational Skill Readiness
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[10px]">Technical</span>
                  <span className="font-bold text-slate-900">{selectedStudent.talentScore?.technicalScore || 780}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[10px]">Placement</span>
                  <span className="font-bold text-slate-900">{selectedStudent.talentScore?.placementScore || 750}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[10px]">Communication</span>
                  <span className="font-bold text-slate-900">{selectedStudent.talentScore?.communicationScore || 720}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[10px]">Aptitude</span>
                  <span className="font-bold text-slate-900">{selectedStudent.talentScore?.aptitudeScore || 740}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="outline" onClick={() => setSelectedStudent(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 2. Create Batch Modal */}
      <Modal
        isOpen={isCreateBatchModalOpen}
        onClose={() => setIsCreateBatchModalOpen(false)}
        title="Create New Placement Batch Cohort"
        description="Provision a synchronized learning cohort pre-assigned to a partner college and mentor."
      >
        <form onSubmit={handleCreateBatchSubmit} className="space-y-4 text-xs">
          <Input
            label="Batch Name"
            value={newBatchName}
            onChange={e => setNewBatchName(e.target.value)}
            placeholder="e.g. 2026 Cloud Architecture Alpha"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Batch Code"
              value={newBatchCode}
              onChange={e => setNewBatchCode(e.target.value)}
              placeholder="e.g. BATCH-2026-CLOUD-A"
              required
            />
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Partner College
              </label>
              <select
                value={newBatchCollege}
                onChange={e => setNewBatchCollege(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-brand-500 outline-none cursor-pointer"
              >
                {colleges.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Career Track
              </label>
              <select
                value={newBatchTrack}
                onChange={e => setNewBatchTrack(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-brand-500 outline-none"
              >
                <option value="Full Stack Cloud Architecture">Full Stack Cloud Architecture</option>
                <option value="Data Science & ML Engineering">Data Science & ML Engineering</option>
                <option value="DevOps & Site Reliability">DevOps & Site Reliability</option>
                <option value="Cybersecurity & Network Defense">Cybersecurity & Network Defense</option>
              </select>
            </div>
            <Input
              label="Assigned Lead Mentor"
              value={newBatchMentor}
              onChange={e => setNewBatchMentor(e.target.value)}
              placeholder="e.g. Dr. Priya Varma"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsCreateBatchModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isCreatingBatch} leftIcon={<Plus className="w-4 h-4" />}>
              Create Cohort
            </Button>
          </div>
        </form>
      </Modal>

      {/* 3. Respond to Ticket Modal */}
      {selectedTicket && (
        <Modal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          title={`Respond to Support Ticket #${selectedTicket.id}`}
          description={`Student: ${selectedTicket.student_name} • ${selectedTicket.college_name}`}
        >
          <form onSubmit={handleResolveTicket} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-500">Subject</span>
              <p className="font-bold text-slate-900">{selectedTicket.subject}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Status Update
              </label>
              <select
                value={ticketStatusUpdate}
                onChange={e => setTicketStatusUpdate(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-brand-500 outline-none"
              >
                <option value="RESOLVED">Mark as Resolved</option>
                <option value="IN_PROGRESS">Keep in Progress</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Resolution & Guidance Note
              </label>
              <textarea
                value={ticketResolutionNote}
                onChange={e => setTicketResolutionNote(e.target.value)}
                placeholder="Enter notes provided to the student / mentor..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none min-h-[90px]"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setSelectedTicket(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                Submit Resolution
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
