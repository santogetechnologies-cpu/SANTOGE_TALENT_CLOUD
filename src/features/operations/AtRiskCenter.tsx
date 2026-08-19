import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { studentService } from '../../services/studentService';
import { Student } from '../../types/student';
import { DataTable } from '../../components/shared/DataTable';
import { RiskBadge } from '../../components/shared/RiskBadge';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { StatCard } from '../../components/shared/StatCard';
import {
  ShieldAlert,
  AlertTriangle,
  Flame,
  Users,
  CheckCircle2,
  PhoneCall,
  Sparkles,
} from 'lucide-react';

export const AtRiskCenter: React.FC = () => {
  const { user } = useAuth();
  const [atRiskStudents, setAtRiskStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await studentService.getAtRiskStudents(user?.dataScope);
      setAtRiskStudents(data);
      setLoading(false);
    };
    load();
  }, [user]);

  const columns = [
    {
      key: 'name',
      header: 'Student Name & Roll',
      render: (s: Student) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center uppercase shrink-0">
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
      header: 'College / Batch',
      render: (s: Student) => (
        <div>
          <p className="font-semibold text-slate-800">{s.collegeName}</p>
          <p className="text-[10px] text-slate-500">{s.batchName}</p>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'attendancePercent',
      header: 'Attendance',
      render: (s: Student) => (
        <span className="font-mono font-bold text-rose-600">
          {s.attendancePercent}%
        </span>
      ),
      sortable: true,
    },
    {
      key: 'streakDays',
      header: 'Streak',
      render: (s: Student) => <span className="font-mono font-bold text-slate-700">{s.streakDays}d</span>,
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
        <Button size="xs" variant="primary" leftIcon={<PhoneCall className="w-3 h-3" />}>
          Initiate Remedial Call
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1.5 mb-1">
            <ShieldAlert className="w-3.5 h-3.5" /> Early Warning System
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">
            At-Risk Learner Intervention Center
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Automated detection of students with low attendance, broken consistency streaks, or struggling practice accuracy.
          </p>
        </div>

        <Badge variant="danger" size="md">
          {atRiskStudents.length} Students Require Intervention
        </Badge>
      </div>

      {/* Operational Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Inactive (🔴)"
          value={atRiskStudents.filter(s => s.riskStatus === 'INACTIVE').length}
          subtitle="Zero Logins Past 7 Days"
          icon={<ShieldAlert className="w-5 h-5" />}
          iconBgColor="bg-rose-50 text-rose-600"
        />
        <StatCard
          title="Struggling (🟠)"
          value={atRiskStudents.filter(s => s.riskStatus === 'STRUGGLING').length}
          subtitle="Score Drop or Failed Quizzes"
          icon={<AlertTriangle className="w-5 h-5" />}
          iconBgColor="bg-orange-50 text-orange-600"
        />
        <StatCard
          title="Partial Completion (🟡)"
          value={atRiskStudents.filter(s => s.riskStatus === 'PARTIAL').length}
          subtitle="Missed 40m Placement Cycle"
          icon={<Flame className="w-5 h-5" />}
          iconBgColor="bg-amber-50 text-amber-600"
        />
        <StatCard
          title="Intervention Resolution Rate"
          value="87.5%"
          subtitle="Recovered to On Track"
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* At-Risk Table */}
      <DataTable
        columns={columns}
        data={atRiskStudents}
        searchPlaceholder="Search at-risk students by name or college..."
      />
    </div>
  );
};
