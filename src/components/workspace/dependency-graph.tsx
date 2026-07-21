import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileCode, 
  Layers, 
  Cpu, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  ChevronRight, 
  Info,
  ShieldAlert,
  ArrowDown
} from "lucide-react";

export interface GraphNode {
  id: string;
  label: string;
  filePath: string;
  layer: "main" | "drivers" | "hal" | "peripherals" | "headers";
  description: string;
  functions?: string[];
  registers?: string[];
  revealAtStep: number;
  isSuspected?: boolean;
  suspectedAtStep?: number;
  confidenceScore?: number;
  defectReason?: string;
}

const GRAPH_NODES: GraphNode[] = [
  // Layer 1: Main
  {
    id: "main",
    label: "main.c",
    filePath: "src/main.c",
    layer: "main",
    description: "System entry point, clock setup & peripheral initialization sequence.",
    functions: ["main()", "SystemClock_Config()", "MX_DMA_Init()"],
    revealAtStep: 0,
    confidenceScore: 5,
  },

  // Layer 2: Drivers
  {
    id: "dma_controller",
    label: "dma_controller.c",
    filePath: "src/drivers/dma_controller.c",
    layer: "drivers",
    description: "Circular buffer DMA transfer coordinator for high-speed UART telemetry.",
    functions: ["DMA_Start_Transfer()", "DMA_ISR_Handler()", "RingBuffer_Push()"],
    registers: ["DMA2_Stream0->CR", "DMA2_Stream0->NDTR", "DMA2_Stream0->PAR"],
    revealAtStep: 1,
    isSuspected: true,
    suspectedAtStep: 3,
    confidenceScore: 94,
    defectReason: "Unchecked NDTR decrements cause circular ring buffer pointer overflow during rapid UART RX bursts.",
  },
  {
    id: "uart_driver",
    label: "uart_driver.c",
    filePath: "src/drivers/uart_driver.c",
    layer: "drivers",
    description: "USART3 physical layer driver with interrupt line bindings.",
    functions: ["UART_Transmit_IT()", "UART_Receive_DMA()"],
    revealAtStep: 1,
    confidenceScore: 12,
  },

  // Layer 3: HAL
  {
    id: "stm32_hal_dma",
    label: "stm32f4xx_hal_dma.c",
    filePath: "Drivers/STM32F4xx_HAL_Driver/Src/stm32f4xx_hal_dma.c",
    layer: "hal",
    description: "Silicon HAL driver for DMA1/DMA2 streams and FIFO configurations.",
    functions: ["HAL_DMA_Init()", "HAL_DMA_Start_IT()", "HAL_DMA_IRQHandler()"],
    revealAtStep: 2,
    confidenceScore: 18,
  },
  {
    id: "stm32_hal_uart",
    label: "stm32f4xx_hal_uart.c",
    filePath: "Drivers/STM32F4xx_HAL_Driver/Src/stm32f4xx_hal_uart.c",
    layer: "hal",
    description: "Hardware Abstraction Layer for Universal Synchronous/Asynchronous Receiver Transmitter.",
    functions: ["HAL_UART_Init()", "HAL_UART_RxCpltCallback()"],
    revealAtStep: 2,
    confidenceScore: 8,
  },

  // Layer 4: Peripheral Layers
  {
    id: "dma2_stream0",
    label: "DMA2_Stream0 Peripheral",
    filePath: "Hardware/Peripherals/DMA2_Stream0",
    layer: "peripherals",
    description: "Hardware stream channel mapped to USART3_RX line on AHB1 bus.",
    registers: ["CR: 0x00012C40", "NDTR: 0x0000", "PAR: 0x40004804", "M0AR: 0x20001800"],
    revealAtStep: 3,
    isSuspected: true,
    suspectedAtStep: 4,
    confidenceScore: 88,
    defectReason: "FIFO error flag (FEIF0) set due to memory address alignment mismatch on M0AR register.",
  },
  {
    id: "usart3_regs",
    label: "USART3 Registers",
    filePath: "Hardware/Peripherals/USART3",
    layer: "peripherals",
    description: "Serial communication peripheral mapped on APB1 bus at 0x40004800.",
    registers: ["SR: 0x00000020 (RXNE)", "DR: 0x000000A5", "BRR: 0x00000271"],
    revealAtStep: 3,
    confidenceScore: 10,
  },

  // Layer 5: Headers
  {
    id: "stm32f407xx_h",
    label: "stm32f407xx.h",
    filePath: "Drivers/CMSIS/Device/ST/STM32F4xx/Include/stm32f407xx.h",
    layer: "headers",
    description: "CMSIS peripheral memory map register structures and bit definitions.",
    revealAtStep: 4,
    confidenceScore: 0,
  },
  {
    id: "core_cm4_h",
    label: "core_cm4.h",
    filePath: "Drivers/CMSIS/Include/core_cm4.h",
    layer: "headers",
    description: "Cortex-M4 core peripheral access layer and NVIC register layout.",
    revealAtStep: 4,
    confidenceScore: 0,
  }
];

