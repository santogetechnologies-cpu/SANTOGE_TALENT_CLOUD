import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Chip, Meter, PageHeader, Panel, Stat } from "@/components/kit";
import { useAppStore } from "@/lib/app-store";
import { Building2, Search, X } from "lucide-react";

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

const SEED: Opening[] = [
  {
    id: "o1",
    company: "Zoho",
    role: "Member Technical Staff",
    ctc: "₹7.2 LPA",
    minScore: 520,
    stage: "Technical",
  },
  {
    id: "o2",
    company: "Freshworks",
    role: "Associate SDE",
    ctc: "₹9.0 LPA",
    minScore: 640,
    stage: "Screening",
  },
  {
    id: "o3",
    company: "TCS Digital",
    role: "Systems Engineer",
    ctc: "₹7.0 LPA",
    minScore: 480,
    stage: "Applied",
  },
  {
    id: "o4",
    company: "Cognizant GenC Next",
    role: "Programmer Analyst",
    ctc: "₹6.5 LPA",
    minScore: 450,
    stage: null,
  },
  {
    id: "o5",
    company: "Hexaware",
    role: "Cloud Associate",
    ctc: "₹5.5 LPA",
    minScore: 400,
    stage: null,
  },
  { id: "o6", company: "Razorpay", role: "SDE-1", ctc: "₹16 LPA", minScore: 780, stage: null },
  {
    id: "o7",
    company: "Chargebee",
    role: "QA Engineer",
    ctc: "₹8.0 LPA",
    minScore: 600,
    stage: "HR Round",
  },
];

function PlacementPage() {
  const store = useAppStore();
  const [rows, setRows] = useState(SEED);
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => rows.filter((r) => (r.company + r.role).toLowerCase().includes(query.toLowerCase())),
    [rows, query],
  );
  const applied = rows.filter((r) => r.stage);

  const advance = (id: string) => {
    setRows((rs) =>
      rs.map((r) => {
        if (r.id !== id) return r;
        const idx = r.stage ? STAGES.indexOf(r.stage) : -1;
        const next: Stage = STAGES[Math.min(idx + 1, STAGES.length - 1)] ?? "Offer";
        toast.success(`${r.company} → ${next}`);
        return { ...r, stage: next };
      }),
    );
  };

  const withdraw = (id: string) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, stage: null } : r)));
    toast("Application withdrawn");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Placement Tracker"
        subtitle="Every opening, gated by Talent Score and tracked through the hiring pipeline."
        action={<Chip tone="emerald">{applied.length} live applications</Chip>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Talent Score" value={store.talentScore} />
        <Stat
          label="Unlocked openings"
          value={rows.filter((r) => store.talentScore >= r.minScore).length}
          accent="var(--brand-emerald)"
        />
        <Stat
          label="Offers"
          value={rows.filter((r) => r.stage === "Offer").length}
          accent="var(--brand-amber)"
        />
      </div>

      <Panel
        title="Openings"
        subtitle="Score-gated company gateway"
        action={
          <label className="flex items-center gap-2 rounded-xl border border-line-soft bg-surface-soft px-3 py-1.5">
            <Search className="size-4 text-copy-subtle" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search companies…"
              className="w-40 bg-transparent text-xs text-foreground outline-none placeholder:text-copy-subtle"
            />
          </label>
        }
      >
        <div className="space-y-2.5">
          {filtered.map((r) => {
            const unlocked = store.talentScore >= r.minScore;
            const progress = r.stage ? ((STAGES.indexOf(r.stage) + 1) / STAGES.length) * 100 : 0;
            return (
              <div key={r.id} className="rounded-xl border border-line-soft bg-surface-soft p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-xl bg-surface-dark">
                    <Building2 className="size-4 text-brand-cyan" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{r.company}</p>
                    <p className="text-xs text-copy-subtle">
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
                            className="rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple px-3 py-1.5 text-[11px] font-bold text-surface-dark"
                          >
                            Advance
                          </button>
                        )}
                        <button
                          onClick={() => withdraw(r.id)}
                          aria-label="Withdraw"
                          className="text-copy-subtle hover:text-brand-rose"
                        >
                          <X className="size-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        disabled={!unlocked}
                        onClick={() => advance(r.id)}
                        className="rounded-xl border border-line-soft px-3 py-1.5 text-[11px] font-bold text-foreground disabled:opacity-40"
                      >
                        {unlocked ? "Apply" : "Locked"}
                      </button>
                    )}
                  </div>
                </div>
                {r.stage && (
                  <div className="mt-3">
                    <Meter value={progress} accent="var(--brand-purple)" />
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="py-6 text-center text-xs text-copy-subtle">
              No openings match "{query}".
            </p>
          )}
        </div>
      </Panel>
    </div>
  );
}
