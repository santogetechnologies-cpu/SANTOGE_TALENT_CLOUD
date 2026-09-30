import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Timer,
  CheckCircle2,
  XCircle,
  Award,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Trophy,
} from "lucide-react";
import type { TrackId } from "@/lib/tracks";

interface FinalAssessmentProps {
  courseId: TrackId;
  courseTitle: string;
  onComplete: (score: number, passed: boolean) => void;
  onBack?: () => void;
}

interface Question {
  id: number;
  question: string;
  phase: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

// 5 Comprehensive, Course-Specific Final Exam Questions per track
const FINAL_EXAM_QUESTIONS: Record<TrackId, Question[]> = {
  java: [
    {
      id: 1,
      phase: "Phase 1: Foundation",
      question: "In Java 21, how do Virtual Threads (Project Loom) differ fundamentally from traditional Platform Threads?",
      options: [
        "Virtual threads are managed by the JVM rather than the OS kernel, allowing millions of concurrent tasks with minimal memory footprint.",
        "Virtual threads execute bytecode without JVM memory allocation.",
        "Virtual threads run 10x faster for CPU-bound matrix multiplication operations.",
        "Virtual threads do not support synchronized blocks or try-catch handlers.",
      ],
      correctIndex: 0,
      explanation: "Virtual threads are lightweight user-mode threads scheduled by the JVM on carrier platform threads, unlocking massive I/O concurrency.",
    },
    {
      id: 2,
      phase: "Phase 2: Core Skills",
      question: "Which Spring Boot transaction isolation level prevents dirty reads, non-repeatable reads, and phantom reads completely?",
      options: ["READ_UNCOMMITTED", "READ_COMMITTED", "REPEATABLE_READ", "SERIALIZABLE"],
      correctIndex: 3,
      explanation: "SERIALIZABLE provides the highest level of ACID isolation by locking full table ranges or using strict multiversion concurrency control.",
    },
    {
      id: 3,
      phase: "Phase 3: Applied Learning",
      question: "In Spring Data JPA, what is the primary architectural purpose of a DTO projection over entity mapping in high-throughput read endpoints?",
      options: [
        "It eliminates Hibernate first-level session tracking overhead and executes targeted column SELECT queries.",
        "It encrypts database columns before saving them to disk.",
        "It disables database foreign keys.",
        "It bypasses SQL syntax checking.",
      ],
      correctIndex: 0,
      explanation: "DTO projections select only the necessary columns directly into immutable records, eliminating entity lifecycle management overhead.",
    },
    {
      id: 4,
      phase: "Phase 4: Intermediate",
      question: "When designing an event-driven architecture with Apache Kafka, how do you ensure strictly ordered message processing per customer account?",
      options: [
        "Configure Kafka with a single broker only.",
        "Use customer_id as the Kafka message partition key.",
        "Set consumer fetch timeout to zero.",
        "Compress messages with Snappy.",
      ],
      correctIndex: 1,
      explanation: "Messages with identical keys are always hashed to the same partition, guaranteeing strictly ordered consumer processing per account.",
    },
    {
      id: 5,
      phase: "Phase 5: Advanced & Microservices",
      question: "In distributed microservice transactions across separate databases, which architectural pattern ensures eventual consistency without two-phase commit (2PC) locks?",
      options: ["Distributed 2PC Lock", "Saga Pattern (Choreography / Orchestration)", "Static ThreadLocal", "Global Mutex"],
      correctIndex: 1,
      explanation: "The Saga pattern coordinates local transactions and executes compensating transactions on failure, ensuring eventual consistency.",
    },
  ],
  aiml: [
    {
      id: 1,
      phase: "Phase 1: Foundation",
      question: "In Transformer neural architectures, what is the computational complexity of the standard Scaled Dot-Product Self-Attention mechanism with sequence length N?",
      options: ["O(N)", "O(N log N)", "O(N^2)", "O(1)"],
      correctIndex: 2,
      explanation: "Every token computes dot-product attention against every other token in the sequence, resulting in quadratic O(N^2) complexity.",
    },
    {
      id: 2,
      phase: "Phase 2: Core Skills",
      question: "Why is Cosine Similarity commonly preferred over Euclidean Distance for measuring semantic similarity between high-dimensional dense embeddings?",
      options: [
        "It evaluates vector orientation and angular difference independent of vector length/magnitude.",
        "It is only compatible with odd-numbered dimensions.",
        "It does not require floating point arithmetic.",
        "It eliminates the need for vector normalization.",
      ],
      correctIndex: 0,
      explanation: "Cosine similarity measures the angle between vectors, normalizing for magnitude variations across documents.",
    },
    {
      id: 3,
      phase: "Phase 3: Applied Learning",
      question: "In an advanced RAG (Retrieval-Augmented Generation) pipeline, what is the role of a Cross-Encoder Re-Ranker following vector similarity search?",
      options: [
        "It translates text into French.",
        "It performs joint attention across query and candidate chunks to refine top-K ranking accuracy.",
        "It deletes duplicate database tables.",
        "It generates image thumbnails.",
      ],
      correctIndex: 1,
      explanation: "Bi-encoders retrieve broad candidate sets quickly; cross-encoders perform full attention scoring to rank the highest-precision chunks.",
    },
    {
      id: 4,
      phase: "Phase 4: Intermediate",
      question: "What parameter-efficient fine-tuning (PEFT) method injects low-rank trainable decomposition matrices into transformer attention layers while freezing the base weights?",
      options: ["Full Fine-Tuning", "LoRA (Low-Rank Adaptation)", "Prompt Scraping", "Gradient Clipping"],
      correctIndex: 1,
      explanation: "LoRA decomposes weight updates into rank-r matrices (W = W0 + B*A), reducing trainable parameters by over 99%.",
    },
    {
      id: 5,
      phase: "Phase 5: Advanced & AI Agents",
      question: "In the ReAct (Reasoning + Acting) agent framework, how does the LLM interact with external tools and APIs?",
      options: [
        "It modifies the operating system BIOS.",
        "It alternates between generating explicit Thought steps and formatted Action tool invocations until an Observation resolves the goal.",
        "It replaces Python with assembly code.",
        "It runs without prompt context.",
      ],
      correctIndex: 1,
      explanation: "ReAct loops through Thought -> Action -> Observation cycles, enabling dynamic tool selection and self-correction.",
    },
  ],
  datascience: [
    {
      id: 1,
      phase: "Phase 1: Foundation",
      question: "When evaluating a binary classifier on a highly imbalanced dataset (e.g. 1% fraud cases), which metric provides the most reliable evaluation of positive class performance?",
      options: ["Overall Accuracy", "Precision-Recall AUC (PR-AUC)", "Mean Squared Error", "R-Squared"],
      correctIndex: 1,
      explanation: "Overall accuracy is easily misled by predicting all negatives; PR-AUC focuses directly on the minority class trade-off.",
    },
    {
      id: 2,
      phase: "Phase 2: Core Skills",
      question: "In SQL analytic window functions, what is the difference between RANK() and DENSE_RANK() when ties occur in ordering?",
      options: [
        "RANK() skips subsequent rank numbers after ties (e.g., 1, 2, 2, 4); DENSE_RANK() does not skip numbers (e.g., 1, 2, 2, 3).",
        "RANK() works on text only; DENSE_RANK() works on integers.",
        "DENSE_RANK() deletes tie records.",
        "RANK() reverses alphabetical order.",
      ],
      correctIndex: 0,
      explanation: "RANK leaves gaps in sequence when values tie; DENSE_RANK produces contiguous ranks without gaps.",
    },
    {
      id: 3,
      phase: "Phase 3: Applied Learning",
      question: "Why should Target Encoding for categorical variables always be calculated strictly inside cross-validation folds or with out-of-fold smoothing?",
      options: [
        "To prevent target leakage that causes severe overfitting to training data.",
        "To speed up GPU clock cycles.",
        "Because SQL cannot group by strings.",
        "To convert numbers into Roman numerals.",
      ],
      correctIndex: 0,
      explanation: "Calculating target encoding across the entire dataset leaks target labels into predictor features, artificially inflating validation metrics.",
    },
    {
      id: 4,
      phase: "Phase 4: Intermediate",
      question: "In TreeSHAP explainability for gradient boosted trees, what does an individual feature's SHAP value represent?",
      options: [
        "The feature's correlation with the target variable.",
        "The marginal contribution of that feature to the change in prediction relative to the baseline expected value.",
        "The p-value of a two-sample t-test.",
        "The percentage of missing values.",
      ],
      correctIndex: 1,
      explanation: "SHAP values allocate prediction deltas fairly based on cooperative game-theoretic Shapley values.",
    },
    {
      id: 5,
      phase: "Phase 5: Advanced",
      question: "What is the primary indicator of Data Drift in production machine learning models?",
      options: [
        "The server hard drive runs out of disk space.",
        "The statistical distribution of input features P(X) shifts significantly from the training distribution.",
        "The model code is updated via git commit.",
        "The API response status code returns 200.",
      ],
      correctIndex: 1,
      explanation: "Data drift occurs when incoming feature distributions shift over time, degrading model accuracy.",
    },
  ],
  medical: [
    {
      id: 1,
      phase: "Phase 1: Foundation",
      question: "Under HIPAA and OIG billing compliance guidelines, what is the legal difference between Healthcare Fraud and Healthcare Abuse?",
      options: [
        "Fraud involves intentional deception or misrepresentation; abuse involves improper billing practices that result in unnecessary costs.",
        "Fraud only applies to hospitals; abuse applies only to private physicians.",
        "Fraud is civil; abuse is always a federal felony.",
        "There is no legal difference between them.",
      ],
      correctIndex: 0,
      explanation: "Fraud requires criminal intent or knowing misrepresentation; abuse results from ignorance or deficient billing practices.",
    },
    {
      id: 2,
      phase: "Phase 2: Core Skills",
      question: "In CPT surgical coding, what does Modifier -59 (Distinct Procedural Service) certify to the payer?",
      options: [
        "That the surgeon was accompanied by an assistant surgeon.",
        "That the procedure was distinct or independent from other non-E/M services performed on the same day.",
        "That the patient had no insurance coverage.",
        "That the procedure was cancelled before completion.",
      ],
      correctIndex: 1,
      explanation: "Modifier -59 overrides NCCI bundling edits by certifying that a separate anatomical site, session, or lesion was treated.",
    },
    {
      id: 3,
      phase: "Phase 3: Applied Learning",
      question: "Under Medicare NCCI (National Correct Coding Initiative) bundling edits, what does an edit with Modifier Indicator '0' mean?",
      options: [
        "Modifiers are permitted to unbundle the codes.",
        "Modifiers are NEVER permitted to unbundle the code pair under any clinical circumstances.",
        "The codes are paid at 200% reimbursement.",
        "The claim is automatically forwarded to the FBI.",
      ],
      correctIndex: 1,
      explanation: "Indicator 0 means unbundling is strictly prohibited; Indicator 1 permits appropriate clinical modifier override.",
    },
    {
      id: 4,
      phase: "Phase 4: Intermediate",
      question: "In Medicare Advantage Risk Adjustment (CMS-HCC), why must chronic conditions (e.g. Type 2 Diabetes with Neuropathy) be re-documented and coded every calendar year?",
      options: [
        "CMS-HCC risk adjustment models reset annually on January 1; risk scores do not carry over from prior years.",
        "Because ICD-10 codes expire after 12 months.",
        "To check if the patient changed their legal name.",
        "Because insurance companies delete their databases on New Year's Eve.",
      ],
      correctIndex: 0,
      explanation: "Medicare Advantage risk adjustment relies on annual encounter submissions to calculate patient risk scores for each calendar year.",
    },
    {
      id: 5,
      phase: "Phase 5: Advanced & Inpatient",
      question: "In hospital inpatient prospective payment systems (IPPS), what two clinical factors determine MS-DRG assignment when a base DRG is split?",
      options: [
        "Complication or Comorbidity (CC) and Major Complication or Comorbidity (MCC).",
        "Patient net worth and credit score.",
        "Hospital bed count and cafeteria rating.",
        "Day of the week and weather conditions.",
      ],
      correctIndex: 0,
      explanation: "MS-DRGs are stratified into tiers based on the presence of secondary diagnoses categorized as CC or MCC.",
    },
  ],
  marketing: [
    {
      id: 1,
      phase: "Phase 1: Foundation",
      question: "What is the foundational architectural difference between legacy Universal Analytics (UA) and modern Google Analytics 4 (GA4)?",
      options: [
        "UA was session-based; GA4 is built entirely on an event-driven data model where every interaction is an event.",
        "GA4 is only available on desktop browsers.",
        "UA required weekly paper printouts.",
        "GA4 cannot track conversions.",
      ],
      correctIndex: 0,
      explanation: "In GA4, pageviews, clicks, scrolls, and purchases are unified under flexible event schemas with custom parameters.",
    },
    {
      id: 2,
      phase: "Phase 2: Core Skills",
      question: "In Meta Ads Creative Testing, why is dynamic creative testing (DCT) or Sandbox testing recommended prior to scaling budget?",
      options: [
        "It prevents budget waste by testing combinations of hooks, creatives, and copy to identify statistically verified winners.",
        "It bypasses Meta advertising fees.",
        "It guarantees that ads are only shown to verified billionaires.",
        "It allows running ads without images or video.",
      ],
      correctIndex: 0,
      explanation: "Testing creatives in isolated sandboxes identifies top-performing combinations before deploying heavy spend in CBO campaigns.",
    },
    {
      id: 3,
      phase: "Phase 3: Applied Learning",
      question: "Why is Event Deduplication mandatory when implementing both client-side Meta Pixel and server-side Conversions API (CAPI)?",
      options: [
        "To prevent Meta from counting identical conversions twice when both browser and server payloads arrive for the same purchase.",
        "To delete customer contact details.",
        "To disable website caching.",
        "Because browsers will crash if duplicate events are sent.",
      ],
      correctIndex: 0,
      explanation: "Passing identical event_id values allows Meta to deduplicate duplicate events and maintain accurate ROAS metrics.",
    },
    {
      id: 4,
      phase: "Phase 4: Intermediate",
      question: "In marketing unit economics, what does an LTV:CAC ratio of 4:1 with a 3-month CAC payback period indicate about growth viability?",
      options: [
        "Exceptional business health; customer lifetime value is 4x acquisition cost, and marketing cash recycles within 90 days.",
        "Severe insolvency; advertising should be halted immediately.",
        "The company is losing money on every sale.",
        "The metrics are statistically impossible.",
      ],
      correctIndex: 0,
      explanation: "A 4:1 LTV:CAC with sub-6-month payback represents benchmark top-quartile SaaS/e-commerce unit economics.",
    },
    {
      id: 5,
      phase: "Phase 5: Advanced & Attribution",
      question: "Why does First-Touch Attribution typically undervalue retargeting channels, while Last-Touch Attribution undervalues top-of-funnel brand awareness?",
      options: [
        "First-Touch credits 100% to discovery channels; Last-Touch credits 100% to the closing click, ignoring full-funnel touchpoints.",
        "Neither model works with modern computers.",
        "They are designed specifically for print newspaper ads only.",
        "They only track organic search traffic.",
      ],
      correctIndex: 0,
      explanation: "Single-touch attribution models oversimplify customer journeys by ignoring intermediate nurturing interactions.",
    },
  ],
  sap: [
    {
      id: 1,
      phase: "Phase 1: Foundation",
      question: "What is the primary architectural innovation of the S/4HANA Universal Journal (Table ACDOCA)?",
      options: [
        "It merges General Ledger, Asset Accounting, Controlling, and Material Ledger into a single unified line item table.",
        "It deletes all historical journal entries older than 30 days to save memory.",
        "It converts relational database tables into unstructured CSV files.",
        "It requires double entry of both FI and CO documents into separate relational databases.",
      ],
      correctIndex: 0,
      explanation: "Universal Journal table ACDOCA unites previously disparate modules into a single source of financial truth.",
    },
    {
      id: 2,
      phase: "Phase 2: Core Skills",
      question: "In S/4HANA Bank Accounting, what is the role of Bank Sub-Accounts (e.g. Outgoing Wire Clearing) during vendor disbursements?",
      options: [
        "They track in-transit disbursements until the Electronic Bank Statement (EBS) reconciles and clears the Main Bank ledger.",
        "They hide transactions from external tax authorities.",
        "They prevent payments exceeding $100.",
        "They convert company funds into foreign currencies automatically.",
      ],
      correctIndex: 0,
      explanation: "Sub-accounts ensure that main bank ledgers only reflect transactions that have cleared the external bank statement.",
    },
    {
      id: 3,
      phase: "Phase 3: Applied Learning",
      question: "In S/4HANA New Asset Accounting, what is the purpose of the Technical Clearing Account during integrated asset acquisitions?",
      options: [
        "It splits the entry into an operational vendor liability and ledger-specific asset capitalizations for different accounting principles.",
        "It holds confiscated funds during government audits.",
        "It charges transaction fees to suppliers.",
        "It prevents assets from being photographed in factories.",
      ],
      correctIndex: 0,
      explanation: "The technical clearing account enables independent multi-ledger capitalization (e.g. GAAP vs IFRS) without duplicating vendor liabilities.",
    },
    {
      id: 4,
      phase: "Phase 4: Intermediate",
      question: "How does New G/L Document Splitting guarantee fully-balanced balance sheets by Segment under IFRS 8?",
      options: [
        "It actively splits balance sheet lines (Payables, Tax, Cash) proportionally based on expense segments and uses zero-balance clearing accounts.",
        "It requires all segments to spend their budget to zero.",
        "It deletes segments with negative balances.",
        "It converts company codes into non-profit foundations.",
      ],
      correctIndex: 0,
      explanation: "Document splitting balances debits and credits across each individual segment characteristic.",
    },
    {
      id: 5,
      phase: "Phase 5: Advanced & Controlling",
      question: "What is the key architectural difference between S/4HANA Margin Analysis and legacy Costing-Based CO-PA?",
      options: [
        "Margin Analysis is fully integrated into Universal Journal table ACDOCA using G/L accounts, ensuring 100% reconciliation with FI.",
        "Margin Analysis does not calculate profits.",
        "Costing-Based CO-PA is only supported on mobile phones.",
        "Margin Analysis eliminates all cost of sales.",
      ],
      correctIndex: 0,
      explanation: "Margin Analysis resides natively in ACDOCA, eliminating historical reconciliation gaps between finance and controlling.",
    },
  ],
};

export function FinalAssessment({
  courseId,
  courseTitle,
  onComplete,
  onBack,
}: FinalAssessmentProps) {
  const questions = FINAL_EXAM_QUESTIONS[courseId] || FINAL_EXAM_QUESTIONS.java;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes

  // Countdown timer
  useEffect(() => {
    if (submitted || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [submitted, timeLeft]);

  const handleSelect = (optionIdx: number) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentIdx]: optionIdx }));
  };

  const handleFinish = () => {
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correctCount += 1;
      }
    });

    const percent = Math.round((correctCount / questions.length) * 100);
    setScore(percent);
    setSubmitted(true);
  };

  const q = questions[currentIdx]!;
  const answeredCount = Object.keys(selectedAnswers).length;
  const isPassed = score >= 70;

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-6 md:p-8 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-400">
        <div
          className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-5 shadow-xl ${
            isPassed
              ? "bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-500 shadow-emerald-500/10"
              : "bg-destructive/10 border-2 border-destructive/30 text-destructive shadow-destructive/10"
          }`}
        >
          {isPassed ? <Trophy className="w-10 h-10 text-amber-500" /> : <XCircle className="w-10 h-10" />}
        </div>

        <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground font-semibold">
          Day 90 Comprehensive Technical Certification
        </span>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mt-1">
          {isPassed ? "Certification Exam Passed!" : "Assessment Incomplete"}
        </h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-md">
          {isPassed
            ? `Congratulations! You scored ${score}% and demonstrated technical mastery across all 6 curriculum phases of ${courseTitle}.`
            : `You scored ${score}%. A minimum passing score of 70% is required for graduation certification.`}
        </p>

        {/* Score Card */}
        <div className="grid grid-cols-2 gap-4 my-6 w-full max-w-xs">
          <div className="p-4 rounded-2xl bg-card border border-border/60 text-center shadow-sm">
            <span className="text-xs text-muted-foreground">Final Score</span>
            <p className={`text-2xl font-bold ${isPassed ? "text-emerald-500" : "text-destructive"}`}>
              {score}%
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-center shadow-sm">
            <span className="text-xs text-primary font-medium">Talent Boost</span>
            <p className="text-2xl font-bold text-primary">+{isPassed ? 200 : 50} XP</p>
          </div>
        </div>

        {/* Action Button */}
        {isPassed ? (
          <button
            onClick={() => onComplete(score, true)}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg hover:bg-primary/90 active:scale-[0.98] transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Claim Verified Graduation Credential</span>
          </button>
        ) : (
          <button
            onClick={() => {
              setSubmitted(false);
              setSelectedAnswers({});
              setCurrentIdx(0);
              setTimeLeft(15 * 60);
            }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-medium text-sm border border-border transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Certification Exam</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/40">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-primary uppercase tracking-wider font-semibold">
              Day 90 Comprehensive Certification • {courseTitle}
            </span>
            <h2 className="text-lg md:text-xl font-bold text-foreground">
              Question {currentIdx + 1} of {questions.length}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-muted/60 text-xs font-mono font-medium">
            <Timer className="w-3.5 h-3.5 text-muted-foreground" />
            <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}</span>
          </div>

          {onBack && (
            <button
              onClick={onBack}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Exit Exam
            </button>
          )}
        </div>
      </div>

      {/* Progress Dots */}
      <div className="flex items-center gap-2">
        {questions.map((_, idx) => {
          const isAnswered = selectedAnswers[idx] !== undefined;
          const isCurrent = idx === currentIdx;

          return (
            <button
              key={idx}
              onClick={() => setCurrentIdx(idx)}
              className={`h-2 rounded-full transition-all flex-1 ${
                isCurrent
                  ? "bg-primary"
                  : isAnswered
                  ? "bg-primary/40"
                  : "bg-muted"
              }`}
            />
          );
        })}
      </div>

      {/* Question Card */}
      <div className="p-6 md:p-8 rounded-2xl bg-card border border-border/60 shadow-sm flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground">
            {q.phase}
          </span>
          <span className="text-xs text-muted-foreground">
            {answeredCount} of {questions.length} answered
          </span>
        </div>

        <h3 className="text-base md:text-lg font-bold text-foreground leading-snug">
          {q.question}
        </h3>

        {/* Options */}
        <div className="flex flex-col gap-3 pt-2">
          {q.options.map((opt, idx) => {
            const isSelected = selectedAnswers[currentIdx] === idx;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelect(idx)}
                className={`p-4 rounded-xl text-left text-xs md:text-sm font-medium border transition-all flex items-start gap-3 ${
                  isSelected
                    ? "bg-primary/10 border-primary text-primary shadow-sm"
                    : "bg-muted/30 hover:bg-muted/60 border-border/60 text-foreground"
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-xs shrink-0 mt-0.5 border ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border/60"
                  }`}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="leading-relaxed">{opt}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          disabled={currentIdx === 0}
          onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
          className="px-4 py-2 rounded-xl border border-border/60 text-xs font-medium hover:bg-muted disabled:opacity-30 transition-all"
        >
          Previous Question
        </button>

        {currentIdx < questions.length - 1 ? (
          <button
            onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow hover:bg-primary/90 transition-all"
          >
            <span>Next Question</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            disabled={answeredCount < questions.length}
            onClick={handleFinish}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md disabled:opacity-40 transition-all"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Submit Final Examination</span>
          </button>
        )}
      </div>
    </div>
  );
}
