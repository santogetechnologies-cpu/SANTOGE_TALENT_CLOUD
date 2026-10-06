import { useState, useMemo } from "react";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Lightbulb,
  Briefcase,
  HelpCircle,
  Terminal,
  Layers,
  Code2,
  Check,
  Zap,
  Flame,
  Send,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/app-store";
import { toast } from "sonner";
import type { TrackId } from "@/lib/tracks";

export type InteractionType =
  | "discovery"
  | "prediction"
  | "choice"
  | "why"
  | "explain"
  | "build"
  | "complete"
  | "fix"
  | "debug"
  | "output"
  | "match"
  | "sort"
  | "sequence"
  | "compare"
  | "scenario"
  | "interviewer"
  | "boss_task";

export interface LessonActivity {
  id: string;
  stepNumber: number;
  stepName: "Discover" | "Predict" | "Explain" | "Practice" | "Apply" | "Review";
  type: InteractionType;
  title: string;
  teacherPrompt: string;
  contextSnippet?: string;
  options?: { id: string; label: string; explanation?: string; isCorrect?: boolean }[];
  correctOptionId?: string;
  expectedKeywords?: string[];
  sampleTeacherExplanation?: string;
  codeTokens?: string[];
  correctTokenOrder?: string[];
  fillSentence?: string; // e.g. "Spring Boot uses _____ to inject dependencies."
  correctFillWord?: string;
  brokenCode?: string;
  fixedCodeSnippet?: string;
  matchPairs?: { left: string; right: string }[];
  sortItems?: { id: string; text: string; correctIndex: number }[];
  scenarioRole?: string;
  xpValue: number;
}

export interface InteractiveLessonEngineProps {
  dayNum: number;
  trackId: TrackId;
  trackName: string;
  topicTitle: string;
  topicDescription: string;
  activities?: LessonActivity[];
  onComplete: () => void;
  onExit: () => void;
}

