import { useState } from "react";
import { CheckCircle2, AlertCircle, ArrowRight, HelpCircle, Sparkles, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { XPReward } from "./XPReward";

interface KnowledgeCheckProps {
  topic: string;
  trackName: string;
  onSuccess: (xpBonus: number) => void;
  onNext: () => void;
}

export function KnowledgeCheck({ topic, trackName, onSuccess, onNext }: KnowledgeCheckProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(false);

  // Contextual question for today's topic
  const questionData = {
    question: `What is the primary architectural advantage of implementing "${topic}" in ${trackName}?`,
    options: [
      {
        text: `It isolates operational state and enforces predictable data contracts to reduce production regressions.`,
        isCorrect: true,
        explanation: `Correct! By enforcing modular boundaries and deterministic contracts, this pattern eliminates unexpected side-effects and simplifies automated regression testing.`,
      },
      {
        text: `It replaces all database indexes and completely eliminates the need for caching.`,
        isCorrect: false,
        explanation: `Not quite. This pattern does not eliminate datastores or caching; rather, it coordinates logic and data access safely.`,
      },
      {
        text: `It bypasses network authentication to minimize HTTP request latency.`,
        isCorrect: false,
        explanation: `Careful! Security and authentication boundaries must never be bypassed for performance gains.`,
      },
    ],
  };

  const handleSelect = (idx: number) => {
    setSelectedOption(idx);
    setHasSubmitted(true);

    if (questionData.options[idx]?.isCorrect && !xpAwarded) {
      setXpAwarded(true);
      onSuccess(15);
    }
  };

  const isCorrect = selectedOption !== null && questionData.options[selectedOption]?.isCorrect;

  return (
    <div className="journey-card mx-auto max-w-3xl overflow-hidden p-6 sm:p-8 phase-enter">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-md bg-amber-500/10 text-amber-500">
            <HelpCircle className="size-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-foreground">Interactive Knowledge Check</h3>
            <p className="text-[11px] text-muted-foreground">Verify Understanding Before Hands-on Lab</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-mono text-muted-foreground">
            Step 3 of 8 · 2 min
          </span>
          {xpAwarded && <XPReward amount={15} />}
        </div>
      </div>

      <div className="mt-6 space-y-6">
        <div>
          <span className="text-[11px] font-mono text-primary uppercase font-semibold">
            Concept Verification
          </span>
          <h2 className="text-base sm:text-lg font-bold text-foreground mt-1">
            {questionData.question}
          </h2>
        </div>

        {/* 3 Options */}
        <div className="space-y-3">
          {questionData.options.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            const showSuccess = isSelected && opt.isCorrect;
            const showError = isSelected && !opt.isCorrect;

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className={cn(
                  "group w-full flex items-start gap-3.5 rounded-xl border p-4 text-left text-xs transition-all cursor-pointer",
                  showSuccess
                    ? "border-emerald-500 bg-emerald-50/70 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-200 ring-1 ring-emerald-500/30"
                    : showError
                      ? "border-destructive/50 bg-destructive/10 text-destructive dark:bg-destructive/20"
                      : isCorrect
                        ? "border-border/60 bg-muted/20 text-muted-foreground opacity-60"
                        : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted/30",
                )}
              >
                <div
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-md font-mono text-xs font-semibold border transition-colors",
                    showSuccess
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : showError
                        ? "border-destructive bg-destructive text-white"
                        : "border-border bg-muted text-muted-foreground group-hover:border-primary/40",
                  )}
                >
                  {String.fromCharCode(65 + idx)}
                </div>

                <div className="flex-1 space-y-1">
                  <p className="leading-relaxed font-medium">{opt.text}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Feedback Alert */}
        {hasSubmitted && selectedOption !== null && (
          <div
            className={cn(
              "rounded-xl border p-4 text-xs space-y-1 phase-enter",
              isCorrect
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-300"
                : "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-300",
            )}
          >
            <div className="flex items-center gap-2 font-semibold">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Excellent deduction! +15 XP bonus awarded.</span>
                </>
              ) : (
                <>
                  <AlertCircle className="size-4 text-amber-600 dark:text-amber-400" />
                  <span>Not quite yet. Check the clue below and select another option:</span>
                </>
              )}
            </div>
            <p className="text-[11px] leading-relaxed pl-6">
              {questionData.options[selectedOption]?.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Footer Navigation CTA */}
      <div className="mt-8 flex items-center justify-between border-t border-border/70 pt-6">
        <span className="text-xs text-muted-foreground">
          {isCorrect ? "Ready for hands-on application in the sandbox." : "Select an option to proceed."}
        </span>

        <button
          onClick={onNext}
          disabled={!isCorrect}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-40 transition-colors"
        >
          <span>Continue to Guided Sandbox</span>
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
