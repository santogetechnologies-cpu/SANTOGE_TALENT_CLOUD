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
  Sun,
  Moon,
  Sparkles,
  ArrowRight,
  ShieldCheck,
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
// Interactive Animated Characters (Reference: https://youtu.be/WYLiXJDUnaw)
// Cute, modern 2.5D characters whose eyes track typing and hide during password entry
// ---------------------------------------------------------------------------
interface InteractiveCharactersProps {
  focusedField: "email" | "password" | null;
  isTyping: boolean;
  mousePos: { x: number; y: number };
}

function InteractiveCharacters({ focusedField, mousePos }: InteractiveCharactersProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const [blink, setBlink] = useState(false);

  // Random natural blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 180);
    }, 3800 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Compute pupil position based on mouse or focused field
  useEffect(() => {
    if (focusedField === "password") {
      // Shy / looking away when password is active
      setPupilOffset({ x: -4, y: 4 });
      return;
    }

    if (focusedField === "email") {
      // Look intently towards the form on the right
      setPupilOffset({ x: 6, y: 1 });
      return;
    }

    // Otherwise track mouse pointer smoothly
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = mousePos.x - centerX;
      const dy = mousePos.y - centerY;
      const angle = Math.atan2(dy, dx);
      const dist = Math.min(6, Math.hypot(dx, dy) / 45);

      setPupilOffset({
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
      });
    }
  }, [mousePos, focusedField]);

  const isPassword = focusedField === "password";

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[280px] sm:h-[340px] flex items-end justify-center select-none"
    >
      <svg
        viewBox="0 0 380 320"
        className="w-full h-full max-w-[340px] drop-shadow-md overflow-visible transition-transform duration-300"
      >
        {/* Soft Shadow Underneath */}
        <ellipse cx="190" cy="305" rx="140" ry="12" fill="currentColor" className="text-slate-300/40 dark:text-slate-950/60" />

        {/* 1. TALL VIOLET / INDIGO PILL CHARACTER (Back Center) */}
        <g
          className="transition-transform duration-500 ease-out origin-bottom"
          style={{
            transform: isPassword
              ? "translateY(8px) rotate(-3deg)"
              : focusedField === "email"
              ? "translateY(-4px) rotate(2deg)"
              : "translateY(0) rotate(0)",
          }}
        >
          {/* Body */}
          <rect
            x="110"
            y="70"
            width="85"
            height="230"
            rx="42.5"
            className="fill-[#6366f1] transition-colors duration-300"
          />

          {/* Eyes */}
          {isPassword ? (
            // Closed / Shy Eyelids
            <g className="stroke-white stroke-[3.5] stroke-linecap-round fill-none">
              <path d="M 132 138 Q 140 144 148 138" />
              <path d="M 157 138 Q 165 144 173 138" />
              {/* Cute Blushing Cheeks */}
              <circle cx="127" cy="148" r="6" fill="#f43f5e" opacity="0.6" stroke="none" />
              <circle cx="178" cy="148" r="6" fill="#f43f5e" opacity="0.6" stroke="none" />
            </g>
          ) : (
            // Open Tracking Eyes
            <g>
              {/* Eye Whites */}
              <ellipse cx="140" cy="135" rx="10" ry={blink ? 1 : 12} fill="#ffffff" />
              <ellipse cx="165" cy="135" rx="10" ry={blink ? 1 : 12} fill="#ffffff" />
              {/* Pupils */}
              {!blink && (
                <>
                  <circle cx={140 + pupilOffset.x} cy={135 + pupilOffset.y} r="4.5" fill="#1e1b4b" />
                  <circle cx={140 + pupilOffset.x + 1.5} cy={135 + pupilOffset.y - 1.5} r="1.5" fill="#ffffff" />
                  <circle cx={165 + pupilOffset.x} cy={135 + pupilOffset.y} r="4.5" fill="#1e1b4b" />
                  <circle cx={165 + pupilOffset.x + 1.5} cy={135 + pupilOffset.y - 1.5} r="1.5" fill="#ffffff" />
                </>
              )}
            </g>
          )}

          {/* Cute Mouth */}
          <ellipse
            cx="152"
            cy="162"
            rx={isPassword ? "6" : focusedField === "email" ? "4" : "3"}
            ry={isPassword ? "2" : focusedField === "email" ? "4" : "3"}
            fill="#1e1b4b"
            opacity="0.8"
          />
        </g>

        {/* 2. MAGENTA / PINK PILL CHARACTER (Mid Right) */}
        <g
          className="transition-transform duration-500 ease-out origin-bottom"
          style={{
            transform: isPassword
              ? "translateY(14px) rotate(4deg)"
              : focusedField === "email"
              ? "translateY(-6px) rotate(4deg)"
              : "translateY(0) rotate(0)",
          }}
        >
          {/* Body */}
          <rect
            x="175"
            y="130"
            width="60"
            height="170"
            rx="30"
            className="fill-[#ec4899] transition-colors duration-300"
          />

          {/* Eyes */}
          {isPassword ? (
            <g className="stroke-white stroke-[3] stroke-linecap-round fill-none">
              <path d="M 190 180 Q 196 186 202 180" />
              <path d="M 208 180 Q 214 186 220 180" />
              <circle cx="186" cy="188" r="5" fill="#be185d" opacity="0.5" stroke="none" />
              <circle cx="224" cy="188" r="5" fill="#be185d" opacity="0.5" stroke="none" />
            </g>
          ) : (
            <g>
              <ellipse cx="196" cy="178" rx="8" ry={blink ? 1 : 9} fill="#ffffff" />
              <ellipse cx="214" cy="178" rx="8" ry={blink ? 1 : 9} fill="#ffffff" />
              {!blink && (
                <>
                  <circle cx={196 + pupilOffset.x * 0.9} cy={178 + pupilOffset.y * 0.9} r="3.5" fill="#831843" />
                  <circle cx={196 + pupilOffset.x * 0.9 + 1} cy={178 + pupilOffset.y * 0.9 - 1} r="1.2" fill="#ffffff" />
                  <circle cx={214 + pupilOffset.x * 0.9} cy={178 + pupilOffset.y * 0.9} r="3.5" fill="#831843" />
                  <circle cx={214 + pupilOffset.x * 0.9 + 1} cy={178 + pupilOffset.y * 0.9 - 1} r="1.2" fill="#ffffff" />
                </>
              )}
            </g>
          )}

          {/* Small mouth */}
          <circle cx="205" cy="198" r="2.5" fill="#831843" opacity="0.8" />
        </g>

        {/* 3. WARM YELLOW PILL (Far Right) */}
        <g
          className="transition-transform duration-500 ease-out origin-bottom"
          style={{
            transform: isPassword
              ? "translateY(16px) rotate(6deg)"
              : focusedField === "email"
              ? "translateY(-2px) rotate(1deg)"
              : "translateY(0) rotate(0)",
          }}
        >
          {/* Body */}
          <rect
            x="228"
            y="170"
            width="55"
            height="130"
            rx="27.5"
            className="fill-[#eab308] transition-colors duration-300"
          />

          {/* Eye */}
          {isPassword ? (
            <path d="M 245 208 Q 252 214 259 208" stroke="#713f12" strokeWidth="3" strokeLinecap="round" fill="none" />
          ) : (
            <g>
              <ellipse cx="252" cy="205" rx="7.5" ry={blink ? 1 : 8.5} fill="#ffffff" />
              {!blink && (
                <>
                  <circle cx={252 + pupilOffset.x * 0.8} cy={205 + pupilOffset.y * 0.8} r="3.2" fill="#713f12" />
                  <circle cx={252 + pupilOffset.x * 0.8 + 1} cy={205 + pupilOffset.y * 0.8 - 1} r="1.1" fill="#ffffff" />
                </>
              )}
            </g>
          )}

          {/* Shy mouth line */}
          <line x1="246" y1="222" x2="258" y2="222" stroke="#713f12" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
        </g>

        {/* 4. WARM ORANGE SQUAT DOME (Foreground Left) */}
        <g
          className="transition-transform duration-500 ease-out origin-bottom"
          style={{
            transform: isPassword
              ? "scaleY(0.92) translateY(6px)"
              : focusedField === "email"
              ? "translateY(-4px) scaleY(1.04)"
              : "scaleY(1) translateY(0)",
          }}
        >
          {/* Squat dome body */}
          <path
            d="M 60 300 C 60 210, 160 210, 160 300 Z"
            className="fill-[#f97316] transition-colors duration-300"
          />

          {/* Eyes */}
          {isPassword ? (
            <g className="stroke-[#7c2d12] stroke-[3] stroke-linecap-round fill-none">
              <path d="M 96 248 Q 102 254 108 248" />
              <path d="M 120 248 Q 126 254 132 248" />
              <circle cx="92" cy="254" r="5" fill="#ea580c" opacity="0.4" stroke="none" />
              <circle cx="136" cy="254" r="5" fill="#ea580c" opacity="0.4" stroke="none" />
            </g>
          ) : (
            <g>
              <ellipse cx="102" cy="245" rx="7" ry={blink ? 1 : 8} fill="#ffffff" />
              <ellipse cx="126" cy="245" rx="7" ry={blink ? 1 : 8} fill="#ffffff" />
              {!blink && (
                <>
                  <circle cx={102 + pupilOffset.x * 0.8} cy={245 + pupilOffset.y * 0.8} r="3" fill="#7c2d12" />
                  <circle cx={102 + pupilOffset.x * 0.8 + 1} cy={245 + pupilOffset.y * 0.8 - 1} r="1" fill="#ffffff" />
                  <circle cx={126 + pupilOffset.x * 0.8} cy={245 + pupilOffset.y * 0.8} r="3" fill="#7c2d12" />
                  <circle cx={126 + pupilOffset.x * 0.8 + 1} cy={245 + pupilOffset.y * 0.8 - 1} r="1" fill="#ffffff" />
                </>
              )}
            </g>
          )}

          {/* Tiny cute nose/mouth */}
          <ellipse cx="114" cy="257" rx="2.5" ry="2" fill="#7c2d12" opacity="0.85" />
        </g>
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Login Page Component (Clean Master Split Layout)
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

  // Field focus states for character interaction
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const isConfigured = isSupabaseConfigured();

  // Global mouse position tracking
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

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
      setError(res.error || "Unable to sign in. Please check your credentials.");
      return;
    }
    toast.success(
      res.role === "admin" ? "Signed in as Administrator" : "Signed in successfully",
    );
    void navigate({ to: res.role === "admin" ? "/admin" : "/student" });
  };

  return (
    <div className="min-h-screen w-full bg-slate-100/90 dark:bg-slate-950 flex flex-col justify-between p-4 sm:p-6 lg:p-10 transition-colors duration-300 select-none">
      {/* Top Bar with SantoGe Brand and Theme Toggle */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between pb-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground shadow-xs">
            <Hexagon className="size-4.5 stroke-[2.2]" />
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold tracking-tight text-foreground">SantoGe</span>
            <span className="text-sm font-medium text-muted-foreground">Talent Cloud</span>
          </div>
        </div>

        <button
          type="button"
          onClick={store.toggleTheme}
          aria-label="Toggle theme"
          className="grid size-9 place-items-center rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-xs"
        >
          {store.theme === "dark" ? (
            <Sun className="size-4 text-amber-500" />
          ) : (
            <Moon className="size-4" />
          )}
        </button>
      </header>

      {/* Main Master Card (Split Composed Layout inspired by Reference) */}
      <main className="flex-1 flex items-center justify-center py-2">
        <div className="w-full max-w-4xl rounded-3xl border border-border/80 bg-card shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden grid lg:grid-cols-12 transition-all duration-300">
          {/* Left Visual Area (Interactive Character Stage) */}
          <div className="lg:col-span-6 bg-slate-50/80 dark:bg-slate-900/40 p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-border/60 relative overflow-hidden">
            {/* Subtle background circles */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

            {/* Top Badge */}
            <div className="relative z-10 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                <Sparkles className="size-3.5" /> Placement Accelerator
              </span>
            </div>

            {/* Interactive Characters Stage */}
            <div className="my-auto py-6">
              <InteractiveCharacters
                focusedField={focusedField}
                isTyping={isTyping}
                mousePos={mousePos}
              />
            </div>

            {/* Bottom Caption */}
            <div className="relative z-10 text-center text-xs text-muted-foreground leading-relaxed">
              <p className="font-medium text-foreground">Synchronized 90-Day Placement Cohorts</p>
              <p className="text-[11px] mt-0.5">15 Technical Specializations · 100% Interactive Sandboxes</p>
            </div>
          </div>

          {/* Right Form Area */}
          <div className="lg:col-span-6 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-card">
            <div className="w-full max-w-sm mx-auto space-y-6">
              {/* Form Header */}
              <div className="space-y-1.5">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Welcome back!
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Sign in to continue to your Talent Cloud account.
                </p>
              </div>

              {/* Backend Configuration Notice if not configured */}
              {!isConfigured && (
                <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive animate-in fade-in">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <p>
                    Supabase backend is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env
                  </p>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSupabaseSubmit} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-foreground">
                    Institutional Email
                  </label>
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setIsTyping(true);
                      setTimeout(() => setIsTyping(false), 800);
                    }}
                    placeholder="student@college.edu or admin@domain.com"
                    className="w-full h-11 rounded-xl border border-border bg-background px-3.5 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Password Field */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground">Password</label>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setIsTyping(true);
                        setTimeout(() => setIsTyping(false), 800);
                      }}
                      placeholder="••••••••••••"
                      className="w-full h-11 rounded-xl border border-border bg-background px-3.5 pr-10 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
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

                {/* Inline Error Message */}
                {error && (
                  <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive animate-in fade-in">
                    <AlertCircle className="size-4 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{error}</span>
                  </div>
                )}

                {/* Submit Primary CTA */}
                <button
                  type="submit"
                  disabled={loading || !isConfigured}
                  className="group flex w-full h-11 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <RefreshCw className="size-4 animate-spin" />
                  ) : (
                    <LogIn className="size-4" />
                  )}
                  {loading ? "Signing in..." : "Sign In"}
                  {!loading && (
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  )}
                </button>
              </form>

              {/* Supporting Institutional Notice */}
              <div className="pt-2 text-center text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Student accounts are provisioned directly by institution administrators.</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="w-full text-center text-xs text-muted-foreground pt-3">
        <p>© {new Date().getFullYear()} SantoGe Technologies · SantoGe Talent Cloud (STC)</p>
      </footer>

      <Toaster position="bottom-right" />
    </div>
  );
}
