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
  CheckCircle2,
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

function SettingsPage() {
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

  const activeTracks: (typeof TRACKS)[number]["id"][] =
    liveProfileData?.tracks || store.activeTracks;

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
  const secondaryMinimum = livePlatformSettings?.secondaryMinimum ?? store.secondaryMinimum;

  const [telegramNotifs, setTelegramNotifs] = useState(true);
  const [morningReminder, setMorningReminder] = useState(true);

  const sendTestBroadcast = () => {
    toast.success("Telegram test broadcast simulated: '06:00 Daily Placement Accelerator ready!'");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Settings & Assigned Courses"
        subtitle="Review your Admin-assigned technical specializations, cohort batch identity, and workspace preferences."
        action={<Chip tone="cyan">{activeTracks.length} track{activeTracks.length !== 1 ? "s" : ""} assigned</Chip>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Talent Score"
          value={`${talentScore}/1000`}
          tone="brand"
          hint="Composite readiness"
        />
        <Stat
          label="Assigned Courses"
          value={`${activeTracks.length} / 3`}
          tone="purple"
          hint="Admin assigned"
        />
        <Stat
          label="Verified Labs"
          value={completedLabs.length}
          tone="emerald"
          hint="Passed sandbox drills"
        />
        <Stat
          label="Theme Mode"
          value={store.theme === "dark" ? "Dark Theme" : "Light Theme"}
          tone="amber"
          hint="UI Appearance"
        />
      </div>

      {/* STUDENT & COHORT IDENTITY */}
      <Panel
        title="Student Profile & Placement Cohort Identity"
        subtitle="Batch-synchronized placement details provisioned by Platform Super Admin"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-4 space-y-1.5 shadow-xs">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <User className="size-4 text-primary" /> Full Name
            </span>
            <p className="text-sm font-semibold text-foreground">{studentName}</p>
            <p className="text-xs text-muted-foreground font-mono">{studentEmail}</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 space-y-1.5 shadow-xs">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <GraduationCap className="size-4 text-primary" /> Institution & Roll No
            </span>
            <p className="text-sm font-semibold text-foreground">{studentCollege}</p>
            <p className="text-xs text-muted-foreground font-mono">
              {studentRollNo} · {studentDept}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 space-y-1.5 shadow-xs">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Shield className="size-4 text-emerald-600 dark:text-emerald-400" /> Placement Accelerator Batch
            </span>
            <p className="text-sm font-semibold text-foreground">{getBatchName(studentBatchId)}</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              Day {placementDay} of 90 · Synchronized Cohort
            </p>
          </div>
        </div>
      </Panel>

      {/* ASSIGNED TECHNICAL COURSES (ADMIN-ASSIGNED ONLY) */}
      <Panel
        title="Assigned Technical Courses"
        subtitle="Technical courses assigned by your Platform Admin. Course assignments are managed centrally and cannot be changed by students."
        action={<Chip tone="emerald">Admin Assigned</Chip>}
      >
        <div className="mb-4 rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-xs text-muted-foreground flex items-center gap-2.5">
          <Info className="size-4 text-primary shrink-0" />
          <span>
            <strong className="text-foreground">Dual Gate Rule:</strong> Primary track requires 100% completion; secondary
            tracks require ≥ {secondaryMinimum}% completion before Phase 2 marketplace unlocks.
          </span>
        </div>

        {activeTracks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center text-xs text-muted-foreground">
            No technical courses currently assigned. Course assignments are provisioned centrally by
            your institution administrator.
          </div>
        ) : (
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {activeTracks.map((trackId, index) => {
              const t = trackById(trackId);
              const isPrimary = index === 0;

              return (
                <div
                  key={t.id}
                  className="relative rounded-xl border border-border bg-card p-4 transition-all flex flex-col justify-between shadow-xs hover:border-primary/40"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="size-2.5 rounded-full shrink-0"
                          style={{ background: t.accent }}
                        />
                        <p className="text-sm font-semibold text-foreground">{t.name}</p>
                      </div>
                      <Chip tone={isPrimary ? "cyan" : "purple"}>
                        {isPrimary ? "Primary (100%)" : `Track #${index + 1}`}
                      </Chip>
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{t.tagline}</p>
                    <p className="mt-2.5 text-xs font-mono text-muted-foreground">
                      Lab: <span className="text-foreground font-semibold">{t.labTitle}</span>
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                    <span className="text-xs font-mono text-muted-foreground font-medium">{t.short}</span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="size-3.5" /> Assigned
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>

      {/* READINESS & NOTIFICATION SETTINGS */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="6-Pillar Readiness Model Simulator"
          subtitle="Adjust component scores to view real-time Talent Score recalculation"
        >
          <div className="space-y-4">
            {PILLARS.map((p) => (
              <div key={p.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-foreground">{p.label}</span>
                    <span className="ml-1.5 text-[11px] text-muted-foreground">({p.desc})</span>
                  </div>
                  <span className="font-mono font-bold text-primary">{readiness[p.key]}%</span>
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
                  className="w-full accent-primary"
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
              <label className="flex items-center justify-between rounded-xl border border-border bg-card p-3.5 text-xs cursor-pointer shadow-xs hover:bg-muted/30 transition-colors">
                <div>
                  <p className="font-semibold text-foreground">Telegram Channel Daily Broadcast</p>
                  <p className="text-muted-foreground">
                    Receive 10m English + 10m Aptitude videos every morning at 06:00
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={telegramNotifs}
                  onChange={(e) => setTelegramNotifs(e.target.checked)}
                  className="size-4 accent-primary rounded"
                />
              </label>

              <label className="flex items-center justify-between rounded-xl border border-border bg-card p-3.5 text-xs cursor-pointer shadow-xs hover:bg-muted/30 transition-colors">
                <div>
                  <p className="font-semibold text-foreground">In-App Morning Reminder</p>
                  <p className="text-muted-foreground">Alert when the 10m Guided Practice unlocks</p>
                </div>
                <input
                  type="checkbox"
                  checked={morningReminder}
                  onChange={(e) => setMorningReminder(e.target.checked)}
                  className="size-4 accent-primary rounded"
                />
              </label>

              <button
                onClick={sendTestBroadcast}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-xs"
              >
                <Send className="size-3.5 text-primary" /> Send Test Telegram Notification
              </button>
            </div>
          </Panel>

          {/* Workspace Appearance */}
          <Panel title="Workspace & Theme" subtitle="Appearance customization">
            <div className="space-y-3">
              <button
                onClick={store.toggleTheme}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-xs font-semibold text-foreground hover:bg-muted/40 transition-colors shadow-xs"
              >
                <span className="flex items-center gap-2">
                  {store.theme === "dark" ? (
                    <Sun className="size-4 text-amber-500" />
                  ) : (
                    <Moon className="size-4 text-indigo-500" />
                  )}
                  Switch to {store.theme === "dark" ? "Light" : "Dark"} Theme
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  Currently: {store.theme.toUpperCase()}
                </span>
              </button>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
