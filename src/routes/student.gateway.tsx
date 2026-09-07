import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Chip,
  Console,
  Meter,
  PageHeader,
  Panel,
  Stat,
} from "@/components/kit";
import { useAppStore } from "@/lib/app-store";
import { TRACKS, trackById } from "@/lib/tracks";
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

export const Route = createFileRoute("/student/gateway")({
  head: () => ({
    meta: [
      { title: "Dual Completion Gate & Phase 2 — SantoGe Talent Cloud" },
      { name: "description", content: "Evaluate Dual Completion Gate (Technical + Placement), ATS resume scanner, mock interviews, certifications, and recruiter matching." },
      { property: "og:title", content: "Dual Completion Gate & Phase 2 — SantoGe Talent Cloud" },
      { property: "og:description", content: "Dual completion gate, ATS scoring, mock interviews and recruiter matching." },
    ],
  }),
  component: GatewayPage,
});

const KEYWORDS = ["React", "Node.js", "REST API", "SQL", "Docker", "Git", "Testing", "Agile", "TypeScript", "AWS"];

const SAMPLE_RESUME = `Ajay Kumar — Full Stack & Cloud Developer
Summary: Passionate software engineer with hands-on experience building scalable web applications and microservices.
Skills: React, Node.js, REST API, TypeScript, SQL, Docker, AWS, Git, Agile, Automated Testing.
Projects:
1. E-Commerce Platform: Built REST API services with Node.js and Express; integrated MongoDB and Redis caching.
2. Cloud Infrastructure: Automated AWS EC2 and VPC provisioning using Terraform and Docker containers.
3. Interactive Analytics Dashboard: Developed React SPA with state management and real-time WebSocket charts.`;

const RECRUITERS = [
  { company: "TCS Digital", track: "mern", minScore: 650, role: "Full Stack Engineer", package: "₹8.5 LPA" },
  { company: "Infosys Wingspan", track: "cloud", minScore: 680, role: "Cloud & DevOps Associate", package: "₹9.2 LPA" },
  { company: "Wipro Turbo", track: "aiml", minScore: 700, role: "AI/ML Solutions Dev", package: "₹10.0 LPA" },
  { company: "Cognizant GenC Next", track: "java", minScore: 650, role: "Java Backend Engineer", package: "₹8.0 LPA" },
  { company: "Accenture Advanced", track: "cyber", minScore: 720, role: "Cybersecurity Analyst", package: "₹11.0 LPA" },
  { company: "Deloitte USI", track: "sap", minScore: 670, role: "SAP FICO Consultant", package: "₹9.5 LPA" },
];

