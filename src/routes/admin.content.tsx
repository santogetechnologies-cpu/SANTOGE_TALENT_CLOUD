import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Chip, Meter, PageHeader, Panel, Stat } from "@/components/kit";
import { useAppStore } from "@/lib/app-store";
import { fetchLiveBatches, upsertLiveContentItem } from "@/lib/data";
import { TRACKS, type TrackId, trackById } from "@/lib/tracks";
import { getTrackSyllabus } from "@/lib/syllabus-data";
import {
  ACCELERATOR_90_DAYS,
  getAcceleratorDay,
  type AcceleratorDay,
} from "@/lib/placement-accelerator-data";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Calculator,
  Calendar,
  Check,
  Code2,
  Edit3,
  FileText,
  Layers,
  ListOrdered,
  Plus,
  Radio,
  Save,
  Send,
  Sparkles,
  Timer,
  Trash2,
  Users,
  Video,
  Gamepad2,
  Cpu,
  Globe,
  Award,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import {
  getLessonForDay,
  getCourseCurriculum,
  getAllLessonsForCourse,
  PHASE_NAMES,
  PHASE_RANGES,
} from "@/lib/course-curricula";

export const Route = createFileRoute("/admin/content")({
  head: () => ({
    meta: [
      { title: "Curriculum Content Management System (CMS) — SantoGe Talent Cloud" },
      {
        name: "description",
        content:
          "Manage, edit, author, and broadcast 90-day Placement Accelerator lessons, daily practice drills, MCQs, and 15 Technical Track syllabi to all active student cohorts.",
      },
      { property: "og:title", content: "Content Management System (CMS) — SantoGe Talent Cloud" },
      { property: "og:description", content: "Super Admin Curriculum & Content Authoring Engine." },
    ],
  }),
  component: ContentManagementPage,
});

type CMSTab = "placement-accelerator" | "technical-tracks" | "curriculum-90days";

