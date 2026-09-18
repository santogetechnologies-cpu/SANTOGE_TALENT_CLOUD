import { createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { Chip, PageHeader, Panel } from "@/components/kit";
import { LAB_COMPONENTS } from "@/components/labs";
import { useAppStore } from "@/lib/app-store";
import { TRACKS, trackById, type TrackId } from "@/lib/tracks";
import { cn } from "@/lib/utils";
import {
  Search,
  Terminal,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  FlaskConical,
  Award,
  Zap,
} from "lucide-react";
import { useLiveStudentProfile, useLiveStudentProgress, isStudentTrackAssigned } from "@/lib/data";

export const Route = createFileRoute("/student/labs")({
  head: () => ({
    meta: [
      { title: "Technical Labs Sandbox — SantoGe Talent Cloud" },
      {
        name: "description",
        content:
          "Run interactive sandbox labs across your technical tracks and practice environments to earn verified Talent Score credit.",
      },
      { property: "og:title", content: "Technical Labs Sandbox — SantoGe Talent Cloud" },
      {
        property: "og:description",
        content: "Interactive sandbox labs for technical courses with real-time verification.",
      },
    ],
  }),
  component: LabsPage,
});

function LabsPage() {
  const store = useAppStore();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const searchTrack = searchParams.get("track") as TrackId | null;

  const { data: liveProfileData } = useLiveStudentProfile(
    store.supabaseSession?.user?.id,
    !!store.supabaseSession?.user?.id,
  );
  const liveStudentId = liveProfileData?.profile?.id || store.liveStudentId;
  const { data: liveProgressData } = useLiveStudentProgress(
    liveStudentId || undefined,
    !!liveStudentId,
  );

  const activeTracks: TrackId[] = liveProfileData?.tracks || store.activeTracks || [];
  const completedLabs: string[] = liveProgressData?.completedLabs || store.completedLabs || [];

  const [selected, setSelected] = useState<TrackId>(() => {
    if (searchTrack && TRACKS.some((t) => t.id === searchTrack)) {
      return searchTrack;
    }
    if (activeTracks.length > 0 && TRACKS.some((t) => t.id === activeTracks[0])) {
      return activeTracks[0]!;
    }
    return "java";
  });
  const [query, setQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "assigned" | "verified">("all");

  // Keep selected in sync if search param changes
  useEffect(() => {
    if (searchTrack && TRACKS.some((t) => t.id === searchTrack)) {
      setSelected(searchTrack);
    }
  }, [searchTrack]);

  const filteredTracks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TRACKS.filter((t) => {
      const matchesQuery =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.short.toLowerCase().includes(q) ||
        t.tagline.toLowerCase().includes(q) ||
        t.labTitle.toLowerCase().includes(q);

      if (!matchesQuery) return false;

      if (filterMode === "assigned") {
        return isStudentTrackAssigned(activeTracks, t.id);
      }
      if (filterMode === "verified") {
        return completedLabs.includes(t.id);
      }
      return true;
    });
  }, [query, filterMode, activeTracks, completedLabs]);

  const currentTrack = trackById(selected);
  const isSelectedAssigned = isStudentTrackAssigned(activeTracks, selected);
  const isSelectedCompleted = completedLabs.includes(selected);
  const Lab = selected ? LAB_COMPONENTS[selected] : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Technical Labs Sandbox"
        subtitle="Interactive, isolated execution environments. Test code against real assertion suites, verify implementations, and build Talent Score evidence."
        action={
          <div className="flex items-center gap-2">
            <Chip tone="emerald">
              <CheckCircle2 className="size-3 mr-1 inline" />
              {completedLabs.length} / {TRACKS.length} Labs Verified
            </Chip>
            <Chip tone="amber">
              <Zap className="size-3 mr-1 inline" />
              +{completedLabs.length * 50} XP Earned
            </Chip>
          </div>
        }
      />

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Enrolled Courses
            </span>
            <ShieldCheck className="size-4 text-primary" />
          </div>
          <p className="mt-1.5 text-xl font-bold text-foreground">{activeTracks.length}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Admin-provisioned tracks</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Verified Labs
            </span>
            <CheckCircle2 className="size-4 text-emerald-500" />
          </div>
          <p className="mt-1.5 text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {completedLabs.length} <span className="text-xs font-normal text-muted-foreground">/ {TRACKS.length}</span>
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Passed test suites</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Sandbox XP
            </span>
            <Award className="size-4 text-amber-500" />
          </div>
          <p className="mt-1.5 text-xl font-bold text-amber-600 dark:text-amber-400">
            +{completedLabs.length * 50}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Hands-on practice credit</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Runtime Kernel
            </span>
            <Terminal className="size-4 text-cyan-500" />
          </div>
          <p className="mt-1.5 text-sm font-semibold text-foreground flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            Active v8-Wasm
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Containerized sandbox</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[310px_1fr]">
        {/* Left Sidebar: Lab Selector */}
        <Panel
          title="Sandbox Engines"
          subtitle={`${TRACKS.length} domain environments`}
        >
          {/* Search bar */}
          <label className="mb-2.5 flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-1.5">
            <Search className="size-3.5 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sandbox labs…"
              className="w-full bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
            />
          </label>

          {/* Filter Pills */}
          <div className="mb-3 flex items-center gap-1">
            <button
              onClick={() => setFilterMode("all")}
              className={cn(
                "rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors",
                filterMode === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              All ({TRACKS.length})
            </button>
            <button
              onClick={() => setFilterMode("assigned")}
              className={cn(
                "rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors",
                filterMode === "assigned"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              Assigned ({activeTracks.length})
            </button>
            <button
              onClick={() => setFilterMode("verified")}
              className={cn(
                "rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors",
                filterMode === "verified"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              Verified ({completedLabs.length})
            </button>
          </div>

          {/* Labs List */}
          <div className="max-h-[560px] space-y-2 overflow-y-auto pr-1">
            {filteredTracks.map((t) => {
              const isAssigned = isStudentTrackAssigned(activeTracks, t.id);
              const isDone = completedLabs.includes(t.id);
              const isCurrent = selected === t.id;

              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelected(t.id);
                    void navigate({ to: "/student/labs", search: { track: t.id } as any });
                  }}
                  className={cn(
                    "w-full rounded-lg border p-2.5 text-left transition-all",
                    isCurrent
                      ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/20"
                      : "border-border bg-card hover:bg-muted/50",
                  )}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="size-2 rounded-full shrink-0"
                        style={{ background: t.accent }}
                      />
                      <p className="text-xs font-semibold text-foreground truncate">{t.short}</p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {isDone ? (
                        <span className="inline-flex items-center gap-0.5 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="size-2.5" />
                          Passed
                        </span>
                      ) : isAssigned ? (
                        <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary border border-primary/20">
                          Enrolled
                        </span>
                      ) : (
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground border border-border">
                          Practice
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="mt-1 text-[11px] font-medium text-muted-foreground line-clamp-1">
                    {t.labTitle}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground/80 line-clamp-1 font-mono">
                    {t.tagline}
                  </p>
                </button>
              );
            })}

            {filteredTracks.length === 0 && (
              <div className="p-4 text-center text-xs text-muted-foreground">
                No sandbox labs match "{query}".
              </div>
            )}
          </div>
        </Panel>

        {/* Right Sandbox Engine Container */}
        <div className="min-w-0 space-y-4">
          {/* Active Lab Header Banner */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex size-11 items-center justify-center rounded-xl text-white shadow-xs font-bold text-xs shrink-0"
                  style={{ background: currentTrack.accent }}
                >
                  <FlaskConical className="size-5 text-white" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-bold text-foreground">{currentTrack.name}</h2>
                    {isSelectedAssigned ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary border border-primary/20">
                        <ShieldCheck className="size-3" />
                        Assigned Track
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground border border-border">
                        <Sparkles className="size-3" />
                        Practice Mode
                      </span>
                    )}
                    {isSelectedCompleted && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="size-3" />
                        Verified (+50 XP)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {currentTrack.labTitle} — {currentTrack.tagline}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <div className="rounded-md border border-border/80 bg-muted/30 px-2.5 py-1 text-[11px] font-mono text-muted-foreground flex items-center gap-1.5">
                  <Terminal className="size-3 text-emerald-500" />
                  <span>runtime: isolated-v8</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Lab Component */}
          {Lab ? (
            <Lab />
          ) : (
            <div className="rounded-xl border border-border bg-card p-8 text-center text-xs text-muted-foreground shadow-xs">
              Select a sandbox lab from the sidebar to launch the environment.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
