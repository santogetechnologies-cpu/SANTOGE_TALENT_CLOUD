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
  Mail,
  Lock,
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
      className="relative w-full h-[180px] sm:h-[210px] lg:h-[230px] flex items-end justify-center select-none"
    >
      <svg
        viewBox="0 0 380 320"
        className="w-full h-full max-w-[340px] drop-shadow-2xl overflow-visible transition-transform duration-300"
      >
        {/* Soft Ambient Shadow Underneath */}
        <ellipse
          cx="190"
          cy="305"
          rx="140"
          ry="12"
          fill="#020617"
          opacity="0.85"
        />

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
              <circle cx="127" cy="148" r="6" fill="#f43f5e" opacity="0.65" stroke="none" />
              <circle cx="178" cy="148" r="6" fill="#f43f5e" opacity="0.65" stroke="none" />
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
              <circle cx="186" cy="188" r="5" fill="#be185d" opacity="0.55" stroke="none" />
              <circle cx="224" cy="188" r="5" fill="#be185d" opacity="0.55" stroke="none" />
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
// Login Page Component (Guaranteed Dark Mode & Master Split Layout)
// ---------------------------------------------------------------------------
function LoginPage() {
  const store = useAppStore();
  const navigate = useNavigate();

  // Form states
  const [authMode, setAuthMode] = useState<"signin" | "forgot" | "reset">(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash || "";
      const search = window.location.search || "";
      if (
        hash.includes("type=recovery") ||
        search.includes("reset=true") ||
        search.includes("type=recovery")
      ) {
        return "reset";
      }
    }
    return "signin";
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Password reset states
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Field focus states for character interaction
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const isConfigured = isSupabaseConfigured();

  // Watch store password recovery trigger
  useEffect(() => {
    if (store.isPasswordRecovery) {
      setAuthMode("reset");
    }
  }, [store.isPasswordRecovery]);

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

  // Live Supabase password reset request handler
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfigured) {
      setError("Supabase backend is not configured.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid institutional email address.");
      return;
    }
    setError("");
    setLoading(true);

    const res = await store.requestPasswordReset(email.trim());
    setLoading(false);
    if (!res.ok) {
      if (res.message?.toLowerCase().includes("rate limit")) {
        setError(
          "For security, password reset requests are rate-limited. Please wait a few moments before requesting another link, or contact your institutional administrator.",
        );
      } else {
        setError(res.message || "Failed to dispatch password recovery email.");
      }
      return;
    }

    setForgotSuccess(true);
    toast.success("Password recovery email dispatched. Please check your inbox.");
  };

  // Live Supabase new password update handler
  const handleUpdatePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfigured) {
      setError("Supabase backend is not configured.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }
    setError("");
    setLoading(true);

    const res = await store.updateUserPassword(newPassword);
    setLoading(false);
    if (!res.ok) {
      if (
        res.error?.toLowerCase().includes("expired") ||
        res.error?.toLowerCase().includes("invalid") ||
        res.error?.toLowerCase().includes("jwt")
      ) {
        setError(
          "Your password recovery link has expired or has already been used. Please request a new recovery link.",
        );
      } else {
        setError(res.error || "Failed to update password in Supabase Auth.");
      }
      return;
    }

    setResetSuccess(true);
    setPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setAuthMode("signin");
    toast.success("Password successfully updated! You can now log in.");
  };

  return (
    // Always Dark Mode container - fixed viewport height, zero vertical scroll
    <div className="dark h-screen max-h-screen w-full bg-[#080b13] text-slate-100 flex flex-col justify-between p-3 sm:p-5 lg:p-6 select-none relative overflow-hidden font-sans">
      {/* Ambient background soft light accents */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-600/5 blur-[140px] pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-5xl mx-auto flex items-center pb-2">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-md shadow-indigo-600/20">
            <Hexagon className="size-5 stroke-[2.2]" />
          </span>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-tight text-white">SantoGe</span>
            <span className="text-sm font-medium text-slate-400">Talent Cloud</span>
          </div>
        </div>
      </header>

      {/* Main Master Split Card Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center py-1">
        <div className="w-full max-w-4xl lg:max-w-5xl rounded-3xl border border-slate-800/90 bg-[#0e1424]/90 backdrop-blur-xl shadow-2xl shadow-black/80 overflow-hidden grid lg:grid-cols-12 transition-all duration-300">
          
          {/* Left Column: Visual Character Stage */}
          <div className="lg:col-span-6 bg-gradient-to-b from-[#0b1020] via-[#0e162a] to-[#0a0f1d] p-5 sm:p-6 lg:p-7 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/80 relative overflow-hidden">
            {/* Soft backdrop radial glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

            {/* Top Stage Header */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
                <Sparkles className="size-3.5 text-indigo-400" /> Placement Accelerator
              </span>
              <span className="text-[11px] font-mono font-medium text-slate-400 tracking-wider">
                90-DAY COHORT
              </span>
            </div>

            {/* Interactive Characters Stage */}
            <div className="my-auto py-2 sm:py-4 flex items-center justify-center">
              <InteractiveCharacters
                focusedField={focusedField}
                isTyping={isTyping}
                mousePos={mousePos}
              />
            </div>

            {/* Bottom Stage Footer */}
            <div className="relative z-10 text-center space-y-1">
              <p className="text-xs font-semibold text-slate-200 tracking-wide">
                Synchronized Placement Cohorts
              </p>
              <p className="text-[11px] text-slate-400">
                15 Technical Specializations · Evidence-Based Mastery
              </p>
            </div>
          </div>

          {/* Right Column: Clean Auth Form Area */}
          <div className="lg:col-span-6 p-5 sm:p-7 lg:p-8 flex flex-col justify-center bg-[#0c1222]/95 relative">
            <div className="w-full max-w-[360px] mx-auto space-y-4 sm:space-y-5">
              
              {/* Form Title & Subtitle */}
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  {authMode === "signin" && "Welcome back!"}
                  {authMode === "forgot" && "Reset Password"}
                  {authMode === "reset" && "Set New Password"}
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {authMode === "signin" && "Sign in to continue to your Talent Cloud account."}
                  {authMode === "forgot" &&
                    "Enter your registered institutional email to receive a recovery link."}
                  {authMode === "reset" &&
                    "Create a new password for your SantoGe account."}
                </p>
              </div>

              {/* Reset Success Banner */}
              {resetSuccess && authMode === "signin" && (
                <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-3 text-xs text-emerald-300 animate-in fade-in">
                  <ShieldCheck className="size-4 shrink-0 mt-0.5 text-emerald-400" />
                  <p>Password updated successfully in Supabase Auth. Please sign in with your new password.</p>
                </div>
              )}

              {/* Supabase backend warning if unconfigured */}
              {!isConfigured && (
                <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-xs text-rose-300 animate-in fade-in">
                  <AlertCircle className="size-4 shrink-0 mt-0.5 text-rose-400" />
                  <p>
                    Supabase backend is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env
                  </p>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* MODE 1: Standard Sign In Form                                 */}
              {/* ------------------------------------------------------------- */}
              {authMode === "signin" && (
                <form onSubmit={handleSupabaseSubmit} className="space-y-3.5 sm:space-y-4">
                  {/* Institutional Email Field */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-300">
                      Institutional Email
                    </label>
                    <div className="relative">
                      <Mail className="size-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        required
                        autoFocus
                        value={email}
                        autoComplete="email"
                        onFocus={() => setFocusedField("email")}
                        onBlur={() => setFocusedField(null)}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setIsTyping(true);
                          setTimeout(() => setIsTyping(false), 800);
                        }}
                        placeholder="student@college.edu or admin@domain.com"
                        className="w-full h-10 sm:h-11 pl-10 pr-3.5 rounded-xl border border-slate-700/80 bg-[#070b14]/90 text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25 focus:bg-[#080e1d]"
                      />
                    </div>
                  </div>

                  {/* Password Field with Reveal Toggle & Forgot Password Link */}
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <label className="text-xs font-medium text-slate-300">Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          setError("");
                          setForgotSuccess(false);
                          setAuthMode("forgot");
                        }}
                        className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="size-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        autoComplete="current-password"
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => setFocusedField(null)}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setIsTyping(true);
                          setTimeout(() => setIsTyping(false), 800);
                        }}
                        placeholder="••••••••••••"
                        className="w-full h-10 sm:h-11 pl-10 pr-10 rounded-xl border border-slate-700/80 bg-[#070b14]/90 text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25 focus:bg-[#080e1d]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
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
                    <div className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-950/40 p-2 text-xs text-rose-300 animate-in fade-in">
                      <AlertCircle className="size-4 shrink-0 mt-0.5 text-rose-400" />
                      <span className="leading-relaxed">{error}</span>
                    </div>
                  )}

                  {/* Submit Primary CTA */}
                  <button
                    type="submit"
                    disabled={loading || !isConfigured}
                    className="group flex w-full h-10 sm:h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all duration-200 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
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
              )}

              {/* ------------------------------------------------------------- */}
              {/* MODE 2: Forgot Password Form                                  */}
              {/* ------------------------------------------------------------- */}
              {authMode === "forgot" && (
                <div className="space-y-4">
                  {forgotSuccess ? (
                    <div className="space-y-4 animate-in fade-in">
                      <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-3.5 text-xs text-emerald-300 space-y-2">
                        <div className="flex items-center gap-2 font-semibold text-emerald-400 text-sm">
                          <ShieldCheck className="size-4" />
                          <span>Recovery Email Sent</span>
                        </div>
                        <p className="leading-relaxed text-slate-300">
                          We've sent a password recovery link to{" "}
                          <strong className="text-white font-mono">{email}</strong>.
                          Please check your inbox (and spam folder) and open the link to set a new password.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setForgotSuccess(false);
                          setAuthMode("signin");
                        }}
                        className="w-full h-10 sm:h-11 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700/80 text-sm font-semibold text-white transition-colors cursor-pointer"
                      >
                        Return to Sign In
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleForgotPasswordSubmit} className="space-y-3.5 sm:space-y-4">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-300">
                          Registered Institutional Email
                        </label>
                        <div className="relative">
                          <Mail className="size-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="email"
                            required
                            autoFocus
                            value={email}
                            autoComplete="email"
                            onFocus={() => setFocusedField("email")}
                            onBlur={() => setFocusedField(null)}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              setIsTyping(true);
                              setTimeout(() => setIsTyping(false), 800);
                            }}
                            placeholder="student@college.edu"
                            className="w-full h-10 sm:h-11 pl-10 pr-3.5 rounded-xl border border-slate-700/80 bg-[#070b14]/90 text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25 focus:bg-[#080e1d]"
                          />
                        </div>
                      </div>

                      {/* Inline Error Message */}
                      {error && (
                        <div className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-950/40 p-2 text-xs text-rose-300 animate-in fade-in">
                          <AlertCircle className="size-4 shrink-0 mt-0.5 text-rose-400" />
                          <span className="leading-relaxed">{error}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loading || !isConfigured}
                        className="flex w-full h-10 sm:h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all duration-200 disabled:opacity-50 cursor-pointer"
                      >
                        {loading ? (
                          <RefreshCw className="size-4 animate-spin" />
                        ) : (
                          <Mail className="size-4" />
                        )}
                        {loading ? "Sending link..." : "Send Recovery Link"}
                      </button>

                      <div className="text-center pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setError("");
                            setAuthMode("signin");
                          }}
                          className="text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                        >
                          ← Back to Sign In
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* MODE 3: Set New Password Form (Recovery Session)             */}
              {/* ------------------------------------------------------------- */}
              {authMode === "reset" && (
                <form onSubmit={handleUpdatePasswordSubmit} className="space-y-3.5 sm:space-y-4">
                  {/* New Password */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-300">
                      New Password (min 6 characters)
                    </label>
                    <div className="relative">
                      <Lock className="size-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        required
                        autoFocus
                        value={newPassword}
                        autoComplete="new-password"
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => setFocusedField(null)}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setIsTyping(true);
                          setTimeout(() => setIsTyping(false), 800);
                        }}
                        placeholder="••••••••••••"
                        className="w-full h-10 sm:h-11 pl-10 pr-10 rounded-xl border border-slate-700/80 bg-[#070b14]/90 text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25 focus:bg-[#080e1d]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
                        aria-label={showNewPassword ? "Hide password" : "Show password"}
                      >
                        {showNewPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-300">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="size-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        autoComplete="new-password"
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => setFocusedField(null)}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setIsTyping(true);
                          setTimeout(() => setIsTyping(false), 800);
                        }}
                        placeholder="••••••••••••"
                        className="w-full h-10 sm:h-11 pl-10 pr-10 rounded-xl border border-slate-700/80 bg-[#070b14]/90 text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25 focus:bg-[#080e1d]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Inline Error Message */}
                  {error && (
                    <div className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-950/40 p-2 text-xs text-rose-300 animate-in fade-in">
                      <AlertCircle className="size-4 shrink-0 mt-0.5 text-rose-400" />
                      <span className="leading-relaxed">{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !isConfigured}
                    className="flex w-full h-10 sm:h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all duration-200 disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <RefreshCw className="size-4 animate-spin" />
                    ) : (
                      <ShieldCheck className="size-4" />
                    )}
                    {loading ? "Updating password..." : "Update Password"}
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setError("");
                        setAuthMode("signin");
                      }}
                      className="text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    >
                      ← Back to Sign In
                    </button>
                  </div>
                </form>
              )}

              {/* Supporting Institutional Provisioning Notice */}
              <div className="pt-1 text-center text-xs text-slate-400">
                <span className="inline-flex items-center gap-1.5 text-[11px]">
                  <ShieldCheck className="size-3.5 text-emerald-400 shrink-0" />
                  <span>Student accounts provisioned by institution administrators.</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Toaster position="bottom-right" theme="dark" />
    </div>
  );
}
