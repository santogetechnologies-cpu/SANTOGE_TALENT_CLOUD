import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Chip, Gauge, Meter, PageHeader, Panel, Stat } from "@/components/kit";
import { useAppStore } from "@/lib/app-store";
import { TRACKS, trackById, type TrackId } from "@/lib/tracks";
import { STUDENT_ACCOUNTS } from "@/lib/accounts";
import {
  Building2,
  Users,
  Search,
  Filter,
  GraduationCap,
  Sparkles,
  ArrowUpRight,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Executive Analytics — SantoGe Talent Cloud" },
      { name: "description", content: "Platform-wide cohort readiness, bulk placement conversion, recruiter marketplace, and student roster across 48 partner institutions." },
      { property: "og:title", content: "Executive Analytics — SantoGe Talent Cloud" },
      { property: "og:description", content: "Platform-wide readiness and placement conversion." },
    ],
  }),
  component: AdminAnalytics,
});

const INSTITUTIONS = [
  { id: "all", name: "All Partner Institutions (48)" },
  { id: "nit", name: "National Institute of Technology" },
  { id: "psg", name: "PSG College of Technology" },
  { id: "anna", name: "Anna University College of Engineering" },
  { id: "vit", name: "Vellore Institute of Technology" },
  { id: "srm", name: "SRM Institute of Science & Technology" },
];

const FUNNEL_STAGES = [
  { label: "Stage 0: CSV Enrolled", count: 14280, pct: 100, color: "var(--brand-cyan)" },
  { label: "Phase 1: Twin 30m Active", count: 12450, pct: 87, color: "var(--brand-purple)" },
  { label: "Phase 1: Labs & Sandboxes Verified", count: 10120, pct: 71, color: "var(--brand-emerald)" },
  { label: "Dual Gate: 100% Verified Cleared", count: 8240, pct: 58, color: "var(--brand-amber)" },
  { label: "Phase 2: AI & Mentor Mock Panels", count: 5580, pct: 39, color: "var(--brand-rose)" },
  { label: "Recruiter Offers Generated", count: 3840, pct: 27, color: "#10b981" },
];

const HIRING_DRIVES = [
  { company: "TCS Digital", roles: "Full Stack & Cloud", ctc: "₹7.5 - ₹9.0 LPA", minScore: 650, openSlots: 120, status: "Active Drive" },
  { company: "Infosys Wingspan", roles: "Java & DevOps Associates", ctc: "₹8.0 - ₹9.5 LPA", minScore: 680, openSlots: 85, status: "Active Drive" },
  { company: "Wipro Turbo", roles: "AI/ML Solutions Engineers", ctc: "₹9.5 - ₹12.0 LPA", minScore: 720, openSlots: 60, status: "Shortlisting" },
  { company: "Deloitte USI", roles: "SAP FICO & Business Analysts", ctc: "₹8.5 - ₹10.5 LPA", minScore: 670, openSlots: 45, status: "Interviews Live" },
  { company: "Cognizant GenC Next", roles: "QA Automation & Cyber", ctc: "₹7.0 - ₹8.5 LPA", minScore: 640, openSlots: 110, status: "Active Drive" },
];

