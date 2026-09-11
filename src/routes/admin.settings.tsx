import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Chip, PageHeader, Panel, Stat } from "@/components/kit";
import { useAppStore, type CompletionRule } from "@/lib/app-store";
import { Moon, Sun, Shield, Server, RefreshCw } from "lucide-react";
import { getSupabaseConfig, supabaseAuth, isSupabaseConfigured } from "@/lib/supabase";

import { useLivePlatformSettings, updateLivePlatformSettings } from "@/lib/data";

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
  const { data: liveSettings } = useLivePlatformSettings(true);

  const [threshold] = useState(450);
  const [broadcast] = useState("06:00");
  const [maxTracks] = useState(3);
  const [completionRule, setCompletionRuleState] = useState<CompletionRule>("primary-plus-minimum");
  const [secondaryMin, setSecondaryMin] = useState(60);

  useEffect(() => {
    if (liveSettings) {
      if (liveSettings.completionRule) {
        setCompletionRuleState(liveSettings.completionRule);
      }
      if (typeof liveSettings.secondaryMinimum === "number") {
        setSecondaryMin(liveSettings.secondaryMinimum);
      }
    }
  }, [liveSettings]);

  const queryClient = useQueryClient();
  const [sbConfig, setSbConfig] = useState({ url: "", anonKey: "" });
  const [sbTesting, setSbTesting] = useState(false);
  const [sbStatus, setSbStatus] = useState<string | null>(null);

  useEffect(() => {
    setSbConfig(getSupabaseConfig());
  }, []);

  const saveGateRules = async () => {
    const res = await updateLivePlatformSettings({
      completionRule,
      secondaryMinimum: secondaryMin,
    });
    if (res.ok) {
      queryClient.invalidateQueries({ queryKey: ["live", "platform-settings"] });
      toast.success("Dual Gate configuration saved to Supabase!");
    } else {
      toast.error(res.error || "Failed to update platform settings in Supabase");
    }
  };

  const testSupabase = async () => {
    setSbTesting(true);
    const res = await supabaseAuth.testConnection();
    setSbTesting(false);
    if (res.ok) {
      setSbStatus("Connected & Verified");
      toast.success("Live Supabase backend connection verified");
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
          hint="IST Morning Window"
        />
        <Stat
          label="Max Technical Tracks"
          value={maxTracks}
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
            <label className="mb-2 block text-xs font-medium text-muted-foreground">
              Technical Completion Evaluation Mode
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setCompletionRuleState("primary-plus-minimum")}
                className={`rounded-lg border p-4 text-left transition-colors ${
                  completionRule === "primary-plus-minimum"
                    ? "border-primary bg-primary/5 shadow-xs"
                    : "border-border bg-card text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <p className="text-xs font-semibold text-foreground">
                  Primary Track 100% + Secondary Threshold
                </p>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Learner must master Primary track (100%) and reach at least {secondaryMin}%
                  competency on secondary tracks.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setCompletionRuleState("all-tracks")}
                className={`rounded-lg border p-4 text-left transition-colors ${
                  completionRule === "all-tracks"
                    ? "border-primary bg-primary/5 shadow-xs"
                    : "border-border bg-card text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <p className="text-xs font-semibold text-foreground">All Selected Tracks (100%)</p>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Strict requirement: 100% competency across all chosen tracks (up to 3 tracks).
                </p>
              </button>
            </div>
          </div>

          {completionRule === "primary-plus-minimum" && (
            <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">
                  Secondary Track Minimum Competency Requirement:
                </span>
                <span className="font-mono font-bold text-primary">{secondaryMin}%</span>
              </div>
              <input
                type="range"
                min={30}
                max={90}
                step={5}
                value={secondaryMin}
                onChange={(e) => setSecondaryMin(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          )}

          <div>
            <button
              type="button"
              onClick={saveGateRules}
              className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
            >
              Save Dual Gate Rules
            </button>
          </div>
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Scoring Weights */}
        <Panel
          title="Talent Readiness Scoring Weights"
          subtitle="Weighted contribution to Readiness Index & Talent Score"
        >
          <div className="space-y-2">
            {WEIGHTS.map((w) => (
              <div
                key={w.key}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-3.5 py-2.5"
              >
                <span className="text-xs font-medium text-foreground">{w.label}</span>
                <span className="font-mono text-xs font-semibold text-primary">{w.value}%</span>
              </div>
            ))}
          </div>
        </Panel>

        {/* Supabase Production Integration */}
        <Panel
          title="Authoritative Supabase Production Backend"
          subtitle="Single source of truth for all persistent application data & authentication"
          action={
            isSupabaseConfigured() ? (
              <Chip tone="emerald">Live &amp; Enforced</Chip>
            ) : (
              <Chip tone="rose">Configuration Required</Chip>
            )
          }
        >
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Authoritative Supabase Project URL
              </label>
              <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs font-mono text-foreground select-all">
                {sbConfig.url || "VITE_SUPABASE_URL not configured"}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Public Client Key
              </label>
              <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs font-mono text-muted-foreground select-all">
                {sbConfig.anonKey
                  ? `${sbConfig.anonKey.slice(0, 16)}••••••••••••`
                  : "VITE_SUPABASE_PUBLISHABLE_KEY not configured"}
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={testSupabase}
                disabled={sbTesting || !isSupabaseConfigured()}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-medium text-foreground hover:bg-muted shadow-xs transition-colors disabled:opacity-50"
              >
                {sbTesting ? (
                  <RefreshCw className="size-3.5 animate-spin" />
                ) : (
                  <Server className="size-3.5 text-primary" />
                )}
                Test Live Connection
              </button>
              {sbStatus && (
                <span
                  className={`text-xs font-medium ${sbStatus.includes("Error") ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}`}
                >
                  {sbStatus}
                </span>
              )}
            </div>
          </div>
        </Panel>
      </div>

      {/* Appearance */}
      <Panel title="Platform Appearance & Controls" subtitle="Workspace environment controls">
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            onClick={store.toggleTheme}
            className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-4 py-3 text-xs font-medium text-foreground hover:bg-muted transition-colors shadow-xs"
          >
            {store.theme === "dark" ? (
              <Sun className="size-4 text-amber-500" />
            ) : (
              <Moon className="size-4 text-muted-foreground" />
            )}
            Switch to {store.theme === "dark" ? "light" : "dark"} theme
          </button>
          <div className="flex items-center gap-2.5 rounded-lg border border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
            <Shield className="size-4 text-emerald-600 dark:text-emerald-400" />
            <span>PostgreSQL RLS &amp; Supabase Auth Enforced</span>
          </div>
        </div>
      </Panel>
    </div>
  );
}