const LAYERS = [
  { key: "main", title: "1. Main Entry", subtitle: "Application & Task Scheduler" },
  { key: "drivers", title: "2. Firmware Drivers", subtitle: "Subsystem Control Modules" },
  { key: "hal", title: "3. Hardware Abstraction (HAL)", subtitle: "Silicon API Bindings" },
  { key: "peripherals", title: "4. Peripheral Layers", subtitle: "Special Registers & AHB/APB Buses" },
  { key: "headers", title: "5. Headers & CMSIS", subtitle: "Memory Offset Definitions" },
] as const;

interface DependencyGraphProps {
  activeStepIndex: number;
  isComplete: boolean;
}

export function DependencyGraph({ activeStepIndex, isComplete }: DependencyGraphProps) {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(GRAPH_NODES[1]); // Default to dma_controller

  const getStatusColor = (node: GraphNode) => {
    const isRevealed = node.revealAtStep <= activeStepIndex || isComplete;
    if (!isRevealed) {
      return {
        bg: "bg-zinc-950/40",
        border: "border-zinc-800/40",
        text: "text-zinc-700",
        badge: "UNEXPLORED",
        badgeClass: "bg-zinc-900 text-zinc-700 border-zinc-800",
        glow: "",
      };
    }

    if (node.isSuspected && (activeStepIndex >= (node.suspectedAtStep ?? 3) || isComplete)) {
      return {
        bg: "bg-red-950/30",
        border: "border-red-500/60",
        text: "text-red-400",
        badge: `SUSPECTED (${node.confidenceScore}% CONFIDENCE)`,
        badgeClass: "bg-red-500/10 text-red-400 border-red-500/30 animate-pulse",
        glow: "shadow-[0_0_20px_rgba(244,63,94,0.25)]",
      };
    }

    if (node.revealAtStep === activeStepIndex && !isComplete) {
      return {
        bg: "bg-cyan-950/30",
        border: "border-cyan-500/80",
        text: "text-cyan-300",
        badge: "SCANNING MODULE",
        badgeClass: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 animate-pulse",
        glow: "shadow-[0_0_16px_rgba(34,211,238,0.2)]",
      };
    }

    return {
      bg: "bg-zinc-900/60",
      border: "border-emerald-500/30 hover:border-emerald-500/60",
      text: "text-emerald-400/90",
      badge: "VALIDATED",
      badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      glow: "",
    };
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-[#040404]">
      
      {/* Graph Visualizer Main Canvas */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-zinc-800 relative">
        
        {/* Subtle Background Mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(#22d3ee_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />

        {/* Legend Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-950/80 border border-white/[0.05] p-3 rounded-xl text-[10px] font-mono">
          <div className="flex items-center gap-2 text-zinc-400">
            <Layers size={13} className="text-cyan-400" />
            <span className="font-bold uppercase tracking-wider">Firmware Dependency Architecture</span>
          </div>

          <div className="flex items-center gap-4 text-[9px] uppercase">
            <span className="flex items-center gap-1.5 text-red-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              Suspected Defect
            </span>
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              Active Scan
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Validated
            </span>
            <span className="flex items-center gap-1.5 text-zinc-600">
              <span className="w-2 h-2 rounded-full bg-zinc-800" />
              Pending
            </span>
          </div>
        </div>

        {/* Vertical Flow Layers */}
        <div className="space-y-6 max-w-3xl mx-auto relative z-10 py-2">
          {LAYERS.map((layer, layerIdx) => {
            const layerNodes = GRAPH_NODES.filter((n) => n.layer === layer.key);

            return (
              <div key={layer.key} className="space-y-3">
                
                {/* Layer Heading Badge */}
                <div className="flex items-center gap-3">
                  <div className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest bg-zinc-900/90 border border-white/[0.06] px-3 py-1 rounded-md flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/80" />
                    {layer.title}
                  </div>
                  <div className="text-[10px] font-mono text-zinc-600 italic">
                    — {layer.subtitle}
                  </div>
                  <div className="flex-1 h-px bg-white/[0.04]" />
                </div>

                {/* Nodes Grid for this layer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2">
                  {layerNodes.map((node) => {
                    const status = getStatusColor(node);
                    const isRevealed = node.revealAtStep <= activeStepIndex || isComplete;
                    const isSelected = selectedNode?.id === node.id;

                    return (
                      <motion.div
                        key={node.id}
                        initial={{ opacity: 0, y: 12, scale: 0.98 }}
                        animate={{ 
                          opacity: isRevealed ? 1 : 0.4, 
                          y: 0, 
                          scale: isSelected ? 1.02 : 1 
                        }}
                        transition={{ duration: 0.4, delay: node.revealAtStep * 0.1 }}
                        onClick={() => setSelectedNode(node)}
                        className={`p-3.5 rounded-xl border ${status.bg} ${status.border} ${status.glow} cursor-pointer transition-all duration-300 relative group overflow-hidden`}
                      >
                        {/* Top Indicator */}
                        <div className="flex items-center justify-between mb-2 font-mono">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${status.badgeClass}`}>
                            {status.badge}
                          </span>
                          <span className="text-[9px] text-zinc-600 group-hover:text-zinc-400 transition-colors">
                            {node.layer.toUpperCase()}
                          </span>
                        </div>

                        {/* Node Label & File Path */}
                        <div className="flex items-start gap-2.5">
                          <div className={`p-2 rounded-lg bg-black/60 border border-white/[0.06] ${status.text}`}>
                            {node.layer === "peripherals" ? (
                              <Cpu size={16} />
                            ) : (
                              <FileCode size={16} />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className={`text-xs font-bold font-mono tracking-tight ${
                              node.isSuspected && (activeStepIndex >= (node.suspectedAtStep ?? 3) || isComplete)
                                ? "text-red-400 font-extrabold"
                                : "text-zinc-200"
                            }`}>
                              {node.label}
                            </h4>
                            <p className="text-[10px] font-mono text-zinc-500 truncate mt-0.5">
                              {node.filePath}
                            </p>
                          </div>
                        </div>

                        {/* Selected Indicator Glow */}
                        {isSelected && (
                          <motion.div 
                            layoutId="selectedGlow" 
                            className="absolute inset-0 border-2 border-cyan-400 rounded-xl pointer-events-none" 
                          />
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* Connecting Directional Arrow to next layer */}
                {layerIdx < LAYERS.length - 1 && (
                  <div className="flex items-center justify-center py-1">
                    <motion.div 
                      animate={{ y: [0, 2, 0] }} 
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="text-zinc-700 flex flex-col items-center gap-0.5"
                    >
                      <div className="w-px h-3 bg-gradient-to-b from-zinc-700 to-zinc-800" />
                      <ArrowDown size={12} className="text-zinc-700" />
                    </motion.div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </div>

      {/* Side Inspector Drawer for Selected Node */}
      <AnimatePresence mode="wait">
        {selectedNode && (
          <motion.div
            key={selectedNode.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-full lg:w-80 bg-zinc-950 border-t lg:border-t-0 lg:border-l border-white/[0.06] p-5 flex flex-col justify-between space-y-6 font-mono text-xs shrink-0"
          >
            <div className="space-y-5">
              {/* Header */}
              <div className="border-b border-white/[0.06] pb-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                    Module Inspector
                  </span>
                  {selectedNode.isSuspected && (activeStepIndex >= (selectedNode.suspectedAtStep ?? 3) || isComplete) && (
                    <span className="bg-red-500/10 text-red-400 border border-red-500/30 text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      <ShieldAlert size={10} /> FAULT SITE
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText size={14} className="text-cyan-400" />
                  {selectedNode.label}
                </h3>
                <p className="text-[10px] text-zinc-500 break-all">{selectedNode.filePath}</p>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                  Functional Purpose
                </span>
                <p className="text-zinc-300 text-[11px] leading-relaxed bg-black/40 p-3 rounded-lg border border-white/[0.04]">
                  {selectedNode.description}
                </p>
              </div>

              {/* Defect Reason if suspected */}
              {selectedNode.defectReason && selectedNode.isSuspected && (activeStepIndex >= (selectedNode.suspectedAtStep ?? 3) || isComplete) && (
                <div className="space-y-1.5 bg-red-950/20 border border-red-500/30 p-3 rounded-lg">
                  <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle size={12} /> Isolated Defect Mechanics
                  </span>
                  <p className="text-[11px] text-red-300/90 leading-relaxed">
                    {selectedNode.defectReason}
                  </p>
                </div>
              )}

              {/* Exposed Functions */}
              {selectedNode.functions && selectedNode.functions.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                    Exported Symbols / Functions
                  </span>
                  <div className="space-y-1 bg-black/40 p-2.5 rounded-lg border border-white/[0.04]">
                    {selectedNode.functions.map((fn, i) => (
                      <div key={i} className="text-[10px] text-cyan-400/90 flex items-center gap-1.5">
                        <ChevronRight size={10} className="text-zinc-600" />
                        <code>{fn}</code>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mapped Registers */}
              {selectedNode.registers && selectedNode.registers.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                    Hardware Registers
                  </span>
                  <div className="space-y-1 bg-black/40 p-2.5 rounded-lg border border-white/[0.04]">
                    {selectedNode.registers.map((reg, i) => (
                      <div key={i} className="text-[10px] text-emerald-400/90 flex items-center gap-1.5">
                        <ChevronRight size={10} className="text-zinc-600" />
                        <code>{reg}</code>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Metadata */}
            <div className="border-t border-white/[0.06] pt-3 text-[10px] text-zinc-600 space-y-1">
              <div className="flex justify-between">
                <span>Confidence Assessment:</span>
                <span className="text-zinc-300 font-bold">{selectedNode.confidenceScore}%</span>
              </div>
              <div className="flex justify-between">
                <span>DWARF Link Status:</span>
                <span className="text-emerald-400 font-bold">SYMBOLS LOADED</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
