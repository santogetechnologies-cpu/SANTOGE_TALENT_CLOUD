import { useState, useRef } from "react";
import { BookOpen, Sparkles, ArrowRight, CheckCircle2, ChevronDown, Bot, Layers } from "lucide-react";
import { AITutor } from "./AITutor";
import { useAppStore } from "@/lib/app-store";

interface RevealCardProps {
  dayNum: number;
  trackId?: string;
  topic: string;
  practice: string;
  theme: string;
  workplaceSkill: string;
  trackName: string;
  trackShort: string;
  onNext: () => void;
}

export function RevealCard({
  dayNum,
  trackId = "general",
  topic,
  practice,
  theme,
  workplaceSkill,
  trackName,
  trackShort,
  onNext,
}: RevealCardProps) {
  const store = useAppStore();
  const existingRecord = store.getDailyStepRecord(dayNum, trackId, "tech-concept");

  const [isLocked, setIsLocked] = useState(() => Boolean(existingRecord?.isLocked));
  const isProcessingRef = useRef(Boolean(existingRecord?.isLocked));

  const [showTutor, setShowTutor] = useState(false);
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  const handleNext = async () => {
    if (!isLocked && !isProcessingRef.current) {
      isProcessingRef.current = true;
      setIsLocked(true);
      const res = await store.recordDailyStepAction(dayNum, trackId, "tech-concept");
      if (!res?.ok) {
        setIsLocked(false);
        isProcessingRef.current = false;
        return;
      }
    }
    onNext();
  };

  // Generate 3 bite-sized key takeaways from practice or topic
  const takeaways = [
    `Master foundational principles of ${topic} aligned with industry standards.`,
    `Apply reliable engineering patterns to avoid common production pitfalls.`,
    `Connect this concept to the broader week theme: "${theme}".`,
  ];

  return (
    <div className="journey-card mx-auto max-w-3xl overflow-hidden p-6 sm:p-8 phase-enter">
      {/* Header: Track & Phase Tag */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary/10 font-mono text-xs font-bold text-primary">
            {trackShort}
          </span>
          <div>
            <span className="text-xs font-semibold text-foreground">{trackName}</span>
            <span className="mx-1.5 text-muted-foreground text-xs">·</span>
            <span className="text-xs text-muted-foreground">Day {dayNum} Technical Foundation</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-mono text-muted-foreground">
            Step 1 of 7 · 2 min
          </span>
          <button
            onClick={() => setShowTutor(true)}
            className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
          >
            <Bot className="size-3.5" />
            <span>AI Coach</span>
          </button>
        </div>
      </div>

      {/* Main Concept Body */}
      <div className="mt-6 space-y-5">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-primary uppercase tracking-wider">
            <BookOpen className="size-3.5" />
            Today's Technical Concept
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {topic}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {practice}
          </p>
        </div>

        {/* 3 Core Principles */}
        <div className="rounded-xl border border-border bg-muted/20 p-4 sm:p-5 space-y-3">
          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="size-3.5 text-amber-500" />
            Core Competency Takeaways
          </h4>
          <ul className="space-y-2.5 text-xs text-muted-foreground">
            {takeaways.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="leading-normal text-foreground/90">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Context Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 rounded-lg border border-border/60 bg-card p-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Layers className="size-4 text-muted-foreground shrink-0" />
            <span>
              Module Theme: <strong className="text-foreground">{theme}</strong>
            </span>
          </div>
          <div className="font-medium text-foreground">
            Workplace Skill: {workplaceSkill}
          </div>
        </div>
      </div>

      {/* Footer Navigation CTA */}
      <div className="mt-8 flex items-center justify-between border-t border-border/70 pt-6">
        <button
          onClick={() => setShowTutor(true)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          Need simpler explanation? <span className="text-primary font-medium underline underline-offset-2">Ask AI</span>
        </button>

        <button
          onClick={handleNext}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors cursor-pointer"
        >
          <span>View Visual Architecture</span>
          <ArrowRight className="size-4" />
        </button>
      </div>

      {/* AI Tutor Modal */}
      <AITutor
        isOpen={showTutor}
        onClose={() => setShowTutor(false)}
        topic={topic}
        practicePrompt={practice}
        trackName={trackName}
      />
    </div>
  );
}
