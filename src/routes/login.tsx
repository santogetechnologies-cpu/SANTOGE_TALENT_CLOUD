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
    <div className="app-grid min-h-screen bg-background px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-[540px] space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-cyan to-brand-purple shadow-lg shadow-brand-cyan/20">
            <Hexagon className="size-7 text-surface-dark" />
          </span>
          <div>
            <p className="font-display text-2xl font-bold text-foreground">SantoGe Talent Cloud</p>
            <p className="text-xs font-semibold uppercase tracking-widest text-copy-subtle mt-0.5">
              Interactive Technical Skill Engine · Placement Accelerator
            </p>
          </div>
        </div>

        {/* Live Supabase Login Card */}
        <div className="rounded-2xl border border-line-soft bg-surface-elevated/95 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-emerald/30 bg-brand-emerald/10 px-3 py-1 text-[11px] font-semibold text-brand-emerald">
              <Server className="size-3" /> Supabase Production Auth
            </div>
          </div>

          <h1 className="mt-4 font-display text-2xl font-bold text-foreground">
            Sign in to your portal
          </h1>
          <p className="mt-1 text-xs text-copy-subtle leading-relaxed">
            Sign in with the credentials provisioned by your partner institution or platform
            administrator.
          </p>

          {!isConfigured && (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-brand-rose/40 bg-brand-rose/10 p-3 text-xs text-brand-rose">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Backend Connection Required</p>
                <p className="mt-0.5 text-[11px] opacity-90">
                  VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are not configured. Please
                  supply production environment variables.
                </p>
              </div>
            </div>
          )}

          {/* Supabase Sign In Form */}
          <form onSubmit={handleSupabaseSubmit} className="mt-5 space-y-3.5">
            <div>
              <label className="mb-1 block text-xs font-semibold text-copy-subtle">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@college.edu or admin@domain.com"
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
              disabled={loading || !isConfigured}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple px-4 py-3 text-sm font-bold text-surface-dark transition-opacity hover:opacity-90 disabled:opacity-50"
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
          <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-line-soft bg-surface-soft/80 p-3 text-[11px] text-copy-subtle">
            <Info className="size-4 shrink-0 text-brand-cyan mt-0.5" />
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
