import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Chip, Meter, PageHeader, Panel, Stat } from "@/components/kit";
import { useAppStore } from "@/lib/app-store";
import { TRACKS } from "@/lib/tracks";
import { Crown, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/student/leaderboard")({
  head: () => ({
    meta: [
      { title: "Batch Leaderboard — SantoGe Talent Cloud" },
      {
        name: "description",
        content:
          "Synchronised batch leaderboard for the Placement Accelerator cohort. Technical skills remain individual.",
      },
      { property: "og:title", content: "Batch Leaderboard — SantoGe Talent Cloud" },
      {
        property: "og:description",
        content: "Cohort ranking across attendance, communication and talent scores.",
      },
    ],
  }),
  component: LeaderboardPage,
});

import { useLiveStudentProfile, useLiveStudentProgress, useLiveLeaderboard } from "@/lib/data";
import { trackProgress } from "@/lib/curriculum";
import type { TrackId } from "@/lib/tracks";

function LeaderboardPage() {
  const store = useAppStore();

  const { data: liveProfileData } = useLiveStudentProfile(
    store.supabaseSession?.user?.id,
    !!store.supabaseSession?.user?.id,
  );
  const liveStudentId = liveProfileData?.profile?.id || store.liveStudentId;
  const { data: liveProgressData } = useLiveStudentProgress(
    liveStudentId || undefined,
    !!liveStudentId,
  );

  const batchId = liveProfileData?.profile?.batch_id || store.student?.batchId || "";
  const me =
    liveProfileData?.profile?.name ||
    store.student?.name ||
    store.sessionEmail?.split("@")[0] ||
    "You";

  const activeTracks: TrackId[] = liveProfileData?.tracks || store.activeTracks;
  const attendanceCount = liveProgressData?.attendance?.length ?? store.attendance.length;
  const skills = liveProgressData?.skills || store.skills;

  const getTrackPct = (trackId: TrackId) => {
    return trackProgress(trackId, skills);
  };

  const liveLeaderboardQuery = useLiveLeaderboard(batchId, 50, !!batchId);

  const rows = useMemo(() => {
    if (liveLeaderboardQuery.data) {
      return liveLeaderboardQuery.data.map((item) => ({
        name: item.name,
        talentScore: item.talent_score,
        rank: item.rank,
        studentId: item.student_id,
      }));
    }
    return [];
  }, [liveLeaderboardQuery.data]);

  const liveRank = rows.findIndex((r) => r.name === me || r.studentId === liveStudentId) + 1;
  const myRank = liveRank > 0 ? liveRank : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Batch Leaderboard"
        subtitle="Leaderboards belong to the Placement Accelerator cohort — never to unrelated technical tracks."
        action={<Chip tone="amber">{batchId || "No Batch"}</Chip>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Your rank" value={myRank > 0 ? `#${myRank}` : "—"} hint="Talent Score Rank" />
        <Stat
          label="Cohort size"
          value={rows.length}
          accent="var(--brand-purple)"
          hint="Active enrolled learners in batch"
        />
        <Stat
          label="Days attended"
          value={attendanceCount}
          accent="var(--brand-emerald)"
          hint="Out of 90"
        />
      </div>

      <Panel
        title="Batch Talent Score Leaderboard"
        subtitle="Live Supabase ranking based on authoritative composite Talent Score (0–1000)"
      >
        {liveLeaderboardQuery.isLoading ? (
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
              const isMe = r.name === me || r.studentId === liveStudentId;
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
                  <span className="text-sm text-foreground font-medium">
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
