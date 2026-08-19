import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { recruiterService } from '../../services/recruiterService';
import { JobPosting, CandidateApplication } from '../../types/recruiter';
import { StatCard } from '../../components/shared/StatCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import {
  Briefcase,
  Users,
  Award,
  CheckCircle2,
  Sparkles,
  Plus,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const RecruiterDashboard: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const j = await recruiterService.getJobPostings(user?.dataScope.recruiterId);
      const a = await recruiterService.getApplications();
      setJobs(j);
      setApplications(a);
    };
    load();
  }, [user]);

  const activeJobs = jobs.filter(j => j.status === 'ACTIVE');
  const offersCount = applications.filter(a => a.stage === 'OFFER' || a.stage === 'JOINED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" /> Recruiter Talent Operating Workspace
            </span>
            <Badge variant="success">Hiring Partner: TechCorp</Badge>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Talent Acquisition & Hiring Command Center
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Discover verified campus talent filtered by algorithmic Talent Score & Industry Readiness Index.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={() => navigate('/recruiter/talent')}>
            Search Verified Talent
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigate('/recruiter/pipeline')}>
            View Kanban Pipeline
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Job Postings"
          value={activeJobs.length}
          subtitle="Receiving Applications"
          icon={<Briefcase className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Candidates in Pipeline"
          value={applications.length}
          subtitle="Discovered to Offer Stage"
          icon={<Users className="w-5 h-5" />}
          iconBgColor="bg-brand-50 text-brand-600"
        />
        <StatCard
          title="Interviews Scheduled"
          value={applications.filter(a => a.stage === 'INTERVIEW').length}
          subtitle="This Week"
          icon={<Award className="w-5 h-5" />}
          iconBgColor="bg-purple-50 text-purple-600"
        />
        <StatCard
          title="Offers Released"
          value={offersCount}
          subtitle="High Acceptance Rate"
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBgColor="bg-teal-50 text-teal-600"
        />
      </div>

      {/* Active Jobs & Top Shortlists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Jobs */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Active Job Openings</h3>
              <p className="text-xs text-slate-500">Configured with automated Talent Score thresholds</p>
            </div>
            <Button variant="ghost" size="xs" onClick={() => navigate('/recruiter/jobs')}>
              Manage All
            </Button>
          </div>

          <div className="space-y-3">
            {jobs.map(job => (
              <div key={job.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{job.title}</h4>
                    <span className="text-slate-500 font-mono text-[11px]">{job.location} • ₹{job.ctcMinLPA} - {job.ctcMaxLPA} LPA</span>
                  </div>
                  <Badge variant="success" size="sm">{job.status}</Badge>
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {job.requiredSkills.map(sk => (
                    <span key={sk} className="px-2 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] text-slate-700">
                      {sk}
                    </span>
                  ))}
                </div>
                <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center text-[11px] text-slate-500">
                  <span>Min Talent Score: <strong className="text-brand-600 font-mono">≥ {job.eligibility.minTalentScore}</strong></span>
                  <span className="font-semibold text-slate-900">{job.applicantsCount} Applicants</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Candidate Pipeline Summary */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Candidate Pipeline Activity</h3>
              <p className="text-xs text-slate-500">Real-time status of shortlisted and interviewed talent</p>
            </div>
            <Button variant="primary" size="xs" onClick={() => navigate('/recruiter/pipeline')}>
              Open Kanban Board
            </Button>
          </div>

          <div className="space-y-3">
            {applications.map(app => (
              <div key={app.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center uppercase shrink-0">
                    {app.studentName?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{app.studentName}</p>
                    <p className="text-[10px] text-slate-500">{app.collegeName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={app.stage === 'OFFER' ? 'success' : app.stage === 'INTERVIEW' ? 'purple' : 'primary'} size="sm">
                    {app.stage}
                  </Badge>
                  <p className="text-[10px] font-mono text-brand-600 font-bold mt-0.5">
                    Score: {app.talentScore} (IRI: {app.iriScore}%)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
