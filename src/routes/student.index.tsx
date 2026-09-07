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
          "Your distraction-free daily routine: 30m Placement Accelerator (English + Aptitude + In-App Practice) and 30m Technical Sandbox Labs.",
      },
      { property: "og:title", content: "Today's Learning — SantoGe Talent Cloud" },
      {
        property: "og:description",
        content: "Complete your daily 30m Placement + 30m Technical exercises.",
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

function TodayLearningPage() {
  const store = useAppStore();
  const currentDayNum = store.placementDay || 1;
  const placementPlan = useMemo(() => getAcceleratorDay(currentDayNum), [currentDayNum]);

  // Primary active technical track
  const primaryTrackId: TrackId = store.activeTracks[0] ?? "mern";
  const primaryTrack = trackById(primaryTrackId);
  const technicalSyllabus = useMemo(() => getTrackSyllabus(primaryTrackId), [primaryTrackId]);

  // Find today's technical day plan
  const weekIdx = Math.floor((currentDayNum - 1) / 5);
  const dayInWeekIdx = (currentDayNum - 1) % 5;
  const currentWeekPlan = technicalSyllabus.weeks[weekIdx] || technicalSyllabus.weeks[0]!;
  const currentTechDay = currentWeekPlan.days[dayInWeekIdx] || currentWeekPlan.days[0]!;

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [pitchRecorded, setPitchRecorded] = useState(false);
  const [pitchLoading, setPitchLoading] = useState(false);

  const tier = getScoreTier(store.talentScore);
  const completedPlacementSteps = Object.values(store.daily).filter(Boolean).length;
  const isTechCompleted = store.skills.length > 0;

  const handleRecordVoicePitch = () => {
    setPitchLoading(true);
    setTimeout(() => {
      setPitchLoading(false);
      setPitchRecorded(true);
      store.completeDailyStep("practice");
      toast.success("Voice Pitch evaluated & verified (+25 XP)!", {
        description: "Clarity 88% · STAR alignment validated · Communication pillar updated.",
      });
    }, 1500);
  };

  const handleLaunchTechLab = () => {
    toast.success(`Launched ${primaryTrack.name} Sandbox!`, {
      description: `Exercising: ${currentTechDay.topic} (+50 XP).`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Streamlined Minimal Page Header */}
      <PageHeader
        title={`Today's Learning & Exercises · Day ${currentDayNum}`}
        subtitle={`18 Weeks × 5 Working Days = 90 Days · Complete your Twin 30-Minute Routine (Placement + Technical Skill).`}
        action={
          <div className="flex items-center gap-2">
            <Chip tone="amber">🔥 Day {store.streak} Streak</Chip>
            <Chip tone={tier.tone}>{tier.label} ({store.talentScore}/1000)</Chip>
          </div>
        }
      />

      {/* Daily Progress Ribbon */}
      <div className="rounded-2xl border border-line-soft bg-surface-soft/80 p-4 backdrop-blur-sm shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-brand-cyan" />
              <span className="text-xs font-bold text-foreground">
                Daily Completion Status: {completedPlacementSteps === 3 && isTechCompleted ? "All Daily Goals Met 🎉" : "In Progress"}
              </span>
            </div>
            <p className="text-xs text-copy-subtle">
              Engine 1: Placement Accelerator ({completedPlacementSteps}/3 complete) &nbsp;|&nbsp; Engine 2: {primaryTrack.name} (Active)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-40">
              <div className="flex justify-between text-[11px] font-mono text-copy-subtle mb-1">
                <span>Twin 30m Progress</span>
                <span className="text-brand-cyan font-bold">{Math.round(((completedPlacementSteps + (isTechCompleted ? 1 : 0)) / 4) * 100)}%</span>
              </div>
              <Meter value={Math.round(((completedPlacementSteps + (isTechCompleted ? 1 : 0)) / 4) * 100)} accent="var(--brand-cyan)" />
            </div>
            <Link
              to="/student/technical"
              className="rounded-xl border border-line-soft bg-surface-elevated px-3 py-1.5 text-xs font-bold text-brand-cyan hover:border-brand-cyan/60 transition-colors"
            >
              View 90-Day Full Syllabus →
            </Link>
          </div>
        </div>
      </div>

      {/* Main Twin 30-Minute Grid: Placement (30m) vs Technical (30m) */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* ENGINE 1: 30-MINUTE PLACEMENT ACCELERATOR */}
        <Panel
          title="1. Placement Accelerator (30 Mins Daily)"
          subtitle={`Day ${currentDayNum}: ${placementPlan.theme} · Synchronized Cohort Routine`}
          action={<Chip tone="purple">{completedPlacementSteps}/3 Complete</Chip>}
        >
          <div className="space-y-4 text-xs">
            {/* 10m English Video & Lesson */}
            <div
              className={cn(
                "rounded-xl border p-3.5 space-y-2 transition-all",
                store.daily.english ? "border-brand-emerald/50 bg-brand-emerald/5" : "border-line-soft bg-surface-soft"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="size-4 text-brand-cyan" />
                  <span className="font-bold text-foreground">10m English &amp; Corporate Communication</span>
                </div>
                <button
                  onClick={() => {
                    store.completeDailyStep("english");
                    toast.success("10m English Lesson completed (+25 XP)!");
                  }}
                  className="text-xs text-copy-subtle hover:text-foreground"
                >
                  {store.daily.english ? (
                    <span className="flex items-center gap-1 text-brand-emerald font-bold font-mono text-[11px]">
                      <CheckCircle2 className="size-3.5" /> Done (+25 XP)
                    </span>
                  ) : (
                    <span className="rounded-lg bg-surface-elevated border border-line-soft px-2 py-0.5 font-mono text-[11px] text-brand-cyan hover:border-brand-cyan/60">
                      Mark Watched
                    </span>
                  )}
                </button>
              </div>
              <p className="text-copy-subtle">{placementPlan.english.title} · {placementPlan.english.instructorBrief}</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {placementPlan.english.keyVocabulary.map((v) => (
                  <span key={v} className="rounded bg-surface-dark px-1.5 py-0.5 text-[10px] font-mono text-copy-subtle border border-line-soft">
                    {v}
                  </span>
                ))}
              </div>
            </div>

            {/* 10m Aptitude Video & Lesson */}
            <div
              className={cn(
                "rounded-xl border p-3.5 space-y-2 transition-all",
                store.daily.aptitude ? "border-brand-emerald/50 bg-brand-emerald/5" : "border-line-soft bg-surface-soft"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calculator className="size-4 text-brand-purple" />
                  <span className="font-bold text-foreground">10m Quantitative &amp; Logical Reasoning</span>
                </div>
                <button
                  onClick={() => {
                    store.completeDailyStep("aptitude");
                    toast.success("10m Aptitude Lesson completed (+25 XP)!");
                  }}
                  className="text-xs text-copy-subtle hover:text-foreground"
                >
                  {store.daily.aptitude ? (
                    <span className="flex items-center gap-1 text-brand-emerald font-bold font-mono text-[11px]">
                      <CheckCircle2 className="size-3.5" /> Done (+25 XP)
                    </span>
                  ) : (
                    <span className="rounded-lg bg-surface-elevated border border-line-soft px-2 py-0.5 font-mono text-[11px] text-brand-purple hover:border-brand-purple/60">
                      Mark Watched
                    </span>
                  )}
                </button>
              </div>
              <p className="text-copy-subtle">{placementPlan.aptitude.title} · {placementPlan.aptitude.instructorBrief}</p>
              <div className="rounded-lg bg-surface-dark p-2 text-[11px] font-mono text-brand-purple border border-line-soft/80">
                Rule: {placementPlan.aptitude.formulaShortcut}
              </div>
            </div>

            {/* 10m In-App Guided Practice Drills */}
            <div
              className={cn(
                "rounded-xl border p-3.5 space-y-3 transition-all",
                store.daily.practice ? "border-brand-emerald/50 bg-brand-emerald/5" : "border-line-soft bg-surface-soft"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="size-4 text-brand-emerald" />
                  <span className="font-bold text-foreground">10m In-App Practice Drill &amp; Voice Pitch</span>
                </div>
                <span className="font-mono text-[11px] text-brand-amber font-semibold">
                  {store.daily.practice ? "Verified ✓" : "+25 XP"}
                </span>
              </div>

              {/* Sample MCQ */}
              {placementPlan.practice.mcqs[0] && (
                <div className="rounded-lg bg-surface-dark p-3 border border-line-soft/80 space-y-2">
                  <p className="font-semibold text-foreground text-[11px]">
                    <span className="text-brand-cyan font-mono">Q1.</span> {placementPlan.practice.mcqs[0].q}
                  </p>
                  <div className="grid gap-1 sm:grid-cols-2">
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
                            "rounded border p-1.5 text-left text-[11px] transition-colors",
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
              <div className="rounded-lg bg-surface-dark p-3 border border-line-soft/80 space-y-2">
                <p className="font-semibold text-foreground text-[11px]">
                  🎙️ 60s Voice Pitch: "{placementPlan.practice.voicePrompt.prompt}"
                </p>
                <button
                  onClick={handleRecordVoicePitch}
                  disabled={pitchLoading || pitchRecorded}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brand-cyan to-brand-purple py-2 text-[11px] font-bold text-surface-dark shadow-sm hover:opacity-90 disabled:opacity-60 transition-opacity"
                >
                  <Mic className="size-3.5" />
                  {pitchLoading ? "Analyzing Audio Cadence & STAR Rubric…" : pitchRecorded ? "Voice Pitch Verified (+25 XP) ✓" : "Record 60s AI Voice Pitch"}
                </button>
              </div>
            </div>
          </div>
        </Panel>

        {/* ENGINE 2: 30-MINUTE TECHNICAL LEARNING & SANDBOX */}
        <Panel
          title={`2. ${primaryTrack.name} (30 Mins Daily)`}
          subtitle={`Day ${currentDayNum} (Week ${weekIdx + 1}) · 100% In-Browser Interactive Practice`}
          action={<Chip tone="cyan">{primaryTrack.domain}</Chip>}
        >
          <div className="space-y-4 text-xs">
            {/* Concept Card (5-10 Mins) */}
            <div className="rounded-xl border border-line-soft bg-surface-soft p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-brand-cyan flex items-center gap-1.5">
                  <BookOpen className="size-4" /> 1. Concept Card (20 Mins)
                </span>
                <span className="rounded bg-surface-dark px-2 py-0.5 font-mono text-[10px] text-copy-subtle border border-line-soft">
                  Day {currentDayNum}
                </span>
              </div>
              <h4 className="text-sm font-bold text-foreground">{currentTechDay.topic}</h4>
              <p className="text-copy-subtle leading-relaxed">
                {currentTechDay.practice}
              </p>
              <div className="pt-2 border-t border-line-soft/60 flex items-center justify-between text-[11px] text-copy-subtle">
                <span>Theme: <strong className="text-foreground">{currentWeekPlan.theme}</strong></span>
                <span className="font-mono text-brand-cyan">Target: {currentWeekPlan.workplaceSkill}</span>
              </div>
            </div>

            {/* In-Browser Hands-on Sandbox (15 Mins) */}
            <div className="rounded-xl border border-brand-cyan/30 bg-surface-soft p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-brand-cyan flex items-center gap-1.5">
                  <Terminal className="size-4" /> 2. Interactive Hands-on Sandbox (10 Mins)
                </span>
                <span className="font-mono text-[11px] text-brand-amber font-semibold">+50 XP</span>
              </div>
              <p className="text-copy-subtle">
                Launch the in-browser runtime simulator for <strong>{primaryTrack.name}</strong> to complete today's practical code/analysis challenge.
              </p>

              <div className="rounded-lg bg-surface-dark p-3 border border-line-soft font-mono text-[11px] text-copy-subtle">
                <p className="text-foreground font-bold">Lab: {primaryTrack.labTitle}</p>
                <p className="mt-0.5 text-copy-subtle">Virtual terminal test runner with real-time assertions and error feedback.</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleLaunchTechLab}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-brand-cyan py-2.5 text-xs font-bold text-surface-dark hover:opacity-90 transition-opacity"
                >
                  <Play className="size-3.5 fill-current" /> Launch Interactive Sandbox Lab
                </button>
                <Link
                  to="/student/labs"
                  className="rounded-xl border border-line-soft bg-surface-elevated px-3 py-2.5 text-xs font-bold text-foreground hover:border-brand-cyan/60 transition-colors"
                >
                  All 15 Labs
                </Link>
              </div>
            </div>

            {/* Friday Simulation Notice or Deliverable */}
            <div className="rounded-xl border border-line-soft bg-surface-dark p-3.5 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-brand-purple flex items-center gap-1.5">
                  <Sparkles className="size-3.5" /> Friday Workplace Simulation
                </span>
                <span className="text-[10px] font-mono text-copy-subtle">Week {weekIdx + 1} Mini-Project</span>
              </div>
              <p className="text-foreground font-medium">"{currentWeekPlan.projectTitle}"</p>
              <p className="text-copy-subtle text-[11px]">
                Deliverable: <span className="text-brand-cyan font-mono">{currentWeekPlan.deliverable}</span>
              </p>
            </div>
          </div>
        </Panel>
      </div>

      {/* Quick Enrolled Tracks Switcher Bar */}
      <div className="rounded-2xl border border-line-soft bg-surface-soft/60 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-foreground">Active Technical Specializations (1 to 3 Courses)</p>
            <p className="text-xs text-copy-subtle">
              Primary: <strong className="text-brand-cyan">{primaryTrack.name}</strong> (100% Dual Gate weight) &nbsp;|&nbsp; Enrolled: {store.activeTracks.length} of 3 maximum
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {store.activeTracks.map((tId) => {
              const trk = trackById(tId);
              return (
                <span
                  key={tId}
                  className="rounded-xl border border-line-soft bg-surface-elevated px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm flex items-center gap-1.5"
                >
                  <Code2 className="size-3.5 text-brand-cyan" />
                  {trk.name}
                </span>
              );
            })}
            <Link
              to="/student/settings"
              className="rounded-xl border border-brand-cyan/40 bg-brand-cyan/10 px-3 py-1.5 text-xs font-bold text-brand-cyan hover:bg-brand-cyan/20 transition-colors"
            >
              Change Courses →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