// Default curriculum generator if specific day curriculum not injected
export function generateDefaultDayActivities(
  dayNum: number,
  topicTitle: string,
  trackName: string
): LessonActivity[] {
  return [
    {
      id: `day-${dayNum}-act-1`,
      stepNumber: 1,
      stepName: "Discover",
      type: "discovery",
      title: "Discover the Problem",
      teacherPrompt: `Imagine you are building a system with 3 different services that all need database access. How should you avoid creating a new database connection manually inside every single class?`,
      contextSnippet: `class UserService {\n  // Problem: Manual connection creation is hard to test and maintain!\n  private DatabaseConnection db = new DatabaseConnection();\n}`,
      options: [
        {
          id: "a",
          label: "Instantiate 'new DatabaseConnection()' everywhere manually",
          explanation: "This tightly couples your classes and makes unit testing or swapping databases very difficult.",
          isCorrect: false,
        },
        {
          id: "b",
          label: "Pass the shared connection in from the outside (Dependency Injection / Inversion of Control)",
          explanation: "Spot on! By receiving dependencies externally, classes stay loosely coupled and fully testable.",
          isCorrect: true,
        },
        {
          id: "c",
          label: "Hardcode global static variables in every single file",
          explanation: "Global mutable state causes unexpected race conditions and tight hidden coupling.",
          isCorrect: false,
        },
      ],
      correctOptionId: "b",
      sampleTeacherExplanation:
        "Great intuition! In modern software, we let a container inject dependencies automatically so our business logic doesn't worry about creation details.",
      xpValue: 20,
    },
    {
      id: `day-${dayNum}-act-2`,
      stepNumber: 2,
      stepName: "Predict",
      type: "prediction",
      title: "Predict the Outcome",
      teacherPrompt: `What happens when you annotate a service with @Autowired / Dependency Injection and request it at runtime?`,
      contextSnippet: `@Service\npublic class PaymentService {\n  @Autowired\n  private NotificationService notifications;\n  \n  public void pay() {\n    notifications.sendReceipt();\n  }\n}`,
      options: [
        {
          id: "p1",
          label: "The framework automatically finds, injects, and wires the NotificationService instance",
          isCorrect: true,
          explanation: "Correct! The container handles instantiation and lifecycle automatically.",
        },
        {
          id: "p2",
          label: "It throws a NullPointerException because 'notifications' is never instantiated",
          isCorrect: false,
          explanation: "Because of dependency injection, the framework injects the managed bean before calling methods.",
        },
        {
          id: "p3",
          label: "It creates a duplicate copy of the application in memory",
          isCorrect: false,
          explanation: "Singletons are shared across the container context by default.",
        },
      ],
      correctOptionId: "p1",
      sampleTeacherExplanation:
        "Spot on! The framework looks up the registered bean in its application context and injects it seamlessly.",
      xpValue: 25,
    },
    {
      id: `day-${dayNum}-act-3`,
      stepNumber: 3,
      stepName: "Explain",
      type: "explain",
      title: "Explain in Your Own Words",
      teacherPrompt: `In 1 to 2 simple sentences, explain why Dependency Injection makes code easier to test and maintain.`,
      expectedKeywords: ["decouple", "inject", "test", "mock", "loose", "pass", "separate"],
      sampleTeacherExplanation:
        "Excellent explanation! When dependencies are passed from outside, we can easily pass mock objects during unit testing without touching real databases or APIs.",
      xpValue: 30,
    },
    {
      id: `day-${dayNum}-act-4`,
      stepNumber: 4,
      stepName: "Practice",
      type: "build",
      title: "Build the Solution",
      teacherPrompt: `Arrange the code tokens in the correct order to inject and construct the service:`,
      codeTokens: ["@Service", "public class OrderProcessor", "{", "private final PaymentService payment;", "}"],
      correctTokenOrder: ["@Service", "public class OrderProcessor", "{", "private final PaymentService payment;", "}"],
      sampleTeacherExplanation:
        "Terrific work! Constructing clean, immutable component classes is standard industry best practice.",
      xpValue: 25,
    },
    {
      id: `day-${dayNum}-act-5`,
      stepNumber: 5,
      stepName: "Apply",
      type: "boss_task",
      title: "Real-World Workplace Scenario",
      scenarioRole: "Junior Software Engineer",
      teacherPrompt: `Your engineering manager asks: "Our order checkout service crashes when the third-party SMS provider goes down. How should we refactor this with DI to maintain high availability?"`,
      options: [
        {
          id: "s1",
          label: "Define a NotificationService interface with multiple implementations (SMS, Email, Mock) and inject via interface",
          isCorrect: true,
          explanation: "Ideal! Programming to interfaces allows fallback strategies and clean decoupling.",
        },
        {
          id: "s2",
          label: "Put a 5-minute sleep inside the checkout controller",
          isCorrect: false,
          explanation: "Blocking threads will exhaust server connection pools and crash the app.",
        },
        {
          id: "s3",
          label: "Remove notifications entirely from the system",
          isCorrect: false,
          explanation: "Customers require confirmation receipts for orders.",
        },
      ],
      correctOptionId: "s1",
      sampleTeacherExplanation:
        "Impressive professional judgment! Injecting interfaces allows you to swap or fallback to email notifications effortlessly.",
      xpValue: 30,
    },
    {
      id: `day-${dayNum}-act-6`,
      stepNumber: 6,
      stepName: "Review",
      type: "complete",
      title: "Quick Review & Lock-In",
      teacherPrompt: `Complete the sentence to lock in this concept forever:`,
      fillSentence: "In modern software architecture, classes should receive their dependencies from the ______ rather than instantiating them directly.",
      options: [
        { id: "c1", label: "Container / Caller", isCorrect: true },
        { id: "c2", label: "Database Disk", isCorrect: false },
        { id: "c3", label: "Browser Cookie", isCorrect: false },
      ],
      correctOptionId: "c1",
      sampleTeacherExplanation:
        "You have fully mastered today's core concept! Your solution was clean, methodical, and job-ready.",
      xpValue: 30,
    },
  ];
}

