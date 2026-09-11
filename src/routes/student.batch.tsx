import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Chip, Meter, PageHeader, Panel, Stat } from "@/components/kit";
import { useAppStore } from "@/lib/app-store";
import { PLACEMENT_DAYS, placementDay } from "@/lib/curriculum";
import { getSupabaseClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { CalendarDays, CheckCircle2, ClipboardCheck, Megaphone, Send, Users } from "lucide-react";
import {
  useLiveStudentProfile,
  useLiveStudentProgress,
  completeLivePlacementDay,
  submitLiveAssessment,
  isUuid,
} from "@/lib/data";

export const Route = createFileRoute("/student/batch")({
  head: () => ({
    meta: [
      { title: "Placement Accelerator Batch — SantoGe Talent Cloud" },
      {
        name: "description",
        content:
          "Your batch cohort: Telegram channel, the synchronised 90-day English, aptitude and communication schedule, attendance and weekly assessments.",
      },
      { property: "og:title", content: "Placement Accelerator Batch — SantoGe Talent Cloud" },
      {
        property: "og:description",
        content:
          "Telegram cohort, 90-day synchronised schedule, attendance and weekly assessments.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BatchPage,
});

const CHANNELS = ["English", "Aptitude", "Communication", "Announcements", "Reminders"];

function BatchPage() {
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

  const batchId = liveProfileData?.profile?.batch_id || store.student?.batchId || "";

  // Fetch real batch details and enrolled count from Supabase
  const liveBatchQuery = useQuery({
    queryKey: ["live", "batches", batchId],
    queryFn: async () => {
      if (!batchId) return { batch: null, enrolled: 0 };
      const supabase = getSupabaseClient();
      if (!supabase) return { batch: null, enrolled: 0 };
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        batchId,
      );
      const batchPromise = isUuid
        ? supabase
            .from("batches")
            .select("id,name,capacity,dept,last_sync_at")
            .eq("id", batchId)
            .maybeSingle()
        : supabase
            .from("batches")
            .select("id,name,capacity,dept,last_sync_at")
            .eq("name", batchId)
            .maybeSingle();

      const countPromise = isUuid
        ? supabase
            .from("student_profiles")
            .select("id", { count: "exact", head: true })
            .eq("batch_id", batchId)
            .eq("status", "active")
        : Promise.resolve({ count: 0, error: null });

      const [bRes, cRes] = await Promise.all([batchPromise, countPromise]);
      if (bRes.error) throw new Error(bRes.error.message);
      return {
        batch: bRes.data,
        enrolled: cRes?.count || 0,
      };
    },
    enabled: !!batchId,
  });

  const batchName =
    liveBatchQuery.data?.batch?.name ||
    (batchId
      ? isUuid(batchId)
        ? liveBatchQuery.isLoading
          ? "Loading Cohort..."
          : "My Placement Cohort"
        : batchId
      : "Not Assigned");
  const batchCapacity = liveBatchQuery.data?.batch?.capacity ?? 300;
  const batchDept =
    liveBatchQuery.data?.batch?.dept || liveProfileData?.profile?.dept || "Engineering";
  const batchEnrolled = liveBatchQuery.data?.enrolled ?? 0;
  const lastSync = liveBatchQuery.data?.batch?.last_sync_at
    ? new Date(liveBatchQuery.data.batch.last_sync_at).toLocaleString("en-GB")
    : "Daily 06:00 broadcast";

  const placementDayNum = liveProfileData?.profile?.placement_day ?? store.placementDay ?? 1;
  const attendance = liveProgressData?.attendance ?? store.attendance;
  const assessments = liveProgressData?.assessments ?? store.assessments;

  const [selected, setSelected] = useState(placementDayNum);
  const day = placementDay(selected);
  const attendancePct = Math.round((attendance.length / 90) * 100);
  const assessmentDays = useMemo(() => PLACEMENT_DAYS.filter((d) => d.assessment), []);
  const attendedToday = attendance.includes(selected);
  const assessmentScore = assessments[String(selected)];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Placement Accelerator · Batch"
        subtitle="One cohort, one Telegram group, one synchronised 90-day placement journey — shared by every student in your batch."
        action={<Chip tone="purple">{batchName}</Chip>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Cohort day"
          value={`Day ${placementDayNum}/90`}
          hint="Same day for every batchmate"
        />
        <Stat
          label="Attendance"
          value={`${attendancePct}%`}
          tone="emerald"
          hint={`${attendance.length} of 90 days`}
        />
        <Stat
          label="Batch size"
          value={batchEnrolled}
          tone="purple"
          hint={`${batchDept} · capacity ${batchCapacity != null ? batchCapacity : "Not Available"}`}
        />
        <Stat
          label="Assessments taken"
          value={Object.keys(assessments).length}
          tone="amber"
          hint="Weekly + milestone"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Telegram cohort" subtitle="Delivery channel for the placement journey only">
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-3 text-xs font-mono text-foreground">
            <Send className="size-4 text-primary shrink-0" /> t.me/stc-
            {batchName.toLowerCase().replace(/\s+/g, "-")}
          </div>
          <div className="flex flex-wrap gap-2">
            {CHANNELS.map((c) => (
              <Chip key={c} tone="muted">
                {c}
              </Chip>
            ))}
          </div>
          <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <Megaphone className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
            Technical courses have no Telegram group — MERN, Cloud or AI/ML learning stays inside
            your own technical journey.
          </p>
          <p className="mt-2 text-[11px] text-muted-foreground font-mono">Last sync: {lastSync}</p>
        </Panel>

        <Panel title="Cohort composition" subtitle="Same placement batch, many technical paths">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <Users className="size-4 text-primary shrink-0" /> {batchEnrolled} students · one Placement
            Accelerator
          </div>
          <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-primary" />
              Same English, aptitude and communication schedule
            </li>
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-primary" />
              Same Telegram cohort and placement calendar
            </li>
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-primary" />
              Independent technical tracks per student (1–3 courses)
            </li>
          </ul>
          <div className="mt-4">
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Placement progress
            </p>
            <Meter value={attendancePct} tone="brand" />
          </div>
        </Panel>
      </div>

      <Panel
        title="90-day placement calendar"
        subtitle="Fixed for the whole batch · Friday = weekly assessment"
        action={<Chip tone="cyan">Week {day.week}</Chip>}
      >
        <div className="grid grid-cols-10 gap-1.5 sm:gap-2">
          {PLACEMENT_DAYS.map((d) => {
            const attended = attendance.includes(d.day);
            return (
              <button
                key={d.day}
                onClick={() => setSelected(d.day)}
                title={`Day ${d.day} · ${d.weekday}`}
                className={cn(
                  "aspect-square rounded-lg border text-[11px] font-bold transition-all flex items-center justify-center",
                  selected === d.day && "ring-2 ring-primary border-primary",
                  attended
                    ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                    : d.milestone
                      ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/40",
                )}
              >
                {d.day}
              </button>
            );
          })}
        </div>

        <div className="mt-5 rounded-xl border border-border bg-muted/20 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <CalendarDays className="size-4 text-primary" />
            <p className="text-sm font-semibold text-foreground">
              Day {day.day} · {day.weekday} · Week {day.week}
            </p>
            {day.milestone && <Chip tone="amber">{day.milestone}</Chip>}
          </div>
          <ul className="mt-3 space-y-2 text-xs text-foreground">
            <li className="rounded-lg border border-border bg-card px-3.5 py-2.5 shadow-xs font-medium">
              10m · {day.english}
            </li>
            <li className="rounded-lg border border-border bg-card px-3.5 py-2.5 shadow-xs font-medium">
              10m · {day.aptitude}
            </li>
            <li className="rounded-lg border border-border bg-card px-3.5 py-2.5 shadow-xs font-medium">
              10m · Guided practice · {day.practice}
            </li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <button
              onClick={async () => {
                if (liveStudentId) {
                  await completeLivePlacementDay(liveStudentId, day.day);
                  queryClient.invalidateQueries({
                    queryKey: ["live", "student-progress", liveStudentId],
                  });
                  queryClient.invalidateQueries({
                    queryKey: ["live", "student-profile", store.supabaseSession?.user?.id],
                  });
                }
                store.completePlacementDay(day.day);
              }}
              disabled={attendedToday}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-xs disabled:opacity-50 hover:bg-primary/90 transition-colors"
            >
              <CheckCircle2 className="size-3.5" />{" "}
              {attendedToday ? "Attendance recorded" : "Mark attendance"}
            </button>
            <a
              href="/student/accelerator"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-xs"
            >
              🚀 Launch 30m Accelerator Routine →
            </a>
            {day.assessment && (
              <button
                onClick={async () => {
                  const score = 60 + ((day.day * 7) % 35);
                  if (liveStudentId) {
                    await submitLiveAssessment(liveStudentId, day.day, score);
                    queryClient.invalidateQueries({
                      queryKey: ["live", "student-progress", liveStudentId],
                    });
                    queryClient.invalidateQueries({
                      queryKey: ["live", "student-profile", store.supabaseSession?.user?.id],
                    });
                  }
                  store.submitAssessment(day.day, score);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-xs"
              >
                <ClipboardCheck className="size-3.5 text-primary" />{" "}
                {assessmentScore ? `Assessment ${assessmentScore}%` : "Take assessment"}
              </button>
            )}
          </div>
        </div>
      </Panel>

      <Panel
        title="Assessment history"
        subtitle="Weekly Friday checks plus day 30 / 60 / 90 milestones"
      >
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {assessmentDays.map((d) => {
            const score = assessments[String(d.day)];
            return (
              <div
                key={d.day}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-3.5 py-2.5 text-xs shadow-xs"
              >
                <span className="text-foreground font-medium">
                  Day {d.day} {d.milestone ? `· ${d.milestone}` : "· Weekly"}
                </span>
                <span
                  className={cn("font-mono font-semibold", score ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground")}
                >
                  {score ? `${score}%` : "pending"}
                </span>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
