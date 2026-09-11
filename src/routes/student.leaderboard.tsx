import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Chip, Meter, PageHeader, Panel, Stat } from "@/components/kit";
import { useAppStore } from "@/lib/app-store";
import { TRACKS } from "@/lib/tracks";
import { Crown, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useLiveStudentProfile,
  useLiveStudentProgress,
  useLiveLeaderboard,
  useBatchLookup,
} from "@/lib/data";
import { trackProgress } from "@/lib/curriculum";
import type { TrackId } from "@/lib/tracks";

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
  const { getBatchName } = useBatchLookup(true);
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
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Batch Leaderboard"
        subtitle="Leaderboards belong to the Placement Accelerator cohort — never to unrelated technical tracks."
        action={<Chip tone="amber">{getBatchName(batchId, "Cohort Leaderboard")}</Chip>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Your rank" value={myRank > 0 ? `#${myRank}` : "—"} tone="brand" hint="Talent Score Rank" />
        <Stat
          label="Cohort size"
          value={rows.length}
          tone="purple"
          hint="Active enrolled learners in batch"
        />
        <Stat
          label="Days attended"
          value={attendanceCount}
          tone="emerald"
          hint="Out of 90"
        />
      </div>

      <Panel
        title="Batch Talent Score Leaderboard"
        subtitle="Live Supabase ranking based on authoritative composite Talent Score (0–1000)"
      >
        {liveLeaderboardQuery.isLoading ? (
          <div className="rounded-xl border border-border bg-muted/20 p-8 text-center text-xs text-muted-foreground">
            Loading batch rankings from Supabase…
          </div>
        ) : liveLeaderboardQuery.isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center text-xs text-destructive">
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
                    "flex items-center gap-3.5 rounded-lg border px-3.5 py-2.5 text-xs shadow-xs transition-colors",
                    isMe
                      ? "border-primary/40 bg-primary/5 text-foreground"
                      : "border-border bg-card text-muted-foreground",
                  )}
                >
                  <span className="w-6 font-mono font-semibold text-muted-foreground text-center">{i + 1}</span>
                  {i === 0 ? (
                    <Crown className="size-4 text-amber-500 shrink-0" />
                  ) : (
                    <span className="size-4 shrink-0" />
                  )}
                  <span className="text-xs font-semibold text-foreground flex-1">
                    {r.name}
                    {isMe ? <span className="ml-1.5 text-[11px] font-medium text-primary">(You)</span> : ""}
                  </span>
                  <div className="flex w-48 items-center gap-2.5">
                    <Meter
                      value={Math.min(100, Math.round((r.talentScore / 1000) * 100))}
                      tone="brand"
                    />
                    <span className="w-16 text-right font-mono text-xs text-primary font-bold">
                      {r.talentScore} pts
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        ) : (
          <div className="rounded-xl border border-border bg-muted/20 p-8 text-center text-xs text-muted-foreground">
            No learners enrolled in this batch yet.
          </div>
        )}
      </Panel>

      <Panel
        title="Technical analytics (separate)"
        subtitle="Course-specific performance, not a batch ranking"
      >
        <p className="mb-4 flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" />
          MERN, SAP FICO and Medical Coding are never ranked against each other. Technical progress
          is measured per course through skill mastery, practical completion and competency
          evidence.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {activeTracks.map((id) => {
            const t = TRACKS.find((x) => x.id === id)!;
            const pct = getTrackPct(id);
            return (
              <div key={id} className="rounded-xl border border-border bg-card p-4 shadow-xs">
                <p className="text-sm font-semibold text-foreground">{t?.name || id}</p>
                <p className="mt-1 text-xs text-muted-foreground">Your competency progress</p>
                <div className="mt-3">
                  <Meter value={pct} tone="brand" />
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
