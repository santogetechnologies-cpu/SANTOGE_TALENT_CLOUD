import { createFileRoute, Link } from "@tanstack/react-router";

import { Gauge, Meter, PageHeader, Panel, Stat, Chip } from "@/components/kit";
import { useAppStore } from "@/lib/app-store";
import { TRACKS } from "@/lib/tracks";
import { CheckCircle2, Circle, Flame, Trophy, Zap } from "lucide-react";

export const Route = createFileRoute("/student/")({
  head: () => ({
    meta: [
      { title: "Student Dashboard — SantoGe Talent Cloud" },
      { name: "description", content: "Talent Score, daily accelerator streak, active tracks and placement readiness in one live workspace." },
      { property: "og:title", content: "Student Dashboard — SantoGe Talent Cloud" },
      { property: "og:description", content: "Talent Score, daily accelerator streak and placement readiness in one live workspace." },
    ],
  }),
  component: StudentDashboard,
});

const STEPS = [
  { key: "english", label: "10m English video" },
  { key: "aptitude", label: "10m Aptitude video" },
  { key: "practice", label: "10m Guided practice" },
] as const;

function StudentDashboard() {
  const store = useAppStore();
  const active = TRACKS.filter((t) => store.activeTracks.includes(t.id));
  const readiness = [
    { key: "T", label: "Technical" },
    { key: "C", label: "Communication" },
    { key: "A", label: "Aptitude" },
    { key: "E", label: "English" },
    { key: "R", label: "Resume / ATS" },
    { key: "M", label: "Mock Interview" },
  ] as const;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${store.student?.firstName ?? "Learner"}`}
        subtitle="Your 30-minute accelerator, technical labs and placement readiness — all live."
        action={<Chip tone="emerald">Phase 1 · ITSE active</Chip>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Talent Score" value={`${store.talentScore}/1000`} hint="Recalculated on every verified lab" />
        <Stat label="Readiness Index" value={`${Math.round(store.readinessIndex)}%`} accent="var(--brand-purple)" hint="Weighted T·C·A·E·R·M" />
        <Stat label="Eligible Companies" value={store.eligibleCompanies} accent="var(--brand-emerald)" hint="Gateway-matched openings" />
        <Stat label="Streak" value={`Day ${store.streak}`} accent="var(--brand-amber)" hint={`${store.xp} XP earned`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Talent Score" subtitle="Composite placement readiness" className="flex items-center justify-center">
          <Gauge value={store.talentScore} label="Talent Score" />
        </Panel>

        <Panel title="Readiness breakdown" subtitle="Six weighted pillars" className="lg:col-span-2">
          <div className="space-y-3">
            {readiness.map((r) => (
              <div key={r.key}>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{r.label}</span>
                  <span className="font-mono text-copy-subtle">{store.readiness[r.key]}%</span>
                </div>
                <Meter value={store.readiness[r.key]} />
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Today's 30-minute accelerator"
          subtitle="Three 10-minute steps, broadcast at 06:00"
          action={
            <Link to="/student/accelerator" className="text-xs font-semibold text-brand-cyan hover:underline">
              Open →
            </Link>
          }
        >
          <ul className="space-y-2">
            {STEPS.map((s) => {
              const done = store.daily[s.key];
              return (
                <li key={s.key}>
                  <button
                    onClick={() => store.completeDailyStep(s.key)}
                    className="flex w-full items-center gap-3 rounded-xl border border-line-soft bg-surface-soft px-3 py-3 text-left text-sm transition-colors hover:border-brand-cyan/50"
                  >
                    {done ? <CheckCircle2 className="size-4 text-brand-emerald" /> : <Circle className="size-4 text-copy-subtle" />}
                    <span className={done ? "text-copy-subtle line-through" : "text-foreground"}>{s.label}</span>
                    <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-brand-cyan">
                      <Zap className="size-3" /> +25
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-copy-subtle">
            <Flame className="size-3.5 text-brand-amber" /> Complete all three to extend your streak.
          </p>
        </Panel>

        <Panel
          title="Active technical tracks"
          subtitle="Up to three concurrent specialisations"
          action={
            <Link to="/student/settings" className="text-xs font-semibold text-brand-cyan hover:underline">
              Change →
            </Link>
          }
        >
          <div className="space-y-3">
            {active.map((t) => (
              <div key={t.id} className="rounded-xl border border-line-soft bg-surface-soft p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <span className="size-2 rounded-full" style={{ background: t.accent }} />
                </div>
                <p className="mt-1 text-xs text-copy-subtle">{t.tagline}</p>
                <p className="mt-2 flex items-center gap-1.5 font-mono text-[11px] text-brand-cyan">
                  <Trophy className="size-3" /> Lab: {t.labTitle}
                </p>
              </div>
            ))}
          </div>
          <Link
            to="/student/labs"
            className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple px-4 py-2.5 text-xs font-bold text-surface-dark"
          >
            Launch technical labs
          </Link>
        </Panel>
      </div>
    </div>
  );
}
