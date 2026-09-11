import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Hexagon, LogIn, Server, AlertCircle, RefreshCw, Info } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { useAppStore } from "@/lib/app-store";
import { isSupabaseConfigured } from "@/lib/supabase";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — SantoGe Talent Cloud" },
      {
        name: "description",
        content:
          "Institutional sign-in: Authenticate with your provisioned SantoGe Talent Cloud credentials.",
      },
      { property: "og:title", content: "Sign in — SantoGe Talent Cloud" },
      {
        property: "og:description",
        content: "Institutional sign-in: SantoGe Talent Cloud Authentication.",
      },
      { property: "og:image", content: "/og-image.svg" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const store = useAppStore();
  const navigate = useNavigate();

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isConfigured = isSupabaseConfigured();

  // Live Supabase submit handler
  const handleSupabaseSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!isConfigured) {
      setError(
        "Supabase backend is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env",
      );
      return;
    }
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[440px] space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2.5">
          <span className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground shadow-xs">
            <Hexagon className="size-6" />
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">SantoGe Talent Cloud</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Interactive Technical Skill Engine · Placement Accelerator
            </p>
          </div>
        </div>

        {/* Live Supabase Login Card */}
        <div className="rounded-xl border border-border bg-card p-6 sm:p-7 shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200/60 bg-emerald-50/60 dark:bg-emerald-950/30 dark:border-emerald-900/40 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              <Server className="size-3" /> Supabase Production Auth
            </div>
          </div>

          <h2 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
            Sign in to your account
          </h2>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            Enter the credentials provisioned by your institution or platform administrator.
          </p>

          {!isConfigured && (
            <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Backend Connection Required</p>
                <p className="mt-0.5 text-[11px] opacity-90">
                  VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are not configured. Please
                  supply production environment variables.
                </p>
              </div>
            </div>
          )}

          {/* Supabase Sign In Form */}
          <form onSubmit={handleSupabaseSubmit} className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">
                Institutional Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@college.edu or admin@domain.com"
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
                <AlertCircle className="size-4 shrink-0" /> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !isConfigured}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <RefreshCw className="size-4 animate-spin" />
              ) : (
                <LogIn className="size-4" />
              )}
              {loading ? "Authenticating via Supabase..." : "Sign In"}
            </button>
          </form>

          {/* Institutional Provisioning Notice */}
          <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-border bg-muted/40 p-3 text-[11px] text-muted-foreground leading-relaxed">
            <Info className="size-4 shrink-0 text-primary mt-0.5" />
            <div>
              <span className="font-semibold text-foreground">Institutional Provisioning:</span>{" "}
              Student accounts are created via CSV roster uploads by college administrators.
              Self-signup is disabled to preserve cohort batch integrity and 1–3 technical course
              track mappings.
            </div>
          </div>
        </div>
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
}
