import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Gauge, Meter, PageHeader, Panel, Stat, Chip } from "@/components/kit";
import { useAppStore } from "@/lib/app-store";
import { TRACKS, trackById } from "@/lib/tracks";
import {
  CheckCircle2,
  Circle,
  Flame,
  Trophy,
  Zap,
  Sparkles,
  ArrowRight,
  Code2,
  Lock,
  Unlock,
  Building2,
  BookOpen,
  Calendar,
  Layers,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/student/")({
  head: () => ({
    meta: [
      { title: "Student Dashboard — SantoGe Talent Cloud" },
      { name: "description", content: "Talent Score, twin 30-min routine, active technical tracks, and placement readiness." },
      { property: "og:title", content: "Student Dashboard — SantoGe Talent Cloud" },
      { property: "og:description", content: "Talent Score, daily accelerator streak and placement readiness in one live workspace." },
    ],
  }),
  component: StudentDashboard,
});

const STEPS = [
  { key: "english", label: "10m English Video · Group Discussion & Corporate Vocab", xp: 25 },
  { key: "aptitude", label: "10m Aptitude Video · Speed Math & Quantitative Logic", xp: 25 },
  { key: "practice", label: "10m Guided Practice · 5 MCQs, 2 Puzzles & 60s Voice Pitch", xp: 50 },
] as const;

export function getScoreTier(score: number) {
  if (score >= 850) return { label: "Elite Tier", tone: "emerald" as const, desc: "Top 5% · Direct Placement Shortlist" };
  if (score >= 700) return { label: "Advanced", tone: "cyan" as const, desc: "High Requisition Matching Rate" };
  if (score >= 550) return { label: "Intermediate", tone: "purple" as const, desc: "Standard Campus Drive Eligibility" };
  return { label: "Foundational", tone: "amber" as const, desc: "Accelerating Core Competency" };
}

