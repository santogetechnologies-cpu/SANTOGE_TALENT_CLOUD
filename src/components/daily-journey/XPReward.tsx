import { Zap, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface XPRewardProps {
  amount: number;
  label?: string;
  className?: string;
}

export function XPReward({ amount, label = "XP Earned", className }: XPRewardProps) {
  return (
    <div
      className={cn(
        "xp-pop inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400 shadow-xs",
        className,
      )}
    >
      <Zap className="size-3.5 fill-amber-500 text-amber-500 animate-pulse" />
      <span>+{amount} {label}</span>
      <Sparkles className="size-3 text-amber-400" />
    </div>
  );
}
