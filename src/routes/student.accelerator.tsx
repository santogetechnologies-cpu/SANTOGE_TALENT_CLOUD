import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Chip, Console, Meter, PageHeader, Panel, Stat } from "@/components/kit";
import { useAppStore, type DailySteps } from "@/lib/app-store";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/student/accelerator")({
  head: () => ({
    meta: [
      { title: "30-Minute Placement Accelerator — SantoGe Talent Cloud" },
      { name: "description", content: "Daily 30-minute synchronized placement routine: 10m English video, 10m Aptitude video, and 10m in-app guided practice (5 MCQs, 2 Puzzles, Voice Pitch)." },
      { property: "og:title", content: "30-Minute Placement Accelerator — SantoGe Talent Cloud" },
      { property: "og:description", content: "Daily 30-minute placement routine with streaks and instant XP." },
    ],
  }),
  component: AcceleratorPage,
});

const STEPS: { key: keyof DailySteps; label: string; detail: string; time: string }[] = [
  { key: "english", label: "10m English & Communication", detail: "Broadcast 06:00 · Corporate email etiquette & pitch fluency", time: "10 min" },
  { key: "aptitude", label: "10m Quantitative & Logic", detail: "Broadcast 06:00 · Time & Work formulas, speed math shortcuts", time: "10 min" },
  { key: "practice", label: "10m In-App Guided Practice", detail: "5 MCQs · 2 Logic Puzzles · 1 Voice Pitch Recording", time: "10 min" },
];

const MCQS = [
  { q: "A train covers 240 km in 3 hours. What is its average speed in m/s?", options: ["20 m/s", "22.2 m/s", "25 m/s", "30 m/s"], answer: 1 },
  { q: "Identify the sentence with the correct corporate email closing:", options: ["Thanks, see ya", "Looking forward to your feedback.", "Sent from my phone", "Revert ASAP please"], answer: 1 },
  { q: "If A can complete a project in 12 days and B in 24 days, working together they take:", options: ["6 days", "8 days", "10 days", "16 days"], answer: 1 },
  { q: "Choose the word closest in meaning to 'Pragmatic':", options: ["Theoretical", "Practical", "Careless", "Ambiguous"], answer: 1 },
  { q: "In a certain code, TECH is written as VGEL. How is CODE written?", options: ["EQFG", "DPEF", "ERFG", "EQFF"], answer: 0 },
];

const PUZZLES = [
  {
    q: "Logic Puzzle 1: Five team members (A, B, C, D, E) sit in a row. B is between A and C. E is to the immediate right of C. Who is in the middle?",
    options: ["Person A", "Person B", "Person C", "Person D"],
    answer: 1,
  },
  {
    q: "Logic Puzzle 2: A clock shows 3:15. What is the precise angle between the hour hand and minute hand?",
    options: ["0°", "7.5°", "12°", "15°"],
    answer: 1,
  },
];

