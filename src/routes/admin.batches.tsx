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
    <div className="space-y-6">
      <PageHeader
        title="Batch Management & Telegram Hub"
        subtitle="Manage batch sizing (100–300 constraint), batch renaming, Telegram channel webhooks, and morning synchronized broadcasts."
        action={
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple px-4 py-2 text-xs font-bold text-surface-dark shadow-md"
          >
            <Plus className="size-4" /> Create New Batch
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Total Cohorts" value={batchesWithCounts.length} hint="Placement Accelerator" />
        <Stat
          label="Total Capacity"
          value={totalCapacity}
          accent="var(--brand-purple)"
          hint="Sum of batch allocations"
        />
        <Stat
          label="Enrolled Learners"
          value={totalEnrolled}
          accent="var(--brand-emerald)"
          hint="Active student profiles"
        />
        <Stat
          label="Platform Fill Rate"
          value={`${Math.round((totalEnrolled / Math.max(totalCapacity, 1)) * 100)}%`}
          accent="var(--brand-amber)"
          hint="Cohort utilization"
        />
      </div>

      {/* Batch Search & Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-copy-subtle" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search batches by name, department, size…"
            className="w-full rounded-xl border border-line-soft bg-surface-soft pl-10 pr-9 py-2 text-xs text-foreground outline-none placeholder:text-copy-subtle focus:border-brand-cyan/60 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-copy-subtle hover:text-foreground"
              title="Clear search"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Filter className="size-3.5 text-copy-subtle" />
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="rounded-xl border border-line-soft bg-surface-soft px-3 py-2 text-xs font-medium text-foreground outline-none focus:border-brand-cyan/60"
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
            <SlidersHorizontal className="size-3.5 text-copy-subtle" />
            <select
              value={utilizationFilter}
              onChange={(e) => setUtilizationFilter(e.target.value)}
              className="rounded-xl border border-line-soft bg-surface-soft px-3 py-2 text-xs font-medium text-foreground outline-none focus:border-brand-cyan/60"
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
              className="inline-flex items-center gap-1 rounded-lg bg-surface-dark border border-line-soft px-2.5 py-1.5 text-xs font-semibold text-foreground hover:text-brand-rose transition-colors"
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
          <div className="col-span-full rounded-2xl border border-line-soft bg-surface-soft p-12 text-center space-y-3">
            <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-surface-elevated border border-line-soft text-copy-subtle">
              <Search className="size-6" />
            </div>
            <h4 className="font-display text-base font-bold text-foreground">
              No Placement Batches Found
            </h4>
            <p className="text-xs text-copy-subtle max-w-md mx-auto">
              No cohorts match your current search &ldquo;<span className="text-brand-cyan font-semibold">{searchQuery}</span>&rdquo;
              {deptFilter !== "all" ? ` in department ${deptFilter}` : ""}.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setDeptFilter("all");
                setUtilizationFilter("all");
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-line-soft bg-surface-elevated px-4 py-2 text-xs font-semibold text-foreground hover:border-brand-cyan/60 transition-colors"
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
                      className="rounded-lg border border-brand-cyan/60 bg-surface-dark px-2.5 py-1 text-sm font-bold text-foreground outline-none"
                    />
                    <button
                      onClick={() => handleSaveEdit(b.id)}
                      className="text-brand-emerald hover:opacity-80"
                    >
                      <Check className="size-4" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-copy-subtle hover:text-foreground"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>{b.name}</span>
                    <button
                      onClick={() => handleStartEdit(b)}
                      className="text-copy-subtle hover:text-brand-cyan transition-colors"
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
                    className="inline-flex items-center gap-1 rounded-lg border border-line-soft bg-surface-soft px-2.5 py-1 text-[11px] font-semibold text-foreground hover:border-brand-purple/60 transition-colors"
                  >
                    <Users className="size-3" /> Roster
                  </button>
                  <button
                    onClick={() => handleSyncBatch(b.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-line-soft bg-surface-soft px-2.5 py-1 text-[11px] font-bold text-brand-cyan hover:border-brand-cyan/60 transition-colors"
                  >
                    <RefreshCw className="size-3" /> Sync
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTargetBatch(b)}
                    className="inline-flex items-center gap-1 rounded-lg border border-line-soft bg-surface-soft px-2 py-1 text-[11px] font-semibold text-copy-subtle hover:text-brand-rose hover:border-brand-rose/60 hover:bg-brand-rose/10 transition-colors"
                    title={`Delete batch ${b.name}`}
                  >
                    <Trash2 className="size-3" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              }
            >
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-copy-subtle">Capacity Utilization</span>
                <span className="font-mono text-foreground font-semibold">
                  {b.enrolled} / {b.capacity} ({fill}%)
                </span>
              </div>
              <Meter
                value={fill}
                accent={fill >= 80 ? "var(--brand-emerald)" : "var(--brand-cyan)"}
              />

              {/* Sizing Slider (100 - 300 constraint) */}
              <div className="mt-4 space-y-3 rounded-xl border border-line-soft bg-surface-soft p-3.5">
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-copy-subtle">
                      Batch Sizing Constraint (100–300):
                    </span>
                    <span className="font-mono font-bold text-brand-purple">
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
                    className="mt-2 w-full accent-[var(--brand-purple)]"
                  />
                  <div className="flex justify-between text-[10px] text-copy-subtle mt-0.5 font-mono">
                    <span>100 Min</span>
                    <span>200 Optimum</span>
                    <span>300 Max</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-line-soft/60 text-xs">
                  <div>
                    <span className="block font-semibold text-copy-subtle">Enrolled Learners</span>
                    <div className="mt-1 w-full rounded-lg border border-line-soft bg-surface-dark px-2.5 py-1.5 font-mono text-xs text-foreground">
                      {b.enrolled}
                    </div>
                  </div>
                  <div>
                    <span className="block font-semibold text-copy-subtle">Department Tag</span>
                    <input
                      type="text"
                      value={b.dept}
                      onChange={(e) => handleUpdateDept(b.id, e.target.value)}
                      className="mt-1 w-full rounded-lg border border-line-soft bg-surface-dark px-2.5 py-1.5 font-mono text-xs text-foreground outline-none focus:border-brand-cyan/60"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-copy-subtle">
                <span className="flex items-center gap-1 text-brand-cyan">
                  <Send className="size-3" /> t.me/stc-{b.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
                </span>
                <span>Last Synced: {b.lastSync ?? "Pending daily cron"}</span>
              </div>
            </Panel>
          );
        }))}
      </div>

      {/* Telegram Webhook & Broadcast Simulator */}
      <div className="grid gap-4 lg:grid-cols-[1fr_440px]">
        <Panel
          title="Telegram Cohort Broadcast Dispatcher"
          subtitle="Push morning placement lessons, video links, or alerts to the dedicated Telegram channel"
        >
          <div className="space-y-3.5">
            <div>
              <label className="mb-1 block text-xs font-semibold text-copy-subtle">
                Target Batch Channel
              </label>
              <select
                value={broadcastTargetBatch}
                onChange={(e) => setBroadcastTargetBatch(e.target.value)}
                className="w-full rounded-xl border border-line-soft bg-surface-soft px-3 py-2.5 text-xs font-semibold text-foreground outline-none focus:border-brand-cyan/60"
              >
                {batchesWithCounts.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.enrolled} learners)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-copy-subtle">
                Broadcast Message Content
              </label>
              <textarea
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                rows={4}
                placeholder="Enter message for the batch Telegram cohort…"
                className="w-full rounded-xl border border-line-soft bg-surface-soft p-3 text-xs text-foreground outline-none focus:border-brand-cyan/60"
              />
            </div>

            <button
              onClick={handleDispatchTelegram}
              disabled={isBroadcasting}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple px-5 py-2.5 text-xs font-bold text-surface-dark shadow-md transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isBroadcasting ? (
                <RefreshCw className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-ink/70 backdrop-blur-md">
          <form
            onSubmit={handleCreateBatch}
            className="w-full max-w-md rounded-2xl border border-line-soft bg-surface-elevated p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-line-soft pb-3">
              <h3 className="font-display text-base font-bold text-foreground">
                Create Placement Batch
              </h3>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="text-copy-subtle hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="mb-1 block font-semibold text-copy-subtle">
                  Batch Name / Identifier
                </label>
                <input
                  type="text"
                  required
                  value={newBatchName}
                  onChange={(e) => setNewBatchName(e.target.value)}
                  placeholder="BATCH-2026-ABC-CSE-01"
                  className="w-full rounded-xl border border-line-soft bg-surface-soft px-3 py-2 font-mono text-xs text-foreground outline-none focus:border-brand-cyan/60"
                />
              </div>

              <div>
                <label className="mb-1 block font-semibold text-copy-subtle">
                  Academic Department
                </label>
                <select
                  value={newBatchDept}
                  onChange={(e) => setNewBatchDept(e.target.value)}
                  className="w-full rounded-xl border border-line-soft bg-surface-soft px-3 py-2 text-xs font-semibold text-foreground outline-none"
                >
                  <option value="CSE">Computer Science &amp; Engineering (CSE)</option>
                  <option value="IT">Information Technology (IT)</option>
                  <option value="ECE">Electronics &amp; Communication (ECE)</option>
                  <option value="MECH">Mechanical / Robotics</option>
                  <option value="ALL">Interdisciplinary / Combined</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between font-semibold text-copy-subtle">
                  <span>Batch Capacity (100–300 max):</span>
                  <span className="font-mono font-bold text-brand-cyan">{newBatchCapacity}</span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={300}
                  step={10}
                  value={newBatchCapacity}
                  onChange={(e) => setNewBatchCapacity(Number(e.target.value))}
                  className="mt-2 w-full accent-[var(--brand-cyan)]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-line-soft">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="rounded-xl border border-line-soft px-4 py-2 text-xs font-semibold text-copy-subtle hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple px-4 py-2 text-xs font-bold text-surface-dark"
              >
                Create Batch
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Batch Roster Modal */}
      {rosterBatchId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-ink/70 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-2xl border border-line-soft bg-surface-elevated p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-line-soft pb-3">
              <div>
                <h3 className="font-display text-base font-bold text-foreground">
                  Cohort Roster: {getBatchName(rosterBatchId)}
                </h3>
                <p className="text-xs text-copy-subtle mt-0.5">
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
                  className="inline-flex items-center gap-1 rounded-lg border border-brand-rose/40 bg-brand-rose/10 px-2.5 py-1 text-[11px] font-semibold text-brand-rose hover:bg-brand-rose/20 transition-colors"
                  title="Delete this cohort batch"
                >
                  <Trash2 className="size-3" />
                  <span>Delete Batch</span>
                </button>
                <button
                  onClick={() => setRosterBatchId(null)}
                  className="text-copy-subtle hover:text-foreground"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* Roster Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 size-3.5 text-copy-subtle" />
              <input
                type="text"
                value={rosterSearch}
                onChange={(e) => setRosterSearch(e.target.value)}
                placeholder="Search learners by name, email, roll number, department…"
                className="w-full rounded-xl border border-line-soft bg-surface-soft pl-9 pr-8 py-2 text-xs text-foreground outline-none placeholder:text-copy-subtle focus:border-brand-cyan/60 transition-colors"
              />
              {rosterSearch && (
                <button
                  type="button"
                  onClick={() => setRosterSearch("")}
                  className="absolute right-2.5 top-2.5 text-copy-subtle hover:text-foreground"
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
                    className="flex items-center justify-between rounded-xl border border-line-soft bg-surface-soft p-3 text-xs"
                  >
                    <div>
                      <p className="font-bold text-foreground">{learner.name}</p>
                      <p className="font-mono text-copy-subtle text-[11px]">
                        {learner.rollNo} · {learner.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {Array.from(new Set(learner.tracks || [])).map((t, idx) => (
                          <span
                            key={`${learner.email}-${t}-${idx}`}
                            className="rounded bg-surface-dark border border-line-soft px-1.5 py-0.5 text-[10px] font-mono"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                      <span className="font-mono text-brand-amber text-xs font-bold">
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
                        className="inline-flex items-center gap-1 rounded-lg border border-line-soft bg-surface-dark px-2 py-1 text-[11px] font-semibold text-copy-subtle hover:text-brand-purple hover:border-brand-purple/60 transition-colors ml-1"
                        title="Reset Student Password"
                      >
                        <KeyRound className="size-3" />
                        <span className="hidden sm:inline">Reset Pass</span>
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
                        className="inline-flex items-center gap-1 rounded-lg border border-line-soft bg-surface-dark px-2 py-1 text-[11px] font-semibold text-copy-subtle hover:text-brand-rose hover:border-brand-rose/60 hover:bg-brand-rose/10 transition-colors ml-1"
                        title="Delete Student from Cohort"
                      >
                        <Trash2 className="size-3" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-copy-subtle">
                  No provisioned learners assigned to this batch yet.
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-line-soft">
              <button
                onClick={() => setRosterBatchId(null)}
                className="rounded-xl border border-line-soft px-4 py-2 text-xs font-semibold text-foreground"
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
                <span className="font-bold text-brand-purple">
                  {getBatchName(deleteTargetStudent.batchId)}
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
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-rose px-4 py-2 text-xs font-bold text-white hover:bg-brand-rose/90 shadow-lg shadow-brand-rose/20 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-ink/75 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-line-soft bg-surface-elevated p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 border-b border-line-soft pb-3">
              <div className="grid size-10 place-items-center rounded-xl bg-brand-rose/15 text-brand-rose border border-brand-rose/30">
                <Trash2 className="size-5" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-foreground">
                  Delete Placement Batch?
                </h3>
                <p className="text-xs text-copy-subtle">
                  Permanently remove or archive this placement cohort
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-line-soft bg-surface-soft p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-copy-subtle font-medium">Batch Name:</span>
                <span className="font-bold text-foreground">{deleteTargetBatch.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-copy-subtle font-medium">Department:</span>
                <span className="font-semibold text-brand-cyan">{deleteTargetBatch.dept}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-copy-subtle font-medium">Batch Capacity:</span>
                <span className="font-mono text-foreground">
                  {deleteTargetBatch.capacity} learners
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-copy-subtle font-medium">Enrolled Learners:</span>
                <span
                  className={cn(
                    "font-bold font-mono",
                    deleteTargetBatch.enrolled > 0 ? "text-brand-amber" : "text-brand-emerald",
                  )}
                >
                  {deleteTargetBatch.enrolled} active
                </span>
              </div>
            </div>

            {deleteTargetBatch.enrolled > 0 ? (
              <div className="rounded-xl border border-brand-amber/30 bg-brand-amber/10 p-3 text-xs text-brand-amber flex items-start gap-2">
                <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  <strong>Notice:</strong> This cohort currently has{" "}
                  <strong>{deleteTargetBatch.enrolled} enrolled student(s)</strong>. Deleting this
                  batch will detach these learners (their cohort will be set to "Not Assigned")
                  without deleting their accounts.
                </span>
              </div>
            ) : (
              <p className="text-xs text-copy-subtle leading-relaxed">
                This cohort has no currently enrolled students. It will be removed from all active
                listings.
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-line-soft">
              <button
                type="button"
                disabled={isDeletingBatch}
                onClick={() => setDeleteTargetBatch(null)}
                className="rounded-xl border border-line-soft bg-surface-soft px-4 py-2 text-xs font-semibold text-copy-subtle hover:text-foreground hover:bg-surface-elevated transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingBatch}
                onClick={handleDeleteBatch}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-rose px-4 py-2 text-xs font-bold text-white hover:bg-brand-rose/90 shadow-lg shadow-brand-rose/20 transition-colors disabled:opacity-50"
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
