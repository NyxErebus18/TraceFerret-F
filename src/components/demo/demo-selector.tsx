import { GlassPanel } from "../ui/glass-panel";
import { StatusBadge } from "../ui/status-badge";
import { ArrowLeft, ArrowRight, Cpu, HardDrive, Cpu as ChipIcon } from "lucide-react";
import { motion } from "motion/react";

interface DemoScenario {
  id: string;
  title: string;
  chip: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  desc: string;
  files: number;
  featured?: boolean;
}

const SCENARIOS: DemoScenario[] = [
  {
    id: "stm32-dma",
    title: "Hard Fault · DMA Callback Handler",
    chip: "STM32F407VGTx",
    severity: "CRITICAL",
    desc: "Null pointer dereference in DMA2 Stream 5 callback during high-speed USART3 RX DMA initialization.",
    files: 42,
    featured: true
  },
  {
    id: "esp32-stack",
    title: "Stack Overflow · FreeRTOS Task",
    chip: "ESP32-S3-WROOM",
    severity: "HIGH",
    desc: "Task stack boundary overrun in peripheral telemetry polling thread under heavy Wi-Fi transmission workload.",
    files: 28,
    featured: false
  },
];

interface DemoSelectorProps {
  onSelectDemo: (id: string) => void;
  onBack: () => void;
}

export function DemoSelector({ onSelectDemo, onBack }: DemoSelectorProps) {
  return (
    <div className="min-h-screen bg-black text-white p-6 sm:p-12 md:p-20 relative overflow-hidden flex flex-col justify-center">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-12 w-full relative z-10">
        {/* Back button */}
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-cyan-400 transition-colors cursor-pointer group"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
          <span>BACK TO ROOT</span>
        </button>

        {/* Heading */}
        <div className="space-y-3">
          <h2 className="text-cyan-400 font-mono text-xs tracking-[0.25em] uppercase">Telemetry Scenarios</h2>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none text-white">Choose a firmware scenario</h1>
          <p className="text-zinc-500 max-w-xl text-sm leading-relaxed">
            Select a pre-loaded firmware repository containing a known hard-to-debug defect. 
            Watch TraceFerret reconstruct the trace, find the failure, and repair it.
          </p>
        </div>

        {/* Scenario Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {SCENARIOS.map((scenario, i) => (
            <motion.div
              key={scenario.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="h-full"
            >
              <GlassPanel 
                interactive
                onClick={() => onSelectDemo(scenario.id)}
                className="p-8 h-full flex flex-col justify-between group cursor-pointer hover:border-cyan-500/40 hover:ring-white/[0.04] transition-all duration-300"
              >
                <div className="space-y-6">
                  {/* Top line metadata */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <ChipIcon size={14} className="text-zinc-600" />
                      <span className="text-xs font-mono text-zinc-500 tracking-wider">{scenario.chip}</span>
                      {scenario.featured && (
                        <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[9px] font-black tracking-widest px-2 py-0.5 rounded uppercase">
                          Featured
                        </span>
                      )}
                    </div>
                    <StatusBadge severity={scenario.severity} />
                  </div>

                  {/* Title and Description */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors duration-300 leading-snug">
                      {scenario.title}
                    </h3>
                    <p className="text-sm text-zinc-500 leading-relaxed font-normal opacity-80">
                      {scenario.desc}
                    </p>
                  </div>
                </div>

                {/* Bottom stats and action */}
                <div className="mt-8 pt-4 border-t border-white/[0.03] flex justify-between items-center text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-zinc-600">
                    <HardDrive size={13} />
                    <span>{scenario.files} Files Indexed</span>
                  </div>
                  <div className="flex items-center gap-1 text-cyan-400 font-bold group-hover:translate-x-0.5 transition-transform duration-300">
                    <span>Analyze Scenario</span>
                    <ArrowRight size={13} />
                  </div>
                </div>
              </GlassPanel>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
