import { useState } from "react";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Play,
  RotateCcw,
  Check,
  Building,
  UserCheck,
  Send,
  FileCode,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/app-store";
import { toast } from "sonner";

export interface CareerRole {
  id: string;
  title: string;
  badge: string;
  company: string;
  managerName: string;
  avatarBg: string;
  description: string;
  stages: {
    id: string;
    time: string;
    title: string;
    sender: string;
    senderRole: string;
    prompt: string;
    codeSnippet?: string;
    options: {
      id: string;
      label: string;
      isBest: boolean;
      feedback: string;
    }[];
  }[];
}

const CAREER_ROLES: CareerRole[] = [
  {
    id: "fullstack",
    title: "Junior Full Stack Developer",
    badge: "Engineering",
    company: "ApexCloud Enterprise",
    managerName: "Sarah Chen (Tech Lead)",
    avatarBg: "bg-blue-600",
    description: "Work on production microservices, debug live API incidents, handle PR reviews, and deploy fixes.",
    stages: [
      {
        id: "task-1",
        time: "Monday · 09:00 AM",
        sender: "Sarah Chen",
        senderRole: "Tech Lead",
        title: "Incident 104: Production Auth API Returning 500",
        prompt: "Our monitoring alerted that the /api/v1/auth/login endpoint is throwing unhandled NullPointerExceptions during high traffic spikes. How do you investigate first?",
        codeSnippet: `// AuthController.java\n@PostMapping("/login")\npublic ResponseEntity<TokenResponse> login(@RequestBody LoginRequest req) {\n  User user = userService.findByEmail(req.getEmail());\n  // BUG: What happens when user is null or email is empty?\n  String token = jwtProvider.generateToken(user.getId(), user.getRoles());\n  return ResponseEntity.ok(new TokenResponse(token));\n}`,
        options: [
          {
            id: "opt1",
            label: "Add an Optional<User> check and throw a custom BadCredentialsException(401) if not found",
            isBest: true,
            feedback: "Perfect engineering practice! Handling null gracefully and returning 401 prevents crashes and security leaks.",
          },
          {
            id: "opt2",
            label: "Restart the server and ignore it unless it happens again",
            isBest: false,
            feedback: "Restarting treats the symptom, not the root cause. Production traffic will trigger the crash again.",
          },
          {
            id: "opt3",
            label: "Disable authentication completely to stop errors",
            isBest: false,
            feedback: "Removing authentication exposes customer data and violates data protection standards.",
          },
        ],
      },
      {
        id: "task-2",
        time: "Monday · 02:30 PM",
        sender: "DevOps Team",
        senderRole: "Release Engineer",
        title: "PR Review: CI/CD Pipeline Verification",
        prompt: "Your pull request is ready. Before deploying to staging, which automated checks should pass in your CI pipeline?",
        options: [
          {
            id: "opt2_1",
            label: "Unit tests, integration tests, static code analysis (SonarQube), and security vulnerability audit",
            isBest: true,
            feedback: "Standard industry pipeline. Catching regression early saves hundreds of hours of downtime.",
          },
          {
            id: "opt2_2",
            label: "Just make sure it compiles on my local machine",
            isBest: false,
            feedback: "Local environments differ from production OS, runtime, and dependency trees.",
          },
        ],
      },
    ],
  },
  {
    id: "mle",
    title: "Junior ML Engineer",
    badge: "AI / Data",
    company: "NeuralPulse Health AI",
    managerName: "Dr. Vikram Rao (Chief AI Scientist)",
    avatarBg: "bg-purple-600",
    description: "Prepare training pipelines, engineer robust features, optimize models against overfitting, and evaluate metrics.",
    stages: [
      {
        id: "ml-task-1",
        time: "Tuesday · 10:15 AM",
        sender: "Dr. Vikram Rao",
        senderRole: "Chief AI Scientist",
        title: "Data Leakage Incident in Diagnostic Pipeline",
        prompt: "Our model achieves 99.8% accuracy on training data, but drops to 61% on clinical validation test batches. What is the most likely cause?",
        options: [
          {
            id: "ml_1",
            label: "Data leakage: Preprocessing (scaling/imputation) was applied to the entire dataset before train/test splitting",
            isBest: true,
            feedback: "Spot on! Data leakage causes artificial training inflation that fails immediately on unseen data.",
          },
          {
            id: "ml_2",
            label: "The test set was too small",
            isBest: false,
            feedback: "A 40% accuracy gap is the classic hallmark of severe leakage or extreme overfitting.",
          },
        ],
      },
    ],
  },
  {
    id: "marketing",
    title: "Digital Marketing Executive",
    badge: "Growth",
    company: "OmniGrowth Media",
    managerName: "Rachel Green (Growth VP)",
    avatarBg: "bg-emerald-600",
    description: "Run live campaigns, analyze conversion funnels, reduce Customer Acquisition Cost (CAC), and optimize ROAS.",
    stages: [
      {
        id: "dm-1",
        time: "Wednesday · 11:00 AM",
        sender: "Rachel Green",
        senderRole: "Growth VP",
        title: "Campaign Audit: High Click-Through-Rate but Low Conversions",
        prompt: "Our Google Ads campaign has a high 7.8% CTR, but only 0.4% conversion rate on the landing page. Where is the bottleneck?",
        options: [
          {
            id: "dm_1",
            label: "Landing page friction: Ad copy doesn't match the landing page promise or the page load time is too slow",
            isBest: true,
            feedback: "Exact diagnosis! High CTR means the hook is working, but page mismatch causes instant bounce.",
          },
          {
            id: "dm_2",
            label: "Increase the ad budget by 5x",
            isBest: false,
            feedback: "Increasing budget on a leaky funnel simply wastes money faster.",
          },
        ],
      },
    ],
  },
  {
    id: "medical",
    title: "Medical Coding Associate",
    badge: "Healthcare",
    company: "MediCare Solutions Global",
    managerName: "Ananya Sharma (Coding Auditor)",
    avatarBg: "bg-cyan-600",
    description: "Review clinical charts, assign accurate ICD-10/CPT codes, apply modifiers, and prevent claim denials.",
    stages: [
      {
        id: "med-1",
        time: "Thursday · 01:00 PM",
        sender: "Ananya Sharma",
        senderRole: "Coding Auditor",
        title: "Case Audit: Missing Modifier 25 on Evaluation & Management",
        prompt: "A physician performed a significant, separately identifiable E&M service on the same day as a minor surgical procedure. What is required to avoid claim denial?",
        options: [
          {
            id: "med_1",
            label: "Append Modifier 25 to the E&M code with documented clinical rationale",
            isBest: true,
            feedback: "Correct! Modifier 25 indicates a significant separate service on the same day.",
          },
          {
            id: "med_2",
            label: "Delete the surgical code and only bill the office visit",
            isBest: false,
            feedback: "This results in underbilling and inaccurate patient health records.",
          },
        ],
      },
    ],
  },
  {
    id: "sap",
    title: "SAP Associate",
    badge: "Enterprise",
    company: "Global Logistics SAP Corp",
    managerName: "Klaus Weber (SAP Lead)",
    avatarBg: "bg-indigo-600",
    description: "Execute Order-to-Cash transactions, resolve billing document blocks, and maintain enterprise ERP integrity.",
    stages: [
      {
        id: "sap-1",
        time: "Friday · 10:00 AM",
        sender: "Klaus Weber",
        senderRole: "SAP Lead",
        title: "Order-to-Cash: Billing Document Creation Blocked",
        prompt: "Sales order VA01 was created and delivery VL01N posted (PGI complete), but billing document VF01 fails with 'Billing status not relevant'. What should you check first?",
        options: [
          {
            id: "sap_1",
            label: "Item category billing relevance in VOV7 and copy control requirements in VTFL",
            isBest: true,
            feedback: "Precise SAP functional resolution! Item category settings control downstream billing readiness.",
          },
          {
            id: "sap_2",
            label: "Reboot the entire SAP S/4HANA production cluster",
            isBest: false,
            feedback: "This is a functional configuration parameter, not a hardware fault.",
          },
        ],
      },
    ],
  },
];