function AdminAnalytics() {
  const store = useAppStore();
  const [selectedInst, setSelectedInst] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [trackFilter, setTrackFilter] = useState<string>("all");
  const [selectedStudentEmail, setSelectedStudentEmail] = useState<string | null>(null);

  const readinessOf = (b: { enrolled: number; capacity: number }) =>
    Math.round((b.enrolled / Math.max(b.capacity, 1)) * 100);
  
  const avgReadiness = Math.round(
    store.batches.reduce((s, b) => s + readinessOf(b), 0) / Math.max(store.batches.length, 1),
  );

  // Combine demo students + provisioned students
  const allStudents = useMemo(() => {
    const fromAccounts = STUDENT_ACCOUNTS.map((a) => {
      const p = store.profiles?.[a.email];
      const t = p ? p.readiness.T * 0.25 + p.readiness.C * 0.2 + p.readiness.A * 0.15 + p.readiness.E * 0.15 + p.readiness.R * 0.15 + p.readiness.M * 0.1 : 70;
      const score = Math.round(t * 8.5 + (p?.completedLabs.length ?? 0) * 6);
      return {
        name: a.name,
        email: a.email,
        rollNo: a.rollNo,
        dept: a.dept,
        batchId: a.batchId,
        college: a.college,
        tracks: a.tracks,
        placementDay: p?.placementDay ?? a.placementDay,
        talentScore: score,
        gateCleared: (p?.attendance.length ?? 0) >= 30,
      };
    });

    const fromProvisioned = (store.provisioned || []).map((p) => ({
      name: p.student_name,
      email: p.email,
      rollNo: p.roll_no,
      dept: p.dept,
      batchId: p.batch_id,
      college: "PSG College of Technology",
      tracks: [p.course_1, p.course_2, p.course_3].filter(Boolean) as TrackId[],
      placementDay: 1,
      talentScore: 480,
      gateCleared: false,
    }));

    return [...fromAccounts, ...fromProvisioned];
  }, [store.profiles, store.provisioned]);

  const filteredStudents = useMemo(() => {
    return allStudents.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.batchId.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTrack =
        trackFilter === "all" || s.tracks.includes(trackFilter as TrackId);

      return matchesSearch && matchesTrack;
    });
  }, [allStudents, searchQuery, trackFilter]);

  const activeModalStudent = allStudents.find((s) => s.email === selectedStudentEmail);

  return (
    <div className="space-y-6">
      {/* Header with Institution Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Executive Platform Analytics</h1>
          <p className="text-xs text-copy-subtle">
            Real-time cohort readiness, throughput, bulk placement conversion, and recruiter partner drives.
          </p>
        </div>

        {/* Institution Selector */}
        <div className="flex items-center gap-2">
          <Building2 className="size-4 text-brand-cyan shrink-0" />
          <select
            value={selectedInst}
            onChange={(e) => {
              setSelectedInst(e.target.value);
              toast.info(`Filtering data for ${INSTITUTIONS.find((i) => i.id === e.target.value)?.name}`);
            }}
            className="rounded-xl border border-line-soft bg-surface-soft px-3 py-2 text-xs font-semibold text-foreground outline-none focus:border-brand-cyan/60"
          >
            {INSTITUTIONS.map((inst) => (
              <option key={inst.id} value={inst.id} className="bg-surface-dark text-foreground">
                {inst.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* High-Level Platform KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total Enrolled Learners" value="14,280" hint="Across 48 partner institutions" />
        <Stat label="Active Cohort Batches" value="54" accent="var(--brand-purple)" hint="100–300 learners per batch" />
        <Stat label="Avg Cohort Readiness" value={`${avgReadiness}%`} accent="var(--brand-cyan)" hint="Weighted composite index" />
        <Stat label="Digital Offers Generated" value="3,840" accent="var(--brand-emerald)" hint="27% direct offer conversion" />
      </div>

      {/* Cohort Health Gauge & Placement Funnel */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Composite Platform Health" subtitle="Aggregated cohort readiness" className="flex flex-col items-center justify-center p-6">
          <Gauge value={avgReadiness * 10} label="Platform Index" />
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-center text-[11px] text-copy-subtle">
            <span className="rounded-full bg-brand-emerald/10 border border-brand-emerald/30 px-2.5 py-0.5 text-brand-emerald font-semibold">
              98.4% Telegram Delivery
            </span>
            <span className="rounded-full bg-brand-cyan/10 border border-brand-cyan/30 px-2.5 py-0.5 text-brand-cyan font-semibold">
              15 ITSE Tracks Active
            </span>
          </div>
        </Panel>

        <Panel title="Placement Conversion Funnel" subtitle="Stage 0 CSV through Phase 2 Recruiter Offers" className="lg:col-span-2">
          <div className="space-y-3.5">
            {FUNNEL_STAGES.map((f) => (
              <div key={f.label}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">{f.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-copy-subtle text-[11px]">{f.count.toLocaleString()} learners</span>
                    <span className="font-mono font-bold text-foreground">{f.pct}%</span>
                  </div>
                </div>
                <Meter value={f.pct} accent={f.color} />
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Live Batches & Track Demand */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Active Placement Batches"
          subtitle="Synchronized Placement cohorts (100–300 sizing)"
          action={<Chip tone="cyan">{store.batches.length} cohorts</Chip>}
        >
          <div className="space-y-3">
            {store.batches.map((b) => {
              const fill = readinessOf(b);
              return (
                <div key={b.id} className="rounded-xl border border-line-soft bg-surface-soft p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-foreground">{b.name}</p>
                      <p className="text-[11px] text-copy-subtle">{b.dept} · Capacity: {b.capacity} (Max 300)</p>
                    </div>
                    <Chip tone={fill >= 80 ? "emerald" : "amber"}>{fill}% Fill Rate</Chip>
                  </div>
                  <div className="mt-2.5">
                    <Meter value={fill} accent="var(--brand-purple)" />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-copy-subtle">
                    <span>{b.enrolled} / {b.capacity} learners enrolled</span>
                    <span className="text-brand-cyan">Telegram: t.me/stc-{b.id.toLowerCase()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel
          title="Active Recruiter Hiring Drives"
          subtitle="Enterprise talent partner shortlists & requisition matching"
          action={<Chip tone="emerald">5 Partner Drives</Chip>}
        >
          <div className="space-y-2.5">
            {HIRING_DRIVES.map((d) => (
              <div key={d.company} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line-soft bg-surface-soft p-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-foreground">{d.company}</p>
                    <span className="rounded bg-brand-emerald/10 border border-brand-emerald/30 px-1.5 py-0.5 text-[9px] font-semibold text-brand-emerald">
                      {d.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-copy-subtle">{d.roles} · {d.ctc}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-xs font-bold text-brand-cyan">{d.openSlots} Openings</p>
                  <p className="text-[10px] text-copy-subtle">Min Talent Score: {d.minScore}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Comprehensive Student Cohort Roster Table */}
      <Panel
        title="Student Roster & Cohort Management"
        subtitle="Individual 1–3 technical tracks & placement accelerator progress across all provisioned learners"
        action={<Chip tone="purple">{filteredStudents.length} Students Shown</Chip>}
      >
        {/* Filters */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 size-3.5 text-copy-subtle" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, roll no, batch, email…"
              className="w-full rounded-xl border border-line-soft bg-surface-soft pl-9 pr-3 py-2 text-xs text-foreground outline-none placeholder:text-copy-subtle focus:border-brand-cyan/60"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="size-3.5 text-copy-subtle" />
            <select
              value={trackFilter}
              onChange={(e) => setTrackFilter(e.target.value)}
              className="rounded-xl border border-line-soft bg-surface-soft px-3 py-2 text-xs font-medium text-foreground outline-none focus:border-brand-cyan/60"
            >
              <option value="all">All Technical Tracks</option>
              {TRACKS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-line-soft text-copy-subtle">
              <tr>
                <th className="py-2.5 pr-4 font-semibold">Student Learner</th>
                <th className="py-2.5 pr-4 font-semibold">Roll No &amp; Dept</th>
                <th className="py-2.5 pr-4 font-semibold">Placement Batch</th>
                <th className="py-2.5 pr-4 font-semibold">Assigned Technical Tracks (1-3)</th>
                <th className="py-2.5 pr-4 font-semibold">Talent Score</th>
                <th className="py-2.5 pr-4 font-semibold">Status</th>
                <th className="py-2.5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft/60 text-foreground">
              {filteredStudents.map((s) => (
                <tr key={s.email} className="hover:bg-surface-soft/60 transition-colors">
                  <td className="py-3 pr-4">
                    <p className="font-bold text-foreground">{s.name}</p>
                    <p className="text-[11px] font-mono text-copy-subtle">{s.email}</p>
                  </td>
                  <td className="py-3 pr-4">
                    <p className="font-mono font-medium">{s.rollNo}</p>
                    <p className="text-[11px] text-copy-subtle">{s.dept}</p>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="rounded-md border border-line-soft bg-surface-soft px-2 py-0.5 font-mono text-[11px]">
                      {s.batchId}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-wrap gap-1">
                      {s.tracks.map((tid) => {
                        const track = trackById(tid);
                        return (
                          <span
                            key={tid}
                            className="rounded px-1.5 py-0.5 text-[10px] font-medium border border-line-soft bg-surface-dark"
                          >
                            {track.short}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="py-3 pr-4 font-mono font-bold text-brand-cyan">
                    {s.talentScore}/1000
                  </td>
                  <td className="py-3 pr-4">
                    {s.talentScore >= 700 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-emerald">
                        <CheckCircle2 className="size-3" /> Marketplace Ready
                      </span>
                    ) : s.talentScore >= 450 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-cyan">
                        <Sparkles className="size-3" /> ATS Unlocked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-amber">
                        <AlertCircle className="size-3" /> Phase 1 Learning
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => setSelectedStudentEmail(s.email)}
                      className="inline-flex items-center gap-1 rounded-lg border border-line-soft bg-surface-soft px-2.5 py-1 text-[11px] font-semibold text-foreground hover:border-brand-cyan/60"
                    >
                      <Eye className="size-3" /> Details
                    </button>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-copy-subtle">
                    No learners match the specified search or filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Student Details Modal */}
      {activeModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-ink/70 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl border border-line-soft bg-surface-elevated p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-line-soft pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="size-5 text-brand-cyan" />
                <h3 className="font-display text-base font-bold text-foreground">Learner Profile Audit</h3>
              </div>
              <button onClick={() => setSelectedStudentEmail(null)} className="text-copy-subtle hover:text-foreground">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 rounded-xl border border-line-soft bg-surface-soft p-3">
                <div>
                  <p className="text-copy-subtle">Student Name</p>
                  <p className="font-bold text-foreground mt-0.5">{activeModalStudent.name}</p>
                </div>
                <div>
                  <p className="text-copy-subtle">Roll Number</p>
                  <p className="font-mono font-bold text-foreground mt-0.5">{activeModalStudent.rollNo}</p>
                </div>
                <div>
                  <p className="text-copy-subtle">Email Address</p>
                  <p className="font-mono text-copy-subtle mt-0.5">{activeModalStudent.email}</p>
                </div>
                <div>
                  <p className="text-copy-subtle">Placement Batch</p>
                  <p className="font-mono text-brand-purple font-bold mt-0.5">{activeModalStudent.batchId}</p>
                </div>
              </div>

              <div>
                <p className="font-semibold text-foreground mb-1.5">Assigned Technical Learning Tracks (1–3):</p>
                <div className="flex flex-wrap gap-1.5">
                  {activeModalStudent.tracks.map((t) => (
                    <span key={t} className="rounded-lg border border-brand-cyan/30 bg-brand-cyan/10 px-2.5 py-1 text-xs font-semibold text-brand-cyan">
                      {trackById(t).name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-line-soft bg-surface-soft p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Talent Score (0–1000)</span>
                  <span className="font-mono font-bold text-brand-cyan">{activeModalStudent.talentScore} / 1000</span>
                </div>
                <div className="flex items-center justify-between text-copy-subtle text-[11px]">
                  <span>Dual Gate Status:</span>
                  <span className={activeModalStudent.gateCleared ? "text-brand-emerald font-bold" : "text-brand-amber"}>
                    {activeModalStudent.gateCleared ? "Dual Gate Unlocked 🔓" : "Phase 1 In Progress 🔒"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-line-soft">
              <button
                onClick={() => {
                  toast.success(`Score recalculation queued for ${activeModalStudent.name}`);
                  setSelectedStudentEmail(null);
                }}
                className="rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple px-4 py-2 text-xs font-bold text-surface-dark"
              >
                Trigger Recalculation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

