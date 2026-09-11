import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Chip, PageHeader, Panel } from "@/components/kit";
import { useAppStore } from "@/lib/app-store";
import { cn } from "@/lib/utils";
import {
  Database,
  GitBranch,
  Layers,
  Workflow,
  Users,
  Code2,
  Lock,
  Bot,
  Server,
  Network,
  Gauge,
  ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/admin/architecture")({
  head: () => ({
    meta: [
      { title: "Master Architecture & Systems Topology — SantoGe Talent Cloud" },
      {
        name: "description",
        content:
          "Definitive Enterprise Architecture & Systems Blueprint: Master Process Flow, Daily Twin 30m Pipeline, Super Admin & Student Swimlanes, Automation Engine, DFD L1/L2, Dual Gate Engine, and Infrastructure Topology.",
      },
      {
        property: "og:title",
        content: "Master Architecture & Systems Blueprint — SantoGe Talent Cloud",
      },
      {
        property: "og:description",
        content: "Comprehensive Super Admin Architecture & Flowcharts Hub.",
      },
    ],
  }),
  component: ArchitecturePage,
});

const TABS = [
  { id: "process", label: "1. Master Process Flow (7-Steps)", icon: Workflow },
  { id: "cadence", label: "2. Daily Twin 30m Execution Engine", icon: Layers },
  { id: "topology", label: "3. Enterprise System Topology", icon: Network },
  { id: "swimlanes", label: "4. Admin & Student Swimlanes", icon: GitBranch },
  { id: "automation", label: "5. Cron Automation & Webhook Flow", icon: Bot },
  { id: "dfd", label: "6. Data Flow Diagram (DFD L1 & L2)", icon: Database },
  { id: "gate", label: "7. Dual Completion Gate & Talent Engine", icon: Lock },
] as const;

