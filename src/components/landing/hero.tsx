import { ArrowRight, Upload, Terminal, Cpu, Database } from "lucide-react";
import { motion } from "motion/react";
import { GlassPanel } from "../ui/glass-panel";

interface HeroProps {
  onStartDemo: () => void;
  onUploadFirmware?: () => void;
}

export function Hero({ onStartDemo, onUploadFirmware }: HeroProps) {
  return (
    <div className="min-h-screen bg-black text-zinc-400 selection:bg-cyan-500/30 overflow-hidden relative flex flex-col justify-between">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Decorative Blur */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 max-w-6xl mx-auto w-full px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-black font-black text-sm shadow-xl shadow-white/5">TF</div>
          <span className="text-white font-mono tracking-tight font-semibold text-sm">TraceFerret</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="text-zinc-600">v1.0.4</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-zinc-400">System Ready</span>
        </div>
      </header>

      {/* Main Hero Body */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-20 w-full flex-1 flex flex-col justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="space-y-6 max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 text-cyan-400 font-mono text-xs tracking-[0.3em] uppercase">
            <div className="h-px w-8 bg-cyan-500" />
            Embedded Firmware Intelligence
          </div>
          
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tighter text-white leading-[0.9] max-w-3xl">
            Debug firmware, <br />
            <span className="text-zinc-600 bg-gradient-to-r from-zinc-600 via-zinc-500 to-zinc-700 bg-clip-text text-transparent">not symptoms.</span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-500 max-w-xl leading-relaxed">
            TraceFerret is a Codex-powered embedded firmware debugging platform.
            Analyze repository structures, trace DMA callbacks, isolate register-level faults, 
            and generate validated memory-safe patches in seconds.
          </p>

          <div className="flex flex-wrap gap-4 pt-6">
            <button 
              onClick={onStartDemo}
              className="bg-cyan-400 hover:bg-cyan-300 active:scale-95 text-black font-bold h-12 px-8 rounded-lg group transition-all flex items-center justify-center cursor-pointer shadow-[0_0_24px_rgba(34,211,238,0.25)]"
            >
              Try demo project 
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button 
              onClick={onUploadFirmware || onStartDemo}
              className="border border-white/[0.08] bg-zinc-950 text-zinc-300 h-12 px-8 rounded-lg hover:bg-zinc-900 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
            >
              <Upload className="mr-2 h-4 w-4 text-zinc-500" /> Upload firmware
            </button>
          </div>
        </motion.div>

        {/* Floating Technical Pre-analysis Card (The 'Mission Control' Hook) */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          className="mt-20 relative max-w-3xl"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 blur-3xl opacity-30 pointer-events-none" />
          <GlassPanel className="p-1 border-white/[0.04]">
            <div className="bg-black/40 rounded-lg p-5 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-3 mb-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/30" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/30" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/30" />
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-600">
                  <Terminal size={11} /> 
                  <span>INTELLIGENCE ENGINE CORES ACTIVE</span>
                </div>
              </div>
              <div className="space-y-2 text-zinc-500">
                <div className="flex justify-between">
                  <span className="flex items-center gap-2"><Cpu size={12} className="text-zinc-700" /> Parsing repository architecture</span>
                  <span className="text-zinc-600">42 source files</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-2"><Database size={12} className="text-zinc-700" /> Rebuilding peripheral memory map</span>
                  <span className="text-zinc-600">STM32F407VGTx</span>
                </div>
                <div className="flex justify-between text-cyan-400">
                  <span className="flex items-center gap-2"><Terminal size={12} className="text-cyan-400" /> Correlating register interrupt lines</span>
                  <span className="animate-pulse">Analyzing...</span>
                </div>
              </div>
            </div>
          </GlassPanel>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.02] bg-black/40 py-6 text-center text-xs text-zinc-600">
        <p>© 2026 TraceFerret. High-fidelity embedded telemetry and validation.</p>
      </footer>
    </div>
  );
}
