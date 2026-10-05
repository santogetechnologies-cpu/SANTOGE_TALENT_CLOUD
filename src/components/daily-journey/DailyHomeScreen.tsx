import { useState, useMemo, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  Zap,
  Clock,
  Play,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Lock,
  Check,
  Layers,
  GraduationCap,
  Dumbbell,
  BarChart2,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { trackById, type TrackId, type Track } from "@/lib/tracks";
import { getAcceleratorDay, type AcceleratorDay } from "@/lib/placement-accelerator-data";
import { useAppStore } from "@/lib/app-store";
import {
  getLessonForDay,
  type CourseDayLesson,
} from "@/lib/course-curricula";

export interface DailyHomeScreenProps {
  studentName: string;
  selectedDay: number;
  currentTechnicalDay: number;
  cohortDay: number;
  primaryTrack: Track;
  completedTechDays: number[];
  attendance: number[];
  streak: number;
  talentScore: number;
  assignedTracks?: TrackId[] | undefined;
  onSelectTrack?: ((trackId: TrackId) => void) | undefined;
  onSelectDay: (day: number) => void;
  onStartTechnicalLesson: (stepType?: string) => void;
  onStartPlacementDrill: (drillType: "english" | "aptitude" | "logic" | "all") => void;
}

// Session-level guard: ensures welcome typewriter intro plays strictly ONCE per page load
let hasPlayedWelcomeIntro = false;

export function DailyHomeScreen({
  studentName,
  selectedDay,
  currentTechnicalDay,
  cohortDay,
  primaryTrack,
  completedTechDays,
  attendance,
  streak,
  talentScore,
  assignedTracks,
  onSelectTrack,
  onSelectDay,
  onStartTechnicalLesson,
  onStartPlacementDrill,
}: DailyHomeScreenProps) {
  const store = useAppStore();
  const [showFullDayRail, setShowFullDayRail] = useState(false);

  // Compute greeting from local time
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const firstName = studentName ? studentName.trim().split(" ")[0] : "Student";

  // Typewriter effect for "WELCOME TO SANTOGE TALENT CLOUD" heading
  // Runs strictly ONCE per page load at ~50ms per character, never loops, fades cursor on completion
  const LINE_1 = "WELCOME TO";
  const LINE_2_DARK = "SANTOGE ";
  const LINE_2_BLUE = "TALENT CLOUD";
  const TOTAL_TYPEWRITER_CHARS = LINE_1.length + LINE_2_DARK.length + LINE_2_BLUE.length; // 10 + 8 + 12 = 30

  const [typewriterIndex, setTypewriterIndex] = useState(() =>
    hasPlayedWelcomeIntro ? TOTAL_TYPEWRITER_CHARS : 0,
  );
  const [isTypewriterDone, setIsTypewriterDone] = useState(
    () => hasPlayedWelcomeIntro,
  );
  const [isCursorFading, setIsCursorFading] = useState(false);

  useEffect(() => {
    if (hasPlayedWelcomeIntro) {
      setTypewriterIndex(TOTAL_TYPEWRITER_CHARS);
      setIsTypewriterDone(true);
      return;
    }

    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      hasPlayedWelcomeIntro = true;
      setTypewriterIndex(TOTAL_TYPEWRITER_CHARS);
      setIsTypewriterDone(true);
      return;
    }

    let current = 0;
    const timer = setInterval(() => {
      current += 1;
      setTypewriterIndex(current);
      if (current >= TOTAL_TYPEWRITER_CHARS) {
        clearInterval(timer);
        hasPlayedWelcomeIntro = true;
        // Fade the cursor out smoothly before removing
        setIsCursorFading(true);
        setTimeout(() => {
          setIsTypewriterDone(true);
        }, 300);
      }
    }, 50);

    return () => clearInterval(timer);
  }, [TOTAL_TYPEWRITER_CHARS]);

  const line1Typed = useMemo(
    () => LINE_1.slice(0, Math.min(LINE_1.length, typewriterIndex)),
    [typewriterIndex],
  );

  const line2Typed = useMemo(() => {
    if (typewriterIndex <= LINE_1.length) {
      return { dark: "", blue: "" };
    }
    const line2Index = typewriterIndex - LINE_1.length;
    const darkTyped = LINE_2_DARK.slice(0, Math.min(LINE_2_DARK.length, line2Index));
    const blueIndex = Math.max(0, line2Index - LINE_2_DARK.length);
    const blueTyped = LINE_2_BLUE.slice(0, Math.min(LINE_2_BLUE.length, blueIndex));
    return { dark: darkTyped, blue: blueTyped };
  }, [typewriterIndex]);

  // Load authoritative curriculum lesson for selected day
  const curriculumLesson: CourseDayLesson | null = useMemo(() => {
    return getLessonForDay(primaryTrack.id, selectedDay);
  }, [primaryTrack.id, selectedDay]);

  // Day states
  const isDayCompleted = completedTechDays.includes(selectedDay);
  const isDayLocked = selectedDay > currentTechnicalDay;
  const isPlacementDone = attendance.includes(cohortDay);

  // Compute realtime status for each dynamic lesson step
  const dynamicSteps = useMemo(() => {
    const isDay90 = selectedDay === 90;
    const isCapstone = Boolean(curriculumLesson?.isProjectDay && !isDay90);

    if (isDay90) {
      const s1Done = Boolean(store.getDailyStepRecord(selectedDay, primaryTrack.id, "tech-concept")?.isLocked || isDayCompleted);
      const s2Done = isDayCompleted;
      return [
        { stepNum: 1, stepId: "tech-concept", label: "Exam Overview", durationMinutes: 2, xpReward: 20, isDone: s1Done },
        { stepNum: 2, stepId: "final-assessment", label: "Certification Exam", durationMinutes: 15, xpReward: 180, isDone: s2Done },
      ];
    }

    if (isCapstone) {
      const s1Done = Boolean(store.getDailyStepRecord(selectedDay, primaryTrack.id, "tech-concept")?.isLocked || isDayCompleted);
      const s2Done = isDayCompleted;
      return [
        { stepNum: 1, stepId: "tech-concept", label: "Milestone Brief", durationMinutes: 2, xpReward: 20, isDone: s1Done },
        { stepNum: 2, stepId: "capstone-project", label: "Capstone Milestone", durationMinutes: 10, xpReward: 80, isDone: s2Done },
      ];
    }

    // 5 Canonical Technical Mastery Steps for Days 1 to 75
    const s1Done = Boolean(store.getDailyStepRecord(selectedDay, primaryTrack.id, "tech-concept")?.isLocked || isDayCompleted);
    const s2Done = Boolean(store.getDailyStepRecord(selectedDay, primaryTrack.id, "tech-visual")?.isLocked || isDayCompleted);
    const s3Done = Boolean(store.getDailyStepRecord(selectedDay, primaryTrack.id, "tech-minigame")?.isLocked || isDayCompleted);
    const s4Done = Boolean(
      store.getKnowledgeCheck(selectedDay, primaryTrack.id)?.isLocked ||
      store.getDailyStepRecord(selectedDay, primaryTrack.id, "tech-check")?.isLocked ||
      isDayCompleted
    );
    const s5Done = Boolean(store.getDailyStepRecord(selectedDay, primaryTrack.id, "tech-sandbox")?.isLocked || isDayCompleted);

    return [
      {
        stepNum: 1,
        stepId: "tech-concept",
        label: "Core Concept",
        durationMinutes: 2,
        xpReward: 15,
        isDone: s1Done,
      },
      {
        stepNum: 2,
        stepId: "tech-visual",
        label: "Architecture Flow",
        durationMinutes: 2,
        xpReward: 15,
        isDone: s2Done,
      },
      {
        stepNum: 3,
        stepId: "tech-minigame",
        label: curriculumLesson?.miniGame?.title || "Mini-Game Challenge",
        durationMinutes: 3,
        xpReward: 15,
        isDone: s3Done,
      },
      {
        stepNum: 4,
        stepId: "tech-check",
        label: "Knowledge Check",
        durationMinutes: 2,
        xpReward: 15,
        isDone: s4Done,
      },
      {
        stepNum: 5,
        stepId: "tech-sandbox",
        label: "Guided Lab",
        durationMinutes: 4,
        xpReward: 15,
        isDone: s5Done,
      },
    ];
  }, [curriculumLesson, selectedDay, primaryTrack.id, isDayCompleted, store]);

  const completedStepsCount = useMemo(
    () => dynamicSteps.filter((s) => s.isDone).length,
    [dynamicSteps],
  );

  // Find earliest incomplete step for clean resume
  const activeStep = useMemo(() => {
    if (isDayCompleted) {
      return dynamicSteps[0]!;
    }
    return dynamicSteps.find((s) => !s.isDone) || dynamicSteps[0]!;
  }, [dynamicSteps, isDayCompleted]);

  // Total XP for today's lesson
  const lessonXp = useMemo(() => {
    if (selectedDay === 90) return 200;
    if (curriculumLesson?.isProjectDay) return 100;
    return 75;
  }, [selectedDay, curriculumLesson]);

  // Clean formatted objectives for "What you'll learn"
  const summaryObjectives = useMemo(() => {
    if (curriculumLesson?.learningObjectives && curriculumLesson.learningObjectives.length > 0) {
      return curriculumLesson.learningObjectives.slice(0, 4);
    }
    const topic = curriculumLesson?.title || "Daily Engineering Principles";
    return [
      `Master core architecture and runtime patterns of ${topic}`,
      `Explain how compiler and runtime constraints maintain system stability`,
      `Apply production patterns to avoid common bugs and performance pitfalls`,
    ];
  }, [curriculumLesson]);

  // 9-day rail window (centered around selectedDay) for optional expanded navigator
  const dayWindow = useMemo(() => {
    const start = Math.max(1, Math.min(82, selectedDay - 4));
    return Array.from({ length: 9 }, (_, i) => start + i);
  }, [selectedDay]);

  return (
    <div className="mx-auto w-full max-w-[1240px] px-3 sm:px-6 lg:px-8 space-y-4 sm:space-y-5 pb-12 phase-enter">
      {/* ========================================================
          WELCOME HERO BANNER (MATCHING REFERENCE IMAGE)
          ======================================================== */}
      <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-[#eef6ff] via-[#f3f8fe] to-[#edf4fc] px-6 py-4.5 sm:px-8 sm:py-5 lg:px-9 lg:py-5 border border-blue-100/70 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 lg:gap-8">
          {/* Left Text Block */}
          <div className="space-y-2 sm:space-y-2.5 max-w-xl">
            <h1
              aria-label="WELCOME TO SANTOGE TALENT CLOUD"
              className="text-3xl sm:text-4xl lg:text-[40px] font-black tracking-tight text-[#0f172a] uppercase leading-[1.14] min-h-[2.28em]"
            >
              {isTypewriterDone ? (
                <>
                  <span>WELCOME TO</span>
                  <br />
                  <span>SANTOGE </span>
                  <span className="text-[#2563eb]">TALENT CLOUD</span>
                </>
              ) : typewriterIndex <= LINE_1.length ? (
                <>
                  <span>{line1Typed}</span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "inline-block w-[3.5px] h-[0.8em] ml-1.5 bg-[#2563eb] rounded-full align-middle transition-opacity duration-300",
                      isCursorFading ? "opacity-0" : "opacity-100 animate-pulse",
                    )}
                  />
                  <br />
                  <span className="invisible select-none opacity-0">SANTOGE TALENT CLOUD</span>
                </>
              ) : (
                <>
                  <span>{LINE_1}</span>
                  <br />
                  <span>{line2Typed.dark}</span>
                  <span className="text-[#2563eb]">{line2Typed.blue}</span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "inline-block w-[3.5px] h-[0.8em] ml-1.5 bg-[#2563eb] rounded-full align-middle transition-opacity duration-300",
                      isCursorFading ? "opacity-0" : "opacity-100 animate-pulse",
                    )}
                  />
                </>
              )}
            </h1>

            <p className="pt-0.5 text-lg sm:text-xl font-bold text-[#0f172a] flex items-center gap-1.5">
              <span>{greeting}, {firstName}</span>
              <span className="inline-block text-xl">👋</span>
            </p>

            <p className="text-sm sm:text-base text-slate-500 font-normal">
              Ready for today's class? Let's learn something new.
            </p>

            {/* Assigned Course Switcher (Pill list if student has multiple tracks) */}
            {assignedTracks && assignedTracks.length > 1 && (
              <div className="pt-1 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                  Active Course:
                </span>
                {assignedTracks.map((tId) => {
                  const trk = trackById(tId);
                  const isActive = tId === primaryTrack.id;
                  return (
                    <button
                      key={tId}
                      type="button"
                      onClick={() => onSelectTrack && onSelectTrack(tId)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all cursor-pointer shadow-2xs",
                        isActive
                          ? "bg-[#2563eb] text-white shadow-blue-500/20"
                          : "bg-white text-slate-700 hover:text-[#2563eb] hover:border-blue-200 border border-blue-100/80",
                      )}
                    >
                      <span
                        className={cn("size-2 rounded-full", isActive ? "bg-white" : "")}
                        style={!isActive ? { background: trk.accent } : undefined}
                      />
                      <span>{trk.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Decorative Graphic: 3D Stack of Books with Graduation Cap & Floating Badges */}
          <div className="relative shrink-0 self-center md:self-auto w-full max-w-[340px] sm:max-w-none sm:w-[410px] lg:w-[450px] min-h-[205px] sm:h-[215px] lg:h-[225px] flex flex-col sm:flex-row items-center justify-center select-none py-1 sm:py-0">
            {/* Ambient soft glow background */}
            <div className="absolute inset-0 bg-radial from-blue-300/35 via-sky-100/25 to-transparent blur-2xl -z-10" />

            {/* Subtle Decorative Confetti Particles (Desktop/Tablet) */}
            <div className="hidden sm:block pointer-events-none">
              {/* Curved cyan ribbon fleck */}
              <svg
                className="hero-particle absolute top-2 right-14 sm:right-20 size-4.5 opacity-70"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 18C7 10 14 14 18 6"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
              {/* Tiny gold sparkle */}
              <svg
                className="hero-particle absolute top-7 right-1 sm:right-3 size-3 opacity-80"
                viewBox="0 0 16 16"
                fill="#fbbf24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5L8 0Z" />
              </svg>
              {/* Tiny cyan sparkle */}
              <svg
                className="hero-particle absolute bottom-6 left-1 sm:left-3 size-3 opacity-70"
                viewBox="0 0 16 16"
                fill="#38bdf8"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5L8 0Z" />
              </svg>
              {/* Tiny soft blue dot */}
              <span className="hero-particle absolute bottom-4 right-20 size-1.5 rounded-full bg-blue-400/60" />
            </div>

            {/* Central 3D Illustration: Books + Graduation Cap */}
            <div className="hero-main-float relative flex items-center justify-center pointer-events-none mb-2 sm:mb-0">
              <img
                src="/images/hero-education.png"
                alt="SantoGe Talent Cloud Learning"
                className="w-[185px] sm:w-[205px] lg:w-[225px] h-auto object-contain drop-shadow-[0_14px_28px_rgba(37,99,235,0.12)] select-none"
                loading="eager"
              />
            </div>

            {/* Badges: Floated around illustration on Tablet/Desktop, cleanly stacked on Mobile */}
            <div className="sm:contents flex flex-wrap items-center justify-center gap-2.5 pt-1 sm:pt-0">
              {/* Floating Pill 1: Learn Step by Step (Upper-Left near illustration) */}
              <div className="hero-badge-1 sm:absolute sm:top-1 sm:left-1 lg:left-2 z-20 flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-white via-white to-blue-50/80 border border-blue-200/80 px-3 sm:px-3.5 py-2 shadow-[0_8px_20px_rgba(37,99,235,0.08)] pointer-events-auto hover-float transition-all w-[140px] sm:w-[148px] h-[54px] sm:h-[58px]">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2563eb] border border-blue-100/70 shadow-2xs">
                  <BookOpen className="size-4.5 stroke-[2.2]" />
                </div>
                <div className="text-left leading-tight pr-0.5">
                  <p className="text-[13px] font-bold text-[#0f172a] leading-tight mb-0.5">Learn</p>
                  <p className="text-[10.5px] text-[#2563eb] font-semibold tracking-tight">Step by Step</p>
                </div>
              </div>

              {/* Floating Pill 2: Build Your Skills (Upper-Right near illustration) */}
              <div className="hero-badge-2 sm:absolute sm:top-1 sm:right-1 lg:right-2 z-20 flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-white via-white to-emerald-50/80 border border-emerald-200/80 px-3 sm:px-3.5 py-2 shadow-[0_8px_20px_rgba(16,185,129,0.08)] pointer-events-auto hover-float transition-all w-[140px] sm:w-[148px] h-[54px] sm:h-[58px]">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/70 shadow-2xs">
                  <BarChart2 className="size-4.5 stroke-[2.2]" />
                </div>
                <div className="text-left leading-tight pr-0.5">
                  <p className="text-[13px] font-bold text-[#0f172a] leading-tight mb-0.5">Build</p>
                  <p className="text-[10.5px] text-emerald-600 font-semibold tracking-tight">Your Skills</p>
                </div>
              </div>

              {/* Floating Pill 3: Reach Your Goals (Lower-Right near platform base) */}
              <div className="hero-badge-3 sm:absolute sm:bottom-1.5 sm:right-1 lg:right-2 z-20 flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-white via-white to-orange-50/80 border border-orange-200/80 px-3 sm:px-3.5 py-2 shadow-[0_8px_20px_rgba(249,115,22,0.08)] pointer-events-auto hover-float transition-all w-[140px] sm:w-[148px] h-[54px] sm:h-[58px]">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500 border border-orange-100/70 shadow-2xs">
                  <Target className="size-4.5 stroke-[2.2]" />
                </div>
                <div className="text-left leading-tight pr-0.5">
                  <p className="text-[13px] font-bold text-[#0f172a] leading-tight mb-0.5">Reach</p>
                  <p className="text-[10.5px] text-orange-600 font-semibold tracking-tight">Your Goals</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          TODAY'S CLASS SECTION (CONTENT-FIRST FULL WIDTH)
          ======================================================== */}
      <section className="relative overflow-hidden rounded-[24px] border border-blue-100/80 bg-white p-6 sm:p-8 lg:p-9 shadow-[0_4px_20px_rgba(15,23,42,0.03)] transition-all">
        {/* Top-left vibrant blue corner accent badge */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 w-11 h-11 bg-[#2563eb] rounded-tl-[24px] rounded-br-2xl pointer-events-none"
        />

        {/* 1. Context Meta Tag: DAY X OF 90 · [TRACK NAME] */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-full bg-[#eff6ff] border border-blue-200/70 px-3.5 py-0.5 text-xs font-bold text-[#2563eb] tracking-wide uppercase">
              DAY {selectedDay} OF 90
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              · {primaryTrack.name}
            </span>
          </div>

          {isDayCompleted ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-0.5 text-xs font-bold text-emerald-600">
              <CheckCircle2 className="size-3.5" />
              <span>Completed</span>
            </span>
          ) : isDayLocked ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-3 py-0.5 text-xs font-bold text-amber-600">
              <Lock className="size-3" />
              <span>Locked</span>
            </span>
          ) : completedStepsCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-0.5 text-xs font-bold text-blue-600">
              <span className="size-2 rounded-full bg-blue-600 animate-pulse" />
              <span>Step {activeStep.stepNum} of {dynamicSteps.length}</span>
            </span>
          ) : null}
        </div>

        {/* 2. Subtitle: TODAY'S CLASS with book icon */}
        <div className="mt-4 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#2563eb]">
          <BookOpen className="size-4 stroke-[2.5]" />
          <span>TODAY'S CLASS</span>
        </div>

        {/* 3. Main Lesson Title */}
        <h2 className="mt-2 text-2xl sm:text-3xl lg:text-[34px] font-black tracking-tight text-[#0f172a] leading-tight max-w-4xl">
          {curriculumLesson?.title || `Day ${selectedDay} Technical Mastery`}
        </h2>

        {/* 4. Short Explanation */}
        <p className="mt-2.5 text-sm sm:text-base text-slate-500 font-normal leading-relaxed max-w-4xl">
          {curriculumLesson?.description ||
            "Master foundational architecture, core programming patterns, and enterprise system principles."}
        </p>

        {/* 5. "WHAT YOU'LL LEARN TODAY" Box (2-Column: Objectives Left, Dedicated CTA Right) */}
        <div className="mt-6 rounded-2xl border border-blue-100/80 bg-[#f8fbff] p-5 sm:p-6 lg:p-7 shadow-2xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            {/* LEFT SIDE: Objectives (Title, Concepts Badge, Step Items with Checks) */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col justify-center">
              {/* Header Row */}
              <div className="flex items-center justify-between mb-4 pb-1">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-blue-100 text-[#2563eb]">
                    <Target className="size-4 stroke-[2.5]" />
                  </div>
                  <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#0f172a]">
                    WHAT YOU'LL LEARN TODAY
                  </span>
                </div>
                <span className="rounded-full bg-[#eff6ff] border border-blue-200/70 px-3 py-0.5 text-xs font-bold text-[#2563eb]">
                  {summaryObjectives.length} key concepts
                </span>
              </div>

              {/* Objective Rows with Number Badges and Dashed Connector Line */}
              <div className="space-y-3.5 relative py-1">
                {summaryObjectives.map((obj, idx) => {
                  const numStr = String(idx + 1).padStart(2, "0");
                  const isLast = idx === summaryObjectives.length - 1;

                  return (
                    <div
                      key={idx}
                      className="relative flex items-center justify-between gap-3 text-xs sm:text-sm"
                    >
                      {/* Left: Number Badge + Vertical Dashed Connector Line */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="relative flex flex-col items-center shrink-0">
                          <div className="flex size-7 sm:size-8 items-center justify-center rounded-xl bg-[#e0edff] text-[#2563eb] font-mono font-bold text-xs shadow-2xs z-10">
                            {numStr}
                          </div>
                          {!isLast && (
                            <div className="absolute top-7 bottom-[-18px] w-0 border-l-2 border-dashed border-blue-200/90" />
                          )}
                        </div>

                        {/* Text */}
                        <p className="text-slate-700 leading-snug font-medium line-clamp-2">
                          {obj}
                        </p>
                      </div>

                      {/* Right: Soft Green Checkmark Badge */}
                      <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#dcfce7] text-[#16a34a] shadow-2xs ml-2">
                        <Check className="size-3.5 stroke-[3]" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT SIDE: Dedicated Premium CTA Area */}
            <div className="lg:col-span-5 xl:col-span-4 flex flex-col items-center justify-center border-t border-blue-100/90 pt-5 lg:border-t-0 lg:border-l lg:border-blue-100/90 lg:pt-0 lg:pl-6 xl:pl-8">
              <div className="w-full sm:w-auto lg:w-full max-w-[270px] flex flex-col items-center text-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (isDayLocked) return;
                    onStartTechnicalLesson(activeStep ? activeStep.stepId : undefined);
                  }}
                  disabled={isDayLocked}
                  className={cn(
                    "group relative inline-flex items-center justify-center gap-2.5 rounded-xl px-7 py-3.5 sm:py-4 text-sm sm:text-base font-bold transition-all duration-200 cursor-pointer w-full shadow-md",
                    isDayLocked
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                      : isDayCompleted
                        ? "bg-emerald-600 text-white hover:bg-emerald-500 shadow-[0_8px_20px_rgba(16,185,129,0.22)] hover:shadow-[0_12px_28px_rgba(16,185,129,0.32)] hover:-translate-y-0.5 active:translate-y-0"
                        : "bg-[#2563eb] text-white hover:bg-[#1d4ed8] shadow-[0_8px_20px_rgba(37,99,235,0.25)] hover:shadow-[0_14px_28px_rgba(37,99,235,0.38)] hover:-translate-y-0.5 active:translate-y-0 ring-4 ring-blue-500/10 hover:ring-blue-500/20",
                  )}
                >
                  {isDayLocked ? (
                    <>
                      <Lock className="size-4" />
                      <span>Complete Day {selectedDay - 1} First</span>
                    </>
                  ) : isDayCompleted ? (
                    <>
                      <CheckCircle2 className="size-4" />
                      <span>Review Lesson</span>
                      <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </>
                  ) : completedStepsCount > 0 ? (
                    <>
                      <Play className="size-4 fill-current" />
                      <span>Continue (Step {activeStep.stepNum}/{dynamicSteps.length})</span>
                      <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </>
                  ) : (
                    <>
                      <Play className="size-4 fill-current" />
                      <span>START LEARNING</span>
                      <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium">
                  <GraduationCap className="size-4 text-slate-400" />
                  <span>Learn one step at a time.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 6. Metadata Row: Time / Reward / Level */}
        <div className="mt-5 flex flex-wrap items-center gap-6 sm:gap-10 text-sm py-1">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-xl bg-blue-50 text-[#2563eb]">
              <Clock className="size-4 stroke-[2.2]" />
            </div>
            <span className="text-slate-500 font-medium text-xs sm:text-sm">Time:</span>
            <span className="font-bold text-[#0f172a] text-xs sm:text-sm">
              {curriculumLesson?.estimatedMinutes ?? 13} min
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
              <Zap className="size-4 fill-orange-500 text-orange-500" />
            </div>
            <span className="text-slate-500 font-medium text-xs sm:text-sm">Reward:</span>
            <span className="font-bold text-[#2563eb] text-xs sm:text-sm">
              +{lessonXp} XP
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <BarChart2 className="size-4 stroke-[2.2]" />
            </div>
            <span className="text-slate-500 font-medium text-xs sm:text-sm">Level:</span>
            <span className="font-bold text-[#0f172a] text-xs sm:text-sm capitalize">
              {curriculumLesson?.difficulty || "Beginner"}
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================
          DAY NAVIGATION (BELOW MAIN LESSON CARD)
          ======================================================== */}
      <div className="rounded-2xl border border-blue-100/80 bg-white px-5 py-3 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          {/* Left: Previous Day, Current Day, Next Day */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSelectDay(Math.max(1, selectedDay - 1))}
              disabled={selectedDay <= 1}
              className="flex items-center gap-1 rounded-lg border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-blue-50/60 hover:text-[#2563eb] hover:border-blue-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
            >
              <ChevronLeft className="size-3.5" />
              <span>Day {selectedDay - 1}</span>
            </button>

            <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm px-3">
              Day {selectedDay} of 90
            </span>

            <button
              type="button"
              onClick={() => onSelectDay(Math.min(90, selectedDay + 1))}
              disabled={selectedDay >= 90}
              className="flex items-center gap-1 rounded-lg border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-blue-50/60 hover:text-[#2563eb] hover:border-blue-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
            >
              <span>Day {selectedDay + 1}</span>
              <ChevronRight className="size-3.5" />
            </button>

            {selectedDay !== currentTechnicalDay && (
              <button
                type="button"
                onClick={() => onSelectDay(currentTechnicalDay)}
                className="ml-2 font-bold text-[#2563eb] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Jump to Today (Day {currentTechnicalDay})</span>
                <ArrowRight className="size-3" />
              </button>
            )}
          </div>

          {/* Right: Browse all 90 days link */}
          <button
            type="button"
            onClick={() => setShowFullDayRail(!showFullDayRail)}
            className="font-bold text-[#2563eb] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{showFullDayRail ? "Hide 90-Day Navigator" : "Browse all 90 days"}</span>
            <ArrowRight className="size-3.5" />
          </button>
        </div>

        {/* Optional Expandable 90-Day Mini Navigator */}
        {showFullDayRail && (
          <div className="pt-3 mt-3 border-t border-slate-100 phase-enter space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>90-Day Progression Rail:</span>
              <span className="font-mono">
                {completedTechDays.length}/90 Completed (
                {Math.round((completedTechDays.length / 90) * 100)}%)
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1">
              {dayWindow.map((d) => {
                const isCompleted = completedTechDays.includes(d);
                const isCurrent = d === currentTechnicalDay;
                const isSelected = d === selectedDay;
                const isLocked = d > currentTechnicalDay;

                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => onSelectDay(d)}
                    className={cn(
                      "flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer shadow-2xs",
                      isSelected
                        ? "bg-[#2563eb] text-white shadow-xs font-bold"
                        : isCompleted
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100"
                          : isCurrent
                            ? "bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100"
                            : isLocked
                              ? "bg-slate-50 text-slate-400 border border-slate-200/60"
                              : "bg-white text-slate-700 border border-blue-100/90 hover:bg-blue-50/60 hover:text-[#2563eb] hover:border-blue-200",
                    )}
                    title={isLocked ? `Day ${d} is locked.` : `Day ${d}`}
                  >
                    {isCompleted ? (
                      <Check className="size-3 stroke-[3]" />
                    ) : isLocked ? (
                      <Lock className="size-2.5 opacity-60" />
                    ) : null}
                    <span>Day {d}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          SECONDARY: PLACEMENT ACCELERATOR (SEPARATE & SUBTLE)
          ======================================================== */}
      <div className="rounded-xl border border-purple-200/80 bg-purple-50/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 shadow-2xs">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-purple-100/70 border border-purple-200 px-2 py-0.5 font-mono text-[10px] font-bold text-purple-700">
              Cohort Day {cohortDay}
            </span>
            <h4 className="text-xs sm:text-sm font-semibold text-slate-900">
              Placement Accelerator (8-Min Daily Routine)
            </h4>
            {isPlacementDone && (
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                <Check className="size-3 stroke-[3]" /> Completed
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500">
            Synchronized cohort routine: Verbal communication, quantitative aptitude & analytical logic.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onStartPlacementDrill("all")}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all shrink-0 cursor-pointer",
            isPlacementDone
              ? "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              : "bg-purple-600 text-white hover:bg-purple-500 shadow-xs",
          )}
        >
          <Play className="size-3 fill-current" />
          <span>{isPlacementDone ? "Review Placement Drill" : "Start Placement Routine (+50 XP)"}</span>
        </button>
      </div>

      {/* ========================================================
          FOOTER: QUICK SECONDARY LINKS
          ======================================================== */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-1 text-xs text-slate-400 border-t border-slate-200/60">
        <Link
          to="/student/technical"
          className="flex items-center gap-1 hover:text-slate-700 hover:underline transition-colors"
        >
          <Layers className="size-3 text-slate-400" />
          <span>90-Day Full Syllabus</span>
        </Link>
        <span>·</span>
        <Link
          to="/student/exercises"
          className="flex items-center gap-1 hover:text-slate-700 hover:underline transition-colors"
        >
          <Dumbbell className="size-3 text-slate-400" />
          <span>Daily Exercises Dashboard</span>
        </Link>
        <span>·</span>
        <Link
          to="/student/gateway"
          className="flex items-center gap-1 hover:text-slate-700 hover:underline transition-colors"
        >
          <GraduationCap className="size-3 text-slate-400" />
          <span>Career Gateway (Phase 2)</span>
        </Link>
      </div>
    </div>
  );
}
