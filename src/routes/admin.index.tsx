import { createFileRoute } from "@tanstack/react-router";
import { Chip, Gauge, Meter, PageHeader, Panel, Stat } from "@/components/kit";
import { useAppStore } from "@/lib/app-store";
import { TRACKS } from "@/lib/tracks";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Executive Analytics — SantoGe Talent Cloud" },
      { name: "description", content: "Cohort readiness, placement conversion and track-level performance across every batch." },
      { property: "og:title", content: "Executive Analytics — SantoGe Talent Cloud" },
      { property: "og:description", content: "Cohort readiness and placement conversion across every batch." },
    ],
  }),
  component: AdminAnalytics,
});

const FUNNEL = [
  { label: "Enrolled", value: 100 },
  { label: "Accelerator active", value: 86 },
  { label: "Labs verified", value: 71 },
  { label: "ATS cleared", value: 58 },
  { label: "Interviewed", value: 39 },
  { label: "Offered", value: 24 },
];

function AdminAnalytics() {
  const store = useAppStore();
  const readinessOf = (b: { enrolled: number; capacity: number }) =>
    Math.round((b.enrolled / Math.max(b.capacity, 1)) * 100);
  const totalStudents = store.batches.reduce((s, b) => s + b.enrolled, 0) + store.provisioned.length;
  const avgReadiness = Math.round(
    store.batches.reduce((s, b) => s + readinessOf(b), 0) / Math.max(store.batches.length, 1),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Executive Analytics"
        subtitle="Platform-wide readiness, throughput and placement conversion."
        action={<Chip tone="cyan">{store.batches.length} active batches</Chip>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total learners" value={totalStudents} />
        <Stat label="Avg cohort readiness" value={`${avgReadiness}%`} accent="var(--brand-purple)" />
        <Stat label="Offer conversion" value="24%" accent="var(--brand-emerald)" />
        <Stat label="Automation runs" value={store.cronLogs.length} accent="var(--brand-amber)" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Cohort health" subtitle="Composite index" className="flex items-center justify-center">
          <Gauge value={avgReadiness * 10} label="Cohort index" />
        </Panel>

        <Panel title="Placement funnel" subtitle="Percentage of enrolled learners" className="lg:col-span-2">
          <div className="space-y-3">
            {FUNNEL.map((f) => (
              <div key={f.label}>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{f.label}</span>
                  <span className="font-mono text-copy-subtle">{f.value}%</span>
                </div>
                <Meter value={f.value} accent="var(--brand-cyan)" />
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Batch readiness" subtitle="Live sync status">
          <div className="space-y-3">
            {store.batches.map((b) => (
              <div key={b.id} className="rounded-xl border border-line-soft bg-surface-soft p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">{b.name}</p>
                  <Chip tone={readinessOf(b) >= 70 ? "emerald" : "amber"}>{readinessOf(b)}%</Chip>
                </div>
                <p className="mt-1 text-xs text-copy-subtle">{b.enrolled}/{b.capacity} learners · {b.dept}</p>
                <div className="mt-2">
                  <Meter value={readinessOf(b)} accent="var(--brand-purple)" />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Track demand" subtitle="Enrolment distribution across engines">
          <div className="space-y-2.5">
            {TRACKS.slice(0, 8).map((t, i) => (
              <div key={t.id}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{t.short}</span>
                  <span className="font-mono text-copy-subtle">{92 - i * 8}%</span>
                </div>
                <Meter value={92 - i * 8} accent={t.accent} />
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
