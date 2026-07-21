interface ConfidenceGaugeProps {
  value: number;
}

export const ConfidenceGauge = ({ value }: ConfidenceGaugeProps) => {
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center py-6">
      <svg className="w-32 h-32 rotate-[-90deg]">
        <circle 
          cx="64" 
          cy="64" 
          r={radius} 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="6" 
          className="text-zinc-900" 
        />
        <circle 
          cx="64" 
          cy="64" 
          r={radius} 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="6" 
          strokeDasharray={circumference} 
          strokeLinecap="round"
          style={{ strokeDashoffset: offset, transition: 'stroke-dashoffset 1s ease-out' }}
          className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white tracking-tighter">{value}%</span>
        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] mt-0.5">Confidence</span>
      </div>
    </div>
  );
};
