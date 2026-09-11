import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Chip, Console, Meter, PageHeader, Panel, Stat } from "@/components/kit";
import {
  fetchLiveBatches,
  createLiveBatch,
  updateLiveBatch,
  deleteLiveBatch,
  fetchLiveStudentRoster,
  deleteLiveStudent,
} from "@/lib/data/admin-data";
import { useBatchLookup } from "@/lib/data";
import {
  RefreshCw,
  Plus,
  Send,
  Users,
  Edit2,
  Check,
  X,
  MessageSquare,
  Sparkles,
  Layers,
  Radio,
  Trash2,
  KeyRound,
  AlertTriangle,
  Search,
  Filter,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AdminResetPasswordModal,
  type ResetPasswordStudent,
} from "@/components/admin-reset-password-modal";

export const Route = createFileRoute("/admin/batches")({
  head: () => ({
    meta: [
      { title: "Batch & Telegram Hub — SantoGe Talent Cloud" },
      {
        name: "description",
        content:
          "Manage 100–300 sizing constraints, batch renaming, Telegram sync webhooks, and synchronized placement broadcasts.",
      },
      { property: "og:title", content: "Batch & Telegram Hub — SantoGe Talent Cloud" },
      {
        property: "og:description",
        content: "Manage batch capacity, renaming, and Telegram sync.",
      },
    ],
  }),
  component: BatchesPage,
});

