import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GlassPanel } from "../ui/glass-panel";
import { ValidationTest } from "../../types/analysis";
import { 
  CheckCircle2, 
  Play, 
  Terminal, 
  Cpu, 
  ShieldCheck, 
  Activity, 
  RotateCw, 
  FileCode, 
  Layers, 
  Zap, 
  AlertTriangle, 
  Check, 
  Sparkles, 
  Binary, 
  Clock, 
  Server,
  BarChart3,
  ShieldAlert,
  Sliders,
  Maximize2
} from "lucide-react";

interface ValidationViewProps {
  tests: ValidationTest[];
}

interface TestCase {
  id: string;
  name: string;
  file: string;
  duration: string;
  status: "PASS" | "RUNNING" | "PENDING";
  coverage: number;
}

const UNIT_TESTS: TestCase[] = [
  { id: "ut-1", name: "test_dma_null_callback_guard", file: "test_dma_controller.c", duration: "0.14 ms", status: "PASS", coverage: 100 },
  { id: "ut-2", name: "test_dma_interrupt_flag_clear_on_fault", file: "test_dma_controller.c", duration: "0.22 ms", status: "PASS", coverage: 96 },
  { id: "ut-3", name: "test_uart_rx_ringbuffer_alignment", file: "test_uart_driver.c", duration: "0.08 ms", status: "PASS", coverage: 100 },
  { id: "ut-4", name: "test_nvic_priority_grouping_cortex_m4", file: "test_nvic.c", duration: "0.05 ms", status: "PASS", coverage: 98 },
];

const INTEGRATION_TESTS: TestCase[] = [
  { id: "it-1", name: "int_dma2_usart3_burst_rx_stress_115200baud", file: "integration_uart_dma.c", duration: "1.42 ms", status: "PASS", coverage: 97 },
  { id: "it-2", name: "int_circular_buffer_wrap_around_race_condition", file: "integration_ringbuf.c", duration: "2.10 ms", status: "PASS", coverage: 95 },
  { id: "it-3", name: "int_dma_stream0_interrupt_latency_jitter", file: "integration_timing.c", duration: "0.85 ms", status: "PASS", coverage: 99 },
];

const STATIC_ANALYSIS_RULES = [
  { rule: "MISRA-C:2012 Rule 11.4", description: "Conversion between a pointer to object and a different pointer to object", result: "COMPLIANT", severity: "MANDATORY" },
  { rule: "MISRA-C:2012 Rule 17.7", description: "The value returned by a function shall be used", result: "COMPLIANT", severity: "REQUIRED" },
  { rule: "MISRA-C:2012 Rule 21.1", description: "Reserved identifiers, macros and functions shall not be defined", result: "COMPLIANT", severity: "REQUIRED" },
  { rule: "Clang-Tidy bugprone-null-pointer-dereference", description: "Checks for dereferences of null pointers in IRQ handlers", result: "PASSED (0 Warnings)", severity: "CRITICAL" },
];

