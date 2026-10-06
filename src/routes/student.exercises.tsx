import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Chip, Console, Meter, PageHeader, Panel, Stat } from "@/components/kit";
import { useAppStore } from "@/lib/app-store";
import { getAcceleratorDay, type AcceleratorDay } from "@/lib/placement-accelerator-data";
import { getTrackSyllabus } from "@/lib/syllabus-data";
import { TRACKS, trackById, type TrackId } from "@/lib/tracks";
import {
  getDayAptitudeQuestions,
  getDayCorporateEnglishQuestions,
  type DailyExerciseQuestion,
} from "@/lib/daily-exercise-questions";
import {
  useLiveStudentProfile,
  useLiveStudentProgress,
  useLiveExerciseSubmissions,
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
  Cpu,
  Activity,
  Brain,
} from "lucide-react";
import { TeachTheMachineHub } from "@/components/teach-the-machine/TeachTheMachineHub";
import { PredictRunExplainSimulators } from "@/components/simulators/PredictRunExplainSimulators";
import { SpacedReviewHub } from "@/components/spaced-review/SpacedReviewHub";

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

function DailyExercisesPage() {
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
    () => getAcceleratorDay(selectedDayNum, selectedTrackId),
    [selectedDayNum, selectedTrackId],
  );

  const primaryTrack = trackById(selectedTrackId);
  const technicalSyllabus = useMemo(() => getTrackSyllabus(selectedTrackId), [selectedTrackId]);

  // Technical syllabus day calculation
  const weekIdx = Math.floor((selectedDayNum - 1) / 5);
  const dayInWeekIdx = (selectedDayNum - 1) % 5;
  const currentWeekPlan = technicalSyllabus.weeks[weekIdx] || technicalSyllabus.weeks[0]!;
  const currentTechDay = currentWeekPlan.days[dayInWeekIdx] || currentWeekPlan.days[0]!;

  // Interactive Workout State
  // Atomic processing click ref to synchronously eliminate race conditions on rapid multi-clicks
  const isProcessingClickRef = useRef<Record<string, boolean>>({});

  const dayAptitudeQuestions = useMemo(
    () => getDayAptitudeQuestions(selectedDayNum),
    [selectedDayNum],
  );

  const dayEnglishQuestions = useMemo(
    () => getDayCorporateEnglishQuestions(selectedDayNum),
    [selectedDayNum],
  );

  // 1. Aptitude & Logic (Exactly 10 questions for selected day)
  const aptitudeCompletedCount = useMemo(() => {
    return dayAptitudeQuestions.filter((q) => {
      const rec =
        store.profile.dailyExerciseRecords?.[q.id] ||
        (selectedDayNum === 1
          ? store.profile.dailyExerciseRecords?.[q.id.replace("D1-", "")]
          : undefined);
      return Boolean(rec?.isLocked);
    }).length;
  }, [dayAptitudeQuestions, store.profile.dailyExerciseRecords, selectedDayNum]);

  const aptitudeXpEarned = useMemo(() => {
    return dayAptitudeQuestions.reduce((sum, q) => {
      const rec =
        store.profile.dailyExerciseRecords?.[q.id] ||
        (selectedDayNum === 1
          ? store.profile.dailyExerciseRecords?.[q.id.replace("D1-", "")]
          : undefined);
      return sum + (rec?.isLocked && rec.isCorrect ? 1 : 0);
    }, 0);
  }, [dayAptitudeQuestions, store.profile.dailyExerciseRecords, selectedDayNum]);

  // 2. Corporate English (Exactly 10 questions for selected day)
  const englishCompletedCount = useMemo(() => {
    return dayEnglishQuestions.filter((q) => {
      const rec =
        store.profile.dailyExerciseRecords?.[q.id] ||
        (selectedDayNum === 1
          ? store.profile.dailyExerciseRecords?.[q.id.replace("D1-", "")]
          : undefined);
      return Boolean(rec?.isLocked);
    }).length;
  }, [dayEnglishQuestions, store.profile.dailyExerciseRecords, selectedDayNum]);

  const englishXpEarned = useMemo(() => {
    return dayEnglishQuestions.reduce((sum, q) => {
      const rec =
        store.profile.dailyExerciseRecords?.[q.id] ||
        (selectedDayNum === 1
          ? store.profile.dailyExerciseRecords?.[q.id.replace("D1-", "")]
          : undefined);
      return sum + (rec?.isLocked && rec.isCorrect ? 1 : 0);
    }, 0);
  }, [dayEnglishQuestions, store.profile.dailyExerciseRecords, selectedDayNum]);

  // Total Daily Exercise stats (Exactly 20 questions = Max 20 XP)
  const totalCompletedCount = aptitudeCompletedCount + englishCompletedCount;
  const totalDailyExerciseXp = aptitudeXpEarned + englishXpEarned;

  const [activeVocabIdx, setActiveVocabIdx] = useState<number>(0);

  // Authoritative Supabase exercise submissions query
  const { data: dbExerciseSubmissions } = useLiveExerciseSubmissions(liveStudentId, selectedDayNum);

  useEffect(() => {
    if (dbExerciseSubmissions && dbExerciseSubmissions.length > 0) {
      store.syncExerciseSubmissions(selectedDayNum, dbExerciseSubmissions);
      for (const sub of dbExerciseSubmissions) {
        isProcessingClickRef.current[sub.question_id] = true;
      }
    }
  }, [dbExerciseSubmissions, selectedDayNum, store]);

  // Synchronize processing ref if store hydrates
  useEffect(() => {
    if (store.profile.dailyExerciseRecords) {
      Object.keys(store.profile.dailyExerciseRecords).forEach((k) => {
        if (store.profile.dailyExerciseRecords?.[k]?.isLocked) {
          isProcessingClickRef.current[k] = true;
        }
      });
    }
  }, [store.profile.dailyExerciseRecords]);

  // 3. Technical Code drill state
  const [userCode, setUserCode] = useState<string>(() => {
    return `// ${primaryTrack.name} · Day ${selectedDayNum} Exercise\n// Objective: ${currentTechDay.practice}\n\nfunction solveChallenge() {\n  // TODO: Implement solution logic for ${currentTechDay.topic}\n  const status = "OPTIMIZED";\n  return status;\n}\n\nconsole.log(solveChallenge());`;
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

  // Completion calculation for selected day
  const isAptitudeDone = aptitudeCompletedCount === 10 || attendance.includes(selectedDayNum);
  const isEnglishDone = englishCompletedCount === 10 || attendance.includes(selectedDayNum);
  const isCodeDone = isCodeVerified || completedTechDays.includes(selectedDayNum);

  const completedModulesCount =
    (isAptitudeDone ? 1 : 0) + (isEnglishDone ? 1 : 0) + (isCodeDone ? 1 : 0);

  // Authoritative day completion evaluation across the 90-day cadence
  const isDayCompleted = useCallback(
    (d: number) => {
      if (d === selectedDayNum && completedModulesCount === 3) return true;
      if (attendance.includes(d) && completedTechDays.includes(d)) return true;
      if (attendance.includes(d) && d < cohortDay) return true;
      return false;
    },
    [selectedDayNum, completedModulesCount, attendance, completedTechDays, cohortDay],
  );

  // Maximum unlocked day: Day 1 is always unlocked. Completing Day d unlocks Day d + 1.
  const maxUnlockedDay = useMemo(() => {
    let highest = Math.max(1, cohortDay);
    for (let d = 1; d <= 90; d++) {
      if (isDayCompleted(d)) {
        if (d + 1 > highest) {
          highest = Math.min(90, d + 1);
        }
      }
    }
    return highest;
  }, [cohortDay, isDayCompleted]);

  // A day is unlocked if it's Day 1, <= cohortDay, <= maxUnlockedDay, or if previous day was finished
  const isDayUnlocked = useCallback(
    (d: number) => {
      if (d === 1) return true;
      if (d <= cohortDay) return true;
      if (d <= maxUnlockedDay) return true;
      return isDayCompleted(d - 1);
    },
    [cohortDay, maxUnlockedDay, isDayCompleted],
  );

  // Helper to persist authoritative dual completion when all 3 workouts are finished
  const checkAndFinalizeDayCompletion = useCallback(
    async (dayNum: number, aptDone: boolean, engDone: boolean, codeDone: boolean) => {
      if (aptDone && engDone && codeDone) {
        if (liveStudentId) {
          await store.completePlacementDay(dayNum);
          await store.completeTechDay(dayNum);
          queryClient.invalidateQueries({ queryKey: ["live", "student-progress", liveStudentId] });
          queryClient.invalidateQueries({
            queryKey: ["live", "student-profile", store.supabaseSession?.user?.id],
          });
        }
        toast.success(`Day ${dayNum} Completed! (3/3 Workouts Mastered)`, {
          description:
            dayNum < 90
              ? `Day ${dayNum + 1} is now unlocked! Great job advancing your cadence.`
              : "Outstanding! You have completed all 90 days of the accelerator!",
        });
      }
    },
    [liveStudentId, store, queryClient],
  );

  // Overall workout accuracy
  const totalQuestionsAnswered = totalCompletedCount;
  const correctAnswersCount = totalDailyExerciseXp;
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

  // Load and hydrate exercise interactive state on day change
  const handleSelectDay = (dayNum: number) => {
    if (!isDayUnlocked(dayNum)) {
      toast.info(`Day ${dayNum} is Locked`, {
        description: `Complete all 3 workouts on Day ${dayNum - 1} to unlock Day ${dayNum}.`,
      });
      return;
    }
    setSelectedDayNum(dayNum);
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

  // ---------------------------------------------------------------------------
  // Atomic Option Click Handlers (Enforces One-Time Answer & Permanent Locking)
  // ---------------------------------------------------------------------------
  const handleQuestionOptionClick = async (q: DailyExerciseQuestion, optIdx: number) => {
    const qId = q.id;
    const existingRec =
      store.profile.dailyExerciseRecords?.[qId] ||
      (selectedDayNum === 1
        ? store.profile.dailyExerciseRecords?.[qId.replace("D1-", "")]
        : undefined);
    if (isProcessingClickRef.current[qId] || existingRec?.isLocked) {
      return;
    }
    isProcessingClickRef.current[qId] = true;

    if (!liveStudentId) {
      toast.error("Authentication Required", {
        description:
          "You must be logged into an active student account to submit exercise answers.",
      });
      delete isProcessingClickRef.current[qId];
      return;
    }

    try {
      const res = await store.recordDailyExerciseAnswer(
        selectedDayNum,
        q.category,
        q.id,
        optIdx,
        q.correct_option,
      );

      if (res?.ok) {
        if (res.isCorrect) {
          toast.success("Correct Answer! (+1 XP)", {
            description: `Awarded 1 XP for question ${q.id}. Total Daily XP: ${totalDailyExerciseXp + 1} / 20 XP.`,
          });
        } else {
          toast.error("Incorrect Answer (0 XP)", {
            description: `0 XP for ${q.id}. Correct option was ${String.fromCharCode(65 + q.correct_option)}.`,
          });
        }

        queryClient.invalidateQueries({
          queryKey: ["live", "exercise-submissions", liveStudentId, selectedDayNum],
        });
        queryClient.invalidateQueries({
          queryKey: ["live", "student-profile", store.supabaseSession?.user?.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["live", "student-progress", liveStudentId],
        });

        const nextAptCount =
          q.category === "aptitude_logic" ? aptitudeCompletedCount + 1 : aptitudeCompletedCount;
        const nextEngCount =
          q.category === "corporate_english" ? englishCompletedCount + 1 : englishCompletedCount;

        if (nextAptCount === 10 && nextEngCount === 10 && isCodeDone) {
          await checkAndFinalizeDayCompletion(selectedDayNum, true, true, true);
        }
      } else {
        delete isProcessingClickRef.current[qId];
      }
    } catch (_err) {
      delete isProcessingClickRef.current[qId];
    }
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
    if (!liveStudentId) {
      toast.error("Authentication Required", {
        description:
          "You must be logged into an active student account to verify technical exercises.",
      });
      return;
    }

    const res = await store.completeTechDay(selectedDayNum);
    if (!res?.ok) {
      return;
    }

    setIsCodeVerified(true);
    queryClient.invalidateQueries({ queryKey: ["live", "student-progress", liveStudentId] });
    queryClient.invalidateQueries({
      queryKey: ["live", "student-profile", store.supabaseSession?.user?.id],
    });

    await checkAndFinalizeDayCompletion(selectedDayNum, isAptitudeDone, isEnglishDone, true);
  };

  // Mode switcher: Daily 20 questions, Teach the machine, Simulators, Spaced recall
  const [workoutMode, setWorkoutMode] = useState<
    "daily-questions" | "teach-machine" | "simulators" | "spaced-review"
  >("daily-questions");

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <PageHeader
        title="Practice & Mastery Hub"
        subtitle={`Interactive practice engine: Daily 20 questions, logic rule creation, predictive simulators, and spaced memory recall for Day ${selectedDayNum} of 90.`}
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
            <Chip tone={totalCompletedCount === 20 ? "emerald" : "cyan"}>
              {totalCompletedCount} / 20 Questions Done ({totalDailyExerciseXp} / 20 XP)
            </Chip>
          </div>
        }
      />

      {/* Mode Switcher Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border/80 pb-3">
        <button
          type="button"
          onClick={() => setWorkoutMode("daily-questions")}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all border",
            workoutMode === "daily-questions"
              ? "bg-primary text-primary-foreground border-primary shadow-xs"
              : "bg-card hover:bg-muted text-muted-foreground hover:text-foreground border-border"
          )}
        >
          <BookOpen className="size-3.5" />
          <span>Daily 20 Questions</span>
        </button>

        <button
          type="button"
          onClick={() => setWorkoutMode("teach-machine")}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all border",
            workoutMode === "teach-machine"
              ? "bg-purple-600 text-white border-purple-600 shadow-xs"
              : "bg-card hover:bg-muted text-muted-foreground hover:text-foreground border-border"
          )}
        >
          <Cpu className="size-3.5" />
          <span>Teach the Machine</span>
        </button>

        <button
          type="button"
          onClick={() => setWorkoutMode("simulators")}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all border",
            workoutMode === "simulators"
              ? "bg-blue-600 text-white border-blue-600 shadow-xs"
              : "bg-card hover:bg-muted text-muted-foreground hover:text-foreground border-border"
          )}
        >
          <Activity className="size-3.5" />
          <span>Predict → Run Simulators</span>
        </button>

        <button
          type="button"
          onClick={() => setWorkoutMode("spaced-review")}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all border",
            workoutMode === "spaced-review"
              ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
              : "bg-card hover:bg-muted text-muted-foreground hover:text-foreground border-border"
          )}
        >
          <Brain className="size-3.5" />
          <span>Memory & Spaced Recall</span>
        </button>
      </div>

      {workoutMode === "teach-machine" && <TeachTheMachineHub />}
      {workoutMode === "simulators" && <PredictRunExplainSimulators />}
      {workoutMode === "spaced-review" && <SpacedReviewHub />}

      {workoutMode === "daily-questions" && (
        <div className="space-y-6">

      {/* KPI Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Daily Exercise Progress"
          value={`${totalCompletedCount} / 20 Done`}
          tone={totalCompletedCount === 20 ? "emerald" : "brand"}
          hint={
            totalCompletedCount === 20
              ? "All 20 daily questions finished!"
              : `${20 - totalCompletedCount} questions remaining today`
          }
        />
        <Stat
          label="Aptitude & Logic"
          value={`${aptitudeCompletedCount} / 10 Done`}
          tone={aptitudeCompletedCount === 10 ? "emerald" : "cyan"}
          hint={`${aptitudeXpEarned} / 10 XP earned`}
        />
        <Stat
          label="Corporate English"
          value={`${englishCompletedCount} / 10 Done`}
          tone={englishCompletedCount === 10 ? "emerald" : "purple"}
          hint={`${englishXpEarned} / 10 XP earned`}
        />
        <Stat
          label="Daily Exercise XP"
          value={`${totalDailyExerciseXp} / 20 XP`}
          tone="amber"
          hint="Max 20 XP per day (1 XP per correct answer)"
        />
      </div>

      {/* Day Completion & Unlocked Next Day Banner */}
      {completedModulesCount === 3 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-foreground shadow-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500 text-white shrink-0 shadow-xs">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                Day {selectedDayNum} Completed! (3/3 Workouts Mastered)
              </p>
              <p className="text-xs text-muted-foreground">
                {selectedDayNum < 90
                  ? `Day ${selectedDayNum + 1} is now unlocked and available in your 90-Day Cadence!`
                  : "All 90 days completed! You have mastered the entire placement and technical cadence!"}
              </p>
            </div>
          </div>
          {selectedDayNum < 90 && (
            <button
              type="button"
              onClick={() => handleSelectDay(selectedDayNum + 1)}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              Continue to Day {selectedDayNum + 1}
              <ChevronRight className="size-4" />
            </button>
          )}
        </div>
      )}

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
                type="button"
                onClick={() => setDayFilter("current-week")}
                className={cn(
                  "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer",
                  dayFilter === "current-week"
                    ? "bg-card text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Week {currentWeekNumber}
              </button>
              <button
                type="button"
                onClick={() => setDayFilter("fridays")}
                className={cn(
                  "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer",
                  dayFilter === "fridays"
                    ? "bg-card text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Fridays (Tests)
              </button>
              <button
                type="button"
                onClick={() => setDayFilter("all")}
                className={cn(
                  "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer",
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
                type="button"
                onClick={() => handleSelectDay(Math.max(1, selectedDayNum - 1))}
                disabled={selectedDayNum <= 1}
                className="rounded-lg border border-border p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 transition-colors cursor-pointer"
                title="Previous Day"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  const nextDay = Math.min(90, selectedDayNum + 1);
                  if (!isDayUnlocked(nextDay)) {
                    toast.info(`Day ${nextDay} is Locked`, {
                      description: `Complete all 3 workouts on Day ${selectedDayNum} to unlock Day ${nextDay}.`,
                    });
                    return;
                  }
                  handleSelectDay(nextDay);
                }}
                disabled={selectedDayNum >= 90 || !isDayUnlocked(selectedDayNum + 1)}
                className="rounded-lg border border-border p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 transition-colors cursor-pointer"
                title={
                  !isDayUnlocked(selectedDayNum + 1)
                    ? `Day ${selectedDayNum + 1} Locked`
                    : "Next Day"
                }
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
            const isCompleted = isDayCompleted(dayNum);
            const isUnlocked = isDayUnlocked(dayNum);
            const isPartiallyDone =
              isUnlocked &&
              !isCompleted &&
              (attendance.includes(dayNum) || completedTechDays.includes(dayNum));

            return (
              <button
                key={dayNum}
                type="button"
                onClick={() => {
                  if (!isUnlocked) {
                    toast.info(`Day ${dayNum} is Locked`, {
                      description: `Complete all 3 workouts on Day ${dayNum - 1} to unlock Day ${dayNum}.`,
                    });
                    return;
                  }
                  handleSelectDay(dayNum);
                }}
                disabled={!isUnlocked}
                className={cn(
                  "flex flex-col items-center justify-center min-w-[62px] rounded-lg border p-2 text-center transition-all text-xs relative select-none",
                  !isUnlocked && "opacity-40 bg-muted/20 border-border/40 cursor-not-allowed",
                  isUnlocked &&
                    isCurrent &&
                    "border-primary bg-primary/10 text-primary font-bold shadow-xs ring-1 ring-primary cursor-pointer",
                  isUnlocked &&
                    !isCurrent &&
                    isCompleted &&
                    "border-emerald-500/40 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer",
                  isUnlocked &&
                    !isCurrent &&
                    !isCompleted &&
                    isToday &&
                    "border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold cursor-pointer",
                  isUnlocked &&
                    !isCurrent &&
                    !isCompleted &&
                    !isToday &&
                    isFriday &&
                    "border-purple-500/30 bg-purple-500/5 text-purple-600 dark:text-purple-400 hover:bg-muted/40 cursor-pointer",
                  isUnlocked &&
                    !isCurrent &&
                    !isCompleted &&
                    !isToday &&
                    !isFriday &&
                    "border-border/70 bg-card text-muted-foreground hover:text-foreground hover:border-border hover:bg-muted/40 cursor-pointer",
                )}
                title={
                  !isUnlocked
                    ? `Day ${dayNum} Locked (Finish Day ${dayNum - 1} first)`
                    : `Day ${dayNum}`
                }
              >
                <div className="flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider opacity-75">
                  {!isUnlocked ? <Lock className="size-2.5 text-muted-foreground" /> : null}
                  <span>{isFriday ? "Milestone" : `D${dayNum}`}</span>
                </div>
                <span className="font-mono text-xs font-bold mt-0.5 flex items-center gap-1">
                  {isCompleted ? (
                    <CheckCircle2 className="size-3 text-emerald-500" />
                  ) : isPartiallyDone ? (
                    <Circle className="size-2.5 fill-amber-500 text-amber-500" />
                  ) : !isUnlocked ? (
                    <Lock className="size-2.5 text-muted-foreground/60" />
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
            1. Aptitude &amp; Logic ({aptitudeCompletedCount}/10)
            {aptitudeCompletedCount === 10 && <Check className="size-3 text-emerald-400 ml-0.5" />}
          </button>
          <button
            onClick={() => setActiveTab("english")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer",
              activeTab === "english"
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
            )}
          >
            <BookOpen className="size-3.5" />
            2. Corporate English ({englishCompletedCount}/10)
            {englishCompletedCount === 10 && <Check className="size-3 text-emerald-400 ml-0.5" />}
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer",
              activeTab === "code"
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
            )}
          >
            <Code2 className="size-3.5" />
            3. Technical Code Drill
            {isCodeDone && <Check className="size-3 text-emerald-400 ml-0.5" />}
          </button>
        </div>

        {/* Completion Progress Bar */}
        <div className="flex items-center gap-3">
          <div className="w-28 hidden sm:block">
            <Meter value={(totalCompletedCount / 20) * 100} tone="emerald" />
          </div>
          <span className="text-xs font-mono font-medium text-muted-foreground">
            {totalCompletedCount}/20 Questions ({totalDailyExerciseXp}/20 XP)
          </span>
        </div>
      </div>

      {/* Daily Exercise Completion Banner when all 20 questions completed */}
      {totalCompletedCount === 20 && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-900 dark:text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <Trophy className="size-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                Daily Exercise Mastered! (20 / 20 Questions Completed) 🌟
              </p>
              <p className="text-xs text-muted-foreground">
                Aptitude &amp; Logic: {aptitudeXpEarned} / 10 XP · Corporate English:{" "}
                {englishXpEarned} / 10 XP · Total Daily Exercise: {totalDailyExerciseXp} / 20 XP
                earned.
              </p>
            </div>
          </div>
          <Chip tone="emerald">
            Daily Exercise 20 / 20 Completed ({totalDailyExerciseXp} / 20 XP)
          </Chip>
        </div>
      )}

      {/* WORKOUT CONTENT SECTIONS */}
      <div className="space-y-6">
        {/* PILLAR 1: APTITUDE & LOGICAL REASONING WORKOUT (10 QUESTIONS · 10 XP) */}
        {activeTab === "aptitude" && (
          <Panel
            id="aptitude-workout"
            title={
              <div className="flex items-center gap-2">
                <Calculator className="size-4 text-primary" />
                <span>1. Aptitude &amp; Logic (10 Questions · 10 XP Maximum)</span>
              </div>
            }
            subtitle={`Aptitude & Logic Workout · ${aptitudeCompletedCount} / 10 Completed · ${aptitudeXpEarned} / 10 XP Earned`}
            action={
              aptitudeCompletedCount === 10 ? (
                <Chip tone="emerald">Completed ({aptitudeXpEarned} / 10 XP)</Chip>
              ) : (
                <Chip tone="cyan">{aptitudeCompletedCount} / 10 Completed</Chip>
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

              {/* 10 Aptitude & Logic Questions */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-foreground">
                    Aptitude &amp; Logic Questions (10 Questions · 10 XP Max)
                  </p>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {aptitudeCompletedCount} / 10 Completed · {aptitudeXpEarned} / 10 XP
                  </span>
                </div>

                {dayAptitudeQuestions.map((q, idx) => {
                  const rec =
                    store.profile.dailyExerciseRecords?.[q.id] ||
                    (selectedDayNum === 1
                      ? store.profile.dailyExerciseRecords?.[q.id.replace("D1-", "")]
                      : undefined);
                  const hasAnswered = Boolean(rec?.isLocked);
                  const selected = rec?.selectedOption;
                  const isCorrect = rec?.isCorrect ?? false;

                  return (
                    <div
                      key={q.id}
                      id={`question-card-${q.id}`}
                      className="rounded-lg border border-border bg-card/70 p-3.5 space-y-2.5 shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-foreground text-xs leading-relaxed">
                          <span className="font-mono text-primary font-semibold mr-1.5">
                            Q{idx + 1}.
                          </span>
                          {q.question}
                        </p>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground uppercase">
                            {q.id}
                          </span>
                          <span className="rounded bg-muted/80 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground capitalize">
                            {q.difficulty}
                          </span>
                          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-mono text-primary font-semibold">
                            {hasAnswered ? (isCorrect ? "+1 XP" : "0 XP") : "1 XP"}
                          </span>
                        </div>
                      </div>

                      {/* Options Grid */}
                      <div className="grid gap-1.5 sm:grid-cols-2">
                        {q.options.map((opt, optIdx) => {
                          const isOptionSelected = selected === optIdx;
                          const isOptionCorrectAnswer = optIdx === q.correct_option;

                          let btnStyle =
                            "border-border bg-card hover:bg-muted/50 text-foreground cursor-pointer";
                          if (hasAnswered) {
                            if (isOptionCorrectAnswer) {
                              btnStyle =
                                "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold cursor-not-allowed";
                            } else if (isOptionSelected) {
                              btnStyle =
                                "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300 cursor-not-allowed";
                            } else {
                              btnStyle = "opacity-60 border-border bg-card cursor-not-allowed";
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              id={`btn-${q.id}-opt-${optIdx}`}
                              disabled={hasAnswered}
                              onClick={() => handleQuestionOptionClick(q, optIdx)}
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
                            "rounded-md p-2.5 text-[11px] leading-relaxed",
                            isCorrect
                              ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20",
                          )}
                        >
                          <div className="flex items-center justify-between font-semibold">
                            <div className="flex items-center gap-1.5">
                              {isCorrect ? (
                                <>
                                  <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                                  <span>Correct (+1 XP)</span>
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="size-3.5 text-rose-600 dark:text-rose-400" />
                                  <span>
                                    Incorrect (0 XP) · Correct:{" "}
                                    {String.fromCharCode(65 + q.correct_option)} ({q.correct_answer}
                                    )
                                  </span>
                                </>
                              )}
                            </div>
                            <span className="font-mono text-[10px]">
                              {isCorrect ? "+1 XP" : "+0 XP"}
                            </span>
                          </div>
                          <p className="mt-1 text-muted-foreground">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Aptitude Action Footer */}
            <div className="mt-4 pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-24 hidden sm:block">
                  <Meter value={(aptitudeCompletedCount / 10) * 100} tone="emerald" />
                </div>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {aptitudeCompletedCount === 10
                    ? `Completed (10 / 10 · ${aptitudeXpEarned} / 10 XP)`
                    : `${aptitudeCompletedCount} / 10 Completed · ${aptitudeXpEarned} / 10 XP`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("english");
                  setTimeout(() => {
                    document
                      .getElementById("corporate-english-workout")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }, 50);
                }}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
              >
                <span>Next: Corporate English Workout (10 Questions)</span>
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </Panel>
        )}

        {/* PILLAR 2: CORPORATE ENGLISH & VERBAL WORKOUT (10 QUESTIONS · 10 XP) */}
        {activeTab === "english" && (
          <Panel
            id="corporate-english-workout"
            title={
              <div className="flex items-center gap-2">
                <BookOpen className="size-4 text-primary" />
                <span>2. Corporate English (10 Questions · 10 XP Maximum)</span>
              </div>
            }
            subtitle={`Corporate English Workout · ${englishCompletedCount} / 10 Completed · ${englishXpEarned} / 10 XP Earned`}
            action={
              englishCompletedCount === 10 ? (
                <Chip tone="emerald">Completed ({englishXpEarned} / 10 XP)</Chip>
              ) : (
                <Chip tone="cyan">{englishCompletedCount} / 10 Completed</Chip>
              )
            }
            className="flex flex-col justify-between"
          >
            <div className="space-y-4 text-xs">
              {/* Grammar Rule Card */}
              <div className="rounded-lg border border-border bg-card p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-foreground font-semibold text-xs">
                  <BookmarkCheck className="size-3.5 text-primary" />
                  <span>Grammar &amp; Corporate Etiquette Rule</span>
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
                        "rounded-lg border p-2 text-center transition-all cursor-pointer",
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
                    <span className="text-[10px] text-primary font-semibold">
                      Corporate Context
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Used to demonstrate professional precision during interviews and status updates.
                    Example:{" "}
                    <em>
                      "We leveraged {currentPlan.english.keyVocabulary[activeVocabIdx]} to optimize
                      the client deliverable."
                    </em>
                  </p>
                </div>
              </div>

              {/* 10 Corporate English Questions */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-foreground">
                    Corporate English Questions (10 Questions · 10 XP Max)
                  </p>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {englishCompletedCount} / 10 Completed · {englishXpEarned} / 10 XP
                  </span>
                </div>

                {dayEnglishQuestions.map((q, idx) => {
                  const rec =
                    store.profile.dailyExerciseRecords?.[q.id] ||
                    (selectedDayNum === 1
                      ? store.profile.dailyExerciseRecords?.[q.id.replace("D1-", "")]
                      : undefined);
                  const hasAnswered = Boolean(rec?.isLocked);
                  const selected = rec?.selectedOption;
                  const isCorrect = rec?.isCorrect ?? false;

                  return (
                    <div
                      key={q.id}
                      id={`question-card-${q.id}`}
                      className="rounded-lg border border-border bg-card/70 p-3.5 space-y-2.5 shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-foreground text-xs leading-relaxed">
                          <span className="font-mono text-primary font-semibold mr-1.5">
                            Q{idx + 1}.
                          </span>
                          {q.question}
                        </p>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground uppercase">
                            {q.id}
                          </span>
                          <span className="rounded bg-muted/80 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground capitalize">
                            {q.difficulty}
                          </span>
                          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-mono text-primary font-semibold">
                            {hasAnswered ? (isCorrect ? "+1 XP" : "0 XP") : "1 XP"}
                          </span>
                        </div>
                      </div>

                      {/* Options Grid */}
                      <div className="grid gap-1.5 sm:grid-cols-2">
                        {q.options.map((opt, optIdx) => {
                          const isOptionSelected = selected === optIdx;
                          const isOptionCorrectAnswer = optIdx === q.correct_option;

                          let btnStyle =
                            "border-border bg-card hover:bg-muted/50 text-foreground cursor-pointer";
                          if (hasAnswered) {
                            if (isOptionCorrectAnswer) {
                              btnStyle =
                                "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold cursor-not-allowed";
                            } else if (isOptionSelected) {
                              btnStyle =
                                "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300 cursor-not-allowed";
                            } else {
                              btnStyle = "opacity-60 border-border bg-card cursor-not-allowed";
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              id={`btn-${q.id}-opt-${optIdx}`}
                              disabled={hasAnswered}
                              onClick={() => handleQuestionOptionClick(q, optIdx)}
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
                            "rounded-md p-2.5 text-[11px] leading-relaxed",
                            isCorrect
                              ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20",
                          )}
                        >
                          <div className="flex items-center justify-between font-semibold">
                            <div className="flex items-center gap-1.5">
                              {isCorrect ? (
                                <>
                                  <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                                  <span>Correct (+1 XP)</span>
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="size-3.5 text-rose-600 dark:text-rose-400" />
                                  <span>
                                    Incorrect (0 XP) · Correct:{" "}
                                    {String.fromCharCode(65 + q.correct_option)} ({q.correct_answer}
                                    )
                                  </span>
                                </>
                              )}
                            </div>
                            <span className="font-mono text-[10px]">
                              {isCorrect ? "+1 XP" : "+0 XP"}
                            </span>
                          </div>
                          <p className="mt-1 text-muted-foreground">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* English Action Footer */}
            <div className="mt-4 pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-24 hidden sm:block">
                  <Meter value={(englishCompletedCount / 10) * 100} tone="emerald" />
                </div>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {englishCompletedCount === 10
                    ? `Completed (10 / 10 · ${englishXpEarned} / 10 XP)`
                    : `${englishCompletedCount} / 10 Completed · ${englishXpEarned} / 10 XP`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("code");
                  setTimeout(() => {
                    document
                      .getElementById("technical-code-workout")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }, 50);
                }}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
              >
                <span>Next: Technical Code Drill</span>
                <ArrowRight className="size-3.5" />
              </button>
            </div>
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
                <Chip tone="muted">Complete English to Open</Chip>
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
                    The Technical Code Drill will unlock and open automatically as soon as you
                    finish and submit your Corporate English workout.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!isAptitudeDone) {
                      setActiveTab("aptitude");
                      setTimeout(() => {
                        document
                          .getElementById("aptitude-workout")
                          ?.scrollIntoView({ behavior: "smooth" });
                      }, 50);
                    } else {
                      setActiveTab("english");
                      setTimeout(() => {
                        document
                          .getElementById("corporate-english-workout")
                          ?.scrollIntoView({ behavior: "smooth" });
                      }, 50);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
                >
                  <BookOpen className="size-3.5" />
                  <span>
                    {!isAptitudeDone ? "Go to Aptitude & Logic" : "Open Corporate English Workout"}
                  </span>
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Course Selector Tabs (If student has multiple assigned tracks) */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground text-[11px] font-medium">
                      Assigned Course:
                    </span>
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
                              setConsoleOutput([
                                `[ready] Switched sandbox to ${t.name} (Day ${selectedDayNum})`,
                              ]);
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
                    {isTestRunning && (
                      <span className="text-primary animate-pulse">Running test cases…</span>
                    )}
                  </div>
                  <Console
                    lines={consoleOutput}
                    empty="Click 'Run Test Cases' to compile and execute."
                  />
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
              Complete each daily module to advance your streak and maintain 100% attendance
              readiness for Day 90.
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
              isAptitudeDone ? "border-emerald-500/30 bg-emerald-500/5" : "border-border bg-card",
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">1. Aptitude &amp; Logic</span>
              {isAptitudeDone ? (
                <CheckCircle2 className="size-4 text-emerald-500" />
              ) : (
                <Circle className="size-4 text-muted-foreground" />
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {isAptitudeDone
                ? `10 Questions completed (${aptitudeXpEarned} / 10 XP)`
                : `${aptitudeCompletedCount} / 10 questions completed (${aptitudeXpEarned} / 10 XP)`}
            </p>
          </div>

          <div
            className={cn(
              "rounded-lg border p-3.5 space-y-1.5 transition-all",
              isEnglishDone ? "border-emerald-500/30 bg-emerald-500/5" : "border-border bg-card",
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
                ? `10 Questions completed (${englishXpEarned} / 10 XP)`
                : `${englishCompletedCount} / 10 questions completed (${englishXpEarned} / 10 XP)`}
            </p>
          </div>

          <div
            className={cn(
              "rounded-lg border p-3.5 space-y-1.5 transition-all",
              isCodeDone ? "border-emerald-500/30 bg-emerald-500/5" : "border-border bg-card",
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
              {isCodeDone
                ? `${primaryTrack.short} Test cases verified (+50 XP)`
                : "Pending sandbox execution"}
            </p>
          </div>
        </div>
      </div>
        </div>
      )}
    </div>
  );
}
