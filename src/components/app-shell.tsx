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
import { TRACKS, trackById, type TrackId } from "@/lib/tracks";
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
import { useLiveStudentProfile, useBatchLookup } from "@/lib/data";

export function AppShell({ portal }: { portal: Role }) {
  const store = useAppStore();
  const queryClient = useQueryClient();

  const { data: liveProfileData } = useLiveStudentProfile(
    store.supabaseSession?.user?.id,
    portal === "student" && !!store.supabaseSession?.user?.id,
  );
  const liveStudentId = liveProfileData?.profile?.id || store.liveStudentId;
  const { getBatchName } = useBatchLookup(portal === "student");

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
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed z-40 flex h-screen w-[256px] flex-col border-r border-border bg-card p-4 transition-transform lg:sticky lg:top-0 lg:translate-x-0",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-xs">
                <Hexagon className="size-4.5" />
              </span>
              <div>
                <p className="text-sm font-bold tracking-tight text-foreground leading-tight">
                  SantoGe
                </p>
                <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                  Talent Cloud
                </p>
              </div>
            </div>
            <button
              className="lg:hidden text-muted-foreground hover:text-foreground"
              onClick={() => setOpen(false)}
              aria-label="Close navigation"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* User Status Card */}
          <div className="mb-3 rounded-lg border border-border bg-muted/30 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                {portal === "student" ? (
                  <GraduationCap className="size-4 text-primary" />
                ) : (
                  <Shield className="size-4 text-primary" />
                )}
                <span className="truncate max-w-[130px]">{label}</span>
              </div>
              <span className="rounded bg-card border border-border px-1.5 py-0.5 text-[9px] font-semibold uppercase text-muted-foreground">
                {portal === "student" ? "Student" : "Admin"}
              </span>
            </div>
            {portal === "student" && (
              <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>
                  {liveProfileData?.profile?.roll_no || store.student?.rollNo || "2026-CSE"}
                </span>
                <span
                  className="truncate max-w-[120px] font-medium text-foreground text-right"
                  title={getBatchName(
                    liveProfileData?.profile?.batch_id || store.student?.batchId,
                    "Cohort",
                  )}
                >
                  {getBatchName(
                    liveProfileData?.profile?.batch_id || store.student?.batchId,
                    "Cohort",
                  )}
                </span>
              </div>
            )}
            <div className="mt-2.5 flex items-center gap-1.5">
              {portal === "student" && (
                <button
                  onClick={() => setCourseModalOpen(true)}
                  className="flex flex-1 items-center justify-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-[11px] font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <BookOpen className="size-3" /> Courses ({activeTracks.length})
                </button>
              )}
              <button
                onClick={signOut}
                className="flex items-center justify-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-destructive hover:border-destructive/30"
              >
                <LogOut className="size-3" /> Exit
              </button>
            </div>
          </div>

          {/* Nav List */}
          <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto pr-1">
            {nav.map((item, idx) => (
              <div key={item.to}>
                {item.section && (
                  <p
                    className={cn(
                      "px-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70",
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
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[status=active]:bg-primary/10 data-[status=active]:text-primary data-[status=active]:font-semibold"
                >
                  <item.icon className="size-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              </div>
            ))}
          </nav>

          {/* Bottom Talent Score Indicator */}
          <div className="mt-3 rounded-lg border border-border bg-muted/30 p-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium text-muted-foreground">
                Talent Score
              </p>
              <span className="font-mono text-xs font-bold text-foreground">
                {talentScore}/1000
              </span>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{gateUnlocked ? "Unlocked 🔓" : "In Progress 🔒"}</span>
              <span className="font-medium text-foreground">{eligibleCompanies} Companies</span>
            </div>
          </div>
        </aside>

        {open && (
          <div
            className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top Header */}
          <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-card/80 px-4 py-2.5 backdrop-blur-md sm:px-6">
            <button
              className="lg:hidden text-muted-foreground hover:text-foreground"
              onClick={() => setOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="size-5" />
            </button>

            {/* Global Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted hover:text-foreground"
            >
              <Search className="size-3.5 text-muted-foreground" />
              <span className="hidden sm:inline">Search tracks, labs, batch tools, cron…</span>
              <span className="sm:hidden">Search…</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded bg-card px-1.5 py-0.5 text-[10px] font-mono font-medium text-muted-foreground border border-border">
                <Command className="size-2.5 inline" /> K
              </kbd>
            </button>

            {/* Right Header Controls */}
            <div className="ml-auto flex items-center gap-2">
              {portal === "student" && (
                <>
                  <span className="hidden items-center gap-1.5 rounded-md border border-amber-200/60 bg-amber-50/70 dark:bg-amber-950/30 dark:border-amber-900/40 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-400 md:inline-flex">
                    <Flame className="size-3.5" /> Day {streak}
                  </span>
                  <span className="hidden items-center gap-1.5 rounded-md border border-blue-200/60 bg-blue-50/70 dark:bg-blue-950/30 dark:border-blue-900/40 px-2.5 py-1 text-xs font-medium text-blue-700 dark:text-blue-400 sm:inline-flex">
                    <Zap className="size-3.5" /> {xp} XP
                  </span>
                  <button
                    onClick={() => setCourseModalOpen(true)}
                    className="hidden sm:inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    <BookOpen className="size-3.5 text-muted-foreground" /> Assigned Courses ({activeTracks.length})
                  </button>
                </>
              )}

              {/* Theme Toggle */}
              <button
                onClick={store.toggleTheme}
                aria-label="Toggle theme"
                className="grid size-8 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
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
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-xl border border-border bg-card shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 border-b border-border px-4 py-3 bg-card">
              <Search className="size-4 text-muted-foreground shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 15 tracks, sandboxes, batch tools, cron, diagrams, ATS…"
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="max-h-[380px] overflow-y-auto p-1.5 space-y-0.5">
              {filteredSearchResults.length > 0 ? (
                filteredSearchResults.map((res, i) => (
                  <button
                    key={`${res.title}-${i}`}
                    onClick={() => {
                      setSearchOpen(false);
                      void navigate({ to: res.to });
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors hover:bg-muted group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground group-hover:text-primary">
                          {res.title}
                        </p>
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
                          {res.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{res.desc}</p>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground group-hover:text-primary">
                      Jump →
                    </span>
                  </button>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No matching tools or pages found for "{searchQuery}".
                </div>
              )}
            </div>

            <div className="border-t border-border px-4 py-2 bg-muted/20 flex items-center justify-between text-[10px] text-muted-foreground">
              <span>
                Press{" "}
                <kbd className="font-mono bg-card px-1 py-0.5 rounded border border-border">
                  ESC
                </kbd>{" "}
                to close
              </span>
              <span>15 In-Browser Sandboxes · Synchronized Cohort</span>
            </div>
          </div>
        </div>
      )}

      {/* ================= ASSIGNED COURSES VIEW MODAL (Read-Only) ================= */}
      {courseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-xl border border-border bg-card p-6 shadow-lg space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <BookOpen className="size-4 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">
                    Assigned Technical Courses
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Technical specializations assigned by your Platform Admin. Course assignments are
                  managed centrally and cannot be changed by students.
                </p>
              </div>
              <button
                onClick={() => setCourseModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-blue-200/60 bg-blue-50/50 dark:bg-blue-950/30 dark:border-blue-900/40 p-3 text-xs">
              <span className="font-semibold text-blue-700 dark:text-blue-300">
                Assigned Tracks: {activeTracks.length} Specialization{activeTracks.length !== 1 ? "s" : ""}
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                ✓ Admin Assigned
              </span>
            </div>

            {activeTracks.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                No technical courses currently assigned. Please contact your institution administrator.
              </div>
            ) : (
              <div className="grid gap-2.5 sm:grid-cols-2">
                {activeTracks.map((trackId, idx) => {
                  const t = trackById(trackId);
                  const isPrimary = idx === 0;
                  return (
                    <div
                      key={t.id}
                      className="flex items-start justify-between rounded-lg border border-border bg-muted/20 p-3.5 text-left"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="size-2 rounded-full" style={{ background: t.accent }} />
                          <p className="text-xs font-semibold text-foreground">{t.name}</p>
                        </div>
                        <p className="mt-1 text-[11px] text-muted-foreground line-clamp-1">{t.tagline}</p>
                        <p className="mt-1 font-mono text-[10px] text-primary">
                          Lab: {t.labTitle}
                        </p>
                      </div>
                      <div className="shrink-0 flex flex-col items-end gap-1">
                        <span
                          className={cn(
                            "rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                            isPrimary
                              ? "bg-primary/10 text-primary border border-primary/20"
                              : "bg-muted text-muted-foreground border border-border",
                          )}
                        >
                          {isPrimary ? "Primary" : `Track #${idx + 1}`}
                        </span>
                        <span className="text-[9px] font-medium text-emerald-600 dark:text-emerald-400">
                          Admin Assigned
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                onClick={() => setCourseModalOpen(false)}
                className="rounded-lg bg-card border border-border px-4 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
              >
                Close
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
  return <div className="p-6 text-sm text-muted-foreground">{children}</div>;
}
