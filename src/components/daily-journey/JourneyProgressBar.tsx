import { X, Zap, Clock, ShieldCheck, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type JourneyStepId =
  | "tech-concept"
  | "tech-visual"
  | "tech-check"
  | "tech-sandbox"
  | "placement-communication"
  | "placement-aptitude"
  | "placement-logic"
  | "placement-voice"
  | "complete";

export interface JourneyStepMeta {
  id: JourneyStepId;
  label: string;
  phase: "tech" | "placement" | "complete";
  duration: string;
}

export const JOURNEY_STEPS: JourneyStepMeta[] = [
  { id: "tech-concept", label: "Core Concept", phase: "tech", duration: "2m" },
  { id: "tech-visual", label: "Architecture", phase: "tech", duration: "2m" },
  { id: "tech-check", label: "Quick Check", phase: "tech", duration: "2m" },
  { id: "tech-sandbox", label: "Guided Lab", phase: "tech", duration: "4m" },
  { id: "placement-communication", label: "Communication", phase: "placement", duration: "2m" },
  { id: "placement-aptitude", label: "Aptitude", phase: "placement", duration: "3m" },
  { id: "placement-logic", label: "Logic Puzzle", phase: "placement", duration: "2m" },
  { id: "placement-voice", label: "Voice Pitch", phase: "placement", duration: "3m" },
];

interface JourneyProgressBarProps {
  currentStep: JourneyStepId;
  dayNum: number;
  sessionXp: number;
  onExit: () => void;
  onStepClick?: (stepId: JourneyStepId) => void;
}

export function JourneyProgressBar({
  currentStep,
  dayNum,
  sessionXp,
  onExit,
  onStepClick,
}: JourneyProgressBarProps) {
  const currentIndex = JOURNEY_STEPS.findIndex((s) => s.id === currentStep);
  const isComplete = currentStep === "complete";
  const activeStep: JourneyStepMeta = isComplete
    ? { id: "complete" as const, label: "Day Complete", phase: "complete" as const, duration: "Done" }
    : (JOURNEY_STEPS[currentIndex] ?? JOURNEY_STEPS[0]!);

  const currentPhase = isComplete
    ? "Day Completed"
    : activeStep.phase === "tech"
      ? "Phase 1: Technical Mastery"
      : "Phase 2: Placement Accelerator";

  // Calculate remaining estimated minutes
  const remainingSteps = isComplete ? 0 : JOURNEY_STEPS.length - currentIndex;
  const remainingMinutes = isComplete
    ? 0
    : JOURNEY_STEPS.slice(currentIndex).reduce((acc, s) => acc + parseInt(s.duration), 0);

  return (
    <header className="sticky top-0 z-30 mb-6 border-b border-border/60 bg-background/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Left: Day & Phase Indicator */}
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            aria-label="Pause and return to home"
            className="flex size-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-border hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-primary">Day {dayNum}</span>
              <span className="text-muted-foreground text-xs">·</span>
              <span className="text-xs font-medium text-foreground">{currentPhase}</span>
            </div>
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              {isComplete ? "All 20 minutes completed" : `Step ${currentIndex + 1} of 8: ${activeStep.label}`}
            </p>
          </div>
        </div>

        {/* Center: Step indicators (dots / pills) */}
        <div className="hidden md:flex items-center gap-1.5">
          {JOURNEY_STEPS.map((step, idx) => {
            const isPassed = isComplete || idx < currentIndex;
            const isCurrent = !isComplete && idx === currentIndex;

            return (
              <button
                key={step.id}
                disabled={!isPassed && !isCurrent}
                onClick={() => onStepClick && onStepClick(step.id)}
                title={`${step.label} (${step.duration})`}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  isCurrent
                    ? "w-7 bg-primary"
                    : isPassed
                      ? "w-3 bg-emerald-500 hover:opacity-80"
                      : "w-2 bg-muted/70",
                  step.phase === "placement" && idx === 4 && "ml-2",
                )}
              />
            );
          })}
        </div>

        {/* Right: Time remaining & Session XP */}
        <div className="flex items-center gap-2">
          {!isComplete && (
            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground font-mono">
              <Clock className="size-3 text-primary" />
              <span>{remainingMinutes}m left</span>
            </div>
          )}

          <div className="flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
            <Zap className="size-3.5 fill-primary" />
            <span>+{sessionXp} XP</span>
          </div>
        </div>
      </div>

      {/* Thin continuous progress bar */}
      <div className="h-0.5 w-full bg-border/40">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{
            width: isComplete
              ? "100%"
              : `${Math.round(((currentIndex + 1) / (JOURNEY_STEPS.length + 1)) * 100)}%`,
          }}
        />
      </div>
    </header>
  );
}
