import { useState, useMemo } from "react";
import type { TrackId } from "@/lib/tracks";
import type { AcceleratorDay } from "@/lib/placement-accelerator-data";
import {
  JourneyProgressBar,
  type JourneyStepId,
  type JourneyStepMeta,
} from "./JourneyProgressBar";
import { RevealCard } from "./RevealCard";
import { ConceptVisual } from "./ConceptVisual";
import { KnowledgeCheck } from "./KnowledgeCheck";
import { GuidedSandbox } from "./GuidedSandbox";
import { MiniGame } from "./MiniGame";
import { ProjectMode } from "./ProjectMode";
import { FinalAssessment } from "./FinalAssessment";
import { CommunicationInteraction } from "./CommunicationInteraction";
import { AptitudeChallenge } from "./AptitudeChallenge";
import { LogicChallenge } from "./LogicChallenge";
import { DailyCompletion } from "./DailyCompletion";
import { useAppStore } from "@/lib/app-store";
import { getLessonForDay } from "@/lib/course-curricula";

interface DailyJourneyRunnerProps {
  dayNum: number;
  trackId: TrackId;
  trackName: string;
  trackShort: string;
  labTitle: string;
  techTopic: string;
  techPractice: string;
  weekTheme: string;
  workplaceSkill: string;
  placementPlan: AcceleratorDay;
  isLabCompleted: boolean;
  isPlacementCompleted: boolean;
  streak: number;
  talentScore: number;
  initialStepOverride?: JourneyStepId | undefined;
  mode?: "technical" | "placement" | "all";
  onCompleteTechnicalLab: () => Promise<void>;
  onCompletePlacement?: () => Promise<void>;
  onRecordVoicePitch?: () => Promise<void>;
  onExit: () => void;
}

