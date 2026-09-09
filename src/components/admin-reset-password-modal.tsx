import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  KeyRound,
  X,
  Sparkles,
  Copy,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  Mail,
  ShieldCheck,
  GraduationCap,
} from "lucide-react";
import { supabaseAuth, getSupabaseConfig } from "@/lib/supabase";
import { resetLiveStudentPassword } from "@/lib/data/admin-data";

export interface ResetPasswordStudent {
  name?: string;
  email: string;
  rollNo?: string;
  batchId?: string;
  dept?: string;
  college?: string;
}

interface AdminResetPasswordModalProps {
  student: ResetPasswordStudent | null;
  isOpen: boolean;
  onClose: () => void;
}

function generateStrongPassword(): string {
  const words = ["SantoGe", "Talent", "Cloud", "Sprint", "Mastery", "Future", "Accelerate"];
  const word = words[Math.floor(Math.random() * words.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  const symbols = ["@", "#", "!", "$"];
  const sym = symbols[Math.floor(Math.random() * symbols.length)];
  return `${word}${sym}${num}`;
}

export function AdminResetPasswordModal({
  student,
  isOpen,
  onClose,
}: AdminResetPasswordModalProps) {
  const [emailInput, setEmailInput] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(true);
  const [sendSupabaseEmail, setSendSupabaseEmail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{
    email: string;
    password: string;
    supabaseMsg?: string;
  } | null>(null);

  const hasSupabase = Boolean(getSupabaseConfig().url && getSupabaseConfig().anonKey);

  useEffect(() => {
    if (isOpen) {
      if (student) {
        setEmailInput(student.email);
      } else {
        setEmailInput("");
      }
      setNewPassword(generateStrongPassword());
      setShowPassword(true);
      setSuccessInfo(null);
      setCopied(false);
    }
  }, [isOpen, student]);

  if (!isOpen) return null;

  const targetEmail = student?.email || emailInput.trim().toLowerCase();
  const matchedStudent = student;

  const handleGenerate = () => {
    setNewPassword(generateStrongPassword());
    setShowPassword(true);
    setCopied(false);
  };

  const handleCopy = () => {
    if (!newPassword) return;
    const creds = `Email: ${targetEmail}\nPassword: ${newPassword}`;
    navigator.clipboard.writeText(creds);
    setCopied(true);
    toast.success("Credentials copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!targetEmail) {
      toast.error("Please enter a valid student email");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      if (sendSupabaseEmail) {
        await supabaseAuth.resetPasswordForEmail(targetEmail);
      }

      const res = await resetLiveStudentPassword(targetEmail, newPassword);
      if (!res.ok) {
        toast.error(res.message || "Failed to reset student password in Supabase");
        setIsSubmitting(false);
        return;
      }

      setSuccessInfo({
        email: targetEmail,
        password: newPassword,
        supabaseMsg: res.message,
      });
      toast.success(`Password updated for ${matchedStudent?.name || targetEmail}`);
    } catch {
      toast.error("Failed to reset student password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-ink/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-line-soft bg-surface-elevated p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-line-soft pb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-brand-purple/15 text-brand-purple border border-brand-purple/30">
              <KeyRound className="size-4" />
            </span>
            <div>
              <h3 className="font-display text-base font-bold text-foreground">
                Reset Student Password
              </h3>
              <p className="text-xs text-copy-subtle">Platform Super Admin Security Control</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-copy-subtle hover:bg-surface-soft hover:text-foreground transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {successInfo ? (
          /* ================= SUCCESS STATE ================= */
          <div className="space-y-4 py-2">
            <div className="rounded-xl border border-brand-emerald/40 bg-brand-emerald/10 p-4 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-brand-emerald">
                <ShieldCheck className="size-4" />
                <span>Password Successfully Updated</span>
              </div>
              <p className="text-copy-subtle">
                The student can immediately log in with these new credentials via the portal.
              </p>
            </div>

            <div className="rounded-xl border border-line-soft bg-surface-soft p-3.5 space-y-2.5">
              <div>
                <span className="text-[11px] font-semibold text-copy-subtle block">
                  Student Email
                </span>
                <span className="font-mono text-xs font-bold text-foreground">
                  {successInfo.email}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-copy-subtle block">
                  New Password
                </span>
                <span className="font-mono text-sm font-bold text-brand-cyan">
                  {successInfo.password}
                </span>
              </div>
              {successInfo.supabaseMsg && (
                <div className="pt-2 border-t border-line-soft text-[11px] text-copy-subtle flex items-center gap-1.5">
                  <Mail className="size-3 text-brand-purple" />
                  <span>{successInfo.supabaseMsg}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleCopy}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-line-soft bg-surface-soft px-4 py-2.5 text-xs font-bold text-foreground hover:border-brand-cyan/60 transition-colors"
              >
                {copied ? (
                  <Check className="size-3.5 text-brand-emerald" />
                ) : (
                  <Copy className="size-3.5" />
                )}
                {copied ? "Copied to Clipboard" : "Copy Credentials"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple px-5 py-2.5 text-xs font-bold text-surface-dark shadow-md hover:opacity-90"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* ================= INPUT FORM ================= */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Student Info Card (if selected) */}
            {matchedStudent ? (
              <div className="rounded-xl border border-line-soft bg-surface-soft p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <GraduationCap className="size-3.5 text-brand-cyan" />
                    {matchedStudent.name || "Student Learner"}
                  </span>
                  {matchedStudent.rollNo && (
                    <span className="font-mono text-[10px] rounded bg-surface-dark px-1.5 py-0.5 border border-line-soft text-copy-subtle">
                      {matchedStudent.rollNo}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-copy-subtle">
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider font-semibold">
                      Email
                    </span>
                    <span className="font-mono text-foreground">{matchedStudent.email}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider font-semibold">
                      Cohort Batch
                    </span>
                    <span className="font-mono text-brand-purple font-semibold">
                      {matchedStudent.batchId || "Default"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label className="mb-1 block text-xs font-semibold text-copy-subtle">
                  Select or Enter Student Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="ajay@santoge.dev or student@college.edu"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full rounded-xl border border-line-soft bg-surface-soft px-3.5 py-2.5 text-xs font-mono text-foreground outline-none focus:border-brand-cyan/60"
                />
              </div>
            )}

            {/* New Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-copy-subtle">
                  New Temporary or Permanent Password
                </label>
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-cyan hover:underline"
                >
                  <Sparkles className="size-3" /> Generate Random
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 chars)"
                  className="w-full rounded-xl border border-line-soft bg-surface-soft px-3.5 py-2.5 pr-10 text-xs font-mono text-foreground outline-none focus:border-brand-cyan/60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-copy-subtle hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Supabase Recovery Email Option */}
            {hasSupabase && (
              <label className="flex items-start gap-2.5 rounded-xl border border-line-soft bg-surface-soft/60 p-3 cursor-pointer hover:bg-surface-soft transition-colors">
                <input
                  type="checkbox"
                  checked={sendSupabaseEmail}
                  onChange={(e) => setSendSupabaseEmail(e.target.checked)}
                  className="mt-0.5 rounded border-line-soft accent-[var(--brand-purple)]"
                />
                <div className="text-xs">
                  <p className="font-semibold text-foreground flex items-center gap-1">
                    <Mail className="size-3 text-brand-purple" />
                    Dispatch Supabase Recovery Email
                  </p>
                  <p className="text-[11px] text-copy-subtle mt-0.5">
                    Sends a password reset link to the learner's institutional inbox via Supabase
                    Auth.
                  </p>
                </div>
              </label>
            )}

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-line-soft">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-line-soft px-4 py-2 text-xs font-semibold text-copy-subtle hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple px-4 py-2 text-xs font-bold text-surface-dark shadow-md hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {isSubmitting && <RefreshCw className="size-3 animate-spin" />}
                Confirm Password Reset
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
