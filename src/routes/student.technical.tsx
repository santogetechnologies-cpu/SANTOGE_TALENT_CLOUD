import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Chip, Meter, PageHeader, Panel, Stat } from "@/components/kit";
import { useAppStore } from "@/lib/app-store";
import { modulesFor, nextSkill } from "@/lib/curriculum";
import { TRACKS, DOMAINS, type TrackId, trackById } from "@/lib/tracks";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Circle,
  Play,
  UserRound,
  Terminal,
  BookOpen,
  Sparkles,
  Layers,
  Check,
  Zap,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/student/technical")({
  head: () => ({
    meta: [
      { title: "15 Technical Tracks & Development — SantoGe Talent Cloud" },
      { name: "description", content: "15 Purely Interactive Technical Tracks (100% in-browser sandboxes, zero video lectures). Manage your 1–3 active specializations." },
      { property: "og:title", content: "15 Technical Tracks — SantoGe Talent Cloud" },
      { property: "og:description", content: "15 Purely Interactive Technical Tracks." },
    ],
  }),
  component: TechnicalPage,
});

function TechnicalPage() {
  const store = useAppStore();
  const tracks = store.activeTracks && store.activeTracks.length > 0 ? store.activeTracks : ["mern" as TrackId];
  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const [open, setOpen] = useState<TrackId>(tracks[0] ?? "mern");
  
  const currentTrackId = tracks.includes(open) ? open : (tracks[0] ?? "mern");
  const track = trackById(currentTrackId);
  const modules = modulesFor(track.id);
  const upcoming = nextSkill(track.id, store.skills);
  const avg = Math.round(tracks.reduce((s, t) => s + store.trackPercent(t), 0) / Math.max(tracks.length, 1));

  const filteredCatalog = useMemo(() => {
    if (selectedDomain === "all") return TRACKS;
    return TRACKS.filter((t) => t.domain === selectedDomain);
  }, [selectedDomain]);

  const toggleTrackEnrollment = (id: TrackId) => {
    const isEnrolled = store.activeTracks.includes(id);
    if (isEnrolled) {
      if (store.activeTracks.length <= 1) {
        toast.error("You must maintain at least 1 active technical track.");
        return;
      }
      store.setActiveTracks(store.activeTracks.filter((t) => t !== id));
      toast.success(`Removed ${trackById(id).name} from active tracks.`);
    } else {
      if (store.activeTracks.length >= 3) {
        toast.error("Maximum 3 active technical courses allowed simultaneously. Change in settings.");
        return;
      }
      store.setActiveTracks([...store.activeTracks, id]);
      toast.success(`Enrolled in ${trackById(id).name}!`);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Interactive Technical Skill Engine (ITSE)"
        subtitle="15 Purely browser-based technical tracks with zero passive video lectures. Select 1 to 3 specializations and validate competency through live sandboxes."
        action={<Chip tone="cyan">{tracks.length} of 3 tracks active</Chip>}
      />

      {/* KPI Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Average Active Mastery" value={`${avg}%`} hint="Across your enrolled courses" />
        <Stat label="Skills Validated" value={store.skills.length} accent="var(--brand-emerald)" hint="Competency portfolio" />
        <Stat label="Verified Sandbox Labs" value={store.completedLabs.length} accent="var(--brand-purple)" hint="+50 XP per lab" />
        <Stat label="Daily Twin Cadence" value="30m ITSE" accent="var(--brand-amber)" hint="5m concept · 15m lab · 10m debug" />
      </div>

      {/* Active Enrolled Tracks Overview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-copy-subtle">
            Your Active Specializations (1–3 Courses)
          </p>
          <span className="text-[11px] text-copy-subtle">Click 'View Path' to inspect curriculum modules</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tracks.map((id, i) => {
            const t = trackById(id);
            const pct = store.trackPercent(id);
            const isViewing = currentTrackId === id;

            return (
              <Panel
                key={id}
                title={t.name}
                subtitle={`${i === 0 ? "Primary Track (100% Gate)" : "Secondary Track"} · ${t.short}`}
                className={cn(isViewing && "ring-2 ring-brand-cyan/60")}
                action={
                  <span className="size-3 rounded-full" style={{ background: t.accent }} />
                }
              >
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-copy-subtle">Competency Progress</span>
                  <span className="font-mono font-bold text-foreground">{pct}%</span>
                </div>
                <Meter value={pct} accent={t.accent} />

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setOpen(id)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-line-soft bg-surface-soft px-3 py-2 text-[11px] font-bold text-foreground hover:border-brand-cyan/60"
                  >
                    <Play className="size-3 text-brand-cyan" /> {isViewing ? "Viewing Path" : "View Path"}
                  </button>
                  <Link
                    to="/student/labs"
                    className="flex items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple px-3 py-2 text-[11px] font-bold text-surface-dark shadow-sm"
                  >
                    <Terminal className="size-3" /> Sandbox
                  </Link>
                </div>
              </Panel>
            );
          })}
        </div>
      </div>

      {/* Active Track Learning Path Breakdown */}
      <Panel
        title={`${track.name} · Step-by-Step Learning Path`}
        subtitle="Module → Skill → Micro-skill → Sandbox Task → Validation → Competency"
        action={<Chip tone="purple">{store.trackPercent(track.id)}% complete</Chip>}
      >
        {upcoming && (
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-brand-cyan/40 bg-surface-soft p-3.5">
            <UserRound className="size-4 text-brand-cyan shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-foreground">
                Recommended Next Step: <span className="font-bold text-brand-cyan">{upcoming.name}</span>
              </p>
              <p className="text-[11px] text-copy-subtle">Complete in-browser sandbox challenge to log competency.</p>
            </div>
            <button
              onClick={() => store.completeSkill(track.id, upcoming.id, upcoming.name)}
              className="rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple px-3.5 py-1.5 text-[11px] font-bold text-surface-dark shadow-md"
            >
              Validate Competency (+30 XP)
            </button>
          </div>
        )}

        <div className="space-y-3">
          {modules.map((m) => {
            const done = m.skills.filter((s) => store.skills.includes(s.id)).length;
            return (
              <div key={m.id} className="rounded-xl border border-line-soft bg-surface-soft p-3.5">
                <div className="mb-2.5 flex items-center justify-between text-xs">
                  <p className="font-bold text-foreground">{m.name}</p>
                  <span className="font-mono text-copy-subtle text-[11px]">{done}/{m.skills.length} validated</span>
                </div>
                <div className="space-y-2">
                  {m.skills.map((s) => {
                    const isDone = store.skills.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        onClick={() => store.completeSkill(track.id, s.id, s.name)}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-xl border p-2.5 text-left text-xs transition-colors",
                          isDone
                            ? "border-brand-emerald/40 bg-surface-dark/40 text-copy-subtle"
                            : "border-line-soft bg-surface-elevated text-foreground hover:border-brand-cyan/50",
                        )}
                      >
                        {isDone ? <CheckCircle2 className="size-4 text-brand-emerald shrink-0" /> : <Circle className="size-4 text-copy-subtle shrink-0" />}
                        <span className={isDone ? "line-through text-copy-subtle" : "font-medium"}>{s.name}</span>
                        <span className="ml-auto font-mono text-[10px] text-brand-cyan">{isDone ? "Competent ✓" : "+30 XP"}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      {/* ALL 15 PURELY INTERACTIVE TECHNICAL TRACKS CATALOG */}
      <Panel
        title="Complete 15 Technical Tracks Catalog"
        subtitle="100% In-Browser Simulators & Code Labs · Zero Passive Video Uploads"
        action={
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedDomain("all")}
              className={cn(
                "rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors border",
                selectedDomain === "all"
                  ? "border-brand-cyan/60 bg-surface-soft text-brand-cyan"
                  : "border-line-soft text-copy-subtle hover:text-foreground"
              )}
            >
              All (15)
            </button>
            {DOMAINS.map((dom) => (
              <button
                key={dom.id}
                onClick={() => setSelectedDomain(dom.id)}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors border",
                  selectedDomain === dom.id
                    ? "border-brand-cyan/60 bg-surface-soft text-brand-cyan"
                    : "border-line-soft text-copy-subtle hover:text-foreground"
                )}
              >
                {dom.label}
              </button>
            ))}
          </div>
        }
      >
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCatalog.map((t, idx) => {
            const isEnrolled = store.activeTracks.includes(t.id);
            const pct = store.trackPercent(t.id);
            const trackMods = modulesFor(t.id);

            return (
              <div
                key={t.id}
                className={cn(
                  "flex flex-col justify-between rounded-2xl border p-4 transition-all bg-surface-soft/80",
                  isEnrolled ? "border-brand-cyan/60 shadow-md" : "border-line-soft hover:border-line-soft/80"
                )}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-surface-dark px-2 py-0.5 text-[10px] font-mono text-copy-subtle border border-line-soft">
                      Track {idx + 1} · {t.short}
                    </span>
                    <span className="size-2.5 rounded-full" style={{ background: t.accent }} />
                  </div>

                  <h4 className="mt-2 text-sm font-bold text-foreground">{t.name}</h4>
                  <p className="mt-1 text-xs text-copy-subtle line-clamp-2">{t.tagline}</p>

                  <div className="mt-3 space-y-1.5 text-[11px] text-copy-subtle">
                    <div className="flex items-center gap-1.5">
                      <Terminal className="size-3 text-brand-cyan" />
                      <span className="font-mono text-foreground font-semibold">Lab: {t.labTitle}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Layers className="size-3 text-brand-purple" />
                      <span>{trackMods.length} Modules · Zero Video Hours</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-line-soft/60 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] text-copy-subtle">Competency</span>
                    <span className="font-mono font-bold text-foreground">{pct}%</span>
                  </div>
                  <Meter value={pct} accent={t.accent} />

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => toggleTrackEnrollment(t.id)}
                      className={cn(
                        "flex-1 rounded-xl px-3 py-1.5 text-xs font-bold transition-all border",
                        isEnrolled
                          ? "border-brand-emerald/40 bg-brand-emerald/10 text-brand-emerald"
                          : "border-line-soft bg-surface-elevated text-copy-subtle hover:text-foreground"
                      )}
                    >
                      {isEnrolled ? "✓ Enrolled" : "+ Enroll (1-3)"}
                    </button>
                    <Link
                      to="/student/labs"
                      className="rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple px-3 py-1.5 text-xs font-bold text-surface-dark shadow-sm"
                    >
                      Launch Lab
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}