export function DailyJourneyRunner({
  dayNum,
  trackId,
  trackName,
  trackShort,
  labTitle,
  techTopic,
  techPractice,
  weekTheme,
  workplaceSkill,
  placementPlan,
  isLabCompleted,
  isPlacementCompleted,
  streak,
  talentScore,
  initialStepOverride,
  mode = "technical",
  onCompleteTechnicalLab,
  onCompletePlacement,
  onRecordVoicePitch,
  onExit,
}: DailyJourneyRunnerProps) {
  const store = useAppStore();

  // Load the authoritative 90-day technical curriculum lesson
  const curriculumLesson = useMemo(() => {
    return getLessonForDay(trackId, dayNum);
  }, [trackId, dayNum]);

  // Build the exact sequence of steps for this day based on mode and curriculum
  const effectiveSteps: JourneyStepMeta[] = useMemo(() => {
    if (mode === "placement") {
      return [
        { id: "placement-communication", label: "Communication", phase: "placement", duration: "2m" },
        { id: "placement-aptitude", label: "Aptitude", phase: "placement", duration: "3m" },
        { id: "placement-logic", label: "Logic Puzzle", phase: "placement", duration: "2m" },
      ];
    }

    const isDay90 = dayNum === 90;
    const isCapstone = curriculumLesson?.isProjectDay && !isDay90;

    const steps: JourneyStepMeta[] = [];

    if (isDay90) {
      steps.push(
        { id: "tech-concept", label: "Exam Overview", phase: "tech", duration: "2m" },
        { id: "final-assessment", label: "Certification Exam", phase: "tech", duration: "15m" }
      );
    } else if (isCapstone) {
      steps.push(
        { id: "tech-concept", label: "Milestone Brief", phase: "tech", duration: "2m" },
        { id: "capstone-project", label: "Capstone Milestone", phase: "tech", duration: "8m" }
      );
    } else {
      // Dynamic lesson pattern derived from 540-lesson curriculum
      if (curriculumLesson?.steps && curriculumLesson.steps.length > 0) {
        curriculumLesson.steps.forEach((s) => {
          if (s.type === "concept-explanation" || s.type === "reveal-card") {
            if (!steps.some((x) => x.id === "tech-concept")) {
              steps.push({ id: "tech-concept", label: s.label, phase: "tech", duration: `${s.durationMinutes}m` });
            }
          } else if (s.type === "concept-visual" || s.type === "animated-intro") {
            if (!steps.some((x) => x.id === "tech-visual")) {
              steps.push({ id: "tech-visual", label: s.label, phase: "tech", duration: `${s.durationMinutes}m` });
            }
          } else if (s.type === "mini-game" && curriculumLesson.miniGame) {
            if (!steps.some((x) => x.id === "tech-minigame")) {
              steps.push({ id: "tech-minigame", label: s.label, phase: "tech", duration: `${s.durationMinutes}m` });
            }
          } else if (s.type === "knowledge-check") {
            if (!steps.some((x) => x.id === "tech-check")) {
              steps.push({ id: "tech-check", label: s.label, phase: "tech", duration: `${s.durationMinutes}m` });
            }
          } else if (s.type === "guided-sandbox" || s.type === "practical-challenge") {
            if (!steps.some((x) => x.id === "tech-sandbox")) {
              steps.push({ id: "tech-sandbox", label: s.label, phase: "tech", duration: `${s.durationMinutes}m` });
            }
          }
        });
      }

      // Safe defaults if empty
      if (steps.length === 0) {
        steps.push(
          { id: "tech-concept", label: "Core Concept", phase: "tech", duration: "2m" },
          { id: "tech-visual", label: "Architecture", phase: "tech", duration: "2m" },
          { id: "tech-check", label: "Quick Check", phase: "tech", duration: "2m" }
        );
        if (curriculumLesson?.miniGame) {
          steps.push({ id: "tech-minigame", label: "Mini-Game Challenge", phase: "tech", duration: "3m" });
        }
        steps.push({ id: "tech-sandbox", label: "Guided Lab", phase: "tech", duration: "4m" });
      }
    }

    if (mode === "all") {
      // Phase 2 Placement Accelerator Steps
      steps.push(
        { id: "placement-communication", label: "Communication", phase: "placement", duration: "2m" },
        { id: "placement-aptitude", label: "Aptitude", phase: "placement", duration: "3m" },
        { id: "placement-logic", label: "Logic Puzzle", phase: "placement", duration: "2m" }
      );
    }

    return steps;
  }, [dayNum, curriculumLesson, mode]);

  // Determine initial step based on override or earliest incomplete step
  const initialStep: JourneyStepId = useMemo(() => {
    if (initialStepOverride) return initialStepOverride;
    if (mode === "placement") {
      if (isPlacementCompleted) return "complete";
      return "placement-communication";
    }
    if (mode === "technical") {
      if (isLabCompleted) return "complete";
    }

    for (const s of effectiveSteps) {
      if (s.id === "tech-sandbox" && isLabCompleted) continue;
      if (s.id === "capstone-project" && isLabCompleted) continue;
      if (s.id === "final-assessment" && isLabCompleted) continue;
      if (s.id === "placement-logic" && isPlacementCompleted) continue;
      if (!store.isDailyStepLocked(dayNum, trackId, s.id)) {
        return s.id;
      }
    }

    return "complete";
  }, [dayNum, trackId, isLabCompleted, isPlacementCompleted, store, effectiveSteps, initialStepOverride, mode]);

  const [currentStep, setCurrentStep] = useState<JourneyStepId>(initialStep);
  const [sessionXp, setSessionXp] = useState<number>(() => {
    let initialXp = 0;
    if (isLabCompleted && mode !== "placement") initialXp += 50;
    if (isPlacementCompleted && mode !== "technical") initialXp += 25;
    const checkRec = store.getDailyStepRecord(dayNum, trackId, "tech-check");
    if (checkRec?.xpAwarded && !isLabCompleted && mode !== "placement") initialXp += 15;
    const aptRec = store.getDailyStepRecord(dayNum, trackId, "placement-aptitude");
    if (aptRec?.xpAwarded && !isPlacementCompleted && mode !== "technical") initialXp += 15;
    return initialXp;
  });

  const addXp = (amount: number) => {
    setSessionXp((prev) => prev + amount);
  };

  const handleStepClick = (stepId: JourneyStepId) => {
    setCurrentStep(stepId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToNextStep = async () => {
    const currentIndex = effectiveSteps.findIndex((s) => s.id === currentStep);
    if (currentIndex >= 0 && currentIndex < effectiveSteps.length - 1) {
      const next = effectiveSteps[currentIndex + 1]!;
      setCurrentStep(next.id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      if (mode === "technical" && !isLabCompleted) {
        await onCompleteTechnicalLab();
      } else if (mode === "placement" && !isPlacementCompleted) {
        if (onCompletePlacement) await onCompletePlacement();
      }
      setCurrentStep("complete");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen pb-16">
      {/* Top sticky progress bar */}
      <JourneyProgressBar
        currentStep={currentStep}
        dayNum={dayNum}
        sessionXp={sessionXp}
        steps={effectiveSteps}
        onExit={onExit}
        onStepClick={handleStepClick}
      />

      {/* Main Content Area Container */}
      <main className="mx-auto w-full max-w-6xl px-2 sm:px-4">
        {currentStep === "tech-concept" && (
          <RevealCard
            dayNum={dayNum}
            trackId={trackId}
            topic={curriculumLesson?.title || techTopic}
            practice={curriculumLesson?.description || techPractice}
            theme={curriculumLesson ? `${curriculumLesson.phaseName} (Phase ${curriculumLesson.phase})` : weekTheme}
            workplaceSkill={workplaceSkill}
            trackName={trackName}
            trackShort={trackShort}
            onNext={goToNextStep}
          />
        )}

        {currentStep === "tech-visual" && (
          <ConceptVisual
            dayNum={dayNum}
            trackId={trackId}
            trackName={trackName}
            topic={curriculumLesson?.title || techTopic}
            onNext={goToNextStep}
          />
        )}

        {currentStep === "tech-check" && (
          <KnowledgeCheck
            dayNum={dayNum}
            trackId={trackId}
            topic={curriculumLesson?.title || techTopic}
            practice={techPractice}
            trackName={trackName}
            onSuccess={(bonus) => addXp(bonus)}
            onNext={goToNextStep}
          />
        )}

        {currentStep === "tech-minigame" && curriculumLesson?.miniGame && (
          <MiniGame
            game={curriculumLesson.miniGame}
            onComplete={async (score, perfect) => {
              addXp(score);
              await store.recordDailyStepAction(dayNum, trackId, "tech-minigame");
              goToNextStep();
            }}
            onSkip={() => goToNextStep()}
          />
        )}

        {currentStep === "capstone-project" && curriculumLesson?.projectConfig && (
          <ProjectMode
            projectConfig={curriculumLesson.projectConfig}
            day={dayNum}
            courseTitle={trackName}
            onComplete={async (deliverableUrl, notes) => {
              await onCompleteTechnicalLab();
              addXp(100);
              goToNextStep();
            }}
            onBack={() => setCurrentStep("tech-visual")}
          />
        )}

        {currentStep === "final-assessment" && (
          <FinalAssessment
            courseId={trackId}
            courseTitle={trackName}
            onComplete={async (score, passed) => {
              if (passed) {
                await onCompleteTechnicalLab();
                addXp(200);
              }
              goToNextStep();
            }}
            onBack={() => setCurrentStep("tech-visual")}
          />
        )}

        {currentStep === "tech-sandbox" && (
          <GuidedSandbox
            dayNum={dayNum}
            trackId={trackId}
            topic={curriculumLesson?.title || techTopic}
            practice={techPractice}
            trackName={trackName}
            labTitle={labTitle}
            isLabCompleted={isLabCompleted}
            onCompleteLab={async () => {
              await onCompleteTechnicalLab();
              addXp(50);
            }}
            onNext={goToNextStep}
          />
        )}

        {currentStep === "placement-communication" && (
          <CommunicationInteraction
            dayNum={dayNum}
            trackId={trackId}
            english={placementPlan.english}
            onNext={goToNextStep}
          />
        )}

        {currentStep === "placement-aptitude" && (
          <AptitudeChallenge
            dayNum={dayNum}
            trackId={trackId}
            aptitude={placementPlan.aptitude}
            mcq={placementPlan.practice.mcqs[0]}
            onSuccess={(bonus) => addXp(bonus)}
            onNext={goToNextStep}
          />
        )}

        {currentStep === "placement-logic" && (
          <LogicChallenge
            dayNum={dayNum}
            trackId={trackId}
            puzzle={placementPlan.practice.puzzle}
            onNext={async () => {
              if (!isPlacementCompleted) {
                const completeFn = onCompletePlacement || onRecordVoicePitch;
                if (completeFn) await completeFn();
                addXp(25);
              }
              goToNextStep();
            }}
          />
        )}

        {currentStep === "complete" && (
          <DailyCompletion
            dayNum={dayNum}
            trackName={trackName}
            topic={curriculumLesson?.title || techTopic}
            theme={curriculumLesson ? `${curriculumLesson.phaseName} (Phase ${curriculumLesson.phase})` : weekTheme}
            placementTheme={placementPlan.theme}
            streak={streak}
            talentScore={talentScore}
            sessionXp={sessionXp}
            onDone={onExit}
          />
        )}
      </main>
    </div>
  );
}
