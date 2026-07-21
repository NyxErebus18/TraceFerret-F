import { ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { WorkflowHeader } from "../dashboard/workflow-header";

interface WorkspaceShellProps {
  left?: ReactNode;
  children: ReactNode;
  right?: ReactNode;
  title: string;
  activeStep: string;
  onStepChange: (step: string) => void;
  onBackToDemos: () => void;
}

export function WorkspaceShell({ 
  left, 
  children, 
  right, 
  title, 
  activeStep, 
  onStepChange,
  onBackToDemos 
}: WorkspaceShellProps) {
  return (
    <div className="flex flex-col h-screen bg-[#030303] text-zinc-400 selection:bg-cyan-500/30 overflow-hidden font-sans antialiased">
      {/* Refined Navigation (Vercel Style) */}
      <nav className="h-14 px-5 border-b border-white/[0.04] bg-black/40 backdrop-blur-md flex items-center justify-between z-50">
        <div className="flex items-center gap-5">
          <button 
            onClick={onBackToDemos}
            className="w-7 h-7 bg-white rounded-md flex items-center justify-center text-black font-black text-xs shadow-lg shadow-white/5 cursor-pointer hover:bg-zinc-200 transition-colors"
            title="Back to Demo Scenarios"
          >
            TF
          </button>
          <div className="h-4 w-px bg-white/[0.08]" />
          <div className="flex items-center gap-2 text-[13px] font-medium tracking-tight">
            <span 
              onClick={onBackToDemos} 
              className="text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors"
            >
              Projects
            </span>
            <span className="text-zinc-700">/</span>
            <span className="text-white font-mono">{title}</span>
          </div>
        </div>
        
        {/* Step progress tracker header */}
        <div className="flex items-center gap-3">
          <WorkflowHeader activeStep={activeStep} onStepChange={onStepChange} />
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {left && (
          <aside className="w-[260px] border-r border-white/[0.04] bg-[#050505] flex flex-col shrink-0">
            {left}
          </aside>
        )}
        
        <main className="flex-1 overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/10 via-transparent to-transparent">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {right && (
          <aside className="w-[340px] border-l border-white/[0.04] bg-[#050505] overflow-y-auto shrink-0">
            {right}
          </aside>
        )}
      </div>
    </div>
  );
}
