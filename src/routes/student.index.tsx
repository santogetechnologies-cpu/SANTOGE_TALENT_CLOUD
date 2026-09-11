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
        content:
          "Track your daily To-Do backlog from Day 1 to Day 90 with instant practice drills.",
      },
    ],
  }),
  component: TodayLearningPage,
});

export function getScoreTier(score: number) {
  if (score >= 850)
    return {
      label: "Elite Tier",
      tone: "emerald" as const,
      desc: "Top 5% · Direct Placement Shortlist",
    };
  if (score >= 700)
    return { label: "Advanced", tone: "cyan" as const, desc: "High Requisition Matching Rate" };
  if (score >= 550)
    return {
      label: "Intermediate",
      tone: "purple" as const,
      desc: "Standard Campus Drive Eligibility",
    };
  return { label: "Foundational", tone: "amber" as const, desc: "Accelerating Core Competency" };
}

type DrillTab = "skills" | "placement";
type FilterMode = "all" | "pending" | "completed";

import { useQueryClient } from "@tanstack/react-query";
import {
  useLiveStudentProfile,
  useLiveStudentProgress,
  completeLivePlacementDay,
  completeLiveTechnicalDay,
  completeLiveDailyStep,
} from "@/lib/data";

function TodayLearningPage() {
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

  const cohortDay = liveProfileData?.profile?.placement_day ?? store.placementDay ?? 1;

  const activeTracks: TrackId[] = useMemo(
    () => liveProfileData?.tracks || store.activeTracks,
    [liveProfileData?.tracks, store.activeTracks],
  );

  const streak = liveProfileData?.profile?.streak ?? store.streak;
  const talentScore = liveProfileData?.profile?.talent_score ?? store.talentScore;
  const attendance = useMemo(
    () => liveProgressData?.attendance || store.attendance,
    [liveProgressData?.attendance, store.attendance],
  );
  const completedTechDays = useMemo(
    () => liveProgressData?.completedTechDays || store.completedTechDays || [],
    [liveProgressData?.completedTechDays, store.completedTechDays],
  );

  const [selectedDayNum, setSelectedDayNum] = useState<number>(cohortDay);
  const [activeDrillTab, setActiveDrillTab] = useState<DrillTab>("skills");
  const [filterMode, setFilterMode] = useState<FilterMode>("pending");

  // Primary active technical track
  const primaryTrackId: TrackId = activeTracks[0] ?? "mern";
  const primaryTrack = trackById(primaryTrackId);
  const technicalSyllabus = useMemo(() => getTrackSyllabus(primaryTrackId), [primaryTrackId]);

  // Selected Day Data
  const placementPlan: AcceleratorDay = useMemo(
    () => getAcceleratorDay(selectedDayNum),
    [selectedDayNum],
  );
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
      const isPlacementDone = attendance.includes(dNum);
      const isTechDone = completedTechDays.includes(dNum);
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
  }, [cohortDay, attendance, completedTechDays, technicalSyllabus]);

  const filteredDays = useMemo(() => {
    if (filterMode === "pending") return daysList.filter((d) => !d.isFullyFinished);
    if (filterMode === "completed") return daysList.filter((d) => d.isFullyFinished);
    return daysList;
  }, [daysList, filterMode]);

  const pendingCount = daysList.filter((d) => !d.isFullyFinished).length;
  const finishedCount = daysList.filter((d) => d.isFullyFinished).length;
  const tier = getScoreTier(talentScore);

  const handleSelectDayAndTab = (dayNum: number, tab: DrillTab) => {
    setSelectedDayNum(dayNum);
    setActiveDrillTab(tab);
    setAnswers({});
    setPitchRecorded(false);
    toast.info(
      `Loaded Day ${dayNum} for ${tab === "skills" ? "Technical Skill Lab" : "Placement Accelerator"}`,
    );
    // Smooth scroll down to the drill section
    const el = document.getElementById("daily-drill-workspace");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleRecordVoicePitch = () => {
    setPitchLoading(true);
    setTimeout(async () => {
      setPitchLoading(false);
      setPitchRecorded(true);
      if (liveStudentId) {
        await completeLiveDailyStep(liveStudentId, "practice");
        await completeLivePlacementDay(liveStudentId, selectedDayNum);
        queryClient.invalidateQueries({
          queryKey: ["live", "student-progress", liveStudentId],
        });
        queryClient.invalidateQueries({
          queryKey: ["live", "student-profile", store.supabaseSession?.user?.id],
        });
      }
      store.setDailyStep("practice", true);
      store.completePlacementDay(selectedDayNum);
      toast.success(`Day ${selectedDayNum} Placement Accelerator verified (+25 XP)!`, {
        description: "Voice pitch STAR score recorded · Attendance updated to finished.",
      });
    }, 1500);
  };

  const handleCompleteTechnicalLab = async () => {
    if (liveStudentId) {
      await completeLiveTechnicalDay(liveStudentId, selectedDayNum);
      queryClient.invalidateQueries({
        queryKey: ["live", "student-progress", liveStudentId],
      });
      queryClient.invalidateQueries({
        queryKey: ["live", "student-profile", store.supabaseSession?.user?.id],
      });
    }
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
            <Chip tone="amber">🔥 Day {streak} Streak</Chip>
            <Chip tone={tier.tone}>
              {tier.label} ({talentScore}/1000)
            </Chip>
          </div>
        }
      />

      {/* KPI Overview Banner */}
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat
          label="Pending To-Do Days"
          value={pendingCount === 0 ? "0 Days" : `${pendingCount} Days`}
          hint={pendingCount === 0 ? "All caught up" : "Action required"}
        />
        <Stat
          label="Completed Days"
          value={`${finishedCount} / ${cohortDay}`}
          hint="Placement & Skill verified"
        />
        <Stat
          label="Primary Track"
          value={primaryTrack.name}
          hint="Assigned specialization"
        />
        <Stat
          label="Talent Score"
          value={`${talentScore}/1000`}
          hint={tier.desc}
        />
      </div>

      {/* =================================================================== */}
      {/* SECTION 1: CHRONOLOGICAL DAY-BY-DAY TO-DO / BACKLOG TASK MATRIX */}
      {/* =================================================================== */}
      <Panel
        title="Daily Learning & To-Do Matrix"
        subtitle="Every day requires completing both the Placement Accelerator drill and Technical Skill lab."
        action={
          <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1 text-xs">
            <button
              onClick={() => setFilterMode("pending")}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                filterMode === "pending"
                  ? "bg-card text-foreground shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilterMode("all")}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                filterMode === "all"
                  ? "bg-card text-foreground shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              All Days ({daysList.length})
            </button>
            <button
              onClick={() => setFilterMode("completed")}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                filterMode === "completed"
                  ? "bg-card text-foreground shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Finished ({finishedCount})
            </button>
          </div>
        }
      >
        <div className="space-y-2.5">
          {filteredDays.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center space-y-1.5">
              <CheckCircle2 className="size-6 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <h4 className="text-sm font-semibold text-foreground">
                Zero Pending Backlog
              </h4>
              <p className="text-xs text-muted-foreground">
                You have completed all daily placement accelerator drills and technical skill
                sandbox labs up to Day {cohortDay}.
              </p>
            </div>
          ) : (
            filteredDays.map((d) => {
              const isSelected = selectedDayNum === d.day;

              return (
                <div
                  key={d.day}
                  className={cn(
                    "flex flex-col lg:flex-row lg:items-center justify-between gap-3 rounded-lg border p-3.5 transition-all text-xs bg-card",
                    isSelected
                      ? "border-primary ring-1 ring-primary/20 bg-primary/5 shadow-xs"
                      : d.isFullyFinished
                        ? "border-border hover:border-border/80"
                        : "border-border hover:border-primary/40",
                  )}
                >
                  {/* Day Label & Badge */}
                  <div className="flex items-center gap-3 min-w-[180px]">
                    <div
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-md font-mono text-xs font-semibold border",
                        d.isFullyFinished
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40"
                          : "bg-muted text-muted-foreground border-border",
                      )}
                    >
                      D{d.day}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-foreground">Day {d.day}</span>
                        <span className="text-[11px] text-muted-foreground">
                          ({d.dayOfWeek})
                        </span>
                        {d.isFriday && (
                          <span className="rounded bg-muted px-1.5 py-0.2 text-[10px] font-medium text-muted-foreground">
                            Capstone
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5">
                        {d.isFullyFinished ? (
                          <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400 text-[11px]">
                            <CheckCircle2 className="size-3" /> Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400 text-[11px]">
                            <AlertCircle className="size-3" /> Action Required
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Two Sub-Tasks: Placement & Skill */}
                  <div className="grid gap-2 sm:grid-cols-2 flex-1">
                    {/* Sub-Task 1: Placement Accelerator */}
                    <div
                      className={cn(
                        "flex items-center justify-between rounded-md border p-2.5",
                        d.isPlacementDone
                          ? "border-border bg-muted/20"
                          : "border-border bg-card",
                      )}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <Timer className="size-3 text-muted-foreground shrink-0" />
                          <span className="font-medium text-foreground truncate">
                            Placement 30m
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                          {d.placementTheme}
                        </p>
                      </div>

                      <button
                        onClick={() => handleSelectDayAndTab(d.day, "placement")}
                        className={cn(
                          "shrink-0 rounded px-2 py-1 text-[11px] font-medium transition-colors border",
                          d.isPlacementDone
                            ? "border-border bg-muted text-muted-foreground"
                            : "border-primary bg-primary text-primary-foreground hover:bg-primary/90",
                        )}
                      >
                        {d.isPlacementDone ? "Done ✓" : "Open →"}
                      </button>
                    </div>

                    {/* Sub-Task 2: Technical Skill */}
                    <div
                      className={cn(
                        "flex items-center justify-between rounded-md border p-2.5",
                        d.isTechDone
                          ? "border-border bg-muted/20"
                          : "border-border bg-card",
                      )}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <Code2 className="size-3 text-muted-foreground shrink-0" />
                          <span className="font-medium text-foreground truncate">
                            {primaryTrack.short} 30m
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                          {d.techTopic}
                        </p>
                      </div>

                      <button
                        onClick={() => handleSelectDayAndTab(d.day, "skills")}
                        className={cn(
                          "shrink-0 rounded px-2 py-1 text-[11px] font-medium transition-colors border",
                          d.isTechDone
                            ? "border-border bg-muted text-muted-foreground"
                            : "border-primary bg-primary text-primary-foreground hover:bg-primary/90",
                        )}
                      >
                        {d.isTechDone ? "Done ✓" : "Open →"}
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
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <span className="rounded bg-primary/10 border border-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">
              Day {selectedDayNum} Workspace
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              Executing exercises for Day {selectedDayNum} ({placementPlan.dayOfWeek})
            </span>
          </div>

          {/* Tab Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveDrillTab("skills")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors border",
                activeDrillTab === "skills"
                  ? "border-primary bg-primary text-primary-foreground shadow-xs"
                  : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              <Code2 className="size-3.5" />
              1. Technical Skill Lab
            </button>

            <button
              onClick={() => setActiveDrillTab("placement")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors border",
                activeDrillTab === "placement"
                  ? "border-primary bg-primary text-primary-foreground shadow-xs"
                  : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              <Timer className="size-3.5" />
              2. Placement Drill &amp; Pitch
            </button>
          </div>
        </div>

        {/* TAB 1: TECHNICAL SKILL & SANDBOX LAB */}
        {activeDrillTab === "skills" && (
          <Panel
            title={`Day ${selectedDayNum} Technical Practice · ${primaryTrack.name}`}
            subtitle={`Week ${weekIdx + 1}: ${currentWeekPlan.theme} · In-Browser Code & Lab Simulation`}
            action={
              completedTechDays.includes(selectedDayNum) ? (
                <Chip tone="emerald">Lab Verified ✓</Chip>
              ) : (
                <Chip tone="amber">Pending Submission</Chip>
              )
            }
          >
            <div className="space-y-4 text-xs">
              {/* 20m Concept Card */}
              <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground flex items-center gap-1.5 text-sm">
                    <BookOpen className="size-4 text-primary" /> 1. Concept Card (20 Mins)
                  </span>
                  <span className="rounded bg-card px-2 py-0.5 font-mono text-[10px] text-muted-foreground border border-border">
                    Day {selectedDayNum}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-foreground">{currentTechDay.topic}</h4>
                <p className="text-muted-foreground leading-relaxed">{currentTechDay.practice}</p>
                <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>
                    Theme: <strong className="text-foreground">{currentWeekPlan.theme}</strong>
                  </span>
                  <span className="font-medium text-foreground">
                    Workplace Skill: {currentWeekPlan.workplaceSkill}
                  </span>
                </div>
              </div>

              {/* 10m In-Browser Hands-on Sandbox */}
              <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground flex items-center gap-1.5 text-sm">
                    <Terminal className="size-4 text-primary" /> 2. Hands-on Interactive Sandbox Simulation (10 Mins)
                  </span>
                  <span className="font-mono text-xs font-semibold text-primary">+50 XP</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Execute the code test runner or runtime simulator for{" "}
                  <strong>{primaryTrack.name}</strong>. Solve today's practical challenge and submit
                  to complete your To-Do.
                </p>

                <div className="rounded-lg bg-surface-dark p-3.5 border border-border font-mono text-xs text-slate-300 space-y-1">
                  <p className="text-slate-100 font-medium flex items-center gap-2">
                    <Terminal className="size-3.5 text-primary" /> Simulator:{" "}
                    {primaryTrack.labTitle}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Virtual WebAssembly runner ready · Automated test validation on submit.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                  <Link
                    to="/student/labs"
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-card border border-border py-2.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    <Terminal className="size-4 text-muted-foreground" /> Open Full Terminal Simulator
                  </Link>

                  <button
                    onClick={handleCompleteTechnicalLab}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs cursor-pointer"
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
              attendance.includes(selectedDayNum) ? (
                <Chip tone="emerald">Attendance Recorded ✓</Chip>
              ) : (
                <Chip tone="purple">Pending Practice</Chip>
              )
            }
          >
            <div className="space-y-4 text-xs">
              <div className="grid gap-3 sm:grid-cols-2">
                {/* 10m English Lesson */}
                <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground flex items-center gap-1.5 text-sm">
                      <Video className="size-4 text-primary" /> 1. 10m English Broadcast
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">06:00 IST</span>
                  </div>
                  <h4 className="text-xs font-semibold text-foreground">
                    {placementPlan.english.title}
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {placementPlan.english.instructorBrief}
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {placementPlan.english.keyVocabulary.map((v) => (
                      <span
                        key={v}
                        className="rounded bg-card px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground border border-border"
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 10m Aptitude Lesson */}
                <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground flex items-center gap-1.5 text-sm">
                      <Calculator className="size-4 text-primary" /> 2. 10m Aptitude Drill
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">06:00 IST</span>
                  </div>
                  <h4 className="text-xs font-semibold text-foreground">
                    {placementPlan.aptitude.title}
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {placementPlan.aptitude.instructorBrief}
                  </p>
                  <div className="rounded-md bg-card p-2 text-[11px] font-mono text-foreground border border-border">
                    Rule: {placementPlan.aptitude.formulaShortcut}
                  </div>
                </div>
              </div>

              {/* 10m Guided Practice & AI Voice Pitch */}
              <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground flex items-center gap-1.5 text-sm">
                    <FileCheck2 className="size-4 text-primary" /> 3. In-App Practice MCQs &amp; 60s Voice Pitch
                  </span>
                  <span className="font-mono text-xs font-semibold text-primary">+25 XP</span>
                </div>

                {/* Sample MCQ */}
                {placementPlan.practice.mcqs[0] && (
                  <div className="rounded-lg bg-card p-3.5 border border-border space-y-2">
                    <p className="font-semibold text-foreground text-xs">
                      <span className="text-primary font-mono">Q1.</span>{" "}
                      {placementPlan.practice.mcqs[0].q}
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
                              "rounded-md border p-2 text-left text-xs transition-colors cursor-pointer",
                              isPicked
                                ? isRight
                                  ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold"
                                  : "border-destructive/40 bg-destructive/10 text-destructive"
                                : "border-border bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted",
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
                <div className="rounded-lg bg-card p-3.5 border border-border space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">
                      🎙️ 60-Second AI Voice Pitch Challenge:
                    </span>
                    <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                      STAR Speech Rubric
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    "{placementPlan.practice.voicePrompt.prompt}"
                  </p>

                  <button
                    onClick={handleRecordVoicePitch}
                    disabled={pitchLoading || pitchRecorded}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 disabled:opacity-50 transition-colors cursor-pointer"
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
