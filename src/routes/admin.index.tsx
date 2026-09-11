import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
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
  useBatchLookup,
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
    placeholderData: (prev) => prev,
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
    placeholderData: (prev) => prev,
  });

  const { data: liveBatches } = useLiveBatches(true);
  const { getBatchName } = useBatchLookup(true);
  const availableBatches = useMemo(() => {
    return liveBatches || [];
  }, [liveBatches]);

  // Institutions dropdown list (cached so options never vanish during transitions)
  const [cachedInstitutions, setCachedInstitutions] = useState<Array<{ id: string; name: string }>>(
    [],
  );

  useEffect(() => {
    if (liveAnalytics?.institutions && liveAnalytics.institutions.length > 0) {
      setCachedInstitutions(liveAnalytics.institutions.map((i) => ({ id: i.id, name: i.name })));
    }
  }, [liveAnalytics?.institutions]);

  const institutions = useMemo(() => {
    const list =
      liveAnalytics?.institutions && liveAnalytics.institutions.length > 0
        ? liveAnalytics.institutions
        : cachedInstitutions;

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
  }, [liveAnalytics?.institutions, cachedInstitutions]);

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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header with Dynamic Institution Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Executive Platform Analytics
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time cohort readiness, throughput, bulk placement conversion, and recruiter partner
            drives.
          </p>
        </div>

        {/* Institution Selector */}
        <div className="flex items-center gap-2">
          <Building2 className="size-4 text-primary shrink-0" />
          <select
            value={selectedInst}
            onChange={(e) => {
              setSelectedInst(e.target.value);
              const name = institutions.find((i) => i.id === e.target.value)?.name ?? "Institution";
              toast.info(`Filtering dashboard for ${name}`);
            }}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
          >
            {institutions.map((inst) => (
              <option key={inst.id} value={inst.id} className="bg-card text-foreground">
                {inst.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* High-Level Platform KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Total Enrolled Learners"
          value={totalEnrolled.toLocaleString()}
          tone="brand"
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
          tone="purple"
          hint="100–300 learners per batch"
        />
        <Stat
          label="Avg Cohort Readiness"
          value={`${avgReadiness}%`}
          tone="cyan"
          hint="Composite readiness index"
        />
        <Stat
          label="Marketplace Ready Learners"
          value={(liveAnalytics?.marketplaceReadyCount ?? 0).toLocaleString()}
          tone="emerald"
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
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-center text-[11px]">
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              {activeBatches.length > 0
                ? `${Math.round((activeBatches.filter((b) => b.lastSync !== null).length / activeBatches.length) * 100) || 100}% Telegram Sync`
                : "100% Telegram Sync"}
            </span>
            <span className="rounded-full bg-primary/10 border border-primary/30 px-2.5 py-0.5 text-primary font-semibold">
              {TRACKS.length} Technical Tracks
            </span>
            <span className="rounded-full bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-0.5 text-indigo-600 dark:text-indigo-400 font-semibold">
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
              <div className="rounded-xl border border-border bg-muted/20 p-6 text-center text-xs text-muted-foreground">
                No cohort conversion data available. Onboard student learners to visualize the
                6-stage placement funnel.
              </div>
            ) : (
              cohortFunnel.map((f) => (
                <div key={f.label}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">{f.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-muted-foreground text-[11px]">
                        {f.count.toLocaleString()} learners
                      </span>
                      <span className="font-mono font-bold text-foreground">{f.pct}%</span>
                    </div>
                  </div>
                  <Meter value={f.pct} tone="brand" />
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
                  className="rounded-xl border border-border bg-card p-4 shadow-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{b.name}</p>
                      <p className="text-xs text-muted-foreground">
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
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/60 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="Trigger Batch Telegram Sync"
                      >
                        <RefreshCw className="size-3" />
                        <span>Sync</span>
                      </button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Meter value={fill} tone="brand" />
                  </div>
                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>
                      {b.enrolled} / {b.capacity} learners enrolled
                    </span>
                    <span className="text-primary font-mono font-medium">
                      {b.lastSync
                        ? `Synced: ${b.lastSync}`
                        : `Telegram: t.me/stc-${b.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        {/* Recruiter Hiring Drives */}
        <Panel
          title="Active Recruiter Hiring Drives"
          subtitle="Enterprise talent partner shortlists & requisition matching"
          action={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsNewDriveModalOpen(true)}
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-xs"
              >
                <Plus className="size-3.5 text-primary" />
                <span>Add Drive</span>
              </button>
              <Chip tone="emerald">{activeDrives.length} Drives</Chip>
            </div>
          }
        >
          <div className="space-y-2.5">
            {activeDrives.length === 0 ? (
              <div className="rounded-xl border border-border bg-muted/20 p-6 text-center text-xs text-muted-foreground">
                <Briefcase className="mx-auto size-7 text-muted-foreground/60 mb-2" />
                <p className="font-semibold text-foreground">No active partner requisitions</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Click 'Add Drive' above to create and manage enterprise hiring drives.
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
                      "flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3.5 transition-all cursor-pointer bg-card shadow-xs",
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border hover:border-border/80 hover:bg-muted/30",
                    )}
                    title="Click to filter Student Roster by this requisition"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-foreground">{d.company}</p>
                        <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                          {d.status}
                        </span>
                        {isSelected && (
                          <span className="rounded bg-primary/20 border border-primary/40 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                            Active Filter
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {d.roles} · {d.ctc}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <p className="font-mono text-xs font-bold text-primary">
                          {d.openSlots} Openings
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Min Talent Score: {d.minScore}
                        </p>
                      </div>
                      <div className="rounded-lg bg-muted/60 border border-border px-2.5 py-1 text-center">
                        <p className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">{eligible}</p>
                        <p className="text-[9px] text-muted-foreground font-medium">Eligible</p>
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
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
            >
              <Plus className="size-3.5" />
              <span>+ Add Student</span>
            </button>
            <Chip tone="purple">{filteredStudents.length} Students</Chip>
          </div>
        }
      >
        {/* Active Hiring Drive Filter Banner */}
        {selectedDrive && (
          <div className="mb-4 flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 p-3 text-xs">
            <div className="flex items-center gap-2 text-primary font-medium">
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
              className="inline-flex items-center gap-1 rounded-md bg-card border border-border px-2.5 py-1 text-xs font-semibold text-foreground hover:text-destructive transition-colors shadow-xs"
            >
              <X className="size-3.5" />
              <span>Clear Filter</span>
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, roll no, batch, email, dept…"
              className="w-full rounded-lg border border-border bg-card pl-9 pr-3 py-1.5 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Filter className="size-3.5 text-muted-foreground" />
              <select
                value={trackFilter}
                onChange={(e) => setTrackFilter(e.target.value)}
                className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
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
              <SlidersHorizontal className="size-3.5 text-muted-foreground" />
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value as typeof tierFilter)}
                className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
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
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/40 text-muted-foreground">
              <tr>
                <th className="py-2.5 px-3.5 font-semibold">Student Learner</th>
                <th className="py-2.5 px-3.5 font-semibold">Roll No &amp; Dept</th>
                <th className="py-2.5 px-3.5 font-semibold">Placement Batch</th>
                <th className="py-2.5 px-3.5 font-semibold">Assigned Tracks</th>
                <th className="py-2.5 px-3.5 font-semibold">Talent Score</th>
                <th className="py-2.5 px-3.5 font-semibold">Status</th>
                <th className="py-2.5 px-3.5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {filteredStudents.map((s) => (
                <tr key={s.email} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-3.5">
                    <p className="font-semibold text-foreground">{s.name}</p>
                    <p className="text-[11px] font-mono text-muted-foreground">{s.email}</p>
                  </td>
                  <td className="py-3 px-3.5">
                    <p className="font-mono font-medium">{s.rollNo}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {s.dept} · {s.college}
                    </p>
                  </td>
                  <td className="py-3 px-3.5">
                    <span className="rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-foreground">
                      {s.batchName || getBatchName(s.batchId)}
                    </span>
                  </td>
                  <td className="py-3 px-3.5">
                    <div className="flex flex-wrap gap-1">
                      {Array.from(new Set(s.tracks || [])).map((tid, idx) => {
                        const track = trackById(tid);
                        return (
                          <span
                            key={`${s.email}-${tid}-${idx}`}
                            className="rounded px-1.5 py-0.5 text-[10px] font-medium border border-border bg-muted/30 text-muted-foreground"
                          >
                            {track.short}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="py-3 px-3.5 font-mono font-bold text-primary">
                    {s.talentScore}/1000
                  </td>
                  <td className="py-3 px-3.5">
                    {s.talentScore >= 700 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="size-3" /> Marketplace
                      </span>
                    ) : s.talentScore >= 450 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                        <Sparkles className="size-3" /> ATS Unlocked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                        <AlertCircle className="size-3" /> Phase 1
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setResetTargetStudent({
                            name: s.name,
                            email: s.email,
                            rollNo: s.rollNo,
                            batchId: s.batchName || getBatchName(s.batchId),
                            dept: s.dept,
                            college: s.college,
                          });
                          setIsResetModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-xs"
                        title="Reset Student Password"
                      >
                        <KeyRound className="size-3" />
                        <span className="hidden sm:inline">Pass</span>
                      </button>
                      <button
                        onClick={() => setSelectedStudentEmail(s.email)}
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-[11px] font-semibold text-foreground hover:bg-muted transition-colors shadow-xs"
                      >
                        <Eye className="size-3" /> Details
                      </button>
                      <button
                        onClick={() => {
                          setDeleteTargetStudent({
                            name: s.name,
                            email: s.email,
                            rollNo: s.rollNo,
                            batchId: s.batchName || getBatchName(s.batchId),
                          });
                        }}
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-[11px] font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shadow-xs"
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
                  <td colSpan={7} className="py-12 text-center text-xs text-muted-foreground">
                    <GraduationCap className="mx-auto size-8 text-muted-foreground/50 mb-2" />
                    <p className="font-semibold text-foreground">
                      {totalEnrolled === 0
                        ? "No students have been enrolled or provisioned yet"
                        : "No learners match the specified search or filter criteria"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="size-5 text-primary" />
                <h3 className="text-base font-semibold text-foreground">
                  Learner Profile Audit
                </h3>
              </div>
              <button
                onClick={() => setSelectedStudentEmail(null)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-muted/20 p-3.5">
                <div>
                  <p className="text-muted-foreground">Student Name</p>
                  <p className="font-semibold text-foreground mt-0.5">{activeModalStudent.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Roll Number</p>
                  <p className="font-mono font-semibold text-foreground mt-0.5">
                    {activeModalStudent.rollNo}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email Address</p>
                  <p className="font-mono text-muted-foreground mt-0.5">{activeModalStudent.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Placement Batch</p>
                  <p className="text-foreground font-semibold mt-0.5">
                    {activeModalStudent.batchName || getBatchName(activeModalStudent.batchId)}
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
                      className="rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"
                    >
                      {trackById(t).name}
                    </span>
                  ))}
                </div>
              </div>

              {/* T·C·A·E·R·M Readiness Dimensions Audit Breakdown */}
              <div className="rounded-xl border border-border bg-card p-3.5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="font-semibold text-foreground">
                    T·C·A·E·R·M Composite Breakdown
                  </span>
                  <span className="font-mono font-bold text-primary">
                    {activeModalStudent.talentScore} / 1000
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2.5 text-[11px]">
                  <div>
                    <div className="flex justify-between text-muted-foreground mb-1">
                      <span>Technical (25%):</span>
                      <span className="font-mono font-bold text-foreground">
                        {modalReadiness.T}%
                      </span>
                    </div>
                    <Meter value={modalReadiness.T} tone="brand" />
                  </div>
                  <div>
                    <div className="flex justify-between text-muted-foreground mb-1">
                      <span>Placement (20%):</span>
                      <span className="font-mono font-bold text-foreground">
                        {modalReadiness.C}%
                      </span>
                    </div>
                    <Meter value={modalReadiness.C} tone="brand" />
                  </div>
                  <div>
                    <div className="flex justify-between text-muted-foreground mb-1">
                      <span>Aptitude (15%):</span>
                      <span className="font-mono font-bold text-foreground">
                        {modalReadiness.A}%
                      </span>
                    </div>
                    <Meter value={modalReadiness.A} tone="brand" />
                  </div>
                  <div>
                    <div className="flex justify-between text-muted-foreground mb-1">
                      <span>English (15%):</span>
                      <span className="font-mono font-bold text-foreground">
                        {modalReadiness.E}%
                      </span>
                    </div>
                    <Meter value={modalReadiness.E} tone="brand" />
                  </div>
                  <div>
                    <div className="flex justify-between text-muted-foreground mb-1">
                      <span>Resume (15%):</span>
                      <span className="font-mono font-bold text-foreground">
                        {modalReadiness.R}%
                      </span>
                    </div>
                    <Meter value={modalReadiness.R} tone="brand" />
                  </div>
                  <div>
                    <div className="flex justify-between text-muted-foreground mb-1">
                      <span>Mock / Soft (10%):</span>
                      <span className="font-mono font-bold text-foreground">
                        {modalReadiness.M}%
                      </span>
                    </div>
                    <Meter value={modalReadiness.M} tone="brand" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-muted-foreground text-[11px] pt-2 border-t border-border">
                  <span>Placement Day: Day {activeModalStudent.placementDay}/90</span>
                  <span>Talent Score: {activeModalStudent.talentScore}/1000</span>
                  <span
                    className={
                      activeModalStudent.gateCleared
                        ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                        : "text-amber-600 dark:text-amber-400 font-medium"
                    }
                  >
                    {activeModalStudent.gateCleared ? "Dual Gate Cleared 🔓" : "Phase 1 Active 🔒"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center gap-2 pt-3 border-t border-border">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteTargetStudent({
                      name: activeModalStudent.name,
                      email: activeModalStudent.email,
                      rollNo: activeModalStudent.rollNo,
                      batchId:
                        activeModalStudent.batchName || getBatchName(activeModalStudent.batchId),
                    });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/20 transition-colors"
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
                      batchId:
                        activeModalStudent.batchName || getBatchName(activeModalStudent.batchId),
                      dept: activeModalStudent.dept,
                      college: activeModalStudent.college,
                    });
                    setIsResetModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-xs"
                >
                  <KeyRound className="size-3.5 text-primary" />
                  <span>Reset Pass</span>
                </button>
              </div>
              <button
                onClick={() => {
                  store.recalculateStudentScore(activeModalStudent.email);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <div className="grid size-10 place-items-center rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Remove Learner from Roster?
                </h3>
                <p className="text-xs text-muted-foreground">
                  This action permanently removes the student from this cohort
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-muted/20 p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Student Name:</span>
                <span className="font-semibold text-foreground">{deleteTargetStudent.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Email Address:</span>
                <span className="font-mono text-muted-foreground">{deleteTargetStudent.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Roll Number:</span>
                <span className="font-mono font-semibold text-foreground">
                  {deleteTargetStudent.rollNo}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Cohort Batch:</span>
                <span className="font-semibold text-foreground">
                  {getBatchName(deleteTargetStudent.batchId)}
                </span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Removing this student will permanently delete their progress, revoke active portal
              access, update cohort batch headcount, and record the removal in the audit log.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setDeleteTargetStudent(null)}
                className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-xs"
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
                className="inline-flex items-center gap-1.5 rounded-lg bg-destructive px-4 py-2 text-xs font-semibold text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-xs"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="size-5 text-primary" />
                <h3 className="text-base font-semibold text-foreground">
                  New Enterprise Hiring Requisition
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewDriveModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="size-5" />
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
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
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
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
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
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
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
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
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
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Requisition Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as HiringDrive["status"])}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
                  >
                    <option value="Active Drive">Active Drive</option>
                    <option value="Shortlisting">Shortlisting</option>
                    <option value="Interviews Live">Interviews Live</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsNewDriveModalOpen(false)}
                  className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                  <GraduationCap className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Add New Student Learner
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Creates instant portal credentials, cohort sync, and technical track assignment.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddStudentModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Student Full Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    placeholder="e.g. Arun Kumar"
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Student Login Email <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={newStudentEmail}
                    onChange={(e) => setNewStudentEmail(e.target.value)}
                    placeholder="e.g. arun@college.edu"
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Login Password <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newStudentPassword}
                    onChange={(e) => setNewStudentPassword(e.target.value)}
                    placeholder="Temp@1234"
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs font-mono"
                  />
                  <span className="text-[11px] text-muted-foreground mt-0.5 block">
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
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Department</label>
                  <select
                    value={newStudentDept}
                    onChange={(e) => setNewStudentDept(e.target.value)}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
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
                    Placement Accelerator Cohort <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={newStudentBatchId || availableBatches[0]?.id || ""}
                    onChange={(e) => setNewStudentBatchId(e.target.value)}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
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
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
                />
              </div>

              {/* Technical Tracks Picker (1 to 3 tracks) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-foreground">
                    Assign Technical Learning Tracks ({newStudentTracks.length}/3 selected)
                  </label>
                  <span className="text-[11px] text-muted-foreground">Choose 1 to 3 tracks</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-40 overflow-y-auto p-2 rounded-xl border border-border bg-muted/20">
                  {TRACKS.map((track) => {
                    const isSelected = newStudentTracks.includes(track.id);
                    return (
                      <button
                        type="button"
                        key={track.id}
                        onClick={() => toggleNewStudentTrack(track.id)}
                        className={cn(
                          "flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left text-xs transition-all shadow-xs",
                          isSelected
                            ? "border-primary bg-primary/10 text-primary font-semibold"
                            : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-border/80",
                        )}
                      >
                        <span
                          className="size-2 rounded-full shrink-0"
                          style={{ backgroundColor: track.accent }}
                        />
                        <span className="truncate">{track.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2.5">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>
                  Adding this student enables immediate login at{" "}
                  <strong className="text-foreground font-semibold">/login</strong>. Credentials are automatically
                  synced with authentication.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddStudentModalOpen(false)}
                  className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
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
