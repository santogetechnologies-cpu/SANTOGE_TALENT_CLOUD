import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Chip, Meter, PageHeader, Panel, Stat } from "@/components/kit";
import { useAppStore } from "@/lib/app-store";
import { modulesFor, nextSkill } from "@/lib/curriculum";
import { TRACKS, DOMAINS, type TrackId, trackById } from "@/lib/tracks";
import { getTrackSyllabus } from "@/lib/syllabus-data";
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
  Briefcase,
  Calendar,
  Award,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Quote,
  Target,
  FileCheck2,
  Flame,
  Search,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/student/technical")({
  head: () => ({
    meta: [
      { title: "90-Day Placement Syllabus & Technical Tracks — SantoGe Talent Cloud" },
      {
        name: "description",
        content:
          "18 Weeks × 5 Working Days = 90 Days. 18 Friday workplace simulations, 18 portfolio projects, and Day 90 industry capstone designed to crack technical placement interviews.",
      },
      { property: "og:title", content: "90-Day Placement Syllabus — SantoGe Talent Cloud" },
      {
        property: "og:description",
        content: "18 Weeks × 5 Days = 90 Learning Days with Friday Workplace Simulations.",
      },
    ],
  }),
  component: TechnicalPage,
});

import { useQueryClient } from "@tanstack/react-query";
import { useLiveStudentProfile, useLiveStudentProgress, updateLiveStudentTracks } from "@/lib/data";