function AcceleratorPage() {
  const store = useAppStore();
  const [activeTab, setActiveTab] = useState<"practice" | "english-video" | "aptitude-video">("practice");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [puzzleAnswers, setPuzzleAnswers] = useState<Record<number, number>>({});
  const [log, setLog] = useState<string[]>([
    "[ready] Speech Engine & ITSE STAR Rubric ready.",
    "[sample] Introduce yourself, your technical specialization, and one project you built.",
  ]);
  const [pitch, setPitch] = useState(false);

  const correctMcqs = MCQS.filter((m, i) => answers[i] === m.answer).length;
  const correctPuzzles = PUZZLES.filter((p, i) => puzzleAnswers[i] === p.answer).length;
  const totalCorrect = correctMcqs + correctPuzzles;
  const doneCount = Object.values(store.daily).filter(Boolean).length;

  const runPitch = () => {
    setPitch(true);
    setLog((l) => ["[voice] Microphone active: Recording 60s self-introduction…", ...l]);
    setTimeout(() => {
      setPitch(false);
      setLog((l) => [
        "[voice] Analysis: Clarity 88% · Pace 74 wpm (Optimal) · Filler Words 2 · Confidence 82%",
        "[voice] STAR Rubric Match: Situation (✓) Task (✓) Action (✓) Result (✓)",
        "[voice] Competency evidence logged to Talent Score engine (+25 XP)",
        ...l,
      ]);
      store.completeDailyStep("practice");
      toast.success("Voice pitch analysed successfully!", { description: "+25 XP awarded · Communication pillar updated" });
    }, 1800);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="30-Minute Daily Placement Accelerator"
        subtitle="Batch-synchronized placement preparation: 10m English broadcast, 10m Aptitude drill, and 10m guided in-app practice."
        action={<Chip tone="amber">🔥 Day {store.streak} Placement Streak</Chip>}
      />

      {/* KPI Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Today's Blocks Complete" value={`${doneCount} / 3`} hint="English + Aptitude + Practice" />
        <Stat label="Practice Accuracy" value={`${totalCorrect} / ${MCQS.length + PUZZLES.length}`} accent="var(--brand-emerald)" hint="5 MCQs + 2 Puzzles" />
        <Stat label="Total XP Balance" value={`${store.xp} XP`} accent="var(--brand-purple)" hint="+25 XP per block" />
        <Stat label="Cohort Telegram Sync" value="Live @ 06:00" accent="var(--brand-cyan)" hint="t.me/stc-batch" />
      </div>

      {/* Daily 3-Step Interactive Timeline */}
      <Panel title="Today's 3-Step Accelerator Routine" subtitle="Tap any block to launch the module or toggle completion">
        <div className="grid gap-3.5 sm:grid-cols-3">
          {STEPS.map((s) => {
            const done = store.daily[s.key];
            return (
              <div
                key={s.key}
                className={cn(
                  "flex flex-col justify-between rounded-xl border p-4 transition-all text-left bg-surface-soft/80",
                  done ? "border-brand-emerald/50" : "border-line-soft hover:border-brand-cyan/50"
                )}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-surface-dark px-2 py-0.5 text-[10px] font-mono text-copy-subtle border border-line-soft">
                      {s.time}
                    </span>
                    <button
                      onClick={() => store.completeDailyStep(s.key)}
                      className="text-copy-subtle hover:text-foreground"
                    >
                      {done ? <CheckCircle2 className="size-4 text-brand-emerald" /> : <Circle className="size-4 text-copy-subtle" />}
                    </button>
                  </div>
                  <h4 className="mt-2 text-sm font-bold text-foreground">{s.label}</h4>
                  <p className="mt-1 text-xs text-copy-subtle">{s.detail}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-line-soft/60 flex items-center justify-between">
                  <button
                    onClick={() => {
                      if (s.key === "english") setActiveTab("english-video");
                      else if (s.key === "aptitude") setActiveTab("aptitude-video");
                      else setActiveTab("practice");
                    }}
                    className="text-xs font-bold text-brand-cyan hover:underline"
                  >
                    Open Step →
                  </button>
                  <span className="font-mono text-[11px] text-brand-amber font-semibold">
                    {done ? "Completed ✓" : "+25 XP"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      {/* Main Interactive Practice Section */}
      <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
        {/* Left Column: 5 MCQs + 2 Logic Puzzles */}
        <div className="space-y-4">
          <Panel
            title="Step 3: 10m Guided Practice (5 MCQs + 2 Puzzles)"
            subtitle="Immediate validation with instant feedback on each option"
            action={<Chip tone="cyan">{totalCorrect}/7 Completed Correctly</Chip>}
          >
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-cyan">Part 1: 5 Daily Placement MCQs</p>
              {MCQS.map((m, i) => (
                <div key={m.q} className="rounded-xl border border-line-soft bg-surface-soft p-3.5 space-y-2">
                  <p className="text-xs font-semibold text-foreground">
                    <span className="font-mono text-brand-cyan">Q{i + 1}.</span> {m.q}
                  </p>
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
                </div>
              ))}

              <div className="border-t border-line-soft/80 pt-3" />
              <p className="text-xs font-bold uppercase tracking-wider text-brand-purple">Part 2: 2 Logical Reasoning Puzzles</p>
              {PUZZLES.map((p, i) => (
                <div key={p.q} className="rounded-xl border border-line-soft bg-surface-soft p-3.5 space-y-2">
                  <p className="text-xs font-semibold text-foreground">{p.q}</p>
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    {p.options.map((opt, oi) => {
                      const isPicked = puzzleAnswers[i] === oi;
                      const isRight = oi === p.answer;
                      return (
                        <button
                          key={opt}
                          onClick={() => {
                            setPuzzleAnswers((prev) => ({ ...prev, [i]: oi }));
                            if (oi === p.answer) toast.success(`Puzzle ${i + 1} Solved!`);
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
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* Right Column: AI Voice Pitch Analyzer & Telegram Broadcast */}
        <div className="space-y-4">
          <Panel
            title="AI Voice Pitch Analyzer (60s)"
            subtitle="Record your self-introduction for live speech analysis"
          >
            <div className="space-y-3">
              <div className="rounded-xl border border-line-soft bg-surface-soft p-3 text-xs text-copy-subtle">
                <p className="font-semibold text-foreground">💡 Daily Speech Prompt:</p>
                <p className="mt-1">
                  "Give a 60-second pitch introducing your name, your primary technical track, and a recent challenge you solved in the interactive sandbox."
                </p>
              </div>

              <button
                onClick={runPitch}
                disabled={pitch}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple px-4 py-3 text-xs font-bold text-surface-dark shadow-md transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {pitch ? <Mic className="size-4 animate-pulse text-brand-rose" /> : <Mic className="size-4" />}
                {pitch ? "Listening & Analyzing Audio…" : "Start 60s Voice Pitch Recording"}
              </button>

              <Console lines={log} empty="No voice pitch recorded." />
            </div>
          </Panel>

          <Panel
            title="Batch Telegram Broadcast Links"
            subtitle="Synchronized daily placement video lessons"
          >
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between rounded-xl border border-line-soft bg-surface-soft p-3">
                <div className="flex items-center gap-2">
                  <Video className="size-4 text-brand-cyan" />
                  <div>
                    <p className="font-bold text-foreground">Day 26 English Lesson</p>
                    <p className="text-[10px] text-copy-subtle">10m · Fluency &amp; Email Tone</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    store.completeDailyStep("english");
                    toast.success("English lesson marked complete!");
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
                    <p className="font-bold text-foreground">Day 26 Aptitude Lesson</p>
                    <p className="text-[10px] text-copy-subtle">10m · Speed Math &amp; Work-Rate</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    store.completeDailyStep("aptitude");
                    toast.success("Aptitude lesson marked complete!");
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
    </div>
  );
}

