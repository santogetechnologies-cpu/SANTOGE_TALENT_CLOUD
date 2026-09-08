import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Chip, PageHeader, Panel } from "@/components/kit";
import { LAB_COMPONENTS } from "@/components/labs";
import { useAppStore } from "@/lib/app-store";
import { TRACKS, type TrackId } from "@/lib/tracks";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

export const Route = createFileRoute("/student/labs")({
  head: () => ({
    meta: [
      { title: "Technical Labs — SantoGe Talent Cloud" },
      {
        name: "description",
        content:
          "Run interactive sandbox labs across 15 technical tracks and earn verified Talent Score credit.",
      },
      { property: "og:title", content: "Technical Labs — SantoGe Talent Cloud" },
      {
        property: "og:description",
        content: "Interactive sandbox labs across 15 technical tracks with instant verification.",
      },
    ],
  }),
  component: LabsPage,
});

function LabsPage() {
  const store = useAppStore();
  const [selected, setSelected] = useState<TrackId>(store.activeTracks[0] ?? "mern");
  const [query, setQuery] = useState("");

  const filtered = TRACKS.filter(
    (t) =>
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      t.tagline.toLowerCase().includes(query.toLowerCase()),
  );
  const Lab = LAB_COMPONENTS[selected];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Technical Labs"
        subtitle="Fifteen sandboxed skill engines. Execute, verify, and earn Talent Score."
        action={<Chip tone="cyan">{store.completedLabs.length} labs verified</Chip>}
      />

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <Panel title="Tracks" subtitle="Search and select an engine">
          <label className="mb-3 flex items-center gap-2 rounded-xl border border-line-soft bg-surface-soft px-3 py-2">
            <Search className="size-4 text-copy-subtle" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tracks…"
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-copy-subtle"
            />
          </label>
          <div className="max-h-[560px] space-y-1.5 overflow-y-auto pr-1">
            {filtered.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelected(t.id)}
                className={cn(
                  "w-full rounded-xl border px-3 py-2.5 text-left transition-colors",
                  selected === t.id
                    ? "border-brand-cyan/60 bg-surface-soft"
                    : "border-line-soft bg-transparent hover:bg-surface-soft",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">{t.short}</p>
                  <span className="size-2 rounded-full" style={{ background: t.accent }} />
                </div>
                <p className="mt-0.5 text-[11px] text-copy-subtle">{t.labTitle}</p>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-1 py-4 text-xs text-copy-subtle">No tracks match "{query}".</p>
            )}
          </div>
        </Panel>

        <div className="min-w-0">
          <Lab />
        </div>
      </div>
    </div>
  );
}
