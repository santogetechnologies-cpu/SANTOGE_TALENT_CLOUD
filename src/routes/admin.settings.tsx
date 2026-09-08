import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Chip, PageHeader, Panel, Stat } from "@/components/kit";
import { useAppStore, type CompletionRule } from "@/lib/app-store";
import { Moon, RotateCcw, Sun, Shield, Server, Lock, CheckCircle2, RefreshCw } from "lucide-react";
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  supabaseAuth,
  type SupabaseAuthConfig,
} from "@/lib/supabase";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "System & Dual Gate Settings — SantoGe Talent Cloud" },
      {
        name: "description",
        content:
          "Configure Dual Completion Gate rules, readiness weights, Supabase live endpoints, and appearance.",
      },
      { property: "og:title", content: "System & Dual Gate Settings — SantoGe Talent Cloud" },
      {
        property: "og:description",
        content: "Configure Dual Completion Gate rules and platform settings.",
      },
    ],
  }),
  component: AdminSettingsPage,
});

const WEIGHTS = [
  { key: "T", label: "Technical Mastery (T)", value: 25 },
  { key: "C", label: "Placement Attendance (C)", value: 20 },
  { key: "A", label: "Aptitude & Reasoning (A)", value: 15 },
  { key: "E", label: "English & Communication (E)", value: 15 },
  { key: "R", label: "ATS Resume Quality (R)", value: 15 },
  { key: "M", label: "Mock Interviews (M)", value: 10 },
];

