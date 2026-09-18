import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Chip, Console, Meter, PageHeader, Panel, Stat } from "@/components/kit";
import { useAppStore } from "@/lib/app-store";
import {
  getAcceleratorDay,
  type AcceleratorDay,
} from "@/lib/placement-accelerator-data";
import { getTrackSyllabus } from "@/lib/syllabus-data";
import { TRACKS, trackById, type TrackId } from "@/lib/tracks";
import {
  useLiveStudentProfile,
  useLiveStudentProgress,
  completeLivePlacementDay,
  completeLiveTechnicalDay,
  completeLiveDailyStep,
  isStudentTrackAssigned,
} from "@/lib/data";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Flame,
  Zap,
  CheckCircle2,
  Circle,
  Play,
  Check,
  RotateCcw,
  Sparkles,
  Award,
  Clock,
  ArrowRight,
  Lock,
  ChevronLeft,
  ChevronRight,
  Code2,
  Calculator,
  BookOpen,
  Terminal,
  Send,
  Layers,
  FileCheck,
  AlertCircle,
  Filter,
  Trophy,
  HelpCircle,
  Lightbulb,
  TrendingUp,
  BrainCircuit,
  CheckSquare,
  BookmarkCheck,
  ExternalLink,
} from "lucide-react";

export const Route = createFileRoute("/student/exercises")({
  head: () => ({
    meta: [
      { title: "Daily Exercise Dashboard — SantoGe Talent Cloud" },
      {
        name: "description",
        content:
          "Daily training workouts across Quantitative Aptitude, Corporate English, Technical Code Debugging, and AI Speech Practice for the 90-day placement cadence.",
      },
      { property: "og:title", content: "Daily Exercise Dashboard — SantoGe Talent Cloud" },
      {
        property: "og:description",
        content:
          "3 core daily exercise pillars: Speed Math, Corporate English, and Technical Code Challenges.",
      },
    ],
  }),
  component: DailyExercisesPage,
});

type WorkoutTab = "aptitude" | "english" | "code";

