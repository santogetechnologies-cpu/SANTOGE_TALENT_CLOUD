import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { studentService } from '../../../services/studentService';
import { learningService } from '../../../services/learningService';
import { placementService } from '../../../services/placementService';
import { Student, DailyMission } from '../../../types/student';
import { PlacementDaySchedule } from '../../../types/placement';
import { StatCard } from '../../../components/shared/StatCard';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { TalentScoreRadar } from '../../../components/charts/TalentScoreRadar';
import { IRITrendChart } from '../../../components/charts/IRITrendChart';
import {
  Sparkles,
  Flame,
  Award,
  BookOpen,
  Terminal,
  Code2,
  Briefcase,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  FolderGit2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [mission, setMission] = useState<DailyMission | null>(null);
  const [placementDay, setPlacementDay] = useState<PlacementDaySchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const stu = await studentService.getStudentById(user?.dataScope.studentId || user?.email);
      const mis = await learningService.getDailyMission();
      const ps = await placementService.getTodayPlacementSchedule();
      setStudent(stu);
      setMission(mis);
      setPlacementDay(ps);
      setLoading(false);
    };
    load();
  }, [user]);

  const handleCompleteMissionTask = async (taskId: string) => {
    const updated = await learningService.completeDailyTask(taskId);
    setMission({ ...updated });
  };

  if (loading || !student) {
    return (
      <div className="py-12 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
      </div>
    );
  }

  const { talentScore, iri, placementReadiness, skills, streakDays } = student;

  return (
    <div className="space-y-6">
      {/* Personalized Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-brand-950 to-indigo-950 p-6 sm:p-8 text-white shadow-soft-lg border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                {student.departmentName} • Batch of {student.graduationYear}
              </span>
              <span className="flex items-center gap-1 text-xs font-bold text-amber-400">
                <Flame className="w-3.5 h-3.5 fill-amber-400" /> {streakDays} Day Streak
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {student.name}! 👋
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              You are currently in <span className="text-brand-300 font-bold">{talentScore.unlockedOpportunitiesTier}</span> tier. Your Talent Score is in the <span className="text-emerald-400 font-bold">top 5%</span> across {student.collegeName}.
            </p>
          </div>

          {/* Talent Score Quick Ring Widget */}
          <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border border-slate-700/80 flex items-center gap-5 shrink-0 shadow-soft">
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                SantoGe Talent Score
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
                  {talentScore.overallScore}
                </span>
                <span className="text-xs text-slate-400 font-mono">/ 1000</span>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 mt-1">
                <TrendingUp className="w-3.5 h-3.5" /> +55 pts this month
              </span>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-brand-500 flex flex-col items-center justify-center bg-brand-950/40">
              <span className="text-xs font-extrabold text-brand-300 font-mono">{iri.overallIRI}%</span>
              <span className="text-[9px] text-slate-400 uppercase">IRI</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Technical Readiness"
          value={`${talentScore.technicalScore}/1000`}
          subtitle="Python, FastApi, SQL, AWS"
          icon={<Code2 className="w-5 h-5" />}
          iconBgColor="bg-brand-50 text-brand-600"
          change="+8.2%"
          changeType="positive"
        />
        <StatCard
          title="Industry Readiness (IRI)"
          value={`${iri.overallIRI}%`}
          subtitle="10-Factor Multi-Weighted"
          icon={<Award className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 text-emerald-600"
          change="+4.5%"
          changeType="positive"
        />
        <StatCard
          title="Placement Readiness"
          value={placementReadiness.status}
          subtitle={`${placementReadiness.eligibleDrivesCount} Campus Drives Eligible`}
          icon={<Briefcase className="w-5 h-5" />}
          iconBgColor="bg-violet-50 text-violet-600"
        />
        <StatCard
          title="GitHub Growth Rating"
          value={student.githubStats?.qualityRating || 'A+'}
          subtitle={`${student.githubStats?.commitsThisMonth || 64} commits this month`}
          icon={<FolderGit2 className="w-5 h-5" />}
          iconBgColor="bg-slate-100 text-slate-900"
        />
      </div>

      {/* Today's Dual Engine Work: Daily Mission (Technical) + Daily Placement Cycle (Aptitude/English) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module 1: Daily Technical Mission */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Today's Technical Mission</h3>
                <p className="text-xs text-slate-500">Day {mission?.dayNumber}: {mission?.theme}</p>
              </div>
            </div>
            <Badge variant="primary">+{mission?.totalXpEarned} XP</Badge>
          </div>

          <div className="space-y-2.5">
            {mission?.tasks.map((task, idx) => {
              const isCompleted = task.status === 'COMPLETED';
              const isInProgress = task.status === 'IN_PROGRESS';
              return (
                <div
                  key={task.id}
                  className={clsx(
                    'p-3 rounded-xl border transition-all flex items-center justify-between gap-3 text-xs',
                    isCompleted ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' : isInProgress ? 'bg-brand-50/50 border-brand-300 text-brand-900 shadow-soft-sm' : 'bg-slate-50 border-slate-200 text-slate-700'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className={clsx('w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0', isCompleted ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600')}>
                      {isCompleted ? '✓' : idx + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900">{task.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                        <span>{task.durationMinutes} mins</span>
                        <span>•</span>
                        <span className="font-medium text-brand-700">+{task.xpReward} XP</span>
                        <span>•</span>
                        <span className="text-slate-400">{task.skillName}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {isCompleted ? (
                      <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Done
                      </span>
                    ) : (
                      <Button
                        size="xs"
                        variant={isInProgress ? 'primary' : 'outline'}
                        onClick={() => handleCompleteMissionTask(task.id)}
                      >
                        {isInProgress ? 'Resume' : 'Start'}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Terminal className="w-4 h-4" />}
              onClick={() => navigate('/student/labs')}
            >
              Open 6 Interactive Simulators
            </Button>
            <Button
              variant="primary"
              size="sm"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => navigate('/student/learning')}
            >
              View Full Track
            </Button>
          </div>
        </div>

        {/* Module 2: Daily Placement Cycle (English + Aptitude + Guided Practice) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Placement Accelerator (40m Cycle)</h3>
                <p className="text-xs text-slate-500">Day {placementDay?.dayNumber}: {placementDay?.theme}</p>
              </div>
            </div>
            <Badge variant="warning">Synchronized Batch</Badge>
          </div>

          <div className="space-y-3 text-xs">
            {/* Part 1: English */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-brand-500" /> Part 1 — Professional English (10 mins)
                </span>
                <span className="text-[10px] text-slate-500">Grammar & Business Memos</span>
              </div>
              <p className="text-slate-600 text-[11px]">{placementDay?.englishTopic}</p>
            </div>

            {/* Part 2: Aptitude & Reasoning */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Part 2 — Quantitative & Logic (10 mins)
                </span>
                <span className="text-[10px] text-slate-500">Relative Speed & Syllogisms</span>
              </div>
              <p className="text-slate-600 text-[11px]">{placementDay?.aptitudeTopic}</p>
            </div>

            {/* Part 3: Guided Speaking & AI Practice */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Part 3 — Speaking & HR Simulator (20 mins)
                </span>
                <span className="text-[10px] text-emerald-600 font-bold">Instant AI Feedback</span>
              </div>
              <p className="text-slate-600 text-[11px] line-clamp-1">{placementDay?.speakingPrompt}</p>
            </div>
          </div>

          <div className="pt-2 flex justify-between items-center">
            <span className="text-xs text-slate-500">Batch Leaderboard Rank: <strong className="text-slate-900">#2</strong></span>
            <Button
              variant="primary"
              size="sm"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => navigate('/student/placement')}
            >
              Start Placement Cycle
            </Button>
          </div>
        </div>
      </div>

      {/* Talent Competency Radar & IRI Progression */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Personal Skill Radar</h3>
              <p className="text-xs text-slate-500">Multi-axis competency verification across technical and soft skills</p>
            </div>
          </div>
          <TalentScoreRadar />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Industry Readiness Index (IRI) Trend</h3>
              <p className="text-xs text-slate-500">Trajectory towards Tier-1 Product Company benchmarks</p>
            </div>
          </div>
          <IRITrendChart />
        </div>
      </div>
    </div>
  );
};
