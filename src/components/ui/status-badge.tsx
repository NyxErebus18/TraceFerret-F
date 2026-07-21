import { Severity } from "../../types/analysis";
import { cn } from "../../lib/utils";

const severityColors: Record<Severity, string> = {
  CRITICAL: "text-red-400 bg-red-400/10 border-red-400/20",
  HIGH: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  MEDIUM: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  LOW: "text-zinc-500 bg-zinc-500/10 border-zinc-500/20",
};

export const StatusBadge = ({ severity }: { severity: Severity }) => (
  <span className={cn(
    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold tracking-tight uppercase",
    severityColors[severity]
  )}>
    <span className={cn("w-1 h-1 rounded-full", severity === 'CRITICAL' ? "bg-red-400 animate-pulse" : "bg-current")} />
    {severity}
  </span>
);
