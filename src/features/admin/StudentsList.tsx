import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { studentService } from '../../services/studentService';
import { Student } from '../../types/student';
import { DataTable } from '../../components/shared/DataTable';
import { RiskBadge } from '../../components/shared/RiskBadge';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Users, Key, RefreshCw, Download, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const StudentsList: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [resetModalStudent, setResetModalStudent] = useState<Student | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const data = await studentService.getStudents();
      setStudents(data);
    };
    load();
  }, []);

  const handleResetPassword = () => {
    setResetSuccess(true);
    setTimeout(() => {
      setResetSuccess(false);
      setResetModalStudent(null);
    }, 1500);
  };

  const columns = [
    {
      key: 'name',
      header: 'Student Name & Roll',
      render: (s: Student) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center uppercase shrink-0">
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
      key: 'collegeName',
      header: 'College',
      render: (s: Student) => <span className="text-xs text-slate-700">{s.collegeName}</span>,
      sortable: true,
    },
    {
      key: 'departmentName',
      header: 'Department',
      render: (s: Student) => <span className="text-xs text-slate-600">{s.departmentName}</span>,
      sortable: true,
    },
    {
      key: 'talentScore',
      header: 'Talent Score',
      render: (s: Student) => <span className="font-mono font-bold text-brand-600 text-sm">{s.talentScore.overallScore}</span>,
      sortable: true,
    },
    {
      key: 'iri',
      header: 'IRI %',
      render: (s: Student) => <span className="font-mono font-bold text-emerald-600">{s.iri.overallIRI}%</span>,
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
        <Button size="xs" variant="outline" leftIcon={<Key className="w-3 h-3" />} onClick={() => setResetModalStudent(s)}>
          Reset Password
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
            <Users className="w-3.5 h-3.5" /> Platform Governance
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Global Student Talent Directory (All Colleges)
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Full platform-wide student management, credential provisioning, course track allocations, and activation states.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={() => navigate('/admin/bulk-import')}>
            Bulk Student Import Wizard
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={students}
        searchPlaceholder="Search all platform students by name, email, roll number, or college..."
      />

      {/* Reset Password Modal */}
      {resetModalStudent && (
        <Modal
          isOpen={!!resetModalStudent}
          onClose={() => setResetModalStudent(null)}
          title={`Reset Credentials: ${resetModalStudent.name}`}
          description={`Email: ${resetModalStudent.email} • ${resetModalStudent.collegeName}`}
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Generating a new temporary password will invalidate current login sessions and require the student to establish a new password upon first login.
            </p>
            {resetSuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200 text-center font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Temporary credentials sent to {resetModalStudent.email}
              </div>
            ) : (
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setResetModalStudent(null)}>Cancel</Button>
                <Button variant="danger" onClick={handleResetPassword}>Generate & Dispatch Temporary Password</Button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
