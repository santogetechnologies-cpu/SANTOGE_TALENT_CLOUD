import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { studentService } from '../../../services/studentService';
import { learningService } from '../../../services/learningService';
import { Student } from '../../../types/student';
import { KnowledgeGraphNode } from '../../../types/learning';
import { TalentScoreRadar } from '../../../components/charts/TalentScoreRadar';
import { IRITrendChart } from '../../../components/charts/IRITrendChart';
import { SkillGraph } from '../../../components/charts/SkillGraph';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import {
  BarChart3,
  Sparkles,
  TrendingUp,
  Award,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Lock,
} from 'lucide-react';
import clsx from 'clsx';

export const PerformanceAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [kgNodes, setKgNodes] = useState<KnowledgeGraphNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const s = await studentService.getStudentById(user?.dataScope.studentId || user?.email);
      const nodes = await learningService.getKnowledgeGraph();
      setStudent(s);
      setKgNodes(nodes);
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading || !student) {
    return <div className="py-12 text-center text-slate-400">Loading performance intelligence...</div>;
  }

  const { talentScore, iri } = student;

  const iriWeights = [
    { label: 'Learning Progress', weight: '15%', score: iri.learningProgress },
    { label: 'Lab Simulator Performance', weight: '15%', score: iri.labPerformance },
    { label: 'Assignment Quality', weight: '15%', score: iri.assignmentQuality },
    { label: 'Live Debugging Ability', weight: '10%', score: iri.debuggingAbility },
    { label: 'Project Completion & Review', weight: '15%', score: iri.projectCompletion },
    { label: 'GitHub Activity & Quality', weight: '10%', score: iri.gitHubActivity },
    { label: 'Consistency & Streak', weight: '10%', score: iri.consistency },
    { label: 'Mock Interview Performance', weight: '5%', score: iri.mockInterview },
    { label: 'DSA & Problem Solving', weight: '5%', score: iri.problemSolving },
    { label: 'Team Hack Challenges', weight: '5%', score: iri.teamChallenges },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Talent Intelligence & Analytics
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Industry Readiness Index (IRI) & Competency Radar
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Multi-factor weighted index and deep skill relationships computed across 10 verifiable dimensions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="primary" size="md">
            Locked from manual edits (System verified)
          </Badge>
        </div>
      </div>

      {/* IRI Summary Card */}
      <div className="p-6 bg-gradient-to-r from-slate-950 to-brand-950 text-white rounded-2xl border border-slate-800 shadow-soft-lg grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div>
          <span className="text-xs text-slate-400 font-bold uppercase">Overall Industry Readiness Index</span>
          <div className="flex items-baseline gap-2 mt-1">
            <h2 className="text-4xl font-extrabold text-emerald-400 font-mono">{iri.overallIRI}%</h2>
            <span className="text-xs text-emerald-300 font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Trend: UP
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-300">
            Ranked top 3% among 1,420 candidates at {student.collegeName}.
          </p>
        </div>

        <div className="md:col-span-2 space-y-2 text-xs">
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
            <span className="font-bold text-emerald-400 block mb-1">Verified Strengths:</span>
            <div className="flex flex-wrap gap-1.5">
              {iri.strengths.map(st => (
                <span key={st} className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-[11px]">
                  ✓ {st}
                </span>
              ))}
            </div>
          </div>
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
            <span className="font-bold text-amber-400 block mb-1">Growth Opportunities:</span>
            <div className="flex flex-wrap gap-1.5">
              {iri.weaknesses.map(w => (
                <span key={w} className="px-2 py-0.5 rounded bg-amber-950 border border-amber-500/40 text-amber-300 text-[11px]">
                  • {w}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 10-Factor IRI Weights Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft space-y-4">
        <h3 className="text-base font-bold text-slate-900">10-Factor Multi-Weighted Index Breakdown</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {iriWeights.map(item => (
            <div key={item.label} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-900 truncate">{item.label}</span>
                <span className="text-[10px] font-mono text-slate-500">{item.weight}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-extrabold font-mono text-brand-600">{item.score}%</span>
                <span className="text-[10px] text-emerald-600 font-semibold">Verified</span>
              </div>
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-brand-500 rounded-full" style={{ width: `${item.score}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Radar & Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft space-y-3">
          <h3 className="text-base font-bold text-slate-900">Multi-Axis Competency Radar</h3>
          <TalentScoreRadar />
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft space-y-3">
          <h3 className="text-base font-bold text-slate-900">Historical Readiness Trajectory</h3>
          <IRITrendChart />
        </div>
      </div>

      {/* Interactive Skill Knowledge Graph */}
      <SkillGraph nodes={kgNodes} />
    </div>
  );
};
