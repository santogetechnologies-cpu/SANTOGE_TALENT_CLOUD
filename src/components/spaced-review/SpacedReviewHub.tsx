import { useState } from "react";
import {
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Brain,
  Zap,
  Flame,
  ArrowRight,
  TrendingUp,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/app-store";
import { toast } from "sonner";

export interface ReviewItem {
  id: string;
  category: "Previous Concept" | "New Concept" | "Weak Point / Missed" | "Boss Challenge";
  title: string;
  prompt: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation: string;
  xpReward: number;
}

const DAILY_MEMORY_QUEUE: ReviewItem[] = [
  {
    id: "mem-1",
    category: "Previous Concept",
    title: "Recall: Immutability in React State",
    prompt: "Why should you never mutate React state directly like `state.count = 5`?",
    options: [
      {
        id: "a",
        text: "React relies on shallow reference equality (`prev !== next`) to trigger re-renders. Direct mutation skips re-rendering.",
        isCorrect: true,
      },
      { id: "b", text: "JavaScript crashes whenever an object property is modified.", isCorrect: false },
      { id: "c", text: "Direct mutation only works in TypeScript, not JavaScript.", isCorrect: false },
    ],
    explanation: "React components re-render when reference identity changes. Mutating in-place preserves the old reference, causing UI desyncs.",
    xpReward: 20,
  },
  {
    id: "mem-2",
    category: "Previous Concept",
    title: "Recall: SQL Index Trade-off",
    prompt: "What is the primary operational trade-off of adding a B-Tree index on a database column?",
    options: [
      { id: "a", text: "Fast SELECT queries vs. slower INSERT/UPDATE operations due to index tree re-balancing.", isCorrect: true },
      { id: "b", text: "Index deletes old records automatically.", isCorrect: false },
      { id: "c", text: "Indexes cannot be used on numerical IDs.", isCorrect: false },
    ],
    explanation: "Every write must update both the table heap and the B-Tree indexes, adding slight overhead to writes while dramatically accelerating reads.",
    xpReward: 20,
  },
  {
    id: "mem-3",
    category: "Previous Concept",
    title: "Recall: REST Status Codes",
    prompt: "Which HTTP status code should a server return when a client tries to access a protected route with an invalid or expired token?",
    options: [
      { id: "a", text: "401 Unauthorized", isCorrect: true },
      { id: "b", text: "500 Internal Server Error", isCorrect: false },
      { id: "c", text: "200 OK with error body", isCorrect: false },
    ],
    explanation: "401 Unauthorized explicitly signals missing or invalid credentials, prompting the client to log in or refresh tokens.",
    xpReward: 20,
  },
  {
    id: "mem-4",
    category: "Weak Point / Missed",
    title: "Mastery Drill: Polymorphism & Method Overriding",
    prompt: "In Object-Oriented Programming, when a child class overrides a method, which version executes at runtime when referenced through a parent type?",
    options: [
      { id: "a", text: "The child's overridden version (Dynamic Method Dispatch / Runtime Polymorphism)", isCorrect: true },
      { id: "b", text: "The parent's original version", isCorrect: false },
      { id: "c", text: "Neither, an error is thrown", isCorrect: false },
    ],
    explanation: "At runtime, the JVM looks up the actual instantiated object type in the vtable and executes the overridden implementation.",
    xpReward: 30,
  },
  {
    id: "mem-5",
    category: "Boss Challenge",
    title: "Boss Challenge: System Design Concurrency",
    prompt: "Two users click 'Book Last Seat' at the exact same millisecond. How do you prevent double-booking at the database level?",
    options: [
      { id: "a", text: "Use Pessimistic Locking (`SELECT ... FOR UPDATE`) or Optimistic Locking with a version column", isCorrect: true },
      { id: "b", text: "Use a JavaScript setTimeout of 100ms", isCorrect: false },
      { id: "c", text: "Allow both bookings and email an apology later", isCorrect: false },
    ],
    explanation: "Database locks or atomic conditional updates guarantee ACID isolation and prevent race conditions.",
    xpReward: 50,
  },
];

export function SpacedReviewHub() {
  const store = useAppStore();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [completedQueue, setCompletedQueue] = useState<string[]>([]);

  const activeItem = DAILY_MEMORY_QUEUE[currentIdx] || DAILY_MEMORY_QUEUE[0]!;

  const handleCheckAnswer = () => {
    if (!selectedChoiceId) {
      toast.warning("Please choose an answer.");
      return;
    }
    setIsAnswerChecked(true);
    const chosen = activeItem.options.find((o) => o.id === selectedChoiceId);
    if (chosen?.isCorrect) {
      store.awardXp(activeItem.xpReward);
      if (!completedQueue.includes(activeItem.id)) {
        setCompletedQueue((prev) => [...prev, activeItem.id]);
      }
      toast.success("Concept successfully recalled! +" + activeItem.xpReward + " XP");
    }
  };

  const handleNextItem = () => {
    if (currentIdx < DAILY_MEMORY_QUEUE.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedChoiceId(null);
      setIsAnswerChecked(false);
    } else {
      toast.success("Daily Memory Queue Completed! Your knowledge retention is locked in.");
    }
  };

  const chosenOption = activeItem.options.find((o) => o.id === selectedChoiceId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="size-8 rounded-lg bg-emerald-600/10 text-emerald-600 grid place-items-center">
                <Brain className="size-4.5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Spaced Memory & Recall Queue
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
              Knowledge fades unless recalled. Our adaptive spaced repetition algorithm serves 7 daily activities combining past concepts, weak areas, and challenge drills.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              {completedQueue.length} / {DAILY_MEMORY_QUEUE.length} Recalled Today
            </span>
          </div>
        </div>
      </div>

      {/* Main Review Card */}
      <div className="max-w-2xl mx-auto rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-border/80 pb-4">
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider border",
              activeItem.category === "Boss Challenge"
                ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:border-purple-800 dark:text-purple-300"
                : activeItem.category === "Weak Point / Missed"
                  ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300"
                  : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300"
            )}
          >
            {activeItem.category}
          </span>
          <span className="text-xs font-mono text-muted-foreground">
            {currentIdx + 1} of {DAILY_MEMORY_QUEUE.length}
          </span>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-bold text-foreground">{activeItem.title}</h3>
          <p className="text-sm text-foreground/90 leading-relaxed bg-muted/30 p-4 rounded-xl border border-border/70">
            {activeItem.prompt}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-2.5">
          {activeItem.options.map((opt) => {
            const isSelected = selectedChoiceId === opt.id;
            const showSuccess = isAnswerChecked && opt.isCorrect;
            const showWrong = isAnswerChecked && isSelected && !opt.isCorrect;

            return (
              <button
                key={opt.id}
                disabled={isAnswerChecked && chosenOption?.isCorrect}
                onClick={() => setSelectedChoiceId(opt.id)}
                className={cn(
                  "w-full text-left rounded-xl p-4 border text-xs sm:text-sm font-medium transition-all flex items-start gap-3",
                  isSelected
                    ? "border-primary bg-primary/5 text-foreground ring-2 ring-primary/20"
                    : "border-border/80 bg-card hover:bg-muted/40 text-foreground",
                  showSuccess && "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100",
                  showWrong && "border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 text-rose-950 dark:text-rose-100"
                )}
              >
                <span
                  className={cn(
                    "size-5 rounded-full border flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5",
                    isSelected ? "border-primary bg-primary text-white" : "border-border bg-muted text-muted-foreground",
                    showSuccess && "border-emerald-500 bg-emerald-500 text-white",
                    showWrong && "border-rose-500 bg-rose-500 text-white"
                  )}
                >
                  {opt.id.toUpperCase()}
                </span>
                <span className="flex-1 leading-relaxed">{opt.text}</span>
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {isAnswerChecked && chosenOption && (
          <div
            className={cn(
              "rounded-xl p-4 border text-xs sm:text-sm leading-relaxed space-y-1.5 animate-in fade-in",
              chosenOption.isCorrect
                ? "bg-emerald-50/80 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-200"
                : "bg-amber-50/80 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/50 text-amber-900 dark:text-amber-200"
            )}
          >
            <p className="font-bold flex items-center gap-1.5">
              {chosenOption.isCorrect ? (
                <>
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  <span>Correct Recall!</span>
                </>
              ) : (
                <>
                  <AlertCircle className="size-4 text-amber-600" />
                  <span>Review Note</span>
                </>
              )}
            </p>
            <p className="pl-5">{activeItem.explanation}</p>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-border/80 flex items-center justify-between">
          {!isAnswerChecked ? (
            <button
              onClick={handleCheckAnswer}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs sm:text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all ml-auto"
            >
              <span>Verify Recall</span>
              <ArrowRight className="size-4" />
            </button>
          ) : (
            <button
              onClick={handleNextItem}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-6 py-2.5 text-xs sm:text-sm font-bold text-white transition-all ml-auto"
            >
              <span>{currentIdx === DAILY_MEMORY_QUEUE.length - 1 ? "Complete Daily Queue" : "Next Recall Card"}</span>
              <ArrowRight className="size-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
