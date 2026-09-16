import { CheckCircle2, Sparkles, Trophy, ArrowRight, Mic, Volume2, ShieldCheck, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { XPReward } from "./XPReward";

interface SpeechAnalysisProps {
  dayNum: number;
  promptText: string;
  onFinish: () => void;
}

export function SpeechAnalysis({ dayNum, promptText, onFinish }: SpeechAnalysisProps) {
  const metrics = [
    { label: "STAR Structure & Framing", score: 94, tone: "emerald", desc: "Clearly segregated Situation, Task, Action, and Measurable Result." },
    { label: "Executive Confidence & Tone", score: 89, tone: "blue", desc: "Firm vocal resonance with decisive, accountability-oriented phrasing." },
    { label: "Clarity & Articulation", score: 92, tone: "emerald", desc: "Crisp pronunciation with minimal filler words (uh/um < 2%)." },
    { label: "Speaking Pace & Rhythm", score: 86, tone: "purple", desc: "135 Words Per Minute — inside the ideal executive range (120–150 WPM)." },
  ];

  return (
    <div className="journey-card mx-auto max-w-3xl overflow-hidden p-6 sm:p-8 phase-enter">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-500">
            <Award className="size-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-foreground">AI Speech &amp; STAR Analysis</h3>
            <p className="text-[11px] text-muted-foreground">Voice Pitch Assessment · Day {dayNum}</p>
          </div>
        </div>

        <XPReward amount={25} label="Voice Pitch Verified" />
      </div>

      <div className="mt-6 space-y-6">
        <div className="space-y-1">
          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5" />
            STAR Rubric Analysis Complete
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            Outstanding Delivery &amp; Articulation
          </h2>
          <p className="text-xs text-muted-foreground">
            Response to: "{promptText}"
          </p>
        </div>

        {/* 4 Metric Meters */}
        <div className="grid gap-3 sm:grid-cols-2">
          {metrics.map((m) => (
            <div key={m.label} className="rounded-xl border border-border bg-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">{m.label}</span>
                <span className="font-mono text-xs font-bold text-foreground">{m.score}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${m.score}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>

        {/* AI Constructive Feedback Note */}
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 sm:p-5 space-y-2">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-semibold text-xs">
            <Sparkles className="size-4" />
            <span>AI Recruiter Observation:</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            You successfully highlighted quantitative results ("zero blocker debt", "production readiness") rather than just passive participation. Recruiters from tier-1 firms actively look for candidates who speak in metrics and outcomes.
          </p>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="mt-8 flex items-center justify-between border-t border-border/70 pt-6">
        <span className="text-xs text-muted-foreground font-medium">
          Both Technical &amp; Career engines verified for today!
        </span>

        <button
          onClick={onFinish}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 transition-colors cursor-pointer"
        >
          <span>Complete Day {dayNum} &amp; View Summary</span>
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
