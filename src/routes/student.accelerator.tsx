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
  const [selectedDayNum, setSelectedDayNum] = useState<number>(store.placementDay || 1);
  const [activeTab, setActiveTab] = useState<"practice" | "english-instructor" | "aptitude-instructor" | "90days-schedule">("practice");
  const [isInstructorMode, setIsInstructorMode] = useState<boolean>(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [puzzleAnswer, setPuzzleAnswer] = useState<number | null>(null);
  const [expandedWeeks, setExpandedWeeks] = useState<Record<number, boolean>>({ 1: true, 2: true });
  const [log, setLog] = useState<string[]>([
    "[ready] AI Speech Engine & ITSE STAR Rubric ready.",
    "[sample] Introduce yourself, your technical specialization, and one project you built.",
  ]);
  const [pitch, setPitch] = useState(false);

  const currentPlan: AcceleratorDay = useMemo(() => getAcceleratorDay(selectedDayNum), [selectedDayNum]);

  const correctMcqs = currentPlan.practice.mcqs.filter((m, i) => answers[i] === m.answer).length;
  const isPuzzleCorrect = puzzleAnswer === currentPlan.practice.puzzle.answer;
  const totalCorrect = correctMcqs + (isPuzzleCorrect ? 1 : 0);
  const doneCount = Object.values(store.daily).filter(Boolean).length;

  const toggleWeek = (wNum: number) => {
    setExpandedWeeks((prev) => ({ ...prev, [wNum]: !prev[wNum] }));
  };

  const runPitch = () => {
    setPitch(true);
    setLog((l) => [`[voice] Microphone active: Recording 60s pitch on Day ${selectedDayNum} prompt…`, ...l]);
    setTimeout(() => {
      setPitch(false);
      setLog((l) => [
        `[voice] Analysis: Clarity 89% · Pace 76 wpm (Optimal) · Vocabulary Hits: ${currentPlan.english.keyVocabulary.slice(0, 2).join(", ")}`,
        "[voice] STAR Rubric Match: Situation (✓) Task (✓) Action (✓) Result (✓)",
        "[voice] Competency evidence logged to Talent Score engine (+25 XP)",
        ...l,
      ]);
      store.completeDailyStep("practice");
      toast.success("Voice pitch analysed successfully!", {
        description: "+25 XP awarded · Communication pillar updated",
      });
    }, 1800);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="30-Minute Daily Placement Accelerator"
        subtitle="18 Weeks × 5 Working Days = 90 Days. 10m English Instructor Plan + 10m Aptitude Instructor Plan + 10m In-App Combined Practice Drill."
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsInstructorMode(!isInstructorMode)}
              className={cn(
                "flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all",
                isInstructorMode
                  ? "border-brand-purple/60 bg-brand-purple/15 text-brand-purple shadow-sm"
                  : "border-line-soft bg-surface-soft text-copy-subtle hover:text-foreground"
              )}
            >
              <GraduationCap className="size-3.5" />
              {isInstructorMode ? "Instructor Lesson Mode Active" : "Switch to Instructor View"}
            </button>
            <Chip tone="amber">🔥 Day {store.streak} Streak</Chip>
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
          accent="var(--brand-emerald)"
          hint="3 MCQs + 1 Logic Brainteaser"
        />
        <Stat
          label="Placement XP Balance"
          value={`${store.xp} XP`}
          accent="var(--brand-purple)"
          hint="+25 XP per completed block"
        />
        <Stat
          label="Cohort Telegram Sync"
          value="Live @ 06:00"
          accent="var(--brand-cyan)"
          hint="t.me/stc-batch · Mon–Fri"
        />
      </div>

      {/* Day Selector Ribbon (90 Days / 18 Weeks) */}
      <div className="rounded-2xl border border-line-soft bg-surface-soft/60 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-brand-cyan" />
            <span className="text-xs font-bold text-foreground">
              Select Accelerator Day (Week {currentPlan.week} · {currentPlan.dayOfWeek})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedDayNum(store.placementDay || 1)}
              className="rounded-lg border border-line-soft bg-surface-elevated px-2 py-0.5 text-[11px] font-mono text-brand-cyan hover:border-brand-cyan/60"
            >
              Jump to Today (Day {store.placementDay || 1})
            </button>
            <span className="text-[11px] text-copy-subtle font-mono">
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
                  "flex flex-col items-center justify-center min-w-[54px] rounded-xl border p-2 text-center transition-all text-xs",
                  isCurrent
                    ? "border-brand-cyan bg-brand-cyan/15 text-brand-cyan font-bold shadow-md"
                    : isToday
                    ? "border-brand-amber/60 bg-brand-amber/10 text-brand-amber font-semibold"
                    : isFriday
                    ? "border-brand-purple/40 bg-brand-purple/5 text-copy-subtle hover:border-brand-purple"
                    : "border-line-soft/80 bg-surface-elevated/70 text-copy-subtle hover:text-foreground hover:border-line-soft"
                )}
              >
                <span className="text-[9px] font-mono uppercase opacity-70">
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
              "flex flex-col justify-between rounded-xl border p-4 transition-all text-left bg-surface-soft/80",
              store.daily.english ? "border-brand-emerald/50" : "border-line-soft hover:border-brand-cyan/50"
            )}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded bg-surface-dark px-2 py-0.5 text-[10px] font-mono text-copy-subtle border border-line-soft">
                  10 min · English
                </span>
                <button
                  onClick={() => store.completeDailyStep("english")}
                  className="text-copy-subtle hover:text-foreground"
                >
                  {store.daily.english ? (
                    <CheckCircle2 className="size-4 text-brand-emerald" />
                  ) : (
                    <Circle className="size-4 text-copy-subtle" />
                  )}
                </button>
              </div>
              <h4 className="mt-2 text-sm font-bold text-foreground">{currentPlan.english.title}</h4>
              <p className="mt-1 text-xs text-copy-subtle line-clamp-2">{currentPlan.english.instructorBrief}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-line-soft/60 flex items-center justify-between">
              <button
                onClick={() => setActiveTab("english-instructor")}
                className="text-xs font-bold text-brand-cyan hover:underline"
              >
                {isInstructorMode ? "View Instructor Guide →" : "View Lesson & Audio →"}
              </button>
              <span className="font-mono text-[11px] text-brand-amber font-semibold">
                {store.daily.english ? "Completed ✓" : "+25 XP"}
              </span>
            </div>
          </div>

          {/* Step 2: Aptitude */}
          <div
            className={cn(
              "flex flex-col justify-between rounded-xl border p-4 transition-all text-left bg-surface-soft/80",
              store.daily.aptitude ? "border-brand-emerald/50" : "border-line-soft hover:border-brand-purple/50"
            )}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded bg-surface-dark px-2 py-0.5 text-[10px] font-mono text-copy-subtle border border-line-soft">
                  10 min · Aptitude
                </span>
                <button
                  onClick={() => store.completeDailyStep("aptitude")}
                  className="text-copy-subtle hover:text-foreground"
                >
                  {store.daily.aptitude ? (
                    <CheckCircle2 className="size-4 text-brand-emerald" />
                  ) : (
                    <Circle className="size-4 text-copy-subtle" />
                  )}
                </button>
              </div>
              <h4 className="mt-2 text-sm font-bold text-foreground">{currentPlan.aptitude.title}</h4>
              <p className="mt-1 text-xs text-copy-subtle line-clamp-2">{currentPlan.aptitude.instructorBrief}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-line-soft/60 flex items-center justify-between">
              <button
                onClick={() => setActiveTab("aptitude-instructor")}
                className="text-xs font-bold text-brand-purple hover:underline"
              >
                {isInstructorMode ? "View Instructor Guide →" : "View Formulas & Tricks →"}
              </button>
              <span className="font-mono text-[11px] text-brand-amber font-semibold">
                {store.daily.aptitude ? "Completed ✓" : "+25 XP"}
              </span>
            </div>
          </div>

          {/* Step 3: Combined Practice */}
          <div
            className={cn(
              "flex flex-col justify-between rounded-xl border p-4 transition-all text-left bg-surface-soft/80",
              store.daily.practice ? "border-brand-emerald/50" : "border-line-soft hover:border-brand-emerald/50"
            )}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded bg-surface-dark px-2 py-0.5 text-[10px] font-mono text-copy-subtle border border-line-soft">
                  10 min · Practice
                </span>
                <button
                  onClick={() => store.completeDailyStep("practice")}
                  className="text-copy-subtle hover:text-foreground"
                >
                  {store.daily.practice ? (
                    <CheckCircle2 className="size-4 text-brand-emerald" />
                  ) : (
                    <Circle className="size-4 text-copy-subtle" />
                  )}
                </button>
              </div>
              <h4 className="mt-2 text-sm font-bold text-foreground">10m In-App Combined Practice</h4>
              <p className="mt-1 text-xs text-copy-subtle">
                3 MCQs + 1 Logic Brainteaser + 60s AI Voice Pitch Recording
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-line-soft/60 flex items-center justify-between">
              <button
                onClick={() => setActiveTab("practice")}
                className="text-xs font-bold text-brand-emerald hover:underline"
              >
                Launch Practice Drill →
              </button>
              <span className="font-mono text-[11px] text-brand-amber font-semibold">
                {store.daily.practice ? "Completed ✓" : "+25 XP"}
              </span>
            </div>
          </div>
        </div>
      </Panel>

      {/* Main Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-line-soft/80 pb-3">
        <button
          onClick={() => setActiveTab("practice")}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all",
            activeTab === "practice"
              ? "bg-brand-cyan text-surface-dark shadow-sm"
              : "border border-line-soft bg-surface-soft text-copy-subtle hover:text-foreground"
          )}
        >
          <Sparkles className="size-4" />
          10m In-App Guided Practice
        </button>

        <button
          onClick={() => setActiveTab("english-instructor")}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all",
            activeTab === "english-instructor"
              ? "bg-brand-cyan text-surface-dark shadow-sm"
              : "border border-line-soft bg-surface-soft text-copy-subtle hover:text-foreground"
          )}
        >
          <BookOpen className="size-4" />
          10m English Instructor Master Plan
        </button>

        <button
          onClick={() => setActiveTab("aptitude-instructor")}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all",
            activeTab === "aptitude-instructor"
              ? "bg-brand-purple text-surface-dark shadow-sm"
              : "border border-line-soft bg-surface-soft text-copy-subtle hover:text-foreground"
          )}
        >
          <Calculator className="size-4" />
          10m Aptitude Instructor Master Plan
        </button>

        <button
          onClick={() => setActiveTab("90days-schedule")}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ml-auto",
            activeTab === "90days-schedule"
              ? "bg-surface-elevated text-brand-cyan border border-brand-cyan/60"
              : "border border-line-soft bg-surface-soft text-copy-subtle hover:text-foreground"
          )}
        >
          <ListOrdered className="size-4" />
          Full 90-Day Schedule (18 Weeks)
        </button>
      </div>

      {/* TAB 1: IN-APP GUIDED PRACTICE */}
      {activeTab === "practice" && (
        <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
          {/* Left Column: MCQs + Logic Brainteaser */}
          <div className="space-y-4">
            <Panel
              title={`Day ${selectedDayNum} Guided Practice: MCQs & Brainteaser`}
              subtitle="Instant answer validation with worked step-by-step explanations"
              action={<Chip tone="cyan">{totalCorrect} / {currentPlan.practice.mcqs.length + 1} Correct</Chip>}
            >
              <div className="space-y-4">
                <p className="text-xs font-bold uppercase tracking-wider text-brand-cyan flex items-center gap-2">
                  <FileCheck2 className="size-3.5" />
                  Part 1: Daily Placement MCQs ({currentPlan.practice.mcqs.length} Questions)
                </p>

                {currentPlan.practice.mcqs.map((m, i) => (
                  <div key={m.q} className="rounded-xl border border-line-soft bg-surface-soft p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-foreground">
                        <span className="font-mono text-brand-cyan">Q{i + 1}.</span> {m.q}
                      </p>
                      <span className="rounded bg-surface-dark px-2 py-0.5 text-[9px] font-mono uppercase text-copy-subtle border border-line-soft">
                        {m.category}
                      </span>
                    </div>

                    <div className="grid gap-1.5 sm:grid-cols-2">
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
                              "flex items-center gap-2 rounded-lg border p-2 text-left text-xs transition-colors",
                              isPicked
                                ? isRight
                                  ? "border-brand-emerald/60 bg-brand-emerald/10 text-brand-emerald font-bold"
                                  : "border-brand-rose/60 bg-brand-rose/10 text-brand-rose font-bold"
                                : "border-line-soft bg-surface-elevated text-copy-subtle hover:text-foreground"
                            )}
                          >
                            <span className="font-mono text-[10px] opacity-60">{String.fromCharCode(65 + oi)}.</span>
                            <span>{opt}</span>
                            {isPicked && isRight && <CheckCircle2 className="size-3.5 text-brand-emerald ml-auto" />}
                          </button>
                        );
                      })}
                    </div>

                    {answers[i] !== undefined && (
                      <div className="mt-2 rounded-lg bg-surface-dark/80 p-2.5 border border-line-soft/80 text-[11px] text-copy-subtle">
                        <span className="font-bold text-brand-cyan">Explanation: </span>
                        {m.explanation}
                      </div>
                    )}
                  </div>
                ))}

                <div className="border-t border-line-soft/80 pt-3" />

                <p className="text-xs font-bold uppercase tracking-wider text-brand-purple flex items-center gap-2">
                  <Calculator className="size-3.5" />
                  Part 2: Logical Reasoning Brainteaser
                </p>

                <div className="rounded-xl border border-line-soft bg-surface-soft p-3.5 space-y-2">
                  <p className="text-xs font-semibold text-foreground">{currentPlan.practice.puzzle.q}</p>
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    {currentPlan.practice.puzzle.options.map((opt, oi) => {
                      const isPicked = puzzleAnswer === oi;
                      const isRight = oi === currentPlan.practice.puzzle.answer;
                      return (
                        <button
                          key={opt}
                          onClick={() => {
                            setPuzzleAnswer(oi);
                            if (oi === currentPlan.practice.puzzle.answer) toast.success("Brainteaser Solved!");
                          }}
                          className={cn(
                            "flex items-center gap-2 rounded-lg border p-2 text-left text-xs transition-colors",
                            isPicked
                              ? isRight
                                ? "border-brand-emerald/60 bg-brand-emerald/10 text-brand-emerald font-bold"
                                : "border-brand-rose/60 bg-brand-rose/10 text-brand-rose font-bold"
                              : "border-line-soft bg-surface-elevated text-copy-subtle hover:text-foreground"
                          )}
                        >
                          <span className="font-mono text-[10px] opacity-60">{String.fromCharCode(65 + oi)}.</span>
                          <span>{opt}</span>
                          {isPicked && isRight && <CheckCircle2 className="size-3.5 text-brand-emerald ml-auto" />}
                        </button>
                      );
                    })}
                  </div>

                  {puzzleAnswer !== null && (
                    <div className="mt-2 rounded-lg bg-surface-dark/80 p-2.5 border border-line-soft/80 text-[11px] text-copy-subtle">
                      <span className="font-bold text-brand-purple">Solution: </span>
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
                <div className="rounded-xl border border-line-soft bg-surface-soft p-3 text-xs text-copy-subtle space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">🎙️ Daily Speech Challenge:</span>
                    <span className="rounded bg-brand-cyan/10 px-2 py-0.5 text-[9px] font-mono text-brand-cyan">
                      Day {selectedDayNum}
                    </span>
                  </div>
                  <p className="text-foreground/90 leading-relaxed font-medium">
                    "{currentPlan.practice.voicePrompt.prompt}"
                  </p>
                  <div className="pt-2 border-t border-line-soft/60 flex flex-wrap gap-1.5">
                    <span className="text-[10px] text-copy-subtle">Target Keywords:</span>
                    {currentPlan.practice.voicePrompt.targetKeywords.map((k) => (
                      <span key={k} className="rounded bg-surface-dark px-1.5 py-0.5 text-[10px] font-mono text-brand-cyan border border-line-soft">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={runPitch}
                  disabled={pitch}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple px-4 py-3 text-xs font-bold text-surface-dark shadow-md transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {pitch ? <Mic className="size-4 animate-pulse text-brand-rose" /> : <Mic className="size-4" />}
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
                <div className="flex items-center justify-between rounded-xl border border-line-soft bg-surface-soft p-3">
                  <div className="flex items-center gap-2">
                    <Video className="size-4 text-brand-cyan" />
                    <div>
                      <p className="font-bold text-foreground">Day {selectedDayNum} English Broadcast</p>
                      <p className="text-[10px] text-copy-subtle">{currentPlan.english.title}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      store.completeDailyStep("english");
                      toast.success(`Day ${selectedDayNum} English marked complete!`);
                    }}
                    className="rounded-lg bg-surface-elevated border border-line-soft px-2.5 py-1 text-[11px] font-bold text-brand-cyan hover:border-brand-cyan/60"
                  >
                    Watch (10m)
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-line-soft bg-surface-soft p-3">
                  <div className="flex items-center gap-2">
                    <Video className="size-4 text-brand-purple" />
                    <div>
                      <p className="font-bold text-foreground">Day {selectedDayNum} Aptitude Broadcast</p>
                      <p className="text-[10px] text-copy-subtle">{currentPlan.aptitude.title}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      store.completeDailyStep("aptitude");
                      toast.success(`Day ${selectedDayNum} Aptitude marked complete!`);
                    }}
                    className="rounded-lg bg-surface-elevated border border-line-soft px-2.5 py-1 text-[11px] font-bold text-brand-purple hover:border-brand-purple/60"
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
            <div className="rounded-xl border border-brand-cyan/30 bg-brand-cyan/5 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-cyan">
                <Clock className="size-4" />
                <span>Instructor 10-Minute Timeline Structure:</span>
              </div>
              <p className="text-xs text-foreground font-mono bg-surface-dark/80 p-2.5 rounded-lg border border-line-soft">
                {currentPlan.english.deliveryTimeline}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Concept & Teaching Brief */}
              <div className="rounded-xl border border-line-soft bg-surface-soft p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-cyan flex items-center gap-1.5">
                  <BookOpen className="size-4" />
                  1. Concept Brief & Teaching Mandate
                </h4>
                <p className="text-xs text-foreground/90 leading-relaxed font-medium">
                  {currentPlan.english.instructorBrief}
                </p>
                <div className="rounded-lg bg-surface-dark p-3 border border-line-soft/80 space-y-1">
                  <p className="text-[10px] font-mono uppercase text-brand-cyan">Spoken Grammar Focus:</p>
                  <p className="text-xs text-copy-subtle">{currentPlan.english.grammarRule}</p>
                </div>
              </div>

              {/* Corporate Vocabulary & Phrases */}
              <div className="rounded-xl border border-line-soft bg-surface-soft p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-purple flex items-center gap-1.5">
                  <Volume2 className="size-4" />
                  2. Key Corporate Vocabulary & Action Verbs
                </h4>
                <p className="text-xs text-copy-subtle">
                  Mandate students to articulate these phrases during choral drill and 60s pitch:
                </p>
                <div className="flex flex-wrap gap-2">
                  {currentPlan.english.keyVocabulary.map((v) => (
                    <span
                      key={v}
                      className="rounded-lg border border-line-soft bg-surface-elevated px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm"
                    >
                      🗣️ {v}
                    </span>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-line-soft/60">
                  <button
                    onClick={() => {
                      store.completeDailyStep("english");
                      toast.success("10m English Lesson Completed (+25 XP)");
                    }}
                    className="w-full rounded-xl bg-brand-cyan py-2.5 text-xs font-bold text-surface-dark hover:opacity-90 transition-opacity"
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
            <div className="rounded-xl border border-brand-purple/30 bg-brand-purple/5 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-purple">
                <Clock className="size-4" />
                <span>Instructor 10-Minute Timeline Structure:</span>
              </div>
              <p className="text-xs text-foreground font-mono bg-surface-dark/80 p-2.5 rounded-lg border border-line-soft">
                {currentPlan.aptitude.deliveryTimeline}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Formula & Shortcut Technique */}
              <div className="rounded-xl border border-line-soft bg-surface-soft p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-purple flex items-center gap-1.5">
                  <Calculator className="size-4" />
                  1. Core Formula & Speed Shortcut
                </h4>
                <p className="text-xs text-foreground/90 leading-relaxed font-medium">
                  {currentPlan.aptitude.instructorBrief}
                </p>
                <div className="rounded-lg bg-surface-dark p-3 border border-line-soft/80 space-y-1">
                  <p className="text-[10px] font-mono uppercase text-brand-purple">Speed Math Rule:</p>
                  <p className="text-xs font-mono text-brand-purple font-bold">
                    {currentPlan.aptitude.formulaShortcut}
                  </p>
                </div>
              </div>

              {/* Solved Walkthrough Example */}
              <div className="rounded-xl border border-line-soft bg-surface-soft p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-amber flex items-center gap-1.5">
                  <FileCheck2 className="size-4" />
                  2. Solved Instructor Demonstration
                </h4>
                <p className="text-xs text-copy-subtle">
                  Demonstrate this live on blackboard/screen within minutes 03:00 to 07:00:
                </p>
                <div className="rounded-lg bg-surface-dark p-3 border border-line-soft/80 space-y-1.5 text-xs">
                  <p className="font-bold text-foreground">Step-by-Step Model Solution:</p>
                  <p className="text-copy-subtle leading-relaxed font-mono text-[11px]">
                    {currentPlan.aptitude.solvedExample}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-line-soft/60">
                  <button
                    onClick={() => {
                      store.completeDailyStep("aptitude");
                      toast.success("10m Aptitude Lesson Completed (+25 XP)");
                    }}
                    className="w-full rounded-xl bg-brand-purple py-2.5 text-xs font-bold text-surface-dark hover:opacity-90 transition-opacity"
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
                  className="rounded-2xl border border-line-soft bg-surface-soft/60 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleWeek(week.week)}
                    className="flex w-full items-center justify-between p-4 text-left hover:bg-surface-elevated/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-xl bg-brand-cyan/15 font-mono text-xs font-bold text-brand-cyan border border-brand-cyan/30">
                        W{week.week}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">{week.title}</h4>
                        <p className="text-xs text-copy-subtle">{week.focus}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-surface-dark px-2.5 py-0.5 text-[10px] font-mono text-copy-subtle border border-line-soft hidden sm:inline-block">
                        Days {(week.week - 1) * 5 + 1}–{week.week * 5}
                      </span>
                      {isOpen ? <ChevronDown className="size-4 text-copy-subtle" /> : <ChevronRight className="size-4 text-copy-subtle" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-line-soft/80 p-4 space-y-2 bg-surface-dark/30">
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
                              "flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border p-3 cursor-pointer transition-all text-xs",
                              isSelected
                                ? "border-brand-cyan bg-brand-cyan/10 text-foreground font-semibold"
                                : isFriday
                                ? "border-brand-purple/40 bg-brand-purple/5 hover:border-brand-purple"
                                : "border-line-soft bg-surface-elevated/60 hover:border-line-soft hover:bg-surface-elevated"
                            )}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="font-mono text-xs font-bold text-brand-cyan min-w-[50px]">
                                Day {d.day}
                              </span>
                              <span className="text-[11px] text-copy-subtle font-mono">
                                ({d.dayOfWeek})
                              </span>
                              <span className="font-medium text-foreground">{d.theme}</span>
                            </div>

                            <div className="flex items-center gap-2 ml-auto">
                              {isFriday ? (
                                <Chip tone="purple">Friday Mock Assessment</Chip>
                              ) : (
                                <span className="text-[10px] text-copy-subtle font-mono">
                                  10m Eng + 10m Apt + 10m Drill
                                </span>
                              )}
                              <span className="text-brand-cyan text-xs font-bold hover:underline">
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
