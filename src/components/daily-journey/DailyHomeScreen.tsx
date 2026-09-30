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
  ChevronLeft,
  HelpCircle,
  Calendar,
  BookOpen,
  Dumbbell,
  Workflow,
  Video,
  Calculator,
  BrainCircuit,
  Lock,
  Gamepad2,
  Award,
  FolderGit2,
  GraduationCap,
  Check,
} from "lucide-react";
import { cn, getScoreTier } from "@/lib/utils";
import { trackById, type TrackId, type Track } from "@/lib/tracks";
import { getAcceleratorDay, type AcceleratorDay } from "@/lib/placement-accelerator-data";
import { useAppStore } from "@/lib/app-store";
import {
  getLessonForDay,
  type CourseDayLesson,
  type LessonStep,
  type LessonStepType,
} from "@/lib/course-curricula";

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

function getStepIcon(type: LessonStepType) {
  switch (type) {
    case "animated-intro":
      return Play;
    case "concept-explanation":
    case "reveal-card":
      return BookOpen;
    case "concept-visual":
      return Workflow;
    case "mini-game":
      return Gamepad2;
    case "knowledge-check":
      return HelpCircle;
    case "guided-sandbox":
    case "practical-challenge":
      return Terminal;
    case "ai-tutor":
      return BrainCircuit;
    case "real-world-example":
      return Layers;
    case "xp-reward":
      return Zap;
    case "daily-completion":
      return Award;
    default:
      return Sparkles;
  }
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

  // Compute greeting from local time
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  }, []);

  const firstName = studentName ? studentName.split(" ")[0] : "Student";

  // Load the authoritative 90-day technical curriculum lesson
  const curriculumLesson: CourseDayLesson | null = useMemo(() => {
    return getLessonForDay(primaryTrack.id, selectedDay);
  }, [primaryTrack.id, selectedDay]);

  // Load the synchronized course-specific placement accelerator day plan
  const placementPlan: AcceleratorDay = useMemo(() => {
    return getAcceleratorDay(cohortDay, primaryTrack.id);
  }, [cohortDay, primaryTrack.id]);

  // Day locking & completion states
  const isDayCompleted = completedTechDays.includes(selectedDay);
  const isDayLocked = selectedDay > currentTechnicalDay;
  const isDayCurrent = selectedDay === currentTechnicalDay;

  // Placement completion states for cohortDay
  const isPlacementDone = attendance.includes(cohortDay);
  const isEnglishDone = Boolean(store.profile.daily?.english || isPlacementDone);
  const isAptitudeDone = Boolean(store.profile.daily?.aptitude || isPlacementDone);
  const isLogicDone = Boolean(store.profile.daily?.practice || isPlacementDone);

  // Compute realtime status for each dynamic lesson step
  // Compute realtime status for each dynamic lesson step (5 canonical technical mastery steps)
  const dynamicSteps = useMemo(() => {
    const s1Done = Boolean(store.getDailyStepRecord(selectedDay, primaryTrack.id, "tech-concept")?.isLocked || isDayCompleted);
    const s2Done = Boolean(store.getDailyStepRecord(selectedDay, primaryTrack.id, "tech-visual")?.isLocked || isDayCompleted);
    const s3Done = Boolean(store.getDailyStepRecord(selectedDay, primaryTrack.id, "tech-minigame")?.isLocked || isDayCompleted);
    const s4Done = Boolean(store.getKnowledgeCheck(selectedDay, primaryTrack.id)?.isLocked || store.getDailyStepRecord(selectedDay, primaryTrack.id, "tech-check")?.isLocked || isDayCompleted);
    const s5Done = Boolean(store.getDailyStepRecord(selectedDay, primaryTrack.id, "tech-sandbox")?.isLocked || isDayCompleted);

    const canonicalSteps = [
      {
        stepId: "tech-concept" as const,
        type: "concept-explanation" as const,
        label: "Core Concept",
        durationMinutes: 2,
        xpReward: 15,
        isDone: s1Done,
        description: curriculumLesson?.description || "Master foundational architecture and principles",
      },
      {
        stepId: "tech-visual" as const,
        type: "concept-visual" as const,
        label: "Architecture",
        durationMinutes: 2,
        xpReward: 15,
        isDone: s2Done,
        description: "Interactive visual system & pipeline explorer",
      },
      {
        stepId: "tech-minigame" as const,
        type: "mini-game" as const,
        label: curriculumLesson?.miniGame?.title || "Mini-Game Challenge",
        durationMinutes: 3,
        xpReward: 15,
        isDone: s3Done,
        description: curriculumLesson?.miniGame?.instruction || "Hands-on interactive challenge",
      },
      {
        stepId: "tech-check" as const,
        type: "knowledge-check" as const,
        label: "Knowledge Check",
        durationMinutes: 2,
        xpReward: 15,
        isDone: s4Done,
        description: "Verify conceptual mastery before lab execution",
      },
      {
        stepId: "tech-sandbox" as const,
        type: "guided-sandbox" as const,
        label: "Guided Lab",
        durationMinutes: 4,
        xpReward: 20,
        isDone: s5Done,
        description: "Production simulation with terminal execution",
      },
    ];

    let foundFirstIncomplete = false;

    return canonicalSteps.map((st, idx) => {
      let status: "completed" | "current" | "pending" | "locked" = "pending";
      if (isDayLocked) {
        status = "locked";
      } else if (st.isDone) {
        status = "completed";
      } else if (!foundFirstIncomplete) {
        status = "current";
        foundFirstIncomplete = true;
      } else {
        status = "pending";
      }

      return {
        ...st,
        stepNum: idx + 1,
        status,
        IconComponent: getStepIcon(st.type),
      };
    });
  }, [curriculumLesson, selectedDay, primaryTrack.id, isDayCompleted, isDayLocked, store]);

  const completedStepsCount = useMemo(
    () => dynamicSteps.filter((s) => s.isDone).length,
    [dynamicSteps],
  );

  const activeStep = useMemo(
    () => dynamicSteps.find((s) => s.status === "current") || dynamicSteps[0],
    [dynamicSteps],
  );

  const lessonXp = useMemo(() => {
    if (selectedDay === 90) return 200;
    if (curriculumLesson?.isProjectDay) return 100;
    return 75;
  }, [selectedDay, curriculumLesson]);

  // CTA Button Text
  const ctaButtonText = useMemo(() => {
    if (isDayLocked) {
      return `Complete Day ${selectedDay - 1} First`;
    }
    if (isDayCompleted) {
      return `Review Day ${selectedDay} Lesson (100% ✓)`;
    }
    if (selectedDay === 90) {
      return `Begin Day 90 Final Assessment (+200 XP)`;
    }
    if (curriculumLesson?.isProjectDay) {
      return `Launch Capstone Workspace (+100 XP)`;
    }
    if (completedStepsCount === 0) {
      return `Start Day ${selectedDay} Lesson (+${lessonXp} XP)`;
    }
    return `Continue Step ${activeStep?.stepNum ?? 1}: ${activeStep?.label ?? "Lesson"}`;
  }, [isDayLocked, isDayCompleted, selectedDay, curriculumLesson, completedStepsCount, activeStep, lessonXp]);

  // Dual Completion Gate Status
  const isDualGateCleared = completedTechDays.length >= 90 && attendance.length >= 90;

  // 90-Day rail display window (shows 9 adjacent days centered around selectedDay)
  const dayWindow = useMemo(() => {
    const start = Math.max(1, Math.min(82, selectedDay - 4));
    return Array.from({ length: 9 }, (_, i) => start + i);
  }, [selectedDay]);

  return (
    <div className="w-full space-y-6 pb-12 phase-enter">
      {/* Top Greeting & Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 font-mono text-xs font-semibold text-primary">
              Day {selectedDay} of 90
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              · {primaryTrack.name}
            </span>
            {isDayCompleted && (
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                ✓ Completed
              </span>
            )}
            {isDayLocked && (
              <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Lock className="size-2.5" /> Locked
              </span>
            )}
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {greeting}, {firstName} 👋
          </h1>
          <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">
            Specialized 90-day technical curriculum with evidence-based workplace mastery.
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
            <span>Talent Score: {talentScore}/1000</span>
          </div>
        </div>
      </div>

      {/* Course Switcher: If multiple courses are assigned to this student */}
      {assignedTracks && assignedTracks.length > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3.5 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BookOpen className="size-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-foreground">
                Assigned Technical Tracks ({assignedTracks.length})
              </h4>
              <p className="text-[11px] text-muted-foreground">
                Switch technical specialization to learn &amp; build today:
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

      {/* 90-Day Progression Track & Day Picker */}
      <div className="rounded-xl border border-border bg-card/80 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground">
              90-Day Technical Progression
            </span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary font-mono">
              {completedTechDays.length} / 90 Days Completed ({Math.round((completedTechDays.length / 90) * 100)}%)
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {selectedDay !== currentTechnicalDay && (
              <button
                onClick={() => onSelectDay(currentTechnicalDay)}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                Jump to Current Day ({currentTechnicalDay}) →
              </button>
            )}
            <span className="text-muted-foreground">
              Phase {curriculumLesson?.phase ?? 1} of 6: <strong className="text-foreground">{curriculumLesson?.phaseName ?? "Foundation"}</strong>
            </span>
          </div>
        </div>

        {/* Days Rail / Mini Navigator */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1">
          {selectedDay > 5 && (
            <button
              onClick={() => onSelectDay(Math.max(1, selectedDay - 5))}
              className="px-2 py-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted text-[11px] font-medium shrink-0"
              title="Previous days"
            >
              <ChevronLeft className="size-3.5" />
            </button>
          )}

          {dayWindow.map((d) => {
            const isCompleted = completedTechDays.includes(d);
            const isCurrent = d === currentTechnicalDay;
            const isSelected = d === selectedDay;
            const isLocked = d > currentTechnicalDay;

            return (
              <button
                key={d}
                type="button"
                onClick={() => onSelectDay(d)}
                className={cn(
                  "flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-xs ring-2 ring-primary/40 font-bold"
                    : isCompleted
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                      : isCurrent
                        ? "bg-primary/10 text-primary border border-primary/30 animate-pulse hover:bg-primary/20"
                        : isLocked
                          ? "bg-muted/40 text-muted-foreground/60 border border-border/40 hover:bg-muted/70 cursor-not-allowed"
                          : "bg-muted/60 text-muted-foreground border border-border hover:bg-muted hover:text-foreground",
                )}
                title={isLocked ? `Day ${d} is locked. Complete Day ${d - 1} first.` : `Day ${d}`}
              >
                {isCompleted ? (
                  <Check className="size-3 stroke-[3]" />
                ) : isLocked ? (
                  <Lock className="size-2.5 opacity-60" />
                ) : null}
                <span>Day {d}</span>
                {isCurrent && !isCompleted && !isSelected && (
                  <span className="size-1.5 rounded-full bg-primary" />
                )}
              </button>
            );
          })}

          {selectedDay < 85 && (
            <button
              onClick={() => onSelectDay(Math.min(90, selectedDay + 5))}
              className="px-2 py-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted text-[11px] font-medium shrink-0"
              title="Next days"
            >
              <ChevronRight className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ========================================================
          HERO CARD: DAY N OF 90 (PRIMARY TECHNICAL LEARNING)
          ======================================================== */}
      <div className="journey-card relative overflow-hidden p-6 sm:p-8">
        {/* Subtle accent glow top border */}
        <div
          className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-indigo-500 to-emerald-500"
          style={{ background: primaryTrack.accent ? `linear-gradient(90deg, ${primaryTrack.accent}, var(--color-primary))` : undefined }}
        />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-border/70 pb-6">
          <div className="space-y-2 max-w-3xl">
            {/* Phase & Topic Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-semibold text-primary uppercase tracking-wider">
                Phase {curriculumLesson?.phase ?? 1}: {curriculumLesson?.phaseName ?? "Foundation"}
              </span>

              {curriculumLesson?.isProjectDay && selectedDay < 90 && (
                <span className="rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 px-2.5 py-0.5 text-[10px] font-bold flex items-center gap-1">
                  <FolderGit2 className="size-3" /> Capstone Milestone
                </span>
              )}

              {selectedDay === 90 && (
                <span className="rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold flex items-center gap-1">
                  <GraduationCap className="size-3" /> Graduation Certification
                </span>
              )}

              <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                <Clock className="size-3 text-primary" /> {curriculumLesson?.estimatedMinutes ?? 20} Minutes
              </span>

              <span className="flex items-center gap-1 text-xs text-amber-500 font-mono font-semibold">
                <Zap className="size-3 fill-amber-500" /> +{lessonXp} XP Max
              </span>

              {curriculumLesson?.difficulty && (
                <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground uppercase">
                  {curriculumLesson.difficulty}
                </span>
              )}
            </div>

            {/* Lesson Title & Course */}
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-wider">
                Day {selectedDay} of 90 · {primaryTrack.name}
              </p>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground mt-0.5">
                {curriculumLesson?.title || `Day ${selectedDay} Technical Lesson`}
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {curriculumLesson?.description || "Master core production architecture and workplace execution."}
            </p>

            {/* Learning Objectives tags */}
            {curriculumLesson?.learningObjectives && curriculumLesson.learningObjectives.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {curriculumLesson.learningObjectives.slice(0, 3).map((obj, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-md bg-muted/60 border border-border/60 px-2 py-0.5 text-[11px] text-muted-foreground"
                  >
                    <CheckCircle2 className="size-2.5 text-primary" /> {obj}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action CTA Button */}
          <div className="flex flex-col items-start lg:items-end gap-2 shrink-0">
            <button
              onClick={() => {
                if (isDayLocked) return;
                onStartTechnicalLesson(activeStep ? activeStep.stepId : undefined);
              }}
              disabled={isDayLocked}
              className={cn(
                "flex items-center justify-center gap-2.5 rounded-xl px-6 py-3.5 text-sm font-semibold transition-all shadow-md cursor-pointer shrink-0",
                isDayLocked
                  ? "bg-muted text-muted-foreground cursor-not-allowed opacity-60 shadow-none"
                  : isDayCompleted
                    ? "bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-500/20 hover:scale-[1.01]"
                    : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20 hover:scale-[1.02]",
              )}
            >
              {isDayLocked ? (
                <>
                  <Lock className="size-4" />
                  <span>{ctaButtonText}</span>
                </>
              ) : isDayCompleted ? (
                <>
                  <CheckCircle2 className="size-4" />
                  <span>{ctaButtonText}</span>
                  <ArrowRight className="size-4" />
                </>
              ) : (
                <>
                  <Play className="size-4 fill-current" />
                  <span>{ctaButtonText}</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>

            {isDayLocked ? (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                Complete Day {selectedDay - 1} to unlock this lesson.
              </p>
            ) : isDayCompleted ? (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                Day {selectedDay} verified! Review any step anytime.
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground font-mono">
                {completedStepsCount} of {dynamicSteps.length} steps completed
              </p>
            )}
          </div>
        </div>

        {/* Progress Bar through Today's Lesson Steps */}
        <div className="mt-6 pt-2 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              Today's Technical Mastery Progress
            </span>
            <span className="font-mono font-medium text-foreground">
              {isDayCompleted ? 100 : Math.round((completedStepsCount / Math.max(1, dynamicSteps.length)) * 100)}% Complete
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                isDayCompleted ? "bg-emerald-500" : "bg-primary",
              )}
              style={{
                width: `${isDayCompleted ? 100 : Math.round((completedStepsCount / Math.max(1, dynamicSteps.length)) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* ========================================================
          SECTION 1: TODAY'S TECHNICAL MASTERY (DYNAMIC STEPS)
          ======================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <Code2 className="size-5 text-primary" />
              TODAY'S TECHNICAL MASTERY
            </h3>
            <p className="text-xs text-muted-foreground">
              {primaryTrack.name} · Day {selectedDay} · Dynamic step-by-step workflow
            </p>
          </div>

          <span className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-mono font-bold text-primary">
            {isDayCompleted ? dynamicSteps.length : completedStepsCount} / {dynamicSteps.length} Done
          </span>
        </div>

        {/* Case 1: Capstone Days 76–89 Project Mode Card */}
        {curriculumLesson?.isProjectDay && selectedDay < 90 && curriculumLesson.projectConfig ? (
          <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 px-2.5 py-0.5 text-[11px] font-bold">
                  Capstone Milestone · Day {selectedDay}
                </span>
                <h4 className="text-lg font-bold text-foreground">
                  {curriculumLesson.projectConfig.projectTitle}
                </h4>
                <p className="text-xs text-muted-foreground">
                  Milestone: <strong className="text-foreground">{curriculumLesson.projectConfig.milestone.title}</strong>
                </p>
              </div>

              <button
                onClick={() => onStartTechnicalLesson("capstone-project")}
                disabled={isDayLocked}
                className="flex items-center gap-2 rounded-xl bg-purple-600 text-white px-5 py-2.5 text-xs font-semibold hover:bg-purple-500 transition-colors shadow-xs cursor-pointer shrink-0"
              >
                <FolderGit2 className="size-4" />
                <span>Open Capstone Project Workspace</span>
              </button>
            </div>

            <div className="rounded-lg bg-card border border-border p-4 space-y-2">
              <p className="text-xs font-semibold text-foreground">Required Deliverable:</p>
              <p className="text-xs text-muted-foreground">{curriculumLesson.projectConfig.milestone.deliverable}</p>
              <div className="pt-2">
                <p className="text-[11px] font-semibold text-foreground mb-1.5">Acceptance Criteria Checklist:</p>
                <ul className="space-y-1">
                  {curriculumLesson.projectConfig.milestone.acceptanceCriteria.map((c, i) => (
                    <li key={i} className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-purple-500" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : selectedDay === 90 ? (
          /* Case 2: Day 90 Final Assessment Card */
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-2.5 py-0.5 text-[11px] font-bold">
                  Final Assessment · Day 90
                </span>
                <h4 className="text-lg font-bold text-foreground">
                  90-Day Industry Capstone &amp; Certification Exam
                </h4>
                <p className="text-xs text-muted-foreground">
                  Track: <strong className="text-foreground">{primaryTrack.name}</strong> · Passing threshold: 60% · 200 XP
                </p>
              </div>

              <button
                onClick={() => onStartTechnicalLesson("final-assessment")}
                disabled={isDayLocked}
                className="flex items-center gap-2 rounded-xl bg-amber-600 text-white px-5 py-2.5 text-xs font-semibold hover:bg-amber-500 transition-colors shadow-xs cursor-pointer shrink-0"
              >
                <GraduationCap className="size-4" />
                <span>Begin Certification Exam</span>
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              This comprehensive assessment covers all phases (Foundations, Core, Applied, Intermediate, Advanced) and unlocks your verified Industry Readiness Certificate.
            </p>
          </div>
        ) : (
          /* Case 3: Regular Daily Technical Steps Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {dynamicSteps.map((step) => {
              const Icon = step.IconComponent;
              const isCompleted = step.status === "completed";
              const isCurrent = step.status === "current";
              const isLocked = step.status === "locked";

              return (
                <button
                  key={`${step.type}-${step.stepNum}`}
                  type="button"
                  onClick={() => {
                    if (isDayLocked) return;
                    onStartTechnicalLesson(step.stepId);
                  }}
                  disabled={isDayLocked}
                  className={cn(
                    "group relative flex flex-col justify-between rounded-xl border p-4 text-left transition-all",
                    isLocked
                      ? "border-border/40 bg-card/40 opacity-50 cursor-not-allowed"
                      : isCompleted
                        ? "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500 hover:bg-emerald-500/10 cursor-pointer shadow-2xs"
                        : isCurrent
                          ? "border-primary bg-primary/10 ring-2 ring-primary/30 shadow-xs hover:bg-primary/15 cursor-pointer"
                          : "border-border/70 bg-card/70 hover:border-primary/40 hover:bg-muted/40 cursor-pointer",
                  )}
                >
                  {/* Step Top Bar: # and Status */}
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={cn(
                        "flex size-6 items-center justify-center rounded-md font-mono text-xs font-bold",
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
                        "rounded px-2 py-0.5 text-[10px] font-mono font-semibold",
                        isCompleted
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : isCurrent
                            ? "bg-primary/20 text-primary animate-pulse"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {isCompleted ? "Done" : isCurrent ? "Active" : `${step.durationMinutes}m`}
                    </span>
                  </div>

                  {/* Step Icon & Title */}
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <Icon
                        className={cn(
                          "size-4 shrink-0",
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

                    <p className="text-[11px] text-muted-foreground line-clamp-1">
                      {step.type === "mini-game"
                        ? curriculumLesson?.miniGame?.title || "Interactive Game Challenge"
                        : step.type === "concept-visual"
                          ? "Pipeline Visualizer & Animation"
                          : step.type === "knowledge-check"
                            ? "Concept Mastery MCQ"
                            : step.type === "guided-sandbox"
                              ? "Hands-on Practical Lab"
                              : curriculumLesson?.title || "Core Technical Concept"}
                    </p>
                  </div>

                  {/* Step Bottom: XP Badge */}
                  <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between text-[10px]">
                    <span className="font-mono text-muted-foreground text-[10px] uppercase">
                      {step.type.replace("-", " ")}
                    </span>
                    <span
                      className={cn(
                        "font-mono font-semibold text-[10px]",
                        isCompleted
                          ? "text-emerald-600 dark:text-emerald-400"
                          : isCurrent
                            ? "text-primary"
                            : "text-muted-foreground",
                      )}
                    >
                      +{step.xpReward > 0 ? step.xpReward : 15} XP
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================
          SECTION 2: PLACEMENT ACCELERATOR (SEPARATE & DISTINCT)
          ======================================================== */}
      <div className="rounded-2xl border border-purple-500/20 bg-purple-500/[0.02] p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Timer className="size-3.5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-foreground uppercase tracking-wide">
                PLACEMENT ACCELERATOR
              </h3>
              <span className="rounded-full bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 text-[10px] font-bold text-purple-600 dark:text-purple-400 font-mono">
                Cohort Day {cohortDay} of 90
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Daily 8-minute synchronized cohort routine for verbal communication, aptitude math, and logic readiness.
            </p>
          </div>

          <button
            onClick={() => onStartPlacementDrill("all")}
            className="flex items-center gap-2 rounded-xl bg-purple-600 text-white px-4 py-2 text-xs font-semibold hover:bg-purple-500 transition-colors shadow-xs cursor-pointer shrink-0"
          >
            <Play className="size-3.5 fill-current" />
            <span>Start Placement Routine (+50 XP)</span>
          </button>
        </div>

        {/* 3 Standalone Placement Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Card 1: Communication */}
          <div
            className={cn(
              "rounded-xl border p-4 space-y-3 transition-all",
              isEnglishDone
                ? "border-emerald-500/30 bg-emerald-500/5"
                : "border-border bg-card/80 hover:border-purple-500/40",
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                  <Video className="size-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-foreground">Communication</h4>
                  <span className="text-[10px] text-muted-foreground font-mono">2 min · +10 XP</span>
                </div>
              </div>

              {isEnglishDone ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-3" /> Done
                </span>
              ) : (
                <button
                  onClick={() => onStartPlacementDrill("english")}
                  className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary hover:bg-primary/20 cursor-pointer"
                >
                  Start Pitch →
                </button>
              )}
            </div>

            <div className="space-y-1 text-xs">
              <p className="font-medium text-foreground line-clamp-1">{placementPlan.english.title}</p>
              <p className="text-[11px] text-muted-foreground line-clamp-2">
                {placementPlan.english.instructorBrief}
              </p>
            </div>
          </div>

          {/* Card 2: Aptitude */}
          <div
            className={cn(
              "rounded-xl border p-4 space-y-3 transition-all",
              isAptitudeDone
                ? "border-emerald-500/30 bg-emerald-500/5"
                : "border-border bg-card/80 hover:border-purple-500/40",
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                  <Calculator className="size-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-foreground">Quantitative Aptitude</h4>
                  <span className="text-[10px] text-muted-foreground font-mono">3 min · +15 XP</span>
                </div>
              </div>

              {isAptitudeDone ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-3" /> Done
                </span>
              ) : (
                <button
                  onClick={() => onStartPlacementDrill("aptitude")}
                  className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary hover:bg-primary/20 cursor-pointer"
                >
                  Start Drill →
                </button>
              )}
            </div>

            <div className="space-y-1 text-xs">
              <p className="font-medium text-foreground line-clamp-1">{placementPlan.aptitude.title}</p>
              <p className="text-[11px] text-muted-foreground line-clamp-2">
                {placementPlan.aptitude.instructorBrief}
              </p>
            </div>
          </div>

          {/* Card 3: Logic Puzzle */}
          <div
            className={cn(
              "rounded-xl border p-4 space-y-3 transition-all",
              isLogicDone
                ? "border-emerald-500/30 bg-emerald-500/5"
                : "border-border bg-card/80 hover:border-purple-500/40",
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                  <BrainCircuit className="size-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-foreground">Analytical Logic</h4>
                  <span className="text-[10px] text-muted-foreground font-mono">3 min · +25 XP</span>
                </div>
              </div>

              {isLogicDone ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-3" /> Done
                </span>
              ) : (
                <button
                  onClick={() => onStartPlacementDrill("logic")}
                  className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary hover:bg-primary/20 cursor-pointer"
                >
                  Solve Puzzle →
                </button>
              )}
            </div>

            <div className="space-y-1 text-xs">
              <p className="font-medium text-foreground line-clamp-1">{placementPlan.practice.puzzle.q}</p>
              <p className="text-[11px] text-muted-foreground line-clamp-2">
                Deductive reasoning and logical constraint solving.
              </p>
            </div>
          </div>
        </div>

        {/* Dual Completion Gate Tracking Banner */}
        <div className="rounded-xl border border-border/70 bg-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">Dual Completion Gate Requirement:</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-bold font-mono",
                  isDualGateCleared
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                )}
              >
                {isDualGateCleared ? "GATE CLEARED 🔓" : "IN PROGRESS 🔒"}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Technical Mastery: <strong className="text-foreground">{completedTechDays.length}/90 Days</strong> + Placement Attendance: <strong className="text-foreground">{attendance.length}/90 Days</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/student/gateway"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>View Career Gateway (Phase 2)</span>
              <ChevronRight className="size-3.5" />
            </Link>
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
              <h4 className="text-xs font-semibold text-foreground">90-Day Full Syllabus</h4>
              <p className="text-[11px] text-muted-foreground">
                Review all 18 weeks &amp; portfolio projects
              </p>
            </div>
          </div>
          <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          to="/student/gateway"
          className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:bg-muted/30 shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-foreground group-hover:text-primary transition-colors">
              <GraduationCap className="size-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-foreground">Career Gateway (Phase 2)</h4>
              <p className="text-[11px] text-muted-foreground">
                ATS Scanner, AI Mock Interviews &amp; Marketplace
              </p>
            </div>
          </div>
          <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>
    </div>
  );
}
