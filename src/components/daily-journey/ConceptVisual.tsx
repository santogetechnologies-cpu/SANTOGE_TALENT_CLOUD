import { useState, useRef } from "react";
import { ArrowRight, Workflow, CheckCircle2, Sparkles, Layers, Info, Cpu, Database, Server, ShieldCheck, Activity, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/app-store";

interface ConceptVisualProps {
  dayNum?: number;
  trackId: string;
  trackName: string;
  topic: string;
  onNext: () => void;
}

interface NodeData {
  id: string;
  label: string;
  sublabel: string;
  icon: typeof Cpu;
  role: string;
}

export function ConceptVisual({ dayNum = 1, trackId, trackName, topic, onNext }: ConceptVisualProps) {
  const store = useAppStore();
  const existingRecord = store.getDailyStepRecord(dayNum, trackId, "tech-visual");

  const [isLocked, setIsLocked] = useState(() => Boolean(existingRecord?.isLocked));
  const isProcessingRef = useRef(Boolean(existingRecord?.isLocked));

  const [selectedNode, setSelectedNode] = useState<number>(1);

  const handleNext = async () => {
    if (!isLocked && !isProcessingRef.current) {
      isProcessingRef.current = true;
      setIsLocked(true);
      const res = await store.recordDailyStepAction(dayNum, trackId, "tech-visual");
      if (!res?.ok) {
        setIsLocked(false);
        isProcessingRef.current = false;
        return;
      }
    }
    onNext();
  };

  // Generate visual pipeline based on track family
  const getPipeline = (): { family: string; nodes: NodeData[] } => {
    if (trackId === "sap" || trackId === "hr" || trackId === "marketing") {
      return {
        family: "Enterprise Business Process Pipeline",
        nodes: [
          {
            id: "trigger",
            label: "1. Business Event / Request",
            sublabel: "Trigger & Ingestion",
            icon: Activity,
            role: `Initiates business workflow for ${topic}. Validates input metadata, user role privileges, and SLA deadlines.`,
          },
          {
            id: "rules",
            label: "2. Business Rule Engine",
            sublabel: "Evaluation & Validation",
            icon: Layers,
            role: `Executes core enterprise policies and operational checks required for ${topic} before approval.`,
          },
          {
            id: "erp",
            label: "3. Enterprise System of Record",
            sublabel: "Persistence & Audit",
            icon: Database,
            role: `Atomic record creation in the enterprise schema with immutable compliance audit logging.`,
          },
          {
            id: "outcome",
            label: "4. KPI & Operational Dispatch",
            sublabel: "Dispatch & Analytics",
            icon: ShieldCheck,
            role: `Triggers notification dispatches, executive dashboard feeds, and lifecycle milestone updates.`,
          },
        ],
      };
    }

    if (trackId === "medical") {
      return {
        family: "Clinical Protocol & Decision Framework",
        nodes: [
          {
            id: "intake",
            label: "1. Patient Intake & Vitals",
            sublabel: "Clinical Observation",
            icon: Activity,
            role: `Gathers baseline clinical indicators, patient history, and flags relevant to ${topic}.`,
          },
          {
            id: "diagnostics",
            label: "2. Diagnostic Evaluation",
            sublabel: "Guideline Assessment",
            icon: Layers,
            role: `Applies established diagnostic criteria and clinical pathways for ${topic}.`,
          },
          {
            id: "emr",
            label: "3. Electronic Medical Record",
            sublabel: "HIPAA Compliant Logging",
            icon: Database,
            role: `Encrypts diagnostic notes and orders into the patient master file under strict data privacy.`,
          },
          {
            id: "treatment",
            label: "4. Therapeutic Plan & Verification",
            sublabel: "Care Delivery",
            icon: ShieldCheck,
            role: `Authorizes structured care pathway, dosage verification, and post-procedure follow-up monitoring.`,
          },
        ],
      };
    }

    if (trackId === "bi") {
      return {
        family: "Modern Analytics & BI Pipeline",
        nodes: [
          {
            id: "extract",
            label: "1. Raw Telemetry Ingestion",
            sublabel: "ELT Pipeline",
            icon: Server,
            role: `Streams event payloads and operational datasets relevant to ${topic} into staging tables.`,
          },
          {
            id: "transform",
            label: "2. Dimensional Modeling",
            sublabel: "dbt & Aggregations",
            icon: Layers,
            role: `Cleanses nulls, calculates cumulative windows, and enforces business logic for ${topic}.`,
          },
          {
            id: "semantic",
            label: "3. Semantic Layer & Mart",
            sublabel: "Governed Metrics",
            icon: Database,
            role: `Standardizes metric definitions across departments to prevent discrepancy in reporting.`,
          },
          {
            id: "dashboard",
            label: "4. Executive Insights & Decision",
            sublabel: "Live Visualization",
            icon: BarChart2,
            role: `Renders responsive KPI widgets, alert anomalies, and drill-down dimensions for stakeholders.`,
          },
        ],
      };
    }

    // Default: Code / Engineering / Cloud / Cyber tracks
    return {
      family: "Production Architecture & Data Flow",
      nodes: [
        {
          id: "client",
          label: "1. Client / Invocation Layer",
          sublabel: "Event & Request Entry",
          icon: Activity,
          role: `Dispatches authenticated invocation payload for ${topic}. Handles request headers and contract validation.`,
        },
        {
          id: "core",
          label: "2. Domain Logic & Processing",
          sublabel: "Core Service Handler",
          icon: Cpu,
          role: `Executes core computational logic for "${topic}", enforcing security boundaries and concurrency safety.`,
        },
        {
          id: "storage",
          label: "3. State & Persistence Layer",
          sublabel: "Datastore / Cache",
          icon: Database,
          role: `Commits state updates atomically with indexing, caching invalidation, and schema integrity.`,
        },
        {
          id: "verify",
          label: "4. Telemetry & Response Contract",
          sublabel: "Response & Observability",
          icon: ShieldCheck,
          role: `Returns structured status payload with structured telemetry logs and latency metrics.`,
        },
      ],
    };
  };

  const pipeline = getPipeline();
  const activeNode = pipeline.nodes[selectedNode] || pipeline.nodes[0]!;

  return (
    <div className="journey-card mx-auto max-w-3xl overflow-hidden p-6 sm:p-8 phase-enter">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Workflow className="size-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-foreground">{pipeline.family}</h3>
            <p className="text-[11px] text-muted-foreground">Interactive Visual Breakdown · {trackName}</p>
          </div>
        </div>

        <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-mono text-muted-foreground">
          Step 2 of 7 · 2 min
        </span>
      </div>

      <div className="mt-6 space-y-6">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            System Flow for: <span className="text-primary">{topic}</span>
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Click any node in the architecture diagram below to inspect its role and data contract.
          </p>
        </div>

        {/* 4-Node Visual Architecture Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
          {pipeline.nodes.map((node, index) => {
            const Icon = node.icon;
            const isSelected = selectedNode === index;

            return (
              <button
                key={node.id}
                onClick={() => setSelectedNode(index)}
                className={cn(
                  "relative flex flex-col items-start rounded-xl border p-3.5 text-left transition-all cursor-pointer",
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-xs"
                    : "border-border bg-card hover:border-primary/40 hover:bg-muted/30",
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <div
                    className={cn(
                      "flex size-7 items-center justify-center rounded-lg border text-xs",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-muted-foreground border-border",
                    )}
                  >
                    <Icon className="size-3.5" />
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    Node {index + 1}
                  </span>
                </div>

                <div className="mt-3">
                  <h4 className="font-semibold text-foreground text-xs">{node.label}</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{node.sublabel}</p>
                </div>

                {isSelected && (
                  <div className="mt-2.5 flex items-center gap-1 text-[10px] font-medium text-primary">
                    <span className="size-1.5 rounded-full bg-primary animate-ping" />
                    <span>Active Inspector</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Node Inspector Detail Panel */}
        <div className="rounded-xl border border-border bg-muted/20 p-4 sm:p-5 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="size-4 text-primary" />
              <h4 className="text-xs font-semibold text-foreground">
                Node Specification: {activeNode.label}
              </h4>
            </div>
            <span className="rounded bg-card px-2 py-0.5 font-mono text-[10px] text-muted-foreground border border-border">
              {activeNode.sublabel}
            </span>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            {activeNode.role}
          </p>

          <div className="pt-2 border-t border-border flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="size-3.5" /> Architectural contract verified
            </span>
            <span className="font-mono text-[10px]">Latency SLA: &lt;15ms</span>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="mt-8 flex items-center justify-between border-t border-border/70 pt-6">
        <span className="text-xs text-muted-foreground">
          Ready to test your comprehension?
        </span>

        <button
          onClick={handleNext}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors cursor-pointer"
        >
          <span>Continue to Quick Check</span>
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
