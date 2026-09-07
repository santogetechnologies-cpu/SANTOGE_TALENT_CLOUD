import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
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
  UserPlus,
  RefreshCw,
  BookOpen,
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { useAppStore } from "@/lib/app-store";
import { ADMIN_ACCOUNT, STUDENT_ACCOUNTS } from "@/lib/accounts";
import { TRACKS, trackById, type TrackId } from "@/lib/tracks";
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
      { name: "description", content: "Unified sign-in: Instant Demo login with 5 student personas or Real Supabase Live Auth." },
      { property: "og:title", content: "Sign in — SantoGe Talent Cloud" },
      { property: "og:description", content: "Unified sign-in: Demo personas & Live Supabase Authentication." },
      { property: "og:image", content: "/og-image.svg" },
    ],
  }),
  component: LoginPage,
});

type LoginMode = "demo" | "supabase";
type SupabaseTab = "signin" | "signup";

function LoginPage() {
  const store = useAppStore();
  const navigate = useNavigate();

  // Mode state: 'demo' vs 'supabase'
  const [mode, setMode] = useState<LoginMode>("demo");
  const [supabaseTab, setSupabaseTab] = useState<SupabaseTab>("signin");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Sign up fields for Supabase
  const [name, setName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [dept, setDept] = useState("CSE");
  const [batchId, setBatchId] = useState("BATCH-2026-ABC-CSE-01");
  const [selectedTracks, setSelectedTracks] = useState<TrackId[]>(["mern", "cloud", "aiml"]);

  // Supabase connection config & test state
  const [showConfig, setShowConfig] = useState(false);
  const [sbConfig, setSbConfig] = useState<SupabaseAuthConfig>({ url: "", anonKey: "" });
  const [connStatus, setConnStatus] = useState<"idle" | "testing" | "ok" | "err">("idle");
  const [connMessage, setConnMessage] = useState("");

  useEffect(() => {
    setSbConfig(getSupabaseConfig());
  }, []);

  // Submit handler
  const handleDemoSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");
    const res = store.signIn(email, password);
    if (!res.ok) {
      setError(res.error ?? "Invalid credentials. Choose a demo profile on the right or enter valid credentials.");
      return;
    }
    toast.success(res.role === "admin" ? "Signed in as Platform Super Admin" : "Signed in successfully");
    void navigate({ to: res.role === "admin" ? "/admin" : "/student" });
  };

  const handleSupabaseSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email || !password) {
      setError("Please fill in email and password");
      return;
    }
    setError("");
    setLoading(true);

    if (supabaseTab === "signin") {
      const res = await store.signInSupabase(email, password);
      setLoading(false);
      if (!res.ok) {
        setError(res.error || "Supabase sign in failed");
        return;
      }
      toast.success(res.role === "admin" ? "Signed in as Platform Admin" : "Live Supabase session started");
      void navigate({ to: res.role === "admin" ? "/admin" : "/student" });
    } else {
      // Sign up
      if (selectedTracks.length === 0) {
        setError("Please choose at least 1 technical course");
        setLoading(false);
        return;
      }
      const res = await store.signUpSupabase(email, password, {
        name,
        rollNo,
        dept,
        batchId,
        tracks: selectedTracks,
        college: "Partner Institution",
        role: "student",
      });
      setLoading(false);
      if (!res.ok) {
        setError(res.error || "Supabase sign up failed");
        return;
      }
      toast.success("Account created & signed in!");
      void navigate({ to: "/student" });
    }
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

  const toggleTrack = (id: TrackId) => {
    if (selectedTracks.includes(id)) {
      if (selectedTracks.length > 1) {
        setSelectedTracks(selectedTracks.filter((t) => t !== id));
      } else {
        toast.error("You must select at least 1 technical course");
      }
    } else {
      if (selectedTracks.length < 3) {
        setSelectedTracks([...selectedTracks, id]);
      } else {
        toast.error("Maximum 3 courses allowed in Phase 1");
      }
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
                  : "text-copy-subtle hover:text-foreground"
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
                  : "text-copy-subtle hover:text-foreground"
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

              <h1 className="mt-4 font-display text-2xl font-bold text-foreground">Sign in to your portal</h1>
              <p className="mt-1 text-xs text-copy-subtle leading-relaxed">
                Click any 1-click persona on the right or enter credentials manually below.
              </p>

              <form onSubmit={handleDemoSubmit} className="mt-5 space-y-3.5">
                <div>
                  <label htmlFor="demo-email" className="mb-1 block text-xs font-semibold text-copy-subtle">Email Address</label>
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
                  <label htmlFor="demo-password" className="mb-1 block text-xs font-semibold text-copy-subtle">Password</label>
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
                  Students belong to one common Placement Accelerator batch cohort, while running independent self-paced technical paths across 15 tracks.
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
                    <p className="text-sm font-semibold text-foreground">1-Click Student Personas</p>
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
                        <p className="text-sm font-bold text-foreground group-hover:text-brand-cyan">{a.name}</p>
                        <span className="rounded-full bg-surface-elevated px-2 py-0.5 text-[10px] font-mono text-copy-subtle">
                          Day {a.placementDay}/90
                        </span>
                      </div>
                      <p className="mt-0.5 font-mono text-[11px] text-brand-cyan">{a.email}</p>
                      
                      <div className="mt-2 flex flex-wrap gap-1">
                        {a.tracks.map((t) => (
                          <span
                            key={t}
                            className="rounded-md border border-line-soft bg-surface-elevated px-1.5 py-0.5 text-[10px] font-medium text-foreground"
                          >
                            {trackById(t).short}
                          </span>
                        ))}
                      </div>

                      <div className="mt-2.5 flex items-center justify-between border-t border-line-soft/60 pt-2 text-[10px] text-copy-subtle">
                        <span>{a.dept} · {a.batchId}</span>
                        <span className="font-mono text-brand-amber">🔥 {a.streak}d</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Admin Persona */}
              <div className="rounded-2xl border border-line-soft bg-surface-elevated/95 p-5 backdrop-blur-xl shadow-xl">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="size-4 text-brand-purple" />
                    <p className="text-sm font-semibold text-foreground">1-Click Platform Super Admin</p>
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
                    Executive analytics, 300-student batch provisioning, cron pipelines, dual-gate rules, and recruiter talent marketplace.
                  </p>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ================= LIVE SUPABASE LOGIN VIEW ================= */
          <div className="mx-auto max-w-[620px] space-y-4">
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
                  <Settings className="size-3.5" /> Endpoint Settings <ChevronDown className={cn("size-3 transition-transform", showConfig && "rotate-180")} />
                </button>
              </div>

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
                    <label className="mb-1 block text-[11px] font-semibold text-copy-subtle">Project URL (VITE_SUPABASE_URL)</label>
                    <input
                      type="text"
                      value={sbConfig.url}
                      onChange={(e) => setSbConfig({ ...sbConfig, url: e.target.value })}
                      placeholder="https://your-project.supabase.co"
                      className="w-full rounded-lg border border-line-soft bg-surface-dark px-3 py-2 text-xs font-mono text-foreground outline-none focus:border-brand-cyan/60"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-copy-subtle">Anon Public Key (VITE_SUPABASE_ANON_KEY)</label>
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
                      <RefreshCw className={cn("size-3", connStatus === "testing" && "animate-spin")} /> Test Connection
                    </button>
                    {connMessage && (
                      <span className={cn("text-[11px]", connStatus === "ok" ? "text-brand-emerald" : "text-brand-rose")}>
                        {connMessage}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Sign In vs Sign Up Tabs */}
              <div className="mt-5 flex border-b border-line-soft">
                <button
                  onClick={() => {
                    setSupabaseTab("signin");
                    setError("");
                  }}
                  className={cn(
                    "flex-1 pb-3 text-center text-xs font-bold transition-colors border-b-2",
                    supabaseTab === "signin"
                      ? "border-brand-cyan text-brand-cyan"
                      : "border-transparent text-copy-subtle hover:text-foreground"
                  )}
                >
                  <LogIn className="inline size-3.5 mr-1.5" /> Sign In
                </button>
                <button
                  onClick={() => {
                    setSupabaseTab("signup");
                    setError("");
                  }}
                  className={cn(
                    "flex-1 pb-3 text-center text-xs font-bold transition-colors border-b-2",
                    supabaseTab === "signup"
                      ? "border-brand-purple text-brand-purple"
                      : "border-transparent text-copy-subtle hover:text-foreground"
                  )}
                >
                  <UserPlus className="inline size-3.5 mr-1.5" /> Create Live Account
                </button>
              </div>

              {/* Supabase Form */}
              <form onSubmit={handleSupabaseSubmit} className="mt-5 space-y-3.5">
                {supabaseTab === "signup" && (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-copy-subtle">Full Name</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Ajay Kumar"
                          className="w-full rounded-xl border border-line-soft bg-surface-soft px-3.5 py-2 text-sm text-foreground outline-none focus:border-brand-purple/60"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-copy-subtle">Roll Number</label>
                        <input
                          type="text"
                          required
                          value={rollNo}
                          onChange={(e) => setRollNo(e.target.value)}
                          placeholder="ABC22CSE014"
                          className="w-full rounded-xl border border-line-soft bg-surface-soft px-3.5 py-2 text-sm text-foreground outline-none focus:border-brand-purple/60"
                        />
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-copy-subtle">Department</label>
                        <select
                          value={dept}
                          onChange={(e) => setDept(e.target.value)}
                          className="w-full rounded-xl border border-line-soft bg-surface-soft px-3.5 py-2 text-sm text-foreground outline-none focus:border-brand-purple/60"
                        >
                          <option value="CSE">CSE (Computer Science)</option>
                          <option value="IT">IT (Information Tech)</option>
                          <option value="ECE">ECE (Electronics &amp; Comm)</option>
                          <option value="MECH">Mechanical / Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-copy-subtle">Placement Batch ID</label>
                        <input
                          type="text"
                          value={batchId}
                          onChange={(e) => setBatchId(e.target.value)}
                          placeholder="BATCH-2026-ABC-CSE-01"
                          className="w-full rounded-xl border border-line-soft bg-surface-soft px-3.5 py-2 text-sm text-foreground outline-none focus:border-brand-purple/60"
                        />
                      </div>
                    </div>

                    {/* Course Selection (1-3 Courses) */}
                    <div>
                      <div className="mb-1.5 flex items-center justify-between">
                        <label className="text-xs font-semibold text-copy-subtle">
                          Select 1 to 3 Technical Tracks ({selectedTracks.length}/3 selected)
                        </label>
                        <span className="text-[10px] text-brand-purple font-semibold">Self-Paced ITSE</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-[160px] overflow-y-auto p-1 rounded-xl border border-line-soft bg-surface-soft">
                        {TRACKS.map((t) => {
                          const isSelected = selectedTracks.includes(t.id);
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => toggleTrack(t.id)}
                              className={cn(
                                "flex items-center gap-1.5 rounded-lg border p-2 text-left text-[11px] transition-all",
                                isSelected
                                  ? "border-brand-purple/70 bg-brand-purple/15 text-foreground font-semibold"
                                  : "border-line-soft/60 text-copy-subtle hover:text-foreground"
                              )}
                            >
                              <BookOpen className={cn("size-3 shrink-0", isSelected ? "text-brand-purple" : "text-copy-subtle")} />
                              <span className="truncate">{t.short}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="mb-1 block text-xs font-semibold text-copy-subtle">Email Address</label>
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
                  <label className="mb-1 block text-xs font-semibold text-copy-subtle">Password</label>
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
                  ) : supabaseTab === "signin" ? (
                    <LogIn className="size-4" />
                  ) : (
                    <UserPlus className="size-4" />
                  )}
                  {loading ? "Authenticating..." : supabaseTab === "signin" ? "Sign In via Supabase" : "Create Account & Launch"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
}