function AdminSettingsPage() {
  const store = useAppStore();
  const [threshold, setThreshold] = useState(450);
  const [broadcast, setBroadcast] = useState("06:00");
  const [maxTracks, setMaxTracks] = useState(3);
  const [completionRule, setCompletionRuleState] = useState<CompletionRule>(store.completionRule);
  const [secondaryMin, setSecondaryMin] = useState(store.secondaryMinimum);

  // Supabase live config
  const [sbConfig, setSbConfig] = useState<SupabaseAuthConfig>({ url: "", anonKey: "" });
  const [sbTesting, setSbTesting] = useState(false);
  const [sbStatus, setSbStatus] = useState<string | null>(null);

  useEffect(() => {
    setSbConfig(getSupabaseConfig());
  }, []);

  const saveGateRules = () => {
    store.setCompletionRule(completionRule, secondaryMin);
    toast.success("Dual Completion Gate business rules saved");
  };

  const saveSupabase = async () => {
    setSbTesting(true);
    const res = await supabaseAuth.testConnection(sbConfig);
    setSbTesting(false);
    if (res.ok) {
      saveSupabaseConfig(sbConfig);
      setSbStatus("Connected");
      toast.success("Supabase live configuration updated & connected");
    } else {
      setSbStatus(`Error: ${res.message}`);
      toast.error(res.message);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="System & Dual Gate Configuration"
        subtitle="Platform-wide scoring weights, Dual Completion Gate business rules, Supabase endpoints, and broadcast windows."
        action={<Chip tone="cyan">Super Admin Controls</Chip>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Gateway Threshold" value={threshold} hint="Min score for recruiter match" />
        <Stat
          label="Daily Broadcast Time"
          value={broadcast}
          accent="var(--brand-amber)"
          hint="IST Morning Window"
        />
        <Stat
          label="Max Technical Tracks"
          value={maxTracks}
          accent="var(--brand-purple)"
          hint="Per learner profile"
        />
      </div>

      {/* DUAL COMPLETION GATE CONFIGURATION */}
      <Panel
        title="Dual Completion Gate Business Rules"
        subtitle="Configure how technical course completion is evaluated alongside the 90-day placement program"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-semibold text-copy-subtle">
              Technical Completion Evaluation Mode
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setCompletionRuleState("primary-plus-minimum")}
                className={`rounded-xl border p-3.5 text-left transition-all ${
                  completionRule === "primary-plus-minimum"
                    ? "border-brand-cyan/60 bg-surface-soft shadow-md shadow-brand-cyan/5"
                    : "border-line-soft bg-surface-dark/40 text-copy-subtle"
                }`}
              >
                <p className="text-xs font-bold text-foreground">
                  Primary Track 100% + Secondary Threshold
                </p>
                <p className="mt-1 text-[11px] text-copy-subtle">
                  Learner must master Primary track (100%) and reach at least {secondaryMin}%
                  competency on secondary tracks.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setCompletionRuleState("all-tracks")}
                className={`rounded-xl border p-3.5 text-left transition-all ${
                  completionRule === "all-tracks"
                    ? "border-brand-purple/60 bg-surface-soft shadow-md shadow-brand-purple/5"
                    : "border-line-soft bg-surface-dark/40 text-copy-subtle"
                }`}
              >
                <p className="text-xs font-bold text-foreground">All Selected Tracks (100%)</p>
                <p className="mt-1 text-[11px] text-copy-subtle">
                  Strict requirement: 100% competency across all chosen tracks (up to 3 tracks).
                </p>
              </button>
            </div>
          </div>

          {completionRule === "primary-plus-minimum" && (
            <div className="rounded-xl border border-line-soft bg-surface-soft p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">
                  Secondary Track Minimum Competency Requirement:
                </span>
                <span className="font-mono font-bold text-brand-cyan">{secondaryMin}%</span>
              </div>
              <input
                type="range"
                min={30}
                max={90}
                step={5}
                value={secondaryMin}
                onChange={(e) => setSecondaryMin(Number(e.target.value))}
                className="w-full accent-[var(--brand-cyan)]"
              />
            </div>
          )}

          <button
            type="button"
            onClick={saveGateRules}
            className="rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple px-4 py-2.5 text-xs font-bold text-surface-dark"
          >
            Save Dual Gate Rules
          </button>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Scoring Weights */}
        <Panel
          title="Talent Readiness Scoring Weights"
          subtitle="Weighted contribution to Readiness Index & Talent Score"
        >
          <div className="space-y-2.5">
            {WEIGHTS.map((w) => (
              <div
                key={w.key}
                className="flex items-center justify-between rounded-xl border border-line-soft bg-surface-soft px-3 py-2.5"
              >
                <span className="text-xs font-medium text-foreground">{w.label}</span>
                <span className="font-mono text-xs font-bold text-brand-cyan">{w.value}%</span>
              </div>
            ))}
          </div>
        </Panel>

        {/* Supabase Endpoint Config */}
        <Panel title="Live Supabase Integration" subtitle="Connected authentication and user store">
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-copy-subtle">
                Supabase Project URL
              </label>
              <input
                type="text"
                value={sbConfig.url}
                onChange={(e) => setSbConfig({ ...sbConfig, url: e.target.value })}
                className="w-full rounded-xl border border-line-soft bg-surface-dark px-3 py-2 text-xs font-mono text-foreground outline-none focus:border-brand-cyan/60"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-copy-subtle">
                Supabase Anon Key
              </label>
              <input
                type="password"
                value={sbConfig.anonKey}
                onChange={(e) => setSbConfig({ ...sbConfig, anonKey: e.target.value })}
                className="w-full rounded-xl border border-line-soft bg-surface-dark px-3 py-2 text-xs font-mono text-foreground outline-none focus:border-brand-cyan/60"
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={saveSupabase}
                disabled={sbTesting}
                className="inline-flex items-center gap-2 rounded-xl bg-surface-elevated border border-line-soft px-3.5 py-2 text-xs font-bold text-foreground hover:border-brand-cyan/60"
              >
                {sbTesting ? (
                  <RefreshCw className="size-3.5 animate-spin" />
                ) : (
                  <Server className="size-3.5 text-brand-cyan" />
                )}
                Test &amp; Save Endpoint
              </button>
              {sbStatus && (
                <span
                  className={`text-xs font-semibold ${sbStatus.includes("Error") ? "text-brand-rose" : "text-brand-emerald"}`}
                >
                  {sbStatus}
                </span>
              )}
            </div>
          </div>
        </Panel>
      </div>

      {/* Appearance & Reset */}
      <Panel title="Appearance & Reset Controls" subtitle="Workspace environment controls">
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            onClick={store.toggleTheme}
            className="flex items-center gap-2 rounded-xl border border-line-soft bg-surface-soft px-4 py-3 text-xs font-semibold text-foreground"
          >
            {store.theme === "dark" ? (
              <Sun className="size-4 text-brand-amber" />
            ) : (
              <Moon className="size-4 text-brand-purple" />
            )}
            Switch to {store.theme === "dark" ? "light" : "dark"} theme
          </button>
          <button
            onClick={() => {
              store.resetProgress();
              toast.success("Demo dataset reset to initial state");
            }}
            className="flex items-center gap-2 rounded-xl border border-line-soft px-4 py-3 text-xs font-semibold text-brand-rose hover:bg-brand-rose/10"
          >
            <RotateCcw className="size-4" /> Reset all demo profiles &amp; progress
          </button>
        </div>
      </Panel>
    </div>
  );
}
