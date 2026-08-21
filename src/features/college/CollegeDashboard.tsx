import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useScope } from '../../contexts/ScopeContext';
import { collegeService } from '../../services/collegeService';
import { studentService } from '../../services/studentService';
import { placementService } from '../../services/placementService';
import { supabase } from '../../lib/supabase';
import { College, CampusDrive } from '../../types/college';
import { Student } from '../../types/student';
import { StatCard } from '../../components/shared/StatCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
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
  FilePlus,
  FileCheck2,
  FileText,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CollegeDashboard: React.FC = () => {
  const { user } = useAuth();
  const { activeCollege } = useScope();
  const [college, setCollege] = useState<College | null>(activeCollege);
  const [students, setStudents] = useState<Student[]>([]);
  const [atRiskStudents, setAtRiskStudents] = useState<Student[]>([]);
  const [drives, setDrives] = useState<CampusDrive[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const collegeId = user?.dataScope?.collegeId || activeCollege?.id;

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch scoped college details
      let col: College | null = null;
      if (collegeId) {
        col = await collegeService.getCollegeById(collegeId);
      }
      if (!col) {
        const allCols = await collegeService.getColleges();
        col = allCols[0] || null;
      }
      setCollege(col);

      // 2. Fetch scoped students and at-risk candidates
      const stu = await studentService.getStudents(user?.dataScope);
      const risk = await studentService.getAtRiskStudents(user?.dataScope);
      setStudents(stu);
      setAtRiskStudents(risk);

      // 3. Fetch campus placement drives
      const activeDrives = await collegeService.getCampusDrives(collegeId);
      setDrives(activeDrives);
    } catch (err) {
      console.error('CollegeDashboard load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, activeCollege]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('college-dashboard-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'students' },
        () => loadData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'placement_drives' },
        () => loadData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (!college) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-soft">
        <Building2 className="w-12 h-12 text-brand-500 mx-auto mb-3 animate-pulse" />
        <h3 className="text-lg font-bold text-slate-900">Loading College Portal...</h3>
        <p className="text-xs text-slate-500 mt-1">Connecting to institutional multi-tenant scope.</p>
      </div>
    );
  }

  // Calculated Real-Time Metrics
  const totalStudentsCount = students.length > 0 ? students.length : college.totalStudents;
  const placedCount = students.filter(s => s.placementReadiness.offersCount > 0).length || college.placedCount;
  const placementRate = totalStudentsCount > 0 ? Math.round((placedCount / totalStudentsCount) * 100) : college.placementPercentage;
  const activeDrivesCount = drives.length > 0 ? drives.filter(d => d.status === 'REGISTRATION_OPEN' || d.status === 'SHORTLISTING' || d.status === 'INTERVIEWING').length : 4;

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
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Isolated Tenant Scope
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {college.name}
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Location: {college.city}, {college.state} • College Super Admin: <strong>{college.adminName || 'Admin'}</strong> ({college.adminEmail || 'admin@college.edu'}) • Placement Officer: <strong>{college.placementOfficerName}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<FileText className="w-4 h-4 text-brand-600" />}
            onClick={() => navigate('/college/reports')}
          >
            Placement Report
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<FilePlus className="w-4 h-4 text-emerald-600" />}
            onClick={() => navigate('/college/import')}
          >
            Add / Import Students
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Award className="w-4 h-4" />}
            onClick={() => navigate('/placement/drives')}
          >
            Create Campus Drive
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Placement Conversion"
          value={`${placementRate}%`}
          subtitle={`${placedCount} / ${totalStudentsCount} Placed`}
          icon={<Award className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 text-emerald-600"
          change="+5.4%"
          changeType="positive"
        />
        <StatCard
          title="Average CTC (LPA)"
          value={`₹${college.averagePackageLPA} LPA`}
          subtitle={`Highest: ₹${college.highestPackageLPA} LPA`}
          icon={<DollarSign className="w-5 h-5" />}
          iconBgColor="bg-brand-50 text-brand-600"
          change="+12.5%"
          changeType="positive"
        />
        <StatCard
          title="Active Placement Drives"
          value={activeDrivesCount}
          subtitle={`${college.companiesVisitedCount} Companies Partnered`}
          icon={<Briefcase className="w-5 h-5" />}
          iconBgColor="bg-violet-50 text-violet-600"
          onClick={() => navigate('/placement/drives')}
        />
        <StatCard
          title="At-Risk Students"
          value={atRiskStudents.length}
          subtitle="Requires Remedial Mentorship"
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
              <p className="text-xs text-slate-500">Student conversion pipeline from eligibility to offers</p>
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
              Manage Departments <ChevronRight className="w-3.5 h-3.5 ml-1" />
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
                  <p className="text-[11px] text-slate-500 mt-0.5">Coordinator: <strong>{dept.coordinatorName}</strong></p>
                </div>

                <div className="flex items-center gap-6 text-right">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Talent Score</span>
                    <span className="font-mono font-bold text-brand-600">{dept.averageTalentScore}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Placement</span>
                    <span className="font-mono font-bold text-emerald-600">{dept.placementRate || 80}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Campus Drives Overview */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Active Campus Placement Drives</h3>
            <p className="text-xs text-slate-500">Current live hiring opportunities with verified eligibility</p>
          </div>
          <Button variant="outline" size="xs" onClick={() => navigate('/placement/drives')}>
            View All Drives <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {drives.slice(0, 3).map(drive => (
            <div
              key={drive.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 transition-colors space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{drive.companyName}</h4>
                  <p className="text-xs text-slate-600 font-medium">{drive.roleTitle}</p>
                </div>
                <Badge variant={drive.status === 'COMPLETED' ? 'success' : 'primary'} size="sm">
                  {drive.status.replace('_', ' ')}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-200/60 font-mono">
                <div>
                  <span className="text-slate-500 block">Package CTC</span>
                  <span className="font-bold text-brand-600">₹{drive.ctcLPA} LPA</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Drive Date</span>
                  <span className="font-bold text-slate-700">{drive.driveDate}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-slate-500">Min Score: <strong>{drive.eligibility?.minTalentScore || 700}+</strong></span>
                <button
                  onClick={() => navigate('/placement/drives')}
                  className="text-brand-600 hover:text-brand-800 font-bold text-[11px] underline"
                >
                  Manage Applicants →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
