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
// Interactive Realistic Panda Component
// Reacts to focus, mouse movement, password hiding, and peeking
// ---------------------------------------------------------------------------
interface InteractivePandaProps {
  focusedField: "email" | "password" | null;
  isTyping: boolean;
  showPassword: boolean;
  mousePos: { x: number; y: number };
}

function InteractivePanda({
  focusedField,
  isTyping,
  showPassword,
  mousePos,
}: InteractivePandaProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const [blink, setBlink] = useState(false);

  // Natural blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 160);
    }, 4000 + Math.random() * 2500);

    return () => clearInterval(blinkInterval);
  }, []);

  // Pupil positioning
  useEffect(() => {
    if (focusedField === "password") {
      if (showPassword) {
        // Peeking pupil offset
        setPupilOffset({ x: 4, y: 2 });
      } else {
        // Looking up shyly under paws
        setPupilOffset({ x: 0, y: -2 });
      }
      return;
    }

    if (focusedField === "email") {
      // Look down and slightly forward toward the email input
      setPupilOffset({ x: 4, y: 5 });
      return;
    }

    // Follow mouse when idle
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = mousePos.x - centerX;
      const dy = mousePos.y - centerY;
      const angle = Math.atan2(dy, dx);
      const dist = Math.min(5, Math.hypot(dx, dy) / 60);

      setPupilOffset({
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
      });
    }
  }, [mousePos, focusedField, showPassword]);

  const isCoveringEyes = focusedField === "password" && !showPassword;
  const isPeeking = focusedField === "password" && showPassword;
  const isLookingDown = focusedField === "email";

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[220px] sm:h-[250px] lg:h-[270px] flex items-center justify-center select-none"
    >
      <svg
        viewBox="0 0 340 300"
        className="w-full h-full max-w-[320px] overflow-visible drop-shadow-xl transition-transform duration-300"
      >
        <defs>
          {/* Subtle 3D gradient fills for panda body */}
          <radialGradient id="pandaFurGrad" cx="45%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="85%" stopColor="#f3f4f6" />
            <stop offset="100%" stopColor="#e5e7eb" />
          </radialGradient>

          <linearGradient id="pandaDarkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#374151" />
            <stop offset="100%" stopColor="#1f2937" />
          </linearGradient>

          <radialGradient id="pawPadGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#fba3b1" />
          </radialGradient>

          {/* Soft contact shadow filter */}
          <filter id="shadowGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Soft ground shadow underneath panda */}
        <ellipse
          cx="170"
          cy="285"
          rx="110"
          ry="12"
          fill="#cbd5e1"
          opacity="0.6"
        />

        {/* PANDA BODY & TORSO */}
        <g
          className="transition-transform duration-500 ease-out origin-bottom"
          style={{
            transform: isCoveringEyes
              ? "translateY(4px) scale(0.98)"
              : isLookingDown
              ? "translateY(2px)"
              : "translateY(0)",
          }}
        >
          {/* Back shoulders / upper body */}
          <path
            d="M 90 280 C 85 210, 110 185, 170 185 C 230 185, 255 210, 250 280 Z"
            fill="url(#pandaDarkGrad)"
          />
          {/* White chest bib */}
          <path
            d="M 125 280 C 120 225, 140 210, 170 210 C 200 210, 220 225, 215 280 Z"
            fill="url(#pandaFurGrad)"
          />
        </g>

        {/* PANDA HEAD GROUP */}
        <g
          className="transition-transform duration-500 ease-out origin-center"
          style={{
            transform: isCoveringEyes
              ? "translateY(3px) rotate(-1deg)"
              : isLookingDown
              ? "translateY(4px) rotate(1deg)"
              : "translateY(0) rotate(0)",
          }}
        >
          {/* EARS */}
          {/* Left Ear */}
          <g
            className="transition-transform duration-300 origin-[95px_85px]"
            style={{
              transform: isCoveringEyes
                ? "rotate(-8deg)"
                : isTyping
                ? "rotate(-4deg)"
                : "rotate(0deg)",
            }}
          >
            <ellipse
              cx="95"
              cy="80"
              rx="28"
              ry="26"
              fill="url(#pandaDarkGrad)"
              transform="rotate(-25 95 80)"
            />
            {/* Inner Ear Tint */}
            <ellipse
              cx="95"
              cy="80"
              rx="18"
              ry="16"
              fill="#111827"
              opacity="0.4"
              transform="rotate(-25 95 80)"
            />
          </g>

          {/* Right Ear */}
          <g
            className="transition-transform duration-300 origin-[245px_85px]"
            style={{
              transform: isCoveringEyes
                ? "rotate(8deg)"
                : isTyping
                ? "rotate(4deg)"
                : "rotate(0deg)",
            }}
          >
            <ellipse
              cx="245"
              cy="80"
              rx="28"
              ry="26"
              fill="url(#pandaDarkGrad)"
              transform="rotate(25 245 80)"
            />
            {/* Inner Ear Tint */}
            <ellipse
              cx="245"
              cy="80"
              rx="18"
              ry="16"
              fill="#111827"
              opacity="0.4"
              transform="rotate(25 245 80)"
            />
          </g>

          {/* HEAD BASE */}
          <ellipse
            cx="170"
            cy="145"
            rx="84"
            ry="75"
            fill="url(#pandaFurGrad)"
            stroke="#e2e8f0"
            strokeWidth="1.5"
          />

          {/* CUTE BLUSH CHEEKS */}
          <ellipse
            cx="106"
            cy="168"
            rx="14"
            ry="9"
            fill="#ff8da1"
            opacity="0.65"
          />
          <ellipse
            cx="234"
            cy="168"
            rx="14"
            ry="9"
            fill="#ff8da1"
            opacity="0.65"
          />

          {/* EYE PATCHES */}
          {/* Left Eye Patch */}
          <ellipse
            cx="124"
            cy="138"
            rx="24"
            ry="29"
            fill="url(#pandaDarkGrad)"
            transform="rotate(-22 124 138)"
          />
          {/* Right Eye Patch */}
          <ellipse
            cx="216"
            cy="138"
            rx="24"
            ry="29"
            fill="url(#pandaDarkGrad)"
            transform="rotate(22 216 138)"
          />

          {/* EYES & PUPILS */}
          {/* Left Eye */}
          <g>
            <ellipse
              cx="126"
              cy="136"
              rx="10"
              ry={blink ? 1 : 11}
              fill="#ffffff"
            />
            {!blink && (
              <>
                <circle
                  cx={126 + pupilOffset.x}
                  cy={136 + pupilOffset.y}
                  r="5"
                  fill="#0f172a"
                />
                {/* Specular highlights */}
                <circle
                  cx={126 + pupilOffset.x + 1.6}
                  cy={136 + pupilOffset.y - 1.6}
                  r="1.8"
                  fill="#ffffff"
                />
                <circle
                  cx={126 + pupilOffset.x - 1.2}
                  cy={136 + pupilOffset.y + 1.2}
                  r="0.8"
                  fill="#ffffff"
                  opacity="0.8"
                />
              </>
            )}
          </g>

          {/* Right Eye */}
          <g>
            <ellipse
              cx="214"
              cy="136"
              rx="10"
              ry={blink ? 1 : 11}
              fill="#ffffff"
            />
            {!blink && (
              <>
                <circle
                  cx={214 + pupilOffset.x}
                  cy={136 + pupilOffset.y}
                  r="5"
                  fill="#0f172a"
                />
                {/* Specular highlights */}
                <circle
                  cx={214 + pupilOffset.x + 1.6}
                  cy={136 + pupilOffset.y - 1.6}
                  r="1.8"
                  fill="#ffffff"
                />
                <circle
                  cx={214 + pupilOffset.x - 1.2}
                  cy={136 + pupilOffset.y + 1.2}
                  r="0.8"
                  fill="#ffffff"
                  opacity="0.8"
                />
              </>
            )}
          </g>

          {/* SNOUT / NOSE / MOUTH */}
          {/* White Snout Base */}
          <ellipse
            cx="170"
            cy="165"
            rx="24"
            ry="18"
            fill="#ffffff"
            opacity="0.95"
          />

          {/* Cute Nose */}
          <path
            d="M 161 157 C 161 154, 179 154, 179 157 C 179 163, 172 167, 170 167 C 168 167, 161 163, 161 157 Z"
            fill="#1e293b"
          />
          {/* Nose shine */}
          <ellipse cx="167" cy="157" rx="3" ry="1.2" fill="#ffffff" opacity="0.6" />

          {/* Mouth */}
          <path
            d="M 170 167 L 170 172"
            stroke="#1e293b"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M 160 172 Q 165 178 170 172 Q 175 178 180 172"
            stroke="#1e293b"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* ----------------------------------------------------------- */}
        {/* INTERACTIVE PAWS / HANDS (COVERS EYES ON PASSWORD)          */}
        {/* ----------------------------------------------------------- */}

        {/* LEFT PAW */}
        <g
          className="transition-all duration-500 ease-[cubic-bezier(0.34,1.4,0.64,1)] origin-[80px_230px]"
          style={{
            transform: isCoveringEyes
              ? "translate(42px, -82px) rotate(38deg)"
              : isPeeking
              ? "translate(30px, -68px) rotate(22deg)"
              : isLookingDown
              ? "translate(4px, -12px) rotate(-4deg)"
              : "translate(0px, 0px) rotate(0deg)",
          }}
        >
          {/* Arm & Paw Shape */}
          <ellipse
            cx="78"
            cy="226"
            rx="26"
            ry="34"
            fill="url(#pandaDarkGrad)"
            stroke="#1f2937"
            strokeWidth="1.5"
            transform="rotate(-15 78 226)"
          />
          {/* Paw Pads (Pink pads visible when covering eyes/up) */}
          <g
            className="transition-opacity duration-300"
            style={{ opacity: isCoveringEyes || isPeeking ? 1 : 0.85 }}
          >
            {/* Main Central Pad */}
            <ellipse
              cx="80"
              cy="232"
              rx="13"
              ry="11"
              fill="url(#pawPadGrad)"
            />
            {/* Toe Beans */}
            <circle cx="68" cy="216" r="4.2" fill="url(#pawPadGrad)" />
            <circle cx="78" cy="212" r="4.5" fill="url(#pawPadGrad)" />
            <circle cx="89" cy="216" r="4.2" fill="url(#pawPadGrad)" />
          </g>
        </g>

        {/* RIGHT PAW */}
        <g
          className="transition-all duration-500 ease-[cubic-bezier(0.34,1.4,0.64,1)] origin-[260px_230px]"
          style={{
            transform: isCoveringEyes
              ? "translate(-42px, -82px) rotate(-38deg)"
              : isPeeking
              ? "translate(-12px, -45px) rotate(-15deg)"
              : isLookingDown
              ? "translate(-4px, -12px) rotate(4deg)"
              : "translate(0px, 0px) rotate(0deg)",
          }}
        >
          {/* Arm & Paw Shape */}
          <ellipse
            cx="262"
            cy="226"
            rx="26"
            ry="34"
            fill="url(#pandaDarkGrad)"
            stroke="#1f2937"
            strokeWidth="1.5"
            transform="rotate(15 262 226)"
          />
          {/* Paw Pads */}
          <g
            className="transition-opacity duration-300"
            style={{ opacity: isCoveringEyes || isPeeking ? 1 : 0.85 }}
          >
            {/* Main Central Pad */}
            <ellipse
              cx="260"
              cy="232"
              rx="13"
              ry="11"
              fill="url(#pawPadGrad)"
            />
            {/* Toe Beans */}
            <circle cx="249" cy="216" r="4.2" fill="url(#pawPadGrad)" />
            <circle cx="260" cy="212" r="4.5" fill="url(#pawPadGrad)" />
            <circle cx="271" cy="216" r="4.2" fill="url(#pawPadGrad)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Login Page Component (Light Theme & Refined Modern Layout)
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

  // Field focus states for panda interaction
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
    // Light-Themed Clean Master Container with soft ambient accents
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-100/80 text-slate-800 flex flex-col justify-between p-4 sm:p-6 lg:p-8 select-none relative overflow-x-hidden font-sans">
      {/* Decorative ambient subtle pastel gradients in the background */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-100/60 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-teal-100/50 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 rounded-full bg-rose-100/40 blur-[120px] pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between pb-3">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <span className="grid size-9 sm:size-10 place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-500/20">
            <Hexagon className="size-5 stroke-[2.2]" />
          </span>
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
              SantoGe
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
              Talent Cloud
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Placement Accelerator Synchronized</span>
        </div>
      </header>

      {/* Main Master Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center py-4 sm:py-6">
        <div className="w-full max-w-4xl lg:max-w-5xl rounded-3xl border border-slate-200/90 bg-white/95 backdrop-blur-xl shadow-2xl shadow-slate-200/80 overflow-hidden grid lg:grid-cols-12 transition-all duration-300">
          
          {/* Left Column: Interactive Panda Mascot Stage */}
          <div className="lg:col-span-6 bg-gradient-to-b from-slate-50/90 via-slate-100/60 to-slate-50 p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200/80 relative overflow-hidden">
            {/* Subtle radial backdrop accent */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full bg-indigo-100/40 blur-3xl pointer-events-none" />

            {/* Top Badge */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
                <Sparkles className="size-3.5 text-emerald-600" /> Placement Accelerator
              </span>
              <span className="text-[11px] font-mono font-medium text-slate-600 tracking-wider">
                90-DAY COHORT
              </span>
            </div>

            {/* Realistic Interactive Panda Stage */}
            <div className="my-auto py-4 sm:py-6 flex items-center justify-center">
              <InteractivePanda
                focusedField={focusedField}
                isTyping={isTyping}
                showPassword={showPassword}
                mousePos={mousePos}
              />
            </div>

            {/* Bottom Mascot Caption */}
            <div className="relative z-10 text-center space-y-1">
              <p className="text-xs font-semibold text-slate-800 tracking-wide">
                {focusedField === "password"
                  ? showPassword
                    ? "👀 Panda is peeking while password is visible!"
                    : "🙈 Panda is covering its eyes to keep your password safe!"
                  : focusedField === "email"
                  ? "✍️ Panda is watching your institutional email entry..."
                  : "👋 Welcome! Move your cursor around to interact."}
              </p>
              <p className="text-[11px] text-slate-600">
                15 Technical Tracks · 90-Day Evidence-Based Mastery
              </p>
            </div>
          </div>

          {/* Right Column: Light Modern Auth Form Area */}
          <div className="lg:col-span-6 p-6 sm:p-8 lg:p-10 flex flex-col justify-center bg-white relative">
            <div className="w-full max-w-[360px] mx-auto space-y-5">
              
              {/* Form Title & Subtitle */}
              <div className="space-y-1.5">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  {authMode === "signin" && "Welcome back"}
                  {authMode === "forgot" && "Reset Password"}
                  {authMode === "reset" && "Set New Password"}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {authMode === "signin" && "Sign in to access your talent dashboard and cohort modules."}
                  {authMode === "forgot" &&
                    "Enter your registered institutional email to receive a recovery link."}
                  {authMode === "reset" &&
                    "Create a strong, new password for your SantoGe account."}
                </p>
              </div>

              {/* Reset Success Alert */}
              {resetSuccess && authMode === "signin" && (
                <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-xs text-emerald-800 shadow-sm animate-in fade-in">
                  <ShieldCheck className="size-4 shrink-0 mt-0.5 text-emerald-600" />
                  <p>Password updated successfully. Please sign in with your new password.</p>
                </div>
              )}

              {/* Supabase backend warning if unconfigured */}
              {!isConfigured && (
                <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50/90 p-3.5 text-xs text-amber-800 shadow-sm animate-in fade-in">
                  <AlertCircle className="size-4 shrink-0 mt-0.5 text-amber-600" />
                  <p>
                    Supabase backend is not configured. Set <code className="font-mono text-[11px] font-bold">VITE_SUPABASE_URL</code> and <code className="font-mono text-[11px] font-bold">VITE_SUPABASE_PUBLISHABLE_KEY</code> in .env
                  </p>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* MODE 1: Standard Sign In Form                                 */}
              {/* ------------------------------------------------------------- */}
              {authMode === "signin" && (
                <form onSubmit={handleSupabaseSubmit} className="space-y-4">
                  {/* Institutional Email Field */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
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
                          setTimeout(() => setIsTyping(false), 700);
                        }}
                        placeholder="student@college.edu or admin@domain.com"
                        className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-300 bg-slate-50/60 text-sm text-slate-900 placeholder:text-slate-500 outline-none transition-all duration-200 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                      />
                    </div>
                  </div>

                  {/* Password Field with Reveal Toggle & Forgot Password Link */}
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-700">Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          setError("");
                          setForgotSuccess(false);
                          setAuthMode("forgot");
                        }}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
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
                          setTimeout(() => setIsTyping(false), 700);
                        }}
                        placeholder="••••••••••••"
                        className="w-full h-11 pl-10 pr-10 rounded-xl border border-slate-300 bg-slate-50/60 text-sm text-slate-900 placeholder:text-slate-500 outline-none transition-all duration-200 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 p-1 rounded-md transition-colors cursor-pointer"
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
                    <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700 shadow-sm animate-in fade-in">
                      <AlertCircle className="size-4 shrink-0 mt-0.5 text-rose-600" />
                      <span className="leading-relaxed font-medium">{error}</span>
                    </div>
                  )}

                  {/* Submit CTA */}
                  <button
                    type="submit"
                    disabled={loading || !isConfigured}
                    className="group flex w-full h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all duration-200 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <RefreshCw className="size-4 animate-spin" />
                    ) : (
                      <LogIn className="size-4" />
                    )}
                    {loading ? "Signing in..." : "Sign In to Talent Cloud"}
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
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-xs text-emerald-900 space-y-2">
                        <div className="flex items-center gap-2 font-bold text-emerald-800 text-sm">
                          <ShieldCheck className="size-4 text-emerald-600" />
                          <span>Recovery Email Sent</span>
                        </div>
                        <p className="leading-relaxed text-slate-600">
                          We've sent a recovery link to{" "}
                          <strong className="text-slate-900 font-mono">{email}</strong>.
                          Please check your inbox (and spam folder) and open the link to set a new password.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setForgotSuccess(false);
                          setAuthMode("signin");
                        }}
                        className="w-full h-11 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-sm font-semibold text-slate-800 transition-colors cursor-pointer"
                      >
                        Return to Sign In
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">
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
                              setTimeout(() => setIsTyping(false), 700);
                            }}
                            placeholder="student@college.edu"
                            className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-300 bg-slate-50/60 text-sm text-slate-900 placeholder:text-slate-500 outline-none transition-all duration-200 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                          />
                        </div>
                      </div>

                      {/* Inline Error Message */}
                      {error && (
                        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700 shadow-sm animate-in fade-in">
                          <AlertCircle className="size-4 shrink-0 mt-0.5 text-rose-600" />
                          <span className="leading-relaxed font-medium">{error}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loading || !isConfigured}
                        className="flex w-full h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all duration-200 disabled:opacity-50 cursor-pointer"
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
                          className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
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
                <form onSubmit={handleUpdatePasswordSubmit} className="space-y-4">
                  {/* New Password */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
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
                          setTimeout(() => setIsTyping(false), 700);
                        }}
                        placeholder="••••••••••••"
                        className="w-full h-11 pl-10 pr-10 rounded-xl border border-slate-300 bg-slate-50/60 text-sm text-slate-900 placeholder:text-slate-500 outline-none transition-all duration-200 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 p-1 rounded-md transition-colors cursor-pointer"
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
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
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
                          setTimeout(() => setIsTyping(false), 700);
                        }}
                        placeholder="••••••••••••"
                        className="w-full h-11 pl-10 pr-10 rounded-xl border border-slate-300 bg-slate-50/60 text-sm text-slate-900 placeholder:text-slate-500 outline-none transition-all duration-200 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 p-1 rounded-md transition-colors cursor-pointer"
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
                    <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700 shadow-sm animate-in fade-in">
                      <AlertCircle className="size-4 shrink-0 mt-0.5 text-rose-600" />
                      <span className="leading-relaxed font-medium">{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !isConfigured}
                    className="flex w-full h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all duration-200 disabled:opacity-50 cursor-pointer"
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
                      className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                    >
                      ← Back to Sign In
                    </button>
                  </div>
                </form>
              )}

              {/* Supporting Institutional Provisioning Notice */}
              <div className="pt-2 text-center text-xs text-slate-600 border-t border-slate-100">
                <span className="inline-flex items-center gap-1.5 text-[11px]">
                  <ShieldCheck className="size-3.5 text-emerald-600 shrink-0" />
                  <span>Student accounts provisioned by institutional administrators.</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between pt-2 text-[11px] text-slate-600">
        <span>© {new Date().getFullYear()} SantoGe Talent Cloud</span>
        <span>Secure Institutional Authentication</span>
      </footer>

      <Toaster position="bottom-right" theme="light" />
    </div>
  );
}
