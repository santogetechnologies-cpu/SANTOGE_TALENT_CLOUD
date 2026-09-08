import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({
  title,
  subtitle,
  action,
  children,
  className,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("glass-card rounded-2xl p-5", className)}>
      {(title || action) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && (
              <h2 className="font-display text-base font-700 tracking-tight text-foreground">
                {title}
              </h2>
            )}
            {subtitle && <p className="mt-1 text-xs text-copy-subtle">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-copy-subtle">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  accent = "var(--brand-cyan)",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  accent?: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-4">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-copy-subtle">
        {label}
      </p>
      <p className="mt-2 font-display text-2xl font-bold text-foreground" style={{ color: accent }}>
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-copy-subtle">{hint}</p>}
    </div>
  );
}

export function Meter({ value, accent = "var(--brand-cyan)" }: { value: number; accent?: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-soft">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: accent }}
      />
    </div>
  );
}

export function Gauge({
  value,
  max = 1000,
  label,
}: {
  value: number;
  max?: number;
  label: string;
}) {
  const pct = Math.min(1, value / max);
  const radius = 62;
  const circumference = Math.PI * radius;
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 160 96" className="w-48">
        <path
          d={`M 18 88 A ${radius} ${radius} 0 0 1 142 88`}
          fill="none"
          strokeWidth="12"
          stroke="var(--surface-soft)"
          strokeLinecap="round"
        />
        <path
          d={`M 18 88 A ${radius} ${radius} 0 0 1 142 88`}
          fill="none"
          strokeWidth="12"
          stroke="url(#gaugeGrad)"
          strokeLinecap="round"
          strokeDasharray={`${circumference * pct} ${circumference}`}
          className="transition-all duration-700"
        />
        <defs>
          <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--brand-cyan)" />
            <stop offset="100%" stopColor="var(--brand-purple)" />
          </linearGradient>
        </defs>
      </svg>
      <p className="-mt-6 font-display text-3xl font-bold text-foreground">{Math.round(value)}</p>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-copy-subtle">
        {label}
      </p>
    </div>
  );
}

export function Chip({
  children,
  tone = "cyan",
}: {
  children: ReactNode;
  tone?: "cyan" | "purple" | "emerald" | "amber" | "rose" | "muted";
}) {
  const map: Record<string, string> = {
    cyan: "text-brand-cyan",
    purple: "text-brand-purple",
    emerald: "text-brand-emerald",
    amber: "text-brand-amber",
    rose: "text-brand-rose",
    muted: "text-copy-subtle",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-line-soft bg-surface-soft px-2.5 py-1 text-[11px] font-semibold",
        map[tone],
      )}
    >
      {children}
    </span>
  );
}

export function Console({
  lines,
  empty = "Awaiting execution…",
}: {
  lines: string[];
  empty?: string;
}) {
  return (
    <pre className="terminal-grid max-h-64 overflow-auto rounded-xl border border-line-soft p-4 font-mono text-[12px] leading-relaxed text-brand-cyan">
      {lines.length === 0 ? <span className="text-copy-subtle">{empty}</span> : lines.join("\n")}
    </pre>
  );
}

export function CodeEditor({
  value,
  onChange,
  rows = 8,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <textarea
      spellCheck={false}
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full resize-y rounded-xl border border-line-soft bg-surface-dark p-4 font-mono text-[12.5px] leading-relaxed text-brand-cyan outline-none focus:border-brand-cyan/60"
    />
  );
}
