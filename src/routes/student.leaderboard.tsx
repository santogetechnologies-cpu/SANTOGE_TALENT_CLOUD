import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useAppStore } from "@/lib/app-store";
import { TRACKS, type TrackId } from "@/lib/tracks";
import { Crown, Trophy, Users, CalendarCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useLiveStudentProfile,
  useLiveStudentProgress,
  useLiveLeaderboard,
  useBatchLookup,
} from "@/lib/data";
import { trackProgress } from "@/lib/curriculum";

export const Route = createFileRoute("/student/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — SantoGe Talent Cloud" },
      {
        name: "description",
        content: "Synchronized cohort rankings across attendance, daily practice, and talent scores.",
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

  const liveLeaderboardQuery = useLiveLeaderboard(batchId, 50, !!batchId);

  const rows = useMemo(() => {
    if (liveLeaderboardQuery.data && liveLeaderboardQuery.data.length > 0) {
      return liveLeaderboardQuery.data.map((item, idx) => ({
        name: item.name,
        talentScore: item.talent_score,
        rank: item.rank || idx + 1,
        studentId: item.student_id,
      }));
    }
    // Fallback demo row if empty
    return [
      { name: me, talentScore: store.talentScore || 750, rank: 1, studentId: liveStudentId || "me" },
    ];
  }, [liveLeaderboardQuery.data, me, store.talentScore, liveStudentId]);

  const liveRank = rows.findIndex((r) => r.name === me || r.studentId === liveStudentId) + 1;
  const myRank = liveRank > 0 ? liveRank : 1;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Minimal Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Trophy className="size-6 text-amber-500" />
            Leaderboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Placement Accelerator cohort rankings based on Talent Score.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 self-start px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
          <Sparkles className="size-3.5 text-indigo-600" />
          {getBatchName(batchId, "Cohort Batch")}
        </div>
      </div>

      {/* Minimal 3-Stat Summary Strip */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 text-center shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Your Rank
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600">
            #{myRank}
          </span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 text-center shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Cohort Size
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {rows.length}
          </span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 text-center shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Days Attended
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
            {attendanceCount}<span className="text-xs text-slate-400 font-normal">/90</span>
          </span>
        </div>
      </div>

      {/* Leaderboard Table / Clean List */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Cohort Ranking</h2>
          <span className="text-xs text-slate-400 font-mono">Talent Score (0–1000)</span>
        </div>

        {liveLeaderboardQuery.isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Loading batch leaderboard...
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {rows.map((r, i) => {
              const isMe = r.name === me || r.studentId === liveStudentId;
              const rankNum = i + 1;

              return (
                <div
                  key={r.studentId || `${r.name}-${i}`}
                  className={cn(
                    "flex items-center justify-between px-5 py-3.5 transition-colors text-xs sm:text-sm",
                    isMe ? "bg-indigo-50/50" : "hover:bg-slate-50/70",
                  )}
                >
                  {/* Left: Rank + Avatar + Name */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-6 flex items-center justify-center font-bold text-xs text-slate-500">
                      {rankNum === 1 ? (
                        <Crown className="size-4 text-amber-500 fill-amber-400" />
                      ) : rankNum === 2 ? (
                        <span className="text-slate-400 font-semibold">2</span>
                      ) : rankNum === 3 ? (
                        <span className="text-amber-700/70 font-semibold">3</span>
                      ) : (
                        <span className="text-slate-400">{rankNum}</span>
                      )}
                    </div>

                    <div className="size-8 rounded-full bg-slate-100 text-slate-600 font-semibold text-xs flex items-center justify-center uppercase shrink-0">
                      {r.name.slice(0, 2)}
                    </div>

                    <div className="truncate">
                      <span className={cn("font-medium", isMe ? "text-indigo-900 font-bold" : "text-slate-800")}>
                        {r.name}
                      </span>
                      {isMe && (
                        <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                          You
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Progress bar & score */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden sm:block w-28 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full"
                        style={{ width: `${Math.min(100, (r.talentScore / 1000) * 100)}%` }}
                      />
                    </div>
                    <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm w-16 text-right">
                      {r.talentScore} <span className="text-[10px] font-normal text-slate-400">pts</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Technical Track Mastery (Minimal Footnote) */}
      {activeTracks.length > 0 && (
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Assigned Technical Track Mastery
            </h3>
            <span className="text-[11px] text-slate-400">Individual & self-paced</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {activeTracks.map((id) => {
              const t = TRACKS.find((x) => x.id === id);
              const pct = trackProgress(id, skills);

              return (
                <div
                  key={id}
                  className="bg-white border border-slate-200/60 rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {t?.name || id}
                    </p>
                    <p className="text-[11px] text-slate-400">{t?.domain || "Technical Track"}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-indigo-600">{pct}%</span>
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
