interface SignalRowProps {
  label: string;
  color: string;
  path: string;
  key?: string | number;
}

export function SignalRow({ label, color, path }: SignalRowProps) {
  return (
    <div className="flex items-center gap-4 text-[10px] font-mono">
      <span className="w-16 text-zinc-500 font-bold tracking-wider">{label}</span>
      <div className="flex-1 bg-zinc-950/40 border border-white/[0.02] rounded px-3 py-1.5 h-10 flex items-center relative overflow-hidden">
        {/* Subtle grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px)] bg-[size:20px_100%]" />
        
        <svg className="w-full h-6 overflow-visible z-10" preserveAspectRatio="none" viewBox="0 0 100 12">
          <path 
            d={path} 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            className={color} 
            strokeLinecap="square" 
          />
        </svg>
      </div>
    </div>
  );
}

export function LogicTrace() {
  const signals = [
    { label: "UART_TX", color: "text-cyan-400 drop-shadow-[0_0_4px_rgba(34,211,238,0.2)]", path: "M0 10 h15 v-8 h15 v8 h20 v-8 h10 v8 h20" },
    { label: "DMA_REQ", color: "text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.2)]", path: "M0 10 h45 v-8 h10 v8 h25" },
    { label: "IRQ_LINE", color: "text-red-400 drop-shadow-[0_0_4px_rgba(248,113,113,0.2)]", path: "M0 10 h50 v-8 h5 v8 h25" },
    { label: "CLK_SYS", color: "text-zinc-600", path: "M0 10 h4 v-8 h4 v8 h4 v-8 h4 v8 h4 v-8 h4 v8 h4 v-8 h4 v8 h4 v-8 h4 v8 h4 v-8 h4 v8 h4 v-8 h4 v8 h4 v-8 h4 v8" }
  ];

  return (
    <div className="space-y-2 font-mono">
      {signals.map(s => (
        <SignalRow key={s.label} label={s.label} color={s.color} path={s.path} />
      ))}
    </div>
  );
}
