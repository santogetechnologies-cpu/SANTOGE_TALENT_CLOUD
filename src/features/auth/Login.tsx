import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getRoleDashboardPath } from '../../permissions/guards';
import {
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Building2,
  Terminal,
  Award,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  // Ensure input fields are completely cleared and reset on every mount/logout
  useEffect(() => {
    setEmail('');
    setPassword('');
    setErrorMessage(null);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const loggedUser = await login(email, password);
      if (loggedUser) {
        const dest = getRoleDashboardPath(loggedUser.role);
        navigate(dest);
      } else {
        setErrorMessage('Authentication failed. Please verify your credentials.');
      }
    } catch (err: any) {
      console.error('Auth submit error:', err);
      const msg = err.message || 'Authentication failed. Please check your credentials and connection.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center text-slate-100 relative overflow-hidden font-sans">
      {/* Ambient background glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* Left Column: Higher Education Platform Showcase */}
          <div className="lg:col-span-7 space-y-8 text-left">
            {/* Brand Header */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-2xl shadow-glow-brand ring-1 ring-white/20">
                  S
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      SantoGe
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold uppercase px-2 py-0.5 rounded-md bg-brand-500/20 text-brand-400 border border-brand-500/30">
                      TALENT CLOUD
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono tracking-wide">
                    The Unified Campus → Career Operating System
                  </p>
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight pt-2">
                Empowering Universities, Students & Recruiters with{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-indigo-300 to-purple-400">
                  Algorithmic Talent Intelligence
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
                A mission-driven higher education operating ecosystem connecting academic curricula, live industry simulators, automated mentorship, and campus hiring pipelines.
              </p>
            </div>

            {/* Three Institutional Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-sm space-y-2 hover:border-brand-500/40 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Campus Talent Intel</h3>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Algorithmic 1,000-Point Scoring & Real-time Industry Readiness Index (IRI).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-sm space-y-2 hover:border-indigo-500/40 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Terminal className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">15+ Career Tracks</h3>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Interactive browser simulators for FastAPI, PostgreSQL, AWS & Docker.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-sm space-y-2 hover:border-purple-500/40 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Placement Network</h3>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Direct campus drives, Kanban pipelines, and automated offer management.
                </p>
              </div>
            </div>

            {/* Platform Status & Security Pills */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-full border border-slate-800 font-mono text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Supabase Cloud Operational</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-full border border-slate-800 font-mono text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
                <span>Role-Based Multi-Tenant Isolation</span>
              </div>
            </div>
          </div>

          {/* Right Column: Sleek Institutional Login Portal */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto">
            <div className="bg-white text-slate-900 p-8 sm:p-10 rounded-3xl shadow-2xl border border-slate-200/80 relative">

              {/* Card Header */}
              <div className="space-y-1 mb-6 text-left">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full uppercase tracking-wider mb-2">
                  <Building2 className="w-3.5 h-3.5" /> Institutional Portal
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Sign In to Your Account
                </h2>
                <p className="text-xs text-slate-500">
                  Access your unified student, mentor, faculty, or administrator console.
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4 text-left" autoComplete="off">
                {/* Email Input */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Authorized Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      name="santoge_academic_email"
                      autoComplete="off"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Email Address"
                      required
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="santoge_security_key"
                      autoComplete="new-password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="text-xs text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200 font-semibold flex items-start gap-2 animate-in fade-in duration-200">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Submit Action */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full mt-3 font-bold shadow-lg shadow-brand-600/20"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Sign In to Operating System
                </Button>
              </form>

              {/* Card Footer */}
              <div className="mt-6 pt-4 border-t border-slate-100 text-center space-y-2">
                <p className="text-[11px] text-slate-400">
                  Need institutional access or password reset?
                </p>
                <p className="text-[11px] text-slate-600 font-semibold">
                  Contact your College Placement Cell or Platform Super Admin.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
