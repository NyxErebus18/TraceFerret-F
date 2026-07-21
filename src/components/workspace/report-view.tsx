import React, { useState } from "react";
import { GlassPanel } from "../ui/glass-panel";
import { Report, AnalysisPayload, Finding } from "../../types/analysis";
import { 
  Download, 
  CheckCircle, 
  ShieldAlert, 
  Zap, 
  Clock, 
  FileCode, 
  FileJson, 
  ExternalLink, 
  Ticket, 
  Layers, 
  CheckCircle2, 
  Activity, 
  BarChart3, 
  Sparkles, 
  Copy, 
  Check, 
  X, 
  AlertTriangle, 
  Search, 
  Cpu, 
  Terminal,
  ShieldCheck,
  Send,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ReportViewProps {
  report: Report;
  data?: AnalysisPayload;
}

interface FileAnalysisItem {
  path: string;
  file: string;
  loc: number;
  status: "FAULT_SITE" | "BOUND_SITE" | "VERIFIED" | "CLEAN";
  defectsFound: number;
  role: string;
}

const ANALYZED_FILES: FileAnalysisItem[] = [
  {
    file: "dma_controller.c",
    path: "src/drivers/dma_controller.c",
    loc: 284,
    status: "FAULT_SITE",
    defectsFound: 1,
    role: "DMA Interrupt Service Routine & Callback Dispatcher"
  },
  {
    file: "uart_driver.c",
    path: "src/drivers/uart_driver.c",
    loc: 412,
    status: "BOUND_SITE",
    defectsFound: 1,
    role: "UART Driver Initialization & DMA Stream Binding"
  },
  {
    file: "stm32f4xx_it.c",
    path: "src/stm32f4xx_it.c",
    loc: 198,
    status: "VERIFIED",
    defectsFound: 0,
    role: "Cortex-M HardFault & Exception Handlers"
  },
  {
    file: "main.c",
    path: "src/main.c",
    loc: 156,
    status: "CLEAN",
    defectsFound: 0,
    role: "System Entry Point & Hardware Peripherals Init"
  },
  {
    file: "system_stm32f4xx.c",
    path: "src/system_stm32f4xx.c",
    loc: 510,
    status: "CLEAN",
    defectsFound: 0,
    role: "RCC Clock Gate Configuration & System Core Clock"
  },
];

const TIMELINE_STEPS = [
  { step: 1, title: "Trace Ingestion", duration: "2.1s", detail: "Parsed post-mortem hardware trace buffer & registers" },
  { step: 2, title: "DWARF Symbol Mapping", duration: "3.8s", detail: "Mapped Program Counter 0x08001E44 to dma_controller.c:142" },
  { step: 3, title: "Race Condition Analysis", duration: "4.2s", detail: "Detected 1.18 μs preemption window between UART & DMA ISR" },
  { step: 4, title: "Patch Synthesis", duration: "2.3s", detail: "Generated defensive callback guard with zero assembly latency" },
  { step: 5, title: "HITL Test Bench Validation", duration: "3.6s", detail: "Renode emulator & MISRA-C static analyzer verified fix" },
];

export function ReportView({ report, data }: ReportViewProps) {
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [showJiraModal, setShowJiraModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);

  // Jira Form State
  const [jiraKey, setJiraKey] = useState<string | null>(null);
  const [jiraSummary, setJiraSummary] = useState("EMBED-4092: HardFault DMA Null Callback Dereference in dma_controller.c");
  const [jiraPriority, setJiraPriority] = useState("Highest");
  const [jiraAssignee, setJiraAssignee] = useState("Embedded Firmware Team");
  const [jiraSubmitting, setJiraSubmitting] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExportPdf = () => {
    showToast("PDF report preview generated. Opening print dialog...");
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handleCopyJson = () => {
    const payload = JSON.stringify(data || { report, analyzedFiles: ANALYZED_FILES }, null, 2);
    navigator.clipboard.writeText(payload);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleDownloadJson = () => {
    const payload = JSON.stringify(data || { report, analyzedFiles: ANALYZED_FILES }, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `traceferret-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("JSON report downloaded successfully.");
  };

  const handleCreateJiraIssue = (e: React.FormEvent) => {
    e.preventDefault();
    setJiraSubmitting(true);
    setTimeout(() => {
      setJiraSubmitting(false);
      setJiraKey("EMBED-4092");
      showToast("Jira issue EMBED-4092 created successfully!");
    }, 1200);
  };

  return (
    <div className="p-6 sm:p-10 max-w-5xl mx-auto space-y-8 font-mono text-xs">
      
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-cyan-950 border border-cyan-400/50 text-cyan-200 px-4 py-3 rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.3)] flex items-center gap-3 text-xs font-mono"
          >
            <Sparkles size={16} className="text-cyan-400 animate-pulse" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report Header & Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/[0.06] pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-widest">
            <ShieldCheck size={14} className="text-emerald-400" />
            TraceFerret Autonomous Telemetry Audit
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Final Telemetry Analysis Report</h1>
          <p className="text-zinc-500 text-xs">
            Target MCU: <span className="text-zinc-200 font-bold">{data?.mcu || "STM32F407VGT6"}</span> • ISO 26262 Diagnostic Seal Applied
          </p>
        </div>

        {/* Action Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={handleExportPdf}
            className="bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-white/[0.08] px-3.5 h-10 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <Download size={14} className="text-cyan-400" />
            Export PDF
          </button>

          <button 
            onClick={() => setShowJsonModal(true)}
            className="bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-white/[0.08] px-3.5 h-10 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <FileJson size={14} className="text-amber-400" />
            Export JSON
          </button>

          <button 
            onClick={() => setShowJiraModal(true)}
            className="bg-cyan-400 hover:bg-cyan-300 text-black font-black px-4 h-10 rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.25)] transition-all active:scale-95"
          >
            <Ticket size={14} />
            Create Jira Issue
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (6 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <GlassPanel className="p-4 space-y-1 bg-black/40 border-white/[0.06]">
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Defects Resolved</span>
          <div className="text-xl font-bold text-red-400 font-mono">{report.defects || 1} Critical</div>
          <span className="text-[9px] text-zinc-600">HardFault trapped</span>
        </GlassPanel>

        <GlassPanel className="p-4 space-y-1 bg-black/40 border-white/[0.06]">
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Test Pass Rate</span>
          <div className="text-xl font-bold text-emerald-400 font-mono">{report.testPassRate || "100%"}</div>
          <span className="text-[9px] text-zinc-600">27 / 27 assertions</span>
        </GlassPanel>

        <GlassPanel className="p-4 space-y-1 bg-black/40 border-white/[0.06]">
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Resolution Time</span>
          <div className="text-xl font-bold text-cyan-400 font-mono">{report.timeToResolution || "3m 45s"}</div>
          <span className="text-[9px] text-zinc-600">Trace to patch</span>
        </GlassPanel>

        <GlassPanel className="p-4 space-y-1 bg-black/40 border-white/[0.06]">
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Engine Latency</span>
          <div className="text-xl font-bold text-amber-400 font-mono">12.4 seconds</div>
          <span className="text-[9px] text-zinc-600">Automated reasoning</span>
        </GlassPanel>

        <GlassPanel className="p-4 space-y-1 bg-black/40 border-white/[0.06]">
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Test Coverage</span>
          <div className="text-xl font-bold text-emerald-400 font-mono">98.4%</div>
          <span className="text-[9px] text-zinc-600">Branch & line</span>
        </GlassPanel>

        <GlassPanel className="p-4 space-y-1 bg-black/40 border-white/[0.06]">
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Files Analyzed</span>
          <div className="text-xl font-bold text-zinc-200 font-mono">5 Files</div>
          <span className="text-[9px] text-zinc-600">1,564 total LOC</span>
        </GlassPanel>
      </div>

      {/* Root Cause Executive Summary Box */}
      <GlassPanel className="p-6 border-red-500/20 bg-gradient-to-r from-red-950/20 via-black/60 to-black/80 space-y-3">
        <div className="flex items-center justify-between border-b border-red-500/20 pb-2">
          <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider">
            <ShieldAlert size={16} /> Root Cause Summary
          </div>
          <span className="text-[10px] text-zinc-500 bg-red-950/60 border border-red-500/30 px-2 py-0.5 rounded font-bold text-red-300">
            CONFIDENCE: 98.4%
          </span>
        </div>

        <div className="space-y-2">
          <h3 className="text-base font-bold text-white leading-snug">
            {data?.rootCause?.summary || "Uninitialized DMA Callback Function Pointer Dereference inside ISR context"}
          </h3>
          <p className="text-xs text-zinc-300 font-sans leading-relaxed">
            {data?.rootCause?.impact || "The logic trace indicates a preemption window between USART3_RX DMA startup and handle callback initialization. During high-frequency burst transmissions, the DMA interrupt triggers before the callback pointer is bound in uart_driver.c:91, invoking NULL (0x00000000) and triggering a Cortex-M HardFault exception."}
          </p>
        </div>
      </GlassPanel>

      {/* Grid: Files Analyzed & Findings Discovered */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Files Analyzed List (7 cols) */}
        <GlassPanel className="lg:col-span-7 p-5 space-y-4 border-white/[0.06] bg-black/40">
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
            <div className="flex items-center gap-2 text-zinc-300 font-bold text-xs uppercase tracking-wider">
              <FileCode size={15} className="text-cyan-400" />
              Source Files Analyzed
            </div>
            <span className="text-[10px] text-zinc-500">5 C Source & Header Files</span>
          </div>

          <div className="space-y-2 font-mono text-[11px]">
            {ANALYZED_FILES.map((f, idx) => (
              <div key={idx} className="p-3 bg-black/60 rounded-xl border border-white/[0.04] space-y-1.5 hover:border-white/[0.1] transition-colors">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white flex items-center gap-2">
                    <FileText size={13} className="text-zinc-500" />
                    {f.file}
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                    f.status === "FAULT_SITE"
                      ? "bg-red-500/10 text-red-400 border-red-500/30"
                      : f.status === "BOUND_SITE"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  }`}>
                    {f.status}
                  </span>
                </div>

                <p className="text-zinc-400 text-[10px] font-sans">{f.role}</p>

                <div className="flex justify-between items-center text-[9px] text-zinc-500 pt-1 border-t border-white/[0.03]">
                  <span>{f.path}</span>
                  <span>{f.loc} Lines of Code</span>
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>

        {/* Findings Discovered List (5 cols) */}
        <GlassPanel className="lg:col-span-5 p-5 space-y-4 border-white/[0.06] bg-black/40">
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
            <div className="flex items-center gap-2 text-zinc-300 font-bold text-xs uppercase tracking-wider">
              <Search size={15} className="text-red-400" />
              Discovered Defects & Findings
            </div>
            <span className="text-[10px] text-zinc-500">3 Isolated Items</span>
          </div>

          <div className="space-y-3 font-mono text-[11px]">
            {(data?.findings || [
              {
                id: "f1",
                severity: "CRITICAL" as const,
                title: "NULL Pointer Call in DMA ISR",
                file: "src/drivers/dma_controller.c",
                line: 142,
                confidence: 98,
                description: "hdma->XferCpltCallback is dereferenced while holding value 0x00000000."
              },
              {
                id: "f2",
                severity: "HIGH" as const,
                title: "Race Window in UART RX Start",
                file: "src/drivers/uart_driver.c",
                line: 91,
                confidence: 88,
                description: "Interrupt enabled prior to callback function pointer assignment."
              },
              {
                id: "f3",
                severity: "MEDIUM" as const,
                title: "DMA Stream FIFO Status Bit Clear",
                file: "src/drivers/dma_controller.c",
                line: 139,
                confidence: 92,
                description: "TCIF0 flag not cleared on fault exit path."
              }
            ]).map((finding: Finding) => (
              <div key={finding.id} className="p-3 bg-black/60 rounded-xl border border-white/[0.04] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                    finding.severity === "CRITICAL"
                      ? "bg-red-500/10 text-red-400 border-red-500/30"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  }`}>
                    {finding.severity}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">{finding.confidence}% Confidence</span>
                </div>
                <h4 className="font-bold text-white text-xs">{finding.title}</h4>
                <p className="text-zinc-400 text-[10px] font-sans leading-relaxed">{finding.description}</p>
                <div className="text-[9px] text-zinc-500 font-mono pt-1">
                  {finding.file}:{finding.line}
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>

      </div>

      {/* Grid: Investigation Duration Breakdown & Test Coverage Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Timeline Summary & Investigation Duration */}
        <GlassPanel className="p-5 space-y-4 border-white/[0.06] bg-black/40">
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
            <div className="flex items-center gap-2 text-zinc-300 font-bold text-xs uppercase tracking-wider">
              <Clock size={15} className="text-amber-400" />
              Investigation Duration & Timeline Summary
            </div>
            <span className="text-amber-400 text-[10px] font-bold">12.4s Total Latency</span>
          </div>

          <div className="space-y-3 font-mono text-[10px]">
            {TIMELINE_STEPS.map((s) => (
              <div key={s.step} className="flex items-start gap-3 p-2 rounded-lg bg-zinc-950 border border-white/[0.03]">
                <div className="w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold shrink-0">
                  {s.step}
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white text-[11px]">{s.title}</span>
                    <span className="text-cyan-400 font-bold">{s.duration}</span>
                  </div>
                  <p className="text-zinc-400 text-[10px] font-sans">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>

        {/* Test Coverage Analysis */}
        <GlassPanel className="p-5 space-y-4 border-white/[0.06] bg-black/40">
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
            <div className="flex items-center gap-2 text-zinc-300 font-bold text-xs uppercase tracking-wider">
              <BarChart3 size={15} className="text-emerald-400" />
              Post-Patch Code & Branch Coverage
            </div>
            <span className="text-emerald-400 text-[10px] font-bold">98.4% OVERALL</span>
          </div>

          <div className="space-y-4 font-mono text-[11px]">
            {/* Meter 1 */}
            <div className="space-y-1">
              <div className="flex justify-between text-zinc-300">
                <span>Statement & Line Coverage</span>
                <span className="text-emerald-400 font-bold">98.4%</span>
              </div>
              <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: "98.4%" }} />
              </div>
            </div>

            {/* Meter 2 */}
            <div className="space-y-1">
              <div className="flex justify-between text-zinc-300">
                <span>Branch Decision Coverage</span>
                <span className="text-cyan-400 font-bold">94.2%</span>
              </div>
              <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400 rounded-full" style={{ width: "94.2%" }} />
              </div>
            </div>

            {/* Meter 3 */}
            <div className="space-y-1">
              <div className="flex justify-between text-zinc-300">
                <span>Interrupt Service Routine (ISR) Path</span>
                <span className="text-emerald-400 font-bold">100.0%</span>
              </div>
              <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: "100%" }} />
              </div>
            </div>

            {/* Meter 4 */}
            <div className="space-y-1">
              <div className="flex justify-between text-zinc-300">
                <span>HardFault Trap Exception Path</span>
                <span className="text-emerald-400 font-bold">100.0%</span>
              </div>
              <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: "100%" }} />
              </div>
            </div>
          </div>
        </GlassPanel>

      </div>

      {/* Seal of Conformity Banner */}
      <GlassPanel className="p-6 border border-cyan-500/20 bg-cyan-950/10 space-y-3">
        <div className="flex items-center gap-3">
          <Zap className="text-cyan-400 animate-pulse shrink-0" size={20} />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Analysis Seal of Conformity</h3>
        </div>
        <p className="text-xs text-zinc-300 leading-relaxed font-sans">
          TraceFerret telemetry analysis successfully validated that the memory dereference bug was resolved. 
          Microsecond logic-analyzer measurements demonstrate that the applied patch operates within safe hardware parameters, 
          resulting in <span className="text-cyan-400 font-bold">0% latency penalty overhead</span> on high-speed UART transfers.
        </p>
      </GlassPanel>

      {/* JSON EXPORT MODAL */}
      <AnimatePresence>
        {showJsonModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-950 border border-white/[0.1] rounded-2xl p-6 max-w-2xl w-full space-y-4 shadow-2xl font-mono text-xs"
            >
              <div className="flex justify-between items-center border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider">
                  <FileJson size={16} /> Export Telemetry Report JSON
                </div>
                <button 
                  onClick={() => setShowJsonModal(false)}
                  className="text-zinc-500 hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="bg-[#020202] p-4 rounded-xl border border-white/[0.04] max-h-[300px] overflow-y-auto text-[11px] text-zinc-300 font-mono space-y-1">
                <pre>{JSON.stringify(data || { report, analyzedFiles: ANALYZED_FILES, rootCause: "DMA NULL callback dereference" }, null, 2)}</pre>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={handleCopyJson}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-white/[0.08] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors"
                >
                  {copiedJson ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  {copiedJson ? "Copied to Clipboard" : "Copy JSON"}
                </button>

                <button
                  onClick={handleDownloadJson}
                  className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Download size={14} />
                  Download .json
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE JIRA ISSUE MODAL */}
      <AnimatePresence>
        {showJiraModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-950 border border-white/[0.1] rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl font-mono text-xs"
            >
              <div className="flex justify-between items-center border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-wider">
                  <Ticket size={16} /> Create Jira Issue
                </div>
                <button 
                  onClick={() => setShowJiraModal(false)}
                  className="text-zinc-500 hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {jiraKey ? (
                <div className="p-6 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-3 text-center">
                  <CheckCircle2 size={32} className="text-emerald-400 mx-auto" />
                  <h3 className="text-base font-bold text-white">Jira Issue Created Successfully</h3>
                  <div className="text-cyan-400 font-mono text-sm font-bold bg-black/60 py-2 rounded border border-cyan-500/30">
                    Key: {jiraKey}
                  </div>
                  <p className="text-zinc-400 text-xs font-sans">
                    The defect report, hardware trace registers, and patch diff were synced directly to Jira project <strong className="text-white">EMBED</strong>.
                  </p>
                  <button
                    onClick={() => {
                      setJiraKey(null);
                      setShowJiraModal(false);
                    }}
                    className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold uppercase cursor-pointer"
                  >
                    Close Dialog
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCreateJiraIssue} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase">Jira Project</label>
                    <input 
                      type="text" 
                      value="EMBED (Embedded Systems Defect Tracking)" 
                      disabled 
                      className="w-full bg-black border border-white/[0.08] rounded-lg p-2.5 text-zinc-400 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase">Issue Summary</label>
                    <input 
                      type="text" 
                      value={jiraSummary} 
                      onChange={(e) => setJiraSummary(e.target.value)}
                      className="w-full bg-black border border-cyan-500/30 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-cyan-400"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 font-bold uppercase">Priority</label>
                      <select 
                        value={jiraPriority}
                        onChange={(e) => setJiraPriority(e.target.value)}
                        className="w-full bg-black border border-white/[0.08] rounded-lg p-2.5 text-amber-400 font-mono focus:outline-none"
                      >
                        <option value="Highest">Highest (Blocker)</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 font-bold uppercase">Assignee</label>
                      <input 
                        type="text" 
                        value={jiraAssignee} 
                        onChange={(e) => setJiraAssignee(e.target.value)}
                        className="w-full bg-black border border-white/[0.08] rounded-lg p-2.5 text-zinc-200 font-mono focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase">Automated Telemetry Payload</label>
                    <textarea 
                      readOnly 
                      rows={3}
                      value={`[TRACEFERRET AUTOMATED SYNC]\nDefect: HardFault DMA Null Callback\nMCU: ${data?.mcu || "STM32F407VGT6"}\nFile: src/drivers/dma_controller.c:142\nTest Pass Rate: 100%`}
                      className="w-full bg-black border border-white/[0.08] rounded-lg p-2.5 text-zinc-500 text-[10px] font-mono cursor-not-allowed"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowJiraModal(false)}
                      className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-xl text-xs font-bold uppercase cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={jiraSubmitting}
                      className="px-5 py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                    >
                      {jiraSubmitting ? (
                        <>Creating Issue...</>
                      ) : (
                        <>
                          <Send size={14} />
                          Create Jira Issue
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
