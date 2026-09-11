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
import { useBatchLookup } from "@/lib/data";

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
  const { getBatchName } = useBatchLookup(isOpen);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border pb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary border border-primary/20">
              <KeyRound className="size-4" />
            </span>
            <div>
              <h3 className="text-base font-semibold text-foreground">
                Reset Student Password
              </h3>
              <p className="text-xs text-muted-foreground">Platform Super Admin Security Control</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {successInfo ? (
          /* ================= SUCCESS STATE ================= */
          <div className="space-y-4 py-2">
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs space-y-2">
              <div className="flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="size-4" />
                <span>Password Successfully Updated</span>
              </div>
              <p className="text-muted-foreground">
                The student can immediately log in with these new credentials via the portal.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground block">
                  Student Email
                </span>
                <span className="font-mono text-xs font-semibold text-foreground">
                  {successInfo.email}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground block">
                  New Password
                </span>
                <span className="font-mono text-sm font-bold text-primary">
                  {successInfo.password}
                </span>
              </div>
              {successInfo.supabaseMsg && (
                <div className="pt-2 border-t border-border text-xs text-muted-foreground flex items-center gap-1.5">
                  <Mail className="size-3.5 text-primary" />
                  <span>{successInfo.supabaseMsg}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleCopy}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-xs"
              >
                {copied ? (
                  <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Copy className="size-3.5" />
                )}
                {copied ? "Copied to Clipboard" : "Copy Credentials"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
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
              <div className="rounded-xl border border-border bg-muted/20 p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <GraduationCap className="size-3.5 text-primary" />
                    {matchedStudent.name || "Student Learner"}
                  </span>
                  {matchedStudent.rollNo && (
                    <span className="font-mono text-[10px] rounded bg-muted px-2 py-0.5 border border-border text-muted-foreground font-medium">
                      {matchedStudent.rollNo}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                      Email
                    </span>
                    <span className="font-mono text-foreground font-medium">{matchedStudent.email}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                      Cohort Batch
                    </span>
                    <span className="text-foreground font-semibold">
                      {getBatchName(matchedStudent.batchId, "Default")}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  Select or Enter Student Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="ajay@santoge.dev or student@college.edu"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
                />
              </div>
            )}

            {/* New Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  New Temporary or Permanent Password
                </label>
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
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
                  className="w-full rounded-lg border border-border bg-card px-3.5 py-2 pr-10 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Supabase Recovery Email Option */}
            {hasSupabase && (
              <label className="flex items-start gap-2.5 rounded-xl border border-border bg-muted/20 p-3 cursor-pointer hover:bg-muted/40 transition-colors">
                <input
                  type="checkbox"
                  checked={sendSupabaseEmail}
                  onChange={(e) => setSendSupabaseEmail(e.target.checked)}
                  className="mt-0.5 rounded border-border accent-primary"
                />
                <div className="text-xs">
                  <p className="font-semibold text-foreground flex items-center gap-1">
                    <Mail className="size-3.5 text-primary" />
                    Dispatch Supabase Recovery Email
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Sends a password reset link to the learner's institutional inbox via Supabase
                    Auth.
                  </p>
                </div>
              </label>
            )}

            {/* Modal Actions */}
            <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 disabled:opacity-50 transition-opacity"
              >
                {isSubmitting && <RefreshCw className="size-3.5 animate-spin" />}
                Confirm Password Reset
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
