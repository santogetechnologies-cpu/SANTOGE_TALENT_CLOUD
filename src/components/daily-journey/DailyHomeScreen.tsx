import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  Flame,
  Zap,
  Clock,
  Play,
  CheckCircle2,
  ArrowRight,
  Code2,
  Timer,
  Layers,
  Terminal,
  Trophy,
  Sparkles,
  ChevronRight,
  HelpCircle,
  Calendar,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { trackById, type TrackId, type Track } from "@/lib/tracks";
import type { AcceleratorDay } from "@/lib/placement-accelerator-data";
import { getScoreTier } from "@/routes/student.index";

interface DailyHomeScreenProps {
  studentName: string;
  cohortDay: number;
  primaryTrack: Track;
  techTopic: string;
  techPractice: string;
  weekTheme: string;
  placementPlan: AcceleratorDay;
  isTechDone: boolean;
  isPlacementDone: boolean;
  streak: number;
  talentScore: number;
  onStartJourney: () => void;
  assignedTracks?: TrackId[] | undefined;
  onSelectTrack?: ((trackId: TrackId) => void) | undefined;
}

export function DailyHomeScreen({
  studentName,
  cohortDay,
  primaryTrack,
  techTopic,
  techPractice,
  weekTheme,
  placementPlan,
  isTechDone,
  isPlacementDone,
  streak,
  talentScore,
  onStartJourney,
  assignedTracks,
  onSelectTrack,
}: DailyHomeScreenProps) {
  // Compute greeting from local time
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  }, []);

  const firstName = studentName ? studentName.split(" ")[0] : "Student";
  const isFullyComplete = isTechDone && isPlacementDone;
  const isPartiallyDone = isTechDone || isPlacementDone;
  const tier = getScoreTier(talentScore);

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12 phase-enter">
      {/* Top Greeting & Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 font-mono text-xs font-semibold text-primary">
              Day {cohortDay} of 90
            </span>
            <span className="text-xs text-muted-foreground">· Synchronized Cohort</span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {greeting}, {firstName} 👋
          </h1>
          <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">
            Your single unified 20-minute daily routine for career readiness and technical mastery.
          </p>
        </div>

        {/* Status Chips */}
        <div className="flex items-center gap-2 sm:flex-col sm:items-end">
          <div className="flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <Flame className="size-3.5 fill-amber-500 text-amber-500" />
            <span>{streak} Day Streak</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Trophy className="size-3.5 text-primary" />
            <span>Score: {talentScore}/1000</span>
          </div>
        </div>
      </div>

      {/* Course Switcher: If multiple courses are assigned */}
      {assignedTracks && assignedTracks.length > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3.5 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BookOpen className="size-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-foreground">
                Assigned Technical Specializations ({assignedTracks.length})
              </h4>
              <p className="text-[11px] text-muted-foreground">
                Select which specialization to study &amp; practice today:
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {assignedTracks.map((tId) => {
              const trk = trackById(tId);
              const isActive = tId === primaryTrack.id;
              return (
                <button
                  key={tId}
                  type="button"
                  onClick={() => onSelectTrack && onSelectTrack(tId)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs ring-1 ring-primary"
                      : "border border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-muted/60",
                  )}
                >
                  <span
                    className={cn("size-2 rounded-full", isActive ? "bg-white" : "")}
                    style={!isActive ? { background: trk.accent } : undefined}
                  />
                  <span>{trk.name}</span>
                  {isActive && <span className="font-mono text-[10px] opacity-90">✓ Active</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Focus Card: The 20-Minute Daily Journey */}
      <div className="journey-card relative overflow-hidden p-6 sm:p-8">
        {/* Subtle accent glow top border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-indigo-500 to-emerald-500" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary uppercase tracking-wider">
                Daily Focus
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                <Clock className="size-3 text-primary" /> 20 Minutes
              </span>
              <span className="flex items-center gap-1 text-xs text-amber-500 font-mono font-semibold">
                <Zap className="size-3 fill-amber-500" /> +75 XP
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Day {cohortDay}: {techTopic}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Specialization: <strong className="text-foreground">{primaryTrack.name}</strong> · Placement Module: <strong className="text-foreground">{placementPlan.theme}</strong>
            </p>
          </div>

          {/* Action CTA Button */}
          <button
            onClick={onStartJourney}
            className={cn(
              "flex items-center justify-center gap-2.5 rounded-xl px-6 py-3.5 text-sm font-semibold transition-all shadow-md cursor-pointer shrink-0",
              isFullyComplete
                ? "bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-500/20"
                : isPartiallyDone
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20"
                  : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20 hover:scale-[1.02]",
            )}
          >
            {isFullyComplete ? (
              <>
                <CheckCircle2 className="size-4" />
                <span>Review Today's Journey</span>
              </>
            ) : isPartiallyDone ? (
              <>
                <Play className="size-4 fill-current" />
                <span>Resume Today's Drill</span>
              </>
            ) : (
              <>
                <Play className="size-4 fill-current" />
                <span>START TODAY (20 MIN)</span>
              </>
            )}
            <ArrowRight className="size-4" />
          </button>
        </div>

        {/* Twin Phase Breakdown: 10m Tech + 10m Placement */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {/* Phase 1: Technical Mastery */}
          <div
            className={cn(
              "rounded-xl border p-4.5 space-y-3 transition-colors",
              isTechDone
                ? "border-emerald-500/30 bg-emerald-500/5"
                : "border-border bg-card/60",
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Code2 className="size-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-foreground">
                    Phase 1: Technical Skill
                  </h3>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    10 min · Hands-on Lab
                  </span>
                </div>
              </div>

              {isTechDone ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-3" /> Done
                </span>
              ) : (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                  +50 XP
                </span>
              )}
            </div>

            <div className="space-y-1 text-xs">
              <p className="font-medium text-foreground line-clamp-1">{techTopic}</p>
              <p className="text-[11px] text-muted-foreground line-clamp-2">{techPractice}</p>
            </div>

            <div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground">
              <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                {primaryTrack.short}
              </span>
              <span>{weekTheme}</span>
            </div>
          </div>

          {/* Phase 2: Placement Accelerator */}
          <div
            className={cn(
              "rounded-xl border p-4.5 space-y-3 transition-colors",
              isPlacementDone
                ? "border-emerald-500/30 bg-emerald-500/5"
                : "border-border bg-card/60",
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                  <Timer className="size-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-foreground">
                    Phase 2: Placement Accelerator
                  </h3>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    10 min · Voice &amp; Aptitude
                  </span>
                </div>
              </div>

              {isPlacementDone ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-3" /> Done
                </span>
              ) : (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                  +25 XP
                </span>
              )}
            </div>

            <div className="space-y-1 text-xs">
              <p className="font-medium text-foreground line-clamp-1">{placementPlan.theme}</p>
              <p className="text-[11px] text-muted-foreground line-clamp-2">
                {placementPlan.english.title} &amp; {placementPlan.aptitude.title}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground">
              <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">STAR</span>
              <span>60s Voice Pitch Challenge</span>
            </div>
          </div>
        </div>

        {/* Progress Bar through 90 Days */}
        <div className="mt-6 pt-5 border-t border-border/70 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Overall 90-Day Cohort Journey</span>
            <span className="font-mono font-medium text-foreground">
              {Math.round((cohortDay / 90) * 100)}% ({cohortDay} / 90 Days)
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${(cohortDay / 90) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Helpful Secondary Links Banner */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          to="/student/technical"
          className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:bg-muted/30 shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-foreground group-hover:text-primary transition-colors">
              <Layers className="size-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-foreground">90-Day Journey &amp; Backlog</h4>
              <p className="text-[11px] text-muted-foreground">
                Review past days or preview upcoming weeks
              </p>
            </div>
          </div>
          <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          to="/student/labs"
          className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:bg-muted/30 shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-foreground group-hover:text-primary transition-colors">
              <Terminal className="size-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-foreground">Interactive Sandbox IDE</h4>
              <p className="text-[11px] text-muted-foreground">
                Practice in the full-screen terminal simulator
              </p>
            </div>
          </div>
          <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>
    </div>
  );
}
