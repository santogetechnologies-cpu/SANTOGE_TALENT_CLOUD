import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Chip, Meter, PageHeader, Panel, Stat } from "@/components/kit";
import { useAppStore } from "@/lib/app-store";
import { modulesFor, nextSkill } from "@/lib/curriculum";
import { TRACKS, type TrackId } from "@/lib/tracks";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Play, UserRound } from "lucide-react";

export const Route = createFileRoute("/student/technical")({
  head: () => ({
    meta: [
      { title: "Your Technical Development — SantoGe Talent Cloud" },
      { name: "description", content: "Self-paced technical tracks with module, skill and competency progress for each course you selected." },
      { property: "og:title", content: "Your Technical Development — SantoGe Talent Cloud" },
      { property: "og:description", content: "Self-paced technical tracks with module, skill and competency progress." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TechnicalPage,
});

function TechnicalPage() {
  const store = useAppStore();
  const tracks = store.activeTracks;
  const [open, setOpen] = useState<TrackId>(tracks[0] ?? "mern");
  const track = TRACKS.find((t) => t.id === open) ?? TRACKS[0]!;
  const modules = modulesFor(track.id);
  const upcoming = nextSkill(track.id, store.skills);
  const avg = Math.round(tracks.reduce((s, t) => s + store.trackPercent(t), 0) / Math.max(tracks.length, 1));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Your Technical Development"
        subtitle="Individual and self-paced. There is no common technical class — you decide which selected course to continue today."
        action={<Chip tone="cyan">{tracks.length} of 3 tracks selected</Chip>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Average track progress" value={`${avg}%`} hint="Across your selected courses" />
        <Stat label="Skills validated" value={store.skills.length} accent="var(--brand-emerald)" />
        <Stat label="Recommended session" value="30m" accent="var(--brand-purple)" hint="5m concept · 15m sandbox · 10m practical" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {tracks.map((id, i) => {
          const t = TRACKS.find((x) => x.id === id)!;
          const pct = store.trackPercent(id);
          return (
            <Panel key={id} title={`Track ${i + 1}`} subtitle={t.name}>
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-copy-subtle">{i === 0 ? "Primary track" : "Secondary track"}</span>
                <span className="font-mono text-foreground">{pct}%</span>
              </div>
              <Meter value={pct} accent={t.accent} />
              <button
                onClick={() => setOpen(id)}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-line-soft px-3 py-2 text-[11px] font-bold text-foreground hover:border-brand-cyan/60"
              >
                <Play className="size-3.5" /> Continue
              </button>
            </Panel>
          );
        })}
      </div>

      <Panel
        title={`${track.name} · learning path`}
        subtitle="Module → Skill → Micro skill → Sandbox task → Validation → Competency"
        action={<Chip tone="purple">{store.trackPercent(track.id)}% complete</Chip>}
      >
        {upcoming && (
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-brand-cyan/40 bg-surface-soft p-3">
            <UserRound className="size-4 text-brand-cyan" />
            <p className="text-xs text-foreground">
              Next for you: <span className="font-semibold">{upcoming.name}</span>
            </p>
            <button
              onClick={() => store.completeSkill(track.id, upcoming.id, upcoming.name)}
              className="ml-auto rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple px-3 py-1.5 text-[11px] font-bold text-surface-dark"
            >
              Run sandbox & validate
            </button>
          </div>
        )}
        <div className="space-y-3">
          {modules.map((m) => {
            const done = m.skills.filter((s) => store.skills.includes(s.id)).length;
            return (
              <div key={m.id} className="rounded-xl border border-line-soft bg-surface-soft p-3">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <p className="font-semibold text-foreground">{m.name}</p>
                  <span className="font-mono text-copy-subtle">{done}/{m.skills.length} validated</span>
                </div>
                <div className="space-y-1.5">
                  {m.skills.map((s) => {
                    const isDone = store.skills.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        onClick={() => store.completeSkill(track.id, s.id, s.name)}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-colors",
                          isDone ? "border-brand-emerald/40 text-copy-subtle" : "border-line-soft text-foreground hover:border-brand-cyan/50",
                        )}
                      >
                        {isDone ? <CheckCircle2 className="size-3.5 text-brand-emerald" /> : <Circle className="size-3.5 text-copy-subtle" />}
                        <span className={isDone ? "line-through" : ""}>{s.name}</span>
                        <span className="ml-auto font-mono text-[10px] text-brand-cyan">{isDone ? "competent" : "+30 XP"}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel title="Why this is not a batch class" subtitle="Architecture note">
        <p className="text-xs leading-relaxed text-copy-subtle">
          Your batch is a Placement Accelerator cohort only. Batchmates follow the same English, aptitude and communication
          schedule, but each student runs an independent technical journey across the courses assigned to them — so the
          module you continue today is yours alone.
        </p>
      </Panel>
    </div>
  );
}
