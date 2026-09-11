import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Chip, Meter, PageHeader, Panel, Stat } from "@/components/kit";
import { useAppStore } from "@/lib/app-store";
import { fetchLiveHiringDrives } from "@/lib/data";
import { Building2, Search, X } from "lucide-react";
import { useLiveStudentProfile, useLiveHiringDrives } from "@/lib/data";

export const Route = createFileRoute("/student/placement")({
  head: () => ({
    meta: [
      { title: "Placement Tracker — SantoGe Talent Cloud" },
      {
        name: "description",
        content:
          "Track applications across the hiring pipeline and see which openings your Talent Score unlocks.",
      },
      { property: "og:title", content: "Placement Tracker — SantoGe Talent Cloud" },
      {
        property: "og:description",
        content: "Track applications across the hiring pipeline in real time.",
      },
    ],
  }),
  component: PlacementPage,
});

type Stage = "Applied" | "Screening" | "Technical" | "HR Round" | "Offer";
const STAGES: Stage[] = ["Applied", "Screening", "Technical", "HR Round", "Offer"];

type Opening = {
  id: string;
  company: string;
  role: string;
  ctc: string;
  minScore: number;
  stage: Stage | null;
};

function PlacementPage() {
  const store = useAppStore();
  const [liveStages, setLiveStages] = useState<Record<string, Stage | null>>({});
  const [query, setQuery] = useState("");

  const { data: liveProfileData } = useLiveStudentProfile(
    store.supabaseSession?.user?.id,
    !!store.supabaseSession?.user?.id,
  );
  const talentScore = liveProfileData?.profile?.talent_score ?? store.talentScore;

  const { data: liveDrives, isLoading: isDrivesLoading } = useLiveHiringDrives(true);

  const rows: Opening[] = useMemo(() => {
    if (liveDrives && liveDrives.length > 0) {
      return liveDrives.map((d) => ({
        id: d.id,
        company: d.company,
        role: d.roles,
        ctc: d.ctc,
        minScore: d.minScore,
        stage: liveStages[d.id] ?? null,
      }));
    }
    return [];
  }, [liveDrives, liveStages]);

  const filtered = useMemo(
    () => rows.filter((r) => (r.company + r.role).toLowerCase().includes(query.toLowerCase())),
    [rows, query],
  );
  const applied = rows.filter((r) => r.stage);

  const advance = (id: string) => {
    const current = liveStages[id] ?? null;
    const idx = current ? STAGES.indexOf(current) : -1;
    const next: Stage = STAGES[Math.min(idx + 1, STAGES.length - 1)] ?? "Offer";
    setLiveStages((prev) => ({ ...prev, [id]: next }));
    toast.success(`Application updated → ${next}`);
  };

  const withdraw = (id: string) => {
    setLiveStages((prev) => ({ ...prev, [id]: null }));
    toast("Application withdrawn");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Placement Tracker"
        subtitle="Every opening, gated by Talent Score and tracked through the hiring pipeline."
        action={<Chip tone="emerald">{applied.length} live applications</Chip>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Talent Score" value={talentScore} tone="brand" />
        <Stat
          label="Unlocked openings"
          value={rows.filter((r) => talentScore >= r.minScore).length}
          tone="emerald"
        />
        <Stat
          label="Offers"
          value={rows.filter((r) => r.stage === "Offer").length}
          tone="amber"
        />
      </div>

      <Panel
        title="Openings"
        subtitle="Score-gated company gateway"
        action={
          <div className="relative flex items-center">
            <Search className="absolute left-3 size-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search companies…"
              className="h-8.5 rounded-lg border border-border bg-card pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
            />
          </div>
        }
      >
        <div className="space-y-3">
          {isDrivesLoading ? (
            <div className="rounded-xl border border-border bg-muted/20 p-8 text-center text-xs text-muted-foreground">
              Loading active hiring drives from Supabase…
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-xl border border-border bg-muted/20 p-8 text-center text-xs text-muted-foreground">
              <Building2 className="mx-auto mb-2 size-8 text-muted-foreground/60" />
              <p className="font-semibold text-foreground">No active hiring drives available.</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Placement drives will appear here once registered and published by platform
                administrators.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">
              No openings match "{query}".
            </p>
          ) : (
            filtered.map((r) => {
              const unlocked = talentScore >= r.minScore;
              const progress = r.stage ? ((STAGES.indexOf(r.stage) + 1) / STAGES.length) * 100 : 0;
              return (
                <div key={r.id} className="rounded-xl border border-border bg-card p-4 shadow-xs">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-lg bg-primary/10 border border-primary/20 shrink-0">
                      <Building2 className="size-4 text-primary" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">{r.company}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.role} · {r.ctc}
                      </p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <Chip tone={unlocked ? "emerald" : "rose"}>Min {r.minScore}</Chip>
                      {r.stage ? (
                        <>
                          <Chip tone="cyan">{r.stage}</Chip>
                          {r.stage !== "Offer" && (
                            <button
                              onClick={() => advance(r.id)}
                              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
                            >
                              Advance
                            </button>
                          )}
                          <button
                            onClick={() => withdraw(r.id)}
                            aria-label="Withdraw"
                            className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <X className="size-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          disabled={!unlocked}
                          onClick={() => advance(r.id)}
                          className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground disabled:opacity-40 hover:bg-muted transition-colors shadow-xs"
                        >
                          {unlocked ? "Apply" : "Locked"}
                        </button>
                      )}
                    </div>
                  </div>
                  {r.stage && (
                    <div className="mt-3">
                      <Meter value={progress} tone="brand" />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </Panel>
    </div>
  );
}
