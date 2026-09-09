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

import { useLiveStudentProfile, useLiveStudentProgress, useLiveLeaderboard } from "@/lib/data";
import { trackProgress } from "@/lib/curriculum";
import type { TrackId } from "@/lib/tracks";

function LeaderboardPage() {
  const store = useAppStore();
  const isLive = store.authProvider === "supabase";

  const { data: liveProfileData } = useLiveStudentProfile(
    store.supabaseSession?.user?.id,
    isLive && !!store.supabaseSession?.user?.id,
  );
  const liveStudentId = liveProfileData?.profile?.id || store.liveStudentId;
  const { data: liveProgressData } = useLiveStudentProgress(
    liveStudentId || undefined,
    isLive && !!liveStudentId,
  );

  const batchId = isLive
    ? liveProfileData?.profile?.batch_id || ""
    : (store.student?.batchId ?? "BATCH");
  const me = isLive
    ? liveProfileData?.profile?.name || store.supabaseSession?.user?.email?.split("@")[0] || "You"
    : (store.student?.name ?? "You");

  const activeTracks: TrackId[] = isLive ? liveProfileData?.tracks || [] : store.activeTracks;

  const attendanceCount = isLive
    ? (liveProgressData?.attendance?.length ?? 0)
    : store.attendance.length;

  const skills = isLive ? liveProgressData?.skills || [] : store.skills;

  const getTrackPct = (trackId: TrackId) => {
    if (!isLive) return store.trackPercent(trackId);
    return trackProgress(trackId, skills);
  };

  const [metric, setMetric] = useState<Metric>("aptitude");

  const liveLeaderboardQuery = useLiveLeaderboard(batchId, 50, isLive && !!batchId);

  const rows = useMemo(() => {
    if (isLive && liveLeaderboardQuery.data) {
      return liveLeaderboardQuery.data.map((item) => ({
        name: item.name,
        talentScore: item.talent_score,
        rank: item.rank,
        studentId: item.student_id,
      }));
    }
    return null;
  }, [isLive, liveLeaderboardQuery.data]);

  // Demo fallback
  const demoRows: LeaderRow[] = useMemo(() => {
    return leaderboard(batchId, me);
  }, [batchId, me]);

  const demoRanked = useMemo(() => {
    return [...demoRows].sort((a, b) => b[metric] - a[metric]);
  }, [demoRows, metric]);

  const liveRank = rows
    ? rows.findIndex((r) => r.name === me || r.studentId === liveStudentId) + 1
    : 0;
  const myRank = isLive ? liveRank : demoRanked.findIndex((r) => r.name === me) + 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Batch Leaderboard"
        subtitle="Leaderboards belong to the Placement Accelerator cohort — never to unrelated technical tracks."
        action={<Chip tone="amber">{batchId || "No Batch"}</Chip>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          label="Your rank"
          value={myRank > 0 ? `#${myRank}` : "—"}
          hint={
            isLive ? "Talent Score Rank" : (METRICS.find((m) => m.key === metric)?.label ?? "Rank")
          }
        />
        <Stat
          label="Cohort size"
          value={isLive ? rows?.length || 0 : demoRows.length}
          accent="var(--brand-purple)"
          hint={isLive ? "Active enrolled learners in batch" : "Demo slice of the batch"}
        />
        <Stat
          label="Days attended"
          value={attendanceCount}
          accent="var(--brand-emerald)"
          hint="Out of 90"
        />
      </div>

      <Panel
        title={isLive ? "Batch Talent Score Leaderboard" : "Cohort ranks"}
        subtitle={
          isLive
            ? "Live Supabase ranking based on authoritative composite Talent Score (0–1000)"
            : "Switch the ranking metric"
        }
      >
        {!isLive && (
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
        )}

        {isLive ? (
          liveLeaderboardQuery.isLoading ? (
            <div className="rounded-xl border border-line-soft bg-surface-soft p-6 text-center text-xs text-copy-subtle">
              Loading batch rankings from Supabase…
            </div>
          ) : liveLeaderboardQuery.isError ? (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-6 text-center text-xs text-rose-400">
              Unable to load cohort leaderboard.
            </div>
          ) : rows && rows.length > 0 ? (
            <ol className="space-y-2">
              {rows.map((r, i) => {
                const isMe = r.name === me || r.studentId === store.liveStudentId;
                return (
                  <li
                    key={r.studentId || r.name}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-3 py-2.5",
                      isMe ? "border-brand-cyan/60 bg-surface-soft" : "border-line-soft",
                    )}
                  >
                    <span className="w-6 font-mono text-xs text-copy-subtle">{i + 1}</span>
                    {i === 0 && <Crown className="size-3.5 text-brand-amber" />}
                    <span className="text-sm text-foreground">
                      {r.name}
                      {isMe ? " (you)" : ""}
                    </span>
                    <div className="ml-auto flex w-48 items-center gap-2">
                      <Meter
                        value={Math.min(100, Math.round((r.talentScore / 1000) * 100))}
                        accent="var(--brand-cyan)"
                      />
                      <span className="w-16 text-right font-mono text-[11px] text-brand-cyan font-bold">
                        {r.talentScore} pts
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <div className="rounded-xl border border-line-soft bg-surface-soft p-6 text-center text-xs text-copy-subtle">
              No learners enrolled in this batch yet.
            </div>
          )
        ) : (
          <ol className="space-y-2">
            {demoRanked.map((r, i) => (
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
        )}
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
          {activeTracks.map((id) => {
            const t = TRACKS.find((x) => x.id === id)!;
            const pct = getTrackPct(id);
            return (
              <div key={id} className="rounded-xl border border-line-soft bg-surface-soft p-3">
                <p className="text-sm font-semibold text-foreground">{t?.name || id}</p>
                <p className="mt-1 text-[11px] text-copy-subtle">Your competency progress</p>
                <div className="mt-2">
                  <Meter value={pct} accent={t?.accent} />
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
