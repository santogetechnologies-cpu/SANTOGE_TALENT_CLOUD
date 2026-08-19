import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { analyticsService, PlatformKPIs } from '../../services/analyticsService';
import { StatCard } from '../../components/shared/StatCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import {
  Layers,
  Users,
  Building2,
  DollarSign,
  Briefcase,
  Compass,
  FileCheck2,
  Award,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SuperAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<PlatformKPIs>({
    totalStudents: 0,
    activeStudents: 0,
    activeColleges: 0,
    placedStudents: 0,
    overallPlacementRate: 0,
    averagePackageLPA: 0,
    totalBatches: 0,
    totalCompanies: 0,
    activeCampusDrives: 0,
    totalMentors: 0,
    totalRecruiters: 0,
    pendingPayments: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadMetrics = async () => {
      setIsLoading(true);
      try {
        const kpis = await analyticsService.getPlatformOverview();
        setMetrics(kpis);
      } catch (err) {
        console.error('Error loading platform metrics:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadMetrics();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> Platform Command Center
            </span>
            <Badge variant="purple">Super Admin Scope: ALL</Badge>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            SantoGe Talent Cloud Ecosystem Overview
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Global governance across all partner universities, talent pools, synchronized placement batches, and recruiter pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/users')}>
            User Management
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/colleges')}>
            + New College
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/admin/bulk-import')}>
            Bulk Student Import
          </Button>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={isLoading ? '...' : metrics.totalStudents.toLocaleString()}
          subtitle={isLoading ? 'Loading...' : `${metrics.activeStudents.toLocaleString()} Active Learners`}
          icon={<Users className="w-5 h-5" />}
          iconBgColor="bg-brand-50 text-brand-600"
          onClick={() => navigate('/admin/students')}
        />
        <StatCard
          title="Active Colleges"
          value={isLoading ? '...' : metrics.activeColleges.toString()}
          subtitle="Partner Institutions"
          icon={<Building2 className="w-5 h-5" />}
          iconBgColor="bg-indigo-50 text-indigo-600"
          onClick={() => navigate('/admin/colleges')}
        />
        <StatCard
          title="Placements Generated"
          value={isLoading ? '...' : metrics.placedStudents.toLocaleString()}
          subtitle={isLoading ? 'Loading...' : `${metrics.overallPlacementRate}% Placement Rate`}
          icon={<Award className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Pending Payments"
          value={isLoading ? '...' : metrics.pendingPayments.toString()}
          subtitle="Verification Queue Awaiting"
          icon={<DollarSign className="w-5 h-5" />}
          iconBgColor="bg-amber-50 text-amber-600"
          onClick={() => navigate('/finance/payments')}
        />
      </div>

      {/* Secondary Operational Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Mentors"
          value={isLoading ? '...' : metrics.totalMentors.toString()}
          subtitle="1-on-1 Guidance & Clinics"
          icon={<Compass className="w-5 h-5" />}
          iconBgColor="bg-violet-50 text-violet-600"
        />
        <StatCard
          title="Placement Batches"
          value={isLoading ? '...' : metrics.totalBatches.toString()}
          subtitle="Synchronized Calendars"
          icon={<FileCheck2 className="w-5 h-5" />}
          iconBgColor="bg-cyan-50 text-cyan-600"
          onClick={() => navigate('/admin/batches')}
        />
        <StatCard
          title="Recruiter Network"
          value={isLoading ? '...' : metrics.totalRecruiters.toString()}
          subtitle="Active Hiring Partners"
          icon={<Briefcase className="w-5 h-5" />}
          iconBgColor="bg-slate-100 text-slate-800"
          onClick={() => navigate('/recruiter/talent-pool')}
        />
        <StatCard
          title="Average CTC Package"
          value={isLoading ? '...' : metrics.averagePackageLPA > 0 ? `₹${metrics.averagePackageLPA} LPA` : '₹0 LPA'}
          subtitle="Across Placed Candidates"
          icon={<Sparkles className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* Quick Access Platform Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card hoverable className="p-6 space-y-3 cursor-pointer" onClick={() => navigate('/admin/bulk-import')}>
          <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600 w-fit">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Bulk Student Import Wizard</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Upload CSV/Excel spreadsheets to validate, batch-assign, and auto-generate credentials for incoming student cohorts.
          </p>
          <span className="text-xs font-semibold text-brand-600 block pt-1">Launch Wizard →</span>
        </Card>

        <Card hoverable className="p-6 space-y-3 cursor-pointer" onClick={() => navigate('/content/manage')}>
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 w-fit">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Curriculum & Content Hub</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Manage learning cards, browser simulators, live debugging challenges, and questions through the Draft → Publish lifecycle.
          </p>
          <span className="text-xs font-semibold text-purple-600 block pt-1">Review Content →</span>
        </Card>

        <Card hoverable className="p-6 space-y-3 cursor-pointer" onClick={() => navigate('/finance/payments')}>
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 w-fit">
            <DollarSign className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Payment Verification & Invoices</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Verify student registration fee transactions, approve college subscriptions, and audit transaction records.
          </p>
          <span className="text-xs font-semibold text-emerald-600 block pt-1">Open Queue →</span>
        </Card>
      </div>
    </div>
  );
};
