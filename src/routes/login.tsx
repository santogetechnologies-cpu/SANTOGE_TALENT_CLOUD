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
  Zap,
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
// Attraction-Level 3D Holographic Constellation & Cybernetic Vortex Canvas
// ---------------------------------------------------------------------------
function Attraction3DWebBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
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

    // Mouse tracking & interactive physics attractor
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      vx: 0,
      vy: 0,
      active: false,
      radius: 260,
    };

    // Cursor spark trails
    const sparks: { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number }[] = [];

    const handleMouseMove = (e: MouseEvent) => {
      mouse.vx = e.clientX - mouse.targetX;
      mouse.vy = e.clientY - mouse.targetY;
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;

      // Emit interactive sparks on movement
      if (Math.hypot(mouse.vx, mouse.vy) > 3 && sparks.length < 60) {
        for (let s = 0; s < 2; s++) {
          sparks.push({
            x: e.clientX,
            y: e.clientY,
            vx: (Math.random() - 0.5) * 3 + mouse.vx * 0.15,
            vy: (Math.random() - 0.5) * 3 + mouse.vy * 0.15,
            life: 1.0,
            color: Math.random() > 0.5 ? "#38bdf8" : "#818cf8",
            size: Math.random() * 2 + 1,
          });
        }
      }
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    // Click explosive shockwave
    const shockwaves: { x: number; y: number; r: number; maxR: number; alpha: number; color: string }[] = [];
    const handleClick = (e: MouseEvent) => {
      shockwaves.push({
        x: e.clientX,
        y: e.clientY,
        r: 10,
        maxR: Math.max(width, height) * 0.6,
        alpha: 0.9,
        color: "#38bdf8",
      });
      shockwaves.push({
        x: e.clientX,
        y: e.clientY,
        r: 5,
        maxR: Math.max(width, height) * 0.45,
        alpha: 0.7,
        color: "#c084fc",
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("click", handleClick);

    // 3D Nodes
    interface Node3D {
      x: number;
      y: number;
      z: number;
      baseX: number;
      baseY: number;
      baseZ: number;
      vx: number;
      vy: number;
      vz: number;
      radius: number;
      color: string;
      glowColor: string;
      pulseSpeed: number;
      pulseOffset: number;
    }

    // High-speed photon pulse along web lines
    interface WebPulse {
      p1Idx: number;
      p2Idx: number;
      progress: number;
      speed: number;
      color: string;
    }

    const NODE_COUNT = Math.min(260, Math.max(160, Math.floor((width * height) / 4500)));
    const FOV = 480;
    const DEPTH = 750;
    const nodes: Node3D[] = [];
    const pulses: WebPulse[] = [];

    const PALETTE = [
      { core: "#00f0ff", glow: "rgba(0, 240, 255, 0.5)" }, // Electric Neon Cyan
      { core: "#38bdf8", glow: "rgba(56, 189, 248, 0.45)" }, // Vivid Sky
      { core: "#6366f1", glow: "rgba(99, 102, 241, 0.45)" }, // Indigo
      { core: "#a855f7", glow: "rgba(168, 85, 247, 0.5)" }, // Purple
      { core: "#ec4899", glow: "rgba(236, 72, 153, 0.4)" }, // Hot Pink Accent
      { core: "#10b981", glow: "rgba(16, 185, 129, 0.4)" }, // Emerald Accent
    ];

    for (let i = 0; i < NODE_COUNT; i++) {
      const p = PALETTE[Math.floor(Math.random() * PALETTE.length)]!;
      const x = (Math.random() - 0.5) * width * 1.8;
      const y = (Math.random() - 0.5) * height * 1.8;
      const z = Math.random() * DEPTH;

      nodes.push({
        x,
        y,
        z,
        baseX: x,
        baseY: y,
        baseZ: z,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        vz: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2.4 + 1.2,
        color: p.core,
        glowColor: p.glow,
        pulseSpeed: Math.random() * 0.04 + 0.02,
        pulseOffset: Math.random() * Math.PI * 2,
      });
    }

    // Horizon 3D wave grid lines
    const GRID_COLS = 24;
    const GRID_ROWS = 14;

    let rotY = 0;
    let rotX = 0;
    let time = 0;

    const render = () => {
      time += 0.025;

      // 1. Ethereal trail persistence with dark void fill
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(4, 7, 20, 0.28)";
      ctx.fillRect(0, 0, width, height);

      // 2. Dual volumetric glowing auroras in background
      const aurora1 = ctx.createRadialGradient(
        width * 0.25 + Math.sin(time * 0.7) * 60,
        height * 0.35 + Math.cos(time * 0.5) * 40,
        40,
        width * 0.25,
        height * 0.35,
        width * 0.55,
      );
      aurora1.addColorStop(0, "rgba(14, 165, 233, 0.12)");
      aurora1.addColorStop(0.5, "rgba(99, 102, 241, 0.06)");
      aurora1.addColorStop(1, "rgba(4, 7, 20, 0)");
      ctx.fillStyle = aurora1;
      ctx.fillRect(0, 0, width, height);

      const aurora2 = ctx.createRadialGradient(
        width * 0.75 + Math.cos(time * 0.6) * 60,
        height * 0.65 + Math.sin(time * 0.8) * 50,
        40,
        width * 0.75,
        height * 0.65,
        width * 0.55,
      );
      aurora2.addColorStop(0, "rgba(168, 85, 247, 0.12)");
      aurora2.addColorStop(0.5, "rgba(59, 130, 246, 0.06)");
      aurora2.addColorStop(1, "rgba(4, 7, 20, 0)");
      ctx.fillStyle = aurora2;
      ctx.fillRect(0, 0, width, height);

      // Smooth mouse interpolation & gyro tilt
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      const targetRotY = ((mouse.x - width / 2) / width) * 0.5;
      const targetRotX = -((mouse.y - height / 2) / height) * 0.5;
      rotY += (targetRotY - rotY) * 0.06;
      rotX += (targetRotX - rotX) * 0.06;

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      // 3. Render 3D Undulating Horizon Wave Grid
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = "rgba(56, 189, 248, 0.12)";
      ctx.lineWidth = 1;

      const gridStartX = -width * 0.8;
      const gridEndX = width * 0.8;
      const gridStepX = (gridEndX - gridStartX) / GRID_COLS;
      const gridStartZ = 100;
      const gridEndZ = 700;
      const gridStepZ = (gridEndZ - gridStartZ) / GRID_ROWS;

      for (let r = 0; r < GRID_ROWS; r++) {
        const gz = gridStartZ + r * gridStepZ;
        ctx.beginPath();
        let started = false;

        for (let c = 0; c <= GRID_COLS; c++) {
          const gx = gridStartX + c * gridStepX;
          const waveY =
            height * 0.38 +
            Math.sin(gx * 0.005 + time * 1.5) * 22 +
            Math.cos(gz * 0.008 + time * 1.2) * 18;

          // Project 3D grid vertex
          const x1 = gx * cosY + gz * sinY;
          const z1 = -gx * sinY + gz * cosY;
          const y2 = waveY * cosX - z1 * sinX;
          const z2 = waveY * sinX + z1 * cosX + 380;

          if (z2 > 10) {
            const scale = FOV / z2;
            const px = width / 2 + x1 * scale;
            const py = height / 2 + y2 * scale;

            if (!started) {
              ctx.moveTo(px, py);
              started = true;
            } else {
              ctx.lineTo(px, py);
            }
          }
        }
        ctx.stroke();
      }

      // 4. Render shockwaves
      for (let sIdx = shockwaves.length - 1; sIdx >= 0; sIdx--) {
        const sw = shockwaves[sIdx]!;
        sw.r += 9;
        sw.alpha *= 0.95;
        ctx.strokeStyle = sw.color;
        ctx.globalAlpha = sw.alpha * 0.7;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2);
        ctx.stroke();

        if (sw.alpha < 0.02 || sw.r > sw.maxR) {
          shockwaves.splice(sIdx, 1);
        }
      }

      // 5. Render cursor spark particles
      for (let spIdx = sparks.length - 1; spIdx >= 0; spIdx--) {
        const sp = sparks[spIdx]!;
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.vx *= 0.94;
        sp.vy *= 0.94;
        sp.life -= 0.035;

        if (sp.life > 0) {
          ctx.fillStyle = sp.color;
          ctx.globalAlpha = sp.life * 0.8;
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.size * sp.life, 0, Math.PI * 2);
          ctx.fill();
        } else {
          sparks.splice(spIdx, 1);
        }
      }

      // 6. Project 3D Nodes
      const projected: {
        px: number;
        py: number;
        scale: number;
        node: Node3D;
        alpha: number;
        idx: number;
      }[] = [];

      const boundX = (width * 1.8) / 2;
      const boundY = (height * 1.8) / 2;

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]!;

        // Autonomous orbital drift
        n.x += n.vx;
        n.y += n.vy;
        n.z += n.vz;

        if (n.x < -boundX) n.x = boundX;
        if (n.x > boundX) n.x = -boundX;
        if (n.y < -boundY) n.y = boundY;
        if (n.y > boundY) n.y = -boundY;
        if (n.z < 0) n.z = DEPTH;
        if (n.z > DEPTH) n.z = 0;

        // Shockwave displacement
        for (const sw of shockwaves) {
          const dx = n.x - (sw.x - width / 2);
          const dy = n.y - (sw.y - height / 2);
          const d = Math.hypot(dx, dy);
          if (Math.abs(d - sw.r) < 80) {
            n.vx += (dx / (d || 1)) * 0.6;
            n.vy += (dy / (d || 1)) * 0.6;
          }
        }

        // 3D Matrix transform
        const x1 = n.x * cosY + n.z * sinY;
        const z1 = -n.x * sinY + n.z * cosY;

        const y2 = n.y * cosX - z1 * sinX;
        const z2 = n.y * sinX + z1 * cosX + 380;

        if (z2 > 10) {
          const scale = FOV / z2;
          const px = width / 2 + x1 * scale;
          const py = height / 2 + y2 * scale;
          const alpha = Math.min(1, Math.max(0.15, (DEPTH - n.z) / DEPTH));

          projected.push({ px, py, scale, node: n, alpha, idx: i });
        }
      }

      // 7. Render 3D Spider Web Filaments (Additive Laser Glow)
      const maxDistance = 135;
      for (let i = 0; i < projected.length; i++) {
        const p1 = projected[i]!;

        for (let j = i + 1; j < projected.length; j++) {
          const p2 = projected[j]!;
          const dx = p1.px - p2.px;
          const dy = p1.py - p2.py;
          const dist = Math.hypot(dx, dy);

          if (dist < maxDistance) {
            const factor = 1 - dist / maxDistance;
            const lineAlpha = factor * 0.5 * p1.alpha * p2.alpha;

            // Electric dual-color gradient filament
            const grad = ctx.createLinearGradient(p1.px, p1.py, p2.px, p2.py);
            grad.addColorStop(0, p1.node.color);
            grad.addColorStop(1, p2.node.color);

            ctx.strokeStyle = grad;
            ctx.globalAlpha = lineAlpha;
            ctx.lineWidth = Math.max(0.5, factor * 1.8);
            ctx.beginPath();
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);
            ctx.stroke();

            // Spawn dynamic data pulses along lines
            if (Math.random() < 0.0004 && pulses.length < 45) {
              pulses.push({
                p1Idx: i,
                p2Idx: j,
                progress: 0,
                speed: Math.random() * 0.03 + 0.018,
                color: p1.node.color,
              });
            }
          }
        }

        // 8. Magnetic Gravitational Attractor around Cursor
        if (mouse.active) {
          const mdx = p1.px - mouse.x;
          const mdy = p1.py - mouse.y;
          const mdist = Math.hypot(mdx, mdy);

          if (mdist < mouse.radius) {
            const factor = 1 - mdist / mouse.radius;
            const mouseAlpha = factor * 0.75 * p1.alpha;

            // Intense laser beam to mouse
            const mGrad = ctx.createLinearGradient(p1.px, p1.py, mouse.x, mouse.y);
            mGrad.addColorStop(0, p1.node.color);
            mGrad.addColorStop(1, "#00f0ff");

            ctx.strokeStyle = mGrad;
            ctx.globalAlpha = mouseAlpha;
            ctx.lineWidth = factor * 2.4;
            ctx.beginPath();
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();

            // Spiraling orbital vortex gravity towards cursor
            const angle = Math.atan2(mdy, mdx) + Math.PI * 0.5;
            p1.node.x -= (mdx / mdist) * 0.65 - Math.cos(angle) * 0.5;
            p1.node.y -= (mdy / mdist) * 0.65 - Math.sin(angle) * 0.5;
          }
        }
      }

      // 9. Render Animated Traveling Data Photons (Pulses)
      for (let pIdx = pulses.length - 1; pIdx >= 0; pIdx--) {
        const pulse = pulses[pIdx]!;
        pulse.progress += pulse.speed;

        const p1 = projected[pulse.p1Idx];
        const p2 = projected[pulse.p2Idx];

        if (p1 && p2 && pulse.progress <= 1) {
          const px = p1.px + (p2.px - p1.px) * pulse.progress;
          const py = p1.py + (p2.py - p1.py) * pulse.progress;

          // Blazing white photon core
          ctx.fillStyle = "#ffffff";
          ctx.globalAlpha = 0.95;
          ctx.beginPath();
          ctx.arc(px, py, 2.2, 0, Math.PI * 2);
          ctx.fill();

          // Outer glowing halo
          ctx.fillStyle = pulse.color;
          ctx.globalAlpha = 0.55;
          ctx.beginPath();
          ctx.arc(px, py, 5.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          pulses.splice(pIdx, 1);
        }
      }

      // 10. Render 3D Luminous Nodes
      for (let i = 0; i < projected.length; i++) {
        const { px, py, scale, node, alpha } = projected[i]!;
        const pulse = Math.sin(time * node.pulseSpeed * 10 + node.pulseOffset) * 0.3 + 0.8;
        const currentRadius = Math.max(1.2, node.radius * scale * 1.35 * pulse);
        const nodeAlpha = alpha * pulse;

        // Outer soft radiant halo
        ctx.fillStyle = node.glowColor;
        ctx.globalAlpha = nodeAlpha * 0.45;
        ctx.beginPath();
        ctx.arc(px, py, currentRadius * 3.8, 0, Math.PI * 2);
        ctx.fill();

        // Neon glowing body
        ctx.fillStyle = node.color;
        ctx.globalAlpha = nodeAlpha * 0.9;
        ctx.beginPath();
        ctx.arc(px, py, currentRadius, 0, Math.PI * 2);
        ctx.fill();

        // Brilliant white-hot center core
        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = nodeAlpha;
        ctx.beginPath();
        ctx.arc(px, py, currentRadius * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Cursor interactive pulse beacon
      if (mouse.active) {
        ctx.strokeStyle = "rgba(0, 240, 255, 0.4)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 16 + Math.sin(time * 5) * 4, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "#00f0ff";
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 3, 0, Math.PI * 2);
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
      className="fixed inset-0 pointer-events-auto -z-10 h-full w-full bg-[#040714] cursor-crosshair"
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
      {/* Attraction-Level 3D Constellation & Cybernetic Vortex Background */}
      <Attraction3DWebBackground />

      {/* Top Status Indicators */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-full border border-cyan-500/30 bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-cyan-300 shadow-[0_0_20px_rgba(56,189,248,0.2)]">
          <span className="size-2 rounded-full bg-cyan-400 animate-ping" />
          <Zap className="size-3 text-cyan-400" />
          <span>Interactive 3D Field Active</span>
        </div>
      </div>

      {/* Central Login Holographic Console Container */}
      <div className="relative z-10 w-full max-w-sm space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="relative flex size-15 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 text-white shadow-[0_0_35px_rgba(56,189,248,0.4)] mb-3 transition-transform hover:scale-110 duration-300 ring-2 ring-cyan-400/40">
            <Hexagon className="size-8 stroke-[2.2]" />
            <Sparkles className="absolute -top-1 -right-1 size-4.5 text-cyan-200 animate-pulse" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white drop-shadow-[0_2px_15px_rgba(255,255,255,0.2)]">
            SantoGe Talent Cloud
          </h1>
          <p className="mt-1 text-xs font-medium text-slate-300">
            Sign in to access your portal
          </p>
        </div>

        {/* Hologram Glassmorphic Card */}
        <div className="rounded-2xl border border-cyan-500/30 bg-slate-950/85 backdrop-blur-2xl p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_-10px_rgba(56,189,248,0.25)] ring-1 ring-white/15">
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
                className="w-full rounded-xl border border-white/15 bg-slate-900/80 px-3.5 py-2.5 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 focus:bg-slate-900"
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
                  className="w-full rounded-xl border border-white/15 bg-slate-900/80 px-3.5 py-2.5 pr-10 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 focus:bg-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-300 p-1 transition-colors"
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
              <div className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/15 p-2.5 text-xs text-rose-300">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !isConfigured}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 py-2.5 text-sm font-bold text-white shadow-[0_0_25px_rgba(56,189,248,0.35)] transition-all hover:shadow-[0_0_35px_rgba(56,189,248,0.55)] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <RefreshCw className="size-4 animate-spin" />
              ) : (
                <LogIn className="size-4" />
              )}
              {loading ? "Authenticating..." : "Sign In to Portal"}
              {!loading && (
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-center gap-2 text-center text-xs font-medium text-slate-400">
          <ShieldCheck className="size-3.5 text-emerald-400" />
          <span>Move mouse or click to interact with 3D cyber-mesh.</span>
        </div>
      </div>

      <Toaster position="bottom-right" />
    </div>
  );
}
