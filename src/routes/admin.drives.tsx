import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Chip, Meter, Panel, Stat } from "@/components/kit";
import { type HiringDrive } from "@/lib/app-store";
import { TRACKS, trackById } from "@/lib/tracks";
import {
  fetchLiveHiringDrives,
  createLiveHiringDrive,
  updateLiveHiringDrive,
  deleteLiveHiringDrive,
} from "@/lib/data/placement-data";
import { fetchLiveStudentRoster } from "@/lib/data/admin-data";
import { useBatchLookup } from "@/lib/data";

import {
  Briefcase,
  Search,
  Filter,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  Plus,
  X,
  Edit2,
  Trash2,
  Download,
  AlertTriangle,
  Building2,
  Users,
  Award,
  ArrowUpRight,
  TrendingUp,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/drives")({
  head: () => ({
    meta: [
      { title: "Recruiter Hiring Drives — SantoGe Talent Cloud" },
      {
        name: "description",
        content:
          "Enterprise talent partner hiring drives, requisition matching pipelines, minimum score criteria, and candidate shortlists.",
      },
      { property: "og:title", content: "Recruiter Hiring Drives — SantoGe Talent Cloud" },
      {
        property: "og:description",
        content: "Enterprise talent partner shortlists and requisition matching.",
      },
    ],
  }),
  component: AdminHiringDrivesPage,
});

