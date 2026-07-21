import React from "react";
import { cn } from "../../lib/utils";
import { motion } from "motion/react";

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  interactive?: boolean;
  onClick?: () => void;
  key?: any;
}

export const GlassPanel = ({ 
  children, 
  className, 
  hover = false,
  interactive = false,
  onClick
}: GlassPanelProps) => {
  const Component = interactive ? motion.button : motion.div;

  return (
    <Component
      onClick={onClick}
      whileHover={interactive ? { y: -2, scale: 1.002 } : undefined}
      whileTap={interactive ? { scale: 0.992 } : undefined}
      transition={{ type: "spring", stiffness: 450, damping: 25 }}
      className={cn(
        "relative rounded-xl overflow-hidden text-left",
        "bg-[#090a0f]/70 backdrop-blur-2xl",
        "border border-white/[0.06] ring-1 ring-white/[0.03]", // Layered dual-border for optics
        "shadow-[0_12px_40px_rgba(0,0,0,0.5)]",
        hover && "hover:bg-white/[0.03] hover:border-white/[0.12] hover:ring-white/[0.06] hover:shadow-[0_16px_48px_rgba(0,0,0,0.6)] transition-all duration-300",
        className
      )}
    >
      {/* Subtle top-light ambient sheen reflection */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] via-transparent to-transparent pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </Component>
  );
};

