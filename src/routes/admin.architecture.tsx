import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Chip, PageHeader, Panel } from "@/components/kit";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Database,
  GitBranch,
  Layers,
  Workflow,
  Sparkles,
  Users,
  Code2,
  Lock,
  Building2,
  CheckCircle2,
  Bot,
  Activity,
  Server,
  ArrowDown,
  Clock,
  Terminal,
  FileCheck,
  Send,
} from "lucide-react";

export const Route = createFileRoute("/admin/architecture")({
  head: () => ({
    meta: [
      { title: "Master Architecture & 5 Flowcharts Hub — SantoGe Talent Cloud" },
      { name: "description", content: "Master operating architecture: Master Process Flow, Daily Twin 30m Workflow, Swimlanes, Automation Engine, and DFD Level 1." },
      { property: "og:title", content: "Master Architecture & Flowcharts Hub — SantoGe Talent Cloud" },
      { property: "og:description", content: "Master operating architecture: 5 Flowcharts & DFD Hub." },
    ],
  }),
  component: ArchitecturePage,
});

const TABS = [
  { id: "process", label: "1. Master Process Flow (7-Steps)", icon: Workflow },
  { id: "cadence", label: "2. Daily Twin 30m Workflow", icon: Layers },
  { id: "swimlanes", label: "3. Admin & Student Swimlanes", icon: GitBranch },
  { id: "automation", label: "4. Daily Automation Engine Flow", icon: Bot },
  { id: "dfd", label: "5. Data Flow Diagram (DFD L1)", icon: Database },
  { id: "gate", label: "Dual Completion Gate Rule", icon: Lock },
] as const;

