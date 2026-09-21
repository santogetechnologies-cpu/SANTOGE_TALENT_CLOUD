import { useState, useRef } from "react";
import { Terminal, Check, Play, Bot, ExternalLink, ArrowRight, CheckCircle2, RotateCcw, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { AITutor } from "./AITutor";
import { XPReward } from "./XPReward";
import { useAppStore } from "@/lib/app-store";

interface GuidedSandboxProps {
  dayNum: number;
  trackId?: string;
  topic: string;
  practice: string;
  trackName: string;
  labTitle: string;
  isLabCompleted: boolean;
  onCompleteLab: () => Promise<void>;
  onNext: () => void;
}

export function GuidedSandbox({
  dayNum,
  trackId = "general",
  topic,
  practice,
  trackName,
  labTitle,
  isLabCompleted,
  onCompleteLab,
  onNext,
}: GuidedSandboxProps) {
  const store = useAppStore();
  const existingRecord = store.getDailyStepRecord(dayNum, trackId, "tech-sandbox");
  const isStepLocked = Boolean(isLabCompleted || existingRecord?.isLocked);
  const isProcessingRef = useRef(isStepLocked);

  const [isRunning, setIsRunning] = useState(false);
  const [runLogs, setRunLogs] = useState<string[]>(
    isStepLocked
      ? [
          `[runtime-wasm] Initializing environment for ${trackName}...`,
          `[suite] Loaded Day ${dayNum} verification harness.`,
          `[PASS] Test 1: Contract signature validation (1.2ms)`,
          `[PASS] Test 2: Input boundary sanity check (2.4ms)`,
          `[PASS] Test 3: Idempotency & isolation assertion (1.8ms)`,
          `✓ All test suites passed successfully (3/3).`,
        ]
      : [],
  );
  const [hasRun, setHasRun] = useState(isStepLocked);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTutor, setShowTutor] = useState(false);
  const [awardedXp, setAwardedXp] = useState(false);

  const handleRunSimulation = () => {
    setIsRunning(true);
    setRunLogs([`[runtime-wasm] Booting runtime sandbox for ${trackName}...`]);

    setTimeout(() => {
      setRunLogs((prev) => [
        ...prev,
        `[compiler] Parsing syntax and loading standard symbols...`,
        `[exec] Executing solution harness for: "${topic}"...`,
      ]);
    }, 400);

    setTimeout(() => {
      setRunLogs((prev) => [
        ...prev,
        `[PASS] Test 1: Contract signature validation (1.2ms)`,
        `[PASS] Test 2: Input boundary sanity check (2.4ms)`,
        `[PASS] Test 3: Idempotency & isolation assertion (1.8ms)`,
        `✓ All test suites passed successfully (3/3).`,
      ]);
      setIsRunning(false);
      setHasRun(true);
    }, 1100);
  };

  const handleConfirmCompletion = async () => {
    if (isStepLocked || isProcessingRef.current) return;
    isProcessingRef.current = true;
    setIsSubmitting(true);
    try {
      await onCompleteLab();
      await store.recordDailyStepAction(dayNum, trackId, "tech-sandbox");
      setAwardedXp(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="journey-card mx-auto max-w-3xl overflow-hidden p-6 sm:p-8 phase-enter">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-500">
            <Terminal className="size-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-foreground">Guided Sandbox Simulation</h3>
            <p className="text-[11px] text-muted-foreground">{labTitle} · Day {dayNum}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-mono text-muted-foreground">
            Step 4 of 7 · 4 min
          </span>
          <button
            onClick={() => setShowTutor(true)}
            className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
          >
            <Bot className="size-3.5" />
            <span>AI Tutor</span>
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {/* Lab Objective Card */}
        <div className="rounded-xl border border-border bg-muted/20 p-4 sm:p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Lab Objective &amp; Challenge
            </span>
            <span className="font-mono text-xs font-bold text-primary">+50 XP</span>
          </div>
          <h4 className="text-sm font-semibold text-foreground">{topic}</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">{practice}</p>
        </div>

        {/* Embedded Terminal Simulation Runner */}
        <div className="overflow-hidden rounded-xl border border-border bg-surface-dark text-slate-200">
          {/* Terminal Titlebar */}
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 py-2.5 text-xs">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="size-2.5 rounded-full bg-red-500/70" />
                <span className="size-2.5 rounded-full bg-amber-500/70" />
                <span className="size-2.5 rounded-full bg-emerald-500/70" />
              </div>
              <span className="font-mono text-[11px] text-slate-400">
                sandbox://{trackName.toLowerCase().replace(/\s+/g, "-")}/day-{dayNum}
              </span>
            </div>

            <Link
              to="/student/labs"
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
              title="Open full-screen terminal"
            >
              <span>Full IDE</span>
              <ExternalLink className="size-3" />
            </Link>
          </div>

          {/* Terminal Console Logs */}
          <div className="min-h-[160px] p-4 font-mono text-xs space-y-1.5 overflow-y-auto">
            {runLogs.length === 0 ? (
              <div className="text-slate-400 italic py-6 text-center space-y-2">
                <p>Virtual test runner initialized.</p>
                <p className="text-[11px] text-slate-400">
                  Click "Run Automated Tests" below to validate implementation against standard suite.
                </p>
              </div>
            ) : (
              runLogs.map((line, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "leading-relaxed",
                    line.startsWith("[PASS]") || line.startsWith("✓")
                      ? "text-emerald-400 font-medium"
                      : line.startsWith("[exec]") || line.startsWith("[suite]")
                        ? "text-sky-300"
                        : "text-slate-300",
                  )}
                >
                  {line}
                </div>
              ))
            )}
            {isRunning && (
              <div className="text-amber-400 animate-pulse flex items-center gap-2 pt-1">
                <span>Executing automated unit suite...</span>
              </div>
            )}
          </div>

          {/* Terminal Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 bg-slate-950/60 p-3">
            <button
              onClick={handleRunSimulation}
              disabled={isRunning || isStepLocked}
              className={cn(
                "flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-700 disabled:opacity-50 transition-colors",
                isStepLocked ? "cursor-not-allowed" : "cursor-pointer",
              )}
            >
              <Play className="size-3.5 fill-slate-100" />
              <span>{hasRun ? "Re-run Test Suite" : "Run Automated Tests"}</span>
            </button>

            {hasRun && !isStepLocked && (
              <button
                onClick={handleConfirmCompletion}
                disabled={isSubmitting || isProcessingRef.current}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
              >
                <Check className="size-3.5" />
                <span>{isSubmitting ? "Verifying..." : "Validate & Mark Complete (+50 XP)"}</span>
              </button>
            )}

            {isStepLocked && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="size-4" />
                <span>Lab Verified ✓</span>
              </div>
            )}
          </div>
        </div>

        {awardedXp && <XPReward amount={50} label="XP Lab Completed" />}
      </div>

      {/* Footer Navigation CTA */}
      <div className="mt-8 flex items-center justify-between border-t border-border/70 pt-6">
        <div className="text-xs text-muted-foreground">
          {isStepLocked || hasRun
            ? "Phase 1 Complete! Transitioning to Phase 2: Placement Accelerator."
            : "Run tests to verify your implementation before proceeding."}
        </div>

        <button
          onClick={async () => {
            if (!isStepLocked && !isProcessingRef.current) {
              isProcessingRef.current = true;
              await onCompleteLab();
              await store.recordDailyStepAction(dayNum, trackId, "tech-sandbox");
            }
            onNext();
          }}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors cursor-pointer"
        >
          <span>Begin Placement Accelerator (Phase 2)</span>
          <ArrowRight className="size-4" />
        </button>
      </div>

      {/* AI Tutor Drawer */}
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
