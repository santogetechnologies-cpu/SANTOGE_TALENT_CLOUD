import React, { useState, useEffect, useMemo } from "react";
import {
  Sparkles,
  Timer,
  Trophy,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  Play,
  Flame,
  Award,
} from "lucide-react";
import type { MiniGameConfig } from "@/lib/course-curricula/types";

interface MiniGameProps {
  game: MiniGameConfig;
  onComplete: (score: number, perfect: boolean) => void;
  onSkip?: () => void;
}

export function MiniGame({ game, onComplete, onSkip }: MiniGameProps) {
  const [timeLeft, setTimeLeft] = useState(game.timeLimitSeconds);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [mistakes, setMistakes] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(100);

  // Timer countdown
  useEffect(() => {
    if (!isTimerRunning || isCompleted) return;
    if (timeLeft <= 0) {
      setIsTimerRunning(false);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isTimerRunning, isCompleted]);

  const handleFinish = (finalMistakes: number) => {
    setIsTimerRunning(false);
    setIsCompleted(true);
    const perfect = finalMistakes === 0;
    const timeBonus = Math.round((timeLeft / game.timeLimitSeconds) * 20);
    const finalScore = Math.max(50, 100 - finalMistakes * 15 + timeBonus + (perfect ? game.perfectXpBonus : 0));
    setScore(finalScore);
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-4 md:p-6 select-none">
      {/* Top Header: Game Type, Difficulty, Timer, Score */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{game.gameType.replace(/-/g, " ")}</span>
          </div>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-xs ${star <= game.difficulty ? "text-amber-400" : "text-muted-foreground/30"}`}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Timer */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-medium transition-colors ${
              timeLeft < 15
                ? "bg-destructive/15 text-destructive border border-destructive/30 animate-pulse"
                : "bg-muted/60 text-muted-foreground"
            }`}
          >
            <Timer className="w-3.5 h-3.5" />
            <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}</span>
          </div>

          {/* Perfect Bonus Pill */}
          {mistakes === 0 && !isCompleted && (
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-medium">
              <Flame className="w-3.5 h-3.5" />
              <span>+{game.perfectXpBonus} Perfect XP</span>
            </div>
          )}

          {onSkip && !isCompleted && (
            <button
              onClick={onSkip}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
            >
              Skip Game
            </button>
          )}
        </div>
      </div>

      {/* Game Title & Instructions */}
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">{game.title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{game.instruction}</p>
      </div>

      {/* Main Interactive Stage */}
      <div className="flex-1 bg-card/60 border border-border/60 backdrop-blur-sm rounded-2xl p-5 md:p-8 flex flex-col justify-center min-h-[360px] relative overflow-hidden shadow-sm">
        {isCompleted ? (
          <div className="flex flex-col items-center justify-center text-center py-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 shadow-lg shadow-primary/5">
              <Trophy className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Challenge Completed!</h3>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-md">
              {mistakes === 0
                ? "Flawless performance! You earned the full streak bonus."
                : `Completed with ${mistakes} correction${mistakes > 1 ? "s" : ""}. Great persistence!`}
            </p>

            <div className="grid grid-cols-2 gap-4 my-6 w-full max-w-xs">
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/40 text-center">
                <span className="text-xs text-muted-foreground">Accuracy</span>
                <p className="text-lg font-bold text-foreground">
                  {mistakes === 0 ? "100%" : `${Math.max(60, 100 - mistakes * 15)}%`}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-center">
                <span className="text-xs text-primary font-medium">XP Earned</span>
                <p className="text-lg font-bold text-primary">+{score} XP</p>
              </div>
            </div>

            <button
              onClick={() => onComplete(score, mistakes === 0)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-md hover:bg-primary/90 transition-all active:scale-[0.98]"
            >
              <span>Continue Lesson Journey</span>
              <Play className="w-4 h-4 fill-current" />
            </button>
          </div>
        ) : (
          renderGamePayload(game, () => {
            handleFinish(mistakes);
          }, () => {
            setMistakes((prev) => prev + 1);
          })
        )}
      </div>

      {/* Footer Info / Controls */}
      <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-primary" />
          <span>Complete the mini-game to unlock maximum XP & progression credit</span>
        </div>

        {game.data.kind === "predict-output" && game.data.explanation && (
          <button
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{showHint ? "Hide Hint" : "Need a Hint?"}</span>
          </button>
        )}
      </div>

      {showHint && (
        <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs">
          💡 <strong>Hint:</strong> Focus on architectural sequencing and standard protocol / method contracts.
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Payload Sub-Renderers for 8 Mechanics                              */
/* ------------------------------------------------------------------ */

function renderGamePayload(
  game: MiniGameConfig,
  onSuccess: () => void,
  onError: () => void,
) {
  switch (game.data.kind) {
    case "match-pairs":
      return <MatchPairsView pairs={game.data.pairs} onSuccess={onSuccess} onError={onError} />;
    case "predict-output":
      return (
        <PredictOutputView
          code={game.data.code}
          options={game.data.options}
          correctIndex={game.data.correctIndex}
          explanation={game.data.explanation}
          onSuccess={onSuccess}
          onError={onError}
        />
      );
    case "arrange-blocks":
      return (
        <ArrangeBlocksView
          blocks={game.data.blocks}
          description={game.data.description}
          onSuccess={onSuccess}
          onError={onError}
        />
      );
    case "pipeline-builder":
      return (
        <PipelineBuilderView
          stages={game.data.stages}
          correctOrder={game.data.correctOrder}
          onSuccess={onSuccess}
          onError={onError}
        />
      );
    case "find-errors":
      return (
        <FindErrorsView
          code={game.data.code}
          errors={game.data.errors}
          onSuccess={onSuccess}
          onError={onError}
        />
      );
    case "fill-blanks":
      return (
        <FillBlanksView
          template={game.data.template}
          blanks={game.data.blanks}
          onSuccess={onSuccess}
          onError={onError}
        />
      );
    case "mcq-challenge":
      return (
        <MCQChallengeView
          questions={game.data.questions}
          onSuccess={onSuccess}
          onError={onError}
        />
      );
    case "drag-classify":
      return (
        <DragClassifyView
          items={game.data.items}
          categories={game.data.categories}
          onSuccess={onSuccess}
          onError={onError}
        />
      );
    default:
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Interactive challenge loaded.</p>
          <button
            onClick={onSuccess}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Complete Challenge
          </button>
        </div>
      );
  }
}

/* ------------------------------------------------------------------ */
/*  1. Match Pairs Mechanic                                           */
/* ------------------------------------------------------------------ */

function MatchPairsView({
  pairs,
  onSuccess,
  onError,
}: {
  pairs: { left: string; right: string }[];
  onSuccess: () => void;
  onError: () => void;
}) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [mismatched, setMismatched] = useState<{ left: string; right: string } | null>(null);

  // Shuffle rights once
  const shuffledRights = useMemo(() => {
    return [...pairs].map((p) => p.right).sort(() => Math.random() - 0.5);
  }, [pairs]);

  const handleSelectLeft = (left: string) => {
    if (matched.has(left)) return;
    setSelectedLeft(left);
    setMismatched(null);
  };

  const handleSelectRight = (right: string) => {
    if (!selectedLeft) return;

    const pair = pairs.find((p) => p.left === selectedLeft);
    if (pair && pair.right === right) {
      const nextMatched = new Set(matched);
      nextMatched.add(selectedLeft);
      setMatched(nextMatched);
      setSelectedLeft(null);

      if (nextMatched.size === pairs.length) {
        setTimeout(onSuccess, 400);
      }
    } else {
      onError();
      setMismatched({ left: selectedLeft, right });
      setTimeout(() => {
        setMismatched(null);
        setSelectedLeft(null);
      }, 700);
    }
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Left Column */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
            Concepts / Components
          </span>
          {pairs.map((p) => {
            const isMatched = matched.has(p.left);
            const isSelected = selectedLeft === p.left;
            const isError = mismatched?.left === p.left;

            return (
              <button
                key={p.left}
                disabled={isMatched}
                onClick={() => handleSelectLeft(p.left)}
                className={`p-3.5 rounded-xl text-left text-sm font-medium transition-all border ${
                  isMatched
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 opacity-60 line-through"
                    : isError
                    ? "bg-destructive/15 border-destructive text-destructive animate-shake"
                    : isSelected
                    ? "bg-primary/15 border-primary text-primary shadow-sm"
                    : "bg-muted/40 hover:bg-muted/80 border-border/60 text-foreground"
                }`}
              >
                {p.left}
              </button>
            );
          })}
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
            Definitions / Roles
          </span>
          {shuffledRights.map((right) => {
            const matchedPair = pairs.find((p) => p.right === right);
            const isMatched = matchedPair ? matched.has(matchedPair.left) : false;
            const isError = mismatched?.right === right;

            return (
              <button
                key={right}
                disabled={isMatched}
                onClick={() => handleSelectRight(right)}
                className={`p-3.5 rounded-xl text-left text-sm transition-all border ${
                  isMatched
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 opacity-60"
                    : isError
                    ? "bg-destructive/15 border-destructive text-destructive"
                    : "bg-muted/40 hover:bg-muted/80 border-border/60 text-foreground"
                }`}
              >
                {right}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  2. Predict Output Mechanic                                        */
/* ------------------------------------------------------------------ */

function PredictOutputView({
  code,
  options,
  correctIndex,
  explanation,
  onSuccess,
  onError,
}: {
  code: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  onSuccess: () => void;
  onError: () => void;
}) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleSelect = (idx: number) => {
    if (revealed) return;
    setSelectedIdx(idx);
    setRevealed(true);

    if (idx === correctIndex) {
      setTimeout(onSuccess, 1200);
    } else {
      onError();
    }
  };

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Code / Architecture Snippet */}
      <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-4 font-mono text-xs md:text-sm text-zinc-100 overflow-x-auto shadow-inner">
        <pre className="whitespace-pre-wrap">{code}</pre>
      </div>

      {/* Answer Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {options.map((opt, idx) => {
          const isSelected = selectedIdx === idx;
          const isCorrect = idx === correctIndex;

          let btnClass = "bg-muted/40 hover:bg-muted/70 border-border/60 text-foreground";
          if (revealed) {
            if (isCorrect) {
              btnClass = "bg-emerald-500/15 border-emerald-500/50 text-emerald-600 dark:text-emerald-300 font-semibold";
            } else if (isSelected) {
              btnClass = "bg-destructive/15 border-destructive text-destructive line-through";
            } else {
              btnClass = "opacity-40 border-transparent";
            }
          }

          return (
            <button
              key={idx}
              disabled={revealed}
              onClick={() => handleSelect(idx)}
              className={`p-4 rounded-xl text-left text-sm transition-all border ${btnClass}`}
            >
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-mono shrink-0 mt-0.5">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span>{opt}</span>
              </div>
            </button>
          );
        })}
      </div>

      {revealed && (
        <div
          className={`p-4 rounded-xl text-xs md:text-sm animate-in fade-in duration-300 ${
            selectedIdx === correctIndex
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
              : "bg-destructive/10 border border-destructive/20 text-destructive"
          }`}
        >
          <div className="flex items-start gap-2">
            {selectedIdx === correctIndex ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-destructive" />
            )}
            <p>{explanation}</p>
          </div>
          {selectedIdx !== correctIndex && (
            <button
              onClick={() => {
                setSelectedIdx(null);
                setRevealed(false);
              }}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background border border-border text-foreground text-xs font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Try Again</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  3. Arrange Blocks Mechanic                                        */
/* ------------------------------------------------------------------ */

function ArrangeBlocksView({
  blocks,
  description,
  onSuccess,
  onError,
}: {
  blocks: { id: string; code: string; order: number }[];
  description: string;
  onSuccess: () => void;
  onError: () => void;
}) {
  const [items, setItems] = useState(() => {
    return [...blocks].sort(() => Math.random() - 0.5);
  });
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");

  const move = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(fromIdx, 1);
    if (!moved) return;
    next.splice(toIdx, 0, moved);
    setItems(next);
    setStatus("idle");
  };

  const validate = () => {
    const isCorrect = items.every((item, idx) => item.order === idx + 1);
    if (isCorrect) {
      setStatus("success");
      setTimeout(onSuccess, 600);
    } else {
      setStatus("error");
      onError();
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <p className="text-xs text-muted-foreground">{description}</p>
      <div className="flex flex-col gap-2.5">
        {items.map((item, idx) => (
          <div
            key={item.id}
            className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
              status === "success"
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
                : status === "error"
                ? "bg-muted/60 border-destructive/30"
                : "bg-muted/40 border-border/60 hover:bg-muted/60"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-lg bg-background border border-border/60 flex items-center justify-center font-mono text-xs font-bold text-muted-foreground">
                {idx + 1}
              </span>
              <span className="text-sm font-medium text-foreground">{item.code}</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                disabled={idx === 0}
                onClick={() => move(idx, idx - 1)}
                className="p-1.5 rounded-lg hover:bg-background border border-transparent hover:border-border text-muted-foreground hover:text-foreground disabled:opacity-20 transition-all"
                title="Move Up"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                disabled={idx === items.length - 1}
                onClick={() => move(idx, idx + 1)}
                className="p-1.5 rounded-lg hover:bg-background border border-transparent hover:border-border text-muted-foreground hover:text-foreground disabled:opacity-20 transition-all"
                title="Move Down"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-muted-foreground">
          {status === "error" && (
            <span className="text-destructive font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Incorrect order. Review step sequencing.
            </span>
          )}
        </span>
        <button
          onClick={validate}
          className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow hover:bg-primary/90 transition-all"
        >
          Verify Sequence
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  4. Pipeline Builder Mechanic                                      */
/* ------------------------------------------------------------------ */

function PipelineBuilderView({
  stages,
  correctOrder,
  onSuccess,
  onError,
}: {
  stages: string[];
  correctOrder: number[];
  onSuccess: () => void;
  onError: () => void;
}) {
  const [currentStages, setCurrentStages] = useState(() => {
    return stages.map((s, i) => ({ text: s, originalIdx: i })).sort(() => Math.random() - 0.5);
  });
  const [errorState, setErrorState] = useState(false);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= currentStages.length) return;
    const next = [...currentStages];
    const [item] = next.splice(from, 1);
    if (!item) return;
    next.splice(to, 0, item);
    setCurrentStages(next);
    setErrorState(false);
  };

  const handleVerify = () => {
    const isCorrect = currentStages.every((item, idx) => item.originalIdx === correctOrder[idx]);
    if (isCorrect) {
      setTimeout(onSuccess, 500);
    } else {
      setErrorState(true);
      onError();
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
        {currentStages.map((stage, idx) => (
          <div
            key={idx}
            className={`p-3.5 rounded-xl border flex flex-col justify-between gap-2.5 transition-all ${
              errorState ? "border-destructive/40 bg-destructive/5" : "border-border/60 bg-muted/40"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                Stage {idx + 1}
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={idx === 0}
                  onClick={() => move(idx, idx - 1)}
                  className="p-1 rounded hover:bg-background text-muted-foreground disabled:opacity-20"
                >
                  <ArrowUp className="w-3.5 h-3.5 md:-rotate-90" />
                </button>
                <button
                  disabled={idx === currentStages.length - 1}
                  onClick={() => move(idx, idx + 1)}
                  className="p-1 rounded hover:bg-background text-muted-foreground disabled:opacity-20"
                >
                  <ArrowDown className="w-3.5 h-3.5 md:-rotate-90" />
                </button>
              </div>
            </div>
            <p className="text-xs font-semibold text-foreground line-clamp-3">{stage.text}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-3">
        <button
          onClick={handleVerify}
          className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow hover:bg-primary/90"
        >
          Validate Pipeline Architecture
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  5. Find Errors Mechanic                                           */
/* ------------------------------------------------------------------ */

function FindErrorsView({
  code,
  errors,
  onSuccess,
  onError,
}: {
  code: string;
  errors: { line: number; description: string }[];
  onSuccess: () => void;
  onError: () => void;
}) {
  const lines = code.split("\n");
  const [selectedLines, setSelectedLines] = useState<Set<number>>(new Set());
  const [verified, setVerified] = useState(false);

  const toggleLine = (lineNum: number) => {
    if (verified) return;
    const next = new Set(selectedLines);
    if (next.has(lineNum)) next.delete(lineNum);
    else next.add(lineNum);
    setSelectedLines(next);
  };

  const handleValidate = () => {
    setVerified(true);
    const targetLines = new Set(errors.map((e) => e.line));
    const allFound = [...targetLines].every((l) => selectedLines.has(l));

    if (allFound && selectedLines.size === targetLines.size) {
      setTimeout(onSuccess, 800);
    } else {
      onError();
      setTimeout(() => setVerified(false), 1200);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <p className="text-xs text-muted-foreground">Click the code lines containing architectural defects or bugs:</p>
      <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-2 font-mono text-xs overflow-x-auto shadow-inner">
        {lines.map((line, idx) => {
          const lineNum = idx + 1;
          const isSelected = selectedLines.has(lineNum);
          const isDefect = errors.some((e) => e.line === lineNum);

          return (
            <div
              key={idx}
              onClick={() => toggleLine(lineNum)}
              className={`flex items-start gap-3 px-3 py-1 rounded cursor-pointer transition-colors ${
                verified
                  ? isDefect
                    ? "bg-destructive/20 text-destructive"
                    : isSelected
                    ? "bg-amber-500/20 text-amber-300"
                    : "hover:bg-zinc-900"
                  : isSelected
                  ? "bg-primary/20 text-primary-foreground border-l-2 border-primary"
                  : "hover:bg-zinc-900/80 text-zinc-300"
              }`}
            >
              <span className="w-6 text-zinc-600 select-none text-right shrink-0">{lineNum}</span>
              <pre className="font-mono whitespace-pre">{line || " "}</pre>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-muted-foreground">{selectedLines.size} line(s) flagged</span>
        <button
          onClick={handleValidate}
          className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow hover:bg-primary/90"
        >
          Confirm Defect Lines
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  6. Fill Blanks Mechanic                                           */
/* ------------------------------------------------------------------ */

function FillBlanksView({
  template,
  blanks,
  onSuccess,
  onError,
}: {
  template: string;
  blanks: { placeholder: string; answer: string; options: string[] }[];
  onSuccess: () => void;
  onError: () => void;
}) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [validated, setValidated] = useState(false);

  const handleSelect = (blankIdx: number, val: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [blankIdx]: val }));
    setValidated(false);
  };

  const handleVerify = () => {
    setValidated(true);
    const allCorrect = blanks.every((b, idx) => selectedAnswers[idx] === b.answer);
    if (allCorrect) {
      setTimeout(onSuccess, 600);
    } else {
      onError();
    }
  };

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="p-5 rounded-xl bg-muted/30 border border-border/60 text-sm md:text-base leading-relaxed text-foreground">
        <p>{template}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {blanks.map((b, idx) => (
          <div key={idx} className="flex flex-col gap-2 p-3.5 rounded-xl bg-muted/40 border border-border/40">
            <span className="text-xs font-semibold text-muted-foreground">Select option for blank #{idx + 1}:</span>
            <div className="flex flex-wrap gap-2">
              {b.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleSelect(idx, opt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    selectedAnswers[idx] === opt
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background hover:bg-muted border-border/60 text-foreground"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={handleVerify}
          className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow hover:bg-primary/90"
        >
          Check Blanks
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  7. MCQ Challenge Sprint                                           */
/* ------------------------------------------------------------------ */

function MCQChallengeView({
  questions,
  onSuccess,
  onError,
}: {
  questions: { question: string; options: string[]; correctIndex: number; explanation: string }[];
  onSuccess: () => void;
  onError: () => void;
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const q = questions[currentIdx]!;

  const handleAnswer = (ansIdx: number) => {
    if (ansIdx === q.correctIndex) {
      if (currentIdx + 1 < questions.length) {
        setCurrentIdx((prev) => prev + 1);
      } else {
        setTimeout(onSuccess, 400);
      }
    } else {
      onError();
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Question {currentIdx + 1} of {questions.length}</span>
      </div>
      <h3 className="text-base md:text-lg font-semibold text-foreground">{q.question}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
        {q.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswer(idx)}
            className="p-4 rounded-xl text-left text-sm bg-muted/40 hover:bg-muted/80 border border-border/60 transition-all"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  8. Drag Classify Mechanic                                         */
/* ------------------------------------------------------------------ */

function DragClassifyView({
  items,
  categories,
  onSuccess,
  onError,
}: {
  items: { id: string; content: string; category: string }[];
  categories: string[];
  onSuccess: () => void;
  onError: () => void;
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const item = items[currentIdx];

  const handleClassify = (cat: string) => {
    if (!item) return;
    if (item.category === cat) {
      if (currentIdx + 1 < items.length) {
        setCurrentIdx((prev) => prev + 1);
      } else {
        setTimeout(onSuccess, 500);
      }
    } else {
      onError();
    }
  };

  if (!item) return null;

  return (
    <div className="w-full flex flex-col items-center gap-6 text-center">
      <span className="text-xs text-muted-foreground uppercase tracking-wider">
        Item {currentIdx + 1} of {items.length}
      </span>
      <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 max-w-md w-full shadow-sm">
        <h4 className="text-lg font-bold text-foreground">{item.content}</h4>
      </div>

      <p className="text-xs text-muted-foreground">Classify this concept into the correct domain category:</p>

      <div className="flex flex-wrap justify-center gap-3">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleClassify(cat)}
            className="px-6 py-3 rounded-xl bg-muted/50 hover:bg-primary hover:text-primary-foreground border border-border/60 font-semibold text-sm transition-all"
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
