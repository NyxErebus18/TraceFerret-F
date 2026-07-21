import React, { useState } from "react";
import { GlassPanel } from "../ui/glass-panel";
import { 
  ArrowLeft, 
  ArrowRight, 
  UploadCloud, 
  GitBranch, 
  Cpu, 
  Layers, 
  Settings2, 
  CheckCircle2, 
  FileCode, 
  Sparkles,
  Database,
  Code2,
  Trash2,
  ChevronDown,
  Terminal,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface IntakeConfig {
  repoUrl: string;
  branch: string;
  uploadedFile: { name: string; size: string } | null;
  mcu: string;
  buildSystem: string;
  dwarfDebug: boolean;
  rtosAwareness: string;
  peripheralRegisterMaps: string;
  generateTestStubs: boolean;
}

interface RepoIntakeProps {
  initialScenarioId?: string;
  onBeginInvestigation: (config: IntakeConfig) => void;
  onBack: () => void;
}

const MCU_OPTIONS = [
  { id: "STM32F407VGT6", label: "STM32F407VGT6 (ARM Cortex-M4 @ 168MHz)", desc: "1MB Flash, 192KB RAM, DMA2, USART3, SPI1" },
  { id: "STM32H743ZI", label: "STM32H743ZI (ARM Cortex-M7 @ 480MHz)", desc: "2MB Flash, 1MB RAM, Dual Core, High-Speed DMA" },
  { id: "ESP32-S3-WROOM", label: "ESP32-S3-WROOM (Xtensa LX7 @ 240MHz)", desc: "8MB PSRAM, Wi-Fi 4, BLE 5.0, Vector Extensions" },
  { id: "nRF52840", label: "nRF52840 (ARM Cortex-M4 @ 64MHz)", desc: "1MB Flash, 256KB RAM, Bluetooth 5.4, IEEE 802.15.4" },
  { id: "RP2040", label: "RP2040 (Dual Cortex-M0+ @ 133MHz)", desc: "264KB SRAM, Programmable I/O (PIO)" },
  { id: "CUSTOM_CORTEX", label: "Custom ARM Cortex-M4 / Cortex-M7", desc: "Generic ARM CMSIS-Core memory architecture" },
];

const BUILD_SYSTEM_OPTIONS = [
  { id: "STM32CubeIDE", label: "STM32CubeIDE / GNU Makefile", desc: "Standard arm-none-eabi-gcc build pipeline" },
  { id: "CMake", label: "CMake + GCC ARM Embedded", desc: "Modern cross-platform CMake build targets" },
  { id: "Keil", label: "Keil MDK-ARM (μVision)", desc: "Arm Compiler 6 (armclang) with .uvprojx" },
  { id: "IAR", label: "IAR Embedded Workbench", desc: "IAR C/C++ Compiler for ARM with .ewp" },
  { id: "PlatformIO", label: "PlatformIO Core", desc: "Multi-platform embedded build orchestration" },
  { id: "Zephyr", label: "Zephyr RTOS West / CMake", desc: "West meta-tool and Kconfig workspace" },
];

const RTOS_OPTIONS = [
  { id: "FreeRTOS", label: "FreeRTOS Kernel v10.5+" },
  { id: "ZephyrOS", label: "Zephyr RTOS Kernel" },
  { id: "ThreadX", label: "Azure RTOS / ThreadX" },
  { id: "CMSIS-RTOS2", label: "CMSIS-RTOS v2 Specification" },
  { id: "BareMetal", label: "Bare-metal (No RTOS / Direct Interrupts)" },
];

const SVD_MAP_OPTIONS = [
  { id: "AutoSVD", label: "CMSIS-SVD Auto-Parse (Recommended)" },
  { id: "STM32F4_SVD", label: "STM32F407.svd System Register Map" },
  { id: "ESP32_SVD", label: "ESP32S3.svd Peripheral Address Map" },
  { id: "CustomSVD", label: "Custom .svd XML Descriptor File" },
];

export function RepoIntake({ initialScenarioId = "stm32-dma", onBeginInvestigation, onBack }: RepoIntakeProps) {
  const isEsp = initialScenarioId === "esp32-stack";

  // Intake state initialized from selected scenario defaults
  const [repoUrl, setRepoUrl] = useState(
    isEsp 
      ? "https://github.com/expressif/esp32-freertos-stack-telemetry.git" 
      : "https://github.com/armmbed/stm32f4-dma-demo.git"
  );
  const [branch, setBranch] = useState("main");
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const [mcu, setMcu] = useState(isEsp ? "ESP32-S3-WROOM" : "STM32F407VGT6");
  const [buildSystem, setBuildSystem] = useState(isEsp ? "CMake" : "STM32CubeIDE");

  // Advanced Options state
  const [showAdvanced, setShowAdvanced] = useState(true);
  const [dwarfDebug, setDwarfDebug] = useState(true);
  const [rtosAwareness, setRtosAwareness] = useState(isEsp ? "FreeRTOS" : "BareMetal");
  const [peripheralRegisterMaps, setPeripheralRegisterMaps] = useState("AutoSVD");
  const [generateTestStubs, setGenerateTestStubs] = useState(true);

  // File upload handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setUploadedFile({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUploadedFile({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      });
    }
  };

  const handleStart = () => {
    onBeginInvestigation({
      repoUrl,
      branch,
      uploadedFile,
      mcu,
      buildSystem,
      dwarfDebug,
      rtosAwareness,
      peripheralRegisterMaps,
      generateTestStubs,
    });
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 sm:p-10 md:p-16 relative overflow-hidden flex flex-col justify-center">
      {/* Background Grid & Blur Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-8 w-full relative z-10">
        {/* Navigation & Header Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.04] pb-6">
          <div className="space-y-2">
            <button 
              onClick={onBack}
              className="inline-flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-cyan-400 transition-colors cursor-pointer group mb-1"
            >
              <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
              <span>BACK TO SCENARIO SELECTION</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-mono font-bold tracking-widest px-2.5 py-0.5 rounded uppercase">
                STEP 2 OF 3
              </span>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">Repository Intake & Build Setup</h1>
            </div>
            <p className="text-zinc-500 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Configure target microcontrollers, build systems, symbol tables, and register specifications before booting the TraceFerret intelligence core.
            </p>
          </div>

          <button
            onClick={handleStart}
            className="self-start sm:self-auto bg-cyan-400 hover:bg-cyan-300 active:scale-95 text-black font-black h-12 px-8 rounded-xl transition-all duration-300 flex items-center justify-center cursor-pointer shadow-[0_0_24px_rgba(34,211,238,0.3)] shrink-0 text-xs tracking-wider uppercase"
          >
            <Sparkles size={14} className="mr-2" />
            Begin Investigation
            <ArrowRight size={14} className="ml-2" />
          </button>
        </div>

        {/* Form Container Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Column 1: Source Material (URL or ZIP drop) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Section 1: Git Repository Source */}
            <GlassPanel className="p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
                <div className="flex items-center gap-2">
                  <GitBranch size={16} className="text-cyan-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Git Repository Intake</h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <ShieldCheck size={12} /> Live Scan Ready
                </span>
              </div>

              <div className="space-y-4 font-mono">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                    Repository Clone URL
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      placeholder="https://github.com/org/firmware-repo.git"
                      className="w-full bg-black/60 border border-white/[0.08] focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-lg px-4 py-2.5 text-xs text-zinc-200 placeholder-zinc-700 outline-none transition-all"
                    />
                    <div className="absolute right-3 top-2.5 text-[10px] text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Validated
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                      Git Branch / Tag
                    </label>
                    <input 
                      type="text" 
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full bg-black/60 border border-white/[0.08] focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                      Primary Entry
                    </label>
                    <div className="bg-black/60 border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-zinc-500 flex items-center justify-between">
                      <span>/src/main.c</span>
                      <FileCode size={12} className="text-zinc-600" />
                    </div>
                  </div>
                </div>
              </div>
            </GlassPanel>

            {/* Section 2: Drag & Drop ZIP / Archive Upload */}
            <GlassPanel className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
                <div className="flex items-center gap-2">
                  <UploadCloud size={16} className="text-cyan-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Local Workspace / ZIP Upload</h3>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">ZIP, TAR, or Directory</span>
              </div>

              {uploadedFile ? (
                <div className="bg-cyan-500/5 border border-cyan-500/30 rounded-xl p-4 flex items-center justify-between font-mono text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                      <FileCode size={18} />
                    </div>
                    <div>
                      <div className="text-zinc-200 font-bold">{uploadedFile.name}</div>
                      <div className="text-[10px] text-zinc-500">{uploadedFile.size} • Ready for symbol extraction</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setUploadedFile(null)}
                    className="p-2 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                    title="Remove file"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ) : (
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
                    isDragging 
                      ? "border-cyan-400 bg-cyan-500/10" 
                      : "border-white/[0.08] hover:border-white/[0.2] bg-black/40 hover:bg-black/60"
                  }`}
                >
                  <input 
                    type="file" 
                    id="file-upload" 
                    onChange={handleFileSelect} 
                    className="hidden" 
                    accept=".zip,.tar,.gz,.elf"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer space-y-3 block">
                    <div className="w-12 h-12 mx-auto rounded-full bg-zinc-900 border border-white/[0.08] flex items-center justify-center text-zinc-400 group-hover:scale-110 transition-transform">
                      <UploadCloud size={20} className="text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-200">
                        Drag & drop firmware archive or <span className="text-cyan-400 underline decoration-cyan-400/40">browse files</span>
                      </p>
                      <p className="text-[10px] text-zinc-600 font-mono mt-1">
                        Supports source trees, compiled .elf binaries, and map files (up to 250MB)
                      </p>
                    </div>
                  </label>
                </div>
              )}
            </GlassPanel>

          </div>

          {/* Column 2: Target MCU, Build System & Advanced Options */}
          <div className="lg:col-span-5 space-y-6">

            {/* Hardware & Toolchain Config */}
            <GlassPanel className="p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
                <div className="flex items-center gap-2">
                  <Cpu size={16} className="text-cyan-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Target Hardware & Toolchain</h3>
                </div>
              </div>

              {/* MCU Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Target MCU Architecture</span>
                  <span className="text-[9px] text-cyan-400 font-mono">AHB/APB Bus</span>
                </label>
                <div className="relative">
                  <select
                    value={mcu}
                    onChange={(e) => setMcu(e.target.value)}
                    className="w-full bg-black/80 border border-white/[0.08] focus:border-cyan-500 rounded-lg px-3.5 py-2.5 text-xs text-white appearance-none cursor-pointer outline-none font-mono"
                  >
                    {MCU_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id} className="bg-zinc-950 text-zinc-200">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3.5 top-3 text-zinc-500 pointer-events-none" />
                </div>
                <p className="text-[10px] text-zinc-600 font-mono">
                  {MCU_OPTIONS.find(m => m.id === mcu)?.desc}
                </p>
              </div>

              {/* Build System Selector */}
              <div className="space-y-1.5 pt-2">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Build System & Compiler</span>
                  <Layers size={12} className="text-zinc-600" />
                </label>
                <div className="relative">
                  <select
                    value={buildSystem}
                    onChange={(e) => setBuildSystem(e.target.value)}
                    className="w-full bg-black/80 border border-white/[0.08] focus:border-cyan-500 rounded-lg px-3.5 py-2.5 text-xs text-white appearance-none cursor-pointer outline-none font-mono"
                  >
                    {BUILD_SYSTEM_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id} className="bg-zinc-950 text-zinc-200">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3.5 top-3 text-zinc-500 pointer-events-none" />
                </div>
                <p className="text-[10px] text-zinc-600 font-mono">
                  {BUILD_SYSTEM_OPTIONS.find(b => b.id === buildSystem)?.desc}
                </p>
              </div>
            </GlassPanel>

            {/* Advanced Options Section */}
            <GlassPanel className="p-6 space-y-5">
              <div 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center justify-between cursor-pointer border-b border-white/[0.04] pb-3 select-none"
              >
                <div className="flex items-center gap-2">
                  <Settings2 size={16} className="text-cyan-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Advanced Telemetry Options</h3>
                </div>
                <div className="text-[10px] font-mono text-cyan-400 flex items-center gap-1">
                  <span>{showAdvanced ? "Hide" : "Show"}</span>
                  <ChevronDown size={14} className={`transition-transform duration-300 ${showAdvanced ? "rotate-180" : ""}`} />
                </div>
              </div>

              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 pt-1 font-mono"
                  >
                    {/* DWARF Debug Info Toggle */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/[0.04]">
                      <div>
                        <div className="text-xs font-bold text-zinc-200">DWARF Debug Info</div>
                        <div className="text-[10px] text-zinc-500">Extract .elf / .dwarf symbols for register mapping</div>
                      </div>
                      <button
                        onClick={() => setDwarfDebug(!dwarfDebug)}
                        className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer shrink-0 ${
                          dwarfDebug ? "bg-cyan-500" : "bg-zinc-800"
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-black transition-transform ${
                          dwarfDebug ? "translate-x-5" : "translate-x-0"
                        }`} />
                      </button>
                    </div>

                    {/* RTOS Awareness Selector */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                        RTOS Awareness
                      </label>
                      <div className="relative">
                        <select
                          value={rtosAwareness}
                          onChange={(e) => setRtosAwareness(e.target.value)}
                          className="w-full bg-black/80 border border-white/[0.08] focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-zinc-200 appearance-none outline-none"
                        >
                          {RTOS_OPTIONS.map((rtos) => (
                            <option key={rtos.id} value={rtos.id} className="bg-zinc-950">
                              {rtos.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-2.5 text-zinc-500 pointer-events-none" />
                      </div>
                    </div>

                    {/* Peripheral Register Maps Selector */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                        Peripheral Register Maps
                      </label>
                      <div className="relative">
                        <select
                          value={peripheralRegisterMaps}
                          onChange={(e) => setPeripheralRegisterMaps(e.target.value)}
                          className="w-full bg-black/80 border border-white/[0.08] focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-zinc-200 appearance-none outline-none"
                        >
                          {SVD_MAP_OPTIONS.map((svd) => (
                            <option key={svd.id} value={svd.id} className="bg-zinc-950">
                              {svd.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-2.5 text-zinc-500 pointer-events-none" />
                      </div>
                    </div>

                    {/* Generate Test Stubs Toggle */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/[0.04]">
                      <div>
                        <div className="text-xs font-bold text-zinc-200">Generate Test Stubs</div>
                        <div className="text-[10px] text-zinc-500">Synthesize unit test harnesses for hardware mocks</div>
                      </div>
                      <button
                        onClick={() => setGenerateTestStubs(!generateTestStubs)}
                        className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer shrink-0 ${
                          generateTestStubs ? "bg-cyan-500" : "bg-zinc-800"
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-black transition-transform ${
                          generateTestStubs ? "translate-x-5" : "translate-x-0"
                        }`} />
                      </button>
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>
            </GlassPanel>

          </div>

        </div>

        {/* Bottom CTA bar */}
        <GlassPanel className="p-5 border-t-2 border-t-cyan-500/40 bg-zinc-950/90 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
              <Terminal size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-white font-mono">Configured: {mcu} • {buildSystem}</div>
              <div className="text-[10px] text-zinc-500 font-mono">
                DWARF: {dwarfDebug ? "ON" : "OFF"} • RTOS: {rtosAwareness} • Stubs: {generateTestStubs ? "ENABLED" : "DISABLED"}
              </div>
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full sm:w-auto bg-cyan-400 hover:bg-cyan-300 active:scale-95 text-black font-black h-11 px-8 rounded-xl transition-all duration-300 flex items-center justify-center cursor-pointer shadow-[0_0_20px_rgba(34,211,238,0.25)] text-xs tracking-wider uppercase font-mono"
          >
            <Sparkles size={14} className="mr-2" />
            Begin Investigation
            <ArrowRight size={14} className="ml-2" />
          </button>
        </GlassPanel>

      </div>
    </div>
  );
}
