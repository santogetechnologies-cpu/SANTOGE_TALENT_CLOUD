import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { operationsService } from '../../services/operationsService';
import { studentService } from '../../services/studentService';
import { Batch } from '../../types/operations';
import { Student } from '../../types/student';
import { StatCard } from '../../components/shared/StatCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import {
  Layers,
  Users,
  Compass,
  ShieldAlert,
  FileCheck2,
  PhoneCall,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const OperationsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [atRiskStudents, setAtRiskStudents] = useState<Student[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const b = await operationsService.getBatches(user?.dataScope);
      const risk = await studentService.getAtRiskStudents(user?.dataScope);
      setBatches(b);
      setAtRiskStudents(risk);
    };
    load();
  }, [user]);

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
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Learning Operations & Cohort Pacing
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Monitor daily sync attendance across batches, manage mentor clinic queues, and intervene on at-risk learners.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/operations/at-risk')}
        >
          View At-Risk Student Center ({atRiskStudents.length})
        </Button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Batches"
          value={batches.length}
          subtitle="Synchronized Placement Cohorts"
          icon={<Compass className="w-5 h-5" />}
          iconBgColor="bg-brand-50 text-brand-600"
          onClick={() => navigate('/operations/batches')}
        />
        <StatCard
          title="At-Risk Learners"
          value={atRiskStudents.length}
          subtitle="Struggling or Inactive"
          icon={<ShieldAlert className="w-5 h-5" />}
          iconBgColor="bg-rose-50 text-rose-600"
          onClick={() => navigate('/operations/at-risk')}
        />
        <StatCard
          title="Daily Sync Rate"
          value="91.8%"
          subtitle="40m Placement Cycle Completed"
          icon={<FileCheck2 className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Mentor Interventions"
          value="14 Logged"
          subtitle="This Month"
          icon={<Users className="w-5 h-5" />}
          iconBgColor="bg-violet-50 text-violet-600"
          onClick={() => navigate('/operations/mentors')}
        />
      </div>

      {/* Batch Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Cohort Execution Overview</h3>
            <Button variant="ghost" size="xs" onClick={() => navigate('/operations/batches')}>
              Manage All
            </Button>
          </div>

          <div className="space-y-3">
            {batches.map(b => (
              <div key={b.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-900">{b.name}</h4>
                    <p className="text-[11px] text-slate-500">{b.collegeName} • Mentor: {b.mentorName}</p>
                  </div>
                  <Badge variant="primary" size="sm">{b.code}</Badge>
                </div>
                <div className="flex justify-between text-xs pt-1 font-mono text-slate-700">
                  <span>Enrolled: {b.totalStudents}</span>
                  <span>Active Today: <strong className="text-emerald-600">{b.activeToday}</strong></span>
                  <span>Attendance: <strong className="text-brand-600">{b.attendancePercent}%</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* High Priority At-Risk Queue */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Priority At-Risk Queue</h3>
            <Button variant="outline" size="xs" onClick={() => navigate('/operations/at-risk')}>
              Open Full Queue →
            </Button>
          </div>

          <div className="space-y-2.5">
            {atRiskStudents.slice(0, 4).map(s => (
              <div key={s.id} className="p-3 rounded-xl border border-rose-200 bg-rose-50/40 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center uppercase shrink-0">
                    {s.name?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900">{s.name}</span>
                    <span className="text-[10px] text-slate-500 block">{s.collegeName} ({s.departmentName})</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                    {s.riskStatus}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-0.5">Attendance: {s.attendancePercent}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
