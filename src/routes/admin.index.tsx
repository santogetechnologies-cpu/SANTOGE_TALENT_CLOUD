import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Chip, Gauge, Meter, Panel, Stat } from "@/components/kit";
import { useAppStore, type HiringDrive } from "@/lib/app-store";
import { TRACKS, type TrackId } from "@/lib/tracks";
import {
  fetchLiveAdminAnalytics,
  fetchLiveStudentRoster,
  fetchLiveHiringDrives,
  createLiveHiringDrive,
  addLiveStudent,
  updateLiveBatch,
  useLiveBatches,
  useBatchLookup,
} from "@/lib/data";

import {
  Building2,
  Users,
  GraduationCap,
  Sparkles,
  Briefcase,
  CheckCircle2,
  RefreshCw,
  Plus,
  X,
  Download,
  Activity,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Executive Analytics — SantoGe Talent Cloud" },
      {
        name: "description",
        content:
          "Platform-wide cohort readiness, bulk placement conversion, recruiter marketplace, and institutional analytics across partner institutions.",
      },
      { property: "og:title", content: "Executive Analytics — SantoGe Talent Cloud" },
      { property: "og:description", content: "Platform-wide readiness and placement conversion." },
    ],
  }),
  component: AdminAnalytics,
});

function AdminAnalytics() {
  const store = useAppStore();
  const navigate = useNavigate();
  const [selectedInst, setSelectedInst] = useState("all");
  const [selectedDriveId, setSelectedDriveId] = useState<string | null>(null);

  // Interactive Grid button & filter states
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<string | null>(null);
  const [selectedFunnelStage, setSelectedFunnelStage] = useState<number | null>(null);
  const [isReadinessModalOpen, setIsReadinessModalOpen] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [isRecalculatingAll, setIsRecalculatingAll] = useState(false);

  // New Requisition modal states
  const [isNewDriveModalOpen, setIsNewDriveModalOpen] = useState(false);
  const [newCompany, setNewCompany] = useState("");
  const [newRoles, setNewRoles] = useState("");
  const [newCtc, setNewCtc] = useState("₹8.0 - ₹10.5 LPA");
  const [newMinScore, setNewMinScore] = useState<string | number>(660);
  const [newSlots, setNewSlots] = useState<string | number>(50);
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
  const [newStudentTracks, setNewStudentTracks] = useState<TrackId[]>(["java"]);

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
    queryKey: ["live", "student-roster", selectedInst],
    queryFn: () =>
      fetchLiveStudentRoster({
        institutionId: selectedInst !== "all" ? selectedInst : undefined,
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

  // Computed Cohort Readiness Dimension Averages for Audit Modal
  const cohortAverages = useMemo(() => {
    const list = liveRoster?.items || [];
    if (list.length === 0) {
      return { T: 65, C: 60, A: 58, E: 72, R: 54, M: 40 };
    }
    const sum = list.reduce(
      (acc, s) => {
        acc.T += s.readiness?.T ?? 60;
        acc.C += s.readiness?.C ?? 60;
        acc.A += s.readiness?.A ?? 55;
        acc.E += s.readiness?.E ?? 70;
        acc.R += s.readiness?.R ?? 50;
        acc.M += s.readiness?.M ?? 40;
        return acc;
      },
      { T: 0, C: 0, A: 0, E: 0, R: 0, M: 0 },
    );
    const n = list.length;
    return {
      T: Math.round(sum.T / n),
      C: Math.round(sum.C / n),
      A: Math.round(sum.A / n),
      E: Math.round(sum.E / n),
      R: Math.round(sum.R / n),
      M: Math.round(sum.M / n),
    };
  }, [liveRoster?.items]);

  const handleExportCSV = () => {
    const list = liveRoster?.items || [];
    if (list.length === 0) {
      toast.error("No student records available to export");
      return;
    }

    const headers = [
      "Student Name",
      "Email Address",
      "Roll Number",
      "Department",
      "Institution",
      "Placement Batch",
      "Assigned Tracks",
      "Talent Score",
      "Placement Day",
      "Dual Gate Cleared",
      "Status Tier",
    ];

    const rows = list.map((s) => [
      `"${(s.name || "").replace(/"/g, '""')}"`,
      `"${(s.email || "").replace(/"/g, '""')}"`,
      `"${(s.rollNo || "").replace(/"/g, '""')}"`,
      `"${(s.dept || "").replace(/"/g, '""')}"`,
      `"${(s.college || "").replace(/"/g, '""')}"`,
      `"${(s.batchName || getBatchName(s.batchId) || "").replace(/"/g, '""')}"`,
      `"${(s.tracks || []).join("; ")}"`,
      s.talentScore,
      s.placementDay,
      s.gateCleared ? "YES" : "NO",
      s.talentScore >= 700
        ? "Marketplace Ready"
        : s.talentScore >= 450
          ? "ATS Unlocked"
          : "Phase 1 Learning",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `SantoGe_Cohort_Roster_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${list.length} student records as CSV`);
  };

  const handleSyncAllBatches = async () => {
    if (activeBatches.length === 0) {
      toast.error("No active batches found to sync");
      return;
    }
    setIsSyncingAll(true);
    try {
      const now = new Date().toISOString();
      await Promise.all(
        activeBatches.map((b) => updateLiveBatch(b.id, { last_sync_at: now })),
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["live", "admin-analytics"] }),
        queryClient.invalidateQueries({ queryKey: ["live", "batches"] }),
      ]);
      toast.success(
        `Synchronized sync timestamp for all ${activeBatches.length} cohort batches`,
      );
    } catch {
      toast.error("Failed to sync some batches");
    } finally {
      setIsSyncingAll(false);
    }
  };

  const handleRecalculateAll = async () => {
    setIsRecalculatingAll(true);
    try {
      store.recalculateAllScores();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["live", "student-roster"] }),
        queryClient.invalidateQueries({ queryKey: ["live", "admin-analytics"] }),
      ]);
      toast.success("Triggered platform-wide Unified Talent Score recalculation");
    } catch {
      toast.error("Failed to trigger recalculation");
    } finally {
      setIsRecalculatingAll(false);
    }
  };

  const handleCreateHiringDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.trim() || !newRoles.trim()) {
      toast.error("Please provide company name and job roles");
      return;
    }

    const parsedSlots = Number(newSlots);
    if (!newSlots || isNaN(parsedSlots) || parsedSlots <= 0) {
      toast.error("Please enter a valid number of open slots (at least 1)");
      return;
    }

    const parsedMinScore = Number(newMinScore);
    const minScore = isNaN(parsedMinScore) || parsedMinScore < 0 ? 650 : parsedMinScore;

    const res = await createLiveHiringDrive({
      company: newCompany.trim(),
      roles: newRoles.trim(),
      ctc: newCtc.trim() || "₹8.0 - ₹10.0 LPA",
      minScore,
      openSlots: parsedSlots,
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
    setNewCtc("₹8.0 - ₹10.5 LPA");
    setNewMinScore(660);
    setNewSlots(50);
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
      {/* Header with Dynamic Institution Selector & Roster Link */}
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

        {/* Institution Selector & Roster Hub Link */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/admin/roster"
            className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors shadow-xs"
          >
            <GraduationCap className="size-3.5" />
            <span>Student Roster Hub →</span>
          </Link>

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
      </div>

      {/* High-Level Platform KPIs (Interactive Grid Buttons) */}
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
          onClick={() => {
            navigate({ to: "/admin/roster" });
          }}
          actionLabel="View Roster ↗"
        />
        <Stat
          label="Active Cohort Batches"
          value={totalBatches}
          tone="purple"
          hint="100–300 learners per batch"
          onClick={() => {
            document.getElementById("active-batches")?.scrollIntoView({ behavior: "smooth" });
            toast.info("Inspecting active placement cohorts");
          }}
          actionLabel="Inspect Batches ↓"
        />
        <Stat
          label="Avg Cohort Readiness"
          value={`${avgReadiness}%`}
          tone="cyan"
          hint="Composite readiness index"
          onClick={() => {
            setIsReadinessModalOpen(true);
          }}
          actionLabel="Audit Breakdown ↗"
        />
        <Stat
          label="Marketplace Ready Learners"
          value={(liveAnalytics?.marketplaceReadyCount ?? 0).toLocaleString()}
          tone="emerald"
          hint={`${marketplacePercent}% direct offer qualified`}
          onClick={() => {
            navigate({ to: "/admin/roster" });
          }}
          actionLabel="View Roster ↗"
        />
      </div>

      {/* Quick Action Command Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => {
            if (!newStudentBatchId && availableBatches.length > 0) {
              setNewStudentBatchId(availableBatches[0]?.id || "BATCH-2026-ABC-CSE-01");
            }
            setIsAddStudentModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-all shadow-xs"
        >
          <Plus className="size-4" />
          <span>Add Learner</span>
        </button>

        <button
          type="button"
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-all shadow-xs"
        >
          <Download className="size-4 text-emerald-600 dark:text-emerald-400" />
          <span>Export All Learners CSV</span>
        </button>

        <button
          type="button"
          onClick={handleSyncAllBatches}
          disabled={isSyncingAll}
          className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-all shadow-xs disabled:opacity-50"
        >
          <RefreshCw className={cn("size-4 text-sky-600 dark:text-sky-400", isSyncingAll && "animate-spin")} />
          <span>{isSyncingAll ? "Syncing..." : "Sync Telegram Hub"}</span>
        </button>

        <button
          type="button"
          onClick={handleRecalculateAll}
          disabled={isRecalculatingAll}
          className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-all shadow-xs disabled:opacity-50"
        >
          <Sparkles className={cn("size-4 text-amber-600 dark:text-amber-400", isRecalculatingAll && "animate-spin")} />
          <span>{isRecalculatingAll ? "Calculating..." : "Recalculate Scores"}</span>
        </button>
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
          subtitle="6-stage milestone progression across active cohorts"
          action={
            selectedFunnelStage !== null ? (
              <button
                type="button"
                onClick={() => setSelectedFunnelStage(null)}
                className="text-[11px] font-semibold text-destructive hover:underline"
              >
                Clear Stage
              </button>
            ) : undefined
          }
          className="lg:col-span-2"
        >
          <div className="space-y-3.5">
            {cohortFunnel.length === 0 ? (
              <div className="rounded-xl border border-border bg-muted/20 p-6 text-center text-xs text-muted-foreground">
                No cohort conversion data available. Onboard student learners to visualize the
                6-stage placement funnel.
              </div>
            ) : (
              cohortFunnel.map((f, idx) => {
                const stageNum = idx + 1;
                const isSelected = selectedFunnelStage === stageNum;
                return (
                  <div
                    key={f.label}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedFunnelStage(null);
                        toast.info("Cleared funnel stage filter");
                      } else {
                        setSelectedFunnelStage(stageNum);
                        toast.info(`Filtered for: ${f.label} (${f.count.toLocaleString()} learners)`);
                      }
                    }}
                    className={cn(
                      "group rounded-xl border p-2.5 transition-all cursor-pointer select-none",
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-transparent hover:border-border hover:bg-muted/30",
                    )}
                    title={`Milestone ${stageNum}: ${f.label}`}
                  >
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {f.label}
                        </span>
                        {isSelected && (
                          <span className="rounded bg-primary/20 border border-primary/40 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                            Active Filter
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-muted-foreground text-[11px]">
                          {f.count.toLocaleString()} learners
                        </span>
                        <span className="font-mono font-bold text-foreground">{f.pct}%</span>
                      </div>
                    </div>
                    <Meter value={f.pct} tone={isSelected ? "cyan" : "brand"} />
                  </div>
                );
              })
            )}
          </div>
        </Panel>
      </div>

      {/* Live Batches & Track Demand */}
      <div className="grid gap-4 lg:grid-cols-2" id="active-batches">
        <Panel
          title="Active Placement Batches"
          subtitle="Synchronized Placement cohorts (100–300 sizing)"
          action={
            <div className="flex items-center gap-2">
              <Link
                to="/admin/batches"
                className="inline-flex items-center gap-1 rounded-lg border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 transition-colors shadow-xs"
              >
                <span>Batches Hub →</span>
              </Link>
              {selectedBatchFilter && (
                <button
                  type="button"
                  onClick={() => setSelectedBatchFilter(null)}
                  className="text-[11px] font-semibold text-destructive hover:underline"
                >
                  Clear Filter
                </button>
              )}
              <Chip tone="cyan">{activeBatches.length} cohorts</Chip>
            </div>
          }
        >
          <div className="space-y-3">
            {activeBatches.map((b) => {
              const fill = readinessOf(b);
              const isSelected = selectedBatchFilter === b.id;
              return (
                <div
                  key={b.id}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedBatchFilter(null);
                      toast.info("Cleared batch filter");
                    } else {
                      setSelectedBatchFilter(b.id);
                      toast.info(`Selected cohort batch: ${b.name}`);
                    }
                  }}
                  className={cn(
                    "rounded-xl border p-4 shadow-xs transition-all cursor-pointer select-none",
                    isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border bg-card hover:border-border/80 hover:bg-muted/20",
                  )}
                  title={`Cohort batch: ${b.name}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">{b.name}</p>
                        {isSelected && (
                          <span className="rounded bg-primary/20 border border-primary/40 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                            Active Filter
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {b.dept} · Capacity: {b.capacity} (Max 300)
                      </p>
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Chip tone={fill >= 80 ? "emerald" : "amber"}>{fill}% Fill Rate</Chip>
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation();
                          await updateLiveBatch(b.id, { last_sync_at: new Date().toISOString() });
                          queryClient.invalidateQueries({ queryKey: ["live", "admin-analytics"] });
                          toast.success(`Batch ${b.name} synchronized successfully`);
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
              <Link
                to="/admin/drives"
                className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors shadow-xs"
              >
                <span>Drives Hub →</span>
              </Link>
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
                    title={`Requisition: ${d.company} — ${d.roles}`}
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
                    min={0}
                    max={1000}
                    placeholder="e.g. 660"
                    value={newMinScore}
                    onChange={(e) =>
                      setNewMinScore(e.target.value === "" ? "" : Number(e.target.value))
                    }
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
                    max={5000}
                    placeholder="e.g. 50"
                    value={newSlots}
                    onChange={(e) =>
                      setNewSlots(e.target.value === "" ? "" : Number(e.target.value))
                    }
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

      {/* Platform Readiness & Composite Audit Modal */}
      {isReadinessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="grid size-9 place-items-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                  <Activity className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Platform Readiness &amp; Composite Audit
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Aggregated T·C·A·E·R·M dimensions across {totalEnrolled.toLocaleString()} learners
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsReadinessModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Overall Gauge / Composite Score Banner */}
              <div className="flex items-center justify-between rounded-xl border border-sky-500/30 bg-sky-500/5 p-4">
                <div>
                  <p className="text-muted-foreground font-medium">Average Cohort Readiness</p>
                  <p className="text-2xl font-bold text-foreground mt-0.5">{avgReadiness}%</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Platform Health Index: {Math.min(1000, avgReadiness * 10)} / 1000
                  </p>
                </div>
                <div className="text-right">
                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {marketplacePercent}% Offer Ready
                  </span>
                </div>
              </div>

              {/* 6 Dimension Breakdown */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-3.5 shadow-xs">
                <h4 className="font-semibold text-foreground text-xs border-b border-border pb-2">
                  T·C·A·E·R·M Weight Breakdown
                </h4>
                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <div className="flex justify-between text-muted-foreground mb-1">
                      <span>Technical (25% weight):</span>
                      <span className="font-mono font-bold text-foreground">{cohortAverages.T}%</span>
                    </div>
                    <Meter value={cohortAverages.T} tone="brand" />
                  </div>
                  <div>
                    <div className="flex justify-between text-muted-foreground mb-1">
                      <span>Placement (20% weight):</span>
                      <span className="font-mono font-bold text-foreground">{cohortAverages.C}%</span>
                    </div>
                    <Meter value={cohortAverages.C} tone="brand" />
                  </div>
                  <div>
                    <div className="flex justify-between text-muted-foreground mb-1">
                      <span>Aptitude (15% weight):</span>
                      <span className="font-mono font-bold text-foreground">{cohortAverages.A}%</span>
                    </div>
                    <Meter value={cohortAverages.A} tone="brand" />
                  </div>
                  <div>
                    <div className="flex justify-between text-muted-foreground mb-1">
                      <span>English (15% weight):</span>
                      <span className="font-mono font-bold text-foreground">{cohortAverages.E}%</span>
                    </div>
                    <Meter value={cohortAverages.E} tone="brand" />
                  </div>
                  <div>
                    <div className="flex justify-between text-muted-foreground mb-1">
                      <span>Resume (15% weight):</span>
                      <span className="font-mono font-bold text-foreground">{cohortAverages.R}%</span>
                    </div>
                    <Meter value={cohortAverages.R} tone="brand" />
                  </div>
                  <div>
                    <div className="flex justify-between text-muted-foreground mb-1">
                      <span>Mock / Soft (10% weight):</span>
                      <span className="font-mono font-bold text-foreground">{cohortAverages.M}%</span>
                    </div>
                    <Meter value={cohortAverages.M} tone="brand" />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-muted/20 p-3 text-[11px] text-muted-foreground leading-relaxed">
                The Composite Readiness Index aggregates daily placement attendance, skill checkpoints, MCQ pass rates, and portfolio commits to gate Phase 2 career recruitment unlocking.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setIsReadinessModalOpen(false)}
                className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
