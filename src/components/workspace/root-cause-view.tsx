import React, { useState } from "react";
import { GlassPanel } from "../ui/glass-panel";
import { 
  AlertCircle, 
  Terminal, 
  FileText, 
  Cpu, 
  Layers, 
  ShieldAlert, 
  CheckCircle2, 
  Activity, 
  ChevronRight, 
  Code2, 
  Database, 
  Zap, 
  Sparkles, 
  Clock, 
  Crosshair, 
  ListFilter, 
  CornerDownRight, 
  Binary,
  Maximize2,
  FileCode,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";
import { RootCause } from "../../types/analysis";
import { motion, AnimatePresence } from "motion/react";

interface RootCauseViewProps {
  rootCause: RootCause;
  mcu: string;
}

interface StackFrame {
  id: number;
  functionName: string;
  file: string;
  line: number;
  lr: string;
  pc: string;
  isFaultSite?: boolean;
}

interface CodeSnippet {
  file: string;
  path: string;
  startLine: number;
  lines: Array<{
    num: number;
    code: string;
    isFault?: boolean;
    annotation?: string;
    isBreakpoint?: boolean;
  }>;
}

const STACK_FRAMES: StackFrame[] = [
  {
    id: 0,
    functionName: "HardFault_Handler()",
    file: "stm32f4xx_it.c",
    line: 64,
    pc: "0x08000A12",
    lr: "0xFFFFFFF9",
  },
  {
    id: 1,
    functionName: "DMA2_Stream0_IRQHandler()",
    file: "dma_controller.c",
    line: 142,
    pc: "0x08001E44",
    lr: "0x080012A5",
    isFaultSite: true,
  },
  {
    id: 2,
    functionName: "HAL_DMA_IRQHandler()",
    file: "stm32f4xx_hal_dma.c",
    line: 382,
    pc: "0x080012A5",
    lr: "0x08000F80",
  },
  {
    id: 3,
    functionName: "USART3_IRQHandler()",
    file: "uart_driver.c",
    line: 91,
    pc: "0x08000F80",
    lr: "0x08000410",
  },
  {
    id: 4,
    functionName: "main()",
    file: "main.c",
    line: 108,
    pc: "0x08000410",
    lr: "0x00000000",
  },
];

const FILE_SNIPPETS: Record<string, CodeSnippet> = {
  "dma_controller.c": {
    file: "dma_controller.c",
    path: "src/drivers/dma_controller.c",
    startLine: 137,
    lines: [
      { num: 137, code: "void DMA2_Stream0_IRQHandler(void) {" },
      { num: 138, code: "  if (DMA2->HISR & DMA_HISR_TCIF0) {" },
      { num: 139, code: "    DMA2->HIFCR = DMA_HIFCR_CTCIF0;" },
      { num: 140, code: "    DMA_HandleTypeDef *hdma = &ghDmaHandle;" },
      { num: 141, code: "    // Trigger transfer complete callback stream" },
      { 
        num: 142, 
        code: "    hdma->XferCpltCallback(hdma);", 
        isFault: true, 
        annotation: "HardFault: hdma->XferCpltCallback is NULL (0x00000000)",
        isBreakpoint: true
      },
      { num: 143, code: "  }" },
      { num: 144, code: "}" },
    ],
  },
  "uart_driver.c": {
    file: "uart_driver.c",
    path: "src/drivers/uart_driver.c",
    startLine: 86,
    lines: [
      { num: 86, code: "HAL_StatusTypeDef UART_Receive_DMA(UART_HandleTypeDef *huart) {" },
      { num: 87, code: "  // Configure DMA stream register" },
      { num: 88, code: "  HAL_DMA_Start_IT(huart->hdmarx, ...);" },
      { num: 89, code: "  // DELAY BUG: Binding callback occurs AFTER interrupt enable" },
      { num: 90, code: "  __enable_irq();" },
      { num: 91, code: "  huart->hdmarx->XferCpltCallback = UART_DMAReceiveCplt;", annotation: "Late assignment occurs after DMA trigger" },
      { num: 92, code: "  return HAL_OK;" },
      { num: 93, code: "}" },
    ],
  },
  "stm32f4xx_it.c": {
    file: "stm32f4xx_it.c",
    path: "src/stm32f4xx_it.c",
    startLine: 60,
    lines: [
      { num: 60, code: "void HardFault_Handler(void) {" },
      { num: 61, code: "  /* Capture exception context registers */" },
      { num: 62, code: "  __asm volatile (" },
      { num: 63, code: "    \" tst lr, #4 \\n\"" },
      { num: 64, code: "    \" ite eq \\n\"" },
      { num: 65, code: "    \" mrseq r0, msp \\n\"" },
      { num: 66, code: "    \" mrsne r0, psp \\n\"" },
      { num: 67, code: "  );" },
      { num: 68, code: "  while (1) { /* Trap core */ }" },
      { num: 69, code: "}" },
    ],
  },
};

const EVIDENCE_CARDS = [
  {
    id: "evidence_1",
    title: "Uninitialized Callback Pointer",
    category: "RAM Dereference",
    description: "Function pointer `XferCpltCallback` inside `ghDmaHandle` struct evaluated to `0x00000000` (NULL) at time of invocation.",
    metric: "Addr: 0x200021C4 = 0x0",
    status: "CRITICAL",
    icon: ShieldAlert,
  },
  {
    id: "evidence_2",
    title: "DMA2 Stream0 FIFO Underrun",
    category: "Hardware Peripheral",
    description: "Hardware status register `DMA_HISR` bit `TCIF0` asserted before the software driver completed configuration sequence.",
    metric: "HISR = 0x00000020",
    status: "HARDWARE",
    icon: Cpu,
  },
  {
    id: "evidence_3",
    title: "NVIC Preemption Race Window",
    category: "Interrupt Priority",
    description: "DMA2_Stream0_IRQn (Priority 0x02) preempted UART initialization thread (Priority 0x05) by 1.18 microseconds.",
    metric: "Delta: +1.18 μs",
    status: "TIMING",
    icon: Clock,
  },
  {
    id: "evidence_4",
    title: "Bus Fault Address Trap",
    category: "Cortex-M Memory",
    description: "Configurable Fault Status Register `CFSR` logged `PRECISERR` (0x00000082) with invalid Memory Address Register `MMFAR`.",
    metric: "CFSR: 0x00000082",
    status: "FAULTRAP",
    icon: Binary,
  },
];

export function RootCauseView({ rootCause, mcu }: RootCauseViewProps) {
  const [selectedFrame, setSelectedFrame] = useState<number>(1);
  const [activeFile, setActiveFile] = useState<string>("dma_controller.c");

  const currentSnippet = FILE_SNIPPETS[activeFile] || FILE_SNIPPETS["dma_controller.c"];

  const handleFrameSelect = (frame: StackFrame) => {
    setSelectedFrame(frame.id);
    if (FILE_SNIPPETS[frame.file]) {
      setActiveFile(frame.file);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-6 font-mono text-xs">
      
      {/* Top Quick Statistics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <GlassPanel className="p-3 border-l-2 border-l-red-500 bg-red-950/20 flex flex-col justify-between">
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Defect Severity</span>
          <div className="text-red-400 font-extrabold text-xs mt-1 flex items-center gap-1">
            <ShieldAlert size={12} /> CRITICAL (HardFault)
          </div>
        </GlassPanel>

        <GlassPanel className="p-3 border-l-2 border-l-cyan-500 bg-black/40 flex flex-col justify-between">
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Fault Address</span>
          <div className="text-cyan-300 font-bold text-xs mt-1 font-mono">
            0x08001E44
          </div>
        </GlassPanel>

        <GlassPanel className="p-3 border-l-2 border-l-amber-500 bg-black/40 flex flex-col justify-between">
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Latency / Cycles</span>
          <div className="text-amber-400 font-bold text-xs mt-1">
            142 Cycles (1.18 μs)
          </div>
        </GlassPanel>

        <GlassPanel className="p-3 border-l-2 border-l-emerald-500 bg-black/40 flex flex-col justify-between">
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Confidence Score</span>
          <div className="text-emerald-400 font-extrabold text-xs mt-1 flex items-center gap-1">
            <CheckCircle2 size={12} /> 96.4% Verified
          </div>
        </GlassPanel>

        <GlassPanel className="p-3 border-l-2 border-l-zinc-600 bg-black/40 hidden lg:flex flex-col justify-between">
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Target Architecture</span>
          <div className="text-zinc-300 font-bold text-[11px] truncate mt-1">
            {mcu}
          </div>
        </GlassPanel>
      </div>

      {/* Main Overview & Confidence Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Primary Root Cause Summary Card */}
        <GlassPanel className="lg:col-span-8 p-6 border-red-500/20 bg-gradient-to-br from-red-950/20 via-black/60 to-black/80 space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl shrink-0 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <AlertCircle size={22} />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-red-400 font-bold tracking-widest uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  Primary Root Cause Analysis
                </span>
                <span className="text-[10px] text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-white/[0.06]">
                  ISO 26262 Diagnostic
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
                {rootCause.summary}
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans pt-1">
                {rootCause.impact}
              </p>
            </div>
          </div>
        </GlassPanel>

        {/* Multi-Factor Confidence Breakdown */}
        <GlassPanel className="lg:col-span-4 p-5 space-y-3 bg-black/50 border-white/[0.06]">
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-2.5">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={12} className="text-cyan-400" />
              Confidence Breakdown
            </span>
            <span className="text-[10px] font-bold text-cyan-400">96.4%</span>
          </div>

          <div className="space-y-2.5 text-[10px]">
            {/* Factor 1 */}
            <div className="space-y-1">
              <div className="flex justify-between text-zinc-400">
                <span>Signal Correlation</span>
                <span className="text-emerald-400 font-bold">98.2%</span>
              </div>
              <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: "98.2%" }} />
              </div>
            </div>

            {/* Factor 2 */}
            <div className="space-y-1">
              <div className="flex justify-between text-zinc-400">
                <span>DWARF Symbol Mapping</span>
                <span className="text-cyan-400 font-bold">95.0%</span>
              </div>
              <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400 rounded-full" style={{ width: "95%" }} />
              </div>
            </div>

            {/* Factor 3 */}
            <div className="space-y-1">
              <div className="flex justify-between text-zinc-400">
                <span>Register State Alignment</span>
                <span className="text-amber-400 font-bold">96.0%</span>
              </div>
              <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: "96%" }} />
              </div>
            </div>
          </div>
        </GlassPanel>

      </div>

      {/* Debugger Midsection: Source Code Viewer & Stack / Register Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 cols): Highlighted Source Code Viewer */}
        <GlassPanel className="lg:col-span-8 p-0 overflow-hidden border-white/[0.08] flex flex-col">
          
          {/* Code Header Bar & File Tabs */}
          <div className="bg-zinc-950 border-b border-white/[0.06] p-2 px-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {Object.keys(FILE_SNIPPETS).map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFile(f)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeFile === f
                      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold"
                      : "text-zinc-500 hover:text-zinc-300 border border-transparent"
                  }`}
                >
                  <FileCode size={12} />
                  {f}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>FAULT AT LINE 142</span>
            </div>
          </div>

          {/* Code Viewer Body */}
          <div className="bg-[#030303] p-4 font-mono text-xs overflow-x-auto leading-relaxed space-y-1 text-zinc-300 min-h-[220px]">
            <div className="text-[10px] text-zinc-600 pb-2 border-b border-white/[0.03] flex justify-between">
              <span>Path: {currentSnippet.path}</span>
              <span>Cortex-M Disassembly Mode: Active</span>
            </div>

            {currentSnippet.lines.map((l) => (
              <div key={l.num} className="space-y-1">
                <div
                  className={`flex items-start gap-3 px-2 py-1 rounded transition-colors ${
                    l.isFault
                      ? "bg-red-950/40 border-l-2 border-l-red-500 text-white font-bold"
                      : "hover:bg-zinc-900/50"
                  }`}
                >
                  {/* Line Number */}
                  <span className={`w-8 text-right shrink-0 select-none ${
                    l.isFault ? "text-red-400 font-bold" : "text-zinc-600"
                  }`}>
                    {l.num}
                  </span>

                  {/* Indicator Icon */}
                  <span className="w-4 shrink-0">
                    {l.isFault ? (
                      <span className="text-red-400 font-black animate-pulse">&gt;&gt;</span>
                    ) : l.isBreakpoint ? (
                      <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                    ) : (
                      <span className="text-zinc-800">|</span>
                    )}
                  </span>

                  {/* Code Line */}
                  <span className={`flex-1 ${l.isFault ? "text-red-200" : "text-zinc-300"}`}>
                    {l.code}
                  </span>
                </div>

                {/* Inline Register Annotation Bubble */}
                {l.annotation && (
                  <motion.div 
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="ml-14 my-1 p-2 bg-red-950/60 border border-red-500/40 rounded-lg text-[10px] text-red-300 font-mono flex items-center gap-2"
                  >
                    <AlertTriangle size={12} className="text-red-400 shrink-0" />
                    <span>{l.annotation}</span>
                  </motion.div>
                )}
              </div>
            ))}
          </div>

          {/* Footer Bar */}
          <div className="bg-zinc-950 border-t border-white/[0.04] p-2.5 px-4 flex items-center justify-between text-[10px] text-zinc-500">
            <div className="flex items-center gap-2">
              <Terminal size={12} className="text-cyan-400" />
              <span>GDB Debugger Session: Linked to DWARF Symbols</span>
            </div>
            <span className="text-emerald-400 font-bold">DWARF_OK</span>
          </div>

        </GlassPanel>

        {/* Right Column (4 cols): Call Stack Hierarchy & Exception Registers */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Call Stack Hierarchy Panel */}
          <GlassPanel className="p-4 space-y-3 border-white/[0.06]">
            <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers size={12} className="text-amber-400" />
                Call Stack Hierarchy
              </span>
              <span className="text-[9px] text-zinc-500">{STACK_FRAMES.length} Frames</span>
            </div>

            <div className="space-y-1.5 font-mono">
              {STACK_FRAMES.map((frame) => {
                const isSelected = selectedFrame === frame.id;

                return (
                  <div
                    key={frame.id}
                    onClick={() => handleFrameSelect(frame)}
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                      frame.isFaultSite
                        ? "bg-red-950/30 border-red-500/50 hover:border-red-500/80"
                        : isSelected
                          ? "bg-cyan-950/30 border-cyan-500/50"
                          : "bg-black/40 border-white/[0.04] hover:border-white/[0.1]"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className={`font-bold ${
                        frame.isFaultSite ? "text-red-400" : isSelected ? "text-cyan-300" : "text-zinc-200"
                      }`}>
                        #{frame.id} {frame.functionName}
                      </span>
                      {frame.isFaultSite && (
                        <span className="bg-red-500/20 text-red-400 text-[8px] font-bold px-1.5 py-0.5 rounded">
                          FAULT
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center text-[9px] text-zinc-500 mt-1">
                      <span>{frame.file}:{frame.line}</span>
                      <span className="text-zinc-600">PC: {frame.pc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassPanel>

          {/* Fault Register Summary */}
          <GlassPanel className="p-4 space-y-3 border-white/[0.06]">
            <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu size={12} className="text-cyan-400" />
                Fault Register Summary
              </span>
              <span className="text-[9px] text-emerald-400 font-mono">Cortex-M4</span>
            </div>

            <div className="space-y-2 font-mono text-[10px] text-zinc-400">
              <div className="flex justify-between border-b border-white/[0.02] pb-1">
                <span className="text-zinc-500">CFSR (Configurable Fault)</span>
                <span className="text-red-400 font-bold">0x00000082</span>
              </div>
              <div className="flex justify-between border-b border-white/[0.02] pb-1">
                <span className="text-zinc-500">HFSR (Hard Fault)</span>
                <span className="text-red-400 font-bold">0x40000000</span>
              </div>
              <div className="flex justify-between border-b border-white/[0.02] pb-1">
                <span className="text-zinc-500">BFAR (Bus Fault Addr)</span>
                <span className="text-amber-300 font-bold">0x200021C4</span>
              </div>
              <div className="flex justify-between border-b border-white/[0.02] pb-1">
                <span className="text-zinc-500">PC (Program Counter)</span>
                <span className="text-zinc-200">0x08001E44</span>
              </div>
              <div className="flex justify-between border-b border-white/[0.02] pb-1">
                <span className="text-zinc-500">LR (Link Register)</span>
                <span className="text-zinc-200">0x080012A5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">SP (Stack Pointer)</span>
                <span className="text-zinc-200">0x20007FA0</span>
              </div>
            </div>
          </GlassPanel>

        </div>

      </div>

      {/* Supporting Evidence Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Database size={12} className="text-cyan-400" />
            Supporting Hardware Evidence Cards
          </span>
          <span className="text-[10px] text-zinc-500">4 Telemetry Factors</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {EVIDENCE_CARDS.map((card) => {
            const IconComponent = card.icon;

            return (
              <GlassPanel key={card.id} className="p-4 space-y-2 border-white/[0.06] hover:border-cyan-500/30 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded">
                    {card.status}
                  </span>
                  <IconComponent size={14} className="text-zinc-500" />
                </div>
                <h4 className="text-xs font-bold text-white tracking-tight">{card.title}</h4>
                <p className="text-[10px] text-zinc-500 leading-relaxed">
                  {card.description}
                </p>
                <div className="pt-2 border-t border-white/[0.03] text-[9px] font-mono text-zinc-400 flex justify-between">
                  <span>Register State:</span>
                  <span className="text-cyan-300 font-bold">{card.metric}</span>
                </div>
              </GlassPanel>
            );
          })}
        </div>
      </div>

      {/* Technical Narrative Analysis Box */}
      <GlassPanel className="p-6 space-y-3 border-white/[0.06]">
        <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
          <Terminal size={14} className="text-cyan-400" /> Technical Narrative Analysis
        </div>
        <p className="text-xs text-zinc-300 leading-relaxed font-sans">
          The logic trace indicates a race window between <span className="text-cyan-400 font-mono">USART3_RX</span> DMA startup 
          and handle initialization. During high-frequency burst transmissions, the DMA interrupt triggers 
          the transfer complete flag before the callback pointer is bound in <span className="text-zinc-200 font-mono">uart_driver.c:91</span>. 
          As a result, the interrupt handler attempts to invoke an unmapped null memory address (<span className="text-red-400 font-mono">0x00000000</span>), initiating the hard fault state instantly.
        </p>
      </GlassPanel>

    </div>
  );
}
