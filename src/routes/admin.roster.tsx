import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Chip, Meter, PageHeader, Panel, Stat } from "@/components/kit";
import {
  fetchLiveStudentRoster,
  fetchLiveBatches,
  deleteLiveStudent,
  type LiveRosterItem,
} from "@/lib/data/admin-data";
import { useBatchLookup } from "@/lib/data";
import { trackById, TRACKS } from "@/lib/tracks";
import { useAppStore } from "@/lib/app-store";
import {
  Users,
  Search,
  Filter,
  GraduationCap,
  AlertTriangle,
  Trash2,
  KeyRound,
  SlidersHorizontal,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Award,
  TrendingUp,
  CheckCircle2,
  X,
  BarChart3,
  Target,
  Layers,
  BookOpen,
  ShieldCheck,
  Activity,
  Eye,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AdminResetPasswordModal,
  type ResetPasswordStudent,
} from "@/components/admin-reset-password-modal";

export const Route = createFileRoute("/admin/roster")({
  head: () => ({
    meta: [
      { title: "Student Roster & Cohort Management — SantoGe Talent Cloud" },
      {
        name: "description",
        content:
          "Full student roster view with search, filter, and sort. Cohort-level health dashboards with readiness breakdowns, leaderboards, and track distribution across all partner institutions.",
      },
      {
        property: "og:title",
        content: "Student Roster & Cohort Management — SantoGe Talent Cloud",
      },
      {
        property: "og:description",
        content:
          "Platform-wide student roster and per-cohort health dashboards for super admin oversight.",
      },
    ],
  }),
  component: RosterPage,
});

// ─── Readiness Dimension Labels ────────────────────────────────────────────
const READINESS_DIMS = [
  { key: "T", label: "Technical", color: "bg-violet-500" },
  { key: "C", label: "Communication", color: "bg-blue-500" },
  { key: "A", label: "Aptitude", color: "bg-amber-500" },
  { key: "E", label: "English", color: "bg-emerald-500" },
  { key: "R", label: "Resume", color: "bg-rose-500" },
  { key: "M", label: "Mock Interview", color: "bg-sky-500" },
] as const;

