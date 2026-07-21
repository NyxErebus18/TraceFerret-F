import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Hero } from "./components/landing/hero";
import { DemoSelector } from "./components/demo/demo-selector";
import { RepoIntake, IntakeConfig } from "./components/demo/repo-intake";
import { WorkspaceShell } from "./components/layout/workspace-shell";
import { InvestigationView } from "./components/workspace/investigation-view";
import { RootCauseView } from "./components/workspace/root-cause-view";
import { PatchView } from "./components/workspace/patch-view";
import { ValidationView } from "./components/workspace/validation-view";
import { ReportView } from "./components/workspace/report-view";
import { FindingCard } from "./components/dashboard/finding-card";
import { ConfidenceGauge } from "./components/dashboard/confidence-gauge";
import { LogicTrace } from "./components/dashboard/logic-trace";
import { MOCK_ANALYSIS_DATA } from "./lib/mock-data";
import { AnalysisPayload } from "./types/analysis";
import { 
  Cpu, 
  Terminal, 
  Search, 
  Activity, 
  Loader2, 
  Folder, 
  FileText,
  Sparkles,
  AlertTriangle
} from "lucide-react";
import { GlassPanel } from "./components/ui/glass-panel";

export default function App() {
  const [currentView, setCurrentView] = useState<"landing" | "demo" | "intake" | "workspace">("landing");
  const [selectedScenario, setSelectedScenario] = useState<string>("stm32-dma");
  const [activeTab, setActiveTab] = useState<string>("investigation");
  
  // Data and state machine variables
  const [data, setData] = useState<AnalysisPayload | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [discoveredFindings, setDiscoveredFindings] = useState<string[]>([]);
  const [isTimelineComplete, setIsTimelineComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPatchApplied, setIsPatchApplied] = useState(false);
  const [liveLogs, setLiveLogs] = useState<string[]>([]);
  
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Initialize and load analysis with intake configuration
  const startAnalysis = async (scenarioId: string, config?: IntakeConfig) => {
    setSelectedScenario(scenarioId);
    setIsLoading(true);
    setCurrentView("workspace");
    setActiveTab("investigation");
    setActiveStepIndex(0);
    setDiscoveredFindings([]);
    setIsTimelineComplete(false);
    setIsPatchApplied(false);

    const initialLogs = [
      "[SYSTEM] Initializing TraceFerret Core v1.0.4...",
      "[INTAKE] Intake configuration received.",
    ];

    if (config) {
      initialLogs.push(
        `[INTAKE] Target MCU: ${config.mcu}`,
        `[INTAKE] Build System: ${config.buildSystem}`,
        `[INTAKE] Repo URL: ${config.repoUrl}`,
        `[INTAKE] DWARF Symbols: ${config.dwarfDebug ? "Extracted (.elf)" : "Disabled"}`,
        `[INTAKE] RTOS Context: ${config.rtosAwareness}`,
        `[INTAKE] Peripheral Map: ${config.peripheralRegisterMaps}`,
        `[INTAKE] Test Stubs: ${config.generateTestStubs ? "Enabled" : "Disabled"}`
      );
    }

    initialLogs.push("[SYSTEM] Loading firmware flash memory maps...");
    setLiveLogs(initialLogs);

    try {
      const res = await fetch("/api/analyze");
      let json = MOCK_ANALYSIS_DATA;
      if (res.ok) {
        try {
          json = await res.json();
        } catch {
          json = MOCK_ANALYSIS_DATA;
        }
      }
      
      // Override payload with user's selected MCU/project details if configured
      if (config) {
        setData({
          ...json,
          mcu: config.mcu,
          project: config.uploadedFile ? config.uploadedFile.name : json.project,
        });
      } else {
        setData(json);
      }
    } catch (err) {
      console.warn("Backend API unavailable, using high-fidelity local telemetry payload.");
      setData({
        ...MOCK_ANALYSIS_DATA,
        mcu: config?.mcu || MOCK_ANALYSIS_DATA.mcu,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // State machine simulation: sequential timeline discovery
  useEffect(() => {
    if (!data || currentView !== "workspace") return;

    if (activeStepIndex < data.timeline.length) {
      const step = data.timeline[activeStepIndex];
      const timer = setTimeout(() => {
        // Log to telemetry console
        setLiveLogs(prev => [
          ...prev, 
          `[ANALYZER] Step ${step.id}: ${step.label}...`,
          `[INFO] ${step.detail}`
        ]);

        // Check if step triggers a new finding discovery
        if (step.discoveryId) {
          setDiscoveredFindings(prev => {
            if (!prev.includes(step.discoveryId!)) {
              setLiveLogs(l => [...l, `[DISCOVERY] Isolated defect event ID: ${step.discoveryId}`]);
              return [...prev, step.discoveryId!];
            }
            return prev;
          });
        }
        
        // Progress to next step or complete
        if (activeStepIndex === data.timeline.length - 1) {
          setIsTimelineComplete(true);
          setLiveLogs(prev => [...prev, "[SYSTEM] Investigation timeline complete. Findings validated."]);
        } else {
          setActiveStepIndex(prev => prev + 1);
        }
      }, step.duration);

      return () => clearTimeout(timer);
    }
  }, [activeStepIndex, data, currentView]);

  // Auto scroll live reasoning logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [liveLogs]);

  if (currentView === "landing") {
    return (
      <Hero 
        onStartDemo={() => setCurrentView("demo")} 
        onUploadFirmware={() => {
          setSelectedScenario("stm32-dma");
          setCurrentView("intake");
        }}
      />
    );
  }

  if (currentView === "demo") {
    return (
      <DemoSelector 
        onSelectDemo={(id) => {
          setSelectedScenario(id);
          setCurrentView("intake");
        }} 
        onBack={() => setCurrentView("landing")} 
      />
    );
  }

  if (currentView === "intake") {
    return (
      <RepoIntake
        initialScenarioId={selectedScenario}
        onBeginInvestigation={(config) => startAnalysis(selectedScenario, config)}
        onBack={() => setCurrentView("demo")}
      />
    );
  }

  if (isLoading || !data) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center font-mono text-zinc-500 text-xs space-y-3">
        <Loader2 className="animate-spin text-cyan-400" size={24} />
        <span className="tracking-[0.2em] font-black uppercase">Initializing Intelligence Engine...</span>
      </div>
    );
  }

  // Calculate sliding confidence based on step progression
  const currentConfidence = Math.min(
    15 + (activeStepIndex * 10), 
    data.confidence
  );

  return (
    <WorkspaceShell
      title={`${data.project} (STM32F4)`}
      activeStep={activeTab}
      onStepChange={(step) => setActiveTab(step)}
      onBackToDemos={() => setCurrentView("demo")}
      left={
        <div className="flex flex-col h-full bg-[#050505]">
          <div className="p-4 border-b border-white/[0.04] flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Repository</span>
            <Search size={12} className="text-zinc-600" />
          </div>
          <div className="p-4 flex-1 overflow-y-auto font-mono text-[11px] space-y-3">
            <div className="text-zinc-500 italic">/{selectedScenario === "stm32-dma" ? "stm32f4-dma-demo" : "esp32-stack-demo"}</div>
            <div className="pl-4 space-y-1.5">
              <div className="text-zinc-300 font-bold flex items-center gap-1.5">
                <Folder size={12} className="text-zinc-600" /> src
              </div>
              <div className="pl-4 space-y-1">
                <div className="text-zinc-500 flex items-center gap-1.5 hover:text-zinc-300 cursor-pointer py-0.5">
                  <FileText size={11} /> main.c
                </div>
                <div className="text-zinc-500 flex items-center gap-1.5 hover:text-zinc-300 cursor-pointer py-0.5">
                  <Folder size={11} className="text-zinc-600" /> drivers
                </div>
                <div className="pl-4 space-y-1">
                  <div className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[10px] font-mono transition-all duration-500 ${
                    activeStepIndex >= 4 
                      ? "text-red-400 font-bold bg-red-500/10 border border-red-500/10" 
                      : "text-zinc-500 hover:text-zinc-300 cursor-pointer"
                  }`}>
                    <FileText size={10} /> dma_controller.c {activeStepIndex >= 4 && "•"}
                  </div>
                  <div className="text-zinc-500 flex items-center gap-1.5 hover:text-zinc-300 cursor-pointer py-0.5">
                    <FileText size={10} /> uart_driver.c
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
      right={
        <div className="p-6 space-y-8 flex flex-col h-full bg-[#050505]">
          {/* Confidence Gauge */}
          <section>
            <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-4">Inference Confidence</h4>
            <ConfidenceGauge value={currentConfidence} />
            <div className="h-8 flex items-end gap-1 px-4 mt-2">
              {[40, 45, 42, 58, 62, 80, 87].map((h, i) => (
                <div 
                  key={i} 
                  className={`flex-1 rounded-t-sm transition-all duration-500 ${
                    i <= activeStepIndex ? "bg-cyan-500/40" : "bg-zinc-800/10"
                  }`} 
                  style={{ height: `${h}%` }} 
                />
              ))}
            </div>
          </section>

          {/* Evidence discovered list */}
          <section className="flex-1 space-y-4 overflow-y-auto">
            <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Evidence Discovered</h4>
            <div className="space-y-3">
              <AnimatePresence>
                {data.findings.filter(f => discoveredFindings.includes(f.id)).map((f) => (
                  <motion.div 
                    key={f.id} 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <FindingCard finding={f} />
                  </motion.div>
                ))}
              </AnimatePresence>
              {discoveredFindings.length === 0 && (
                <div className="py-12 flex flex-col items-center justify-center border border-dashed border-white/[0.05] rounded-xl text-zinc-700">
                  <Search size={20} className="mb-2 opacity-20" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Scanning Subsystems...</span>
                </div>
              )}
            </div>
          </section>

          {/* Realtime logs */}
          <GlassPanel className="p-4 bg-zinc-950/80 border-t-cyan-500/20 border-t-2">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={12} className="text-cyan-500 animate-pulse" />
              <span className="text-[10px] font-bold text-zinc-200 uppercase tracking-tighter">Live Reasoning Logs</span>
            </div>
            <div 
              ref={logContainerRef}
              className="font-mono text-[9px] text-zinc-600 h-24 overflow-y-auto space-y-1 select-none scrollbar-thin scrollbar-thumb-zinc-800"
            >
              {liveLogs.map((log, i) => (
                <div 
                  key={i} 
                  className={
                    log.startsWith("[DISCOVERY]") 
                      ? "text-cyan-400 font-bold" 
                      : log.startsWith("[SYSTEM]") 
                        ? "text-zinc-400" 
                        : "text-zinc-600"
                  }
                >
                  {log}
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>
      }
    >
      {/* Content depending on active tab */}
      {activeTab === "investigation" && (
        <div className="flex flex-col h-full">
          {/* Subsystem State Mission Control stats */}
          <div className="grid grid-cols-4 border-b border-white/[0.04] bg-black/20 divide-x divide-white/[0.04] shrink-0">
            <div className="px-6 py-4 flex flex-col justify-center">
              <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-1 flex items-center gap-1.5">
                <Cpu size={12} className="text-cyan-500/60" /> CPU TARGET
              </div>
              <div className="text-[11px] font-mono font-medium text-zinc-200">{data.mcu}</div>
            </div>
            <div className="px-6 py-4 flex flex-col justify-center">
              <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-1">ANALYSIS MODE</div>
              <div className="text-[11px] font-mono font-medium text-zinc-200">POST-MORTEM TRACE</div>
            </div>
            <div className="px-6 py-4 flex flex-col justify-center">
              <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-1">REASONING</div>
              <div className={`text-[11px] font-mono font-medium ${!isTimelineComplete ? 'text-cyan-400 animate-pulse font-bold' : 'text-zinc-200'}`}>
                {!isTimelineComplete ? "ACTIVE" : "IDLE"}
              </div>
            </div>
            <div className="px-6 py-4 flex flex-col justify-center">
              <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-1">ELAPSED</div>
              <div className="text-[11px] font-mono font-medium text-zinc-200 tabular-nums">{activeStepIndex * 2}s</div>
            </div>
          </div>

          {/* Investigation steps timeline */}
          <InvestigationView 
            timeline={data.timeline} 
            activeStepIndex={activeStepIndex} 
            isComplete={isTimelineComplete} 
          />

          {/* Hardware Signal Trace Logical Analyzer */}
          <div className="border-t border-white/[0.04] p-6 bg-[#050505] shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-cyan-500" />
                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Signal Window: Fault Event</h4>
              </div>
              <div className="text-[9px] font-mono text-zinc-600">Sample Rate: 168MHz • Trigger: HardFault</div>
            </div>
            <LogicTrace />
          </div>
        </div>
      )}

      {activeTab === "root-cause" && (
        <RootCauseView rootCause={data.rootCause} mcu={data.mcu} />
      )}

      {activeTab === "patch" && (
        <PatchView 
          patch={data.patch} 
          onApply={() => {
            setIsPatchApplied(true);
            setLiveLogs(l => [...l, "[SYSTEM] Correction patch applied successfully. Initializing regression testing arrays."]);
          }} 
        />
      )}

      {activeTab === "validation" && (
        <ValidationView tests={data.validation} />
      )}

      {activeTab === "report" && (
        <ReportView report={data.report} data={data} />
      )}
    </WorkspaceShell>
  );
}
