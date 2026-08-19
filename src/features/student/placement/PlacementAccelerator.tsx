import React, { useState, useEffect } from 'react';
import { placementService } from '../../../services/placementService';
import { PlacementDaySchedule, BatchLeaderboardEntry, SmartPromotionStatus } from '../../../types/placement';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Tabs } from '../../../components/ui/Tabs';
import {
  Award,
  Sparkles,
  Mic,
  Volume2,
  CheckCircle2,
  TrendingUp,
  Clock,
  Flame,
  ArrowRight,
  ShieldCheck,
  Trophy,
  Users,
  Play,
  RotateCcw,
} from 'lucide-react';
import clsx from 'clsx';

export const PlacementAccelerator: React.FC = () => {
  const [schedule, setSchedule] = useState<PlacementDaySchedule | null>(null);
  const [leaderboard, setLeaderboard] = useState<BatchLeaderboardEntry[]>([]);
  const [promotion, setPromotion] = useState<SmartPromotionStatus | null>(null);
  const [activeLeaderboardTab, setActiveLeaderboardTab] = useState<'total' | 'aptitude' | 'english' | 'communication' | 'streak'>('total');

  // Speaking Simulation State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [speakingFeedback, setSpeakingFeedback] = useState<{ score: number; fluency: string; tone: string; suggestions: string[] } | null>(null);

  // Aptitude Quiz State
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    const load = async () => {
      const ps = await placementService.getTodayPlacementSchedule();
      const lb = await placementService.getBatchLeaderboard(activeLeaderboardTab);
      const pr = await placementService.getSmartPromotionStatus();
      setSchedule(ps);
      setLeaderboard(lb);
      setPromotion(pr);
    };
    load();
  }, [activeLeaderboardTab]);

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingSeconds(0);
    const interval = setInterval(() => {
      setRecordingSeconds(s => {
        if (s >= 10) {
          clearInterval(interval);
          setIsRecording(false);
          setSpeakingFeedback({
            score: 92,
            fluency: '94% (Very High - minimal filler words)',
            tone: 'Executive & Confident',
            suggestions: [
              'Great STAR methodology structuring in describing the backend deadlock scenario.',
              'Clear articulation of time complexities and algorithmic tradeoffs.',
            ],
          });
          return 10;
        }
        return s + 1;
      });
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Placement Accelerator Engine
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Synchronized Batch Placement Cycle (Daily 40 Mins)
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Structured daily English, Aptitude, Reasoning, HR, and AI Speaking Simulation with multi-dimensional rank tracking.
          </p>
        </div>

        <Badge variant="primary" size="md">
          Placement Score: 820/1000
        </Badge>
      </div>

      {/* Smart Promotion Stage Tracker */}
      {promotion && (
        <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-brand-950 text-white rounded-2xl border border-slate-800 shadow-soft-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 font-mono">
                Smart Promotion Lifecycle
              </span>
              <h2 className="text-lg font-bold text-white mt-0.5">
                Current: <span className="text-brand-300">{promotion.currentStage.replace('_', ' ')}</span> → Next Target: <span className="text-emerald-400">{promotion.targetStage.replace('_', ' ')}</span>
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1.5 rounded-xl">
              {promotion.progressPercent}% Stage Gate Cleared
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2">
            {promotion.criteriaMet.map((c, idx) => (
              <div key={idx} className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-400">{c.name.split(' ')[0]}</span>
                  {c.isPassed ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Clock className="w-3.5 h-3.5 text-amber-400" />}
                </div>
                <p className="font-bold text-white truncate text-[11px]">{c.name}</p>
                <span className={clsx('text-[10px] font-mono mt-0.5 block', c.isPassed ? 'text-emerald-400' : 'text-amber-400')}>
                  {c.current} / {c.required}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily 40-Minute Practice Execution Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Interactive Aptitude Problem */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600" /> Daily Quantitative Aptitude Problem
            </span>
            <Badge variant="warning">Time-Speed-Distance</Badge>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <p className="font-semibold text-slate-900 leading-relaxed">
              Two trains of lengths 140m and 160m are running on parallel tracks in opposite directions with speeds 60 km/h and 48 km/h respectively. In how many seconds will they cross each other completely?
            </p>
          </div>

          <div className="space-y-2">
            {[
              { id: 1, text: 'A) 8.5 seconds' },
              { id: 2, text: 'B) 10.0 seconds (Correct: Rel Speed = 108 km/h = 30 m/s; Dist = 300m → 10s)' },
              { id: 3, text: 'C) 12.0 seconds' },
              { id: 4, text: 'D) 15.0 seconds' },
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => setSelectedAnswer(opt.id)}
                className={clsx(
                  'w-full text-left p-3 rounded-xl border transition-colors cursor-pointer text-xs flex items-center justify-between',
                  selectedAnswer === opt.id
                    ? 'bg-brand-50 border-brand-500 text-brand-900 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                )}
              >
                <span>{opt.text}</span>
                {selectedAnswer === opt.id && <CheckCircle2 className="w-4 h-4 text-brand-600" />}
              </button>
            ))}
          </div>

          <Button
            variant="primary"
            size="md"
            className="w-full font-bold"
            onClick={() => setQuizSubmitted(true)}
            disabled={selectedAnswer === null}
          >
            Submit Answer & Unlock Practice Score
          </Button>
          {quizSubmitted && (
            <p className="text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-center font-bold">
              ✔ Correct Answer! +25 Aptitude XP Added to Daily Leaderboard.
            </p>
          )}
        </div>

        {/* Right: AI Speaking & HR Simulation */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 flex items-center gap-2">
              <Mic className="w-4 h-4 text-rose-600" /> AI Speech & Pitch Evaluator
            </span>
            <Badge variant="purple">90s Pitch</Badge>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900 block">Speaking Prompt:</span>
            <p className="text-slate-600 leading-relaxed">
              {schedule?.speakingPrompt}
            </p>
          </div>

          {/* Simulated Audio Visualizer / Recorder */}
          <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-3">
            <div className="flex justify-center items-center gap-2 h-10">
              {isRecording ? (
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-6 bg-rose-500 rounded-full animate-pulse" />
                  <span className="w-1.5 h-10 bg-rose-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-8 bg-rose-500 rounded-full animate-pulse" />
                  <span className="w-1.5 h-4 bg-rose-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-9 bg-rose-500 rounded-full animate-pulse" />
                </div>
              ) : (
                <span className="text-xs text-slate-500 font-mono">Microphone Ready</span>
              )}
            </div>

            <Button
              variant={isRecording ? 'danger' : 'primary'}
              size="md"
              leftIcon={<Mic className="w-4 h-4" />}
              onClick={handleStartRecording}
              disabled={isRecording}
            >
              {isRecording ? `Recording Audio (${recordingSeconds}s)...` : 'Start 90s Speech Test'}
            </Button>
          </div>

          {/* AI Feedback Report */}
          {speakingFeedback && (
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2 text-emerald-950 animate-in fade-in">
              <div className="flex items-center justify-between font-bold">
                <span>AI Speaking Score: {speakingFeedback.score}/100</span>
                <Badge variant="success">{speakingFeedback.tone}</Badge>
              </div>
              <p className="text-[11px] text-emerald-800">
                <strong>Fluency:</strong> {speakingFeedback.fluency}
              </p>
              <ul className="list-disc pl-4 text-[11px] text-emerald-900 space-y-1">
                {speakingFeedback.suggestions.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Multi-Dimensional Batch Leaderboards */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Placement Batch Leaderboard</h3>
              <p className="text-xs text-slate-500">Live rankings across batch cohorts and performance categories</p>
            </div>
          </div>

          <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl text-xs overflow-x-auto">
            {[
              { id: 'total', label: 'Overall Rank' },
              { id: 'aptitude', label: 'Aptitude Rank' },
              { id: 'english', label: 'English Rank' },
              { id: 'communication', label: 'Communication Rank' },
              { id: 'streak', label: 'Streak Rank' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveLeaderboardTab(tab.id as any)}
                className={clsx(
                  'px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap',
                  activeLeaderboardTab === tab.id
                    ? 'bg-white text-brand-700 shadow-soft-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 font-bold text-slate-600 border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3">Rank</th>
                <th className="p-3">Candidate</th>
                <th className="p-3">College / Dept</th>
                <th className="p-3">Total Score</th>
                <th className="p-3">Aptitude</th>
                <th className="p-3">English</th>
                <th className="p-3">Streak</th>
                <th className="p-3">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaderboard.map(entry => (
                <tr key={entry.studentId} className="hover:bg-slate-50/80">
                  <td className="p-3 font-mono font-bold text-slate-900">#{entry.rank}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 font-bold text-[10px] flex items-center justify-center uppercase shrink-0">
                        {entry.studentName?.charAt(0) || 'S'}
                      </div>
                      <span className="font-bold text-slate-900">{entry.studentName}</span>
                    </div>
                  </td>
                  <td className="p-3 text-slate-500">{entry.collegeName} ({entry.departmentName})</td>
                  <td className="p-3 font-mono font-bold text-brand-600">{entry.totalScore}</td>
                  <td className="p-3 font-mono text-slate-700">{entry.aptitudeScore}</td>
                  <td className="p-3 font-mono text-slate-700">{entry.englishScore}</td>
                  <td className="p-3 font-mono text-amber-600 font-bold">{entry.streakDays}d</td>
                  <td className="p-3 font-mono text-emerald-600 font-bold">+{entry.improvementDelta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