function AdminHiringDrivesPage() {
  const queryClient = useQueryClient();
  const { getBatchName } = useBatchLookup(true);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedDriveId, setSelectedDriveId] = useState<string | null>(null);

  // Candidate pipeline filters
  const [candidateSearch, setCandidateSearch] = useState("");
  const [candidateTrackFilter, setCandidateTrackFilter] = useState<string>("all");

  // Modal states: Create
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCompany, setNewCompany] = useState("");
  const [newRoles, setNewRoles] = useState("");
  const [newCtc, setNewCtc] = useState("₹8.0 - ₹11.5 LPA");
  const [newMinScore, setNewMinScore] = useState<string | number>(650);
  const [newSlots, setNewSlots] = useState<string | number>(50);
  const [newStatus, setNewStatus] = useState<HiringDrive["status"]>("Active Drive");

  // Modal states: Edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDrive, setEditingDrive] = useState<HiringDrive | null>(null);

  // Modal states: Delete
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingDrive, setDeletingDrive] = useState<HiringDrive | null>(null);

  // Student Profile Audit modal
  const [auditStudentEmail, setAuditStudentEmail] = useState<string | null>(null);

  // Live Supabase Queries
  const { data: liveDrives, isLoading: isDrivesLoading } = useQuery({
    queryKey: ["live", "hiring-drives"],
    queryFn: () => fetchLiveHiringDrives(),
  });

  const { data: liveRoster } = useQuery({
    queryKey: ["live", "student-roster", "all"],
    queryFn: () => fetchLiveStudentRoster({ institutionId: "all" }),
  });

  const drives: HiringDrive[] = useMemo(() => {
    return liveDrives || [];
  }, [liveDrives]);

  const allStudents = useMemo(() => {
    return liveRoster?.items || [];
  }, [liveRoster]);

  // Filtered Drives
  const filteredDrives = useMemo(() => {
    return drives.filter((d) => {
      const matchesSearch =
        d.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.roles.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.ctc.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || d.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [drives, searchQuery, statusFilter]);

  // Selected Drive (default to first active drive if none selected)
  const selectedDrive = useMemo(() => {
    if (selectedDriveId) {
      return drives.find((d) => d.id === selectedDriveId) || null;
    }
    return drives[0] || null;
  }, [drives, selectedDriveId]);

  // Eligible Candidates for selected drive
  const matchedCandidates = useMemo(() => {
    if (!selectedDrive) return [];
    return allStudents.filter((s) => {
      const scoreEligible = s.talentScore >= selectedDrive.minScore;
      if (!scoreEligible) return false;

      if (candidateSearch.trim()) {
        const q = candidateSearch.toLowerCase();
        const matchesQuery =
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.rollNo.toLowerCase().includes(q) ||
          s.dept.toLowerCase().includes(q) ||
          s.college.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      if (candidateTrackFilter !== "all") {
        if (!s.tracks?.includes(candidateTrackFilter as any)) return false;
      }

      return true;
    });
  }, [allStudents, selectedDrive, candidateSearch, candidateTrackFilter]);

  // High-Level KPIs
  const totalDrives = drives.length;
  const activeDrivesCount = drives.filter((d) => d.status === "Active Drive").length;
  const totalOpenSlots = drives.reduce((acc, d) => acc + (d.openSlots || 0), 0);
  const marketplaceReadyCount = allStudents.filter((s) => s.talentScore >= 700).length;

  // Active candidate pool: students meeting at least one active drive's criteria
  const lowestMinScore = useMemo(() => {
    if (drives.length === 0) return 600;
    return Math.min(...drives.map((d) => d.minScore));
  }, [drives]);

  const eligiblePoolCount = useMemo(() => {
    return allStudents.filter((s) => s.talentScore >= lowestMinScore).length;
  }, [allStudents, lowestMinScore]);

  // Selected student for audit modal
  const activeModalStudent = useMemo(() => {
    if (!auditStudentEmail) return null;
    return allStudents.find((s) => s.email === auditStudentEmail) || null;
  }, [allStudents, auditStudentEmail]);

  const modalReadiness = activeModalStudent?.readiness ?? {
    T: 65,
    C: 65,
    A: 60,
    E: 70,
    R: 50,
    M: 35,
  };

  // Handlers
  const handleCreateDrive = async (e: React.FormEvent) => {
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
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["live", "hiring-drives"] }),
        queryClient.invalidateQueries({ queryKey: ["live", "admin-analytics"] }),
      ]);
      toast.success(`Hiring requisition for ${newCompany} created successfully`);
      setIsCreateModalOpen(false);
      setNewCompany("");
      setNewRoles("");
      setNewCtc("₹8.0 - ₹11.5 LPA");
      setNewMinScore(650);
      setNewSlots(50);
      if (res.id) setSelectedDriveId(res.id);
    } else {
      toast.error(res.error || "Failed to create hiring drive");
    }
  };

  const handleUpdateDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDrive) return;

    const parsedSlots = Number(editingDrive.openSlots);
    if (!editingDrive.openSlots || isNaN(parsedSlots) || parsedSlots <= 0) {
      toast.error("Please enter a valid number of open slots (at least 1)");
      return;
    }

    const parsedMinScore = Number(editingDrive.minScore);
    const minScore = isNaN(parsedMinScore) || parsedMinScore < 0 ? 650 : parsedMinScore;

    const res = await updateLiveHiringDrive(editingDrive.id, {
      company: editingDrive.company,
      roles: editingDrive.roles,
      ctc: editingDrive.ctc,
      minScore,
      openSlots: parsedSlots,
      status: editingDrive.status,
    });

    if (res.ok) {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["live", "hiring-drives"] }),
        queryClient.invalidateQueries({ queryKey: ["live", "admin-analytics"] }),
      ]);
      toast.success(`Requisition for ${editingDrive.company} updated successfully`);
      setIsEditModalOpen(false);
      setEditingDrive(null);
    } else {
      toast.error(res.error || "Failed to update hiring drive");
    }
  };

  const handleDeleteDrive = async () => {
    if (!deletingDrive) return;

    const res = await deleteLiveHiringDrive(deletingDrive.id);
    if (res.ok) {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["live", "hiring-drives"] }),
        queryClient.invalidateQueries({ queryKey: ["live", "admin-analytics"] }),
      ]);
      toast.success(`Requisition for ${deletingDrive.company} removed`);
      if (selectedDriveId === deletingDrive.id) {
        setSelectedDriveId(null);
      }
      setIsDeleteModalOpen(false);
      setDeletingDrive(null);
    } else {
      toast.error(res.error || "Failed to delete hiring drive");
    }
  };

  const handleExportShortlistCSV = () => {
    if (!selectedDrive || matchedCandidates.length === 0) {
      toast.error("No eligible candidates to export for this drive");
      return;
    }

    const headers = [
      "Student Name",
      "Email Address",
      "Roll Number",
      "Department",
      "College",
      "Placement Batch",
      "Assigned Tracks",
      "Talent Score",
      "Placement Day",
      "Dual Gate Cleared",
      "Matched Requisition",
      "Package CTC",
    ];

    const rows = matchedCandidates.map((s) => [
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
      `"${selectedDrive.company} (${selectedDrive.roles})"`,
      `"${selectedDrive.ctc}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `SantoGe_${selectedDrive.company.replace(/[^a-zA-Z0-9]+/g, "_")}_Shortlist_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${matchedCandidates.length} candidate profiles for ${selectedDrive.company}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header with Quick Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Recruiter Hiring Drives &amp; Requisitions
            </h1>
            <span className="rounded-full bg-primary/10 border border-primary/30 px-2.5 py-0.5 text-xs font-semibold text-primary">
              Enterprise Hub
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage enterprise hiring requisitions, minimum Talent Score thresholds, and real-time candidate shortlists.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all"
          >
            <Plus className="size-4" />
            <span>+ Create Requisition</span>
          </button>
        </div>
      </div>

      {/* High-Level Platform Requisition KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Total Hiring Requisitions"
          value={totalDrives}
          tone="brand"
          hint={`${activeDrivesCount} actively shortlisting candidates`}
        />
        <Stat
          label="Total Open Positions"
          value={totalOpenSlots.toLocaleString()}
          tone="purple"
          hint="Across all partner corporate drives"
        />
        <Stat
          label="Eligible Candidate Pool"
          value={eligiblePoolCount.toLocaleString()}
          tone="cyan"
          hint={`Score ≥ ${lowestMinScore} across all cohorts`}
        />
        <Stat
          label="Marketplace Ready (700+)"
          value={marketplaceReadyCount.toLocaleString()}
          tone="emerald"
          hint="Direct recruiter interview qualified"
        />
      </div>

      {/* Main Grid: Requisitions List & Details */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column (5 Cols): Drive Cards & Filters */}
        <div className="lg:col-span-5 space-y-4">
          <Panel
            title="Partner Requisitions"
            subtitle={`${filteredDrives.length} enterprise requisitions matching criteria`}
            action={
              <Chip tone="purple">{filteredDrives.length} drives</Chip>
            }
          >
            {/* Search & Status Filter */}
            <div className="space-y-2.5 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search company, roles, CTC package…"
                  className="w-full rounded-lg border border-border bg-card pl-9 pr-3 py-1.5 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {["all", "Active Drive", "Shortlisting", "Interviews Live"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all border shadow-2xs",
                      statusFilter === st
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/40 text-muted-foreground border-border hover:text-foreground hover:bg-muted",
                    )}
                  >
                    {st === "all" ? "All Drives" : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Drives List */}
            <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
              {filteredDrives.length === 0 ? (
                <div className="rounded-xl border border-border bg-muted/20 p-8 text-center text-xs text-muted-foreground">
                  <Briefcase className="mx-auto size-8 text-muted-foreground/60 mb-2" />
                  <p className="font-semibold text-foreground">No matching hiring drives found</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Try clearing your search or click '+ Create Requisition' to publish a new drive.
                  </p>
                </div>
              ) : (
                filteredDrives.map((d) => {
                  const eligible = allStudents.filter((s) => s.talentScore >= d.minScore).length;
                  const isSelected = selectedDrive?.id === d.id;

                  return (
                    <div
                      key={d.id}
                      onClick={() => setSelectedDriveId(d.id)}
                      className={cn(
                        "group rounded-xl border p-4 transition-all cursor-pointer select-none bg-card shadow-xs",
                        isSelected
                          ? "border-primary bg-primary/5 ring-1.5 ring-primary shadow-sm"
                          : "border-border hover:border-border/80 hover:bg-muted/20",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 text-primary border border-primary/30 shrink-0 font-bold text-sm">
                            {d.company.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-foreground truncate">{d.company}</p>
                              <span
                                className={cn(
                                  "rounded px-1.5 py-0.5 text-[9px] font-semibold border",
                                  d.status === "Active Drive" &&
                                    "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400",
                                  d.status === "Shortlisting" &&
                                    "bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400",
                                  d.status === "Interviews Live" &&
                                    "bg-violet-500/10 border-violet-500/30 text-violet-600 dark:text-violet-400",
                                  d.status === "Closed" &&
                                    "bg-muted border-border text-muted-foreground",
                                )}
                              >
                                {d.status}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">{d.roles}</p>
                            <p className="text-[11px] font-mono font-medium text-primary mt-1">
                              {d.ctc}
                            </p>
                          </div>
                        </div>

                        {/* Edit & Delete Action Buttons */}
                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingDrive(d);
                              setIsEditModalOpen(true);
                            }}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            title="Edit Requisition Details"
                          >
                            <Edit2 className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDeletingDrive(d);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            title="Remove Requisition"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-3.5 pt-3 border-t border-border/60 flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <span>Min Score:</span>
                          <span className="font-mono font-bold text-foreground">{d.minScore}/1000</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-muted-foreground">Openings:</span>
                          <span className="font-mono font-bold text-primary">{d.openSlots}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-muted-foreground">Eligible:</span>
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {eligible}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Panel>
        </div>

        {/* Right Column (7 Cols): Matched Candidates Pipeline */}
        <div className="lg:col-span-7 space-y-4">
          <Panel
            title={
              selectedDrive
                ? `Matched Candidates — ${selectedDrive.company}`
                : "Candidate Matching Pipeline"
            }
            subtitle={
              selectedDrive
                ? `${matchedCandidates.length} students qualify with Talent Score ≥ ${selectedDrive.minScore} for ${selectedDrive.roles}`
                : "Select a requisition on the left to view matched learners"
            }
            action={
              selectedDrive && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportShortlistCSV}
                    disabled={matchedCandidates.length === 0}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-xs disabled:opacity-50"
                  >
                    <Download className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Export Shortlist CSV</span>
                  </button>
                  <Chip tone="emerald">{matchedCandidates.length} Qualified</Chip>
                </div>
              )
            }
          >
            {selectedDrive ? (
              <div className="space-y-4">
                {/* Requisition Overview Banner */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Briefcase className="size-4 text-primary shrink-0" />
                      <span className="font-bold text-foreground text-sm">
                        {selectedDrive.company}
                      </span>
                      <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {selectedDrive.status}
                      </span>
                    </div>
                    <p className="text-muted-foreground">
                      Target Role: <strong className="text-foreground">{selectedDrive.roles}</strong> · Offered CTC:{" "}
                      <strong className="text-foreground font-mono">{selectedDrive.ctc}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-card border border-border px-3 py-1.5 text-center shadow-xs">
                      <p className="text-[10px] text-muted-foreground font-medium">Openings</p>
                      <p className="font-mono text-sm font-bold text-primary">
                        {selectedDrive.openSlots}
                      </p>
                    </div>
                    <div className="rounded-lg bg-card border border-border px-3 py-1.5 text-center shadow-xs">
                      <p className="text-[10px] text-muted-foreground font-medium">Min Score</p>
                      <p className="font-mono text-sm font-bold text-foreground">
                        {selectedDrive.minScore}
                      </p>
                    </div>
                    <div className="rounded-lg bg-card border border-border px-3 py-1.5 text-center shadow-xs">
                      <p className="text-[10px] text-muted-foreground font-medium">Eligible Pool</p>
                      <p className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {matchedCandidates.length}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Candidate Filters */}
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      value={candidateSearch}
                      onChange={(e) => setCandidateSearch(e.target.value)}
                      placeholder="Search candidate name, roll no, email…"
                      className="w-full rounded-lg border border-border bg-card pl-9 pr-3 py-1.5 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Filter className="size-3.5 text-muted-foreground" />
                    <select
                      value={candidateTrackFilter}
                      onChange={(e) => setCandidateTrackFilter(e.target.value)}
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
                </div>

                {/* Candidates Table */}
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-border bg-muted/40 text-muted-foreground">
                      <tr>
                        <th className="py-2.5 px-3 font-semibold">Candidate Learner</th>
                        <th className="py-2.5 px-3 font-semibold">Roll &amp; Dept</th>
                        <th className="py-2.5 px-3 font-semibold">Cohort &amp; Tracks</th>
                        <th className="py-2.5 px-3 font-semibold">Talent Score</th>
                        <th className="py-2.5 px-3 font-semibold">Gate Status</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Audit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-foreground">
                      {matchedCandidates.map((s) => (
                        <tr key={s.email} className="hover:bg-muted/30 transition-colors">
                          <td className="py-2.5 px-3">
                            <p className="font-semibold text-foreground">{s.name}</p>
                            <p className="text-[11px] font-mono text-muted-foreground">{s.email}</p>
                          </td>
                          <td className="py-2.5 px-3">
                            <p className="font-mono font-medium">{s.rollNo}</p>
                            <p className="text-[11px] text-muted-foreground">{s.dept}</p>
                          </td>
                          <td className="py-2.5 px-3">
                            <p className="text-[11px] text-foreground font-medium truncate max-w-[140px]">
                              {s.batchName || getBatchName(s.batchId)}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {Array.from(new Set(s.tracks || [])).map((tid, idx) => (
                                <span
                                  key={`${s.email}-${tid}-${idx}`}
                                  className="rounded px-1.5 py-0.5 text-[9px] font-medium border border-border bg-muted/40 text-muted-foreground"
                                >
                                  {trackById(tid).short}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-baseline gap-1 font-mono font-bold text-primary">
                              <span>{s.talentScore}</span>
                              <span className="text-[10px] text-muted-foreground font-normal">/1000</span>
                            </div>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                              +{s.talentScore - selectedDrive.minScore} pts above min
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            {s.gateCleared ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="size-3" /> Gate Cleared
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                                <Sparkles className="size-3" /> Day {s.placementDay}/90
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => setAuditStudentEmail(s.email)}
                              className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-[11px] font-semibold text-foreground hover:bg-muted transition-colors shadow-xs"
                              title="Audit Candidate Readiness Breakdown"
                            >
                              <Eye className="size-3" />
                              <span>Audit</span>
                            </button>
                          </td>
                        </tr>
                      ))}

                      {matchedCandidates.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-10 text-center text-xs text-muted-foreground">
                            <GraduationCap className="mx-auto size-7 text-muted-foreground/60 mb-2" />
                            <p className="font-semibold text-foreground">
                              No candidates meet this requisition threshold
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                              No students match the criteria for min Talent Score {selectedDrive.minScore}.
                              Try adjusting candidate filters or lower the requisition score.
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-muted/20 p-12 text-center text-xs text-muted-foreground">
                <Briefcase className="mx-auto size-10 text-muted-foreground/50 mb-3" />
                <p className="font-semibold text-foreground text-sm">Select a Hiring Requisition</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Click on any enterprise partner drive on the left to review matched qualified learners and export candidate shortlists.
                </p>
              </div>
            )}
          </Panel>
        </div>
      </div>

      {/* Create Requisition Modal */}
      {isCreateModalOpen && (
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
                onClick={() => setIsCreateModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDrive} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">
                  Enterprise Partner / Company <span className="text-destructive">*</span>
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
                <label className="block font-semibold text-foreground mb-1">
                  Target Job Roles <span className="text-destructive">*</span>
                </label>
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
                    placeholder="e.g. 650"
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
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
                >
                  <Plus className="size-3.5" />
                  <span>Publish Requisition</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Requisition Modal */}
      {isEditModalOpen && editingDrive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Edit2 className="size-5 text-primary" />
                <h3 className="text-base font-semibold text-foreground">
                  Edit Hiring Requisition
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingDrive(null);
                }}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateDrive} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={editingDrive.company}
                  onChange={(e) =>
                    setEditingDrive({ ...editingDrive, company: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Job Roles</label>
                <input
                  type="text"
                  required
                  value={editingDrive.roles}
                  onChange={(e) =>
                    setEditingDrive({ ...editingDrive, roles: e.target.value })
                  }
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
                    value={editingDrive.ctc}
                    onChange={(e) =>
                      setEditingDrive({ ...editingDrive, ctc: e.target.value })
                    }
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Min Talent Score
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={1000}
                    placeholder="e.g. 650"
                    value={editingDrive.minScore ?? ""}
                    onChange={(e) =>
                      setEditingDrive({
                        ...editingDrive,
                        minScore: e.target.value === "" ? ("" as any) : Number(e.target.value),
                      })
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
                    value={editingDrive.openSlots ?? ""}
                    onChange={(e) =>
                      setEditingDrive({
                        ...editingDrive,
                        openSlots: e.target.value === "" ? ("" as any) : Number(e.target.value),
                      })
                    }
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">Status</label>
                  <select
                    value={editingDrive.status}
                    onChange={(e) =>
                      setEditingDrive({
                        ...editingDrive,
                        status: e.target.value as HiringDrive["status"],
                      })
                    }
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
                  >
                    <option value="Active Drive">Active Drive</option>
                    <option value="Shortlisting">Shortlisting</option>
                    <option value="Interviews Live">Interviews Live</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingDrive(null);
                  }}
                  className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
                >
                  <CheckCircle2 className="size-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Requisition Confirmation Modal */}
      {isDeleteModalOpen && deletingDrive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <div className="grid size-10 place-items-center rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Remove Hiring Requisition?
                </h3>
                <p className="text-xs text-muted-foreground">
                  This action removes the drive and active candidate shortlist matching.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-muted/20 p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Company:</span>
                <span className="font-semibold text-foreground">{deletingDrive.company}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Roles:</span>
                <span className="text-foreground">{deletingDrive.roles}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">CTC:</span>
                <span className="font-mono text-primary font-bold">{deletingDrive.ctc}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeletingDrive(null);
                }}
                className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteDrive}
                className="inline-flex items-center gap-1.5 rounded-lg bg-destructive px-4 py-2 text-xs font-semibold text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-xs"
              >
                <Trash2 className="size-3.5" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
                onClick={() => setAuditStudentEmail(null)}
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
                  Assigned Technical Learning Tracks:
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

            <div className="flex justify-end items-center gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setAuditStudentEmail(null)}
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
