import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Chip, Console, PageHeader, Panel, Stat } from "@/components/kit";
import { useAppStore } from "@/lib/app-store";
import { Bot, Clock, Play, RefreshCw, CheckCircle2, Zap, Download, Trash2, Activity } from "lucide-react";

export const Route = createFileRoute("/admin/automations")({
  head: () => ({
    meta: [
      { title: "Cron & Automations — SantoGe Talent Cloud" },
      { name: "description", content: "Scheduled cron pipelines for daily morning broadcasts, talent score recalculation, ATS resume sweeps, and recruiter gateway matching." },
      { property: "og:title", content: "Cron & Automations — SantoGe Talent Cloud" },
      { property: "og:description", content: "Scheduled pipelines for broadcasts, scoring and gateway matching." },
    ],
  }),
  component: AutomationsPage,
});

const JOBS = [
  {
    id: "broadcast",
    cron: "0 6 * * *",
    name: "Daily 30m Placement Broadcast",
    detail: "Delivers 10m English video, 10m Aptitude drill & in-app guided practice to all 54 batch channels at 06:00 IST.",
    target: "14,280 Learners",
  },
  {
    id: "score",
    cron: "*/15 * * * *",
    name: "Talent Score 15m Recalculator",
    detail: "Recomputes weighted T·C·A·E·R·M readiness formula into a live 0–1000 score across all active portfolios.",
    target: "Real-time Event Stream",
  },
  {
    id: "ats",
    cron: "0 */4 * * *",
    name: "Automated ATS Resume Sweep",
    detail: "Parses newly completed sandbox projects, GitHub commit records, and badges into ATS resume profiles.",
    target: "Phase 1 & 2 Learners",
  },
  {
    id: "gateway",
    cron: "30 7 * * 1",
    name: "Enterprise Requisition Matching Engine",
    detail: "Matches score-gated talent pools (450+, 600+, 700+, 800+, 900+) to open enterprise partner job requisitions.",
    target: "Recruiter Marketplace",
  },
  {
    id: "digest",
    cron: "0 20 * * *",
    name: "Streak & Performance Digest Mailer",
    detail: "Evaluates daily twin 30m completion, extends streaks, and delivers evening WhatsApp / Email digest reports.",
    target: "All Subscribed Batches",
  },
];

function AutomationsPage() {
  const store = useAppStore();
  const [runningJob, setRunningJob] = useState<string | null>(null);

  const run = (job: (typeof JOBS)[number]) => {
    setRunningJob(job.id);
    store.pushCronLog({
      stage: job.id,
      message: `Triggered manually by Super Admin for ${job.target}`,
      status: "running",
    });

    setTimeout(() => {
      setRunningJob(null);
      if (job.id === "score") {
        store.recalculateAllScores();
      } else {
        store.pushCronLog({
          stage: job.id,
          message: `Pipeline execution complete: 100% success rate across ${job.target}`,
          status: "ok",
        });
      }
      toast.success(`${job.name} finished successfully`);
    }, 1400);
  };

  const cronLogsList = store.cronLogs || [];

  const exportLogs = () => {
    const text = cronLogsList.map((l) => `[${l.time}] [${l.status.toUpperCase()}] ${l.stage}: ${l.message}`).join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `santoge-cron-logs-${Date.now()}.log`;
    a.click();
    toast.success("Downloaded execution logs");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Automated Cron Pipelines & Scheduler"
        subtitle="Scheduled background processes that orchestrate daily Telegram broadcasts, Talent Score recalculations, ATS sweeps, and recruiter gateway matching."
        action={<Chip tone="amber">{JOBS.length} Scheduled Pipelines</Chip>}
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Scheduled Cron Jobs" value={JOBS.length} hint="Active daemon routines" />
        <Stat label="Total Runs Logged" value={cronLogsList.length} accent="var(--brand-purple)" hint="Session audit trail" />
        <Stat label="Pipeline Health" value="100%" accent="var(--brand-emerald)" hint="Zero failures in 24h" />
        <Stat label="Next Broadcast Window" value="06:00 IST" accent="var(--brand-cyan)" hint="Tomorrow morning" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_440px]">
        {/* Pipelines List */}
        <Panel
          title="Scheduled Pipelines"
          subtitle="Trigger any automated background pipeline on demand"
          action={
            <span className="flex items-center gap-1 text-[11px] font-semibold text-brand-emerald">
              <Activity className="size-3.5 animate-pulse" /> Cron Service Healthy
            </span>
          }
        >
          <div className="space-y-3">
            {JOBS.map((j) => {
              const isRunning = runningJob === j.id;
              return (
                <div key={j.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-line-soft bg-surface-soft p-3.5 transition-all hover:border-brand-cyan/40">
                  <span className="grid size-10 place-items-center rounded-xl bg-surface-dark shadow-sm">
                    <Bot className="size-5 text-brand-cyan" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-foreground">{j.name}</p>
                      <span className="rounded bg-surface-elevated px-2 py-0.5 text-[10px] font-mono text-brand-cyan border border-line-soft">
                        {j.target}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-copy-subtle leading-relaxed">{j.detail}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-line-soft bg-surface-dark px-2.5 py-1 font-mono text-[11px] text-brand-amber">
                      <Clock className="size-3" /> {j.cron}
                    </span>
                    <button
                      onClick={() => run(j)}
                      disabled={isRunning}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple px-3.5 py-2 text-xs font-bold text-surface-dark shadow-md transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {isRunning ? <RefreshCw className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
                      {isRunning ? "Running…" : "Run Now"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        {/* Execution Logs Console */}
        <Panel
          title="Pipeline Execution Terminal"
          subtitle="Real-time audit log of cron triggers and dispatches"
          action={
            <button
              onClick={exportLogs}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-cyan hover:underline"
            >
              <Download className="size-3" /> Export Logs
            </button>
          }
        >
          <Console
            lines={store.cronLogs.map((l) => `[${l.time}] ${l.stage.toUpperCase()} · [${l.status.toUpperCase()}] — ${l.message}`)}
            empty="No automation runs recorded yet."
          />
        </Panel>
      </div>
    </div>
  );
}