function ArchitecturePage() {
  const store = useAppStore();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("process");
  const [zoomLevel, setZoomLevel] = useState<"standard" | "deep">("deep");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Super Admin Master Architecture & Systems Blueprint"
        subtitle="The definitive, multi-tier enterprise architecture separating cohort placement acceleration from individual evidence-based technical learning."
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoomLevel(zoomLevel === "standard" ? "deep" : "standard")}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors shadow-xs"
            >
              {zoomLevel === "deep" ? "🔬 Deep Technical View" : "📐 Standard Overview"}
            </button>
            <Chip tone="purple">STC Master Model v2.4</Chip>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-medium transition-colors",
              tab === t.id
                ? "border-primary bg-primary text-primary-foreground shadow-xs"
                : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            <t.icon className="size-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {/* Governing Rule Banner */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <ShieldCheck className="size-4" /> The Core Architectural Invariant
        </div>
        <p className="mt-2 text-base font-semibold text-foreground">
          "A Batch is exclusively a Placement Accelerator cohort (English, Aptitude, Telegram,
          90-Day Calendar). Technical Learning is completely decoupled, individual, self-paced, and
          evidence-based."
        </p>
        <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
          Students in the same college batch share a synchronized 90-day placement journey with
          daily 06:00 Telegram broadcasts, but each student independently pursues 1 to 3 assigned
          technical tracks from 15 available specializations in in-browser interactive sandboxes.
        </p>
      </div>

      {/* 1. MASTER 7-STEP PROCESS FLOW */}
      {tab === "process" && (
        <Panel
          title="Diagram 1: Master 7-Step Institutional-to-Placement Process Flow"
          subtitle="Complete enterprise lifecycle from College MoU signing to verified recruiter offer letters"
          action={<Chip tone="cyan">End-to-End Pipeline</Chip>}
        >
          <div className="space-y-3.5">
            {[
              {
                step: "Stage 0.1",
                phase: "Institutional Onboarding",
                title: "College MoU & Batch Sizing",
                desc: "Institutional partner signs MoU and submits verified student master list. Admin provisions cohort with 100–300 batch sizing constraint.",
                metrics:
                  "100–300 learners per batch · 1 Telegram channel per batch · Zero technical grouping",
              },
              {
                step: "Stage 0.2",
                phase: "Provisioning & Identity",
                title: "Bulk CSV Roster Ingestion & Validation",
                desc: "Platform Admin uploads CSV roster (student_name, email, password, roll_no, dept, course_1, course_2, course_3, batch_id). Schema and uniqueness checks pass instantly.",
                metrics:
                  "100% automated validation · Instant password hashing · Zero pre-test screening hurdles",
              },
              {
                step: "Stage 0.3",
                phase: "Instant Enrolment",
                title: "Zero Pre-Test Direct Track Activation",
                desc: "Students receive credentials with 1 to 3 pre-assigned technical specializations. Instant access without initial rejection tests.",
                metrics:
                  "1 Primary Specialization (100% weight) + up to 2 Secondary Tracks (50%+ weight)",
              },
              {
                step: "Phase 1",
                phase: "Days 1 to 90",
                title: "Daily Twin 30-Minute Routine Execution",
                desc: "Morning Placement Accelerator (10m English + 10m Aptitude + 10m In-App Practice via Telegram) + Technical ITSE Engine (20m Concept + 10m In-Browser Sandbox Lab).",
                metrics:
                  "18 Weeks × 5 Working Days = 90 Days · 18 Friday Workplace Mini Projects · Day 90 Industry Capstone",
              },
              {
                step: "Gate",
                phase: "Verification Checkpoint",
                title: "Dual Completion Gate Rule Enforcement",
                desc: "Automated gate evaluates: (1) 90/90 Placement Attendance + Assessment ≥ 60% AND (2) 100% Primary Track Mastery + Secondary Tracks ≥ configured threshold.",
                metrics: `Gate Threshold: Primary 100% + Secondary ≥ ${store.secondaryMinimum}% + 90 Days Cohort Attendance`,
              },
              {
                step: "Phase 2",
                phase: "Post-90 Days",
                title: "Career Gateway, AI Mock Interviews & Certifications",
                desc: "Unlocks ATS Keyword Resume Builder, AI 1:1 Voice/Video Mock Interviews with STAR rubric evaluation, and verifiable cryptographically stamped certificates.",
                metrics:
                  "0–1000 Unified Talent Score Engine · ATS Compatibility Scanner · Verified Portfolio Matrix",
              },
              {
                step: "Hiring",
                phase: "Talent Marketplace",
                title: "Tier-Gated Campus Placement & Digital Offers",
                desc: "Recruiters filter verified talent based on Talent Score tier (Elite 850+, Advanced 700+, Intermediate 550+), schedule direct interviews, and issue offer letters.",
                metrics:
                  "Automated match forwarding · Live salary benchmarking · Direct ATS candidate export",
              },
            ].map((s, idx) => (
              <div
                key={s.step}
                className="flex items-start gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40"
              >
                <div className="flex flex-col items-center">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted font-mono text-xs font-semibold text-foreground border border-border">
                    0{idx + 1}
                  </span>
                  {idx < 6 && <div className="h-6 w-0.5 bg-border my-1" />}
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-primary">{s.step}</span>
                    <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-mono text-muted-foreground border border-border">
                      {s.phase}
                    </span>
                    <span className="text-sm font-semibold text-foreground">· {s.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                  <div className="mt-2 rounded-md bg-muted/60 p-2.5 border border-border text-xs font-mono text-muted-foreground">
                    <span className="font-semibold text-foreground">Key Architecture Metric:</span> {s.metrics}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* 2. DAILY TWIN 30M EXECUTION ENGINE */}
      {tab === "cadence" && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Technical Engine */}
          <Panel
            title="Engine 1: Technical Learning & Sandbox Engine (ITSE)"
            subtitle="30 Mins Daily · 100% In-Browser Interactive Practice (Zero Video Fatigue)"
            action={<Chip tone="cyan">Individual & Self-Paced</Chip>}
          >
            <div className="space-y-4 text-xs">
              <div className="rounded-lg border border-border bg-card p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground text-sm">
                    Step 1: Architectural Concept Card (5 Mins)
                  </span>
                  <span className="rounded bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground border border-border">
                    05 min
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Interactive visual schema breakdown, API contracts, domain syntax rules, and error
                  patterns. Zero passive video watching.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground text-sm">
                    Step 2: In-Browser Practical Sandbox (15 Mins)
                  </span>
                  <span className="rounded bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground border border-border">
                    15 min
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Live code execution in WebAssembly/Dockerized virtual terminals across 15 tracks
                  (React 19, Spring Boot, PyTorch, Nmap, Kubernetes, Cypress, SAP). Instant
                  automated test validation (+50 XP).
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground text-sm">
                    Step 3: Practical Debug & Friday Mini-Project (10 Mins / 30 Mins Fri)
                  </span>
                  <span className="rounded bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground border border-border">
                    10–30 min
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Mon–Thu: Breakpoint troubleshooting and edge case fixes. Every Friday: Workplace
                  Simulation Mini-Project that logs a verified artifact to the student's 18-project
                  Placement Portfolio.
                </p>
              </div>

              <div className="rounded-lg bg-muted/60 p-3.5 border border-border text-xs font-mono text-muted-foreground">
                <p className="text-foreground font-semibold">Deliverable Matrix:</p>
                <p className="mt-1">
                  18 Friday Projects + Day 90 End-to-End Enterprise Industry Capstone
                </p>
              </div>
            </div>
          </Panel>

          {/* Placement Engine */}
          <Panel
            title="Engine 2: 90-Day Placement Accelerator Engine"
            subtitle="30 Mins Daily · Synchronized Batch Cohort (100–300 Students)"
            action={<Chip tone="purple">Cohort Telegram Sync</Chip>}
          >
            <div className="space-y-4 text-xs">
              <div className="rounded-lg border border-border bg-card p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground text-sm">
                    Step 1: English &amp; Corporate Communication (10 Mins)
                  </span>
                  <span className="rounded bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground border border-border">
                    10 min
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Broadcast via batch Telegram channel at 06:00 IST. Instructor lesson plan covering
                  professional email structure, GD openers, vocal cadence, and eliminating filler
                  words.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground text-sm">
                    Step 2: Quantitative &amp; Logical Reasoning (10 Mins)
                  </span>
                  <span className="rounded bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground border border-border">
                    10 min
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Broadcast via Telegram at 06:00 IST. Speed math shortcuts, Vedic math
                  multiplication, work-rate formulas, syllogisms, and rapid data interpretation
                  techniques.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground text-sm">
                    Step 3: In-App Combined Practice &amp; AI Pitch (10 Mins)
                  </span>
                  <span className="rounded bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground border border-border">
                    10 min
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  In-app interactive practice: 3 Placement MCQs + 1 Logical Reasoning Brainteaser +
                  60s AI Voice Pitch Recorder with real-time STAR rubric speech analysis (+25 XP).
                </p>
              </div>

              <div className="rounded-lg bg-muted/60 p-3.5 border border-border text-xs font-mono text-muted-foreground">
                <p className="text-foreground font-semibold">Assessment Schedule:</p>
                <p className="mt-1">
                  Weekly Friday Mock Tests + Milestone Assessments on Day 30, Day 60 &amp; Day 90
                </p>
              </div>
            </div>
          </Panel>

          {/* Full-width Architecture Callout: Day 1 to Day 90 Chronological To-Do Backlog & Catch-Up Workflow */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                  <Workflow className="size-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    Chronological Day 1 to Day 90 To-Do Backlog &amp; Catch-Up Engine
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Guaranteed zero-dropout remediation: Every missed day remains actionable from
                    Day 1 to current cohort day.
                  </p>
                </div>
              </div>
              <Chip tone="cyan">Non-Blocking Remediation Pipeline</Chip>
            </div>

            <div className="grid gap-3 sm:grid-cols-4 text-xs">
              <div className="rounded-lg border border-border bg-muted/40 p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <span className="font-mono text-primary">01.</span> Strict Chronological Order
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Days are rendered from Day 1, Day 2 up to current cohort day (e.g. Day 89).
                  Unfinished items appear chronologically so students never skip foundational
                  prerequisites.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-muted/40 p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <span className="font-mono text-primary">02.</span> Dual Sub-Task Requirement
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Each day requires completing BOTH Placement 30m (English + Aptitude + AI Pitch)
                  and Technical Skill 30m (Concept + Lab). Both must finish to clear that day.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-muted/40 p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <span className="font-mono text-primary">03.</span> Direct Interactive Deep-Link
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Clicking "To-Do →" on any missed day smoothly switches and scrolls to the selected
                  day's interactive drill workspace below without navigating away.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-muted/40 p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <span className="font-mono text-primary">04.</span> Instant Verification &amp; Dual Gate
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Completing labs and AI pitches marks the day as "Finished &amp; Verified ✓",
                  increments XP (+50/+25), and clears prerequisites toward Day 90 Dual Gate
                  unlocking.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. ENTERPRISE SYSTEM TOPOLOGY */}
      {tab === "topology" && (
        <Panel
          title="Diagram 3: Full Stack Infrastructure & Microservices Topology"
          subtitle="Cloud-native deployment architecture, live event streaming, and data storage tier"
          action={<Chip tone="emerald">Infrastructure Topology</Chip>}
        >
          <div className="space-y-4">
            {/* Top Row: Client Tier & Gateway */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                <Layers className="size-4" /> Tier 1: Client Interfaces &amp; Edge Gateway
              </div>
              <div className="grid gap-3 sm:grid-cols-3 text-xs">
                <div className="rounded-lg border border-border bg-muted/40 p-3.5 space-y-1">
                  <p className="font-semibold text-foreground">Student Progressive Web App</p>
                  <p className="text-muted-foreground text-xs">
                    Twin 30m Daily Dashboard, In-Browser Sandboxes, AI Voice Pitch
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/40 p-3.5 space-y-1">
                  <p className="font-semibold text-foreground">Super Admin Command Center</p>
                  <p className="text-muted-foreground text-xs">
                    CSV Provisioning, Telegram Bot Hub, Content CMS, Dual Gate Engine
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/40 p-3.5 space-y-1">
                  <p className="font-semibold text-foreground">Recruiter Talent Portal</p>
                  <p className="text-muted-foreground text-xs">
                    Tier-Gated Candidate Search (0–1000), STAR Scorecards, Offer Letters
                  </p>
                </div>
              </div>
            </div>

            {/* Middle Row: Core Backend Microservices */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                <Server className="size-4" /> Tier 2: Microservices &amp; Business Logic Layer
              </div>
              <div className="grid gap-3 sm:grid-cols-4 text-xs">
                <div className="rounded-lg border border-border bg-muted/40 p-3.5 space-y-1">
                  <p className="font-semibold text-foreground">Auth &amp; RBAC Service</p>
                  <p className="text-muted-foreground text-xs">
                    Supabase Live Auth / JWT Stateless RBAC (Admin / Student)
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/40 p-3.5 space-y-1">
                  <p className="font-semibold text-foreground">Telegram Broadcast Engine</p>
                  <p className="text-muted-foreground text-xs">
                    06:00 IST Cron Webhook Dispatcher to 54+ Batch Channels
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/40 p-3.5 space-y-1">
                  <p className="font-semibold text-foreground">Talent Scoring Microservice</p>
                  <p className="text-muted-foreground text-xs">
                    Dynamic 6-Pillar 0–1000 Weighted Engine recalculated every 15m
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/40 p-3.5 space-y-1">
                  <p className="font-semibold text-foreground">AI Speech &amp; LLM Evaluator</p>
                  <p className="text-muted-foreground text-xs">
                    WebSpeech API + ITSE STAR Speech Rubric + ATS Keyword Scanner
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Row: Database & State Management Tier */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                <Database className="size-4" /> Tier 3: Storage &amp; Persistence Tier
              </div>
              <div className="grid gap-3 sm:grid-cols-3 text-xs">
                <div className="rounded-lg border border-border bg-muted/40 p-3.5 space-y-1">
                  <p className="font-semibold text-foreground">
                    Relational Database (PostgreSQL / Supabase)
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Students, Batches, Attendance, Assessments, Audit Logs, Offer Letters
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/40 p-3.5 space-y-1">
                  <p className="font-semibold text-foreground">
                    High-Speed Cache (Redis / Memory Store)
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Real-time Talent Score Leaderboard, Active Streaks, Rate Limiters
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/40 p-3.5 space-y-1">
                  <p className="font-semibold text-foreground">Object Storage (S3 / CDN)</p>
                  <p className="text-muted-foreground text-xs">
                    Recorded Voice Pitches, ATS PDF Resumes, Verifiable Certificates
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Panel>
      )}

      {/* 4. ADMIN & STUDENT SWIMLANES */}
      {tab === "swimlanes" && (
        <Panel
          title="Diagram 4: Platform Super Admin & Student Operational Swimlanes"
          subtitle="Clear separation of platform governance vs learner execution"
          action={<Chip tone="purple">Two-Tier Persona Model</Chip>}
        >
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Super Admin Swimlane */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                <Users className="size-4 text-primary" /> Platform Super Admin Swimlane
              </div>
              <ul className="space-y-3 text-xs text-muted-foreground">
                <li className="rounded-lg bg-muted/40 p-3.5 border border-border space-y-1">
                  <span className="font-semibold text-foreground">
                    1. Institutional Onboarding &amp; Batch Creation:
                  </span>
                  <p>
                    Validates college partner requests, sets 100–300 capacity slider, and
                    establishes cohort Telegram link.
                  </p>
                </li>
                <li className="rounded-lg bg-muted/40 p-3.5 border border-border space-y-1">
                  <span className="font-semibold text-foreground">2. Bulk CSV Provisioning:</span>
                  <p>
                    Uploads student CSV with 1–3 course assignments. Zero pre-test barriers. Exports
                    credential packet.
                  </p>
                </li>
                <li className="rounded-lg bg-muted/40 p-3.5 border border-border space-y-1">
                  <span className="font-semibold text-foreground">
                    3. Content Management System (CMS):
                  </span>
                  <p>
                    Authors and publishes daily English scripts, Aptitude formulas, MCQs, and 15
                    technical course syllabi.
                  </p>
                </li>
                <li className="rounded-lg bg-muted/40 p-3.5 border border-border space-y-1">
                  <span className="font-semibold text-foreground">4. Cron Pipeline Monitoring:</span>
                  <p>
                    Supervises 06:00 broadcast, container warmer, ATS parser, and evening streak
                    mailer cron jobs.
                  </p>
                </li>
                <li className="rounded-lg bg-muted/40 p-3.5 border border-border space-y-1">
                  <span className="font-semibold text-foreground">5. Dual Gate Governance:</span>
                  <p>
                    Configures secondary track minimum % ({store.secondaryMinimum}%), 6-pillar score
                    weights, and unlocks Phase 2.
                  </p>
                </li>
              </ul>
            </div>

            {/* Student Swimlane */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                <Code2 className="size-4 text-primary" /> Student (Learner) Swimlane
              </div>
              <ul className="space-y-3 text-xs text-muted-foreground">
                <li className="rounded-lg bg-muted/40 p-3.5 border border-border space-y-1">
                  <span className="font-semibold text-foreground">1. Minimal Daily Login:</span>
                  <p>
                    Signs in with college-issued credentials directly to "Today's Learning"
                    dashboard without clutter.
                  </p>
                </li>
                <li className="rounded-lg bg-muted/40 p-3.5 border border-border space-y-1">
                  <span className="font-semibold text-foreground">2. 30m Placement Accelerator:</span>
                  <p>
                    Watches 06:00 English + Aptitude video broadcasts and completes 3 MCQs +
                    Brainteaser + 60s Voice Pitch.
                  </p>
                </li>
                <li className="rounded-lg bg-muted/40 p-3.5 border border-border space-y-1">
                  <span className="font-semibold text-foreground">3. 30m Technical Practice:</span>
                  <p>
                    Solves hands-on sandbox labs on enrolled tracks; executes 18 Friday Workplace
                    Mini-Projects.
                  </p>
                </li>
                <li className="rounded-lg bg-muted/40 p-3.5 border border-border space-y-1">
                  <span className="font-semibold text-foreground">4. Day 90 Industry Capstone:</span>
                  <p>
                    Completes 14-step real-world case defense simulation and satisfies the Dual
                    Completion Gate.
                  </p>
                </li>
                <li className="rounded-lg bg-muted/40 p-3.5 border border-border space-y-1">
                  <span className="font-semibold text-foreground">5. Phase 2 Career Gateway:</span>
                  <p>
                    Generates ATS resume, takes AI Mock Interviews, verifies certifications, and
                    accepts job offers.
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </Panel>
      )}

      {/* 5. CRON AUTOMATIONS & WEBHOOK FLOW */}
      {tab === "automation" && (
        <Panel
          title="Diagram 5: Daily Automation Engine & Cron Pipeline Architecture"
          subtitle="Automated background cron jobs executing from 06:00 IST to 23:59 IST daily"
          action={<Chip tone="amber">6 Automated Pipelines</Chip>}
        >
          <div className="space-y-3">
            {[
              {
                time: "06:00 IST",
                cron: "0 6 * * 1-5",
                title: "Morning Placement Broadcast Webhook",
                desc: "Telegram Bot API dispatches 10m English lesson + 10m Aptitude video links to all 54 active batch channels.",
                impact: "Wakes cohort, marks batch start, alerts students via mobile notification.",
              },
              {
                time: "06:05 IST",
                cron: "5 6 * * 1-5",
                title: "In-App Guided Practice Unlock Pipeline",
                desc: "Unlocks the daily 3 MCQs, 1 Logical Brainteaser, and 60s AI Voice Pitch prompt for the day.",
                impact: "Enables instant in-app practice with live feedback.",
              },
              {
                time: "06:15 IST",
                cron: "15 6 * * *",
                title: "Technical Sandbox Containers Warmer",
                desc: "Pre-warms WebAssembly modules and in-browser runtimes for all 15 technical disciplines.",
                impact:
                  "Sub-second lab load times for MERN, Java, AI/ML, Cloud, and Medical Coding sandboxes.",
              },
              {
                time: "Every 15m",
                cron: "*/15 * * * *",
                title: "Unified Talent Score Recalculation Engine",
                desc: "Recalculates 0–1000 Talent Score (Technical 25% + Coding 20% + Aptitude 15% + English 15% + Real-world 15% + Mock 10%).",
                impact:
                  "Updates cohort leaderboards, tier badges, and recruiter match percentages.",
              },
              {
                time: "Every 4h",
                cron: "0 */4 * * *",
                title: "ATS Portfolio Parser & Synchronizer",
                desc: "Extracts completed sandbox project milestones into students' automated ATS resume drafts.",
                impact:
                  "Ensures resume bullet points always reflect verified portfolio accomplishments.",
              },
              {
                time: "20:00 IST",
                cron: "0 20 * * 1-5",
                title: "Streak Maintenance & Daily Performance Digest Mailer",
                desc: "Verifies daily Twin 30m completions, increments streaks, and emails digest to students and mentors.",
                impact: "Protects placement streaks and sends gentle nudges to pending students.",
              },
            ].map((cron) => (
              <div
                key={cron.time}
                className="flex items-start gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40"
              >
                <div className="shrink-0 space-y-1">
                  <span className="rounded-md bg-muted border border-border px-2.5 py-1 font-mono text-xs font-semibold text-foreground block text-center">
                    {cron.time}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground block text-center">
                    {cron.cron}
                  </span>
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-xs font-semibold text-foreground">{cron.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{cron.desc}</p>
                  <p className="text-xs font-mono text-primary">
                    ⚡ System Impact: {cron.impact}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* 6. DATA FLOW DIAGRAM (DFD LEVEL 1 & 2) */}
      {tab === "dfd" && (
        <Panel
          title="Diagram 6: Data Flow Diagram (DFD Level 1 & Level 2)"
          subtitle="Entities, processes (1.0 to 4.0), data stores (D1–D5), and data boundary flows"
          action={<Chip tone="emerald">DFD Level 1 &amp; 2</Chip>}
        >
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-4 text-xs space-y-3">
              <p className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                <Users className="size-4 text-primary" /> 1. External Entities
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="rounded-lg bg-muted/40 p-2.5 border border-border">
                  <span className="font-semibold text-foreground">Student Learner:</span> Submits daily
                  practice answers, sandbox code, voice pitch audio, and capstone submissions.
                </li>
                <li className="rounded-lg bg-muted/40 p-2.5 border border-border">
                  <span className="font-semibold text-foreground">Platform Super Admin:</span> Bulk CSV
                  roster, batch sizing, Telegram credentials, CMS content updates, and gate
                  thresholds.
                </li>
                <li className="rounded-lg bg-muted/40 p-2.5 border border-border">
                  <span className="font-semibold text-foreground">Enterprise Recruiter:</span> Posts job
                  requisitions, filters talent by Talent Score tier, schedules 1:1 mocks, and sends
                  offers.
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 text-xs space-y-3">
              <p className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                <Workflow className="size-4 text-primary" /> 2. Core Processes
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="rounded-lg bg-muted/40 p-2.5 border border-border">
                  <span className="font-semibold text-foreground">1.0 Roster Ingestion:</span> Validates
                  CSV, assigns 1–3 courses, hashes passwords, generates logins.
                </li>
                <li className="rounded-lg bg-muted/40 p-2.5 border border-border">
                  <span className="font-semibold text-foreground">2.0 Twin Routine Dispatcher:</span>{" "}
                  Schedules 06:00 broadcast and serves in-browser sandbox exercises.
                </li>
                <li className="rounded-lg bg-muted/40 p-2.5 border border-border">
                  <span className="font-semibold text-foreground">3.0 Dual Gate Evaluator:</span> Checks
                  90-day attendance + technical competency on assigned tracks.
                </li>
                <li className="rounded-lg bg-muted/40 p-2.5 border border-border">
                  <span className="font-semibold text-foreground">4.0 Talent Scoring &amp; Match:</span>{" "}
                  Computes 0–1000 score and routes eligible profiles to recruiters.
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 text-xs space-y-3">
              <p className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                <Database className="size-4 text-primary" /> 3. Data Stores (D1–D5)
              </p>
              <ul className="space-y-2 text-muted-foreground font-mono text-xs">
                <li className="rounded-lg bg-muted/40 p-2.5 border border-border">
                  <span className="font-semibold text-foreground">
                    D1: Student &amp; Batch Store:
                  </span>{" "}
                  Profiles, enrollments, credentials, Telegram webhooks.
                </li>
                <li className="rounded-lg bg-muted/40 p-2.5 border border-border">
                  <span className="font-semibold text-foreground">D2: Technical Sandbox Store:</span>{" "}
                  Track modules, 18 Friday deliverables, test outputs.
                </li>
                <li className="rounded-lg bg-muted/40 p-2.5 border border-border">
                  <span className="font-semibold text-foreground">
                    D3: Placement Accelerator Store:
                  </span>{" "}
                  90-day attendance, MCQs, voice pitch recordings.
                </li>
                <li className="rounded-lg bg-muted/40 p-2.5 border border-border">
                  <span className="font-semibold text-foreground">
                    D4: Talent Score &amp; Tier Store:
                  </span>{" "}
                  0–1000 dynamic ratings, percentile rankings.
                </li>
                <li className="rounded-lg bg-muted/40 p-2.5 border border-border">
                  <span className="font-semibold text-foreground">
                    D5: Recruiter Marketplace Store:
                  </span>{" "}
                  Requisitions, candidate shortlists, offer letters.
                </li>
              </ul>
            </div>
          </div>
        </Panel>
      )}

      {/* 7. DUAL COMPLETION GATE & TALENT SCORE ENGINE */}
      {tab === "gate" && (
        <Panel
          title="Diagram 7: Dual Completion Gate State Machine & 0–1000 Talent Engine"
          subtitle="Mathematical formulation for Phase 2 career unlocking and recruiter talent tiering"
          action={<Chip tone="rose">Strict Phase 2 Gate</Chip>}
        >
          <div className="space-y-6 text-xs">
            {/* Gate Logic Cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-4 space-y-2">
                <p className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                  <Code2 className="size-4 text-primary" /> Gate Condition 1: Technical Mastery
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  100% verified completion on the student's Primary Specialization (all sandbox
                  tasks + 18 Friday workplace projects + Day 90 capstone) AND ≥{" "}
                  {store.secondaryMinimum}% completion on any secondary enrolled courses.
                </p>
                <div className="rounded-md bg-muted/60 p-2.5 font-mono text-xs text-primary border border-border">
                  Formula: Primary == 100% &amp;&amp; Secondary ≥ {store.secondaryMinimum}%
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-4 space-y-2">
                <p className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                  <Users className="size-4 text-primary" /> Gate Condition 2: Placement Program
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  100% attendance recorded across the 90-day synchronized batch cohort calendar
                  (90/90 days) AND a passing score of ≥ 60% on the Day 90 Final Placement Readiness
                  Assessment.
                </p>
                <div className="rounded-md bg-muted/60 p-2.5 font-mono text-xs text-primary border border-border">
                  Formula: Attendance == 90/90 &amp;&amp; AssessmentDay90 ≥ 60%
                </div>
              </div>
            </div>

            {/* Talent Score Mathematical Model */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground text-sm flex items-center gap-2">
                  <Gauge className="size-4 text-amber-500" />
                  Unified Talent Score Mathematical Formulation (0–1000 Scale)
                </span>
                <span className="rounded bg-muted px-2.5 py-0.5 font-mono text-xs font-semibold text-foreground border border-border">
                  1000 Max Score
                </span>
              </div>

              <div className="rounded-lg bg-muted/50 p-4 border border-border font-mono text-xs text-foreground space-y-2">
                <p className="text-foreground font-semibold">
                  Talent Score = (T × 25%) + (C × 20%) + (A × 15%) + (E × 15%) + (R × 15%) + (M ×
                  10%)
                </p>
                <div className="grid gap-2 sm:grid-cols-3 pt-2 text-xs text-muted-foreground border-t border-border">
                  <div>• T = Technical Mastery (25%)</div>
                  <div>• C = Coding &amp; Labs (20%)</div>
                  <div>• A = Aptitude &amp; Logic (15%)</div>
                  <div>• E = English &amp; Communication (15%)</div>
                  <div>• R = Real-world Projects (15%)</div>
                  <div>• M = Mock Interviews (10%)</div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-4 text-xs font-mono">
                <div className="rounded-lg border border-border bg-card p-3 text-center">
                  <p className="font-semibold text-foreground text-sm">Elite Tier</p>
                  <p className="text-primary font-bold mt-1">850 – 1000</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Top 5% · Direct Day-1 Placement
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-card p-3 text-center">
                  <p className="font-semibold text-foreground text-sm">Advanced Tier</p>
                  <p className="text-primary font-bold mt-1">700 – 849</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Top 25% · Enterprise Drives</p>
                </div>
                <div className="rounded-lg border border-border bg-card p-3 text-center">
                  <p className="font-semibold text-foreground text-sm">Intermediate</p>
                  <p className="text-primary font-bold mt-1">550 – 699</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Core Campus Drives</p>
                </div>
                <div className="rounded-lg border border-border bg-card p-3 text-center">
                  <p className="font-semibold text-muted-foreground text-sm">Foundational</p>
                  <p className="text-foreground font-bold mt-1">&lt; 550</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Remediation Sprints</p>
                </div>
              </div>
            </div>
          </div>
        </Panel>
      )}
    </div>
  );
}
