import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { studentService } from '../../services/studentService';
import { Student, RiskStatus } from '../../types/student';
import { DataTable } from '../../components/shared/DataTable';
import { RiskBadge } from '../../components/shared/RiskBadge';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
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
} from 'lucide-react';

export const StudentDirectory: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [riskFilter, setRiskFilter] = useState<RiskStatus | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await studentService.getStudents(
        user?.dataScope,
        riskFilter !== 'ALL' ? { riskStatus: riskFilter } : undefined
      );
      setStudents(data);
      setLoading(false);
    };
    load();
  }, [user, riskFilter]);

  const columns = [
    {
      key: 'name',
      header: 'Student Name & Roll',
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
      render: (s: Student) => <span className="text-xs text-slate-700">{s.departmentName}</span>,
      sortable: true,
    },
    {
      key: 'talentScore',
      header: 'Talent Score',
      render: (s: Student) => (
        <span className="font-mono font-bold text-brand-600 text-sm">
          {s.talentScore.overallScore} / 1000
        </span>
      ),
      sortable: true,
    },
    {
      key: 'iri',
      header: 'IRI Score',
      render: (s: Student) => (
        <span className="font-mono font-bold text-emerald-600">
          {s.iri.overallIRI}%
        </span>
      ),
      sortable: true,
    },
    {
      key: 'cgpa',
      header: 'CGPA',
      render: (s: Student) => <span className="font-mono font-semibold text-slate-800">{s.cgpa}</span>,
      sortable: true,
    },
    {
      key: 'riskStatus',
      header: 'Status',
      render: (s: Student) => <RiskBadge status={s.riskStatus} />,
      sortable: true,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (s: Student) => (
        <Button size="xs" variant="outline" onClick={() => setSelectedStudent(s)}>
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
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1.5 mb-1">
            <Users className="w-3.5 h-3.5" /> Institutional Talent Directory
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Student Placement Readiness Repository
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Scoped to: <strong className="text-slate-900">{user?.dataScope.collegeName || 'All Colleges'}</strong>
            {user?.dataScope.departmentNames && ` • Dept: ${user.dataScope.departmentNames.join(', ')}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />}>
            Export CSV Manifest
          </Button>
        </div>
      </div>

      {/* Risk Filter Bar */}
      <div className="flex gap-2 text-xs">
        {(['ALL', 'ON_TRACK', 'PARTIAL', 'STRUGGLING', 'INACTIVE'] as const).map(rf => (
          <button
            key={rf}
            onClick={() => setRiskFilter(rf)}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer ${
              riskFilter === rf
                ? 'bg-slate-900 text-white shadow-soft-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {rf === 'ALL' ? 'All Students' : rf.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={students}
        searchPlaceholder="Search candidate by name, roll number, or skill..."
      />

      {/* Student Profile Modal */}
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
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-3 gap-4 text-center">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Talent Score</span>
                <span className="text-2xl font-bold font-mono text-brand-600">{selectedStudent.talentScore.overallScore}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Industry Readiness (IRI)</span>
                <span className="text-2xl font-bold font-mono text-emerald-600">{selectedStudent.iri.overallIRI}%</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Academic CGPA</span>
                <span className="text-2xl font-bold font-mono text-slate-900">{selectedStudent.cgpa}</span>
              </div>
            </div>

            {/* Verified Skills */}
            <div>
              <span className="font-bold text-slate-900 block mb-2">Verified Competencies:</span>
              <div className="flex flex-wrap gap-2">
                {selectedStudent.skills.map(sk => (
                  <span key={sk.name} className="px-2.5 py-1 bg-white rounded-lg border border-slate-200 font-mono text-slate-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {sk.name} ({sk.score}/100)
                  </span>
                ))}
              </div>
            </div>

            {/* Contact Details */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-500 text-[10px]">Email</span>
                <p className="font-semibold text-slate-900">{selectedStudent.email}</p>
              </div>
              <div>
                <span className="text-slate-500 text-[10px]">Phone</span>
                <p className="font-semibold text-slate-900">{selectedStudent.phone}</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="outline" onClick={() => setSelectedStudent(null)}>
                Close
              </Button>
              <Button variant="primary" leftIcon={<FileText className="w-4 h-4" />}>
                Download ATS Resume
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
