import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  Hexagon,
  LogIn,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Activity,
} from "lucide-react";
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
// Premium 3D Cyber-Constellation & Digital Matrix Web Canvas Engine
// ---------------------------------------------------------------------------
function Premium3DWebBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Mouse tracking with smooth damping
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      active: false,
      radius: 240,
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    // Click shockwave ripple
    const ripples: { x: number; y: number; r: number; maxR: number; alpha: number }[] = [];
    const handleClick = (e: MouseEvent) => {
      ripples.push({
        x: e.clientX,
        y: e.clientY,
        r: 10,
        maxR: Math.max(width, height) * 0.45,
        alpha: 0.8,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("click", handleClick);

    // 3D Particles
    interface Node3D {
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
      radius: number;
      color: string;
      glowColor: string;
      twinkleSpeed: number;
      twinkleOffset: number;
    }

    // Dynamic data signal pulse moving along web lines
    interface WebPulse {
      p1Index: number;
      p2Index: number;
      progress: number;
      speed: number;
      color: string;
    }

    const NODE_COUNT = Math.min(240, Math.max(140, Math.floor((width * height) / 4800)));
    const FOV = 450;
    const DEPTH = 700;
    const nodes: Node3D[] = [];
    const pulses: WebPulse[] = [];

    const PALETTE = [
      { core: "#38bdf8", glow: "rgba(56, 189, 248, 0.4)" }, // Cyan
      { core: "#60a5fa", glow: "rgba(96, 165, 250, 0.4)" }, // Sky Blue
      { core: "#818cf8", glow: "rgba(129, 140, 248, 0.4)" }, // Indigo
      { core: "#a78bfa", glow: "rgba(167, 139, 250, 0.4)" }, // Violet
      { core: "#34d399", glow: "rgba(52, 211, 153, 0.35)" }, // Emerald Accent
    ];

    for (let i = 0; i < NODE_COUNT; i++) {
      const p = PALETTE[Math.floor(Math.random() * PALETTE.length)]!;
      nodes.push({
        x: (Math.random() - 0.5) * width * 1.8,
        y: (Math.random() - 0.5) * height * 1.8,
        z: Math.random() * DEPTH,
        vx: (Math.random() - 0.5) * 0.75,
        vy: (Math.random() - 0.5) * 0.75,
        vz: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2.2 + 1.2,
        color: p.core,
        glowColor: p.glow,
        twinkleSpeed: Math.random() * 0.03 + 0.015,
        twinkleOffset: Math.random() * Math.PI * 2,
      });
    }

    let rotY = 0;
    let rotX = 0;
    let time = 0;

    const render = () => {
      time += 0.02;

      // Deep cinematic space background with gradient nebulae
      ctx.fillStyle = "#050816";
      ctx.fillRect(0, 0, width, height);

      // Radial ambient lighting that follows mouse gently
      const ambientGrad = ctx.createRadialGradient(
        mouse.x,
        mouse.y,
        50,
        mouse.x,
        mouse.y,
        Math.max(width, height) * 0.65,
      );
      ambientGrad.addColorStop(0, "rgba(29, 78, 216, 0.18)");
      ambientGrad.addColorStop(0.4, "rgba(79, 70, 229, 0.10)");
      ambientGrad.addColorStop(0.8, "rgba(15, 23, 42, 0.05)");
      ambientGrad.addColorStop(1, "rgba(5, 8, 22, 0)");
      ctx.fillStyle = ambientGrad;
      ctx.fillRect(0, 0, width, height);

      // Smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      // 3D Camera tilt responding to cursor with gyro damping
      const targetRotY = ((mouse.x - width / 2) / width) * 0.45;
      const targetRotX = -((mouse.y - height / 2) / height) * 0.45;
      rotY += (targetRotY - rotY) * 0.05;
      rotX += (targetRotX - rotX) * 0.05;

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      // Render ripples
      for (let rIdx = ripples.length - 1; rIdx >= 0; rIdx--) {
        const rip = ripples[rIdx]!;
        rip.r += 6;
        rip.alpha *= 0.96;
        ctx.strokeStyle = `rgba(56, 189, 248, ${rip.alpha * 0.5})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.r, 0, Math.PI * 2);
        ctx.stroke();
        if (rip.alpha < 0.02 || rip.r > rip.maxR) {
          ripples.splice(rIdx, 1);
        }
      }

      // Projected array
      const projected: {
        px: number;
        py: number;
        scale: number;
        node: Node3D;
        alpha: number;
        index: number;
      }[] = [];

      const boundX = (width * 1.8) / 2;
      const boundY = (height * 1.8) / 2;

      // 3D Matrix transform & projection
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]!;

        n.x += n.vx;
        n.y += n.vy;
        n.z += n.vz;

        // Gentle boundary wrapping
        if (n.x < -boundX) n.x = boundX;
        if (n.x > boundX) n.x = -boundX;
        if (n.y < -boundY) n.y = boundY;
        if (n.y > boundY) n.y = -boundY;
        if (n.z < 0) n.z = DEPTH;
        if (n.z > DEPTH) n.z = 0;

        // Push from ripples
        for (const rip of ripples) {
          const dx = n.x - (rip.x - width / 2);
          const dy = n.y - (rip.y - height / 2);
          const d = Math.sqrt(dx * dx + dy * dy);
          if (Math.abs(d - rip.r) < 60) {
            n.vx += (dx / (d || 1)) * 0.4;
            n.vy += (dy / (d || 1)) * 0.4;
          }
        }

        // 3D Euler Matrix Rotation
        const x1 = n.x * cosY + n.z * sinY;
        const z1 = -n.x * sinY + n.z * cosY;

        const y2 = n.y * cosX - z1 * sinX;
        const z2 = n.y * sinX + z1 * cosX + 380; // Camera distance

        if (z2 > 10) {
          const scale = FOV / z2;
          const px = width / 2 + x1 * scale;
          const py = height / 2 + y2 * scale;
          const alpha = Math.min(1, Math.max(0.12, (DEPTH - n.z) / DEPTH));

          projected.push({ px, py, scale, node: n, alpha, index: i });
        }
      }

      // Connect 3D Web Lines
      const maxDistance = 135;
      for (let i = 0; i < projected.length; i++) {
        const p1 = projected[i]!;

        // Check node-to-node connections
        for (let j = i + 1; j < projected.length; j++) {
          const p2 = projected[j]!;
          const dx = p1.px - p2.px;
          const dy = p1.py - p2.py;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const factor = 1 - dist / maxDistance;
            const lineAlpha = factor * 0.45 * p1.alpha * p2.alpha;

            // Gradient line between the two nodes
            const grad = ctx.createLinearGradient(p1.px, p1.py, p2.px, p2.py);
            grad.addColorStop(0, p1.node.color);
            grad.addColorStop(1, p2.node.color);

            ctx.strokeStyle = grad;
            ctx.globalAlpha = lineAlpha;
            ctx.lineWidth = Math.max(0.4, factor * 1.5);
            ctx.beginPath();
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);
            ctx.stroke();

            // Randomly spawn animated light signal pulse along the line
            if (Math.random() < 0.0003 && pulses.length < 35) {
              pulses.push({
                p1Index: i,
                p2Index: j,
                progress: 0,
                speed: Math.random() * 0.025 + 0.015,
                color: p1.node.color,
              });
            }
          }
        }

        // Draw Interactive Web Lines to Mouse Cursor
        if (mouse.active) {
          const mdx = p1.px - mouse.x;
          const mdy = p1.py - mouse.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

          if (mdist < mouse.radius) {
            const factor = 1 - mdist / mouse.radius;
            const mouseAlpha = factor * 0.65 * p1.alpha;

            ctx.strokeStyle = `rgba(56, 189, 248, ${mouseAlpha})`;
            ctx.globalAlpha = mouseAlpha;
            ctx.lineWidth = factor * 2;
            ctx.beginPath();
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();

            // Fluid elastic pull toward mouse
            p1.node.x -= (mdx / mdist) * 0.5;
            p1.node.y -= (mdy / mdist) * 0.5;
          }
        }
      }

      // Draw Animated Web Pulses (Packets moving across the 3D web)
      for (let pIdx = pulses.length - 1; pIdx >= 0; pIdx--) {
        const pulse = pulses[pIdx]!;
        pulse.progress += pulse.speed;

        const p1 = projected[pulse.p1Index];
        const p2 = projected[pulse.p2Index];

        if (p1 && p2 && pulse.progress <= 1) {
          const px = p1.px + (p2.px - p1.px) * pulse.progress;
          const py = p1.py + (p2.py - p1.py) * pulse.progress;

          ctx.fillStyle = "#ffffff";
          ctx.globalAlpha = 0.9;
          ctx.beginPath();
          ctx.arc(px, py, 1.8, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = pulse.color;
          ctx.globalAlpha = 0.4;
          ctx.beginPath();
          ctx.arc(px, py, 4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          pulses.splice(pIdx, 1);
        }
      }

      // Draw 3D Nodes with Perspective Glow & Twinkle
      for (let i = 0; i < projected.length; i++) {
        const { px, py, scale, node, alpha } = projected[i]!;
        const twinkle = Math.sin(time * node.twinkleSpeed * 10 + node.twinkleOffset) * 0.25 + 0.75;
        const currentRadius = Math.max(1, node.radius * scale * 1.3);
        const nodeAlpha = alpha * twinkle;

        // Outer ambient glow
        ctx.fillStyle = node.glowColor;
        ctx.globalAlpha = nodeAlpha * 0.35;
        ctx.beginPath();
        ctx.arc(px, py, currentRadius * 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Inner glowing core
        ctx.fillStyle = node.color;
        ctx.globalAlpha = nodeAlpha;
        ctx.beginPath();
        ctx.arc(px, py, currentRadius, 0, Math.PI * 2);
        ctx.fill();

        // Pinpoint highlight center
        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = nodeAlpha * 0.9;
        ctx.beginPath();
        ctx.arc(px, py, currentRadius * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1.0;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-auto -z-10 h-full w-full bg-[#050816]"
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
    <div className="relative min-h-screen flex flex-col justify-center items-center px-4 py-12 overflow-hidden select-none">
      {/* 3D Cyber-Constellation & Digital Matrix Web Engine */}
      <Premium3DWebBackground />

      {/* Top Status Bar */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 text-xs font-medium text-slate-300 shadow-md">
          <span className="size-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <span>Interactive 3D Engine Live</span>
        </div>
      </div>

      {/* Central Login Card Container */}
      <div className="relative z-10 w-full max-w-sm space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="relative flex size-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 text-white shadow-xl shadow-blue-500/30 mb-3 transition-transform hover:scale-105 duration-300 ring-1 ring-white/20">
            <Hexagon className="size-7 stroke-[2.2]" />
            <Sparkles className="absolute -top-1 -right-1 size-4 text-cyan-300 animate-pulse" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white drop-shadow-md">
            SantoGe Talent Cloud
          </h1>
          <p className="mt-1 text-xs font-medium text-slate-400">
            Sign in to access your portal
          </p>
        </div>

        {/* Glassmorphic Cyber Card */}
        <div className="rounded-2xl border border-white/15 bg-slate-900/80 backdrop-blur-2xl p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] ring-1 ring-white/10">
          {!isConfigured && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <p>
                Backend is not configured. Please supply Supabase environment variables.
              </p>
            </div>
          )}

          <form onSubmit={handleSupabaseSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-200">
                Email Address
              </label>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@college.edu or admin@domain.com"
                className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3.5 py-2.5 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25 focus:bg-slate-950"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-200">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3.5 py-2.5 pr-10 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25 focus:bg-slate-950"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 transition-colors"
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
              <div className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-300">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !isConfigured}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-cyan-500/30 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <RefreshCw className="size-4 animate-spin" />
              ) : (
                <LogIn className="size-4" />
              )}
              {loading ? "Authenticating..." : "Sign In to Portal"}
              {!loading && (
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-center gap-2 text-center text-xs font-medium text-slate-400">
          <ShieldCheck className="size-3.5 text-emerald-400" />
          <span>Institutional accounts provisioned by college administrators.</span>
        </div>
      </div>

      <Toaster position="bottom-right" />
    </div>
  );
}
