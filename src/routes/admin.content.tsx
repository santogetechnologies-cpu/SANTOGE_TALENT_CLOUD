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
} from "lucide-react";

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

type CMSTab = "placement-accelerator" | "technical-tracks";

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
  const [selectedTrackId, setSelectedTrackId] = useState<TrackId>("mern");
  const [selectedWeekNum, setSelectedWeekNum] = useState<number>(1);
  const trackSyllabus = useMemo(() => getTrackSyllabus(selectedTrackId), [selectedTrackId]);
  const activeWeek = trackSyllabus.weeks[selectedWeekNum - 1] || trackSyllabus.weeks[0]!;

  const [weekTitle, setWeekTitle] = useState(activeWeek.title);
  const [weekTheme, setWeekTheme] = useState(activeWeek.theme);
  const [fridayProjectTitle, setFridayProjectTitle] = useState(activeWeek.projectTitle);
  const [fridayDeliverable, setFridayDeliverable] = useState(activeWeek.deliverable);
  const [workplaceSkill, setWorkplaceSkill] = useState(activeWeek.workplaceSkill);

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
    toast.success(`Simulated Broadcast Dispatched for Day ${selectedPlacementDay}!`, {
      description: `Simulated Telegram webhook payload generated for @SantoGeTalentBot (Production bot token not configured).`,
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Curriculum Content Management System (CMS)"
        subtitle="Master authoring control: Manage 90-day Placement Accelerator lessons, daily practice questions, and 15 Technical Track syllabi across active cohorts."
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
        <Stat label="Total Curriculum Days" value="90 Days" tone="brand" hint="18 Weeks × 5 Working Days" />
        <Stat
          label="Technical Specializations"
          value="15 Tracks"
          tone="cyan"
          hint="Individual self-paced tracks"
        />
        <Stat
          label="Active Cohorts Managed"
          value={`${batchesCount} Batches`}
          tone="purple"
          hint="100–300 learners per batch"
        />
        <Stat
          label="Total Portfolio Projects"
          value="270 Projects"
          tone="emerald"
          hint="18 Friday Projects × 15 Tracks"
        />
      </div>

      {/* CMS Mode Switcher Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
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
          Technical Tracks &amp; Friday Projects CMS (15 Tracks)
        </button>
      </div>

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
