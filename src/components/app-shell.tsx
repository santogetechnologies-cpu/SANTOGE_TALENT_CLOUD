import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  Bot,
  BarChart3,
  FileText,
  FolderUp,
  GraduationCap,
  Hexagon,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Settings2,
  Shield,
  Sun,
  Target,
  Terminal,
  Timer,
  Users,
  Workflow,
  Flame,
  Zap,
  X,
  Code2,
  Trophy,
  Search,
  Check,
  Command,
  BookOpen,
} from "lucide-react";
import { useAppStore, type Role } from "@/lib/app-store";
import { TRACKS, type TrackId } from "@/lib/tracks";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; section?: string };

const STUDENT_NAV: NavItem[] = [
  { to: "/student", label: "Today's Learning & Drills", icon: LayoutDashboard },
  { to: "/student/technical", label: "90-Day Tracks & Portfolio", icon: Code2 },
  {
    to: "/student/gateway",
    label: "Career Gateway (Phase 2)",
    icon: FileText,
    section: "Career & Placement",
  },
  { to: "/student/settings", label: "Settings & Courses", icon: Settings2 },
];

const ADMIN_NAV: NavItem[] = [
  { to: "/admin", label: "Executive Analytics", icon: BarChart3 },
  { to: "/admin/content", label: "Curriculum CMS", icon: BookOpen },
  { to: "/admin/provisioning", label: "Bulk CSV Provisioning", icon: FolderUp },
  { to: "/admin/batches", label: "Batch & Telegram Hub", icon: Users },
  { to: "/admin/automations", label: "Cron & Automations", icon: Bot },
  { to: "/admin/architecture", label: "Master Architecture", icon: Workflow },
  { to: "/admin/settings", label: "System & Dual Gate Rules", icon: Settings2 },
];

type SearchResult = {
  title: string;
  category:
    "Technical Tracks" | "Interactive Labs" | "Placement Tools" | "Platform Admin" | "Pages";
  to: string;
  desc: string;
};

const SEARCH_ITEMS: SearchResult[] = [
  ...TRACKS.map((t) => ({
    title: t.name,
    category: "Technical Tracks" as const,
    to: "/student/technical",
    desc: `${t.domain} · ${t.tagline}`,
  })),
  ...TRACKS.map((t) => ({
    title: `${t.short} Sandbox Simulator`,
    category: "Interactive Labs" as const,
    to: "/student/labs",
    desc: `Lab: ${t.labTitle} (+50 XP)`,
  })),
  {
    title: "Today's Learning & Drills",
    category: "Placement Tools" as const,
    to: "/student",
    desc: "Twin 30-min routine: Placement Accelerator + Technical Sandbox",
  },
  {
    title: "90-Day Placement Syllabus & Portfolio",
    category: "Placement Tools" as const,
    to: "/student/technical",
    desc: "18-week schedule, 18 Friday projects, Day 90 industry capstone",
  },
  {
    title: "Dual Completion Gate & Phase 2",
    category: "Placement Tools" as const,
    to: "/student/gateway",
    desc: "ATS Resume Scanner, AI Mock Interviews, Certifications & Marketplace",
  },
  {
    title: "Curriculum Content Management System (CMS)",
    category: "Platform Admin" as const,
    to: "/admin/content",
    desc: "Author and edit 90-day placement lessons, MCQs, and 15 technical tracks",
  },
  {
    title: "Bulk CSV Provisioning",
    category: "Platform Admin" as const,
    to: "/admin/provisioning",
    desc: "Onboard college rosters, validate 100-300 batch sizes, issue logins",
  },
  {
    title: "Batch & Telegram Hub",
    category: "Platform Admin" as const,
    to: "/admin/batches",
    desc: "Batch rename, sizing sliders (100-300), Telegram webhook broadcast",
  },
  {
    title: "Cron & Automations Engine",
    category: "Platform Admin" as const,
    to: "/admin/automations",
    desc: "Scheduled pipelines: 06:00 broadcast, ATS parser, score recalculator",
  },
  {
    title: "Master Architecture & Systems Blueprint",
    category: "Platform Admin" as const,
    to: "/admin/architecture",
    desc: "Master Process Flow, Daily Twin 30m, Swimlanes, Automations, DFD Level 1/2",
  },
  {
    title: "System & Dual Gate Configuration",
    category: "Platform Admin" as const,
    to: "/admin/settings",
    desc: "Dual Completion Gate rules, secondary min slider, scoring weights",
  },
];

import { useQueryClient } from "@tanstack/react-query";
import { useLiveStudentProfile, updateLiveStudentTracks } from "@/lib/data";

