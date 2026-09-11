import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({
  title,
  subtitle,
  action,
  children,
  className,
  id,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("rounded-xl border border-border bg-card p-5 shadow-xs transition-colors", className)}>
      {(title || action) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && (
              <h2 className="text-sm sm:text-base font-semibold tracking-tight text-foreground">
                {title}
              </h2>
            )}
            {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
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
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-1 max-w-2xl text-xs sm:text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  accent,
  tone,
  onClick,
  active,
  actionLabel,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  accent?: string;
  tone?: string;
  onClick?: () => void;
  active?: boolean;
  actionLabel?: string;
  className?: string;
}) {
  const isClickable = Boolean(onClick);
  return (
    <div
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      className={cn(
        "group relative rounded-xl border border-border bg-card p-4 shadow-xs transition-all text-left",
        isClickable &&
          "cursor-pointer hover:border-primary/50 hover:bg-muted/40 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary select-none",
        active && "border-primary bg-primary/5 ring-1 ring-primary",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-1">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {actionLabel && (
          <span className="text-[10px] font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
            {actionLabel}
          </span>
        )}
      </div>
      <p
        className={cn(
          "mt-2 text-2xl font-bold tracking-tight text-foreground",
          tone === "brand" && "text-primary",
          tone === "cyan" && "text-sky-600 dark:text-sky-400",
          tone === "purple" && "text-violet-600 dark:text-violet-400",
          tone === "emerald" && "text-emerald-600 dark:text-emerald-400",
          tone === "amber" && "text-amber-600 dark:text-amber-400",
          tone === "rose" && "text-rose-600 dark:text-rose-400",
        )}
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Meter({
  value,
  accent,
  tone,
}: {
  value: number;
  accent?: string;
  tone?: string;
}) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={cn(
          "h-full rounded-full transition-all duration-500",
          !accent && !tone && "bg-primary",
          tone === "cyan" && "bg-sky-500",
          tone === "purple" && "bg-violet-500",
          tone === "emerald" && "bg-emerald-500",
          tone === "amber" && "bg-amber-500",
          tone === "rose" && "bg-rose-500",
        )}
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          ...(accent ? { background: accent } : {}),
        }}
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
      <svg viewBox="0 0 160 96" className="w-44">
        <path
          d={`M 18 88 A ${radius} ${radius} 0 0 1 142 88`}
          fill="none"
          strokeWidth="10"
          stroke="var(--muted)"
          strokeLinecap="round"
        />
        <path
          d={`M 18 88 A ${radius} ${radius} 0 0 1 142 88`}
          fill="none"
          strokeWidth="10"
          stroke="var(--brand-blue)"
          strokeLinecap="round"
          strokeDasharray={`${circumference * pct} ${circumference}`}
          className="transition-all duration-700"
        />
      </svg>
      <p className="-mt-6 text-2xl font-bold tracking-tight text-foreground">{Math.round(value)}</p>
      <p className="text-[11px] font-medium text-muted-foreground mt-0.5">
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
    cyan: "bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/40",
    purple: "bg-purple-50 text-purple-700 border-purple-200/60 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/40",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40",
    amber: "bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40",
    rose: "bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40",
    muted: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium",
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
    <pre className="terminal-grid max-h-64 overflow-auto rounded-lg border border-border bg-surface-dark p-3.5 font-mono text-[12px] leading-relaxed text-slate-200">
      {lines.length === 0 ? <span className="text-muted-foreground">{empty}</span> : lines.join("\n")}
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
      className="w-full resize-y rounded-lg border border-border bg-surface-dark p-3.5 font-mono text-[12.5px] leading-relaxed text-slate-100 outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20"
    />
  );
}
