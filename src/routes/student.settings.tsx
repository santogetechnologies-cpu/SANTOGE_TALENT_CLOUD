import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Chip, PageHeader, Panel, Stat } from "@/components/kit";
import { useAppStore } from "@/lib/app-store";
import { TRACKS } from "@/lib/tracks";
import { cn } from "@/lib/utils";
import { Check, Moon, RotateCcw, Sun } from "lucide-react";

export const Route = createFileRoute("/student/settings")({
  head: () => ({
    meta: [
      { title: "Settings & Courses — SantoGe Talent Cloud" },
      { name: "description", content: "Choose up to three technical tracks, tune the readiness model and switch themes." },
      { property: "og:title", content: "Settings & Courses — SantoGe Talent Cloud" },
      { property: "og:description", content: "Pick your tracks, tune readiness weights and manage your workspace." },
    ],
  }),
  component: SettingsPage,
});

const PILLARS = [
  { key: "T", label: "Technical" },
  { key: "C", label: "Communication" },
  { key: "A", label: "Aptitude" },
  { key: "E", label: "English" },
  { key: "R", label: "Resume / ATS" },
  { key: "M", label: "Mock Interview" },
] as const;

function SettingsPage() {
  const store = useAppStore();

  const toggleTrack = (id: (typeof TRACKS)[number]["id"]) => {
    const has = store.activeTracks.includes(id);
    const next = has ? store.activeTracks.filter((t) => t !== id) : [...store.activeTracks, id];
    if (next.length < 1) {
      toast.error("Keep at least one active track");
      return;
    }
    if (next.length > 3) {
      toast.error("Maximum three concurrent tracks");
      return;
    }
    store.setActiveTracks(next);
    toast.success(has ? "Track removed" : "Track enrolled");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings & Course Selection"
        subtitle="Manage enrolment, tune your readiness model and personalise the workspace."
        action={<Chip tone="purple">{store.activeTracks.length}/3 tracks active</Chip>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Talent Score" value={store.talentScore} />
        <Stat label="Verified labs" value={store.completedLabs.length} accent="var(--brand-emerald)" />
        <Stat label="Theme" value={store.theme === "dark" ? "Dark" : "Light"} accent="var(--brand-amber)" />
      </div>

      <Panel title="Course selection" subtitle="Enrol in up to three of the fifteen technical tracks">
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {TRACKS.map((t) => {
            const on = store.activeTracks.includes(t.id);
            return (
              <button
                key={t.id}
                onClick={() => toggleTrack(t.id)}
                className={cn(
                  "rounded-xl border p-3 text-left transition-colors",
                  on ? "border-brand-cyan/60 bg-surface-soft" : "border-line-soft hover:bg-surface-soft",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  {on && <Check className="size-4 shrink-0 text-brand-emerald" />}
                </div>
                <p className="mt-1 text-xs text-copy-subtle">{t.tagline}</p>
              </button>
            );
          })}
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Readiness model" subtitle="Simulate how each pillar moves your Talent Score">
          <div className="space-y-4">
            {PILLARS.map((p) => (
              <div key={p.key}>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{p.label}</span>
                  <span className="font-mono text-copy-subtle">{store.readiness[p.key]}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={store.readiness[p.key]}
                  onChange={(e) => store.setReadiness({ [p.key]: Number(e.target.value) })}
                  className="w-full accent-[var(--brand-cyan)]"
                />
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Workspace" subtitle="Appearance and demo data">
          <div className="space-y-3">
            <button
              onClick={store.toggleTheme}
              className="flex w-full items-center gap-2 rounded-xl border border-line-soft bg-surface-soft px-4 py-3 text-sm font-semibold text-foreground"
            >
              {store.theme === "dark" ? <Sun className="size-4 text-brand-amber" /> : <Moon className="size-4 text-brand-purple" />}
              Switch to {store.theme === "dark" ? "light" : "dark"} theme
            </button>
            <button
              onClick={store.resetProgress}
              className="flex w-full items-center gap-2 rounded-xl border border-line-soft px-4 py-3 text-sm font-semibold text-brand-rose"
            >
              <RotateCcw className="size-4" /> Reset demo progress
            </button>
          </div>
        </Panel>
      </div>
    </div>
  );
}
