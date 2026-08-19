import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useScope } from '../../contexts/ScopeContext';
import { collegeService } from '../../services/collegeService';
import { studentService } from '../../services/studentService';
import { College } from '../../types/college';
import { Student } from '../../types/student';
import { StatCard } from '../../components/shared/StatCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PlacementFunnel } from '../../components/charts/PlacementFunnel';
import {
  Building2,
  Users,
  Award,
  DollarSign,
  Briefcase,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CollegeDashboard: React.FC = () => {
  const { user } = useAuth();
  const { activeCollege } = useScope();
  const [college, setCollege] = useState<College | null>(activeCollege);
  const [students, setStudents] = useState<Student[]>([]);
  const [atRiskStudents, setAtRiskStudents] = useState<Student[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const col = await collegeService.getCollegeById(user?.dataScope.collegeId || activeCollege?.id || 'col-apex');
      const stu = await studentService.getStudents(user?.dataScope);
      const risk = await studentService.getAtRiskStudents(user?.dataScope);
      setCollege(col);
      setStudents(stu);
      setAtRiskStudents(risk);
    };
    load();
  }, [user, activeCollege]);

  if (!college) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> College Placement Operating System (CPOS)
            </span>
            <Badge variant="primary">{college.code}</Badge>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {college.name}
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Location: {college.city}, {college.state} • CPO: {college.placementOfficerName} ({college.placementOfficerEmail})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="primary" size="sm" onClick={() => navigate('/placement/drives')}>
            Manage Campus Drives
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Placement Rate"
          value={`${college.placementPercentage}%`}
          subtitle={`${college.placedCount} / ${college.totalStudents} Placed`}
          icon={<Award className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 text-emerald-600"
          change="+4.2%"
          changeType="positive"
        />
        <StatCard
          title="Average CTC (LPA)"
          value={`₹${college.averagePackageLPA} L`}
          subtitle={`Highest: ₹${college.highestPackageLPA} LPA`}
          icon={<DollarSign className="w-5 h-5" />}
          iconBgColor="bg-brand-50 text-brand-600"
          change="+12.5%"
          changeType="positive"
        />
        <StatCard
          title="Companies Visited"
          value={college.companiesVisitedCount}
          subtitle={`${college.offersGeneratedCount} Total Offers Released`}
          icon={<Briefcase className="w-5 h-5" />}
          iconBgColor="bg-violet-50 text-violet-600"
        />
        <StatCard
          title="At-Risk Students"
          value={atRiskStudents.length}
          subtitle="Attendance < 75% or Low Streak"
          icon={<ShieldAlert className="w-5 h-5" />}
          iconBgColor="bg-rose-50 text-rose-600"
          changeType="negative"
          onClick={() => navigate('/college/students')}
        />
      </div>

      {/* Placement Funnel & Department Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Placement Funnel Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Campus Placement Funnel</h3>
              <p className="text-xs text-slate-500">Student progression from drive eligibility to offer letters</p>
            </div>
            <Badge variant="primary">2026 Batch</Badge>
          </div>
          <PlacementFunnel />
        </div>

        {/* Department Performance Cards */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Department Performance & Rankings</h3>
              <p className="text-xs text-slate-500">Placement percentage and average Talent Scores by branch</p>
            </div>
            <Button variant="ghost" size="xs" onClick={() => navigate('/college/departments')}>
              View All
            </Button>
          </div>

          <div className="space-y-3">
            {college.departments.map(dept => (
              <div
                key={dept.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs hover:bg-slate-100/80 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{dept.name}</span>
                    <span className="font-mono text-[10px] text-slate-500">({dept.code})</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Coordinator: {dept.coordinatorName}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-emerald-600 text-sm">{dept.placementRate}% Placed</span>
                  <p className="text-[10px] text-slate-500">Avg Talent Score: <strong className="text-slate-900">{dept.averageTalentScore}</strong></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
