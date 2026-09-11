import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Chip, Console, Meter, PageHeader, Panel, Stat } from "@/components/kit";
import { useAppStore, type DailySteps } from "@/lib/app-store";
import {
  ACCELERATOR_90_DAYS,
  getAcceleratorDay,
  type AcceleratorDay,
} from "@/lib/placement-accelerator-data";
import {
  CheckCircle2,
  Circle,
  Mic,
  Play,
  Timer,
  Volume2,
  Sparkles,
  Send,
  Video,
  Award,
  Flame,
  HelpCircle,
  Calendar,
  BookOpen,
  Calculator,
  ListOrdered,
  Layers,
  ChevronRight,
  ChevronDown,
  Clock,
  GraduationCap,
  FileCheck2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import {
  useLiveStudentProfile,
  useLiveStudentProgress,
  completeLiveDailyStep,
  completeLivePlacementDay,
} from "@/lib/data";

export const Route = createFileRoute("/student/accelerator")({
  head: () => ({
    meta: [
      { title: "30-Minute Placement Accelerator — SantoGe Talent Cloud" },
      {
        name: "description",
        content:
          "Daily 30-minute synchronized placement routine: 10m English instructor broadcast, 10m Aptitude instructor drill, and 10m in-app guided practice for 90 days (18 Weeks × 5 Working Days).",
      },
      { property: "og:title", content: "30-Minute Placement Accelerator — SantoGe Talent Cloud" },
      {
        property: "og:description",
        content: "Daily 30-minute placement routine with streaks and instant XP.",
      },
    ],
  }),
  component: AcceleratorPage,
});

function AcceleratorPage() {
  const store = useAppStore();
  const queryClient = useQueryClient();

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
  const xp = liveProfileData?.profile?.xp ?? store.xp;
  const daily = liveProgressData?.daily || store.daily;

  const [selectedDayNum, setSelectedDayNum] = useState<number>(cohortDay);
  const [activeTab, setActiveTab] = useState<
    "practice" | "english-instructor" | "aptitude-instructor" | "90days-schedule"
  >("practice");
  const [isInstructorMode, setIsInstructorMode] = useState<boolean>(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [puzzleAnswer, setPuzzleAnswer] = useState<number | null>(null);
  const [expandedWeeks, setExpandedWeeks] = useState<Record<number, boolean>>({ 1: true, 2: true });
  const [log, setLog] = useState<string[]>([
    "[ready] AI Speech Engine & ITSE STAR Rubric ready.",
    "[sample] Introduce yourself, your technical specialization, and one project you built.",
  ]);
  const [pitch, setPitch] = useState(false);

  const currentPlan: AcceleratorDay = useMemo(
    () => getAcceleratorDay(selectedDayNum),
    [selectedDayNum],
  );

  const correctMcqs = currentPlan.practice.mcqs.filter((m, i) => answers[i] === m.answer).length;
  const isPuzzleCorrect = puzzleAnswer === currentPlan.practice.puzzle.answer;
  const totalCorrect = correctMcqs + (isPuzzleCorrect ? 1 : 0);
  const doneCount = Object.values(daily).filter(Boolean).length;

  const toggleWeek = (wNum: number) => {
    setExpandedWeeks((prev) => ({ ...prev, [wNum]: !prev[wNum] }));
  };

  const runPitch = () => {
    setPitch(true);
    setLog((l) => [
      `[voice] Microphone active: Recording 60s pitch on Day ${selectedDayNum} prompt…`,
      ...l,
    ]);
    setTimeout(async () => {
      setPitch(false);
      setLog((l) => [
        `[voice] Analysis: Clarity 89% · Pace 76 wpm (Optimal) · Vocabulary Hits: ${currentPlan.english.keyVocabulary.slice(0, 2).join(", ")}`,
        "[voice] STAR Rubric Match: Situation (✓) Task (✓) Action (✓) Result (✓)",
        "[voice] Competency evidence logged to Talent Score engine (+25 XP)",
        ...l,
      ]);
      if (liveStudentId) {
        await completeLiveDailyStep(liveStudentId, "practice");
        await completeLivePlacementDay(liveStudentId, selectedDayNum);
        queryClient.invalidateQueries({
          queryKey: ["live", "student-progress", liveStudentId],
        });
        queryClient.invalidateQueries({
          queryKey: ["live", "student-profile", store.supabaseSession?.user?.id],
        });
      }
      store.setDailyStep("practice", true);
      store.completePlacementDay(selectedDayNum);
      toast.success("Voice pitch analysed successfully!", {
        description: "+25 XP awarded · Communication pillar updated",
      });
    }, 1800);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="30-Minute Daily Placement Accelerator"
        subtitle="18 Weeks × 5 Working Days = 90 Days. 10m English Instructor Plan + 10m Aptitude Instructor Plan + 10m In-App Combined Practice Drill."
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsInstructorMode(!isInstructorMode)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all",
                isInstructorMode
                  ? "border-primary/40 bg-primary/10 text-primary shadow-xs"
                  : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50",
              )}
            >
              <GraduationCap className="size-3.5" />
              {isInstructorMode ? "Instructor Lesson Mode Active" : "Switch to Instructor View"}
            </button>
            <Chip tone="amber">🔥 Day {streak} Streak</Chip>
          </div>
        }
      />

      {/* KPI Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat
          label="Today's Blocks Complete"
          value={`${doneCount} / 3`}
          hint="English + Aptitude + Practice"
        />
        <Stat
          label="Practice Accuracy"
          value={`${totalCorrect} / ${currentPlan.practice.mcqs.length + 1}`}
          tone="emerald"
          hint="3 MCQs + 1 Logic Brainteaser"
        />
        <Stat
          label="Placement XP Balance"
          value={`${xp} XP`}
          tone="brand"
          hint="+25 XP per completed block"
        />
        <Stat
          label="Cohort Telegram Sync"
          value="Live @ 06:00"
          tone="cyan"
          hint="t.me/stc-batch · Mon–Fri"
        />
      </div>

      {/* Day Selector Ribbon (90 Days / 18 Weeks) */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">
              Select Accelerator Day (Week {currentPlan.week} · {currentPlan.dayOfWeek})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedDayNum(store.placementDay || 1)}
              className="rounded-md border border-border bg-muted/60 px-2.5 py-1 text-[11px] font-mono font-medium text-foreground hover:bg-muted hover:border-border/80 transition-colors"
            >
              Jump to Today (Day {store.placementDay || 1})
            </button>
            <span className="text-[11px] text-muted-foreground font-mono">
              Day {selectedDayNum} of 90
            </span>
          </div>
        </div>

        {/* Horizontal Scrollable Day Strip */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
          {Array.from({ length: 90 }, (_, i) => {
            const dayNum = i + 1;
            const weekNum = Math.floor(i / 5) + 1;
            const isFriday = dayNum % 5 === 0;
            const isCurrent = dayNum === selectedDayNum;
            const isToday = dayNum === (store.placementDay || 1);
            return (
              <button
                key={dayNum}
                onClick={() => {
                  setSelectedDayNum(dayNum);
                  setAnswers({});
                  setPuzzleAnswer(null);
                }}
                className={cn(
                  "flex flex-col items-center justify-center min-w-[54px] rounded-lg border p-2 text-center transition-all text-xs",
                  isCurrent
                    ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                    : isToday
                      ? "border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold"
                      : isFriday
                        ? "border-border bg-muted/30 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                        : "border-border/70 bg-card text-muted-foreground hover:text-foreground hover:border-border hover:bg-muted/40",
                )}
              >
                <span className="text-[9px] font-mono uppercase tracking-wider opacity-70">
                  {isFriday ? "Fri Test" : `W${weekNum}`}
                </span>
                <span className="font-mono text-xs font-bold mt-0.5">D{dayNum}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3-Step Daily Routine Cards */}
      <Panel
        title={`Day ${selectedDayNum}: ${currentPlan.theme}`}
        subtitle={`Weekly Structure: Monday to Friday (18 Weeks × 5 Days) · ${currentPlan.dayOfWeek}`}
      >
        <div className="grid gap-3.5 sm:grid-cols-3">
          {/* Step 1: English */}
          <div
            className={cn(
              "flex flex-col justify-between rounded-xl border p-4 transition-all text-left bg-card shadow-xs",
              store.daily.english
                ? "border-emerald-500/40 bg-emerald-500/5"
                : "border-border hover:border-primary/40",
            )}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-mono font-medium text-muted-foreground border border-border">
                  10 min · English
                </span>
                <button
                  onClick={() => store.completeDailyStep("english")}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {store.daily.english ? (
                    <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Circle className="size-4 text-muted-foreground/60" />
                  )}
                </button>
              </div>
              <h4 className="mt-2.5 text-sm font-semibold text-foreground">
                {currentPlan.english.title}
              </h4>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {currentPlan.english.instructorBrief}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
              <button
                onClick={() => setActiveTab("english-instructor")}
                className="text-xs font-semibold text-primary hover:underline"
              >
                {isInstructorMode ? "View Instructor Guide →" : "View Lesson & Audio →"}
              </button>
              <span className="font-mono text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                {store.daily.english ? "Completed ✓" : "+25 XP"}
              </span>
            </div>
          </div>

          {/* Step 2: Aptitude */}
          <div
            className={cn(
              "flex flex-col justify-between rounded-xl border p-4 transition-all text-left bg-card shadow-xs",
              store.daily.aptitude
                ? "border-emerald-500/40 bg-emerald-500/5"
                : "border-border hover:border-primary/40",
            )}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-mono font-medium text-muted-foreground border border-border">
                  10 min · Aptitude
                </span>
                <button
                  onClick={() => store.completeDailyStep("aptitude")}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {store.daily.aptitude ? (
                    <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Circle className="size-4 text-muted-foreground/60" />
                  )}
                </button>
              </div>
              <h4 className="mt-2.5 text-sm font-semibold text-foreground">
                {currentPlan.aptitude.title}
              </h4>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {currentPlan.aptitude.instructorBrief}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
              <button
                onClick={() => setActiveTab("aptitude-instructor")}
                className="text-xs font-semibold text-primary hover:underline"
              >
                {isInstructorMode ? "View Instructor Guide →" : "View Formulas & Tricks →"}
              </button>
              <span className="font-mono text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                {store.daily.aptitude ? "Completed ✓" : "+25 XP"}
              </span>
            </div>
          </div>

          {/* Step 3: Combined Practice */}
          <div
            className={cn(
              "flex flex-col justify-between rounded-xl border p-4 transition-all text-left bg-card shadow-xs",
              store.daily.practice
                ? "border-emerald-500/40 bg-emerald-500/5"
                : "border-border hover:border-primary/40",
            )}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-mono font-medium text-muted-foreground border border-border">
                  10 min · Practice
                </span>
                <button
                  onClick={() => store.completeDailyStep("practice")}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {store.daily.practice ? (
                    <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Circle className="size-4 text-muted-foreground/60" />
                  )}
                </button>
              </div>
              <h4 className="mt-2.5 text-sm font-semibold text-foreground">
                10m In-App Combined Practice
              </h4>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                3 MCQs + 1 Logic Brainteaser + 60s AI Voice Pitch Recording
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
              <button
                onClick={() => setActiveTab("practice")}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Launch Practice Drill →
              </button>
              <span className="font-mono text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                {store.daily.practice ? "Completed ✓" : "+25 XP"}
              </span>
            </div>
          </div>
        </div>
      </Panel>

      {/* Main Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        <button
          onClick={() => setActiveTab("practice")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all",
            activeTab === "practice"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50",
          )}
        >
          <Sparkles className="size-3.5" />
          10m In-App Guided Practice
        </button>

        <button
          onClick={() => setActiveTab("english-instructor")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all",
            activeTab === "english-instructor"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50",
          )}
        >
          <BookOpen className="size-3.5" />
          10m English Instructor Master Plan
        </button>

        <button
          onClick={() => setActiveTab("aptitude-instructor")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all",
            activeTab === "aptitude-instructor"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50",
          )}
        >
          <Calculator className="size-3.5" />
          10m Aptitude Instructor Master Plan
        </button>

        <button
          onClick={() => setActiveTab("90days-schedule")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all ml-auto",
            activeTab === "90days-schedule"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50",
          )}
        >
          <ListOrdered className="size-3.5" />
          Full 90-Day Schedule (18 Weeks)
        </button>
      </div>

      {/* TAB 1: IN-APP GUIDED PRACTICE */}
      {activeTab === "practice" && (
        <div className="grid gap-4 lg:grid-cols-[1fr_400px]">
          {/* Left Column: MCQs + Logic Brainteaser */}
          <div className="space-y-4">
            <Panel
              title={`Day ${selectedDayNum} Guided Practice: MCQs & Brainteaser`}
              subtitle="Instant answer validation with worked step-by-step explanations"
              action={
                <Chip tone="cyan">
                  {totalCorrect} / {currentPlan.practice.mcqs.length + 1} Correct
                </Chip>
              }
            >
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <FileCheck2 className="size-3.5 text-primary" />
                  Part 1: Daily Placement MCQs ({currentPlan.practice.mcqs.length} Questions)
                </p>

                {currentPlan.practice.mcqs.map((m, i) => (
                  <div
                    key={m.q}
                    className="rounded-xl border border-border bg-muted/20 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-foreground">
                        <span className="font-mono text-primary mr-1.5">Q{i + 1}.</span> {m.q}
                      </p>
                      <span className="rounded bg-muted px-2 py-0.5 text-[9px] font-mono uppercase text-muted-foreground border border-border">
                        {m.category}
                      </span>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      {m.options.map((opt, oi) => {
                        const isPicked = answers[i] === oi;
                        const isRight = oi === m.answer;
                        return (
                          <button
                            key={opt}
                            onClick={() => {
                              setAnswers((prev) => ({ ...prev, [i]: oi }));
                              if (oi === m.answer) toast.success(`Q${i + 1} Correct!`);
                            }}
                            className={cn(
                              "flex items-center gap-2 rounded-lg border p-2.5 text-left text-xs transition-colors",
                              isPicked
                                ? isRight
                                  ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold"
                                  : "border-rose-500/60 bg-rose-500/10 text-rose-700 dark:text-rose-400 font-semibold"
                                : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50",
                            )}
                          >
                            <span className="font-mono text-[10px] opacity-60">
                              {String.fromCharCode(65 + oi)}.
                            </span>
                            <span className="flex-1">{opt}</span>
                            {isPicked && isRight && (
                              <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400 ml-auto shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {answers[i] !== undefined && (
                      <div className="mt-2 rounded-lg bg-muted/60 p-3 border border-border text-xs text-muted-foreground leading-relaxed">
                        <span className="font-semibold text-foreground">Explanation: </span>
                        {m.explanation}
                      </div>
                    )}
                  </div>
                ))}

                <div className="border-t border-border pt-3" />

                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Calculator className="size-3.5 text-primary" />
                  Part 2: Logical Reasoning Brainteaser
                </p>

                <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                  <p className="text-xs font-semibold text-foreground">
                    {currentPlan.practice.puzzle.q}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {currentPlan.practice.puzzle.options.map((opt, oi) => {
                      const isPicked = puzzleAnswer === oi;
                      const isRight = oi === currentPlan.practice.puzzle.answer;
                      return (
                        <button
                          key={opt}
                          onClick={() => {
                            setPuzzleAnswer(oi);
                            if (oi === currentPlan.practice.puzzle.answer)
                              toast.success("Brainteaser Solved!");
                          }}
                          className={cn(
                            "flex items-center gap-2 rounded-lg border p-2.5 text-left text-xs transition-colors",
                            isPicked
                              ? isRight
                                ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold"
                                : "border-rose-500/60 bg-rose-500/10 text-rose-700 dark:text-rose-400 font-semibold"
                              : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50",
                          )}
                        >
                          <span className="font-mono text-[10px] opacity-60">
                            {String.fromCharCode(65 + oi)}.
                          </span>
                          <span className="flex-1">{opt}</span>
                          {isPicked && isRight && (
                            <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400 ml-auto shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {puzzleAnswer !== null && (
                    <div className="mt-2 rounded-lg bg-muted/60 p-3 border border-border text-xs text-muted-foreground leading-relaxed">
                      <span className="font-semibold text-foreground">Solution: </span>
                      {currentPlan.practice.puzzle.explanation}
                    </div>
                  )}
                </div>
              </div>
            </Panel>
          </div>

          {/* Right Column: AI Voice Pitch & Broadcast Links */}
          <div className="space-y-4">
            <Panel
              title="AI Voice Pitch Simulator (60s)"
              subtitle={`STAR Speech Rubric: ${currentPlan.practice.voicePrompt.starCategory}`}
            >
              <div className="space-y-3">
                <div className="rounded-xl border border-border bg-muted/20 p-3.5 text-xs text-muted-foreground space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">🎙️ Daily Speech Challenge:</span>
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-primary">
                      Day {selectedDayNum}
                    </span>
                  </div>
                  <p className="text-foreground leading-relaxed font-medium">
                    "{currentPlan.practice.voicePrompt.prompt}"
                  </p>
                  <div className="pt-2 border-t border-border flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-muted-foreground">Target Keywords:</span>
                    {currentPlan.practice.voicePrompt.targetKeywords.map((k) => (
                      <span
                        key={k}
                        className="rounded bg-card px-2 py-0.5 text-[10px] font-mono text-primary border border-border font-medium"
                      >
                        {k}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={runPitch}
                  disabled={pitch}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-xs transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {pitch ? (
                    <Mic className="size-4 animate-pulse text-rose-300" />
                  ) : (
                    <Mic className="size-4" />
                  )}
                  {pitch ? "Listening & Scoring Speech Cadence…" : "Record 60s Voice Pitch Drill"}
                </button>

                <Console lines={log} empty="No speech recorded for this day." />
              </div>
            </Panel>

            <Panel
              title="Telegram Broadcast & Video Links"
              subtitle="Synchronized daily 06:00 broadcast stream"
            >
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <Video className="size-4 text-primary shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">
                        Day {selectedDayNum} English Broadcast
                      </p>
                      <p className="text-[11px] text-muted-foreground">{currentPlan.english.title}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      store.completeDailyStep("english");
                      toast.success(`Day ${selectedDayNum} English marked complete!`);
                    }}
                    className="rounded-md bg-muted/60 border border-border px-3 py-1 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                  >
                    Watch (10m)
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <Video className="size-4 text-primary shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">
                        Day {selectedDayNum} Aptitude Broadcast
                      </p>
                      <p className="text-[11px] text-muted-foreground">{currentPlan.aptitude.title}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      store.completeDailyStep("aptitude");
                      toast.success(`Day ${selectedDayNum} Aptitude marked complete!`);
                    }}
                    className="rounded-md bg-muted/60 border border-border px-3 py-1 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                  >
                    Watch (10m)
                  </button>
                </div>
              </div>
            </Panel>
          </div>
        </div>
      )}

      {/* TAB 2: 10M ENGLISH INSTRUCTOR MASTER PLAN */}
      {activeTab === "english-instructor" && (
        <Panel
          title={`Day ${selectedDayNum} English Instructor Lesson Plan`}
          subtitle="Exact 10-minute instructor teaching script, delivery breakdown, and corporate vocabulary"
          action={<Chip tone="cyan">10 Minutes Total Duration</Chip>}
        >
          <div className="space-y-6">
            {/* Timeline Breakdown Bar */}
            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <Clock className="size-4 text-primary" />
                <span>Instructor 10-Minute Timeline Structure:</span>
              </div>
              <p className="text-xs text-foreground font-mono bg-card p-3 rounded-lg border border-border">
                {currentPlan.english.deliveryTimeline}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Concept & Teaching Brief */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-xs">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <BookOpen className="size-4 text-primary" />
                  1. Concept Brief & Teaching Mandate
                </h4>
                <p className="text-xs text-foreground leading-relaxed font-medium">
                  {currentPlan.english.instructorBrief}
                </p>
                <div className="rounded-lg bg-muted/50 p-3 border border-border space-y-1">
                  <p className="text-[10px] font-mono uppercase font-semibold text-primary">
                    Spoken Grammar Focus:
                  </p>
                  <p className="text-xs text-muted-foreground">{currentPlan.english.grammarRule}</p>
                </div>
              </div>

              {/* Corporate Vocabulary & Phrases */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-xs">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Volume2 className="size-4 text-primary" />
                  2. Key Corporate Vocabulary & Action Verbs
                </h4>
                <p className="text-xs text-muted-foreground">
                  Mandate students to articulate these phrases during choral drill and 60s pitch:
                </p>
                <div className="flex flex-wrap gap-2">
                  {currentPlan.english.keyVocabulary.map((v) => (
                    <span
                      key={v}
                      className="rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-xs font-medium text-foreground"
                    >
                      🗣️ {v}
                    </span>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-border">
                  <button
                    onClick={() => {
                      store.completeDailyStep("english");
                      toast.success("10m English Lesson Completed (+25 XP)");
                    }}
                    className="w-full rounded-lg bg-primary py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Mark 10m English Lesson Complete (+25 XP)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Panel>
      )}

      {/* TAB 3: 10M APTITUDE INSTRUCTOR MASTER PLAN */}
      {activeTab === "aptitude-instructor" && (
        <Panel
          title={`Day ${selectedDayNum} Quantitative & Logical Reasoning Instructor Plan`}
          subtitle="Core mathematical formulas, speed math shortcuts, and step-by-step solved demonstrations"
          action={<Chip tone="purple">10 Minutes Total Duration</Chip>}
        >
          <div className="space-y-6">
            {/* Timeline Breakdown Bar */}
            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <Clock className="size-4 text-primary" />
                <span>Instructor 10-Minute Timeline Structure:</span>
              </div>
              <p className="text-xs text-foreground font-mono bg-card p-3 rounded-lg border border-border">
                {currentPlan.aptitude.deliveryTimeline}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Formula & Shortcut Technique */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-xs">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Calculator className="size-4 text-primary" />
                  1. Core Formula & Speed Shortcut
                </h4>
                <p className="text-xs text-foreground leading-relaxed font-medium">
                  {currentPlan.aptitude.instructorBrief}
                </p>
                <div className="rounded-lg bg-muted/50 p-3 border border-border space-y-1">
                  <p className="text-[10px] font-mono uppercase font-semibold text-primary">
                    Speed Math Rule:
                  </p>
                  <p className="text-xs font-mono text-foreground font-semibold">
                    {currentPlan.aptitude.formulaShortcut}
                  </p>
                </div>
              </div>

              {/* Solved Walkthrough Example */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-xs">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <FileCheck2 className="size-4 text-primary" />
                  2. Solved Instructor Demonstration
                </h4>
                <p className="text-xs text-muted-foreground">
                  Demonstrate this live on blackboard/screen within minutes 03:00 to 07:00:
                </p>
                <div className="rounded-lg bg-muted/50 p-3 border border-border space-y-1.5 text-xs">
                  <p className="font-semibold text-foreground">Step-by-Step Model Solution:</p>
                  <p className="text-muted-foreground leading-relaxed font-mono text-[11px]">
                    {currentPlan.aptitude.solvedExample}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border">
                  <button
                    onClick={() => {
                      store.completeDailyStep("aptitude");
                      toast.success("10m Aptitude Lesson Completed (+25 XP)");
                    }}
                    className="w-full rounded-lg bg-primary py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Mark 10m Aptitude Lesson Complete (+25 XP)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Panel>
      )}

      {/* TAB 4: FULL 90-DAY SCHEDULE (18 WEEKS × 5 DAYS) */}
      {activeTab === "90days-schedule" && (
        <Panel
          title="Full 90-Day Placement Accelerator Master Schedule"
          subtitle="18 Weeks × 5 Working Days = 90 Days. Days 1–4: Daily English + Aptitude + Practice. Friday: Weekly Placement Assessment."
          action={<Chip tone="amber">18 Weeks Total</Chip>}
        >
          <div className="space-y-4">
            {ACCELERATOR_90_DAYS.map((week) => {
              const isOpen = expandedWeeks[week.week] ?? false;
              return (
                <div
                  key={week.week}
                  className="rounded-xl border border-border bg-card overflow-hidden transition-all shadow-xs"
                >
                  <button
                    onClick={() => toggleWeek(week.week)}
                    className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 font-mono text-xs font-bold text-primary border border-primary/20">
                        W{week.week}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">{week.title}</h4>
                        <p className="text-xs text-muted-foreground">{week.focus}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-md bg-muted px-2.5 py-0.5 text-[10px] font-mono text-muted-foreground border border-border hidden sm:inline-block">
                        Days {(week.week - 1) * 5 + 1}–{week.week * 5}
                      </span>
                      {isOpen ? (
                        <ChevronDown className="size-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="size-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-border p-4 space-y-2 bg-muted/20">
                      {week.days.map((d) => {
                        const isFriday = d.day % 5 === 0;
                        const isSelected = d.day === selectedDayNum;
                        return (
                          <div
                            key={d.day}
                            onClick={() => {
                              setSelectedDayNum(d.day);
                              setActiveTab("practice");
                            }}
                            className={cn(
                              "flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border p-3 cursor-pointer transition-all text-xs",
                              isSelected
                                ? "border-primary bg-primary/10 text-foreground font-semibold shadow-xs"
                                : isFriday
                                  ? "border-border bg-card hover:border-primary/40"
                                  : "border-border bg-card hover:border-border/80 hover:bg-muted/30",
                            )}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="font-mono text-xs font-bold text-primary min-w-[50px]">
                                Day {d.day}
                              </span>
                              <span className="text-[11px] text-muted-foreground font-mono">
                                ({d.dayOfWeek})
                              </span>
                              <span className="font-medium text-foreground">{d.theme}</span>
                            </div>

                            <div className="flex items-center gap-2 ml-auto">
                              {isFriday ? (
                                <Chip tone="purple">Friday Mock Assessment</Chip>
                              ) : (
                                <span className="text-[10px] text-muted-foreground font-mono">
                                  10m Eng + 10m Apt + 10m Drill
                                </span>
                              )}
                              <span className="text-primary text-xs font-semibold hover:underline">
                                Open Day →
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Panel>
      )}
    </div>
  );
}
