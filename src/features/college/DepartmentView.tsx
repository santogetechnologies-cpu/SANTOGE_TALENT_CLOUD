import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useScope } from '../../contexts/ScopeContext';
import { studentService } from '../../services/studentService';
import { Student } from '../../types/student';
import { StatCard } from '../../components/shared/StatCard';
import { DataTable } from '../../components/shared/DataTable';
import { RiskBadge } from '../../components/shared/RiskBadge';
import { Badge } from '../../components/ui/Badge';
import { Building2, Users, Award, ShieldAlert, Sparkles } from 'lucide-react';

export const DepartmentView: React.FC = () => {
  const { user } = useAuth();
  const { activeDepartment } = useScope();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await studentService.getStudents(user?.dataScope);
      setStudents(data);
      setLoading(false);
    };
    load();
  }, [user]);

  const atRisk = students.filter(s => s.riskStatus === 'STRUGGLING' || s.riskStatus === 'INACTIVE');

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
      key: 'talentScore',
      header: 'Talent Score',
      render: (s: Student) => <span className="font-mono font-bold text-brand-600">{s.talentScore.overallScore}</span>,
      sortable: true,
    },
    {
      key: 'iri',
      header: 'IRI Score',
      render: (s: Student) => <span className="font-mono font-bold text-emerald-600">{s.iri.overallIRI}%</span>,
      sortable: true,
    },
    {
      key: 'streakDays',
      header: 'Daily Streak',
      render: (s: Student) => <span className="font-mono font-bold text-amber-600">{s.streakDays}d</span>,
      sortable: true,
    },
    {
      key: 'riskStatus',
      header: 'Status',
      render: (s: Student) => <RiskBadge status={s.riskStatus} />,
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
              <Building2 className="w-3.5 h-3.5" /> Department Coordinator Portal
            </span>
            <Badge variant="primary">Strict Scoped View</Badge>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {activeDepartment?.name || 'Computer Science & Engineering'} ({activeDepartment?.code || 'CSE'})
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Isolated Department Scope: Coordinator {user?.name} can monitor only assigned department talent.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={students.length}
          subtitle="Enrolled in Department"
          icon={<Users className="w-5 h-5" />}
          iconBgColor="bg-brand-50 text-brand-600"
        />
        <StatCard
          title="Average Talent Score"
          value="785"
          subtitle="Department Benchmark"
          icon={<Award className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Placement Eligible"
          value={students.filter(s => s.talentScore.overallScore >= 700).length}
          subtitle="Meets ≥ 700 Cutoff"
          icon={<Sparkles className="w-5 h-5" />}
          iconBgColor="bg-violet-50 text-violet-600"
        />
        <StatCard
          title="At-Risk Students"
          value={atRisk.length}
          subtitle="Requires Intervention"
          icon={<ShieldAlert className="w-5 h-5" />}
          iconBgColor="bg-rose-50 text-rose-600"
        />
      </div>

      {/* Scoped Student Table */}
      <DataTable
        columns={columns}
        data={students}
        searchPlaceholder="Filter department candidates..."
      />
    </div>
  );
};
