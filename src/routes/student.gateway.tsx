import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Chip, Console, Meter, PageHeader, Panel, Stat } from "@/components/kit";
import { useAppStore } from "@/lib/app-store";
import { TRACKS, trackById, type TrackId } from "@/lib/tracks";
import {
  FileText,
  ScanLine,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  Award,
  Mic,
  Briefcase,
  Building2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import {
  useLiveHiringDrives,
  useLiveStudentProfile,
  useLiveStudentProgress,
  useLivePlatformSettings,
  updateLiveReadiness,
  completeLiveMock,
  issueLiveCertificate,
} from "@/lib/data";
import { trackProgress } from "@/lib/curriculum";

export const Route = createFileRoute("/student/gateway")({
  head: () => ({
    meta: [
      { title: "Dual Completion Gate & Phase 2 — SantoGe Talent Cloud" },
      {
        name: "description",
        content:
          "Evaluate Dual Completion Gate (Technical + Placement), ATS resume scanner, mock interviews, certifications, and recruiter matching.",
      },
      { property: "og:title", content: "Dual Completion Gate & Phase 2 — SantoGe Talent Cloud" },
      {
        property: "og:description",
        content: "Dual completion gate, ATS scoring, mock interviews and recruiter matching.",
      },
    ],
  }),
  component: GatewayPage,
});

const KEYWORDS = [
  "React",
  "Node.js",
  "REST API",
  "SQL",
  "Docker",
  "Git",
  "Testing",
  "Agile",
  "TypeScript",
  "AWS",
];

interface RecruiterItem {
  company: string;
  track: TrackId;
  minScore: number;
  role: string;
  package: string;
}

function GatewayPage() {
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
  const { data: liveHiringDrives } = useLiveHiringDrives(true);
  const activeTracks: TrackId[] = useMemo(
    () => liveProfileData?.tracks || store.activeTracks,
    [liveProfileData?.tracks, store.activeTracks],
  );

  const talentScore = liveProfileData?.profile?.talent_score ?? store.talentScore;
  const attendance = liveProgressData?.attendance || store.attendance;
  const assessments = liveProgressData?.assessments || store.assessments;
  const certifications = liveProgressData?.certifications || store.certifications;
  const skills = liveProgressData?.skills || store.skills;

  const completionRule = livePlatformSettings?.completionRule ?? store.completionRule;
  const secondaryMinimum = livePlatformSettings?.secondaryMinimum ?? store.secondaryMinimum;

  const getTrackPct = (trackId: TrackId) => {
    return trackProgress(trackId, skills);
  };

  const recruitersList: RecruiterItem[] = useMemo(() => {
    if (liveHiringDrives && liveHiringDrives.length > 0) {
      return liveHiringDrives.map((d) => ({
        company: d.company,
        track: (activeTracks[0] || "mern") as TrackId,
        minScore: d.minScore,
        role: d.roles,
        package: d.ctc,
      }));
    }
    return [];
  }, [liveHiringDrives, activeTracks]);

  const [resume, setResume] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const [mockScore, setMockScore] = useState(82);

  const found = useMemo(
    () => KEYWORDS.filter((k) => resume.toLowerCase().includes(k.toLowerCase())),
    [resume],
  );
  const atsScore = Math.round((found.length / KEYWORDS.length) * 100);

  const scan = async () => {
    if (!resume.trim()) {
      toast.error("Please paste or type your resume content before scanning.");
      return;
    }
    const missing = KEYWORDS.filter((k) => !found.includes(k));
    setLog([
      `[ats] Parsed ${resume.split(/\s+/).length} tokens across experience blocks`,
      `[ats] Target keyword match: ${found.length}/${KEYWORDS.length} (${atsScore}%)`,
      missing.length
        ? `[ats] Missing keywords: ${missing.join(", ")}`
        : "[ats] 100% Target skill coverage achieved",
      atsScore >= 70
        ? "[ats] PASS — Profile forwarded to Employer Marketplace"
        : "[ats] REVIEW — Below 70% threshold",
    ]);
    if (liveStudentId) {
      await updateLiveReadiness(liveStudentId, { R: atsScore });
      queryClient.invalidateQueries({
        queryKey: ["live", "student-profile", store.supabaseSession?.user?.id],
      });
    }
    store.setReadiness({ R: atsScore });
    toast.success(`ATS Score updated to ${atsScore}%`);
  };

  const handleMock = async () => {
    if (liveStudentId) {
      await completeLiveMock(liveStudentId, "ai-interview-01", mockScore);
      queryClient.invalidateQueries({
        queryKey: ["live", "student-progress", liveStudentId],
      });
      queryClient.invalidateQueries({
        queryKey: ["live", "student-profile", store.supabaseSession?.user?.id],
      });
    }
    store.completeMock("ai-interview-01", mockScore);
    toast.success(`Mock interview scored (${mockScore}%) · Pillar M updated!`);
  };

  const handleIssueCert = async (trackName: string) => {
    const label = `SantoGe Certified · ${trackName}`;
    if (liveStudentId) {
      await issueLiveCertificate(liveStudentId, label);
      queryClient.invalidateQueries({
        queryKey: ["live", "student-progress", liveStudentId],
      });
      queryClient.invalidateQueries({
        queryKey: ["live", "student-profile", store.supabaseSession?.user?.id],
      });
    }
    store.issueCertificate(label);
    toast.success(`Certificate issued: ${label}`);
  };

  // Dual gate calculations
  const activeTrackDetails = activeTracks.map((id, index) => {
    const t = trackById(id);
    const pct = getTrackPct(id);
    const required = index === 0 ? 100 : completionRule === "all-tracks" ? 100 : secondaryMinimum;
    const passed = pct >= required;
    return { ...t, pct, required, passed, isPrimary: index === 0 };
  });

  const allTechPassed = activeTrackDetails.every((t) => t.passed);
  const placementAttendancePassed = attendance.length >= 90;
  const placementAssessmentPassed = (assessments["90"] ?? 0) >= 60;
  const placementPassed = placementAttendancePassed && placementAssessmentPassed;
  const dualGatePassed = allTechPassed && placementPassed;

  const eligibleCompaniesCount = recruitersList.filter(
    (r) => talentScore >= r.minScore && activeTracks.includes(r.track),
  ).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Dual Completion Gate & Phase 2"
        subtitle="STC evaluates two independent systems: your individual technical courses + batch placement accelerator."
        action={
          <Chip tone={dualGatePassed ? "emerald" : "amber"}>
            {dualGatePassed ? "Dual Gate Unlocked 🔓" : "Dual Gate In Progress 🔒"}
          </Chip>
        }
      />

      {/* Top Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Dual Gate Status"
          value={dualGatePassed ? "UNLOCKED" : "LOCKED"}
          tone={dualGatePassed ? "emerald" : "amber"}
          hint={dualGatePassed ? "Phase 2 Active" : "Satisfy both gates"}
        />
        <Stat
          label="Talent Score"
          value={`${talentScore}/1000`}
          tone="cyan"
          hint="Composite readiness"
        />
        <Stat
          label="ATS Coverage"
          value={`${atsScore}%`}
          tone="purple"
          hint={`${found.length}/${KEYWORDS.length} keywords`}
        />
        <Stat
          label="Matched Openings"
          value={eligibleCompaniesCount}
          tone="emerald"
          hint="Recruiter marketplace"
        />
      </div>

      {/* DUAL COMPLETION GATE EVALUATOR */}
      <Panel
        title="Dual Completion Gate Assessment"
        subtitle="Both conditions must be met independently before Phase 2 Recruiter Marketplace is unlocked"
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Gate 1: Technical Mastery */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                {allTechPassed ? (
                  <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Lock className="size-4 text-amber-500" />
                )}
                1. Technical Competency Gate
              </p>
              <Chip tone={allTechPassed ? "emerald" : "amber"}>
                {allTechPassed ? "Passed" : "Incomplete"}
              </Chip>
            </div>
            <p className="text-xs text-muted-foreground">
              Rule:{" "}
              {completionRule === "all-tracks"
                ? "All selected tracks ≥ 100%"
                : `Primary track 100% + secondary tracks ≥ ${secondaryMinimum}%`}
            </p>

            <div className="space-y-2.5 pt-1">
              {activeTrackDetails.map((t) => (
                <div
                  key={t.id}
                  className="rounded-lg border border-border bg-muted/20 p-3"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-foreground">
                      {t.name}{" "}
                      {t.isPrimary && (
                        <span className="text-[10px] text-primary font-medium">(Primary)</span>
                      )}
                    </span>
                    <span
                      className={cn(
                        "font-mono text-xs font-semibold",
                        t.passed ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400",
                      )}
                    >
                      {t.pct}% / {t.required}% req
                    </span>
                  </div>
                  <Meter value={t.pct} tone={t.passed ? "emerald" : "brand"} />
                </div>
              ))}
            </div>
          </div>

          {/* Gate 2: Placement Accelerator */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                {placementPassed ? (
                  <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Lock className="size-4 text-amber-500" />
                )}
                2. Placement Accelerator Gate
              </p>
              <Chip tone={placementPassed ? "emerald" : "amber"}>
                {placementPassed ? "Passed" : "Incomplete"}
              </Chip>
            </div>
            <p className="text-xs text-muted-foreground">
              Rule: 90/90 days batch cohort attendance + Day 90 Final Assessment ≥ 60%
            </p>

            <div className="space-y-2.5 pt-1">
              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-foreground">Cohort Attendance</span>
                  <span className="font-mono text-xs font-semibold text-primary">
                    {attendance.length} / 90 Days
                  </span>
                </div>
                <Meter
                  value={Math.round((attendance.length / 90) * 100)}
                  tone="brand"
                />
              </div>

              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-foreground">Day 90 Final Assessment</span>
                  <span
                    className={cn(
                      "font-mono text-xs font-semibold",
                      (assessments["90"] ?? 0) >= 60 ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground",
                    )}
                  >
                    {assessments["90"] ? `${assessments["90"]}% (Req ≥ 60%)` : "Pending Day 90"}
                  </span>
                </div>
                <Meter value={assessments["90"] ?? 0} tone="emerald" />
              </div>
            </div>
          </div>
        </div>
      </Panel>

      {/* PHASE 2 SUITE */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* ATS Resume Scanner */}
        <Panel title="ATS Resume Engine" subtitle="Real-time keyword coverage parser">
          <textarea
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            rows={8}
            placeholder="Paste your resume Markdown or plain text here to evaluate keyword matching against standard ATS filters..."
            className="w-full rounded-lg border border-border bg-card p-3 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
          />
          <div className="mt-3 flex items-center justify-between">
            <button
              onClick={scan}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
            >
              <ScanLine className="size-4" /> Run ATS Sweep
            </button>
            <span className="font-mono text-xs font-semibold text-primary">Score: {atsScore}%</span>
          </div>
          <div className="mt-3">
            <Console lines={log} empty="Run an ATS scan to see parser results." />
          </div>
        </Panel>

        {/* AI Mock Interviews & Certifications */}
        <div className="space-y-4">
          <Panel title="AI Mock Interviews" subtitle="Technical & behavioral readiness">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Simulate Interview Score:</span>
                <span className="font-mono font-bold text-primary">{mockScore}%</span>
              </div>
              <input
                type="range"
                min={50}
                max={100}
                value={mockScore}
                onChange={(e) => setMockScore(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <button
                onClick={handleMock}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card py-2.5 text-xs font-semibold text-foreground hover:bg-muted/50 transition-colors shadow-xs"
              >
                <Mic className="size-4 text-primary" /> Complete Mock Drill (+60 XP)
              </button>
            </div>
          </Panel>

          <Panel title="Verified Certifications" subtitle="Issue upon track milestone completion">
            <div className="space-y-2">
              {activeTracks.map((id) => {
                const t = trackById(id);
                const isIssued = certifications.some((c) => c.includes(t.name));
                return (
                  <div
                    key={id}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-3 shadow-xs"
                  >
                    <div>
                      <p className="text-xs font-semibold text-foreground">{t.name}</p>
                      <p className="text-[10px] text-muted-foreground">Verified Competency Credential</p>
                    </div>
                    {isIssued ? (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="size-3.5" /> Certified
                      </span>
                    ) : (
                      <button
                        onClick={() => handleIssueCert(t.name)}
                        className="rounded-md bg-muted/60 border border-border px-3 py-1 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                      >
                        <Award className="inline size-3.5 mr-1 text-primary" /> Issue
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>
      </div>

      {/* RECRUITER TALENT MARKETPLACE PREVIEW */}
      <Panel
        title="Recruiter Talent Marketplace"
        subtitle="Companies actively filtering STC candidates based on technical track, Talent Score, and verified projects"
        action={<Chip tone="emerald">{recruitersList.length} Requisitions Active</Chip>}
      >
        {recruitersList.length === 0 ? (
          <div className="rounded-xl border border-border bg-muted/10 p-8 text-center">
            <Building2 className="mx-auto size-8 text-muted-foreground/60 mb-2" />
            <p className="text-sm font-semibold text-foreground">
              No active recruiting requisitions available
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Company drives and requisition criteria will appear here once published by the
              recruitment team.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recruitersList.map((r) => {
              const isEligible = talentScore >= r.minScore && activeTracks.includes(r.track);
              const track = TRACKS.find((t) => t.id === r.track);
              return (
                <div
                  key={r.company}
                  className={cn(
                    "rounded-xl border p-4 transition-all bg-card shadow-xs",
                    isEligible
                      ? "border-emerald-500/40 bg-emerald-500/5"
                      : "border-border opacity-80",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                      <Building2 className="size-3.5 text-primary" /> {r.company}
                    </span>
                    <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {r.package}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground font-medium">{r.role}</p>
                  <div className="mt-3 flex items-center justify-between text-[11px]">
                    <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground border border-border font-medium">
                      {track?.short || r.track}
                    </span>
                    <span className="font-mono text-muted-foreground">Req: {r.minScore}+</span>
                  </div>
                  <div className="mt-3 border-t border-border pt-2 flex items-center justify-between text-xs">
                    <span
                      className={cn(
                        "font-semibold",
                        isEligible ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400",
                      )}
                    >
                      {isEligible ? "✓ Matched & Forwarded" : "Requires higher score"}
                    </span>
                    {isEligible && <Sparkles className="size-3.5 text-emerald-600 dark:text-emerald-400" />}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
}
