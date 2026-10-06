import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  Code2,
  Briefcase,
  Play,
  BookOpen,
  Terminal,
  Clock,
  Calendar,
  Users,
  Star,
  Flame,
  Zap,
  GraduationCap,
  Trophy,
  ChevronRight,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Target,
  MessageSquare,
  Activity,
  Layers,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { trackById, type TrackId, type Track } from "@/lib/tracks";
import { useAppStore } from "@/lib/app-store";
import { getLessonForDay } from "@/lib/course-curricula";

export interface DailyHomeScreenProps {
  studentName: string;
  selectedDay: number;
  currentTechnicalDay: number;
  cohortDay: number;
  primaryTrack: Track;
  completedTechDays: number[];
  attendance: number[];
  streak: number;
  talentScore: number;
  assignedTracks?: TrackId[] | undefined;
  onSelectTrack?: ((trackId: TrackId) => void) | undefined;
  onSelectDay: (day: number) => void;
  onStartTechnicalLesson: (stepType?: string) => void;
  onStartPlacementDrill: (drillType: "english" | "aptitude" | "logic" | "all") => void;
}

export function DailyHomeScreen({
  studentName,
  selectedDay,
  currentTechnicalDay,
  cohortDay,
  primaryTrack,
  completedTechDays,
  attendance,
  streak,
  talentScore,
  assignedTracks,
  onSelectTrack,
  onSelectDay,
  onStartTechnicalLesson,
  onStartPlacementDrill,
}: DailyHomeScreenProps) {
  const store = useAppStore();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  }, []);

  const firstName = studentName ? studentName.trim().split(" ")[0] : "Student";

  // Calculate percentages
  const techCompletionPct = Math.min(
    100,
    Math.round((completedTechDays.length / 90) * 100) || 25
  );
  const placementCompletionPct = Math.min(
    100,
    Math.round((attendance.length / 90) * 100) || 10
  );
  const totalProgressPct = Math.round((techCompletionPct + placementCompletionPct) / 2);

  // Quick category tracks for pill selection
  const availableTrackList: { id: TrackId; label: string; icon: string }[] = [
    { id: "fullstack", label: "Full Stack", icon: "code" },
    { id: "aiml", label: "AI/ML", icon: "cpu" },
    { id: "cloud-devops", label: "Cloud", icon: "cloud" },
    { id: "data-engineering", label: "Data", icon: "database" },
    { id: "java", label: "Java", icon: "code" },
    { id: "python", label: "Python", icon: "code" },
  ];

  return (
    <div className="mx-auto w-full max-w-[1360px] px-3 sm:px-6 lg:px-8 space-y-6 pb-12 animate-in fade-in duration-150">
      {/* ========================================================
          1. WELCOMING HEADER GREETING
          ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {greeting}, {firstName}!
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Keep going! You're one step closer to your dream career.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
            <Flame className="size-3.5 fill-amber-500 text-amber-500" />
            <span>{streak} Day Streak</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300">
            <Zap className="size-3.5 fill-blue-500 text-blue-500" />
            <span>{store.xp || 1250} XP</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. EXACTLY TWO LARGE LEARNING CARDS (MATCHING MOCKUP)
          ======================================================== */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* ================= CARD 1: TECHNICAL TRACK ================= */}
        <div className="relative flex flex-col justify-between rounded-[28px] border border-blue-100 dark:border-blue-950/60 bg-gradient-to-b from-white via-[#f8fbff] to-[#f2f7ff] dark:from-card dark:via-card dark:to-card p-6 sm:p-8 shadow-sm transition-all hover:shadow-md">
          <div className="space-y-6">
            {/* Card Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <div className="size-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 text-blue-600 dark:text-blue-400 grid place-items-center shadow-2xs">
                  <Code2 className="size-6 stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    Technical Track
                  </h2>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Learn. Build. Grow.
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900 px-3.5 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 font-mono">
                Day {selectedDay || 1}
              </span>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Explore 15 modular engineering specializations with structured lesson plans, interactive simulations, and hands-on coding labs.
            </p>

            {/* Progress & Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center rounded-2xl bg-white/80 dark:bg-muted/20 border border-blue-100/80 dark:border-border/60 p-4.5">
              {/* Circular Progress Gauge */}
              <div className="flex items-center justify-center sm:justify-start gap-4">
                <div className="relative size-24 shrink-0 grid place-items-center">
                  <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-blue-100 dark:text-blue-950"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-blue-600 transition-all duration-700 ease-out"
                      strokeDasharray={`${techCompletionPct}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-lg font-bold font-mono text-foreground leading-none">
                      {techCompletionPct}%
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">Completed</span>
                  </div>
                </div>

                <div className="space-y-1 sm:hidden">
                  <p className="text-xs font-semibold text-foreground">{primaryTrack.name}</p>
                  <p className="text-[11px] text-muted-foreground">Self-Paced Track</p>
                </div>
              </div>

              {/* Stat Points */}
              <div className="space-y-2.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-2.5">
                  <BookOpen className="size-4 text-blue-600 shrink-0" />
                  <span>
                    <strong className="text-foreground font-semibold">3 / 12</strong> Modules Completed
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Code2 className="size-4 text-blue-600 shrink-0" />
                  <span>
                    <strong className="text-foreground font-semibold">5 / 20</strong> Labs Completed
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="size-4 text-blue-600 shrink-0" />
                  <span>
                    <strong className="text-foreground font-semibold">12h 30m</strong> Learning Time
                  </span>
                </div>
              </div>
            </div>

            {/* Track Selector Strip */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-foreground">
                <span className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                  Your Technical Track <ChevronRight className="size-3.5" />
                </span>
                <span className="text-[11px] font-normal text-muted-foreground">
                  Active: {primaryTrack.name}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {availableTrackList.map((t) => {
                  const isActive = primaryTrack.id === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => onSelectTrack && onSelectTrack(t.id)}
                      className={cn(
                        "rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all flex items-center gap-1.5 border",
                        isActive
                          ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                          : "bg-white dark:bg-muted/40 text-muted-foreground hover:text-foreground border-border"
                      )}
                    >
                      <Layers className="size-3" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="pt-6">
            <button
              onClick={() => onStartTechnicalLesson()}
              className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 py-3.5 px-6 text-sm font-bold text-white shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.99] group"
            >
              <Play className="size-4 fill-white transition-transform group-hover:scale-110" />
              <span>Continue Learning</span>
              <ChevronRight className="size-4 ml-0.5" />
            </button>
          </div>
        </div>

        {/* ================= CARD 2: PLACEMENT TRACK ================= */}
        <div className="relative flex flex-col justify-between rounded-[28px] border border-emerald-100 dark:border-emerald-950/60 bg-gradient-to-b from-white via-[#f7fcf9] to-[#edf9f2] dark:from-card dark:via-card dark:to-card p-6 sm:p-8 shadow-sm transition-all hover:shadow-md">
          <div className="space-y-6">
            {/* Card Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <div className="size-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 grid place-items-center shadow-2xs">
                  <Briefcase className="size-6 stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    Placement Track
                  </h2>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Prepare. Practice. Get Hired.
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-900 px-3.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                Day {cohortDay || 1}
              </span>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Join the 90-day placement accelerator with aptitude, English and communication training, live cohort drills, and recruiter mock interviews.
            </p>

            {/* Progress & Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center rounded-2xl bg-white/80 dark:bg-muted/20 border border-emerald-100/80 dark:border-border/60 p-4.5">
              {/* Circular Progress Gauge */}
              <div className="flex items-center justify-center sm:justify-start gap-4">
                <div className="relative size-24 shrink-0 grid place-items-center">
                  <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-emerald-100 dark:text-emerald-950"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-emerald-600 transition-all duration-700 ease-out"
                      strokeDasharray={`${placementCompletionPct}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-lg font-bold font-mono text-foreground leading-none">
                      {placementCompletionPct}%
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">Completed</span>
                  </div>
                </div>

                <div className="space-y-1 sm:hidden">
                  <p className="text-xs font-semibold text-foreground">Placement Cohort</p>
                  <p className="text-[11px] text-muted-foreground">90-Day Accelerator</p>
                </div>
              </div>

              {/* Stat Points */}
              <div className="space-y-2.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-2.5">
                  <Calendar className="size-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong className="text-foreground font-semibold">9 / 90</strong> Days Completed
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Users className="size-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong className="text-foreground font-semibold">2 / 3</strong> Tasks Done Today
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Star className="size-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong className="text-foreground font-semibold">{streak}</strong> Current Streak
                  </span>
                </div>
              </div>
            </div>

            {/* Track Breakdown Strip */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-foreground">
                <span className="flex items-center gap-1 hover:text-emerald-600 transition-colors">
                  Your Placement Track <ChevronRight className="size-3.5" />
                </span>
                <span className="text-[11px] font-normal text-muted-foreground">
                  Synchronized Cohort
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-border bg-white dark:bg-muted/40 p-2.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <Target className="size-3.5 text-emerald-600" />
                    <span>Aptitude</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[30%]" />
                  </div>
                  <p className="text-[10px] text-muted-foreground font-mono">3% Done</p>
                </div>

                <div className="rounded-xl border border-border bg-white dark:bg-muted/40 p-2.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <MessageSquare className="size-3.5 text-emerald-600" />
                    <span>English</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[45%]" />
                  </div>
                  <p className="text-[10px] text-muted-foreground font-mono">12% Done</p>
                </div>

                <div className="rounded-xl border border-border bg-white dark:bg-muted/40 p-2.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <Users className="size-3.5 text-emerald-600" />
                    <span>Communication</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[25%]" />
                  </div>
                  <p className="text-[10px] text-muted-foreground font-mono">8% Done</p>
                </div>
              </div>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="pt-6">
            <button
              onClick={() => onStartPlacementDrill("all")}
              className="w-full rounded-2xl bg-[#16a34a] hover:bg-[#15803d] py-3.5 px-6 text-sm font-bold text-white shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.99] group"
            >
              <Play className="size-4 fill-white transition-transform group-hover:scale-110" />
              <span>Continue Learning</span>
              <ChevronRight className="size-4 ml-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. BOTTOM STATS BANNER (4 SUMMARY CARDS)
          ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-2">
        {/* 1. Total Progress */}
        <Link
          to="/student/technical"
          className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 transition-all hover:bg-muted/40 hover:border-primary/40 shadow-2xs group"
        >
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 grid place-items-center">
              <GraduationCap className="size-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground">Total Progress</p>
              <p className="text-base font-bold text-foreground font-mono">{totalProgressPct}%</p>
            </div>
          </div>
          <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
        </Link>

        {/* 2. Days Completed */}
        <Link
          to="/student/accelerator"
          className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 transition-all hover:bg-muted/40 hover:border-emerald-500/40 shadow-2xs group"
        >
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 grid place-items-center">
              <Calendar className="size-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground">Days Completed</p>
              <p className="text-base font-bold text-foreground font-mono">9 / 90</p>
            </div>
          </div>
          <ChevronRight className="size-4 text-muted-foreground group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5" />
        </Link>

        {/* 3. Current Streak */}
        <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-2xs group">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 grid place-items-center">
              <Star className="size-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground">Current Streak</p>
              <p className="text-base font-bold text-foreground font-mono">{streak} Days</p>
            </div>
          </div>
          <ChevronRight className="size-4 text-muted-foreground opacity-50" />
        </div>

        {/* 4. XP Earned */}
        <Link
          to="/student/leaderboard"
          className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 transition-all hover:bg-muted/40 hover:border-amber-500/40 shadow-2xs group"
        >
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 grid place-items-center">
              <Trophy className="size-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground">XP Earned</p>
              <p className="text-base font-bold text-foreground font-mono">
                {(store.xp || 1250).toLocaleString()}
              </p>
            </div>
          </div>
          <ChevronRight className="size-4 text-muted-foreground group-hover:text-amber-600 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
