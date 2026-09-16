import { Trophy, CheckCircle2, Flame, Zap, ArrowRight, BookOpen, Layers, Calendar, ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { XPReward } from "./XPReward";

interface DailyCompletionProps {
  dayNum: number;
  trackName: string;
  topic: string;
  theme: string;
  placementTheme: string;
  streak: number;
  talentScore: number;
  sessionXp: number;
  onDone: () => void;
}

export function DailyCompletion({
  dayNum,
  trackName,
  topic,
  theme,
  placementTheme,
  streak,
  talentScore,
  sessionXp,
  onDone,
}: DailyCompletionProps) {
  const nextDayNum = Math.min(dayNum + 1, 90);

  return (
    <div className="journey-card mx-auto max-w-3xl overflow-hidden p-6 sm:p-10 phase-enter space-y-8 text-center">
      {/* Trophy & Badge */}
      <div className="flex flex-col items-center space-y-3">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 ring-4 ring-emerald-500/20">
          <Trophy className="size-8 text-emerald-600 dark:text-emerald-400" />
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-3.5" />
            <span>Daily 20-Minute Routine Completed</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Day {dayNum} Mastery Achieved!
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
            You have satisfied the dual requirement: Technical Skill Sandbox validation and Placement Accelerator attendance.
          </p>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid gap-3 sm:grid-cols-3 text-left">
        <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-1">
          <span className="text-[11px] text-muted-foreground">Session Rewards</span>
          <div className="flex items-center gap-1.5 font-mono text-xl font-bold text-primary">
            <Zap className="size-4 fill-primary" />
            +{sessionXp} XP
          </div>
          <p className="text-[10px] text-muted-foreground">Credited to profile</p>
        </div>

        <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-1">
          <span className="text-[11px] text-muted-foreground">Active Streak</span>
          <div className="flex items-center gap-1.5 font-mono text-xl font-bold text-amber-500">
            <Flame className="size-4 fill-amber-500" />
            {streak} Days
          </div>
          <p className="text-[10px] text-muted-foreground">Placement consistency</p>
        </div>

        <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-1">
          <span className="text-[11px] text-muted-foreground">Talent Score</span>
          <div className="flex items-center gap-1.5 font-mono text-xl font-bold text-foreground">
            {talentScore} / 1000
          </div>
          <p className="text-[10px] text-muted-foreground">Phase 2 Career Readiness</p>
        </div>
      </div>

      {/* Dual Engine Verification Summary */}
      <div className="rounded-xl border border-border bg-card p-5 text-left space-y-3">
        <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
          Dual Engine Verification Checklist
        </h4>

        <div className="space-y-2.5 text-xs">
          <div className="flex items-start justify-between gap-3 rounded-lg border border-border/80 bg-muted/10 p-3">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground">
                  Engine 1: Technical Skill Lab ({trackName})
                </span>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Topic: {topic} · Automated test suite verified (+50 XP)
                </p>
              </div>
            </div>
            <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
              Verified ✓
            </span>
          </div>

          <div className="flex items-start justify-between gap-3 rounded-lg border border-border/80 bg-muted/10 p-3">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground">
                  Engine 2: Placement Accelerator Drill
                </span>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Theme: {placementTheme} · 60s Voice Pitch &amp; STAR Cadence recorded (+25 XP)
                </p>
              </div>
            </div>
            <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
              Attendance Logged ✓
            </span>
          </div>
        </div>
      </div>

      {/* Tomorrow Sneak Peek */}
      <div className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/20 px-5 py-3.5 text-xs text-left">
        <div className="flex items-center gap-3">
          <Calendar className="size-4 text-primary shrink-0" />
          <div>
            <span className="font-semibold text-foreground">Tomorrow's Milestone: Day {nextDayNum}</span>
            <p className="text-[11px] text-muted-foreground">
              Module: {theme} · New interactive code challenge &amp; aptitude sprint
            </p>
          </div>
        </div>
        <span className="rounded-md bg-card px-2.5 py-1 text-[11px] font-mono text-muted-foreground border border-border shrink-0">
          06:00 IST
        </span>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={onDone}
          className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors cursor-pointer"
        >
          <span>Return to Today's Dashboard</span>
          <ArrowRight className="size-4" />
        </button>

        <Link
          to="/student/technical"
          className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-xs sm:text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          <Layers className="size-4 text-muted-foreground" />
          <span>View 90-Day Roadmap</span>
        </Link>
      </div>
    </div>
  );
}