// ─── CSV Export Utility ────────────────────────────────────────────────────
function exportRosterCSV(items: LiveRosterItem[], getBatchName: (id: string, fallback?: string) => string) {
  const headers = [
    "Name", "Email", "Roll No", "Department", "College",
    "Batch", "Talent Score", "Placement Day", "Gate Cleared",
    "Tracks", "Status",
  ];
  const rows = items.map((s) => [
    s.name,
    s.email,
    s.rollNo,
    s.dept,
    s.college,
    getBatchName(s.batchId, s.batchId),
    s.talentScore,
    s.placementDay,
    s.gateCleared ? "Yes" : "No",
    (s.tracks || []).join("; "),
    s.status,
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `stc-student-roster-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Page Component ─────────────────────────────────────────────────────────
function RosterPage() {
  const queryClient = useQueryClient();
  const { getBatchName } = useBatchLookup(true);
  const store = useAppStore();

  // ── Data Queries ────────────────────────────────────────────────────────
  const { data: liveRoster, isLoading: rosterLoading, refetch: refetchRoster } = useQuery({
    queryKey: ["live", "student-roster", "all"],
    queryFn: () => fetchLiveStudentRoster({ institutionId: "all" }),
  });

  const { data: liveBatches, isLoading: batchesLoading } = useQuery({
    queryKey: ["live", "batches"],
    queryFn: () => fetchLiveBatches(),
  });

  // ── Modal / Action State ────────────────────────────────────────────────
  const [selectedStudentEmail, setSelectedStudentEmail] = useState<string | null>(null);
  const [resetTargetStudent, setResetTargetStudent] = useState<ResetPasswordStudent | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [deleteTargetStudent, setDeleteTargetStudent] = useState<{
    name: string;
    email: string;
    rollNo: string;
    batchId: string;
  } | null>(null);
  const [isDeletingStudent, setIsDeletingStudent] = useState(false);

  // ── Section 1: Roster Filter & Sort State ───────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [batchFilter, setBatchFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [gateFilter, setGateFilter] = useState<"all" | "cleared" | "inprogress">("all");
  const [trackFilter, setTrackFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"name" | "talentScore" | "placementDay">("talentScore");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [rosterPage, setRosterPage] = useState(0);
  const PAGE_SIZE = 25;

  // ── Section 2: Cohort Management State ─────────────────────────────────
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null);
  const [cohortBatchFilter, setCohortBatchFilter] = useState("all");

  // ── Derived Roster Data ─────────────────────────────────────────────────
  const allStudents: LiveRosterItem[] = useMemo(
    () => liveRoster?.items || [],
    [liveRoster],
  );

  const activeModalStudent = useMemo(
    () => (liveRoster?.items || []).find((s) => s.email === selectedStudentEmail) || null,
    [liveRoster?.items, selectedStudentEmail],
  );

  const modalReadiness = activeModalStudent?.readiness ?? {
    T: 65,
    C: 65,
    A: 60,
    E: 65,
    R: 60,
    M: 60,
  };

  const uniqueBatches = useMemo(() => {
    const set = new Map<string, string>();
    allStudents.forEach((s) => {
      if (s.batchId) set.set(s.batchId, getBatchName(s.batchId, s.batchId));
    });
    return Array.from(set.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [allStudents, getBatchName]);

  const uniqueDepts = useMemo(() => {
    const set = new Set<string>();
    allStudents.forEach((s) => { if (s.dept) set.add(s.dept); });
    return Array.from(set).sort();
  }, [allStudents]);

  const filteredSortedStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allStudents
      .filter((s) => {
        const matchSearch = !q || [s.name, s.email, s.rollNo, s.dept, s.college]
          .some((v) => v?.toLowerCase().includes(q));
        const matchBatch = batchFilter === "all" || s.batchId === batchFilter;
        const matchDept = deptFilter === "all" || s.dept?.toUpperCase() === deptFilter.toUpperCase();
        const matchGate =
          gateFilter === "all" ||
          (gateFilter === "cleared" && s.gateCleared) ||
          (gateFilter === "inprogress" && !s.gateCleared);
        const matchTrack =
          trackFilter === "all" || (s.tracks || []).includes(trackFilter as any);
        return matchSearch && matchBatch && matchDept && matchGate && matchTrack;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortBy === "name") cmp = a.name.localeCompare(b.name);
        else if (sortBy === "talentScore") cmp = a.talentScore - b.talentScore;
        else if (sortBy === "placementDay") cmp = a.placementDay - b.placementDay;
        return sortDir === "asc" ? cmp : -cmp;
      });
  }, [allStudents, searchQuery, batchFilter, deptFilter, gateFilter, trackFilter, sortBy, sortDir]);

  const paginatedStudents = useMemo(
    () => filteredSortedStudents.slice(rosterPage * PAGE_SIZE, (rosterPage + 1) * PAGE_SIZE),
    [filteredSortedStudents, rosterPage],
  );
  const totalPages = Math.max(1, Math.ceil(filteredSortedStudents.length / PAGE_SIZE));

  const handleSort = useCallback(
    (col: typeof sortBy) => {
      if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      else { setSortBy(col); setSortDir("desc"); }
      setRosterPage(0);
    },
    [sortBy],
  );

  const clearFilters = () => {
    setSearchQuery(""); setBatchFilter("all"); setDeptFilter("all");
    setGateFilter("all"); setTrackFilter("all"); setRosterPage(0);
  };
  const hasActiveFilters = searchQuery || batchFilter !== "all" || deptFilter !== "all" || gateFilter !== "all" || trackFilter !== "all";

  // ── Platform KPIs ───────────────────────────────────────────────────────
  const platformStats = useMemo(() => {
    const total = allStudents.length;
    const gateCleared = allStudents.filter((s) => s.gateCleared).length;
    const avgScore = total > 0
      ? Math.round(allStudents.reduce((acc, s) => acc + (s.talentScore || 0), 0) / total)
      : 0;
    const marketplaceReady = allStudents.filter((s) => (s.talentScore || 0) >= 700).length;
    const totalBatches = (liveBatches || []).length;
    return { total, gateCleared, avgScore, marketplaceReady, totalBatches };
  }, [allStudents, liveBatches]);

  // ── Cohort-level aggregates ─────────────────────────────────────────────
  const cohortData = useMemo(() => {
    const batchMap = new Map<string, {
      id: string; name: string; dept: string; capacity: number;
      students: LiveRosterItem[];
    }>();

    (liveBatches || []).forEach((b) => {
      batchMap.set(b.id, {
        id: b.id,
        name: b.name,
        dept: b.dept || "All",
        capacity: b.capacity,
        students: [],
      });
    });

    allStudents.forEach((s) => {
      if (s.batchId && batchMap.has(s.batchId)) {
        batchMap.get(s.batchId)!.students.push(s);
      }
    });

    return Array.from(batchMap.values())
      .filter((b) => cohortBatchFilter === "all" || b.id === cohortBatchFilter)
      .sort((a, b) => b.students.length - a.students.length);
  }, [liveBatches, allStudents, cohortBatchFilter]);

  // ── Delete Student ──────────────────────────────────────────────────────
  const handleDeleteStudent = async () => {
    if (!deleteTargetStudent) return;
    setIsDeletingStudent(true);
    try {
      const res = await deleteLiveStudent(deleteTargetStudent.email);
      if (res.ok) {
        toast.success(`Removed ${deleteTargetStudent.name} from roster`);
        if (selectedStudentEmail === deleteTargetStudent.email) {
          setSelectedStudentEmail(null);
        }
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["live", "student-roster"] }),
          queryClient.invalidateQueries({ queryKey: ["live", "batches"] }),
          queryClient.invalidateQueries({ queryKey: ["live", "admin-analytics"] }),
        ]);
        setDeleteTargetStudent(null);
      } else {
        toast.error(res.error || "Failed to remove student");
      }
    } catch {
      toast.error("Failed to remove student");
    } finally {
      setIsDeletingStudent(false);
    }
  };

  const isLoading = rosterLoading || batchesLoading;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <PageHeader
        title="Student Roster & Cohort Management"
        subtitle="Full platform-wide learner directory with deep search, filtering, and per-cohort health dashboards — covering every enrolled student across all partner institutions."
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => void refetchRoster()}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={cn("size-3.5", isLoading && "animate-spin")} />
              Refresh
            </button>
            <button
              onClick={() => exportRosterCSV(filteredSortedStudents, getBatchName)}
              disabled={filteredSortedStudents.length === 0}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Download className="size-3.5" />
              Export CSV ({filteredSortedStudents.length})
            </button>
          </div>
        }
      />

      {/* ── Platform KPI Stats ─────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat
          label="Total Enrolled"
          value={isLoading ? "—" : platformStats.total}
          tone="brand"
          hint="Across all cohorts"
        />
        <Stat
          label="Total Cohorts"
          value={isLoading ? "—" : platformStats.totalBatches}
          tone="purple"
          hint="Active placement batches"
        />
        <Stat
          label="Avg Talent Score"
          value={isLoading ? "—" : `${platformStats.avgScore}/1000`}
          tone="cyan"
          hint="Platform-wide average"
        />
        <Stat
          label="Gate Cleared"
          value={isLoading ? "—" : platformStats.gateCleared}
          tone="emerald"
          hint={isLoading ? "" : `${platformStats.total > 0 ? Math.round((platformStats.gateCleared / platformStats.total) * 100) : 0}% of enrolled`}
        />
        <Stat
          label="Marketplace Ready"
          value={isLoading ? "—" : platformStats.marketplaceReady}
          tone="amber"
          hint="Score ≥ 700 / 1000"
        />
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 1 — FULL STUDENT ROSTER
      ══════════════════════════════════════════════════════════════════ */}
      <Panel
        id="student-roster"
        title={
          <div className="flex items-center gap-2">
            <Users className="size-4 text-primary" />
            <span>Student Roster</span>
            <Chip tone="cyan">{filteredSortedStudents.length} learners</Chip>
          </div>
        }
        subtitle="Search, filter, and manage every enrolled student. Click column headers to sort."
      >
        {/* Search & Filters */}
        <div className="mb-4 flex flex-col gap-3">
          {/* Search Bar */}
          <div className="relative max-w-lg">
            <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
            <input
              id="roster-search"
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setRosterPage(0); }}
              placeholder="Search by name, email, roll no, department, college…"
              className="w-full rounded-lg border border-border bg-card pl-9 pr-8 py-1.5 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(""); setRosterPage(0); }}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Filter Row */}
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="size-3.5 text-muted-foreground shrink-0" />

            {/* Batch filter */}
            <select
              id="roster-batch-filter"
              value={batchFilter}
              onChange={(e) => { setBatchFilter(e.target.value); setRosterPage(0); }}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/20 shadow-xs"
            >
              <option value="all">All Batches</option>
              {uniqueBatches.map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>

            {/* Dept filter */}
            <select
              id="roster-dept-filter"
              value={deptFilter}
              onChange={(e) => { setDeptFilter(e.target.value); setRosterPage(0); }}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/20 shadow-xs"
            >
              <option value="all">All Departments</option>
              {uniqueDepts.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>

            {/* Gate filter */}
            <select
              id="roster-gate-filter"
              value={gateFilter}
              onChange={(e) => { setGateFilter(e.target.value as any); setRosterPage(0); }}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/20 shadow-xs"
            >
              <option value="all">All Gate Statuses</option>
              <option value="cleared">Gate Cleared ✓</option>
              <option value="inprogress">In Progress</option>
            </select>

            {/* Track filter */}
            <select
              id="roster-track-filter"
              value={trackFilter}
              onChange={(e) => { setTrackFilter(e.target.value); setRosterPage(0); }}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/20 shadow-xs"
            >
              <option value="all">All Tracks</option>
              {TRACKS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>

            <div className="flex items-center gap-1.5 ml-1">
              <SlidersHorizontal className="size-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Sort:</span>
              {([
                ["talentScore", "Talent Score"],
                ["name", "Name"],
                ["placementDay", "Day"],
              ] as const).map(([col, lbl]) => (
                <button
                  key={col}
                  onClick={() => handleSort(col)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold transition-colors",
                    sortBy === col
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {lbl}
                  {sortBy === col && (
                    sortDir === "desc"
                      ? <ChevronDown className="size-3" />
                      : <ChevronUp className="size-3" />
                  )}
                </button>
              ))}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground hover:text-destructive transition-colors"
              >
                <X className="size-3" /> Clear All
              </button>
            )}
          </div>
        </div>

        {/* Roster Table */}
        {isLoading ? (
          <div className="py-16 text-center text-xs text-muted-foreground">
            <RefreshCw className="size-5 animate-spin mx-auto mb-2 text-primary" />
            Loading student roster from Supabase…
          </div>
        ) : filteredSortedStudents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-14 text-center space-y-3">
            <div className="mx-auto grid size-12 place-items-center rounded-xl bg-muted border border-border text-muted-foreground">
              <Search className="size-6" />
            </div>
            <h4 className="text-sm font-semibold text-foreground">No Students Found</h4>
            <p className="text-xs text-muted-foreground">
              {hasActiveFilters
                ? "No students match your current filters."
                : "No students have been provisioned yet."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
              >
                <RefreshCw className="size-3.5" /> Reset Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground whitespace-nowrap">Student</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground whitespace-nowrap">Roll No</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground whitespace-nowrap hidden sm:table-cell">Dept</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground whitespace-nowrap hidden lg:table-cell">College</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground whitespace-nowrap hidden md:table-cell">Batch</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground whitespace-nowrap hidden md:table-cell">Tracks</th>
                    <th
                      className="px-3 py-2.5 text-right font-semibold text-muted-foreground whitespace-nowrap cursor-pointer hover:text-foreground select-none"
                      onClick={() => handleSort("talentScore")}
                    >
                      <span className="inline-flex items-center gap-1">
                        Score {sortBy === "talentScore" && (sortDir === "desc" ? <ChevronDown className="size-3" /> : <ChevronUp className="size-3" />)}
                      </span>
                    </th>
                    <th className="px-3 py-2.5 text-center font-semibold text-muted-foreground whitespace-nowrap hidden lg:table-cell">Gate</th>
                    <th className="px-3 py-2.5 text-right font-semibold text-muted-foreground whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedStudents.map((student) => (
                    <tr
                      key={student.email}
                      className="group hover:bg-muted/30 transition-colors"
                    >
                      {/* Name + email */}
                      <td className="px-3 py-2.5">
                        <button
                          type="button"
                          onClick={() => setSelectedStudentEmail(student.email)}
                          className="text-left group/name focus:outline-none"
                        >
                          <p className="font-semibold text-foreground group-hover/name:text-primary transition-colors line-clamp-1">
                            {student.name}
                          </p>
                          <p className="font-mono text-muted-foreground text-[10px] line-clamp-1">
                            {student.email}
                          </p>
                        </button>
                      </td>
                      {/* Roll No */}
                      <td className="px-3 py-2.5 font-mono text-muted-foreground whitespace-nowrap">
                        {student.rollNo}
                      </td>
                      {/* Dept */}
                      <td className="px-3 py-2.5 hidden sm:table-cell">
                        <span className="rounded-md bg-muted border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {student.dept}
                        </span>
                      </td>
                      {/* College */}
                      <td className="px-3 py-2.5 text-muted-foreground hidden lg:table-cell max-w-[160px]">
                        <span className="line-clamp-1" title={student.college}>{student.college}</span>
                      </td>
                      {/* Batch */}
                      <td className="px-3 py-2.5 hidden md:table-cell max-w-[140px]">
                        <span className="line-clamp-1 text-muted-foreground font-medium" title={getBatchName(student.batchId, student.batchId)}>
                          {getBatchName(student.batchId, student.batchId)}
                        </span>
                      </td>
                      {/* Tracks */}
                      <td className="px-3 py-2.5 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {(student.tracks || []).slice(0, 2).map((t, i) => (
                            <span
                              key={`${student.email}-${t}-${i}`}
                              className="rounded bg-muted border border-border px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground"
                            >
                              {t}
                            </span>
                          ))}
                          {(student.tracks || []).length > 2 && (
                            <span className="text-[10px] text-muted-foreground">
                              +{(student.tracks || []).length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      {/* Score */}
                      <td className="px-3 py-2.5 text-right">
                        <span
                          className={cn(
                            "font-mono font-bold text-xs",
                            (student.talentScore || 0) >= 700
                              ? "text-emerald-600 dark:text-emerald-400"
                              : (student.talentScore || 0) >= 500
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-muted-foreground",
                          )}
                        >
                          {student.talentScore ?? 0}
                        </span>
                      </td>
                      {/* Gate */}
                      <td className="px-3 py-2.5 text-center hidden lg:table-cell">
                        {student.gateCleared ? (
                          <CheckCircle2 className="size-4 text-emerald-500 mx-auto" />
                        ) : (
                          <div className="size-4 rounded-full border-2 border-muted-foreground/30 mx-auto" />
                        )}
                      </td>
                      {/* Actions */}
                      <td className="px-3 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setSelectedStudentEmail(student.email)}
                            className="inline-flex size-7 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors shadow-xs"
                            title="View Learner Profile & Audit"
                            aria-label={`View profile for ${student.name}`}
                          >
                            <Eye className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setResetTargetStudent({
                                name: student.name,
                                email: student.email,
                                rollNo: student.rollNo,
                                batchId: getBatchName(student.batchId),
                                dept: student.dept,
                                college: student.college,
                              });
                              setIsResetModalOpen(true);
                            }}
                            className="inline-flex size-7 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-colors shadow-xs"
                            title="Reset Password"
                            aria-label={`Reset password for ${student.name}`}
                          >
                            <KeyRound className="size-3.5 text-primary" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteTargetStudent({
                                name: student.name,
                                email: student.email,
                                rollNo: student.rollNo,
                                batchId: student.batchId,
                              })
                            }
                            className="inline-flex size-7 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-destructive hover:border-destructive/40 hover:bg-destructive/10 transition-colors shadow-xs"
                            title="Remove Student"
                            aria-label={`Remove ${student.name} from roster`}
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Showing {rosterPage * PAGE_SIZE + 1}–{Math.min((rosterPage + 1) * PAGE_SIZE, filteredSortedStudents.length)} of {filteredSortedStudents.length} students
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setRosterPage((p) => Math.max(0, p - 1))}
                    disabled={rosterPage === 0}
                    className="rounded-md border border-border bg-card px-2.5 py-1 font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-40 shadow-xs"
                  >
                    ← Prev
                  </button>
                  {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                    const page = totalPages <= 7 ? i : Math.max(0, Math.min(totalPages - 7, rosterPage - 3)) + i;
                    return (
                      <button
                        key={page}
                        onClick={() => setRosterPage(page)}
                        className={cn(
                          "rounded-md border px-2.5 py-1 font-semibold transition-colors shadow-xs",
                          rosterPage === page
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card text-foreground hover:bg-muted",
                        )}
                      >
                        {page + 1}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setRosterPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={rosterPage >= totalPages - 1}
                    className="rounded-md border border-border bg-card px-2.5 py-1 font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-40 shadow-xs"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Panel>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 2 — COHORT MANAGEMENT DASHBOARD
      ══════════════════════════════════════════════════════════════════ */}
      <div id="cohort-management">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              <Layers className="size-5 text-primary" />
              Cohort Management
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Per-batch readiness breakdown, top performers, and track distribution. Click a cohort card to expand.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="size-3.5 text-muted-foreground" />
            <select
              id="cohort-batch-filter"
              value={cohortBatchFilter}
              onChange={(e) => setCohortBatchFilter(e.target.value)}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/20 shadow-xs"
            >
              <option value="all">All Cohorts</option>
              {(liveBatches || []).map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        {batchesLoading ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            <RefreshCw className="size-5 animate-spin mx-auto mb-2 text-primary" />
            Loading cohort data…
          </div>
        ) : cohortData.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-12 text-center text-xs text-muted-foreground">
            No batches found. Create cohorts in Batch &amp; Telegram Hub first.
          </div>
        ) : (
          <div className="space-y-3">
            {cohortData.map((cohort) => {
              const isExpanded = expandedBatch === cohort.id;
              const enrolled = cohort.students.length;
              const fillPct = Math.round((enrolled / Math.max(cohort.capacity, 1)) * 100);
              const avgScore = enrolled > 0
                ? Math.round(cohort.students.reduce((acc, s) => acc + (s.talentScore || 0), 0) / enrolled)
                : 0;
              const gateCleared = cohort.students.filter((s) => s.gateCleared).length;
              const marketplaceReady = cohort.students.filter((s) => (s.talentScore || 0) >= 700).length;

              // Readiness averages
              const readinessAvg = READINESS_DIMS.map(({ key, label, color }) => {
                const avg = enrolled > 0
                  ? Math.round(
                      cohort.students.reduce((acc, s) => acc + ((s.readiness as any)?.[key] || 0), 0) / enrolled,
                    )
                  : 0;
                return { key, label, color, avg };
              });

              // Top 5 performers by talent score
              const topPerformers = [...cohort.students]
                .sort((a, b) => (b.talentScore || 0) - (a.talentScore || 0))
                .slice(0, 5);

              // Track distribution
              const trackDist = new Map<string, number>();
              cohort.students.forEach((s) => {
                (s.tracks || []).forEach((t) => {
                  trackDist.set(t, (trackDist.get(t) || 0) + 1);
                });
              });
              const trackDistArr = Array.from(trackDist.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 6);

              return (
                <div
                  key={cohort.id}
                  className="rounded-xl border border-border bg-card shadow-xs overflow-hidden transition-all"
                >
                  {/* Cohort Header Row (always visible) */}
                  <button
                    id={`cohort-card-${cohort.id}`}
                    onClick={() => setExpandedBatch(isExpanded ? null : cohort.id)}
                    className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-muted/30 transition-colors"
                  >
                    {/* Expand icon */}
                    <div className="shrink-0 text-muted-foreground">
                      {isExpanded
                        ? <ChevronUp className="size-4" />
                        : <ChevronDown className="size-4" />
                      }
                    </div>

                    {/* Cohort Identity */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-foreground">{cohort.name}</span>
                        <span className="rounded bg-muted border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {cohort.dept}
                        </span>
                        {gateCleared > 0 && (
                          <Chip tone="emerald">{gateCleared} Gate Cleared</Chip>
                        )}
                        {marketplaceReady > 0 && (
                          <Chip tone="amber">{marketplaceReady} Marketplace Ready</Chip>
                        )}
                      </div>
                    </div>

                    {/* Quick Stats Row */}
                    <div className="hidden sm:flex items-center gap-6 shrink-0 text-xs">
                      <div className="text-center">
                        <p className="font-bold text-foreground font-mono">{enrolled} / {cohort.capacity}</p>
                        <p className="text-muted-foreground">Enrolled</p>
                      </div>
                      <div className="text-center">
                        <p className={cn(
                          "font-bold font-mono",
                          avgScore >= 700 ? "text-emerald-600 dark:text-emerald-400"
                          : avgScore >= 500 ? "text-amber-600 dark:text-amber-400"
                          : "text-foreground"
                        )}>{avgScore}</p>
                        <p className="text-muted-foreground">Avg Score</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-foreground font-mono">{fillPct}%</p>
                        <p className="text-muted-foreground">Fill Rate</p>
                      </div>
                    </div>

                    {/* Mini Progress Bar */}
                    <div className="hidden md:block w-24 shrink-0">
                      <Meter value={fillPct} tone={fillPct >= 80 ? "emerald" : "brand"} />
                    </div>

                    {/* View Roster shortcut */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setBatchFilter(cohort.id);
                        setRosterPage(0);
                        document.getElementById("student-roster")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="hidden lg:inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-[11px] font-semibold text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors shadow-xs shrink-0"
                      title="Filter roster to this cohort"
                    >
                      <Users className="size-3" /> View Roster
                    </button>
                  </button>

                  {/* Expanded Detail Section */}
                  {isExpanded && (
                    <div className="border-t border-border px-5 pb-5 pt-4 space-y-5 animate-in fade-in slide-in-from-top-1 duration-150">
                      {/* Sub-grid: 3 columns */}
                      <div className="grid gap-4 md:grid-cols-3">

                        {/* Readiness Breakdown */}
                        <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
                          <div className="flex items-center gap-2">
                            <Activity className="size-4 text-primary" />
                            <h4 className="text-xs font-semibold text-foreground">Readiness Breakdown</h4>
                          </div>
                          {readinessAvg.map(({ key, label, color, avg }) => (
                            <div key={key} className="space-y-1">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-medium text-muted-foreground">
                                  [{key}] {label}
                                </span>
                                <span className="font-mono font-bold text-foreground">{avg}%</span>
                              </div>
                              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                                <div
                                  className={cn("h-full rounded-full transition-all duration-700", color)}
                                  style={{ width: `${Math.min(100, avg)}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Top 5 Performers */}
                        <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
                          <div className="flex items-center gap-2">
                            <Award className="size-4 text-amber-500" />
                            <h4 className="text-xs font-semibold text-foreground">Top 5 Performers</h4>
                          </div>
                          {topPerformers.length === 0 ? (
                            <p className="text-xs text-muted-foreground">No students enrolled yet.</p>
                          ) : (
                            topPerformers.map((s, idx) => (
                              <div
                                key={s.email}
                                className="flex items-center justify-between text-[11px] gap-2"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span
                                    className={cn(
                                      "shrink-0 grid size-5 place-items-center rounded-full text-[10px] font-bold",
                                      idx === 0
                                        ? "bg-amber-400/20 text-amber-600 dark:text-amber-400"
                                        : idx === 1
                                          ? "bg-slate-300/20 text-slate-500 dark:text-slate-400"
                                          : idx === 2
                                            ? "bg-orange-300/20 text-orange-600 dark:text-orange-400"
                                            : "bg-muted text-muted-foreground",
                                    )}
                                  >
                                    {idx + 1}
                                  </span>
                                  <span className="font-medium text-foreground line-clamp-1">{s.name}</span>
                                </div>
                                <span
                                  className={cn(
                                    "font-mono font-bold shrink-0",
                                    (s.talentScore || 0) >= 700
                                      ? "text-emerald-600 dark:text-emerald-400"
                                      : "text-amber-600 dark:text-amber-400",
                                  )}
                                >
                                  {s.talentScore ?? 0}
                                </span>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Track Distribution */}
                        <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
                          <div className="flex items-center gap-2">
                            <BookOpen className="size-4 text-violet-500" />
                            <h4 className="text-xs font-semibold text-foreground">Track Distribution</h4>
                          </div>
                          {trackDistArr.length === 0 ? (
                            <p className="text-xs text-muted-foreground">No track data available.</p>
                          ) : (
                            trackDistArr.map(([trackId, count]) => {
                              const track = trackById(trackId as any);
                              const pct = enrolled > 0 ? Math.round((count / enrolled) * 100) : 0;
                              return (
                                <div key={trackId} className="space-y-1">
                                  <div className="flex items-center justify-between text-[11px]">
                                    <div className="flex items-center gap-1.5">
                                      <span
                                        className="size-2 rounded-full shrink-0"
                                        style={{ background: track.accent || "hsl(var(--primary))" }}
                                      />
                                      <span className="font-medium text-muted-foreground">{track.short}</span>
                                    </div>
                                    <span className="font-mono text-foreground">{count} ({pct}%)</span>
                                  </div>
                                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                                    <div
                                      className="h-full rounded-full transition-all duration-700"
                                      style={{
                                        width: `${pct}%`,
                                        background: track.accent || "hsl(var(--primary))",
                                      }}
                                    />
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>

                      {/* Cohort Summary Footer */}
                      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 text-xs">
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Users className="size-3.5 text-primary" />
                            <span><strong className="text-foreground">{enrolled}</strong> enrolled of <strong className="text-foreground">{cohort.capacity}</strong> capacity</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <ShieldCheck className="size-3.5 text-emerald-500" />
                            <span><strong className="text-emerald-600 dark:text-emerald-400">{gateCleared}</strong> gate cleared ({enrolled > 0 ? Math.round((gateCleared / enrolled) * 100) : 0}%)</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Target className="size-3.5 text-amber-500" />
                            <span><strong className="text-amber-600 dark:text-amber-400">{marketplaceReady}</strong> marketplace ready</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <BarChart3 className="size-3.5 text-blue-500" />
                            <span>Avg Score: <strong className="text-foreground">{avgScore}/1000</strong></span>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <TrendingUp className="size-3.5 text-violet-500" />
                            <span>Fill Rate: <strong className="text-foreground">{fillPct}%</strong></span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setBatchFilter(cohort.id);
                            setRosterPage(0);
                            document.getElementById("student-roster")?.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="inline-flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-[11px] font-semibold text-primary hover:bg-primary/20 transition-colors"
                        >
                          <Users className="size-3" /> View Full Roster →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Student Details Modal (Learner Profile Audit) ────────────────── */}
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
                type="button"
                onClick={() => setSelectedStudentEmail(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors"
                title="Close"
                aria-label="Close"
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
                    {getBatchName(activeModalStudent.batchId, activeModalStudent.batchId)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Department</p>
                  <p className="text-foreground font-semibold mt-0.5">{activeModalStudent.dept}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">College</p>
                  <p className="text-foreground font-semibold mt-0.5 truncate" title={activeModalStudent.college}>
                    {activeModalStudent.college}
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
                      {trackById(t as any)?.name || t}
                    </span>
                  ))}
                  {(activeModalStudent.tracks || []).length === 0 && (
                    <span className="text-xs text-muted-foreground italic">No tracks assigned yet</span>
                  )}
                </div>
              </div>

              {/* T·C·A·E·R·M Readiness Dimensions Audit Breakdown */}
              <div className="rounded-xl border border-border bg-card p-3.5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="font-semibold text-foreground">
                    T·C·A·E·R·M Composite Breakdown
                  </span>
                  <span className="font-mono font-bold text-primary">
                    {activeModalStudent.talentScore ?? 0} / 1000
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
                      <span>Communication (20%):</span>
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
                      <span>English (10%):</span>
                      <span className="font-mono font-bold text-foreground">
                        {modalReadiness.E}%
                      </span>
                    </div>
                    <Meter value={modalReadiness.E} tone="brand" />
                  </div>
                  <div>
                    <div className="flex justify-between text-muted-foreground mb-1">
                      <span>Resume (20%):</span>
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
                  <span>Talent Score: {activeModalStudent.talentScore ?? 0}/1000</span>
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
                      batchId: activeModalStudent.batchId,
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
                      batchId: getBatchName(activeModalStudent.batchId),
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
                type="button"
                onClick={async () => {
                  await store.recalculateStudentScore(activeModalStudent.email);
                  toast.success(`Recalculated talent score for ${activeModalStudent.name}`);
                  await queryClient.invalidateQueries({ queryKey: ["live", "student-roster"] });
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

      {/* ── Admin Reset Password Modal ─────────────────────────────────── */}
      <AdminResetPasswordModal
        isOpen={isResetModalOpen}
        student={resetTargetStudent}
        onClose={() => {
          setIsResetModalOpen(false);
          setResetTargetStudent(null);
        }}
      />

      {/* ── Delete Student Confirmation Modal ─────────────────────────── */}
      {deleteTargetStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <div className="grid size-10 place-items-center rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">Remove Learner from Roster?</h3>
                <p className="text-xs text-muted-foreground">
                  This action permanently removes the student from this cohort
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-muted/20 p-3.5 space-y-2 text-xs">
              {[
                ["Student Name", deleteTargetStudent.name],
                ["Email Address", deleteTargetStudent.email],
                ["Roll Number", deleteTargetStudent.rollNo],
                ["Cohort Batch", getBatchName(deleteTargetStudent.batchId)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium">{label}:</span>
                  <span className="font-semibold text-foreground font-mono text-[11px]">{value}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Removing this student will permanently delete their progress, revoke active portal
              access, update cohort batch headcount, and record the removal in the audit log.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
              <button
                type="button"
                disabled={isDeletingStudent}
                onClick={() => setDeleteTargetStudent(null)}
                className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-xs disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingStudent}
                onClick={handleDeleteStudent}
                className="inline-flex items-center gap-1.5 rounded-lg bg-destructive px-4 py-2 text-xs font-semibold text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-xs disabled:opacity-50"
              >
                {isDeletingStudent ? (
                  <><RefreshCw className="size-3.5 animate-spin" /> Removing…</>
                ) : (
                  <><Trash2 className="size-3.5" /> Confirm Delete</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
