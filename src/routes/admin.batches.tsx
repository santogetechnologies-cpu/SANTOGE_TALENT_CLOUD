import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Chip, Meter, PageHeader, Panel, Stat } from "@/components/kit";
import { useAppStore } from "@/lib/app-store";
import { RefreshCw } from "lucide-react";

export const Route = createFileRoute("/admin/batches")({
  head: () => ({
    meta: [
      { title: "Batch Management — SantoGe Talent Cloud" },
      { name: "description", content: "Edit capacity, monitor enrolment fill rates and sync college batches on demand." },
      { property: "og:title", content: "Batch Management — SantoGe Talent Cloud" },
      { property: "og:description", content: "Edit capacity, monitor fill rates and sync college batches." },
    ],
  }),
  component: BatchesPage,
});

function BatchesPage() {
  const store = useAppStore();
  const totalCapacity = store.batches.reduce((s, b) => s + b.capacity, 0);
  const totalEnrolled = store.batches.reduce((s, b) => s + b.enrolled, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Batch Management"
        subtitle="Capacity, enrolment and sync state for every partner college batch."
        action={<Chip tone="cyan">{store.batches.length} batches</Chip>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Total capacity" value={totalCapacity} />
        <Stat label="Enrolled" value={totalEnrolled} accent="var(--brand-emerald)" />
        <Stat label="Fill rate" value={`${Math.round((totalEnrolled / Math.max(totalCapacity, 1)) * 100)}%`} accent="var(--brand-purple)" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {store.batches.map((b) => {
          const fill = Math.round((b.enrolled / Math.max(b.capacity, 1)) * 100);
          return (
            <Panel
              key={b.id}
              title={b.name}
              subtitle={`${b.dept} · ${b.id}`}
              action={
                <button
                  onClick={() => {
                    store.syncBatch(b.id);
                    toast.success(`${b.name} synced`);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-line-soft px-3 py-1.5 text-[11px] font-bold text-foreground hover:border-brand-cyan/60"
                >
                  <RefreshCw className="size-3.5" /> Sync
                </button>
              }
            >
              <div className="mb-3 flex items-center justify-between text-xs">
                <span className="text-copy-subtle">Fill rate</span>
                <span className="font-mono text-foreground">{b.enrolled}/{b.capacity} · {fill}%</span>
              </div>
              <Meter value={fill} accent={fill >= 80 ? "var(--brand-emerald)" : "var(--brand-cyan)"} />

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="text-xs">
                  <span className="mb-1 block font-semibold text-copy-subtle">Capacity</span>
                  <input
                    type="number"
                    value={b.capacity}
                    onChange={(e) => store.updateBatch(b.id, { capacity: Number(e.target.value) })}
                    className="w-full rounded-xl border border-line-soft bg-surface-soft px-3 py-2 font-mono text-xs text-foreground outline-none focus:border-brand-cyan/60"
                  />
                </label>
                <label className="text-xs">
                  <span className="mb-1 block font-semibold text-copy-subtle">Enrolled</span>
                  <input
                    type="number"
                    value={b.enrolled}
                    onChange={(e) => store.updateBatch(b.id, { enrolled: Number(e.target.value) })}
                    className="w-full rounded-xl border border-line-soft bg-surface-soft px-3 py-2 font-mono text-xs text-foreground outline-none focus:border-brand-cyan/60"
                  />
                </label>
              </div>

              <p className="mt-3 text-[11px] text-copy-subtle">
                Last sync: {b.lastSync ? b.lastSync : "never"}
              </p>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