function BatchesPage() {
  const queryClient = useQueryClient();
  const { getBatchName } = useBatchLookup(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newBatchName, setNewBatchName] = useState("BATCH-2026-PSG-CSE-02");
  const [newBatchDept, setNewBatchDept] = useState("CSE");
  const [newBatchCapacity, setNewBatchCapacity] = useState(250);

  // Live Queries
  const { data: liveBatches } = useQuery({
    queryKey: ["live", "batches"],
    queryFn: () => fetchLiveBatches(),
  });

  const { data: liveRoster } = useQuery({
    queryKey: ["live", "student-roster", "all"],
    queryFn: () => fetchLiveStudentRoster({ institutionId: "all" }),
  });

  // Telegram broadcast simulator states
  const [broadcastTargetBatch, setBroadcastTargetBatch] = useState<string>("BATCH-2026-ABC-CSE-01");
  const [broadcastMessage, setBroadcastMessage] = useState(
    "📢 Day 26 Morning Broadcast: English Idiom drills & Aptitude Work-Rate formulas are live! Join in-app guided practice before 09:00 AM.",
  );
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastLogs, setBroadcastLogs] = useState<string[]>([
    "[bot] Telegram Bot Webhook connected: @SantoGeTalentBot",
    "[status] Broadcast channels ready for scheduled daily drops",
  ]);

  // Batch Roster View state
  const [rosterBatchId, setRosterBatchId] = useState<string | null>(null);
  const [resetTargetStudent, setResetTargetStudent] = useState<ResetPasswordStudent | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [deleteTargetStudent, setDeleteTargetStudent] = useState<{
    name: string;
    email: string;
    rollNo: string;
    batchId: string;
  } | null>(null);
  const [deleteTargetBatch, setDeleteTargetBatch] = useState<{
    id: string;
    name: string;
    dept: string;
    capacity: number;
    enrolled: number;
  } | null>(null);
  const [isDeletingBatch, setIsDeletingBatch] = useState(false);

  // Search & Filter state for batches
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [utilizationFilter, setUtilizationFilter] = useState("all");
  const [rosterSearch, setRosterSearch] = useState("");

  const batchesWithCounts = useMemo(() => {
    if (liveBatches) {
      return liveBatches.map((b) => ({
        id: b.id,
        name: b.name,
        dept: b.dept,
        capacity: b.capacity,
        enrolled: b.enrolled_count ?? 0,
        lastSync: b.last_sync_at ? new Date(b.last_sync_at).toLocaleTimeString("en-GB") : "Never",
      }));
    }
    return [];
  }, [liveBatches]);

  const totalCapacity = batchesWithCounts.reduce((s, b) => s + b.capacity, 0);
  const totalEnrolled = liveRoster?.totalCount || liveRoster?.items.length || 0;

  const handleStartEdit = (b: { id: string; name: string }) => {
    setEditingId(b.id);
    setEditName(b.name);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) {
      toast.error("Batch name cannot be empty");
      return;
    }
    const res = await updateLiveBatch(id, { name: editName.trim() });
    if (res.ok) {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["live", "batches"] }),
        queryClient.invalidateQueries({ queryKey: ["live", "admin-analytics"] }),
      ]);
      toast.success("Batch renamed in Supabase backend");
    } else {
      toast.error(res.error || "Failed to update batch");
    }
    setEditingId(null);
  };

  const handleUpdateCapacity = async (id: string, capacity: number) => {
    const res = await updateLiveBatch(id, { capacity });
    if (res.ok) {
      queryClient.invalidateQueries({ queryKey: ["live", "batches"] });
    }
  };

  const handleUpdateDept = async (id: string, dept: string) => {
    const res = await updateLiveBatch(id, { dept });
    if (res.ok) {
      queryClient.invalidateQueries({ queryKey: ["live", "batches"] });
    }
  };

  const handleSyncBatch = async (id: string) => {
    const res = await updateLiveBatch(id, { last_sync_at: new Date().toISOString() });
    if (res.ok) {
      queryClient.invalidateQueries({ queryKey: ["live", "batches"] });
      toast.success("Batch synchronized with Telegram webhook");
    }
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchName.trim()) {
      toast.error("Please enter a valid batch name");
      return;
    }
    if (newBatchCapacity < 100 || newBatchCapacity > 300) {
      toast.error("Batch capacity must be between 100 and 300 students");
      return;
    }

    const res = await createLiveBatch({
      name: newBatchName.trim(),
      dept: newBatchDept,
      capacity: newBatchCapacity,
    });
    if (res.ok) {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["live", "batches"] }),
        queryClient.invalidateQueries({ queryKey: ["live", "admin-analytics"] }),
      ]);
      toast.success(`Batch ${newBatchName} created in Supabase backend!`);
      setCreateModalOpen(false);
    } else {
      toast.error(res.error || "Failed to create batch");
    }
  };

  const handleDeleteBatch = async () => {
    if (!deleteTargetBatch) return;
    setIsDeletingBatch(true);
    try {
      const res = await deleteLiveBatch(deleteTargetBatch.id);
      if (res.ok) {
        toast.success(`Batch "${deleteTargetBatch.name}" deleted successfully`);
        if (rosterBatchId === deleteTargetBatch.id) {
          setRosterBatchId(null);
        }
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["live", "batches"] }),
          queryClient.invalidateQueries({ queryKey: ["live", "admin-analytics"] }),
          queryClient.invalidateQueries({ queryKey: ["live", "student-roster"] }),
        ]);
        setDeleteTargetBatch(null);
      } else {
        toast.error(res.error || "Failed to delete batch");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete batch");
    } finally {
      setIsDeletingBatch(false);
    }
  };

  const handleDispatchTelegram = async () => {
    if (!broadcastMessage.trim()) return;
    setIsBroadcasting(true);
    const learnerCount = (liveRoster?.items || []).filter(
      (l) => l.batchId === broadcastTargetBatch,
    ).length;

    setBroadcastLogs((prev) => [
      `[tx] Dispatching webhook simulation to Telegram channel: t.me/stc-${broadcastTargetBatch.toLowerCase()}`,
      `[tx] Payload: "${broadcastMessage.slice(0, 60)}…"`,
      ...prev,
    ]);

    const batchItem = (liveBatches || []).find(
      (b) => b.name === broadcastTargetBatch || b.id === broadcastTargetBatch,
    );
    if (batchItem) {
      await updateLiveBatch(batchItem.id, { last_sync_at: new Date().toISOString() });
      queryClient.invalidateQueries({ queryKey: ["live", "batches"] });
    }

    setTimeout(() => {
      setIsBroadcasting(false);
      setBroadcastLogs((prev) => [
        `[simulated] Broadcast payload validated for ${learnerCount} active devices via @SantoGeTalentBot simulator (200 OK)`,
        ...prev,
      ]);
      toast.success(`Simulated broadcast dispatched to ${broadcastTargetBatch}!`);
    }, 1200);
  };

  // Dynamic department list for filtering
  const uniqueDepts = useMemo(() => {
    const set = new Set<string>();
    batchesWithCounts.forEach((b) => {
      if (b.dept) set.add(b.dept);
    });
    return Array.from(set);
  }, [batchesWithCounts]);

  // Filtered batches matching search query and active filters
  const filteredBatches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return batchesWithCounts.filter((b) => {
      const matchesSearch =
        !q ||
        b.name.toLowerCase().includes(q) ||
        b.dept.toLowerCase().includes(q) ||
        b.capacity.toString().includes(q) ||
        b.enrolled.toString().includes(q);

      const matchesDept =
        deptFilter === "all" || b.dept.toUpperCase() === deptFilter.toUpperCase();

      const fill = Math.round((b.enrolled / Math.max(b.capacity, 1)) * 100);
      const matchesUtil =
        utilizationFilter === "all" ||
        (utilizationFilter === "high" && fill >= 80) ||
        (utilizationFilter === "normal" && fill < 80 && b.enrolled > 0) ||
        (utilizationFilter === "empty" && b.enrolled === 0);

      return matchesSearch && matchesDept && matchesUtil;
    });
  }, [batchesWithCounts, searchQuery, deptFilter, utilizationFilter]);

  // Filter learners in selected roster
  const rosterLearners = useMemo(() => {
    const items = liveRoster?.items || [];
    const q = rosterSearch.trim().toLowerCase();
    return items
      .filter((s) => s.batchId === rosterBatchId || rosterBatchId === "all")
      .filter((s) => {
        if (!q) return true;
        return (
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.rollNo.toLowerCase().includes(q) ||
          s.dept.toLowerCase().includes(q)
        );
      })
      .map((s) => ({
        name: s.name,
        email: s.email,
        rollNo: s.rollNo,
        dept: s.dept,
        batchId: s.batchId,
        college: s.college || "Partner Engineering College",
        tracks: s.tracks as string[],
        streak: 1,
        placementDay: s.placementDay,
      }));
  }, [liveRoster, rosterBatchId, rosterSearch]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Batch Management & Telegram Hub"
        subtitle="Manage batch sizing (100–300 constraint), batch renaming, Telegram channel webhooks, and morning synchronized broadcasts."
        action={
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
          >
            <Plus className="size-3.5" /> Create New Batch
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Total Cohorts" value={batchesWithCounts.length} tone="brand" hint="Placement Accelerator" />
        <Stat
          label="Total Capacity"
          value={totalCapacity}
          tone="purple"
          hint="Sum of batch allocations"
        />
        <Stat
          label="Enrolled Learners"
          value={totalEnrolled}
          tone="emerald"
          hint="Active student profiles"
        />
        <Stat
          label="Platform Fill Rate"
          value={`${Math.round((totalEnrolled / Math.max(totalCapacity, 1)) * 100)}%`}
          tone="amber"
          hint="Cohort utilization"
        />
      </div>

      {/* Batch Search & Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search batches by name, department, size…"
            className="w-full rounded-lg border border-border bg-card pl-9 pr-8 py-1.5 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              title="Clear search"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Filter className="size-3.5 text-muted-foreground" />
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
            >
              <option value="all">All Departments</option>
              {uniqueDepts.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="size-3.5 text-muted-foreground" />
            <select
              value={utilizationFilter}
              onChange={(e) => setUtilizationFilter(e.target.value)}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
            >
              <option value="all">All Capacities</option>
              <option value="high">High Fill (≥80%)</option>
              <option value="normal">Active (&lt;80%)</option>
              <option value="empty">Empty (0 Learners)</option>
            </select>
          </div>

          {(searchQuery || deptFilter !== "all" || utilizationFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setDeptFilter("all");
                setUtilizationFilter("all");
              }}
              className="inline-flex items-center gap-1 rounded-lg bg-card border border-border px-2.5 py-1 text-xs font-semibold text-foreground hover:text-destructive transition-colors shadow-xs"
            >
              <X className="size-3" />
              <span>Clear</span>
            </button>
          )}

          <Chip tone="purple">
            {filteredBatches.length} of {batchesWithCounts.length} Batches
          </Chip>
        </div>
      </div>

      {/* Batch Cards Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {filteredBatches.length === 0 ? (
          <div className="col-span-full rounded-xl border border-border bg-card p-12 text-center space-y-3 shadow-xs">
            <div className="mx-auto grid size-12 place-items-center rounded-xl bg-muted border border-border text-muted-foreground">
              <Search className="size-6" />
            </div>
            <h4 className="text-base font-semibold text-foreground">
              No Placement Batches Found
            </h4>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              No cohorts match your current search &ldquo;<span className="text-primary font-semibold">{searchQuery}</span>&rdquo;
              {deptFilter !== "all" ? ` in department ${deptFilter}` : ""}.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setDeptFilter("all");
                setUtilizationFilter("all");
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-xs"
            >
              <RefreshCw className="size-3.5" />
              <span>Reset Search &amp; Filters</span>
            </button>
          </div>
        ) : (
          filteredBatches.map((b) => {
            const fill = Math.round((b.enrolled / Math.max(b.capacity, 1)) * 100);
            const isEditing = editingId === b.id;

            return (
              <Panel
                key={b.id}
                title={
                  isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="rounded-md border border-primary bg-card px-2.5 py-1 text-sm font-semibold text-foreground outline-none shadow-xs"
                      />
                      <button
                        onClick={() => handleSaveEdit(b.id)}
                        className="text-emerald-600 dark:text-emerald-400 hover:opacity-80 p-1"
                      >
                        <Check className="size-4" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-muted-foreground hover:text-foreground p-1"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>{b.name}</span>
                      <button
                        onClick={() => handleStartEdit(b)}
                        className="text-muted-foreground hover:text-primary transition-colors p-1"
                        title="Rename batch"
                      >
                        <Edit2 className="size-3.5" />
                      </button>
                    </div>
                  )
                }
                subtitle={`${b.dept} · Active Placement Cohort`}
                action={
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setRosterBatchId(b.id)}
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-xs"
                    >
                      <Users className="size-3 text-primary" /> Roster
                    </button>
                    <button
                      onClick={() => handleSyncBatch(b.id)}
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-xs"
                    >
                      <RefreshCw className="size-3 text-primary" /> Sync
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTargetBatch(b)}
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shadow-xs"
                      title={`Delete batch ${b.name}`}
                    >
                      <Trash2 className="size-3" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                }
              >
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Capacity Utilization</span>
                  <span className="font-mono text-foreground font-semibold">
                    {b.enrolled} / {b.capacity} ({fill}%)
                  </span>
                </div>
                <Meter
                  value={fill}
                  tone={fill >= 80 ? "emerald" : "brand"}
                />

                {/* Sizing Slider */}
                <div className="mt-4 space-y-3 rounded-xl border border-border bg-muted/20 p-4">
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-muted-foreground">
                        Batch Sizing Constraint (100–300):
                      </span>
                      <span className="font-mono font-bold text-primary">
                        {b.capacity} students
                      </span>
                    </div>
                    <input
                      type="range"
                      min={100}
                      max={300}
                      step={10}
                      value={b.capacity}
                      onChange={(e) => handleUpdateCapacity(b.id, Number(e.target.value))}
                      className="mt-2 w-full accent-primary"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1 font-mono">
                      <span>100 Min</span>
                      <span>200 Optimum</span>
                      <span>300 Max</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border text-xs">
                    <div>
                      <span className="block font-semibold text-muted-foreground">Enrolled Learners</span>
                      <div className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-1.5 font-mono text-xs text-foreground font-semibold">
                        {b.enrolled}
                      </div>
                    </div>
                    <div>
                      <span className="block font-semibold text-muted-foreground">Department Tag</span>
                      <input
                        type="text"
                        value={b.dept}
                        onChange={(e) => handleUpdateDept(b.id, e.target.value)}
                        className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-1.5 font-mono text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-3.5 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1.5 text-primary font-medium">
                    <Send className="size-3" /> t.me/stc-{b.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
                  </span>
                  <span>Last Synced: {b.lastSync ?? "Pending daily cron"}</span>
                </div>
              </Panel>
            );
          })
        )}
      </div>

      {/* Telegram Webhook & Broadcast Simulator */}
      <div className="grid gap-4 lg:grid-cols-[1fr_440px]">
        <Panel
          title="Telegram Cohort Broadcast Dispatcher"
          subtitle="Push morning placement lessons, video links, or alerts to the dedicated Telegram channel"
        >
          <div className="space-y-3.5">
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                Target Batch Channel
              </label>
              <select
                value={broadcastTargetBatch}
                onChange={(e) => setBroadcastTargetBatch(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
              >
                {batchesWithCounts.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.enrolled} learners)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                Broadcast Message Content
              </label>
              <textarea
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                rows={4}
                placeholder="Enter message for the batch Telegram cohort…"
                className="w-full rounded-lg border border-border bg-card p-3 text-xs text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
              />
            </div>

            <button
              onClick={handleDispatchTelegram}
              disabled={isBroadcasting}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs transition-opacity hover:bg-primary/90 disabled:opacity-50"
            >
              {isBroadcasting ? (
                <RefreshCw className="size-3.5 animate-spin" />
              ) : (
                <Send className="size-3.5" />
              )}
              {isBroadcasting ? "Pushing to Telegram Webhook…" : "Dispatch to Telegram Channel"}
            </button>
          </div>
        </Panel>

        <Panel title="Telegram Webhook Terminal" subtitle="Live payload delivery logs">
          <Console lines={broadcastLogs} empty="No broadcast records." />
        </Panel>
      </div>

      {/* Create Batch Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <form
            onSubmit={handleCreateBatch}
            className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-semibold text-foreground">
                Create Placement Batch
              </h3>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="mb-1 block font-semibold text-muted-foreground">
                  Batch Name / Identifier
                </label>
                <input
                  type="text"
                  required
                  value={newBatchName}
                  onChange={(e) => setNewBatchName(e.target.value)}
                  placeholder="BATCH-2026-ABC-CSE-01"
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
                />
              </div>

              <div>
                <label className="mb-1 block font-semibold text-muted-foreground">
                  Academic Department
                </label>
                <select
                  value={newBatchDept}
                  onChange={(e) => setNewBatchDept(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
                >
                  <option value="CSE">Computer Science &amp; Engineering (CSE)</option>
                  <option value="IT">Information Technology (IT)</option>
                  <option value="ECE">Electronics &amp; Communication (ECE)</option>
                  <option value="MECH">Mechanical / Robotics</option>
                  <option value="ALL">Interdisciplinary / Combined</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between font-semibold text-muted-foreground">
                  <span>Batch Capacity (100–300 max):</span>
                  <span className="font-mono font-bold text-primary">{newBatchCapacity}</span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={300}
                  step={10}
                  value={newBatchCapacity}
                  onChange={(e) => setNewBatchCapacity(Number(e.target.value))}
                  className="mt-2 w-full accent-primary"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
              >
                Create Batch
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Batch Roster Modal */}
      {rosterBatchId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Cohort Roster: {getBatchName(rosterBatchId)}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Learners enrolled in this synchronized placement batch
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const currentBatch = batchesWithCounts.find((b) => b.id === rosterBatchId);
                    if (currentBatch) {
                      setDeleteTargetBatch(currentBatch);
                    }
                  }}
                  className="inline-flex items-center gap-1 rounded-md border border-destructive/40 bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive hover:bg-destructive/20 transition-colors shadow-xs"
                  title="Delete this cohort batch"
                >
                  <Trash2 className="size-3" />
                  <span>Delete Batch</span>
                </button>
                <button
                  onClick={() => setRosterBatchId(null)}
                  className="text-muted-foreground hover:text-foreground p-1"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* Roster Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
              <input
                type="text"
                value={rosterSearch}
                onChange={(e) => setRosterSearch(e.target.value)}
                placeholder="Search learners by name, email, roll number, department…"
                className="w-full rounded-lg border border-border bg-card pl-9 pr-8 py-1.5 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs transition-colors"
              />
              {rosterSearch && (
                <button
                  type="button"
                  onClick={() => setRosterSearch("")}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                  title="Clear learner search"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            <div className="space-y-2">
              {rosterLearners.length > 0 ? (
                rosterLearners.map((learner) => (
                  <div
                    key={learner.email}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-3 text-xs shadow-xs"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{learner.name}</p>
                      <p className="font-mono text-muted-foreground text-[11px]">
                        {learner.rollNo} · {learner.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {Array.from(new Set(learner.tracks || [])).map((t, idx) => (
                          <span
                            key={`${learner.email}-${t}-${idx}`}
                            className="rounded bg-muted border border-border px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                      <span className="font-mono text-amber-600 dark:text-amber-400 text-xs font-semibold">
                        🔥 {learner.streak}d
                      </span>
                      <button
                        onClick={() => {
                          setResetTargetStudent({
                            name: learner.name,
                            email: learner.email,
                            rollNo: learner.rollNo,
                            batchId: getBatchName(learner.batchId),
                            dept: learner.dept,
                            college: learner.college,
                          });
                          setIsResetModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-xs ml-1"
                        title="Reset Student Password"
                      >
                        <KeyRound className="size-3 text-primary" />
                        <span className="hidden sm:inline">Pass</span>
                      </button>
                      <button
                        onClick={() => {
                          setDeleteTargetStudent({
                            name: learner.name,
                            email: learner.email,
                            rollNo: learner.rollNo,
                            batchId: learner.batchId,
                          });
                        }}
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-[11px] font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shadow-xs ml-1"
                        title="Delete Student from Cohort"
                      >
                        <Trash2 className="size-3" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No provisioned learners assigned to this batch yet.
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-border">
              <button
                onClick={() => setRosterBatchId(null)}
                className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-xs"
              >
                Close
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
                  const res = await deleteLiveStudent(deleteTargetStudent.email);
                  if (res.ok) {
                    toast.success(`Removed student ${deleteTargetStudent.name}`);
                    await Promise.all([
                      queryClient.invalidateQueries({ queryKey: ["live", "student-roster"] }),
                      queryClient.invalidateQueries({ queryKey: ["live", "batches"] }),
                      queryClient.invalidateQueries({ queryKey: ["live", "admin-analytics"] }),
                    ]);
                    setDeleteTargetStudent(null);
                  } else {
                    toast.error(res.error || "Failed to delete student from Supabase");
                  }
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

      {/* Batch Delete Confirmation Modal */}
      {deleteTargetBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <div className="grid size-10 place-items-center rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
                <Trash2 className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Delete Placement Batch?
                </h3>
                <p className="text-xs text-muted-foreground">
                  Permanently remove or archive this placement cohort
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-muted/20 p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Batch Name:</span>
                <span className="font-semibold text-foreground">{deleteTargetBatch.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Department:</span>
                <span className="font-semibold text-foreground">{deleteTargetBatch.dept}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Batch Capacity:</span>
                <span className="font-mono text-foreground">
                  {deleteTargetBatch.capacity} learners
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Enrolled Learners:</span>
                <span
                  className={cn(
                    "font-bold font-mono",
                    deleteTargetBatch.enrolled > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400",
                  )}
                >
                  {deleteTargetBatch.enrolled} active
                </span>
              </div>
            </div>

            {deleteTargetBatch.enrolled > 0 ? (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  <strong>Notice:</strong> This cohort currently has{" "}
                  <strong>{deleteTargetBatch.enrolled} enrolled student(s)</strong>. Deleting this
                  batch will detach these learners (their cohort will be set to "Not Assigned")
                  without deleting their accounts.
                </span>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground leading-relaxed">
                This cohort has no currently enrolled students. It will be removed from all active
                listings.
              </p>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
              <button
                type="button"
                disabled={isDeletingBatch}
                onClick={() => setDeleteTargetBatch(null)}
                className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-xs disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingBatch}
                onClick={handleDeleteBatch}
                className="inline-flex items-center gap-1.5 rounded-lg bg-destructive px-4 py-2 text-xs font-semibold text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-xs disabled:opacity-50"
              >
                {isDeletingBatch ? (
                  <>
                    <RefreshCw className="size-3.5 animate-spin" />
                    <span>Deleting Batch…</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="size-3.5" />
                    <span>Delete Batch</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
