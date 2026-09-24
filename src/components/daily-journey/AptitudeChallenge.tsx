import { useState, useEffect, useRef } from "react";
import { Calculator, ArrowRight, CheckCircle2, AlertCircle, Sparkles, Timer, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AcceleratorDay } from "@/lib/placement-accelerator-data";
import { XPReward } from "./XPReward";
import { useAppStore } from "@/lib/app-store";

export type AptitudeLesson = AcceleratorDay["aptitude"];
export type PlacementMCQ = AcceleratorDay["practice"]["mcqs"][number];

interface AptitudeChallengeProps {
  dayNum: number;
  trackId?: string;
  aptitude: AptitudeLesson;
  mcq?: PlacementMCQ | undefined;
  onSuccess: (xpBonus: number) => void;
  onNext: () => void;
}

export function AptitudeChallenge({
  dayNum,
  trackId = "general",
  aptitude,
  mcq,
  onSuccess,
  onNext,
}: AptitudeChallengeProps) {
  const store = useAppStore();
  const existingRecord = store.getDailyStepRecord(dayNum, trackId, "placement-aptitude");

  const [selectedIdx, setSelectedIdx] = useState<number | null>(() =>
    typeof existingRecord?.selectedOption === "number" ? existingRecord.selectedOption : null,
  );
  const [hasAnswered, setHasAnswered] = useState<boolean>(() => Boolean(existingRecord?.isLocked));
  const [isLocked, setIsLocked] = useState<boolean>(() => Boolean(existingRecord?.isLocked));
  const [xpAwarded, setXpAwarded] = useState<boolean>(() => Boolean(existingRecord?.xpAwarded));
  const isProcessingRef = useRef<boolean>(Boolean(existingRecord?.isLocked));

  const [secondsLeft, setSecondsLeft] = useState(60);

  // Fallback MCQ if not provided
  const activeMcq: PlacementMCQ = mcq || {
    q: `Apply the speed rule for ${aptitude.title}: If a process runs at rate R1 and combined with R2 finishes in T time, what is the proportional throughput?`,
    options: ["R1 × R2 / (R1 + R2)", "(R1 + R2) × T", "T / (R1 - R2)", "R1 / (R2 + T)"],
    answer: 0,
    explanation: `Using the reciprocal harmonic work principle: 1/T = 1/R1 + 1/R2 => T = (R1 × R2) / (R1 + R2).`,
    category: "Aptitude",
  };

  useEffect(() => {
    if (hasAnswered || secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [hasAnswered, secondsLeft]);

  const handleSelect = async (idx: number) => {
    if (isLocked || isProcessingRef.current) return;
    isProcessingRef.current = true;

    setSelectedIdx(idx);
    setHasAnswered(true);
    setIsLocked(true);

    const isCorrectChoice = idx === activeMcq.answer;
    const res = await store.recordDailyStepAction(dayNum, trackId, "placement-aptitude", {
      selectedOption: idx,
      isCorrect: isCorrectChoice,
    });

    if (!res?.ok) {
      setIsLocked(false);
      setHasAnswered(false);
      isProcessingRef.current = false;
      return;
    }

    if (isCorrectChoice && res.xpAwarded && !xpAwarded) {
      setXpAwarded(true);
      onSuccess(15);
    }
  };

  const isCorrect = selectedIdx !== null && selectedIdx === activeMcq.answer;

  return (
    <div className="journey-card mx-auto max-w-3xl overflow-hidden p-6 sm:p-8 phase-enter">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-md bg-blue-500/10 text-blue-500">
            <Calculator className="size-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-foreground">Quantitative &amp; Aptitude Drill</h3>
            <p className="text-[11px] text-muted-foreground">{aptitude.title} · Day {dayNum}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-0.5 text-xs font-mono text-muted-foreground">
            <Timer className="size-3 text-primary" />
            <span>{secondsLeft}s</span>
          </div>
          {xpAwarded && <XPReward amount={15} />}
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {/* Formula shortcut hint box */}
        <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold text-primary uppercase">
              Speed Shortcut Rule
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">Formula Accelerator</span>
          </div>
          <p className="text-xs font-mono font-semibold text-foreground">
            {aptitude.formulaShortcut}
          </p>
          <p className="text-[11px] text-muted-foreground">{aptitude.instructorBrief}</p>
        </div>

        {/* Question */}
        <div>
          <span className="text-[11px] font-mono text-muted-foreground">Question Challenge:</span>
          <h2 className="text-sm sm:text-base font-bold text-foreground mt-1 leading-snug">
            {activeMcq.q}
          </h2>
        </div>

        {/* 4 MCQ options */}
        <div className="grid gap-2.5 sm:grid-cols-2">
          {activeMcq.options.map((opt: string, idx: number) => {
            const isSelected = selectedIdx === idx;
            const showSuccess = isSelected && idx === activeMcq.answer;
            const showError = isSelected && idx !== activeMcq.answer;

            return (
              <button
                key={idx}
                disabled={isLocked || isProcessingRef.current}
                onClick={() => handleSelect(idx)}
                className={cn(
                  "group flex items-center gap-3 rounded-xl border p-3.5 text-left text-xs transition-all",
                  isLocked ? "cursor-not-allowed" : "cursor-pointer",
                  showSuccess
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200 font-semibold ring-1 ring-emerald-500/30"
                    : showError
                      ? "border-destructive bg-destructive/10 text-destructive"
                      : isLocked
                        ? "border-border/60 bg-muted/20 opacity-60 text-muted-foreground"
                        : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted/30",
                )}
              >
                <div
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-md font-mono text-xs font-semibold border",
                    showSuccess
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : showError
                        ? "border-destructive bg-destructive text-white"
                        : "border-border bg-muted text-muted-foreground",
                  )}
                >
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="leading-normal">{opt}</span>
              </button>
            );
          })}
        </div>

        {/* Explanation Alert */}
        {hasAnswered && selectedIdx !== null && (
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
                  <span>Correct speed calculation! (+15 XP)</span>
                </>
              ) : (
                <>
                  <AlertCircle className="size-4 text-amber-600 dark:text-amber-400" />
                  <span>Solution Breakdown:</span>
                </>
              )}
            </div>
            <p className="text-[11px] leading-relaxed pl-6">{activeMcq.explanation}</p>
          </div>
        )}
      </div>

      {/* Footer Navigation CTA */}
      <div className="mt-8 flex items-center justify-between border-t border-border/70 pt-6">
        <span className="text-xs text-muted-foreground">
          {hasAnswered ? "Ready for analytical reasoning." : "Select an answer to reveal shortcut."}
        </span>

        <button
          onClick={onNext}
          disabled={!hasAnswered}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-40 transition-colors cursor-pointer"
        >
          <span>Continue to Logic Puzzle</span>
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
