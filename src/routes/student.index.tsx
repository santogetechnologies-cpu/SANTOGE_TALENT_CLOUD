import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Chip, Meter, PageHeader, Panel, Stat } from "@/components/kit";
import { useAppStore } from "@/lib/app-store";
import { TRACKS, trackById, type TrackId } from "@/lib/tracks";
import { getAcceleratorDay, type AcceleratorDay } from "@/lib/placement-accelerator-data";
import { getTrackSyllabus } from "@/lib/syllabus-data";
import {
  CheckCircle2,
  Circle,
  Flame,
  Zap,
  Sparkles,
  ArrowRight,
  Code2,
  Lock,
  Unlock,
  BookOpen,
  Calendar,
  Layers,
  Terminal,
  Mic,
  Video,
  Play,
  Calculator,
  FileCheck2,
  Trophy,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  Filter,
  Check,
  Timer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/student/")({
  head: () => ({
    meta: [
      { title: "Today's Learning & Drills — SantoGe Talent Cloud" },
      {
        name: "description",
        content:
          "Daily To-Do backlog and Twin 30-Minute learning routine: Placement Accelerator drills and Technical Sandbox labs with full Day 1 to 90 completion tracking.",
      },
      { property: "og:title", content: "Today's Learning & Drills — SantoGe Talent Cloud" },
      {
        property: "og:description",
        content: "Track your daily To-Do backlog from Day 1 to Day 90 with instant practice drills.",
      },
    ],
  }),
  component: TodayLearningPage,
});

export function getScoreTier(score: number) {
  if (score >= 850) return { label: "Elite Tier", tone: "emerald" as const, desc: "Top 5% · Direct Placement Shortlist" };
  if (score >= 700) return { label: "Advanced", tone: "cyan" as const, desc: "High Requisition Matching Rate" };
  if (score >= 550) return { label: "Intermediate", tone: "purple" as const, desc: "Standard Campus Drive Eligibility" };
  return { label: "Foundational", tone: "amber" as const, desc: "Accelerating Core Competency" };
}

type DrillTab = "skills" | "placement";
type FilterMode = "all" | "pending" | "completed";

