import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  CheckCircle2, 
  Loader2, 
  Database, 
  ListOrdered, 
  GitFork, 
  Activity, 
  Cpu, 
  ShieldAlert, 
  FileCode, 
  Sparkles, 
  Layers, 
  Zap, 
  Clock, 
  Radio, 
  Terminal, 
  AlertTriangle,
  ChevronRight,
  Maximize2,
  HardDrive
} from "lucide-react";
import { DependencyGraph } from "./dependency-graph";
import { GlassPanel } from "../ui/glass-panel";

interface TimelineItemProps {
  key?: any;
  step: any;
  isComplete: boolean;
  isActive: boolean;
  index: number;
}

export function TimelineItem({ step, isComplete, isActive, index }: TimelineItemProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={`flex gap-4 sm:gap-6 relative z-10 ${!isComplete && !isActive ? 'opacity-30' : ''}`}
    >
      {/* Step Dot & Indicator */}
      <div className="flex flex-col items-center shrink-0">
        <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
          isComplete 
            ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.2)]" 
            : isActive 
              ? "bg-cyan-500/15 border-cyan-500 text-cyan-400 animate-pulse shadow-[0_0_12px_rgba(34,211,238,0.3)]" 
              : "bg-zinc-950 border-zinc-800 text-zinc-700"
        }`}>
          {isComplete ? (
            <CheckCircle2 size={13} />
          ) : isActive ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <span className="text-[10px] font-bold">{step.id}</span>
          )}
        </div>
      </div>
      
      {/* Content Box */}
      <div className="flex-1 pt-0.5 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono text-zinc-500 font-bold">
              STEP {step.id}/10
            </span>
            <h3 className={`text-xs sm:text-sm font-bold tracking-tight ${
              isComplete ? "text-zinc-200" : isActive ? "text-cyan-400 font-extrabold" : "text-zinc-600"
            }`}>
              {step.label}
            </h3>
          </div>

          {isActive && (
            <span className="flex items-center gap-1.5 px-2 py-0.5 bg-cyan-500/10 rounded border border-cyan-500/20 text-[9px] font-bold text-cyan-400 uppercase tracking-widest animate-pulse shrink-0">
              <Sparkles size={10} /> Active Reasoning
            </span>
          )}
        </div>
        
        <p className="text-[11px] text-zinc-400 font-mono leading-relaxed">
          {step.detail}
        </p>

        {isActive && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-2 p-3 rounded-lg bg-black/60 border border-cyan-500/30 border-l-2 border-l-cyan-400 space-y-2"
          >
            <div className="text-[10px] text-cyan-400 font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Database size={11} className="animate-pulse" />
              Correlating Hardware Vector Signals...
            </div>
            <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-cyan-400 rounded-full" 
                initial={{ width: "0%" }} 
                animate={{ width: "100%" }} 
                transition={{ duration: (step.duration || 1200) / 1000, ease: "linear" }}
              />
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

interface SuspectFile {
  file: string;
  path: string;
  probability: number;
  role: string;
  status: "CRITICAL" | "SUSPECT" | "INVESTIGATED" | "CLEAN";
}

const SUSPECT_FILES: SuspectFile[] = [
  {
    file: "dma_controller.c",
    path: "src/drivers/dma_controller.c",
    probability: 94,
    role: "DMA Interrupt Service Routine & Callback Handler",
    status: "CRITICAL"
  },
  {
    file: "uart_driver.c",
    path: "src/drivers/uart_driver.c",
    probability: 82,
    role: "UART Driver Initialization & Callback Binding",
    status: "SUSPECT"
  },
  {
    file: "stm32f4xx_it.c",
    path: "src/stm32f4xx_it.c",
    probability: 45,
    role: "Cortex-M HardFault & Vector Exception Handlers",
    status: "INVESTIGATED"
  },
  {
    file: "system_stm32f4xx.c",
    path: "src/system_stm32f4xx.c",
    probability: 12,
    role: "RCC Bus Clock Configuration",
    status: "CLEAN"
  }
];

interface EvidenceItem {
  id: string;
  title: string;
  category: string;
  metric: string;
  stepRevealed: number;
}

const EVIDENCE_CHAIN: EvidenceItem[] = [
  { id: "e1", title: "Unmapped Callback Dereference", category: "Memory Trap", metric: "Addr: 0x00000000 (NULL)", stepRevealed: 2 },
  { id: "e2", title: "Configurable Fault Status (CFSR)", category: "Bus Fault", metric: "CFSR: 0x00000082", stepRevealed: 4 },
  { id: "e3", title: "NVIC Preemption Race Window", category: "Timing Delta", metric: "Preempt Delta: +1.18 μs", stepRevealed: 5 },
  { id: "e4", title: "DMA2 Stream0 Interrupt Flag Asserted", category: "Hardware Reg", metric: "HISR = 0x00000020 (TCIF0)", stepRevealed: 6 },
  { id: "e5", title: "Unbound Handle Register in SRAM", category: "DWARF Pointer", metric: "RAM Addr: 0x200021C4", stepRevealed: 7 },
  { id: "e6", title: "Zero Regression Test Vector", category: "HITL Verification", metric: "1,000 Sim Cycles Passed", stepRevealed: 10 }
];

interface SubsystemStatus {
  name: string;
  status: "FAULT" | "DEGRADED" | "ACTIVE" | "NORMAL";
  detail: string;
}

const SUBSYSTEMS: SubsystemStatus[] = [
  { name: "DMA Controller (DMA2)", status: "FAULT", detail: "Stream 0 Null Dereference Trap" },
  { name: "UART Peripheral (USART3)", status: "DEGRADED", detail: "Unbound Callback During RX" },
  { name: "NVIC Interrupt Matrix", status: "ACTIVE", detail: "IRQ Preemption Level 2 Active" },
  { name: "RCC Bus Clocks", status: "NORMAL", detail: "AHB1 / APB1 Operational (168MHz)" },
  { name: "Cortex-M4 CPU Core", status: "FAULT", detail: "HardFault Exception Handled" }
];

interface PeripheralState {
  name: string;
  status: string;
  registerFlag: string;
  color: string;
}

const PERIPHERALS: PeripheralState[] = [
  { name: "DMA2_Stream0", status: "HALTED", registerFlag: "HISR.TCIF0=1", color: "text-red-400 border-red-500/30 bg-red-500/10" },
  { name: "USART3", status: "BUSY_RX", registerFlag: "SR.RXNE=1", color: "text-amber-400 border-amber-500/30 bg-amber-500/10" },
  { name: "SPI1", status: "READY", registerFlag: "SR.TXE=1", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
  { name: "NVIC Matrix", status: "3 IRQ REQ", registerFlag: "ISER[1]=0x00000020", color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10" },
  { name: "SRAM1", status: "HEALTHY", registerFlag: "0x20000000 - 0x2001C000", color: "text-zinc-300 border-zinc-700 bg-zinc-900" }
];

interface InterruptVector {
  irq: string;
  channel: number;
  priority: number;
  vectorAddr: string;
  status: "TRAPPED" | "ACTIVE" | "TRIGGERED" | "IDLE";
}

const INTERRUPT_TABLE: InterruptVector[] = [
  { irq: "HardFault_IRQn", channel: -13, priority: 0, vectorAddr: "0x080012AC", status: "TRAPPED" },
  { irq: "DMA2_Stream0_IRQn", channel: 56, priority: 2, vectorAddr: "0x08001E44", status: "ACTIVE" },
  { irq: "USART3_IRQn", channel: 39, priority: 5, vectorAddr: "0x08000F80", status: "TRIGGERED" },
  { irq: "SysTick_IRQn", channel: -1, priority: 15, vectorAddr: "0x08000210", status: "IDLE" }
];

interface InvestigationViewProps {
  timeline: any[];
  activeStepIndex: number;
  isComplete: boolean;
}

export function InvestigationView({ timeline, activeStepIndex, isComplete }: InvestigationViewProps) {
  const [viewMode, setViewMode] = useState<"timeline" | "graph" | "subsystems">("timeline");

  const totalSteps = 10;
  const currentStepNumber = isComplete ? 10 : Math.min(activeStepIndex + 1, totalSteps);
  const progressPercent = Math.round((currentStepNumber / totalSteps) * 100);

  // Evidence items revealed up to current step index
  const visibleEvidence = EVIDENCE_CHAIN.filter(e => e.stepRevealed <= currentStepNumber);

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto font-mono text-xs p-4 sm:p-6 space-y-6">
      
      {/* Top Banner: Investigation Progress Bar & Real-time Counter Barometer */}
      <GlassPanel className="p-4 sm:p-5 border-white/[0.08] bg-black/50 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-widest">
              <Activity size={14} className={isComplete ? "text-emerald-400" : "animate-spin text-cyan-400"} />
              <span>Investigation Progress</span>
              <span className="text-zinc-500">•</span>
              <span className="text-zinc-300 font-bold">{currentStepNumber} / {totalSteps} Steps Analyzed</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {isComplete ? "Telemetry Correlation Complete" : `Executing Analysis Step ${currentStepNumber}: ${timeline[activeStepIndex]?.label || "Reasoning..."}`}
            </h2>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-black/60 px-3 py-1.5 rounded-xl border border-white/[0.06] text-right">
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Evidence Chain</span>
              <span className="text-sm font-extrabold text-cyan-400">{visibleEvidence.length} Signals Correlated</span>
            </div>

            <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
              isComplete
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 animate-pulse"
            }`}>
              {isComplete ? <CheckCircle2 size={14} /> : <Loader2 size={14} className="animate-spin" />}
              {isComplete ? "ANALYSIS COMPLETE" : "REASONING ACTIVE"}
            </div>
          </div>
        </div>

        {/* Outer Progress Bar */}
        <div className="space-y-1.5">
          <div className="h-2.5 bg-zinc-950 rounded-full overflow-hidden border border-white/[0.06] p-0.5">
            <motion.div 
              className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 rounded-full shadow-[0_0_12px_rgba(34,211,238,0.4)]"
              initial={{ width: "0%" }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between text-[9px] text-zinc-500">
            <span>Stage: {currentStepNumber <= 3 ? "Ingestion & Vector Mapping" : currentStepNumber <= 7 ? "Signal Correlation & Fault Trap" : "Patch Generation & HITL Validation"}</span>
            <span className="text-cyan-400 font-bold">{progressPercent}%</span>
          </div>
        </div>
      </GlassPanel>

      {/* View Switcher Subheader Bar */}
      <div className="bg-zinc-950 p-1 rounded-xl border border-white/[0.06] flex items-center gap-1 justify-between px-3 py-1.5">
        <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono">
          <Radio size={13} className="text-cyan-400 animate-pulse" />
          <span className="font-bold text-zinc-200 uppercase tracking-wider text-[11px]">Telemetry Investigation Board</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode("timeline")}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
              viewMode === "timeline"
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.15)]"
                : "text-zinc-500 hover:text-zinc-300 border border-transparent"
            }`}
          >
            <ListOrdered size={12} />
            Timeline (10 Steps)
          </button>

          <button
            onClick={() => setViewMode("graph")}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
              viewMode === "graph"
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.15)]"
                : "text-zinc-500 hover:text-zinc-300 border border-transparent"
            }`}
          >
            <GitFork size={12} />
            Dependency Graph
          </button>

          <button
            onClick={() => setViewMode("subsystems")}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
              viewMode === "subsystems"
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.15)]"
                : "text-zinc-500 hover:text-zinc-300 border border-transparent"
            }`}
          >
            <Cpu size={12} />
            Hardware & Subsystems
          </button>
        </div>
      </div>

      {/* Main Grid Section: Left Content (Timeline / Graph) & Right Subsystem Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (7 cols): Selected View Mode */}
        <div className="lg:col-span-7 space-y-6">
          {viewMode === "timeline" && (
            <GlassPanel className="p-6 border-white/[0.06] bg-black/40 space-y-6">
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                  <ListOrdered size={14} className="text-cyan-400" />
                  Investigation Step Sequence (10/10)
                </span>
                <span className="text-[10px] text-zinc-500">Live Reasoning Stream</span>
              </div>

              <div className="space-y-6 relative pl-2">
                <div className="absolute top-3 left-5 bottom-3 w-px bg-white/[0.04] -z-0" />
                
                {timeline.slice(0, currentStepNumber).map((step, i) => (
                  <TimelineItem 
                    key={step.id} 
                    step={step} 
                    isComplete={i < currentStepNumber - 1 || isComplete} 
                    isActive={i === currentStepNumber - 1 && !isComplete}
                    index={i}
                  />
                ))}
              </div>
            </GlassPanel>
          )}

          {viewMode === "graph" && (
            <GlassPanel className="p-4 border-white/[0.06] bg-black/40 h-[520px] flex flex-col">
              <DependencyGraph 
                activeStepIndex={activeStepIndex} 
                isComplete={isComplete} 
              />
            </GlassPanel>
          )}

          {viewMode === "subsystems" && (
            <div className="space-y-6">
              {/* Active Subsystem Monitor */}
              <GlassPanel className="p-5 space-y-4 border-white/[0.06] bg-black/40">
                <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                    <Cpu size={15} className="text-cyan-400" /> Active Hardware Subsystem Monitor
                  </span>
                  <span className="text-[10px] text-zinc-500">5 Monitored Blocks</span>
                </div>

                <div className="space-y-2.5">
                  {SUBSYSTEMS.map((sub, idx) => (
                    <div key={idx} className="p-3 bg-black/60 rounded-xl border border-white/[0.04] flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-white text-xs">{sub.name}</h4>
                        <p className="text-[10px] text-zinc-500 mt-0.5">{sub.detail}</p>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                        sub.status === "FAULT"
                          ? "bg-red-500/10 text-red-400 border-red-500/30 animate-pulse"
                          : sub.status === "DEGRADED"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      }`}>
                        {sub.status}
                      </span>
                    </div>
                  ))}
                </div>
              </GlassPanel>

              {/* Live Interrupt Vector Table */}
              <GlassPanel className="p-5 space-y-4 border-white/[0.06] bg-black/40">
                <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                    <Zap size={15} className="text-amber-400" /> Live MCU Interrupt Vector Table
                  </span>
                  <span className="text-[10px] text-zinc-500">NVIC Controller</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-[10px]">
                    <thead>
                      <tr className="border-b border-white/[0.06] text-zinc-500 uppercase text-[9px]">
                        <th className="py-2 px-2">IRQ Name</th>
                        <th className="py-2 px-2">Channel</th>
                        <th className="py-2 px-2">Priority</th>
                        <th className="py-2 px-2">Vector Addr</th>
                        <th className="py-2 px-2">State</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                      {INTERRUPT_TABLE.map((irq, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.02]">
                          <td className="py-2 px-2 font-bold text-white">{irq.irq}</td>
                          <td className="py-2 px-2 text-zinc-400">{irq.channel}</td>
                          <td className="py-2 px-2 text-cyan-400 font-bold">{irq.priority}</td>
                          <td className="py-2 px-2 text-zinc-300">{irq.vectorAddr}</td>
                          <td className="py-2 px-2">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold border ${
                              irq.status === "TRAPPED"
                                ? "bg-red-500/10 text-red-400 border-red-500/30"
                                : irq.status === "ACTIVE"
                                  ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                                  : "bg-zinc-900 text-zinc-500 border-zinc-800"
                            }`}>
                              {irq.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassPanel>
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Suspect File Ranking, Evidence Chain Counter & Peripheral Status Board */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* 1. Suspect File Ranking with Probability Progress Bars */}
          <GlassPanel className="p-5 space-y-4 border-white/[0.06] bg-black/40">
            <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <FileCode size={15} className="text-red-400" />
                Suspect File Ranking
              </span>
              <span className="text-[10px] text-zinc-500">DWARF Probability</span>
            </div>

            <div className="space-y-3 font-mono">
              {SUSPECT_FILES.map((f, idx) => {
                // Adjust probability animation based on investigation step
                const currentProb = currentStepNumber < 3 ? Math.round(f.probability * 0.4) : currentStepNumber < 7 ? Math.round(f.probability * 0.8) : f.probability;

                return (
                  <div key={idx} className="p-3 bg-black/60 rounded-xl border border-white/[0.04] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-zinc-500">#{idx + 1}</span>
                        <span className="font-bold text-white text-xs">{f.file}</span>
                      </div>
                      <span className={`text-[10px] font-bold ${
                        f.probability >= 80 ? "text-red-400" : f.probability >= 40 ? "text-amber-400" : "text-zinc-500"
                      }`}>
                        {currentProb}% Probability
                      </span>
                    </div>

                    <p className="text-[10px] text-zinc-400 font-sans truncate">{f.role}</p>

                    {/* Probability Progress Bar */}
                    <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                      <motion.div 
                        className={`h-full rounded-full ${
                          f.probability >= 80 ? "bg-red-400" : f.probability >= 40 ? "bg-amber-400" : "bg-zinc-600"
                        }`}
                        initial={{ width: "0%" }}
                        animate={{ width: `${currentProb}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassPanel>

          {/* 2. Evidence Chain Counter & Correlated Signals */}
          <GlassPanel className="p-5 space-y-4 border-white/[0.06] bg-black/40">
            <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <Database size={15} className="text-cyan-400" />
                Correlated Evidence Chain
              </span>
              <span className="text-[10px] text-cyan-400 font-bold">{visibleEvidence.length} Signals Captured</span>
            </div>

            <div className="space-y-2 font-mono text-[11px]">
              <AnimatePresence>
                {visibleEvidence.map((ev) => (
                  <motion.div
                    key={ev.id}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-2.5 bg-black/60 rounded-lg border border-white/[0.04] flex items-center justify-between hover:border-white/[0.1] transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="text-zinc-200 font-bold text-[11px] flex items-center gap-1.5">
                        <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                        {ev.title}
                      </div>
                      <span className="text-[9px] text-zinc-500">{ev.category}</span>
                    </div>

                    <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
                      {ev.metric}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>

              {visibleEvidence.length === 0 && (
                <div className="p-4 text-center text-zinc-600 italic text-[11px]">
                  Correlating initial signal traces...
                </div>
              )}
            </div>
          </GlassPanel>

          {/* 3. Peripheral Status Board */}
          <GlassPanel className="p-5 space-y-4 border-white/[0.06] bg-black/40">
            <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <HardDrive size={15} className="text-amber-400" /> Peripheral Status Board
              </span>
              <span className="text-[10px] text-zinc-500">AHB/APB Bus Map</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-[10px]">
              {PERIPHERALS.map((p, idx) => (
                <div key={idx} className="p-2.5 bg-black/60 rounded-lg border border-white/[0.04] space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">{p.name}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${p.color}`}>
                      {p.status}
                    </span>
                  </div>
                  <p className="text-[9px] text-zinc-500 truncate">{p.registerFlag}</p>
                </div>
              ))}
            </div>
          </GlassPanel>

        </div>

      </div>

    </div>
  );
}
