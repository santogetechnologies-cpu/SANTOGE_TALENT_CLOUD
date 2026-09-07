import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Chip, Console, Meter, PageHeader, Panel, Stat } from "@/components/kit";
import { useAppStore, type DailySteps } from "@/lib/app-store";
import { CheckCircle2, Circle, Mic, Play, Timer } from "lucide-react";

export const Route = createFileRoute("/student/accelerator")({
  head: () => ({
    meta: [
      { title: "30-Minute Accelerator — SantoGe Talent Cloud" },
      { name: "description", content: "Daily 30-minute routine: English, aptitude and guided practice with streaks and instant XP." },
      { property: "og:title", content: "30-Minute Accelerator — SantoGe Talent Cloud" },
      { property: "og:description", content: "Daily 30-minute routine with streaks, XP and voice pitch practice." },
    ],
  }),
  component: AcceleratorPage,
});

const STEPS: { key: keyof DailySteps; label: string; detail: string }[] = [
  { key: "english", label: "10m English Video", detail: "Broadcast 06:00 · fluency + vocabulary drill" },
  { key: "aptitude", label: "10m Aptitude Video", detail: "Broadcast 06:00 · quant + logical reasoning" },
  { key: "practice", label: "10m Guided Practice", detail: "5 MCQ · 2 logic puzzles · 1 voice pitch" },
];

const MCQS = [
  { q: "A train covers 240 km in 3 hours. Average speed?", options: ["60 km/h", "80 km/h", "90 km/h"], answer: 1 },
  { q: "Choose the correctly spelled word.", options: ["Recieve", "Receive", "Receeve"], answer: 1 },
  { q: "If 3x + 6 = 21, then x =", options: ["3", "5", "7"], answer: 1 },
];

function AcceleratorPage() {
  const store = useAppStore();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [log, setLog] = useState<string[]>([]);
  const [pitch, setPitch] = useState(false);

  const correct = MCQS.filter((m, i) => answers[i] === m.answer).length;
  const doneCount = Object.values(store.daily).filter(Boolean).length;

  const runPitch = () => {
    setPitch(true);
    setLog((l) => ["[voice] Recording 60s self-pitch…", ...l]);
    setTimeout(() => {
      setPitch(false);
      setLog((l) => [
        "[voice] Clarity 84% · Pace 71% · Filler words 3 · Confidence 78%",
        "[voice] Transcript scored against ITSE communication rubric",
        ...l,
      ]);
      toast.success("Voice pitch analysed", { description: "Communication pillar +1" });
    }, 1600);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="30-Minute Daily Accelerator"
        subtitle="Three timed blocks delivered every morning at 06:00 IST."
        action={<Chip tone="amber">Day {store.streak} streak</Chip>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Steps completed today" value={`${doneCount}/3`} />
        <Stat label="XP balance" value={store.xp} accent="var(--brand-purple)" />
        <Stat label="Practice accuracy" value={`${correct}/${MCQS.length}`} accent="var(--brand-emerald)" />
      </div>

      <Panel title="Today's blocks" subtitle="Tap to mark a block complete">
        <div className="grid gap-3 sm:grid-cols-3">
          {STEPS.map((s) => {
            const done = store.daily[s.key];
            return (
              <button
                key={s.key}
                onClick={() => store.completeDailyStep(s.key)}
                className="rounded-xl border border-line-soft bg-surface-soft p-4 text-left transition-colors hover:border-brand-cyan/50"
              >
                <div className="flex items-center gap-2">
                  {done ? <CheckCircle2 className="size-4 text-brand-emerald" /> : <Timer className="size-4 text-brand-cyan" />}
                  <p className="text-sm font-semibold text-foreground">{s.label}</p>
                </div>
                <p className="mt-1.5 text-xs text-copy-subtle">{s.detail}</p>
                <div className="mt-3">
                  <Meter value={done ? 100 : 0} accent={done ? "var(--brand-emerald)" : "var(--brand-cyan)"} />
                </div>
              </button>
            );
          })}
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Guided practice" subtitle="Immediate feedback on every answer">
          <div className="space-y-4">
            {MCQS.map((m, i) => (
              <div key={m.q}>
                <p className="text-sm font-medium text-foreground">{i + 1}. {m.q}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {m.options.map((o, oi) => {
                    const picked = answers[i] === oi;
                    const isRight = oi === m.answer;
                    return (
                      <button
                        key={o}
                        onClick={() => setAnswers((a) => ({ ...a, [i]: oi }))}
                        className={
                          "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors " +
                          (picked
                            ? isRight
                              ? "border-brand-emerald/60 text-brand-emerald"
                              : "border-brand-rose/60 text-brand-rose"
                            : "border-line-soft text-copy-subtle hover:text-foreground")
                        }
                      >
                        {picked ? (isRight ? <CheckCircle2 className="mr-1 inline size-3" /> : <Circle className="mr-1 inline size-3" />) : null}
                        {o}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Voice pitch analyser" subtitle="60-second self-introduction scored live">
          <button
            onClick={runPitch}
            disabled={pitch}
            className="mb-3 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple px-4 py-2.5 text-xs font-bold text-surface-dark disabled:opacity-60"
          >
            {pitch ? <Mic className="size-4 animate-pulse" /> : <Play className="size-4" />}
            {pitch ? "Recording…" : "Record 60s pitch"}
          </button>
          <Console lines={log} empty="No pitch recorded yet." />
        </Panel>
      </div>
    </div>
  );
}
