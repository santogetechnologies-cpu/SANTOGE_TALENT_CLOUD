import { useState } from "react";
import { MessageSquare, Video, ArrowRight, CheckCircle2, Sparkles, BookOpen, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AcceleratorDay } from "@/lib/placement-accelerator-data";

export type EnglishLesson = AcceleratorDay["english"];

interface CommunicationInteractionProps {
  dayNum: number;
  english: EnglishLesson;
  onNext: () => void;
}

export function CommunicationInteraction({ dayNum, english, onNext }: CommunicationInteractionProps) {
  const [selectedChoice, setSelectedChoice] = useState<"A" | "B" | null>(null);

  // Generate an executive framing challenge based on today's lesson
  const scenario = {
    context: `Scenario: A senior stakeholder asks during a project sync: "What is the status of the module delivery and why were there delays?"`,
    optionA: {
      text: `"We had some unexpected issues and bugs last week, so we couldn't finish in time. But we are working on it now and will try to wrap it up soon."`,
      isStrong: false,
      critique: `Passive and vague. Focuses on excuses and lacks clear ownership, timeline certainty, or mitigation metrics.`,
    },
    optionB: {
      text: `"We identified an edge-case regression during integration testing on Thursday. We patched the core issue, reinforced unit coverage, and are on track to ship to staging by 3:00 PM today with zero blocker debt."`,
      isStrong: true,
      critique: `Executive & STAR aligned. Directly states the situation, specific action taken, and commitments with a firm delivery timestamp.`,
    },
  };

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
            {english.lesson}
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
              onClick={() => setSelectedChoice("A")}
              className={cn(
                "group flex flex-col justify-between rounded-xl border p-4 text-left transition-all cursor-pointer",
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
              onClick={() => setSelectedChoice("B")}
              className={cn(
                "group flex flex-col justify-between rounded-xl border p-4 text-left transition-all cursor-pointer",
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
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
        >
          <span>Continue to Aptitude Challenge</span>
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
