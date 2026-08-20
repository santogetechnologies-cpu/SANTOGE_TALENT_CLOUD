import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { studentService } from '../../services/studentService';
import { supabase } from '../../lib/supabase';
import { Student, RiskStatus } from '../../types/student';
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
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const StudentDirectory: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
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
  const [newStudentDept, setNewStudentDept] = useState('Computer Science & Engineering');
  const [newStudentCGPA, setNewStudentCGPA] = useState('8.2');
  const [newStudentGithub, setNewStudentGithub] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addMessage, setAddMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const data = await studentService.getStudents(
        user?.dataScope,
        riskFilter !== 'ALL' ? { riskStatus: riskFilter } : undefined
      );
      setStudents(data);
    } catch (err) {
      console.error('loadStudents error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [user, riskFilter]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('college-students-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'students' },
        () => loadStudents()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const departmentsList = Array.from(new Set(students.map(s => s.departmentName).filter(Boolean)));

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
      const { data, error } = await (supabase.from('students') as any)
        .insert({
          id: crypto.randomUUID(),
          name: newStudentName.trim(),
          roll_number: newStudentRoll.trim(),
          email: newStudentEmail.trim().toLowerCase(),
          phone: newStudentPhone.trim(),
          department_name: newStudentDept,
          college_id: user?.dataScope?.collegeId || null,
          college_name: user?.dataScope?.collegeName || 'ABC Engineering College',
          cgpa: parseFloat(newStudentCGPA) || 8.0,
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

      setAddMessage({ type: 'success', text: `Student ${newStudentName} added successfully!` });
      setTimeout(() => {
        setIsAddModalOpen(false);
        setNewStudentName('');
        setNewStudentRoll('');
        setNewStudentEmail('');
        setNewStudentPhone('');
        setNewStudentGithub('');
        setAddMessage(null);
        loadStudents();
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
          status: newStatus,
        }
      } : null);

      loadStudents();
    } catch (err) {
      console.error('Error toggling eligibility:', err);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Student & Roll Number',
      render: (s: Student) => (
        <div className="flex items-center gap-3">
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
      key: 'departmentName',
      header: 'Department',
      render: (s: Student) => (
        <div className="text-xs text-slate-700 font-medium max-w-[160px] truncate">
          {s.departmentName}
        </div>
      ),
      sortable: true,
    },
    {
      key: 'cgpa',
      header: 'CGPA',
      render: (s: Student) => (
        <span className="font-mono font-bold text-slate-800 text-xs">{s.cgpa}</span>
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
      key: 'talentScore',
      header: 'Talent Score',
      render: (s: Student) => (
        <span className="font-mono font-extrabold text-brand-600 text-sm">
          {s.talentScore.overallScore} <span className="text-[10px] text-slate-400 font-normal">/1000</span>
        </span>
      ),
      sortable: true,
    },
    {
      key: 'iri',
      header: 'Technical IRI',
      render: (s: Student) => (
        <span className="font-mono font-bold text-emerald-600 text-xs">
          {s.iri.overallIRI}%
        </span>
      ),
      sortable: true,
    },
    {
      key: 'placementReadiness',
      header: 'Placement Status',
      render: (s: Student) => {
        if (s.placementReadiness.offersCount > 0) {
          return <Badge variant="success" size="sm">🎉 {s.placementReadiness.offersCount} Offer(s)</Badge>;
        }
        if (s.talentScore.overallScore >= 800) {
          return <Badge variant="purple" size="sm">⚡ Interview Ready</Badge>;
        }
        return <Badge variant="outline" size="sm">⏳ In Preparation</Badge>;
      },
      sortable: true,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (s: Student) => (
        <Button
          size="xs"
          variant="outline"
          leftIcon={<FileText className="w-3 h-3 text-brand-600" />}
          onClick={() => setSelectedStudent(s)}
        >
          View Profile
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
              <Users className="w-3.5 h-3.5" /> Institutional Talent Directory
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-brand-50 text-brand-700 border border-brand-200">
              {user?.dataScope?.collegeName || 'Isolated College Scope'}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            College Student Placement & Technical Readiness Hub
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Manage candidates, inspect verified talent scores, verify resumes, evaluate GitHub profiles, and govern placement eligibility.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
            onClick={loadStudents}
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<FileCheck2 className="w-4 h-4 text-brand-600" />}
            onClick={() => navigate('/college/import')}
          >
            Bulk Import CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<UserPlus className="w-4 h-4" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Single Student
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Risk Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-600 uppercase">Status:</span>
            <select
              value={riskFilter}
              onChange={e => setRiskFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
            >
              <option value="ALL">All Statuses ({students.length})</option>
              <option value="ON_TRACK">On Track</option>
              <option value="PARTIAL">Partial Risk</option>
              <option value="STRUGGLING">Struggling</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          {/* Department Filter */}
          {departmentsList.length > 0 && (
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-600 uppercase">Department:</span>
              <select
                value={departmentFilter}
                onChange={e => setDepartmentFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
              >
                <option value="ALL">All Departments</option>
                {departmentsList.map(dept => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Showing <span className="font-bold text-slate-900">{filteredStudents.length}</span> students
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredStudents}
        searchPlaceholder="Search candidates by name, roll number, or skill..."
      />

      {/* 1. Student Profile Modal / Drawer */}
      {selectedStudent && (
        <Modal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          title={`Verified Talent Profile: ${selectedStudent.name}`}
          description={`Roll Number: ${selectedStudent.rollNumber} • ${selectedStudent.departmentName}`}
          maxWidth="2xl"
        >
          <div className="space-y-5 text-xs">
            {/* KPI Banner */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Talent Score</span>
                <span className="text-2xl font-black font-mono text-brand-600">{selectedStudent.talentScore.overallScore}</span>
                <span className="text-[10px] text-slate-400 block font-mono">Rank Tier: Top 10%</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Industry Readiness</span>
                <span className="text-2xl font-black font-mono text-emerald-600">{selectedStudent.iri.overallIRI}%</span>
                <span className="text-[10px] text-emerald-600 block font-mono font-bold">✓ Ready</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Academic CGPA</span>
                <span className="text-2xl font-black font-mono text-slate-900">{selectedStudent.cgpa}</span>
                <span className="text-[10px] text-slate-400 block font-mono">Class of {selectedStudent.graduationYear}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Attendance</span>
                <span className={`text-2xl font-black font-mono ${selectedStudent.attendancePercent >= 75 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {selectedStudent.attendancePercent}%
                </span>
                <span className="text-[10px] text-slate-500 block font-mono">Streak: {selectedStudent.streakDays}d</span>
              </div>
            </div>

            {/* Talent Scores Breakdown */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
              <span className="font-extrabold text-slate-900 block text-xs uppercase tracking-wide">
                📊 Talent Score Breakdown (0–1000 Scale)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[10px]">Technical Score</span>
                  <span className="font-bold text-slate-900">{selectedStudent.talentScore.technicalScore || 780} / 1000</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[10px]">Placement Readiness</span>
                  <span className="font-bold text-slate-900">{selectedStudent.talentScore.placementScore || 750} / 1000</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[10px]">Communication</span>
                  <span className="font-bold text-slate-900">{selectedStudent.talentScore.communicationScore || 720} / 1000</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[10px]">Aptitude & Logic</span>
                  <span className="font-bold text-slate-900">{selectedStudent.talentScore.aptitudeScore || 740} / 1000</span>
                </div>
              </div>
            </div>

            {/* Verified Skills */}
            <div>
              <span className="font-extrabold text-slate-900 block mb-2 text-xs uppercase tracking-wide">
                Verified Technical Competencies
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedStudent.skills.map(sk => (
                  <span key={sk.name} className="px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-200 font-mono text-slate-800 flex items-center gap-1.5 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <strong>{sk.name}</strong> ({sk.score}/100)
                  </span>
                ))}
              </div>
            </div>

            {/* GitHub & Contact Bar */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-slate-500 text-[10px] uppercase font-bold flex items-center gap-1">
                  <Github className="w-3.5 h-3.5 text-slate-700" /> GitHub Profile & Activity
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
                <p className="text-[10px] text-slate-500 font-mono">
                  {selectedStudent.githubStats?.repos || 12} Repositories • {selectedStudent.githubStats?.commitsThisMonth || 48} Commits • Code Quality: {selectedStudent.githubStats?.qualityRating || 'A'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 text-[10px] uppercase font-bold flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-700" /> Contact Details
                </span>
                <p className="font-semibold text-slate-900 font-mono">{selectedStudent.email}</p>
                <p className="text-slate-500 font-mono text-[11px]">{selectedStudent.phone || 'Phone not set'}</p>
              </div>
            </div>

            {/* Placement Eligibility & Action Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={selectedStudent.placementReadiness.status === 'InterviewReady' ? 'outline' : 'success'}
                  onClick={() => handleTogglePlacementEligibility(selectedStudent)}
                >
                  {selectedStudent.placementReadiness.status === 'InterviewReady'
                    ? 'Revoke Drive Eligibility'
                    : '⚡ Grant Placement Eligibility'}
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedStudent(null)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<FileText className="w-4 h-4" />}
                  onClick={() => {
                    alert(`Downloading ATS Resume for ${selectedStudent.name} (Roll: ${selectedStudent.rollNumber}). Verified by SantoGe Placement Engine.`);
                  }}
                >
                  Download ATS Resume
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* 2. Add Single Student Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Single Student to College"
        description={`Directly provision a student record isolated to ${user?.dataScope?.collegeName || 'your college'}.`}
      >
        <form onSubmit={handleAddStudent} className="space-y-4 text-xs">
          <Input
            label="Full Name"
            value={newStudentName}
            onChange={e => setNewStudentName(e.target.value)}
            placeholder="e.g. Ananya Sharma"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Roll Number / Student ID"
              value={newStudentRoll}
              onChange={e => setNewStudentRoll(e.target.value)}
              placeholder="e.g. 2026-CSE-042"
              required
            />
            <Input
              label="Academic CGPA"
              type="number"
              step="0.01"
              value={newStudentCGPA}
              onChange={e => setNewStudentCGPA(e.target.value)}
              placeholder="8.5"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Department
            </label>
            <select
              value={newStudentDept}
              onChange={e => setNewStudentDept(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-brand-500 outline-none"
            >
              <option value="Computer Science & Engineering">Computer Science & Engineering</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics & Communication">Electronics & Communication</option>
              <option value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
            </select>
          </div>

          <Input
            label="Email Address"
            type="email"
            value={newStudentEmail}
            onChange={e => setNewStudentEmail(e.target.value)}
            placeholder="ananya@apextech.edu"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Phone Number"
              value={newStudentPhone}
              onChange={e => setNewStudentPhone(e.target.value)}
              placeholder="+91 98765 43210"
            />
            <Input
              label="GitHub Username"
              value={newStudentGithub}
              onChange={e => setNewStudentGithub(e.target.value)}
              placeholder="e.g. ananya-dev"
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