export function InteractiveLessonEngine({
  dayNum,
  trackId,
  trackName,
  topicTitle,
  topicDescription,
  activities,
  onComplete,
  onExit,
}: InteractiveLessonEngineProps) {
  const store = useAppStore();

  const lessonActivities = useMemo(() => {
    return activities && activities.length > 0
      ? activities
      : generateDefaultDayActivities(dayNum, topicTitle, trackName);
  }, [activities, dayNum, topicTitle, trackName]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [writtenAnswer, setWrittenAnswer] = useState("");
  const [arrangedTokens, setArrangedTokens] = useState<string[]>([]);
  const [availableTokens, setAvailableTokens] = useState<string[]>([]);
  const [isAnswerEvaluated, setIsAnswerEvaluated] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [teacherFeedback, setTeacherFeedback] = useState<string | null>(null);
  const [earnedXP, setEarnedXP] = useState(0);

  const currentActivity = lessonActivities[currentIndex] || lessonActivities[0]!;

  // Initialize token builder if current activity is "build"
  useMemo(() => {
    if (currentActivity.type === "build" && currentActivity.codeTokens) {
      // Shuffle available tokens
      const shuffled = [...currentActivity.codeTokens].sort(() => Math.random() - 0.5);
      setAvailableTokens(shuffled);
      setArrangedTokens([]);
    }
  }, [currentActivity]);

  const resetCurrentStep = () => {
    setSelectedOptionId(null);
    setWrittenAnswer("");
    setIsAnswerEvaluated(false);
    setIsAnswerCorrect(null);
    setTeacherFeedback(null);
    if (currentActivity.type === "build" && currentActivity.codeTokens) {
      setAvailableTokens([...currentActivity.codeTokens].sort(() => Math.random() - 0.5));
      setArrangedTokens([]);
    }
  };

  const handleEvaluate = () => {
    if (currentActivity.type === "explain") {
      if (writtenAnswer.trim().length < 5) {
        toast.warning("Please write a sentence explaining your thought.");
        return;
      }
      // Evaluate keywords or thoughtful response
      const keywords = currentActivity.expectedKeywords || ["decouple", "test", "inject", "mock"];
      const lower = writtenAnswer.toLowerCase();
      const matched = keywords.filter((k) => lower.includes(k));
      const passed = matched.length > 0 || writtenAnswer.trim().length >= 15;

      setIsAnswerCorrect(passed);
      setIsAnswerEvaluated(true);
      if (passed) {
        setTeacherFeedback(
          currentActivity.sampleTeacherExplanation ||
            "Good thinking! You articulated the core intuition clearly and accurately."
        );
        setEarnedXP((prev) => prev + currentActivity.xpValue);
        store.awardXp(currentActivity.xpValue);
      } else {
        setTeacherFeedback(
          "You're on the right track! Think about how decoupling allows passing mock objects during testing."
        );
      }
      return;
    }

    if (currentActivity.type === "build") {
      if (arrangedTokens.length !== (currentActivity.correctTokenOrder?.length || 0)) {
        toast.warning("Please arrange all code tokens before submitting.");
        return;
      }
      const isCorrect =
        JSON.stringify(arrangedTokens) === JSON.stringify(currentActivity.correctTokenOrder);

      setIsAnswerCorrect(isCorrect);
      setIsAnswerEvaluated(true);
      if (isCorrect) {
        setTeacherFeedback(
          currentActivity.sampleTeacherExplanation || "Great job! Your code syntax is structured properly."
        );
        setEarnedXP((prev) => prev + currentActivity.xpValue);
        store.awardXp(currentActivity.xpValue);
      } else {
        setTeacherFeedback("Almost! Look closely at the token placement order and try again.");
      }
      return;
    }

    // Default MCQ / Choice / Prediction / Scenario evaluation
    if (!selectedOptionId) {
      toast.warning("Please select an answer to continue.");
      return;
    }

    const chosenOption = currentActivity.options?.find((o) => o.id === selectedOptionId);
    const isCorrect = chosenOption?.isCorrect ?? (selectedOptionId === currentActivity.correctOptionId);

    setIsAnswerCorrect(isCorrect);
    setIsAnswerEvaluated(true);

    if (isCorrect) {
      setTeacherFeedback(
        chosenOption?.explanation ||
          currentActivity.sampleTeacherExplanation ||
          "Great! You understood the key principle immediately."
      );
      setEarnedXP((prev) => prev + currentActivity.xpValue);
      store.awardXp(currentActivity.xpValue);
    } else {
      setTeacherFeedback(
        chosenOption?.explanation ||
          "Not quite. Read through the options and look at why the decoupled alternative works better."
      );
    }
  };

  const handleNextStep = () => {
    if (currentIndex < lessonActivities.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      resetCurrentStep();
    } else {
      // Completed all activities for today!
      toast.success("Congratulations! Day completed successfully.", {
        description: `+${earnedXP} XP added to your talent profile.`,
      });
      onComplete();
    }
  };

  const progressPercent = Math.round(((currentIndex + 1) / lessonActivities.length) * 100);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-8 space-y-6 animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-border/80">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors p-1.5 -ml-1.5 rounded-lg hover:bg-muted"
          >
            <ArrowLeft className="size-4" />
            <span>Exit Lesson</span>
          </button>
          <span className="text-muted-foreground/40">|</span>
          <span className="text-xs font-semibold text-primary">
            Day {dayNum} · {trackName}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-900/50">
            <Zap className="size-3.5 fill-amber-500 text-amber-500" />
            <span>+{earnedXP} XP</span>
          </div>
          <span className="text-xs font-semibold text-muted-foreground font-mono">
            {currentIndex + 1} of {lessonActivities.length}
          </span>
        </div>
      </div>

      {/* Step Progress Dots */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span className="flex items-center gap-1.5 font-semibold text-foreground">
            <span className="size-2 rounded-full bg-primary animate-pulse" />
            Step {currentActivity.stepNumber}: {currentActivity.stepName}
          </span>
          <span>{progressPercent}% Completed</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Interactive Card */}
      <div className="rounded-2xl border border-border/90 bg-card p-6 sm:p-8 shadow-xs space-y-6">
        {/* Step Badge & Topic */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary uppercase tracking-wider">
              <Sparkles className="size-3" /> {currentActivity.stepName} Mode
            </span>
            {currentActivity.scenarioRole && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <Briefcase className="size-3" /> Role: {currentActivity.scenarioRole}
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {currentActivity.title}
          </h2>
        </div>

        {/* Teacher Question / Prompt */}
        <div className="rounded-xl bg-muted/40 border border-border/70 p-4 sm:p-5 text-sm sm:text-base leading-relaxed text-foreground font-medium flex items-start gap-3">
          <div className="size-8 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0 mt-0.5">
            <Lightbulb className="size-4.5" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Teacher's Challenge
            </p>
            <p>{currentActivity.teacherPrompt}</p>
          </div>
        </div>

        {/* Optional Context Snippet */}
        {currentActivity.contextSnippet && (
          <div className="rounded-xl bg-slate-950 text-slate-100 p-4 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[10px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Terminal className="size-3 text-emerald-400" /> Interactive Code Sample
              </span>
              <span>Read-only</span>
            </div>
            <pre>{currentActivity.contextSnippet}</pre>
          </div>
        )}

        {/* ================= Interaction Area Based on Type ================= */}

        {/* TYPE 1: Explain (Writing in student's own words) */}
        {currentActivity.type === "explain" && (
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Your Explanation (Write in simple words)
            </label>
            <textarea
              rows={3}
              value={writtenAnswer}
              disabled={isAnswerEvaluated && isAnswerCorrect === true}
              onChange={(e) => setWrittenAnswer(e.target.value)}
              placeholder="E.g., It makes code easier to test because we can pass mock dependencies from the outside..."
              className="w-full rounded-xl border border-border bg-background p-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        )}

        {/* TYPE 2: Build / Code Token Arrangement */}
        {currentActivity.type === "build" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Constructed Code Line:
              </p>
              <div className="min-h-[52px] rounded-xl border-2 border-dashed border-border bg-muted/20 p-2.5 flex flex-wrap gap-2 items-center">
                {arrangedTokens.length === 0 ? (
                  <span className="text-xs text-muted-foreground italic px-2">
                    Click tokens below in order to assemble your answer...
                  </span>
                ) : (
                  arrangedTokens.map((token, idx) => (
                    <button
                      key={`arranged-${idx}`}
                      disabled={isAnswerEvaluated && isAnswerCorrect === true}
                      onClick={() => {
                        setArrangedTokens((prev) => prev.filter((_, i) => i !== idx));
                        setAvailableTokens((prev) => [...prev, token]);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-primary text-primary-foreground px-3 py-1.5 font-mono text-xs font-medium shadow-2xs hover:bg-primary/90 transition-transform active:scale-95"
                    >
                      {token} <X className="size-3 ml-0.5 opacity-70" />
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Available Tokens:
              </p>
              <div className="flex flex-wrap gap-2">
                {availableTokens.map((token, idx) => (
                  <button
                    key={`available-${idx}`}
                    disabled={isAnswerEvaluated && isAnswerCorrect === true}
                    onClick={() => {
                      setAvailableTokens((prev) => prev.filter((_, i) => i !== idx));
                      setArrangedTokens((prev) => [...prev, token]);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/50 hover:bg-muted px-3 py-1.5 font-mono text-xs font-medium text-foreground hover:border-primary/40 transition-all active:scale-95"
                  >
                    {token}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TYPE 3: Multiple Choice / Prediction / Scenario Options */}
        {currentActivity.type !== "explain" && currentActivity.type !== "build" && (
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Select the best response:
            </p>
            <div className="space-y-2.5">
              {currentActivity.options?.map((option) => {
                const isSelected = selectedOptionId === option.id;
                const showSuccess = isAnswerEvaluated && option.isCorrect;
                const showWrong = isAnswerEvaluated && isSelected && !option.isCorrect;

                return (
                  <button
                    key={option.id}
                    disabled={isAnswerEvaluated && isAnswerCorrect === true}
                    onClick={() => setSelectedOptionId(option.id)}
                    className={cn(
                      "w-full text-left rounded-xl p-4 border text-sm font-medium transition-all flex items-start gap-3.5",
                      isSelected
                        ? "border-primary bg-primary/5 text-foreground ring-2 ring-primary/20"
                        : "border-border/80 bg-card hover:bg-muted/40 text-foreground",
                      showSuccess && "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500/20",
                      showWrong && "border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100 ring-2 ring-rose-500/20"
                    )}
                  >
                    <span
                      className={cn(
                        "size-6 rounded-full border flex items-center justify-center shrink-0 text-xs font-bold mt-0.5",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground bg-muted",
                        showSuccess && "border-emerald-500 bg-emerald-500 text-white",
                        showWrong && "border-rose-500 bg-rose-500 text-white"
                      )}
                    >
                      {option.id.toUpperCase()}
                    </span>
                    <span className="flex-1 leading-relaxed">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Teacher Feedback Panel (Shown after evaluation) */}
        {isAnswerEvaluated && teacherFeedback && (
          <div
            className={cn(
              "rounded-xl p-4 sm:p-5 border text-sm leading-relaxed space-y-2 animate-in fade-in duration-200",
              isAnswerCorrect
                ? "bg-emerald-50/80 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-200"
                : "bg-amber-50/80 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/50 text-amber-900 dark:text-amber-200"
            )}
          >
            <div className="flex items-center gap-2 font-bold">
              {isAnswerCorrect ? (
                <>
                  <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                  <span>Great! You got it.</span>
                </>
              ) : (
                <>
                  <AlertCircle className="size-5 text-amber-600 dark:text-amber-400" />
                  <span>Almost! Let's think together.</span>
                </>
              )}
            </div>
            <p className="text-xs sm:text-sm pl-7">{teacherFeedback}</p>
          </div>
        )}

        {/* Bottom Action Footer */}
        <div className="pt-4 border-t border-border/80 flex items-center justify-between gap-3">
          {isAnswerEvaluated && !isAnswerCorrect ? (
            <button
              onClick={resetCurrentStep}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
            >
              <RotateCcw className="size-3.5" />
              <span>Try Again</span>
            </button>
          ) : (
            <div />
          )}

          {!isAnswerEvaluated ? (
            <button
              onClick={handleEvaluate}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all active:scale-95 ml-auto"
            >
              <span>Submit & Check</span>
              <ArrowRight className="size-4" />
            </button>
          ) : isAnswerCorrect ? (
            <button
              onClick={handleNextStep}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all active:scale-95 ml-auto"
            >
              <span>{currentIndex === lessonActivities.length - 1 ? "Complete Lesson" : "Next Step"}</span>
              <ArrowRight className="size-4" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
