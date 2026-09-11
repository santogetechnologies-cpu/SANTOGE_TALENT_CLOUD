import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Hexagon, LogIn, AlertCircle, RefreshCw, Eye, EyeOff, Sun, Moon } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { useAppStore } from "@/lib/app-store";
import { isSupabaseConfigured } from "@/lib/supabase";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — SantoGe Talent Cloud" },
      {
        name: "description",
        content: "Sign in to your SantoGe Talent Cloud account.",
      },
      { property: "og:title", content: "Sign in — SantoGe Talent Cloud" },
      {
        property: "og:description",
        content: "SantoGe Talent Cloud Authentication.",
      },
      { property: "og:image", content: "/og-image.svg" },
    ],
  }),
  component: LoginPage,
});

// ---------------------------------------------------------------------------
// 3D Spider Web Interactive Canvas Background
// ---------------------------------------------------------------------------
function SpiderWebBackground({ isDark }: { isDark: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Mouse coordinates in 3D projection space
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      active: false,
      radius: 180,
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    // 3D Particle definition
    interface Particle3D {
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
      baseRadius: number;
      color: string;
    }

    const PARTICLE_COUNT = Math.min(100, Math.floor((width * height) / 12000));
    const FOV = 400;
    const DEPTH = 600;
    const particles: Particle3D[] = [];

    const nodeColors = isDark
      ? ["#60a5fa", "#818cf8", "#a78bfa", "#38bdf8"]
      : ["#2563eb", "#4f46e5", "#7c3aed", "#0284c7"];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: (Math.random() - 0.5) * width * 1.6,
        y: (Math.random() - 0.5) * height * 1.6,
        z: Math.random() * DEPTH,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        vz: (Math.random() - 0.5) * 0.5,
        baseRadius: Math.random() * 2 + 1.2,
        color: nodeColors[Math.floor(Math.random() * nodeColors.length)]!,
      });
    }

    let rotationAngleY = 0;
    let rotationAngleX = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      // Subtle 3D camera rotation responding to cursor
      const targetRotY = ((mouse.x - width / 2) / width) * 0.35;
      const targetRotX = -((mouse.y - height / 2) / height) * 0.35;
      rotationAngleY += (targetRotY - rotationAngleY) * 0.05;
      rotationAngleX += (targetRotX - rotationAngleX) * 0.05;

      const cosY = Math.cos(rotationAngleY);
      const sinY = Math.sin(rotationAngleY);
      const cosX = Math.cos(rotationAngleX);
      const sinX = Math.sin(rotationAngleX);

      const projected: {
        px: number;
        py: number;
        scale: number;
        p: Particle3D;
        alpha: number;
      }[] = [];

      // Update and project particles in 3D
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]!;

        // Update positions with gentle wrapping
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        const boundX = (width * 1.6) / 2;
        const boundY = (height * 1.6) / 2;

        if (p.x < -boundX) p.x = boundX;
        if (p.x > boundX) p.x = -boundX;
        if (p.y < -boundY) p.y = boundY;
        if (p.y > boundY) p.y = -boundY;
        if (p.z < 0) p.z = DEPTH;
        if (p.z > DEPTH) p.z = 0;

        // 3D Matrix Rotation (Y and X axis)
        const x1 = p.x * cosY + p.z * sinY;
        const z1 = -p.x * sinY + p.z * cosY;

        const y2 = p.y * cosX - z1 * sinX;
        const z2 = p.y * sinX + z1 * cosX + 350; // Camera distance

        if (z2 > 10) {
          const scale = FOV / z2;
          const px = width / 2 + x1 * scale;
          const py = height / 2 + y2 * scale;
          const alpha = Math.min(1, Math.max(0.1, (DEPTH - p.z) / DEPTH));

          projected.push({ px, py, scale, p, alpha });
        }
      }

      // Draw 3D Spider Web Filaments (Inter-particle connections)
      const maxDistance = 140;
      for (let i = 0; i < projected.length; i++) {
        const p1 = projected[i]!;
        for (let j = i + 1; j < projected.length; j++) {
          const p2 = projected[j]!;
          const dx = p1.px - p2.px;
          const dy = p1.py - p2.py;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const lineAlpha = (1 - dist / maxDistance) * (isDark ? 0.35 : 0.22) * p1.alpha * p2.alpha;
            ctx.strokeStyle = isDark
              ? `rgba(99, 102, 241, ${lineAlpha})`
              : `rgba(37, 99, 235, ${lineAlpha})`;
            ctx.lineWidth = Math.max(0.4, (1 - dist / maxDistance) * 1.4);
            ctx.beginPath();
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);
            ctx.stroke();
          }
        }

        // Draw Interactive Web Lines to Mouse Cursor
        if (mouse.active) {
          const mdx = p1.px - mouse.x;
          const mdy = p1.py - mouse.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

          if (mdist < mouse.radius) {
            const mouseAlpha = (1 - mdist / mouse.radius) * (isDark ? 0.6 : 0.45) * p1.alpha;
            ctx.strokeStyle = isDark
              ? `rgba(56, 189, 248, ${mouseAlpha})`
              : `rgba(14, 165, 233, ${mouseAlpha})`;
            ctx.lineWidth = (1 - mdist / mouse.radius) * 1.8;
            ctx.beginPath();
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();

            // Subtle magnetic pull towards mouse
            p1.p.x -= (mdx / mdist) * 0.4;
            p1.p.y -= (mdy / mdist) * 0.4;
          }
        }
      }

      // Draw Nodes with depth & glow
      for (let i = 0; i < projected.length; i++) {
        const { px, py, scale, p, alpha } = projected[i]!;
        const radius = Math.max(1, p.baseRadius * scale * 1.2);

        // Core dot
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fill();

        // Subtle outer glow halo for nearby nodes
        if (scale > 0.8) {
          ctx.beginPath();
          ctx.arc(px, py, radius * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = alpha * (isDark ? 0.15 : 0.08);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-auto -z-10 h-full w-full bg-background transition-colors duration-500"
    />
  );
}

// ---------------------------------------------------------------------------
// Login Page Component
// ---------------------------------------------------------------------------
function LoginPage() {
  const store = useAppStore();
  const navigate = useNavigate();

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setError("");
    setLoading(true);

    const res = await store.signInSupabase(email.trim(), password);
    setLoading(false);
    if (!res.ok) {
      setError(res.error || "Sign in failed. Please check your credentials.");
      return;
    }
    toast.success(
      res.role === "admin" ? "Signed in as Administrator" : "Signed in successfully",
    );
    void navigate({ to: res.role === "admin" ? "/admin" : "/student" });
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center px-4 py-12 overflow-hidden selection:bg-primary/20 selection:text-primary">
      {/* 3D Spider Web Interactive Canvas */}
      <SpiderWebBackground isDark={store.theme === "dark"} />

      {/* Top Header Controls */}
      <div className="absolute top-4 right-4 z-20">
        <button
          type="button"
          onClick={store.toggleTheme}
          aria-label="Toggle theme"
          className="flex items-center gap-1.5 rounded-lg border border-border bg-card/80 backdrop-blur-md px-3 py-1.5 text-xs font-medium text-foreground hover:bg-card shadow-xs transition-colors"
        >
          {store.theme === "dark" ? (
            <>
              <Sun className="size-3.5 text-amber-500" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="size-3.5 text-muted-foreground" />
              <span>Dark Mode</span>
            </>
          )}
        </button>
      </div>

      <div className="relative z-10 w-full max-w-sm space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md mb-3 transition-transform hover:scale-105 duration-300">
            <Hexagon className="size-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            SantoGe Talent Cloud
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Sign in to access your portal
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-border/80 bg-card/90 backdrop-blur-xl p-6 sm:p-7 shadow-xl">
          {!isConfigured && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <p>
                Backend is not configured. Please supply Supabase environment variables.
              </p>
            </div>
          )}

          <form onSubmit={handleSupabaseSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">
                Email Address
              </label>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@college.edu or admin@domain.com"
                className="w-full rounded-lg border border-border bg-background/80 px-3.5 py-2.5 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-background"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-border bg-background/80 px-3.5 py-2.5 pr-10 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-background"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !isConfigured}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <RefreshCw className="size-4 animate-spin" />
              ) : (
                <LogIn className="size-4" />
              )}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-muted-foreground">
          Student accounts are provisioned directly by institution administrators.
        </p>
      </div>

      <Toaster position="bottom-right" />
    </div>
  );
}
