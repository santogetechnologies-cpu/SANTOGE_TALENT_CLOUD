import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Chip, PageHeader, Panel, Stat } from "@/components/kit";
import { useAppStore } from "@/lib/app-store";
import { TRACKS, DOMAINS, trackById } from "@/lib/tracks";
import { cn } from "@/lib/utils";
import {
  Check,
  Moon,
  RotateCcw,
  Sun,
  User,
  GraduationCap,
  Bell,
  Send,
  Shield,
  Layers,
  Sparkles,
  Info,
} from "lucide-react";

export const Route = createFileRoute("/student/settings")({
  head: () => ({
    meta: [
      { title: "Settings & Courses — SantoGe Talent Cloud" },
      {
        name: "description",
        content:
          "Choose up to three technical tracks, manage cohort identity, tune the readiness model and customize notifications.",
      },
      { property: "og:title", content: "Settings & Courses — SantoGe Talent Cloud" },
      {
        property: "og:description",
        content: "Pick your tracks, tune readiness weights and manage your workspace.",
      },
    ],
  }),
  component: SettingsPage,
});

const PILLARS = [
  {
    key: "T",
    label: "Technical Competency",
    desc: "Assessed via verified in-browser sandbox tests",
  },
  {
    key: "C",
    label: "Communication Skills",
    desc: "Assessed via AI 60s pitch & group discussion rubrics",
  },
  { key: "A", label: "Aptitude & Logic", desc: "Assessed via daily 10m speed-math drills" },
  {
    key: "E",
    label: "Professional English",
    desc: "Assessed via corporate vocabulary & email drills",
  },
  {
    key: "R",
    label: "ATS Resume Match",
    desc: "Assessed via keyword parsing against requisitions",
  },
  {
    key: "M",
    label: "AI Mock Interview",
    desc: "Assessed via STAR structured technical mock drills",
  },
] as const;

import { useQueryClient } from "@tanstack/react-query";
import {
  useLiveStudentProfile,
  useLiveStudentProgress,
  useLivePlatformSettings,
  updateLiveStudentTracks,
  updateLiveReadiness,
} from "@/lib/data";

