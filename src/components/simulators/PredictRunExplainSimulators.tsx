import { useState } from "react";
import {
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Activity,
  Layers,
  Zap,
  TrendingUp,
  Cpu,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/app-store";
import { toast } from "sonner";

export interface SimulatorExperiment {
  id: string;
  title: string;
  domain: string;
  description: string;
  controls: {
    id: string;
    label: string;
    options: { value: string | number; label: string }[];
    defaultValue: string | number;
  }[];
  predictionQuestion: string;
  predictionChoices: {
    id: string;
    text: string;
    isCorrectForConfig: (config: Record<string, any>) => boolean;
  }[];
  computeSimulation: (config: Record<string, any>) => {
    outputLogs: string[];
    metrics: Record<string, string | number>;
    explanation: string;
  };
}

const EXPERIMENTS: SimulatorExperiment[] = [
  {
    id: "spring-boot-request",
    title: "Spring Boot: Request Lifecycle & Bean Scope",
    domain: "Backend Architecture",
    description:
      "Simulate how an incoming HTTP request navigates through DispatcherServlet, Filter chain, Controller, Singleton Service, and Database Repository.",
    controls: [
      {
        id: "beanScope",
        label: "Service Bean Scope",
        options: [
          { value: "singleton", label: "Singleton (@Service)" },
          { value: "prototype", label: "Prototype (@Scope('prototype'))" },
          { value: "request", label: "Request (@RequestScope)" },
        ],
        defaultValue: "singleton",
      },
      {
        id: "trafficVolume",
        label: "Concurrent Requests",
        options: [
          { value: 1, label: "1 Sequential Request" },
          { value: 50, label: "50 Concurrent Requests" },
          { value: 500, label: "500 Concurrent Requests" },
        ],
        defaultValue: 50,
      },
    ],
    predictionQuestion:
      "When 50 concurrent requests hit a Singleton Service, how many instances of the service class exist in memory?",
    predictionChoices: [
      {
        id: "pred-1",
        text: "Exactly 1 shared instance across all 50 threads (Thread-safe stateless singleton)",
        isCorrectForConfig: (cfg) => cfg.beanScope === "singleton",
      },
      {
        id: "pred-2",
        text: "50 separate instances (One created for each request)",
        isCorrectForConfig: (cfg) => cfg.beanScope === "request" || cfg.beanScope === "prototype",
      },
      {
        id: "pred-3",
        text: "Zero instances because Spring uses static bytecode only",
        isCorrectForConfig: () => false,
      },
    ],
    computeSimulation: (cfg) => {
      const isSingle = cfg.beanScope === "singleton";
      const instances = isSingle ? 1 : Number(cfg.trafficVolume);
      const latency = isSingle ? "12ms avg" : "48ms avg (GC overhead)";

      return {
        outputLogs: [
          `[Spring Boot ApplicationContext] Initializing WebApplicationServer on port 8080`,
          `[DispatcherServlet] Handling ${cfg.trafficVolume} incoming requests`,
          `[IoC Container] Resolving OrderService with scope='${cfg.beanScope}'`,
          `[Memory Profile] Allocated ${instances} instance(s) in JVM Heap`,
          `[Response Status] 200 OK returned to all callers`,
        ],
        metrics: {
          "Allocated Instances": instances,
          "Memory Footprint": isSingle ? "4 KB" : `${instances * 4} KB`,
          "Latency P95": latency,
        },
        explanation: isSingle
          ? "Spring default scope is Singleton. A single shared bean handles concurrent requests across threads, saving huge memory and GC overhead. Services must remain stateless!"
          : "Non-singleton scopes instantiate new objects per request, leading to higher memory allocations and garbage collection pressure.",
      };
    },
  },
  {
    id: "aiml-complexity",
    title: "AI/ML: Model Complexity vs Dataset Size Curve",
    domain: "Machine Learning",
    description:
      "Observe underfitting vs overfitting by adjusting model polynomial degree and training sample size.",
    controls: [
      {
        id: "modelDegree",
        label: "Polynomial Degree / Complexity",
        options: [
          { value: 1, label: "Degree 1 (Linear - Low Complexity)" },
          { value: 3, label: "Degree 3 (Cubic - Optimal Fit)" },
          { value: 15, label: "Degree 15 (High - Extreme Complexity)" },
        ],
        defaultValue: 15,
      },
      {
        id: "sampleSize",
        label: "Training Samples",
        options: [
          { value: 20, label: "20 Samples (Small Dataset)" },
          { value: 500, label: "500 Samples (Large Dataset)" },
        ],
        defaultValue: 20,
      },
    ],
    predictionQuestion:
      "If you train a Degree 15 polynomial model on only 20 samples, what will happen on unseen validation data?",
    predictionChoices: [
      {
        id: "ai-p1",
        text: "Severe Overfitting: High 100% training accuracy, but terrible error/loss on validation data",
        isCorrectForConfig: (cfg) => Number(cfg.modelDegree) === 15 && Number(cfg.sampleSize) === 20,
      },
      {
        id: "ai-p2",
        text: "Underfitting: The model is too simple to learn patterns",
        isCorrectForConfig: (cfg) => Number(cfg.modelDegree) === 1,
      },
      {
        id: "ai-p3",
        text: "Perfect Generalization with 0 error everywhere",
        isCorrectForConfig: () => false,
      },
    ],
    computeSimulation: (cfg) => {
      const deg = Number(cfg.modelDegree);
      const samples = Number(cfg.sampleSize);

      let trainAcc = 0;
      let valAcc = 0;
      let state = "";

      if (deg === 1) {
        trainAcc = 68;
        valAcc = 65;
        state = "High Bias (Underfitting)";
      } else if (deg === 3) {
        trainAcc = 94;
        valAcc = 92;
        state = "Optimal Fit (Low Bias, Low Variance)";
      } else {
        if (samples === 20) {
          trainAcc = 100;
          valAcc = 42;
          state = "High Variance (Severe Overfitting)";
        } else {
          trainAcc = 98;
          valAcc = 89;
          state = "Regularized by Sample Volume";
        }
      }

      return {
        outputLogs: [
          `[Scikit-Learn Pipeline] Fitting PolynomialFeatures(degree=${deg})`,
          `[Training Matrix] ${samples} samples with Gaussian noise ε ~ N(0, 0.1)`,
          `[Loss Minimization] Mean Squared Error on Train = ${(100 - trainAcc) * 0.01}`,
          `[Validation Score] Test Accuracy = ${valAcc}%`,
          `[Diagnosis] State detected: ${state}`,
        ],
        metrics: {
          "Train Accuracy": `${trainAcc}%`,
          "Validation Accuracy": `${valAcc}%`,
          "Generalization Gap": `${Math.abs(trainAcc - valAcc)}%`,
        },
        explanation:
          deg === 15 && samples === 20
            ? "When model capacity is huge relative to data size, the model memorizes noise instead of general patterns (overfitting)."
            : "Increasing data volume or regularizing complexity allows models to learn true underlying signal.",
      };
    },
  },
  {
    id: "marketing-cac-roas",
    title: "Digital Marketing: Budget, CTR & ROAS Funnel",
    domain: "Growth Marketing",
    description:
      "Adjust daily ad budget, Click-Through-Rate (CTR), and landing conversion rate to simulate revenue and Return on Ad Spend (ROAS).",
    controls: [
      {
        id: "adSpend",
        label: "Monthly Ad Spend",
        options: [
          { value: 1000, label: "$1,000 / mo" },
          { value: 5000, label: "$5,000 / mo" },
        ],
        defaultValue: 1000,
      },
      {
        id: "cpc",
        label: "Cost Per Click (CPC)",
        options: [
          { value: 1.5, label: "$1.50 CPC" },
          { value: 4.0, label: "$4.00 CPC (High Competition)" },
        ],
        defaultValue: 1.5,
      },
      {
        id: "convRate",
        label: "Landing Page Conversion Rate",
        options: [
          { value: 1, label: "1% Conversion (Low)" },
          { value: 4, label: "4% Conversion (High Optimized)" },
        ],
        defaultValue: 1,
      },
    ],
    predictionQuestion:
      "At $1.50 CPC and a 1% conversion rate with $100 customer value, what will be your Customer Acquisition Cost (CAC)?",
    predictionChoices: [
      {
        id: "dm-1",
        text: "$150 CAC (100 clicks needed per customer @ $1.50/click = $150 CAC → Unprofitable)",
        isCorrectForConfig: (cfg) => Number(cfg.cpc) === 1.5 && Number(cfg.convRate) === 1,
      },
      {
        id: "dm-2",
        text: "$15 CAC (Profitable)",
        isCorrectForConfig: () => false,
      },
      {
        id: "dm-3",
        text: "$1.50 CAC",
        isCorrectForConfig: () => false,
      },
    ],
    computeSimulation: (cfg) => {
      const spend = Number(cfg.adSpend);
      const cpc = Number(cfg.cpc);
      const conv = Number(cfg.convRate) / 100;

      const clicks = Math.round(spend / cpc);
      const customers = Math.round(clicks * conv);
      const cac = customers > 0 ? Math.round(spend / customers) : spend;
      const revenue = customers * 100;
      const roas = ((revenue / spend) * 100).toFixed(0);

      return {
        outputLogs: [
          `[Ad Platform] Serving impressions at $${cpc} CPC`,
          `[Traffic Delivery] Generated ${clicks.toLocaleString()} total clicks`,
          `[Conversion Funnel] ${clicks} clicks × ${(conv * 100)}% = ${customers} paying customers`,
          `[Unit Economics] CAC = $${cac} vs LTV = $100`,
          `[Campaign Status] ROAS: ${roas}% (${Number(roas) >= 100 ? "Profitable" : "Losing Money"})`,
        ],
        metrics: {
          "Total Clicks": clicks.toLocaleString(),
          "Acquired Customers": customers,
          "CAC": `$${cac}`,
          "ROAS": `${roas}%`,
        },
        explanation:
          Number(roas) < 100
            ? "Your CAC exceeds Customer Lifetime Value. You must either improve landing page conversion rate or lower CPC to reach profitability."
            : "High conversion rate drives CAC well below LTV, yielding a profitable scalable growth loop!",
      };
    },
  },
];

export function PredictRunExplainSimulators() {
  const store = useAppStore();
  const [selectedExpId, setSelectedExpId] = useState<string>("spring-boot-request");
  const exp = EXPERIMENTS.find((e) => e.id === selectedExpId) || EXPERIMENTS[0]!;

  const [config, setConfig] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    exp.controls.forEach((c) => {
      initial[c.id] = c.defaultValue;
    });
    return initial;
  });

  const [selectedPredId, setSelectedPredId] = useState<string | null>(null);
  const [hasRun, setHasRun] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState<ReturnType<typeof exp.computeSimulation> | null>(null);

  const handleSelectExp = (id: string) => {
    setSelectedExpId(id);
    const target = EXPERIMENTS.find((e) => e.id === id) || EXPERIMENTS[0]!;
    const nextCfg: Record<string, any> = {};
    target.controls.forEach((c) => {
      nextCfg[c.id] = c.defaultValue;
    });
    setConfig(nextCfg);
    setSelectedPredId(null);
    setHasRun(false);
    setSimResult(null);
  };

  const handleRunSimulation = () => {
    if (!selectedPredId) {
      toast.warning("Please make your prediction first before running the simulator.");
      return;
    }

    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      const res = exp.computeSimulation(config);
      setSimResult(res);
      setHasRun(true);

      const chosen = exp.predictionChoices.find((p) => p.id === selectedPredId);
      const isCorrect = chosen?.isCorrectForConfig(config);

      if (isCorrect) {
        store.awardXp(60);
        toast.success("Spot on prediction! +60 XP");
      } else {
        toast.info("Simulation complete! Compare your prediction with the actual result.");
      }
    }, 600);
  };

  const chosenPrediction = exp.predictionChoices.find((p) => p.id === selectedPredId);
  const isPredictionAccurate = chosenPrediction?.isCorrectForConfig(config);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="size-8 rounded-lg bg-blue-600/10 text-blue-600 grid place-items-center">
                <Activity className="size-4.5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Predict → Run → Explain Simulators
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
              Deep understanding comes from prediction. Form a hypothesis first, run the live simulator, and explain why the system behaved the way it did.
            </p>
          </div>
        </div>

        {/* Experiment Selector */}
        <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-border/70">
          {EXPERIMENTS.map((e) => (
            <button
              key={e.id}
              onClick={() => handleSelectExp(e.id)}
              className={cn(
                "rounded-xl px-4 py-2 text-xs font-semibold border transition-all",
                selectedExpId === e.id
                  ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                  : "bg-muted/40 hover:bg-muted text-foreground border-border"
              )}
            >
              {e.title}
            </button>
          ))}
        </div>
      </div>

      {/* Simulator Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Interactive Controls & Prediction Input */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-6 lg:col-span-1 shadow-xs h-fit">
          <div className="border-b border-border/70 pb-3">
            <span className="rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              {exp.domain}
            </span>
            <h3 className="text-base font-bold text-foreground mt-1">{exp.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{exp.description}</p>
          </div>

          {/* Configuration Sliders/Selectors */}
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Simulation Parameters:
            </p>
            {exp.controls.map((ctrl) => (
              <div key={ctrl.id} className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">{ctrl.label}</label>
                <select
                  value={config[ctrl.id]}
                  disabled={isSimulating}
                  onChange={(e) => {
                    setConfig({ ...config, [ctrl.id]: e.target.value });
                    setHasRun(false);
                  }}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground font-medium"
                >
                  {ctrl.options.map((opt) => (
                    <option key={String(opt.value)} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* Step 1: Mandatory Prediction */}
          <div className="space-y-3 pt-3 border-t border-border/70">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              <Sparkles className="size-3.5" />
              <span>Step 1: Your Prediction</span>
            </div>
            <p className="text-xs text-foreground font-semibold leading-relaxed">
              {exp.predictionQuestion}
            </p>

            <div className="space-y-2">
              {exp.predictionChoices.map((choice) => {
                const isSelected = selectedPredId === choice.id;

                return (
                  <button
                    key={choice.id}
                    onClick={() => setSelectedPredId(choice.id)}
                    className={cn(
                      "w-full text-left rounded-xl p-3 border text-xs font-medium transition-all",
                      isSelected
                        ? "border-primary bg-primary/5 text-primary font-bold ring-1 ring-primary"
                        : "border-border/80 bg-muted/20 hover:bg-muted text-foreground"
                    )}
                  >
                    {choice.text}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={isSimulating || !selectedPredId}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-xs sm:text-sm font-bold text-white shadow-sm transition-all disabled:opacity-50"
          >
            {isSimulating ? (
              <>
                <Sparkles className="size-4 animate-spin" />
                <span>Running Simulation...</span>
              </>
            ) : (
              <>
                <Play className="size-4" />
                <span>Run Simulator</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Actual Result & Teacher Explanation */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-7 space-y-6 lg:col-span-2 shadow-xs">
          <div className="flex items-center justify-between border-b border-border/80 pb-4">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Runtime Terminal & Telemetry
              </span>
            </div>
            {hasRun && (
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-semibold border",
                  isPredictionAccurate
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300"
                    : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300"
                )}
              >
                {isPredictionAccurate ? "✓ Prediction Verified" : "Hypothesis Diverged"}
              </span>
            )}
          </div>

          {/* Metric Telemetry Cards */}
          {hasRun && simResult && (
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(simResult.metrics).map(([key, val]) => (
                <div
                  key={key}
                  className="rounded-xl border border-border bg-muted/20 p-3.5 space-y-1 text-center"
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {key}
                  </p>
                  <p className="text-base sm:text-lg font-bold font-mono text-foreground">{val}</p>
                </div>
              ))}
            </div>
          )}

          {/* Runtime Execution Terminal */}
          <div className="rounded-xl bg-slate-950 text-slate-100 p-4 font-mono text-xs overflow-x-auto border border-slate-800 space-y-2 min-h-[160px]">
            <div className="flex items-center justify-between text-[10px] text-slate-400 pb-2 border-b border-slate-800">
              <span>Simulation Execution Trace</span>
              <span>Live Runtime</span>
            </div>
            {hasRun && simResult ? (
              <div className="space-y-1">
                {simResult.outputLogs.map((log, i) => (
                  <p key={i} className="text-emerald-400">
                    {log}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 italic">
                Select your parameters and submit your prediction to trigger simulation run...
              </p>
            )}
          </div>

          {/* Step 3: Comparison & Teacher Explanation */}
          {hasRun && simResult && (
            <div className="rounded-xl border border-blue-200 bg-blue-50/70 dark:bg-blue-950/30 dark:border-blue-900/50 p-5 space-y-3">
              <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200 font-bold text-sm">
                <Sparkles className="size-4.5 text-blue-600" />
                <span>Teacher's Analysis: Why this happened</span>
              </div>
              <p className="text-xs sm:text-sm text-blue-950 dark:text-blue-100 leading-relaxed">
                {simResult.explanation}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
