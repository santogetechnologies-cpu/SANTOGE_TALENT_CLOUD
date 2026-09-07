import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Chip, Console, PageHeader, Panel, Stat } from "@/components/kit";
import { useAppStore } from "@/lib/app-store";
import { Bot, Clock, Play } from "lucide-react";

export const Route = createFileRoute("/admin/automations")({
  head: () => ({
    meta: [
      { title: "Cron & Automations — SantoGe Talent Cloud" },
      { name: "description", content: "Scheduled pipelines for daily broadcasts, score recalculation, ATS sweeps and gateway matching." },
      { property: "og:title", content: "Cron & Automations — SantoGe Talent Cloud" },
      { property: "og:description", content: "Scheduled pipelines for broadcasts, scoring and gateway matching." },
    ],
  }),
  component: AutomationsPage,
});

const JOBS = [
  { id: "broadcast", cron: "0 6 * * *", name: "Daily 30m Broadcast", detail: "Pushes English, aptitude and practice blocks to every learner." },
  { id: "score", cron: "*/15 * * * *", name: "Talent Score Recalculation", detail: "Recomputes weighted T·C·A·E·R·M into a 0–1000 score." },
  { id: "ats", cron: "0 */4 * * *", name: "ATS Sweep", detail: "Re-parses updated resumes and refreshes keyword coverage." },
  { id: "gateway", cron: "30 7 * * 1", name: "Gateway Matching", detail: "Maps score-gated learners to open company requisitions." },
  { id: "digest", cron: "0 20 * * *", name: "Streak & Digest Mailer", detail: "Sends streak reminders and mentor digests." },
];

function AutomationsPage() {
  const store = useAppStore();

  const run = (name: string) => {
    store.pushCronLog({ stage: name, message: "triggered manually", status: "running" });
    setTimeout(() => {
      store.pushCronLog({ stage: name, message: "completed successfully", status: "ok" });
      toast.success(`${name} finished`);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cron & Automations"
        subtitle="Every scheduled pipeline that keeps scores, resumes and gateways current."
        action={<Chip tone="amber">{JOBS.length} scheduled jobs</Chip>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Scheduled jobs" value={JOBS.length} />
        <Stat label="Runs logged" value={store.cronLogs.length} accent="var(--brand-purple)" />
        <Stat label="Failures (24h)" value={0} accent="var(--brand-emerald)" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
        <Panel title="Pipelines" subtitle="Trigger any job on demand">
          <div className="space-y-2.5">
            {JOBS.map((j) => (
              <div key={j.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-line-soft bg-surface-soft p-3">
                <span className="grid size-9 place-items-center rounded-xl bg-surface-dark">
                  <Bot className="size-4 text-brand-cyan" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{j.name}</p>
                  <p className="text-xs text-copy-subtle">{j.detail}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-line-soft px-2.5 py-1 font-mono text-[11px] text-brand-amber">
                  <Clock className="size-3" /> {j.cron}
                </span>
                <button
                  onClick={() => run(j.name)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple px-3 py-1.5 text-[11px] font-bold text-surface-dark"
                >
                  <Play className="size-3" /> Run
                </button>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Execution log" subtitle="Most recent first">
          <Console
            lines={store.cronLogs.map((l) => `[${l.time}] ${l.stage} · ${l.status.toUpperCase()} — ${l.message}`)}
            empty="No automation runs recorded yet."
          />
        </Panel>
      </div>
    </div>
  );
}
