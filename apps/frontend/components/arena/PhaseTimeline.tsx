"use client";

import { motion } from "framer-motion";

interface PhaseTimelineProps {
  currentPhase: string;
  progress: number;
}

const PHASES = [
  { id: "opening-statements", label: "OPEN", short: "OPN" },
  { id: "cross-examination", label: "CROSS", short: "CRS" },
  { id: "rebuttals", label: "REBUT", short: "RBT" },
  { id: "lightning-round", label: "LIGHTNING", short: "LTG" },
  { id: "closing-statements", label: "CLOSE", short: "CLS" },
  { id: "verdict", label: "VERDICT", short: "VRD" },
];

export function PhaseTimeline({ currentPhase }: PhaseTimelineProps) {
  const currentIndex = PHASES.findIndex((p) => p.id === currentPhase);

  return (
    <div className="px-4 sm:px-6 py-2 overflow-x-auto hide-scrollbar">
      <div className="flex items-center gap-0.5 sm:gap-1 min-w-max mx-auto justify-center">
        {PHASES.map((phase, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;

          return (
            <div key={phase.id} className="flex items-center">
              {/* Phase pill */}
              <div
                className={`
                  relative px-2.5 sm:px-4 py-1.5 text-center transition-all duration-300
                  font-[family-name:var(--font-jetbrains)] text-xs sm:text-sm
                  uppercase tracking-wider
                  ${
                    isActive
                      ? "text-[var(--arena-text)] bg-[var(--arena-surface-hover)] border border-[var(--arena-border-active)]"
                      : isCompleted
                        ? "text-[#22c55e]"
                        : "text-[var(--arena-text-dim)]"
                  }
                `}
              >
                {/* Active indicator dot */}
                {isActive && (
                  <motion.div
                    className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--pro)]"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}

                {/* Show short label on mobile, full on desktop */}
                <span className="sm:hidden">{phase.short}</span>
                <span className="hidden sm:inline">{phase.label}</span>

                {/* Completed checkmark */}
                {isCompleted && <span className="ml-1 text-[#22c55e]">/</span>}
              </div>

              {/* Connector */}
              {index < PHASES.length - 1 && (
                <div
                  className={`w-2 sm:w-4 h-px mx-0.5 ${isCompleted ? "bg-[#22c55e]" : "bg-[var(--arena-border)]"}`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
