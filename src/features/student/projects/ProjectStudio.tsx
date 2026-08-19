import React, { useState, useEffect } from 'react';
import { learningService } from '../../../services/learningService';
import { ProjectItem, WeeklyHackMission } from '../../../types/learning';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import {
  FolderGit2,
  Github,
  Sparkles,
  Award,
  Clock,
  ExternalLink,
  CheckCircle2,
  Flame,
  Star,
  GitPullRequest,
  ShieldCheck,
} from 'lucide-react';
import clsx from 'clsx';

export const ProjectStudio: React.FC = () => {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [hackMission, setHackMission] = useState<WeeklyHackMission | null>(null);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'MINI_PROJECT' | 'INDUSTRY_PROJECT' | 'CAPSTONE'>('ALL');

  useEffect(() => {
    const load = async () => {
      const p = await learningService.getProjects();
      const h = await learningService.getWeeklyHackMission();
      setProjects(p);
      setHackMission(h);
    };
    load();
  }, []);

  const filteredProjects = projects.filter(
    p => activeFilter === 'ALL' || p.type === activeFilter
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Project Studio & Portfolio Hub
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Real-World Industry Projects & Capstones
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            50+ Mini Projects, 20 Industry Systems, 5 Capstones, and continuous GitHub verified contributions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="primary" size="md">
            GitHub Rating: A+ Verified
          </Badge>
        </div>
      </div>

      {/* Weekly 48-Hour Hack Mission Banner */}
      {hackMission && (
        <div className="p-6 bg-gradient-to-r from-violet-950 via-slate-900 to-brand-950 rounded-2xl border border-violet-800 text-white shadow-soft-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" /> {hackMission.status} 48-HOUR HACK
              </span>
              <span className="text-xs text-slate-400">Sponsored by {hackMission.sponsorCompany}</span>
            </div>
            <h2 className="text-xl font-bold text-white">{hackMission.title}</h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">{hackMission.industryProblem}</p>
          </div>

          <div className="flex flex-col items-end gap-3 shrink-0">
            <div className="text-right">
              <span className="text-xs text-slate-400">Prize Bounty</span>
              <p className="text-2xl font-bold text-amber-400 font-mono">+{hackMission.prizeXP} XP</p>
            </div>
            <Button variant="primary" size="sm" rightIcon={<ExternalLink className="w-4 h-4" />}>
              Join Hack Mission ({hackMission.deadlineHoursRemaining}h Left)
            </Button>
          </div>
        </div>
      )}

      {/* GitHub Growth Engine 30-Day Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Github className="w-5 h-5 text-slate-900" />
            <div>
              <h3 className="text-base font-bold text-slate-900">GitHub Growth Engine</h3>
              <p className="text-xs text-slate-500">Structured 30-day repository quality roadmap from init to release</p>
            </div>
          </div>
          <Badge variant="success">Verified Candidate Badge</Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-2">
          {[
            { day: 'Day 1', label: 'Repository Init', status: 'COMPLETED' },
            { day: 'Day 5', label: 'Architecture Docs', status: 'COMPLETED' },
            { day: 'Day 10', label: 'Core Features', status: 'COMPLETED' },
            { day: 'Day 15', label: 'Issue Tracking', status: 'COMPLETED' },
            { day: 'Day 20', label: 'Unit / E2E Tests', status: 'COMPLETED' },
            { day: 'Day 30', label: 'Production Release', status: 'COMPLETED' },
          ].map(step => (
            <div key={step.day} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
              <span className="text-[10px] font-bold text-brand-600 uppercase font-mono">{step.day}</span>
              <p className="text-xs font-bold text-slate-900 truncate">{step.label}</p>
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                <CheckCircle2 className="w-3 h-3" /> Verified
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Projects Filters */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs">
        {[
          { id: 'ALL', label: 'All Projects' },
          { id: 'MINI_PROJECT', label: 'Mini Projects (50+)' },
          { id: 'INDUSTRY_PROJECT', label: 'Industry Systems (20)' },
          { id: 'CAPSTONE', label: 'Capstones (5)' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as any)}
            className={clsx(
              'px-3.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap',
              activeFilter === tab.id
                ? 'bg-brand-600 text-white shadow-soft-sm'
                : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProjects.map(proj => (
          <Card key={proj.id} hoverable className="space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <Badge variant={proj.type === 'CAPSTONE' ? 'purple' : 'primary'} size="sm">
                  {proj.type.replace('_', ' ')}
                </Badge>
                {proj.score && (
                  <span className="text-xs font-bold font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Score: {proj.score}/100
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-slate-900">{proj.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {proj.skillsGained.map(sk => (
                  <span key={sk} className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700">
                    {sk}
                  </span>
                ))}
              </div>

              {proj.reviewerNotes && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                  <strong className="text-slate-900 block text-[11px] mb-0.5">Reviewer Feedback:</strong>
                  {proj.reviewerNotes}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              {proj.githubRepo ? (
                <a
                  href={proj.githubRepo}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-800 font-semibold"
                >
                  <Github className="w-4 h-4" /> View GitHub Repository
                </a>
              ) : (
                <span className="text-xs text-slate-400">Not Submitted</span>
              )}
              <Button size="sm" variant="outline">
                View Project Spec
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
