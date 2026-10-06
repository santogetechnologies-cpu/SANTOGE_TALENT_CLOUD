import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useAppStore } from "@/lib/app-store";
import { TRACKS, trackById, type TrackId } from "@/lib/tracks";
import { cn } from "@/lib/utils";
import {
  User,
  GraduationCap,
  Bell,
  Send,
  Shield,
  CheckCircle2,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useLiveStudentProfile,
  useLiveStudentProgress,
  useLivePlatformSettings,
  updateLiveReadiness,
  useBatchLookup,
} from "@/lib/data";

export const Route = createFileRoute("/student/settings")({
  head: () => ({
    meta: [
      { title: "Profile & Settings — SantoGe Talent Cloud" },
      {
        name: "description",
        content: "Student profile, assigned technical specializations, and cohort details.",
      },
    ],
  }),
  component: ProfilePage,
});

const PILLARS = [
  { key: "T", label: "Technical Competency" },
  { key: "C", label: "Communication Skills" },
  { key: "A", label: "Aptitude & Logic" },
  { key: "E", label: "Professional English" },
  { key: "R", label: "ATS Resume Match" },
  { key: "M", label: "AI Mock Interview" },
] as const;

function ProfilePage() {
  const store = useAppStore();
  const queryClient = useQueryClient();

  const { data: liveProfileData } = useLiveStudentProfile(
    store.supabaseSession?.user?.id,
    !!store.supabaseSession?.user?.id,
  );
  const liveStudentId = liveProfileData?.profile?.id || store.liveStudentId;
  const { data: liveProgressData } = useLiveStudentProgress(
    liveStudentId || undefined,
    !!liveStudentId,
  );
  const { data: livePlatformSettings } = useLivePlatformSettings(true);
  const { getBatchName } = useBatchLookup(true);

  const activeTracks: TrackId[] = liveProfileData?.tracks || store.activeTracks;
  const talentScore = liveProfileData?.profile?.talent_score ?? store.talentScore;
  const completedLabs = liveProgressData?.completedLabs || store.completedLabs;
  const studentName =
    liveProfileData?.profile?.name ||
    store.student?.name ||
    store.supabaseSession?.user?.email?.split("@")[0] ||
    "Student";
  const studentEmail =
    liveProfileData?.profile?.email ||
    store.supabaseSession?.user?.email ||
    store.student?.email ||
    "";
  const studentCollege =
    liveProfileData?.profile?.college ||
    store.student?.college ||
    "SantoGe Institute of Technology";
  const studentRollNo =
    liveProfileData?.profile?.roll_no || store.student?.rollNo || "2026-CSE-042";
  const studentDept = liveProfileData?.profile?.dept || store.student?.dept || "Computer Science";
  const studentBatchId =
    liveProfileData?.profile?.batch_id || store.student?.batchId || "BATCH-2026-ABC-CSE-01";
  const placementDay = liveProfileData?.profile?.placement_day ?? store.placementDay ?? 1;

  const readiness = {
    T: liveProfileData?.profile?.readiness_t ?? store.readiness.T,
    C: liveProfileData?.profile?.readiness_c ?? store.readiness.C,
    A: liveProfileData?.profile?.readiness_a ?? store.readiness.A,
    E: liveProfileData?.profile?.readiness_e ?? store.readiness.E,
    R: liveProfileData?.profile?.readiness_r ?? store.readiness.R,
    M: liveProfileData?.profile?.readiness_m ?? store.readiness.M,
  };

  const [telegramNotifs, setTelegramNotifs] = useState(true);
  const [morningReminder, setMorningReminder] = useState(true);

  const sendTestBroadcast = () => {
    toast.info("Telegram notifications are delivered via your cohort channel.");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Minimal Profile Header Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="size-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white font-bold text-xl flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
            {studentName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-900 truncate">{studentName}</h1>
            <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">{studentEmail}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">{studentRollNo}</span>
              <span>·</span>
              <span>{studentDept}</span>
              <span>·</span>
              <span className="text-slate-400">{studentCollege}</span>
            </div>
          </div>
        </div>

        <div className="self-start sm:self-center shrink-0">
          <div className="px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1.5">
            <Shield className="size-3.5" />
            <span>{getBatchName(studentBatchId)} (Day {placementDay})</span>
          </div>
        </div>
      </div>

      {/* Minimal Summary Strip */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 text-center shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Talent Score
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600">
            {talentScore}
            <span className="text-xs text-slate-400 font-normal">/1000</span>
          </span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 text-center shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Assigned Tracks
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {activeTracks.length}
            <span className="text-xs text-slate-400 font-normal">/3</span>
          </span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 text-center shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Verified Labs
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
            {completedLabs.length}
          </span>
        </div>
      </div>

      {/* Assigned Technical Courses */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="size-4 text-indigo-600" />
              Assigned Technical Tracks
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Provisioned by your institutional administrator.
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            Admin Assigned
          </span>
        </div>

        {activeTracks.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
            No technical tracks assigned yet.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {activeTracks.map((trackId, index) => {
              const t = trackById(trackId);
              const isPrimary = index === 0;

              return (
                <div
                  key={t.id}
                  className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 space-y-2.5 transition-colors hover:border-indigo-300"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-slate-900">{t.name}</span>
                      <p className="text-[11px] text-slate-500">{t.domain}</p>
                    </div>
                    <span
                      className={cn(
                        "text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider",
                        isPrimary
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-slate-200 text-slate-700",
                      )}
                    >
                      {isPrimary ? "Primary Track" : "Track #2"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{t.tagline}</p>
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-mono text-slate-500">
                    <span>Lab: {t.labTitle}</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                      <CheckCircle2 className="size-3.5" /> Ready
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6-Pillar Readiness Model (Minimal Sliders) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="size-4 text-amber-500" />
            6-Pillar Readiness Breakdown
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Component weightages determining your overall Talent Score.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {PILLARS.map((p) => (
            <div
              key={p.key}
              className="bg-slate-50/60 border border-slate-200/60 rounded-xl p-3.5 space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">{p.label}</span>
                <span className="font-mono font-bold text-indigo-600">{readiness[p.key]}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={readiness[p.key]}
                onChange={async (e) => {
                  const val = Number(e.target.value);
                  if (liveStudentId) {
                    await updateLiveReadiness(liveStudentId, { [p.key]: val });
                    queryClient.invalidateQueries({
                      queryKey: ["live", "student-profile", store.supabaseSession?.user?.id],
                    });
                  }
                  store.setReadiness({ [p.key]: val });
                }}
                className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Minimal Notification Preferences */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Bell className="size-4 text-indigo-600" />
            Notifications & Broadcasts
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your daily 06:00 Placement Accelerator reminder preferences.
          </p>
        </div>

        <div className="space-y-2.5">
          <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200/70 bg-slate-50/40 hover:bg-slate-50 text-xs cursor-pointer transition-colors">
            <div>
              <p className="font-semibold text-slate-800">Telegram Daily Broadcast</p>
              <p className="text-slate-400">Receive 10m English + 10m Aptitude video links at 06:00</p>
            </div>
            <input
              type="checkbox"
              checked={telegramNotifs}
              onChange={(e) => setTelegramNotifs(e.target.checked)}
              className="size-4 accent-indigo-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200/70 bg-slate-50/40 hover:bg-slate-50 text-xs cursor-pointer transition-colors">
            <div>
              <p className="font-semibold text-slate-800">In-App Practice Reminder</p>
              <p className="text-slate-400">Alert when daily 10m guided practice opens</p>
            </div>
            <input
              type="checkbox"
              checked={morningReminder}
              onChange={(e) => setMorningReminder(e.target.checked)}
              className="size-4 accent-indigo-600 rounded"
            />
          </label>

          <button
            type="button"
            onClick={sendTestBroadcast}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
          >
            <Send className="size-3.5 text-indigo-600" />
            Send Test Notification
          </button>
        </div>
      </div>
    </div>
  );
}
