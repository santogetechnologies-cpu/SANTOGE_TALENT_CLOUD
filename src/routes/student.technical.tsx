import { createFileRoute, Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Chip, Meter, PageHeader, Panel, Stat } from "@/components/kit";
import { useAppStore } from "@/lib/app-store";
import { modulesFor, nextSkill } from "@/lib/curriculum";
import { trackById, type TrackId } from "@/lib/tracks";
import { getTrackSyllabus } from "@/lib/syllabus-data";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Award,
  BookOpen,
  Briefcase,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Code2,
  Cpu,
  FileCode2,
  FolderGit2,
  GraduationCap,
  Layers,
  Lock,
  Play,
  Quote,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Terminal,
  Target,
  Zap,
  ExternalLink,
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
import { useLiveStudentProfile, useLiveStudentProgress, isStudentTrackAssigned } from "@/lib/data";

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

  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const requestedTrackFromUrl = searchParams.get("track");

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

  const isRequestedUnassigned =
    Boolean(requestedTrackFromUrl) && !isStudentTrackAssigned(tracks, requestedTrackFromUrl ?? undefined);

  const currentTrackId: TrackId =
    !isRequestedUnassigned && requestedTrackFromUrl && isStudentTrackAssigned(tracks, requestedTrackFromUrl ?? undefined)
      ? (requestedTrackFromUrl as TrackId)
      : isStudentTrackAssigned(tracks, open)
        ? open
        : (tracks[0] ?? "mern");

  const track = trackById(currentTrackId);
  const syllabus = useMemo(() => getTrackSyllabus(track.id), [track.id]);
  const modules = modulesFor(track.id);
  const upcoming = nextSkill(track.id, skills);
  const avg = Math.round(
    tracks.reduce((s, t) => s + calculateTrackPct(t), 0) / Math.max(tracks.length, 1),
  );

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
        action={<Chip tone="emerald">{tracks.length} Admin Assigned</Chip>}
      />

      {/* KPI Stats */}
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Total Curriculum Days" value="90 Days" hint="18 Weeks × 5 Working Days" />
        <Stat
          label="Friday Simulations"
          value="18 Mini Projects"
          hint="Workplace simulations"
        />
        <Stat
          label="Placement Portfolio"
          value="18 Projects + Capstone"
          hint="Interview-ready artifacts"
        />
        <Stat
          label="Competency Mastery"
          value={`${calculateTrackPct(track.id)}%`}
          hint={`Active: ${track.short}`}
        />
      </div>

      {/* Active Enrolled Tracks Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Select Course Track to Inspect Syllabus
          </p>
          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="size-3.5" /> Admin-Assigned Specializations
          </span>
        </div>

        {!tracks || tracks.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center">
            <BookOpen className="mx-auto size-7 text-muted-foreground mb-2" />
            <p className="text-sm font-semibold text-foreground">
              No technical tracks assigned yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
              Your technical learning specializations are assigned centrally by your institution
              administrator via Platform CSV provisioning.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                    isViewing && "border-primary ring-1 ring-primary/20",
                  )}
                  action={<span className="size-2.5 rounded-full" style={{ background: t.accent }} />}
                >
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Mastery</span>
                    <span className="font-mono font-semibold text-foreground">{pct}%</span>
                  </div>
                  <Meter value={pct} accent={t.accent} />

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => setOpen(id)}
                      className={cn(
                        "flex flex-1 items-center justify-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                        isViewing
                          ? "border-primary bg-primary/10 text-primary font-semibold"
                          : "border-border bg-card text-foreground hover:bg-muted",
                      )}
                    >
                      <Play className="size-3" />{" "}
                      {isViewing ? "Viewing Syllabus" : "View Syllabus"}
                    </button>
                    <Link
                      to="/student/labs"
                      className="flex items-center justify-center gap-1 rounded-md bg-card border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                    >
                      <Terminal className="size-3 text-muted-foreground" /> Sandbox
                    </Link>
                  </div>
                </Panel>
              );
            })}
          </div>
        )}
      </div>

      {/* Access Denied Warning when navigating to an unassigned track */}
      {isRequestedUnassigned && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-center space-y-3">
          <div className="mx-auto grid size-12 place-items-center rounded-xl bg-destructive/20 text-destructive">
            <ShieldAlert className="size-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Access Denied: Unassigned Course</h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed">
              You are not authorized to access the syllabus or drills for{" "}
              <span className="font-mono font-semibold text-destructive">"{requestedTrackFromUrl}"</span>.
              Course access is strictly restricted to technical specializations assigned by your
              Platform Administrator.
            </p>
          </div>
          <div className="pt-1">
            <button
              onClick={() => {
                if (tracks[0]) setOpen(tracks[0]);
                void navigate({ to: "/student/technical" });
              }}
              className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Return to Primary Track ({tracks[0] ? trackById(tracks[0]).name : "Dashboard"})
            </button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 90-DAY PLACEMENT SYLLABUS & PROJECT PLAN MASTER SUITE */}
      {/* =================================================================== */}
      {!isRequestedUnassigned && tracks.length > 0 && (
        <Panel
          title={`90-Day Placement Syllabus · ${syllabus.trackName}`}
          subtitle={`Target Role: ${syllabus.targetRole} · Structure: 18 Weeks × 5 Working Days = 90 Learning Days`}
          action={<Chip tone="emerald">{syllabus.weeks.length} Weeks Structured</Chip>}
        >
        {/* Career Progression & Interview Pitch Banner */}
        <div className="grid gap-3 lg:grid-cols-3 mb-6">
          {/* Career Ladder */}
          <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-2.5 lg:col-span-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <Target className="size-4 text-primary" />
              <span>Career Role Progression</span>
            </div>
            <div className="space-y-1.5">
              {syllabus.careerProgression.map((role, rIdx) => (
                <div key={role} className="flex items-center gap-2 text-xs">
                  <span
                    className={cn(
                      "flex size-4.5 shrink-0 items-center justify-center rounded-full text-[10px] font-mono font-medium",
                      rIdx === syllabus.careerProgression.length - 1
                        ? "bg-primary text-primary-foreground font-bold"
                        : "bg-card text-muted-foreground border border-border",
                    )}
                  >
                    {rIdx + 1}
                  </span>
                  <span
                    className={cn(
                      "font-medium",
                      rIdx === syllabus.careerProgression.length - 1
                        ? "text-primary font-semibold"
                        : "text-muted-foreground",
                    )}
                  >
                    {role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Guaranteed Interview Pitch Script */}
          <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-2 lg:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <Quote className="size-4 text-primary" />
                <span>Placement Interview Value Script</span>
              </div>
              <p className="mt-1.5 text-xs italic text-foreground leading-relaxed">
                "{syllabus.interviewPitch}"
              </p>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-2 text-[11px] text-muted-foreground">
              <span>Verified through 18 mini projects + Day 90 industry capstone.</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">✓ Placement Ready</span>
            </div>
          </div>
        </div>

        {/* Syllabus View Mode Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSyllabusViewTab("90days")}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer border",
                syllabusViewTab === "90days"
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted border-border",
              )}
            >
              <Calendar className="size-3.5" /> 90-Day Schedule (18 Weeks)
            </button>
            <button
              onClick={() => setSyllabusViewTab("simulations")}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer border",
                syllabusViewTab === "simulations"
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted border-border",
              )}
            >
              <Briefcase className="size-3.5" /> 18 Friday Workplace Simulations
            </button>
            <button
              onClick={() => setSyllabusViewTab("portfolio")}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer border",
                syllabusViewTab === "portfolio"
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted border-border",
              )}
            >
              <Award className="size-3.5" /> Placement Portfolio (18 Projects)
            </button>
            <button
              onClick={() => setSyllabusViewTab("capstone")}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer border",
                syllabusViewTab === "capstone"
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted border-border",
              )}
            >
              <Sparkles className="size-3.5" /> Day 90 Master Capstone
            </button>
          </div>

          {syllabusViewTab === "90days" && (
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs">
                <Search className="size-3.5 text-muted-foreground" />
                <input
                  value={syllabusSearch}
                  onChange={(e) => setSyllabusSearch(e.target.value)}
                  placeholder="Search day or topic…"
                  className="w-32 sm:w-40 bg-transparent outline-none text-foreground text-xs placeholder:text-muted-foreground"
                />
              </label>
            </div>
          )}
        </div>

        {/* Phase Filter Bar */}
        {syllabusViewTab === "90days" && (
          <div className="my-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase mr-1">
              Phase:
            </span>
            <button
              onClick={() => setSelectedPhaseFilter("all")}
              className={cn(
                "rounded-md px-2 py-0.5 text-xs font-medium transition-colors border cursor-pointer",
                selectedPhaseFilter === "all"
                  ? "border-primary bg-primary/10 text-primary font-semibold"
                  : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              All 18 Weeks
            </button>
            {syllabus.phases.map((p) => (
              <button
                key={p.phaseNumber}
                onClick={() => setSelectedPhaseFilter(p.phaseNumber)}
                className={cn(
                  "rounded-md px-2 py-0.5 text-xs font-medium transition-colors border cursor-pointer",
                  selectedPhaseFilter === p.phaseNumber
                    ? "border-primary bg-primary/10 text-primary font-semibold"
                    : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                Phase {p.phaseNumber}: {p.title.split(" ")[0]} ({p.weeksRange})
              </button>
            ))}
          </div>
        )}

        {/* TAB 1: 90-DAY DAY-BY-DAY CURRICULUM ACCORDIONS */}
        {syllabusViewTab === "90days" && (
          <div className="space-y-3">
            {filteredWeeks.map((w) => {
              const isOpen = Boolean(expandedWeeks[w.week]);
              const phaseNum =
                w.week <= 5 ? 1 : w.week <= 10 ? 2 : w.week <= 14 ? 3 : w.week <= 16 ? 4 : 5;

              return (
                <div
                  key={w.week}
                  className={cn(
                    "rounded-lg border transition-all overflow-hidden bg-card",
                    isOpen
                      ? "border-border shadow-xs"
                      : "border-border hover:border-border/80",
                  )}
                >
                  {/* Week Header */}
                  <div
                    onClick={() => toggleWeekExpand(w.week)}
                    className="flex flex-wrap items-center justify-between p-3.5 cursor-pointer select-none gap-3 bg-muted/20"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex size-7 items-center justify-center rounded-md bg-muted font-mono text-xs font-bold text-foreground border border-border">
                        W{w.week}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-foreground">{w.title}</h4>
                          <span className="rounded bg-card px-1.5 py-0.2 text-[10px] font-mono text-muted-foreground border border-border">
                            Phase {phaseNum}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Theme: <span className="text-foreground font-medium">{w.theme}</span> ·
                          Friday Mini Project:{" "}
                          <span className="text-foreground font-semibold">{w.projectTitle}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="rounded bg-card px-2 py-0.5 text-[11px] font-medium text-muted-foreground border border-border">
                        Skill: {w.workplaceSkill}
                      </span>
                      {isOpen ? (
                        <ChevronDown className="size-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="size-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Days 1 to 5 Table / Cards */}
                  {isOpen && (
                    <div className="border-t border-border p-3.5 space-y-2.5 bg-card">
                      <div className="grid gap-2 sm:grid-cols-5">
                        {w.days.map((d) => {
                          const isFriday = d.day % 5 === 0;

                          return (
                            <div
                              key={d.day}
                              className={cn(
                                "rounded-md border p-3 flex flex-col justify-between transition-colors",
                                isFriday
                                  ? "border-primary/40 bg-primary/5 sm:col-span-1"
                                  : "border-border bg-muted/10",
                              )}
                            >
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <span
                                    className={cn(
                                      "rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold",
                                      isFriday
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground",
                                    )}
                                  >
                                    Day {d.day}
                                  </span>
                                  <span className="font-mono text-[10px] text-muted-foreground">
                                    {isFriday ? "30m Project" : "20 + 10m"}
                                  </span>
                                </div>

                                <p
                                  className={cn(
                                    "text-xs font-semibold mt-1",
                                    isFriday ? "text-primary" : "text-foreground",
                                  )}
                                >
                                  {d.topic}
                                </p>
                              </div>

                              <div className="mt-2.5 pt-2 border-t border-border/60">
                                <p className="text-[11px] text-muted-foreground line-clamp-2">
                                  {d.practice}
                                </p>
                                {d.deliverable && (
                                  <div className="mt-1.5 rounded bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-foreground border border-border">
                                    {d.deliverable}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Friday Workplace Simulation Brief */}
                      <div className="mt-2 rounded-md border border-border bg-muted/20 p-3 flex items-start gap-2.5 text-xs">
                        <Briefcase className="size-4 text-primary shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-foreground">
                            Friday Workplace Simulation:{" "}
                            <span>{w.projectTitle}</span>
                          </p>
                          <p className="mt-0.5 text-muted-foreground leading-relaxed">
                            {w.days.find((d) => d.isProject)?.workplaceSimulation ||
                              `Complete real-world simulated workplace assignment: ${w.projectTitle}.`}
                          </p>
                          <p className="mt-1 font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
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
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {syllabus.weeks.map((w) => {
              const projectDay = w.days.find((d) => d.isProject);

              return (
                <div
                  key={w.week}
                  className="flex flex-col justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40 shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-muted px-2 py-0.5 font-mono text-[10px] font-semibold text-foreground border border-border">
                        Week {w.week} · Day {w.week * 5}
                      </span>
                      <span className="text-[11px] font-medium text-muted-foreground">
                        {w.workplaceSkill}
                      </span>
                    </div>

                    <h4 className="mt-2 text-sm font-semibold text-foreground">{w.projectTitle}</h4>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                      {projectDay?.workplaceSimulation ||
                        `Real-world industry simulation challenge for ${w.theme}.`}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Deliverable:</span>
                      <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400 text-[11px]">
                        {w.deliverable}
                      </span>
                    </div>
                    <Link
                      to="/student/labs"
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-card border border-border py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                    >
                      <Terminal className="size-3.5 text-muted-foreground" /> Open Sandbox (+50 XP)
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: PLACEMENT PORTFOLIO MATRIX */}
        {syllabusViewTab === "portfolio" && (
          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-muted/20 p-3.5 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-foreground">
                  18 Industry Verified Portfolio Artifacts
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Every Friday mini project produces a tangible code repository, architecture map,
                  or audit sheet proving your competency.
                </p>
              </div>
              <Chip tone="emerald">18 / 18 Projects</Chip>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border text-muted-foreground bg-muted/30">
                  <tr>
                    <th className="py-2.5 px-3.5 font-medium w-12">#</th>
                    <th className="py-2.5 px-3.5 font-medium">Portfolio Project</th>
                    <th className="py-2.5 px-3.5 font-medium">Workplace Competency</th>
                    <th className="py-2.5 px-3.5 font-medium">Curriculum Phase</th>
                    <th className="py-2.5 px-3.5 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-foreground">
                  {syllabus.portfolio.map((p) => (
                    <tr key={p.num} className="hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 px-3.5 font-mono font-semibold text-muted-foreground">
                        P{String(p.num).padStart(2, "0")}
                      </td>
                      <td className="py-2.5 px-3.5 font-semibold">{p.project}</td>
                      <td className="py-2.5 px-3.5">
                        <span className="rounded bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground border border-border">
                          {p.workplaceSkill}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 text-muted-foreground font-mono text-[11px]">
                        {p.phase}
                      </td>
                      <td className="py-2.5 px-3.5 text-right">
                        <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400 text-[11px]">
                          <CheckCircle2 className="size-3" /> Verified
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
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-5 space-y-3.5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="rounded bg-primary/10 border border-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">
                    Day 90 Industry Capstone
                  </span>
                  <h3 className="mt-2 text-base font-semibold text-foreground">
                    {syllabus.day90Capstone.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {syllabus.day90Capstone.description}
                  </p>
                </div>
                <Chip tone="purple">14-Step Lifecycle</Chip>
              </div>

              {/* Architecture Flow */}
              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <p className="text-xs font-semibold text-foreground mb-1.5">
                  Capstone Data & Execution Flow:
                </p>
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  {syllabus.day90Capstone.flow.map((node, nIdx) => (
                    <div key={node} className="flex items-center gap-1.5">
                      <span className="rounded bg-card border border-border px-2 py-0.5 font-mono text-[11px] text-foreground">
                        {node}
                      </span>
                      {nIdx < syllabus.day90Capstone.flow.length - 1 && (
                        <ArrowRight className="size-3 text-muted-foreground" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 14 Steps Breakdown Grid */}
              <div className="grid gap-2.5 sm:grid-cols-2">
                {syllabus.day90Capstone.steps.map((s) => (
                  <div
                    key={s.step}
                    className="rounded-md border border-border bg-muted/10 p-3 flex gap-2.5 items-start"
                  >
                    <span className="flex size-5 shrink-0 items-center justify-center rounded bg-muted font-mono text-xs font-bold text-foreground border border-border">
                      {s.step}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{s.title}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground leading-relaxed">
                        {s.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2 border-t border-border">
                <Link
                  to="/student/labs"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
                >
                  <Terminal className="size-3.5" /> Launch Capstone Simulator
                </Link>
              </div>
            </div>
          </div>
        )}
      </Panel>
    )}
  </div>
);
}