function StudentDashboard() {
  const store = useAppStore();
  const [showTrackModal, setShowTrackModal] = useState(false);
  const active = TRACKS.filter((t) => store.activeTracks.includes(t.id));
  const tier = getScoreTier(store.talentScore);

  const readiness = [
    { key: "T", label: "Technical Competency", weight: "30%" },
    { key: "C", label: "Communication Skills", weight: "20%" },
    { key: "A", label: "Aptitude & Logic", weight: "15%" },
    { key: "E", label: "Professional English", weight: "15%" },
    { key: "R", label: "ATS Resume Match", weight: "10%" },
    { key: "M", label: "AI Mock Interview", weight: "10%" },
  ] as const;

  const handleToggleTrack = (id: (typeof TRACKS)[number]["id"]) => {
    const has = store.activeTracks.includes(id);
    const next = has ? store.activeTracks.filter((t) => t !== id) : [...store.activeTracks, id];
    if (next.length < 1) {
      toast.error("You must have at least 1 active course track.");
      return;
    }
    if (next.length > 3) {
      toast.error("Maximum 3 concurrent technical tracks allowed.");
      return;
    }
    store.setActiveTracks(next);
    toast.success(has ? "Track removed" : "Track enrolled successfully!");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${store.student?.firstName ?? "Learner"}`}
        subtitle={`Cohort Batch: ${store.student?.batchId || "BATCH-2026-ABC-CSE-01"} · Day ${store.placementDay} of 90 synchronized placement cycle.`}
        action={
          <div className="flex items-center gap-2">
            <Chip tone={tier.tone}>{tier.label}</Chip>
            <Chip tone={store.gateUnlocked ? "emerald" : "amber"}>
              {store.gateUnlocked ? "Dual Gate: Unlocked" : "Dual Gate: In Progress"}
            </Chip>
          </div>
        }
      />

      {/* TOP STATS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Talent Score"
          value={`${store.talentScore}/1000`}
          accent="var(--brand-cyan)"
          hint={tier.desc}
        />
        <Stat
          label="Readiness Index"
          value={`${Math.round(store.readinessIndex)}%`}
          accent="var(--brand-purple)"
          hint="Weighted 6-pillar evaluation"
        />
        <Stat
          label="Matched Openings"
          value={store.eligibleCompanies}
          accent="var(--brand-emerald)"
          hint="Recruiter requisition matches"
        />
        <Stat
          label="Accelerator Streak"
          value={`Day ${store.streak}`}
          accent="var(--brand-amber)"
          hint={`${store.xp} Total XP Accumulated`}
        />
      </div>

      {/* TALENT SCORE GAUGE & READINESS BREAKDOWN */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel
          title="Talent Score Engine"
          subtitle="Composite readiness score (0–1000)"
          action={<Chip tone={tier.tone}>{tier.label}</Chip>}
          className="flex flex-col items-center justify-between"
        >
          <div className="my-auto py-2 flex flex-col items-center">
            <Gauge value={store.talentScore} label="Talent Score" />
            <p className="mt-2 text-center text-xs text-copy-subtle max-w-xs">
              Dynamically computed from your technical verified sandboxes, 90-day accelerator, and ATS profile.
            </p>
          </div>
          <div className="w-full border-t border-line-soft pt-3 flex items-center justify-between text-xs">
            <span className="text-copy-subtle">Phase 2 Gate:</span>
            <span className={cn("font-semibold", store.gateUnlocked ? "text-brand-emerald" : "text-brand-amber")}>
              {store.gateUnlocked ? "Unlocked & Market Ready" : "Requires Dual Gate Pass"}
            </span>
          </div>
        </Panel>

        <Panel
          title="6-Pillar Readiness Breakdown"
          subtitle="Real-time multi-dimensional competency model"
          className="lg:col-span-2"
          action={
            <Link to="/student/placement" className="text-xs font-semibold text-brand-cyan hover:underline">
              Placement Simulator →
            </Link>
          }
        >
          <div className="grid gap-3.5 sm:grid-cols-2">
            {readiness.map((r) => {
              const val = store.readiness[r.key];
              return (
                <div key={r.key} className="rounded-xl border border-line-soft bg-surface-soft/60 p-3">
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">{r.label}</span>
                    <span className="font-mono text-copy-subtle">
                      {val}% <span className="text-[10px] text-copy-subtle/70">({r.weight})</span>
                    </span>
                  </div>
                  <Meter value={val} />
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-surface-soft border border-line-soft px-3 py-2 text-xs text-copy-subtle">
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <Sparkles className="size-3.5 text-brand-cyan" /> Dual Completion Gate
            </span>
            <span>
              {store.technicalComplete ? "✓ Technical Complete" : "○ Technical Pending"} ·{" "}
              {store.placementComplete ? "✓ Placement Complete" : "○ Placement Pending"}
            </span>
          </div>
        </Panel>
      </div>

      {/* TWIN 30-MINUTE DAILY ROUTINE */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Morning 30m Placement Accelerator */}
        <Panel
          title="Twin Routine 1: Placement Accelerator (30m)"
          subtitle="Synchronized daily batch drills (06:00 Broadcast)"
          action={
            <Link to="/student/accelerator" className="text-xs font-semibold text-brand-cyan hover:underline">
              Full Accelerator →
            </Link>
          }
        >
          <ul className="space-y-2.5">
            {STEPS.map((s) => {
              const done = store.daily[s.key];
              return (
                <li key={s.key}>
                  <button
                    onClick={() => {
                      store.completeDailyStep(s.key);
                      toast.success(done ? "Step uncompleted" : `Step completed! +${s.xp} XP`);
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm transition-all",
                      done
                        ? "border-brand-emerald/40 bg-brand-emerald/5"
                        : "border-line-soft bg-surface-soft hover:border-brand-cyan/50"
                    )}
                  >
                    {done ? (
                      <CheckCircle2 className="size-4 shrink-0 text-brand-emerald" />
                    ) : (
                      <Circle className="size-4 shrink-0 text-copy-subtle" />
                    )}
                    <span className={cn("text-xs font-medium", done ? "text-copy-subtle line-through" : "text-foreground")}>
                      {s.label}
                    </span>
                    <span className="ml-auto inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-brand-cyan shrink-0">
                      <Zap className="size-3" /> +{s.xp} XP
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="mt-3.5 flex items-center justify-between border-t border-line-soft/60 pt-3 text-xs text-copy-subtle">
            <span className="flex items-center gap-1.5">
              <Flame className="size-3.5 text-brand-amber" /> Streak: {store.streak} Days
            </span>
            <Link to="/student/batch" className="font-semibold text-brand-cyan hover:underline">
              90-Day Calendar →
            </Link>
          </div>
        </Panel>

        {/* Afternoon/Evening 30m ITSE Technical Learning */}
        <Panel
          title="Twin Routine 2: ITSE Technical Learning (30m)"
          subtitle="Individual, self-paced competency & in-browser sandboxes"
          action={
            <button
              onClick={() => setShowTrackModal(true)}
              className="text-xs font-semibold text-brand-cyan hover:underline"
            >
              Manage Tracks ({store.activeTracks.length}/3) →
            </button>
          }
        >
          <div className="space-y-2.5">
            {active.map((t, idx) => {
              const pct = store.trackPercent(t.id);
              return (
                <div key={t.id} className="rounded-xl border border-line-soft bg-surface-soft p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full" style={{ background: t.accent }} />
                      <p className="text-xs font-bold text-foreground">
                        {t.name} {idx === 0 && <span className="text-[10px] text-brand-cyan font-normal">(Primary)</span>}
                      </p>
                    </div>
                    <span className="font-mono text-[11px] text-brand-cyan">{pct}%</span>
                  </div>
                  <p className="mt-1 text-[11px] text-copy-subtle line-clamp-1">{t.tagline}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <Meter value={pct} accent={t.accent} className="w-2/3" />
                    <Link
                      to="/student/labs"
                      className="text-[11px] font-semibold text-brand-cyan hover:underline"
                    >
                      Launch Lab →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
          <Link
            to="/student/technical"
            className="mt-3.5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple px-4 py-2.5 text-xs font-bold text-surface-dark"
          >
            <Code2 className="size-4" /> Explore 15 Technical Tracks Catalog
          </Link>
        </Panel>
      </div>

      {/* QUICK LAUNCH & HIRING MARKETPLACE PREVIEW */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          to="/student/gateway"
          className="group rounded-2xl border border-line-soft bg-surface-soft p-4 transition-all hover:border-brand-cyan/50 hover:bg-surface-elevated"
        >
          <div className="flex items-center justify-between">
            <span className="rounded-lg bg-brand-cyan/10 p-2 text-brand-cyan">
              <Unlock className="size-5" />
            </span>
            <ArrowRight className="size-4 text-copy-subtle transition-transform group-hover:translate-x-1 group-hover:text-brand-cyan" />
          </div>
          <p className="mt-3 font-semibold text-foreground text-sm">Dual Completion Gate</p>
          <p className="mt-1 text-xs text-copy-subtle">
            Evaluate technical mastery & 90-day accelerator completion to unlock Phase 2.
          </p>
        </Link>

        <Link
          to="/student/placement"
          className="group rounded-2xl border border-line-soft bg-surface-soft p-4 transition-all hover:border-brand-purple/50 hover:bg-surface-elevated"
        >
          <div className="flex items-center justify-between">
            <span className="rounded-lg bg-brand-purple/10 p-2 text-brand-purple">
              <Building2 className="size-5" />
            </span>
            <ArrowRight className="size-4 text-copy-subtle transition-transform group-hover:translate-x-1 group-hover:text-brand-purple" />
          </div>
          <p className="mt-3 font-semibold text-foreground text-sm">Placement Readiness</p>
          <p className="mt-1 text-xs text-copy-subtle">
            Tune 6-slider formula, simulate company requisitions and advance offers.
          </p>
        </Link>

        <Link
          to="/student/leaderboard"
          className="group rounded-2xl border border-line-soft bg-surface-soft p-4 transition-all hover:border-brand-emerald/50 hover:bg-surface-elevated"
        >
          <div className="flex items-center justify-between">
            <span className="rounded-lg bg-brand-emerald/10 p-2 text-brand-emerald">
              <Trophy className="size-5" />
            </span>
            <ArrowRight className="size-4 text-copy-subtle transition-transform group-hover:translate-x-1 group-hover:text-brand-emerald" />
          </div>
          <p className="mt-3 font-semibold text-foreground text-sm">Cohort Leaderboard</p>
          <p className="mt-1 text-xs text-copy-subtle">
            Compare Talent Score and XP rank among 100–300 learners in your batch.
          </p>
        </Link>
      </div>

      {/* TRACK SWITCHER MODAL */}
      {showTrackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-line-soft bg-surface-dark p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-line-soft pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">Select Technical Courses (1 to 3)</h3>
                <p className="text-xs text-copy-subtle">
                  Choose 1–3 self-paced specializations. First selection is treated as Primary.
                </p>
              </div>
              <Chip tone="purple">{store.activeTracks.length} / 3 selected</Chip>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 max-h-80 overflow-y-auto pr-1">
              {TRACKS.map((t) => {
                const isSelected = store.activeTracks.includes(t.id);
                return (
                  <button
                    key={t.id}
                    onClick={() => handleToggleTrack(t.id)}
                    className={cn(
                      "flex items-center justify-between rounded-xl border p-3 text-left transition-all",
                      isSelected
                        ? "border-brand-cyan bg-brand-cyan/10"
                        : "border-line-soft bg-surface-soft hover:border-line-strong"
                    )}
                  >
                    <div>
                      <p className="text-xs font-bold text-foreground">{t.name}</p>
                      <p className="text-[10px] text-copy-subtle line-clamp-1">{t.tagline}</p>
                    </div>
                    {isSelected && <Check className="size-4 text-brand-cyan shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-line-soft pt-3">
              <button
                onClick={() => setShowTrackModal(false)}
                className="rounded-xl bg-brand-cyan px-5 py-2 text-xs font-bold text-surface-dark hover:opacity-90"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

