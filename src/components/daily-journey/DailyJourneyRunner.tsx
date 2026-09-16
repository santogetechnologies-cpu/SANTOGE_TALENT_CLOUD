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
import { VoicePractice } from "./VoicePractice";
import { DailyCompletion } from "./DailyCompletion";

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
  onRecordVoicePitch: () => Promise<void>;
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
  onRecordVoicePitch,
  onExit,
}: DailyJourneyRunnerProps) {
  // Determine initial step based on what's already completed
  const initialStep: JourneyStepId = useMemo(() => {
    if (isLabCompleted && isPlacementCompleted) return "complete";
    if (isLabCompleted) return "placement-communication";
    return "tech-concept";
  }, [isLabCompleted, isPlacementCompleted]);

  const [currentStep, setCurrentStep] = useState<JourneyStepId>(initialStep);
  const [sessionXp, setSessionXp] = useState<number>(() => {
    let initialXp = 0;
    if (isLabCompleted) initialXp += 50;
    if (isPlacementCompleted) initialXp += 25;
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
      <main className="mx-auto max-w-5xl px-4 sm:px-6">
        {currentStep === "tech-concept" && (
          <RevealCard
            dayNum={dayNum}
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
            trackId={trackId}
            trackName={trackName}
            topic={techTopic}
            onNext={goToNextStep}
          />
        )}

        {currentStep === "tech-check" && (
          <KnowledgeCheck
            topic={techTopic}
            trackName={trackName}
            onSuccess={(bonus) => addXp(bonus)}
            onNext={goToNextStep}
          />
        )}

        {currentStep === "tech-sandbox" && (
          <GuidedSandbox
            dayNum={dayNum}
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
            english={placementPlan.english}
            onNext={goToNextStep}
          />
        )}

        {currentStep === "placement-aptitude" && (
          <AptitudeChallenge
            dayNum={dayNum}
            aptitude={placementPlan.aptitude}
            mcq={placementPlan.practice.mcqs[0]}
            onSuccess={(bonus) => addXp(bonus)}
            onNext={goToNextStep}
          />
        )}

        {currentStep === "placement-logic" && (
          <LogicChallenge
            dayNum={dayNum}
            puzzle={placementPlan.practice.puzzle}
            onNext={goToNextStep}
          />
        )}

        {currentStep === "placement-voice" && (
          <VoicePractice
            dayNum={dayNum}
            voicePrompt={placementPlan.practice.voicePrompt}
            isPitchCompleted={isPlacementCompleted}
            onRecordPitch={async () => {
              await onRecordVoicePitch();
              addXp(25);
            }}
            onFinishJourney={() => {
              setCurrentStep("complete");
              window.scrollTo({ top: 0, behavior: "smooth" });
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