function SettingsPage() {
  const store = useAppStore();
  const queryClient = useQueryClient();
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
  const { data: livePlatformSettings } = useLivePlatformSettings(isLive);

  const activeTracks: (typeof TRACKS)[number]["id"][] = isLive
    ? liveProfileData?.tracks || []
    : store.activeTracks;

  const talentScore = isLive ? (liveProfileData?.profile?.talent_score ?? 0) : store.talentScore;
  const completedLabs = isLive ? liveProgressData?.completedLabs || [] : store.completedLabs;
  const studentName = isLive
    ? liveProfileData?.profile?.name ||
      store.supabaseSession?.user?.email?.split("@")[0] ||
      "Student"
    : (store.student?.name ?? `${store.student?.firstName ?? "Student"}`);
  const studentEmail = isLive
    ? liveProfileData?.profile?.email || store.supabaseSession?.user?.email || ""
    : store.student?.email || "student@santoge.edu";
  const studentCollege = isLive
    ? liveProfileData?.profile?.college || "Not Assigned"
    : store.student?.college || "SantoGe Institute of Technology";
  const studentRollNo = isLive
    ? liveProfileData?.profile?.roll_no || "Not Assigned"
    : store.student?.rollNo || "2026-CSE-042";
  const studentDept = isLive
    ? liveProfileData?.profile?.dept || "Not Assigned"
    : store.student?.dept || "Computer Science";
  const studentBatchId = isLive
    ? liveProfileData?.profile?.batch_id || "Not Assigned"
    : store.student?.batchId || "BATCH-2026-ABC-CSE-01";
  const placementDay = isLive
    ? (liveProfileData?.profile?.placement_day ?? 1)
    : store.placementDay || 1;
  const readiness = isLive
    ? {
        T: liveProfileData?.profile?.readiness_t ?? 0,
        C: liveProfileData?.profile?.readiness_c ?? 0,
        A: liveProfileData?.profile?.readiness_a ?? 0,
        E: liveProfileData?.profile?.readiness_e ?? 0,
        R: liveProfileData?.profile?.readiness_r ?? 0,
        M: liveProfileData?.profile?.readiness_m ?? 0,
      }
    : store.readiness;
  const secondaryMinimum = isLive
    ? (livePlatformSettings?.secondaryMinimum ?? 50)
    : store.secondaryMinimum;

  const [domainFilter, setDomainFilter] = useState<string>("all");
  const [telegramNotifs, setTelegramNotifs] = useState(true);
  const [morningReminder, setMorningReminder] = useState(true);

  const toggleTrack = async (id: (typeof TRACKS)[number]["id"]) => {
    const has = activeTracks.includes(id);
    const next = has ? activeTracks.filter((t) => t !== id) : [...activeTracks, id];
    if (next.length < 1) {
      toast.error("You must maintain at least 1 enrolled course track.");
      return;
    }
    if (next.length > 3) {
      toast.error("Maximum 3 concurrent technical courses allowed per student.");
      return;
    }
    if (isLive && liveStudentId) {
      const res = await updateLiveStudentTracks(liveStudentId, next);
      if (!res.ok) {
        toast.error(res.error || "Failed to update tracks");
        return;
      }
      queryClient.invalidateQueries({
        queryKey: ["live", "student-profile", store.supabaseSession?.user?.id],
      });
    } else {
      store.setActiveTracks(next);
    }
    toast.success(has ? "Course track unenrolled" : "Course track enrolled successfully!");
  };

  const filteredTracks =
    domainFilter === "all" ? TRACKS : TRACKS.filter((t) => t.domain === domainFilter);

  const sendTestBroadcast = () => {
    toast.success("Telegram test broadcast simulated: '06:00 Daily Placement Accelerator ready!'");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings & Course Selection"
        subtitle="Manage your technical specializations, cohort batch identity, and personal workspace preferences."
        action={<Chip tone="purple">{activeTracks.length}/3 tracks enrolled</Chip>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Talent Score"
          value={`${talentScore}/1000`}
          accent="var(--brand-cyan)"
          hint="Composite readiness"
        />
        <Stat
          label="Enrolled Courses"
          value={`${activeTracks.length} / 3`}
          accent="var(--brand-purple)"
          hint="Technical tracks"
        />
        <Stat
          label="Verified Labs"
          value={completedLabs.length}
          accent="var(--brand-emerald)"
          hint="Passed sandbox drills"
        />
        <Stat
          label="Theme Mode"
          value={store.theme === "dark" ? "Dark Theme" : "Light Theme"}
          accent="var(--brand-amber)"
          hint="UI Appearance"
        />
      </div>

      {/* STUDENT & COHORT IDENTITY */}
      <Panel
        title="Student Profile & Placement Cohort Identity"
        subtitle="Batch-synchronized placement details provisioned by Platform Super Admin"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-line-soft bg-surface-soft p-3.5 space-y-1">
            <span className="text-[11px] font-semibold text-copy-subtle flex items-center gap-1.5">
              <User className="size-3.5 text-brand-cyan" /> Full Name
            </span>
            <p className="text-sm font-bold text-foreground">{studentName}</p>
            <p className="text-xs text-copy-subtle font-mono">{studentEmail}</p>
          </div>

          <div className="rounded-xl border border-line-soft bg-surface-soft p-3.5 space-y-1">
            <span className="text-[11px] font-semibold text-copy-subtle flex items-center gap-1.5">
              <GraduationCap className="size-3.5 text-brand-purple" /> Institution & Roll No
            </span>
            <p className="text-sm font-bold text-foreground">{studentCollege}</p>
            <p className="text-xs text-copy-subtle font-mono">
              {studentRollNo} · {studentDept}
            </p>
          </div>

          <div className="rounded-xl border border-line-soft bg-surface-soft p-3.5 space-y-1">
            <span className="text-[11px] font-semibold text-copy-subtle flex items-center gap-1.5">
              <Shield className="size-3.5 text-brand-emerald" /> Placement Accelerator Batch
            </span>
            <p className="text-sm font-bold text-foreground font-mono">{studentBatchId}</p>
            <p className="text-xs text-brand-emerald font-semibold">
              Day {placementDay} of 90 · Synchronized Cohort
            </p>
          </div>
        </div>
      </Panel>

      {/* COURSE SELECTION & SPECIALIZATIONS */}
      <Panel
        title="Technical Course Enrolment (1 to 3 Tracks)"
        subtitle="Individual, self-paced learning paths. The first selected track is your Primary Specialization for Dual Gate."
        action={
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setDomainFilter("all")}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors",
                domainFilter === "all"
                  ? "bg-brand-cyan text-surface-dark"
                  : "bg-surface-soft text-copy-subtle hover:text-foreground",
              )}
            >
              All (15)
            </button>
            {DOMAINS.map((d) => (
              <button
                key={d.id}
                onClick={() => setDomainFilter(d.id)}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors",
                  domainFilter === d.id
                    ? "bg-brand-cyan text-surface-dark"
                    : "bg-surface-soft text-copy-subtle hover:text-foreground",
                )}
              >
                {d.label}
              </button>
            ))}
          </div>
        }
      >
        <div className="mb-3 rounded-xl border border-brand-cyan/20 bg-brand-cyan/5 p-3 text-xs text-copy-subtle flex items-center gap-2">
          <Info className="size-4 text-brand-cyan shrink-0" />
          <span>
            <strong>Dual Gate Rule:</strong> Primary track requires 100% completion; secondary
            tracks require ≥ {secondaryMinimum}% completion before Phase 2 marketplace unlocks.
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTracks.map((t) => {
            const index = activeTracks.indexOf(t.id);
            const isEnrolled = index !== -1;
            const isPrimary = index === 0;

            return (
              <div
                key={t.id}
                className={cn(
                  "relative rounded-xl border p-4 transition-all flex flex-col justify-between",
                  isEnrolled
                    ? "border-brand-cyan/70 bg-surface-elevated shadow-md shadow-brand-cyan/5"
                    : "border-line-soft bg-surface-soft hover:border-line-strong",
                )}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="size-2.5 rounded-full shrink-0"
                        style={{ background: t.accent }}
                      />
                      <p className="text-sm font-bold text-foreground">{t.name}</p>
                    </div>
                    {isEnrolled && (
                      <Chip tone={isPrimary ? "cyan" : "purple"}>
                        {isPrimary ? "Primary (100%)" : `Track #${index + 1}`}
                      </Chip>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-copy-subtle">{t.tagline}</p>
                  <p className="mt-2 text-[11px] font-mono text-copy-subtle/80">
                    Lab: <span className="text-foreground font-semibold">{t.labTitle}</span>
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-line-soft/60 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-copy-subtle">{t.short}</span>
                  <button
                    onClick={() => toggleTrack(t.id)}
                    className={cn(
                      "rounded-lg px-3 py-1 text-xs font-bold transition-colors",
                      isEnrolled
                        ? "bg-brand-rose/10 text-brand-rose hover:bg-brand-rose/20"
                        : "bg-surface-elevated text-brand-cyan border border-line-soft hover:border-brand-cyan/60",
                    )}
                  >
                    {isEnrolled ? "Drop Course" : "Enrol Course +"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      {/* READINESS & NOTIFICATION SETTINGS */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="6-Pillar Readiness Model Simulator"
          subtitle="Adjust component scores to view real-time Talent Score recalculation"
        >
          <div className="space-y-4">
            {PILLARS.map((p) => (
              <div key={p.key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-foreground">{p.label}</span>
                    <span className="ml-1.5 text-[10px] text-copy-subtle">({p.desc})</span>
                  </div>
                  <span className="font-mono font-bold text-brand-cyan">{readiness[p.key]}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={readiness[p.key]}
                  onChange={async (e) => {
                    const val = Number(e.target.value);
                    if (isLive && liveStudentId) {
                      await updateLiveReadiness(liveStudentId, { [p.key]: val });
                      queryClient.invalidateQueries({
                        queryKey: ["live", "student-profile", store.supabaseSession?.user?.id],
                      });
                    } else {
                      store.setReadiness({ [p.key]: val });
                    }
                  }}
                  className="w-full accent-[var(--brand-cyan)]"
                />
              </div>
            ))}
          </div>
        </Panel>

        <div className="space-y-6">
          {/* Telegram & Broadcast Preferences */}
          <Panel
            title="Telegram Broadcast & Notifications"
            subtitle="Configure daily 06:00 Placement Accelerator alerts"
          >
            <div className="space-y-3">
              <label className="flex items-center justify-between rounded-xl border border-line-soft bg-surface-soft p-3 text-xs cursor-pointer">
                <div>
                  <p className="font-semibold text-foreground">Telegram Channel Daily Broadcast</p>
                  <p className="text-copy-subtle">
                    Receive 10m English + 10m Aptitude videos every morning at 06:00
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={telegramNotifs}
                  onChange={(e) => setTelegramNotifs(e.target.checked)}
                  className="size-4 accent-[var(--brand-cyan)]"
                />
              </label>

              <label className="flex items-center justify-between rounded-xl border border-line-soft bg-surface-soft p-3 text-xs cursor-pointer">
                <div>
                  <p className="font-semibold text-foreground">In-App Morning Reminder</p>
                  <p className="text-copy-subtle">Alert when the 10m Guided Practice unlocks</p>
                </div>
                <input
                  type="checkbox"
                  checked={morningReminder}
                  onChange={(e) => setMorningReminder(e.target.checked)}
                  className="size-4 accent-[var(--brand-cyan)]"
                />
              </label>

              <button
                onClick={sendTestBroadcast}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-line-soft bg-surface-soft py-2.5 text-xs font-bold text-brand-cyan hover:border-brand-cyan/60"
              >
                <Send className="size-3.5" /> Send Test Telegram Notification
              </button>
            </div>
          </Panel>

          {/* Workspace Appearance & Reset */}
          <Panel
            title="Workspace & Theme"
            subtitle="Appearance customization and demo progress management"
          >
            <div className="space-y-3">
              <button
                onClick={store.toggleTheme}
                className="flex w-full items-center justify-between rounded-xl border border-line-soft bg-surface-soft px-4 py-3 text-xs font-semibold text-foreground hover:border-brand-purple/60"
              >
                <span className="flex items-center gap-2">
                  {store.theme === "dark" ? (
                    <Sun className="size-4 text-brand-amber" />
                  ) : (
                    <Moon className="size-4 text-brand-purple" />
                  )}
                  Switch to {store.theme === "dark" ? "Light" : "Dark"} Theme
                </span>
                <span className="font-mono text-[11px] text-copy-subtle">
                  Currently: {store.theme.toUpperCase()}
                </span>
              </button>

              {!isLive && (
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to reset all demo progress and lab scores?",
                      )
                    ) {
                      store.resetProgress();
                      toast.success("Demo progress reset successfully");
                    }
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-rose/30 bg-brand-rose/5 px-4 py-3 text-xs font-bold text-brand-rose hover:bg-brand-rose/10"
                >
                  <RotateCcw className="size-4" /> Reset Demo Progress & Labs
                </button>
              )}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
