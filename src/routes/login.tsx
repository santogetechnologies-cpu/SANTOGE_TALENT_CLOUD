import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  Hexagon,
  GraduationCap,
  Shield,
  LogIn,
  Zap,
  Sparkles,
  Server,
  Key,
  CheckCircle2,
  AlertCircle,
  Settings,
  ChevronDown,
  RefreshCw,
  Info,
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { useAppStore } from "@/lib/app-store";
import { ADMIN_ACCOUNT, STUDENT_ACCOUNTS } from "@/lib/accounts";
import { trackById } from "@/lib/tracks";
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  supabaseAuth,
  type SupabaseAuthConfig,
} from "@/lib/supabase";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — SantoGe Talent Cloud" },
      {
        name: "description",
        content:
          "Unified sign-in: Instant Demo login with 5 student personas or Real Supabase Live Auth.",
      },
      { property: "og:title", content: "Sign in — SantoGe Talent Cloud" },
      {
        property: "og:description",
        content: "Unified sign-in: Demo personas & Live Supabase Authentication.",
      },
      { property: "og:image", content: "/og-image.svg" },
    ],
  }),
  component: LoginPage,
});

type LoginMode = "demo" | "supabase";

function LoginPage() {
  const store = useAppStore();
  const navigate = useNavigate();

  // Mode state: 'demo' vs 'supabase'
  const [mode, setMode] = useState<LoginMode>("demo");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Supabase connection config & test state
  const [showConfig, setShowConfig] = useState(false);
  const [sbConfig, setSbConfig] = useState<SupabaseAuthConfig>({ url: "", anonKey: "" });
  const [connStatus, setConnStatus] = useState<"idle" | "testing" | "ok" | "err">("idle");
  const [connMessage, setConnMessage] = useState("");

  useEffect(() => {
    setSbConfig(getSupabaseConfig());
  }, []);

  const adminAddedLearners = useMemo(() => {
    const deleted = new Set((store.deletedStudentEmails || []).map((e) => e.toLowerCase().trim()));
    const custom = Object.values(store.customStudents || {})
      .filter((c) => !deleted.has(c.email.toLowerCase().trim()))
      .map((c) => ({
        name: c.name,
        email: c.email,
        password:
          store.passwordOverrides?.[c.email.toLowerCase().trim()] ?? c.password ?? "Temp@1234",
        batchId: c.batchId,
        dept: c.dept,
      }));

    const customEmails = new Set(custom.map((c) => c.email.toLowerCase().trim()));
    const fromProv = (store.provisioned || [])
      .filter((p) => {
        const em = p.email.toLowerCase().trim();
        return !deleted.has(em) && !customEmails.has(em);
      })
      .map((p) => ({
        name: p.student_name,
        email: p.email,
        password:
          store.passwordOverrides?.[p.email.toLowerCase().trim()] ?? p.password ?? "Temp@1234",
        batchId: p.batch_id,
        dept: p.dept,
      }));

    return [...custom, ...fromProv];
  }, [
    store.customStudents,
    store.provisioned,
    store.deletedStudentEmails,
    store.passwordOverrides,
  ]);

  // Demo submit handler
  const handleDemoSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");
    const res = store.signIn(email, password);
    if (!res.ok) {
      setError(
        res.error ??
          "Invalid credentials. Choose a demo profile on the right or enter valid credentials.",
      );
      return;
    }
    toast.success(
      res.role === "admin" ? "Signed in as Platform Super Admin" : "Signed in successfully",
    );
    void navigate({ to: res.role === "admin" ? "/admin" : "/student" });
  };

  // Live Supabase submit handler
  const handleSupabaseSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email || !password) {
      setError("Please enter your email and password");
      return;
    }
    setError("");
    setLoading(true);

    const res = await store.signInSupabase(email, password);
    setLoading(false);
    if (!res.ok) {
      setError(res.error || "Sign in failed. Please check your credentials.");
      return;
    }
    toast.success(
      res.role === "admin" ? "Signed in as Platform Super Admin" : "Signed in to Student Portal",
    );
    void navigate({ to: res.role === "admin" ? "/admin" : "/student" });
  };

  const quickDemo = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
    setError("");
    const res = store.signIn(e, p);
    if (res.ok) {
      toast.success(`Signed in as ${e.includes("admin") ? "Super Admin" : e.split("@")[0]}`);
      void navigate({ to: res.role === "admin" ? "/admin" : "/student" });
    }
  };

  const testSupabaseConn = async () => {
    setConnStatus("testing");
    setConnMessage("Testing Supabase endpoint...");
    const res = await supabaseAuth.testConnection(sbConfig);
    if (res.ok) {
      setConnStatus("ok");
      setConnMessage(res.message);
      saveSupabaseConfig(sbConfig);
      toast.success("Supabase connected!");
    } else {
      setConnStatus("err");
      setConnMessage(res.message);
      toast.error(res.message);
    }
  };

  return (
    <div className="app-grid min-h-screen bg-background px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-[1140px] space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-cyan to-brand-purple shadow-lg shadow-brand-cyan/20">
              <Hexagon className="size-6 text-surface-dark" />
            </span>
            <div>
              <p className="font-display text-xl font-bold text-foreground">SantoGe Talent Cloud</p>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-copy-subtle">
                Interactive Technical Skill Engine · Placement Accelerator
              </p>
            </div>
          </div>

          {/* Top Toggle: Demo Login vs Live Supabase Login */}
          <div className="flex rounded-xl border border-line-soft bg-surface-soft p-1">
            <button
              onClick={() => {
                setMode("demo");
                setError("");
              }}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all",
                mode === "demo"
                  ? "bg-gradient-to-r from-brand-cyan to-brand-purple text-surface-dark shadow-md"
                  : "text-copy-subtle hover:text-foreground",
              )}
            >
              <Zap className="size-3.5" /> Demo Login
            </button>
            <button
              onClick={() => {
                setMode("supabase");
                setError("");
              }}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all",
                mode === "supabase"
                  ? "bg-gradient-to-r from-brand-cyan to-brand-purple text-surface-dark shadow-md"
                  : "text-copy-subtle hover:text-foreground",
              )}
            >
              <Server className="size-3.5" /> Live Supabase Login
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        {mode === "demo" ? (
          /* ================= DEMO LOGIN VIEW ================= */
          <div className="grid gap-6 lg:grid-cols-[minmax(0,400px)_1fr]">
            {/* Left Box: Manual Demo Form */}
            <div className="rounded-2xl border border-line-soft bg-surface-elevated/95 p-6 backdrop-blur-xl shadow-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-cyan/30 bg-brand-cyan/10 px-3 py-1 text-[11px] font-semibold text-brand-cyan">
                <Sparkles className="size-3" /> Demo Mode Active
              </div>

              <h1 className="mt-4 font-display text-2xl font-bold text-foreground">
                Sign in to your portal
              </h1>
              <p className="mt-1 text-xs text-copy-subtle leading-relaxed">
                Click any 1-click persona on the right or enter credentials manually below.
              </p>

              <form onSubmit={handleDemoSubmit} className="mt-5 space-y-3.5">
                <div>
                  <label
                    htmlFor="demo-email"
                    className="mb-1 block text-xs font-semibold text-copy-subtle"
                  >
                    Email Address
                  </label>
                  <input
                    id="demo-email"
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ajay@santoge.dev"
                    className="w-full rounded-xl border border-line-soft bg-surface-soft px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-copy-subtle/60 focus:border-brand-cyan/60"
                  />
                </div>
                <div>
                  <label
                    htmlFor="demo-password"
                    className="mb-1 block text-xs font-semibold text-copy-subtle"
                  >
                    Password
                  </label>
                  <input
                    id="demo-password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="student1"
                    className="w-full rounded-xl border border-line-soft bg-surface-soft px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-copy-subtle/60 focus:border-brand-cyan/60"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-xl border border-brand-rose/40 bg-brand-rose/10 p-2.5 text-xs text-brand-rose">
                    <AlertCircle className="size-4 shrink-0" /> {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple px-4 py-3 text-sm font-bold text-surface-dark transition-opacity hover:opacity-90"
                >
                  <LogIn className="size-4" /> Sign in (Demo)
                </button>
              </form>

              <div className="mt-6 rounded-xl border border-line-soft bg-surface-soft p-3 text-[11px] text-copy-subtle">
                <p className="font-semibold text-foreground">💡 Master Architecture Note</p>
                <p className="mt-1">
                  Students belong to one common Placement Accelerator batch cohort, while running
                  independent self-paced technical paths across 15 tracks.
                </p>
              </div>
            </div>

            {/* Right Box: 1-Click Demo Personas */}
            <div className="space-y-4">
              {/* Student Personas */}
              <div className="rounded-2xl border border-line-soft bg-surface-elevated/95 p-5 backdrop-blur-xl shadow-xl">
                <div className="mb-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="size-4 text-brand-cyan" />
                    <p className="text-sm font-semibold text-foreground">
                      1-Click Student Personas
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-copy-subtle">
                    1–3 technical tracks each · same batch
                  </span>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2">
                  {STUDENT_ACCOUNTS.map((a) => (
                    <button
                      key={a.email}
                      onClick={() => quickDemo(a.email, a.password)}
                      className="group rounded-xl border border-line-soft bg-surface-soft p-3.5 text-left transition-all hover:border-brand-cyan/60 hover:bg-surface-soft/80"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-foreground group-hover:text-brand-cyan">
                          {a.name}
                        </p>
                        <span className="rounded-full bg-surface-elevated px-2 py-0.5 text-[10px] font-mono text-copy-subtle">
                          Day {a.placementDay}/90
                        </span>
                      </div>
                      <p className="mt-0.5 font-mono text-[11px] text-brand-cyan">{a.email}</p>

                      <div className="mt-2 flex flex-wrap gap-1">
                        {Array.from(new Set(a.tracks || [])).map((t, idx) => (
                          <span
                            key={`${a.email}-${t}-${idx}`}
                            className="rounded-md border border-line-soft bg-surface-elevated px-1.5 py-0.5 text-[10px] font-medium text-foreground"
                          >
                            {trackById(t).short}
                          </span>
                        ))}
                      </div>

                      <div className="mt-2.5 flex items-center justify-between border-t border-line-soft/60 pt-2 text-[10px] text-copy-subtle">
                        <span>
                          {a.dept} · {a.batchId}
                        </span>
                        <span className="font-mono text-brand-amber">🔥 {a.streak}d</span>
                      </div>
                    </button>
                  ))}
                </div>

                {adminAddedLearners.length > 0 && (
                  <div className="mt-4 border-t border-line-soft/60 pt-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Sparkles className="size-3.5 text-brand-cyan" />
                        Admin-Added Learners ({adminAddedLearners.length})
                      </span>
                      <span className="text-[10px] font-semibold text-brand-cyan uppercase tracking-wider">
                        1-Click Login
                      </span>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {adminAddedLearners
                        .slice(-4)
                        .reverse()
                        .map((l) => (
                          <button
                            key={l.email}
                            type="button"
                            onClick={() => quickDemo(l.email, l.password)}
                            className="group rounded-xl border border-brand-cyan/30 bg-brand-cyan/5 p-2.5 text-left transition-all hover:border-brand-cyan hover:bg-brand-cyan/10"
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-bold text-foreground group-hover:text-brand-cyan truncate">
                                {l.name}
                              </p>
                              <span className="rounded bg-surface-dark border border-line-soft px-1.5 py-0.5 text-[9px] font-mono text-brand-cyan">
                                {l.batchId}
                              </span>
                            </div>
                            <p className="font-mono text-[10px] text-copy-subtle truncate">
                              {l.email}
                            </p>
                            <p className="text-[9px] text-brand-cyan/80 mt-1">Pass: {l.password}</p>
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Admin Persona */}
              <div className="rounded-2xl border border-line-soft bg-surface-elevated/95 p-5 backdrop-blur-xl shadow-xl">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="size-4 text-brand-purple" />
                    <p className="text-sm font-semibold text-foreground">
                      1-Click Platform Super Admin
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-purple">
                    Executive Control
                  </span>
                </div>

                <button
                  onClick={() => quickDemo(ADMIN_ACCOUNT.email, ADMIN_ACCOUNT.password)}
                  className="w-full rounded-xl border border-line-soft bg-surface-soft p-4 text-left transition-all hover:border-brand-purple/60 hover:bg-surface-soft/80"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-foreground">{ADMIN_ACCOUNT.name}</p>
                    <span className="rounded-md bg-brand-purple/20 px-2 py-0.5 text-[10px] font-bold text-brand-purple">
                      admin@santoge.dev
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-copy-subtle">
                    Executive analytics, 300-student batch provisioning, cron pipelines, dual-gate
                    rules, and recruiter talent marketplace.
                  </p>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ================= LIVE SUPABASE LOGIN VIEW ================= */
          <div className="mx-auto max-w-[540px] space-y-4">
            <div className="rounded-2xl border border-line-soft bg-surface-elevated/95 p-6 backdrop-blur-xl shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 rounded-full border border-brand-emerald/30 bg-brand-emerald/10 px-3 py-1 text-[11px] font-semibold text-brand-emerald">
                  <Server className="size-3" /> Real Supabase Auth
                </div>
                <button
                  onClick={() => setShowConfig(!showConfig)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-copy-subtle hover:text-foreground"
                >
                  <Settings className="size-3.5" /> Endpoint Settings{" "}
                  <ChevronDown
                    className={cn("size-3 transition-transform", showConfig && "rotate-180")}
                  />
                </button>
              </div>

              <h1 className="mt-4 font-display text-2xl font-bold text-foreground">
                Live Supabase Sign in
              </h1>
              <p className="mt-1 text-xs text-copy-subtle leading-relaxed">
                Sign in with the credentials provisioned by your partner institution or platform
                administrator.
              </p>

              {/* Collapsible Supabase Project Config Drawer */}
              {showConfig && (
                <div className="mt-4 rounded-xl border border-line-soft bg-surface-soft p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-foreground">Supabase Project Endpoint</p>
                    {connStatus === "ok" && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-brand-emerald">
                        <CheckCircle2 className="size-3.5" /> Live &amp; Connected
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-copy-subtle">
                      Project URL (VITE_SUPABASE_URL)
                    </label>
                    <input
                      type="text"
                      value={sbConfig.url}
                      onChange={(e) => setSbConfig({ ...sbConfig, url: e.target.value })}
                      placeholder="https://your-project.supabase.co"
                      className="w-full rounded-lg border border-line-soft bg-surface-dark px-3 py-2 text-xs font-mono text-foreground outline-none focus:border-brand-cyan/60"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-copy-subtle">
                      Publishable Key (VITE_SUPABASE_PUBLISHABLE_KEY)
                    </label>
                    <input
                      type="password"
                      value={sbConfig.anonKey}
                      onChange={(e) => setSbConfig({ ...sbConfig, anonKey: e.target.value })}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                      className="w-full rounded-lg border border-line-soft bg-surface-dark px-3 py-2 text-xs font-mono text-foreground outline-none focus:border-brand-cyan/60"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={testSupabaseConn}
                      disabled={connStatus === "testing"}
                      className="flex items-center gap-1.5 rounded-lg bg-surface-elevated border border-line-soft px-3 py-1.5 text-xs font-bold text-foreground hover:border-brand-cyan/50"
                    >
                      <RefreshCw
                        className={cn("size-3", connStatus === "testing" && "animate-spin")}
                      />{" "}
                      Test Connection
                    </button>
                    {connMessage && (
                      <span
                        className={cn(
                          "text-[11px]",
                          connStatus === "ok" ? "text-brand-emerald" : "text-brand-rose",
                        )}
                      >
                        {connMessage}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Supabase Sign In Form */}
              <form onSubmit={handleSupabaseSubmit} className="mt-5 space-y-3.5">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-copy-subtle">
                    Institutional Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@college.edu"
                    className="w-full rounded-xl border border-line-soft bg-surface-soft px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-brand-cyan/60"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-copy-subtle">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-line-soft bg-surface-soft px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-brand-cyan/60"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-xl border border-brand-rose/40 bg-brand-rose/10 p-2.5 text-xs text-brand-rose">
                    <AlertCircle className="size-4 shrink-0" /> {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple px-4 py-3 text-sm font-bold text-surface-dark transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="size-4 animate-spin" />
                  ) : (
                    <LogIn className="size-4" />
                  )}
                  {loading ? "Authenticating via Supabase..." : "Sign In via Supabase"}
                </button>
              </form>

              {/* Institutional Provisioning Notice */}
              <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-line-soft bg-surface-soft/80 p-3 text-[11px] text-copy-subtle">
                <Info className="size-4 shrink-0 text-brand-cyan mt-0.5" />
                <div>
                  <span className="font-semibold text-foreground">
                    Stage 0 Institutional Provisioning:
                  </span>{" "}
                  Student accounts are created in bulk via CSV roster uploads by college
                  administrators. Self-signup is disabled to preserve cohort batch integrity and 1–3
                  technical course track mappings.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
}