export function CareerSimulationHub() {
  const store = useAppStore();
  const [selectedRoleId, setSelectedRoleId] = useState<string>("fullstack");
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [chosenOptionId, setChosenOptionId] = useState<string | null>(null);
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [completedRoles, setCompletedRoles] = useState<string[]>([]);

  const activeRole = CAREER_ROLES.find((r) => r.id === selectedRoleId) || CAREER_ROLES[0]!;
  const activeStage = activeRole.stages[currentStageIdx] || activeRole.stages[0]!;

  const handleSelectRole = (roleId: string) => {
    setSelectedRoleId(roleId);
    setCurrentStageIdx(0);
    setChosenOptionId(null);
    setIsEvaluated(false);
  };

  const handleEvaluateChoice = () => {
    if (!chosenOptionId) {
      toast.warning("Please choose your professional decision.");
      return;
    }
    setIsEvaluated(true);
    const chosen = activeStage.options.find((o) => o.id === chosenOptionId);
    if (chosen?.isBest) {
      store.awardXp(50);
      toast.success("Professional decision verified! +50 XP");
    }
  };

  const handleNextStage = () => {
    if (currentStageIdx < activeRole.stages.length - 1) {
      setCurrentStageIdx((prev) => prev + 1);
      setChosenOptionId(null);
      setIsEvaluated(false);
    } else {
      if (!completedRoles.includes(selectedRoleId)) {
        setCompletedRoles((prev) => [...prev, selectedRoleId]);
      }
      toast.success(`Career Simulation completed for ${activeRole.title}!`, {
        description: "You demonstrated real-world workplace problem solving.",
      });
    }
  };

  const chosenOption = activeStage.options.find((o) => o.id === chosenOptionId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="size-8 rounded-lg bg-primary/10 text-primary grid place-items-center">
                <Briefcase className="size-4.5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Career Simulation Lab
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
              Step into the shoes of a working professional. Handle incoming manager tasks, solve client emergencies, and practice realistic workplace decisions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              {completedRoles.length} / {CAREER_ROLES.length} Roles Mastered
            </span>
          </div>
        </div>

        {/* Role Selector Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-border/70">
          {CAREER_ROLES.map((role) => {
            const isSelected = selectedRoleId === role.id;
            const isDone = completedRoles.includes(role.id);
            return (
              <button
                key={role.id}
                onClick={() => handleSelectRole(role.id)}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all border",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-muted/40 hover:bg-muted text-foreground border-border",
                  isDone && !isSelected && "border-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-950/20"
                )}
              >
                <span>{role.title}</span>
                {isDone && <CheckCircle2 className="size-3.5 text-emerald-500" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Role Workplace Simulation View */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Role Info & Team Profile */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4 lg:col-span-1 shadow-xs h-fit">
          <div className="flex items-center gap-3">
            <div className={cn("size-12 rounded-xl grid place-items-center text-white font-bold text-lg", activeRole.avatarBg)}>
              {activeRole.title.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                {activeRole.badge} Role
              </p>
              <h3 className="text-sm font-bold text-foreground leading-tight">
                {activeRole.title}
              </h3>
              <p className="text-xs text-muted-foreground">{activeRole.company}</p>
            </div>
          </div>

          <div className="rounded-xl bg-muted/40 border border-border/70 p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Supervising Lead:</span>
              <span className="font-semibold text-foreground">{activeRole.managerName}</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Workplace Status:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">● Live Shift Active</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            {activeRole.description}
          </p>

          <div className="pt-2 border-t border-border/60 space-y-1.5 text-xs">
            <p className="font-bold text-foreground">Workplace Pipeline:</p>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
              <span>Ticket</span> → <span>Analyze</span> → <span>Fix</span> → <span>Review</span> → <span>Deploy</span>
            </div>
          </div>
        </div>

        {/* Right: Live Workplace Task Ticket */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-7 space-y-6 lg:col-span-2 shadow-xs">
          <div className="flex items-center justify-between border-b border-border/80 pb-4">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {activeStage.time}
              </span>
            </div>
            <span className="text-xs font-semibold text-primary">
              Ticket {currentStageIdx + 1} of {activeRole.stages.length}
            </span>
          </div>

          {/* Ticket Header & Sender */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="size-7 rounded-full bg-primary/10 text-primary grid place-items-center text-xs font-bold">
                {activeStage.sender.charAt(0)}
              </span>
              <div>
                <p className="text-xs font-bold text-foreground">{activeStage.sender}</p>
                <p className="text-[10px] text-muted-foreground">{activeStage.senderRole} · {activeRole.company}</p>
              </div>
            </div>

            <h3 className="text-lg font-bold text-foreground">
              {activeStage.title}
            </h3>

            <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed bg-muted/30 p-4 rounded-xl border border-border/70">
              {activeStage.prompt}
            </p>
          </div>

          {/* Optional Code Snippet */}
          {activeStage.codeSnippet && (
            <div className="rounded-xl bg-slate-950 text-slate-100 p-4 font-mono text-xs overflow-x-auto border border-slate-800">
              <div className="text-[10px] text-slate-400 pb-2 mb-2 border-b border-slate-800 flex items-center justify-between">
                <span>Production Incident Trace</span>
                <span>Read-only</span>
              </div>
              <pre>{activeStage.codeSnippet}</pre>
            </div>
          )}

          {/* Decision Options */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              How will you respond?
            </p>
            <div className="space-y-2.5">
              {activeStage.options.map((opt) => {
                const isSelected = chosenOptionId === opt.id;
                const showSuccess = isEvaluated && opt.isBest;
                const showWrong = isEvaluated && isSelected && !opt.isBest;

                return (
                  <button
                    key={opt.id}
                    disabled={isEvaluated && chosenOption?.isBest}
                    onClick={() => setChosenOptionId(opt.id)}
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
                      {opt.id.charAt(opt.id.length - 1).toUpperCase()}
                    </span>
                    <span className="flex-1 leading-relaxed">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Evaluation Feedback */}
          {isEvaluated && chosenOption && (
            <div
              className={cn(
                "rounded-xl p-4 border text-xs sm:text-sm leading-relaxed space-y-1.5 animate-in fade-in duration-150",
                chosenOption.isBest
                  ? "bg-emerald-50/80 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-200"
                  : "bg-rose-50/80 border-rose-200 dark:bg-rose-950/30 dark:border-rose-900/50 text-rose-900 dark:text-rose-200"
              )}
            >
              <p className="font-bold flex items-center gap-1.5">
                {chosenOption.isBest ? (
                  <>
                    <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Manager Approved</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="size-4 text-rose-600 dark:text-rose-400" />
                    <span>Revision Requested</span>
                  </>
                )}
              </p>
              <p className="pl-5">{chosenOption.feedback}</p>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-3 border-t border-border/80 flex items-center justify-between">
            {isEvaluated && !chosenOption?.isBest && (
              <button
                onClick={() => {
                  setIsEvaluated(false);
                  setChosenOptionId(null);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
              >
                <RotateCcw className="size-3.5" />
                <span>Change Decision</span>
              </button>
            )}

            {!isEvaluated ? (
              <button
                onClick={handleEvaluateChoice}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs sm:text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all ml-auto"
              >
                <span>Submit Workplace Action</span>
                <ArrowRight className="size-4" />
              </button>
            ) : chosenOption?.isBest ? (
              <button
                onClick={handleNextStage}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-6 py-2.5 text-xs sm:text-sm font-bold text-white transition-all ml-auto"
              >
                <span>{currentStageIdx === activeRole.stages.length - 1 ? "Complete Shift" : "Next Assignment"}</span>
                <ArrowRight className="size-4" />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
