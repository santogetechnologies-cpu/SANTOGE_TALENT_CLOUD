import { useState, useRef, useMemo } from "react";
import { MessageSquare, Video, ArrowRight, CheckCircle2, Sparkles, BookOpen, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AcceleratorDay } from "@/lib/placement-accelerator-data";
import { useAppStore } from "@/lib/app-store";

export type EnglishLesson = AcceleratorDay["english"];

interface CommunicationInteractionProps {
  dayNum: number;
  trackId?: string;
  english: EnglishLesson;
  onNext: () => void;
}

export function CommunicationInteraction({
  dayNum,
  trackId = "general",
  english,
  onNext,
}: CommunicationInteractionProps) {
  const store = useAppStore();
  const existingRecord = store.getDailyStepRecord(dayNum, trackId, "placement-communication");

  const [selectedChoice, setSelectedChoice] = useState<"A" | "B" | null>(
    () => (existingRecord?.selectedOption as "A" | "B") || null,
  );
  const [isLocked, setIsLocked] = useState(() => Boolean(existingRecord?.isLocked));
  const isProcessingRef = useRef(Boolean(existingRecord?.isLocked));

  const handleSelectChoice = async (choice: "A" | "B") => {
    if (isLocked || isProcessingRef.current) return;
    isProcessingRef.current = true;
    setSelectedChoice(choice);
    setIsLocked(true);
    const res = await store.recordDailyStepAction(dayNum, trackId, "placement-communication", {
      selectedOption: choice,
      isCorrect: choice === "B",
    });
    if (!res?.ok) {
      setIsLocked(false);
      setSelectedChoice(null);
      isProcessingRef.current = false;
    }
  };

  // Generate a dynamic executive framing challenge based on today's lesson & vocabulary
  const scenario = useMemo(() => {
    const vocab1 = english.keyVocabulary[0] || "Articulate";
    const vocab2 = english.keyVocabulary[1] || "Competency";

    return {
      context: `Workplace Scenario (Day ${dayNum}): In a leadership review regarding "${english.title}", how do you best communicate progress while following "${english.grammarRule}"?`,
      optionA: {
        text: `"Yeah, we ran into some unexpected difficulties earlier. We couldn't finish things yet, but we'll try to work on it and hopefully wrap up whenever possible."`,
        isStrong: false,
        critique: `Passive and vague. Fails to leverage key professional terminology and lacks actionable commitments or clear ownership.`,
      },
      optionB: {
        text: `"To ${vocab1.toLowerCase()} our deliverable status: our team demonstrated core ${vocab2.toLowerCase()} by resolving the critical path constraints. In line with our milestone commitments, deliverables are aligned for sign-off today."`,
        isStrong: true,
        critique: `Executive & STAR aligned. Directly applies "${english.grammarRule}", seamlessly incorporates "${vocab1}" and "${vocab2}", and projects confidence and accountability.`,
      },
    };
  }, [dayNum, english]);

  return (
    <div className="journey-card mx-auto max-w-3xl overflow-hidden p-6 sm:p-8 phase-enter">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-md bg-purple-500/10 text-purple-500">
            <Video className="size-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-foreground">
              Phase 2: Placement Accelerator
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Executive Communication &amp; English Drill · Day {dayNum}
            </p>
          </div>
        </div>

        <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-mono text-muted-foreground">
          Step 5 of 7 · 2 min
        </span>
      </div>

      <div className="mt-6 space-y-6">
        {/* Lesson Overview */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono text-primary uppercase font-semibold">
            Today's Communication Broadcast
          </span>
          <p className="text-sm font-medium text-foreground leading-relaxed">
            {english.instructorBrief}
          </p>
        </div>

        {/* Vocabulary Focus */}
        <div className="rounded-xl border border-border bg-card/60 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-primary" /> Key Vocabulary For Today
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">Executive Presence</span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {english.keyVocabulary.map((word: string) => (
              <span
                key={word}
                className="rounded-lg bg-card border border-border px-2.5 py-1 text-xs font-mono font-medium text-foreground shadow-2xs"
              >
                {word}
              </span>
            ))}
          </div>
        </div>

        {/* Executive Choice Scenario */}
        <div className="space-y-3 pt-2">
          <div className="rounded-lg border border-border bg-card p-3.5 text-xs font-medium text-foreground">
            {scenario.context}
          </div>

          <p className="text-xs font-semibold text-foreground">
            Which response projects higher executive presence and leadership accountability?
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            {/* Option A */}
            <button
              disabled={isLocked || isProcessingRef.current}
              onClick={() => handleSelectChoice("A")}
              className={cn(
                "group flex flex-col justify-between rounded-xl border p-4 text-left transition-all",
                isLocked ? "cursor-not-allowed" : "cursor-pointer",
                selectedChoice === "A"
                  ? "border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/30"
                  : selectedChoice === "B"
                    ? "opacity-60 border-border bg-card"
                    : "border-border bg-card hover:border-primary/40",
              )}
            >
              <div className="space-y-2">
                <span className="font-mono text-[11px] font-semibold text-muted-foreground">
                  Response Option A
                </span>
                <p className="text-xs text-foreground leading-relaxed italic">
                  {scenario.optionA.text}
                </p>
              </div>

              {selectedChoice === "A" && (
                <div className="mt-3 pt-2 border-t border-border text-[11px] text-amber-600 dark:text-amber-400">
                  ⚠️ {scenario.optionA.critique}
                </div>
              )}
            </button>

            {/* Option B */}
            <button
              disabled={isLocked || isProcessingRef.current}
              onClick={() => handleSelectChoice("B")}
              className={cn(
                "group flex flex-col justify-between rounded-xl border p-4 text-left transition-all",
                isLocked ? "cursor-not-allowed" : "cursor-pointer",
                selectedChoice === "B"
                  ? "border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/30"
                  : selectedChoice === "A"
                    ? "opacity-60 border-border bg-card"
                    : "border-border bg-card hover:border-primary/40",
              )}
            >
              <div className="space-y-2">
                <span className="font-mono text-[11px] font-semibold text-muted-foreground">
                  Response Option B
                </span>
                <p className="text-xs text-foreground leading-relaxed italic">
                  {scenario.optionB.text}
                </p>
              </div>

              {selectedChoice === "B" && (
                <div className="mt-3 pt-2 border-t border-border text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  ✓ {scenario.optionB.critique}
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="mt-8 flex items-center justify-between border-t border-border/70 pt-6">
        <span className="text-xs text-muted-foreground">
          {selectedChoice ? "Insight assimilated." : "Select a response above to see critique."}
        </span>

        <button
          onClick={onNext}
          disabled={!selectedChoice}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-40 transition-colors cursor-pointer"
        >
          <span>Continue to Aptitude Challenge</span>
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
