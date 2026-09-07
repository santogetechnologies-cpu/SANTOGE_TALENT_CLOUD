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
  Library,
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
} from "lucide-react";
import { useAppStore, type Role } from "@/lib/app-store";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; section?: string };

const STUDENT_NAV: NavItem[] = [
  { to: "/student", label: "Dashboard", icon: LayoutDashboard },
  { to: "/student/technical", label: "Technical Tracks", icon: Code2, section: "Technical Engine (Individual)" },
  { to: "/student/labs", label: "Interactive Labs", icon: Terminal },
  { to: "/student/accelerator", label: "30m Accelerator", icon: Timer, section: "Placement Engine (Cohort)" },
  { to: "/student/batch", label: "Placement Batch", icon: Users },
  { to: "/student/leaderboard", label: "Cohort Leaderboard", icon: Trophy },
  { to: "/student/placement", label: "Placement Tracker", icon: Target },
  { to: "/student/gateway", label: "Dual Gate & Phase 2", icon: FileText, section: "Career & Hiring" },
  { to: "/student/settings", label: "Settings & Courses", icon: Settings2 },
];

const ADMIN_NAV: NavItem[] = [
  { to: "/admin", label: "Executive Analytics", icon: BarChart3 },
  { to: "/admin/provisioning", label: "Bulk CSV Provisioning", icon: FolderUp },
  { to: "/admin/batches", label: "Batch & Telegram Hub", icon: Users },
  { to: "/admin/automations", label: "Cron & Automations", icon: Bot },
  { to: "/admin/architecture", label: "Master Architecture", icon: Workflow },
  { to: "/admin/settings", label: "System & Dual Gate Rules", icon: Settings2 },
];

export function AppShell({ portal }: { portal: Role }) {
  const store = useAppStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const nav = portal === "student" ? STUDENT_NAV : ADMIN_NAV;

  useEffect(() => {
    if (store.ready && !store.isAuthed) void navigate({ to: "/login" });
  }, [store.ready, store.isAuthed, navigate]);

  useEffect(() => {
    if (!store.ready || !store.isAuthed) return;
    if (portal === "student" && store.role === "admin" && !store.student) void navigate({ to: "/admin" });
    if (portal === "admin" && store.role === "student" && store.student) void navigate({ to: "/student" });
  }, [store.ready, store.isAuthed, store.student, store.role, portal, navigate]);

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

  const label = portal === "student" ? (store.student?.name ?? "Student Learner") : "Platform Super Admin";

  return (
    <div className="min-h-screen bg-background app-grid">
      <div className="flex min-h-screen">
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
                <p className="font-display text-sm font-bold leading-tight text-foreground">SantoGe</p>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-copy-subtle">Talent Cloud</p>
              </div>
            </div>
            <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation">
              <X className="size-5 text-copy-subtle" />
            </button>
          </div>

          {/* User Status Card */}
          <div className="mb-4 rounded-xl border border-line-soft bg-surface-soft p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              {portal === "student" ? <GraduationCap className="size-4 text-brand-cyan" /> : <Shield className="size-4 text-brand-purple" />}
              <span className="truncate">{label}</span>
            </div>
            {portal === "student" && store.student && (
              <p className="mt-1 text-[10px] uppercase tracking-widest text-copy-subtle">
                {store.student.rollNo} · {store.student.batchId}
              </p>
            )}
            <button
              onClick={signOut}
              className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-line-soft px-3 py-1.5 text-[11px] font-semibold text-copy-subtle transition-colors hover:text-brand-rose"
            >
              <LogOut className="size-3.5" /> Sign out
            </button>
          </div>

          {/* Nav List */}
          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto pr-1">
            {nav.map((item, idx) => (
              <div key={item.to}>
                {item.section && (
                  <p className={cn("px-3 text-[10px] font-bold uppercase tracking-wider text-copy-subtle/80", idx > 0 ? "mt-3 mb-1" : "mb-1")}>
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
              <p className="text-[10px] font-semibold uppercase tracking-widest text-copy-subtle">Talent Score</p>
              <span className="font-mono text-xs font-bold text-brand-cyan">{store.talentScore}/1000</span>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-copy-subtle">
              <span>Gate: {store.gateUnlocked ? "Unlocked 🔓" : "In Progress 🔒"}</span>
              <span className="text-brand-purple">{store.eligibleCompanies} Companies</span>
            </div>
          </div>
        </aside>

        {open && <div className="fixed inset-0 z-30 bg-brand-ink/50 lg:hidden" onClick={() => setOpen(false)} />}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line-soft bg-surface/80 px-4 py-3 backdrop-blur-xl sm:px-6">
            <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation">
              <Menu className="size-5 text-foreground" />
            </button>
            <p className="hidden text-sm font-semibold text-foreground sm:block">
              {portal === "student" ? "Student Talent Portal" : "Platform Executive Portal"}
            </p>
            <div className="ml-auto flex items-center gap-2">
              {portal === "student" && (
                <>
                  <span className="hidden items-center gap-1.5 rounded-full border border-line-soft bg-surface-soft px-3 py-1.5 text-xs font-semibold text-brand-amber sm:inline-flex">
                    <Flame className="size-3.5" /> Day {store.streak}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-line-soft bg-surface-soft px-3 py-1.5 text-xs font-semibold text-brand-cyan">
                    <Zap className="size-3.5" /> {store.xp} XP
                  </span>
                </>
              )}
              <button
                onClick={store.toggleTheme}
                aria-label="Toggle theme"
                className="grid size-9 place-items-center rounded-xl border border-line-soft bg-surface-soft text-foreground transition-colors hover:text-brand-cyan"
              >
                {store.theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </button>
              <button
                onClick={signOut}
                className="rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple px-3 py-2 text-xs font-bold text-surface-dark transition-opacity hover:opacity-90"
              >
                Switch Account
              </button>
            </div>
          </header>
          <main className="mx-auto w-full max-w-[1240px] flex-1 px-4 py-6 sm:px-6 sm:py-8">
            <Outlet />
          </main>
        </div>
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
}

export function ShellFallback({ children }: { children: ReactNode }) {
  return <div className="p-6 text-sm text-copy-subtle">{children}</div>;
}
