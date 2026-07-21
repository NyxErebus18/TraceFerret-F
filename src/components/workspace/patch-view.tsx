import React, { useState } from "react";
import { GlassPanel } from "../ui/glass-panel";
import { Patch } from "../../types/analysis";
import { 
  FileCode, 
  CheckCircle, 
  Flame, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  Layers, 
  Code2, 
  Info, 
  Award, 
  ChevronRight, 
  Activity, 
  Sliders, 
  Zap, 
  ShieldAlert, 
  Check, 
  X, 
  BarChart3,
  Cpu
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PatchViewProps {
  patch: Patch;
  onApply: () => void;
}

export interface PatchCandidate {
  id: string;
  rank: number;
  title: string;
  file: string;
  recommended: boolean;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  riskScore: number; // 1 to 5
  confidence: number;
  summary: string;
  diff: string;
  tradeoffs: {
    pros: string[];
    cons: string[];
  };
  latencyImpact: string;
  memoryFootprint: string;
}

const CANDIDATES: PatchCandidate[] = [
  {
    id: "candidate-1",
    rank: 1,
    title: "Defensive Callback Guard & State Reset",
    file: "src/drivers/dma_controller.c",
    recommended: true,
    riskLevel: "LOW",
    riskScore: 1,
    confidence: 98,
    summary: "Verifies function pointer validity before dereferencing inside DMA interrupt context. Safely clears interrupt flags if unassigned.",
    diff: `--- a/src/drivers/dma_controller.c
+++ b/src/drivers/dma_controller.c
@@ -140,5 +140,8 @@ void DMA2_Stream0_IRQHandler(void) {
     DMA_HandleTypeDef *hdma = &ghDmaHandle;
     // Trigger transfer complete callback stream
-    hdma->XferCpltCallback(hdma);
+    if (hdma != NULL && hdma->XferCpltCallback != NULL) {
+        hdma->XferCpltCallback(hdma);
+    } else {
+        /* Clear interrupt flag safely without dereferencing */
+        DMA2->HIFCR = DMA_HIFCR_CTCIF0;
+    }`,
    tradeoffs: {
      pros: [
        "100% immune to NULL pointer HardFault traps",
        "Zero modifications to hardware clock or NVIC interrupt priority",
        "Backward compatible across STM32 HAL v1.7+",
        "Adds only 3 assembly instructions (Branch if Equal)"
      ],
      cons: [
        "Slightly delays IRQ exit if callback is legitimately NULL (2 clock cycles)"
      ]
    },
    latencyImpact: "+0.01 μs (Negligible)",
    memoryFootprint: "+16 Bytes Flash / 0 Bytes RAM"
  },
  {
    id: "candidate-2",
    rank: 2,
    title: "NVIC Priority Reschedule & Barrier Synchronization",
    file: "src/drivers/uart_driver.c",
    recommended: false,
    riskLevel: "MEDIUM",
    riskScore: 3,
    confidence: 82,
    summary: "Reorders callback binding before global IRQ enable line and inserts Arm Data Synchronization Barrier (__DSB).",
    diff: `--- a/src/drivers/uart_driver.c
+++ b/src/drivers/uart_driver.c
@@ -89,3 +89,4 font-mono
-  __enable_irq();
-  huart->hdmarx->XferCpltCallback = UART_DMAReceiveCplt;
+  huart->hdmarx->XferCpltCallback = UART_DMAReceiveCplt;
+  __DSB(); /* Ensure memory store completes before IRQ enable */
+  __enable_irq();`,
    tradeoffs: {
      pros: [
        "Eliminates the race condition window at the source driver function",
        "No runtime checks needed inside the ISR execution hot path"
      ],
      cons: [
        "Requires auditing all future call sites of UART_Receive_DMA()",
        "May alter interrupt timing for high-speed SPI/I2C peripherals on same bus"
      ]
    },
    latencyImpact: "0.00 μs",
    memoryFootprint: "+4 Bytes Flash / 0 Bytes RAM"
  },
  {
    id: "candidate-3",
    rank: 3,
    title: "Global Critical Section Spinlock Guard",
    file: "src/drivers/dma_controller.c",
    recommended: false,
    riskLevel: "HIGH",
    riskScore: 4,
    confidence: 68,
    summary: "Suppresses preemption globally with __disable_irq() during DMA callback registration and ISR execution.",
    diff: `--- a/src/drivers/dma_controller.c
+++ b/src/drivers/dma_controller.c
@@ -141,3 +141,6 @@ void DMA2_Stream0_IRQHandler(void) {
+    uint32_t primask = __get_PRIMASK();
+    __disable_irq();
     hdma->XferCpltCallback(hdma);
+    if (!primask) __enable_irq();`,
    tradeoffs: {
      pros: [
        "Guarantees atomicity across multi-core or multi-threaded RTOS environments"
      ],
      cons: [
        "Increases interrupt jitter across all other peripherals",
        "High risk of missing real-time deadlines in UART or CAN bus streams"
      ]
    },
    latencyImpact: "+1.85 μs (High Jitter Risk)",
    memoryFootprint: "+32 Bytes Flash / 0 Bytes RAM"
  }
];

export function PatchView({ patch, onApply }: PatchViewProps) {
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>("candidate-1");
  const [activeTab, setActiveTab] = useState<"patch" | "explanation" | "alternatives">("patch");
  const [isApplied, setIsApplied] = useState(false);

  const activeCandidate = CANDIDATES.find(c => c.id === selectedCandidateId) || CANDIDATES[0];

  const handleApplyClick = () => {
    setIsApplied(true);
    onApply();
  };

  const getRiskBadge = (risk: "LOW" | "MEDIUM" | "HIGH") => {
    switch (risk) {
      case "LOW":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "MEDIUM":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "HIGH":
        return "bg-red-500/10 text-red-400 border-red-500/30";
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-6 font-mono text-xs">
      
      {/* Top Header Action Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.04] pb-5">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-widest mb-1">
            <Sparkles size={13} className="animate-pulse" />
            Embedded Firmware Patch Optimization
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Code Corrective Candidates</h2>
          <p className="text-zinc-500 text-xs">
            Evaluated 3 automated patch strategies for target <span className="text-zinc-300 font-bold">STM32F407VGT6</span>
          </p>
        </div>

        <button 
          onClick={handleApplyClick}
          disabled={isApplied}
          className={`px-6 h-11 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center justify-center shrink-0 ${
            isApplied 
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 cursor-default" 
              : "bg-cyan-400 hover:bg-cyan-300 text-black font-black shadow-[0_0_20px_rgba(34,211,238,0.3)] active:scale-95"
          }`}
        >
          {isApplied ? (
            <>
              <CheckCircle size={15} className="mr-2" />
              Patch Applied & Synced
            </>
          ) : (
            <>
              <Flame size={15} className="mr-2" />
              Apply & Deploy {activeCandidate.recommended ? "Recommended" : ""} Patch
            </>
          )}
        </button>
      </div>

      {/* Primary Tab Navigation */}
      <div className="bg-zinc-950 p-1 rounded-xl border border-white/[0.06] flex items-center gap-1">
        <button
          onClick={() => setActiveTab("patch")}
          className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "patch"
              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_12px_rgba(34,211,238,0.15)]"
              : "text-zinc-500 hover:text-zinc-300 border border-transparent"
          }`}
        >
          <Code2 size={14} />
          Patch Candidates
        </button>

        <button
          onClick={() => setActiveTab("explanation")}
          className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "explanation"
              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_12px_rgba(34,211,238,0.15)]"
              : "text-zinc-500 hover:text-zinc-300 border border-transparent"
          }`}
        >
          <Info size={14} />
          Recommendation Explanation
        </button>

        <button
          onClick={() => setActiveTab("alternatives")}
          className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "alternatives"
              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_12px_rgba(34,211,238,0.15)]"
              : "text-zinc-500 hover:text-zinc-300 border border-transparent"
          }`}
        >
          <Sliders size={14} />
          Alternative Fixes Matrix
        </button>
      </div>

      {/* TAB 1: PATCH CANDIDATES & DIFF */}
      {activeTab === "patch" && (
        <div className="space-y-6">
          
          {/* Candidate Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CANDIDATES.map((candidate) => {
              const isSelected = candidate.id === selectedCandidateId;

              return (
                <GlassPanel
                  key={candidate.id}
                  onClick={() => setSelectedCandidateId(candidate.id)}
                  className={`p-4 space-y-3 cursor-pointer transition-all duration-200 relative overflow-hidden ${
                    isSelected
                      ? "border-cyan-500/80 bg-cyan-950/20 shadow-[0_0_16px_rgba(34,211,238,0.15)]"
                      : "border-white/[0.06] bg-black/40 hover:border-white/[0.2]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                        candidate.recommended
                          ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                          : "bg-zinc-900 text-zinc-500 border-zinc-800"
                      }`}>
                        RANK #{candidate.rank} {candidate.recommended ? "★ RECOMMENDED" : ""}
                      </span>
                    </div>

                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${getRiskBadge(candidate.riskLevel)}`}>
                      RISK: {candidate.riskLevel}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white tracking-tight">{candidate.title}</h4>
                    <p className="text-[10px] text-zinc-500 truncate mt-1">{candidate.file}</p>
                  </div>

                  <div className="pt-2 border-t border-white/[0.04] flex justify-between text-[10px] text-zinc-400">
                    <span>Confidence: <strong className="text-emerald-400">{candidate.confidence}%</strong></span>
                    <span>Latency: <strong className="text-zinc-200">{candidate.latencyImpact}</strong></span>
                  </div>

                  {isSelected && (
                    <div className="absolute top-0 right-0 w-3 h-3 bg-cyan-400 rounded-bl" />
                  )}
                </GlassPanel>
              );
            })}
          </div>

          {/* Why Recommended Callout Banner (if recommended selected) */}
          {activeCandidate.recommended && (
            <GlassPanel className="p-4 border-l-4 border-l-cyan-400 bg-cyan-950/20 space-y-1.5">
              <div className="flex items-center gap-2 text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                <Award size={14} /> Why Candidate #1 is Recommended
              </div>
              <p className="text-zinc-300 text-xs leading-relaxed font-sans">
                Candidate #1 provides defensive NULL-checking directly within the DMA stream interrupt handler. 
                It addresses the defect with <strong>LOW implementation risk</strong>, guarantees zero memory corruption, 
                and requires no changes to global MCU register configurations or interrupt priorities.
              </p>
            </GlassPanel>
          )}

          {/* Active Diff Code Viewer */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-500 font-mono px-1">
              <span className="flex items-center gap-2 font-bold text-zinc-300">
                <FileCode size={14} className="text-cyan-400" />
                {activeCandidate.file}
              </span>
              <span className="text-[10px] text-zinc-500">
                Unified Diff Preview ({activeCandidate.diff.split("\n").length} lines)
              </span>
            </div>

            <GlassPanel className="p-0 border border-white/[0.08] rounded-xl overflow-hidden font-mono text-xs">
              <div className="bg-zinc-950 px-4 py-2.5 border-b border-white/[0.06] text-zinc-400 font-semibold flex justify-between items-center text-[11px]">
                <span>{activeCandidate.file.split("/").pop()}</span>
                <span className="text-zinc-500 font-normal">Target: STM32F407VGT6</span>
              </div>

              <div className="p-4 overflow-x-auto space-y-0.5 leading-relaxed bg-[#020202]">
                {activeCandidate.diff.split("\n").map((line, i) => {
                  const isAdded = line.startsWith("+");
                  const isRemoved = line.startsWith("-");
                  const isHunkHeader = line.startsWith("@@");

                  return (
                    <div 
                      key={i} 
                      className={`-mx-4 px-4 font-mono ${
                        isAdded 
                          ? "bg-emerald-950/30 text-emerald-300 border-l-2 border-emerald-500 py-0.5 font-bold" 
                          : isRemoved 
                            ? "bg-red-950/30 text-red-400 border-l-2 border-red-500 py-0.5 line-through decoration-red-900" 
                            : isHunkHeader
                              ? "text-cyan-400/90 bg-cyan-950/20 py-1 border-y border-cyan-900/20 text-[10px]"
                              : "text-zinc-500"
                      }`}
                    >
                      {line}
                    </div>
                  );
                })}
              </div>
            </GlassPanel>
          </div>

          {/* Risk & Impact Metrics Meter */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <GlassPanel className="p-4 space-y-1.5 border-white/[0.06]">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Implementation Risk</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-black ${
                  activeCandidate.riskLevel === "LOW" ? "text-emerald-400" : activeCandidate.riskLevel === "MEDIUM" ? "text-amber-400" : "text-red-400"
                }`}>
                  {activeCandidate.riskLevel} ({activeCandidate.riskScore}/5)
                </span>
              </div>
              <p className="text-[10px] text-zinc-500">
                {activeCandidate.riskLevel === "LOW" ? "Minimal chance of regression" : "May impact timing or NVIC scheduling"}
              </p>
            </GlassPanel>

            <GlassPanel className="p-4 space-y-1.5 border-white/[0.06]">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">ISR Latency Impact</span>
              <div className="text-sm font-bold text-zinc-200">
                {activeCandidate.latencyImpact}
              </div>
              <p className="text-[10px] text-zinc-500">Execution overhead per interrupt trigger</p>
            </GlassPanel>

            <GlassPanel className="p-4 space-y-1.5 border-white/[0.06]">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Memory Delta</span>
              <div className="text-sm font-bold text-zinc-200">
                {activeCandidate.memoryFootprint}
              </div>
              <p className="text-[10px] text-zinc-500">Compiled Flash & Static RAM footprint</p>
            </GlassPanel>
          </div>

        </div>
      )}

      {/* TAB 2: EXPLANATION & ARCHITECTURAL JUSTIFICATION */}
      {activeTab === "explanation" && (
        <div className="space-y-6">
          <GlassPanel className="p-6 space-y-5 border-white/[0.08]">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm uppercase tracking-wider border-b border-white/[0.04] pb-3">
              <ShieldCheck size={18} />
              Architectural & Safety Justification
            </div>

            <div className="space-y-4 font-sans text-xs leading-relaxed text-zinc-300">
              <p>
                The TraceFerret static & dynamic telemetry core evaluated three potential resolution strategies. 
                Below is the comprehensive engineering reasoning for selecting <strong className="text-cyan-400 font-mono">Candidate #1 (Defensive Callback Guard)</strong> as the optimal fix.
              </p>

              <div className="space-y-3 pt-2 font-mono text-xs">
                <div className="p-4 bg-black/60 rounded-xl border border-white/[0.06] space-y-2">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    1. Zero Side-Effect Isolation
                  </h4>
                  <p className="text-zinc-400 text-[11px] font-sans">
                    Modifying the ISR in <code className="text-cyan-300">dma_controller.c</code> isolates the fix directly to the hardware event handler. It requires no changes to peripheral clock gates, DMA stream registers, or global interrupt flags in other modules.
                  </p>
                </div>

                <div className="p-4 bg-black/60 rounded-xl border border-white/[0.06] space-y-2">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    2. Graceful Degraded Mode
                  </h4>
                  <p className="text-zinc-400 text-[11px] font-sans">
                    In the event that a race condition occurs and the callback remains unassigned at the instant the DMA transfer finishes, Candidate #1 safely acknowledges and clears the <code className="text-amber-300">TCIF0</code> interrupt flag without executing a null pointer jump. The system continues operation without triggering a Cortex-M HardFault exception.
                  </p>
                </div>

                <div className="p-4 bg-black/60 rounded-xl border border-white/[0.06] space-y-2">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    3. Deterministic Real-Time Performance
                  </h4>
                  <p className="text-zinc-400 text-[11px] font-sans">
                    The assembly output introduces a single conditional branch instruction (<code className="text-cyan-300">CBZ / CBNZ</code>), adding less than 2 clock cycles (approx. 0.01 μs at 168MHz). This maintains real-time guarantees for adjacent high-priority timer interrupts.
                  </p>
                </div>
              </div>
            </div>
          </GlassPanel>
        </div>
      )}

      {/* TAB 3: ALTERNATIVE FIXES COMPARISON MATRIX */}
      {activeTab === "alternatives" && (
        <div className="space-y-6">
          <GlassPanel className="p-6 space-y-5 border-white/[0.08]">
            <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm uppercase tracking-wider">
                <Sliders size={18} />
                Alternative Patch Candidates Comparison Matrix
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">3 Candidates Evaluated</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-[11px]">
                <thead>
                  <tr className="border-b border-white/[0.08] text-zinc-500 uppercase text-[9px] tracking-wider">
                    <th className="py-2.5 px-3">Candidate</th>
                    <th className="py-2.5 px-3">Target File</th>
                    <th className="py-2.5 px-3">Implementation Risk</th>
                    <th className="py-2.5 px-3">Confidence</th>
                    <th className="py-2.5 px-3">Latency Delta</th>
                    <th className="py-2.5 px-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {CANDIDATES.map((cand) => (
                    <tr key={cand.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-white">{cand.title}</div>
                        {cand.recommended && (
                          <span className="text-[8px] font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                            ★ RECOMMENDED
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-zinc-400">{cand.file.split("/").pop()}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${getRiskBadge(cand.riskLevel)}`}>
                          {cand.riskLevel} ({cand.riskScore}/5)
                        </span>
                      </td>
                      <td className="py-3 px-3 text-emerald-400 font-bold">{cand.confidence}%</td>
                      <td className="py-3 px-3 text-zinc-300">{cand.latencyImpact}</td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => {
                            setSelectedCandidateId(cand.id);
                            setActiveTab("patch");
                          }}
                          className="text-xs text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          View Diff <ChevronRight size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassPanel>

          {/* Tradeoffs Deep Dive */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GlassPanel className="p-5 space-y-3 border-emerald-500/20 bg-emerald-950/10">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <Check size={14} /> Key Advantages of Candidate #1
              </div>
              <ul className="space-y-1.5 text-[11px] text-zinc-300">
                {CANDIDATES[0].tradeoffs.pros.map((pro, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </GlassPanel>

            <GlassPanel className="p-5 space-y-3 border-amber-500/20 bg-amber-950/10">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <AlertTriangle size={14} /> Alternative Considerations
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                Candidates #2 and #3 modify driver registration sequencing and NVIC interrupts. While functional, they pose higher risk of introducing subtle priority inversion bugs in real-time embedded systems.
              </p>
            </GlassPanel>
          </div>

        </div>
      )}

    </div>
  );
}
