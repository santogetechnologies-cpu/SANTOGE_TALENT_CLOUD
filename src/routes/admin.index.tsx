import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Chip, Gauge, Meter, PageHeader, Panel, Stat } from "@/components/kit";
import { useAppStore, type HiringDrive } from "@/lib/app-store";
import { TRACKS, trackById, type TrackId } from "@/lib/tracks";
import {
  fetchLiveAdminAnalytics,
  fetchLiveStudentRoster,
  fetchLiveHiringDrives,
  createLiveHiringDrive,
  addLiveStudent,
  deleteLiveStudent,
  updateLiveBatch,
  useLiveBatches,
} from "@/lib/data";

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
  KeyRound,
  Trash2,
  AlertTriangle,
  Plus,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  AdminResetPasswordModal,
  type ResetPasswordStudent,
} from "@/components/admin-reset-password-modal";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Executive Analytics — SantoGe Talent Cloud" },
      {
        name: "description",
        content:
          "Platform-wide cohort readiness, bulk placement conversion, recruiter marketplace, and student roster across partner institutions.",
      },
      { property: "og:title", content: "Executive Analytics — SantoGe Talent Cloud" },
      { property: "og:description", content: "Platform-wide readiness and placement conversion." },
    ],
  }),
  component: AdminAnalytics,
});