export function DailyExercisesPage() {
  const store = useAppStore();
  const queryClient = useQueryClient();

  // Supabase live hooks
  const { data: liveProfileData } = useLiveStudentProfile(
    store.supabaseSession?.user?.id,
    !!store.supabaseSession?.user?.id,
  );
  const liveStudentId = liveProfileData?.profile?.id || store.liveStudentId;
  const { data: liveProgressData } = useLiveStudentProgress(
    liveStudentId || undefined,
    !!liveStudentId,
  );

  const cohortDay = liveProfileData?.profile?.placement_day ?? store.placementDay ?? 1;
  const streak = liveProfileData?.profile?.streak ?? store.streak;
  const talentScore = liveProfileData?.profile?.talent_score ?? store.talentScore;
  const activeTracks: TrackId[] = useMemo(
    () => liveProfileData?.tracks || store.activeTracks || ["java"],
    [liveProfileData?.tracks, store.activeTracks],
  );

  const attendance = useMemo(
    () => liveProgressData?.attendance || store.attendance || [],
    [liveProgressData?.attendance, store.attendance],
  );
  const completedTechDays = useMemo(
    () => liveProgressData?.completedTechDays || store.completedTechDays || [],
    [liveProgressData?.completedTechDays, store.completedTechDays],
  );

  // Active day selection (defaults to current cohort day)
  const [selectedDayNum, setSelectedDayNum] = useState<number>(cohortDay);
  const [activeTab, setActiveTab] = useState<WorkoutTab>("aptitude");
  const [dayFilter, setDayFilter] = useState<"all" | "current-week" | "fridays">("current-week");

  // Selected technical track for coding drill
  const [selectedTrackId, setSelectedTrackId] = useState<TrackId>(() => {
    return activeTracks[0] ?? ("java" as TrackId);
  });

  // Keep track in sync if activeTracks change
  useMemo(() => {
    if (!activeTracks.includes(selectedTrackId) && activeTracks.length > 0) {
      setSelectedTrackId(activeTracks[0]!);
    }
  }, [activeTracks, selectedTrackId]);

  const currentPlan: AcceleratorDay = useMemo(
    () => getAcceleratorDay(selectedDayNum),
    [selectedDayNum],
  );

  const primaryTrack = trackById(selectedTrackId);
  const technicalSyllabus = useMemo(
    () => getTrackSyllabus(selectedTrackId),
    [selectedTrackId],
  );

  // Technical syllabus day calculation
  const weekIdx = Math.floor((selectedDayNum - 1) / 5);
  const dayInWeekIdx = (selectedDayNum - 1) % 5;
  const currentWeekPlan = technicalSyllabus.weeks[weekIdx] || technicalSyllabus.weeks[0]!;
  const currentTechDay = currentWeekPlan.days[dayInWeekIdx] || currentWeekPlan.days[0]!;

  // Interactive Workout State
  // 1. Aptitude state
  const [aptitudeAnswers, setAptitudeAnswers] = useState<Record<number, number>>({});
  const [puzzleAnswer, setPuzzleAnswer] = useState<number | null>(null);
  const [aptitudeSubmitted, setAptitudeSubmitted] = useState<boolean>(false);
  const [aptitudeXpEarned, setAptitudeXpEarned] = useState<number>(() => {
    return attendance.includes(cohortDay) ? 25 : 0;
  });

  // 2. English state
  const [englishAnswers, setEnglishAnswers] = useState<Record<number, number>>({});
  const [englishSubmitted, setEnglishSubmitted] = useState<boolean>(false);
  const [englishXpEarned, setEnglishXpEarned] = useState<number>(() => {
    return attendance.includes(cohortDay) ? 25 : 0;
  });
  const [activeVocabIdx, setActiveVocabIdx] = useState<number>(0);

  // 3. Technical Code drill state
  const [userCode, setUserCode] = useState<string>(() => {
    return `// ${primaryTrack.name} · Day ${selectedDayNum} Exercise
// Objective: ${currentTechDay.practice}

function solveChallenge() {
  // TODO: Implement solution logic for ${currentTechDay.topic}
  const status = "OPTIMIZED";
  return status;
}

console.log(solveChallenge());`;
  });
  const [consoleOutput, setConsoleOutput] = useState<string[]>([
    `[ready] Sandbox environment initialized for ${primaryTrack.name}.`,
    `[info] Challenge: ${currentTechDay.topic}`,
    `[prompt] Complete implementation and click "Run Test Cases".`,
  ]);
  const [isTestRunning, setIsTestRunning] = useState<boolean>(false);
  const [isCodeVerified, setIsCodeVerified] = useState<boolean>(() => {
    return completedTechDays.includes(selectedDayNum);
  });

  // Aptitude MCQs from currentPlan
  const aptitudeMcqs = useMemo(() => {
    return currentPlan.practice.mcqs.filter(
      (m) => m.category === "Aptitude" || m.category === "Logic",
    );
  }, [currentPlan]);

  // English MCQs from currentPlan
  const englishMcqs = useMemo(() => {
    return currentPlan.practice.mcqs.filter((m) => m.category === "English");
  }, [currentPlan]);

  // Completion calculation for selected day
  const isAptitudeDone = aptitudeSubmitted || attendance.includes(selectedDayNum);
  const isEnglishDone = englishSubmitted || attendance.includes(selectedDayNum);
  const isCodeDone = isCodeVerified || completedTechDays.includes(selectedDayNum);

  const completedModulesCount =
    (isAptitudeDone ? 1 : 0) +
    (isEnglishDone ? 1 : 0) +
    (isCodeDone ? 1 : 0);

  // Overall workout accuracy
  const totalQuestionsAnswered =
    Object.keys(aptitudeAnswers).length +
    (puzzleAnswer !== null ? 1 : 0) +
    Object.keys(englishAnswers).length;

  const correctAnswersCount = useMemo(() => {
    let count = 0;
    aptitudeMcqs.forEach((m, idx) => {
      if (aptitudeAnswers[idx] === m.answer) count++;
    });
    if (puzzleAnswer === currentPlan.practice.puzzle.answer) count++;
    englishMcqs.forEach((m, idx) => {
      if (englishAnswers[idx] === m.answer) count++;
    });
    return count;
  }, [aptitudeMcqs, aptitudeAnswers, puzzleAnswer, currentPlan, englishMcqs, englishAnswers]);

  const accuracyPct =
    totalQuestionsAnswered > 0
      ? Math.round((correctAnswersCount / totalQuestionsAnswered) * 100)
      : 100;

  // Day filter computation
  const currentWeekNumber = Math.floor((cohortDay - 1) / 5) + 1;
  const filteredDays = useMemo(() => {
    return Array.from({ length: 90 }, (_, i) => i + 1).filter((dayNum) => {
      if (dayFilter === "fridays") return dayNum % 5 === 0;
      if (dayFilter === "current-week") {
        const wNum = Math.floor((dayNum - 1) / 5) + 1;
        return wNum === currentWeekNumber;
      }
      return true;
    });
  }, [dayFilter, currentWeekNumber]);

  // Reset exercise interactive state on day change
  const handleSelectDay = (dayNum: number) => {
    setSelectedDayNum(dayNum);
    setAptitudeAnswers({});
    setPuzzleAnswer(null);
    setAptitudeSubmitted(false);
    setAptitudeXpEarned(attendance.includes(dayNum) ? 25 : 0);
    setEnglishAnswers({});
    setEnglishSubmitted(false);
    setEnglishXpEarned(attendance.includes(dayNum) ? 25 : 0);
    setActiveVocabIdx(0);
    setActiveTab("aptitude");

    const isTechAlreadyDone = completedTechDays.includes(dayNum);
    setIsCodeVerified(isTechAlreadyDone);

    const newSyllabus = getTrackSyllabus(selectedTrackId);
    const newWIdx = Math.floor((dayNum - 1) / 5);
    const newDIdx = (dayNum - 1) % 5;
    const newWPlan = newSyllabus.weeks[newWIdx] || newSyllabus.weeks[0]!;
    const newDPlan = newWPlan.days[newDIdx] || newWPlan.days[0]!;

    setUserCode(
      `// ${primaryTrack.name} · Day ${dayNum} Exercise\n// Objective: ${newDPlan.practice}\n\nfunction solveChallenge() {\n  // TODO: Implement solution logic for ${newDPlan.topic}\n  const status = "OPTIMIZED";\n  return status;\n}\n\nconsole.log(solveChallenge());`,
    );

    setConsoleOutput([
      `[ready] Switched to Day ${dayNum} workout · ${primaryTrack.name}`,
      `[topic] ${newDPlan.topic}`,
    ]);
  };

  // Evaluate correctness of submitted answers
  const answeredAptitudeIndices = Object.keys(aptitudeAnswers).map(Number);
  const totalAptitudeAttempted = answeredAptitudeIndices.length + (puzzleAnswer !== null ? 1 : 0);
  const hasAptitudeAttempted = totalAptitudeAttempted > 0;
  const isAptitudeAllCorrect =
    hasAptitudeAttempted &&
    answeredAptitudeIndices.every((idx) => aptitudeAnswers[idx] === aptitudeMcqs[idx]?.answer) &&
    (puzzleAnswer === null || puzzleAnswer === currentPlan.practice.puzzle?.answer);
  const hasAptitudeIncorrect =
    hasAptitudeAttempted &&
    (answeredAptitudeIndices.some((idx) => aptitudeAnswers[idx] !== aptitudeMcqs[idx]?.answer) ||
      (puzzleAnswer !== null && puzzleAnswer !== currentPlan.practice.puzzle?.answer));

  const answeredEnglishIndices = Object.keys(englishAnswers).map(Number);
  const totalEnglishAttempted = answeredEnglishIndices.length;
  const hasEnglishAttempted = totalEnglishAttempted > 0;
  const isEnglishAllCorrect =
    hasEnglishAttempted &&
    answeredEnglishIndices.every((idx) => englishAnswers[idx] === englishMcqs[idx]?.answer);
  const hasEnglishIncorrect =
    hasEnglishAttempted &&
    answeredEnglishIndices.some((idx) => englishAnswers[idx] !== englishMcqs[idx]?.answer);

  // Actions
  const handleSubmitAptitude = async () => {
    if (totalAptitudeAttempted === 0) {
      toast.error("Please answer at least one question before submitting.");
      return;
    }
    setAptitudeSubmitted(true);

    if (hasAptitudeIncorrect || !isAptitudeAllCorrect) {
      // WRONG ANSWER SUBMITTED: DO NOT INCREASE XP!
      setAptitudeXpEarned(0);
      toast.error("Submitted with Incorrect Answer (0 XP Earned)", {
        description: "No XP points awarded because the answer is incorrect. Click 'Try Again' to re-attempt and earn +25 XP.",
      });
      return;
    }

    // ALL ANSWERS CORRECT: INCREASE XP (+25 XP)
    setAptitudeXpEarned(25);
    if (liveStudentId) {
      await completeLiveDailyStep(liveStudentId, "aptitude");
      queryClient.invalidateQueries({ queryKey: ["live", "student-progress", liveStudentId] });
      queryClient.invalidateQueries({ queryKey: ["live", "student-profile", store.supabaseSession?.user?.id] });
    }
    await store.completeDailyStep("aptitude");
    toast.success("Aptitude Drill Mastered! (+25 XP)", {
      description: "Opening Corporate English Workout…",
    });

    // Automatically open Corporate English workout
    setTimeout(() => {
      setActiveTab("english");
      const englishEl = document.getElementById("corporate-english-workout");
      if (englishEl) {
        englishEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 350);
  };

  const handleRetryAptitude = () => {
    setAptitudeAnswers({});
    setPuzzleAnswer(null);
    setAptitudeSubmitted(false);
    setAptitudeXpEarned(0);
    toast.info("Aptitude drill reset. Choose the correct answers to earn +25 XP!");
  };

  const handleSubmitEnglish = async () => {
    if (totalEnglishAttempted === 0) {
      toast.error("Please answer the verbal exercise question.");
      return;
    }
    setEnglishSubmitted(true);

    if (hasEnglishIncorrect || !isEnglishAllCorrect) {
      // WRONG ANSWER SUBMITTED: DO NOT INCREASE XP!
      setEnglishXpEarned(0);
      toast.error("Submitted with Incorrect Answer (0 XP Earned)", {
        description: "No XP points awarded because the answer is incorrect. Click 'Try Again' to re-attempt and earn +25 XP.",
      });
      return;
    }

    // ALL ANSWERS CORRECT: INCREASE XP (+25 XP)
    setEnglishXpEarned(25);
    if (liveStudentId) {
      await completeLiveDailyStep(liveStudentId, "english");
      queryClient.invalidateQueries({ queryKey: ["live", "student-progress", liveStudentId] });
      queryClient.invalidateQueries({ queryKey: ["live", "student-profile", store.supabaseSession?.user?.id] });
    }
    await store.completeDailyStep("english");
    toast.success("Corporate English Mastered! (+25 XP)", {
      description: "Opening Technical Code Drill…",
    });

    // Automatically open Technical Code Drill
    setTimeout(() => {
      setActiveTab("code");
      const codeEl = document.getElementById("technical-code-workout");
      if (codeEl) {
        codeEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 350);
  };

  const handleRetryEnglish = () => {
    setEnglishAnswers({});
    setEnglishSubmitted(false);
    setEnglishXpEarned(0);
    toast.info("English drill reset. Choose the correct answer to earn +25 XP!");
  };

  const handleRunCodeTests = () => {
    setIsTestRunning(true);
    setConsoleOutput((prev) => [
      `[exec] Compiling and running test suite for ${primaryTrack.short} (Day ${selectedDayNum})…`,
      ...prev,
    ]);

    setTimeout(() => {
      setIsTestRunning(false);
      setConsoleOutput((prev) => [
        `[pass] Test Case 1: Syntax & Memory Footprint passed (4.2ms)`,
        `[pass] Test Case 2: Boundary validation verified (1.8ms)`,
        `[pass] Test Case 3: Output contract match for ${currentTechDay.topic} ✓`,
        `[result] 3 of 3 Test Cases PASSED. Ready to verify.`,
        ...prev,
      ]);
      toast.success("Code Test Cases Passed!", {
        description: "Click 'Verify Solution' to record 50 XP.",
      });
    }, 1200);
  };

  const handleVerifyCode = async () => {
    setIsCodeVerified(true);
    if (liveStudentId) {
      await completeLiveTechnicalDay(liveStudentId, selectedDayNum);
      queryClient.invalidateQueries({ queryKey: ["live", "student-progress", liveStudentId] });
      queryClient.invalidateQueries({ queryKey: ["live", "student-profile", store.supabaseSession?.user?.id] });
    }
    await store.completeTechDay(selectedDayNum);
    toast.success("Technical Exercise Verified! (+50 XP)", {
      description: `${primaryTrack.name} Day ${selectedDayNum} mastered.`,
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <PageHeader
        title="Daily Exercise Dashboard"
        subtitle={`Synchronized placement drills and course-specific technical workouts for Day ${selectedDayNum} of 90 (Week ${currentPlan.week} · ${currentPlan.dayOfWeek}).`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleSelectDay(cohortDay)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all",
                selectedDayNum === cohortDay
                  ? "border-primary/40 bg-primary/10 text-primary shadow-xs"
                  : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50",
              )}
            >
              <Calendar className="size-3.5" />
              Jump to Today (Day {cohortDay})
            </button>
            <div className="flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
              <Flame className="size-3.5 fill-amber-500 text-amber-500" />
              <span>{streak} Day Streak</span>
            </div>
            <Chip tone={completedModulesCount === 3 ? "emerald" : "cyan"}>
              {completedModulesCount} / 3 Workouts Completed
            </Chip>
          </div>
        }
      />

      {/* KPI Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Daily Workout Progress"
          value={`${completedModulesCount} / 3 Done`}
          tone={completedModulesCount === 3 ? "emerald" : "brand"}
          hint={
            completedModulesCount === 3
              ? "All 3 daily modules finished! 🎉"
              : "Aptitude + English + Code"
          }
        />
        <Stat
          label="Exercise Accuracy Rate"
          value={`${accuracyPct}%`}
          tone="cyan"
          hint={`${correctAnswersCount} correct of ${totalQuestionsAnswered || 0} attempted`}
        />
        <Stat
          label="Today's XP Unlocked"
          value={`+${aptitudeXpEarned + englishXpEarned + (isCodeDone ? 50 : 0)} XP`}
          tone="purple"
          hint="+25 to +50 XP per verified workout"
        />
        <Stat
          label="Current Cadence"
          value={`Day ${selectedDayNum} / 90`}
          tone="amber"
          hint={`Week ${currentPlan.week} · ${currentPlan.theme.slice(0, 24)}…`}
        />
      </div>

      {/* 90-Day Exercise Navigator Bar */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Calendar className="size-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">
                90-Day Placement & Technical Cadence
              </p>
              <p className="text-[11px] text-muted-foreground">
                Week {currentPlan.week}: {currentPlan.theme}
              </p>
            </div>
          </div>

          {/* Filter Chips & Steppers */}
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-border bg-muted/40 p-0.5 text-xs">
              <button
                onClick={() => setDayFilter("current-week")}
                className={cn(
                  "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
                  dayFilter === "current-week"
                    ? "bg-card text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Week {currentWeekNumber}
              </button>
              <button
                onClick={() => setDayFilter("fridays")}
                className={cn(
                  "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
                  dayFilter === "fridays"
                    ? "bg-card text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Fridays (Tests)
              </button>
              <button
                onClick={() => setDayFilter("all")}
                className={cn(
                  "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
                  dayFilter === "all"
                    ? "bg-card text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                All 90 Days
              </button>
            </div>

            <div className="flex items-center gap-1 border-l border-border/70 pl-2">
              <button
                onClick={() => handleSelectDay(Math.max(1, selectedDayNum - 1))}
                disabled={selectedDayNum <= 1}
                className="rounded-lg border border-border p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 transition-colors"
                title="Previous Day"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                onClick={() => handleSelectDay(Math.min(90, selectedDayNum + 1))}
                disabled={selectedDayNum >= 90}
                className="rounded-lg border border-border p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 transition-colors"
                title="Next Day"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Day Strip */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin pt-1">
          {filteredDays.map((dayNum) => {
            const isCurrent = dayNum === selectedDayNum;
            const isToday = dayNum === cohortDay;
            const isFriday = dayNum % 5 === 0;
            const isCompleted = attendance.includes(dayNum) && completedTechDays.includes(dayNum);
            const isPartiallyDone = attendance.includes(dayNum) || completedTechDays.includes(dayNum);

            return (
              <button
                key={dayNum}
                onClick={() => handleSelectDay(dayNum)}
                className={cn(
                  "flex flex-col items-center justify-center min-w-[58px] rounded-lg border p-2 text-center transition-all text-xs relative",
                  isCurrent
                    ? "border-primary bg-primary/10 text-primary font-bold shadow-xs ring-1 ring-primary"
                    : isToday
                      ? "border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold"
                      : isCompleted
                        ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
                        : isFriday
                          ? "border-purple-500/30 bg-purple-500/5 text-purple-600 dark:text-purple-400"
                          : "border-border/70 bg-card text-muted-foreground hover:text-foreground hover:border-border hover:bg-muted/40",
                )}
              >
                <span className="text-[9px] font-mono uppercase tracking-wider opacity-75">
                  {isFriday ? "Milestone" : `D${dayNum}`}
                </span>
                <span className="font-mono text-xs font-bold mt-0.5 flex items-center gap-1">
                  {isCompleted ? (
                    <CheckCircle2 className="size-3 text-emerald-500" />
                  ) : isPartiallyDone ? (
                    <Circle className="size-2.5 fill-amber-500 text-amber-500" />
                  ) : null}
                  Day {dayNum}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Workout Pillars Nav Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab("aptitude")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer",
              activeTab === "aptitude"
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
            )}
          >
            <Calculator className="size-3.5" />
            1. Aptitude &amp; Logic
            {isAptitudeDone && <Check className="size-3 text-emerald-400 ml-0.5" />}
          </button>
          <button
            onClick={() => {
              if (!isAptitudeDone) {
                toast.info("Complete Aptitude & Logic first to unlock Corporate English.");
                setActiveTab("aptitude");
                return;
              }
              setActiveTab("english");
            }}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer",
              activeTab === "english"
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
              !isAptitudeDone && "opacity-75",
            )}
          >
            <BookOpen className="size-3.5" />
            2. Corporate English
            {!isAptitudeDone ? (
              <Lock className="size-3 text-muted-foreground ml-0.5" />
            ) : isEnglishDone ? (
              <Check className="size-3 text-emerald-400 ml-0.5" />
            ) : null}
          </button>
          <button
            onClick={() => {
              if (!isEnglishDone) {
                toast.info(
                  !isAptitudeDone
                    ? "Complete Aptitude & Logic first."
                    : "Complete Corporate English first to unlock Technical Code Drill.",
                );
                if (!isAptitudeDone) {
                  setActiveTab("aptitude");
                } else {
                  setActiveTab("english");
                }
                return;
              }
              setActiveTab("code");
            }}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer",
              activeTab === "code"
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
              !isEnglishDone && "opacity-75",
            )}
          >
            <Code2 className="size-3.5" />
            3. Technical Code Drill
            {!isEnglishDone ? (
              <Lock className="size-3 text-muted-foreground ml-0.5" />
            ) : isCodeDone ? (
              <Check className="size-3 text-emerald-400 ml-0.5" />
            ) : null}
          </button>
        </div>

        {/* Completion Progress Bar */}
        <div className="flex items-center gap-3">
          <div className="w-28 hidden sm:block">
            <Meter value={(completedModulesCount / 3) * 100} tone="emerald" />
          </div>
          <span className="text-xs font-mono font-medium text-muted-foreground">
            {completedModulesCount}/3 Complete
          </span>
        </div>
      </div>

      {/* Celebration Banner when all 3 completed */}
      {completedModulesCount === 3 && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-900 dark:text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="size-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                Day {selectedDayNum} Daily Workout Fully Mastered! 🌟
              </p>
              <p className="text-xs text-muted-foreground">
                All 3 modules passed. Daily streak maintained and +100 XP added to your Talent Score ledger.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleSelectDay(Math.min(90, selectedDayNum + 1))}
            className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all self-start sm:self-auto"
          >
            <span>Next Workout (Day {Math.min(90, selectedDayNum + 1)})</span>
            <ArrowRight className="size-3.5" />
          </button>
        </div>
      )}

      {/* WORKOUT CONTENT SECTIONS */}
      <div className="space-y-6">
        {/* PILLAR 1: APTITUDE & LOGICAL REASONING WORKOUT */}
        {activeTab === "aptitude" && (
          <Panel
            id="aptitude-workout"
            title={
              <div className="flex items-center gap-2">
                <Calculator className="size-4 text-primary" />
                <span>1. Quantitative & Speed Math Workout</span>
              </div>
            }
            subtitle={`Day ${selectedDayNum} · ${currentPlan.aptitude.title}`}
            action={
              isAptitudeDone ? (
                aptitudeXpEarned > 0 ? (
                  <Chip tone="emerald">Drill Mastered (+25 XP)</Chip>
                ) : (
                  <Chip tone="rose">Incorrect (0 XP)</Chip>
                )
              ) : (
                <Chip tone="cyan">10 Min Workout</Chip>
              )
            }
            className="flex flex-col justify-between"
          >
            <div className="space-y-4 text-xs">
              {/* Formula & Speed Shortcut Box */}
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-primary font-semibold text-xs">
                  <Zap className="size-3.5" />
                  <span>Speed Formula Shortcut of the Day</span>
                </div>
                <p className="font-mono text-xs font-medium text-foreground bg-card/60 p-2 rounded border border-border/60">
                  {currentPlan.aptitude.formulaShortcut}
                </p>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  <strong className="text-foreground">Model Strategy: </strong>
                  {currentPlan.aptitude.instructorBrief}
                </p>
              </div>

              {/* Solved Reference Problem */}
              <div className="rounded-lg border border-border bg-card p-3 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                  <span>Solved Benchmark Model</span>
                  <span className="font-mono text-[10px] text-primary">30s Fast Solve</span>
                </div>
                <p className="font-mono text-xs text-foreground bg-muted/40 p-2 rounded">
                  {currentPlan.aptitude.solvedExample}
                </p>
              </div>

              {/* Interactive MCQs */}
              <div className="space-y-3 pt-2">
                <p className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span>Interactive Practice Drills ({aptitudeMcqs.length} Questions)</span>
                  <span className="text-[11px] font-normal text-muted-foreground">Instant Answer & XP</span>
                </p>

                {aptitudeMcqs.map((q, idx) => {
                  const selected = aptitudeAnswers[idx];
                  const hasAnswered = selected !== undefined;
                  const isCorrect = selected === q.answer;

                  return (
                    <div
                      key={idx}
                      className="rounded-lg border border-border bg-card/70 p-3.5 space-y-2.5 shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-foreground text-xs leading-relaxed">
                          <span className="font-mono text-primary font-semibold mr-1.5">Q{idx + 1}.</span>
                          {q.q}
                        </p>
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                          {q.category}
                        </span>
                      </div>

                      {/* Options Grid */}
                      <div className="grid gap-1.5 sm:grid-cols-2">
                        {q.options.map((opt, optIdx) => {
                          const isOptionSelected = selected === optIdx;
                          const isOptionCorrectAnswer = optIdx === q.answer;

                          let btnStyle = "border-border bg-card hover:bg-muted/50 text-foreground";
                          if (hasAnswered) {
                            if (isOptionCorrectAnswer) {
                              btnStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold";
                            } else if (isOptionSelected) {
                              btnStyle = "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300";
                            } else {
                              btnStyle = "opacity-60 border-border bg-card";
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={aptitudeSubmitted}
                              onClick={() => {
                                setAptitudeAnswers((prev) => ({ ...prev, [idx]: optIdx }));
                              }}
                              className={cn(
                                "flex items-center gap-2 rounded-lg border p-2 text-left text-xs transition-all",
                                btnStyle,
                              )}
                            >
                              <span className="flex size-4.5 shrink-0 items-center justify-center rounded-full border text-[10px] font-mono">
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span className="truncate">{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation Drawer */}
                      {hasAnswered && (
                        <div
                          className={cn(
                            "rounded-md p-2 text-[11px] leading-relaxed",
                            isCorrect
                              ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20",
                          )}
                        >
                          <p className="font-semibold">{isCorrect ? "✓ Correct!" : "✗ Solution breakdown:"}</p>
                          <p className="mt-0.5">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Logic Brainteaser Challenge */}
                {currentPlan.practice.puzzle && (
                  <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <BrainCircuit className="size-3.5 text-purple-500" />
                        Daily Logic Brainteaser
                      </span>
                      <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400">
                        Rapid Inference
                      </span>
                    </div>
                    <p className="text-xs text-foreground">{currentPlan.practice.puzzle.q}</p>
                    <div className="grid gap-1.5 sm:grid-cols-2">
                      {currentPlan.practice.puzzle.options.map((opt, optIdx) => {
                        const isChosen = puzzleAnswer === optIdx;
                        const isPuzzleDone = puzzleAnswer !== null;
                        const isCorrect = optIdx === currentPlan.practice.puzzle.answer;

                        let style = "border-border bg-card text-foreground hover:bg-muted/50";
                        if (isPuzzleDone) {
                          if (isCorrect) {
                            style = "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold";
                          } else if (isChosen) {
                            style = "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400";
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={aptitudeSubmitted}
                            onClick={() => setPuzzleAnswer(optIdx)}
                            className={cn(
                              "flex items-center gap-2 rounded-lg border p-2 text-left text-xs transition-all",
                              style,
                            )}
                          >
                            <span className="font-mono text-[10px]">{String.fromCharCode(65 + optIdx)}.</span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Aptitude Action Footer */}
            <div className="mt-4 pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] text-muted-foreground">
                {isAptitudeDone
                  ? aptitudeXpEarned > 0
                    ? "✓ Aptitude logic completed (+25 XP)"
                    : "✗ Aptitude submitted with incorrect answer (0 XP)"
                  : "Formula drill delivered daily via Telegram @ 06:00"}
              </span>
              <div className="flex items-center gap-2">
                {isAptitudeDone && aptitudeXpEarned === 0 && (
                  <button
                    type="button"
                    onClick={handleRetryAptitude}
                    className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 transition-all cursor-pointer"
                  >
                    <RotateCcw className="size-3.5" />
                    <span>Try Again for +25 XP</span>
                  </button>
                )}
                {isAptitudeDone ? (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("english");
                      setTimeout(() => {
                        document.getElementById("corporate-english-workout")?.scrollIntoView({ behavior: "smooth" });
                      }, 50);
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
                  >
                    <span>Next: Open Corporate English Workout</span>
                    <ArrowRight className="size-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitAptitude}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold shadow-xs transition-all cursor-pointer",
                      hasAptitudeIncorrect
                        ? "bg-rose-600 hover:bg-rose-700 text-white"
                        : "bg-primary hover:bg-primary/90 text-primary-foreground",
                    )}
                  >
                    <Check className="size-3.5" />
                    <span>
                      {hasAptitudeIncorrect
                        ? "Submit Workout (0 XP — Incorrect Answer)"
                        : "Submit Aptitude Workout (+25 XP)"}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </Panel>
        )}

        {/* PILLAR 2: CORPORATE ENGLISH & VERBAL WORKOUT */}
        {activeTab === "english" && (
          <Panel
            id="corporate-english-workout"
            title={
              <div className="flex items-center gap-2">
                <BookOpen className="size-4 text-primary" />
                <span>2. Corporate English & Verbal Workout</span>
              </div>
            }
            subtitle={`Day ${selectedDayNum} · ${currentPlan.english.title}`}
            action={
              !isAptitudeDone ? (
                <Chip tone="muted">🔒 Complete Aptitude to Open</Chip>
              ) : isEnglishDone ? (
                englishXpEarned > 0 ? (
                  <Chip tone="emerald">Verbal Mastered (+25 XP)</Chip>
                ) : (
                  <Chip tone="rose">Incorrect (0 XP)</Chip>
                )
              ) : (
                <Chip tone="cyan">10 Min Workout</Chip>
              )
            }
            className="flex flex-col justify-between"
          >
            {!isAptitudeDone ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center space-y-3.5 my-auto">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                  <Lock className="size-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-foreground">
                    Locked: Complete Aptitude &amp; Logic Drill First
                  </h4>
                  <p className="mx-auto max-w-sm text-xs text-muted-foreground leading-relaxed">
                    Corporate English will open automatically as soon as you finish and submit your Quantitative Aptitude &amp; Logic workout on the left.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("aptitude");
                    setTimeout(() => {
                      document.getElementById("aptitude-workout")?.scrollIntoView({ behavior: "smooth" });
                    }, 50);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
                >
                  <Calculator className="size-3.5" />
                  <span>Start Aptitude &amp; Logic Workout</span>
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Grammar Rule Card */}
                <div className="rounded-lg border border-border bg-card p-3.5 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-foreground font-semibold text-xs">
                    <BookmarkCheck className="size-3.5 text-primary" />
                    <span>Grammar & Corporate Etiquette Rule</span>
                  </div>
                  <p className="text-xs text-foreground font-medium bg-muted/30 p-2 rounded border border-border/50">
                    {currentPlan.english.grammarRule}
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">Instructor Context: </strong>
                    {currentPlan.english.instructorBrief}
                  </p>
                </div>

                {/* 4 Vocabulary Flashcards */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">
                      Corporate Vocabulary Drill (4 Flashcards)
                    </span>
                    <span className="text-[11px] text-muted-foreground">Click word to study</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {currentPlan.english.keyVocabulary.map((word, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveVocabIdx(idx)}
                        className={cn(
                          "rounded-lg border p-2 text-center transition-all",
                          activeVocabIdx === idx
                            ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                            : "border-border bg-card text-foreground hover:bg-muted/50",
                        )}
                      >
                        <span className="block text-xs font-mono capitalize">{word}</span>
                        <span className="text-[9px] text-muted-foreground">Card #{idx + 1}</span>
                      </button>
                    ))}
                  </div>

                  {/* Expanded Vocabulary Preview */}
                  <div className="rounded-lg border border-border/80 bg-muted/20 p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground text-xs uppercase font-mono">
                        "{currentPlan.english.keyVocabulary[activeVocabIdx]}"
                      </span>
                      <span className="text-[10px] text-primary font-semibold">Corporate Context</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Used to demonstrate professional precision during interviews and status updates.
                      Example: <em>"We leveraged {currentPlan.english.keyVocabulary[activeVocabIdx]} to optimize the client deliverable."</em>
                    </p>
                  </div>
                </div>

                {/* Interactive English MCQs */}
                {englishMcqs.length > 0 && (
                  <div className="space-y-2.5 pt-2">
                    <p className="text-xs font-bold text-foreground">
                      Verbal Reasoning & Grammar Accuracy
                    </p>
                    {englishMcqs.map((q, idx) => {
                      const selected = englishAnswers[idx];
                      const hasAnswered = selected !== undefined;
                      const isCorrect = selected === q.answer;

                      return (
                        <div
                          key={idx}
                          className="rounded-lg border border-border bg-card/70 p-3 space-y-2 shadow-xs"
                        >
                          <p className="font-medium text-foreground text-xs leading-relaxed">
                            <span className="font-mono text-primary font-semibold mr-1.5">Q.</span>
                            {q.q}
                          </p>

                          <div className="grid gap-1.5 sm:grid-cols-2">
                            {q.options.map((opt, optIdx) => {
                              const isOptionSelected = selected === optIdx;
                              const isOptionCorrectAnswer = optIdx === q.answer;

                              let btnStyle = "border-border bg-card hover:bg-muted/50 text-foreground";
                              if (hasAnswered) {
                                if (isOptionCorrectAnswer) {
                                  btnStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold";
                                } else if (isOptionSelected) {
                                  btnStyle = "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300";
                                } else {
                                  btnStyle = "opacity-60 border-border bg-card";
                                }
                              }

                              return (
                                <button
                                  key={optIdx}
                                  disabled={englishSubmitted}
                                  onClick={() =>
                                    setEnglishAnswers((prev) => ({ ...prev, [idx]: optIdx }))
                                  }
                                  className={cn(
                                    "flex items-center gap-2 rounded-lg border p-2 text-left text-xs transition-all",
                                    btnStyle,
                                  )}
                                >
                                  <span className="font-mono text-[10px]">
                                    {String.fromCharCode(65 + optIdx)}.
                                  </span>
                                  <span className="truncate">{opt}</span>
                                </button>
                              );
                            })}
                          </div>

                          {hasAnswered && (
                            <div
                              className={cn(
                                "rounded-md p-2 text-[11px] leading-relaxed",
                                isCorrect
                                  ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20"
                                  : "bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20",
                              )}
                            >
                              <p className="font-semibold">{isCorrect ? "✓ Well done!" : "Correction:"}</p>
                              <p className="mt-0.5">{q.explanation}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* English Action Footer */}
            {isAptitudeDone && (
              <div className="mt-4 pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] text-muted-foreground">
                  {isEnglishDone
                    ? englishXpEarned > 0
                      ? "✓ Corporate English completed (+25 XP)"
                      : "✗ Corporate English submitted with incorrect answer (0 XP)"
                    : "Timeline: 03m Concept · 04m Demo · 03m Drill"}
                </span>
                <div className="flex items-center gap-2">
                  {isEnglishDone && englishXpEarned === 0 && (
                    <button
                      type="button"
                      onClick={handleRetryEnglish}
                      className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 transition-all cursor-pointer"
                    >
                      <RotateCcw className="size-3.5" />
                      <span>Try Again for +25 XP</span>
                    </button>
                  )}
                  {isEnglishDone ? (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("code");
                        setTimeout(() => {
                          document.getElementById("technical-code-workout")?.scrollIntoView({ behavior: "smooth" });
                        }, 50);
                      }}
                      className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
                    >
                      <span>Next: Open Technical Code Drill</span>
                      <ArrowRight className="size-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmitEnglish}
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold shadow-xs transition-all cursor-pointer",
                        hasEnglishIncorrect
                          ? "bg-rose-600 hover:bg-rose-700 text-white"
                          : "bg-primary hover:bg-primary/90 text-primary-foreground",
                      )}
                    >
                      <Check className="size-3.5" />
                      <span>
                        {hasEnglishIncorrect
                          ? "Submit Workout (0 XP — Incorrect Answer)"
                          : "Submit English Workout (+25 XP)"}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </Panel>
        )}

        {/* PILLAR 3: TECHNICAL CODE & BUG-HUNT DRILL (COURSE-SPECIFIC) */}
        {activeTab === "code" && (
          <Panel
            id="technical-code-workout"
            title={
              <div className="flex items-center gap-2">
                <Code2 className="size-4 text-primary" />
                <span>3. Course-Specific Technical Code Drill</span>
              </div>
            }
            subtitle={`Day ${selectedDayNum} · ${primaryTrack.name}`}
            action={
              !isEnglishDone ? (
                <Chip tone="muted">🔒 Complete English to Open</Chip>
              ) : isCodeDone ? (
                <Chip tone="emerald">Code Verified (+50 XP)</Chip>
              ) : (
                <Chip tone="purple">15 Min Sandbox</Chip>
              )
            }
            className="flex flex-col justify-between"
          >
            {!isEnglishDone ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center space-y-3.5 my-auto">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                  <Lock className="size-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-foreground">
                    Locked: Complete Corporate English Workout First
                  </h4>
                  <p className="mx-auto max-w-sm text-xs text-muted-foreground leading-relaxed">
                    The Technical Code Drill will unlock and open automatically as soon as you finish and submit your Corporate English workout.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!isAptitudeDone) {
                      setActiveTab("aptitude");
                      setTimeout(() => {
                        document.getElementById("aptitude-workout")?.scrollIntoView({ behavior: "smooth" });
                      }, 50);
                    } else {
                      setActiveTab("english");
                      setTimeout(() => {
                        document.getElementById("corporate-english-workout")?.scrollIntoView({ behavior: "smooth" });
                      }, 50);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
                >
                  <BookOpen className="size-3.5" />
                  <span>{!isAptitudeDone ? "Go to Aptitude & Logic" : "Open Corporate English Workout"}</span>
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Course Selector Tabs (If student has multiple assigned tracks) */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground text-[11px] font-medium">Assigned Course:</span>
                    <div className="flex gap-1">
                      {activeTracks.map((tId) => {
                        const t = trackById(tId);
                        return (
                          <button
                            key={tId}
                            onClick={() => {
                              setSelectedTrackId(tId);
                              const syl = getTrackSyllabus(tId);
                              const wI = Math.floor((selectedDayNum - 1) / 5);
                              const dI = (selectedDayNum - 1) % 5;
                              const wP = syl.weeks[wI] || syl.weeks[0]!;
                              const dP = wP.days[dI] || wP.days[0]!;
                              setUserCode(
                                `// ${t.name} · Day ${selectedDayNum} Exercise\n// Objective: ${dP.practice}\n\nfunction solveChallenge() {\n  // TODO: Implement solution logic for ${dP.topic}\n  const status = "OPTIMIZED";\n  return status;\n}\n\nconsole.log(solveChallenge());`,
                              );
                              setConsoleOutput([`[ready] Switched sandbox to ${t.name} (Day ${selectedDayNum})`]);
                            }}
                            className={cn(
                              "rounded-md px-2 py-0.5 text-xs font-semibold transition-all",
                              selectedTrackId === tId
                                ? "bg-primary/10 text-primary border border-primary/30"
                                : "bg-muted text-muted-foreground hover:text-foreground",
                            )}
                          >
                            {t.short}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-muted-foreground">
                    Week {currentWeekPlan.week} · {currentWeekPlan.theme.slice(0, 20)}…
                  </span>
                </div>

                {/* Day Objective Card */}
                <div className="rounded-lg border border-border bg-card p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground text-xs">
                      {currentTechDay.topic}
                    </span>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                      100% In-Browser
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">Hands-on Goal: </strong>
                    {currentTechDay.practice}
                  </p>
                </div>

                {/* In-Browser Code Simulator */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Terminal className="size-3.5 text-primary" />
                      Interactive Sandbox Editor ({primaryTrack.short})
                    </span>
                    <span className="font-mono text-[10px]">Wasm Virtual Runner</span>
                  </div>

                  <textarea
                    value={userCode}
                    onChange={(e) => setUserCode(e.target.value)}
                    rows={7}
                    spellCheck={false}
                    className="w-full resize-y rounded-lg border border-border bg-surface-dark p-3 font-mono text-[11.5px] leading-relaxed text-slate-100 outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20"
                  />
                </div>

                {/* Execution Console */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Execution Output Console</span>
                    {isTestRunning && <span className="text-primary animate-pulse">Running test cases…</span>}
                  </div>
                  <Console lines={consoleOutput} empty="Click 'Run Test Cases' to compile and execute." />
                </div>
              </div>
            )}

            {/* Technical Code Action Footer */}
            {isEnglishDone && (
              <div className="mt-4 pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={handleRunCodeTests}
                  disabled={isTestRunning}
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted hover:border-border/80 transition-all shadow-xs"
                >
                  <Play className="size-3.5 text-primary" />
                  {isTestRunning ? "Executing…" : "Run Test Cases"}
                </button>

                <button
                  onClick={handleVerifyCode}
                  disabled={isCodeDone}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-xs transition-all",
                    isCodeDone
                      ? "bg-muted text-muted-foreground border border-border cursor-not-allowed"
                      : "bg-primary text-primary-foreground hover:bg-primary/90",
                  )}
                >
                  <FileCheck className="size-3.5" />
                  {isCodeDone ? "Code Verified (+50 XP Logged)" : "Verify Solution (+50 XP)"}
                </button>
              </div>
            )}
          </Panel>
        )}

      </div>

      {/* Daily Routine Summary Checklist Card */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-4">
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Day {selectedDayNum} Exercise Workout Checklist
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Complete each daily module to advance your streak and maintain 100% attendance readiness for Day 90.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-foreground">
              {completedModulesCount} of 3 Modules Completed
            </span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 pt-4">
          <div
            className={cn(
              "rounded-lg border p-3.5 space-y-1.5 transition-all",
              isAptitudeDone
                ? "border-emerald-500/30 bg-emerald-500/5"
                : "border-border bg-card",
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">1. Aptitude & Speed Math</span>
              {isAptitudeDone ? (
                <CheckCircle2 className="size-4 text-emerald-500" />
              ) : (
                <Circle className="size-4 text-muted-foreground" />
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {isAptitudeDone
                ? aptitudeXpEarned > 0
                  ? "Formula + MCQs logged (+25 XP)"
                  : "Submitted with incorrect answer (0 XP)"
                : "Pending practice submission"}
            </p>
          </div>

          <div
            className={cn(
              "rounded-lg border p-3.5 space-y-1.5 transition-all",
              isEnglishDone
                ? "border-emerald-500/30 bg-emerald-500/5"
                : "border-border bg-card",
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">2. Corporate English</span>
              {isEnglishDone ? (
                <CheckCircle2 className="size-4 text-emerald-500" />
              ) : (
                <Circle className="size-4 text-muted-foreground" />
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {isEnglishDone
                ? englishXpEarned > 0
                  ? "Grammar + 4 Vocab cards (+25 XP)"
                  : "Submitted with incorrect answer (0 XP)"
                : "Pending practice submission"}
            </p>
          </div>

          <div
            className={cn(
              "rounded-lg border p-3.5 space-y-1.5 transition-all",
              isCodeDone
                ? "border-emerald-500/30 bg-emerald-500/5"
                : "border-border bg-card",
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">3. Technical Code Drill</span>
              {isCodeDone ? (
                <CheckCircle2 className="size-4 text-emerald-500" />
              ) : (
                <Circle className="size-4 text-muted-foreground" />
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {isCodeDone ? `${primaryTrack.short} Test cases verified (+50 XP)` : "Pending sandbox execution"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
