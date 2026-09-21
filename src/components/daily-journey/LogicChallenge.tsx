import { useState } from "react";
import { Puzzle, ArrowRight, CheckCircle2, Eye, Sparkles, BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AcceleratorDay } from "@/lib/placement-accelerator-data";

export type PlacementPuzzle = AcceleratorDay["practice"]["puzzle"];

interface LogicChallengeProps {
  dayNum: number;
  puzzle?: PlacementPuzzle | undefined;
  onNext: () => void;
}

export function LogicChallenge({ dayNum, puzzle, onNext }: LogicChallengeProps) {
  const [showDeduction, setShowDeduction] = useState(false);
  const [selectedGuess, setSelectedGuess] = useState<number | null>(null);

  const puzzleText =
    puzzle?.q ||
    `Three microservices A, B, and C send heartbeats at intervals of 3s, 5s, and 6s respectively. If they all pulse simultaneously at 12:00:00 PM, at what second will service A and B pulse together WITHOUT service C?`;

  const options = puzzle?.options && puzzle.options.length > 0
    ? puzzle.options.map((opt: string, idx: number) => ({
        label: opt,
        isCorrect: idx === puzzle.answer,
        reason: idx === puzzle.answer ? puzzle.explanation : "Re-check the logical constraint.",
      }))
    : [
        { label: "At 15 seconds", isCorrect: true, reason: "LCM(3, 5) = 15. 15 is not divisible by 6, so C does not pulse." },
        { label: "At 30 seconds", isCorrect: false, reason: "30 is divisible by 6, so Service C would also pulse simultaneously." },
        { label: "At 45 seconds", isCorrect: false, reason: "While 45 is a common pulse, the earliest occurrence asked is at 15s." },
      ];

  const correctAnswer = options.find((o) => o.isCorrect);

  return (
    <div className="journey-card mx-auto max-w-3xl overflow-hidden p-6 sm:p-8 phase-enter">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-500">
            <BrainCircuit className="size-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-foreground">Analytical Reasoning Puzzle</h3>
            <p className="text-[11px] text-muted-foreground">Pattern Recognition &amp; Problem Solving · Day {dayNum}</p>
          </div>
        </div>

        <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-mono text-muted-foreground">
          Step 7 of 7 · 2 min
        </span>
      </div>

      <div className="mt-6 space-y-6">
        {/* Puzzle Card */}
        <div className="rounded-xl border border-border bg-muted/20 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Puzzle className="size-4 text-indigo-500" />
              Daily Brain Teaser
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">Cognitive Speed</span>
          </div>
          <p className="text-sm font-medium text-foreground leading-relaxed">{puzzleText}</p>
        </div>

        {/* Deductive Choices */}
        <div className="space-y-2.5">
          <p className="text-xs font-semibold text-foreground">Select your deduction:</p>
          <div className={cn("grid gap-2", options.length <= 3 ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
            {options.map((opt, idx) => {
              const isSelected = selectedGuess === idx;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedGuess(idx);
                    setShowDeduction(true);
                  }}
                  className={cn(
                    "flex flex-col items-start rounded-xl border p-3.5 text-left text-xs transition-all cursor-pointer",
                    isSelected
                      ? opt.isCorrect
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200 ring-1 ring-emerald-500/30"
                        : "border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-200"
                      : "border-border bg-card text-foreground hover:border-primary/40",
                  )}
                >
                  <span className="font-mono text-[10px] text-muted-foreground">Option {idx + 1}</span>
                  <span className="font-semibold text-foreground mt-1">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Deduction Breakdown */}
        {showDeduction && (
          <div className="rounded-xl border border-border/80 bg-card p-4 text-xs space-y-2 phase-enter shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Eye className="size-3.5 text-primary" />
                Analytical Proof &amp; Breakdown:
              </span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                Answer: {correctAnswer?.label}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {puzzle?.explanation ||
                `Heartbeats coincide at the Lowest Common Multiple. For A (3s) and B (5s), LCM(3, 5) = 15s, 30s, 45s, 60s. For service C (6s), pulses occur at multiples of 6 (6, 12, 18, 24, 30...). At 15 seconds, A and B pulse together, but 15 is not divisible by 6, satisfying the constraint.`}
            </p>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="mt-8 flex items-center justify-between border-t border-border/70 pt-6">
        <span className="text-xs text-muted-foreground">
          Final step completed. Review your daily progress &amp; score.
        </span>

        <button
          onClick={onNext}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors cursor-pointer"
        >
          <span>Complete Today's Journey</span>
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