function AdminAnalytics() {
  const store = useAppStore();
  const [selectedInst, setSelectedInst] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [trackFilter, setTrackFilter] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<"all" | "marketplace" | "ats" | "phase1">("all");
  const [selectedDriveId, setSelectedDriveId] = useState<string | null>(null);
  const [selectedStudentEmail, setSelectedStudentEmail] = useState<string | null>(null);
  const [resetTargetStudent, setResetTargetStudent] = useState<ResetPasswordStudent | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [deleteTargetStudent, setDeleteTargetStudent] = useState<{
    name: string;
    email: string;
    rollNo: string;
    batchId: string;
  } | null>(null);

  // New Requisition modal states
  const [isNewDriveModalOpen, setIsNewDriveModalOpen] = useState(false);
  const [newCompany, setNewCompany] = useState("");
  const [newRoles, setNewRoles] = useState("");
  const [newCtc, setNewCtc] = useState("₹8.0 - ₹10.5 LPA");
  const [newMinScore, setNewMinScore] = useState(660);
  const [newSlots, setNewSlots] = useState(50);
  const [newStatus, setNewStatus] = useState<HiringDrive["status"]>("Active Drive");

  // Add Student modal states
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [newStudentPassword, setNewStudentPassword] = useState("Temp@1234");
  const [newStudentRollNo, setNewStudentRollNo] = useState("");
  const [newStudentDept, setNewStudentDept] = useState("CSE");
  const [newStudentBatchId, setNewStudentBatchId] = useState("");
  const [newStudentCollege, setNewStudentCollege] = useState("");
  const [newStudentTracks, setNewStudentTracks] = useState<TrackId[]>(["mern"]);

  const readinessOf = (b: { enrolled: number; capacity: number }) =>
    Math.round((b.enrolled / Math.max(b.capacity, 1)) * 100);

  const queryClient = useQueryClient();

  // Live Supabase Queries
  const { data: liveAnalytics } = useQuery({
    queryKey: ["live", "admin-analytics", selectedInst],
    queryFn: () => fetchLiveAdminAnalytics(selectedInst),
  });

  const { data: liveDrives } = useQuery({
    queryKey: ["live", "hiring-drives"],
    queryFn: () => fetchLiveHiringDrives(),
  });

  const activeDrives = useMemo(() => {
    return liveDrives || [];
  }, [liveDrives]);

  const selectedDrive = useMemo(() => {
    return activeDrives.find((d) => d.id === selectedDriveId) || null;
  }, [activeDrives, selectedDriveId]);

  const { data: liveRoster } = useQuery({
    queryKey: [
      "live",
      "student-roster",
      selectedInst,
      searchQuery,
      trackFilter,
      tierFilter,
      selectedDriveId,
    ],
    queryFn: () =>
      fetchLiveStudentRoster({
        institutionId: selectedInst,
        searchQuery,
        trackId: trackFilter !== "all" ? trackFilter : undefined,
        tier: tierFilter !== "all" ? tierFilter : undefined,
        driveMinScore: selectedDrive?.minScore,
      }),
  });

  const { data: liveBatches } = useLiveBatches(true);
  const availableBatches = useMemo(() => {
    return liveBatches || [];
  }, [liveBatches]);

  // Institutions dropdown list
  const institutions = useMemo(() => {
    const list = liveAnalytics?.institutions || [];
    return [
      {
        id: "all",
        name:
          list.length > 0
            ? `All Partner Institutions (${list.length})`
            : "All Partner Institutions",
      },
      ...list.map((i) => ({ id: i.id, name: i.name })),
    ];
  }, [liveAnalytics?.institutions]);

  // KPI Metrics
  const totalEnrolled = liveAnalytics?.totalEnrolled ?? 0;
  const totalBatches = liveAnalytics?.totalBatches ?? 0;
  const avgReadiness = liveAnalytics?.avgReadiness ?? 0;
  const marketplacePercent = liveAnalytics?.marketplacePercent ?? 0;

  // Active Batches
  const activeBatches = (liveAnalytics?.batches ?? []).map((b) => ({
    id: b.id,
    name: b.name,
    dept: b.dept,
    capacity: b.capacity,
    enrolled: b.enrolled_count ?? 0,
    status: b.status,
    lastSync: b.last_sync_at ? new Date(b.last_sync_at).toLocaleTimeString() : null,
  }));

  // Placement Conversion Funnel
  const cohortFunnel = liveAnalytics?.funnel ?? [
    {
      label: "Total Provisioned Cohort",
      count: totalEnrolled,
      pct: 100,
      color: "var(--brand-cyan)",
    },
    { label: "Phase 1: Twin 30m Active", count: 0, pct: 0, color: "var(--brand-purple)" },
    {
      label: "Phase 1: Labs & Sandboxes Verified",
      count: 0,
      pct: 0,
      color: "var(--brand-emerald)",
    },
    { label: "Dual Gate: 100% Verified Cleared", count: 0, pct: 0, color: "var(--brand-amber)" },
    { label: "Phase 2: AI & Mentor Mock Panels", count: 0, pct: 0, color: "var(--brand-rose)" },
    { label: "Recruiter Offers & Marketplace Ready", count: 0, pct: 0, color: "#10b981" },
  ];

  // Filtered Students from Live Supabase Roster
  const filteredStudents = liveRoster?.items || [];

  const activeModalStudent =
    (liveRoster?.items || []).find((s) => s.email === selectedStudentEmail) || null;

  const modalReadiness = activeModalStudent?.readiness ?? {
    T: 65,
    C: 65,
    A: 60,
    E: 70,
    R: 50,
    M: 35,
  };

  const handleCreateHiringDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.trim() || !newRoles.trim()) {
      toast.error("Please provide company name and job roles");
      return;
    }

    const res = await createLiveHiringDrive({
      company: newCompany.trim(),
      roles: newRoles.trim(),
      ctc: newCtc.trim() || "₹8.0 - ₹10.0 LPA",
      minScore: Number(newMinScore) || 650,
      openSlots: Number(newSlots) || 50,
      status: newStatus,
    });
    if (res.ok) {
      queryClient.invalidateQueries({ queryKey: ["live", "hiring-drives"] });
      queryClient.invalidateQueries({ queryKey: ["live", "admin-analytics"] });
      toast.success(`Active hiring requisition published for ${newCompany}`);
    } else {
      toast.error(res.error || "Failed to create hiring drive in Supabase");
    }

    setNewCompany("");
    setNewRoles("");
    setIsNewDriveModalOpen(false);
  };

  const toggleNewStudentTrack = (trackId: TrackId) => {
    setNewStudentTracks((prev) => {
      if (prev.includes(trackId)) {
        if (prev.length === 1) {
          toast.info("Learners must have at least 1 technical track assigned");
          return prev;
        }
        return prev.filter((t) => t !== trackId);
      } else {
        if (prev.length >= 3) {
          toast.warning("Maximum 3 technical tracks can be assigned per learner");
          return prev;
        }
        return [...prev, trackId];
      }
    });
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) {
      toast.error("Please enter the student's full name");
      return;
    }
    if (!newStudentEmail.trim() || !newStudentEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (newStudentTracks.length === 0) {
      toast.error("Please select at least 1 technical track (max 3)");
      return;
    }
    if (!newStudentBatchId.trim()) {
      toast.error("Please select a batch");
      return;
    }
    if (!newStudentRollNo.trim()) {
      toast.error("Please enter a Roll / Student ID");
      return;
    }
    if (!newStudentDept.trim()) {
      toast.error("Please select or enter a department");
      return;
    }
    if (!newStudentCollege.trim()) {
      toast.error("Please enter the college / institution name");
      return;
    }

    const batchId = newStudentBatchId.trim();
    const password = newStudentPassword.trim() || "Temp@1234";

    const res = await addLiveStudent({
      name: newStudentName.trim(),
      email: newStudentEmail.trim().toLowerCase(),
      password: password,
      rollNo: newStudentRollNo.trim(),
      dept: newStudentDept.trim(),
      batchId: batchId,
      college: newStudentCollege.trim(),
      tracks: newStudentTracks,
    });

    if (res.ok) {
      queryClient.invalidateQueries({ queryKey: ["live", "student-roster"] });
      queryClient.invalidateQueries({ queryKey: ["live", "admin-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["live", "batches"] });
      toast.success(`Learner registered in Supabase backend!`);
      setIsAddStudentModalOpen(false);
      setNewStudentName("");
      setNewStudentEmail("");
      setNewStudentPassword("Temp@1234");
      setNewStudentRollNo("");
      setNewStudentDept("CSE");
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Dynamic Institution Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Executive Platform Analytics
          </h1>
          <p className="text-xs text-copy-subtle">
            Real-time cohort readiness, throughput, bulk placement conversion, and recruiter partner
            drives.
          </p>
        </div>

        {/* Institution Selector */}
        <div className="flex items-center gap-2">
          <Building2 className="size-4 text-brand-cyan shrink-0" />
          <select
            value={selectedInst}
            onChange={(e) => {
              setSelectedInst(e.target.value);
              const name = institutions.find((i) => i.id === e.target.value)?.name ?? "Institution";
              toast.info(`Filtering dashboard for ${name}`);
            }}
            className="rounded-xl border border-line-soft bg-surface-soft px-3 py-2 text-xs font-semibold text-foreground outline-none focus:border-brand-cyan/60"
          >
            {institutions.map((inst) => (
              <option key={inst.id} value={inst.id} className="bg-surface-dark text-foreground">
                {inst.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* High-Level Platform KPIs — 100% Computed Backend Data */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Total Enrolled Learners"
          value={totalEnrolled.toLocaleString()}
          hint={
            selectedInst === "all"
              ? institutions.length > 1
                ? `Across ${institutions.length - 1} partner institutions`
                : "Across partner institutions"
              : "In selected institution"
          }
        />
        <Stat
          label="Active Cohort Batches"
          value={totalBatches}
          accent="var(--brand-purple)"
          hint="100–300 learners per batch"
        />
        <Stat
          label="Avg Cohort Readiness"
          value={`${avgReadiness}%`}
          accent="var(--brand-cyan)"
          hint="Composite readiness index"
        />
        <Stat
          label="Marketplace Ready Learners"
          value={(liveAnalytics?.marketplaceReadyCount ?? 0).toLocaleString()}
          accent="var(--brand-emerald)"
          hint={`${marketplacePercent}% direct offer qualified`}
        />
      </div>

      {/* Cohort Health Gauge & Placement Funnel */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel
          title="Composite Platform Health"
          subtitle="Aggregated cohort readiness"
          className="flex flex-col items-center justify-center p-6"
        >
          <Gauge value={Math.min(1000, avgReadiness * 10)} label="Platform Index" />
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-center text-[11px] text-copy-subtle">
            <span className="rounded-full bg-brand-emerald/10 border border-brand-emerald/30 px-2.5 py-0.5 text-brand-emerald font-semibold">
              {activeBatches.length > 0
                ? `${Math.round((activeBatches.filter((b) => b.lastSync !== null).length / activeBatches.length) * 100) || 100}% Telegram Sync`
                : "100% Telegram Sync"}
            </span>
            <span className="rounded-full bg-brand-cyan/10 border border-brand-cyan/30 px-2.5 py-0.5 text-brand-cyan font-semibold">
              {TRACKS.length} Technical Tracks
            </span>
            <span className="rounded-full bg-brand-purple/10 border border-brand-purple/30 px-2.5 py-0.5 text-brand-purple font-semibold">
              {marketplacePercent}% Offer Ready
            </span>
          </div>
        </Panel>

        <Panel
          title="Placement Conversion Funnel"
          subtitle="Stage 0 CSV through Phase 2 Recruiter Offers"
          className="lg:col-span-2"
        >
          <div className="space-y-3.5">
            {cohortFunnel.length === 0 ? (
              <div className="rounded-xl border border-line-soft bg-surface-soft p-6 text-center text-xs text-copy-subtle">
                No cohort conversion data available. Onboard student learners to visualize the
                6-stage placement funnel.
              </div>
            ) : (
              cohortFunnel.map((f) => (
                <div key={f.label}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">{f.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-copy-subtle text-[11px]">
                        {f.count.toLocaleString()} learners
                      </span>
                      <span className="font-mono font-bold text-foreground">{f.pct}%</span>
                    </div>
                  </div>
                  <Meter value={f.pct} accent={f.color} />
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>

      {/* Live Batches & Track Demand */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Active Placement Batches"
          subtitle="Synchronized Placement cohorts (100–300 sizing)"
          action={<Chip tone="cyan">{activeBatches.length} cohorts</Chip>}
        >
          <div className="space-y-3">
            {activeBatches.map((b) => {
              const fill = readinessOf(b);
              return (
                <div
                  key={b.id}
                  className="rounded-xl border border-line-soft bg-surface-soft p-3.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-foreground">{b.name}</p>
                      <p className="text-[11px] text-copy-subtle">
                        {b.dept} · Capacity: {b.capacity} (Max 300)
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Chip tone={fill >= 80 ? "emerald" : "amber"}>{fill}% Fill Rate</Chip>
                      <button
                        type="button"
                        onClick={async () => {
                          await updateLiveBatch(b.id, { last_sync_at: new Date().toISOString() });
                          queryClient.invalidateQueries({ queryKey: ["live", "admin-analytics"] });
                          toast.success(`Batch ${b.name} synchronized with Telegram webhook`);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-line-soft bg-surface-dark px-2 py-1 text-[10px] font-semibold text-copy-subtle hover:text-brand-cyan hover:border-brand-cyan/50 transition-colors"
                        title="Trigger Batch Telegram Sync"
                      >
                        <RefreshCw className="size-2.5" />
                        <span>Sync</span>
                      </button>
                    </div>
                  </div>
                  <div className="mt-2.5">
                    <Meter value={fill} accent="var(--brand-purple)" />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-copy-subtle">
                    <span>
                      {b.enrolled} / {b.capacity} learners enrolled
                    </span>
                    <span className="text-brand-cyan font-mono">
                      {b.lastSync
                        ? `Synced: ${b.lastSync}`
                        : `Telegram: t.me/stc-${b.id.toLowerCase()}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        {/* Recruiter Hiring Drives — Persistent & Interactive */}
        <Panel
          title="Active Recruiter Hiring Drives"
          subtitle="Enterprise talent partner shortlists & requisition matching"
          action={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsNewDriveModalOpen(true)}
                className="inline-flex items-center gap-1 rounded-lg border border-brand-emerald/40 bg-brand-emerald/10 px-2.5 py-1 text-[11px] font-semibold text-brand-emerald hover:bg-brand-emerald/20 transition-colors"
              >
                <Plus className="size-3" />
                <span>Add Drive</span>
              </button>
              <Chip tone="emerald">{activeDrives.length} Drives</Chip>
            </div>
          }
        >
          <div className="space-y-2.5">
            {activeDrives.length === 0 ? (
              <div className="rounded-xl border border-line-soft bg-surface-soft p-6 text-center text-xs text-copy-subtle">
                <Briefcase className="mx-auto size-7 text-copy-subtle/50 mb-2" />
                <p className="font-semibold text-foreground">No active partner requisitions</p>
                <p className="text-[11px] text-copy-subtle mt-0.5">
                  Click &apos;Add Drive&apos; above to create and manage enterprise hiring drives.
                </p>
              </div>
            ) : (
              activeDrives.map((d) => {
                const eligible = (liveRoster?.items || []).filter(
                  (s) => s.talentScore >= d.minScore,
                ).length;
                const isSelected = selectedDriveId === d.id;
                return (
                  <div
                    key={d.id}
                    onClick={() => setSelectedDriveId(isSelected ? null : d.id)}
                    className={cn(
                      "flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3 transition-all cursor-pointer",
                      isSelected
                        ? "border-brand-cyan bg-brand-cyan/10 shadow-md shadow-brand-cyan/5 ring-1 ring-brand-cyan/40"
                        : "border-line-soft bg-surface-soft hover:border-line-soft/80 hover:bg-surface-soft/80",
                    )}
                    title="Click to filter Student Roster by this requisition"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-foreground">{d.company}</p>
                        <span className="rounded bg-brand-emerald/10 border border-brand-emerald/30 px-1.5 py-0.5 text-[9px] font-semibold text-brand-emerald">
                          {d.status}
                        </span>
                        {isSelected && (
                          <span className="rounded bg-brand-cyan/20 border border-brand-cyan/40 px-1.5 py-0.5 text-[9px] font-bold text-brand-cyan">
                            Active Filter
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-copy-subtle">
                        {d.roles} · {d.ctc}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <p className="font-mono text-xs font-bold text-brand-cyan">
                          {d.openSlots} Openings
                        </p>
                        <p className="text-[10px] text-copy-subtle">
                          Min Talent Score: {d.minScore}
                        </p>
                      </div>
                      <div className="rounded-lg bg-surface-dark border border-line-soft px-2.5 py-1 text-center">
                        <p className="font-mono text-xs font-bold text-brand-emerald">{eligible}</p>
                        <p className="text-[9px] text-copy-subtle">Eligible</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Panel>
      </div>

      {/* Comprehensive Student Cohort Roster Table */}
      <Panel
        title="Student Roster & Cohort Management"
        subtitle="Individual 1–3 technical tracks & placement accelerator progress across all provisioned learners"
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (!newStudentBatchId && availableBatches.length > 0) {
                  setNewStudentBatchId(availableBatches[0]?.id || "BATCH-2026-ABC-CSE-01");
                }
                setIsAddStudentModalOpen(true);
              }}

              className="inline-flex items-center gap-1.5 rounded-xl border border-brand-purple/40 bg-brand-purple/10 px-3 py-1.5 text-xs font-semibold text-brand-purple hover:bg-brand-purple/20 transition-colors shadow-sm"
            >
              <Plus className="size-3.5" />
              <span>+ Add Student</span>
            </button>
            <Chip tone="purple">{filteredStudents.length} Students Shown</Chip>
          </div>
        }
      >
        {/* Active Hiring Drive Filter Banner */}
        {selectedDrive && (
          <div className="mb-4 flex items-center justify-between rounded-xl border border-brand-cyan/40 bg-brand-cyan/10 p-3 text-xs">
            <div className="flex items-center gap-2 text-brand-cyan font-medium">
              <Briefcase className="size-4 shrink-0" />
              <span>
                Filtered by requisition:{" "}
                <strong className="text-foreground">{selectedDrive.company}</strong> (
                {selectedDrive.roles}) · Requiring min Talent Score{" "}
                <strong className="text-foreground">{selectedDrive.minScore}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedDriveId(null)}
              className="inline-flex items-center gap-1 rounded-lg bg-surface-dark border border-line-soft px-2.5 py-1 text-[11px] font-semibold text-foreground hover:text-brand-rose transition-colors"
            >
              <X className="size-3" />
              <span>Clear Filter</span>
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 size-3.5 text-copy-subtle" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, roll no, batch, email, dept…"
              className="w-full rounded-xl border border-line-soft bg-surface-soft pl-9 pr-3 py-2 text-xs text-foreground outline-none placeholder:text-copy-subtle focus:border-brand-cyan/60"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
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

            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="size-3.5 text-copy-subtle" />
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value as typeof tierFilter)}
                className="rounded-xl border border-line-soft bg-surface-soft px-3 py-2 text-xs font-medium text-foreground outline-none focus:border-brand-cyan/60"
              >
                <option value="all">All Status Tiers</option>
                <option value="marketplace">Marketplace Ready (700+)</option>
                <option value="ats">ATS Unlocked (450–699)</option>
                <option value="phase1">Phase 1 Learning (&lt;450)</option>
              </select>
            </div>
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
                    <p className="text-[11px] text-copy-subtle">
                      {s.dept} · {s.college}
                    </p>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="rounded-md border border-line-soft bg-surface-soft px-2 py-0.5 font-mono text-[11px]">
                      {s.batchId}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-wrap gap-1">
                      {Array.from(new Set(s.tracks || [])).map((tid, idx) => {
                        const track = trackById(tid);
                        return (
                          <span
                            key={`${s.email}-${tid}-${idx}`}
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
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setResetTargetStudent({
                            name: s.name,
                            email: s.email,
                            rollNo: s.rollNo,
                            batchId: s.batchId,
                            dept: s.dept,
                            college: s.college,
                          });
                          setIsResetModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-line-soft bg-surface-soft px-2 py-1 text-[11px] font-semibold text-copy-subtle hover:text-brand-purple hover:border-brand-purple/60 transition-colors"
                        title="Reset Student Password"
                      >
                        <KeyRound className="size-3" />
                        <span className="hidden sm:inline">Reset Pass</span>
                      </button>
                      <button
                        onClick={() => setSelectedStudentEmail(s.email)}
                        className="inline-flex items-center gap-1 rounded-lg border border-line-soft bg-surface-soft px-2.5 py-1 text-[11px] font-semibold text-foreground hover:border-brand-cyan/60"
                      >
                        <Eye className="size-3" /> Details
                      </button>
                      <button
                        onClick={() => {
                          setDeleteTargetStudent({
                            name: s.name,
                            email: s.email,
                            rollNo: s.rollNo,
                            batchId: s.batchId,
                          });
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-line-soft bg-surface-soft px-2 py-1 text-[11px] font-semibold text-copy-subtle hover:text-brand-rose hover:border-brand-rose/60 hover:bg-brand-rose/10 transition-colors"
                        title="Delete Student from Cohort"
                      >
                        <Trash2 className="size-3" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-copy-subtle">
                    <GraduationCap className="mx-auto size-8 text-copy-subtle/50 mb-2" />
                    <p className="font-semibold text-foreground">
                      {totalEnrolled === 0
                        ? "No students have been enrolled or provisioned yet"
                        : "No learners match the specified search or filter criteria"}
                    </p>
                    <p className="text-[11px] text-copy-subtle mt-1 max-w-sm mx-auto">
                      {totalEnrolled === 0
                        ? "Use '+ Add Student' above or import a cohort roster in Bulk CSV Provisioning to activate learners."
                        : "Try adjusting your search query, technical track filter, or status tier filter."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Student Details Modal (Learner Profile Audit) */}
      {activeModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-ink/75 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl border border-line-soft bg-surface-elevated p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-line-soft pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="size-5 text-brand-cyan" />
                <h3 className="font-display text-base font-bold text-foreground">
                  Learner Profile Audit
                </h3>
              </div>
              <button
                onClick={() => setSelectedStudentEmail(null)}
                className="text-copy-subtle hover:text-foreground"
              >
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
                  <p className="font-mono font-bold text-foreground mt-0.5">
                    {activeModalStudent.rollNo}
                  </p>
                </div>
                <div>
                  <p className="text-copy-subtle">Email Address</p>
                  <p className="font-mono text-copy-subtle mt-0.5">{activeModalStudent.email}</p>
                </div>
                <div>
                  <p className="text-copy-subtle">Placement Batch</p>
                  <p className="font-mono text-brand-purple font-bold mt-0.5">
                    {activeModalStudent.batchId}
                  </p>
                </div>
              </div>

              <div>
                <p className="font-semibold text-foreground mb-1.5">
                  Assigned Technical Learning Tracks (1–3):
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {Array.from(new Set(activeModalStudent.tracks || [])).map((t, idx) => (
                    <span
                      key={`${activeModalStudent.email}-${t}-${idx}`}
                      className="rounded-lg border border-brand-cyan/30 bg-brand-cyan/10 px-2.5 py-1 text-xs font-semibold text-brand-cyan"
                    >
                      {trackById(t).name}
                    </span>
                  ))}
                </div>
              </div>

              {/* T·C·A·E·R·M Readiness Dimensions Audit Breakdown */}
              <div className="rounded-xl border border-line-soft bg-surface-soft p-3 space-y-2.5">
                <div className="flex items-center justify-between border-b border-line-soft pb-1.5">
                  <span className="font-semibold text-foreground">
                    T·C·A·E·R·M Composite Breakdown
                  </span>
                  <span className="font-mono font-bold text-brand-cyan">
                    {activeModalStudent.talentScore} / 1000
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <div className="flex justify-between text-copy-subtle mb-0.5">
                      <span>Technical (25%):</span>
                      <span className="font-mono font-bold text-foreground">
                        {modalReadiness.T}%
                      </span>
                    </div>
                    <Meter value={modalReadiness.T} accent="var(--brand-cyan)" />
                  </div>
                  <div>
                    <div className="flex justify-between text-copy-subtle mb-0.5">
                      <span>Placement (20%):</span>
                      <span className="font-mono font-bold text-foreground">
                        {modalReadiness.C}%
                      </span>
                    </div>
                    <Meter value={modalReadiness.C} accent="var(--brand-purple)" />
                  </div>
                  <div>
                    <div className="flex justify-between text-copy-subtle mb-0.5">
                      <span>Aptitude (15%):</span>
                      <span className="font-mono font-bold text-foreground">
                        {modalReadiness.A}%
                      </span>
                    </div>
                    <Meter value={modalReadiness.A} accent="var(--brand-amber)" />
                  </div>
                  <div>
                    <div className="flex justify-between text-copy-subtle mb-0.5">
                      <span>English (15%):</span>
                      <span className="font-mono font-bold text-foreground">
                        {modalReadiness.E}%
                      </span>
                    </div>
                    <Meter value={modalReadiness.E} accent="var(--brand-emerald)" />
                  </div>
                  <div>
                    <div className="flex justify-between text-copy-subtle mb-0.5">
                      <span>Resume (15%):</span>
                      <span className="font-mono font-bold text-foreground">
                        {modalReadiness.R}%
                      </span>
                    </div>
                    <Meter value={modalReadiness.R} accent="var(--brand-rose)" />
                  </div>
                  <div>
                    <div className="flex justify-between text-copy-subtle mb-0.5">
                      <span>Mock / Soft (10%):</span>
                      <span className="font-mono font-bold text-foreground">
                        {modalReadiness.M}%
                      </span>
                    </div>
                    <Meter value={modalReadiness.M} accent="#10b981" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-copy-subtle text-[11px] pt-1 border-t border-line-soft/60">
                  <span>Placement Day: Day {activeModalStudent.placementDay}/90</span>
                  <span>Talent Score: {activeModalStudent.talentScore}/1000</span>
                  <span
                    className={
                      activeModalStudent.gateCleared
                        ? "text-brand-emerald font-bold"
                        : "text-brand-amber"
                    }
                  >
                    {activeModalStudent.gateCleared ? "Dual Gate Cleared 🔓" : "Phase 1 Active 🔒"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center gap-2 pt-2 border-t border-line-soft">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteTargetStudent({
                      name: activeModalStudent.name,
                      email: activeModalStudent.email,
                      rollNo: activeModalStudent.rollNo,
                      batchId: activeModalStudent.batchId,
                    });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-brand-rose/40 bg-brand-rose/10 px-3 py-2 text-xs font-semibold text-brand-rose hover:bg-brand-rose/20 transition-colors"
                >
                  <Trash2 className="size-3.5" />
                  <span>Delete</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setResetTargetStudent({
                      name: activeModalStudent.name,
                      email: activeModalStudent.email,
                      rollNo: activeModalStudent.rollNo,
                      batchId: activeModalStudent.batchId,
                      dept: activeModalStudent.dept,
                      college: activeModalStudent.college,
                    });
                    setIsResetModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-brand-purple/40 bg-brand-purple/10 px-3 py-2 text-xs font-semibold text-brand-purple hover:bg-brand-purple/20 transition-colors"
                >
                  <KeyRound className="size-3.5" />
                  <span>Reset Pass</span>
                </button>
              </div>
              <button
                onClick={() => {
                  store.recalculateStudentScore(activeModalStudent.email);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple px-4 py-2 text-xs font-bold text-surface-dark shadow-md hover:opacity-90 transition-opacity"
              >
                <Sparkles className="size-3.5" />
                <span>Trigger Recalculation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Reset Password Modal */}
      <AdminResetPasswordModal
        isOpen={isResetModalOpen}
        student={resetTargetStudent}
        onClose={() => {
          setIsResetModalOpen(false);
          setResetTargetStudent(null);
        }}
      />

      {/* Delete Confirmation Modal */}
      {deleteTargetStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-ink/75 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-line-soft bg-surface-elevated p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 border-b border-line-soft pb-3">
              <div className="grid size-10 place-items-center rounded-xl bg-brand-rose/15 text-brand-rose border border-brand-rose/30">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-foreground">
                  Remove Learner from Roster?
                </h3>
                <p className="text-xs text-copy-subtle">
                  This action permanently removes the student from this cohort
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-line-soft bg-surface-soft p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-copy-subtle font-medium">Student Name:</span>
                <span className="font-bold text-foreground">{deleteTargetStudent.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-copy-subtle font-medium">Email Address:</span>
                <span className="font-mono text-copy-subtle">{deleteTargetStudent.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-copy-subtle font-medium">Roll Number:</span>
                <span className="font-mono font-semibold text-foreground">
                  {deleteTargetStudent.rollNo}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-copy-subtle font-medium">Cohort Batch:</span>
                <span className="font-mono font-bold text-brand-purple">
                  {deleteTargetStudent.batchId}
                </span>
              </div>
            </div>

            <p className="text-xs text-copy-subtle leading-relaxed">
              Removing this student will permanently delete their progress, revoke active portal
              access, update cohort batch headcount, and record the removal in the audit log.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-line-soft">
              <button
                type="button"
                onClick={() => setDeleteTargetStudent(null)}
                className="rounded-xl border border-line-soft bg-surface-soft px-4 py-2 text-xs font-semibold text-copy-subtle hover:text-foreground hover:bg-surface-elevated transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const target = (liveRoster?.items || []).find(
                    (s) => s.email === deleteTargetStudent.email,
                  );
                  const identifier = target?.id || deleteTargetStudent.email;
                  const res = await deleteLiveStudent(identifier);
                  if (res.ok) {
                    await Promise.all([
                      queryClient.invalidateQueries({ queryKey: ["live", "student-roster"] }),
                      queryClient.invalidateQueries({ queryKey: ["live", "admin-analytics"] }),
                      queryClient.invalidateQueries({ queryKey: ["live", "batches"] }),
                    ]);
                    toast.success(`Student profile archived from live database`);
                  } else {
                    toast.error(res.error || "Failed to delete student");
                  }

                  if (selectedStudentEmail === deleteTargetStudent.email) {
                    setSelectedStudentEmail(null);
                  }
                  setDeleteTargetStudent(null);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-rose px-4 py-2 text-xs font-bold text-white hover:bg-brand-rose/90 shadow-lg shadow-brand-rose/20 transition-colors"
              >
                <Trash2 className="size-3.5" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Enterprise Hiring Drive Requisition Modal */}
      {isNewDriveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-ink/75 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-line-soft bg-surface-elevated p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-line-soft pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="size-5 text-brand-emerald" />
                <h3 className="font-display text-base font-bold text-foreground">
                  New Enterprise Hiring Requisition
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewDriveModalOpen(false)}
                className="text-copy-subtle hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateHiringDrive} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">
                  Enterprise Partner / Company
                </label>
                <input
                  type="text"
                  required
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  placeholder="e.g. Amazon Web Services, Oracle, Microsoft IDC"
                  className="w-full rounded-xl border border-line-soft bg-surface-soft px-3 py-2 text-xs text-foreground outline-none focus:border-brand-emerald/60"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Target Job Roles</label>
                <input
                  type="text"
                  required
                  value={newRoles}
                  onChange={(e) => setNewRoles(e.target.value)}
                  placeholder="e.g. Cloud Solutions Engineer, Full Stack Associate"
                  className="w-full rounded-xl border border-line-soft bg-surface-soft px-3 py-2 text-xs text-foreground outline-none focus:border-brand-emerald/60"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Offered CTC Package
                  </label>
                  <input
                    type="text"
                    value={newCtc}
                    onChange={(e) => setNewCtc(e.target.value)}
                    placeholder="₹8.0 - ₹11.0 LPA"
                    className="w-full rounded-xl border border-line-soft bg-surface-soft px-3 py-2 text-xs text-foreground outline-none focus:border-brand-emerald/60"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Min Talent Score (0–1000)
                  </label>
                  <input
                    type="number"
                    min={400}
                    max={950}
                    value={newMinScore}
                    onChange={(e) => setNewMinScore(Number(e.target.value))}
                    className="w-full rounded-xl border border-line-soft bg-surface-soft px-3 py-2 text-xs text-foreground outline-none focus:border-brand-emerald/60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Open Slots</label>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={newSlots}
                    onChange={(e) => setNewSlots(Number(e.target.value))}
                    className="w-full rounded-xl border border-line-soft bg-surface-soft px-3 py-2 text-xs text-foreground outline-none focus:border-brand-emerald/60"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Requisition Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as HiringDrive["status"])}
                    className="w-full rounded-xl border border-line-soft bg-surface-soft px-3 py-2 text-xs text-foreground outline-none focus:border-brand-emerald/60"
                  >
                    <option value="Active Drive">Active Drive</option>
                    <option value="Shortlisting">Shortlisting</option>
                    <option value="Interviews Live">Interviews Live</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-line-soft">
                <button
                  type="button"
                  onClick={() => setIsNewDriveModalOpen(false)}
                  className="rounded-xl border border-line-soft bg-surface-soft px-4 py-2 text-xs font-semibold text-copy-subtle hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-brand-emerald px-4 py-2 text-xs font-bold text-surface-dark hover:bg-brand-emerald/90 transition-colors"
                >
                  <Plus className="size-3.5" />
                  <span>Create Requisition</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Student Learner Modal */}
      {isAddStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-ink/75 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl border border-line-soft bg-surface-elevated p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between border-b border-line-soft pb-3">
              <div className="flex items-center gap-2.5">
                <div className="grid size-9 place-items-center rounded-xl bg-brand-purple/15 text-brand-purple border border-brand-purple/30">
                  <GraduationCap className="size-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-foreground">
                    Add New Student Learner
                  </h3>
                  <p className="text-[11px] text-copy-subtle">
                    Creates instant portal credentials, cohort sync, and technical track assignment.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddStudentModalOpen(false)}
                className="text-copy-subtle hover:text-foreground text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Student Full Name <span className="text-brand-rose">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    placeholder="e.g. Arun Kumar"
                    className="w-full rounded-xl border border-line-soft bg-surface-soft px-3 py-2 text-xs text-foreground outline-none focus:border-brand-purple/60"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Student Login Email <span className="text-brand-rose">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={newStudentEmail}
                    onChange={(e) => setNewStudentEmail(e.target.value)}
                    placeholder="e.g. arun@college.edu"
                    className="w-full rounded-xl border border-line-soft bg-surface-soft px-3 py-2 text-xs text-foreground outline-none focus:border-brand-purple/60 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Login Password <span className="text-brand-rose">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newStudentPassword}
                    onChange={(e) => setNewStudentPassword(e.target.value)}
                    placeholder="Temp@1234"
                    className="w-full rounded-xl border border-line-soft bg-surface-soft px-3 py-2 text-xs text-foreground outline-none focus:border-brand-purple/60 font-mono"
                  />
                  <span className="text-[10px] text-copy-subtle mt-0.5 block">
                    Learner uses this password to log in
                  </span>
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Roll / Registration Number
                  </label>
                  <input
                    type="text"
                    value={newStudentRollNo}
                    onChange={(e) => setNewStudentRollNo(e.target.value)}
                    placeholder="e.g. 22CS099"
                    className="w-full rounded-xl border border-line-soft bg-surface-soft px-3 py-2 text-xs text-foreground outline-none focus:border-brand-purple/60 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Department</label>
                  <select
                    value={newStudentDept}
                    onChange={(e) => setNewStudentDept(e.target.value)}
                    className="w-full rounded-xl border border-line-soft bg-surface-soft px-3 py-2 text-xs text-foreground outline-none focus:border-brand-purple/60"
                  >
                    <option value="CSE">CSE (Computer Science)</option>
                    <option value="IT">IT (Information Technology)</option>
                    <option value="ECE">ECE (Electronics & Comm)</option>
                    <option value="EEE">EEE (Electrical & Electronics)</option>
                    <option value="MECH">MECH (Mechanical)</option>
                    <option value="AIDS">AI & Data Science</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Placement Accelerator Cohort <span className="text-brand-rose">*</span>
                  </label>
                  <select
                    value={newStudentBatchId || availableBatches[0]?.id || ""}
                    onChange={(e) => setNewStudentBatchId(e.target.value)}
                    className="w-full rounded-xl border border-line-soft bg-surface-soft px-3 py-2 text-xs text-foreground outline-none focus:border-brand-purple/60"
                  >
                    {availableBatches.map((b) => {
                      const enrolled = b.enrolled_count ?? 0;
                      return (
                        <option key={b.id} value={b.id}>
                          {b.name} ({enrolled}/{b.capacity})
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">
                  Institution / College
                </label>
                <input
                  type="text"
                  value={newStudentCollege}
                  onChange={(e) => setNewStudentCollege(e.target.value)}
                  placeholder="e.g. PSG College of Technology"
                  className="w-full rounded-xl border border-line-soft bg-surface-soft px-3 py-2 text-xs text-foreground outline-none focus:border-brand-purple/60"
                />
              </div>

              {/* Technical Tracks Picker (1 to 3 tracks) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-foreground">
                    Assign Technical Learning Tracks ({newStudentTracks.length}/3 selected)
                  </label>
                  <span className="text-[10px] text-copy-subtle">Choose 1 to 3 tracks</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-40 overflow-y-auto p-1.5 rounded-xl border border-line-soft bg-surface-soft">
                  {TRACKS.map((track) => {
                    const isSelected = newStudentTracks.includes(track.id);
                    return (
                      <button
                        type="button"
                        key={track.id}
                        onClick={() => toggleNewStudentTrack(track.id)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-left text-[11px] transition-all",
                          isSelected
                            ? "border-brand-purple bg-brand-purple/20 text-foreground font-semibold shadow-sm"
                            : "border-line-soft bg-surface-dark/60 text-copy-subtle hover:border-line-soft/80 hover:text-foreground",
                        )}
                      >
                        <span
                          className="size-2 rounded-full"
                          style={{ backgroundColor: track.accent }}
                        />
                        <span className="truncate">{track.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl border border-brand-emerald/30 bg-brand-emerald/10 p-2.5 text-[11px] text-brand-emerald flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>
                  Adding this student enables immediate login at{" "}
                  <strong className="text-foreground">/login</strong>. Credentials are automatically
                  synced with local store authentication.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-line-soft">
                <button
                  type="button"
                  onClick={() => setIsAddStudentModalOpen(false)}
                  className="rounded-xl border border-line-soft bg-surface-soft px-4 py-2 text-xs font-semibold text-copy-subtle hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan px-4 py-2 text-xs font-bold text-surface-dark hover:opacity-95 shadow-lg shadow-brand-purple/20 transition-opacity"
                >
                  <Plus className="size-3.5" />
                  <span>Register & Enable Login</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
