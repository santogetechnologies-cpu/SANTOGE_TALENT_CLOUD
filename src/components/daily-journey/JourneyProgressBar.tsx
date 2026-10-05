import { X, Zap, Clock, ShieldCheck, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type JourneyStepId =
  | "tech-concept"
  | "tech-visual"
  | "tech-check"
  | "tech-minigame"
  | "tech-sandbox"
  | "capstone-project"
  | "final-assessment"
  | "placement-communication"
  | "placement-aptitude"
  | "placement-logic"
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
  { id: "tech-minigame", label: "Mini-Game", phase: "tech", duration: "3m" },
  { id: "tech-sandbox", label: "Guided Lab", phase: "tech", duration: "4m" },
  { id: "placement-communication", label: "Communication", phase: "placement", duration: "2m" },
  { id: "placement-aptitude", label: "Aptitude", phase: "placement", duration: "3m" },
  { id: "placement-logic", label: "Logic Puzzle", phase: "placement", duration: "2m" },
];

interface JourneyProgressBarProps {
  currentStep: JourneyStepId;
  dayNum: number;
  sessionXp: number;
  trackName?: string;
  steps?: JourneyStepMeta[] | undefined;
  onExit: () => void;
  onStepClick?: (stepId: JourneyStepId) => void;
}

export function JourneyProgressBar({
  currentStep,
  dayNum,
  sessionXp,
  trackName,
  steps,
  onExit,
  onStepClick,
}: JourneyProgressBarProps) {
  const effectiveSteps = steps && steps.length > 0 ? steps : JOURNEY_STEPS;
  const currentIndex = effectiveSteps.findIndex((s) => s.id === currentStep);
  const isComplete = currentStep === "complete";
  const activeStep: JourneyStepMeta = isComplete
    ? { id: "complete" as const, label: "Lesson Complete", phase: "complete" as const, duration: "Done" }
    : (effectiveSteps[currentIndex] ?? effectiveSteps[0]!);

  const progressPercent = isComplete
    ? 100
    : Math.round(((currentIndex + 1) / effectiveSteps.length) * 100);

  return (
    <header className="sticky top-0 z-30 mb-6 border-b border-border/70 bg-background/95 backdrop-blur-md transition-all shadow-2xs">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Left: Back / Exit & Context */}
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            aria-label="Pause and return to today"
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted hover:text-foreground cursor-pointer shadow-2xs"
          >
            <X className="size-3.5" />
            <span className="hidden sm:inline">Back to Today</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-primary">
                Day {dayNum} of 90
              </span>
              {trackName && (
                <>
                  <span className="text-muted-foreground text-xs">·</span>
                  <span className="text-xs font-medium text-foreground">{trackName}</span>
                </>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground font-medium">
              {isComplete
                ? "🎉 Today's technical learning is complete!"
                : `Step ${currentIndex + 1} of ${effectiveSteps.length}: ${activeStep.label}`}
            </p>
          </div>
        </div>

        {/* Center: Clean Progress Indicator (Step X of Y + Bar) */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-foreground">
              {isComplete ? "Completed" : `Step ${currentIndex + 1} of ${effectiveSteps.length}`}
            </span>
            <span className="text-[11px] font-mono text-muted-foreground">
              ({progressPercent}%)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {effectiveSteps.map((step, idx) => {
              const isPassed = isComplete || idx < currentIndex;
              const isCurrent = !isComplete && idx === currentIndex;

              return (
                <button
                  key={step.id}
                  onClick={() => onStepClick && onStepClick(step.id)}
                  title={`Step ${idx + 1}: ${step.label} (${step.duration})`}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300 cursor-pointer",
                    isCurrent
                      ? "w-8 bg-primary ring-2 ring-primary/30"
                      : isPassed
                        ? "w-4 bg-emerald-500 hover:opacity-80"
                        : "w-3 bg-muted/80 hover:bg-primary/40"
                  )}
                />
              );
            })}
          </div>
        </div>

        {/* Right: XP Reward Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary font-mono shadow-2xs">
            <Zap className="size-3.5 fill-primary" />
            <span>+{sessionXp} XP</span>
          </div>
        </div>
      </div>

      {/* Thin continuous progress bar */}
      <div className="h-0.5 w-full bg-border/40">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </header>
  );
}