function ContentManagementPage() {
  const store = useAppStore();
  const queryClient = useQueryClient();

  const liveBatchesQuery = useQuery({
    queryKey: ["live", "batches"],
    queryFn: fetchLiveBatches,
  });

  const batchesCount = liveBatchesQuery.data?.length || 0;

  const [cmsTab, setCmsTab] = useState<CMSTab>("placement-accelerator");

  // Placement Accelerator CMS states
  const [selectedPlacementDay, setSelectedPlacementDay] = useState<number>(1);
  const currentAccDay = useMemo(
    () => getAcceleratorDay(selectedPlacementDay),
    [selectedPlacementDay],
  );

  const [englishTitle, setEnglishTitle] = useState(currentAccDay.english.title);
  const [englishBrief, setEnglishBrief] = useState(currentAccDay.english.instructorBrief);
  const [englishVocab, setEnglishVocab] = useState(currentAccDay.english.keyVocabulary.join(", "));
  const [englishGrammar, setEnglishGrammar] = useState(currentAccDay.english.grammarRule);
  const [englishTimeline, setEnglishTimeline] = useState(currentAccDay.english.deliveryTimeline);

  const [aptitudeTitle, setAptitudeTitle] = useState(currentAccDay.aptitude.title);
  const [aptitudeBrief, setAptitudeBrief] = useState(currentAccDay.aptitude.instructorBrief);
  const [aptitudeFormula, setAptitudeFormula] = useState(currentAccDay.aptitude.formulaShortcut);
  const [aptitudeSolved, setAptitudeSolved] = useState(currentAccDay.aptitude.solvedExample);

  const [mcq1Question, setMcq1Question] = useState(currentAccDay.practice.mcqs[0]?.q || "");
  const [voicePromptText, setVoicePromptText] = useState(currentAccDay.practice.voicePrompt.prompt);

  // Technical Tracks CMS states
  const [selectedTrackId, setSelectedTrackId] = useState<TrackId>("java");
  const [selectedWeekNum, setSelectedWeekNum] = useState<number>(1);
  const trackSyllabus = useMemo(() => getTrackSyllabus(selectedTrackId), [selectedTrackId]);
  const activeWeek = trackSyllabus.weeks[selectedWeekNum - 1] || trackSyllabus.weeks[0]!;

  const [weekTitle, setWeekTitle] = useState(activeWeek.title);
  const [weekTheme, setWeekTheme] = useState(activeWeek.theme);
  const [fridayProjectTitle, setFridayProjectTitle] = useState(activeWeek.projectTitle);
  const [fridayDeliverable, setFridayDeliverable] = useState(activeWeek.deliverable);
  const [workplaceSkill, setWorkplaceSkill] = useState(activeWeek.workplaceSkill);

  // 90-Day Specialized Technical Curricula CMS states
  const [curriculumTrackId, setCurriculumTrackId] = useState<TrackId>("java");
  const [curriculumPhaseFilter, setCurriculumPhaseFilter] = useState<number | "all">("all");
  const [curriculumDayNum, setCurriculumDayNum] = useState<number>(1);
  const activeCurriculumLesson = useMemo(
    () => getLessonForDay(curriculumTrackId, curriculumDayNum),
    [curriculumTrackId, curriculumDayNum],
  );
  const allCurriculumLessons = useMemo(
    () => getAllLessonsForCourse(curriculumTrackId),
    [curriculumTrackId],
  );

  // Update form fields when day changes
  const handlePlacementDaySelect = (dayNum: number) => {
    setSelectedPlacementDay(dayNum);
    const d = getAcceleratorDay(dayNum);
    setEnglishTitle(d.english.title);
    setEnglishBrief(d.english.instructorBrief);
    setEnglishVocab(d.english.keyVocabulary.join(", "));
    setEnglishGrammar(d.english.grammarRule);
    setEnglishTimeline(d.english.deliveryTimeline);

    setAptitudeTitle(d.aptitude.title);
    setAptitudeBrief(d.aptitude.instructorBrief);
    setAptitudeFormula(d.aptitude.formulaShortcut);
    setAptitudeSolved(d.aptitude.solvedExample);

    setMcq1Question(d.practice.mcqs[0]?.q || "");
    setVoicePromptText(d.practice.voicePrompt.prompt);
  };

  // Update track week fields when week changes
  const handleTrackWeekSelect = (wNum: number) => {
    setSelectedWeekNum(wNum);
    const w = trackSyllabus.weeks[wNum - 1] || trackSyllabus.weeks[0]!;
    setWeekTitle(w.title);
    setWeekTheme(w.theme);
    setFridayProjectTitle(w.projectTitle);
    setFridayDeliverable(w.deliverable);
    setWorkplaceSkill(w.workplaceSkill);
  };

  const handleSavePlacementContent = async () => {
    const res = await upsertLiveContentItem(
      {
        track: "Placement Accelerator",
        kind: "English video",
        titlePrefix: `Day ${selectedPlacementDay}:`,
      },
      {
        title: `Day ${selectedPlacementDay}: ${englishTitle}`,
        kind: "English video",
        track: "Placement Accelerator",
        duration: "10m",
        status: "published",
      },
    );
    if (res.ok) {
      queryClient.invalidateQueries({ queryKey: ["live", "content"] });
      toast.success(`Day ${selectedPlacementDay} Placement Lesson synced to Supabase!`, {
        description:
          "Curriculum metadata synced to content_items; teaching script staged for broadcast.",
      });
    } else {
      toast.error(res.error || "Failed to persist curriculum changes to database");
    }
  };

  const handleSaveTechnicalContent = async () => {
    const trackName = trackById(selectedTrackId).name;
    const res = await upsertLiveContentItem(
      {
        track: trackName,
        kind: "Lab brief",
        titlePrefix: `${trackName} Week ${selectedWeekNum}:`,
      },
      {
        title: `${trackName} Week ${selectedWeekNum}: ${weekTitle}`,
        kind: "Lab brief",
        track: trackName,
        duration: "5 days",
        status: "published",
      },
    );
    if (res.ok) {
      queryClient.invalidateQueries({ queryKey: ["live", "content"] });
      toast.success(`${trackName} Week ${selectedWeekNum} synced to Supabase!`, {
        description:
          "Curriculum metadata synced to content_items; mini-project ticket staged for sandbox.",
      });
    } else {
      toast.error(res.error || "Failed to persist technical track changes to database");
    }
  };

  const handleBroadcastInstantPush = () => {
    toast.info(`Broadcast Staged for Day ${selectedPlacementDay}`, {
      description: `Delivery channel standby: Telegram bot token (@SantoGeTalentBot) pending backend configuration.`,
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Curriculum Content Management System (CMS)"
        subtitle="Master authoring control: Manage 90-day Placement Accelerator lessons, daily practice questions, and specialized Technical Track syllabi across active cohorts."
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={handleBroadcastInstantPush}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-opacity"
            >
              <Send className="size-3.5" /> Push Telegram Broadcast (Simulator)
            </button>
            <Chip tone="purple">Admin Authoring Hub</Chip>
          </div>
        }
      />

      {/* KPI Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Total Daily Lessons" value="540 Lessons" tone="brand" hint="6 Tracks × 90 Unique Days" />
        <Stat
          label="Specialized Technical Tracks"
          value="6 Tracks"
          tone="cyan"
          hint="Java, AIML, DS, Med, Mktg, SAP"
        />
        <Stat
          label="Course Mini-Games"
          value="54 Game Engines"
          tone="purple"
          hint="9 Custom Game Types per Track"
        />
        <Stat
          label="Capstone Milestones"
          value="90 Milestones"
          tone="emerald"
          hint="15 Milestone Days × 6 Tracks"
        />
      </div>

      {/* CMS Mode Switcher Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        <button
          onClick={() => setCmsTab("curriculum-90days")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all",
            cmsTab === "curriculum-90days"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50",
          )}
        >
          <Layers className="size-3.5" />
          90-Day Specialized Technical Curricula (540 Lessons)
        </button>

        <button
          onClick={() => setCmsTab("placement-accelerator")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all",
            cmsTab === "placement-accelerator"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50",
          )}
        >
          <Timer className="size-3.5" />
          Placement Accelerator CMS (90 Days / 10m + 10m + 10m)
        </button>

        <button
          onClick={() => setCmsTab("technical-tracks")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all",
            cmsTab === "technical-tracks"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50",
          )}
        >
          <Code2 className="size-3.5" />
          Weekly Syllabi &amp; Friday Projects CMS
        </button>
      </div>

      {/* 0. 90-DAY SPECIALIZED TECHNICAL CURRICULA INSPECTOR */}
      {cmsTab === "curriculum-90days" && (
        <div className="space-y-6">
          {/* Track Selector Bar */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <span className="text-xs font-semibold text-foreground flex items-center gap-2">
                <Layers className="size-4 text-primary" />
                Select Specialized Technical Track (6 Authoritative Courses × 90 Days)
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                Showing {allCurriculumLessons.length} Unique Lessons
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {TRACKS.map((t) => {
                const isSelected = t.id === curriculumTrackId;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setCurriculumTrackId(t.id);
                      setCurriculumDayNum(1);
                    }}
                    className={cn(
                      "flex flex-col p-3 rounded-xl border text-left transition-all",
                      isSelected
                        ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary"
                        : "border-border bg-card hover:bg-muted/50 hover:border-primary/40",
                    )}
                  >
                    <span className="text-xs font-bold text-foreground">{t.name}</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">{t.tagline}</span>
                    <span className="text-[10px] font-mono text-primary font-semibold mt-2">
                      90 Days • 6 Phases
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Phase Filter & Day Selector */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
              <span className="text-xs font-semibold text-foreground flex items-center gap-2">
                <Calendar className="size-4 text-primary" />
                Filter by Phase or Jump to Day:
              </span>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setCurriculumPhaseFilter("all")}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-medium transition-all",
                    curriculumPhaseFilter === "all"
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground",
                  )}
                >
                  All 90 Days
                </button>
                {[1, 2, 3, 4, 5, 6].map((pNum) => {
                  const pRange = PHASE_RANGES[pNum as 1 | 2 | 3 | 4 | 5 | 6];
                  return (
                    <button
                      key={pNum}
                      onClick={() => {
                        setCurriculumPhaseFilter(pNum);
                        setCurriculumDayNum(pRange.start);
                      }}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-medium transition-all",
                        curriculumPhaseFilter === pNum
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground",
                      )}
                    >
                      P{pNum}: {PHASE_NAMES[pNum as 1 | 2 | 3 | 4 | 5 | 6].split(" ")[0]} ({pRange.start}–{pRange.end})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Day Number Pills */}
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
              {allCurriculumLessons
                .filter((l) =>
                  curriculumPhaseFilter === "all" ? true : l.phase === curriculumPhaseFilter,
                )
                .map((lesson) => {
                  const isCurrent = lesson.day === curriculumDayNum;
                  return (
                    <button
                      key={lesson.day}
                      onClick={() => setCurriculumDayNum(lesson.day)}
                      title={`Day ${lesson.day}: ${lesson.title}`}
                      className={cn(
                        "size-8 rounded-lg text-xs font-mono font-medium transition-all flex items-center justify-center shrink-0",
                        isCurrent
                          ? "bg-primary text-primary-foreground font-bold shadow-xs scale-105"
                          : lesson.day >= 76
                          ? "bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30 hover:bg-purple-500/20"
                          : "bg-muted/40 hover:bg-muted text-foreground border border-border/60",
                      )}
                    >
                      {lesson.day}
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Active Lesson Inspector Panel */}
          {activeCurriculumLesson && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Column: Lesson Details & Pipeline */}
              <div className="lg:col-span-2 space-y-6">
                <Panel className="p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary uppercase">
                        Phase {activeCurriculumLesson.phase}: {activeCurriculumLesson.phaseName}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground">
                        Day {activeCurriculumLesson.day} of 90
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono px-2.5 py-0.5 rounded-md bg-muted text-muted-foreground capitalize">
                        {activeCurriculumLesson.difficulty}
                      </span>
                      <span className="text-xs font-mono px-2.5 py-0.5 rounded-md bg-muted text-muted-foreground">
                        ⏱ {activeCurriculumLesson.estimatedMinutes} mins
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <h2 className="text-xl font-bold tracking-tight text-foreground">
                      Day {activeCurriculumLesson.day}: {activeCurriculumLesson.title}
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {activeCurriculumLesson.description}
                    </p>
                  </div>

                  {/* Learning Objectives */}
                  <div className="mt-6 pt-4 border-t border-border space-y-2.5">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-primary" />
                      Domain Learning Objectives
                    </h4>
                    <ul className="space-y-1.5 text-xs text-muted-foreground">
                      {activeCurriculumLesson.learningObjectives.map((obj, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-primary font-mono shrink-0">#{idx + 1}</span>
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 4-Node Architecture Pipeline */}
                  <div className="mt-6 pt-4 border-t border-border space-y-3">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                      <Cpu className="size-3.5 text-primary" />
                      Architecture &amp; Dataflow Pipeline (4 Stages)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                      {activeCurriculumLesson.animationPipeline.nodes.map((node, idx) => (
                        <div
                          key={node.id}
                          className="p-3 rounded-xl bg-muted/40 border border-border/60 flex flex-col justify-between gap-1"
                        >
                          <span className="text-[10px] font-mono text-primary uppercase font-semibold">
                            Stage {idx + 1} • {node.role}
                          </span>
                          <span className="text-xs font-bold text-foreground line-clamp-2">
                            {node.label}
                          </span>
                          <span className="text-[11px] text-muted-foreground line-clamp-2">
                            {node.sublabel}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Real World Industry Scenario */}
                  <div className="mt-6 pt-4 border-t border-border space-y-2">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                      <Globe className="size-3.5 text-emerald-500" />
                      Real-World Enterprise Application
                    </h4>
                    <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs space-y-1">
                      <p className="font-semibold text-foreground">
                        {activeCurriculumLesson.realWorldExample.application} (
                        {activeCurriculumLesson.realWorldExample.industry})
                      </p>
                      <p className="text-muted-foreground">
                        {activeCurriculumLesson.realWorldExample.scenario}
                      </p>
                    </div>
                  </div>
                </Panel>

                {/* Capstone Milestone (Phase 6 only) */}
                {activeCurriculumLesson.projectConfig && (
                  <Panel className="p-6 border-purple-500/30 bg-purple-500/5">
                    <div className="flex items-center gap-2 pb-3 border-b border-purple-500/20">
                      <Award className="size-4 text-purple-600 dark:text-purple-400" />
                      <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                        Phase 6 Capstone Project Milestone Deliverable
                      </h3>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div>
                        <span className="text-xs text-muted-foreground font-mono">
                          Project System:
                        </span>
                        <h4 className="text-base font-bold text-foreground">
                          {activeCurriculumLesson.projectConfig.projectTitle}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {activeCurriculumLesson.projectConfig.overview}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-background border border-border space-y-2">
                        <span className="text-xs font-bold text-primary">
                          Today's Milestone Deliverable:
                        </span>
                        <p className="text-xs text-foreground font-medium">
                          {activeCurriculumLesson.projectConfig.milestone.deliverable}
                        </p>
                        <div className="pt-2 border-t border-border/50">
                          <span className="text-[11px] font-semibold text-muted-foreground block mb-1">
                            Acceptance Criteria:
                          </span>
                          <ul className="space-y-1 text-xs text-muted-foreground">
                            {activeCurriculumLesson.projectConfig.milestone.acceptanceCriteria.map(
                              (crit, idx) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                  <Check className="size-3 text-emerald-500 shrink-0 mt-0.5" />
                                  <span>{crit}</span>
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </Panel>
                )}
              </div>

              {/* Sidebar Column: Mini-Game & Knowledge Check */}
              <div className="space-y-6">
                {/* Mini-Game Preview Card */}
                {activeCurriculumLesson.miniGame && (
                  <Panel className="p-5">
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <div className="flex items-center gap-2">
                        <Gamepad2 className="size-4 text-primary" />
                        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                          Course Mini-Game
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                        +{activeCurriculumLesson.miniGame.perfectXpBonus} Perfect XP
                      </span>
                    </div>

                    <div className="mt-3 space-y-2">
                      <span className="text-[11px] font-mono text-primary uppercase font-semibold">
                        Game Engine: {activeCurriculumLesson.miniGame.gameType}
                      </span>
                      <h5 className="text-sm font-bold text-foreground">
                        {activeCurriculumLesson.miniGame.title}
                      </h5>
                      <p className="text-xs text-muted-foreground">
                        {activeCurriculumLesson.miniGame.instruction}
                      </p>

                      <div className="grid grid-cols-2 gap-2 pt-2 text-xs font-mono">
                        <div className="p-2 rounded-lg bg-muted/40 border border-border/60 text-center">
                          <span className="text-[10px] text-muted-foreground">Time Limit</span>
                          <p className="font-bold text-foreground">
                            {activeCurriculumLesson.miniGame.timeLimitSeconds}s
                          </p>
                        </div>
                        <div className="p-2 rounded-lg bg-muted/40 border border-border/60 text-center">
                          <span className="text-[10px] text-muted-foreground">Difficulty</span>
                          <p className="font-bold text-amber-500">
                            {"★".repeat(activeCurriculumLesson.miniGame.difficulty)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Panel>
                )}

                {/* Knowledge Check MCQ Card */}
                <Panel className="p-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-border">
                    <ShieldCheck className="size-4 text-primary" />
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Knowledge Check MCQ
                    </h4>
                  </div>

                  <div className="mt-3 space-y-3">
                    <p className="text-xs font-bold text-foreground leading-snug">
                      {activeCurriculumLesson.knowledgeCheck.question}
                    </p>

                    <div className="space-y-1.5">
                      {activeCurriculumLesson.knowledgeCheck.options.map((opt, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "p-2.5 rounded-lg text-xs border flex items-start gap-2",
                            opt.isCorrect
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200 font-medium"
                              : "bg-muted/30 border-border/40 text-muted-foreground",
                          )}
                        >
                          <span className="font-mono font-bold mt-0.5">
                            {String.fromCharCode(65 + idx)}.
                          </span>
                          <span className="flex-1">{opt.text}</span>
                          {opt.isCorrect && (
                            <Check className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="p-3 rounded-lg bg-muted/40 border border-border/60 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground block mb-0.5">
                        Answer Rationale:
                      </span>
                      {activeCurriculumLesson.knowledgeCheck.options.find((o) => o.isCorrect)
                        ?.explanation || "Authoritative domain verification."}
                    </div>
                  </div>
                </Panel>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 1. PLACEMENT ACCELERATOR CMS */}
      {cmsTab === "placement-accelerator" && (
        <div className="space-y-6">
          {/* Day Selector Ribbon */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-foreground flex items-center gap-2">
                <Calendar className="size-4 text-primary" />
                Select Accelerator Day to Edit (Day {selectedPlacementDay} of 90 · Week{" "}
                {currentAccDay.week} {currentAccDay.dayOfWeek})
              </span>
              <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-semibold">
                {selectedPlacementDay % 5 === 0
                  ? "⚡ Friday Assessment Day"
                  : "Standard Daily Routine"}
              </span>
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
              {Array.from({ length: 90 }, (_, i) => {
                const dayNum = i + 1;
                const isSelected = dayNum === selectedPlacementDay;
                const isFriday = dayNum % 5 === 0;
                return (
                  <button
                    key={dayNum}
                    onClick={() => handlePlacementDaySelect(dayNum)}
                    className={cn(
                      "flex flex-col items-center justify-center min-w-[52px] rounded-lg border p-2 text-center transition-all text-xs",
                      isSelected
                        ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                        : isFriday
                          ? "border-border bg-muted/30 text-muted-foreground hover:border-primary/40"
                          : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/30",
                    )}
                  >
                    <span className="text-[9px] font-mono uppercase tracking-wider opacity-70">
                      {isFriday ? "Fri Test" : `W${Math.floor(i / 5) + 1}`}
                    </span>
                    <span className="font-mono text-xs font-bold mt-0.5">D{dayNum}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Editors for English, Aptitude, Practice */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* English Lesson Plan Editor */}
            <Panel
              title={`Edit Day ${selectedPlacementDay}: 10m English Instructor Plan`}
              subtitle="Configure video title, concept brief, vocabulary chips, and timeline breakdown"
              action={<Chip tone="cyan">10 Mins Duration</Chip>}
            >
              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="font-semibold text-foreground block mb-1">Lesson Title</label>
                  <input
                    type="text"
                    value={englishTitle}
                    onChange={(e) => setEnglishTitle(e.target.value)}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-foreground block mb-1">
                    Concept Brief &amp; Teaching Script
                  </label>
                  <textarea
                    rows={3}
                    value={englishBrief}
                    onChange={(e) => setEnglishBrief(e.target.value)}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-foreground block mb-1">
                    Key Corporate Vocabulary (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={englishVocab}
                    onChange={(e) => setEnglishVocab(e.target.value)}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-foreground block mb-1">
                    Spoken Grammar Focus
                  </label>
                  <input
                    type="text"
                    value={englishGrammar}
                    onChange={(e) => setEnglishGrammar(e.target.value)}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-foreground block mb-1">
                    Delivery Timeline Structure
                  </label>
                  <input
                    type="text"
                    value={englishTimeline}
                    onChange={(e) => setEnglishTimeline(e.target.value)}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs font-mono text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs outline-none"
                  />
                </div>
              </div>
            </Panel>

            {/* Aptitude Lesson Plan Editor */}
            <Panel
              title={`Edit Day ${selectedPlacementDay}: 10m Aptitude Instructor Plan`}
              subtitle="Configure math model, speed shortcut rules, and step-by-step solved demonstrations"
              action={<Chip tone="purple">10 Mins Duration</Chip>}
            >
              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="font-semibold text-foreground block mb-1">
                    Aptitude Topic Title
                  </label>
                  <input
                    type="text"
                    value={aptitudeTitle}
                    onChange={(e) => setAptitudeTitle(e.target.value)}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-foreground block mb-1">
                    Mathematical Model Brief
                  </label>
                  <textarea
                    rows={3}
                    value={aptitudeBrief}
                    onChange={(e) => setAptitudeBrief(e.target.value)}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-foreground block mb-1">
                    Formula &amp; Speed Math Shortcut
                  </label>
                  <input
                    type="text"
                    value={aptitudeFormula}
                    onChange={(e) => setAptitudeFormula(e.target.value)}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs font-mono text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-foreground block mb-1">
                    Solved Walkthrough Demonstration
                  </label>
                  <textarea
                    rows={2}
                    value={aptitudeSolved}
                    onChange={(e) => setAptitudeSolved(e.target.value)}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs font-mono text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs outline-none"
                  />
                </div>
              </div>
            </Panel>
          </div>

          {/* 10m In-App Guided Practice Questions Editor */}
          <Panel
            title={`Edit Day ${selectedPlacementDay}: 10m In-App Guided Practice & Voice Pitch Prompt`}
            subtitle="Configure MCQs, reasoning brainteasers, and AI speech evaluation prompts"
            action={
              <button
                onClick={handleSavePlacementContent}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-opacity"
              >
                <Save className="size-3.5" /> Save Day {selectedPlacementDay} Content
              </button>
            }
          >
            <div className="grid gap-6 sm:grid-cols-2 text-xs">
              <div className="space-y-3">
                <label className="font-semibold text-foreground block">Primary MCQ Question</label>
                <textarea
                  rows={3}
                  value={mcq1Question}
                  onChange={(e) => setMcq1Question(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs outline-none"
                />
                <p className="text-[11px] text-muted-foreground">
                  Options and explanations are automatically checked against the Placement Engine
                  validator.
                </p>
              </div>

              <div className="space-y-3">
                <label className="font-semibold text-foreground block">
                  60-Second AI Voice Pitch Prompt
                </label>
                <textarea
                  rows={3}
                  value={voicePromptText}
                  onChange={(e) => setVoicePromptText(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs outline-none"
                />
                <p className="text-[11px] text-muted-foreground">
                  Target keywords will be extracted by the Speech Analysis engine during 60s pitch
                  grading.
                </p>
              </div>
            </div>
          </Panel>
        </div>
      )}

      {/* 2. TECHNICAL TRACKS CMS */}
      {cmsTab === "technical-tracks" && (
        <div className="space-y-6">
          {/* Track Selector & Week Selector */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-4 space-y-2 shadow-xs">
              <label className="text-xs font-semibold text-foreground block">
                Select Technical Track (1 of 15)
              </label>
              <select
                value={selectedTrackId}
                onChange={(e) => setSelectedTrackId(e.target.value as TrackId)}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs outline-none"
              >
                {TRACKS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.domain})
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 space-y-2 shadow-xs">
              <label className="text-xs font-semibold text-foreground block">
                Select Week (Week 1 to 18 = 90 Days)
              </label>
              <select
                value={selectedWeekNum}
                onChange={(e) => handleTrackWeekSelect(Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs outline-none"
              >
                {Array.from({ length: 18 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Week {i + 1} (Days {i * 5 + 1}–{(i + 1) * 5}) ·{" "}
                    {trackSyllabus.weeks[i]?.theme || `Week ${i + 1}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Week & Friday Simulation Editor */}
          <Panel
            title={`Edit ${trackById(selectedTrackId).name} · Week ${selectedWeekNum}`}
            subtitle="Configure 5-day topics, Friday Workplace Simulation mini-project ticket, and deliverable"
            action={
              <button
                onClick={handleSaveTechnicalContent}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-opacity"
              >
                <Save className="size-3.5" /> Save Week {selectedWeekNum} Content
              </button>
            }
          >
            <div className="space-y-4 text-xs">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="font-semibold text-foreground block mb-1">Week Title</label>
                  <input
                    type="text"
                    value={weekTitle}
                    onChange={(e) => setWeekTitle(e.target.value)}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-foreground block mb-1">
                    Week Theme / Subtitle
                  </label>
                  <input
                    type="text"
                    value={weekTheme}
                    onChange={(e) => setWeekTheme(e.target.value)}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs outline-none"
                  />
                </div>
              </div>

              <div className="border-t border-border pt-3" />

              <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                <p className="font-semibold text-primary text-xs flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="size-3.5" /> Friday Workplace Simulation Mini-Project (Day{" "}
                  {(selectedWeekNum - 1) * 5 + 5})
                </p>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="font-semibold text-foreground block mb-1">
                      Project Title
                    </label>
                    <input
                      type="text"
                      value={fridayProjectTitle}
                      onChange={(e) => setFridayProjectTitle(e.target.value)}
                      className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-foreground block mb-1">
                      Deliverable Name
                    </label>
                    <input
                      type="text"
                      value={fridayDeliverable}
                      onChange={(e) => setFridayDeliverable(e.target.value)}
                      className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-foreground block mb-1">
                      Target Workplace Skill
                    </label>
                    <input
                      type="text"
                      value={workplaceSkill}
                      onChange={(e) => setWorkplaceSkill(e.target.value)}
                      className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          {/* Master 15 Technical Tracks Catalog Hub for Super Admin */}
          <Panel
            title="Complete 15 Technical Tracks Master Catalog & Lab Simulators"
            subtitle="Centralized management: 100% In-Browser Simulators, Code Run environments & 90-Day Curriculums"
            action={<Chip tone="cyan">15 Tracks Available</Chip>}
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {TRACKS.map((t, idx) => {
                const isSelected = selectedTrackId === t.id;
                const pct = store.trackPercent(t.id);

                return (
                  <div
                    key={t.id}
                    className={cn(
                      "flex flex-col justify-between rounded-xl border p-4 transition-all bg-card shadow-xs",
                      isSelected
                        ? "border-primary ring-1 ring-primary"
                        : "border-border hover:border-border/80",
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-mono text-muted-foreground border border-border">
                          Track {idx + 1} · {t.short}
                        </span>
                        <span className="size-2 rounded-full" style={{ background: t.accent }} />
                      </div>

                      <h4 className="mt-2.5 text-sm font-semibold text-foreground">{t.name}</h4>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">{t.tagline}</p>

                      <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Code2 className="size-3.5 text-primary" />
                          <span className="font-mono text-foreground font-medium">
                            Lab: {t.labTitle}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Layers className="size-3.5 text-muted-foreground" />
                          <span>90 Days · 18 Friday Projects · Capstone</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[11px] text-muted-foreground">
                          Average Learner Mastery
                        </span>
                        <span className="font-mono font-bold text-foreground">{pct}%</span>
                      </div>
                      <Meter value={pct} tone="brand" />

                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => {
                            setSelectedTrackId(t.id);
                            setSelectedWeekNum(1);
                            toast.success(`Loaded ${t.name} in Curriculum Editor`);
                            window.scrollTo({ top: 300, behavior: "smooth" });
                          }}
                          className={cn(
                            "flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all border shadow-xs",
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted",
                          )}
                        >
                          {isSelected ? "Active in Editor" : "Edit Syllabus"}
                        </button>
                        <a
                          href="/student/labs"
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted shadow-xs transition-colors"
                        >
                          Test Lab
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}
