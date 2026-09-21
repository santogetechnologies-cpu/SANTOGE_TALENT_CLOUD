import { useState, useMemo } from "react";
import type { TrackId } from "@/lib/tracks";
import type { AcceleratorDay } from "@/lib/placement-accelerator-data";
import {
  JourneyProgressBar,
  type JourneyStepId,
  JOURNEY_STEPS,
} from "./JourneyProgressBar";
import { RevealCard } from "./RevealCard";
import { ConceptVisual } from "./ConceptVisual";
import { KnowledgeCheck } from "./KnowledgeCheck";
import { GuidedSandbox } from "./GuidedSandbox";
import { CommunicationInteraction } from "./CommunicationInteraction";
import { AptitudeChallenge } from "./AptitudeChallenge";
import { LogicChallenge } from "./LogicChallenge";
import { DailyCompletion } from "./DailyCompletion";
import { useAppStore } from "@/lib/app-store";

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
  onCompleteTechnicalLab,
  onCompletePlacement,
  onRecordVoicePitch,
  onExit,
}: DailyJourneyRunnerProps) {
  const store = useAppStore();

  // Determine initial step based on the earliest incomplete step
  const initialStep: JourneyStepId = useMemo(() => {
    if (isLabCompleted && isPlacementCompleted) return "complete";

    const steps: JourneyStepId[] = [
      "tech-concept",
      "tech-visual",
      "tech-check",
      "tech-sandbox",
      "placement-communication",
      "placement-aptitude",
      "placement-logic",
    ];

    for (const s of steps) {
      if (s === "tech-sandbox" && isLabCompleted) continue;
      if (s === "placement-logic" && isPlacementCompleted) continue;
      if (!store.isDailyStepLocked(dayNum, trackId, s)) {
        return s;
      }
    }

    return "complete";
  }, [dayNum, trackId, isLabCompleted, isPlacementCompleted, store]);

  const [currentStep, setCurrentStep] = useState<JourneyStepId>(initialStep);
  const [sessionXp, setSessionXp] = useState<number>(() => {
    let initialXp = 0;
    if (isLabCompleted) initialXp += 50;
    if (isPlacementCompleted) initialXp += 25;
    const checkRec = store.getDailyStepRecord(dayNum, trackId, "tech-check");
    if (checkRec?.xpAwarded && !isLabCompleted) initialXp += 15;
    const aptRec = store.getDailyStepRecord(dayNum, trackId, "placement-aptitude");
    if (aptRec?.xpAwarded && !isPlacementCompleted) initialXp += 15;
    return initialXp;
  });

  const addXp = (amount: number) => {
    setSessionXp((prev) => prev + amount);
  };

  const handleStepClick = (stepId: JourneyStepId) => {
    setCurrentStep(stepId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToNextStep = () => {
    const currentIndex = JOURNEY_STEPS.findIndex((s) => s.id === currentStep);
    if (currentIndex >= 0 && currentIndex < JOURNEY_STEPS.length - 1) {
      const next = JOURNEY_STEPS[currentIndex + 1]!;
      setCurrentStep(next.id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
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
        onExit={onExit}
        onStepClick={handleStepClick}
      />

      {/* Main Content Area Container */}
      <main className="mx-auto w-full max-w-6xl px-2 sm:px-4">
        {currentStep === "tech-concept" && (
          <RevealCard
            dayNum={dayNum}
            trackId={trackId}
            topic={techTopic}
            practice={techPractice}
            theme={weekTheme}
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
            topic={techTopic}
            onNext={goToNextStep}
          />
        )}

        {currentStep === "tech-check" && (
          <KnowledgeCheck
            dayNum={dayNum}
            trackId={trackId}
            topic={techTopic}
            trackName={trackName}
            onSuccess={(bonus) => addXp(bonus)}
            onNext={goToNextStep}
          />
        )}

        {currentStep === "tech-sandbox" && (
          <GuidedSandbox
            dayNum={dayNum}
            trackId={trackId}
            topic={techTopic}
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
            topic={techTopic}
            theme={weekTheme}
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