export function ValidationView({ tests }: ValidationViewProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(100);
  const [activeStage, setActiveStage] = useState<number>(4); // 0: Idle, 1: Static, 2: Unit, 3: Integration, 4: Sim / Complete
  const [logs, setLogs] = useState<string[]>([
    "[BENCH-RUNNER] Booted hardware simulator on UART3 channel...",
    "[BENCH-RUNNER] Loading memory binary STM32F407VGTX.elf...",
    "[STATIC-ANALYSIS] MISRA-C:2012 checker passed (0 defects).",
    "[UNIT-TESTS] Executing GTest suite: 24/24 assertions passed.",
    "[INTEGRATION] DMA2 + USART3 high-frequency burst test successful.",
    "[HARDWARE-SIM] Renode Cortex-M4 core emulator trap counter: 0 HardFaults.",
    "[ASSERT-SUCCESS] Passed unit validation constraints. Zero faults.",
    "[VAL-FINISHED] Successfully completed post-patch validation test array."
  ]);

  const handleReRun = () => {
    if (isRunning) return;
    setIsRunning(true);
    setProgress(0);
    setActiveStage(1);
    setLogs(["[BENCH-RUNNER] Initializing fresh test bench suite replay..."]);

    const timeline = [
      {
        time: 800,
        stage: 1,
        progress: 25,
        log: "[STATIC-ANALYSIS] Running Clang-Tidy & MISRA-C:2012 static rules engine..."
      },
      {
        time: 1600,
        stage: 2,
        progress: 50,
        log: "[UNIT-TESTS] Running GTest suite on dma_controller.c & uart_driver.c..."
      },
      {
        time: 2600,
        stage: 3,
        progress: 75,
        log: "[INTEGRATION] Injecting high-frequency 115200 baud UART DMA RX stress bursts..."
      },
      {
        time: 3600,
        stage: 4,
        progress: 100,
        log: "[HARDWARE-SIM] Renode virtual core execution finished. 0 HardFaults captured."
      },
    ];

    timeline.forEach((step, index) => {
      setTimeout(() => {
        setProgress(step.progress);
        setActiveStage(step.stage);
        setLogs(prev => [...prev, step.log]);

        if (index === timeline.length - 1) {
          setTimeout(() => {
            setLogs(prev => [
              ...prev,
              "[ASSERT-SUCCESS] Passed all unit & integration validation constraints.",
              "[VAL-FINISHED] Test suite replay finished in 3.6 seconds. 100% PASS."
            ]);
            setIsRunning(false);
          }, 300);
        }
      }, step.time);
    });
  };

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-6 font-mono text-xs">
      
      {/* Overview & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/[0.04] pb-5">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-widest mb-1">
            <CheckCircle2 size={13} className="text-emerald-400" />
            Hardware-in-the-Loop Validation Suite
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Post-Patch Test Bench</h2>
          <p className="text-zinc-500 text-xs">
            Executing automated hardware-in-the-loop & static verification arrays on <span className="text-zinc-300 font-bold">STM32F407VGT6</span>
          </p>
        </div>

        <button 
          onClick={handleReRun}
          disabled={isRunning}
          className={`border h-11 px-6 rounded-xl transition-all duration-300 text-xs font-mono tracking-wider cursor-pointer flex items-center justify-center font-bold uppercase ${
            isRunning
              ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/40 animate-pulse cursor-wait"
              : "border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-400 hover:text-black text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)] active:scale-95"
          }`}
        >
          <RotateCw size={14} className={`mr-2 ${isRunning ? "animate-spin text-cyan-400" : ""}`} /> 
          {isRunning ? "Running Suite..." : "RE-RUN SUITE"}
        </button>
      </div>

      {/* Global Animated Progress Bar Barometer */}
      <GlassPanel className="p-4 space-y-3 border-white/[0.08] bg-black/50">
        <div className="flex justify-between items-center text-xs font-mono">
          <div className="flex items-center gap-2">
            <Activity size={14} className={isRunning ? "text-cyan-400 animate-spin" : "text-emerald-400"} />
            <span className="text-white font-bold uppercase tracking-wider">
              {isRunning ? `Suite Execution Phase ${activeStage}/4` : "Validation Suite Status"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-zinc-500 text-[10px]">Total Coverage: <strong className="text-emerald-400">98.4%</strong></span>
            <span className="text-cyan-400 font-extrabold">{progress}%</span>
          </div>
        </div>

        {/* Outer Bar */}
        <div className="h-2.5 bg-zinc-950 rounded-full overflow-hidden border border-white/[0.06] p-0.5 relative">
          <motion.div 
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 shadow-[0_0_12px_rgba(34,211,238,0.5)]" 
            initial={{ width: "100%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>

        {/* Phase Indicators */}
        <div className="grid grid-cols-4 gap-2 text-[9px] pt-1 border-t border-white/[0.03]">
          <div className={`flex items-center gap-1.5 ${activeStage >= 1 ? "text-cyan-400 font-bold" : "text-zinc-600"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${activeStage >= 1 ? "bg-cyan-400" : "bg-zinc-800"}`} />
            <span>1. Static Analysis</span>
          </div>
          <div className={`flex items-center gap-1.5 ${activeStage >= 2 ? "text-cyan-400 font-bold" : "text-zinc-600"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${activeStage >= 2 ? "bg-cyan-400" : "bg-zinc-800"}`} />
            <span>2. Unit Tests</span>
          </div>
          <div className={`flex items-center gap-1.5 ${activeStage >= 3 ? "text-cyan-400 font-bold" : "text-zinc-600"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${activeStage >= 3 ? "bg-cyan-400" : "bg-zinc-800"}`} />
            <span>3. Integration Tests</span>
          </div>
          <div className={`flex items-center gap-1.5 ${activeStage >= 4 ? "text-emerald-400 font-bold" : "text-zinc-600"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${activeStage >= 4 ? "bg-emerald-400" : "bg-zinc-800"}`} />
            <span>4. Hardware Sim</span>
          </div>
        </div>
      </GlassPanel>

      {/* Main Validation Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Unit Test Summary Panel */}
        <GlassPanel className="p-5 space-y-4 border-white/[0.06] bg-black/40">
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
            <div className="flex items-center gap-2 text-zinc-300 font-bold text-xs uppercase tracking-wider">
              <CheckCircle2 size={15} className="text-emerald-400" />
              Unit Test Suite (GTest / CppUTest)
            </div>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
              24 / 24 PASSED (100%)
            </span>
          </div>

          <div className="space-y-2.5">
            {UNIT_TESTS.map((ut) => (
              <div key={ut.id} className="p-2.5 bg-black/60 rounded-lg border border-white/[0.04] flex items-center justify-between hover:border-white/[0.1] transition-colors">
                <div className="space-y-0.5">
                  <div className="text-zinc-200 font-bold text-[11px] flex items-center gap-1.5">
                    <Check size={12} className="text-emerald-400" />
                    {ut.name}
                  </div>
                  <div className="text-[9px] text-zinc-500 flex gap-2">
                    <span>{ut.file}</span>
                    <span>•</span>
                    <span>Latency: {ut.duration}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-emerald-400 font-bold text-[10px] tracking-wider block">PASS</span>
                  <span className="text-zinc-500 text-[9px]">{ut.coverage}% Cov</span>
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>

        {/* 2. Integration Tests Panel */}
        <GlassPanel className="p-5 space-y-4 border-white/[0.06] bg-black/40">
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
            <div className="flex items-center gap-2 text-zinc-300 font-bold text-xs uppercase tracking-wider">
              <Layers size={15} className="text-cyan-400" />
              Peripheral Integration Array
            </div>
            <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
              3 / 3 STRESS PASSED
            </span>
          </div>

          <div className="space-y-2.5">
            {INTEGRATION_TESTS.map((it) => (
              <div key={it.id} className="p-2.5 bg-black/60 rounded-lg border border-white/[0.04] flex items-center justify-between hover:border-white/[0.1] transition-colors">
                <div className="space-y-0.5">
                  <div className="text-zinc-200 font-bold text-[11px] flex items-center gap-1.5">
                    <Zap size={12} className="text-cyan-400" />
                    {it.name}
                  </div>
                  <div className="text-[9px] text-zinc-500 flex gap-2">
                    <span>{it.file}</span>
                    <span>•</span>
                    <span>Burst Time: {it.duration}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-cyan-300 font-bold text-[10px] tracking-wider block">VERIFIED</span>
                  <span className="text-zinc-500 text-[9px]">{it.coverage}% Cov</span>
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>

        {/* 3. Hardware Simulation (Renode / QEMU) */}
        <GlassPanel className="p-5 space-y-4 border-white/[0.06] bg-black/40">
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
            <div className="flex items-center gap-2 text-zinc-300 font-bold text-xs uppercase tracking-wider">
              <Cpu size={15} className="text-amber-400" />
              Renode Hardware Core Emulator
            </div>
            <span className="text-emerald-400 text-[10px] font-bold font-mono">0 FAULTS TRAPPED</span>
          </div>

          <div className="space-y-3 font-mono text-[10px]">
            <div className="p-3 bg-zinc-950 rounded-lg border border-white/[0.04] space-y-2">
              <div className="flex justify-between text-zinc-400">
                <span>Core Target Clock Rate</span>
                <span className="text-white font-bold">168.00 MHz</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>DMA2 Stream0 Register State</span>
                <span className="text-emerald-400 font-bold">EN=1, TCIE=1, HTIE=0</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Memory Null-Dereference Traps</span>
                <span className="text-emerald-400 font-bold">0 Traps Captured</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Simulated Run Cycles</span>
                <span className="text-zinc-200 font-bold">1,842,000 Cycles (10.96 ms)</span>
              </div>
            </div>
          </div>
        </GlassPanel>

        {/* 4. Static Analysis Results (MISRA-C / Clang-Tidy) */}
        <GlassPanel className="p-5 space-y-4 border-white/[0.06] bg-black/40">
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
            <div className="flex items-center gap-2 text-zinc-300 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck size={15} className="text-emerald-400" />
              Static Analysis (MISRA-C:2012)
            </div>
            <span className="text-emerald-400 text-[10px] font-bold">100% COMPLIANT</span>
          </div>

          <div className="space-y-2 font-mono text-[10px]">
            {STATIC_ANALYSIS_RULES.map((rule, idx) => (
              <div key={idx} className="p-2 bg-zinc-950 rounded border border-white/[0.03] space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-cyan-400 font-bold">{rule.rule}</span>
                  <span className="text-emerald-400 font-bold text-[9px]">{rule.result}</span>
                </div>
                <p className="text-zinc-500 text-[9px] font-sans truncate">{rule.description}</p>
              </div>
            ))}
          </div>
        </GlassPanel>

      </div>

      {/* Test Log console */}
      <div className="space-y-2.5">
        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Terminal size={12} className="text-cyan-400" /> Test Bench Simulation Log Console
          </span>
          <span className="text-[9px] text-zinc-600">Streaming Telemetry Log Output</span>
        </div>

        <div className="bg-[#020202] rounded-xl p-4 border border-white/[0.06] font-mono text-[11px] space-y-1.5 max-h-[180px] overflow-y-auto">
          {logs.map((log, idx) => {
            const isFinished = log.includes("[VAL-FINISHED]") || log.includes("finished");
            const isSuccess = log.includes("[ASSERT-SUCCESS]") || log.includes("passed") || log.includes("successful");
            const isInfo = log.includes("[STATIC") || log.includes("[UNIT") || log.includes("[INTEGRATION") || log.includes("[HARDWARE");

            return (
              <div 
                key={idx}
                className={`${
                  isFinished 
                    ? "text-cyan-400 font-bold" 
                    : isSuccess 
                      ? "text-emerald-400 font-bold" 
                      : isInfo 
                        ? "text-zinc-300" 
                        : "text-zinc-500"
                }`}
              >
                {log}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
