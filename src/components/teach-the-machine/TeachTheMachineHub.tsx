import { useState } from "react";
import {
  Cpu,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Sparkles,
  Zap,
  Code2,
  Layers,
  ArrowRight,
  Plus,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/app-store";
import { toast } from "sonner";

export interface RuleClause {
  field: string;
  operator: "EQUALS" | "CONTAINS" | "GREATER_THAN" | "LESS_THAN";
  value: string;
}

export interface MachineRule {
  id: string;
  name: string;
  clauses: RuleClause[];
  action: string;
}

export interface TestCase {
  id: string;
  name: string;
  input: Record<string, string | number>;
  expectedAction: string;
}

export interface RuleChallenge {
  id: string;
  title: string;
  domain: string;
  description: string;
  fields: string[];
  actions: string[];
  initialRules: MachineRule[];
  testCases: TestCase[];
}

const RULE_CHALLENGES: RuleChallenge[] = [
  {
    id: "auth-gateway",
    title: "Teach the Machine: API Gateway Rate Limiter & Auth Gate",
    domain: "Backend Security",
    description:
      "Write conditional rules to instruct the machine on when to ALLOW, RATE_LIMIT, or BLOCK incoming API requests based on token headers and request frequency.",
    fields: ["authHeader", "requestsPerMin", "clientIpReputation", "endpoint"],
    actions: ["ALLOW_REQUEST", "RATE_LIMIT_429", "BLOCK_FORBIDDEN_403"],
    initialRules: [
      {
        id: "r1",
        name: "Block Missing Auth on Protected Endpoints",
        clauses: [{ field: "authHeader", operator: "EQUALS", value: "NONE" }],
        action: "BLOCK_FORBIDDEN_403",
      },
      {
        id: "r2",
        name: "Rate Limit High Frequency Spikes",
        clauses: [{ field: "requestsPerMin", operator: "GREATER_THAN", value: "100" }],
        action: "RATE_LIMIT_429",
      },
    ],
    testCases: [
      {
        id: "t1",
        name: "Test 01: Valid User Token Normal Traffic",
        input: { authHeader: "BEARER_VALID", requestsPerMin: 40, endpoint: "/api/v1/profile" },
        expectedAction: "ALLOW_REQUEST",
      },
      {
        id: "t2",
        name: "Test 02: Missing Auth Header on Private API",
        input: { authHeader: "NONE", requestsPerMin: 10, endpoint: "/api/v1/checkout" },
        expectedAction: "BLOCK_FORBIDDEN_403",
      },
      {
        id: "t3",
        name: "Test 03: Bot Traffic (> 100 req/min)",
        input: { authHeader: "BEARER_VALID", requestsPerMin: 250, endpoint: "/api/v1/search" },
        expectedAction: "RATE_LIMIT_429",
      },
      {
        id: "t4",
        name: "Test 04: Public Health Check Without Auth Header",
        input: { authHeader: "NONE", requestsPerMin: 15, endpoint: "/health" },
        expectedAction: "ALLOW_REQUEST",
      },
    ],
  },
  {
    id: "medical-coding-rules",
    title: "Teach the Machine: Medical Coding Modifier Selection",
    domain: "Medical Coding",
    description:
      "Instruct the rule engine to apply appropriate CPT modifiers (Modifier 25, 59, or NONE) depending on procedure type and documentation.",
    fields: ["sameDayEM", "distinctProcedure", "documentationSupplied"],
    actions: ["APPLY_MODIFIER_25", "APPLY_MODIFIER_59", "BILL_STANDARD_CODE"],
    initialRules: [
      {
        id: "m1",
        name: "Apply Modifier 25 on Significant Separate E&M",
        clauses: [
          { field: "sameDayEM", operator: "EQUALS", value: "YES" },
          { field: "documentationSupplied", operator: "EQUALS", value: "YES" },
        ],
        action: "APPLY_MODIFIER_25",
      },
    ],
    testCases: [
      {
        id: "mt1",
        name: "Test 01: Significant Separate E&M with Chart Proof",
        input: { sameDayEM: "YES", documentationSupplied: "YES", distinctProcedure: "NO" },
        expectedAction: "APPLY_MODIFIER_25",
      },
      {
        id: "mt2",
        name: "Test 02: Standalone Office Visit",
        input: { sameDayEM: "NO", documentationSupplied: "YES", distinctProcedure: "NO" },
        expectedAction: "BILL_STANDARD_CODE",
      },
      {
        id: "mt3",
        name: "Test 03: Distinct Procedural Service on Separate Anatomical Site",
        input: { sameDayEM: "NO", documentationSupplied: "YES", distinctProcedure: "YES" },
        expectedAction: "APPLY_MODIFIER_59",
      },
    ],
  },
];

export function TeachTheMachineHub() {
  const store = useAppStore();
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>("auth-gateway");
  const challenge =
    RULE_CHALLENGES.find((c) => c.id === selectedChallengeId) || RULE_CHALLENGES[0]!;

  const [rules, setRules] = useState<MachineRule[]>(challenge.initialRules);
  const [testResults, setTestResults] = useState<
    { testId: string; passed: boolean; actualAction: string; expectedAction: string }[] | null
  >(null);
  const [hasRun, setHasRun] = useState(false);

  const handleSwitchChallenge = (id: string) => {
    setSelectedChallengeId(id);
    const next = RULE_CHALLENGES.find((c) => c.id === id) || RULE_CHALLENGES[0]!;
    setRules(next.initialRules);
    setTestResults(null);
    setHasRun(false);
  };

  const handleAddRule = () => {
    const newRule: MachineRule = {
      id: `rule-${Date.now()}`,
      name: `Custom Rule #${rules.length + 1}`,
      clauses: [{ field: challenge.fields[0]!, operator: "EQUALS", value: "VALUE" }],
      action: challenge.actions[0]!,
    };
    setRules([...rules, newRule]);
  };

  const handleDeleteRule = (id: string) => {
    setRules(rules.filter((r) => r.id !== id));
  };

  const handleUpdateClause = (
    ruleId: string,
    clauseIdx: number,
    field: string,
    operator: any,
    value: string
  ) => {
    setRules(
      rules.map((r) => {
        if (r.id !== ruleId) return r;
        const updatedClauses = [...r.clauses];
        updatedClauses[clauseIdx] = { field, operator, value };
        return { ...r, clauses: updatedClauses };
      })
    );
  };

  const handleUpdateAction = (ruleId: string, action: string) => {
    setRules(rules.map((r) => (r.id === ruleId ? { ...r, action } : r)));
  };

  // Lightweight simulated rule evaluation engine
  const runRuleEngine = () => {
    const results = challenge.testCases.map((tc) => {
      let matchedAction = challenge.actions[0]!; // Default fallback action

      // Check rules sequentially
      for (const r of rules) {
        let allClausesMatch = true;
        for (const cl of r.clauses) {
          const inputValue = tc.input[cl.field];
          if (cl.operator === "EQUALS") {
            if (String(inputValue) !== String(cl.value)) allClausesMatch = false;
          } else if (cl.operator === "CONTAINS") {
            if (!String(inputValue).includes(String(cl.value))) allClausesMatch = false;
          } else if (cl.operator === "GREATER_THAN") {
            if (Number(inputValue) <= Number(cl.value)) allClausesMatch = false;
          } else if (cl.operator === "LESS_THAN") {
            if (Number(inputValue) >= Number(cl.value)) allClausesMatch = false;
          }
        }
        if (allClausesMatch) {
          matchedAction = r.action;
          break;
        }
      }

      const passed = matchedAction === tc.expectedAction;
      return {
        testId: tc.id,
        passed,
        actualAction: matchedAction,
        expectedAction: tc.expectedAction,
      };
    });

    setTestResults(results);
    setHasRun(true);

    const allPassed = results.every((r) => r.passed);
    if (allPassed) {
      store.awardXp(80);
      toast.success("100% Test Cases Passed! You taught the machine successfully.", {
        description: "+80 XP added to your talent score.",
      });
    } else {
      const failedCount = results.filter((r) => !r.passed).length;
      toast.warning(`${failedCount} test cases failed. Inspect the failing inputs and refine your rules.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="size-8 rounded-lg bg-purple-600/10 text-purple-600 grid place-items-center">
                <Cpu className="size-4.5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Teach the Machine Lab
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
              Learn by teaching. Write logic rules that a simulated computer agent must follow. Then run your rules against hidden test cases to verify complete accuracy!
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 px-3 py-1 text-xs font-semibold text-purple-700 dark:text-purple-300">
              Rule Sandbox Active
            </span>
          </div>
        </div>

        {/* Challenge Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-border/70">
          {RULE_CHALLENGES.map((c) => (
            <button
              key={c.id}
              onClick={() => handleSwitchChallenge(c.id)}
              className={cn(
                "rounded-xl px-4 py-2 text-xs font-semibold border transition-all",
                selectedChallengeId === c.id
                  ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                  : "bg-muted/40 hover:bg-muted text-foreground border-border"
              )}
            >
              {c.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Interactive Rule Builder */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-5 lg:col-span-2 shadow-xs">
          <div className="flex items-center justify-between border-b border-border/70 pb-3">
            <div>
              <h3 className="text-base font-bold text-foreground">Your Teaching Rules</h3>
              <p className="text-xs text-muted-foreground">The machine evaluates these rules in top-down order</p>
            </div>
            <button
              onClick={handleAddRule}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
            >
              <Plus className="size-3.5" />
              <span>Add Rule</span>
            </button>
          </div>

          {/* Rules List */}
          <div className="space-y-3.5">
            {rules.map((rule, rIdx) => (
              <div
                key={rule.id}
                className="rounded-xl border border-border bg-muted/20 p-4 space-y-3 relative group"
              >
                <div className="flex items-center justify-between text-xs font-bold text-foreground">
                  <span className="flex items-center gap-2">
                    <span className="size-5 rounded-full bg-purple-600 text-white grid place-items-center text-[10px]">
                      {rIdx + 1}
                    </span>
                    <span>RULE: {rule.name}</span>
                  </span>
                  <button
                    onClick={() => handleDeleteRule(rule.id)}
                    className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>

                {/* Clauses (IF ... THEN ...) */}
                <div className="space-y-2">
                  {rule.clauses.map((clause, cIdx) => (
                    <div key={cIdx} className="flex flex-wrap items-center gap-2 text-xs font-mono">
                      <span className="font-bold text-purple-600">{cIdx === 0 ? "IF" : "AND"}</span>
                      <select
                        value={clause.field}
                        onChange={(e) =>
                          handleUpdateClause(rule.id, cIdx, e.target.value, clause.operator, clause.value)
                        }
                        className="rounded-md border border-border bg-background px-2 py-1 text-foreground text-xs"
                      >
                        {challenge.fields.map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>

                      <select
                        value={clause.operator}
                        onChange={(e) =>
                          handleUpdateClause(rule.id, cIdx, clause.field, e.target.value as any, clause.value)
                        }
                        className="rounded-md border border-border bg-background px-2 py-1 text-foreground text-xs"
                      >
                        <option value="EQUALS">EQUALS</option>
                        <option value="CONTAINS">CONTAINS</option>
                        <option value="GREATER_THAN">&gt; GREATER_THAN</option>
                        <option value="LESS_THAN">&lt; LESS_THAN</option>
                      </select>

                      <input
                        type="text"
                        value={clause.value}
                        onChange={(e) =>
                          handleUpdateClause(rule.id, cIdx, clause.field, clause.operator, e.target.value)
                        }
                        className="rounded-md border border-border bg-background px-2 py-1 text-foreground text-xs w-32"
                        placeholder="Target value"
                      />
                    </div>
                  ))}

                  <div className="flex items-center gap-2 text-xs font-mono pt-1">
                    <span className="font-bold text-emerald-600">THEN</span>
                    <select
                      value={rule.action}
                      onChange={(e) => handleUpdateAction(rule.id, e.target.value)}
                      className="rounded-md border border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/40 px-2 py-1 text-emerald-900 dark:text-emerald-200 text-xs font-bold"
                    >
                      {challenge.actions.map((act) => (
                        <option key={act} value={act}>
                          {act}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={runRuleEngine}
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition-all"
            >
              <Play className="size-4" />
              <span>Test Machine on Cases</span>
            </button>
          </div>
        </div>

        {/* Right: Test Suite Results */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4 lg:col-span-1 shadow-xs h-fit">
          <div className="border-b border-border/70 pb-3">
            <h3 className="text-base font-bold text-foreground">Machine Test Suite</h3>
            <p className="text-xs text-muted-foreground">{challenge.testCases.length} Hidden Verification Scenarios</p>
          </div>

          <div className="space-y-2.5">
            {challenge.testCases.map((tc, idx) => {
              const res = testResults?.find((r) => r.testId === tc.id);

              return (
                <div
                  key={tc.id}
                  className={cn(
                    "rounded-xl p-3 border text-xs space-y-1.5 transition-all",
                    !hasRun
                      ? "bg-muted/20 border-border"
                      : res?.passed
                        ? "bg-emerald-50/70 border-emerald-200 text-emerald-950 dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:text-emerald-200"
                        : "bg-rose-50/70 border-rose-200 text-rose-950 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-200"
                  )}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>{tc.name}</span>
                    {hasRun && res ? (
                      res.passed ? (
                        <span className="flex items-center gap-1 text-emerald-600 font-bold">
                          <CheckCircle2 className="size-3.5" /> PASS
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-rose-600 font-bold">
                          <XCircle className="size-3.5" /> FAIL
                        </span>
                      )
                    ) : (
                      <span className="text-[10px] text-muted-foreground">Pending Run</span>
                    )}
                  </div>

                  <p className="text-[11px] text-muted-foreground font-mono">
                    Expected: {tc.expectedAction}
                  </p>
                  {hasRun && res && !res.passed && (
                    <p className="text-[11px] text-rose-600 font-mono font-bold">
                      Your Machine Output: {res.actualAction}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
