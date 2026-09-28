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
  Dumbbell,
  Workflow,
  Video,
  Calculator,
  BrainCircuit,
} from "lucide-react";
import { cn, getScoreTier } from "@/lib/utils";
import { trackById, type TrackId, type Track } from "@/lib/tracks";
import type { AcceleratorDay } from "@/lib/placement-accelerator-data";
import type { JourneyStepId } from "./JourneyProgressBar";
import { useAppStore } from "@/lib/app-store";

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
  onStartJourney: (stepId?: JourneyStepId) => void;
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
  const tier = getScoreTier(talentScore);
  const store = useAppStore();

  // Compute realtime status for each of the 7 daily steps
  const stepRecords = useMemo(() => {
    const s1Done = Boolean(store.getDailyStepRecord(cohortDay, primaryTrack.id, "tech-concept")?.isLocked || isTechDone);
    const s2Done = Boolean(store.getDailyStepRecord(cohortDay, primaryTrack.id, "tech-visual")?.isLocked || isTechDone);
    const s3Done = Boolean(store.getDailyStepRecord(cohortDay, primaryTrack.id, "tech-check")?.isLocked || isTechDone);
    const s4Done = Boolean(store.getDailyStepRecord(cohortDay, primaryTrack.id, "tech-sandbox")?.isLocked || isTechDone);

    const s5Done = Boolean(
      store.profile.daily?.english ||
      isPlacementDone ||
      store.getDailyStepRecord(cohortDay, primaryTrack.id, "placement-communication")?.isLocked
    );
    const s6Done = Boolean(
      store.profile.daily?.aptitude ||
      isPlacementDone ||
      store.getDailyStepRecord(cohortDay, primaryTrack.id, "placement-aptitude")?.isLocked
    );
    const s7Done = Boolean(
      store.profile.daily?.practice ||
      isPlacementDone ||
      store.getDailyStepRecord(cohortDay, primaryTrack.id, "placement-logic")?.isLocked
    );

    const stepsRaw = [
      {
        id: "tech-concept" as JourneyStepId,
        stepNum: 1,
        label: "Core Concept",
        phase: "tech" as const,
        duration: "2m",
        xp: "Base",
        isDone: s1Done,
        icon: BookOpen,
        summary: techTopic,
      },
      {
        id: "tech-visual" as JourneyStepId,
        stepNum: 2,
        label: "Architecture",
        phase: "tech" as const,
        duration: "2m",
        xp: "Flow",
        isDone: s2Done,
        icon: Workflow,
        summary: "Pipeline Visualizer",
      },
      {
        id: "tech-check" as JourneyStepId,
        stepNum: 3,
        label: "Quick Check",
        phase: "tech" as const,
        duration: "2m",
        xp: "+15 XP",
        isDone: s3Done,
        icon: HelpCircle,
        summary: "Technical MCQ",
      },
      {
        id: "tech-sandbox" as JourneyStepId,
        stepNum: 4,
        label: "Guided Lab",
        phase: "tech" as const,
        duration: "4m",
        xp: "+50 XP",
        isDone: s4Done,
        icon: Terminal,
        summary: "WASM Test Suite",
      },
      {
        id: "placement-communication" as JourneyStepId,
        stepNum: 5,
        label: "Communication",
        phase: "placement" as const,
        duration: "2m",
        xp: "+10 XP",
        isDone: s5Done,
        icon: Video,
        summary: placementPlan.english.title,
      },
      {
        id: "placement-aptitude" as JourneyStepId,
        stepNum: 6,
        label: "Aptitude Drill",
        phase: "placement" as const,
        duration: "3m",
        xp: "+15 XP",
        isDone: s6Done,
        icon: Calculator,
        summary: placementPlan.aptitude.title,
      },
      {
        id: "placement-logic" as JourneyStepId,
        stepNum: 7,
        label: "Logic Puzzle",
        phase: "placement" as const,
        duration: "2m",
        xp: "+25 XP",
        isDone: s7Done,
        icon: BrainCircuit,
        summary: "Analytical Reasoning",
      },
    ];

    let foundFirstIncomplete = false;
    return stepsRaw.map((st) => {
      let status: "completed" | "current" | "pending" = "pending";
      if (st.isDone) {
        status = "completed";
      } else if (!foundFirstIncomplete) {
        status = "current";
        foundFirstIncomplete = true;
      } else {
        status = "pending";
      }
      return { ...st, status };
    });
  }, [cohortDay, primaryTrack.id, isTechDone, isPlacementDone, techTopic, placementPlan, store]);

  const completedStepsCount = useMemo(
    () => stepRecords.filter((s) => s.status === "completed").length,
    [stepRecords],
  );

  const activeStep = useMemo(
    () => stepRecords.find((s) => s.status === "current") || stepRecords[0]!,
    [stepRecords],
  );

  const isFullyComplete = completedStepsCount === 7 || (isTechDone && isPlacementDone);
  const isPartiallyDone = completedStepsCount > 0 || isTechDone || isPlacementDone;

  const ctaButtonText = useMemo(() => {
    if (isFullyComplete) return "Review Today's 7 Steps (100% ✓)";
    if (completedStepsCount === 0) return "START TODAY (STEP 1: CORE CONCEPT)";
    return `RESUME STEP ${activeStep.stepNum}: ${activeStep.label.toUpperCase()}`;
  }, [isFullyComplete, completedStepsCount, activeStep]);

  return (
    <div className="w-full space-y-6 pb-12 phase-enter">
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
                <Zap className="size-3 fill-amber-500" /> +75 XP Max
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
            onClick={() => onStartJourney(activeStep.id)}
            className={cn(
              "flex items-center justify-center gap-2.5 rounded-xl px-6 py-3.5 text-sm font-semibold transition-all shadow-md cursor-pointer shrink-0",
              isFullyComplete
                ? "bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-500/20"
                : isPartiallyDone
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20 hover:scale-[1.01]"
                  : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20 hover:scale-[1.02]",
            )}
          >
            {isFullyComplete ? (
              <>
                <CheckCircle2 className="size-4" />
                <span>Review Today's 7 Steps</span>
              </>
            ) : (
              <>
                <Play className="size-4 fill-current" />
                <span>{ctaButtonText}</span>
              </>
            )}
            <ArrowRight className="size-4" />
          </button>
        </div>

        {/* 7-Step Daily Cadence Flow */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Today's 7-Step Cadence
              </span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold text-primary">
                {completedStepsCount} / 7 Completed
              </span>
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              {Math.round((completedStepsCount / 7) * 100)}% Complete Today
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {stepRecords.map((step) => {
              const Icon = step.icon;
              const isCurrent = step.status === "current";
              const isCompleted = step.status === "completed";

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => onStartJourney(step.id)}
                  className={cn(
                    "group relative flex flex-col justify-between rounded-xl border p-3 text-left transition-all cursor-pointer",
                    isCompleted
                      ? "border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500 hover:bg-emerald-500/10 shadow-2xs"
                      : isCurrent
                        ? "border-primary bg-primary/10 ring-2 ring-primary/30 shadow-xs hover:bg-primary/15"
                        : "border-border/70 bg-card/60 opacity-80 hover:opacity-100 hover:border-primary/40 hover:bg-muted/40",
                  )}
                >
                  {/* Top Row: Step # and Status Badge */}
                  <div className="flex items-center justify-between gap-1 w-full">
                    <span
                      className={cn(
                        "flex size-5 items-center justify-center rounded-md font-mono text-[10px] font-bold",
                        isCompleted
                          ? "bg-emerald-500 text-white"
                          : isCurrent
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {isCompleted ? "✓" : step.stepNum}
                    </span>

                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[9px] font-mono font-semibold",
                        isCompleted
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : isCurrent
                            ? "bg-primary/20 text-primary animate-pulse"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {isCompleted ? "Done" : isCurrent ? "Active" : step.duration}
                    </span>
                  </div>

                  {/* Icon & Label */}
                  <div className="mt-2.5 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Icon
                        className={cn(
                          "size-3.5 shrink-0",
                          isCompleted
                            ? "text-emerald-500"
                            : isCurrent
                              ? "text-primary"
                              : "text-muted-foreground group-hover:text-foreground",
                        )}
                      />
                      <span className="font-semibold text-xs text-foreground line-clamp-1">
                        {step.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-1 leading-tight">
                      {step.summary}
                    </p>
                  </div>

                  {/* Bottom XP Badge */}
                  <div className="mt-2 pt-1.5 border-t border-border/50 flex items-center justify-between text-[10px]">
                    <span className="font-mono text-muted-foreground text-[9px] uppercase">
                      {step.phase === "tech" ? "Tech" : "Placement"}
                    </span>
                    <span
                      className={cn(
                        "font-mono font-medium text-[10px]",
                        isCompleted
                          ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                          : isCurrent
                            ? "text-primary font-semibold"
                            : "text-muted-foreground",
                      )}
                    >
                      {step.xp}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
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
                    8 min · Aptitude &amp; Reasoning
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
              <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">LOGIC</span>
              <span>Analytical Reasoning &amp; Problem Solving</span>
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
      <div className="grid gap-3 sm:grid-cols-3">
        <Link
          to="/student/exercises"
          className="group flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 p-4 transition-all hover:border-primary/60 hover:bg-primary/10 shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/20 text-primary group-hover:scale-105 transition-all">
              <Dumbbell className="size-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-foreground">Daily Exercise Dashboard</h4>
              <p className="text-[11px] text-muted-foreground">
                Speed math, Corporate English &amp; Code drills
              </p>
            </div>
          </div>
          <ChevronRight className="size-4 text-primary group-hover:translate-x-0.5 transition-all" />
        </Link>

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
