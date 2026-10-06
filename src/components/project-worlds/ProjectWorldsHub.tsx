import { useState } from "react";
import {
  Layers,
  CheckCircle2,
  Lock,
  ArrowRight,
  Code2,
  FolderGit2,
  Terminal,
  Play,
  Sparkles,
  Zap,
  Globe,
  Database,
  Cpu,
  FileCheck,
  Building2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/app-store";
import { toast } from "sonner";

export interface ProjectWorld {
  id: string;
  title: string;
  domain: string;
  level: string;
  summary: string;
  technologies: string[];
  requirements: {
    id: string;
    stepNumber: number;
    title: string;
    description: string;
    acceptanceCriteria: string[];
    simulatedOutput: string;
    xpReward: number;
  }[];
}

const PROJECT_WORLDS: ProjectWorld[] = [
  {
    id: "fullstack-placement",
    title: "Build a Campus Placement System",
    domain: "Full Stack Web Engineering",
    level: "Capstone Level 4",
    summary:
      "Design and deploy an enterprise-grade multi-tenant placement management portal with authentication, candidate tracking, and recruiter dashboards.",
    technologies: ["React", "Spring Boot / Node", "PostgreSQL", "JWT Auth", "REST APIs"],
    requirements: [
      {
        id: "req-1",
        stepNumber: 1,
        title: "Requirement 01: Create User Models & Schema",
        description:
          "Define the relational database schema supporting Students, Admins, and Recruiters with normalized foreign key relationships.",
        acceptanceCriteria: [
          "Users table with role enum ('student', 'admin', 'recruiter')",
          "Unique email constraints and encrypted password hashes",
          "Audited createdAt and updatedAt timestamp triggers",
        ],
        simulatedOutput:
          "✓ Schema migration applied: users, roles, and session tokens created without errors.",
        xpReward: 50,
      },
      {
        id: "req-2",
        stepNumber: 2,
        title: "Requirement 02: Implement JWT Authentication & RBAC",
        description:
          "Create secure login and registration endpoints with JSON Web Tokens and role-based route middleware protection.",
        acceptanceCriteria: [
          "POST /api/v1/auth/login validates credentials and issues signed JWT",
          "Role-guard middleware rejects unauthorized access with 403 Forbidden",
        ],
        simulatedOutput:
          "✓ Security filter chain verified: Authenticated user token claims parsed successfully.",
        xpReward: 60,
      },
      {
        id: "req-3",
        stepNumber: 3,
        title: "Requirement 03: Student Profile & Skill Evidence Vault",
        description:
          "Construct interactive profile interfaces where students showcase verified coding labs, GitHub repos, and test scores.",
        acceptanceCriteria: [
          "PUT /api/v1/student/profile updates student bio, GPA, and graduation year",
          "Realtime UTS (Unified Talent Score) calculation pipeline integration",
        ],
        simulatedOutput:
          "✓ Profile service test passed: UTS recalculated dynamically based on activity weights.",
        xpReward: 70,
      },
      {
        id: "req-4",
        stepNumber: 4,
        title: "Requirement 04: Recruiter Company Module & Job Postings",
        description:
          "Enable corporate recruiters to post hiring drives, set minimum UTS cut-offs, and define open vacancies.",
        acceptanceCriteria: [
          "POST /api/v1/drives creates new hiring campaign with eligibility gates",
          "Company profile verification status check",
        ],
        simulatedOutput:
          "✓ Job requisition created: Candidate matching engine ready to filter applicants.",
        xpReward: 70,
      },
      {
        id: "req-5",
        stepNumber: 5,
        title: "Requirement 05: Job Application & Screening Pipeline",
        description:
          "Build one-click job application flows with automated eligibility gating and candidate shortlisting.",
        acceptanceCriteria: [
          "POST /api/v1/drives/:id/apply verifies student prerequisites before accepting",
          "Application status transition engine: Applied → Shortlisted → Interviewing → Offered",
        ],
        simulatedOutput:
          "✓ Application pipeline live: 120 simulated students screened against eligibility criteria.",
        xpReward: 80,
      },
      {
        id: "req-6",
        stepNumber: 6,
        title: "Requirement 06: Admin Analytics & Placement Dashboard",
        description:
          "Design real-time executive dashboard visualizing batch placement percentages, top packages, and company participation.",
        acceptanceCriteria: [
          "Aggregated metrics for total placed, active drives, and offer acceptance rate",
          "Searchable student cohort matrix with CSV export capability",
        ],
        simulatedOutput:
          "✓ Dashboard analytics queried: 100% chart render accuracy with sub-50ms latency.",
        xpReward: 90,
      },
      {
        id: "req-7",
        stepNumber: 7,
        title: "Requirement 07: Automated Placement Reports & Export",
        description:
          "Generate accredited compliance reports (NIRF / NAAC format) for institutional placement audits.",
        acceptanceCriteria: [
          "Automated PDF/CSV generator compiling full cohort compensation distributions",
          "Digital signature validation for placement verification certificates",
        ],
        simulatedOutput:
          "✓ Final Project World Capstone completed! Production deployment build artifact generated.",
        xpReward: 120,
      },
    ],
  },
  {
    id: "aiml-placement",
    title: "Build a Student Placement Prediction AI",
    domain: "Machine Learning & Data Science",
    level: "Capstone Level 4",
    summary:
      "Clean raw academic datasets, perform exploratory analysis, train supervised classification models, and deploy an inference API.",
    technologies: ["Python", "Pandas", "Scikit-Learn", "FastAPI", "XGBoost"],
    requirements: [
      {
        id: "ai-1",
        stepNumber: 1,
        title: "Requirement 01: Dataset Ingestion & Missing Value Imputation",
        description:
          "Load 10,000 historical placement records, handle outliers, and impute missing numerical and categorical fields.",
        acceptanceCriteria: [
          "Clean dataset without null artifacts",
          "Identify and remove skewed anomalies",
        ],
        simulatedOutput:
          "✓ Data pipeline executed: 10,000 rows cleaned, 0 null records remaining.",
        xpReward: 60,
      },
      {
        id: "ai-2",
        stepNumber: 2,
        title: "Requirement 02: Feature Engineering & Correlation Matrix",
        description:
          "Extract high-impact features (Coding XP, Hackathon participation, Mock interview scores, Aptitude percentile).",
        acceptanceCriteria: [
          "One-hot encode academic tracks",
          "Generate correlation heatmaps showing feature significance",
        ],
        simulatedOutput:
          "✓ Features engineered: 14 key predictors selected with high mutual information score.",
        xpReward: 70,
      },
      {
        id: "ai-3",
        stepNumber: 3,
        title: "Requirement 03: Model Training, Cross-Validation & Metric Tuning",
        description:
          "Train Logistic Regression, Random Forest, and XGBoost classifiers with 5-fold cross validation.",
        acceptanceCriteria: [
          "Achieve ROC-AUC > 0.88 on validation split",
          "Evaluate Precision, Recall, and F1-score across all placement tiers",
        ],
        simulatedOutput:
          "✓ Model trained: XGBoost achieved 91.4% Accuracy and 0.93 ROC-AUC score.",
        xpReward: 90,
      },
    ],
  },
  {
    id: "growth-marketing",
    title: "From 0 to 100 Customers: Digital Marketing Engine",
    domain: "Growth Marketing & SEO",
    level: "Capstone Level 3",
    summary:
      "Develop complete positioning, setup high-converting landing funnels, configure search campaigns, and optimize ROAS.",
    technologies: ["Google Analytics 4", "Meta Ads", "SEO Audits", "Copywriting", "A/B Testing"],
    requirements: [
      {
        id: "dm-1",
        stepNumber: 1,
        title: "Requirement 01: Customer Persona & Value Proposition",
        description:
          "Define target ICP (Ideal Customer Profile), pain points, objection handling, and unique value proposition.",
        acceptanceCriteria: [
          "Complete ICP matrix documented",
          "Clear hook, problem, solution, and CTA hierarchy established",
        ],
        simulatedOutput:
          "✓ Persona mapped: 3 high-intent buyer personas identified with targeted value messaging.",
        xpReward: 60,
      },
      {
        id: "dm-2",
        stepNumber: 2,
        title: "Requirement 02: High-Converting Landing Page & Funnel Setup",
        description:
          "Design conversion architecture with clear above-the-fold value prop, social proof, and low-friction lead magnet.",
        acceptanceCriteria: [
          "Sub-2s page load speed optimization",
          "GA4 conversion event tracking configured",
        ],
        simulatedOutput:
          "✓ Funnel online: Event triggers verified for form submit, demo request, and checkout click.",
        xpReward: 70,
      },
    ],
  },
];

export function ProjectWorldsHub() {
  const store = useAppStore();
  const [selectedWorldId, setSelectedWorldId] = useState<string>("fullstack-placement");
  const [completedReqs, setCompletedReqs] = useState<Record<string, number[]>>({
    "fullstack-placement": [1],
    "aiml-placement": [],
    "growth-marketing": [],
  });
  const [activeReqIndex, setActiveReqIndex] = useState(0);
  const [isRunningSim, setIsRunningSim] = useState(false);

  const activeWorld =
    PROJECT_WORLDS.find((w) => w.id === selectedWorldId) || PROJECT_WORLDS[0]!;
  const completedList = completedReqs[selectedWorldId] || [];
  const currentReq = activeWorld.requirements[activeReqIndex] || activeWorld.requirements[0]!;

  const handleSelectWorld = (worldId: string) => {
    setSelectedWorldId(worldId);
    setActiveReqIndex(0);
    setIsRunningSim(false);
  };

  const handleRunRequirement = () => {
    setIsRunningSim(true);
    setTimeout(() => {
      setIsRunningSim(false);
      const reqNum = currentReq.stepNumber;
      if (!completedList.includes(reqNum)) {
        setCompletedReqs((prev) => ({
          ...prev,
          [selectedWorldId]: [...(prev[selectedWorldId] || []), reqNum],
        }));
        store.awardXp(currentReq.xpReward);
        toast.success(`Requirement 0${reqNum} passed!`, {
          description: `+${currentReq.xpReward} XP awarded for production milestone.`,
        });
      }
    }, 900);
  };

  const isCompleted = completedList.includes(currentReq.stepNumber);
  const totalCompleted = completedList.length;
  const progressPercent = Math.round((totalCompleted / activeWorld.requirements.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="size-8 rounded-lg bg-primary/10 text-primary grid place-items-center">
                <FolderGit2 className="size-4.5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Project Worlds
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
              Cards teach individual skills. Career simulation provides experience. <strong>Project Worlds combine everything into live capstone systems.</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300">
              {progressPercent}% World Progress
            </span>
          </div>
        </div>

        {/* Project Worlds Selector */}
        <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-border/70">
          {PROJECT_WORLDS.map((world) => {
            const isSelected = selectedWorldId === world.id;
            const worldDoneCount = (completedReqs[world.id] || []).length;
            const isWorldFinished = worldDoneCount === world.requirements.length;

            return (
              <button
                key={world.id}
                onClick={() => handleSelectWorld(world.id)}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all border",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-muted/40 hover:bg-muted text-foreground border-border",
                  isWorldFinished && !isSelected && "border-emerald-500/50 bg-emerald-50/30"
                )}
              >
                <span>{world.title}</span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.2 text-[10px] font-mono",
                    isSelected ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                  )}
                >
                  {worldDoneCount}/{world.requirements.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Project Blueprint & Milestone Roadmap */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4 lg:col-span-1 shadow-xs h-fit">
          <div>
            <span className="rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              {activeWorld.domain}
            </span>
            <h3 className="text-base font-bold text-foreground mt-1.5 leading-tight">
              {activeWorld.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {activeWorld.summary}
            </p>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-border/70">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Tech Stack:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {activeWorld.technologies.map((tech) => (
                <span
                  key={tech}
                  className="rounded-md border border-border bg-muted/50 px-2 py-0.5 text-[11px] font-mono text-foreground"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Progressive Requirements List */}
          <div className="space-y-2 pt-3 border-t border-border/70">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Requirements Blueprint ({totalCompleted}/{activeWorld.requirements.length})
            </p>
            <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
              {activeWorld.requirements.map((req, idx) => {
                const isCurrent = activeReqIndex === idx;
                const isPassed = completedList.includes(req.stepNumber);

                return (
                  <button
                    key={req.id}
                    onClick={() => setActiveReqIndex(idx)}
                    className={cn(
                      "w-full text-left rounded-xl p-3 text-xs font-medium transition-all border flex items-center justify-between gap-2",
                      isCurrent
                        ? "border-primary bg-primary/5 text-primary font-bold shadow-2xs"
                        : "border-border/60 bg-muted/20 hover:bg-muted/40 text-foreground",
                      isPassed && !isCurrent && "border-emerald-300/50 bg-emerald-50/20 text-emerald-950 dark:text-emerald-200"
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className={cn(
                          "size-5 rounded-full grid place-items-center text-[10px] font-bold shrink-0",
                          isPassed
                            ? "bg-emerald-500 text-white"
                            : isCurrent
                              ? "bg-primary text-white"
                              : "bg-muted text-muted-foreground"
                        )}
                      >
                        {isPassed ? <Check className="size-3" /> : req.stepNumber}
                      </span>
                      <span className="truncate">Req 0{req.stepNumber}: {req.title.split(": ")[1] || req.title}</span>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                      +{req.xpReward} XP
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Active Requirement Specification & Interactive Simulator */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-7 space-y-6 lg:col-span-2 shadow-xs">
          <div className="flex items-center justify-between border-b border-border/80 pb-4">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Requirement 0{currentReq.stepNumber} of 0{activeWorld.requirements.length}
              </span>
            </div>
            {isCompleted ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="size-3.5" /> Requirement Verified
              </span>
            ) : (
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                In Progress
              </span>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="text-xl font-bold text-foreground">
              {currentReq.title}
            </h3>
            <p className="text-sm text-foreground/90 leading-relaxed bg-muted/30 p-4 rounded-xl border border-border/70">
              {currentReq.description}
            </p>
          </div>

          {/* Acceptance Criteria Checklist */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Engineering Acceptance Criteria:
            </p>
            <div className="space-y-2">
              {currentReq.acceptanceCriteria.map((crit, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 text-xs text-foreground bg-card p-3 rounded-lg border border-border"
                >
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{crit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Build Verification & Simulation Output */}
          <div className="rounded-xl bg-slate-950 text-slate-100 p-4 font-mono text-xs overflow-x-auto border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[10px] text-slate-400 pb-2 border-b border-slate-800">
              <span className="flex items-center gap-1.5">
                <Terminal className="size-3 text-emerald-400" /> Automated Test & Build Output
              </span>
              <span>JUnit / Jest Pipeline</span>
            </div>
            <pre className="text-emerald-400">
              {isRunningSim
                ? "Running automated test suites and schema validation..."
                : isCompleted
                  ? currentReq.simulatedOutput
                  : "Awaiting build execution. Click 'Run Requirement Verification' below."}
            </pre>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-border/80 flex items-center justify-between">
            {activeReqIndex > 0 && (
              <button
                onClick={() => setActiveReqIndex((prev) => prev - 1)}
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
              >
                ← Previous Req
              </button>
            )}

            <button
              onClick={handleRunRequirement}
              disabled={isRunningSim}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition-all ml-auto",
                isCompleted
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-primary hover:bg-primary/90"
              )}
            >
              {isRunningSim ? (
                <>
                  <Sparkles className="size-4 animate-spin" />
                  <span>Executing Pipeline...</span>
                </>
              ) : isCompleted ? (
                <>
                  <Check className="size-4" />
                  <span>Re-verify Milestone (+0 XP)</span>
                </>
              ) : (
                <>
                  <Play className="size-4" />
                  <span>Run Requirement Verification (+{currentReq.xpReward} XP)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
