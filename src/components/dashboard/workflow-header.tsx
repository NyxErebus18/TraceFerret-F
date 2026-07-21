import { cn } from "../../lib/utils";
import { motion } from "motion/react";

const STEPS = [
  { id: "investigation", label: "Investigation" },
  { id: "root-cause", label: "Root-Cause" },
  { id: "patch", label: "Patch Review" },
  { id: "validation", label: "Validation" },
  { id: "report", label: "Report" }
];

interface WorkflowHeaderProps {
  activeStep: string;
  onStepChange: (step: string) => void;
}

export function WorkflowHeader({ activeStep, onStepChange }: WorkflowHeaderProps) {
  return (
    <div className="flex items-center gap-1 bg-zinc-950/90 p-1 rounded-xl border border-white/[0.08] shadow-inner relative">
      {STEPS.map((step, i) => {
        const isActive = activeStep === step.id;
        
        return (
          <button 
            key={step.id} 
            onClick={() => onStepChange(step.id)}
            className={cn(
              "relative px-3.5 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded-lg transition-colors duration-200 cursor-pointer z-10 flex items-center gap-1.5",
              isActive 
                ? "text-black font-black" 
                : "text-zinc-400 hover:text-white"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="active-step-pill"
                className="absolute inset-0 bg-cyan-400 rounded-lg shadow-[0_0_15px_rgba(34,211,238,0.4)] -z-10"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className={isActive ? "text-black/70 font-black" : "text-cyan-500 font-bold"}>0{i + 1}.</span>
            <span>{step.label}</span>
          </button>
        );
      })}
    </div>
  );
}

