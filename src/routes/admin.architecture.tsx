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
} from "lucide-react";

export const Route = createFileRoute("/admin/architecture")({
  head: () => ({
    meta: [
      { title: "Master Architecture & Flow — SantoGe Talent Cloud" },
      { name: "description", content: "Master operating architecture, dual-track journey, institutional CSV flow, dual completion gate, and recruiter matching." },
      { property: "og:title", content: "Master Architecture & Flow — SantoGe Talent Cloud" },
      { property: "og:description", content: "Dual-track journey, institutional CSV flow, dual completion gate, and recruiter matching." },
    ],
  }),
  component: ArchitecturePage,
});

const TABS = [
  { id: "principle", label: "Core Principle & Dual Flow", icon: Workflow },
  { id: "csv", label: "Stage 0: CSV Flow", icon: Database },
  { id: "cadence", label: "Twin 30m Cadence", icon: Layers },
  { id: "gate", label: "Dual Completion Gate", icon: Lock },
  { id: "swimlanes", label: "Swimlanes", icon: GitBranch },
] as const;

function ArchitecturePage() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("principle");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Master Architecture & Flow Specification"
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
                ? "border-brand-cyan/60 bg-surface-soft text-foreground"
                : "border-line-soft text-copy-subtle hover:text-foreground",
            )}
          >
            <t.icon className="size-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Core Operating Principle */}
      {tab === "principle" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-brand-cyan/40 bg-gradient-to-r from-brand-cyan/10 via-surface-elevated to-brand-purple/10 p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-cyan">The Single Governing Rule</p>
            <p className="mt-1.5 text-lg font-bold text-foreground">
              "A Batch is a Placement Accelerator cohort. It is NOT a Technical Learning cohort."
            </p>
            <p className="mt-2 text-xs text-copy-subtle leading-relaxed">
              SantoGe Talent Cloud groups students together for placement preparation (English, Aptitude, Communication, and Telegram cohort), but never forces them into the same technical learning path. A 300-student batch shares one Placement Accelerator, while simultaneously representing hundreds of individualized technical learning paths across 15 technical disciplines.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Technical Journey Column */}
            <Panel title="Individual Technical Journey" subtitle="ITSE Engine · Self-Paced & Flexible">
              <ul className="space-y-2.5 text-xs text-foreground">
                <li className="flex items-start gap-2.5 rounded-xl border border-line-soft bg-surface-soft p-3">
                  <Code2 className="size-4 shrink-0 text-brand-cyan mt-0.5" />
                  <div>
                    <span className="font-bold text-brand-cyan">1 to 3 Selected Courses:</span> Learner picks up to 3 specialized tracks (e.g. MERN, AI/ML, Cloud) from 15 available tracks.
                  </div>
                </li>
                <li className="flex items-start gap-2.5 rounded-xl border border-line-soft bg-surface-soft p-3">
                  <Sparkles className="size-4 shrink-0 text-brand-cyan mt-0.5" />
                  <div>
                    <span className="font-bold text-brand-cyan">Self-Paced Progression:</span> Progress does not depend on batchmates. No common technical class.
                  </div>
                </li>
                <li className="flex items-start gap-2.5 rounded-xl border border-line-soft bg-surface-soft p-3">
                  <CheckCircle2 className="size-4 shrink-0 text-brand-cyan mt-0.5" />
                  <div>
                    <span className="font-bold text-brand-cyan">Practical Evidence:</span> Interactive sandboxes, test runners, and micro-skill competencies validate mastery.
                  </div>
                </li>
              </ul>
            </Panel>

            {/* Placement Journey Column */}
            <Panel title="Batch Placement Accelerator" subtitle="Telegram Cohort · Synchronized 90-Day">
              <ul className="space-y-2.5 text-xs text-foreground">
                <li className="flex items-start gap-2.5 rounded-xl border border-line-soft bg-surface-soft p-3">
                  <Users className="size-4 shrink-0 text-brand-purple mt-0.5" />
                  <div>
                    <span className="font-bold text-brand-purple">One Batch Cohort (100–300):</span> Entire college cohort follows identical 90-day placement schedule.
                  </div>
                </li>
                <li className="flex items-start gap-2.5 rounded-xl border border-line-soft bg-surface-soft p-3">
                  <Sparkles className="size-4 shrink-0 text-brand-purple mt-0.5" />
                  <div>
                    <span className="font-bold text-brand-purple">Dedicated Telegram Group:</span> Morning English, Aptitude, and Communication broadcasts.
                  </div>
                </li>
                <li className="flex items-start gap-2.5 rounded-xl border border-line-soft bg-surface-soft p-3">
                  <CheckCircle2 className="size-4 shrink-0 text-brand-purple mt-0.5" />
                  <div>
                    <span className="font-bold text-brand-purple">Cohort Leaderboards:</span> Weekly assessments, attendance, and communication ranks.
                  </div>
                </li>
              </ul>
            </Panel>
          </div>
        </div>
      )}

      {/* Tab 2: Stage 0 CSV Flow */}
      {tab === "csv" && (
        <Panel title="Stage 0 — Institutional Onboarding & CSV Flow" subtitle="End-to-end ingestion pipeline">
          <div className="space-y-3">
            {[
              { step: "1. Institution Upload", desc: "Partner college uploads roster CSV with 100–300 students containing student_name, email, roll_no, dept, course_1, course_2, course_3." },
              { step: "2. Schema & Course Validation", desc: "System verifies student credentials, prevents duplicates, and validates course preferences against 15 active tracks." },
              { step: "3. Single Placement Batch Creation", desc: "A unified Placement Accelerator batch (e.g. BATCH-2026-ABC-CSE-01) is created for all 300 students." },
              { step: "4. Telegram Cohort Sync", desc: "The batch is linked to one common Telegram channel for daily placement broadcasts and reminders." },
              { step: "5. Individual Technical Assignment", desc: "Each student account is provisioned with their personalized 1–3 technical tracks in their individual ITSE sandbox." },
            ].map((s, i) => (
              <div key={s.step} className="flex items-start gap-3 rounded-xl border border-line-soft bg-surface-soft p-3.5">
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-brand-cyan to-brand-purple font-mono text-xs font-bold text-surface-dark">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-bold text-foreground">{s.step}</p>
                  <p className="mt-0.5 text-xs text-copy-subtle">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* Tab 3: Twin 30m Cadence */}
      {tab === "cadence" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Morning Placement Accelerator (30m)" subtitle="Synchronized Batch Program (06:00 Broadcast)">
            <ul className="space-y-2 text-xs">
              <li className="rounded-xl border border-line-soft bg-surface-soft p-3">
                <span className="font-bold text-brand-purple">10 min:</span> Daily English & Corporate Communication Video
              </li>
              <li className="rounded-xl border border-line-soft bg-surface-soft p-3">
                <span className="font-bold text-brand-purple">10 min:</span> Daily Quantitative Aptitude & Logic Video
              </li>
              <li className="rounded-xl border border-line-soft bg-surface-soft p-3">
                <span className="font-bold text-brand-purple">10 min:</span> In-App Guided Practice (5 MCQ + 2 Logic + 1 Voice Pitch)
              </li>
            </ul>
          </Panel>

          <Panel title="Individual Technical Session (30m)" subtitle="Self-Paced ITSE Learning Routine">
            <ul className="space-y-2 text-xs">
              <li className="rounded-xl border border-line-soft bg-surface-soft p-3">
                <span className="font-bold text-brand-cyan">5 min:</span> Micro-Concept Card & Architecture Digest
              </li>
              <li className="rounded-xl border border-line-soft bg-surface-soft p-3">
                <span className="font-bold text-brand-cyan">15 min:</span> Interactive Sandbox Lab Execution & Testing
              </li>
              <li className="rounded-xl border border-line-soft bg-surface-soft p-3">
                <span className="font-bold text-brand-cyan">10 min:</span> Practical Task Validation, Debugging & XP Claim
              </li>
            </ul>
          </Panel>
        </div>
      )}

      {/* Tab 4: Dual Completion Gate */}
      {tab === "gate" && (
        <Panel title="Dual Completion Gate & Phase 2 Recruiter Matching" subtitle="Gate unlocks after 90 days">
          <div className="rounded-xl border border-line-soft bg-surface-soft p-4 space-y-4">
            <p className="text-xs text-copy-subtle leading-relaxed">
              Students must satisfy BOTH gates to unlock Phase 2 Career & Recruiter Marketplace:
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-brand-cyan/40 bg-surface-dark p-3 text-xs">
                <p className="font-bold text-brand-cyan">Gate 1: Technical Mastery</p>
                <p className="mt-1 text-copy-subtle">Primary track 100% completed with verified sandbox evidence + secondary tracks satisfy minimum threshold.</p>
              </div>
              <div className="rounded-lg border border-brand-purple/40 bg-surface-dark p-3 text-xs">
                <p className="font-bold text-brand-purple">Gate 2: Placement Program</p>
                <p className="mt-1 text-copy-subtle">90-day cohort attendance + Day 90 Final Placement Readiness Assessment scored ≥ 60%.</p>
              </div>
            </div>

            <div className="rounded-xl border border-brand-emerald/40 bg-brand-emerald/5 p-3.5 text-xs text-foreground">
              <p className="font-bold text-brand-emerald flex items-center gap-1.5">
                <Building2 className="size-4" /> Recruiter Matching Mechanism:
              </p>
              <p className="mt-1 text-copy-subtle">
                Recruiters filter candidates by specific technical track (e.g. SAP FICO vs MERN), Talent Score (0–1000), certifications, and communication readiness — ensuring precise employer-talent alignment.
              </p>
            </div>
          </div>
        </Panel>
      )}

      {/* Tab 5: Swimlanes */}
      {tab === "swimlanes" && (
        <Panel title="Cross-Actor Swimlane Responsibility Matrix" subtitle="College Admin, Learner, Platform Engine, and Recruiter">
          <div className="space-y-3">
            {[
              { actor: "Partner College", role: "Uploads roster CSV with course preferences · Assigns MoU · Tracks batch analytics" },
              { actor: "Student Learner", role: "Engages in daily 30m Placement Telegram session + runs individual ITSE technical tracks" },
              { actor: "Platform Engine", role: "Executes 06:00 Telegram broadcasts · Evaluates sandboxes · Calculates Talent Score (0–1000)" },
              { actor: "Enterprise Recruiter", role: "Searches STC talent by track, score threshold & verified certifications · Conducts interviews & extends offers" },
            ].map((a) => (
              <div key={a.actor} className="rounded-xl border border-line-soft bg-surface-soft p-3">
                <p className="text-xs font-bold uppercase tracking-widest text-brand-cyan">{a.actor}</p>
                <p className="mt-1 text-xs text-foreground">{a.role}</p>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
