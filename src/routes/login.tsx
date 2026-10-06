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
// Interactive Realistic Panda Mascot & 3D Cloud Tech Scene
// - Large soft lavender circular glow behind panda
// - Blue-purple abstract flowing shapes along the bottom
// - Floating gradient spheres / 3D orbs
// - Floating puffy cloud (cloud technology)
// - Paper airplane with dotted flight trajectory (career progress)
// - Soft elliptical ground shadow
// - Interactive eye-tracking & paws that cover eyes during password entry
// ---------------------------------------------------------------------------
interface InteractivePandaSceneProps {
  focusedField: "email" | "password" | null;
  isTyping: boolean;
  showPassword: boolean;
  mousePos: { x: number; y: number };
}

function InteractivePandaScene({
  focusedField,
  isTyping,
  showPassword,
  mousePos,
}: InteractivePandaSceneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const [blink, setBlink] = useState(false);

  // Natural blinking effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 160);
    }, 3800 + Math.random() * 2200);

    return () => clearInterval(blinkInterval);
  }, []);

  // Pupil and eye tracking logic
  useEffect(() => {
    if (focusedField === "password") {
      if (showPassword) {
        // Peeking pupil offset
        setPupilOffset({ x: 4, y: 2 });
      } else {
        // Shy gaze under paws
        setPupilOffset({ x: 0, y: -2 });
      }
      return;
    }

    if (focusedField === "email") {
      // Look down-right intently towards email input field
      setPupilOffset({ x: 5, y: 5 });
      return;
    }

    // Follow mouse smoothly when idle
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = mousePos.x - centerX;
      const dy = mousePos.y - centerY;
      const angle = Math.atan2(dy, dx);
      const dist = Math.min(5, Math.hypot(dx, dy) / 55);

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
      className="relative w-full max-w-[460px] lg:max-w-[490px] aspect-[1/0.84] flex items-center justify-center select-none"
    >
      <svg
        viewBox="0 0 540 450"
        className="w-full h-full overflow-visible drop-shadow-sm transition-transform duration-300"
      >
        <defs>
          {/* Lavender background glow */}
          <radialGradient id="lavenderGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#eef2ff" stopOpacity="0.95" />
            <stop offset="65%" stopColor="#e0e7ff" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#f5f3ff" stopOpacity="0.15" />
          </radialGradient>

          {/* Panda fur gradient */}
          <radialGradient id="furWhiteGrad" cx="45%" cy="38%" r="62%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="85%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </radialGradient>

          {/* Panda dark fur gradient */}
          <linearGradient id="darkFurGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="40%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Paw bean pink gradient */}
          <radialGradient id="pawPadPink" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="35%" stopColor="#fda4af" />
            <stop offset="100%" stopColor="#fb7185" />
          </radialGradient>

          {/* 3D Blue Sphere Gradient */}
          <radialGradient id="sphereBlueGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="45%" stopColor="#3b82f6" />
            <stop offset="90%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </radialGradient>

          {/* 3D Cyan Sphere Gradient */}
          <radialGradient id="sphereCyanGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#a5f3fc" />
            <stop offset="50%" stopColor="#38bdf8" />
            <stop offset="95%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </radialGradient>

          {/* Paper Airplane Gradient */}
          <linearGradient id="planeGrad" x1="0%" y1="0%" x2="100%" y2="80%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="60%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>

          {/* Flowing Organic Petal Gradients */}
          <linearGradient id="petalBlueViolet" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#4338ca" />
          </linearGradient>

          <linearGradient id="petalCyanBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="60%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>

          <linearGradient id="petalLightCyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>

          {/* Soft 3D Cloud Gradient */}
          <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="70%" stopColor="#e0e7ff" />
            <stop offset="100%" stopColor="#c7d2fe" />
          </linearGradient>

          {/* Drop Shadows */}
          <filter id="elementShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#1e293b" floodOpacity="0.12" />
          </filter>
        </defs>

        {/* ----------------------------------------------------------- */}
        {/* 1. LARGE SOFT LAVENDER CIRCULAR GLOW BEHIND PANDA           */}
        {/* ----------------------------------------------------------- */}
        <circle
          cx="270"
          cy="235"
          r="175"
          fill="url(#lavenderGlow)"
        />

        {/* ----------------------------------------------------------- */}
        {/* 2. DOTTED FLIGHT TRAIL & PAPER AIRPLANE (CAREER PROGRESS)   */}
        {/* ----------------------------------------------------------- */}
        <g>
          {/* Curved dashed flight trail */}
          <path
            d="M 125 155 Q 160 95 240 102"
            fill="none"
            stroke="#818cf8"
            strokeWidth="2.2"
            strokeDasharray="4 6"
            strokeLinecap="round"
            opacity="0.8"
          />
          {/* Paper airplane */}
          <g transform="translate(240, 92) rotate(18)">
            {/* Left wing */}
            <path
              d="M 0 0 L 26 -8 L 8 16 Z"
              fill="url(#planeGrad)"
            />
            {/* Right wing */}
            <path
              d="M 0 0 L 26 -8 L 20 6 Z"
              fill="#4f46e5"
            />
            {/* Bottom fold shadow */}
            <path
              d="M 0 0 L 8 16 L 12 6 Z"
              fill="#3730a3"
              opacity="0.8"
            />
          </g>
        </g>

        {/* ----------------------------------------------------------- */}
        {/* 3. FLOATING PUFFY CLOUD (CLOUD TECHNOLOGY)                  */}
        {/* ----------------------------------------------------------- */}
        <g transform="translate(370, 90)" filter="url(#elementShadow)">
          <path
            d="M 22 35 C 10 35, 0 26, 0 15 C 0 5, 9 -2, 20 0 C 26 -10, 42 -12, 50 -2 C 58 -8, 72 -4, 76 6 C 84 8, 90 16, 90 25 C 90 35, 80 35, 72 35 Z"
            fill="url(#cloudGrad)"
          />
          {/* Soft cloud highlight */}
          <ellipse cx="45" cy="5" rx="16" ry="6" fill="#ffffff" opacity="0.6" />
        </g>

        {/* ----------------------------------------------------------- */}
        {/* 4. FLOATING 3D SPHERES / ORBS                               */}
        {/* ----------------------------------------------------------- */}
        {/* Big Blue Sphere Top Left */}
        <g filter="url(#elementShadow)">
          <circle cx="118" cy="128" r="15" fill="url(#sphereBlueGrad)" />
          <ellipse cx="113" cy="123" rx="4" ry="2.5" fill="#ffffff" opacity="0.65" transform="rotate(-30 113 123)" />
        </g>
        {/* Small Cyan Sphere Left Edge */}
        <g filter="url(#elementShadow)">
          <circle cx="68" cy="255" r="8.5" fill="url(#sphereCyanGrad)" />
          <ellipse cx="65.5" cy="252.5" rx="2" ry="1.2" fill="#ffffff" opacity="0.65" transform="rotate(-30 65.5 252.5)" />
        </g>
        {/* Tiny Cyan Sphere Mid Right */}
        <g filter="url(#elementShadow)">
          <circle cx="460" cy="178" r="7.5" fill="url(#sphereCyanGrad)" />
        </g>

        {/* ----------------------------------------------------------- */}
        {/* 5. BLUE-PURPLE ABSTRACT FLOWING WAVES & PETALS AT BOTTOM    */}
        {/* ----------------------------------------------------------- */}
        {/* Left flowing layered petals */}
        <g opacity="0.95">
          {/* Deep violet-blue petal (back) */}
          <path
            d="M 120 330 C 65 310, 60 265, 80 260 C 105 255, 150 310, 160 340 Z"
            fill="url(#petalBlueViolet)"
          />
          {/* Mid Cyan-Blue petal */}
          <path
            d="M 140 345 C 80 345, 60 315, 75 300 C 95 280, 160 330, 175 355 Z"
            fill="url(#petalCyanBlue)"
          />
          {/* Foreground light cyan petal */}
          <path
            d="M 170 365 C 105 375, 50 360, 50 335 C 50 310, 120 335, 185 365 Z"
            fill="url(#petalLightCyan)"
          />
        </g>

        {/* Right flowing layered petals */}
        <g opacity="0.95">
          {/* Back cyan petal */}
          <path
            d="M 400 330 C 470 300, 485 240, 460 240 C 430 240, 375 305, 360 340 Z"
            fill="url(#petalLightCyan)"
          />
          {/* Mid blue petal */}
          <path
            d="M 380 348 C 455 330, 475 285, 455 280 C 430 270, 365 330, 350 355 Z"
            fill="url(#petalCyanBlue)"
          />
          {/* Foreground violet petal */}
          <path
            d="M 360 365 C 430 365, 475 335, 465 315 C 450 295, 380 345, 345 368 Z"
            fill="url(#petalBlueViolet)"
          />
        </g>

        {/* ----------------------------------------------------------- */}
        {/* 6. SOFT ELLIPTICAL GROUND SHADOW UNDER PANDA                */}
        {/* ----------------------------------------------------------- */}
        <ellipse
          cx="270"
          cy="368"
          rx="125"
          ry="14"
          fill="#cbd5e1"
          opacity="0.5"
        />

        {/* ----------------------------------------------------------- */}
        {/* 7. THE REALISTIC CUTE PANDA MASCOT                          */}
        {/* ----------------------------------------------------------- */}

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
          {/* Back body / shoulders */}
          <path
            d="M 185 360 C 180 280, 205 240, 270 240 C 335 240, 360 280, 355 360 Z"
            fill="url(#darkFurGrad)"
          />
          {/* White tummy bib */}
          <path
            d="M 218 360 C 215 295, 235 272, 270 272 C 305 272, 325 295, 322 360 Z"
            fill="url(#furWhiteGrad)"
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
            className="transition-transform duration-300 origin-[185px_195px]"
            style={{
              transform: isCoveringEyes
                ? "rotate(-8deg)"
                : isTyping
                ? "rotate(-4deg)"
                : "rotate(0deg)",
            }}
          >
            <ellipse
              cx="185"
              cy="192"
              rx="30"
              ry="28"
              fill="url(#darkFurGrad)"
              transform="rotate(-28 185 192)"
            />
            {/* Inner Ear shading */}
            <ellipse
              cx="185"
              cy="192"
              rx="18"
              ry="16"
              fill="#0f172a"
              opacity="0.45"
              transform="rotate(-28 185 192)"
            />
          </g>

          {/* Right Ear */}
          <g
            className="transition-transform duration-300 origin-[355px_195px]"
            style={{
              transform: isCoveringEyes
                ? "rotate(8deg)"
                : isTyping
                ? "rotate(4deg)"
                : "rotate(0deg)",
            }}
          >
            <ellipse
              cx="355"
              cy="192"
              rx="30"
              ry="28"
              fill="url(#darkFurGrad)"
              transform="rotate(28 355 192)"
            />
            {/* Inner Ear shading */}
            <ellipse
              cx="355"
              cy="192"
              rx="18"
              ry="16"
              fill="#0f172a"
              opacity="0.45"
              transform="rotate(28 355 192)"
            />
          </g>

          {/* HEAD BASE */}
          <ellipse
            cx="270"
            cy="260"
            rx="92"
            ry="82"
            fill="url(#furWhiteGrad)"
            stroke="#e2e8f0"
            strokeWidth="1.2"
          />

          {/* CUTE BLUSH CHEEKS */}
          <ellipse
            cx="200"
            cy="284"
            rx="16"
            ry="11"
            fill="#ff6b8b"
            opacity="0.75"
          />
          <ellipse
            cx="340"
            cy="284"
            rx="16"
            ry="11"
            fill="#ff6b8b"
            opacity="0.75"
          />

          {/* EYE PATCHES */}
          {/* Left Eye Patch */}
          <ellipse
            cx="220"
            cy="252"
            rx="27"
            ry="33"
            fill="url(#darkFurGrad)"
            transform="rotate(-22 220 252)"
          />
          {/* Right Eye Patch */}
          <ellipse
            cx="320"
            cy="252"
            rx="27"
            ry="33"
            fill="url(#darkFurGrad)"
            transform="rotate(22 320 252)"
          />

          {/* EYES & PUPILS */}
          {/* Left Eye */}
          <g>
            <ellipse
              cx="222"
              cy="250"
              rx="11.5"
              ry={blink ? 1.2 : 12.5}
              fill="#ffffff"
            />
            {!blink && (
              <>
                <circle
                  cx={222 + pupilOffset.x}
                  cy={250 + pupilOffset.y}
                  r="5.5"
                  fill="#0f172a"
                />
                {/* Specular Highlights */}
                <circle
                  cx={222 + pupilOffset.x + 1.8}
                  cy={250 + pupilOffset.y - 1.8}
                  r="2"
                  fill="#ffffff"
                />
                <circle
                  cx={222 + pupilOffset.x - 1.4}
                  cy={250 + pupilOffset.y + 1.4}
                  r="0.9"
                  fill="#ffffff"
                  opacity="0.85"
                />
              </>
            )}
          </g>

          {/* Right Eye */}
          <g>
            <ellipse
              cx="318"
              cy="250"
              rx="11.5"
              ry={blink ? 1.2 : 12.5}
              fill="#ffffff"
            />
            {!blink && (
              <>
                <circle
                  cx={318 + pupilOffset.x}
                  cy={250 + pupilOffset.y}
                  r="5.5"
                  fill="#0f172a"
                />
                {/* Specular Highlights */}
                <circle
                  cx={318 + pupilOffset.x + 1.8}
                  cy={250 + pupilOffset.y - 1.8}
                  r="2"
                  fill="#ffffff"
                />
                <circle
                  cx={318 + pupilOffset.x - 1.4}
                  cy={250 + pupilOffset.y + 1.4}
                  r="0.9"
                  fill="#ffffff"
                  opacity="0.85"
                />
              </>
            )}
          </g>

          {/* SNOUT / NOSE / MOUTH */}
          {/* Cute Nose */}
          <path
            d="M 261 270 C 261 267, 279 267, 279 270 C 279 276, 272 280, 270 280 C 268 280, 261 276, 261 270 Z"
            fill="#0f172a"
          />
          {/* Nose shine */}
          <ellipse cx="267" cy="270" rx="3.2" ry="1.2" fill="#ffffff" opacity="0.65" />

          {/* Smiling Mouth */}
          <path
            d="M 270 280 L 270 285"
            stroke="#0f172a"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M 259 285 Q 265 292 270 285 Q 275 292 281 285"
            stroke="#0f172a"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* ----------------------------------------------------------- */}
        {/* 8. INTERACTIVE PAWS (WAVING / COVERS EYES ON PASSWORD)      */}
        {/* ----------------------------------------------------------- */}

        {/* LEFT PAW (3 TOE BEANS + 1 MAIN PAD) */}
        <g
          className="transition-all duration-500 ease-[cubic-bezier(0.34,1.4,0.64,1)] origin-[175px_330px]"
          style={{
            transform: isCoveringEyes
              ? "translate(42px, -86px) rotate(38deg)"
              : isPeeking
              ? "translate(30px, -70px) rotate(22deg)"
              : isLookingDown
              ? "translate(4px, -8px) rotate(-4deg)"
              : "translate(0px, 0px) rotate(0deg)",
          }}
        >
          {/* Paw Base Shape */}
          <ellipse
            cx="172"
            cy="325"
            rx="28"
            ry="36"
            fill="url(#darkFurGrad)"
            stroke="#0f172a"
            strokeWidth="1.5"
            transform="rotate(-15 172 325)"
          />
          {/* Paw Pink Pads */}
          <g>
            {/* Main Central Pad */}
            <ellipse
              cx="174"
              cy="330"
              rx="14"
              ry="12"
              fill="url(#pawPadPink)"
            />
            {/* 3 Toe Beans */}
            <circle cx="161" cy="314" r="4.5" fill="url(#pawPadPink)" />
            <circle cx="172" cy="310" r="4.8" fill="url(#pawPadPink)" />
            <circle cx="184" cy="314" r="4.5" fill="url(#pawPadPink)" />
          </g>
        </g>

        {/* RIGHT PAW (3 TOE BEANS + 1 MAIN PAD) */}
        <g
          className="transition-all duration-500 ease-[cubic-bezier(0.34,1.4,0.64,1)] origin-[365px_330px]"
          style={{
            transform: isCoveringEyes
              ? "translate(-42px, -86px) rotate(-38deg)"
              : isPeeking
              ? "translate(-12px, -48px) rotate(-15deg)"
              : isLookingDown
              ? "translate(-4px, -8px) rotate(4deg)"
              : "translate(0px, 0px) rotate(0deg)",
          }}
        >
          {/* Paw Base Shape */}
          <ellipse
            cx="368"
            cy="325"
            rx="28"
            ry="36"
            fill="url(#darkFurGrad)"
            stroke="#0f172a"
            strokeWidth="1.5"
            transform="rotate(15 368 325)"
          />
          {/* Paw Pink Pads */}
          <g>
            {/* Main Central Pad */}
            <ellipse
              cx="366"
              cy="330"
              rx="14"
              ry="12"
              fill="url(#pawPadPink)"
            />
            {/* 3 Toe Beans */}
            <circle cx="356" cy="314" r="4.5" fill="url(#pawPadPink)" />
            <circle cx="368" cy="310" r="4.8" fill="url(#pawPadPink)" />
            <circle cx="379" cy="314" r="4.5" fill="url(#pawPadPink)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Login Page Component (Zero-Scroll Viewport Fitted Layout)
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
    // Clean, crisp white background fitted cleanly into viewport (zero scroll)
    <div className="h-screen max-h-screen w-full bg-white text-slate-800 flex flex-col justify-between px-4 sm:px-8 lg:px-12 py-3 sm:py-4 select-none relative overflow-hidden font-sans">
      
      {/* Decorative Top-Left Soft Blue-Lavender Corner Swoosh */}
      <div className="absolute -top-32 -left-32 w-[380px] h-[380px] pointer-events-none opacity-80">
        <svg viewBox="0 0 400 400" className="w-full h-full fill-none">
          <path
            d="M 0 0 C 180 0, 320 120, 340 300 C 350 380, 260 400, 0 400 Z"
            fill="url(#cornerTopLeftGrad)"
          />
          <defs>
            <linearGradient id="cornerTopLeftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#bfdbfe" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#c7d2fe" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Decorative Bottom-Right Soft Purple-Indigo Corner Swoosh */}
      <div className="absolute -bottom-32 -right-32 w-[420px] h-[420px] pointer-events-none opacity-80">
        <svg viewBox="0 0 450 450" className="w-full h-full fill-none">
          <path
            d="M 450 450 C 270 450, 130 330, 110 150 C 100 70, 190 50, 450 50 Z"
            fill="url(#cornerBottomRightGrad)"
          />
          <defs>
            <linearGradient id="cornerBottomRightGrad" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#c084fc" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-6xl mx-auto flex items-center justify-between shrink-0">
        {/* Brand identity: Rounded Blue Hexagon + SantoGe + Sky Blue Talent Cloud pill */}
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 sm:size-10 place-items-center rounded-xl bg-gradient-to-tr from-[#3b82f6] to-[#4338ca] text-white shadow-md shadow-indigo-500/25">
            <Hexagon className="size-5 stroke-[2.4]" />
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#0f172a]">
              SantoGe
            </span>
            <span className="text-[11px] sm:text-xs font-semibold text-[#2563eb] bg-[#e0f2fe] px-2.5 py-0.5 rounded-full border border-[#bae6fd]">
              Talent Cloud
            </span>
          </div>
        </div>
      </header>

      {/* Main Split Layout Container (Viewport Centered, Minimized Height) */}
      <main className="relative z-10 flex-1 min-h-0 flex items-center justify-center my-auto py-1">
        <div className="w-full max-w-6xl grid lg:grid-cols-12 items-center gap-4 lg:gap-10">
          
          {/* Left Column: 3D Animated Realistic Panda Mascot Scene */}
          <div className="lg:col-span-6 flex items-center justify-center relative">
            <InteractivePandaScene
              focusedField={focusedField}
              isTyping={isTyping}
              showPassword={showPassword}
              mousePos={mousePos}
            />
          </div>

          {/* Right Column: Clean, Crisp Form Area */}
          <div className="lg:col-span-6 flex justify-center lg:justify-start">
            <div className="w-full max-w-[420px] space-y-4 sm:space-y-5">
              
              {/* Heading: "Welcome back" */}
              <div className="space-y-1 sm:space-y-1.5">
                <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-[#0f172a] leading-tight">
                  {authMode === "signin" && (
                    <>
                      Welcome <span className="text-[#4338ca]">back</span>
                    </>
                  )}
                  {authMode === "forgot" && (
                    <>
                      Reset <span className="text-[#4338ca]">Password</span>
                    </>
                  )}
                  {authMode === "reset" && (
                    <>
                      Set New <span className="text-[#4338ca]">Password</span>
                    </>
                  )}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
                  {authMode === "signin" && "Sign in to access your talent dashboard and cohort modules."}
                  {authMode === "forgot" &&
                    "Enter your registered institutional email to receive a recovery link."}
                  {authMode === "reset" &&
                    "Create a strong, new password for your SantoGe account."}
                </p>
              </div>

              {/* Reset Success Alert */}
              {resetSuccess && authMode === "signin" && (
                <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3 text-xs text-emerald-800 shadow-sm animate-in fade-in">
                  <ShieldCheck className="size-4 shrink-0 mt-0.5 text-emerald-600" />
                  <p>Password updated successfully. Please sign in with your new password.</p>
                </div>
              )}

              {/* Supabase backend warning if unconfigured */}
              {!isConfigured && (
                <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50/90 p-3 text-xs text-amber-800 shadow-sm animate-in fade-in">
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
                <form onSubmit={handleSupabaseSubmit} className="space-y-3.5 sm:space-y-4">
                  {/* Institutional Email Field */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Institutional Email
                    </label>
                    <div className="relative">
                      <Mail className="size-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                        placeholder="sneha@college.edu"
                        className="w-full h-11 sm:h-12 pl-11 pr-4 rounded-2xl border border-[#dbeafe] bg-[#f0f6ff]/70 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-[#4f46e5] focus:bg-white focus:ring-4 focus:ring-indigo-100"
                      />
                    </div>
                  </div>

                  {/* Password Field with Reveal Toggle & Forgot Password Link */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-700">Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          setError("");
                          setForgotSuccess(false);
                          setAuthMode("forgot");
                        }}
                        className="text-xs font-semibold text-[#4338ca] hover:text-[#3730a3] transition-colors cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="size-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                        className="w-full h-11 sm:h-12 pl-11 pr-11 rounded-2xl border border-[#dbeafe] bg-[#f0f6ff]/70 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-[#4f46e5] focus:bg-white focus:ring-4 focus:ring-indigo-100 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer"
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

                  {/* Submit CTA Button: "Sign In to Talent Cloud ->" */}
                  <button
                    type="submit"
                    disabled={loading || !isConfigured}
                    className="group flex w-full h-11 sm:h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#4f46e5] via-[#4338ca] to-[#3730a3] hover:from-[#4338ca] hover:to-[#312e81] text-sm sm:text-base font-bold text-white shadow-xl shadow-indigo-600/30 transition-all duration-200 active:scale-[0.99] disabled:opacity-50 cursor-pointer pt-0.5"
                  >
                    {loading ? (
                      <RefreshCw className="size-4 animate-spin" />
                    ) : (
                      <LogIn className="size-4" />
                    )}
                    {loading ? "Signing in..." : "Sign In to Talent Cloud"}
                    {!loading && (
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
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
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-3.5 text-xs text-emerald-900 space-y-2">
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
                        className="w-full h-11 sm:h-12 rounded-2xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-sm font-semibold text-slate-800 transition-colors cursor-pointer"
                      >
                        Return to Sign In
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleForgotPasswordSubmit} className="space-y-3.5 sm:space-y-4">
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          Registered Institutional Email
                        </label>
                        <div className="relative">
                          <Mail className="size-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                            className="w-full h-11 sm:h-12 pl-11 pr-4 rounded-2xl border border-[#dbeafe] bg-[#f0f6ff]/70 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-[#4f46e5] focus:bg-white focus:ring-4 focus:ring-indigo-100"
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
                        className="flex w-full h-11 sm:h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#4f46e5] to-[#4338ca] hover:from-[#4338ca] hover:to-[#3730a3] text-sm font-semibold text-white shadow-xl shadow-indigo-600/30 transition-all duration-200 disabled:opacity-50 cursor-pointer"
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
                          className="text-xs font-semibold text-[#4338ca] hover:text-[#3730a3] transition-colors cursor-pointer"
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
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      New Password (min 6 characters)
                    </label>
                    <div className="relative">
                      <Lock className="size-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                        className="w-full h-11 sm:h-12 pl-11 pr-11 rounded-2xl border border-[#dbeafe] bg-[#f0f6ff]/70 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-[#4f46e5] focus:bg-white focus:ring-4 focus:ring-indigo-100 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer"
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
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="size-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                        className="w-full h-11 sm:h-12 pl-11 pr-11 rounded-2xl border border-[#dbeafe] bg-[#f0f6ff]/70 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-[#4f46e5] focus:bg-white focus:ring-4 focus:ring-indigo-100 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer"
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
                    className="flex w-full h-11 sm:h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-sm font-semibold text-white shadow-xl shadow-emerald-600/30 transition-all duration-200 disabled:opacity-50 cursor-pointer"
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
                      className="text-xs font-semibold text-[#4338ca] hover:text-[#3730a3] transition-colors cursor-pointer"
                    >
                      ← Back to Sign In
                    </button>
                  </div>
                </form>
              )}

              {/* Supporting Institutional Provisioning Notice: Green Shield Check */}
              <div className="pt-1 flex items-center justify-start gap-2 text-xs text-slate-500">
                <ShieldCheck className="size-4 text-[#10b981] shrink-0 stroke-[2.2]" />
                <span>Student accounts provisioned by institutional administrators.</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Toaster position="bottom-right" theme="light" />
    </div>
  );
}