export function AppShell({ portal }: { portal: Role }) {
  const store = useAppStore();
  const queryClient = useQueryClient();

  const { data: liveProfileData } = useLiveStudentProfile(
    store.supabaseSession?.user?.id,
    portal === "student" && !!store.supabaseSession?.user?.id,
  );
  const liveStudentId = liveProfileData?.profile?.id || store.liveStudentId;

  const activeTracks: TrackId[] =
    portal === "student" ? liveProfileData?.tracks || store.activeTracks : store.activeTracks;

  const streak =
    portal === "student" ? (liveProfileData?.profile?.streak ?? store.streak) : store.streak;

  const xp = portal === "student" ? (liveProfileData?.profile?.xp ?? store.xp) : store.xp;

  const talentScore =
    portal === "student"
      ? (liveProfileData?.profile?.talent_score ?? store.talentScore)
      : store.talentScore;

  const gateUnlocked =
    portal === "student"
      ? (liveProfileData?.profile?.placement_day ?? 1) >= 30
      : store.gateUnlocked;

  const eligibleCompanies =
    portal === "student"
      ? talentScore >= 700
        ? 6
        : talentScore >= 500
          ? 3
          : 1
      : store.eligibleCompanies;

  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [courseModalOpen, setCourseModalOpen] = useState(false);

  const nav = portal === "student" ? STUDENT_NAV : ADMIN_NAV;

  useEffect(() => {
    if (store.ready && !store.isAuthed) void navigate({ to: "/login" });
  }, [store.ready, store.isAuthed, navigate]);

  useEffect(() => {
    if (!store.ready || !store.isAuthed) return;
    // Admin trying to access student portal → redirect to admin
    if (portal === "student" && store.role === "admin") void navigate({ to: "/admin" });
    // Student (or non-admin user) trying to access admin portal → redirect to student
    if (portal === "admin" && store.role !== "admin") void navigate({ to: "/student" });
  }, [store.ready, store.isAuthed, store.role, portal, navigate]);

  // Keyboard shortcut Ctrl+K / Cmd+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const signOut = () => {
    store.signOut();
    void navigate({ to: "/login" });
  };

  const toggleCourseTrack = async (id: TrackId) => {
    const has = activeTracks.includes(id);
    const next = has ? activeTracks.filter((t) => t !== id) : [...activeTracks, id];
    if (next.length < 1) {
      toast.error("Please keep at least 1 active course track.");
      return;
    }
    if (next.length > 3) {
      toast.error("Maximum 3 technical course tracks allowed simultaneously.");
      return;
    }
    if (liveStudentId) {
      const res = await updateLiveStudentTracks(liveStudentId, next);
      if (!res.ok) {
        toast.error(res.error || "Failed to update tracks");
        return;
      }
      queryClient.invalidateQueries({
        queryKey: ["live", "student-profile", store.supabaseSession?.user?.id],
      });
    }
    store.setActiveTracks(next);
    toast.success(has ? "Track removed from your active courses" : "Enrolled in track!");
  };

  if (!store.ready || !store.isAuthed) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-sm text-copy-subtle">
        Loading workspace…
      </div>
    );
  }

  if (portal === "admin" && store.role !== "admin") {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-sm text-copy-subtle">
        Redirecting to student portal…
      </div>
    );
  }

  const label =
    portal === "student"
      ? (liveProfileData?.profile?.name ??
        store.student?.name ??
        store.sessionEmail?.split("@")[0] ??
        "Student Learner")
      : "Platform Super Admin";

  const filteredSearchResults = searchQuery.trim()
    ? SEARCH_ITEMS.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : SEARCH_ITEMS.slice(0, 8);

  return (
    <div className="min-h-screen bg-background app-grid">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed z-40 flex h-screen w-[274px] flex-col border-r border-line-soft bg-surface-elevated/95 p-4 backdrop-blur-xl transition-transform lg:sticky lg:top-0 lg:translate-x-0",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-cyan to-brand-purple shadow-md">
                <Hexagon className="size-5 text-surface-dark" />
              </span>
              <div>
                <p className="font-display text-sm font-bold leading-tight text-foreground">
                  SantoGe
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-copy-subtle">
                  Talent Cloud
                </p>
              </div>
            </div>
            <button
              className="lg:hidden"
              onClick={() => setOpen(false)}
              aria-label="Close navigation"
            >
              <X className="size-5 text-copy-subtle" />
            </button>
          </div>

          {/* User Status Card */}
          <div className="mb-4 rounded-xl border border-line-soft bg-surface-soft p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                {portal === "student" ? (
                  <GraduationCap className="size-4 text-brand-cyan" />
                ) : (
                  <Shield className="size-4 text-brand-purple" />
                )}
                <span className="truncate max-w-[140px]">{label}</span>
              </div>
              <span className="rounded bg-surface-elevated px-1.5 py-0.5 text-[9px] font-bold uppercase text-brand-cyan">
                {portal === "student" ? "Student" : "Admin"}
              </span>
            </div>
            {portal === "student" && (
              <div className="mt-1.5 flex items-center justify-between text-[10px] text-copy-subtle">
                <span>
                  {liveProfileData?.profile?.roll_no || store.student?.rollNo || "2026-CSE"}
                </span>
                <span className="font-mono text-foreground">
                  {liveProfileData?.profile?.batch_id || store.student?.batchId || "Cohort"}
                </span>
              </div>
            )}
            <div className="mt-2.5 flex items-center gap-1.5">
              {portal === "student" && (
                <button
                  onClick={() => setCourseModalOpen(true)}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-brand-cyan/40 bg-brand-cyan/10 px-2 py-1.5 text-[10px] font-bold text-brand-cyan transition-colors hover:bg-brand-cyan/20"
                >
                  <BookOpen className="size-3" /> Courses (1-3)
                </button>
              )}
              <button
                onClick={signOut}
                className="flex items-center justify-center gap-1 rounded-lg border border-line-soft px-2 py-1.5 text-[10px] font-semibold text-copy-subtle transition-colors hover:text-brand-rose"
              >
                <LogOut className="size-3" /> Exit
              </button>
            </div>
          </div>

          {/* Nav List */}
          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto pr-1">
            {nav.map((item, idx) => (
              <div key={item.to}>
                {item.section && (
                  <p
                    className={cn(
                      "px-3 text-[10px] font-bold uppercase tracking-wider text-copy-subtle/80",
                      idx > 0 ? "mt-3 mb-1" : "mb-1",
                    )}
                  >
                    {item.section}
                  </p>
                )}
                <Link
                  to={item.to}
                  activeOptions={{ exact: item.to === "/student" || item.to === "/admin" }}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-copy-subtle transition-colors hover:bg-surface-soft hover:text-foreground data-[status=active]:bg-surface-soft data-[status=active]:text-foreground data-[status=active]:shadow-[inset_2px_0_0_0_var(--brand-cyan)]"
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              </div>
            ))}
          </nav>

          {/* Bottom Talent Score Indicator */}
          <div className="mt-3 rounded-xl border border-line-soft bg-surface-soft p-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-copy-subtle">
                Talent Score
              </p>
              <span className="font-mono text-xs font-bold text-brand-cyan">
                {talentScore}/1000
              </span>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-copy-subtle">
              <span>Gate: {gateUnlocked ? "Unlocked 🔓" : "In Progress 🔒"}</span>
              <span className="text-brand-purple">{eligibleCompanies} Companies</span>
            </div>
          </div>
        </aside>

        {open && (
          <div
            className="fixed inset-0 z-30 bg-brand-ink/50 lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top Header */}
          <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line-soft bg-surface/80 px-4 py-2.5 backdrop-blur-xl sm:px-6">
            <button
              className="lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="size-5 text-foreground" />
            </button>

            {/* Global Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-line-soft bg-surface-soft/80 px-3 py-1.5 text-xs text-copy-subtle transition-colors hover:border-brand-cyan/50 hover:text-foreground"
            >
              <Search className="size-3.5 text-copy-subtle" />
              <span className="hidden sm:inline">Search tracks, labs, batch tools, cron…</span>
              <span className="sm:hidden">Search…</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded bg-surface-elevated px-1.5 py-0.5 text-[10px] font-mono font-medium text-copy-subtle border border-line-soft">
                <Command className="size-2.5 inline" /> K
              </kbd>
            </button>

            {/* Right Header Controls */}
            <div className="ml-auto flex items-center gap-2">
              {portal === "student" && (
                <>
                  <span className="hidden items-center gap-1.5 rounded-full border border-line-soft bg-surface-soft px-3 py-1.5 text-xs font-semibold text-brand-amber md:inline-flex">
                    <Flame className="size-3.5" /> Day {streak}
                  </span>
                  <span className="hidden items-center gap-1.5 rounded-full border border-line-soft bg-surface-soft px-3 py-1.5 text-xs font-semibold text-brand-cyan sm:inline-flex">
                    <Zap className="size-3.5" /> {xp} XP
                  </span>
                  <button
                    onClick={() => setCourseModalOpen(true)}
                    className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-brand-cyan/40 bg-brand-cyan/10 px-2.5 py-1.5 text-xs font-bold text-brand-cyan hover:bg-brand-cyan/20"
                  >
                    <BookOpen className="size-3.5" /> Course Switcher ({activeTracks.length}
                    /3)
                  </button>
                </>
              )}

              {/* Theme Toggle */}
              <button
                onClick={store.toggleTheme}
                aria-label="Toggle theme"
                className="grid size-9 place-items-center rounded-xl border border-line-soft bg-surface-soft text-foreground transition-colors hover:text-brand-cyan"
              >
                {store.theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </button>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="mx-auto w-full max-w-[1240px] flex-1 px-4 py-6 sm:px-6 sm:py-8">
            <Outlet />
          </main>
        </div>
      </div>

      {/* ================= GLOBAL SEARCH MODAL ================= */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-brand-ink/60 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-line-soft bg-surface-elevated shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 border-b border-line-soft px-4 py-3 bg-surface-soft">
              <Search className="size-4 text-brand-cyan shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 15 tracks, sandboxes, batch tools, cron, diagrams, ATS…"
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-copy-subtle"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="text-copy-subtle hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
              {filteredSearchResults.length > 0 ? (
                filteredSearchResults.map((res, i) => (
                  <button
                    key={`${res.title}-${i}`}
                    onClick={() => {
                      setSearchOpen(false);
                      void navigate({ to: res.to });
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs transition-colors hover:bg-surface-soft group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground group-hover:text-brand-cyan">
                          {res.title}
                        </p>
                        <span className="rounded bg-surface-dark px-1.5 py-0.5 text-[9px] font-semibold text-copy-subtle">
                          {res.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-copy-subtle mt-0.5">{res.desc}</p>
                    </div>
                    <span className="text-[10px] font-mono text-copy-subtle group-hover:text-brand-cyan">
                      Jump →
                    </span>
                  </button>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-copy-subtle">
                  No matching tools or pages found for "{searchQuery}".
                </div>
              )}
            </div>

            <div className="border-t border-line-soft px-4 py-2 bg-surface-soft/80 flex items-center justify-between text-[10px] text-copy-subtle">
              <span>
                Press{" "}
                <kbd className="font-mono bg-surface-elevated px-1 py-0.5 rounded border border-line-soft">
                  ESC
                </kbd>{" "}
                to close
              </span>
              <span>15 In-Browser Sandboxes · Synchronized Cohort</span>
            </div>
          </div>
        </div>
      )}

      {/* ================= COURSE SWITCHER MODAL (1-3 Tracks) ================= */}
      {courseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-ink/70 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-2xl border border-line-soft bg-surface-elevated p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-line-soft pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <BookOpen className="size-4 text-brand-cyan" />
                  <h3 className="font-display text-base font-bold text-foreground">
                    Interactive Technical Course Switcher
                  </h3>
                </div>
                <p className="text-xs text-copy-subtle mt-0.5">
                  Select between 1 and 3 specialized technical courses. Self-paced and independent
                  of your placement batch cohort.
                </p>
              </div>
              <button
                onClick={() => setCourseModalOpen(false)}
                className="text-copy-subtle hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-brand-cyan/30 bg-brand-cyan/10 p-3 text-xs">
              <span className="font-semibold text-brand-cyan">
                Active Selected Tracks: {activeTracks.length} / 3
              </span>
              <span className="text-copy-subtle text-[11px]">
                Rule: Min 1, Max 3 concurrent specializations
              </span>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2">
              {TRACKS.map((t) => {
                const isSelected = activeTracks.includes(t.id);
                return (
                  <button
                    key={t.id}
                    onClick={() => toggleCourseTrack(t.id)}
                    className={cn(
                      "flex items-start justify-between rounded-xl border p-3 text-left transition-all",
                      isSelected
                        ? "border-brand-cyan/70 bg-surface-soft shadow-sm"
                        : "border-line-soft bg-surface-dark/40 hover:border-line-soft/80",
                    )}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full" style={{ background: t.accent }} />
                        <p className="text-xs font-bold text-foreground">{t.name}</p>
                      </div>
                      <p className="mt-1 text-[11px] text-copy-subtle line-clamp-1">{t.tagline}</p>
                      <p className="mt-1 font-mono text-[10px] text-brand-cyan">
                        Lab: {t.labTitle}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "grid size-5 shrink-0 place-items-center rounded-lg border",
                        isSelected
                          ? "border-brand-cyan bg-brand-cyan text-surface-dark"
                          : "border-line-soft bg-surface-soft",
                      )}
                    >
                      {isSelected && <Check className="size-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-line-soft">
              <button
                onClick={() => setCourseModalOpen(false)}
                className="rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple px-5 py-2.5 text-xs font-bold text-surface-dark"
              >
                Save &amp; Continue Learning
              </button>
            </div>
          </div>
        </div>
      )}

      <Toaster position="bottom-right" />
    </div>
  );
}

export function ShellFallback({ children }: { children: ReactNode }) {
  return <div className="p-6 text-sm text-copy-subtle">{children}</div>;
}
