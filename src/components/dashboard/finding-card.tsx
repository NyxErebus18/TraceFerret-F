import { Finding } from "../../types/analysis";
import { StatusBadge } from "../ui/status-badge";
import { GlassPanel } from "../ui/glass-panel";
import { ChevronRight, FileWarning } from "lucide-react";

interface FindingCardProps {
  finding: Finding;
  onClick?: () => void;
  isSelected?: boolean;
}

export const FindingCard = ({ finding, onClick, isSelected = false }: FindingCardProps) => (
  <GlassPanel 
    interactive 
    onClick={onClick}
    className={`p-4 group text-left w-full border ${isSelected ? "border-cyan-500/50 ring-1 ring-cyan-500/20 bg-cyan-500/[0.02]" : "border-white/[0.04]"}`}
  >
    <div className="flex justify-between items-start mb-3">
      <StatusBadge severity={finding.severity} />
      <span className="text-[10px] font-mono text-zinc-600 tracking-tighter">
        CONFIDENCE: <span className="text-cyan-400 font-bold">{finding.confidence}%</span>
      </span>
    </div>
    
    <h4 className="text-[13px] font-semibold text-zinc-100 group-hover:text-cyan-400 transition-colors leading-snug">
      {finding.title}
    </h4>
    
    <p className="text-[12px] text-zinc-500 mt-1.5 leading-relaxed font-normal opacity-80">
      {finding.description}
    </p>

    <div className="mt-4 pt-3 border-t border-white/[0.03] flex items-center justify-between">
       <div className="flex items-center gap-2 text-[10px] font-mono font-medium text-zinc-600">
         <FileWarning size={12} className="text-red-400/60" />
         <span>{finding.file.split('/').pop()}:{finding.line}</span>
       </div>
       <ChevronRight size={14} className="text-zinc-700 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
    </div>
  </GlassPanel>
);