function TodayLearningPage() {
  const store = useAppStore();
  const cohortDay = store.placementDay || 1;
  const [selectedDayNum, setSelectedDayNum] = useState<number>(cohortDay);
  const [activeDrillTab, setActiveDrillTab] = useState<DrillTab>("skills");
  const [filterMode, setFilterMode] = useState<FilterMode>("pending");

  // Primary active technical track
  const primaryTrackId: TrackId = store.activeTracks[0] ?? "mern";
  const primaryTrack = trackById(primaryTrackId);
  const technicalSyllabus = useMemo(() => getTrackSyllabus(primaryTrackId), [primaryTrackId]);

  // Selected Day Data
  const placementPlan: AcceleratorDay = useMemo(() => getAcceleratorDay(selectedDayNum), [selectedDayNum]);
  const weekIdx = Math.floor((selectedDayNum - 1) / 5);
  const dayInWeekIdx = (selectedDayNum - 1) % 5;
  const currentWeekPlan = technicalSyllabus.weeks[weekIdx] || technicalSyllabus.weeks[0]!;
  const currentTechDay = currentWeekPlan.days[dayInWeekIdx] || currentWeekPlan.days[0]!;

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [pitchRecorded, setPitchRecorded] = useState(false);
  const [pitchLoading, setPitchLoading] = useState(false);

  // Chronological Day-by-Day Days calculation (Day 1 to current cohort day)
  const daysList = useMemo(() => {
    return Array.from({ length: Math.max(cohortDay, 1) }, (_, i) => {
      const dNum = i + 1;
      const isPlacementDone = store.attendance.includes(dNum);
      const isTechDone = (store.completedTechDays || []).includes(dNum);
      const isFullyFinished = isPlacementDone && isTechDone;

      const accDay = getAcceleratorDay(dNum);
      const wI = Math.floor(i / 5);
      const dI = i % 5;
      const wPlan = technicalSyllabus.weeks[wI] || technicalSyllabus.weeks[0]!;
      const tDay = wPlan.days[dI] || wPlan.days[0]!;

      return {
        day: dNum,
        week: Math.floor(i / 5) + 1,
        dayOfWeek: accDay.dayOfWeek,
        isPlacementDone,
        isTechDone,
        isFullyFinished,
        placementTheme: accDay.theme,
        techTopic: tDay.topic,
        isFriday: dNum % 5 === 0,
      };
    });
  }, [cohortDay, store.attendance, store.completedTechDays, technicalSyllabus]);

  const filteredDays = useMemo(() => {
    if (filterMode === "pending") return daysList.filter((d) => !d.isFullyFinished);
    if (filterMode === "completed") return daysList.filter((d) => d.isFullyFinished);
    return daysList;
  }, [daysList, filterMode]);

  const pendingCount = daysList.filter((d) => !d.isFullyFinished).length;
  const finishedCount = daysList.filter((d) => d.isFullyFinished).length;
  const tier = getScoreTier(store.talentScore);

  const handleSelectDayAndTab = (dayNum: number, tab: DrillTab) => {
    setSelectedDayNum(dayNum);
    setActiveDrillTab(tab);
    setAnswers({});
    setPitchRecorded(false);
    toast.info(`Loaded Day ${dayNum} for ${tab === "skills" ? "Technical Skill Lab" : "Placement Accelerator"}`);
    // Smooth scroll down to the drill section
    const el = document.getElementById("daily-drill-workspace");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleRecordVoicePitch = () => {
    setPitchLoading(true);
    setTimeout(() => {
      setPitchLoading(false);
      setPitchRecorded(true);
      store.completeDailyStep("practice");
      store.completePlacementDay(selectedDayNum);
      toast.success(`Day ${selectedDayNum} Placement Accelerator verified (+25 XP)!`, {
        description: "Voice pitch STAR score recorded · Attendance updated to finished.",
      });
    }, 1500);
  };

  const handleCompleteTechnicalLab = () => {
    store.completeTechDay(selectedDayNum);
    toast.success(`Day ${selectedDayNum} ${primaryTrack.name} Lab verified (+50 XP)!`, {
      description: "Technical exercise passed automated tests · To-Do updated to finished.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Today's Learning & Exercises"
        subtitle={`18 Weeks × 5 Working Days = 90 Days · Current Cohort Day: Day ${cohortDay}/90 · Daily To-Do Backlog & Twin 30-Min Exercises.`}
        action={
          <div className="flex items-center gap-2">
            <Chip tone="amber">🔥 Day {store.streak} Streak</Chip>
            <Chip tone={tier.tone}>{tier.label} ({store.talentScore}/1000)</Chip>
          </div>
        }
      />

      {/* KPI Overview Banner */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat
          label="Pending To-Do Days"
          value={pendingCount === 0 ? "0 Days (Caught up!)" : `${pendingCount} Days Pending`}
          accent={pendingCount === 0 ? "var(--brand-emerald)" : "var(--brand-rose)"}
          hint={pendingCount === 0 ? "All days up to date" : "Needs completion to clear Dual Gate"}
        />
        <Stat
          label="Completed Days"
          value={`${finishedCount} / ${cohortDay} Days`}
          accent="var(--brand-emerald)"
          hint="Both Placement & Skill finished"
        />
        <Stat
          label="Primary Track"
          value={primaryTrack.name}
          accent="var(--brand-cyan)"
          hint="100% Dual Gate requirement"
        />
        <Stat
          label="Talent Score"
          value={`${store.talentScore}/1000`}
          accent="var(--brand-purple)"
          hint={tier.desc}
        />
      </div>

      {/* =================================================================== */}
      {/* SECTION 1: CHRONOLOGICAL DAY-BY-DAY TO-DO / BACKLOG TASK MATRIX */}
      {/* =================================================================== */}
      <Panel
        title="Daily Learning & To-Do Backlog Matrix (Day 1 to Today)"
        subtitle="Every day requires completing BOTH Placement Accelerator and Technical Skill. Any missed day shows as Pending / To-Do."
        action={
          <div className="flex items-center gap-1.5 rounded-xl border border-line-soft bg-surface-dark p-1 text-xs">
            <button
              onClick={() => setFilterMode("pending")}
              className={cn(
                "rounded-lg px-2.5 py-1 font-bold transition-colors",
                filterMode === "pending"
                  ? "bg-brand-rose/20 text-brand-rose border border-brand-rose/40"
                  : "text-copy-subtle hover:text-foreground"
              )}
            >
              Pending To-Dos ({pendingCount})
            </button>
            <button
              onClick={() => setFilterMode("all")}
              className={cn(
                "rounded-lg px-2.5 py-1 font-bold transition-colors",
                filterMode === "all"
                  ? "bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40"
                  : "text-copy-subtle hover:text-foreground"
              )}
            >
              All Days ({daysList.length})
            </button>
            <button
              onClick={() => setFilterMode("completed")}
              className={cn(
                "rounded-lg px-2.5 py-1 font-bold transition-colors",
                filterMode === "completed"
                  ? "bg-brand-emerald/20 text-brand-emerald border border-brand-emerald/40"
                  : "text-copy-subtle hover:text-foreground"
              )}
            >
              Finished ({finishedCount})
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          {filteredDays.length === 0 ? (
            <div className="rounded-2xl border border-brand-emerald/40 bg-brand-emerald/5 p-6 text-center space-y-2">
              <CheckCircle2 className="size-8 text-brand-emerald mx-auto" />
              <h4 className="text-sm font-bold text-foreground">Outstanding Job! Zero Pending Backlog</h4>
              <p className="text-xs text-copy-subtle">
                You have completed all daily placement accelerator drills and technical skill sandbox labs up to Day {cohortDay}.
              </p>
            </div>
          ) : (
            filteredDays.map((d) => {
              const isSelected = selectedDayNum === d.day;

              return (
                <div
                  key={d.day}
                  className={cn(
                    "flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl border p-4 transition-all text-xs bg-surface-soft/80",
                    isSelected
                      ? "border-brand-cyan/80 bg-brand-cyan/5 shadow-md ring-1 ring-brand-cyan/40"
                      : d.isFullyFinished
                      ? "border-line-soft opacity-85 hover:opacity-100"
                      : "border-brand-rose/40 hover:border-brand-rose/70"
                  )}
                >
                  {/* Day Label & Badge */}
                  <div className="flex items-start sm:items-center gap-3 min-w-[200px]">
                    <div className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-bold border",
                      d.isFullyFinished
                        ? "bg-brand-emerald/15 text-brand-emerald border-brand-emerald/40"
                        : "bg-brand-rose/15 text-brand-rose border-brand-rose/40"
                    )}>
                      D{d.day}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm">Day {d.day}</span>
                        <span className="text-[10px] font-mono text-copy-subtle">({d.dayOfWeek})</span>
                        {d.isFriday && <span className="rounded bg-brand-purple/20 px-1.5 py-0.5 text-[9px] font-mono font-bold text-brand-purple">Friday Sim</span>}
                      </div>
                      <div className="mt-0.5">
                        {d.isFullyFinished ? (
                          <span className="inline-flex items-center gap-1 font-bold text-brand-emerald text-[11px]">
                            <CheckCircle2 className="size-3.5" /> Finished &amp; Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-bold text-brand-rose text-[11px]">
                            <AlertCircle className="size-3.5" /> Pending To-Do
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Two Sub-Tasks: Placement & Skill */}
                  <div className="grid gap-2 sm:grid-cols-2 flex-1">
                    {/* Sub-Task 1: Placement Accelerator */}
                    <div className={cn(
                      "flex items-center justify-between rounded-xl border p-2.5",
                      d.isPlacementDone ? "border-line-soft bg-surface-dark/70" : "border-brand-purple/30 bg-brand-purple/5"
                    )}>
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <Timer className="size-3 text-brand-purple shrink-0" />
                          <span className="font-semibold text-foreground truncate">Placement 30m</span>
                        </div>
                        <p className="text-[10px] text-copy-subtle truncate mt-0.5">{d.placementTheme}</p>
                      </div>

                      <button
                        onClick={() => handleSelectDayAndTab(d.day, "placement")}
                        className={cn(
                          "shrink-0 rounded-lg px-2.5 py-1 font-mono text-[10px] font-bold transition-colors border",
                          d.isPlacementDone
                            ? "border-brand-emerald/40 bg-brand-emerald/10 text-brand-emerald"
                            : "border-brand-purple/60 bg-brand-purple text-surface-dark hover:opacity-90"
                        )}
                      >
                        {d.isPlacementDone ? "Done ✓" : "To-Do →"}
                      </button>
                    </div>

                    {/* Sub-Task 2: Technical Skill */}
                    <div className={cn(
                      "flex items-center justify-between rounded-xl border p-2.5",
                      d.isTechDone ? "border-line-soft bg-surface-dark/70" : "border-brand-cyan/30 bg-brand-cyan/5"
                    )}>
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <Code2 className="size-3 text-brand-cyan shrink-0" />
                          <span className="font-semibold text-foreground truncate">{primaryTrack.short} 30m</span>
                        </div>
                        <p className="text-[10px] text-copy-subtle truncate mt-0.5">{d.techTopic}</p>
                      </div>

                      <button
                        onClick={() => handleSelectDayAndTab(d.day, "skills")}
                        className={cn(
                          "shrink-0 rounded-lg px-2.5 py-1 font-mono text-[10px] font-bold transition-colors border",
                          d.isTechDone
                            ? "border-brand-emerald/40 bg-brand-emerald/10 text-brand-emerald"
                            : "border-brand-cyan/60 bg-brand-cyan text-surface-dark hover:opacity-90"
                        )}
                      >
                        {d.isTechDone ? "Done ✓" : "To-Do →"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Panel>

      {/* =================================================================== */}
      {/* SECTION 2: THE 2 EXERCISE TABS (SKILLS & PLACEMENT DRILLS) */}
      {/* =================================================================== */}
      <div id="daily-drill-workspace" className="space-y-4 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft pb-3">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-brand-cyan px-2 py-0.5 text-xs font-bold text-surface-dark">
              Day {selectedDayNum} Workspace
            </span>
            <span className="text-xs text-copy-subtle font-medium">
              Executing exercises for Day {selectedDayNum} ({placementPlan.dayOfWeek})
            </span>
          </div>

          {/* Tab Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveDrillTab("skills")}
              className={cn(
                "flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all border",
                activeDrillTab === "skills"
                  ? "border-brand-cyan/60 bg-brand-cyan text-surface-dark shadow-sm"
                  : "border-line-soft bg-surface-soft text-copy-subtle hover:text-foreground"
              )}
            >
              <Code2 className="size-4" />
              1. Technical Skill &amp; Sandbox Lab
            </button>

            <button
              onClick={() => setActiveDrillTab("placement")}
              className={cn(
                "flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all border",
                activeDrillTab === "placement"
                  ? "border-brand-purple/60 bg-brand-purple text-surface-dark shadow-sm"
                  : "border-line-soft bg-surface-soft text-copy-subtle hover:text-foreground"
              )}
            >
              <Timer className="size-4" />
              2. Placement Accelerator Drill &amp; Voice Pitch
            </button>
          </div>
        </div>

        {/* TAB 1: TECHNICAL SKILL & SANDBOX LAB */}
        {activeDrillTab === "skills" && (
          <Panel
            title={`Day ${selectedDayNum} Technical Practice · ${primaryTrack.name}`}
            subtitle={`Week ${weekIdx + 1}: ${currentWeekPlan.theme} · 100% In-Browser Code & Lab Simulation`}
            action={
              (store.completedTechDays || []).includes(selectedDayNum) ? (
                <Chip tone="emerald">Lab Verified ✓</Chip>
              ) : (
                <Chip tone="amber">Pending Submission</Chip>
              )
            }
          >
            <div className="space-y-6 text-xs">
              {/* 20m Concept Card */}
              <div className="rounded-2xl border border-line-soft bg-surface-soft p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-brand-cyan flex items-center gap-1.5 text-sm">
                    <BookOpen className="size-4" /> 1. Concept Card (20 Mins)
                  </span>
                  <span className="rounded bg-surface-dark px-2 py-0.5 font-mono text-[10px] text-copy-subtle border border-line-soft">
                    Day {selectedDayNum}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-foreground">{currentTechDay.topic}</h4>
                <p className="text-copy-subtle leading-relaxed">{currentTechDay.practice}</p>
                <div className="pt-2 border-t border-line-soft/60 flex items-center justify-between text-[11px] text-copy-subtle">
                  <span>Theme: <strong className="text-foreground">{currentWeekPlan.theme}</strong></span>
                  <span className="font-mono text-brand-cyan">Workplace Skill: {currentWeekPlan.workplaceSkill}</span>
                </div>
              </div>

              {/* 10m In-Browser Hands-on Sandbox */}
              <div className="rounded-2xl border border-brand-cyan/30 bg-surface-soft p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-brand-cyan flex items-center gap-1.5 text-sm">
                    <Terminal className="size-4" /> 2. Hands-on Interactive Sandbox Simulation (10 Mins)
                  </span>
                  <span className="font-mono text-xs font-bold text-brand-amber">+50 XP</span>
                </div>
                <p className="text-copy-subtle leading-relaxed">
                  Execute the code test runner or runtime simulator for <strong>{primaryTrack.name}</strong>. Solve today's practical challenge and submit to complete your To-Do.
                </p>

                <div className="rounded-xl bg-surface-dark p-4 border border-line-soft font-mono text-xs text-copy-subtle space-y-1.5">
                  <p className="text-foreground font-bold flex items-center gap-2">
                    <Terminal className="size-3.5 text-brand-cyan" /> Simulator: {primaryTrack.labTitle}
                  </p>
                  <p className="text-[11px] text-copy-subtle">Virtual WebAssembly runner ready · Automated test validation on submit.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link
                    to="/student/labs"
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-surface-elevated border border-line-soft py-3 text-xs font-bold text-brand-cyan hover:border-brand-cyan/60 transition-colors"
                  >
                    <Terminal className="size-4" /> Open Full Terminal Simulator
                  </Link>

                  <button
                    onClick={handleCompleteTechnicalLab}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-brand-cyan py-3 text-xs font-bold text-surface-dark hover:opacity-90 transition-opacity shadow-sm"
                  >
                    <Check className="size-4" /> Mark Day {selectedDayNum} Lab Completed (+50 XP)
                  </button>
                </div>
              </div>
            </div>
          </Panel>
        )}

        {/* TAB 2: PLACEMENT ACCELERATOR DRILL & VOICE PITCH */}
        {activeDrillTab === "placement" && (
          <Panel
            title={`Day ${selectedDayNum} Placement Accelerator · ${placementPlan.theme}`}
            subtitle="10m English + 10m Aptitude + 10m In-App Guided Practice with AI Voice Pitch"
            action={
              store.attendance.includes(selectedDayNum) ? (
                <Chip tone="emerald">Attendance Recorded ✓</Chip>
              ) : (
                <Chip tone="purple">Pending Practice</Chip>
              )
            }
          >
            <div className="space-y-6 text-xs">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* 10m English Lesson */}
                <div className="rounded-2xl border border-brand-cyan/30 bg-surface-soft p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-brand-cyan flex items-center gap-1.5 text-sm">
                      <Video className="size-4" /> 1. 10m English Broadcast
                    </span>
                    <span className="text-[10px] font-mono text-copy-subtle">06:00 IST</span>
                  </div>
                  <h4 className="text-xs font-bold text-foreground">{placementPlan.english.title}</h4>
                  <p className="text-copy-subtle leading-relaxed">{placementPlan.english.instructorBrief}</p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {placementPlan.english.keyVocabulary.map((v) => (
                      <span key={v} className="rounded bg-surface-dark px-1.5 py-0.5 text-[10px] font-mono text-copy-subtle border border-line-soft">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 10m Aptitude Lesson */}
                <div className="rounded-2xl border border-brand-purple/30 bg-surface-soft p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-brand-purple flex items-center gap-1.5 text-sm">
                      <Calculator className="size-4" /> 2. 10m Aptitude Drill
                    </span>
                    <span className="text-[10px] font-mono text-copy-subtle">06:00 IST</span>
                  </div>
                  <h4 className="text-xs font-bold text-foreground">{placementPlan.aptitude.title}</h4>
                  <p className="text-copy-subtle leading-relaxed">{placementPlan.aptitude.instructorBrief}</p>
                  <div className="rounded-lg bg-surface-dark p-2 text-[11px] font-mono text-brand-purple border border-line-soft">
                    Rule: {placementPlan.aptitude.formulaShortcut}
                  </div>
                </div>
              </div>

              {/* 10m Guided Practice & AI Voice Pitch */}
              <div className="rounded-2xl border border-brand-emerald/30 bg-surface-soft p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-brand-emerald flex items-center gap-1.5 text-sm">
                    <FileCheck2 className="size-4" /> 3. In-App Practice MCQs &amp; 60s Voice Pitch
                  </span>
                  <span className="font-mono text-xs font-bold text-brand-amber">+25 XP</span>
                </div>

                {/* Sample MCQ */}
                {placementPlan.practice.mcqs[0] && (
                  <div className="rounded-xl bg-surface-dark p-4 border border-line-soft space-y-2.5">
                    <p className="font-bold text-foreground text-xs">
                      <span className="text-brand-cyan font-mono">Q1.</span> {placementPlan.practice.mcqs[0].q}
                    </p>
                    <div className="grid gap-1.5 sm:grid-cols-2">
                      {placementPlan.practice.mcqs[0].options.map((opt, oi) => {
                        const isPicked = answers[0] === oi;
                        const isRight = oi === placementPlan.practice.mcqs[0]?.answer;
                        return (
                          <button
                            key={opt}
                            onClick={() => {
                              setAnswers((prev) => ({ ...prev, [0]: oi }));
                              if (isRight) toast.success("Correct answer!");
                            }}
                            className={cn(
                              "rounded-lg border p-2 text-left text-xs transition-colors",
                              isPicked
                                ? isRight
                                  ? "border-brand-emerald bg-brand-emerald/15 text-brand-emerald font-bold"
                                  : "border-brand-rose bg-brand-rose/15 text-brand-rose"
                                : "border-line-soft bg-surface-elevated text-copy-subtle hover:text-foreground"
                            )}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 60s Voice Pitch Drill */}
                <div className="rounded-xl bg-surface-dark p-4 border border-line-soft space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">🎙️ 60-Second AI Voice Pitch Challenge:</span>
                    <span className="rounded bg-brand-purple/20 px-2 py-0.5 text-[10px] font-mono text-brand-purple font-bold">
                      STAR Speech Rubric
                    </span>
                  </div>
                  <p className="text-copy-subtle text-xs leading-relaxed font-medium">
                    "{placementPlan.practice.voicePrompt.prompt}"
                  </p>

                  <button
                    onClick={handleRecordVoicePitch}
                    disabled={pitchLoading || pitchRecorded}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple py-3 text-xs font-bold text-surface-dark shadow-md hover:opacity-90 disabled:opacity-60 transition-opacity"
                  >
                    <Mic className="size-4" />
                    {pitchLoading
                      ? "Recording & Analyzing STAR Speech Cadence…"
                      : pitchRecorded
                      ? "Voice Pitch Verified · Placement Marked Finished ✓"
                      : `Record 60s Voice Pitch & Complete Day ${selectedDayNum} (+25 XP)`}
                  </button>
                </div>
              </div>
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}
