import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Chip, Console, Meter, PageHeader, Panel, Stat } from "@/components/kit";
import { useAppStore, type Batch } from "@/lib/app-store";
import { STUDENT_ACCOUNTS } from "@/lib/accounts";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminResetPasswordModal, type ResetPasswordStudent } from "@/components/admin-reset-password-modal";

export const Route = createFileRoute("/admin/batches")({
  head: () => ({
    meta: [
      { title: "Batch & Telegram Hub — SantoGe Talent Cloud" },
      { name: "description", content: "Manage 100–300 sizing constraints, batch renaming, Telegram sync webhooks, and synchronized placement broadcasts." },
      { property: "og:title", content: "Batch & Telegram Hub — SantoGe Talent Cloud" },
      { property: "og:description", content: "Manage batch capacity, renaming, and Telegram sync." },
    ],
  }),
  component: BatchesPage,
});

function BatchesPage() {
  const store = useAppStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newBatchName, setNewBatchName] = useState("BATCH-2026-PSG-CSE-02");
  const [newBatchDept, setNewBatchDept] = useState("CSE");
  const [newBatchCapacity, setNewBatchCapacity] = useState(250);
  
  // Telegram broadcast simulator states
  const [broadcastTargetBatch, setBroadcastTargetBatch] = useState<string>("BATCH-2026-ABC-CSE-01");
  const [broadcastMessage, setBroadcastMessage] = useState(
    "📢 Day 26 Morning Broadcast: English Idiom drills & Aptitude Work-Rate formulas are live! Join in-app guided practice before 09:00 AM."
  );
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastLogs, setBroadcastLogs] = useState<string[]>([
    "[bot] Telegram Bot Webhook connected: @SantoGeTalentBot",
    "[status] 3 Channels active · 669 listeners subscribed",
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

  const totalCapacity = store.batches.reduce((s, b) => s + b.capacity, 0);
  const totalEnrolled = store.batches.reduce((s, b) => s + b.enrolled, 0);

  const handleStartEdit = (b: Batch) => {
    setEditingId(b.id);
    setEditName(b.name);
  };

  const handleSaveEdit = (id: string) => {
    if (!editName.trim()) {
      toast.error("Batch name cannot be empty");
      return;
    }
    store.updateBatch(id, { name: editName.trim() });
    setEditingId(null);
    toast.success("Batch renamed successfully");
  };

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchName.trim()) {
      toast.error("Please enter a valid batch name");
      return;
    }
    if (newBatchCapacity < 100 || newBatchCapacity > 300) {
      toast.error("Batch capacity must be between 100 and 300 students");
      return;
    }

    const newId = newBatchName.trim().toUpperCase().replace(/\s+/g, "-");
    store.createBatch({
      id: newId,
      name: newBatchName.trim(),
      dept: newBatchDept,
      capacity: newBatchCapacity,
      enrolled: 0,
    });
    setCreateModalOpen(false);
  };

  const handleDispatchTelegram = () => {
    if (!broadcastMessage.trim()) return;
    setIsBroadcasting(true);
    const target = store.batches.find((b) => b.id === broadcastTargetBatch);
    const learnerCount = target ? target.enrolled : 200;

    setBroadcastLogs((prev) => [
      `[tx] Dispatching webhook to Telegram channel: t.me/stc-${broadcastTargetBatch.toLowerCase()}`,
      `[tx] Payload: "${broadcastMessage.slice(0, 60)}…"`,
      ...prev,
    ]);

    setTimeout(() => {
      setIsBroadcasting(false);
      store.syncBatch(broadcastTargetBatch);
      setBroadcastLogs((prev) => [
        `[delivered] Broadcast received by ${learnerCount} active devices via Telegram Bot API (200 OK)`,
        ...prev,
      ]);
      toast.success(`Broadcast delivered to ${broadcastTargetBatch}!`);
    }, 1200);
  };

  // Filter learners in selected roster (combines demo accounts + custom + CSV provisioned, filtering deleted)
  const rosterLearners = useMemo(() => {
    const deleted = new Set((store.deletedStudentEmails || []).map((e) => e.toLowerCase()));

    const fromAccounts = STUDENT_ACCOUNTS
      .filter((s) => !deleted.has(s.email.toLowerCase()) && (s.batchId === rosterBatchId || rosterBatchId === "all"))
      .map((s) => ({
        name: s.name,
        email: s.email,
        rollNo: s.rollNo,
        dept: s.dept,
        batchId: s.batchId,
        college: s.college,
        tracks: s.tracks as string[],
        streak: s.streak,
        placementDay: s.placementDay,
      }));

    const fromCustom = Object.values(store.customStudents || {})
      .filter((s) => !deleted.has(s.email.toLowerCase()) && (s.batchId === rosterBatchId || rosterBatchId === "all"))
      .map((s) => ({
        name: s.name,
        email: s.email,
        rollNo: s.rollNo,
        dept: s.dept,
        batchId: s.batchId,
        college: s.college,
        tracks: s.tracks as string[],
        streak: s.streak,
        placementDay: s.placementDay,
      }));

    const fromProvisioned = (store.provisioned || [])
      .filter((p) => !deleted.has(p.email.toLowerCase()) && (p.batch_id === rosterBatchId || rosterBatchId === "all"))
      .map((p) => ({
        name: p.student_name,
        email: p.email,
        rollNo: p.roll_no,
        dept: p.dept,
        batchId: p.batch_id,
        college: "Partner College",
        tracks: [p.course_1, p.course_2, p.course_3].filter(Boolean),
        streak: 1,
        placementDay: 1,
      }));

    const seen = new Set<string>();
    const result = [];
    for (const item of [...fromAccounts, ...fromCustom, ...fromProvisioned]) {
      const em = item.email.toLowerCase();
      if (!seen.has(em)) {
        seen.add(em);
        result.push(item);
      }
    }
    return result;
  }, [rosterBatchId, store.provisioned, store.customStudents, store.deletedStudentEmails]);

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
        <Stat label="Total Cohorts" value={store.batches.length} hint="Placement Accelerator" />
        <Stat label="Total Capacity" value={totalCapacity} accent="var(--brand-purple)" hint="Sum of batch allocations" />
        <Stat label="Enrolled Learners" value={totalEnrolled} accent="var(--brand-emerald)" hint="Active student profiles" />
        <Stat label="Platform Fill Rate" value={`${Math.round((totalEnrolled / Math.max(totalCapacity, 1)) * 100)}%`} accent="var(--brand-amber)" hint="Cohort utilization" />
      </div>

      {/* Batch Cards Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {store.batches.map((b) => {
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
                    <button onClick={() => handleSaveEdit(b.id)} className="text-brand-emerald hover:opacity-80">
                      <Check className="size-4" />
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-copy-subtle hover:text-foreground">
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
              subtitle={`${b.dept} · ID: ${b.id}`}
              action={
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setRosterBatchId(b.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-line-soft bg-surface-soft px-2.5 py-1 text-[11px] font-semibold text-foreground hover:border-brand-purple/60"
                  >
                    <Users className="size-3" /> Roster
                  </button>
                  <button
                    onClick={() => {
                      store.syncBatch(b.id);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-line-soft bg-surface-soft px-2.5 py-1 text-[11px] font-bold text-brand-cyan hover:border-brand-cyan/60"
                  >
                    <RefreshCw className="size-3" /> Sync
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
              <Meter value={fill} accent={fill >= 80 ? "var(--brand-emerald)" : "var(--brand-cyan)"} />

              {/* Sizing Slider (100 - 300 constraint) */}
              <div className="mt-4 space-y-3 rounded-xl border border-line-soft bg-surface-soft p-3.5">
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-copy-subtle">Batch Sizing Constraint (100–300):</span>
                    <span className="font-mono font-bold text-brand-purple">{b.capacity} students</span>
                  </div>
                  <input
                    type="range"
                    min={100}
                    max={300}
                    step={10}
                    value={b.capacity}
                    onChange={(e) => store.updateBatch(b.id, { capacity: Number(e.target.value) })}
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
                    <input
                      type="number"
                      value={b.enrolled}
                      max={b.capacity}
                      onChange={(e) => store.updateBatch(b.id, { enrolled: Math.min(Number(e.target.value), b.capacity) })}
                      className="mt-1 w-full rounded-lg border border-line-soft bg-surface-dark px-2.5 py-1.5 font-mono text-xs text-foreground outline-none focus:border-brand-cyan/60"
                    />
                  </div>
                  <div>
                    <span className="block font-semibold text-copy-subtle">Department Tag</span>
                    <input
                      type="text"
                      value={b.dept}
                      onChange={(e) => store.updateBatch(b.id, { dept: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-line-soft bg-surface-dark px-2.5 py-1.5 font-mono text-xs text-foreground outline-none focus:border-brand-cyan/60"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-copy-subtle">
                <span className="flex items-center gap-1 text-brand-cyan">
                  <Send className="size-3" /> t.me/stc-{b.id.toLowerCase()}
                </span>
                <span>Last Synced: {b.lastSync ?? "Pending daily cron"}</span>
              </div>
            </Panel>
          );
        })}
      </div>

      {/* Telegram Webhook & Broadcast Simulator */}
      <div className="grid gap-4 lg:grid-cols-[1fr_440px]">
        <Panel
          title="Telegram Cohort Broadcast Dispatcher"
          subtitle="Push morning placement lessons, video links, or alerts to the dedicated Telegram channel"
        >
          <div className="space-y-3.5">
            <div>
              <label className="mb-1 block text-xs font-semibold text-copy-subtle">Target Batch Channel</label>
              <select
                value={broadcastTargetBatch}
                onChange={(e) => setBroadcastTargetBatch(e.target.value)}
                className="w-full rounded-xl border border-line-soft bg-surface-soft px-3 py-2.5 text-xs font-semibold text-foreground outline-none focus:border-brand-cyan/60"
              >
                {store.batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.enrolled} learners · t.me/stc-{b.id.toLowerCase()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-copy-subtle">Broadcast Message Content</label>
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
              {isBroadcasting ? <RefreshCw className="size-4 animate-spin" /> : <Send className="size-4" />}
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
          <form onSubmit={handleCreateBatch} className="w-full max-w-md rounded-2xl border border-line-soft bg-surface-elevated p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-line-soft pb-3">
              <h3 className="font-display text-base font-bold text-foreground">Create Placement Batch</h3>
              <button type="button" onClick={() => setCreateModalOpen(false)} className="text-copy-subtle hover:text-foreground">
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="mb-1 block font-semibold text-copy-subtle">Batch Name / Identifier</label>
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
                <label className="mb-1 block font-semibold text-copy-subtle">Academic Department</label>
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
                <h3 className="font-display text-base font-bold text-foreground">Cohort Roster: {rosterBatchId}</h3>
                <p className="text-xs text-copy-subtle mt-0.5">Learners enrolled in this synchronized placement batch</p>
              </div>
              <button onClick={() => setRosterBatchId(null)} className="text-copy-subtle hover:text-foreground">
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-2">
              {rosterLearners.length > 0 ? (
                rosterLearners.map((learner) => (
                  <div key={learner.email} className="flex items-center justify-between rounded-xl border border-line-soft bg-surface-soft p-3 text-xs">
                    <div>
                      <p className="font-bold text-foreground">{learner.name}</p>
                      <p className="font-mono text-copy-subtle text-[11px]">{learner.rollNo} · {learner.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {learner.tracks.map((t) => (
                          <span key={t} className="rounded bg-surface-dark border border-line-soft px-1.5 py-0.5 text-[10px] font-mono">
                            {t}
                          </span>
                        ))}
                      </div>
                      <span className="font-mono text-brand-amber text-xs font-bold">🔥 {learner.streak}d</span>
                      <button
                        onClick={() => {
                          setResetTargetStudent({
                            name: learner.name,
                            email: learner.email,
                            rollNo: learner.rollNo,
                            batchId: learner.batchId,
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
                <h3 className="font-display text-base font-bold text-foreground">Remove Learner from Roster?</h3>
                <p className="text-xs text-copy-subtle">This action permanently removes the student from this cohort</p>
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
                <span className="font-mono font-semibold text-foreground">{deleteTargetStudent.rollNo}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-copy-subtle font-medium">Cohort Batch:</span>
                <span className="font-mono font-bold text-brand-purple">{deleteTargetStudent.batchId}</span>
              </div>
            </div>

            <p className="text-xs text-copy-subtle leading-relaxed">
              Removing this student will permanently delete their progress, revoke active portal access, update cohort batch headcount, and record the removal in the audit log.
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
                onClick={() => {
                  const res = store.deleteStudent(deleteTargetStudent.email);
                  if (res.ok) {
                    setDeleteTargetStudent(null);
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
    </div>
  );
}

