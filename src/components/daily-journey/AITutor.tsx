import { useState } from "react";
import { Sparkles, HelpCircle, BookOpen, Lightbulb, MessageSquare, ChevronRight, X, Send, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface AITutorProps {
  topic: string;
  practicePrompt: string;
  trackName: string;
  isOpen: boolean;
  onClose: () => void;
}

type TabMode = "explain" | "example" | "hint" | "interview";

export function AITutor({ topic, practicePrompt, trackName, isOpen, onClose }: AITutorProps) {
  const [activeTab, setActiveTab] = useState<TabMode>("explain");
  const [customQuestion, setCustomQuestion] = useState("");
  const [customAnswers, setCustomAnswers] = useState<Array<{ q: string; a: string }>>([]);
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const contentMap: Record<TabMode, { title: string; content: string }> = {
    explain: {
      title: "Simplified Breakdown",
      content: `In simple terms: Think of "${topic}" in ${trackName} as a reliable standard procedure. Rather than creating custom logic from scratch each time, professional engineers rely on this established pattern to guarantee speed, safety, and maintainability across high-traffic applications.`,
    },
    example: {
      title: "Real-World Production Use Case",
      content: `Top tech companies like Amazon and Stripe implement ${topic} daily. For example, during high-volume transactions, this prevents cascading failures by isolating errors, reducing latency, and ensuring atomic updates without freezing user sessions.`,
    },
    hint: {
      title: "Implementation Clue",
      content: `Keep your focus on the core objective: "${practicePrompt}". Verify input edge cases first, ensure dependencies are properly initialized, and test the return signature before finalizing.`,
    },
    interview: {
      title: "Recruiter & Tech Interview Framing",
      content: `Interviewers frequently ask: "Why would you choose this approach over the naive alternative?" Prepare to explain: 1) Time and space complexity trade-offs, 2) Resiliency against unexpected inputs, and 3) Observability in production environments.`,
    },
  };

  const handleAskCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;

    const q = customQuestion;
    setCustomQuestion("");
    setIsTyping(true);

    setTimeout(() => {
      setCustomAnswers((prev) => [
        ...prev,
        {
          q,
          a: `Regarding "${q}" in the context of ${topic} (${trackName}): The best practice is to design with modularity and defensive checks. Start by validating parameters, isolating state mutations, and adding automated test assertions to catch regressions early.`,
        },
      ]);
      setIsTyping(false);
    }, 650);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-xs phase-enter">
      <div className="journey-card relative flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden bg-card border border-border shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/70 px-5 py-4 bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Bot className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                AI Learning Coach
                <span className="rounded bg-primary/10 px-1.5 py-0.2 text-[10px] font-mono text-primary">
                  {trackName}
                </span>
              </h3>
              <p className="text-[11px] text-muted-foreground truncate max-w-xs">{topic}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex size-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="size-3.5" />
          </button>
        </div>

        {/* Action Tabs */}
        <div className="flex border-b border-border bg-muted/10 p-2 gap-1 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab("explain")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-medium transition-colors shrink-0",
              activeTab === "explain"
                ? "bg-card text-foreground shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Lightbulb className="size-3.5 text-amber-500" />
            Explain Simpler
          </button>
          <button
            onClick={() => setActiveTab("example")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-medium transition-colors shrink-0",
              activeTab === "example"
                ? "bg-card text-foreground shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <BookOpen className="size-3.5 text-blue-500" />
            Industry Example
          </button>
          <button
            onClick={() => setActiveTab("hint")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-medium transition-colors shrink-0",
              activeTab === "hint"
                ? "bg-card text-foreground shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <HelpCircle className="size-3.5 text-emerald-500" />
            Lab Hint
          </button>
          <button
            onClick={() => setActiveTab("interview")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-medium transition-colors shrink-0",
              activeTab === "interview"
                ? "bg-card text-foreground shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Sparkles className="size-3.5 text-purple-500" />
            Interview Angle
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Active Preset Answer */}
          <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground flex items-center gap-1.5 text-xs">
                <Sparkles className="size-3.5 text-primary" /> {contentMap[activeTab].title}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">Instant AI Insight</span>
            </div>
            <p className="text-muted-foreground leading-relaxed text-xs whitespace-pre-line">
              {contentMap[activeTab].content}
            </p>
          </div>

          {/* Conversation history if any custom questions */}
          {customAnswers.map((item, idx) => (
            <div key={idx} className="space-y-2 pt-2 border-t border-border">
              <div className="flex items-start gap-2 text-foreground font-medium">
                <MessageSquare className="size-3.5 text-primary shrink-0 mt-0.5" />
                <p>"{item.q}"</p>
              </div>
              <div className="rounded-lg bg-card border border-border p-3 text-muted-foreground leading-relaxed">
                {item.a}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-muted-foreground italic text-xs py-2">
              <Bot className="size-3.5 animate-spin text-primary" />
              Thinking through {trackName} architecture...
            </div>
          )}
        </div>

        {/* Custom Input Footer */}
        <form onSubmit={handleAskCustom} className="border-t border-border p-3 bg-muted/20 flex gap-2">
          <input
            type="text"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            placeholder={`Ask anything about ${topic}...`}
            className="flex-1 rounded-md border border-border bg-card px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={!customQuestion.trim() || isTyping}
            className="flex items-center justify-center rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <Send className="size-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