function TechnicalPage() {
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

  const tracks: TrackId[] = liveProfileData?.tracks || store.activeTracks;
  const skills = liveProgressData?.skills || store.skills;

  const calculateTrackPct = (trackId: TrackId) => {
    const mods = modulesFor(trackId);
    const total = mods.reduce((s, m) => s + m.skills.length, 0);
    if (total === 0) return 0;
    const done = mods.reduce(
      (s, m) => s + m.skills.filter((sk) => skills.includes(sk.id)).length,
      0,
    );
    return Math.round((done / total) * 100);
  };

  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const [open, setOpen] = useState<TrackId>(tracks[0] ?? "mern");
  const [syllabusViewTab, setSyllabusViewTab] = useState<
    "90days" | "simulations" | "portfolio" | "capstone"
  >("90days");
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState<number | "all">("all");
  const [expandedWeeks, setExpandedWeeks] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    6: true,
    11: true,
    15: true,
    18: true,
  });
  const [syllabusSearch, setSyllabusSearch] = useState("");

  const currentTrackId = tracks.includes(open) ? open : (tracks[0] ?? "mern");
  const track = trackById(currentTrackId);
  const syllabus = useMemo(() => getTrackSyllabus(track.id), [track.id]);
  const modules = modulesFor(track.id);
  const upcoming = nextSkill(track.id, skills);
  const avg = Math.round(
    tracks.reduce((s, t) => s + calculateTrackPct(t), 0) / Math.max(tracks.length, 1),
  );

  const filteredCatalog = useMemo(() => {
    if (selectedDomain === "all") return TRACKS;
    return TRACKS.filter((t) => t.domain === selectedDomain);
  }, [selectedDomain]);

  const toggleTrackEnrollment = async (id: TrackId) => {
    const isEnrolled = tracks.includes(id);
    if (isEnrolled) {
      if (tracks.length <= 1) {
        toast.error("You must maintain at least 1 active technical track.");
        return;
      }
      const nextTracks = tracks.filter((t) => t !== id);
      if (liveStudentId) {
        const res = await updateLiveStudentTracks(liveStudentId, nextTracks);
        if (!res.ok) {
          toast.error(res.error || "Failed to update tracks");
          return;
        }
        queryClient.invalidateQueries({
          queryKey: ["live", "student-profile", store.supabaseSession?.user?.id],
        });
      }
      store.setActiveTracks(nextTracks);
      toast.success(`Removed ${trackById(id).name} from active tracks.`);
    } else {
      if (tracks.length >= 3) {
        toast.error(
          "Maximum 3 active technical courses allowed simultaneously. Change in settings.",
        );
        return;
      }
      const nextTracks = [...tracks, id];
      if (liveStudentId) {
        const res = await updateLiveStudentTracks(liveStudentId, nextTracks);
        if (!res.ok) {
          toast.error(res.error || "Failed to update tracks");
          return;
        }
        queryClient.invalidateQueries({
          queryKey: ["live", "student-profile", store.supabaseSession?.user?.id],
        });
      }
      store.setActiveTracks(nextTracks);
      toast.success(`Enrolled in ${trackById(id).name}!`);
    }
  };

  const toggleWeekExpand = (wNum: number) => {
    setExpandedWeeks((prev) => ({ ...prev, [wNum]: !prev[wNum] }));
  };

  const filteredWeeks = useMemo(() => {
    return syllabus.weeks.filter((w) => {
      const matchesPhase =
        selectedPhaseFilter === "all" ||
        (selectedPhaseFilter === 1
          ? w.week <= 5
          : selectedPhaseFilter === 2
            ? w.week >= 6 && w.week <= 10
            : selectedPhaseFilter === 3
              ? w.week >= 11 && w.week <= 14
              : selectedPhaseFilter === 4
                ? w.week >= 15 && w.week <= 16
                : w.week >= 17);

      const matchesSearch =
        !syllabusSearch.trim() ||
        w.title.toLowerCase().includes(syllabusSearch.toLowerCase()) ||
        w.theme.toLowerCase().includes(syllabusSearch.toLowerCase()) ||
        w.projectTitle.toLowerCase().includes(syllabusSearch.toLowerCase()) ||
        w.days.some(
          (d) =>
            d.topic.toLowerCase().includes(syllabusSearch.toLowerCase()) ||
            d.practice.toLowerCase().includes(syllabusSearch.toLowerCase()),
        );

      return matchesPhase && matchesSearch;
    });
  }, [syllabus, selectedPhaseFilter, syllabusSearch]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="90-Day Placement-Oriented Syllabus & Technical Engine"
        subtitle="18 Weeks × 5 Working Days = 90 Days. Days 1–4: 20m Concept + 10m Practice. Friday: Workplace Simulation. Built to crack technical interviews on day 90."
        action={<Chip tone="cyan">{tracks.length} of 3 active specializations</Chip>}
      />

      {/* KPI Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Total Curriculum Days" value="90 Days" hint="18 Weeks × 5 Working Days" />
        <Stat
          label="Friday Simulations"
          value="18 Mini Projects"
          accent="var(--brand-purple)"
          hint="Every Friday simulation"
        />
        <Stat
          label="Placement Portfolio"
          value="18 Projects + Capstone"
          accent="var(--brand-emerald)"
          hint="Interview-ready artifacts"
        />
        <Stat
          label="Competency Mastery"
          value={`${calculateTrackPct(track.id)}%`}
          accent="var(--brand-amber)"
          hint={`Active track: ${track.short}`}
        />
      </div>

      {/* Active Enrolled Tracks Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-copy-subtle">
            Select Active Course Track to Inspect 90-Day Syllabus
          </p>
          <span className="text-[11px] text-copy-subtle">
            Click 'View Syllabus' on any enrolled specialization
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from(new Set(tracks || [])).map((id, i) => {
            const t = trackById(id);
            const pct = calculateTrackPct(id);
            const isViewing = currentTrackId === id;

            return (
              <Panel
                key={`${id}-${i}`}
                title={t.name}
                subtitle={`${i === 0 ? "Primary Track (100% Gate)" : "Secondary Track"} · ${t.short}`}
                className={cn(
                  isViewing && "ring-2 ring-brand-cyan/60 shadow-lg shadow-brand-cyan/5",
                )}
                action={<span className="size-3 rounded-full" style={{ background: t.accent }} />}
              >
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-copy-subtle">90-Day Mastery</span>
                  <span className="font-mono font-bold text-foreground">{pct}%</span>
                </div>
                <Meter value={pct} accent={t.accent} />

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setOpen(id)}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-[11px] font-bold transition-all",
                      isViewing
                        ? "border-brand-cyan bg-brand-cyan/10 text-brand-cyan"
                        : "border-line-soft bg-surface-soft text-foreground hover:border-brand-cyan/60",
                    )}
                  >
                    <Play className="size-3 text-brand-cyan" />{" "}
                    {isViewing ? "Inspecting Syllabus" : "View 90-Day Syllabus"}
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

      {/* =================================================================== */}
      {/* 90-DAY PLACEMENT SYLLABUS & PROJECT PLAN MASTER SUITE */}
      {/* =================================================================== */}
      <Panel
        title={`90-Day Placement Syllabus · ${syllabus.trackName}`}
        subtitle={`Target Role: ${syllabus.targetRole} · Structure: 18 Weeks × 5 Working Days = 90 Learning Days`}
        action={<Chip tone="emerald">{syllabus.weeks.length} Weeks Structured</Chip>}
      >
        {/* Career Progression & Interview Pitch Banner */}
        <div className="grid gap-4 lg:grid-cols-3 mb-6">
          {/* Career Ladder */}
          <div className="rounded-2xl border border-line-soft bg-surface-dark/80 p-4 space-y-3 lg:col-span-1">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <Target className="size-4 text-brand-purple" />
              <span>Career Role Progression</span>
            </div>
            <div className="space-y-2">
              {syllabus.careerProgression.map((role, rIdx) => (
                <div key={role} className="flex items-center gap-2 text-xs">
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-mono font-bold",
                      rIdx === syllabus.careerProgression.length - 1
                        ? "bg-brand-emerald text-surface-dark"
                        : "bg-surface-elevated text-copy-subtle border border-line-soft",
                    )}
                  >
                    {rIdx + 1}
                  </span>
                  <span
                    className={cn(
                      "font-medium",
                      rIdx === syllabus.careerProgression.length - 1
                        ? "text-brand-emerald font-bold"
                        : "text-copy-subtle",
                    )}
                  >
                    {role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Guaranteed Interview Pitch Script */}
          <div className="rounded-2xl border border-brand-cyan/30 bg-brand-cyan/5 p-4 space-y-2.5 lg:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-brand-cyan">
                <Quote className="size-4" />
                <span>Placement Interview Value Script (What to say to interviewers)</span>
              </div>
              <p className="mt-2 text-xs italic text-foreground leading-relaxed">
                "{syllabus.interviewPitch}"
              </p>
            </div>
            <div className="flex items-center justify-between border-t border-brand-cyan/20 pt-2 text-[11px] text-copy-subtle">
              <span>Verified through 18 real-world mini projects + Day 90 industry capstone.</span>
              <span className="font-bold text-brand-emerald">✓ 100% Placement Ready</span>
            </div>
          </div>
        </div>

        {/* Syllabus View Mode Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft pb-4">
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSyllabusViewTab("90days")}
              className={cn(
                "rounded-xl px-3.5 py-2 text-xs font-bold transition-all flex items-center gap-1.5",
                syllabusViewTab === "90days"
                  ? "bg-gradient-to-r from-brand-cyan to-brand-purple text-surface-dark shadow-md"
                  : "bg-surface-soft text-copy-subtle hover:text-foreground border border-line-soft",
              )}
            >
              <Calendar className="size-3.5" /> 90-Day Schedule (18 Weeks)
            </button>
            <button
              onClick={() => setSyllabusViewTab("simulations")}
              className={cn(
                "rounded-xl px-3.5 py-2 text-xs font-bold transition-all flex items-center gap-1.5",
                syllabusViewTab === "simulations"
                  ? "bg-gradient-to-r from-brand-cyan to-brand-purple text-surface-dark shadow-md"
                  : "bg-surface-soft text-copy-subtle hover:text-foreground border border-line-soft",
              )}
            >
              <Briefcase className="size-3.5" /> 18 Friday Workplace Simulations
            </button>
            <button
              onClick={() => setSyllabusViewTab("portfolio")}
              className={cn(
                "rounded-xl px-3.5 py-2 text-xs font-bold transition-all flex items-center gap-1.5",
                syllabusViewTab === "portfolio"
                  ? "bg-gradient-to-r from-brand-cyan to-brand-purple text-surface-dark shadow-md"
                  : "bg-surface-soft text-copy-subtle hover:text-foreground border border-line-soft",
              )}
            >
              <Award className="size-3.5" /> Placement Portfolio (18 Projects)
            </button>
            <button
              onClick={() => setSyllabusViewTab("capstone")}
              className={cn(
                "rounded-xl px-3.5 py-2 text-xs font-bold transition-all flex items-center gap-1.5",
                syllabusViewTab === "capstone"
                  ? "bg-gradient-to-r from-brand-cyan to-brand-purple text-surface-dark shadow-md"
                  : "bg-surface-soft text-copy-subtle hover:text-foreground border border-line-soft",
              )}
            >
              <Sparkles className="size-3.5" /> Day 90 Master Capstone
            </button>
          </div>

          {syllabusViewTab === "90days" && (
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 rounded-xl border border-line-soft bg-surface-soft px-3 py-1.5 text-xs">
                <Search className="size-3.5 text-copy-subtle" />
                <input
                  value={syllabusSearch}
                  onChange={(e) => setSyllabusSearch(e.target.value)}
                  placeholder="Search day or topic…"
                  className="w-32 sm:w-44 bg-transparent outline-none text-foreground text-xs placeholder:text-copy-subtle"
                />
              </label>
            </div>
          )}
        </div>

        {/* Phase Filter Bar */}
        {syllabusViewTab === "90days" && (
          <div className="my-4 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-copy-subtle uppercase mr-1">
              Filter by Phase:
            </span>
            <button
              onClick={() => setSelectedPhaseFilter("all")}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors border",
                selectedPhaseFilter === "all"
                  ? "border-brand-cyan bg-brand-cyan/10 text-brand-cyan"
                  : "border-line-soft bg-surface-soft text-copy-subtle hover:text-foreground",
              )}
            >
              All 18 Weeks (90 Days)
            </button>
            {syllabus.phases.map((p) => (
              <button
                key={p.phaseNumber}
                onClick={() => setSelectedPhaseFilter(p.phaseNumber)}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors border",
                  selectedPhaseFilter === p.phaseNumber
                    ? "border-brand-purple bg-brand-purple/10 text-brand-purple font-bold"
                    : "border-line-soft bg-surface-soft text-copy-subtle hover:text-foreground",
                )}
              >
                Phase {p.phaseNumber}: {p.title.split(" ")[0]} ({p.weeksRange})
              </button>
            ))}
          </div>
        )}

        {/* TAB 1: 90-DAY DAY-BY-DAY CURRICULUM ACCORDIONS */}
        {syllabusViewTab === "90days" && (
          <div className="space-y-4">
            {filteredWeeks.map((w) => {
              const isOpen = Boolean(expandedWeeks[w.week]);
              const phaseNum =
                w.week <= 5 ? 1 : w.week <= 10 ? 2 : w.week <= 14 ? 3 : w.week <= 16 ? 4 : 5;
              const phase = syllabus.phases.find((p) => p.phaseNumber === phaseNum);

              return (
                <div
                  key={w.week}
                  className={cn(
                    "rounded-2xl border transition-all overflow-hidden",
                    isOpen
                      ? "border-brand-cyan/50 bg-surface-soft/90"
                      : "border-line-soft bg-surface-soft/40 hover:border-line-strong",
                  )}
                >
                  {/* Week Header */}
                  <div
                    onClick={() => toggleWeekExpand(w.week)}
                    className="flex flex-wrap items-center justify-between p-4 cursor-pointer select-none gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex size-7 items-center justify-center rounded-xl bg-brand-cyan/10 font-mono text-xs font-bold text-brand-cyan border border-brand-cyan/20">
                        W{w.week}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-foreground">{w.title}</h4>
                          <span className="rounded bg-surface-elevated px-2 py-0.5 text-[10px] font-mono text-copy-subtle border border-line-soft">
                            Phase {phaseNum}
                          </span>
                        </div>
                        <p className="text-xs text-copy-subtle mt-0.5">
                          Theme: <span className="text-foreground font-medium">{w.theme}</span> ·
                          Friday Mini Project:{" "}
                          <span className="text-brand-purple font-semibold">{w.projectTitle}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="rounded-lg bg-surface-dark px-2.5 py-1 text-[11px] font-semibold text-brand-emerald border border-line-soft">
                        Workplace Skill: {w.workplaceSkill}
                      </span>
                      {isOpen ? (
                        <ChevronDown className="size-4 text-brand-cyan" />
                      ) : (
                        <ChevronRight className="size-4 text-copy-subtle" />
                      )}
                    </div>
                  </div>

                  {/* Days 1 to 5 Table / Cards */}
                  {isOpen && (
                    <div className="border-t border-line-soft/80 p-4 space-y-2.5 bg-surface-dark/40">
                      <div className="grid gap-2 sm:grid-cols-5">
                        {w.days.map((d) => {
                          const isFriday = d.day % 5 === 0;

                          return (
                            <div
                              key={d.day}
                              className={cn(
                                "rounded-xl border p-3 flex flex-col justify-between transition-all",
                                isFriday
                                  ? "border-brand-purple/60 bg-brand-purple/5 sm:col-span-1 shadow-sm"
                                  : "border-line-soft bg-surface-soft/80",
                              )}
                            >
                              <div>
                                <div className="flex items-center justify-between mb-1.5">
                                  <span
                                    className={cn(
                                      "rounded px-1.5 py-0.5 font-mono text-[10px] font-bold",
                                      isFriday
                                        ? "bg-brand-purple text-surface-dark"
                                        : "bg-surface-elevated text-brand-cyan",
                                    )}
                                  >
                                    Day {d.day} {isFriday && "· Friday Simulation"}
                                  </span>
                                  <span className="font-mono text-[10px] text-copy-subtle">
                                    {isFriday ? "30 min Project" : "20 + 10 min"}
                                  </span>
                                </div>

                                <p
                                  className={cn(
                                    "text-xs font-bold",
                                    isFriday ? "text-brand-purple" : "text-foreground",
                                  )}
                                >
                                  {d.topic}
                                </p>
                              </div>

                              <div className="mt-3 pt-2 border-t border-line-soft/60">
                                <p className="text-[11px] text-copy-subtle line-clamp-2">
                                  <span className="font-semibold text-foreground">Practice:</span>{" "}
                                  {d.practice}
                                </p>
                                {d.deliverable && (
                                  <div className="mt-2 rounded bg-surface-dark px-2 py-1 text-[10px] font-mono text-brand-emerald border border-line-soft">
                                    Deliverable: {d.deliverable}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Friday Workplace Simulation Brief */}
                      <div className="mt-3 rounded-xl border border-brand-purple/30 bg-brand-purple/5 p-3 flex items-start gap-3 text-xs">
                        <Briefcase className="size-4 text-brand-purple shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-foreground">
                            Friday Workplace Simulation:{" "}
                            <span className="text-brand-purple">{w.projectTitle}</span>
                          </p>
                          <p className="mt-0.5 text-copy-subtle leading-relaxed">
                            {w.days.find((d) => d.isProject)?.workplaceSimulation ||
                              `Complete real-world simulated workplace assignment: ${w.projectTitle}.`}
                          </p>
                          <p className="mt-1.5 font-mono text-[11px] text-brand-emerald">
                            Portfolio Deliverable: <strong>{w.deliverable}</strong>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: 18 FRIDAY WORKPLACE SIMULATIONS */}
        {syllabusViewTab === "simulations" && (
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {syllabus.weeks.map((w, idx) => {
              const projectDay = w.days.find((d) => d.isProject);

              return (
                <div
                  key={w.week}
                  className="flex flex-col justify-between rounded-2xl border border-line-soft bg-surface-soft p-4 transition-all hover:border-brand-purple/50"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-brand-purple/10 px-2 py-0.5 font-mono text-[10px] font-bold text-brand-purple border border-brand-purple/20">
                        Week {w.week} · Day {w.week * 5}
                      </span>
                      <span className="text-[11px] font-semibold text-brand-cyan">
                        {w.workplaceSkill}
                      </span>
                    </div>

                    <h4 className="mt-2 text-sm font-bold text-foreground">{w.projectTitle}</h4>
                    <p className="mt-1.5 text-xs text-copy-subtle line-clamp-3 leading-relaxed">
                      {projectDay?.workplaceSimulation ||
                        `Real-world industry simulation challenge for ${w.theme}.`}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-line-soft/60 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-copy-subtle">Deliverable:</span>
                      <span className="font-mono font-semibold text-brand-emerald text-[11px]">
                        {w.deliverable}
                      </span>
                    </div>
                    <Link
                      to="/student/labs"
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-surface-elevated border border-line-soft py-2 text-xs font-bold text-brand-cyan hover:border-brand-cyan/60"
                    >
                      <Terminal className="size-3.5" /> Open Sandbox & Build (+50 XP)
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: PLACEMENT PORTFOLIO MATRIX */}
        {syllabusViewTab === "portfolio" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-brand-emerald/30 bg-brand-emerald/5 p-4 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-foreground">
                  18 Industry Verified Portfolio Artifacts
                </h4>
                <p className="text-xs text-copy-subtle mt-0.5">
                  Every Friday mini project produces a tangible code repository, architecture map,
                  or audit sheet proving your ability to do the job.
                </p>
              </div>
              <Chip tone="emerald">18 / 18 Projects Mapped</Chip>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-line-soft bg-surface-soft">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-line-soft text-copy-subtle bg-surface-dark">
                  <tr>
                    <th className="py-3 px-4 font-semibold w-12">#</th>
                    <th className="py-3 px-4 font-semibold">Portfolio Project</th>
                    <th className="py-3 px-4 font-semibold">Workplace Competency Skill</th>
                    <th className="py-3 px-4 font-semibold">Curriculum Phase</th>
                    <th className="py-3 px-4 font-semibold text-right">Interview Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-soft/60 text-foreground">
                  {syllabus.portfolio.map((p) => (
                    <tr key={p.num} className="hover:bg-surface-elevated/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-brand-cyan">
                        P{String(p.num).padStart(2, "0")}
                      </td>
                      <td className="py-3 px-4 font-bold">{p.project}</td>
                      <td className="py-3 px-4">
                        <span className="rounded-lg bg-surface-dark border border-line-soft px-2 py-0.5 font-mono text-[11px] text-brand-purple">
                          {p.workplaceSkill}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-copy-subtle font-mono text-[11px]">
                        {p.phase}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center gap-1 font-semibold text-brand-emerald text-[11px]">
                          <CheckCircle2 className="size-3.5" /> Verified Artifact
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: DAY 90 MASTER CAPSTONE */}
        {syllabusViewTab === "capstone" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-brand-cyan/40 bg-surface-soft p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="rounded-md bg-brand-cyan px-2 py-0.5 text-xs font-bold text-surface-dark">
                    Day 90 Industry Capstone
                  </span>
                  <h3 className="mt-2 text-lg font-bold text-foreground">
                    {syllabus.day90Capstone.title}
                  </h3>
                  <p className="text-xs text-copy-subtle mt-1">
                    {syllabus.day90Capstone.description}
                  </p>
                </div>
                <Chip tone="purple">14-Step Full Lifecycle</Chip>
              </div>

              {/* Architecture Flow */}
              <div className="rounded-xl border border-line-soft bg-surface-dark p-3.5">
                <p className="text-xs font-bold text-foreground mb-2">
                  Capstone Data & Execution Flow:
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {syllabus.day90Capstone.flow.map((node, nIdx) => (
                    <div key={node} className="flex items-center gap-2">
                      <span className="rounded-lg bg-surface-elevated border border-line-soft px-2.5 py-1 font-mono text-[11px] text-brand-cyan">
                        {node}
                      </span>
                      {nIdx < syllabus.day90Capstone.flow.length - 1 && (
                        <ArrowRight className="size-3.5 text-copy-subtle" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 14 Steps Breakdown Grid */}
              <div className="grid gap-3 sm:grid-cols-2">
                {syllabus.day90Capstone.steps.map((s) => (
                  <div
                    key={s.step}
                    className="rounded-xl border border-line-soft bg-surface-dark/70 p-3 flex gap-3 items-start"
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-brand-cyan/10 font-mono text-xs font-bold text-brand-cyan border border-brand-cyan/20">
                      {s.step}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-foreground">{s.title}</p>
                      <p className="mt-0.5 text-[11px] text-copy-subtle leading-relaxed">
                        {s.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <Link
                  to="/student/labs"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple px-5 py-2.5 text-xs font-bold text-surface-dark shadow-md hover:opacity-90"
                >
                  <Terminal className="size-4" /> Launch Day 90 Capstone Simulator
                </Link>
              </div>
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}
