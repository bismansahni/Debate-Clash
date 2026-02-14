// components/arena/PhaseTimeline.tsx
"use client";

import { motion } from "framer-motion";

interface PhaseTimelineProps {
  currentPhase: string;
  progress: number; // 0-1
}

const PHASES = [
  { id: 'preparing', label: 'Pre-Show', icon: '🎬' },
  { id: 'opening-statements', label: 'Opening', icon: '🎤' },
  { id: 'cross-examination', label: 'Cross-Exam', icon: '⚔️' },
  { id: 'rebuttals', label: 'Rebuttals', icon: '🔄' },
  { id: 'audience-questions', label: 'Audience', icon: '👥' },
  { id: 'lightning-round', label: 'Lightning', icon: '⚡' },
  { id: 'closing-statements', label: 'Closing', icon: '🎬' },
  { id: 'deliberation', label: 'Judges', icon: '⚖️' },
  { id: 'verdict', label: 'Verdict', icon: '🏆' },
];

export function PhaseTimeline({ currentPhase, progress }: PhaseTimelineProps) {
  const currentIndex = PHASES.findIndex(p => p.id === currentPhase);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6">
      {/* Mobile: Scrollable horizontal */}
      <div className="overflow-x-auto -mx-3 sm:-mx-4 lg:-mx-6 px-3 sm:px-4 lg:px-6 hide-scrollbar">
        <div className="flex items-center gap-1 sm:gap-2 min-w-max">
          {PHASES.map((phase, index) => {
            const isActive = index === currentIndex;
            const isCompleted = index < currentIndex;

            return (
              <div key={phase.id} className="flex items-center">
                {/* Phase Node */}
                <div className="flex flex-col items-center gap-1 sm:gap-1.5">
                  <motion.div
                    initial={false}
                    animate={{
                      scale: isActive ? 1.1 : 1,
                      backgroundColor: isActive
                        ? '#ffffff'
                        : isCompleted
                        ? '#10b981'
                        : '#404040'
                    }}
                    className={`
                      w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full
                      flex items-center justify-center text-xs sm:text-sm lg:text-base
                      font-semibold transition-colors relative
                      ${isActive ? 'text-black' : 'text-gray-400'}
                    `}
                  >
                    {isCompleted ? '✓' : phase.icon}

                    {/* Pulse ring for active phase */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-white"
                        animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeOut"
                        }}
                      />
                    )}
                  </motion.div>

                  {/* Phase Label */}
                  <div className={`
                    text-[0.625rem] sm:text-xs lg:text-sm font-medium text-center
                    whitespace-nowrap px-1
                    ${isActive ? 'text-white' : 'text-gray-500'}
                  `}>
                    {phase.label}
                  </div>
                </div>

                {/* Connector Line */}
                {index < PHASES.length - 1 && (
                  <div className="w-4 sm:w-6 lg:w-8 h-0.5 mx-0.5 sm:mx-1 mb-5 sm:mb-6
                                bg-gray-800 relative overflow-hidden">
                    {isCompleted && (
                      <motion.div
                        className="absolute inset-0 bg-green-500"
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="mt-4 sm:mt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[0.625rem] sm:text-xs text-gray-500 font-semibold uppercase tracking-wide">
            Overall Progress
          </span>
          <span className="text-xs sm:text-sm font-mono text-gray-400">
            {Math.round(((currentIndex + progress) / PHASES.length) * 100)}%
          </span>
        </div>

        <div className="h-1 sm:h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
            initial={{ width: 0 }}
            animate={{
              width: `${((currentIndex + progress) / PHASES.length) * 100}%`
            }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>
    </div>
  );
}
