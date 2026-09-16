import { useState, useEffect } from "react";
import { Mic, Square, Sparkles, Volume2, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AcceleratorDay } from "@/lib/placement-accelerator-data";
import { SpeechAnalysis } from "./SpeechAnalysis";

export type VoicePrompt = AcceleratorDay["practice"]["voicePrompt"];

interface VoicePracticeProps {
  dayNum: number;
  voicePrompt: VoicePrompt;
  isPitchCompleted: boolean;
  onRecordPitch: () => Promise<void>;
  onFinishJourney: () => void;
}

export function VoicePractice({
  dayNum,
  voicePrompt,
  isPitchCompleted,
  onRecordPitch,
  onFinishJourney,
}: VoicePracticeProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(isPitchCompleted);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            handleStopRecording();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording, secondsLeft]);

  const handleStartRecording = () => {
    setIsRecording(true);
    setSecondsLeft(60);
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    setIsAnalyzing(true);

    try {
      await onRecordPitch();
    } finally {
      setIsAnalyzing(false);
      setShowAnalysis(true);
    }
  };

  if (showAnalysis) {
    return (
      <SpeechAnalysis
        dayNum={dayNum}
        promptText={voicePrompt.prompt}
        onFinish={onFinishJourney}
      />
    );
  }

  return (
    <div className="journey-card mx-auto max-w-3xl overflow-hidden p-6 sm:p-8 phase-enter">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-md bg-purple-500/10 text-purple-500">
            <Mic className="size-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-foreground">
              60-Second AI Voice Pitch Challenge
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Executive Presence &amp; STAR Speech Rubric · Day {dayNum}
            </p>
          </div>
        </div>

        <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-mono text-muted-foreground">
          Step 8 of 8 · 3 min
        </span>
      </div>

      <div className="mt-6 space-y-6">
        {/* Pitch Prompt Card */}
        <div className="rounded-xl border border-border bg-muted/20 p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-primary" /> Interview Question
            </span>
            <span className="font-mono text-xs font-bold text-primary">+25 XP</span>
          </div>
          <h2 className="text-sm sm:text-base font-bold text-foreground leading-relaxed">
            "{voicePrompt.prompt}"
          </h2>
          <p className="text-xs text-muted-foreground">
            Target Focus: Structure your response using Situation, Task, Action, and Measurable Result.
          </p>
        </div>

        {/* STAR Framework Cheat Sheet */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="rounded-lg border border-border bg-card p-2.5">
            <span className="font-mono font-bold text-primary text-[11px]">S · Situation</span>
            <p className="text-[10px] text-muted-foreground mt-0.5">Context &amp; problem</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-2.5">
            <span className="font-mono font-bold text-primary text-[11px]">T · Task</span>
            <p className="text-[10px] text-muted-foreground mt-0.5">Your ownership</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-2.5">
            <span className="font-mono font-bold text-primary text-[11px]">A · Action</span>
            <p className="text-[10px] text-muted-foreground mt-0.5">Specific execution</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-2.5">
            <span className="font-mono font-bold text-primary text-[11px]">R · Result</span>
            <p className="text-[10px] text-muted-foreground mt-0.5">Metric outcome</p>
          </div>
        </div>

        {/* Recording Interface Centerpiece */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card/60 p-8 text-center space-y-4">
          <div className="relative">
            {isRecording && (
              <div className="absolute -inset-3 rounded-full bg-primary/20 animate-ping opacity-75" />
            )}

            <button
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              disabled={isAnalyzing}
              className={cn(
                "relative flex size-20 items-center justify-center rounded-full transition-all shadow-lg cursor-pointer",
                isRecording
                  ? "bg-red-500 text-white hover:bg-red-600 mic-active"
                  : "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105",
                isAnalyzing && "opacity-60 cursor-not-allowed",
              )}
            >
              {isRecording ? <Square className="size-7" /> : <Mic className="size-8" />}
            </button>
          </div>

          <div className="space-y-1">
            <div className="font-mono text-2xl font-bold text-foreground">
              {isRecording ? `${secondsLeft}s` : "60s"}
            </div>
            <p className="text-xs text-muted-foreground">
              {isAnalyzing
                ? "Analyzing speech clarity, cadence, and STAR structure..."
                : isRecording
                  ? "Recording live voice pitch... Speak clearly into microphone."
                  : "Click microphone to start recording your 60-second response."}
            </p>
          </div>

          {/* Animated audio wave bars while recording */}
          {isRecording && (
            <div className="flex items-center gap-1 h-6">
              {[40, 75, 100, 60, 85, 30, 95, 50, 80, 45, 90, 65, 35].map((h, i) => (
                <span
                  key={i}
                  className="w-1 bg-primary rounded-full animate-pulse"
                  style={{
                    height: `${h}%`,
                    animationDuration: `${0.4 + (i % 5) * 0.15}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="mt-8 flex items-center justify-between border-t border-border/70 pt-6">
        <span className="text-xs text-muted-foreground">
          Voice response unlocks Day {dayNum} completion and placement attendance.
        </span>

        {isRecording && (
          <button
            onClick={handleStopRecording}
            className="flex items-center gap-2 rounded-xl bg-destructive px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-destructive/90 transition-colors cursor-pointer"
          >
            <span>Stop &amp; Submit Audio</span>
            <Square className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}
