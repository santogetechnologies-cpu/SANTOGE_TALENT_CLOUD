import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { collegeService } from '../../../services/collegeService';
import { studentService } from '../../../services/studentService';
import { CampusDrive } from '../../../types/college';
import { Student } from '../../../types/student';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { Tabs } from '../../../components/ui/Tabs';
import {
  Briefcase,
  Sparkles,
  Lock,
  CheckCircle2,
  FileText,
  Building,
  Award,
  ExternalLink,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import clsx from 'clsx';

export const CareerHub: React.FC = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [drives, setDrives] = useState<CampusDrive[]>([]);
  const [activeTab, setActiveTab] = useState<'opportunities' | 'resume' | 'applications'>('opportunities');

  useEffect(() => {
    const load = async () => {
      const s = await studentService.getStudentById(user?.dataScope.studentId || user?.email);
      const d = await collegeService.getCampusDrives(user?.dataScope?.collegeId);
      setStudent(s);
      setDrives(d);
    };
    load();
  }, [user]);

  const score = student?.talentScore.overallScore || 845;

  const unlockTiers = [
    { threshold: 450, title: 'ATS Resume Builder Unlocked', desc: 'Generate machine-readable ATS resume with verified tags', isUnlocked: score >= 450 },
    { threshold: 600, title: 'Technical Mock Interviews', desc: '1-on-1 mock interviews with industry mentors', isUnlocked: score >= 600 },
    { threshold: 700, title: 'Recruiter Pool Visibility', desc: 'Your profile appears in recruiter talent search discovery', isUnlocked: score >= 700 },
    { threshold: 800, title: 'Tier-1 Premium Companies', desc: 'Eligible for campus drives with CTC >= 12 LPA (Microsoft, Amazon)', isUnlocked: score >= 800 },
    { threshold: 900, title: 'Direct Interview Fast-Track', desc: 'Direct technical interview without screening round', isUnlocked: score >= 900 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Career & Placement Engine
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Career Opportunities & ATS Resume
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Talent Score milestones, eligible campus drives, recruiter invitations, and verified offers.
          </p>
        </div>

        <Badge variant="primary" size="md">
          Current Tier: Premium Companies
        </Badge>
      </div>

      {/* Talent Score Opportunity Unlock Thresholds */}
      <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-brand-950 text-white rounded-2xl border border-slate-800 shadow-soft-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Talent Score Opportunity Unlock Thresholds</h3>
            <p className="text-xs text-slate-400">Current Score: <span className="font-mono font-bold text-brand-400 text-sm">{score} / 1000</span></p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1 rounded-full">
            4 of 5 Milestones Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2">
          {unlockTiers.map(tier => (
            <div
              key={tier.threshold}
              className={clsx(
                'p-3.5 rounded-xl border transition-all text-xs flex flex-col justify-between space-y-2',
                tier.isUnlocked
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-900/60 border-slate-800 text-slate-500 opacity-60'
              )}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-[11px] text-brand-400">{tier.threshold}+ Score</span>
                  {tier.isUnlocked ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-slate-600" />}
                </div>
                <p className="font-bold text-white text-xs leading-snug">{tier.title}</p>
                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{tier.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        variant="pills"
        activeTab={activeTab}
        onChange={tabId => setActiveTab(tabId as any)}
        tabs={[
          { id: 'opportunities', label: 'Eligible Campus Drives', icon: <Briefcase className="w-4 h-4" /> },
          { id: 'resume', label: 'ATS Resume Builder (94% Score)', icon: <FileText className="w-4 h-4" /> },
          { id: 'applications', label: 'Application Status (2)', icon: <Award className="w-4 h-4" /> },
        ]}
      />

      {/* Tab 1: Eligible Campus Drives */}
      {activeTab === 'opportunities' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {drives.map(drive => (
            <Card key={drive.id} hoverable className="space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{drive.companyName}</h3>
                    <p className="text-xs font-semibold text-brand-600">{drive.roleTitle}</p>
                  </div>
                  <Badge variant="success" size="sm">
                    ₹{drive.ctcLPA} LPA
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1 font-sans">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Location</span>
                    <span className="font-semibold text-slate-800">{drive.location}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Drive Date</span>
                    <span className="font-semibold text-slate-800">{drive.driveDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Min Talent Score</span>
                    <span className="font-mono font-bold text-emerald-600">≥ {drive.eligibility.minTalentScore} (You: {score})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Min IRI</span>
                    <span className="font-mono font-bold text-emerald-600">≥ {drive.eligibility.minIRI}%</span>
                  </div>
                </div>

                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">You meet all eligibility criteria for this drive.</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Deadline: {drive.registrationDeadline}</span>
                <Button variant="primary" size="sm">
                  Register for Drive
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Tab 2: ATS Resume Builder */}
      {activeTab === 'resume' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900">ATS Resume Optimizer</h3>
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-center">
              <span className="text-xs uppercase font-bold text-emerald-700">ATS Compatibility Score</span>
              <p className="text-4xl font-extrabold font-mono text-emerald-600 mt-1">94%</p>
              <p className="text-[11px] text-emerald-800 mt-1">Optimized for Greenhouse, Lever & Workday ATS</p>
            </div>
            <div className="space-y-2">
              <p className="font-bold text-slate-900">Verified Badges Included:</p>
              <div className="space-y-1 text-slate-600">
                <p>✔ SantoGe Talent Score: 845/1000</p>
                <p>✔ Industry Readiness Index: 89.2%</p>
                <p>✔ GitHub Rating: A+ Verified Contributions</p>
                <p>✔ Live Debugging Competency: Mastered</p>
              </div>
            </div>
            <Button variant="primary" size="md" className="w-full" leftIcon={<Download className="w-4 h-4" />}>
              Download ATS PDF Resume
            </Button>
          </div>

          <div className="lg:col-span-2 bg-slate-900 text-slate-200 rounded-2xl border border-slate-800 p-6 shadow-2xl font-sans text-xs space-y-4">
            <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">RAHUL SHARMA</h2>
                <p className="text-brand-400 font-mono">Full Stack & Cloud Systems Engineer • Apex Institute of Technology</p>
              </div>
              <Badge variant="primary">ATS Formatted</Badge>
            </div>
            <div className="space-y-2 text-slate-300 text-xs leading-relaxed">
              <p><strong className="text-white">TECHNICAL SKILLS:</strong> Python (Async/FastAPI), PostgreSQL, AWS (EC2/S3/IAM), Docker, React, Data Structures & Algorithms, Redis.</p>
              <p><strong className="text-white">PROJECTS:</strong> Distributed Expense Settlement Engine (FastAPI, Alembic, Docker), AWS 3-Tier Multi-AZ Cloud Infrastructure (Terraform).</p>
              <p><strong className="text-white">VERIFIED CREDENTIALS:</strong> SantoGe Top 5% Talent Certification (Score: 845, IRI: 89.2%).</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Applications Status */}
      {activeTab === 'applications' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft space-y-4">
          <h3 className="text-base font-bold text-slate-900">Active Job Applications & Offers</h3>
          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/50 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 text-sm">TechCorp Solutions</span>
                <p className="text-xs text-slate-600">Full Stack Python & Cloud Developer (Fresher 2026)</p>
                <span className="text-[11px] text-brand-600 font-semibold">Technical Round Scheduled: Aug 20, 2026 at 2:30 PM</span>
              </div>
              <Badge variant="purple">Interview Round 2</Badge>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 text-sm">Microsoft India R&D</span>
                <p className="text-xs text-slate-600">Software Development Engineer - 1 (Cloud & AI)</p>
                <span className="text-[11px] text-slate-500">Registered on Campus Drive Portal</span>
              </div>
              <Badge variant="primary">Registration Open</Badge>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
