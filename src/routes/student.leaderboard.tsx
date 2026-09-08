import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Chip, Meter, PageHeader, Panel, Stat } from "@/components/kit";
import { useAppStore } from "@/lib/app-store";
import { leaderboard, type LeaderRow } from "@/lib/curriculum";
import { fetchLiveBatchLeaderboard } from "@/lib/data/placement-data";
import { TRACKS } from "@/lib/tracks";
import { cn } from "@/lib/utils";
import { Crown, Info } from "lucide-react";

export const Route = createFileRoute("/student/leaderboard")({
  head: () => ({
    meta: [
      { title: "Batch Leaderboard — SantoGe Talent Cloud" },
      {
        name: "description",
        content:
          "Placement Accelerator cohort ranks for attendance, English, aptitude, communication and improvement.",
      },
      { property: "og:title", content: "Batch Leaderboard — SantoGe Talent Cloud" },
      {
        property: "og:description",
        content: "Cohort ranks for attendance, English, aptitude, communication and improvement.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LeaderboardPage,
});

type Metric = keyof Omit<LeaderRow, "name">;
const METRICS: { key: Metric; label: string }[] = [
  { key: "attendance", label: "Attendance rank" },
  { key: "english", label: "English rank" },
  { key: "aptitude", label: "Aptitude rank" },
  { key: "communication", label: "Communication rank" },
  { key: "improvement", label: "Improvement rank" },
];

function LeaderboardPage() {
  const store = useAppStore();
  const isLive = store.authProvider === "supabase";
  const batchId = store.student?.batchId ?? "BATCH";
  const me = store.student?.name ?? "You";
  const [metric, setMetric] = useState<Metric>("aptitude");

  const liveLeaderboardQuery = useQuery({
    queryKey: ["liveBatchLeaderboard", batchId],
    queryFn: () => fetchLiveBatchLeaderboard(batchId),
    enabled: isLive && !!batchId,
  });

  const rows: LeaderRow[] = useMemo(() => {
    if (isLive && liveLeaderboardQuery.data && liveLeaderboardQuery.data.length > 0) {
      const liveList: LeaderRow[] = liveLeaderboardQuery.data.map((item) => {
        const isCurrentStudent = item.name === me || item.student_id === store.liveStudentId;
        const daysAttended = isCurrentStudent
          ? store.attendance.length
          : Math.max(1, Math.min(90, Math.round(item.talent_score / 12)));
        return {
          name: item.name,
          attendance: daysAttended,
          english: Math.min(100, Math.max(40, Math.round(item.talent_score * 0.1))),
          aptitude: Math.min(100, Math.max(40, Math.round(item.talent_score * 0.1))),
          communication: Math.min(100, Math.max(40, Math.round(item.talent_score * 0.095))),
          improvement: Math.min(100, Math.max(30, Math.round(item.talent_score * 0.085))),
        };
      });

      if (!liveList.some((r) => r.name === me)) {
        liveList.push({
          name: me,
          attendance: store.attendance.length,
          english: Math.min(100, Math.max(40, Math.round((store.talentScore || 500) * 0.1))),
          aptitude: Math.min(100, Math.max(40, Math.round((store.talentScore || 500) * 0.1))),
          communication: Math.min(
            100,
            Math.max(40, Math.round((store.talentScore || 500) * 0.095)),
          ),
          improvement: Math.min(100, Math.max(30, Math.round((store.talentScore || 500) * 0.085))),
        });
      }

      return liveList;
    }
    return leaderboard(batchId, me);
  }, [
    isLive,
    liveLeaderboardQuery.data,
    batchId,
    me,
    store.attendance.length,
    store.liveStudentId,
    store.talentScore,
  ]);
  const ranked = [...rows].sort((a, b) => b[metric] - a[metric]);
  const myRank = ranked.findIndex((r) => r.name === me) + 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Batch Leaderboard"
        subtitle="Leaderboards belong to the Placement Accelerator cohort — never to unrelated technical tracks."
        action={<Chip tone="amber">{batchId}</Chip>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          label="Your rank"
          value={myRank > 0 ? `#${myRank}` : "—"}
          hint={METRICS.find((m) => m.key === metric)?.label ?? "Rank"}
        />
        <Stat
          label="Cohort size"
          value={rows.length}
          accent="var(--brand-purple)"
          hint="Demo slice of the batch"
        />
        <Stat
          label="Days attended"
          value={store.attendance.length}
          accent="var(--brand-emerald)"
          hint="Out of 90"
        />
      </div>

      <Panel title="Cohort ranks" subtitle="Switch the ranking metric">
        <div className="mb-4 flex flex-wrap gap-2">
          {METRICS.map((m) => (
            <button
              key={m.key}
              onClick={() => setMetric(m.key)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[11px] font-bold transition-colors",
                metric === m.key
                  ? "border-brand-cyan/60 text-brand-cyan"
                  : "border-line-soft text-copy-subtle hover:text-foreground",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
        <ol className="space-y-2">
          {ranked.map((r, i) => (
            <li
              key={r.name}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-3 py-2.5",
                r.name === me ? "border-brand-cyan/60 bg-surface-soft" : "border-line-soft",
              )}
            >
              <span className="w-6 font-mono text-xs text-copy-subtle">{i + 1}</span>
              {i === 0 && <Crown className="size-3.5 text-brand-amber" />}
              <span className="text-sm text-foreground">
                {r.name}
                {r.name === me ? " (you)" : ""}
              </span>
              <div className="ml-auto flex w-40 items-center gap-2">
                <Meter value={r[metric]} />
                <span className="w-9 text-right font-mono text-[11px] text-copy-subtle">
                  {r[metric]}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </Panel>

      <Panel
        title="Technical analytics (separate)"
        subtitle="Course-specific performance, not a batch ranking"
      >
        <p className="mb-3 flex items-start gap-2 text-xs text-copy-subtle">
          <Info className="mt-0.5 size-3.5 shrink-0 text-brand-cyan" />
          MERN, SAP FICO and Medical Coding are never ranked against each other. Technical progress
          is measured per course through skill mastery, practical completion and competency
          evidence.
        </p>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {store.activeTracks.map((id) => {
            const t = TRACKS.find((x) => x.id === id)!;
            const pct = store.trackPercent(id);
            return (
              <div key={id} className="rounded-xl border border-line-soft bg-surface-soft p-3">
                <p className="text-sm font-semibold text-foreground">{t.name}</p>
                <p className="mt-1 text-[11px] text-copy-subtle">Your competency progress</p>
                <div className="mt-2">
                  <Meter value={pct} accent={t.accent} />
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