function ArchitecturePage() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("process");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Master Architecture & 5 Flowcharts Hub"
        subtitle="The definitive SantoGe Talent Cloud operating architecture — separating cohort placement from individual technical learning."
        action={<Chip tone="purple">STC Master Model</Chip>}
      />

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors",
              tab === t.id
                ? "border-brand-cyan/60 bg-surface-soft text-foreground shadow-sm"
                : "border-line-soft text-copy-subtle hover:text-foreground",
            )}
          >
            <t.icon className="size-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {/* Governing Rule Banner */}
      <div className="rounded-2xl border border-brand-cyan/40 bg-gradient-to-r from-brand-cyan/10 via-surface-elevated to-brand-purple/10 p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-cyan">The Core Governing Rule</p>
        <p className="mt-1 text-base font-bold text-foreground">
          "A Batch is a Placement Accelerator cohort (English, Aptitude, Telegram, 90-Day Calendar). It is NOT a Technical Learning cohort."
        </p>
        <p className="mt-1.5 text-xs text-copy-subtle leading-relaxed">
          Students share one common 90-day placement journey, but each student runs an individual, self-paced learning path across 1 to 3 assigned technical disciplines from 15 available tracks.
        </p>
      </div>

      {/* DIAGRAM 1: Master 7-Step Process Flow */}
      {tab === "process" && (
        <Panel title="Diagram 1: Master 7-Step Process Flow" subtitle="From Institutional Onboarding to Recruiter Digital Offers">
          <div className="space-y-3">
            {[
              {
                step: "Stage 0.1",
                title: "College Onboarding & MoU",
                desc: "Institutional partner signs MoU and submits verified student list for batch sizing (100–300 learners).",
                tone: "cyan",
              },
              {
                step: "Stage 0.2",
                title: "Bulk CSV Provisioning",
                desc: "Platform Admin uploads validated CSV with columns student_name, email, password, roll_no, dept, course_1, course_2, course_3, batch_id.",
                tone: "purple",
              },
              {
                step: "Stage 0.3",
                title: "Instant Auto-Enrolment (No Pre-Test)",
                desc: "Logins are auto-provisioned with 1–3 pre-assigned courses. No gatekeeper screening tests needed.",
                tone: "emerald",
              },
              {
                step: "Phase 1",
                title: "Days 1 to 90 — Daily Twin 30-Minute Routine",
                desc: "Engine 1 (Placement Accelerator 30m via Telegram + guided practice) + Engine 2 (Technical ITSE 30m in-browser sandboxes).",
                tone: "amber",
              },
              {
                step: "Gate",
                title: "Dual-Track 100% Completion Gate",
                desc: "Strict verification: 100% placement attendance/assessment + 100% technical mastery on assigned tracks.",
                tone: "rose",
              },
              {
                step: "Phase 2",
                title: "Post-90 Days — Assessment, AI Mocks & Certifications",
                desc: "Automated ATS Resume Builder, 1:1 Industry Video Mocks, STAR panel feedback, and verifiable certifications.",
                tone: "purple",
              },
              {
                step: "Hiring",
                title: "Recruiter Marketplace & Digital Offers",
                desc: "Talent Score (0–1000) unlocks tier-gated enterprise campus drives, direct interviews, and job offer letters.",
                tone: "emerald",
              },
            ].map((s, idx) => (
              <div key={s.step} className="flex items-start gap-3.5 rounded-xl border border-line-soft bg-surface-soft p-4 transition-all hover:border-brand-cyan/40">
                <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-surface-dark font-mono text-xs font-bold text-brand-cyan border border-line-soft">
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-brand-cyan">{s.step}</span>
                    <span className="text-xs font-bold text-foreground">· {s.title}</span>
                  </div>
                  <p className="mt-1 text-xs text-copy-subtle leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* DIAGRAM 2: Daily Twin 30m Execution Workflow */}
      {tab === "cadence" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel
            title="Engine 1: Technical Self-Study Engine (ITSE)"
            subtitle="30 Mins Daily · 100% In-Browser Practical Sandboxes (Zero Videos)"
          >
            <div className="space-y-3 text-xs">
              <div className="rounded-xl border border-brand-cyan/30 bg-surface-soft p-3.5">
                <span className="font-bold text-brand-cyan">1. Concept Card (5 Mins)</span>
                <p className="mt-1 text-copy-subtle">
                  Interactive architectural breakdown, syntax patterns, and design contracts.
                </p>
              </div>
              <div className="rounded-xl border border-brand-cyan/30 bg-surface-soft p-3.5">
                <span className="font-bold text-brand-cyan">2. In-Browser Practical Sandbox (15 Mins)</span>
                <p className="mt-1 text-copy-subtle">
                  Live code editors, JUnit test suites, Kubernetes replicas, Nmap scanner, or Cypress test runners (+50 XP).
                </p>
              </div>
              <div className="rounded-xl border border-brand-cyan/30 bg-surface-soft p-3.5">
                <span className="font-bold text-brand-cyan">3. Practical Debug Mini-Assignment (10 Mins)</span>
                <p className="mt-1 text-copy-subtle">
                  Live breakpoint troubleshooting, error simulation, and competency evidence logging.
                </p>
              </div>
            </div>
          </Panel>

          <Panel
            title="Engine 2: 90-Day Placement Accelerator"
            subtitle="30 Mins Daily · Synchronized Cohort (100–300 Students)"
          >
            <div className="space-y-3 text-xs">
              <div className="rounded-xl border border-brand-purple/30 bg-surface-soft p-3.5">
                <span className="font-bold text-brand-purple">1. English &amp; Communication Video (10 Mins)</span>
                <p className="mt-1 text-copy-subtle">
                  Broadcast via Telegram at 06:00 IST — corporate email etiquette, pronunciation, and fluency drills.
                </p>
              </div>
              <div className="rounded-xl border border-brand-purple/30 bg-surface-soft p-3.5">
                <span className="font-bold text-brand-purple">2. Aptitude &amp; Reasoning Video (10 Mins)</span>
                <p className="mt-1 text-copy-subtle">
                  Broadcast via Telegram at 06:00 IST — speed math shortcuts, quant formulas, and logic puzzles.
                </p>
              </div>
              <div className="rounded-xl border border-brand-purple/30 bg-surface-soft p-3.5">
                <span className="font-bold text-brand-purple">3. In-App Guided Practice (10 Mins)</span>
                <p className="mt-1 text-copy-subtle">
                  5 MCQs + 2 Logical Puzzles + 60s AI Voice Pitch Recorder with live speech analysis.
                </p>
              </div>
            </div>
          </Panel>
        </div>
      )}

      {/* DIAGRAM 3: Platform Super Admin & Student Swimlanes */}
      {tab === "swimlanes" && (
        <Panel title="Diagram 3: Platform Super Admin & Student Swimlanes" subtitle="Role responsibility separation matrix">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-brand-purple/40 bg-surface-soft p-4 space-y-3">
              <div className="flex items-center gap-2 text-brand-purple font-bold text-sm">
                <Users className="size-4" /> Platform Super Admin Swimlane
              </div>
              <ul className="space-y-2 text-xs text-copy-subtle">
                <li className="rounded-lg bg-surface-elevated p-2.5 border border-line-soft">
                  <span className="font-semibold text-foreground">1. Institutional Onboarding:</span> Accepts college requests and verifies 100–300 batch sizing.
                </li>
                <li className="rounded-lg bg-surface-elevated p-2.5 border border-line-soft">
                  <span className="font-semibold text-foreground">2. Bulk CSV Provisioning:</span> Uploads student roster, pre-assigns 1–3 courses, issues instant credentials.
                </li>
                <li className="rounded-lg bg-surface-elevated p-2.5 border border-line-soft">
                  <span className="font-semibold text-foreground">3. Telegram Sync &amp; Broadcast:</span> Connects batch Telegram bot and monitors 06:00 cron delivery.
                </li>
                <li className="rounded-lg bg-surface-elevated p-2.5 border border-line-soft">
                  <span className="font-semibold text-foreground">4. Governance &amp; Dual Gate Rules:</span> Sets completion rules, secondary min %, and scoring weights.
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-brand-cyan/40 bg-surface-soft p-4 space-y-3">
              <div className="flex items-center gap-2 text-brand-cyan font-bold text-sm">
                <Code2 className="size-4" /> Student (e.g. Ajay) Swimlane
              </div>
              <ul className="space-y-2 text-xs text-copy-subtle">
                <li className="rounded-lg bg-surface-elevated p-2.5 border border-line-soft">
                  <span className="font-semibold text-foreground">1. Credentials Sign-in:</span> Logs in with college-issued credentials (no pre-test required).
                </li>
                <li className="rounded-lg bg-surface-elevated p-2.5 border border-line-soft">
                  <span className="font-semibold text-foreground">2. Daily Twin 30m Execution:</span> Completes morning Placement Accelerator + technical sandbox tasks.
                </li>
                <li className="rounded-lg bg-surface-elevated p-2.5 border border-line-soft">
                  <span className="font-semibold text-foreground">3. Dual Gate Clearance:</span> Achieves 90-day attendance + technical competency across assigned tracks.
                </li>
                <li className="rounded-lg bg-surface-elevated p-2.5 border border-line-soft">
                  <span className="font-semibold text-foreground">4. Phase 2 Career Gateway:</span> Builds ATS resume, takes AI mocks, applies to recruiter marketplace.
                </li>
              </ul>
            </div>
          </div>
        </Panel>
      )}

      {/* DIAGRAM 4: Daily Automation Engine & Scoring Flowchart */}
      {tab === "automation" && (
        <Panel title="Diagram 4: Daily Automation Engine & Scoring Flowchart" subtitle="Cron pipeline execution flow from 06:00 to 20:00 IST">
          <div className="space-y-3">
            {[
              { time: "06:00 IST", title: "Morning Placement Broadcast Cron", desc: "Triggers Telegram Bot API to dispatch 10m English + 10m Aptitude video links to all 54 batch channels." },
              { time: "06:05 IST", title: "In-App Guided Practice Unlock", desc: "Unlocks 5 MCQs, 2 puzzles, and 60s voice pitch analyzer for the current day." },
              { time: "06:15 IST", title: "Technical Sandbox Containers Warmer", desc: "Initializes in-browser simulators and code runners for all 15 technical disciplines." },
              { time: "Every 15m", title: "Talent Score Dynamic Recalculation", desc: "Computes formula (T·25% + C·20% + A·15% + E·15% + R·15% + M·10%) and updates cohort leaderboard." },
              { time: "Every 4h", title: "ATS Portfolio Parser Sweep", desc: "Extracts completed sandbox project milestones into students' automated ATS resume drafts." },
              { time: "20:00 IST", title: "Streak & Digest Mailer", desc: "Verifies daily completion, increments streaks, and dispatches evening performance summary." },
            ].map((cron, i) => (
              <div key={cron.time} className="flex items-start gap-3 rounded-xl border border-line-soft bg-surface-soft p-3.5">
                <span className="rounded-lg bg-brand-amber/10 border border-brand-amber/30 px-2.5 py-1 font-mono text-[11px] font-bold text-brand-amber shrink-0">
                  {cron.time}
                </span>
                <div>
                  <p className="text-xs font-bold text-foreground">{cron.title}</p>
                  <p className="mt-0.5 text-xs text-copy-subtle">{cron.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* DIAGRAM 5: Data Flow Diagram (DFD Level 1) */}
      {tab === "dfd" && (
        <Panel title="Diagram 5: Data Flow Diagram (DFD Level 1)" subtitle="Entities, core processes (1.0, 2.0, 3.0), and data stores (D1–D4)">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-line-soft bg-surface-soft p-4 text-xs space-y-2">
              <p className="font-bold text-brand-cyan flex items-center gap-1.5">
                <Users className="size-4" /> External Entities
              </p>
              <ul className="space-y-1.5 text-copy-subtle">
                <li><span className="font-semibold text-foreground">Student Learner (Ajay):</span> Credentials, daily submissions, sandbox code, voice pitch.</li>
                <li><span className="font-semibold text-foreground">Platform Super Admin:</span> Bulk CSV, batch sizing, Telegram sync, gate rules.</li>
                <li><span className="font-semibold text-foreground">Enterprise Recruiter:</span> Hiring requisitions, shortlist criteria, offer letters.</li>
              </ul>
            </div>

            <div className="rounded-xl border border-line-soft bg-surface-soft p-4 text-xs space-y-2">
              <p className="font-bold text-brand-purple flex items-center gap-1.5">
                <Workflow className="size-4" /> Central Processes
              </p>
              <ul className="space-y-1.5 text-copy-subtle">
                <li><span className="font-semibold text-foreground">1.0 CSV Ingestion &amp; Provisioning:</span> Validates schema &amp; issues logins.</li>
                <li><span className="font-semibold text-foreground">2.0 Daily Twin Execution Engine:</span> Orchestrates ITSE sandboxes &amp; Placement broadcasts.</li>
                <li><span className="font-semibold text-foreground">3.0 Dual Gate &amp; Marketplace Engine:</span> Evaluates 100% completion &amp; matches requisitions.</li>
              </ul>
            </div>

            <div className="rounded-xl border border-line-soft bg-surface-soft p-4 text-xs space-y-2">
              <p className="font-bold text-brand-emerald flex items-center gap-1.5">
                <Database className="size-4" /> Data Stores (D1–D4)
              </p>
              <ul className="space-y-1.5 text-copy-subtle">
                <li><span className="font-mono text-brand-emerald">D1:</span> Student &amp; Batch Cohort DB</li>
                <li><span className="font-mono text-brand-emerald">D2:</span> Technical Sandboxes &amp; Skills DB</li>
                <li><span className="font-mono text-brand-emerald">D3:</span> Placement Accelerator &amp; Scoring DB</li>
                <li><span className="font-mono text-brand-emerald">D4:</span> Recruiter Hiring Requisitions DB</li>
              </ul>
            </div>
          </div>
        </Panel>
      )}

      {/* DUAL COMPLETION GATE RULES */}
      {tab === "gate" && (
        <Panel title="Dual Completion Gate Business Rules" subtitle="Phase 1 (Days 1–90) to Phase 2 Transition Logic">
          <div className="rounded-xl border border-line-soft bg-surface-soft p-4 space-y-3 text-xs text-copy-subtle">
            <p className="font-bold text-foreground text-sm">Strict Dual Gate Unlock Criteria:</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-brand-cyan/40 bg-surface-dark p-3">
                <p className="font-bold text-brand-cyan">Gate 1: Technical Mastery</p>
                <p className="mt-1">
                  100% verified completion on Primary technical track + satisfactory minimum threshold ({store.secondaryMinimum}%) on secondary assigned tracks.
                </p>
              </div>
              <div className="rounded-lg border border-brand-purple/40 bg-surface-dark p-3">
                <p className="font-bold text-brand-purple">Gate 2: Placement Program</p>
                <p className="mt-1">
                  90-day synchronized cohort attendance + Day 90 final placement assessment score ≥ 60%.
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-brand-emerald/40 bg-brand-emerald/10 p-3 text-foreground font-medium">
              Phase 2 Unlocks: Automated ATS Resume Builder, 1:1 Industry Video Mocks, STAR Scorecards, Verifiable Skill Certifications, and Recruiter Marketplace.
            </div>
          </div>
        </Panel>
      )}
    </div>
  );
}