function GatewayPage() {
  const store = useAppStore();
  const [resume, setResume] = useState(SAMPLE_RESUME);
  const [log, setLog] = useState<string[]>([]);
  const [mockScore, setMockScore] = useState(82);

  const found = useMemo(
    () => KEYWORDS.filter((k) => resume.toLowerCase().includes(k.toLowerCase())),
    [resume],
  );
  const atsScore = Math.round((found.length / KEYWORDS.length) * 100);

  const scan = () => {
    const missing = KEYWORDS.filter((k) => !found.includes(k));
    setLog([
      `[ats] Parsed ${resume.split(/\s+/).length} tokens across experience blocks`,
      `[ats] Target keyword match: ${found.length}/${KEYWORDS.length} (${atsScore}%)`,
      missing.length ? `[ats] Missing keywords: ${missing.join(", ")}` : "[ats] 100% Target skill coverage achieved",
      atsScore >= 70 ? "[ats] PASS — Profile forwarded to Employer Marketplace" : "[ats] REVIEW — Below 70% threshold",
    ]);
    store.setReadiness({ R: atsScore });
    toast.success(`ATS Score updated to ${atsScore}%`);
  };

  const handleMock = () => {
    store.completeMock("ai-interview-01", mockScore);
  };

  const handleIssueCert = (trackName: string) => {
    store.issueCertificate(`SantoGe Certified · ${trackName}`);
  };

  // Dual gate calculations
  const activeTrackDetails = store.activeTracks.map((id, index) => {
    const t = trackById(id);
    const pct = store.trackPercent(id);
    const required = index === 0 ? 100 : store.completionRule === "all-tracks" ? 100 : store.secondaryMinimum;
    const passed = pct >= required;
    return { ...t, pct, required, passed, isPrimary: index === 0 };
  });

  const allTechPassed = activeTrackDetails.every((t) => t.passed);
  const placementAttendancePassed = store.attendance.length >= 90;
  const placementAssessmentPassed = (store.assessments["90"] ?? 0) >= 60;
  const placementPassed = placementAttendancePassed && placementAssessmentPassed;
  const dualGatePassed = allTechPassed && placementPassed;

  return (
    <div className="space-y-6">
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
          accent={dualGatePassed ? "var(--brand-emerald)" : "var(--brand-amber)"}
          hint={dualGatePassed ? "Phase 2 Active" : "Satisfy both gates"}
        />
        <Stat label="Talent Score" value={`${store.talentScore}/1000`} accent="var(--brand-cyan)" hint="Composite readiness" />
        <Stat label="ATS Coverage" value={`${atsScore}%`} accent="var(--brand-purple)" hint={`${found.length}/${KEYWORDS.length} keywords`} />
        <Stat label="Matched Openings" value={store.eligibleCompanies} accent="var(--brand-emerald)" hint="Recruiter marketplace" />
      </div>

      {/* DUAL COMPLETION GATE EVALUATOR */}
      <Panel
        title="Dual Completion Gate Assessment"
        subtitle="Both conditions must be met independently before Phase 2 Recruiter Marketplace is unlocked"
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Gate 1: Technical Mastery */}
          <div className="rounded-xl border border-line-soft bg-surface-soft p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-foreground flex items-center gap-2">
                {allTechPassed ? <CheckCircle2 className="size-4 text-brand-emerald" /> : <Lock className="size-4 text-brand-amber" />}
                1. Technical Competency Gate
              </p>
              <Chip tone={allTechPassed ? "emerald" : "amber"}>
                {allTechPassed ? "Passed" : "Incomplete"}
              </Chip>
            </div>
            <p className="text-xs text-copy-subtle">
              Rule: {store.completionRule === "all-tracks" ? "All selected tracks ≥ 100%" : `Primary track 100% + secondary tracks ≥ ${store.secondaryMinimum}%`}
            </p>

            <div className="space-y-2.5 pt-1">
              {activeTrackDetails.map((t) => (
                <div key={t.id} className="rounded-lg border border-line-soft/80 bg-surface-dark/60 p-2.5">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-foreground">
                      {t.name} {t.isPrimary && <span className="text-[10px] text-brand-cyan">(Primary)</span>}
                    </span>
                    <span className={cn("font-mono text-[11px]", t.passed ? "text-brand-emerald" : "text-brand-amber")}>
                      {t.pct}% / {t.required}% req
                    </span>
                  </div>
                  <Meter value={t.pct} accent={t.accent} />
                </div>
              ))}
            </div>
          </div>

          {/* Gate 2: Placement Accelerator */}
          <div className="rounded-xl border border-line-soft bg-surface-soft p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-foreground flex items-center gap-2">
                {placementPassed ? <CheckCircle2 className="size-4 text-brand-emerald" /> : <Lock className="size-4 text-brand-amber" />}
                2. Placement Accelerator Gate
              </p>
              <Chip tone={placementPassed ? "emerald" : "amber"}>
                {placementPassed ? "Passed" : "Incomplete"}
              </Chip>
            </div>
            <p className="text-xs text-copy-subtle">
              Rule: 90/90 days batch cohort attendance + Day 90 Final Assessment ≥ 60%
            </p>

            <div className="space-y-2.5 pt-1">
              <div className="rounded-lg border border-line-soft/80 bg-surface-dark/60 p-2.5">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-foreground">Cohort Attendance</span>
                  <span className="font-mono text-[11px] text-brand-cyan">{store.attendance.length} / 90 Days</span>
                </div>
                <Meter value={Math.round((store.attendance.length / 90) * 100)} accent="var(--brand-purple)" />
              </div>

              <div className="rounded-lg border border-line-soft/80 bg-surface-dark/60 p-2.5">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-foreground">Day 90 Final Assessment</span>
                  <span className={cn("font-mono text-[11px]", (store.assessments["90"] ?? 0) >= 60 ? "text-brand-emerald" : "text-copy-subtle")}>
                    {store.assessments["90"] ? `${store.assessments["90"]}% (Req ≥ 60%)` : "Pending Day 90"}
                  </span>
                </div>
                <Meter value={store.assessments["90"] ?? 0} accent="var(--brand-emerald)" />
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
            rows={10}
            className="w-full rounded-xl border border-line-soft bg-surface-dark p-3 font-mono text-xs text-foreground outline-none focus:border-brand-cyan/60"
          />
          <div className="mt-3 flex items-center justify-between">
            <button
              onClick={scan}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple px-4 py-2 text-xs font-bold text-surface-dark"
            >
              <ScanLine className="size-4" /> Run ATS Sweep
            </button>
            <span className="font-mono text-xs text-brand-cyan">Score: {atsScore}%</span>
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
                <span className="text-copy-subtle">Simulate Interview Score:</span>
                <span className="font-mono font-bold text-brand-purple">{mockScore}%</span>
              </div>
              <input
                type="range"
                min={50}
                max={100}
                value={mockScore}
                onChange={(e) => setMockScore(Number(e.target.value))}
                className="w-full accent-[var(--brand-purple)]"
              />
              <button
                onClick={handleMock}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-line-soft bg-surface-soft py-2.5 text-xs font-bold text-foreground hover:border-brand-purple/60"
              >
                <Mic className="size-4 text-brand-purple" /> Complete Mock Drill (+60 XP)
              </button>
            </div>
          </Panel>

          <Panel title="Verified Certifications" subtitle="Issue upon track milestone completion">
            <div className="space-y-2">
              {store.activeTracks.map((id) => {
                const t = trackById(id);
                const isIssued = store.certifications.some((c) => c.includes(t.name));
                return (
                  <div key={id} className="flex items-center justify-between rounded-xl border border-line-soft bg-surface-soft p-3">
                    <div>
                      <p className="text-xs font-bold text-foreground">{t.name}</p>
                      <p className="text-[10px] text-copy-subtle">Verified Competency Credential</p>
                    </div>
                    {isIssued ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-brand-emerald">
                        <CheckCircle2 className="size-3.5" /> Certified
                      </span>
                    ) : (
                      <button
                        onClick={() => handleIssueCert(t.name)}
                        className="rounded-lg bg-surface-elevated border border-line-soft px-3 py-1 text-[11px] font-bold text-brand-cyan hover:border-brand-cyan/60"
                      >
                        <Award className="inline size-3 mr-1" /> Issue
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
        action={<Chip tone="emerald">{RECRUITERS.length} Requisitions Active</Chip>}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {RECRUITERS.map((r) => {
            const isEligible = store.talentScore >= r.minScore && store.activeTracks.includes(r.track as any);
            const track = TRACKS.find((t) => t.id === r.track);
            return (
              <div
                key={r.company}
                className={cn(
                  "rounded-xl border p-3.5 transition-all",
                  isEligible
                    ? "border-brand-emerald/50 bg-brand-emerald/5 shadow-md shadow-brand-emerald/5"
                    : "border-line-soft bg-surface-soft opacity-80"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <Building2 className="size-3.5 text-brand-cyan" /> {r.company}
                  </span>
                  <span className="font-mono text-xs font-bold text-brand-emerald">{r.package}</span>
                </div>
                <p className="mt-1 text-xs font-semibold text-copy-subtle">{r.role}</p>
                <div className="mt-2.5 flex items-center justify-between text-[11px]">
                  <span className="rounded bg-surface-elevated px-1.5 py-0.5 font-mono text-[10px] text-copy-subtle">
                    {track?.short || r.track}
                  </span>
                  <span className="font-mono text-copy-subtle">Req: {r.minScore}+</span>
                </div>
                <div className="mt-3 border-t border-line-soft/60 pt-2 flex items-center justify-between text-[11px]">
                  <span className={cn("font-semibold", isEligible ? "text-brand-emerald" : "text-brand-amber")}>
                    {isEligible ? "✓ Matched & Forwarded" : "Requires higher score"}
                  </span>
                  {isEligible && <Sparkles className="size-3 text-brand-emerald" />}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
